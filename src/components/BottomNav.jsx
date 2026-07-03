import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Plus, ClipboardList, User } from 'lucide-react'

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    match: ['/'],
  },
  {
    id: 'report',
    label: 'Report',
    icon: Plus,
    path: '/report/step1',
    match: ['/report/step1', '/report/step2', '/report/step3'],
  },
  {
    id: 'my-reports',
    label: 'My Reports',
    icon: ClipboardList,
    path: '/my-reports',
    match: ['/my-reports'],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    match: ['/profile'],
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center z-50">
      {tabs.map(({ id, label, icon: Icon, path, match }) => {
        const isActive = match.includes(pathname)

        return (
          <button
            key={id}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full tap-active"
          >
            <Icon
              size={22}
              className={`transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
