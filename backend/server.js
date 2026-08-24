import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Secure File Upload with MIME & Extension Validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(file.mimetype) || ext !== '.pdf') {
      return cb(new Error('Only valid PDF files are allowed.'));
    }
    cb(null, true);
  },
});

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY missing in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// 2. Strict Zod Schema Validation for AI Responses
const ATSReportSchema = z.object({
  targetJobTitle: z.string().default('Target Role'),
  companyName: z.string().default(''),
  matchRate: z.number().min(0).max(100).default(60),
  score: z.number().min(0).max(100).default(60),
  missing: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  recommended: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  scores: z.object({
    searchability: z.object({ score: z.number(), issuesCount: z.number() }),
    hardSkills: z.object({ score: z.number(), issuesCount: z.number() }),
    softSkills: z.object({ score: z.number(), issuesCount: z.number() }),
  }),
  searchabilityAudit: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.object({ name: z.string(), passed: z.boolean(), message: z.string() })),
    })
  ).default([]),
  hardSkillsTable: z.array(
    z.object({ skill: z.string(), foundInResume: z.boolean(), occurrencesInJD: z.number() })
  ).default([]),
  softSkillsTable: z.array(
    z.object({ skill: z.string(), foundInResume: z.boolean(), occurrencesInJD: z.number() })
  ).default([]),
  tailoredResume: z.object({
    name: z.string().default('Candidate Resume'),
    title: z.string().default('Target Role Title'),
    contact: z.string().default(''),
    sections: z.array(
      z.object({
        heading: z.string(),
        subheading: z.string().optional().default(''),
        bullets: z.array(z.string()).default([]),
      })
    ).default([]),
  }),
});

// 3. Multi-Selector Fallback Scraper
app.post('/api/fetch-job', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });

    url = url.trim();

    if (url.includes('linkedin.com/jobs/view/')) {
      const jobIdMatch = url.match(/view\/(\d+)/);
      if (jobIdMatch) {
        url = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobIdMatch[1]}`;
      }
    }

    console.log(`🔗 Fetching job posting: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Target returned status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, noscript, svg, button, form, iframe, input').remove();

    const selectors = [
      '.show-more-less-html__markup',
      '.description__text',
      '.job-details__description',
      '.job-description',
      'main .description',
      '.decorated-job-posting__details',
      'article',
      'main',
      'body'
    ];

    let extractedText = '';
    for (const selector of selectors) {
      const text = $(selector).text().replace(/\s+/g, ' ').trim();
      if (text.length > 150) {
        extractedText = text;
        break;
      }
    }

    if (!extractedText || extractedText.length < 50) {
      return res.status(422).json({
        error: 'Could not extract job text. Please copy and paste the job description manually.',
      });
    }

    console.log('✅ Job description extracted.');
    res.json({ jobDescription: extractedText.slice(0, 8000) });
  } catch (err) {
    console.error('❌ Fetch Job Error:', err.message);
    res.status(500).json({
      error: 'Job posting blocked automated fetch. Please paste text directly.',
    });
  }
});

// 4. Analysis & Parsing Endpoint
app.post('/api/analyze', upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = req.body.jobDescription;

    if (req.file) {
      // PDF Magic Byte Verification (%PDF)
      const header = req.file.buffer.slice(0, 4).toString('ascii');
      if (header !== '%PDF') {
        return res.status(400).json({ error: 'Corrupt or invalid PDF file header.' });
      }

      console.log(`📁 Parsing uploaded PDF: ${req.file.originalname}`);
      const parsedPdf = await pdfParse(req.file.buffer, { max: 0 });
      resumeText = parsedPdf.text;
    }

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both resume and job description are required.' });
    }

    console.log('🤖 Running Gemini ATS Analysis...');

    const prompt = `
You are a Principal ATS System Auditor and Resume Optimization Engine.

Analyze the provided "Candidate Resume Text" against the "Target Job Description".
Extract and parse all candidate data dynamically. 

AUDIT & GENERATION RULES:
1. Contact Header Extraction:
   - Extract real name, target role title, and plain-text contact details: "Email | Phone | Location | Portfolio / GitHub / LinkedIn URLs".
   - If contact details are missing, omit them cleanly. NEVER output placeholder tags like "[Add Email]" or "Email Not Found".
2. STAR Metric Enforcement:
   - Every bullet must follow: Strong Action Verb + Technical Tool + Quantifiable Outcome/Metric (e.g. "improved load speeds by 35%", "serving 500+ daily users").
3. Structure & Projects:
   - Section names: "Professional Summary", "Technical Skills", "Projects", "Professional Experience", "Education".
   - Under "Projects": Create exactly ONE section named "Projects". List every project as a bullet in the format: "Project Name | Tech Stack (Year) - [Live Site](url): Description".

Return ONLY valid JSON matching this schema:
{
  "targetJobTitle": "string",
  "companyName": "string",
  "matchRate": 65,
  "score": 65,
  "missing": [{ "id": "m1", "label": "string" }],
  "recommended": [{ "id": "r1", "label": "string" }],
  "scores": {
    "searchability": { "score": 75, "issuesCount": 2 },
    "hardSkills": { "score": 65, "issuesCount": 4 },
    "softSkills": { "score": 70, "issuesCount": 1 }
  },
  "searchabilityAudit": [
    {
      "category": "Contact Information",
      "items": [
        { "name": "Email Address", "passed": true, "message": "string" },
        { "name": "Phone Number", "passed": true, "message": "string" },
        { "name": "Location / Address", "passed": true, "message": "string" },
        { "name": "Portfolio & Social Links", "passed": true, "message": "string" }
      ]
    },
    {
      "category": "Job Title & Headings",
      "items": [
        { "name": "Job Title Match", "passed": true, "message": "string" },
        { "name": "Section Headings", "passed": true, "message": "string" },
        { "name": "Date Formatting", "passed": true, "message": "string" }
      ]
    }
  ],
  "hardSkillsTable": [
    { "skill": "string", "foundInResume": true, "occurrencesInJD": 3 }
  ],
  "softSkillsTable": [
    { "skill": "string", "foundInResume": true, "occurrencesInJD": 2 }
  ],
  "tailoredResume": {
    "name": "string",
    "title": "string",
    "contact": "string",
    "sections": [
      {
        "heading": "string",
        "subheading": "string",
        "bullets": ["string"]
      }
    ]
  }
}

Candidate Resume Text:
${resumeText}

Target Job Description:
${jobDescription}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();

    const rawData = JSON.parse(text);

    // Validate using Zod schema
    const parsedData = ATSReportSchema.parse(rawData);

    console.log('✅ Analysis validated successfully.');
    res.json({
      ...parsedData,
      rawJobDescription: jobDescription,
    });
  } catch (err) {
    console.error('❌ Audit Error:', err);
    res.status(500).json({ error: err.message || 'Audit failed.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));