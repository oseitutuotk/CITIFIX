import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { ReportsProvider } from './context/ReportsContext.jsx'

// Pages
import SplashScreen from './pages/SplashScreen.jsx'
import WelcomeScreen from './pages/auth/WelcomeScreen.jsx'
import GuestEntryScreen from './pages/auth/GuestEntryScreen.jsx'
import HomeScreen from './pages/HomeScreen.jsx'
import MyReportsScreen from './pages/MyReportsScreen.jsx'
import ReportDetailScreen from './pages/ReportDetailScreen.jsx'
import ProfileScreen from './pages/ProfileScreen.jsx'
import NotificationsScreen from './pages/NotificationsScreen.jsx'

// Report flow pages
import Step1Details from './pages/report/Step1Details.jsx'
import Step2Location from './pages/report/Step2Location.jsx'
import Step3Review from './pages/report/Step3Review.jsx'
import SuccessScreen from './pages/report/SuccessScreen.jsx'

// Auth pages
import LoginScreen from './pages/auth/LoginScreen.jsx'
import RegisterScreen from './pages/auth/RegisterScreen.jsx'
import AuthCallbackScreen from './pages/auth/AuthCallbackScreen.jsx'

// Providers
import { ReportProvider } from './context/ReportContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AuthProvider>
          <ReportsProvider>
            <ReportProvider>
              <AppRoutes />
            </ReportProvider>
          </ReportsProvider>
        </AuthProvider>
      </div>
    </BrowserRouter>
  )
}
