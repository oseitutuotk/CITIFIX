import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap } from 'lucide-react'
import AppHeader from '../../components/AppHeader.jsx'
import { useAuth } from '../../hooks/useAuth.js'

export default function RegisterScreen() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const canSubmit = fullName.trim() && email.trim() && passwordsMatch && agreedToTerms
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const { signUp } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreateAccount() {
    if (!canSubmit) return
    setError('')
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // Supabase sends a confirmation email by default.
    // Navigate home — user is signed in immediately on free plan
    // unless email confirmation is enforced in dashboard settings.
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Title bar — standardised height matching other inner screens */}
      <AppHeader title="Create Account" />

      <div className="flex flex-col flex-1 justify-center px-6 py-6 overflow-y-auto">

        {/* Icon + heading */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Join CitiFix Ghana
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1.5 leading-relaxed">
            Start reporting infrastructure issues in your community and track their resolution.
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-4">

          {/* Full name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Full Name
            </label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 transition-colors">
              <User size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kwabena Mensah"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0 bg-transparent"
              />
            </div>
          </div>

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
                placeholder="kwabena@example.com"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0 bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 transition-colors">
              <Lock size={16} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0 bg-transparent"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="shrink-0 tap-active">
                {showPassword
                  ? <EyeOff size={16} className="text-gray-400" />
                  : <Eye size={16} className="text-gray-400" />
                }
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Confirm Password
            </label>
            <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 transition-colors ${
              showMismatch
                ? 'border-red-300 focus-within:border-red-400'
                : 'border-gray-200 focus-within:border-blue-400'
            }`}>
              <Lock size={16} className="text-gray-400 shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0 bg-transparent"
              />
              <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="shrink-0 tap-active">
                {showConfirmPassword
                  ? <EyeOff size={16} className="text-gray-400" />
                  : <Eye size={16} className="text-gray-400" />
                }
              </button>
            </div>
            {showMismatch && (
              <p className="text-xs text-red-500 mt-1.5 px-1">Passwords do not match.</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors tap-active ${
                agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}
            >
              {agreedToTerms && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <p className="text-xs text-gray-500 leading-relaxed">
              By creating an account, you agree to CitiFix's{' '}
              <button className="text-blue-600 font-semibold">Terms of Service</button>
              {' '}and{' '}
              <button className="text-blue-600 font-semibold">Privacy Policy</button>.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center -mt-1">{error}</p>
          )}

          {/* Create account button */}
          <button
            onClick={handleCreateAccount}
            disabled={!canSubmit || loading}
            className="w-full bg-blue-600 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors tap-active"
          >
            <ArrowRight size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 pb-2">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 font-bold tap-active"
            >
              Sign In
            </button>
          </p>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <Lock size={11} className="text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium">Secure Data</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={11} className="text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium">Verified User</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
