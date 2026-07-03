import { useNavigate } from 'react-router-dom'
import { Plus, Clock } from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'
import BottomNav from '../components/BottomNav.jsx'
import ReportCard from '../components/ReportCard.jsx'
import mockUser from '../data/mockUser.js'
import mockReports from '../data/mockReports.js'

// Derives a time-appropriate greeting from the current hour
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// First name only for the greeting
function getFirstName(fullName) {
  return fullName.split(' ')[0]
}

export default function HomeScreen() {
  const navigate = useNavigate()

  // Show only the 3 most recent reports on the home screen
  const recentReports = mockReports.slice(0, 3)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header — home variant shows logo + bell + avatar */}
      <AppHeader variant="home" />

      {/* Scrollable content */}
      <div className="page-scroll px-4 pt-4 space-y-4">

        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {getGreeting()}, {getFirstName(mockUser.full_name)}!
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
          {/* Amber CTA button inside the card */}
          <div className="bg-amber-400 rounded-xl py-2.5 text-center">
            <span className="text-amber-900 font-bold text-sm">
              Report Now
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {/* My Reports stat */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              My Reports
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {mockUser.stats.total}
            </p>
            <p className="text-xs text-green-500 font-medium mt-0.5">
              ↑ +2 this month
            </p>
          </div>

          {/* Resolved stat */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Resolved
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {String(mockUser.stats.resolved).padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              of {mockUser.stats.total} total
            </p>
          </div>
        </div>

        {/* Recent Reports section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Recent Reports</h2>
            <button
              onClick={() => navigate('/my-reports')}
              className="text-blue-600 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>

        {/* Fast-Track tip banner */}
        <div className="bg-blue-600 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Fast-Track Status</p>
            <p className="text-blue-200 text-xs leading-relaxed">
              Reports with clear photos are usually resolved 30% faster by the
              city team.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}
