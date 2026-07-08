import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  ExternalLink,
  Crown,
} from 'lucide-react'
import { meApi } from '@/lib/endpoints'
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/ui/StatusBadge'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import {
  formatDateTime,
  formatTimeAgo,
  tierLabel,
  tierColor,
  cn,
} from '@/lib/utils'

const TIER_FEATURES_DISPLAY = {
  free: [
    { label: 'Signal delay', value: '30 minutes', available: false },
    { label: 'Signals per day', value: '3', available: true },
    { label: 'Entry / SL / TP levels', value: 'Not included', available: false },
    { label: 'Live positions', value: 'Not included', available: false },
    { label: 'Performance history', value: 'Not included', available: false },
    { label: 'Coins monitored', value: '5', available: true },
  ],
  pro: [
    { label: 'Signal delay', value: 'Live — zero delay', available: true },
    { label: 'Signals per day', value: 'Unlimited', available: true },
    { label: 'Entry / SL / TP levels', value: 'Included', available: true },
    { label: 'Live positions', value: 'Included', available: true },
    { label: 'Performance history', value: 'Full access', available: true },
    { label: 'Coins monitored', value: 'All coins', available: true },
  ],
  elite: [
    { label: 'Signal delay', value: 'Live — zero delay', available: true },
    { label: 'Signals per day', value: 'Unlimited', available: true },
    { label: 'Entry / SL / TP levels', value: 'Included', available: true },
    { label: 'Confluence factors', value: 'Included', available: true },
    { label: 'ML probability score', value: 'Included', available: true },
    { label: 'API key access', value: 'Up to 3 keys', available: true },
    { label: 'Backtest access', value: 'Included', available: true },
  ],
  admin: [
    { label: 'Signal delay', value: 'Live — zero delay', available: true },
    { label: 'Signals per day', value: 'Unlimited', available: true },
    { label: 'Full system access', value: 'All features', available: true },
    { label: 'User management', value: 'Full control', available: true },
    { label: 'System monitor', value: 'Included', available: true },
    { label: 'API key access', value: 'Unlimited', available: true },
  ],
}

export default function Profile() {
  const { user, tier, isAdmin } = useAuthStore()

  const { data: meData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => meApi.get().then((r) => r.data),
  })

  if (isLoading) return <PageSkeleton />

  const features = TIER_FEATURES_DISPLAY[tier] ?? TIER_FEATURES_DISPLAY.free
  const subscription = meData?.subscription

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details and subscription
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card overflow-hidden"
      >
        <div className="border-b border-border px-4 py-3 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Identity</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground truncate">
                {meData?.name ?? user?.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-xs font-medium capitalize',
                  tierColor(tier)
                )}>
                  {tierLabel(tier)}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <InfoRow
              icon={Mail}
              label="Email"
              value={user?.email ?? '—'}
              mono
            />
            <InfoRow
              icon={Shield}
              label="Provider"
              value={meData?.provider ?? 'Google'}
            />
            <InfoRow
              icon={Calendar}
              label="Member since"
              value={formatDateTime(meData?.created_at)}
            />
            <InfoRow
              icon={Clock}
              label="Last seen"
              value={formatTimeAgo(meData?.last_seen)}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-lg border border-border bg-card overflow-hidden"
      >
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Subscription</p>
          </div>
          <StatusBadge status={tier} />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {tierLabel(tier)} Plan
              </p>
              {subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renews {formatDateTime(subscription.current_period_end)}
                </p>
              )}
            </div>
            {tier !== 'admin' && tier !== 'elite' && (
              <a
                href="/pricing"
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Upgrade
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your Plan Includes
            </p>
            <div className="space-y-1.5">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      feature.available ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    )} />
                    <span className={cn(
                      'text-xs',
                      feature.available
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}>
                      {feature.label}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    feature.available
                      ? 'text-foreground'
                      : 'text-muted-foreground/50'
                  )}>
                    {feature.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {tier === 'free' && (
            <div className="rounded-md border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro for live signals with entry levels, or Elite for
                full confluence analysis and API access.
              </p>
              <a
                href="/pricing"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Compare plans
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
            <p className="text-xs text-amber-500 font-medium">
              Stripe integration coming soon
            </p>
            <p className="text-xs text-amber-500/70 mt-0.5">
              Contact admin to upgrade your plan manually.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex flex-1 items-center justify-between min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span className={cn(
          'text-xs text-foreground text-right truncate ml-2',
          mono && 'font-mono'
        )}>
          {value}
        </span>
      </div>
    </div>
  )
}