import React from 'react'
import { UploadCloud, Cpu, Edit3, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

export default function HowItWorks({ onNavigateToScanner }) {
  const steps = [
    {
      number: '01',
      icon: <UploadCloud className="w-6 h-6 text-blue-600" />,
      title: 'Upload Resume & Job Details',
      desc: 'Drop your current PDF resume and paste the target job description text or submit a live posting link (LinkedIn, Indeed, Lever).',
      points: [
        'Secure in-memory text parsing (no data stored)',
        'Automated web scraping for live job URLs',
        'Multi-format support (PDF, plain text)'
      ]
    },
    {
      number: '02',
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      title: 'AI Semantic ATS Audit',
      desc: 'Our Gemini-powered audit engine evaluates your document against strict Applicant Tracking System rubrics.',
      points: [
        'Contact searchability & header parsing verification',
        'Keyword density and occurrence frequency metrics',
        'Hard vs. Soft skills gap matrix with realistic match scoring'
      ]
    },
    {
      number: '03',
      icon: <Edit3 className="w-6 h-6 text-emerald-600" />,
      title: 'Tailor, Edit & Export',
      desc: 'Fine-tune bullet points in the interactive workspace, attach live project demo links, and export a clean, ATS-compliant PDF.',
      points: [
        'Single-column structure optimized for standard parsers',
        'Clickable contact links & active project hyperlink embedding',
        'Dynamic balanced typography to prevent visual congestion'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 font-sans">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles size={13} /> Behind The Platform
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How ResumeIntel Optimizes Your Application
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Modern enterprise Applicant Tracking Systems screen out over 70% of resumes before a human recruiter reads them. ResumeIntel runs a full diagnostic audit to align your credentials with standard parsing rules.
        </p>
      </section>

      {/* 3 Step Cards */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start gap-6 relative overflow-hidden group hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-4 md:flex-col md:items-start shrink-0">
              <span className="text-3xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">
                {step.number}
              </span>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl shadow-xs">
                {step.icon}
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              <ul className="space-y-1.5 pt-1">
                {step.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to analyze your resume?</h3>
            <p className="text-xs text-blue-100">
              Get an instant match score and actionable keyword recommendations in seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToScanner}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 text-xs font-bold hover:bg-blue-50 shadow-sm transition-all shrink-0"
          >
            Launch ATS Scanner <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  )
}