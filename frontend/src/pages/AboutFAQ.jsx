import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ShieldCheck, Mail, Globe, Code2 } from 'lucide-react'

export default function AboutFAQ() {
  const [openIdx, setOpenIdx] = useState(0)

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx)
  }

  const faqs = [
    {
      q: 'How does ResumeIntel calculate the ATS Match Rate?',
      a: 'The engine compares your resume text against the target job description across three pillars: Searchability (contact parsing and header layout), Hard Skills (frequency and presence of required technical tools), and Soft Skills (communication, problem-solving, and workflow indicators). The score reflects realistic ATS screening rubrics.'
    },
    {
      q: 'Why does the auditor flag hyperlinked anchor words like "email" or "portfolio"?',
      a: 'Most ATS parsers (Workday, Taleo, Greenhouse) strip visual CSS formatting and interactive layers to read raw text streams. If an email is hidden behind the word "email", the text stream only sees the word rather than a valid name@domain.com string, causing candidate contact fields to remain empty.'
    },
    {
      q: 'Is my uploaded resume or personal data saved on your servers?',
      a: 'No. File processing is executed completely in-memory using temporary byte streams. Once your analysis is generated and delivered to your browser session, no resume documents or personal contact data are stored on persistent storage.'
    },
    {
      q: 'Why is a single-column layout recommended for ATS resumes?',
      a: 'Multi-column layouts, visual tables, text boxes, and complex graphics often confuse text parsers, causing work history lines to be read out of chronological order. A clean, single-column document ensures seamless top-to-bottom text stream indexing.'
    },
    {
      q: 'Can I add clickable project links to the exported PDF?',
      a: 'Yes. In the Interactive Resume Workspace, clicking the link icon allows you to attach live URLs. The system embeds active PDF hyperlinks so recruiters can click directly through to your live sites and portfolios.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 font-sans">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <HelpCircle size={13} /> Knowledge Base & FAQ
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About ResumeIntel & ATS Best Practices
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Everything you need to know about resume optimization, ATS algorithms, and data security.
        </p>
      </section>

      {/* FAQ Accordion List */}
      <section className="max-w-3xl mx-auto px-4 space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/75 transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-900">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* Tech & Architecture Callout */}
      <section className="max-w-3xl mx-auto px-4 mt-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Code2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Engineered with Modern Web Tech</h4>
              <p className="text-[11px] text-slate-500">React, Node.js, Express, Google Gemini AI & Microsoft Azure</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
            <ShieldCheck size={14} /> Production Grade
          </div>
        </div>
      </section>
    </div>
  )
}