import { memo } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'

function Navbar({ onNewScan, view, activeTab, onSelectTab }) {
  const handleTabClick = (tab) => {
    if (onSelectTab) {
      onSelectTab(tab)
    }
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-30">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer select-none" 
          onClick={() => {
            handleTabClick('scanner')
            if (onNewScan) onNewScan()
          }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Sparkles size={18} strokeWidth={2.25} />
          </span>
          <span className="text-xl tracking-tight">
            Resume<span className="text-blue-600">Intel</span>
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button 
            type="button"
            onClick={() => handleTabClick('scanner')} 
            className={
              activeTab === 'scanner' || (!activeTab && view !== 'results')
                ? 'text-blue-600 font-semibold transition-colors' 
                : 'hover:text-slate-900 transition-colors'
            }
          >
            ATS Scanner
          </button>
          <button 
            type="button"
            onClick={() => handleTabClick('how-it-works')} 
            className={
              activeTab === 'how-it-works' 
                ? 'text-blue-600 font-semibold transition-colors' 
                : 'hover:text-slate-900 transition-colors'
            }
          >
            How It Works
          </button>
          <button 
            type="button"
            onClick={() => handleTabClick('about-faq')} 
            className={
              activeTab === 'about-faq' 
                ? 'text-blue-600 font-semibold transition-colors' 
                : 'hover:text-slate-900 transition-colors'
            }
          >
            About &amp; FAQ
          </button>
        </nav>

        {/* Right Action CTA */}
        <div className="flex items-center gap-3">
          {view === 'results' && activeTab === 'scanner' ? (
            <button 
              type="button"
              onClick={onNewScan} 
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RotateCcw size={14} />
              New Scan
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => handleTabClick('scanner')} 
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-sm"
            >
              <Sparkles size={13} /> Run ATS Audit
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default memo(Navbar)