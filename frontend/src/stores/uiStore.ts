import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  activeCoin: string | null
  activeUserId: number | null
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setActiveCoin: (coin: string | null) => void
  setActiveUserId: (id: number | null) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      activeCoin: null,
      activeUserId: null,

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }),

      setActiveCoin: (coin) =>
        set({ activeCoin: coin }),

      setActiveUserId: (id) =>
        set({ activeUserId: id }),
    }),
    {
      name: 'se-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)