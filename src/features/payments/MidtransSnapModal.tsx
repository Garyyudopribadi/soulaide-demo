import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, ExternalLink, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { paymentService } from './paymentService';
import type { QrisgateCheckoutResponse } from './types';
import { formatIDR } from '@/lib/utils';

interface QrisgatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode: string;
  serviceName: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

export const QrisgatePaymentModal: React.FC<QrisgatePaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingCode,
  serviceName,
  amount,
}) => {
  const [customError, setCustomError] = useState<string | null>(null);

  // Request QRISGate checkout session
  const {
    data: checkoutData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<QrisgateCheckoutResponse, Error>({
    queryKey: ['qrisgate-checkout-session', bookingId],
    queryFn: () => paymentService.createPaymentSession(bookingId),
    enabled: isOpen && !!bookingId,
    staleTime: 5 * 60 * 1000,
  });

  if (!isOpen) return null;

  const activeError = customError || (queryError ? queryError.message : null);

  const handleProceedToCheckout = () => {
    if (!checkoutData?.checkout_url) return;

    if (checkoutData.checkout_url.startsWith('http')) {
      // Direct redirect to hosted QRISGate checkout page
      window.location.href = checkoutData.checkout_url;
    } else {
      // Local fallback / status page
      window.location.href = checkoutData.checkout_url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Pembayaran QRIS & Transfer Bank
                </CardTitle>
                <p className="text-xs text-slate-500">Gateway Resmi QRISGate Indonesia</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="sr-only">Tutup</span>
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-plum-700" />
              <p className="text-xs text-slate-500 font-medium">
                Menghubungkan ke gateway QRISGate & membuat instruksi pembayaran...
              </p>
            </div>
          ) : activeError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <p className="font-semibold">Gagal memproses pembayaran</p>
                <p>{activeError}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCustomError(null);
                    refetch();
                  }}
                  className="mt-2 text-xs border-red-300 text-red-800 hover:bg-red-100"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Order summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Nomor Booking</span>
                  <span className="font-mono font-semibold text-slate-800">{bookingCode}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Layanan</span>
                  <span className="font-semibold text-slate-800">{serviceName}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                  <span className="text-slate-600 font-medium">Total Pembayaran</span>
                  <span className="text-base font-extrabold text-plum-950 font-mono">
                    {formatIDR(checkoutData?.total_amount || amount)}
                  </span>
                </div>
                {checkoutData?.unique_code && (
                  <p className="text-[11px] text-plum-700 bg-plum-50/70 p-2 rounded-lg">
                    Termasuk kode unik verifikasi: <strong>+{checkoutData.unique_code}</strong>. Harap bayar tepat sesuai nominal.
                  </p>
                )}
              </div>

              {/* QRISGate Guarantees */}
              <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-2.5 text-xs text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Dana masuk langsung ke rekening bank merchant Soulaide. Instruksi bayar berlaku selama 15 menit.
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/60 border-t border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-2.5">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto h-11 text-xs font-semibold rounded-xl"
          >
            Nanti Saja
          </Button>

          <Button
            disabled={loading || !!activeError}
            onClick={handleProceedToCheckout}
            className="w-full sm:flex-1 h-11 bg-plum-900 hover:bg-plum-950 text-white text-xs font-semibold rounded-xl gap-2 cursor-pointer shadow-md"
          >
            <span>Buka Halaman Checkout QRISGate</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Aliased export for backwards compatibility
export { QrisgatePaymentModal as MidtransSnapModal };
