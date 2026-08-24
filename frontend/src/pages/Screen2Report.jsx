import React, { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Printer,
  FileText,
  Check,
  Plus
} from 'lucide-react'

export default function Screen2Report({ report, onRescan, onGoToEditor }) {
  const [activeTab, setActiveTab] = useState('report') // 'report' | 'jd'

  const {
    targetJobTitle = 'Target Role',
    companyName = '',
    matchRate = 65,
    scores = {
      searchability: { score: 75, issuesCount: 2 },
      hardSkills: { score: 60, issuesCount: 5 },
      softSkills: { score: 50, issuesCount: 2 },
    },
    searchabilityAudit = [],
    hardSkillsTable = [],
    softSkillsTable = [],
    rawJobDescription = '',
  } = report || {}

  // Highlight job description with green / red badges
  const renderHighlightedJD = () => {
    if (!rawJobDescription) return null

    let text = rawJobDescription
    const matched = hardSkillsTable.filter((h) => h.foundInResume).map((h) => h.skill)
    const missing = hardSkillsTable.filter((h) => !h.foundInResume).map((h) => h.skill)

    const words = text.split(/(\s+)/)
    return (
      <div className="p-6 text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
        {words.map((word, i) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '')
          const isMatched = matched.some((m) => m.toLowerCase() === cleanWord.toLowerCase())
          const isMissing = missing.some((m) => m.toLowerCase() === cleanWord.toLowerCase())

          if (isMatched && cleanWord.length > 2) {
            return (
              <span key={i} className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-medium">
                {word}
              </span>
            )
          }
          if (isMissing && cleanWord.length > 2) {
            return (
              <span key={i} className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded font-medium border-b border-rose-400">
                {word}
              </span>
            )
          }
          return <span key={i}>{word}</span>
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Resume Scan Results
          </span>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {companyName ? `${companyName} - ` : ''}
            {targetJobTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer size={14} /> Print
          </button>
          <button
            type="button"
            onClick={onGoToEditor}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
          >
            <Sparkles size={14} /> Edit & Tailor Resume
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Match Rate & Metrics Sidebar (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Match Rate</h2>

            {/* Circular Gauge */}
            <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${matchRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900">{matchRate}%</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={onRescan}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Upload & Rescan
              </button>
              <button
                type="button"
                onClick={onGoToEditor}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> AI Optimize Resume
              </button>
            </div>

            {/* Category Progress Bars */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 text-left">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Searchability</span>
                  <span className="text-blue-600">{scores.searchability.issuesCount} issues to fix</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${scores.searchability.score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Hard Skills</span>
                  <span className="text-blue-600">{scores.hardSkills.issuesCount} issues to fix</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${scores.hardSkills.score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Soft Skills</span>
                  <span className="text-rose-500">{scores.softSkills.issuesCount} issues to fix</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${scores.softSkills.score}%` }} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Detailed Report with Tabs (8 Cols) */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition-all border-b-2 ${
                activeTab === 'report'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
              }`}
            >
              Resume Report
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('jd')}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition-all border-b-2 ${
                activeTab === 'jd'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
              }`}
            >
              Job Description Highlights
            </button>
          </div>

          {activeTab === 'report' ? (
            <div className="p-6 space-y-8">
              {/* ATS Tips Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0 font-bold">
                    ⚡
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">ATS Searchability Tip</h4>
                    <p className="text-[11px] text-slate-600">
                      Align the exact spelling of technical keywords to ensure direct indexing by applicant tracking filters.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onGoToEditor}
                  className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Fix in Editor
                </button>
              </div>

              {/* 1. Searchability Audit Table */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Searchability</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white uppercase tracking-wider">
                    Important
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  How well your resume contact information, section headers, and formatting parse inside standard ATS scanners.
                </p>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
                  {searchabilityAudit.map((group, gIdx) => (
                    <div key={gIdx} className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                      <span className="font-bold text-slate-800">{group.category}</span>
                      <div className="sm:col-span-2 space-y-2">
                        {group.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center gap-2 text-slate-700">
                            {item.passed ? (
                              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle size={15} className="text-rose-500 shrink-0" />
                            )}
                            <span className="font-medium">{item.name}:</span>
                            <span className="text-slate-500">{item.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Hard Skills Comparison Table */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Hard Skills</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white uppercase tracking-wider">
                    High Score Impact
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Technical skills and tools requested in the job description compared against your resume.
                </p>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Skill</th>
                        <th className="p-3.5">In Your Resume</th>
                        <th className="p-3.5">Job Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {hardSkillsTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-medium">{row.skill}</td>
                          <td className="p-3.5">
                            {row.foundInResume ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                <Check size={14} /> Found
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                <XCircle size={14} /> Missing
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 tabular-nums text-slate-500">{row.occurrencesInJD}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Soft Skills Comparison Table */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Soft Skills</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white uppercase tracking-wider">
                    Medium Impact
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Skill</th>
                        <th className="p-3.5">In Your Resume</th>
                        <th className="p-3.5">Job Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {softSkillsTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-medium">{row.skill}</td>
                          <td className="p-3.5">
                            {row.foundInResume ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                <Check size={14} /> Found
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                <XCircle size={14} /> Missing
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 tabular-nums text-slate-500">{row.occurrencesInJD}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div>{renderHighlightedJD()}</div>
          )}
        </section>
      </main>
    </div>
  )
}