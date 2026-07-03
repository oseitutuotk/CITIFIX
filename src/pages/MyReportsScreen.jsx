import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'
import BottomNav from '../components/BottomNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import mockReports from '../data/mockReports.js'

// Filter tab definitions
const TABS = ['All', 'Active', 'Resolved']

// Statuses considered "active" — anything not yet closed
const ACTIVE_STATUSES = ['In Progress', 'Investigating', 'Pending']

function filterReports(reports, tab) {
  if (tab === 'Active') return reports.filter((r) => ACTIVE_STATUSES.includes(r.status))
  if (tab === 'Resolved') return reports.filter((r) => r.status === 'Resolved')
  return reports
}

export default function MyReportsScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')

  const filtered = filterReports(mockReports, activeTab)

  return (
    <div className="min-h-screen bg-white relative">
      <div className="bg-white h-14 flex items-center justify-center border-b border-gray-100">
        <span className="font-bold text-gray-900 text-base">My Reports</span>
      </div>

      {/* Filter tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
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

      {/* Report list */}
      <div className="page-scroll px-4 pt-3 space-y-3">

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

      </div>

      {/* Floating action button — starts a new report */}
      <button
        onClick={() => navigate('/report/step1')}
        className="absolute bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-40 tap-active"
      >
        <Plus size={24} className="text-white" />
      </button>

      <BottomNav />
    </div>
  )
}
