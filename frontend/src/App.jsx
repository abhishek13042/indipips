import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } 
  from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import useAuthStore from './stores/authStore'

// Loading screen
const Loading = () => (
  <div className="min-h-screen bg-[#0A0F1E] 
    flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 
        border-[#2563EB] border-t-transparent 
        rounded-full animate-spin mx-auto mb-4">
      </div>
      <p className="text-[#6B7280]">Loading...</p>
    </div>
  </div>
)

// Lazy load all pages
const LandingPage = lazy(() => 
  import('./pages/LandingPage'))
const LoginPage = lazy(() => 
  import('./pages/LoginPage'))
const RegisterPage = lazy(() => 
  import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => 
  import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => 
  import('./pages/ResetPasswordPage'))
const LeaderboardPage = lazy(() => 
  import('./pages/LeaderboardPage'))
const CertificateVerifyPage = lazy(() => 
  import('./pages/CertificateVerifyPage'))
const NotFoundPage = lazy(() => 
  import('./pages/NotFoundPage'))
const DashboardPage = lazy(() => 
  import('./pages/DashboardPage'))
const ChallengesPage = lazy(() => 
  import('./pages/ChallengesPage'))
const ChallengeDetailPage = lazy(() => 
  import('./pages/ChallengeDetailPage'))
const BuyChallengePage = lazy(() => 
  import('./pages/BuyChallengePage'))
const PaymentSuccessPage = lazy(() => 
  import('./pages/PaymentSuccessPage'))
const PaymentFailedPage = lazy(() => 
  import('./pages/PaymentFailedPage'))
const KYCPage = lazy(() => 
  import('./pages/KYCPage'))
const PayoutsPage = lazy(() => 
  import('./pages/PayoutsPage'))
const ProfilePage = lazy(() => 
  import('./pages/ProfilePage'))
const BrokerConnectPage = lazy(() => 
  import('./pages/BrokerConnectPage'))
const NotificationsPage = lazy(() => 
  import('./pages/NotificationsPage'))
const TradingTerminalPage = lazy(() => 
  import('./pages/TradingTerminalPage'))
const AdminDashboardPage = lazy(() => 
  import('./pages/AdminDashboardPage'))
const AdminTradersPage = lazy(() => 
  import('./pages/AdminTradersPage'))
const AdminTraderDetailPage = lazy(() => 
  import('./pages/AdminTraderDetailPage'))
const AdminChallengesPage = lazy(() => 
  import('./pages/AdminChallengesPage'))
const AdminPayoutsPage = lazy(() => 
  import('./pages/AdminPayoutsPage'))
const AdminAnalyticsPage = lazy(() => 
  import('./pages/AdminAnalyticsPage'))

export default function App() {
  const loadFromStorage = useAuthStore(
    s => s.loadFromStorage
  )

  useEffect(() => {
    loadFromStorage()
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" 
            element={<LoginPage />} />
          <Route path="/register" 
            element={<RegisterPage />} />
          <Route path="/forgot-password" 
            element={<ForgotPasswordPage />} />
          <Route path="/reset-password" 
            element={<ResetPasswordPage />} />
          <Route path="/leaderboard" 
            element={<LeaderboardPage />} />
          <Route path="/verify/:code" 
            element={<CertificateVerifyPage />} />

          {/* PROTECTED TRADER ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" 
              element={<DashboardPage />} />
            <Route path="/challenges" 
              element={<ChallengesPage />} />
            <Route path="/challenges/:id" 
              element={<ChallengeDetailPage />} />
            <Route path="/terminal" 
              element={<TradingTerminalPage />} />
            <Route path="/buy-challenge" 
              element={<BuyChallengePage />} />
            <Route path="/payment/success" 
              element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" 
              element={<PaymentFailedPage />} />
            <Route path="/kyc" 
              element={<KYCPage />} />
            <Route path="/payouts" 
              element={<PayoutsPage />} />
            <Route path="/profile" 
              element={<ProfilePage />} />
            <Route path="/broker" 
              element={<BrokerConnectPage />} />
            <Route path="/notifications" 
              element={<NotificationsPage />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin" 
                element={<AdminDashboardPage />} />
              <Route path="/admin/traders" 
                element={<AdminTradersPage />} />
              <Route path="/admin/traders/:id" 
                element={<AdminTraderDetailPage />} />
              <Route path="/admin/challenges" 
                element={<AdminChallengesPage />} />
              <Route path="/admin/payouts" 
                element={<AdminPayoutsPage />} />
              <Route path="/admin/analytics" 
                element={<AdminAnalyticsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" 
            element={<NotFoundPage />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
