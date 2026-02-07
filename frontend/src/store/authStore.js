import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user, token) => set({
        user,
        token,
        role: user?.role,
        isAuthenticated: true
      }),
      
      setRole: (role) => set({ role }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false
      }),
      
      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
    }),
    {
      name: 'sreyanimti-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
