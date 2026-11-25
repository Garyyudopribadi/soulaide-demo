import React, { useState } from 'react'
import { AlertTriangle, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { CrisisEscalationModal } from './CrisisEscalationModal.tsx'
import { CRISIS_DISCLAIMER_TEXT } from './crisisService.ts'

interface CrisisDisclaimerBannerProps {
  compact?: boolean
  className?: string
}

export const CrisisDisclaimerBanner: React.FC<CrisisDisclaimerBannerProps> = ({
  compact = false,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        className={`bg-champagne-50 border border-champagne-200 rounded-2xl p-4 sm:p-5 text-champagne-700 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-champagne-100 border border-champagne-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-champagne-600" />
            </div>
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-[#4A3410] text-sm">
                Bukan Layanan Tanggap Darurat Medis / Krisis
              </p>
              <p className="text-[#6F5221] leading-relaxed">
                {compact ? CRISIS_DISCLAIMER_TEXT.short : CRISIS_DISCLAIMER_TEXT.full}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowModal(true)}
            className="shrink-0 text-xs border-champagne-200 bg-white text-[#5B3F14] hover:bg-champagne-100 gap-1.5 font-semibold self-start sm:self-center rounded-full px-4"
          >
            <PhoneCall className="w-3.5 h-3.5 text-champagne-600" />
            <span>Kontak Darurat 119</span>
          </Button>
        </div>
      </div>

      {showModal && <CrisisEscalationModal onClose={() => setShowModal(false)} />}
    </>
  )
}
