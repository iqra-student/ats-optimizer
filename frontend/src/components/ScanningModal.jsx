import React, { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react'

const SCAN_STEPS = [
  'Extracting resume text and document structure...',
  'Parsing job description requirements & keywords...',
  'Evaluating ATS searchability & contact information...',
  'Matching hard skills & technical tools...',
  'Calculating compatibility score & generating report...',
]

export default function ScanningModal({ isOpen }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      return
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev))
    }, 1200)
    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
          <Sparkles className="h-7 w-7 animate-pulse text-blue-600" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">Scanning Your Resume</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">Running ATS compliance, searchability, and keyword match checks...</p>

        <div className="space-y-3 text-left">
          {SCAN_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep
            const isCurrent = idx === currentStep

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? 'bg-blue-50/80 text-blue-900 font-semibold border border-blue-200'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={16} className="text-blue-600 animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span>{step}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}