import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import SpotlightCard from '@/components/ui/SpotlightCard'

interface KPICardProps {
  title: string
  value: string
  change?: string
  changePositive?: boolean
  icon?: LucideIcon
  description?: string
  loading?: boolean
  accent?: 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'default'
  className?: string
}

const accentClasses = {
  green:   'text-emerald-500',
  red:     'text-red-500',
  blue:    'text-blue-500',
  amber:   'text-amber-500',
  purple:  'text-purple-500',
  default: 'text-foreground',
}

const iconBgClasses = {
  green:   'bg-emerald-500/10',
  red:     'bg-red-500/10',
  blue:    'bg-blue-500/10',
  amber:   'bg-amber-500/10',
  purple:  'bg-purple-500/10',
  default: 'bg-muted',
}

const spotlightMap = {
  green:   'green',
  red:     'red',
  blue:    'blue',
  amber:   'amber',
  purple:  'purple',
  default: 'default',
} as const

function extractNumber(value: string): number | null {
  if (!value || value === '—') return null
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function useCountUp(targetValue: string, duration: number = 1000) {
  const [displayed, setDisplayed] = useState(targetValue)
  const prevValue = useRef(targetValue)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)

  useEffect(() => {
    if (targetValue === prevValue.current) return

    const prevNum = extractNumber(prevValue.current)
    const targetNum = extractNumber(targetValue)

    prevValue.current = targetValue

    if (prevNum === null || targetNum === null) {
      setDisplayed(targetValue)
      return
    }

    if (animRef.current) animRef.current.stop()

    const searchIndex = targetValue.search(/[0-9]/)
    const prefix = searchIndex >= 0 ? targetValue.slice(0, searchIndex) : ''
    const matchResult = targetValue.match(/[0-9.,]+/)
    const matchLength = matchResult?.[0]?.length ?? 0
    const suffix = searchIndex >= 0 ? targetValue.slice(searchIndex + matchLength) : ''
    const decimals = (targetValue.match(/\.(\d+)/) ?? [])[1]?.length ?? 0

    animRef.current = animate(prevNum, targetNum, {
      duration: duration / 1000,
      ease: 'easeOut',
      onUpdate: (latest) => {
        const formatted = latest.toFixed(decimals)
        const withCommas = parseFloat(formatted).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
        setDisplayed(`${prefix}${withCommas}${suffix}`)
      },
      onComplete: () => {
        setDisplayed(targetValue)
      },
    })

    return () => {
      if (animRef.current) animRef.current.stop()
    }
  }, [targetValue])

  return displayed
}

export default function KPICard({
  title,
  value,
  change,
  changePositive,
  icon: Icon,
  description,
  loading = false,
  accent = 'default',
  className,
}: KPICardProps) {
  const displayed = useCountUp(value)
  const prevValue = useRef(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 600)
      return () => clearTimeout(t)
    }
  }, [value])

  if (loading) {
    return (
      <div className={cn('rounded-lg border border-border bg-card p-4 md:p-5', className)}>
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 rounded shimmer" />
          <div className="h-8 w-8 rounded-md shimmer" />
        </div>
        <div className="mt-4 h-7 w-32 rounded shimmer" />
        <div className="mt-2 h-3 w-20 rounded shimmer" />
      </div>
    )
  }

  return (
    <SpotlightCard
      spotlightColor={spotlightMap[accent]}
      className={cn(
        'rounded-lg border border-border bg-card p-4 md:p-5',
        'hover:border-border/80 transition-all duration-200',
        flash && 'border-amber-500/30 bg-amber-500/5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs md:text-sm font-medium text-muted-foreground truncate pr-2">
          {title}
        </p>
        {Icon && (
          <div className={cn(
            'flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-md',
            iconBgClasses[accent]
          )}>
            <Icon className={cn('h-3.5 w-3.5 md:h-4 md:w-4', accentClasses[accent])} />
          </div>
        )}
      </div>

      <p
        className={cn(
          'mt-2 md:mt-3 text-xl md:text-2xl font-semibold font-mono tracking-tight',
          accentClasses[accent]
        )}
      >
        {displayed}
      </p>

      <div className="mt-1 md:mt-1.5 flex items-center gap-1.5 min-h-[16px]">
        {change !== undefined && changePositive !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            changePositive ? 'text-emerald-500' : 'text-red-500'
          )}>
            {changePositive
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />
            }
            <span className="font-mono">{change}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
    </SpotlightCard>
  )
}