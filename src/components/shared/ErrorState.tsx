import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message = 'Tidak dapat memuat konten saat ini. Silakan coba beberapa saat lagi.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-200/80 bg-rose-50/40">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#23192D] mb-1">{title}</h3>
      <p className="text-sm text-[#645A70] max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
