import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'

// Pages
import SplashScreen from './pages/SplashScreen.jsx'
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

// ── Protected route — redirects to /login if not authenticated ────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Auth route — redirects to / if already authenticated ─────────────────────
function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
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

      {/* Protected screens — redirect to login if not authenticated */}
      <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
      <Route path="/my-reports" element={<ProtectedRoute><MyReportsScreen /></ProtectedRoute>} />
      <Route path="/reports/:id" element={<ProtectedRoute><ReportDetailScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
      <Route path="/report/step1" element={<ProtectedRoute><Step1Details /></ProtectedRoute>} />
      <Route path="/report/step2" element={<ProtectedRoute><Step2Location /></ProtectedRoute>} />
      <Route path="/report/step3" element={<ProtectedRoute><Step3Review /></ProtectedRoute>} />
      <Route path="/report/success" element={<ProtectedRoute><SuccessScreen /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AuthProvider>
          <ReportProvider>
            <AppRoutes />
          </ReportProvider>
        </AuthProvider>
      </div>
    </BrowserRouter>
  )
}
