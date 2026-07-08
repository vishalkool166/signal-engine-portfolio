import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Wifi, WifiOff, Clock, TrendingUp } from 'lucide-react'
import { cn, formatCountdown, formatPercent } from '@/lib/utils'
import { useWsStore } from '@/stores/wsStore'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

interface SessionInfo {
  name: string
  color: string
  dot: string
  quality: string
}

function getSessionInfo(): SessionInfo {
  const now  = new Date()
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60
  const day  = now.getUTCDay()
  const isWeekend = day === 0 || day === 6

  if (isWeekend) {
    return { name: 'Weekend',     color: 'text-muted-foreground', dot: 'bg-muted-foreground',          quality: 'Low Volume' }
  }
  if (hour >= 13 && hour < 16) {
    return { name: 'London / NY', color: 'text-emerald-500',      dot: 'bg-emerald-500 animate-pulse', quality: 'Best' }
  }
  if (hour >= 16 && hour < 21) {
    return { name: 'New York',    color: 'text-blue-500',          dot: 'bg-blue-500',                 quality: 'Good' }
  }
  if (hour >= 8 && hour < 13) {
    return { name: 'London',      color: 'text-blue-500',          dot: 'bg-blue-500',                 quality: 'Good' }
  }
  if (hour >= 0 && hour < 8) {
    return { name: 'Asia',        color: 'text-amber-500',         dot: 'bg-amber-500',                quality: 'Caution' }
  }
  return { name: 'Off Hours',     color: 'text-muted-foreground', dot: 'bg-muted-foreground',          quality: 'Low Volume' }
}

export default function TopBar() {
  const { theme, setTheme }           = useTheme()
  const { status, summary, ticker }   = useWsStore()
  const { setCommandPaletteOpen }     = useUiStore()
  const { isAdmin }                   = useAuthStore()
  const [countdown, setCountdown]     = useState<string>('—')
  const [session, setSession]         = useState<SessionInfo>(getSessionInfo())
  const tickerRef                     = useRef<HTMLDivElement>(null)
  const animFrameRef                  = useRef<number | null>(null)
  const offsetRef                     = useRef<number>(0)
  const lastTimeRef                   = useRef<number>(0)
  const SPEED                         = 40

  useEffect(() => {
    const interval = setInterval(() => setSession(getSessionInfo()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!summary?.next_scan_epoch) return
    const interval = setInterval(() => {
      setCountdown(formatCountdown(summary.next_scan_epoch))
    }, 1000)
    return () => clearInterval(interval)
  }, [summary?.next_scan_epoch])

  useEffect(() => {
    if (!ticker.length || !tickerRef.current) return

    const el        = tickerRef.current
    const totalWidth = el.scrollWidth / 2

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      offsetRef.current += (SPEED * delta) / 1000
      if (offsetRef.current >= totalWidth) {
        offsetRef.current = 0
      }

      el.style.transform = `translateX(-${offsetRef.current}px)`
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      lastTimeRef.current = 0
      offsetRef.current   = 0
    }
  }, [ticker])

  const isConnected = status === 'connected'
  const isLive      = summary?.mode === 'live'

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Signal Engine</span>
          </div>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className={cn(
              'hidden md:flex h-8 w-48 shrink-0 items-center gap-2 rounded-md border border-border',
              'bg-muted/50 px-3 text-sm text-muted-foreground',
              'hover:bg-muted transition-colors'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-xs">Search...</span>
            <kbd className="ml-auto text-xs text-muted-foreground/50 border border-border rounded px-1 py-0.5">⌘K</kbd>
          </button>

          {ticker.length > 0 && (
            <div className="hidden md:block overflow-hidden flex-1 relative">
              <div
                ref={tickerRef}
                className="flex items-center gap-6 whitespace-nowrap will-change-transform"
                style={{ width: 'max-content' }}
              >
                {[...ticker, ...ticker].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-medium text-foreground font-mono">{item.coin}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      ${item.price >= 1000
                        ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : item.price >= 1
                        ? item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : item.price.toFixed(4)
                      }
                    </span>
                    <span className={cn('text-xs font-mono', item.change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                      {formatPercent(item.change)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className={cn(
            'hidden lg:flex items-center gap-1.5 rounded-md border px-2.5 py-1',
            session.name === 'London / NY'
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : session.name === 'Weekend' || session.name === 'Off Hours'
              ? 'border-border bg-muted/30'
              : 'border-blue-500/30 bg-blue-500/5'
          )}>
            <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', session.dot)} />
            <span className={cn('text-xs font-medium', session.color)}>{session.name}</span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className={cn('text-xs', session.color)}>{session.quality}</span>
          </div>

          {isAdmin && summary?.next_scan_epoch && (
            <div className="hidden lg:flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Next scan</span>
              <span className="text-xs font-mono font-medium text-foreground">{countdown}</span>
            </div>
          )}

          <div className={cn(
            'flex items-center gap-1.5 rounded-md border px-2 py-1',
            isLive ? 'border-red-500/30 bg-red-500/10' : 'border-blue-500/30 bg-blue-500/10'
          )}>
            <div className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-red-500 animate-pulse' : 'bg-blue-500')} />
            <span className={cn('text-xs font-medium', isLive ? 'text-red-500' : 'text-blue-500')}>
              {isLive ? 'Live' : 'Paper'}
            </span>
          </div>

          <div className="flex items-center">
            {isConnected
              ? <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              : <WifiOff className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
            }
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {ticker.length > 0 && (
        <div className="md:hidden border-t border-border overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-1.5 overflow-x-auto scrollbar-none">
            {ticker.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-medium text-foreground font-mono">{item.coin}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  ${item.price >= 1000
                    ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : item.price >= 1
                    ? item.price.toFixed(2)
                    : item.price.toFixed(4)
                  }
                </span>
                <span className={cn('text-xs font-mono', item.change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {formatPercent(item.change)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}