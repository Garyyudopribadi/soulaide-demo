import React from 'react'
import { WhatsAppButton } from './WhatsAppButton.tsx'

export const FloatingCommunicationsWidget: React.FC = () => {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 print:hidden">
      <WhatsAppButton variant="icon" />
    </div>
  )
}
