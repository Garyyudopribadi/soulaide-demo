import React from 'react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  title?: string
  message?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak ada data',
  message = 'Belum ada informasi yang dapat ditampilkan.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#DFD7CE] rounded-2xl bg-sanctuary-50">
      <div className="w-12 h-12 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center text-plum-500 mb-4">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#23192D] mb-1">{title}</h3>
      <p className="text-sm text-[#645A70] max-w-sm mb-4 leading-relaxed">{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
