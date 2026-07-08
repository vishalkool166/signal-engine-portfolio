import { cn } from '@/lib/utils'
import type { Grade } from '@/types'

interface GradeTagProps {
  grade: Grade | string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const GRADE_STYLES: Record<string, string> = {
  'A+': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  'A':  'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'B':  'text-amber-500 bg-amber-500/10 border-amber-500/20',
  'C':  'text-orange-500 bg-orange-500/10 border-orange-500/20',
  'F':  'text-muted-foreground bg-muted border-border',
}

const SIZE_STYLES = {
  sm: 'text-2xs px-1.5 py-0.5 font-semibold',
  md: 'text-xs px-2 py-0.5 font-semibold',
  lg: 'text-sm px-2.5 py-1 font-bold',
}

export default function GradeTag({
  grade,
  size = 'md',
  className,
}: GradeTagProps) {
  const normalized = grade ?? 'F'
  const style = GRADE_STYLES[normalized] ?? GRADE_STYLES['F']

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded border font-mono',
        style,
        SIZE_STYLES[size],
        className
      )}
    >
      {normalized}
    </span>
  )
}