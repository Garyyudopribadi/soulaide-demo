import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DashboardPageHeaderProps {
  eyebrow: string
  title: string
  accent?: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}

export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  eyebrow,
  title,
  accent,
  description,
  icon: Icon,
  actions,
  meta,
  className,
}) => {
  return (
    <section
      className={cn(
        'relative z-30 rounded-3xl border border-[#E8E1D9] bg-gradient-to-br from-white via-[#FFFDFB] to-[#F6F0EA] p-5 shadow-[0_18px_40px_-32px_rgba(41,23,56,0.35)] sm:p-7',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-plum-200/35 blur-3xl" />
        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-champagne-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-plum-200/80 bg-plum-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-plum-700">
              {Icon && <Icon className="h-3 w-3" />}
              {eyebrow}
            </span>
            {meta}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-plum-950 sm:text-[2rem] sm:leading-[1.15]">
            {title}{' '}
            {accent && (
              <span className="font-serif font-medium italic text-plum-600">{accent}</span>
            )}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#5A5066] sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="relative z-40 flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </section>
  )
}
