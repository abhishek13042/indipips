import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('No access token found')
  }
  return config
})

// Handle 401 — refresh token
api.interceptors.response.use(
  (response) => {
    // 202 Accepted = queued successfully
    // Not an error
    return response
  },
  async (error) => {
    const original = error.config
    const token = localStorage.getItem('accessToken')
    
    // Only attempt refresh if we have a token and it's a 401
    if (error.response?.status === 401 && token && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh-token',
          { refreshToken }
        )
        const newToken = res.data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (err) {
        localStorage.clear()
        // Only redirect if not already on login/register/landing
        if (!['/login', '/register', '/'].includes(window.location.pathname)) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
