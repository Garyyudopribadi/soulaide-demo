import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { paymentService } from '@/features/payments/paymentService';
import type { QrisgateTransactionDetails, PaymentRecord } from '@/features/payments/types';
import { formatIDR } from '@/lib/utils';

export const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [, setLoading] = useState(true);
  const [txDetails, setTxDetails] = useState<QrisgateTransactionDetails | null>(null);
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const [bookingInfo, setBookingInfo] = useState<{
    id: string;
    booking_code: string;
    session_date: string;
    session_start_time: string;
    delivery_method: string;
    service_name?: string;
  } | null>(null);

  const [remainingTime, setRemainingTime] = useState(15 * 60); // 15 minutes in seconds

  const pollIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Fetch initial details
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadInitialData() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await paymentService.getPaymentByExternalOrderId(id);
        if (isMounted) {
          if (res.payment) {
            setPaymentRecord(res.payment);
          }
          if (res.booking) {
            setBookingInfo(res.booking);
          }
        }

        const status = await paymentService.checkOrderStatus(id);
        if (isMounted && status) {
          setTxDetails(status);
        }
      } catch (err) {
        console.error('Error fetching order status:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Countdown timer for 15-minute expiration
  useEffect(() => {
    countdownIntervalRef.current = window.setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Polling every 3 seconds while PENDING up to 15 minutes (300 polls = 900 seconds)
  useEffect(() => {
    if (!id) return;
    const isPaid = txDetails?.status === 'PAID' || paymentRecord?.status === 'paid';
    if (isPaid || remainingTime <= 0) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const latest = await paymentService.checkOrderStatus(id);
        if (latest) {
          setTxDetails(latest);
          if (latest.status === 'PAID') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        }
      } catch (err) {
        console.warn('Polling check error:', err);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [id, txDetails?.status, paymentRecord?.status, remainingTime]);

  const isPaid = txDetails?.status === 'PAID' || paymentRecord?.status === 'paid';
  const isExpired = remainingTime <= 0 && !isPaid;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-sanctuary-50/50 flex items-center justify-center">
      <div className="max-w-lg w-full space-y-6">
        <Card className="border-slate-200 shadow-xl overflow-hidden bg-white rounded-3xl">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 text-center p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              {isPaid ? (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              ) : isExpired ? (
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center ring-8 ring-red-50">
                  <AlertCircle className="w-9 h-9" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-plum-100 text-plum-700 flex items-center justify-center ring-8 ring-plum-50 animate-pulse">
                  <Clock className="w-9 h-9" />
                </div>
              )}
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
              {isPaid
                ? 'Pembayaran Berhasil Diterima!'
                : isExpired
                ? 'Sesi Pembayaran Kedaluwarsa'
                : 'Menunggu Pembayaran Tepat'}
            </CardTitle>

            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              {isPaid
                ? 'Terima kasih. Dana telah diverifikasi oleh sistem QRISGate dan jadwal konseling Anda resmi terkonfirmasi.'
                : isExpired
                ? 'Batas waktu 15 menit telah habis. Kode unik telah dilepas kembali ke sistem.'
                : 'Silakan lakukan pembayaran dengan nominal tepat (termasuk kode unik) sebelum batas waktu berakhir.'}
            </p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Countdown Banner if PENDING */}
            {!isPaid && !isExpired && (
              <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-700 animate-spin" />
                  <div>
                    <p className="text-xs text-amber-800 font-semibold">Sisa Waktu Pembayaran</p>
                    <p className="text-[11px] text-amber-700">Instruksi kedaluwarsa otomatis</p>
                  </div>
                </div>
                <div className="font-mono text-lg font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                  {formattedCountdown}
                </div>
              </div>
            )}

            {/* Order & Payment Summary Details */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                <span className="text-slate-500">ID Pesanan (External ID)</span>
                <span className="font-mono font-bold text-slate-800">{id}</span>
              </div>

              {bookingInfo && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Kode Booking</span>
                    <span className="font-mono font-semibold text-plum-900">{bookingInfo.booking_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Layanan</span>
                    <span className="font-semibold text-slate-800">{bookingInfo.service_name || 'Konseling'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Jadwal Sesi</span>
                    <span className="text-slate-700 font-medium">
                      {bookingInfo.session_date} ({bookingInfo.session_start_time.slice(0, 5)} WIB)
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-200/60">
                <span className="text-slate-600 font-medium">Total Nominal (Wajib Tepat)</span>
                <span className="text-base font-extrabold text-plum-950 font-mono">
                  {formatIDR(txDetails?.total_amount || paymentRecord?.amount || 0)}
                </span>
              </div>

              {txDetails?.unique_code && (
                <div className="flex justify-between items-center text-[11px] text-plum-700 bg-plum-50/70 p-2.5 rounded-xl">
                  <span>Termasuk Kode Unik Verifikasi:</span>
                  <span className="font-mono font-bold">+ Rp {txDetails.unique_code}</span>
                </div>
              )}
            </div>

            {/* Status Information Box */}
            <div className="p-4 rounded-2xl border text-xs flex items-start gap-3 bg-slate-50/80 border-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">Verifikasi Otomatis Gateway</p>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Pembayaran masuk langsung ke rekening resmi Soulaide. Sistem polling memverifikasi status setiap 3 detik secara aman.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isPaid ? (
                <Link to="/dashboard" className="block w-full">
                  <Button className="w-full h-12 bg-plum-900 hover:bg-plum-950 text-white rounded-xl gap-2 font-medium">
                    <span>Buka Jadwal di Dashboard Klien</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : isExpired ? (
                <Link to="/booking" className="block w-full">
                  <Button className="w-full h-12 bg-plum-900 hover:bg-plum-950 text-white rounded-xl gap-2 font-medium">
                    <span>Ulangi Pemesanan Jadwal</span>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => {
                      if (id) paymentService.checkOrderStatus(id);
                    }}
                    variant="outline"
                    className="w-full h-11 border-slate-200 rounded-xl gap-2 text-xs font-semibold text-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                    <span>Mengecek Pembayaran Otomatis...</span>
                  </Button>
                  <Link to="/dashboard" className="block w-full">
                    <Button variant="ghost" className="w-full h-10 text-xs text-slate-500 hover:text-slate-800">
                      Kembali ke Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
