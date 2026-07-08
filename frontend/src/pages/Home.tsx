import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Radio,
  DollarSign,
  RotateCcw,
  Zap,
  X,
  Target,
} from 'lucide-react'
import { adminApi, systemApi, dashboardApi, signalsApi } from '@/lib/endpoints'
import { useWsStore } from '@/stores/wsStore'
import { useAuthStore } from '@/stores/authStore'
import KPICard from '@/components/ui/KPICard'
import GradeTag from '@/components/ui/GradeTag'
import { KPICardSkeleton } from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatTimeAgo,
  formatMRR,
  formatPrice,
  cn,
} from '@/lib/utils'
import { toast } from 'sonner'
import type { QueueItem } from '@/types'

function useSessionInfo() {
  const [session, setSession] = useState({ name: '', color: '', dot: '' })

  useEffect(() => {
    const update = () => {
      const now  = new Date()
      const hour = now.getUTCHours() + now.getUTCMinutes() / 60
      const day  = now.getUTCDay()
      const isWeekend = day === 0 || day === 6

      if (isWeekend) {
        setSession({ name: 'Weekend',     color: 'text-muted-foreground', dot: 'bg-muted-foreground' })
      } else if (hour >= 13 && hour < 16) {
        setSession({ name: 'London / NY', color: 'text-emerald-500',      dot: 'bg-emerald-500' })
      } else if (hour >= 16 && hour < 21) {
        setSession({ name: 'New York',    color: 'text-blue-500',          dot: 'bg-blue-500' })
      } else if (hour >= 8 && hour < 13) {
        setSession({ name: 'London',      color: 'text-blue-500',          dot: 'bg-blue-500' })
      } else if (hour >= 0 && hour < 8) {
        setSession({ name: 'Asia',        color: 'text-amber-500',         dot: 'bg-amber-500' })
      } else {
        setSession({ name: 'Off Hours',   color: 'text-muted-foreground', dot: 'bg-muted-foreground' })
      }
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return session
}

export default function Home() {
  const { summary: wsSummary, lastPayload } = useWsStore()
  const { isAdmin } = useAuthStore()
  const session = useSessionInfo()
  const [selectedSignal, setSelectedSignal] = useState<QueueItem | null>(null)

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data),
    enabled: isAdmin,
    refetchInterval: 60000,
  })

  const { data: adminOverview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.overview().then((r) => r.data),
    enabled: isAdmin,
    refetchInterval: 30000,
  })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => systemApi.health().then((r) => r.data),
    enabled: isAdmin,
    refetchInterval: 30000,
  })

  const { data: signalsData } = useQuery({
    queryKey: ['dashboard-signals'],
    queryFn: () => dashboardApi.signals().then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: apiSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.summary().then((r) => r.data),
    refetchInterval: 15000,
  })

  const handleScan = async () => {
    try {
      toast.loading('Scan triggered...')
      await signalsApi.scan()
      toast.dismiss()
      toast.success('Scan triggered — results in ~2 minutes')
    } catch {
      toast.dismiss()
      toast.error('Failed to trigger scan')
    }
  }

  const handleSync = async () => {
    try {
      toast.loading('Syncing outcomes...')
      await systemApi.syncOutcomes()
      toast.dismiss()
      toast.success('Outcomes synced successfully')
    } catch {
      toast.dismiss()
      toast.error('Failed to sync outcomes')
    }
  }

  const summary = {
    ...apiSummary,
    ...wsSummary,
    wins:      wsSummary?.wins      ?? apiSummary?.wins,
    losses:    wsSummary?.losses    ?? apiSummary?.losses,
    win_rate:  wsSummary?.win_rate  ?? apiSummary?.win_rate,
    total_pnl: wsSummary?.total_pnl ?? apiSummary?.total_pnl,
    today_pnl: wsSummary?.today_pnl ?? apiSummary?.today_pnl,
  }

  const wsQueue  = lastPayload?.signals?.queue ?? []
  const apiQueue = signalsData?.queue ?? []
  const queue    = wsQueue.length > 0 ? wsQueue : apiQueue
  const isLive   = summary?.mode === 'live'

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Signal Engine v{import.meta.env.VITE_APP_VERSION} —{' '}
            <span className={cn('font-medium', isLive ? 'text-red-500' : 'text-blue-500')}>
              {isLive ? 'Live Trading' : 'Paper Trading'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            <div className={cn('h-1.5 w-1.5 rounded-full', session.dot)} />
            <span className={cn('text-xs font-medium', session.color)}>
              {session.name}
            </span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors min-touch"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sync</span>
              </button>
              <button
                onClick={handleScan}
                className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors min-touch"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Scan Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {!summary ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Today's PnL"
              value={summary.today_pnl !== null && summary.today_pnl !== undefined ? formatCurrency(summary.today_pnl) : '—'}
              icon={DollarSign}
              accent={summary.today_pnl_pos ? 'green' : 'red'}
              description={`${summary.today_trades ?? 0} trades today`}
            />
            <KPICard
              title="Win Rate"
              value={summary.win_rate !== null && summary.win_rate !== undefined ? formatPercent(summary.win_rate, false) : '—'}
              icon={TrendingUp}
              accent="blue"
              description={`${summary.wins ?? 0}W / ${summary.losses ?? 0}L all time`}
            />
            <KPICard
              title="Active Signals"
              value={formatNumber(summary.tradeable_count ?? 0)}
              icon={Radio}
              accent="purple"
              description={`${summary.coins_count ?? 0} coins monitored`}
            />
            {isAdmin && adminStats ? (
              <KPICard
                title="Total Users"
                value={formatNumber(adminStats.users.total)}
                icon={Users}
                accent="default"
                description={`+${adminStats.users.new_today} today`}
              />
            ) : (
              <KPICard
                title="Total PnL"
                value={summary.total_pnl !== null && summary.total_pnl !== undefined ? formatCurrency(summary.total_pnl) : '—'}
                icon={summary.total_pnl !== null && summary.total_pnl !== undefined && summary.total_pnl >= 0 ? TrendingUp : TrendingDown}
                accent={summary.total_pnl !== null && summary.total_pnl !== undefined && summary.total_pnl >= 0 ? 'green' : 'red'}
                description={`${summary.closed_signals ?? 0} closed signals`}
              />
            )}
          </>
        )}
      </div>

      {isAdmin && adminStats && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <KPICard
            title="MRR Estimate"
            value={formatMRR(adminStats.mrr_estimate)}
            icon={DollarSign}
            accent="green"
            description={`${adminStats.active_subs} active subscriptions`}
          />
          <KPICard
            title="Pro Users"
            value={formatNumber(adminStats.pro_count)}
            accent="blue"
            description="Pro tier"
          />
          <KPICard
            title="Elite Users"
            value={formatNumber(adminStats.elite_count)}
            accent="purple"
            description="Elite tier"
          />
          <KPICard
            title="Signups This Week"
            value={formatNumber(adminStats.signups_week)}
            icon={Users}
            accent="default"
            description={`${adminStats.signups_month} this month`}
          />
        </div>
      )}

      {isAdmin && health && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">System Health</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 px-4 py-3">
            <HealthItem label="Redis"         ok={health.redis_connected} />
            <HealthItem label="Signal Engine" ok={health.status === 'ok'} />
            <HealthItem
              label="ML Model"
              ok={health.ml_status?.ml_enabled}
              neutral={!health.ml_status?.ml_enabled}
              neutralLabel="Collecting data"
            />
            {health.system && (
              <>
                <div className="hidden md:block h-4 w-px bg-border" />
                <SystemMetric label="CPU"    value={`${health.system.cpu_pct}%`}    warn={health.system.cpu_pct > 80} />
                <SystemMetric label="RAM"    value={`${health.system.ram_pct}%`}    warn={health.system.ram_pct > 85} />
                <SystemMetric label="Disk"   value={`${health.system.disk_pct}%`}   warn={health.system.disk_pct > 90} />
                <SystemMetric label="Uptime" value={health.system.uptime_str} />
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">Live Signal Queue</p>
            <span className="text-xs text-muted-foreground">
              {queue.length} signal{queue.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-border">
            {!queue?.length ? (
              <EmptyState
                icon={Radio}
                title="No tradeable signals"
                description="Signals appear here when A+/A grades are detected"
              />
            ) : (
              queue.slice(0, 5).map((item, i) => (
                <motion.div
                  key={`${item.coin}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedSignal(item)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                    'border-l-2',
                    item.direction === 'LONG'
                      ? 'border-l-emerald-500/40'
                      : 'border-l-red-500/40'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GradeTag grade={item.grade} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground font-mono truncate">
                        {item.coin}USDT
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn(
                          'text-xs font-medium flex items-center gap-1',
                          item.direction === 'LONG' ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {item.direction === 'LONG'
                            ? <TrendingUp className="h-3 w-3" />
                            : <TrendingDown className="h-3 w-3" />
                          }
                          {item.direction}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground truncate">{item.regime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-mono font-medium text-foreground">
                      {item.score}/100
                    </p>
                    {item.entry && (
                      <p className="text-xs font-mono text-muted-foreground">
                        {formatPrice(item.entry)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {isAdmin && adminOverview && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">Recent Activity</p>
            </div>
            <div className="divide-y divide-border">
              {!adminOverview.recent_audit?.length ? (
                <EmptyState
                  title="No recent activity"
                  description="Audit events will appear here"
                />
              ) : (
                adminOverview.recent_audit.slice(0, 6).map((entry: {
                  id: number
                  action: string
                  source: string
                  detail: string
                  ip: string
                  success: boolean
                  timestamp: string
                }) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        entry.success ? 'bg-emerald-500' : 'bg-red-500'
                      )} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {entry.action}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.detail || entry.source}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTimeAgo(entry.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isAdmin && adminStats && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">User Distribution</p>
            <p className="text-xs text-muted-foreground">{adminStats.users.total} total</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { tier: 'free',  label: 'Basic',  count: adminStats.users.by_tier.free,  color: 'bg-muted' },
                { tier: 'pro',   label: 'Pro',    count: adminStats.users.by_tier.pro,   color: 'bg-blue-500' },
                { tier: 'elite', label: 'Elite',  count: adminStats.users.by_tier.elite, color: 'bg-purple-500' },
                { tier: 'admin', label: 'Admin',  count: adminStats.users.by_tier.admin, color: 'bg-emerald-500' },
              ].map((item) => {
                const pct = adminStats.users.total > 0
                  ? Math.round((item.count / adminStats.users.total) * 100)
                  : 0
                return (
                  <div key={item.tier} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-mono font-medium text-foreground">{item.count}</p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', item.color)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{pct}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedSignal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedSignal(null)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-sm"
              >
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {selectedSignal.coin}USDT
                      </span>
                      <GradeTag grade={selectedSignal.grade} />
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
                        selectedSignal.direction === 'LONG'
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : 'text-red-500 bg-red-500/10'
                      )}>
                        {selectedSignal.direction === 'LONG'
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />
                        }
                        {selectedSignal.direction}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedSignal(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <MetricBox label="Score"   value={`${selectedSignal.score}/100`} mono />
                      <MetricBox label="Session" value={selectedSignal.session} />
                      <MetricBox label="Regime"  value={selectedSignal.regime} />
                      {selectedSignal.actual_rr && selectedSignal.actual_rr > 0 && (
                        <MetricBox label="R:R" value={`1:${selectedSignal.actual_rr}`} mono />
                      )}
                    </div>

                    {selectedSignal.entry ? (
                      <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Entry Levels
                        </p>
                        <div className="space-y-1.5">
                          <LevelRow label="Entry"       value={selectedSignal.entry}  color="text-blue-500" />
                          <LevelRow label="Stop Loss"   value={selectedSignal.sl}     color="text-red-500"
                            suffix={selectedSignal.sl_pct ? `${selectedSignal.sl_pct.toFixed(2)}%` : undefined}
                          />
                          <LevelRow label="Take Profit" value={selectedSignal.tp1}    color="text-emerald-500"
                            suffix={selectedSignal.actual_rr ? `R:R 1:${selectedSignal.actual_rr}` : undefined}
                          />
                        </div>
                        {selectedSignal.risk_amt && (
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Risk Amount</span>
                            <span className="text-xs font-mono font-medium text-foreground">
                              {formatCurrency(selectedSignal.risk_amt)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          Entry levels require Pro plan
                        </p>
                      </div>
                    )}

                    {selectedSignal.thesis && (
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Thesis
                        </p>
                        <p className="text-xs text-foreground leading-relaxed">
                          {selectedSignal.thesis}
                        </p>
                      </div>
                    )}

                    {selectedSignal.ml_probability !== null &&
                     selectedSignal.ml_probability !== undefined && (
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                        <span className="text-xs text-muted-foreground">ML Probability</span>
                        <span className={cn(
                          'text-xs font-mono font-medium',
                          selectedSignal.ml_probability >= 0.65
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        )}>
                          {(selectedSignal.ml_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MetricBox({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        'mt-0.5 text-sm font-medium text-foreground truncate',
        mono && 'font-mono'
      )}>
        {value}
      </p>
    </div>
  )
}

function LevelRow({
  label,
  value,
  color,
  suffix,
}: {
  label: string
  value: number | null | undefined
  color: string
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        <span className={cn('text-xs font-mono font-medium', color)}>
          {value ? formatPrice(value) : '—'}
        </span>
      </div>
    </div>
  )
}

function HealthItem({
  label,
  ok,
  neutral = false,
  neutralLabel,
}: {
  label: string
  ok: boolean
  neutral?: boolean
  neutralLabel?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        'h-1.5 w-1.5 rounded-full',
        neutral ? 'bg-amber-500' : ok ? 'bg-emerald-500' : 'bg-red-500'
      )} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(
        'text-xs font-medium',
        neutral ? 'text-amber-500' : ok ? 'text-emerald-500' : 'text-red-500'
      )}>
        {neutral ? neutralLabel : ok ? 'OK' : 'Down'}
      </span>
    </div>
  )
}

function SystemMetric({
  label,
  value,
  warn = false,
}: {
  label: string
  value: string
  warn?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-xs font-mono font-medium', warn ? 'text-amber-500' : 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}