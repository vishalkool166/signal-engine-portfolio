import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Radio,
  Zap,
  Timer,
  ChevronDown,
} from 'lucide-react'
import { dashboardApi } from '@/lib/endpoints'
import { useWsStore } from '@/stores/wsStore'
import { useAuthStore } from '@/stores/authStore'
import GradeTag from '@/components/ui/GradeTag'
import EmptyState from '@/components/ui/EmptyState'
import SelectDropdown from '@/components/ui/SelectDropdown'
import SpotlightCard from '@/components/ui/SpotlightCard'
import {
  formatPrice,
  formatPercent,
  formatFunding,
  formatScore,
  formatCurrency,
  cn,
} from '@/lib/utils'
import type { RadarItem, CoinDetail } from '@/types'

const FACTOR_ORDER = [
  'liquidity_sweep',
  'retest_confirmation',
  'displacement',
  'market_regime',
  'weekly_filter',
  'market_structure',
  'session_timing',
  'btc_alignment',
  'oi_behavior',
  'volume_expansion',
  'funding_extreme',
  'rsi_divergence',
  'atr_volatility',
  'rsi_context',
  'macd_histogram',
  'order_blocks',
]

function useStopwatch(startTime: number | null | undefined): string {
  const [elapsed, setElapsed] = useState('0:00')

  useEffect(() => {
    if (!startTime) return
    const update = () => {
      const diff = Math.floor((Date.now() / 1000) - startTime)
      if (diff < 0) { setElapsed('0:00'); return }
      const mins = Math.floor(diff / 60)
      const secs = diff % 60
      if (mins >= 60) {
        const hrs = Math.floor(mins / 60)
        const rem = mins % 60
        setElapsed(`${hrs}h ${rem}m`)
      } else {
        setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`)
      }
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return elapsed
}

function ActiveSignalCard({
  item,
  showLevels,
  showML,
  showThesis,
}: {
  item: RadarItem
  showLevels: boolean
  showML: boolean
  showThesis: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const elapsed  = useStopwatch(item.timestamp ?? undefined)
  const isLong   = item.direction === 'LONG'
  const isExpired = item.timestamp
    ? (Date.now() / 1000) - item.timestamp > 900
    : false

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['coin-detail', item.coin],
    queryFn: () => dashboardApi.coinDetail(item.coin).then((r) => r.data),
    enabled: expanded,
    staleTime: 30000,
  })

  const hasLevels = detail?.signal?.entry && detail.signal.entry > 0

  return (
    <SpotlightCard
      spotlightColor={isLong ? 'green' : 'red'}
      className={cn(
        'rounded-lg border bg-card transition-all duration-200',
        isLong  ? 'border-emerald-500/20' : 'border-red-500/20',
        isExpired && 'opacity-60'
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              animate={item.grade === 'A+' ? {
                boxShadow: [
                  isLong ? '0 0 0px rgba(52,211,153,0)' : '0 0 0px rgba(239,68,68,0)',
                  isLong ? '0 0 12px rgba(52,211,153,0.4)' : '0 0 12px rgba(239,68,68,0.4)',
                  isLong ? '0 0 0px rgba(52,211,153,0)' : '0 0 0px rgba(239,68,68,0)',
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="shrink-0"
            >
              <GradeTag grade={item.grade} size="lg" />
            </motion.div>

            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground font-mono">
                  {item.coin}USDT
                </p>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
                  isLong ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                )}>
                  {isLong ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {item.direction}
                </span>
                {isExpired && (
                  <span className="text-xs text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5">
                    Stale
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground truncate">{item.regime}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{item.session}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-2">
            <div className="text-right">
              <p className="text-sm font-mono font-semibold text-foreground">
                {item.score}/100
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {formatPrice(item.price)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                <span className="font-mono">{elapsed}</span>
              </div>
              {showML && item.ml_probability !== null && item.ml_probability !== undefined && (
                <span className={cn(
                  'text-xs font-mono font-medium',
                  item.ml_probability >= 0.65 ? 'text-emerald-500' : 'text-red-500'
                )}>
                  ML {(item.ml_probability * 100).toFixed(0)}%
                </span>
              )}
            </div>

            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180'
            )} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {detailLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                </div>
              ) : !detail ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No cached data — run a scan first
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <InfoBox label="Price"   value={formatPrice(detail.market.price)} />
                    <InfoBox
                      label="24h"
                      value={formatPercent(detail.market.change)}
                      valueClass={detail.market.change >= 0 ? 'text-emerald-500' : 'text-red-500'}
                    />
                    <InfoBox
                      label="Funding"
                      value={formatFunding(detail.market.funding / 100)}
                      valueClass={Math.abs(detail.market.funding) > 0.05 ? 'text-amber-500' : undefined}
                    />
                    <InfoBox
                      label="R:R"
                      value={detail.actual_rr > 0 ? `1:${detail.actual_rr}` : '—'}
                    />
                  </div>

                  {showLevels && hasLevels ? (
                    <div className="rounded-md border border-border bg-background p-3 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Entry Levels
                      </p>
                      <LevelRow label="Entry"       value={detail.signal.entry}  color="text-blue-500" />
                      <LevelRow
                        label="Stop Loss"
                        value={detail.signal.sl}
                        color="text-red-500"
                        suffix={detail.signal.sl_pct ? `${detail.signal.sl_pct.toFixed(2)}%` : undefined}
                      />
                      <LevelRow
                        label="Take Profit"
                        value={detail.signal.tp1}
                        color="text-emerald-500"
                        suffix={detail.actual_rr > 0 ? `R:R 1:${detail.actual_rr}` : undefined}
                      />
                      {detail.signal.leverage && (
                        <LevelRow label="Leverage" value={`${detail.signal.leverage}x`} color="text-foreground" />
                      )}
                    </div>
                  ) : showLevels && !hasLevels ? (
                    <div className="rounded-md border border-border bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        No entry levels yet — signal is building
                      </p>
                    </div>
                  ) : !showLevels ? (
                    <div className="rounded-md border border-border bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Entry levels require Pro plan
                      </p>
                    </div>
                  ) : null}

                  {showThesis && detail.thesis && (
                    <div className="rounded-md border border-border bg-background p-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Thesis
                      </p>
                      <div className="space-y-1">
                        {detail.thesis.split('\n').filter(Boolean).map((line, i) => (
                          <p key={i} className="text-xs text-foreground leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SpotlightCard>
  )
}

function InfoBox({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xs font-mono font-medium text-foreground mt-0.5', valueClass)}>
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
  value: number | string | null | undefined
  color: string
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        <span className={cn('text-xs font-mono font-medium', color)}>
          {typeof value === 'number' ? formatPrice(value) : value ?? '—'}
        </span>
      </div>
    </div>
  )
}

export default function Signals() {
  const { lastPayload }                 = useWsStore()
  const { hasFeature, isAdmin }         = useAuthStore()
  const [search, setSearch]             = useState('')
  const [gradeFilter, setGradeFilter]   = useState<string>('all')
  const [dirFilter, setDirFilter]       = useState<string>('all')
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)

  const { data: signalsData } = useQuery({
    queryKey: ['dashboard-signals'],
    queryFn: () => dashboardApi.signals().then((r) => r.data),
    refetchInterval: 30000,
  })

  const wsRadar: RadarItem[]  = lastPayload?.signals?.radar ?? []
  const apiRadar: RadarItem[] = signalsData?.radar ?? []
  const radar                 = wsRadar.length > 0 ? wsRadar : apiRadar

  const { data: coinDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['coin-detail', selectedCoin],
    queryFn: () => dashboardApi.coinDetail(selectedCoin!).then((r) => r.data),
    enabled: !!selectedCoin,
  })

  const showLevels  = hasFeature('show_levels')  || isAdmin
  const showML      = hasFeature('show_ml')       || isAdmin
  const showThesis  = hasFeature('show_thesis')   || isAdmin
  const showFactors = hasFeature('show_factors')  || isAdmin

  const activeSignals = radar.filter((item) =>
    item.tradeable &&
    (item.direction === 'LONG' || item.direction === 'SHORT')
  )

  const filtered = radar.filter((item) => {
    if (search && !item.coin.toLowerCase().includes(search.toLowerCase())) return false
    if (gradeFilter !== 'all' && item.grade !== gradeFilter) return false
    if (dirFilter !== 'all' && item.direction !== dirFilter) return false
    return true
  })

  const gradeOptions = [
    { value: 'all', label: 'All Grades' },
    { value: 'A+',  label: 'A+' },
    { value: 'A',   label: 'A' },
    { value: 'B',   label: 'B' },
    { value: 'C',   label: 'C' },
    { value: 'F',   label: 'F' },
  ]

  const dirOptions = [
    { value: 'all',   label: 'All Directions' },
    { value: 'LONG',  label: 'Long' },
    { value: 'SHORT', label: 'Short' },
  ]

  return (
    <div className="flex h-full">
      <div className={cn(
        'flex flex-1 flex-col overflow-hidden transition-all duration-300',
        selectedCoin ? 'md:mr-96' : ''
      )}>
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Signal Radar</h1>
              <p className="text-sm text-muted-foreground">
                {radar.length} coins · Real-time confluence analysis
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium text-foreground">Active Signals</p>
                <span className={cn(
                  'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                  activeSignals.length > 0
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {activeSignals.length}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {radar.length} coins monitored
              </span>
            </div>

            {activeSignals.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <Radio className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No active signals</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tradeable signals will appear here when detected
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {activeSignals.map((item) => (
                  <ActiveSignalCard
                    key={item.coin}
                    item={item}
                    showLevels={showLevels}
                    showML={showML}
                    showThesis={showThesis}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coin..."
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <SelectDropdown
              value={gradeFilter}
              onChange={setGradeFilter}
              options={gradeOptions}
            />
            <SelectDropdown
              value={dirFilter}
              onChange={setDirFilter}
              options={dirOptions}
            />
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="table-scroll">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide sticky-col">Coin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Direction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">24h</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Funding</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Regime</th>
                    {showML && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">ML</th>
                    )}
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={showML ? 9 : 8}>
                        <EmptyState
                          icon={Radio}
                          title="No signals found"
                          description="Try adjusting your filters or trigger a scan"
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, i) => (
                      <motion.tr
                        key={item.coin}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setSelectedCoin(
                          selectedCoin === item.coin ? null : item.coin
                        )}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedCoin === item.coin ? 'bg-muted/50' : 'hover:bg-muted/30',
                          item.direction === 'LONG'  && item.tradeable && 'border-l-2 border-l-emerald-500/30',
                          item.direction === 'SHORT' && item.tradeable && 'border-l-2 border-l-red-500/30',
                        )}
                      >
                        <td className="px-4 py-3 sticky-col">
                          <div className="flex items-center gap-2">
                            {item.tradeable && (
                              <div className={cn(
                                'h-1.5 w-1.5 rounded-full shrink-0',
                                item.direction === 'LONG' ? 'bg-emerald-500' : 'bg-red-500'
                              )} />
                            )}
                            <span className="font-mono font-medium text-foreground">{item.coin}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><GradeTag grade={item.grade} /></td>
                        <td className="px-4 py-3">
                          <div className={cn(
                            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
                            item.direction === 'LONG'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : item.direction === 'SHORT'
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-muted-foreground bg-muted'
                          )}>
                            {item.direction === 'LONG'  ? <TrendingUp className="h-3 w-3" />  : null}
                            {item.direction === 'SHORT' ? <TrendingDown className="h-3 w-3" /> : null}
                            {item.direction}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">{formatScore(item.score)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground">{formatPrice(item.price)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('font-mono text-xs', item.change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                            {formatPercent(item.change)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'font-mono text-xs',
                            Math.abs(item.funding) > 0.05 ? 'text-amber-500' : 'text-muted-foreground'
                          )}>
                            {formatFunding(item.funding / 100)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground truncate max-w-[100px] block">
                            {item.regime}
                          </span>
                        </td>
                        {showML && (
                          <td className="px-4 py-3">
                            {item.ml_probability !== null && item.ml_probability !== undefined ? (
                              <span className={cn(
                                'font-mono text-xs font-medium',
                                item.ml_probability >= 0.65 ? 'text-emerald-500' : 'text-red-500'
                              )}>
                                {(item.ml_probability * 100).toFixed(0)}%
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <ChevronRight className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            selectedCoin === item.coin && 'rotate-90'
                          )} />
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCoin && (
          <>
            <div
              className="fixed inset-0 z-30 md:hidden"
              onClick={() => setSelectedCoin(null)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed right-0 top-0 h-full w-full md:w-96 border-l border-border bg-card overflow-y-auto z-40"
            >
              <CoinDetailPanel
                coin={selectedCoin}
                data={coinDetail ?? null}
                loading={detailLoading}
                onClose={() => setSelectedCoin(null)}
                showLevels={showLevels}
                showML={showML}
                showThesis={showThesis}
                showFactors={showFactors}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function CoinDetailPanel({
  coin,
  data,
  loading,
  onClose,
  showLevels,
  showML,
  showThesis,
  showFactors,
}: {
  coin: string
  data: CoinDetail | null
  loading: boolean
  onClose: () => void
  showLevels: boolean
  showML: boolean
  showThesis: boolean
  showFactors: boolean
}) {
  const isLong  = data?.direction === 'LONG'
  const isShort = data?.direction === 'SHORT'

  const sortedFactors = data?.factors
    ? [...data.factors].sort((a, b) => {
        const ai = FACTOR_ORDER.indexOf(a.key)
        const bi = FACTOR_ORDER.indexOf(b.key)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
    : []

  const hasLevels = data?.signal?.entry && data.signal.entry > 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-semibold text-foreground">{coin}USDT</span>
          {data && <GradeTag grade={data.grade} />}
          {data && (
            <span className={cn(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
              isLong  ? 'text-emerald-500 bg-emerald-500/10' :
              isShort ? 'text-red-500 bg-red-500/10' :
              'text-muted-foreground bg-muted'
            )}>
              {isLong  ? <TrendingUp className="h-3 w-3" />  : null}
              {isShort ? <TrendingDown className="h-3 w-3" /> : null}
              {data.direction}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : !data ? (
        <EmptyState title="No data available" description="Run a scan to generate signal data" />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground">
                {formatPrice(data.market.price)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">24h Change</p>
              <p className={cn(
                'mt-1 font-mono text-sm font-medium',
                data.market.change_pos ? 'text-emerald-500' : 'text-red-500'
              )}>
                {formatPercent(data.market.change)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Funding</p>
              <p className={cn(
                'mt-1 font-mono text-sm font-medium',
                Math.abs(data.market.funding) > 0.05 ? 'text-amber-500' : 'text-foreground'
              )}>
                {formatFunding(data.market.funding / 100)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground">
                {formatScore(data.score)}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Context</p>
            <ContextRow label="Regime"  value={data.regime} />
            <ContextRow label="Session" value={data.session} />
            <ContextRow
              label="L/S Ratio"
              value={`${data.market.long_ratio.toFixed(1)}% / ${data.market.short_ratio.toFixed(1)}%`}
            />
            <ContextRow
              label="OI Change"
              value={`${data.market.oi_change >= 0 ? '+' : ''}${data.market.oi_change.toFixed(2)}%`}
              valueClass={data.market.oi_change >= 0 ? 'text-emerald-500' : 'text-red-500'}
            />
            {showML && data.ml_probability !== null && data.ml_probability !== undefined && (
              <ContextRow
                label="ML Probability"
                value={`${(data.ml_probability * 100).toFixed(1)}%`}
                valueClass={data.ml_probability >= 0.65 ? 'text-emerald-500' : 'text-red-500'}
                mono
              />
            )}
            {data.actual_rr > 0 && (
              <ContextRow label="R:R Ratio" value={`1:${data.actual_rr}`} mono />
            )}
          </div>

          {showLevels && hasLevels ? (
            <div className="rounded-md border border-border bg-background p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entry Levels</p>
              <div className="space-y-1.5">
                <LevelRow label="Entry"       value={data.signal.entry} color="text-blue-500" />
                <LevelRow
                  label="Stop Loss"
                  value={data.signal.sl}
                  color="text-red-500"
                  suffix={data.signal.sl_pct ? `${data.signal.sl_pct.toFixed(2)}%` : undefined}
                />
                <LevelRow
                  label="Take Profit"
                  value={data.signal.tp1}
                  color="text-emerald-500"
                  suffix={data.actual_rr ? `R:R 1:${data.actual_rr}` : undefined}
                />
              </div>
              <div className="mt-2 pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Risk Amount</span>
                  <span className="text-xs font-mono font-medium text-foreground">
                    {formatPrice(data.signal.risk_amt)}
                  </span>
                </div>
                {data.signal.leverage && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Leverage</span>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {data.signal.leverage}x
                    </span>
                  </div>
                )}
                {data.signal.stake && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Stake</span>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {formatPrice(data.signal.stake)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) :          showLevels && !hasLevels ? (
            <div className="rounded-md border border-border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                No entry levels yet — signal is building
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Entry levels require Pro plan</p>
            </div>
          )}

          {showThesis && data.thesis && (
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Thesis</p>
              <div className="space-y-1">
                {data.thesis.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} className="text-xs text-foreground leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {showFactors && sortedFactors.length > 0 && (
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Confluence Factors
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Market: <span className="font-mono text-foreground">{data.market_score}</span></span>
                  <span>Entry: <span className="font-mono text-foreground">{data.entry_score}</span></span>
                </div>
              </div>
              <div className="space-y-2">
                {sortedFactors.map((factor) => (
                  <div key={factor.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{factor.label}</span>
                      <span className="text-xs font-mono text-foreground">
                        {factor.earned}/{factor.max}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.pct}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          factor.pct >= 80 ? 'bg-emerald-500' :
                          factor.pct >= 50 ? 'bg-blue-500' :
                          factor.pct >= 30 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showFactors && sortedFactors.length === 0 && (
            <div className="rounded-md border border-border bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                No factor data — run a scan to populate
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContextRow({
  label,
  value,
  valueClass,
  mono = false,
}: {
  label: string
  value: string
  valueClass?: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-xs font-medium', mono && 'font-mono', valueClass ?? 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}