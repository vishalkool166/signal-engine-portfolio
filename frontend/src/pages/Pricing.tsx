import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, X, Zap } from 'lucide-react'
import { pricingApi } from '@/lib/endpoints'
import { useAuthStore } from '@/stores/authStore'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { cn, tierLabel, tierColor } from '@/lib/utils'
import { useState } from 'react'

const COMPARISON_ROWS = [
  { feature: 'Signal delivery',       free: '30 min delay',  pro: 'Live',          elite: 'Live' },
  { feature: 'Signals per day',       free: '3',             pro: 'Unlimited',     elite: 'Unlimited' },
  { feature: 'Grade (A+/A/B)',        free: true,            pro: true,            elite: true },
  { feature: 'Entry / SL / TP',       free: false,           pro: true,            elite: true },
  { feature: 'Live positions',        free: false,           pro: true,            elite: true },
  { feature: 'Performance history',   free: '3 signals',     pro: 'Full',          elite: 'Full' },
  { feature: 'Signal thesis',         free: false,           pro: false,           elite: true },
  { feature: 'Confluence factors',    free: false,           pro: false,           elite: true },
  { feature: 'ML probability',        free: false,           pro: false,           elite: true },
  { feature: 'Backtest access',       free: false,           pro: false,           elite: true },
  { feature: 'API key access',        free: false,           pro: false,           elite: true },
  { feature: 'Coins monitored',       free: '5',             pro: 'All',           elite: 'All' },
  { feature: 'Support',               free: 'None',          pro: 'Email',         elite: 'Priority' },
]

const FAQ = [
  {
    q: 'What is a signal?',
    a: 'A signal is a trading opportunity identified by our engine. It includes the coin, direction (LONG/SHORT), grade (A+/A/B), and for paid tiers — entry price, stop loss, and take profit levels.',
  },
  {
    q: 'How is the grade calculated?',
    a: 'Grades are based on a confluence score out of 100. A+ is 85+, A is 68+, B is 52+. The score combines 16 factors including market structure, liquidity sweeps, BTC alignment, session timing, and more.',
  },
  {
    q: 'What is the signal delay on the free plan?',
    a: 'Free plan signals are delayed by 30 minutes. Pro and Elite receive signals instantly as they are generated.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your profile page. You keep access until the end of your billing period.',
  },
  {
    q: 'What exchanges are supported?',
    a: 'Signals are generated for Binance Futures (USDT perpetuals). The engine monitors multiple coins across multiple timeframes 24/7.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Signal Engine provides automated technical analysis signals for educational purposes only. Always do your own research.',
  },
]

export default function Pricing() {
  const { tier: currentTier } = useAuthStore()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => pricingApi.get().then((r) => r.data),
  })

  if (isLoading) return <PageSkeleton />

  const plans = [
    {
      id: 'free',
      name: 'Basic',
      monthly: 0,
      annual: 0,
      description: 'Delayed signals to get started',
      features: [
        'Signals delayed 30 minutes',
        '3 signals per day',
        'Grade visibility (A+/A/B)',
        '5 coins monitored',
        'Signal universe view',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 29,
      annual: 23,
      description: 'Live signals with full entry levels',
      features: [
        'Live signals — zero delay',
        'Unlimited signals per day',
        'Entry / SL / TP levels',
        'Live positions view',
        'Full performance history',
        'All coins monitored',
      ],
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      monthly: 79,
      annual: 63,
      description: 'Everything plus deep factor analysis',
      features: [
        'Everything in Pro',
        'Signal thesis explanation',
        'Confluence factor breakdown',
        'ML probability score',
        'Backtest access',
        'API key access (3 keys)',
      ],
      popular: false,
    },
  ]

  return (
    <div className="p-6 space-y-10 max-w-5xl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Simple, transparent pricing
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits your trading style
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 rounded-md border border-border p-1">
          {(['monthly', 'annual'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={cn(
                'rounded px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                billing === b
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {b}
              {b === 'annual' && (
                <span className="ml-1.5 text-emerald-500">-20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const price = billing === 'annual' ? plan.annual : plan.monthly
          const isCurrent = currentTier === plan.id
          const isPopular = plan.popular

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                'relative rounded-lg border bg-card p-6 space-y-5',
                isPopular
                  ? 'border-primary shadow-sm'
                  : 'border-border'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Zap className="h-3 w-3" />
                    Popular
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {plan.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                {price === 0 ? (
                  <span className="text-3xl font-bold font-mono text-foreground">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold font-mono text-foreground">
                      ${price}
                    </span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                    {billing === 'annual' && (
                      <span className="text-xs text-muted-foreground">
                        billed annually
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-xs text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled
                className={cn(
                  'w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                  isCurrent
                    ? 'border border-border bg-muted text-muted-foreground cursor-default'
                    : isPopular
                    ? 'bg-primary text-primary-foreground opacity-60 cursor-not-allowed'
                    : 'border border-border bg-background text-foreground opacity-60 cursor-not-allowed'
                )}
              >
                {isCurrent ? 'Current Plan' : 'Coming Soon'}
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center">
        <p className="text-sm font-medium text-amber-500">
          Stripe integration coming soon
        </p>
        <p className="text-xs text-amber-500/70 mt-1">
          Contact admin to upgrade your plan manually in the meantime.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Compare Plans
        </h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-1/2">
                  Feature
                </th>
                {['Basic', 'Pro', 'Elite'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-foreground">
                    {row.feature}
                  </td>
                  {[row.free, row.pro, row.elite].map((val, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="text-xs text-foreground">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.q}
                </span>
                <span className={cn(
                  'text-muted-foreground transition-transform duration-200',
                  openFaq === i && 'rotate-180'
                )}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}