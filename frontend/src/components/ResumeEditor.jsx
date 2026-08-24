import React, { useCallback } from 'react'
import { Copy, Download, Check, FileText } from 'lucide-react'

export default function ResumeEditor({
  resume,
  matchedRequirements = [],
  isLoading = false,
  onResumeChange,
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyText = useCallback(async () => {
    if (!resume) return
    let fullText = `${resume.name || ''}\n${resume.title || ''}\n${resume.contact || ''}\n\n`

    resume.sections?.forEach((sec) => {
      fullText += `${sec.heading.toUpperCase()}\n`
      if (sec.subheading) fullText += `${sec.subheading}\n`
      sec.bullets?.forEach((b) => {
        fullText += `• ${b}\n`
      })
      fullText += '\n'
    })

    try {
      await navigator.clipboard.writeText(fullText.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }, [resume])

  const updateHeaderField = (field, val) => {
    onResumeChange?.({ ...resume, [field]: val })
  }

  const updateBullet = (secIdx, bIdx, val) => {
    const next = { ...resume }
    next.sections = next.sections.map((sec, i) => {
      if (i !== secIdx) return sec
      const nextBullets = [...sec.bullets]
      nextBullets[bIdx] = val
      return { ...sec, bullets: nextBullets }
    })
    onResumeChange?.(next)
  }

  const updateSubheading = (secIdx, val) => {
    const next = { ...resume }
    next.sections = next.sections.map((sec, i) =>
      i === secIdx ? { ...sec, subheading: val } : sec
    )
    onResumeChange?.(next)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Clean Document Resume Editor (7 Cols) */}
      <div className="lg:col-span-7 card p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <FileText size={16} className="text-brand-600" />
            <span>Interactive Resume Editor</span>
          </div>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy All Text'}
          </button>
        </div>

        {/* Resume Header Area */}
        <div className="mb-6">
          <input
            type="text"
            value={resume?.name || ''}
            onChange={(e) => updateHeaderField('name', e.target.value)}
            placeholder="Your Full Name"
            className="w-full text-2xl font-bold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-brand-500 focus:outline-none transition-colors pb-1"
          />
          <input
            type="text"
            value={resume?.title || ''}
            onChange={(e) => updateHeaderField('title', e.target.value)}
            placeholder="Target Professional Title"
            className="w-full text-sm font-semibold text-brand-600 mt-1 border-b border-transparent hover:border-slate-200 focus:border-brand-500 focus:outline-none transition-colors pb-1"
          />
          <input
            type="text"
            value={typeof resume?.contact === 'string' ? resume.contact : ''}
            onChange={(e) => updateHeaderField('contact', e.target.value)}
            placeholder="Email | Phone | Location | Portfolio | GitHub | LinkedIn"
            className="w-full text-xs text-slate-400 mt-1 border-b border-transparent hover:border-slate-200 focus:border-brand-500 focus:outline-none transition-colors pb-1"
          />
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-6">
          {resume?.sections?.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                {sec.heading}
              </h3>

              {sec.subheading && (
                <input
                  type="text"
                  value={sec.subheading}
                  onChange={(e) => updateSubheading(secIdx, e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none p-1 rounded transition-colors"
                />
              )}

              {/* Multi-line, auto-height expandable bullet points */}
              <div className="space-y-1.5">
                {sec.bullets?.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 group">
                    <span className="text-slate-400 text-sm select-none mt-1">•</span>
                    <textarea
                      value={bullet}
                      rows={Math.max(2, Math.ceil(bullet.length / 65))}
                      onChange={(e) => updateBullet(secIdx, bIdx, e.target.value)}
                      className="w-full resize-none text-xs text-slate-700 leading-relaxed bg-transparent rounded p-1.5 hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Job Requirements Breakdown (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="card p-6 border border-slate-200 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-sm">Target Requirements Match</h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {resume?.title || 'Target Job'}
            </span>
          </div>

          <div className="space-y-3">
            {matchedRequirements?.map((req) => (
              <div
                key={req.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  req.matched
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/40 border-rose-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      req.matched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {req.matched ? '✓' : '✕'}
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold">{req.requirement || req.label}</p>
                    <p className="text-slate-500 leading-normal">
                      {req.matched
                        ? `Matched: "${req.evidence || req.matchedFrom}"`
                        : req.reason || 'Not explicitly highlighted in your resume.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}