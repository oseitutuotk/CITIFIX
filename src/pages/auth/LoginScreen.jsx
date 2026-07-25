import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Info, X } from 'lucide-react'
import AppHeader from '../../components/AppHeader.jsx'
import { useAuth } from '../../hooks/useAuth.js'

export default function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { signIn } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Show the guest warning banner if user arrived from the report flow
  const fromReport = new URLSearchParams(location.search).get('from') === 'report'
  const [showGuestBanner, setShowGuestBanner] = useState(fromReport)

  const canSubmit = email.trim() && password.trim()

  async function handleSignIn() {
    if (!canSubmit) return
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Title bar — standardised height matching other inner screens */}
      <AppHeader title="Sign In" />

      <div className="flex flex-col flex-1 justify-center px-6 py-6 space-y-5">

        {/* Guest warning banner — shown when arriving from report flow */}
        {showGuestBanner && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 mb-0.5">
                Your report was submitted as a guest
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Without an account you may not receive status updates and could lose access to this report. Sign in or register to link it to your account.
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-amber-600 font-semibold mt-2 underline tap-active"
              >
                Skip and continue as guest
              </button>
            </div>
            <button
              onClick={() => setShowGuestBanner(false)}
              className="shrink-0 tap-active"
            >
              <X size={14} className="text-amber-400" />
            </button>
          </div>
        )}

        {/* Icon + heading */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1.5 leading-relaxed">
            Access your CitiFix account to report and track local issues.
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 transition-colors">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kwabena@citifix.gh"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0 bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <button className="text-sm font-semibold text-blue-600 tap-active">
                Forgot?
              </button>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 transition-colors">
              <Lock size={16} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0 bg-transparent"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 tap-active"
              >
                {showPassword
                  ? <EyeOff size={16} className="text-gray-400" />
                  : <Eye size={16} className="text-gray-400" />
                }
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            disabled={!canSubmit || loading}
            className="w-full bg-blue-600 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors tap-active"
          >
            <ArrowRight size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 font-bold tap-active"
            >
              Register
            </button>
          </p>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center pt-1">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Secured by CitiFix
            </span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

        </div>
      </div>
    </div>
  )
}
