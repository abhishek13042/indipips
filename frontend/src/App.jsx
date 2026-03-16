import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BuyChallengePage from './pages/BuyChallengePage'
import OAuthSuccess from './pages/OAuthSuccess'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import ProtectedRoute from './ProtectedRoute'

import { useAuth } from './context/AuthContext'

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
      <Route path="/auth/success" element={<OAuthSuccess />} />
      <Route path="/dashboard" element={
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
    </Routes>
  )
}

export default App