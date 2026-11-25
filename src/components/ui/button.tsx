import React from 'react'
import { cn } from '@/lib/utils.ts'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-900 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer active:scale-[0.985]'

    const variants = {
      primary:
        'bg-plum-900 text-[#FAF7F2] hover:bg-plum-950 shadow-2xs border border-plum-950/20',
      secondary:
        'bg-[#EFE8DF] text-plum-950 hover:bg-[#E5DCD0] border border-[#DDD3C5]',
      outline:
        'border border-[#D2C7B8] bg-white/80 text-plum-950 hover:bg-[#FAF6F0] hover:border-[#BFAF9C] shadow-2xs',
      ghost:
        'bg-transparent text-[#5C5266] hover:bg-plum-100/50 hover:text-plum-950',
      destructive:
        'bg-[#7A2822] text-[#FAF7F2] hover:bg-[#661F1A] border border-[#5C1B17]',
      dark:
        'bg-[#1F1724] text-[#FAF7F2] hover:bg-[#150F1A] border border-black/30 shadow-2xs',
    }

    const sizes = {
      sm: 'h-8.5 px-3.5 text-xs',
      md: 'h-10 px-4 text-xs sm:text-sm',
      lg: 'h-11 px-5.5 text-sm',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
