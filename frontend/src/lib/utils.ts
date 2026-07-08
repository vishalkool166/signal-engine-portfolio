import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import numeral from 'numeral'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function normalizeDate(value: string): string {
  return value.includes('Z') || value.includes('+') ? value : value + 'Z'
}

export function formatCurrency(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '—'
  const abs  = Math.abs(value)
  const sign = value >= 0 ? '+$' : '-$'
  return sign + numeral(abs).format(`0,0.${'0'.repeat(decimals)}`)
}

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  if (value >= 1000) return numeral(value).format('$0,0.00')
  if (value >= 1)    return numeral(value).format('$0,0.0000')
  return numeral(value).format('$0,0.00000000')
}

export function formatPercent(
  value: number | null | undefined,
  showSign: boolean = true
): string {
  if (value === null || value === undefined) return '—'
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${numeral(value).format('0.00')}%`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numeral(value).format('0,0')
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numeral(value).format('0.0a').toUpperCase()
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)}/100`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(new Date(normalizeDate(value)), 'dd MMM yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(new Date(normalizeDate(value)), 'dd MMM yyyy, HH:mm')
  } catch {
    return '—'
  }
}

export function formatTimeAgo(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return formatDistanceToNow(new Date(normalizeDate(value)), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatCountdown(epochMs: number | null | undefined): string {
  if (!epochMs) return '—'
  const now  = Date.now()
  const diff = epochMs - now
  if (diff <= 0) return 'Now'
  const mins = Math.floor(diff / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFunding(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const pct  = value * 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(4)}%`
}

export function formatMRR(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numeral(value).format('$0,0')
}

export function isPositive(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return true
  return value >= 0
}

export function gradeColor(grade: string | null | undefined): string {
  switch (grade) {
    case 'A+': return 'grade-aplus'
    case 'A':  return 'grade-a'
    case 'B':  return 'grade-b'
    case 'C':  return 'grade-c'
    default:   return 'grade-f'
  }
}

export function healthColor(state: string | null | undefined): string {
  switch (state) {
    case 'HEALTHY':     return 'health-healthy'
    case 'WARNING':     return 'health-warning'
    case 'INVALIDATED': return 'health-invalidated'
    default:            return 'text-muted-foreground'
  }
}

export function tierLabel(tier: string | null | undefined): string {
  switch (tier) {
    case 'free':  return 'Basic'
    case 'pro':   return 'Pro'
    case 'elite': return 'Elite'
    case 'admin': return 'Admin'
    default:      return '—'
  }
}

export function tierColor(tier: string | null | undefined): string {
  switch (tier) {
    case 'free':  return 'text-muted-foreground'
    case 'pro':   return 'text-blue-500'
    case 'elite': return 'text-purple-500'
    case 'admin': return 'text-emerald-500'
    default:      return 'text-muted-foreground'
  }
}

export function truncate(str: string | null | undefined, length: number = 20): string {
  if (!str) return '—'
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}