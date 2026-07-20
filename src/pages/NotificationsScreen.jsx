import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Clock, Wrench, TriangleAlert } from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'

// Mock notifications — shaped to mirror what a real Supabase
// notifications table would return (report_id, type, message, read, created_at)
const mockNotifications = [
  {
    id: 'notif-001',
    report_id: 'rpt-001',
    type: 'status_update',
    title: 'Report Update',
    message: 'Your report "Burst Pipe at Cantonments Road" has been scheduled for repair.',
    read: false,
    display_time: '2h ago',
    icon: Wrench,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'notif-002',
    report_id: 'rpt-004',
    type: 'resolved',
    title: 'Issue Resolved',
    message: 'Great news! "3 broken streetlights on Osu Oxford St" has been marked as resolved.',
    read: false,
    display_time: 'Yesterday',
    icon: CheckCheck,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'notif-003',
    report_id: 'rpt-002',
    type: 'investigating',
    title: 'Under Investigation',
    message: 'The assembly has started investigating "Major pothole hazard on Liberation Road".',
    read: true,
    display_time: 'Nov 19',
    icon: Clock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  {
    id: 'notif-004',
    report_id: 'rpt-005',
    type: 'rejected',
    title: 'Report Rejected',
    message: '"Illegal dumping site behind local market" was rejected. Reason: Duplicate report.',
    read: true,
    display_time: 'Oct 23',
    icon: TriangleAlert,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
]

export default function NotificationsScreen() {
  const navigate = useNavigate()

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader
        title="Notifications"
        rightAction={
          unreadCount > 0 ? (
            <span className="text-xs font-bold text-white bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          ) : null
        }
      />

      <div className="page-scroll px-4 pt-4 space-y-3">
        {mockNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll be notified when your reports are updated.
            </p>
          </div>
        ) : (
          mockNotifications.map((notif) => {
            const Icon = notif.icon
            return (
              <button
                key={notif.id}
                onClick={() => navigate(`/reports/${notif.report_id}`)}
                className={`w-full rounded-2xl border p-3 flex items-start gap-3 text-left tap-active ${
                  notif.read
                    ? 'bg-white border-gray-100'
                    : 'bg-blue-50/50 border-blue-100'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                  <Icon size={18} className={notif.iconColor} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {notif.display_time}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
