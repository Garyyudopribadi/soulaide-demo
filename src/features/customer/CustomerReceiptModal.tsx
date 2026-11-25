import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import type { CustomerPaymentItem } from './types';
import { formatIDR } from '@/lib/utils';

interface CustomerReceiptModalProps {
  payment: CustomerPaymentItem | null;
  customerName: string;
  customerEmail: string;
  onClose: () => void;
}

export const CustomerReceiptModal: React.FC<CustomerReceiptModalProps> = ({
  payment,
  customerName,
  customerEmail,
  onClose,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptDate = payment.payment_time
    ? new Date(payment.payment_time).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(payment.created_at).toLocaleDateString('id-ID');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-xl bg-white shadow-2xl border-slate-200 overflow-hidden print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Receipt Header */}
        <CardHeader className="bg-gradient-to-r from-plum-700 to-plum-800 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1.5 backdrop-blur-sm">
                <img
                  src="/Soulaide Psi Arc Logo.webp"
                  alt="Soulaide Logo"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Kwitansi Pembayaran</CardTitle>
                <p className="text-xs text-plum-200">Soulaide Psychology Indonesia</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-plum-200 uppercase tracking-widest block">No. Kwitansi</span>
              <span className="font-mono text-xs font-bold text-white">{payment.midtrans_order_id}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 text-xs text-slate-700">
          {/* Status & Verification Seal */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block text-[11px]">Tanggal Transaksi</span>
              <span className="font-medium text-slate-800">{receiptDate} WIB</span>
            </div>
            <div className="flex items-center gap-2">
              {payment.status === 'paid' ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>LUNAS TERVERIFIKASI</span>
                </div>
              ) : (
                <Badge variant="warning">{payment.status.toUpperCase()}</Badge>
              )}
            </div>
          </div>

          {/* Client & Booking Information */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block">Diterbitkan Untuk:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{customerName}</p>
              <p className="text-slate-500">{customerEmail}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Detail Reservasi:</span>
              <p className="font-mono font-bold text-emerald-800 mt-0.5">Kode: {payment.booking_code}</p>
              <p className="text-slate-500 capitalize">Metode: Sesi {payment.delivery_method}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <th className="p-3">Deskripsi Layanan</th>
                  <th className="p-3 text-right">Metode Bayar</th>
                  <th className="p-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{payment.service_name}</p>
                    <p className="text-[11px] text-slate-500">Konseling Psikologi Terjadwal</p>
                  </td>
                  <td className="p-3 text-right capitalize text-slate-600">
                    {payment.payment_type || 'QRISGate Payment'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatIDR(payment.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-plum-50/50 text-slate-900 font-bold border-t border-plum-100">
                  <td colSpan={2} className="p-3 text-right text-plum-900">Total Pembayaran:</td>
                  <td className="p-3 text-right text-plum-800 text-sm">{formatIDR(payment.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Digital Signature & Ethics Notice */}
          <div className="pt-2 flex items-start gap-3 text-[11px] text-slate-500">
            <ShieldCheck className="w-5 h-5 text-plum-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Kwitansi ini merupakan bukti pembayaran elektronik resmi yang sah dari Soulaide Psychology.
              Seluruh transaksi tercatat secara kriptografis dan dilindungi kerahasiaannya sesuai Kode Etik Psikologi Indonesia.
            </p>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </Button>
          <Button size="sm" onClick={onClose} className="text-xs bg-slate-800 hover:bg-slate-900 text-white">
            Tutup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
