import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { ReportsProvider } from './context/ReportsContext.jsx'
import { lazy, Suspense } from 'react'

// Pages (lazy-loaded for smaller initial bundle)
const SplashScreen = lazy(() => import('./pages/SplashScreen.jsx'))
const WelcomeScreen = lazy(() => import('./pages/auth/WelcomeScreen.jsx'))
const GuestEntryScreen = lazy(() => import('./pages/auth/GuestEntryScreen.jsx'))
const HomeScreen = lazy(() => import('./pages/HomeScreen.jsx'))
const MyReportsScreen = lazy(() => import('./pages/MyReportsScreen.jsx'))
const ReportDetailScreen = lazy(() => import('./pages/ReportDetailScreen.jsx'))
const ProfileScreen = lazy(() => import('./pages/ProfileScreen.jsx'))
const NotificationsScreen = lazy(() => import('./pages/NotificationsScreen.jsx'))

// Report flow pages
const Step1Details = lazy(() => import('./pages/report/Step1Details.jsx'))
const Step2Location = lazy(() => import('./pages/report/Step2Location.jsx'))
const Step3Review = lazy(() => import('./pages/report/Step3Review.jsx'))
const SuccessScreen = lazy(() => import('./pages/report/SuccessScreen.jsx'))

// Auth pages
const LoginScreen = lazy(() => import('./pages/auth/LoginScreen.jsx'))
const RegisterScreen = lazy(() => import('./pages/auth/RegisterScreen.jsx'))
const AuthCallbackScreen = lazy(() => import('./pages/auth/AuthCallbackScreen.jsx'))

// Providers
import { ReportProvider } from './context/ReportContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useEffect } from 'react'

// ── Loading screen — shown while Supabase checks session ──────────────────────
function LoadingScreen() {
  return (
    <div className="flex flex-col h-full bg-blue-600 items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      <p className="text-white text-sm font-medium">Loading CitiFix...</p>
    </div>
  )
}

// ── Guest-allowed route — shows content while auth is loading, without blocking guests ─────
function GuestAllowedRoute({ children }) {
  const { loading, user, guestMode } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user && !guestMode) return <Navigate to="/welcome" replace />
  return children
}

// ── Protected route — redirects to /login if not authenticated ────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/welcome" replace />
  return children
}

// ── Auth route — redirects to / if already authenticated ─────────────────────
function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

function GuestEntryRoute({ children }) {
  const { loading, user, guestMode } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  if (guestMode) return <Navigate to="/" replace />
  return children
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
      {/* Splash — always accessible */}
      <Route path="/splash" element={<SplashScreen />} />

      {/* Auth callback — always accessible */}
      <Route path="/auth/callback" element={<AuthCallbackScreen />} />

      {/* Auth screens — redirect to home if already logged in */}
      <Route path="/login" element={<AuthRoute><LoginScreen /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterScreen /></AuthRoute>} />
      <Route path="/welcome" element={<AuthRoute><WelcomeScreen /></AuthRoute>} />
      <Route path="/guest" element={<GuestEntryRoute><GuestEntryScreen /></GuestEntryRoute>} />

      {/* Guest-accessible screens */}
      <Route path="/" element={<GuestAllowedRoute><HomeScreen /></GuestAllowedRoute>} />
      <Route path="/my-reports" element={<GuestAllowedRoute><MyReportsScreen /></GuestAllowedRoute>} />
      <Route path="/report/step1" element={<GuestAllowedRoute><Step1Details /></GuestAllowedRoute>} />
      <Route path="/report/step2" element={<GuestAllowedRoute><Step2Location /></GuestAllowedRoute>} />
      <Route path="/report/step3" element={<GuestAllowedRoute><Step3Review /></GuestAllowedRoute>} />
      <Route path="/report/success" element={<GuestAllowedRoute><SuccessScreen /></GuestAllowedRoute>} />

      {/* Protected screens — redirect to login if not authenticated */}
      <Route path="/reports/:id" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  // Global error logging: persist last error to localStorage for diagnostics
  useEffect(() => {
    function handleError(event) {
      try {
        const payload = {
          message: event.message || String(event),
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          time: Date.now(),
        }
        localStorage.setItem('citifix:last_error', JSON.stringify(payload))
      } catch (e) {}
      // still log to console
      console.error('Captured error', event)
    }

    function handleRejection(evt) {
      try {
        const payload = {
          message: evt.reason?.message || String(evt.reason),
          stack: evt.reason?.stack,
          time: Date.now(),
        }
        localStorage.setItem('citifix:last_error', JSON.stringify(payload))
      } catch (e) {}
      console.error('Unhandled rejection', evt)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AuthProvider>
          <ReportsProvider>
            <ErrorBoundary>
              <ReportProvider>
                <AppRoutes />
              </ReportProvider>
            </ErrorBoundary>
          </ReportsProvider>
        </AuthProvider>
      </div>
    </BrowserRouter>
  )
}
