import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Zap } from 'lucide-react'
import mockUser from '../data/mockUser.js'

export default function AppHeader({
  variant = 'inner',
  title,
  onBack,
  rightAction,
}) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  // ── Home variant ─────────────────────────────────────────────────────────────
  if (variant === 'home') {
    const initials = mockUser.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

    return (
      <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <Zap size={18} className="text-blue-600" />
        </div>

        <span className="font-bold text-gray-900 text-base">CitiFix</span>

        <div className="flex items-center gap-2">
          {/* Bell — navigates to notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 relative tap-active"
          >
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

          {/* Avatar — navigates to profile */}
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center tap-active"
          >
            <span className="text-white text-xs font-bold">{initials}</span>
          </button>
        </div>
      </header>
    )
  }

  // ── Inner variant ─────────────────────────────────────────────────────────────
  return (
    <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100 shrink-0">
      <button
        onClick={handleBack}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 shrink-0 tap-active"
      >
        <ArrowLeft size={18} className="text-gray-600" />
      </button>

      <h1 className="flex-1 text-center text-base font-bold text-gray-900">
        {title}
      </h1>

      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        {rightAction ?? null}
      </div>
    </header>
  )
}
