import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Memuat data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-[#645A70]">
      <div className="w-12 h-12 rounded-2xl bg-plum-50 border border-plum-100 flex items-center justify-center mb-4 shadow-2xs">
        <Loader2 className="w-6 h-6 animate-spin text-plum-700" />
      </div>
      <p className="text-sm font-medium tracking-tight">{message}</p>
    </div>
  )
}
