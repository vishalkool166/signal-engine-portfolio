import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Radio,
  Activity,
  BarChart3,
  Users,
  Coins,
  Server,
  ScrollText,
  Settings,
  User,
  Tag,
  Search,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  adminOnly?: boolean
  minTier?: 'free' | 'pro' | 'elite' | 'admin'
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const { isAdmin, canAccess } = useAuthStore()

  const go = (path: string) => {
    navigate(path)
    onClose()
    setQuery('')
  }

  const ALL_COMMANDS: Command[] = [
    {
      id: 'home',
      label: 'Overview',
      description: 'Go to dashboard overview',
      icon: LayoutDashboard,
      action: () => go('/'),
    },
    {
      id: 'signals',
      label: 'Signals',
      description: 'View signal radar',
      icon: Radio,
      action: () => go('/signals'),
    },
    {
      id: 'trades',
      label: 'Trades',
      description: 'View live trades',
      icon: Activity,
      action: () => go('/trades'),
      minTier: 'pro',
    },
    {
      id: 'performance',
      label: 'Performance',
      description: 'View performance analytics',
      icon: BarChart3,
      action: () => go('/performance'),
      minTier: 'pro',
    },
    {
      id: 'users',
      label: 'Users',
      description: 'Manage users',
      icon: Users,
      action: () => go('/users'),
      adminOnly: true,
    },
    {
      id: 'coins',
      label: 'Coins',
      description: 'Manage coin universe',
      icon: Coins,
      action: () => go('/coins'),
      adminOnly: true,
    },
    {
      id: 'system',
      label: 'System',
      description: 'System monitor',
      icon: Server,
      action: () => go('/system'),
      adminOnly: true,
    },
    {
      id: 'audit',
      label: 'Audit Log',
      description: 'View audit log',
      icon: ScrollText,
      action: () => go('/audit'),
      adminOnly: true,
    },
    {
      id: 'pricing',
      label: 'Pricing',
      description: 'View pricing plans',
      icon: Tag,
      action: () => go('/pricing'),
    },
    {
      id: 'profile',
      label: 'Profile',
      description: 'View your profile',
      icon: User,
      action: () => go('/profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Account settings',
      icon: Settings,
      action: () => go('/settings'),
    },
  ]

  const visibleCommands = ALL_COMMANDS.filter((cmd) => {
    if (cmd.adminOnly && !isAdmin) return false
    if (cmd.minTier && !canAccess(cmd.minTier)) return false
    return true
  })

  const filtered = query.trim()
    ? visibleCommands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : visibleCommands

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[activeIndex]) {
          filtered[activeIndex].action()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filtered, activeIndex])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg"
            >
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages and actions..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <kbd className="text-xs text-muted-foreground/50 border border-border rounded px-1.5 py-0.5">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground">No results found</p>
                    </div>
                  ) : (
                    filtered.map((cmd, index) => {
                      const Icon = cmd.icon
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2.5',
                            'text-left transition-colors',
                            index === activeIndex
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground hover:bg-accent/50'
                          )}
                        >
                          <div className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border',
                            index === activeIndex ? 'bg-background' : 'bg-muted'
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {index === activeIndex && (
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-border px-4 py-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="border border-border rounded px-1">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="border border-border rounded px-1">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="border border-border rounded px-1">ESC</kbd>
                      Close
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}