import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock } from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'
import BottomNav from '../components/BottomNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useReports, mapReport } from '../context/ReportsContext.jsx'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Simple pull-to-refresh hook using touch events
function usePullToRefresh(onRefresh) {
  useEffect(() => {
    let startY = 0
    let isPulling = false

    function onTouchStart(e) {
      // Only trigger if already scrolled to top
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

export default function HomeScreen() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { reports, loading, refreshing, loaded, loadReports, refresh } = useReports()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  // Load reports on first mount only — cache handles subsequent visits
  useEffect(() => {
    if (!loaded) loadReports()
  }, [loaded, loadReports])

  usePullToRefresh(refresh)

  const mappedReports = reports.map(mapReport)
  const recentReports = mappedReports.slice(0, 3)
  const hasReports = recentReports.length > 0
  const totalReports = reports.length
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader variant="home" />

      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="bg-blue-50 text-blue-600 text-xs font-medium text-center py-1.5 shrink-0">
          Refreshing...
        </div>
      )}

      <div className="page-scroll px-4 pt-4 flex flex-col">

        <div className="space-y-4 flex-1">
          {/* Greeting */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Let's make our neighbourhood better today.
            </p>
          </div>

          {/* Report an Issue CTA card */}
          <div
            onClick={() => navigate('/report/step1')}
            className="bg-blue-600 rounded-2xl p-4 cursor-pointer tap-active"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
              <Plus size={22} className="text-white" />
            </div>
            <p className="text-white font-bold text-lg leading-tight">
              Report an Issue
            </p>
            <p className="text-blue-200 text-sm mb-3">
              See something wrong? Report it in seconds
            </p>
            <div className="bg-amber-400 rounded-xl py-2.5 text-center w-full">
              <span className="text-amber-900 font-bold text-sm">Report Now</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-3 border border-gray-100 h-20 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                My Reports
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '—' : totalReports}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-gray-100 h-20 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Resolved
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '—' : resolvedReports}
              </p>
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Recent Reports</h2>
              {hasReports && (
                <button
                  onClick={() => navigate('/my-reports')}
                  className="text-blue-600 text-sm font-medium"
                >
                  View All
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
                ))}
              </div>
            ) : hasReports ? (
              <div className="space-y-2">
                {recentReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-4 py-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Plus size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">No reports yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tap Report below to submit your first issue.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fast-Track tip banner — pinned to bottom with mt-auto */}
        <div className="bg-blue-600 rounded-2xl p-4 flex items-center gap-3 mt-auto mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Fast-Track Status</p>
            <p className="text-blue-200 text-xs leading-relaxed">
              Reports with clear photos are usually resolved 30% faster by the city team.
            </p>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
