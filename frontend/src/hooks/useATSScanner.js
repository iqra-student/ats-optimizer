import { useCallback, useRef, useState } from 'react'

export function useATSScanner() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  const analyze = useCallback(async ({ file, resumeText, jobDescription }) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('resumeFile', file)
      } else {
        formData.append('resumeText', resumeText)
      }
      formData.append('jobDescription', jobDescription)

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}))
        throw new Error(errPayload.error || `Server responded with status ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setStatus('success')
      return result
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Something went wrong while analyzing your resume.')
      setStatus('error')
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setData(null)
    setError(null)
  }, [])

  return { status, data, error, analyze, reset, isLoading: status === 'loading' }
}