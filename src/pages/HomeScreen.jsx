import { useNavigate } from 'react-router-dom'
import { Plus, Clock, ClipboardList } from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'
import BottomNav from '../components/BottomNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import mockUser from '../data/mockUser.js'
import mockReports from '../data/mockReports.js'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(fullName) {
  return fullName.split(' ')[0]
}

export default function HomeScreen() {
  const navigate = useNavigate()

  const recentReports = mockReports.slice(0, 3)
  const hasReports = recentReports.length > 0

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader variant="home" />

      <div className="page-scroll px-4 pt-4 space-y-4">

        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {getGreeting()}, {getFirstName(mockUser.full_name)} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Let's make our neighbourhood better today.
          </p>
        </div>

        {/* Report an Issue CTA card */}
        <div
          onClick={() => navigate('/report/step1')}
          className="bg-blue-600 rounded-2xl p-4 cursor-pointer tap-active flex flex-col items-center text-center"
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
          <div className="bg-white rounded-2xl p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <ClipboardList size={13} className="text-blue-500" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                My Reports
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {mockUser.stats.total}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <ClipboardList size={13} className="text-green-500" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Resolved
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {String(mockUser.stats.resolved).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Recent Reports section */}
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

          {hasReports ? (
            <div className="space-y-2">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            // Empty state — shown when user has no reports yet
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-4 py-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Plus size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  No reports yet
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tap Report below to submit your first issue.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fast-Track tip banner */}
        <div className="bg-blue-600 rounded-2xl p-4 flex items-center gap-3">
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
