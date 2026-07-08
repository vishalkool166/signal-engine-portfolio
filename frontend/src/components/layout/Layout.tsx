import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Radio,
  Activity,
  User,
  MoreHorizontal,
  X,
  TrendingUp,
  BarChart3,
  Users,
  Coins,
  Server,
  ScrollText,
  Settings,
  Tag,
} from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import CommandPalette from '@/components/modals/CommandPalette'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const BOTTOM_NAV = [
  { path: '/',        label: 'Overview', icon: LayoutDashboard },
  { path: '/signals', label: 'Signals',  icon: Radio },
  { path: '/trades',  label: 'Trades',   icon: Activity, minTier: 'pro' as const },
  { path: '/profile', label: 'Profile',  icon: User },
]

const MORE_ITEMS = [
  { path: '/performance', label: 'Performance', icon: BarChart3,     minTier: 'pro' as const },
  { path: '/users',       label: 'Users',       icon: Users,         adminOnly: true },
  { path: '/coins',       label: 'Coins',       icon: Coins,         adminOnly: true },
  { path: '/system',      label: 'System',      icon: Server,        adminOnly: true },
  { path: '/audit',       label: 'Audit Log',   icon: ScrollText,    adminOnly: true },
  { path: '/pricing',     label: 'Pricing',     icon: Tag },
  { path: '/settings',    label: 'Settings',    icon: Settings },
]

export default function Layout() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore()
  const { isAdmin, canAccess } = useAuthStore()
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setMoreOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const visibleMore = MORE_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin
    if (item.minTier) return canAccess(item.minTier)
    return true
  })

  const isMoreActive = visibleMore.some((item) =>
    location.pathname === item.path
  )

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-1 safe-area-pb">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)

            if (item.minTier && !canAccess(item.minTier)) return null

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg',
                  'min-w-[60px] transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span className={cn(
                  'text-2xs font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </button>
            )
          })}

          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg',
              'min-w-[60px] transition-colors',
              isMoreActive
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <div className="relative">
              <MoreHorizontal className="h-5 w-5" />
              {isMoreActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span className={cn(
              'text-2xs font-medium',
              isMoreActive ? 'text-foreground' : 'text-muted-foreground'
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl border-t border-border bg-card"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">More</p>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1 p-3 pb-safe">
                {visibleMore.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setMoreOpen(false)
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl p-3',
                        'transition-colors',
                        isActive
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  )
}