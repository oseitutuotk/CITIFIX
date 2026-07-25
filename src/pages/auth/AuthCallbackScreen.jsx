import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

// AuthCallbackScreen — Supabase redirects here after email confirmation.
// We exchange the token in the URL for a real session, then redirect
// the user to the appropriate screen based on where they came from.

export default function AuthCallbackScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    async function handleCallback() {
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  if (accessToken) {
    // Set the session from the URL hash tokens
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) {
      console.error('Auth callback error:', error.message)
      navigate('/login', { replace: true })
      return
    }

    const fromReport = searchParams.get('from') === 'report'
    navigate(fromReport ? '/my-reports' : '/', { replace: true })
  } else {
    // No token found — try exchangeCodeForSession as fallback
    const { error } = await supabase.auth.exchangeCodeForSession(
      window.location.href
    )
    if (error) {
      navigate('/login', { replace: true })
      return
    }
    navigate('/', { replace: true })
  }
}

    handleCallback()
  }, [])

  // Show a loading state while the token exchange happens
  return (
    <div className="flex flex-col h-full bg-white items-center justify-center gap-4 px-6">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-semibold text-gray-700">Confirming your account...</p>
      <p className="text-xs text-gray-400 text-center">
        Please wait while we verify your email address.
      </p>
    </div>
  )
}
