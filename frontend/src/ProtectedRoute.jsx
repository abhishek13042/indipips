import { Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import { jwtDecode } from 'jwt-decode'

function ProtectedRoute({ children }) {
  const { token, logout, isAuthenticated } = useAuthStore()
  
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  try {
    const decoded = jwtDecode(token)
    const now = Date.now() / 1000
    if (decoded.exp < now) {
      logout()
      return <Navigate to="/login" replace />
    }
  } catch (e) {
    logout()
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute