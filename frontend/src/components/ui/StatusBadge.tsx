import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const STATUS_STYLES: Record<string, string> = {
  HEALTHY:     'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  WARNING:     'text-amber-500 bg-amber-500/10 border-amber-500/20',
  INVALIDATED: 'text-red-500 bg-red-500/10 border-red-500/20',
  active:      'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  inactive:    'text-muted-foreground bg-muted border-border',
  running:     'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  stopped:     'text-red-500 bg-red-500/10 border-red-500/20',
  pending:     'text-amber-500 bg-amber-500/10 border-amber-500/20',
  win:         'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  loss:        'text-red-500 bg-red-500/10 border-red-500/20',
  connected:   'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  disconnected:'text-muted-foreground bg-muted border-border',
  error:       'text-red-500 bg-red-500/10 border-red-500/20',
  live:        'text-red-500 bg-red-500/10 border-red-500/20',
  paper:       'text-blue-500 bg-blue-500/10 border-blue-500/20',
  free:        'text-muted-foreground bg-muted border-border',
  pro:         'text-blue-500 bg-blue-500/10 border-blue-500/20',
  elite:       'text-purple-500 bg-purple-500/10 border-purple-500/20',
  admin:       'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
}

const STATUS_DOTS: Record<string, string> = {
  HEALTHY:     'bg-emerald-500',
  WARNING:     'bg-amber-500',
  INVALIDATED: 'bg-red-500',
  active:      'bg-emerald-500',
  running:     'bg-emerald-500',
  connected:   'bg-emerald-500',
  live:        'bg-red-500 animate-pulse',
  paper:       'bg-blue-500',
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'text-muted-foreground bg-muted border-border'
  const dot = STATUS_DOTS[status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded border px-2 py-0.5',
      'text-xs font-medium',
      style,
      className
    )}>
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />
      )}
      {status}
    </span>
  )
}