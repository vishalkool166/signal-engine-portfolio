import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Shield,
  Key,
  Monitor,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { meApi } from '@/lib/endpoints'
import { useAuthStore } from '@/stores/authStore'
import EmptyState from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatTimeAgo, formatDateTime, cn } from '@/lib/utils'
import type { UserSession, ApiKey } from '@/types'
import { toast } from 'sonner'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, hasFeature } = useAuthStore()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  const { data: meData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => meApi.get().then((r) => r.data),
  })

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => meApi.revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Session revoked')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Failed to revoke session'),
  })

  const revokeAllMutation = useMutation({
    mutationFn: () => meApi.revokeAllSessions(),
    onSuccess: () => {
      toast.success('All other sessions revoked')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Failed to revoke sessions'),
  })

  const createKeyMutation = useMutation({
    mutationFn: (name: string) => meApi.createApiKey(name),
    onSuccess: (data) => {
      setCreatedKey(data.data.key)
      setNewKeyName('')
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('API key created')
    },
    onError: () => toast.error('Failed to create API key'),
  })

  const deleteKeyMutation = useMutation({
    mutationFn: (id: number) => meApi.deleteApiKey(id),
    onSuccess: () => {
      toast.success('API key revoked')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Failed to revoke key'),
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  if (isLoading) return <PageSkeleton />

  const sessions: UserSession[] = meData?.sessions ?? []
  const apiKeys: ApiKey[] = meData?.api_keys ?? []
  const canUseApiKeys = hasFeature('api_key_access')

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <Section title="Appearance" icon={Monitor}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose your preferred color scheme
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  theme === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Authentication" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Google OAuth</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user?.email}
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-500">Connected</span>
          </div>

          <div className="rounded-md bg-muted/50 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              Authentication is managed via Google OAuth.
              Your account is secured by your Google account credentials.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Active Sessions" icon={Monitor}>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active sessions</p>
          ) : (
            <>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {s.device ?? 'Unknown Device'} · {s.browser ?? 'Unknown Browser'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.ip ?? '—'} · Last active {formatTimeAgo(s.last_active)}
                      </p>
                    </div>
                    <button
                      onClick={() => revokeSessionMutation.mutate(s.session_id)}
                      disabled={revokeSessionMutation.isPending}
                      className="ml-3 shrink-0 text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>

              {sessions.length > 1 && (
                <button
                  onClick={() => revokeAllMutation.mutate()}
                  disabled={revokeAllMutation.isPending}
                  className="w-full rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {revokeAllMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Revoking...
                    </span>
                  ) : (
                    'Revoke All Other Sessions'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </Section>

      <Section title="API Keys" icon={Key}>
        {!canUseApiKeys ? (
          <div className="rounded-md border border-border bg-muted/50 p-4 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              API keys require Elite plan
            </p>
            <p className="text-xs text-muted-foreground">
              Upgrade to Elite to generate API keys for programmatic access
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              View Plans
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {createdKey && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 space-y-2"
              >
                <p className="text-xs font-medium text-emerald-500">
                  API key created — copy it now, it won't be shown again
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1.5 text-xs font-mono text-foreground truncate">
                    {createdKey}
                  </code>
                  <button
                    onClick={() => handleCopy(createdKey)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied
                      ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                      : <Copy className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
                <button
                  onClick={() => setCreatedKey(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {apiKeys.length > 0 && (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {key.name}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {key.prefix}...
                        {key.last_used && (
                          <span className="ml-2 not-italic">
                            Last used {formatTimeAgo(key.last_used)}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteKeyMutation.mutate(key.id)}
                      disabled={deleteKeyMutation.isPending}
                      className="ml-3 shrink-0 text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}

            {apiKeys.length < 3 && (
              <div className="flex items-center gap-2">
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKeyName.trim()) {
                      createKeyMutation.mutate(newKeyName.trim())
                    }
                  }}
                  placeholder="Key name (e.g. Production)"
                  className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={() => {
                    if (newKeyName.trim()) {
                      createKeyMutation.mutate(newKeyName.trim())
                    }
                  }}
                  disabled={!newKeyName.trim() || createKeyMutation.isPending}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createKeyMutation.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Maximum 3 active API keys. Keys start with <code className="font-mono">se_</code>
            </p>
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}