import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { MidtransSnapModal } from './MidtransSnapModal';
import { CreditCard, Calendar, Clock } from 'lucide-react';
import type { PaymentStatus } from './types';

interface PaymentSummaryCardProps {
  bookingId: string;
  bookingCode: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
  amount: number;
  paymentStatus: PaymentStatus | string;
  onPaymentSuccess?: () => void;
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  bookingId,
  bookingCode,
  serviceName,
  sessionDate,
  sessionTime,
  amount,
  paymentStatus,
  onPaymentSuccess,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-plum-600" />
            <CardTitle className="text-sm font-semibold text-slate-800">
              Informasi Pembayaran
            </CardTitle>
          </div>
          <PaymentStatusBadge status={paymentStatus} />
        </CardHeader>
        <CardContent className="pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">Kode Booking</span>
              <span className="font-mono font-medium text-slate-700">{bookingCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Layanan</span>
              <span className="font-medium text-slate-700 truncate block">{serviceName}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{sessionDate}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{sessionTime}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Biaya</span>
              <span className="text-base font-bold text-plum-700">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </div>

            {paymentStatus === 'pending' && (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-plum-600 hover:bg-plum-700 text-white font-medium text-xs px-3 py-1.5 h-auto shadow-sm"
              >
                Bayar Sekarang
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <MidtransSnapModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookingId={bookingId}
        bookingCode={bookingCode}
        serviceName={serviceName}
        amount={amount}
        onPaymentSuccess={() => {
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        }}
      />
    </>
  );
};
