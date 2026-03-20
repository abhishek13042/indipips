import { create } from 'zustand';
import api from '../api';

const useChallengeStore = create((set, get) => ({
  challenges: [],
  activeChallenge: null,
  trades: [],
  isLoading: false,
  error: null,

  fetchChallenges: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/challenges');
      set({ challenges: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch challenges', isLoading: false });
    }
  },

  setActiveChallenge: (challenge) => {
    set({ activeChallenge: challenge });
    if (challenge) {
      get().fetchActiveTrades(challenge.id);
    }
  },

  fetchActiveTrades: async (challengeId) => {
    try {
      const response = await api.get(`/trades/active/${challengeId}`);
      set({ trades: response.data.data });
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    }
  },

  addTrade: (trade) => {
    set((state) => ({
      trades: [trade, ...state.trades]
    }));
  },

  updateTrade: (tradeId, updates) => {
    set((state) => ({
      trades: state.trades.map((t) => (t.id === tradeId ? { ...t, ...updates } : t))
    }));
  },

  removeTrade: (tradeId) => {
    set((state) => ({
      trades: state.trades.filter((t) => t.id !== tradeId)
    }));
  }
}));

export default useChallengeStore;
