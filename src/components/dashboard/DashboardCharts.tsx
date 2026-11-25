import React from 'react'
import { cn } from '@/lib/utils'

export interface WeeklyLoadPoint {
  label: string
  date: string
  count: number
  isToday?: boolean
}

export interface WeeklyLoadChartProps {
  data: WeeklyLoadPoint[]
  emptyMessage?: string
}

export const WeeklyLoadChart: React.FC<WeeklyLoadChartProps> = ({
  data,
  emptyMessage = 'Belum ada sesi terjadwal dalam 7 hari ke depan.',
}) => {
  const max = Math.max(...data.map((point) => point.count), 1)
  const total = data.reduce((sum, point) => sum + point.count, 0)

  if (total === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#DFD7CE] bg-[#FDFBF8] px-4 py-8 text-center text-[11px] text-[#8E81A1]">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div>
      <div className="flex h-36 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const height = point.count === 0 ? 8 : Math.max(16, Math.round((point.count / max) * 100))
          return (
            <div key={point.date} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-bold tabular-nums text-plum-700">{point.count}</span>
              <div className="flex h-full w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-300',
                    point.isToday
                      ? 'bg-gradient-to-t from-plum-800 to-plum-500'
                      : 'bg-gradient-to-t from-plum-200 to-plum-100 group-hover:from-plum-400 group-hover:to-plum-200'
                  )}
                  style={{ height: `${height}%` }}
                  title={`${point.label}: ${point.count} sesi`}
                  aria-label={`${point.label}: ${point.count} sesi`}
                />
              </div>
              <span
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-wide',
                  point.isToday ? 'text-plum-800' : 'text-[#998EA4]'
                )}
              >
                {point.label}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[10px] text-[#998EA4]">
        Total <strong className="text-plum-800">{total} sesi</strong> pada rentang 7 hari.
      </p>
    </div>
  )
}

export interface StatusBreakdownItem {
  label: string
  value: number
  tone: 'plum' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate'
}

export interface StatusBreakdownProps {
  items: StatusBreakdownItem[]
}

const barTones: Record<StatusBreakdownItem['tone'], string> = {
  plum: 'bg-plum-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  slate: 'bg-[#B9AEB5]',
}

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ items }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return <p className="text-[11px] text-[#8E81A1]">Belum ada data status untuk ditampilkan.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const percent = Math.round((item.value / total) * 100)
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="font-semibold text-[#5A5066]">{item.label}</span>
              <span className="font-bold tabular-nums text-plum-900">
                {item.value}
                <span className="ml-1 font-medium text-[#998EA4]">({percent}%)</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F1ECE6]">
              <div
                className={cn('h-full rounded-full transition-all duration-500', barTones[item.tone])}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
