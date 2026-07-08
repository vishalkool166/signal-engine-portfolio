import { create } from 'zustand'
import type { WsPayload, Summary, TickerItem } from '@/types'

type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WsState {
  status: WsStatus
  lastPayload: WsPayload | null
  summary: Summary | null
  ticker: TickerItem[]
  lastUpdated: number | null
  reconnectCount: number
  setStatus: (status: WsStatus) => void
  setPayload: (payload: WsPayload) => void
  incrementReconnect: () => void
  resetReconnect: () => void
}

export const useWsStore = create<WsState>((set) => ({
  status: 'disconnected',
  lastPayload: null,
  summary: null,
  ticker: [],
  lastUpdated: null,
  reconnectCount: 0,

  setStatus: (status) => set({ status }),

  setPayload: (payload) => {
    set({ lastPayload: payload, lastUpdated: Date.now() })

    if (payload.type === 'dashboard' && payload.summary) {
      set({ summary: payload.summary })
    }

    if (payload.type === 'ticker' && payload.summary) {
      set({ summary: payload.summary })
    }

    if (payload.ticker && payload.ticker.length > 0) {
      set({ ticker: payload.ticker })
    }
  },

  incrementReconnect: () =>
    set((state) => ({ reconnectCount: state.reconnectCount + 1 })),

  resetReconnect: () => set({ reconnectCount: 0 }),
}))