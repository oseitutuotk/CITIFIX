import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, MoreHorizontal, Zap } from 'lucide-react'
import mockUser from '../data/mockUser.js'

// AppHeader has two variants:
//
// 1. variant="home"
//    — CitiFix logo on the left, bell + avatar on the right
//    — Used only on HomeScreen
//
// 2. variant="inner" (default)
//    — Back arrow on the left, centred title, optional right action
//    — Used on all inner screens (report steps, detail, profile, etc.)
//
// Props:
//   variant      — "home" | "inner" (default: "inner")
//   title        — page title string (inner variant only)
//   onBack       — custom back handler (optional — defaults to navigate(-1))
//   rightAction  — a JSX element to render on the right (optional)

export default function AppHeader({
  variant = 'inner',
  title,
  onBack,
  rightAction,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  // ── Home variant ───────────────────────────────────────────────
  if (variant === 'home') {
    // Get initials from the mock user's full name
    const initials = mockUser.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

    return (
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        {/* Logo */}
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <Zap size={18} className="text-blue-600" />
        </div>

        {/* App name */}
        <span className="font-bold text-gray-900 text-base">CitiFix</span>

        {/* Right — bell + avatar */}
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 relative">
            <Bell size={18} className="text-gray-600" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      </header>
    )
  }

  // ── Inner variant ──────────────────────────────────────────────
  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 shrink-0 tap-active"
      >
        <ArrowLeft size={18} className="text-gray-600" />
      </button>

      {/* Centred title */}
      <h1 className="flex-1 text-center text-base font-bold text-gray-900">
        {title}
      </h1>

      {/* Right action — render whatever is passed in, or an invisible
          placeholder so the title stays perfectly centred */}
      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        {rightAction ?? null}
      </div>
    </header>
  )
}
