import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages — we will create these one by one
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

// Auth pages (built last)
import LoginScreen from './pages/auth/LoginScreen.jsx'
import RegisterScreen from './pages/auth/RegisterScreen.jsx'

// Report form state provider
import { ReportProvider } from './context/ReportContext.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <ReportProvider>
          <Routes>
            {/* Splash */}
            <Route path="/splash" element={<SplashScreen />} />

            {/* Main screens */}
            <Route path="/" element={<HomeScreen />} />
            {<Route path="/my-reports" element={<MyReportsScreen />} />}
            {<Route path="/reports/:id" element={<ReportDetailScreen />} />}
            {<Route path="/profile" element={<ProfileScreen />} />}
            {<Route path="/notifications" element={<NotificationsScreen />} />}

            {/* Report submission flow */}
            {<Route path="/report/step1" element={<Step1Details />} />}
            {<Route path="/report/step2" element={<Step2Location />} />}
            {<Route path="/report/step3" element={<Step3Review />} />}
            {<Route path="/report/success" element={<SuccessScreen />} />}

            {/* Auth (deferred) */}
            {<Route path="/login" element={<LoginScreen />} /> }
            {<Route path="/register" element={<RegisterScreen />} /> }

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ReportProvider>
      </div>
    </BrowserRouter>
  )
}
