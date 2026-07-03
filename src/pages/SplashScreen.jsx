import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

// SplashScreen — shown briefly on app launch.
// Auto-navigates to Home after 2 seconds.
// Replace the Zap icon with the real CitiFix logo when ready.

export default function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 2000)

    // Clean up the timer if the component unmounts early
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-blue-600">
      {/* Logo mark */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            {/* Replace Zap with real logo image when ready */}
            <Zap size={26} className="text-white" />
          </div>
        </div>

        {/* App name */}
        <span className="text-white text-3xl font-bold tracking-tight">
          CitiFix
        </span>
      </div>
    </div>
  )
}
