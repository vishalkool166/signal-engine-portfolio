import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  X,
  Clock,
  ChevronDown,
  DollarSign,
  Percent,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  BarChart3,
} from 'lucide-react'
import { tradesApi } from '@/lib/endpoints'
import TotpModal from '@/components/modals/TotpModal'
import EmptyState from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import SelectDropdown from '@/components/ui/SelectDropdown'
import SpotlightCard from '@/components/ui/SpotlightCard'
import GradeTag from '@/components/ui/GradeTag'
import {
  formatCurrency,
  formatPercent,
  formatPrice,
  formatDateTime,
  cn,
} from '@/lib/utils'
import type { Trade, DailyEntry, CoinPerformance } from '@/types'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useWsStore } from '@/stores/wsStore'

const DAY_OPTIONS = [
  { value: '7',  label: 'Last 7 days'  },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
]

const OUTCOME_OPTIONS = [
  { value: 'all',  label: 'All trades'  },
  { value: 'win',  label: 'Wins only'   },
  { value: 'loss', label: 'Losses only' },
]

const HISTORY_PAGE_SIZE = 20

function useLiveTimer(openedAt: string | null | undefined): string {
  const [duration, setDuration] = useState('—')
  useEffect(() => {
    if (!openedAt) return
    const update = () => {
      try {
        const dt = new Date(
          openedAt.includes('Z') || openedAt.includes('+') ? openedAt : openedAt + 'Z'
        )
        const diff = Date.now() - dt.getTime()
        if (diff < 0) { setDuration('—'); return }
        const mins = Math.floor(diff / 60000)
        const hrs  = Math.floor(mins / 60)
        const secs = Math.floor((diff % 60000) / 1000)
        setDuration(hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m ${secs}s`)
      } catch {
        setDuration('—')
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [openedAt])
  return duration
}

function TradeTimer({ openedAt }: { openedAt: string | null | undefined }) {
  const d = useLiveTimer(openedAt)
  return <span className="font-mono text-xs text-muted-foreground">{d}</span>
}

function HealthBadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    HEALTHY:     'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    WARNING:     'text-amber-500 bg-amber-500/10 border-amber-500/20',
    INVALIDATED: 'text-red-500 bg-red-500/10 border-red-500/20',
  }
  return (
    <span className={cn(
      'inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium',
      styles[state] ?? styles.HEALTHY
    )}>
      {state}
    </span>
  )
}

function CloseReasonBadge({ reason }: { reason: string | null }) {
  if (!reason) return <span className="text-xs text-muted-foreground">—</span>
  const styles: Record<string, string> = {
    tp_hit:              'text-emerald-500 bg-emerald-500/10',
    sl_hit:              'text-red-500 bg-red-500/10',
    manual_close:        'text-blue-500 bg-blue-500/10',
    exchange_closed:     'text-amber-500 bg-amber-500/10',
    liquidated:          'text-red-600 bg-red-600/10',
    sl_placement_failed: 'text-orange-500 bg-orange-500/10',
  }
  const labels: Record<string, string> = {
    tp_hit:              'TP Hit',
    sl_hit:              'SL Hit',
    manual_close:        'Manual',
    exchange_closed:     'Exchange',
    liquidated:          'Liquidated',
    sl_placement_failed: 'SL Failed',
  }
  return (
    <span className={cn(
      'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
      styles[reason] ?? 'text-muted-foreground bg-muted'
    )}>
      {labels[reason] ?? reason}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label:   string
  value:   string
  sub?:    string
  accent?: 'green' | 'red' | 'blue' | 'amber' | 'default'
  icon?:   React.ElementType
}) {
  const colors = {
    green:   'text-emerald-500',
    red:     'text-red-500',
    blue:    'text-blue-500',
    amber:   'text-amber-500',
    default: 'text-foreground',
  }
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <p className={cn('text-xl font-semibold font-mono', colors[accent ?? 'default'])}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono = false,
  color,
  sub,
  subColor,
}: {
  label:     string
  value:     string
  mono?:     boolean
  color?:    string
  sub?:      string
  subColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">
        <span className={cn('text-xs', mono && 'font-mono', color ?? 'text-foreground')}>
          {value}
        </span>
        {sub && (
          <p className={cn('text-xs', subColor ?? 'text-muted-foreground')}>{sub}</p>
        )}
      </div>
    </div>
  )
}

function TradeDetailDrawer({
  trade,
  onClose,
  onForceSell,
}: {
  trade:       Trade
  onClose:     () => void
  onForceSell: () => void
}) {
  const isLong     = !trade.is_short
  const isOpen     = trade.is_open ?? false
  const pnl        = isOpen
    ? (trade.net_pnl_live ?? trade.profit_abs ?? 0)
    : (trade.pnl ?? 0)
  const duration   = useLiveTimer(isOpen ? trade.opened_at : null)
  const entryFee   = trade.entry_commission   ?? 0
  const exitFee    = trade.exit_commission    ?? 0
  const fundingFee = Math.abs(trade.funding_fees_paid ?? 0)
  const totalCosts = entryFee + exitFee + fundingFee
  const grossPnl   = pnl + totalCosts
  const entrySlip  = trade.slippage_entry_pct ?? 0
  const exitSlip   = trade.slippage_exit_pct  ?? 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-mono font-semibold', isLong ? 'text-emerald-500' : 'text-red-500')}>
            {trade.coin}USDT
          </span>
          <GradeTag grade={trade.grade as never} />
          {trade.health && <HealthBadge state={trade.health.state} />}
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={cn(
          'rounded-lg border p-4',
          pnl >= 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isLong
                ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                : <TrendingDown className="h-4 w-4 text-red-500" />
              }
              <span className={cn('font-semibold', isLong ? 'text-emerald-500' : 'text-red-500')}>
                {isLong ? 'LONG' : 'SHORT'}
              </span>
              {isOpen && (
                <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">OPEN</span>
              )}
            </div>
            {!isOpen && trade.close_reason && (
              <CloseReasonBadge reason={trade.close_reason} />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-2xl font-bold font-mono', pnl >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {formatCurrency(pnl)}
            </span>
            <span className="text-sm text-muted-foreground font-mono">net</span>
          </div>
          {isOpen && (
            <p className="text-xs text-muted-foreground mt-1">
              Open for <span className="font-mono">{duration}</span>
            </p>
          )}
        </div>

        <Section title="Trade Info">
          <InfoRow label="Score at Entry"  value={`${trade.score_at_entry ?? 0}/100`} mono />
          <InfoRow label="Regime"          value={trade.regime_at_entry  ?? '—'} />
          <InfoRow label="Session"         value={trade.session_at_entry ?? '—'} />
          <InfoRow label="Opened"          value={formatDateTime(trade.opened_at)} />
          {trade.closed_at && (
            <InfoRow label="Closed"        value={formatDateTime(trade.closed_at)} />
          )}
          {!isOpen && (
            <InfoRow label="Hold Duration" value={trade.duration ?? '—'} mono />
          )}
        </Section>

        <Section title="Price Levels">
          <InfoRow
            label="Signal Entry"
            value={formatPrice(trade.entry_price)}
            mono
          />
          <InfoRow
            label="Actual Fill"
            value={formatPrice(trade.actual_fill_entry ?? trade.entry_price)}
            mono
            sub={entrySlip > 0 ? `${entrySlip.toFixed(3)}% slip` : undefined}
            subColor={entrySlip > 0.5 ? 'text-amber-500' : 'text-muted-foreground'}
          />
          {isOpen && (
            <InfoRow label="Current Price" value={formatPrice(trade.current_price)} mono color="text-blue-500" />
          )}
          {!isOpen && trade.exit_price && (
            <InfoRow
              label="Exit Price"
              value={formatPrice(trade.exit_price)}
              mono
              sub={exitSlip > 0 ? `${exitSlip.toFixed(3)}% slip` : undefined}
              subColor={exitSlip > 0.5 ? 'text-amber-500' : 'text-muted-foreground'}
            />
          )}
          <InfoRow label="Stop Loss"    value={trade.sl_price  ? formatPrice(trade.sl_price)  : '—'} mono color="text-red-500" />
          <InfoRow label="Take Profit"  value={trade.tp1_price ? formatPrice(trade.tp1_price) : '—'} mono color="text-emerald-500" />
          {(trade.liquidation ?? 0) > 0 && (
            <InfoRow label="Liquidation" value={formatPrice(trade.liquidation)} mono color="text-red-600" />
          )}
        </Section>

        <Section title="Position Size">
          <InfoRow label="Margin Used"   value={formatCurrency(trade.margin_used)} mono />
          <InfoRow label="Leverage"      value={`${trade.leverage}x`}              mono color="text-blue-500" />
          <InfoRow label="Position Size" value={formatCurrency(trade.position_size ?? trade.margin_used * trade.leverage)} mono />
        </Section>

        <Section title="PnL Breakdown">
          <InfoRow
            label="Gross PnL"
            value={formatCurrency(grossPnl)}
            mono
            color={grossPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}
          />
          <InfoRow label="Entry Fee"    value={`-${formatCurrency(entryFee)}`}   mono color="text-muted-foreground" sub={trade.entry_role ?? undefined} />
          <InfoRow label="Exit Fee"     value={`-${formatCurrency(exitFee)}`}    mono color="text-muted-foreground" sub={trade.exit_role  ?? undefined} />
          <InfoRow label="Funding Fees" value={`-${formatCurrency(fundingFee)}`} mono color="text-muted-foreground" />
          <div className="border-t border-border pt-2 mt-1">
            <InfoRow
              label="Net PnL"
              value={formatCurrency(pnl)}
              mono
              color={pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}
            />
            <InfoRow label="Total Costs" value={`-${formatCurrency(totalCosts)}`} mono color="text-muted-foreground" />
          </div>
        </Section>

        {trade.health && (
          <Section title={isOpen ? 'Health Monitor' : 'Health at Close'}>
            <div className="mb-2">
              <HealthBadge state={trade.health.state} />
            </div>
            {trade.health.failures.map((f, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-500">{f}</p>
              </div>
            ))}
            {trade.health.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-500">{w}</p>
              </div>
            ))}
            {trade.health.checks.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{c}</p>
              </div>
            ))}
          </Section>
        )}

        {isOpen && (
          <button
            onClick={onForceSell}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
            Force Sell Position
          </button>
        )}
      </div>
    </div>
  )
}

export default function Trades() {
  const queryClient                       = useQueryClient()
  const { lastPayload }                   = useWsStore()
  const [totpOpen, setTotpOpen]           = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [drawerTrade, setDrawerTrade]     = useState<Trade | null>(null)
  const [dailyDays, setDailyDays]         = useState('7')
  const [historyOffset, setHistoryOffset] = useState(0)
  const [allHistory, setAllHistory]       = useState<Trade[]>([])
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [hasMore, setHasMore]             = useState(true)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['trades-summary'],
    queryFn:  () => tradesApi.summary().then((r) => r.data),
    refetchInterval: 5000,
  })

  const { data: profit } = useQuery({
    queryKey: ['trades-profit'],
    queryFn:  () => tradesApi.profit().then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: daily } = useQuery({
    queryKey: ['trades-daily', dailyDays],
    queryFn:  () => tradesApi.daily(Number(dailyDays)).then((r) => r.data),
    refetchInterval: 60000,
  })

  const { data: performance } = useQuery({
    queryKey: ['trades-performance'],
    queryFn:  () => tradesApi.performance().then((r) => r.data),
    refetchInterval: 60000,
  })

  const { data: wsStatus } = useQuery({
    queryKey: ['trades-ws-status'],
    queryFn:  () => tradesApi.wsStatus().then((r) => r.data),
    refetchInterval: 5000,
  })

  const { data: historyPage, isFetching: historyLoading } = useQuery({
    queryKey: ['trades-history', historyOffset],
    queryFn:  () => tradesApi.history(HISTORY_PAGE_SIZE, historyOffset).then((r) => r.data),
    staleTime: 30000,
  })

  useEffect(() => {
    if (!historyPage) return
    const incoming = historyPage.trades ?? []
    if (historyOffset === 0) {
      setAllHistory(incoming)
    } else {
      setAllHistory((prev) => {
        const ids = new Set(prev.map((t) => t.trade_id))
        return [...prev, ...incoming.filter((t) => !ids.has(t.trade_id))]
      })
    }
    setHasMore(incoming.length === HISTORY_PAGE_SIZE)
  }, [historyPage, historyOffset])

  const loadMore = useCallback(() => {
    setHistoryOffset((prev) => prev + HISTORY_PAGE_SIZE)
  }, [])

  const forceSellMutation = useMutation({
    mutationFn: ({ trade_id, totp_code }: { trade_id: number; totp_code: string }) =>
      tradesApi.forceSell(trade_id, totp_code),
    onSuccess: () => {
      toast.success('Force sell executed')
      queryClient.invalidateQueries({ queryKey: ['trades-summary'] })
      queryClient.invalidateQueries({ queryKey: ['trades-history', 0] })
      setHistoryOffset(0)
      setAllHistory([])
      setTotpOpen(false)
      setSelectedTrade(null)
      setDrawerTrade(null)
    },
    onError: () => {
      throw new Error('Invalid TOTP code or trade not found')
    },
  })

  if (isLoading) return <PageSkeleton />

  const wsOpenTrades  = (lastPayload?.open_trades ?? []) as Trade[]
  const apiOpenTrades = (summary?.status ?? []) as Trade[]
  const openTrades    = wsOpenTrades.length > 0 ? wsOpenTrades : apiOpenTrades

  const usdtFree     = summary?.balance?.free        ?? 0
  const usdtTotal    = summary?.balance?.total       ?? 0
  const unrealized   = openTrades.reduce((sum, t) => sum + (t.unrealized_pnl ?? t.net_pnl_live ?? t.profit_abs ?? 0), 0)
  const totalPnl     = profit?.profit_all_coin    ?? 0
  const winRate      = profit ? profit.winrate * 100 : 0
  const totalComm    = profit?.total_commission   ?? 0
  const totalFunding = profit?.total_funding_fees ?? 0

  const markConnected = wsStatus?.mark_price_connected ?? false
  const userConnected = wsStatus?.user_data_connected  ?? false
  const wsConnected   = markConnected && userConnected

  const dailyData = daily?.data?.map((d: DailyEntry) => ({
    date: d.date.slice(5),
    pnl:  parseFloat(d.profit_abs?.toFixed(2) ?? '0'),
  })) ?? []

  const closedHistory   = allHistory.filter((t) => !t.is_open)
  const filteredHistory = outcomeFilter === 'all'
    ? closedHistory
    : closedHistory.filter((t) => t.outcome === outcomeFilter)

  return (
    <div className="flex h-full overflow-hidden">
      <div className={cn(
        'flex flex-1 flex-col overflow-y-auto transition-all duration-300',
        drawerTrade ? 'lg:mr-96' : ''
      )}>
        <div className="p-4 md:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Trades</h1>
              <p className="text-sm text-muted-foreground">
                Binance {import.meta.env.VITE_TRADING_MODE === 'live' ? 'Live' : 'Demo'} Futures
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium',
                wsConnected
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                  : 'border-red-500/20 bg-red-500/10 text-red-500'
              )}>
                {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {wsConnected ? 'Live' : 'Disconnected'}
              </div>
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['trades-summary'] })
                  queryClient.invalidateQueries({ queryKey: ['trades-profit'] })
                }}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Free Balance"
              value={formatCurrency(usdtFree)}
              sub={`Total: ${formatCurrency(usdtTotal)}`}
              icon={DollarSign}
              accent="blue"
            />
            <SummaryCard
              label="Unrealized PnL"
              value={formatCurrency(unrealized)}
              sub={`${openTrades.length} open trade${openTrades.length !== 1 ? 's' : ''}`}
              accent={unrealized >= 0 ? 'green' : 'red'}
            />
            <SummaryCard
              label="All-time Net PnL"
              value={formatCurrency(totalPnl)}
              sub={`WR: ${winRate.toFixed(1)}% · ${profit?.trade_count ?? 0} trades`}
              accent={totalPnl >= 0 ? 'green' : 'red'}
              icon={Percent}
            />
            <SummaryCard
              label="Total Costs"
              value={formatCurrency(totalComm + totalFunding)}
              sub={`Fees: ${formatCurrency(totalComm)} · Funding: ${formatCurrency(totalFunding)}`}
              accent="amber"
              icon={BarChart3}
            />
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Open Positions ({openTrades.length})
              </p>
            </div>
            {openTrades.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No open trades"
                description="Positions will appear here when trades are opened"
              />
            ) : (
              <div className="divide-y divide-border">
                {openTrades.map((trade, i) => {
                  const isLong      = !trade.is_short
                  const pnl         = trade.net_pnl_live ?? trade.profit_abs ?? 0
                  const pnlPct      = (trade.profit_ratio ?? 0) * 100
                  const health      = trade.health
                  const healthState = health?.state ?? 'HEALTHY'
                  const sl          = trade.sl_price  ?? trade.sl_signal
                  const tp          = trade.tp1_price ?? trade.tp1
                  const cur         = trade.current_price
                  const entry       = trade.entry_price
                  const leverage    = trade.leverage ?? 10
                  const margin      = trade.margin_used ?? 0
                  const position    = margin * leverage

                  let progressPct = 50
                  if (sl && tp && cur) {
                    const range = Math.abs(tp - sl)
                    if (range > 0) {
                      progressPct = isLong
                        ? ((cur - sl) / range) * 100
                        : ((sl - cur) / range) * 100
                      progressPct = Math.max(0, Math.min(100, progressPct))
                    }
                  }

                  return (
                    <SpotlightCard
                      key={trade.trade_id}
                      spotlightColor={pnl >= 0 ? 'green' : 'red'}
                      className={cn(
                        'transition-all duration-200 cursor-pointer',
                        drawerTrade?.trade_id === trade.trade_id && 'bg-muted/30'
                      )}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setDrawerTrade(
                          drawerTrade?.trade_id === trade.trade_id ? null : trade
                        )}
                        className="p-4 space-y-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              'flex items-center gap-1.5 text-sm font-semibold',
                              isLong ? 'text-emerald-500' : 'text-red-500'
                            )}>
                              {isLong
                                ? <TrendingUp className="h-4 w-4" />
                                : <TrendingDown className="h-4 w-4" />
                              }
                              {trade.coin}
                            </div>
                            <GradeTag grade={trade.grade as never} />
                            <HealthBadge state={healthState} />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <TradeTimer openedAt={trade.opened_at} />
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                'font-mono text-sm font-semibold',
                                pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                              )}>
                                {formatCurrency(pnl)}
                              </p>
                              <p className={cn(
                                'font-mono text-xs',
                                pnlPct >= 0 ? 'text-emerald-500' : 'text-red-500'
                              )}>
                                {formatPercent(pnlPct)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTrade(trade)
                                setTotpOpen(true)
                              }}
                              className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              <span className="hidden sm:inline">Force Sell</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Entry</p>
                            <p className="font-mono font-medium text-foreground mt-0.5">{formatPrice(entry)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-mono font-medium text-foreground mt-0.5">{formatPrice(cur)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stop Loss</p>
                            <p className="font-mono font-medium text-red-500 mt-0.5">{sl ? formatPrice(sl) : '—'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Take Profit</p>
                            <p className="font-mono font-medium text-emerald-500 mt-0.5">{tp ? formatPrice(tp) : '—'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Margin</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrency(margin)}</span>
                            <span className="text-muted-foreground">×</span>
                            <span className="font-mono font-medium text-blue-500">{leverage}x</span>
                            <span className="text-muted-foreground">=</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrency(position)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{trade.regime_at_entry}</span>
                            <span>·</span>
                            <span>{trade.session_at_entry}</span>
                          </div>
                        </div>

                        {sl && tp && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="font-mono">SL {formatPrice(sl)}</span>
                              <span className="font-mono text-foreground">{formatPrice(cur)}</span>
                              <span className="font-mono">TP {formatPrice(tp)}</span>
                            </div>
                            <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={cn(
                                  'absolute left-0 top-0 h-full rounded-full',
                                  progressPct > 60 ? 'bg-emerald-500' :
                                  progressPct > 30 ? 'bg-amber-500' : 'bg-red-500'
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {health && (health.failures.length > 0 || health.warnings.length > 0) && (
                          <div className={cn(
                            'rounded-md px-3 py-2 text-xs',
                            health.failures.length > 0
                              ? 'bg-red-500/10 border border-red-500/20'
                              : 'bg-amber-500/10 border border-amber-500/20'
                          )}>
                            {health.failures.length > 0
                              ? <p className="text-red-500">{health.failures[0]}</p>
                              : <p className="text-amber-500">{health.warnings[0]}</p>
                            }
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground/40 text-right">
                          Click for full details
                        </p>
                      </motion.div>
                    </SpotlightCard>
                  )
                })}
              </div>
            )}
          </div>

          {dailyData.length > 0 && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Daily PnL</p>
                <SelectDropdown
                  value={dailyDays}
                  onChange={setDailyDays}
                  options={DAY_OPTIONS}
                  className="w-36"
                />
              </div>
              <div className="p-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                      formatter={(value: number) => [formatCurrency(value), 'Net PnL']}
                    />
                    <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                      {dailyData.map((entry: { pnl: number }, index: number) => (
                        <Cell key={index} fill={entry.pnl >= 0 ? 'hsl(var(--signal-green))' : 'hsl(var(--signal-red))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-medium text-foreground">Trade History</p>
              <div className="flex items-center gap-2">
                <SelectDropdown
                  value={outcomeFilter}
                  onChange={(v) => {
                    setOutcomeFilter(v)
                    setHistoryOffset(0)
                    setAllHistory([])
                  }}
                  options={OUTCOME_OPTIONS}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">
                  {filteredHistory.length} trades
                </span>
              </div>
            </div>

            {filteredHistory.length === 0 && !historyLoading ? (
              <EmptyState
                icon={Activity}
                title="No closed trades"
                description="Completed trades will appear here"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Coin</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Grade</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Net PnL</th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Reason</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">Duration</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground hidden lg:table-cell">Closed</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredHistory.map((trade, i) => {
                        const isLong = !trade.is_short
                        const pnl    = trade.pnl ?? 0
                        return (
                          <motion.tr
                            key={trade.trade_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                            onClick={() => setDrawerTrade(
                              drawerTrade?.trade_id === trade.trade_id ? null : trade
                            )}
                            className={cn(
                              'cursor-pointer hover:bg-muted/40 transition-colors',
                              drawerTrade?.trade_id === trade.trade_id && 'bg-muted/30'
                            )}
                          >
                            <td className="px-4 py-3">
                              <span className={cn(
                                'flex items-center gap-1 font-medium',
                                isLong ? 'text-emerald-500' : 'text-red-500'
                              )}>
                                {isLong
                                  ? <TrendingUp className="h-3 w-3" />
                                  : <TrendingDown className="h-3 w-3" />
                                }
                                {trade.coin}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <GradeTag grade={trade.grade as never} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={cn(
                                'font-mono font-medium',
                                pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                              )}>
                                {formatCurrency(pnl)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <CloseReasonBadge reason={trade.close_reason} />
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                              {trade.duration ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                              {trade.closed_at ? formatDateTime(trade.closed_at) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <ChevronDown className={cn(
                                'h-3.5 w-3.5 text-muted-foreground transition-transform -rotate-90',
                                drawerTrade?.trade_id === trade.trade_id && 'rotate-0'
                              )} />
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {hasMore && (
                  <div className="border-t border-border p-4 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={historyLoading}
                      className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {historyLoading
                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        : <ChevronDown className="h-3.5 w-3.5" />
                      }
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {performance && (performance as CoinPerformance[]).length > 0 && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">Per-Coin Performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Coin</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Trades</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Win Rate</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Net PnL</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">Commission</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">Funding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(performance as CoinPerformance[]).map((row) => (
                      <tr key={row.coin} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground font-mono">{row.coin}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          <span className="text-emerald-500">{row.wins}W</span>
                          {' / '}
                          <span className="text-red-500">{row.losses}L</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={row.win_rate >= 50 ? 'text-emerald-500' : 'text-red-500'}>
                            {row.win_rate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={row.profit_abs >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                            {formatCurrency(row.profit_abs)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                          -{formatCurrency(row.commission)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                          -{formatCurrency(row.funding)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      <AnimatePresence>
        {drawerTrade && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-full max-w-sm border-l border-border bg-card overflow-y-auto z-40 shadow-2xl"
          >
            <TradeDetailDrawer
              trade={drawerTrade}
              onClose={() => setDrawerTrade(null)}
              onForceSell={() => {
                setSelectedTrade(drawerTrade)
                setTotpOpen(true)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TotpModal
        open={totpOpen}
        title="Confirm Force Sell"
        description={selectedTrade ? `Close ${selectedTrade.coin}USDT ${selectedTrade.direction} position` : 'Confirm action'}
        destructive
        loading={forceSellMutation.isPending}
        onClose={() => { setTotpOpen(false); setSelectedTrade(null) }}
        onConfirm={async (code) => {
          if (!selectedTrade) return
          await forceSellMutation.mutateAsync({
            trade_id:  selectedTrade.trade_id,
            totp_code: code,
          })
        }}
      />
    </div>
  )
}