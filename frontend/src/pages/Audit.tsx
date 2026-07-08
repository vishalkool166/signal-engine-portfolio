import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Search,
  X,
  ScrollText,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { adminApi } from '@/lib/endpoints'
import EmptyState from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatDateTime, formatTimeAgo, cn } from '@/lib/utils'
import type { AuditEntry } from '@/types'

const ACTION_COLORS: Record<string, string> = {
  dashboard_login:           'text-blue-500 bg-blue-500/10 border-blue-500/20',
  oauth_login:               'text-blue-500 bg-blue-500/10 border-blue-500/20',
  mode_toggle:               'text-amber-500 bg-amber-500/10 border-amber-500/20',
  docker_purge:              'text-red-500 bg-red-500/10 border-red-500/20',
  coin_add:                  'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  coin_delete:               'text-red-500 bg-red-500/10 border-red-500/20',
  coin_toggle:               'text-amber-500 bg-amber-500/10 border-amber-500/20',
  admin_tier_update:         'text-purple-500 bg-purple-500/10 border-purple-500/20',
  admin_deactivate_user:     'text-red-500 bg-red-500/10 border-red-500/20',
  admin_reactivate_user:     'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  admin_revoke_session:      'text-amber-500 bg-amber-500/10 border-amber-500/20',
  admin_revoke_all_sessions: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  password_reset:            'text-amber-500 bg-amber-500/10 border-amber-500/20',
  recovery_codes_generated:  'text-purple-500 bg-purple-500/10 border-purple-500/20',
}

export default function Audit() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const limit = 50

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-log', page],
    queryFn: () =>
      adminApi.audit({ limit, offset: page * limit }).then((r) => r.data),
    refetchInterval: 30000,
  })

  const logs: AuditEntry[] = data?.logs ?? []
  const total = data?.total ?? 0

  const filtered = logs.filter((entry) => {
    if (statusFilter === 'success' && !entry.success) return false
    if (statusFilter === 'failed' && entry.success) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        entry.action.toLowerCase().includes(q) ||
        (entry.detail ?? '').toLowerCase().includes(q) ||
        (entry.source ?? '').toLowerCase().includes(q) ||
        (entry.ip ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  if (isLoading) return <PageSkeleton />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            {total} total events
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, details, IP..."
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
        >
          <option value="all">All Events</option>
          <option value="success">Success Only</option>
          <option value="failed">Failed Only</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit events found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((entry, i) => {
              const actionStyle = ACTION_COLORS[entry.action] ??
                'text-muted-foreground bg-muted border-border'

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className="flex items-start gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {entry.success ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        'inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium font-mono',
                        actionStyle
                      )}>
                        {entry.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        via {entry.source}
                      </span>
                      {entry.ip && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {entry.ip}
                        </span>
                      )}
                    </div>

                    {entry.detail && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.detail}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(entry.timestamp)}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">
                      {formatDateTime(entry.timestamp)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * limit >= total}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}