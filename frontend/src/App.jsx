import { lazy, Suspense, useCallback, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import ScanningModal from './components/ScanningModal.jsx'
import { useATSScanner } from './hooks/useATSScanner.js'

// Lazy-loaded routes for optimized bundle splitting
const Screen1 = lazy(() => import('./pages/Screen1.jsx'))
const Screen2Report = lazy(() => import('./pages/Screen2Report.jsx'))
const Screen3Editor = lazy(() => import('./pages/Screen3Editor.jsx'))
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'))
const AboutFAQ = lazy(() => import('./pages/AboutFAQ.jsx'))

function Screen1Skeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 w-72 rounded bg-slate-200 mb-3" />
      <div className="h-4 w-full max-w-xl rounded bg-slate-200 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[340px] rounded-2xl bg-slate-100 border border-slate-200" />
        <div className="h-[340px] rounded-2xl bg-slate-100 border border-slate-200" />
      </div>
      <div className="mt-8 flex justify-center">
        <div className="h-12 w-64 rounded-xl bg-slate-200" />
      </div>
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-4 w-32 rounded bg-slate-200 mb-2" />
          <div className="h-8 w-72 rounded bg-slate-200 mb-2" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 h-[420px] rounded-2xl bg-slate-100 border border-slate-200" />
        <div className="lg:col-span-8 h-[600px] rounded-2xl bg-slate-100 border border-slate-200" />
      </div>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      <div className="h-12 w-full rounded-2xl bg-slate-200 mb-6" />
      <div className="h-[650px] rounded-2xl bg-slate-100 border border-slate-200" />
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 animate-pulse space-y-6">
      <div className="h-8 w-64 mx-auto rounded bg-slate-200" />
      <div className="h-4 w-96 mx-auto rounded bg-slate-200 mb-8" />
      <div className="space-y-4">
        <div className="h-32 rounded-2xl bg-slate-100 border border-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-100 border border-slate-200" />
      </div>
    </div>
  )
}

export default function App() {
  // Navigation tabs: 'scanner' | 'how-it-works' | 'about-faq'
  const [activeTab, setActiveTab] = useState('scanner')
  
  // Scanner screen views: 'upload' (Screen 1) | 'report' (Screen 2) | 'editor' (Screen 3)
  const [view, setView] = useState('upload')
  const { data, error, analyze, reset, isLoading } = useATSScanner()

  const handleAnalyze = useCallback(
    async (payload) => {
      try {
        const result = await analyze(payload)
        if (result) {
          setView('report')
        }
      } catch (err) {
        console.error('Scan Error:', err)
      }
    },
    [analyze],
  )

  const handleNewScan = useCallback(() => {
    reset()
    setView('upload')
    setActiveTab('scanner')
  }, [reset])

  const handleSelectTab = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* 1. Dynamic Animated Scanner Modal */}
      <ScanningModal isOpen={isLoading} />

      <div>
        {/* 2. Global Navbar */}
        <Navbar
          view={view}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onNewScan={handleNewScan}
        />

        {/* 3. Screen Views */}
        <main>
          {/* Static Pages */}
          {activeTab === 'how-it-works' && (
            <Suspense fallback={<PageSkeleton />}>
              <HowItWorks onNavigateToScanner={() => setActiveTab('scanner')} />
            </Suspense>
          )}

          {activeTab === 'about-faq' && (
            <Suspense fallback={<PageSkeleton />}>
              <AboutFAQ />
            </Suspense>
          )}

          {/* Scanner Core Flow */}
          {activeTab === 'scanner' && (
            <>
              {view === 'upload' && (
                <Suspense fallback={<Screen1Skeleton />}>
                  <Screen1 onAnalyze={handleAnalyze} isLoading={isLoading} />
                </Suspense>
              )}

              {view === 'report' && (
                <Suspense fallback={<ReportSkeleton />}>
                  <Screen2Report
                    report={data}
                    error={error}
                    onRescan={handleNewScan}
                    onGoToEditor={() => setView('editor')}
                  />
                </Suspense>
              )}

              {view === 'editor' && (
                <Suspense fallback={<EditorSkeleton />}>
                  <Screen3Editor
                    report={data}
                    onBackToReport={() => setView('report')}
                  />
                </Suspense>
              )}
            </>
          )}
        </main>
      </div>

      {/* 4. Global Footer */}
      <footer className="border-t border-slate-200 mt-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; 2026 ResumeIntel ATS Solutions. All rights reserved.</p>
          <div className="flex gap-5">
            <button 
              type="button" 
              onClick={() => setActiveTab('about-faq')} 
              className="hover:text-slate-600 transition-colors"
            >
              Privacy &amp; Security
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('how-it-works')} 
              className="hover:text-slate-600 transition-colors"
            >
              How It Works
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('about-faq')} 
              className="hover:text-slate-600 transition-colors"
            >
              FAQ
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}