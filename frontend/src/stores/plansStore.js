import { create } from 'zustand'
import api from '../api'

const usePlansStore = create((set) => ({
  plans: [],
  selectedPlan: null,
  isLoading: false,

  fetchPlans: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/plans')
      set({
        plans: res.data.data,
        isLoading: false
      })
    } catch {
      set({ isLoading: false })
    }
  },

  selectPlan: (plan) => set({ selectedPlan: plan })
}))

export default usePlansStore
