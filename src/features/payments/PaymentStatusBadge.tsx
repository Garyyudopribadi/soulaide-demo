import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, XCircle, RotateCcw } from 'lucide-react';
import type { PaymentStatus } from './types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="success" className={`flex items-center gap-1.5 ${className || ''}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Lunas</span>
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning" className={`flex items-center gap-1.5 ${className || ''}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>Menunggu Pembayaran</span>
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="secondary" className={`bg-rose-100 text-rose-800 flex items-center gap-1.5 ${className || ''}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Gagal</span>
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="secondary" className={`flex items-center gap-1.5 ${className || ''}`}>
          <XCircle className="w-3.5 h-3.5" />
          <span>Kadaluarsa</span>
        </Badge>
      );
    case 'refunded':
      return (
        <Badge variant="secondary" className={`bg-sky-100 text-sky-800 flex items-center gap-1.5 ${className || ''}`}>
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Dana Dikembalikan</span>
        </Badge>
      );
    case 'partially_refunded':
      return (
        <Badge variant="secondary" className={`bg-sky-100 text-sky-800 flex items-center gap-1.5 ${className || ''}`}>
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sebagian Dikembalikan</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          {status}
        </Badge>
      );
  }
};
