import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import BottomNav from '../components/BottomNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { fetchUserReports } from '../services/reportService.js'

const TABS = ['All', 'Active', 'Resolved']
const ACTIVE_STATUSES = ['Processing', 'In Progress', 'Investigating', 'Pending']

function filterReports(reports, tab) {
  if (tab === 'Active') return reports.filter((r) => ACTIVE_STATUSES.includes(r.status))
  if (tab === 'Resolved') return reports.filter((r) => r.status === 'Resolved')
  return reports
}

// Maps a real Supabase report row to the shape ReportCard expects
function mapReport(report) {
  return {
    id: report.id,
    category: report.category,
    title: report.title || `${report.category} issue at ${report.location_name?.split(',')[0] || 'your area'}`,
    status: report.status,
    location_name: report.location_name || 'Unknown location',
    display_date: new Date(report.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    photo_urls: report.report_photos?.map((p) => p.storage_url) || [],
  }
}

export default function MyReportsScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('All')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadReports() {
      if (!user?.id) return
      setLoading(true)
      setError(null)
      const { data, error } = await fetchUserReports(user.id)
      if (error) {
        setError('Failed to load reports. Pull down to retry.')
      } else {
        setReports(data || [])
      }
      setLoading(false)
    }
    loadReports()
  }, [user?.id])

  const mappedReports = reports.map(mapReport)
  const filtered = filterReports(mappedReports, activeTab)

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white h-14 flex items-center justify-center border-b border-gray-100 shrink-0">
        <span className="font-bold text-gray-900 text-base">My Reports</span>
      </div>

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
          // Loading state
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="text-blue-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading your reports...</p>
          </div>

        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 font-semibold tap-active"
            >
              Retry
            </button>
          </div>

        ) : (
          <>
            {/* Count + sort row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">
                History{' '}
                <span className="text-gray-400 font-normal">{filtered.length}</span>
              </span>
              <span className="text-xs text-gray-400">Sort: Newest First</span>
            </div>

            {/* Empty state */}
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
