import { memo, useCallback, useRef, useState } from 'react'
import { FileText, UploadCloud, X, AlertTriangle } from 'lucide-react'

const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['.pdf', '.docx']

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Dropzone
 * --------
 * Drag-and-drop / click-to-browse resume upload. Reserves a fixed
 * min-height regardless of state (empty / file selected / error / raw-text
 * fallback) so swapping states never shifts layout (CLS-safe).
 */
function Dropzone({ file, onFileSelect, onFileClear, rawText, onRawTextChange }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState('')
  const [useFallback, setUseFallback] = useState(false)
  const inputRef = useRef(null)

  const validateAndSet = useCallback(
    (candidate) => {
      if (!candidate) return
      const ext = `.${candidate.name.split('.').pop().toLowerCase()}`
      if (!ACCEPTED_TYPES.includes(ext)) {
        setError('Unsupported file type. Please upload a PDF or DOCX.')
        return
      }
      if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`)
        return
      }
      setError('')
      onFileSelect(candidate)
    },
    [onFileSelect],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragActive(false)
      const dropped = e.dataTransfer.files?.[0]
      validateAndSet(dropped)
    },
    [validateAndSet],
  )

  const handleInputChange = useCallback(
    (e) => {
      const selected = e.target.files?.[0]
      validateAndSet(selected)
    },
    [validateAndSet],
  )

  return (
    <div className="min-h-[280px] flex flex-col">
      {!useFallback ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resume file, PDF or DOCX, max 5 megabytes"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragActive(true)
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          className={`flex-1 min-h-[280px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed
            px-6 text-center cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-brand-600
            ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleInputChange}
            className="sr-only"
          />

          {file ? (
            <div className="flex flex-col items-center gap-3 animate-fade-in">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <FileText size={22} />
              </span>
              <div>
                <p className="font-medium text-slate-800 break-all">{file.name}</p>
                <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onFileClear()
                  if (inputRef.current) inputRef.current.value = ''
                }}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-600"
              >
                <X size={14} /> Remove file
              </button>
            </div>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-4">
                <UploadCloud size={22} />
              </span>
              <p className="font-medium text-slate-700">
                <span className="text-brand-600">Drag and drop</span> your resume PDF here
              </p>
              <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
              <span className="mt-4 btn-secondary !py-2 !px-4 text-sm pointer-events-none">Select File</span>
              <p className="mt-3 text-xs text-slate-400">Supported formats: PDF, DOCX (Max {MAX_SIZE_MB}MB)</p>
            </>
          )}
        </div>
      ) : (
        <textarea
          value={rawText}
          onChange={(e) => onRawTextChange(e.target.value)}
          placeholder="Paste your resume text here…"
          className="flex-1 min-h-[280px] w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm
            text-slate-800 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        />
      )}

      <div className="min-h-[24px] mt-2 flex items-center justify-between">
        {error ? (
          <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertTriangle size={14} /> {error}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setUseFallback((v) => !v)}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
        >
          {useFallback ? 'Upload a file instead' : "Can't upload a file? Paste text instead"}
        </button>
      </div>
    </div>
  )
}

export default memo(Dropzone)
