import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { PaymentStatusBadge } from '@/features/payments/PaymentStatusBadge';
import { Receipt, ArrowUpRight } from 'lucide-react';
import type { CustomerPaymentItem } from './types';
import { formatIDR } from '@/lib/utils';

interface CustomerPaymentsTabProps {
  payments: CustomerPaymentItem[];
  onViewReceipt: (payment: CustomerPaymentItem) => void;
}

export const CustomerPaymentsTab: React.FC<CustomerPaymentsTabProps> = ({
  payments,
  onViewReceipt,
}) => {
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200">
          <span className="text-xs text-slate-400 block">Total Transaksi</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-xs text-slate-400 block">Transaksi Lunas</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {payments.filter((p) => p.status === 'paid').length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-xs text-slate-400 block">Total Pembayaran Berhasil</span>
          <p className="text-2xl font-bold text-plum-800 mt-1">{formatIDR(totalPaid)}</p>
        </Card>
      </div>

      {/* Payment Table / List */}
      {payments.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat transaksi"
          message="Seluruh pembayaran sesi konseling melalui QRIS dan transfer bank akan tercatat secara otomatis di sini."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-plum-600" />
              <span>Daftar Riwayat Invoice & Pembayaran</span>
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID & Booking</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Tanggal Transaksi</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-medium text-slate-800 block text-[11px]">
                        {p.midtrans_order_id}
                      </span>
                      <span className="font-mono text-plum-700 text-[10px]">
                        Booking: {p.booking_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{p.service_name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        Metode: {p.delivery_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">
                      {p.payment_type || 'Midtrans Snap'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.payment_time || p.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatIDR(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewReceipt(p)}
                        className="text-xs text-plum-700 hover:text-plum-900 hover:bg-plum-50 gap-1 h-8 px-2.5"
                      >
                        <span>Kwitansi</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
