import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {
    const decoded = jwtDecode(token)
    const now = Date.now() / 1000
    if (decoded.exp < now) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      return <Navigate to="/login" replace />
    }
  } catch (e) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute