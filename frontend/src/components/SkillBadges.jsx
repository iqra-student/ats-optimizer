import { memo } from 'react'
import { Search, PlusCircle } from 'lucide-react'

function BadgeSkeletonRow() {
  return (
    <div className="flex flex-wrap gap-2">
      {[0, 1].map((i) => (
        <span key={i} className="h-7 w-24 rounded-full bg-slate-200 animate-pulse" />
      ))}
    </div>
  )
}

/**
 * SkillBadges
 * -----------
 * Renders critical-missing vs recommended-addition skills in two fixed
 * rows. Both rows always reserve their min-height so toggling between the
 * loading skeleton and populated badges causes zero layout shift.
 */
function SkillBadges({ missing = [], recommended = [], isLoading, onAddSuggestion }) {
  return (
    <div className="card p-5 min-h-[180px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
            <Search size={16} />
          </span>
          <h3 className="font-semibold text-slate-900">Missing Skills &amp; Gaps</h3>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 min-w-[110px] text-center">
          {isLoading ? '—' : `${missing.length} Key Areas Identified`}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 min-h-[16px]">
            Critical Missing Requirements
          </p>
          {isLoading ? (
            <BadgeSkeletonRow />
          ) : missing.length === 0 ? (
            <p className="text-sm text-slate-500">No critical gaps found — nice work.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-sm font-medium text-red-700"
                >
                  {skill.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 min-h-[16px]">
            Recommended Additions
          </p>
          {isLoading ? (
            <BadgeSkeletonRow />
          ) : (
            <div className="flex flex-wrap gap-2">
              {recommended.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onAddSuggestion?.(skill)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200
                    px-3 py-1 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <PlusCircle size={13} className="opacity-70 group-hover:opacity-100" />
                  {skill.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(SkillBadges)
