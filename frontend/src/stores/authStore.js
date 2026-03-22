import { create } from 'zustand'
import api from '../api'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  loadFromStorage: () => {
    try {
      const token = localStorage.getItem('accessToken')
      const user = localStorage.getItem('user')
      if (token && user) {
        set({
          accessToken: token,
          user: JSON.parse(user),
          isLoggedIn: true
        })
      }
    } catch {
      localStorage.clear()
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/auth/login', 
        { email, password })
      const { user, accessToken } = res.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      set({
        user,
        accessToken,
        isLoggedIn: true,
        isLoading: false,
        error: null
      })
      return user
    } catch (err) {
      const msg = err.response?.data?.message 
        || 'Login failed'
      set({ isLoading: false, error: msg })
      throw new Error(msg)
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/auth/register', data)
      // On registration, we don't get tokens yet because email verification is required
      set({ isLoading: false })
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message 
        || 'Registration failed'
      set({ isLoading: false, error: msg })
      throw new Error(msg)
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    localStorage.clear()
    set({
      user: null,
      accessToken: null,
      isLoggedIn: false
    })
    window.location.href = '/login'
  },

  clearError: () => set({ error: null })
}))

export default useAuthStore
