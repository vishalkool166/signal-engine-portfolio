import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Radio,
  TrendingUp,
  BarChart3,
  Users,
  Coins,
  Server,
  ScrollText,
  Settings,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { authApi } from '@/lib/endpoints'
import { toast } from 'sonner'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  adminOnly?: boolean
  minTier?: 'free' | 'pro' | 'elite' | 'admin'
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',    path: '/',           icon: LayoutDashboard },
  { label: 'Signals',     path: '/signals',    icon: Radio },
  { label: 'Trades',      path: '/trades',     icon: Activity,    minTier: 'pro' },
  { label: 'Performance', path: '/performance',icon: BarChart3,   minTier: 'pro' },
  { label: 'Users',       path: '/users',      icon: Users,       adminOnly: true },
  { label: 'Coins',       path: '/coins',      icon: Coins,       adminOnly: true },
  { label: 'System',      path: '/system',     icon: Server,      adminOnly: true },
  { label: 'Audit Log',   path: '/audit',      icon: ScrollText,  adminOnly: true },
]

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Pricing',  path: '/pricing',  icon: Tag },
  { label: 'Profile',  path: '/profile',  icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar() {
  const { isAdmin, canAccess, user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // proceed regardless
    }
    logout()
    navigate('/login', { replace: true })
    toast.success('Signed out successfully')
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin
    if (item.minTier) return canAccess(item.minTier)
    return true
  })

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex h-screen flex-col border-r border-border bg-sidebar"
    >
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary">
                <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                Signal Engine
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary mx-auto">
            <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
            'text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            'transition-colors',
            sidebarCollapsed && 'absolute -right-3 top-4 z-10 border border-sidebar-border bg-sidebar'
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {visibleItems.map((item) => (
          <SidebarLink
            key={item.path}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex flex-col gap-1">
          {BOTTOM_ITEMS.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              collapsed={sidebarCollapsed}
            />
          ))}

          <button
            onClick={handleLogout}
            className={cn(
              'flex h-9 w-full items-center gap-3 rounded-md px-3',
              'text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              'transition-colors',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {!sidebarCollapsed && user && (
          <div className="mt-2 border-t border-sidebar-border pt-2">
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-sidebar-foreground">
                  {user.email}
                </p>
                <p className="text-2xs text-sidebar-foreground/50 capitalize">
                  {user.tier}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

function SidebarLink({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'flex h-9 w-full items-center gap-3 rounded-md px-3',
          'text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-0'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}