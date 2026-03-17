import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import BuyChallengePage from './pages/BuyChallengePage'
import OAuthSuccess from './pages/OAuthSuccess'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import AccountsPage from './pages/AccountsPage'
import PayoutsPage from './pages/PayoutsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import CompetitionsPage from './pages/CompetitionsPage'
import ProfilePage from './pages/ProfilePage'
import KYCPage from './pages/KYCPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ProtectedRoute from './ProtectedRoute'

import { useAuth } from './context/AuthContext'

// Admin-only route guard
const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading session...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/success" element={<OAuthSuccess />} />
      <Route path="/dashboard" element={<Navigate to="/dashboard/accounts" replace />} />
      <Route path="/dashboard/accounts" element={
        <ProtectedRoute>
          <AccountsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/summary/:id" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/new-challenge" element={
        <ProtectedRoute>
          <BuyChallengePage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/challenges/:id" element={
        <ProtectedRoute>
          <ChallengeDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/accounts" element={
        <ProtectedRoute>
          <AccountsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/payouts" element={
        <ProtectedRoute>
          <PayoutsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/competitions" element={
        <ProtectedRoute>
          <CompetitionsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/kyc" element={
        <ProtectedRoute>
          <KYCPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/matrix" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
    </Routes>
  )
}

export default App