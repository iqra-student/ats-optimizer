import { useCallback, useState } from 'react'
import {
  ArrowLeft,
  Download,
  Loader2,
  Check,
  Sparkles,
  ClipboardCopy,
  CheckCircle2,
  PlusCircle
} from 'lucide-react'
import ScoreGauge from '../components/ScoreGauge.jsx'
import SkillBadges from '../components/SkillBadges.jsx'
import ResumeEditor from '../components/ResumeEditor.jsx'

export default function Screen2({ result, isLoading, error, onBack }) {
  // Initialize state with candidate's actual resume data
  const [resume, setResume] = useState(result?.tailoredResume ?? null)
  const [selectedSkills, setSelectedSkills] = useState(new Set())
  const [headerPdfState, setHeaderPdfState] = useState('idle')
  const [copiedKeyword, setCopiedKeyword] = useState(null)

  const currentResume = resume ?? result?.tailoredResume ?? null

  const handleResumeChange = useCallback((next) => setResume(next), [])

  // Toggle user-selected keyword checklist
  const handleToggleSkill = useCallback((skillLabel) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev)
      if (next.has(skillLabel)) {
        next.delete(skillLabel)
      } else {
        next.add(skillLabel)
      }
      return next
    })
  }, [])

  // Copy keyword to clipboard for instant pasting into bullet points
  const handleCopyKeyword = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKeyword(text)
      setTimeout(() => setCopiedKeyword(null), 2000)
    } catch {
      // Fallback if clipboard permission fails
    }
  }, [])

  // Export clean, ATS-compliant PDF preserving all candidate details
  const handleHeaderDownload = useCallback(async () => {
    if (!currentResume) return
    setHeaderPdfState('generating')

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'letter' })
      const marginX = 48
      const pageWidth = 612
      const contentWidth = pageWidth - marginX * 2
      let y = 48

      // Header: Name & Target Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(20, 20, 20)
      doc.text(currentResume.name || 'Candidate Resume', marginX, y)
      y += 18

      if (currentResume.title) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.5)
        doc.setTextColor(70, 70, 70)
        doc.text(currentResume.title, marginX, y)
        y += 14
      }

      // Contact & Portfolio Links Bar
      const contactText = typeof currentResume.contact === 'object'
        ? `${currentResume.contact.email || ''} | ${currentResume.contact.links || ''}`
        : (currentResume.contact || '')

      if (contactText) {
        doc.setFontSize(8.5)
        doc.setTextColor(90, 90, 90)
        const contactLines = doc.splitTextToSize(contactText, contentWidth)
        doc.text(contactLines, marginX, y)
        y += contactLines.length * 11 + 4
      }

      // Divider
      doc.setDrawColor(210, 210, 210)
      doc.line(marginX, y, marginX + contentWidth, y)
      y += 16

      // Render Dynamic Sections (Summary, Skills, Experience, Projects, Education)
      currentResume.sections?.forEach((section) => {
        // Page break safety check
        if (y > 720) {
          doc.addPage()
          y = 48
        }

        // Section Heading
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(20, 20, 20)
        doc.text(section.heading.toUpperCase(), marginX, y)
        y += 4
        doc.setDrawColor(225, 225, 225)
        doc.line(marginX, y, marginX + contentWidth, y)
        y += 12

        // Section Subheading (Role/Company/Dates)
        if (section.subheading) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9.5)
          doc.setTextColor(45, 45, 45)
          doc.text(section.subheading, marginX, y)
          y += 12
        }

        // Bullets
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(40, 40, 40)
        section.bullets?.forEach((bullet) => {
          if (y > 740) {
            doc.addPage()
            y = 48
          }
          const bulletLines = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 8)
          doc.text(bulletLines, marginX + 4, y)
          y += bulletLines.length * 11.5 + 3
        })

        y += 8
      })

      doc.save(`${(currentResume.name || 'Resume').replace(/\s+/g, '_')}_ATS_Optimized.pdf`)
      setHeaderPdfState('done')
      setTimeout(() => setHeaderPdfState('idle'), 2000)
    } catch (err) {
      console.error('PDF export failed', err)
      setHeaderPdfState('idle')
    }
  }, [currentResume])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-lg font-semibold text-slate-900">We couldn't analyze that resume.</p>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button onClick={onBack} className="btn-primary mt-6">
          <ArrowLeft size={16} /> Try again
        </button>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to upload
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Resume Diagnostic & Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review missing requirements, pick suggestions to incorporate, and tailor your bullets directly.
          </p>
        </div>

        <button
          onClick={handleHeaderDownload}
          disabled={isLoading || headerPdfState === 'generating' || !currentResume}
          className="btn-primary min-w-[210px]"
        >
          {headerPdfState === 'generating' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : headerPdfState === 'done' ? (
            <Check size={16} />
          ) : (
            <Download size={16} />
          )}
          {headerPdfState === 'generating'
            ? 'Generating PDF…'
            : headerPdfState === 'done'
            ? 'Downloaded!'
            : 'Download Tailored PDF'}
        </button>
      </div>

      {/* Analytics Row (Score Gauge + Interactive Suggestion Box) */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 mb-8">
        {/* ATS Match Score */}
        <div className="card p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
          <ScoreGauge score={result?.score} isLoading={isLoading} />
          <p className="mt-3 text-xs text-slate-500">
            Based on required keyword density and role alignment.
          </p>
        </div>

        {/* Actionable Keyword Selector Bank */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-600" /> Suggested Keywords to Add
              </h2>
              <span className="text-xs text-slate-400">
                Click to copy & check off as you add
              </span>
            </div>

            {/* Keyword Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {result?.missing?.map((item) => {
                const isSelected = selectedSkills.has(item.label)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handleToggleSkill(item.label)
                      handleCopyKeyword(item.label)
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 line-through opacity-75'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 size={13} /> : <PlusCircle size={13} />}
                    {item.label}
                  </button>
                )
              })}

              {result?.recommended?.map((item) => {
                const isSelected = selectedSkills.has(item.label)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handleToggleSkill(item.label)
                      handleCopyKeyword(item.label)
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 line-through opacity-75'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 size={13} /> : <PlusCircle size={13} />}
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {copiedKeyword && (
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ClipboardCopy size={12} /> Copied "{copiedKeyword}" to clipboard — paste it into your bullet below!
            </div>
          )}
        </div>
      </div>

      {/* Editor & Job Requirements Checklist */}
      <ResumeEditor
        resume={currentResume}
        matchedRequirements={result?.matchedRequirements}
        isLoading={isLoading}
        onResumeChange={handleResumeChange}
      />
    </main>
  )
}