import React from 'react';
import { RealtimeChatModal } from '@/features/chat/RealtimeChatModal.tsx';
import type { CustomerBookingRecord } from '@/features/booking/bookingService.ts';

export interface CustomerChatModalProps {
  booking: CustomerBookingRecord | null;
  onClose: () => void;
}

export const CustomerChatModal: React.FC<CustomerChatModalProps> = ({ booking, onClose }) => {
  return <RealtimeChatModal booking={booking} onClose={onClose} />;
};
