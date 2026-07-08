import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Tier, TierFeatures } from '@/types'

const TIER_FEATURES: Record<Tier, TierFeatures> = {
  free: {
    signal_delay_minutes: 30,
    signals_per_day: 3,
    show_levels: false,
    show_factors: false,
    show_thesis: false,
    show_ml: false,
    show_positions: false,
    show_performance: false,
    show_full_history: false,
    show_universe: true,
    show_system: false,
    api_key_access: false,
    backtest_access: false,
    coins_limit: 5,
  },
  pro: {
    signal_delay_minutes: 0,
    signals_per_day: 999,
    show_levels: true,
    show_factors: false,
    show_thesis: false,
    show_ml: false,
    show_positions: true,
    show_performance: true,
    show_full_history: true,
    show_universe: true,
    show_system: false,
    api_key_access: false,
    backtest_access: false,
    coins_limit: 999,
  },
  elite: {
    signal_delay_minutes: 0,
    signals_per_day: 999,
    show_levels: true,
    show_factors: true,
    show_thesis: true,
    show_ml: true,
    show_positions: true,
    show_performance: true,
    show_full_history: true,
    show_universe: true,
    show_system: false,
    api_key_access: true,
    backtest_access: true,
    coins_limit: 999,
  },
  admin: {
    signal_delay_minutes: 0,
    signals_per_day: 999,
    show_levels: true,
    show_factors: true,
    show_thesis: true,
    show_ml: true,
    show_positions: true,
    show_performance: true,
    show_full_history: true,
    show_universe: true,
    show_system: true,
    api_key_access: true,
    backtest_access: true,
    coins_limit: 999,
  },
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  tier: Tier
  features: TierFeatures
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  hasFeature: (feature: keyof TierFeatures) => boolean
  canAccess: (requiredTier: Tier) => boolean
}

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
  admin: 3,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      tier: 'free',
      features: TIER_FEATURES.free,
      isLoading: true,

      setUser: (user) => {
        if (!user) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            tier: 'free',
            features: TIER_FEATURES.free,
          })
          return
        }
        const tier = user.tier as Tier
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.is_admin,
          tier,
          features: TIER_FEATURES[tier] ?? TIER_FEATURES.free,
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          tier: 'free',
          features: TIER_FEATURES.free,
          isLoading: false,
        })
      },

      hasFeature: (feature) => {
        const { features } = get()
        return Boolean(features[feature])
      },

      canAccess: (requiredTier) => {
        const { tier } = get()
        return TIER_RANK[tier] >= TIER_RANK[requiredTier]
      },
    }),
    {
      name: 'se-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        tier: state.tier,
      }),
    }
  )
)