import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Settings,
  ClipboardList,
} from 'lucide-react'
import BottomNav from '../components/BottomNav.jsx'
import { useAuth } from '../hooks/useAuth.js'

function SettingsGroup({ label, children }) {
  return (
    <div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2 block">
        {label}
      </span>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ icon: Icon, label, iconBg = 'bg-gray-100', iconColor = 'text-gray-500', labelColor = 'text-gray-800', onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3.5 tap-active active:bg-gray-50"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={15} className={iconColor} />
      </div>
      <span className={`flex-1 text-sm font-medium text-left ${labelColor}`}>
        {label}
      </span>
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  )
}

function StatCard({ label, value, active = false }) {
  return (
    <div className={`flex-1 rounded-2xl p-3 flex flex-col items-center gap-1 ${
      active ? 'bg-blue-50 border-2 border-blue-100' : 'bg-white border border-gray-100'
    }`}>
      <ClipboardList size={18} className={active ? 'text-blue-600' : 'text-gray-400'} />
      <span className={`text-xl font-bold ${active ? 'text-blue-700' : 'text-gray-800'}`}>
        {value}
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-blue-500' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white h-14 flex items-center justify-center border-b border-gray-100">
        <span className="font-bold text-gray-900 text-base">Profile</span>
      </div>

      <div className="page-scroll px-4 pt-6 space-y-5">

        {/* Avatar + name + location info */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm tap-active">
              <Settings size={13} className="text-gray-600" />
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">
              {profile?.full_name || 'Loading...'}
            </h2>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="text-sm text-gray-400">{profile?.email || ''}</span>
              <Shield size={13} className="text-green-500 shrink-0" />
            </div>
            {(profile?.ward || profile?.assembly) && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap">
                {profile?.ward && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium">
                    {profile.ward}
                  </span>
                )}
                {profile?.ward && profile?.assembly && (
                  <span className="text-xs text-gray-400">•</span>
                )}
                {profile?.assembly && (
                  <span className="text-xs text-gray-500 font-medium">
                    {profile.assembly}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats — will show real data once report fetching is wired up */}
        <div className="flex gap-3">
          <StatCard label="Total" value="—" active />
          <StatCard label="Resolved" value="—" />
          <StatCard label="Pending" value="—" />
        </div>

        <SettingsGroup label="Account Settings">
          <SettingsRow
            icon={Bell}
            label="Notifications"
            onPress={() => navigate('/notifications')}
          />
          <SettingsRow
            icon={Lock}
            label="Change Password"
            onPress={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup label="Support & Legal">
          <SettingsRow
            icon={HelpCircle}
            label="Help & Support"
            onPress={() => {}}
          />
          <SettingsRow
            icon={LogOut}
            label="Log Out"
            iconBg="bg-red-50"
            iconColor="text-red-500"
            labelColor="text-red-500"
            onPress={handleSignOut}
          />
        </SettingsGroup>

        <p className="text-center text-xs text-gray-400 pb-2">
          CitiFix v1.0.0 • Made for Ghana
        </p>

      </div>

      <BottomNav />
    </div>
  )
}
