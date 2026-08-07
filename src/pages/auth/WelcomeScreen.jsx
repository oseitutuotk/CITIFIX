import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-white px-6">

      {/* Top spacer */}
      <div className="flex-1" />

      {/* Logo + branding */}
      <div className="flex flex-col items-center gap-4 mb-12">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap size={36} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            CitiFix
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Report infrastructure issues in your community and track their resolution.
          </p>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="space-y-3 mb-10">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl tap-active"
        >
          Sign In
        </button>

        <button
          onClick={() => navigate('/register')}
          className="w-full border-2 border-blue-600 text-blue-600 font-bold py-4 rounded-2xl tap-active"
        >
          Create New Account
        </button>

        <button
          onClick={() => navigate('/guest')}
          className="w-full text-gray-500 font-semibold py-3 tap-active"
        >
          Continue as Guest
        </button>
      </div>

    </div>
  )
}
