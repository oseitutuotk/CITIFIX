import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginScreen() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = email.trim() && password.trim()

  function handleSignIn() {
    if (!canSubmit) return
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-full bg-white justify-center px-6">

      {/* Icon + heading */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
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

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={!canSubmit}
          className="w-full bg-blue-600 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors tap-active"
        >
          <ArrowRight size={18} />
          Sign In
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
  )
}
