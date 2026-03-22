import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from './stores/authStore'

export default function AdminRoute() {
  const { user } = useAuthStore()
  const storedUser = localStorage.getItem('user')
  const parsedUser = user || 
    (storedUser ? JSON.parse(storedUser) : null)
  
  if (!parsedUser || 
      !['ADMIN','SUPER_ADMIN']
        .includes(parsedUser.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
