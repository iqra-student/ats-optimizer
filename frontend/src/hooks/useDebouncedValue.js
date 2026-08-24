import { useEffect, useState } from 'react'

/**
 * useDebouncedValue
 * ------------------
 * Returns a debounced copy of `value`. Used for the JD character counter so
 * every keystroke doesn't trigger a re-render of the counter (and anything
 * downstream that reads it) — keeps the main thread free for typing input,
 * which is the actual latency-sensitive interaction (better INP).
 */
export function useDebouncedValue(value, delayMs = 200) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
