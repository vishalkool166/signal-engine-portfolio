import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  Target,
  Search,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useState } from 'react'
import { dashboardApi, performanceApi, signalsApi } from '@/lib/endpoints'
import { useAuthStore } from '@/stores/authStore'
import KPICard from '@/components/ui/KPICard'
import GradeTag from '@/components/ui/GradeTag'
import SpotlightCard from '@/components/ui/SpotlightCard'
import SelectDropdown from '@/components/ui/SelectDropdown'
import EmptyState from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import {
  formatCurrency,
  formatPercent,
  formatPrice,
  formatDate,
  cn,
} from '@/lib/utils'
import type { Signal } from '@/types'

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

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

const GRADE_OPTIONS = [
  { value: 'all', label: 'All Grades' },
  { value: 'A+',  label: 'A+' },
  { value: 'A',   label: 'A' },
  { value: 'B',   label: 'B' },
]

const OUTCOME_OPTIONS = [
  { value: 'all',     label: 'All Results' },
  { value: 'win',     label: 'Wins' },
  { value: 'loss',    label: 'Losses' },
  { value: 'pending', label: 'Pending' },
]

const LIMIT_OPTIONS = [
  { value: '50',  label: 'Last 50' },
  { value: '100', label: 'Last 100' },
  { value: '200', label: 'Last 200' },
  { value: '500', label: 'All' },
]

export default function Performance() {
  const { hasFeature, isAdmin }             = useAuthStore()
  const [historySearch, setHistorySearch]   = useState('')
  const [gradeFilter, setGradeFilter]       = useState('all')
  const [outcomeFilter, setOutcomeFilter]   = useState('all')
  const [historyLimit, setHistoryLimit]     = useState('50')

  const { data: perf, isLoading: perfLoading } = useQuery({
    queryKey: ['performance'],
    queryFn: () => dashboardApi.performance().then((r) => r.data),
    refetchInterval: 60000,
  })

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: ['history', historyLimit],
    queryFn: () => dashboardApi.history(Number(historyLimit)).then((r) => r.data),
    refetchInterval: 60000,
  })

  const { data: allSignals, isLoading: allLoading } = useQuery({
    queryKey: ['signals-all', gradeFilter, outcomeFilter],
    queryFn: () => signalsApi.list({
      limit:   200,
      grade:   gradeFilter   !== 'all' ? gradeFilter   : undefined,
      outcome: outcomeFilter !== 'all' ? outcomeFilter : undefined,
    }).then((r) => r.data),
    refetchInterval: 60000,
  })

  const { data: factors } = useQuery({
    queryKey: ['factor-analysis'],
    queryFn: () => performanceApi.factorAnalysis().then((r) => r.data),
    enabled: hasFeature('show_factors') || isAdmin,
  })

  if (perfLoading) return <PageSkeleton />

  if (!perf || (perf as unknown as { _locked: boolean })._locked) {
    return (
      <div className="p-6">
        <EmptyState
          icon={BarChart3}
          title="Performance data requires Pro plan"
          description="Upgrade to Pro to access full performance analytics"
          action={
            <a href="/pricing" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              View Plans
            </a>
          }
        />
      </div>
    )
  }

  const isNegative  = perf.total_pnl < 0
  const curveColor  = isNegative ? 'hsl(var(--signal-red))' : 'hsl(var(--signal-green))'
  const gradientId  = isNegative ? 'equityGradientRed' : 'equityGradientGreen'

  const gradeData = [
    { grade: 'A+', ...perf.aplus },
    { grade: 'A',  ...perf.a },
    { grade: 'B',  ...perf.b },
  ]

  const winRatePieData = [
    { name: 'Wins',   value: perf.wins,   fill: 'hsl(var(--signal-green))' },
    { name: 'Losses', value: perf.losses, fill: 'hsl(var(--muted))' },
  ]

  const sortedFactors = factors?.table
    ? [...factors.table].sort((a, b) => {
        const ai = FACTOR_ORDER.indexOf(a.factor)
        const bi = FACTOR_ORDER.indexOf(b.factor)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
    : []

  const displaySignals = (allSignals ?? history ?? []).filter((s: Signal) => {
    if (historySearch) {
      return s.coin.toLowerCase().includes(historySearch.toLowerCase())
    }
    return true
  })

  const historyColumns: Column<Signal>[] = [
    {
      key:  'coin',
      header: 'Coin',
      cell: (row: Signal) => (
        <span className="font-mono font-medium text-foreground">{row.coin}</span>
      ),
    },
    {
      key:  'grade',
      header: 'Grade',
      cell: (row: Signal) => <GradeTag grade={row.grade} />,
    },
    {
      key:  'direction',
      header: 'Dir',
      cell: (row: Signal) => (
        <span className={cn(
          'text-xs font-medium',
          row.direction === 'LONG' ? 'text-emerald-500' : 'text-red-500'
        )}>
          {row.direction}
        </span>
      ),
    },
    {
      key:  'entry',
      header: 'Entry',
      cell: (row: Signal) => (
        <span className="font-mono text-xs text-foreground">{formatPrice(row.entry_price ?? (row as any).entry)}</span>
      ),
    },
    {
      key:  'exit',
      header: 'Exit',
      cell: (row: Signal) => (
        <span className="font-mono text-xs text-foreground">{formatPrice(row.exit_price)}</span>
      ),
    },
    {
      key:  'pnl',
      header: 'PnL',
      cell: (row: Signal) => (
        <span className={cn(
          'font-mono text-xs font-medium',
          (row.pnl ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
        )}>
          {formatCurrency(row.pnl)}
        </span>
      ),
    },
    {
      key:  'outcome',
      header: 'Result',
      cell: (row: Signal) => (
        <span className={cn(
          'text-xs font-medium capitalize',
          row.outcome === 'win' ? 'text-emerald-500' : 'text-red-500'
        )}>
          {row.outcome}
        </span>
      ),
    },
    {
      key:  'date',
      header: 'Date',
      cell: (row: Signal) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.timestamp)}</span>
      ),
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground">
          {perf.closed} closed signals · All-time analytics
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <KPICard
          title="Win Rate"
          value={formatPercent(perf.win_rate, false)}
          icon={Target}
          accent="blue"
          description={`${perf.wins}W / ${perf.losses}L`}
        />
        <KPICard
          title="Total PnL"
          value={formatCurrency(perf.total_pnl)}
          icon={perf.total_pnl_pos ? TrendingUp : TrendingDown}
          accent={perf.total_pnl_pos ? 'green' : 'red'}
          description={`${perf.closed} closed trades`}
        />
        <KPICard
          title="Profit Factor"
          value={perf.profit_factor.toFixed(2)}
          icon={BarChart3}
          accent="purple"
          description={`Gross P: ${formatCurrency(perf.gross_profit, 0)}`}
        />
        <KPICard
          title="Max Drawdown"
          value={formatPercent(perf.max_drawdown, false)}
          icon={AlertTriangle}
          accent={perf.max_drawdown > 20 ? 'red' : perf.max_drawdown > 10 ? 'amber' : 'default'}
          description={`Peak: ${formatCurrency(perf.peak_equity)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Equity Curve</p>
            {isNegative && (
              <span className="text-xs text-red-500 font-medium">Negative</span>
            )}
          </div>
          <div className="p-4 h-56 md:h-64">
            {perf.equity_curve.length === 0 ? (
              <EmptyState title="No equity data yet" description="Close some trades to see your equity curve" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perf.equity_curve}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={curveColor} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={curveColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Equity']}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke={curveColor}
                    strokeWidth={1.5}
                    fill={`url(#${gradientId})`}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">Win / Loss</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 h-56 md:h-64">
            {perf.closed === 0 ? (
              <EmptyState title="No closed trades" description="Close trades to see breakdown" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={winRatePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {winRatePieData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-2">
                  <p className="text-2xl md:text-3xl font-semibold font-mono text-foreground">
                    {formatPercent(perf.win_rate, false)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {perf.wins}W / {perf.losses}L
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Wins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <span className="text-xs text-muted-foreground">Losses</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Performance by Grade</p>
        </div>
        <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 divide-border">
          {gradeData.map((g) => (
            <SpotlightCard
              key={g.grade}
              spotlightColor={
                g.win_rate >= 60 ? 'green' :
                g.win_rate >= 45 ? 'amber' : 'red'
              }
              className="p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <GradeTag grade={g.grade} size="lg" />
                <span className="text-xs text-muted-foreground">{g.total} trades</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                  <span className="text-xs font-mono font-medium text-foreground">
                    {formatPercent(g.win_rate, false)}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.win_rate}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      g.win_rate >= 60 ? 'bg-emerald-500' :
                      g.win_rate >= 45 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">PnL</span>
                  <span className={cn(
                    'text-xs font-mono font-medium',
                    g.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {formatCurrency(g.pnl)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Wins</span>
                  <span className="text-xs font-mono text-foreground">{g.wins}/{g.total}</span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {(hasFeature('show_factors') || isAdmin) && factors && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Factor Analysis</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {factors.total} trades · {factors.overall_wr}% WR
              </span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded border',
                factors.reliable
                  ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
              )}>
                {factors.reliability}
              </span>
            </div>
          </div>
          {factors.total === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No factor data yet"
              description="Factor analysis requires closed trades with factor scores"
            />
          ) : (
            <div className="table-scroll">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="border-b border-border">
                  <tr>
                    {['Factor', 'Present WR', 'Absent WR', 'Edge', 'Observation'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedFactors.map((row) => (
                    <tr key={row.factor} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-foreground capitalize">
                        {row.factor.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {row.win_rate_present !== null ? formatPercent(row.win_rate_present, false) : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {row.win_rate_absent !== null ? formatPercent(row.win_rate_absent, false) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {row.edge !== null ? (
                          <span className={cn(
                            'font-mono text-xs font-medium',
                            row.edge > 10 ? 'text-emerald-500' :
                            row.edge > 0  ? 'text-blue-500' : 'text-red-500'
                          )}>
                            {row.edge > 0 ? '+' : ''}{row.edge.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.observation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-foreground">Signal History</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search coin..."
                className="h-8 w-32 rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            <SelectDropdown
              value={gradeFilter}
              onChange={setGradeFilter}
              options={GRADE_OPTIONS}
              className="w-32"
            />
            <SelectDropdown
              value={outcomeFilter}
              onChange={setOutcomeFilter}
              options={OUTCOME_OPTIONS}
              className="w-32"
            />
            <SelectDropdown
              value={historyLimit}
              onChange={setHistoryLimit}
              options={LIMIT_OPTIONS}
              className="w-28"
            />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-border">
              <tr>
                {historyColumns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide',
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {histLoading || allLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {historyColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 w-full max-w-[100px] rounded shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !displaySignals?.length ? (
                <tr>
                  <td colSpan={historyColumns.length}>
                    <EmptyState
                      icon={BarChart3}
                      title="No signals found"
                      description="Try adjusting your filters"
                    />
                  </td>
                </tr>
              ) : (
                displaySignals.map((row: Signal) => (
                  <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                    {historyColumns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3', col.className)}>
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {displaySignals && displaySignals.length > 0 && (
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {displaySignals.length} signals
            </p>
            {Number(historyLimit) < 500 && (
              <button
                onClick={() => setHistoryLimit(
                  String(Math.min(Number(historyLimit) + 100, 500))
                )}
                className="text-xs text-primary hover:underline"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}