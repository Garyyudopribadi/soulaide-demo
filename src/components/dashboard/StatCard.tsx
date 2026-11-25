import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatTone = 'plum' | 'emerald' | 'amber' | 'sky' | 'rose' | 'champagne' | 'slate'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  hint?: string
  icon: LucideIcon
  tone?: StatTone
  onClick?: () => void
  className?: string
  valueClassName?: string
}

const toneClasses: Record<
  StatTone,
  { iconWrap: string; icon: string; line: string; halo: string }
> = {
  plum: {
    iconWrap: 'border-plum-200/70 bg-plum-50',
    icon: 'text-plum-700',
    line: 'from-plum-400 to-plum-700',
    halo: 'bg-plum-200/30',
  },
  emerald: {
    iconWrap: 'border-emerald-200/80 bg-emerald-50',
    icon: 'text-emerald-700',
    line: 'from-emerald-300 to-emerald-600',
    halo: 'bg-emerald-200/30',
  },
  amber: {
    iconWrap: 'border-amber-200/80 bg-amber-50',
    icon: 'text-amber-700',
    line: 'from-amber-300 to-amber-600',
    halo: 'bg-amber-200/30',
  },
  sky: {
    iconWrap: 'border-sky-200/80 bg-sky-50',
    icon: 'text-sky-700',
    line: 'from-sky-300 to-sky-600',
    halo: 'bg-sky-200/30',
  },
  rose: {
    iconWrap: 'border-rose-200/80 bg-rose-50',
    icon: 'text-rose-700',
    line: 'from-rose-300 to-rose-600',
    halo: 'bg-rose-200/30',
  },
  champagne: {
    iconWrap: 'border-champagne-200 bg-champagne-50',
    icon: 'text-champagne-700',
    line: 'from-champagne-200 to-champagne-500',
    halo: 'bg-champagne-200/30',
  },
  slate: {
    iconWrap: 'border-[#E2DAD1] bg-[#F7F3EF]',
    icon: 'text-[#5A5066]',
    line: 'from-[#C9BEB2] to-[#7A6F85]',
    halo: 'bg-[#E2DAD1]/40',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'plum',
  onClick,
  className,
  valueClassName,
}) => {
  const styles = toneClasses[tone]
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-[#EAE3DC] bg-white p-4 text-left shadow-[0_1px_2px_rgba(41,23,56,0.03),0_14px_30px_-24px_rgba(41,23,56,0.28)] transition-all duration-300 sm:p-5',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:border-plum-300 hover:shadow-[0_18px_34px_-22px_rgba(41,23,56,0.35)]',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full blur-2xl transition-opacity duration-300',
          styles.halo,
          onClick && 'opacity-60 group-hover:opacity-100'
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl border',
            styles.iconWrap
          )}
        >
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </span>
        {onClick && (
          <ArrowUpRight className="h-3.5 w-3.5 text-[#B6AABF] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-plum-600" />
        )}
      </div>

      <p className={cn('relative z-10 mt-3 text-2xl font-extrabold tracking-tight text-plum-950 tabular-nums sm:text-[1.7rem]', valueClassName)}>
        {value}
      </p>
      <p className="relative z-10 mt-0.5 text-[11px] font-semibold text-[#72677E]">{label}</p>
      {hint && <p className="relative z-10 mt-1 text-[10px] leading-relaxed text-[#998EA4]">{hint}</p>}

      <span
        className={cn(
          'absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r opacity-70 transition-opacity group-hover:opacity-100',
          styles.line
        )}
      />
    </Component>
  )
}
