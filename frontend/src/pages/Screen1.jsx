import { useCallback, useMemo, useState } from 'react'
import { FileText, ClipboardPaste, Wand2, Sparkles, Loader2, Link2, Globe, AlertCircle } from 'lucide-react'
import Dropzone from '../components/Dropzone.jsx'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'

const MAX_CHARS = 10000

const SAMPLE_JD = `Senior Cloud Architect

We're looking for a Senior Cloud Architect to design and scale our multi-cloud infrastructure.

Responsibilities:
- Architect resilient, cost-efficient systems across AWS and Azure
- Own our Kubernetes orchestration strategy (EKS/GKE)
- Define Infrastructure-as-Code standards using Terraform
- Partner with security to build a Cloud Security Architecture review process
- Mentor engineers on CI/CD pipeline design and best practices

Requirements:
- 5+ years experience in AWS/Azure
- Deep knowledge of microservices architecture
- Hands-on experience with Kubernetes orchestration
- Strong SQL/NoSQL database optimization background`

/**
 * Screen1 — Input Dashboard
 * -------------------------
 * Resume dropzone + URL fetcher + job description textarea + primary CTA.
 */
export default function Screen1({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [jd, setJd] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [urlError, setUrlError] = useState('')

  // Debounced so the character counter doesn't re-render on every
  // keystroke of a long paste — keeps typing responsive (better INP).
  const debouncedJd = useDebouncedValue(jd, 150)
  const charCount = debouncedJd.length

  const canAnalyze = useMemo(
    () => (file || rawText.trim().length > 0) && jd.trim().length > 0 && !isLoading,
    [file, rawText, jd, isLoading],
  )

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setJd(text.slice(0, MAX_CHARS))
    } catch {
      // Clipboard permission denied or unsupported — no-op, user can paste manually.
    }
  }, [])

  const handleTrySample = useCallback(() => {
    setJd(SAMPLE_JD)
    setUrlError('')
  }, [])

  const handleFetchJobUrl = useCallback(async () => {
    if (!jobUrl.trim()) return
    setIsFetchingUrl(true)
    setUrlError('')

    try {
      const res = await fetch('http://localhost:5000/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch job description.')
      }

      if (data.jobDescription) {
        setJd(data.jobDescription)
        setJobUrl('')
      }
    } catch (err) {
      setUrlError(err.message || 'Could not fetch job from this link. Please paste it manually.')
    } finally {
      setIsFetchingUrl(false)
    }
  }, [jobUrl])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (!canAnalyze) return
      onAnalyze({ file, resumeText: rawText, jobDescription: jd })
    },
    [canAnalyze, onAnalyze, rawText, file, jd],
  )

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Optimize Your Resume</h1>
        <p className="mt-2 text-slate-500 max-w-2xl">
          Upload your current resume and paste the target job description or link. Our ATS scanner will
          analyze keyword match, readability, and formatting to boost your interview chances.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Upload Resume */}
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600 text-sm font-bold">
              1
            </span>
            <h2 className="font-semibold text-slate-900">Upload Resume</h2>
          </div>
          <Dropzone
            file={file}
            onFileSelect={(f) => {
              setFile(f)
              setRawText('')
            }}
            onFileClear={() => setFile(null)}
            rawText={rawText}
            onRawTextChange={(t) => {
              setRawText(t)
              setFile(null)
            }}
          />
        </section>

        {/* Section 2: Target Job Description */}
        <section className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600 text-sm font-bold">
                2
              </span>
              <h2 className="font-semibold text-slate-900">Target Job Description</h2>
            </div>
            <button
              type="button"
              onClick={handleTrySample}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Sparkles size={13} />
              Try Sample JD
            </button>
          </div>

          {/* URL Fetch Input Bar */}
          <div className="mb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Globe size={14} />
                </span>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => {
                    setJobUrl(e.target.value)
                    if (urlError) setUrlError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleFetchJobUrl()
                    }
                  }}
                  placeholder="Paste job link (LinkedIn, Indeed, Lever)..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchJobUrl}
                disabled={isFetchingUrl || !jobUrl.trim()}
                className="btn-secondary !py-2 !px-3.5 text-xs inline-flex items-center gap-1.5 shrink-0"
              >
                {isFetchingUrl ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                {isFetchingUrl ? 'Fetching...' : 'Fetch Link'}
              </button>
            </div>
            {urlError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={12} /> {urlError}
              </p>
            )}
          </div>

          {/* Text Area */}
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value.slice(0, MAX_CHARS))}
            maxLength={MAX_CHARS}
            placeholder="Or paste the full job description text here directly. Include responsibilities and requirements for maximum accuracy…"
            className="flex-1 min-h-[220px] w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm
              text-slate-800 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          />

          {/* Action Row */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 min-h-[20px]">
            <span className="tabular-nums">
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-600"
            >
              <ClipboardPaste size={13} />
              Paste from clipboard
            </button>
          </div>
        </section>
      </form>

      <div className="mt-8 flex justify-center">
        <button type="submit" onClick={handleSubmit} disabled={!canAnalyze} className="btn-primary min-w-[260px]">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
          {isLoading ? 'Analyzing Match…' : 'Analyze Resume Match'}
        </button>
      </div>

      {!file && !rawText && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <FileText size={12} /> No resume yet? Try the sample job description to preview a full report.
        </p>
      )}
    </div>
  )
}