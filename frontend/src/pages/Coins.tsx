import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  X,
  Coins,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { coinsApi } from '@/lib/endpoints'
import GradeTag from '@/components/ui/GradeTag'
import EmptyState from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import {
  formatPrice,
  formatPercent,
  formatFunding,
  formatTimeAgo,
  cn,
} from '@/lib/utils'
import type { CoinConfig } from '@/types'
import { toast } from 'sonner'

export default function CoinsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newCoin, setNewCoin] = useState('')
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<{
    valid: boolean
    reason?: string
    coin?: string
  } | null>(null)

  const { data: coins, isLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: () => coinsApi.list().then((r) => r.data),
    refetchInterval: 30000,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ coin, enabled }: { coin: string; enabled: boolean }) =>
      coinsApi.toggle(coin, enabled),
    onSuccess: (_, { coin, enabled }) => {
      toast.success(`${coin} ${enabled ? 'enabled' : 'disabled'}`)
      queryClient.invalidateQueries({ queryKey: ['coins'] })
    },
    onError: () => toast.error('Failed to update coin'),
  })

  const removeMutation = useMutation({
    mutationFn: (coin: string) => coinsApi.remove(coin),
    onSuccess: (_, coin) => {
      toast.success(`${coin} removed from universe`)
      queryClient.invalidateQueries({ queryKey: ['coins'] })
    },
    onError: () => toast.error('Failed to remove coin'),
  })

  const addMutation = useMutation({
    mutationFn: (coin: string) => coinsApi.add(coin),
    onSuccess: (_, coin) => {
      toast.success(`${coin} added — backfill started`)
      queryClient.invalidateQueries({ queryKey: ['coins'] })
      setAddOpen(false)
      setNewCoin('')
      setValidation(null)
    },
    onError: () => toast.error('Failed to add coin'),
  })

  const handleValidate = async () => {
    if (!newCoin.trim()) return
    setValidating(true)
    setValidation(null)
    try {
      const res = await coinsApi.validate(newCoin.trim().toUpperCase())
      setValidation(res.data)
    } catch {
      setValidation({ valid: false, reason: 'Validation failed' })
    } finally {
      setValidating(false)
    }
  }

  const handleAdd = () => {
    if (!validation?.valid) return
    addMutation.mutate(newCoin.trim().toUpperCase())
  }

  if (isLoading) return <PageSkeleton />

  const allCoins: CoinConfig[] = coins ?? []
  const filtered = allCoins.filter((c) =>
    search ? c.coin.toLowerCase().includes(search.toLowerCase()) : true
  )
  const enabled = allCoins.filter((c) => c.enabled).length
  const disabled = allCoins.filter((c) => !c.enabled).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Coin Universe</h1>
          <p className="text-sm text-muted-foreground">
            {enabled} active · {disabled} disabled · {allCoins.length} total
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Coin
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coins..."
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

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              {['Coin', 'Status', 'Grade', 'Price', '24h', 'Funding', 'Source', 'Added', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    icon={Coins}
                    title="No coins found"
                    description="Add coins to start monitoring them"
                  />
                </td>
              </tr>
            ) : (
              filtered.map((coin, i) => (
                <motion.tr
                  key={coin.coin}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-foreground">
                      {coin.coin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium',
                      coin.enabled ? 'text-emerald-500' : 'text-muted-foreground'
                    )}>
                      <span className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        coin.enabled ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )} />
                      {coin.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {coin.has_signal
                      ? <GradeTag grade={coin.grade} />
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-foreground">
                      {coin.price ? formatPrice(coin.price) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'font-mono text-xs',
                      coin.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {coin.price ? formatPercent(coin.change) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'font-mono text-xs',
                      Math.abs(coin.funding) > 0.05
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    )}>
                      {coin.price ? formatFunding(coin.funding / 100) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground capitalize">
                      {coin.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(coin.added_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleMutation.mutate({
                          coin: coin.coin,
                          enabled: !coin.enabled,
                        })}
                        disabled={toggleMutation.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
                        title={coin.enabled ? 'Disable' : 'Enable'}
                      >
                        {coin.enabled
                          ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                          : <ToggleLeft className="h-4 w-4" />
                        }
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${coin.coin} from universe?`)) {
                            removeMutation.mutate(coin.coin)
                          }
                        }}
                        disabled={removeMutation.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => {
                setAddOpen(false)
                setNewCoin('')
                setValidation(null)
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
            >
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">Add Coin</p>
                  <button
                    onClick={() => {
                      setAddOpen(false)
                      setNewCoin('')
                      setValidation(null)
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Symbol
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={newCoin}
                        onChange={(e) => {
                          setNewCoin(e.target.value.toUpperCase())
                          setValidation(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                        placeholder="BTC"
                        className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={handleValidate}
                        disabled={!newCoin.trim() || validating}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validating ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Validate'
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {validation && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-3 py-2.5',
                          validation.valid
                            ? 'border-emerald-500/20 bg-emerald-500/10'
                            : 'border-red-500/20 bg-red-500/10'
                        )}
                      >
                        {validation.valid ? (
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                        )}
                        <p className={cn(
                          'text-xs',
                          validation.valid ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {validation.valid
                            ? `${validation.coin}/USDT found on Binance Futures`
                            : validation.reason
                          }
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="rounded-md bg-muted/50 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      Adding a coin triggers a historical data backfill.
                      This may take a few minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border px-5 py-4">
                  <button
                    onClick={() => {
                      setAddOpen(false)
                      setNewCoin('')
                      setValidation(null)
                    }}
                    className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!validation?.valid || addMutation.isPending}
                    className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      'Add + Backfill'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}