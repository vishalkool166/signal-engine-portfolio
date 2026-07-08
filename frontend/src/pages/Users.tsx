import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Users,
  ChevronRight,
  UserCheck,
  UserX,
} from 'lucide-react'
import { adminApi } from '@/lib/endpoints'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import SelectDropdown from '@/components/ui/SelectDropdown'
import SpotlightCard from '@/components/ui/SpotlightCard'
import {
  formatTimeAgo,
  formatDateTime,
  tierLabel,
  tierColor,
  truncate,
  cn,
} from '@/lib/utils'
import type { AdminUser, Tier, UserSession } from '@/types'
import { toast } from 'sonner'

const TIERS: Tier[] = ['free', 'pro', 'elite', 'admin']

const TIER_OPTIONS = [
  { value: 'all',   label: 'All Tiers' },
  { value: 'free',  label: 'Basic' },
  { value: 'pro',   label: 'Pro' },
  { value: 'elite', label: 'Elite' },
  { value: 'admin', label: 'Admin' },
]

export default function UsersPage() {
  const queryClient                             = useQueryClient()
  const [search, setSearch]                     = useState('')
  const [tierFilter, setTierFilter]             = useState<string>('all')
  const [selectedUser, setSelectedUser]         = useState<AdminUser | null>(null)
  const [page, setPage]                         = useState(0)
  const limit                                   = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', tierFilter, page],
    queryFn: () =>
      adminApi.users({
        limit,
        offset: page * limit,
        tier:   tierFilter !== 'all' ? tierFilter : undefined,
      }).then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: userDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-user', selectedUser?.id],
    queryFn: () =>
      adminApi.userById(selectedUser!.id).then((r) => r.data),
    enabled: !!selectedUser,
  })

  const updateTierMutation = useMutation({
    mutationFn: ({ id, tier }: { id: number; tier: string }) =>
      adminApi.updateTier(id, tier),
    onSuccess: () => {
      toast.success('Tier updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUser?.id] })
    },
    onError: () => toast.error('Failed to update tier'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminApi.deactivate(id),
    onSuccess: () => {
      toast.success('User deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUser?.id] })
    },
    onError: () => toast.error('Failed to deactivate user'),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: number) => adminApi.reactivate(id),
    onSuccess: () => {
      toast.success('User reactivated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUser?.id] })
    },
    onError: () => toast.error('Failed to reactivate user'),
  })

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => adminApi.revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Session revoked')
      queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUser?.id] })
    },
    onError: () => toast.error('Failed to revoke session'),
  })

  const revokeAllMutation = useMutation({
    mutationFn: (userId: number) => adminApi.revokeAllSessions(userId),
    onSuccess: () => {
      toast.success('All sessions revoked')
      queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUser?.id] })
    },
    onError: () => toast.error('Failed to revoke sessions'),
  })

  if (isLoading) return <PageSkeleton />

  const users: AdminUser[] = data?.users ?? []
  const total              = data?.total ?? 0

  const filtered = users.filter((u) =>
    search
      ? u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name ?? '').toLowerCase().includes(search.toLowerCase())
      : true
  )

  return (
    <div className="flex h-full">
      <div className={cn(
        'flex flex-1 flex-col overflow-hidden transition-all duration-300',
        selectedUser ? 'mr-96' : ''
      )}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Users</h1>
              <p className="text-sm text-muted-foreground">
                {total} total users
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or name..."
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
              value={tierFilter}
              onChange={(val) => {
                setTierFilter(val)
                setPage(0)
              }}
              options={TIER_OPTIONS}
            />
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {['User', 'Tier', 'Status', 'Provider', 'Last Seen', 'Joined', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={Users}
                        title="No users found"
                        description="Try adjusting your search or filters"
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedUser(
                        selectedUser?.id === user.id ? null : user
                      )}
                      className={cn(
                        'cursor-pointer transition-colors hover:bg-muted/50',
                        selectedUser?.id === user.id && 'bg-muted/50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                              {user.name ?? truncate(user.email, 24)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-medium capitalize', tierColor(user.tier))}>
                          {tierLabel(user.tier)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground capitalize">
                          {user.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(user.last_seen)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(user.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          selectedUser?.id === user.id && 'rotate-90'
                        )} />
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
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
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-96 border-l border-border bg-card overflow-y-auto z-40"
          >
            <UserDetailPanel
              user={selectedUser}
              detail={userDetail ?? null}
              loading={detailLoading}
              onClose={() => setSelectedUser(null)}
              onUpdateTier={(tier) =>
                updateTierMutation.mutate({ id: selectedUser.id, tier })
              }
              onDeactivate={() => deactivateMutation.mutate(selectedUser.id)}
              onReactivate={() => reactivateMutation.mutate(selectedUser.id)}
              onRevokeSession={(sid) => revokeSessionMutation.mutate(sid)}
              onRevokeAll={() => revokeAllMutation.mutate(selectedUser.id)}
              updating={updateTierMutation.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserDetailPanel({
  user,
  detail,
  loading,
  onClose,
  onUpdateTier,
  onDeactivate,
  onReactivate,
  onRevokeSession,
  onRevokeAll,
  updating,
}: {
  user: AdminUser
  detail: { user: AdminUser; subscription: unknown; sessions: UserSession[] } | null
  loading: boolean
  onClose: () => void
  onUpdateTier: (tier: string) => void
  onDeactivate: () => void
  onReactivate: () => void
  onRevokeSession: (sid: string) => void
  onRevokeAll: () => void
  updating: boolean
}) {
  const sessions: UserSession[] = detail?.sessions ?? []
  const currentUser             = detail?.user ?? user

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {user.name ?? user.email}
          </span>
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
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <SpotlightCard
            spotlightColor="default"
            className="rounded-md border border-border bg-background p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Profile
            </p>
            <InfoRow label="Email"     value={currentUser.email} mono />
            <InfoRow label="Provider"  value={currentUser.provider} />
            <InfoRow label="Joined"    value={formatDateTime(currentUser.created_at)} />
            <InfoRow label="Last Seen" value={formatTimeAgo(currentUser.last_seen)} />
            <InfoRow
              label="Status"
              value={
                <StatusBadge status={currentUser.is_active ? 'active' : 'inactive'} />
              }
            />
            {currentUser.is_admin && (
              <InfoRow
                label="Role"
                value={
                  <span className="text-xs font-medium text-emerald-500">Admin</span>
                }
              />
            )}
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="blue"
            className="rounded-md border border-border bg-background p-3 space-y-3"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tier Management
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Tier</span>
              <span className={cn('text-xs font-medium capitalize', tierColor(currentUser.tier))}>
                {tierLabel(currentUser.tier)}
              </span>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Change Tier</p>
              <div className="grid grid-cols-2 gap-1.5">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateTier(t)}
                    disabled={updating || currentUser.tier === t}
                    className={cn(
                      'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      currentUser.tier === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                  >
                    {tierLabel(t)}
                  </button>
                ))}
              </div>
            </div>
          </SpotlightCard>

          <div className="rounded-md border border-border bg-background p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Sessions ({sessions.length})
            </p>
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active sessions</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {s.device ?? 'Unknown'} · {s.browser ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.ip ?? '—'} · {formatTimeAgo(s.last_active)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRevokeSession(s.session_id)}
                      className="ml-2 shrink-0 text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
                {sessions.length > 1 && (
                  <button
                    onClick={onRevokeAll}
                    className="w-full rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Revoke All Sessions
                  </button>
                )}
              </div>
            )}
          </div>

          <SpotlightCard
            spotlightColor="red"
            className="rounded-md border border-destructive/20 bg-destructive/5 p-3 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Account Control
            </p>
            {currentUser.is_active ? (
              <button
                onClick={onDeactivate}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <UserX className="h-3.5 w-3.5" />
                Deactivate Account
              </button>
            ) : (
              <button
                onClick={onReactivate}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Reactivate Account
              </button>
            )}
          </SpotlightCard>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      {typeof value === 'string' ? (
        <span className={cn(
          'text-xs text-foreground text-right truncate',
          mono && 'font-mono'
        )}>
          {value}
        </span>
      ) : (
        value
      )}
    </div>
  )
}