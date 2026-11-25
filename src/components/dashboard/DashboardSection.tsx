import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface DashboardSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
}) => {
  return (
    <Card className={cn('border-[#EAE3DC]', className)}>
      <div className="flex flex-col gap-2 border-b border-[#F1ECE6] bg-[#FDFBF8]/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <div className="flex items-start gap-2.5">
          {Icon && (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-plum-200/70 bg-plum-50 text-plum-700">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <CardTitle className="text-sm font-bold text-plum-950">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-0.5 text-[11px] leading-relaxed">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
      </div>
      <div className={cn('p-4 sm:p-5', contentClassName)}>{children}</div>
    </Card>
  )
}
