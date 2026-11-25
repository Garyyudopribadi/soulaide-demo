import React from 'react'
import { cn } from '@/lib/utils.ts'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.09em] leading-relaxed'

  const variants = {
    default: 'bg-plum-100 text-plum-900',
    secondary: 'bg-[#EDE6D9] text-ink-soft',
    outline: 'border border-[#D7CCBC] bg-transparent text-ink-soft',
    success: 'bg-[#E7EEE5] text-[#33492F]',
    warning: 'bg-champagne-100 text-champagne-700',
  }

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
