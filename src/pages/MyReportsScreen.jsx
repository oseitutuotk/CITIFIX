import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import BottomNav from '../components/BottomNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import { useReports, mapReport } from '../context/ReportsContext.jsx'

const TABS = ['All', 'Active', 'Resolved']
const ACTIVE_STATUSES = ['Processing', 'In Progress', 'Investigating', 'Pending']

function filterReports(reports, tab) {
  if (tab === 'Active') return reports.filter((r) => ACTIVE_STATUSES.includes(r.status))
  if (tab === 'Resolved') return reports.filter((r) => r.status === 'Resolved')
  return reports
}

// Pull-to-refresh hook
function usePullToRefresh(onRefresh) {
  useEffect(() => {
    let startY = 0
    let isPulling = false

    function onTouchStart(e) {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulling = true
      }
    }

    function onTouchEnd(e) {
      if (!isPulling) return
      const deltaY = e.changedTouches[0].clientY - startY
      if (deltaY > 80) onRefresh()
      isPulling = false
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [onRefresh])
}

export default function MyReportsScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const { reports, loading, refreshing, error, loaded, loadReports, refresh } = useReports()

  // Load on first mount only
  useEffect(() => {
    if (!loaded) loadReports()
  }, [loaded, loadReports])

  usePullToRefresh(refresh)

  const mappedReports = reports.map(mapReport)
  const filtered = filterReports(mappedReports, activeTab)

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white h-14 flex items-center justify-center border-b border-gray-100 shrink-0">
        <span className="font-bold text-gray-900 text-base">My Reports</span>
      </div>

      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="bg-blue-50 text-blue-600 text-xs font-medium text-center py-1.5 shrink-0">
          Refreshing...
        </div>
      )}

      {/* Filter tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="bg-gray-100 rounded-2xl p-1 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-xl text-sm font-semibold transition-colors tap-active ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-scroll px-4 pt-3 space-y-3">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="text-blue-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading your reports...</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">{error}</p>
            <button
              onClick={() => loadReports()}
              className="text-sm text-blue-600 font-semibold tap-active"
            >
              Retry
            </button>
          </div>

        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">
                History{' '}
                <span className="text-gray-400 font-normal">{filtered.length}</span>
              </span>
              <span className="text-xs text-gray-400">Sort: Newest First</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <Plus size={24} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">
                  No {activeTab.toLowerCase()} reports
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tap the + button to submit a new report.
                </p>
              </div>
            ) : (
              filtered.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </>
        )}
      </div>

      {/* Floating action button */}
      <button
        onClick={() => navigate('/report/step1')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-40 tap-active"
      >
        <Plus size={24} className="text-white" />
      </button>

      <BottomNav />
    </div>
  )
}
