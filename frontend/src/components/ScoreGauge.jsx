import { memo, useEffect, useMemo, useState } from 'react'

const SIZE = 168
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreTone(score) {
  if (score >= 80) return { ring: '#4f46e5', text: 'text-brand-700', label: 'Highly qualified' }
  if (score >= 60) return { ring: '#d97706', text: 'text-amber-700', label: 'Moderately qualified' }
  return { ring: '#dc2626', text: 'text-red-700', label: 'Needs work' }
}

/**
 * ScoreGauge
 * ----------
 * Pure presentational SVG gauge. Fixed viewBox/dimensions mean it occupies
 * identical space whether it's showing a skeleton pulse or the real score —
 * no layout shift when the API result lands. Animates the stroke via a
 * CSS transition (GPU-friendly) rather than re-rendering on every frame.
 */
function ScoreGauge({ score, isLoading }) {
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE)

  const { offset, tone } = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, score ?? 0))
    return {
      offset: CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE,
      tone: scoreTone(clamped),
    }
  }, [score])

  useEffect(() => {
    if (isLoading) {
      setAnimatedOffset(CIRCUMFERENCE)
      return
    }
    // Defer to next frame so the transition actually animates from full.
    const raf = requestAnimationFrame(() => setAnimatedOffset(offset))
    return () => cancelAnimationFrame(raf)
  }, [offset, isLoading])

  return (
    <div className="flex flex-col items-center justify-center min-h-[168px] min-w-[168px]" aria-hidden={isLoading}>
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
          {!isLoading && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={tone.ring}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={animatedOffset}
              style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="h-10 w-16 rounded-md bg-slate-200 animate-pulse" role="status" aria-label="Calculating score" />
          ) : (
            <span className={`text-4xl font-extrabold tabular-nums ${tone.text}`}>{Math.round(score)}%</span>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500 text-center min-h-[20px]">
        {isLoading ? 'Analyzing alignment…' : `${tone.label} based on parsed experience.`}
      </p>
    </div>
  )
}

export default memo(ScoreGauge)
