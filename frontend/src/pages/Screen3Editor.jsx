import React, { useState, useCallback } from 'react'
import {
  ArrowLeft,
  Download,
  Check,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react'

// URL Sanitizer & XSS Protector
const sanitizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const clean = rawUrl.trim()
  
  // Block harmful protocols
  if (/^(javascript:|data:|vbscript:)/i.test(clean)) return null

  try {
    const parsed = new URL(clean)
    if (['http:', 'https:'].includes(parsed.protocol)) return parsed.toString()
  } catch {
    try {
      const withProtocol = new URL(`https://${clean}`)
      return withProtocol.toString()
    } catch {
      return null
    }
  }
  return null
}

export default function Screen3Editor({ report, onBackToReport }) {
  const [resume, setResume] = useState(report?.tailoredResume || {})
  const [pdfState, setPdfState] = useState('idle')
  const [suggestions, setSuggestions] = useState(report?.removedUnverifiedClaims || [])

  const [linkModal, setLinkModal] = useState({
    isOpen: false,
    secIdx: null,
    bIdx: null,
    url: '',
  })

  const updateField = (field, val) => {
    setResume((prev) => ({ ...prev, [field]: val }))
  }

  const updateBullet = (secIdx, bIdx, val) => {
    setResume((prev) => {
      const nextSections = [...prev.sections]
      const nextBullets = [...nextSections[secIdx].bullets]
      nextBullets[bIdx] = val
      nextSections[secIdx] = { ...nextSections[secIdx], bullets: nextBullets }
      return { ...prev, sections: nextSections }
    })
  }

  const addBullet = (secIdx) => {
    setResume((prev) => {
      const nextSections = [...prev.sections]
      nextSections[secIdx] = {
        ...nextSections[secIdx],
        bullets: [...(nextSections[secIdx].bullets || []), 'New Project | Tech Stack (2025) - [Live Site]: Accomplishment with metrics...'],
      }
      return { ...prev, sections: nextSections }
    })
  }

  const deleteBullet = (secIdx, bIdx) => {
    setResume((prev) => {
      const nextSections = [...prev.sections]
      nextSections[secIdx] = {
        ...nextSections[secIdx],
        bullets: nextSections[secIdx].bullets.filter((_, i) => i !== bIdx),
      }
      return { ...prev, sections: nextSections }
    })
  }

  const handleOpenLinkModal = (secIdx, bIdx) => {
    const currentBullet = resume.sections?.[secIdx]?.bullets?.[bIdx] || ''
    const match = currentBullet.match(/\[Live Site\]\((https?:\/\/[^\s)]+)\)/i)
    setLinkModal({
      isOpen: true,
      secIdx,
      bIdx,
      url: match ? match[1] : '',
    })
  }

  const handleSaveLink = () => {
    if (linkModal.secIdx === null || linkModal.bIdx === null) return
    const { secIdx, bIdx, url } = linkModal
    let currentBullet = resume.sections[secIdx].bullets[bIdx]

    const validated = sanitizeUrl(url)
    if (validated) {
      currentBullet = currentBullet.replace(/\s*\(\s*https?:\/\/[^\s)]+\s*\)/g, '').trim()
      if (currentBullet.includes('[Live Site]')) {
        currentBullet = currentBullet.replace(/\[Live Site\](\([^)]*\))?/g, `[Live Site](${validated})`)
      } else {
        currentBullet = `${currentBullet} - [Live Site](${validated})`
      }
    }

    updateBullet(secIdx, bIdx, currentBullet)
    setLinkModal({ isOpen: false, secIdx: null, bIdx: null, url: '' })
  }

  const findSkillsSectionIndex = (sections) => {
    if (!sections?.length) return -1
    const idx = sections.findIndex((s) => /skill/i.test(s.heading))
    return idx !== -1 ? idx : 0
  }

  const addSuggestionToResume = (claim) => {
    setResume((prev) => {
      const nextSections = prev.sections ? [...prev.sections] : []
      const idx = findSkillsSectionIndex(nextSections)
      if (idx === -1) return prev
      nextSections[idx] = {
        ...nextSections[idx],
        bullets: [...(nextSections[idx].bullets || []), claim],
      }
      return { ...prev, sections: nextSections }
    })
    setSuggestions((prev) => prev.filter((c) => c !== claim))
  }

  const dismissSuggestion = (claim) => {
    setSuggestions((prev) => prev.filter((c) => c !== claim))
  }

  // Dynamic Multi-Page PDF Engine
  const handleDownloadPDF = useCallback(async () => {
    setPdfState('generating')
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'letter' })
      
      const margin = 40
      const topMargin = 42
      const bottomMargin = 42
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const contentWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - bottomMargin

      let y = topMargin

      const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > usableHeight) {
          doc.addPage()
          y = topMargin
          return true
        }
        return false
      }

      // 1. Name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(15, 23, 42)
      doc.text((resume.name || 'Candidate Resume').trim(), margin, y)
      y += 18

      // 2. Title
      if (resume.title && resume.title.trim()) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(37, 99, 235)
        doc.text(resume.title.trim(), margin, y)
        y += 15
      }

      // 3. Contact Header
      const contactRaw = resume.contact || ''
      const items = contactRaw.split('|').map((s) => s.trim()).filter(Boolean)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)

      let curX = margin
      items.forEach((item, index) => {
        let label = item
        let url = null

        if (item.includes('@') && !item.startsWith('http')) {
          const cleanEmail = item.replace(/email:\s*/i, '').trim()
          url = `mailto:${cleanEmail}`
          label = cleanEmail
        } else if (/linkedin\.com/i.test(item)) {
          url = sanitizeUrl(item)
          label = 'LinkedIn'
        } else if (/github\.com/i.test(item)) {
          url = sanitizeUrl(item)
          label = 'GitHub'
        } else if (/^https?:\/\//i.test(item) || /portfolio/i.test(item) || /\.(com|dev|io|me|org|net|app)(\/.*)?$/i.test(item)) {
          url = sanitizeUrl(item)
          label = /portfolio/i.test(item) ? 'Portfolio' : item.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
        }

        if (url) {
          doc.setTextColor(37, 99, 235)
          doc.textWithLink(label, curX, y, { url })
          curX += doc.getTextWidth(label)
        } else {
          doc.setTextColor(71, 85, 105)
          doc.text(label, curX, y)
          curX += doc.getTextWidth(label)
        }

        if (index < items.length - 1) {
          doc.setTextColor(148, 163, 184)
          doc.text('  |  ', curX, y)
          curX += doc.getTextWidth('  |  ')
        }
      })
      y += 16

      // Divider
      doc.setDrawColor(203, 213, 225)
      doc.setLineWidth(0.8)
      doc.line(margin, y, margin + contentWidth, y)
      y += 16

      // 4. Dynamic Sections
      resume.sections?.forEach((section) => {
        checkPageBreak(30)

        // Section Title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11.5)
        doc.setTextColor(15, 23, 42)
        doc.text((section.heading || '').toUpperCase(), margin, y)
        y += 4

        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.line(margin, y, margin + contentWidth, y)
        y += 12

        // Subheading
        if (section.subheading) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.setTextColor(30, 41, 59)
          const subLines = doc.splitTextToSize(section.subheading, contentWidth)
          checkPageBreak(subLines.length * 13)
          doc.text(subLines, margin, y)
          y += subLines.length * 13 + 3
        }

        const isProjectSection = /project/i.test(section.heading || '')

        section.bullets?.forEach((bullet) => {
          let liveUrl = null
          let cleanBullet = bullet
          const linkMatch = bullet.match(/\[Live Site\]\((https?:\/\/[^\s)]+)\)/i)
          if (linkMatch) {
            liveUrl = sanitizeUrl(linkMatch[1])
            cleanBullet = bullet.replace(linkMatch[0], '[Live Site]')
          }

          cleanBullet = cleanBullet.replace(/\(\s*https?:\/\/[^\s)]+\s*\)/g, '').trim()

          if (isProjectSection && cleanBullet.includes(':')) {
            const [titlePart, ...rest] = cleanBullet.split(':')
            const descPart = rest.join(':').trim()

            const descLines = doc.splitTextToSize(descPart, contentWidth - 14)
            checkPageBreak(descLines.length * 13.5 + 16)

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(30, 41, 59)
            doc.text('•', margin + 2, y)

            const titleClean = titlePart.replace(/^•\s*/, '').replace(/-\s*\[Live Site\]/g, '').trim()
            doc.text(titleClean, margin + 12, y)
            let projectHeaderX = margin + 12 + doc.getTextWidth(titleClean)

            if (liveUrl || cleanBullet.includes('[Live Site]')) {
              doc.setTextColor(37, 99, 235)
              const linkTag = ' - [Live Site]'
              if (liveUrl) {
                doc.textWithLink(linkTag, projectHeaderX, y, { url: liveUrl })
              } else {
                doc.text(linkTag, projectHeaderX, y)
              }
              projectHeaderX += doc.getTextWidth(linkTag)
            }

            doc.setTextColor(30, 41, 59)
            doc.text(':', projectHeaderX, y)
            y += 13.5

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9.8)
            doc.setTextColor(51, 65, 85)
            doc.text(descLines, margin + 12, y)
            y += descLines.length * 13.5 + 6

          } else {
            const wrapped = doc.splitTextToSize(`•  ${cleanBullet}`, contentWidth - 6)
            checkPageBreak(wrapped.length * 13.5)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9.8)
            doc.setTextColor(51, 65, 85)
            doc.text(wrapped, margin + 4, y)
            y += wrapped.length * 13.5 + 4
          }
        })

        y += 8
      })

      const safeFileName = (resume.name?.trim() || 'Tailored_Resume').replace(/[^a-zA-Z0-9_-]/g, '_')
      doc.save(`${safeFileName}_ATS_Optimized.pdf`)
      setPdfState('done')
      setTimeout(() => setPdfState('idle'), 2000)
    } catch (err) {
      console.error('PDF generation error:', err)
      setPdfState('idle')
    }
  }, [resume])

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToReport}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Audit Report
          </button>
          <span className="text-slate-300">|</span>
          <h1 className="text-sm font-bold text-slate-900">Interactive Resume Workspace</h1>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={pdfState === 'generating'}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all"
        >
          {pdfState === 'generating' ? <Loader2 size={14} className="animate-spin" /> : pdfState === 'done' ? <Check size={14} /> : <Download size={14} />}
          {pdfState === 'generating' ? 'Building PDF...' : pdfState === 'done' ? 'Downloaded!' : 'Download ATS PDF'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-5">
        {suggestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-2.5 mb-3">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-amber-900">Recommended Skills from Job Description</h3>
                <p className="text-[11px] text-amber-800 mt-0.5">Click + to incorporate keywords into your resume.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((claim) => (
                <div key={claim} className="inline-flex items-center gap-1.5 bg-white border border-amber-300 rounded-full pl-3 pr-1.5 py-1 text-xs font-medium text-amber-900 shadow-sm">
                  <span>{claim}</span>
                  <button type="button" onClick={() => addSuggestionToResume(claim)} className="text-blue-600 hover:text-blue-800 p-0.5">
                    <Plus size={13} />
                  </button>
                  <button type="button" onClick={() => dismissSuggestion(claim)} className="text-slate-400 hover:text-rose-600 p-0.5">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-6 text-slate-900">
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <input
              type="text"
              value={resume.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Candidate Full Name"
              className="w-full text-2xl font-bold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors pb-1"
            />
            <input
              type="text"
              value={resume.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Target Role Title"
              className="w-full text-sm font-semibold text-blue-600 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors pb-1"
            />
            <input
              type="text"
              value={resume.contact || ''}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="Email | Phone | Location | linkedin.com/... | github.com/..."
              className="w-full text-xs text-slate-700 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors pb-1"
            />
          </div>

          <div className="space-y-8">
            {resume.sections?.map((sec, secIdx) => {
              const isProject = /project/i.test(sec.heading)

              return (
                <div key={secIdx} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    {sec.heading}
                  </h3>

                  {sec.subheading && (
                    <input
                      type="text"
                      value={sec.subheading}
                      onChange={(e) => {
                        const next = [...resume.sections]
                        next[secIdx] = { ...next[secIdx], subheading: e.target.value }
                        setResume({ ...resume, sections: next })
                      }}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-slate-50 focus:outline-none p-1 rounded transition-colors"
                    />
                  )}

                  <div className="space-y-2.5">
                    {sec.bullets?.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 group">
                        <span className="text-slate-400 text-xs mt-2 select-none">•</span>
                        <textarea
                          rows={Math.max(2, Math.ceil(bullet.length / 75))}
                          value={bullet}
                          onChange={(e) => updateBullet(secIdx, bIdx, e.target.value)}
                          className="w-full text-xs text-slate-800 leading-relaxed resize-none p-2 rounded-lg bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all border border-transparent hover:border-slate-200"
                        />

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0">
                          {isProject && (
                            <button
                              type="button"
                              onClick={() => handleOpenLinkModal(secIdx, bIdx)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                              title="Attach Live Site URL"
                            >
                              <LinkIcon size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteBullet(secIdx, bIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addBullet(secIdx)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Link Modal */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ExternalLink size={15} className="text-blue-600" /> Attach Live Site Link
              </h3>
              <button
                type="button"
                onClick={() => setLinkModal({ isOpen: false, secIdx: null, bIdx: null, url: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>

            <input
              type="url"
              value={linkModal.url}
              onChange={(e) => setLinkModal((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://yourportfolio.com/project"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkModal({ isOpen: false, secIdx: null, bIdx: null, url: '' })}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Attach Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}