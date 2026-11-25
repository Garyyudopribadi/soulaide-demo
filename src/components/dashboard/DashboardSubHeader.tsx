import React from 'react'

export interface DashboardSubHeaderProps {
  eyebrow: string
  title: string
  accent?: string
  description?: string
  actions?: React.ReactNode
}

export const DashboardSubHeader: React.FC<DashboardSubHeaderProps> = ({
  eyebrow,
  title,
  accent,
  description,
  actions,
}) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[#EAE3DC] bg-white/75 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-plum-500">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-extrabold tracking-tight text-plum-950">
        {title}{' '}
        {accent && <span className="font-serif font-medium italic text-plum-600">{accent}</span>}
      </h2>
      {description && (
        <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-[#72677E]">{description}</p>
      )}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
)
