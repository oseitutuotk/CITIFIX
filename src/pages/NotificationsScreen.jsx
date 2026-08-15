import { Bell } from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'

export default function NotificationsScreen() {
  const notifications = []
  const unreadCount = notifications.filter((n) => !n.read).length

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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <Bell size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            You'll be notified when your reports are updated.
          </p>
        </div>
      </div>
    </div>
  )
}
