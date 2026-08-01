import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

// SplashScreen — shown briefly on app launch.
// Auto-navigates to Home after 5 seconds.
// Replace the Zap icon with the real CitiFix logo when ready.

export default function SplashScreen() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      navigate(user ? '/' : '/login', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [user, loading, navigate])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-blue-600">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap size={26} className="text-white" />
          </div>
        </div>
        <span className="text-white text-3xl font-bold tracking-tight">
          CitiFix
        </span>
      </div>
    </div>
  )
}
