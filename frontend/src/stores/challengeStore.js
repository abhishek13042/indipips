import { create } from 'zustand'
import api from '../api'

const useChallengeStore = create((set) => ({
  challenges: [],
  activeChallenge: null,
  isLoading: false,
  error: null,

  fetchChallenges: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/challenges')
      const challenges = res.data.data
      const active = challenges.find(
        c => c.status === 'ACTIVE'
      )
      set({
        challenges,
        activeChallenge: active || null,
        isLoading: false
      })
    } catch (err) {
      set({
        error: err.response?.data?.message 
          || 'Failed to fetch challenges',
        isLoading: false
      })
    }
  },

  fetchChallenge: async (id) => {
    set({ isLoading: true })
    try {
      const res = await api.get(`/challenges/${id}`)
      set({
        activeChallenge: res.data.data,
        isLoading: false
      })
      return res.data.data
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  reset: () => set({
    challenges: [],
    activeChallenge: null
  })
}))

export default useChallengeStore
