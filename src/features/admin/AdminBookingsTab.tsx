import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { exportToExcelXml, printPdfReport } from '@/lib/exportUtils';
import { PaymentStatusBadge } from '@/features/payments/PaymentStatusBadge';
import {
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  UserCheck,
  Video,
  MapPin,
  Calendar,
  Clock,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import type { AdminBookingItem } from './types';
import { adminService } from './adminService';
import { formatIDR } from '@/lib/utils';
import type { BookingStatus } from '@/types';

interface AdminBookingsTabProps {
  bookings: AdminBookingItem[];
  allPsychologists: Array<{ id: string; fullName: string }>;
  onRefresh: () => void;
}

export const AdminBookingsTab: React.FC<AdminBookingsTabProps> = ({
  bookings,
  allPsychologists,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reassignBooking, setReassignBooking] = useState<AdminBookingItem | null>(null);
  const [targetPsychologistId, setTargetPsychologistId] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (methodFilter !== 'all' && b.delivery_method !== methodFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = b.booking_code.toLowerCase().includes(q);
        const matchCust = b.customer.full_name.toLowerCase().includes(q);
        const matchEmail = b.customer.email?.toLowerCase().includes(q);
        const matchPsych = b.psychologist.full_name.toLowerCase().includes(q);
        if (!matchCode && !matchCust && !matchEmail && !matchPsych) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, methodFilter, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const handleExportExcel = () => {
    exportToExcelXml({
      filename: `Reservasi_Soulaide_${new Date().toISOString().split('T')[0]}`,
      title: 'DAFTAR RESERVASI & JADWAL OPERASIONAL SESI',
      subtitle: `Filter: ${statusFilter !== 'all' ? statusFilter : 'Semua'} | Metode: ${methodFilter}`,
      columns: [
        { header: 'No', key: '_no', width: 6, align: 'center' },
        { header: 'Kode Booking', key: 'booking_code', width: 14 },
        { header: 'Tanggal', key: 'session_date', width: 12, align: 'center' },
        { header: 'Waktu (WIB)', key: 'session_time', width: 14, align: 'center' },
        { header: 'Klien', key: 'client_name', width: 22 },
        { header: 'Kontak', key: 'client_phone', width: 16 },
        { header: 'Layanan', key: 'service_name', width: 22 },
        { header: 'Metode', key: 'delivery_method', width: 12, align: 'center' },
        { header: 'Psikolog', key: 'psychologist_name', width: 22 },
        { header: 'Tarif', key: 'price_formatted', width: 14, align: 'right' },
        { header: 'Status', key: 'status_label', width: 16, align: 'center' },
      ],
      data: filteredBookings.map((b, idx) => {
        const price =
          b.delivery_method === 'offline'
            ? b.service.price_offline || 350000
            : b.service.price_online || 110000;
        return {
          _no: idx + 1,
          booking_code: b.booking_code,
          session_date: b.session_date,
          session_time: `${b.session_start_time.slice(0, 5)} - ${b.session_end_time.slice(0, 5)}`,
          client_name: b.customer.full_name,
          client_phone: b.customer.phone_number || '-',
          service_name: b.service.name,
          delivery_method: b.delivery_method === 'offline' ? 'Tatap Muka' : 'Online',
          psychologist_name: b.psychologist.full_name,
          price_formatted: formatIDR(price),
          status_label: b.status,
        };
      }),
    });
  };

  const handlePrintPdf = () => {
    printPdfReport({
      filename: `Reservasi_Soulaide_${new Date().toISOString().split('T')[0]}`,
      title: 'DAFTAR RESERVASI & JADWAL OPERASIONAL SESI',
      subtitle: `Rekapitulasi Reservasi Operasional Klinik Soulaide`,
      columns: [
        { header: 'No', key: '_no', align: 'center', width: 4 },
        { header: 'Kode', key: 'booking_code', width: 12 },
        { header: 'Tanggal', key: 'session_date', align: 'center', width: 10 },
        { header: 'Waktu', key: 'session_time', align: 'center', width: 10 },
        { header: 'Klien', key: 'client_name', width: 16 },
        { header: 'Layanan', key: 'service_name', width: 16 },
        { header: 'Metode', key: 'delivery_method', align: 'center', width: 10 },
        { header: 'Psikolog', key: 'psychologist_name', width: 18 },
        { header: 'Tarif', key: 'price_formatted', align: 'right', width: 12 },
        { header: 'Status', key: 'status_label', align: 'center', width: 12 },
      ],
      data: filteredBookings.map((b, idx) => {
        const price =
          b.delivery_method === 'offline'
            ? b.service.price_offline || 350000
            : b.service.price_online || 110000;
        return {
          _no: idx + 1,
          booking_code: b.booking_code,
          session_date: b.session_date,
          session_time: `${b.session_start_time.slice(0, 5)} - ${b.session_end_time.slice(0, 5)}`,
          client_name: b.customer.full_name,
          service_name: b.service.name,
          delivery_method: b.delivery_method === 'offline' ? 'Tatap Muka' : 'Online',
          psychologist_name: b.psychologist.full_name,
          price_formatted: formatIDR(price),
          status_label: b.status.replace('_', ' '),
        };
      }),
    });
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    if (!window.confirm(`Ubah status booking menjadi '${newStatus}'?`)) return;
    try {
      await adminService.updateBookingStatus(bookingId, newStatus);
      setActionNotice(`Status booking berhasil diubah menjadi ${newStatus}.`);
      onRefresh();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui status');
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignBooking || !targetPsychologistId) return;

    try {
      await adminService.reassignPsychologist(reassignBooking.id, targetPsychologistId);
      setActionNotice(`Psikolog penanggung jawab untuk ${reassignBooking.booking_code} berhasil dialihkan.`);
      setReassignBooking(null);
      onRefresh();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengalihkan psikolog');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Terkonfirmasi</Badge>;
      case 'pending_payment':
        return <Badge variant="warning">Menunggu Bayar</Badge>;
      case 'reschedule_requested':
        return <Badge variant="secondary">Pengajuan Reschedule</Badge>;
      case 'rescheduled':
        return <Badge variant="default">Jadwal Baru</Badge>;
      case 'completed':
        return <Badge variant="outline">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="text-red-700 bg-red-50">Dibatalkan</Badge>;
      case 'no_show':
        return <Badge variant="secondary" className="text-amber-800 bg-amber-50">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-2 border border-emerald-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['all', 'confirmed', 'pending_payment', 'reschedule_requested', 'completed', 'cancelled'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  statusFilter === st
                    ? 'bg-white text-plum-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? `Semua (${bookings.length})` : st.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        {/* Search & Method */}
        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-plum-500"
          >
            <option value="all">Semua Metode</option>
            <option value="online">Online</option>
            <option value="offline">Tatap Muka</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode / klien / psikolog..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title="Tidak ada reservasi yang cocok"
          message="Tidak ditemukan data pemesanan yang sesuai dengan filter atau kata kunci pencarian Anda."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="p-3.5 sm:p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-plum-600" />
              <span>Daftar Pemesanan & Status Operasional ({filteredBookings.length})</span>
            </CardTitle>
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportExcel}
                className="h-7 text-xs gap-1.5 text-slate-700 hover:text-emerald-700"
                title="Ekspor ke format Excel (.xls)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrintPdf}
                className="h-7 text-xs gap-1.5 text-slate-700 hover:text-plum-700"
                title="Cetak atau simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5 text-plum-600" />
                <span>Cetak PDF</span>
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode & Tanggal</th>
                  <th className="py-3 px-4">Klien</th>
                  <th className="py-3 px-4">Layanan & Metode</th>
                  <th className="py-3 px-4">Psikolog</th>
                  <th className="py-3 px-4">Pembayaran</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Code & Schedule */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-plum-900 block text-xs">
                        {b.booking_code}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {b.session_date}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {b.session_start_time.slice(0, 5)} - {b.session_end_time.slice(0, 5)} WIB
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{b.customer.full_name}</span>
                      <span className="text-[11px] text-slate-500 block">{b.customer.phone_number || '-'}</span>
                      <span className="text-[10px] text-slate-400">{b.customer.email}</span>
                    </td>

                    {/* Service & Method */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{b.service.name}</span>
                      <span className="text-[10px] flex items-center gap-1 mt-0.5">
                        {b.delivery_method === 'online' ? (
                          <span className="text-sky-700 flex items-center gap-1">
                            <Video className="w-3 h-3" /> Online Zoom/Meet
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Tatap Muka (Pondok Bambu)
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Psychologist */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{b.psychologist.full_name}</span>
                      <button
                        onClick={() => {
                          setReassignBooking(b);
                          setTargetPsychologistId(b.psychologist.id);
                        }}
                        className="text-[10px] text-plum-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Alihkan Psikolog</span>
                      </button>
                    </td>

                    {/* Payment status */}
                    <td className="py-3.5 px-4">
                      {b.payment ? (
                        <div>
                          <PaymentStatusBadge status={b.payment.status} />
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                            {formatIDR(b.payment.amount)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum dibuat</span>
                      )}
                    </td>

                    {/* Booking Status */}
                    <td className="py-3.5 px-4 text-center">{getStatusBadge(b.status)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        {b.status === 'pending_payment' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="text-[10px] bg-plum-600 hover:bg-plum-700 text-white h-7 px-2"
                          >
                            Konfirmasi Lunas
                          </Button>
                        )}

                        {b.status === 'reschedule_requested' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Setujui Reschedule
                          </Button>
                        )}

                        {b.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            className="text-[10px] h-7 px-2"
                          >
                            Tandai Selesai
                          </Button>
                        )}

                        {['pending_payment', 'confirmed'].includes(b.status) && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5"
                          >
                            <XCircle className="w-3 h-3" /> Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBookings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            itemLabel="pemesanan"
          />
        </Card>
      )}

      {/* Reassign Psychologist Modal */}
      {reassignBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white shadow-2xl border-slate-200">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Alihkan Psikolog Penanggung Jawab
              </CardTitle>
              <p className="text-xs text-slate-500">
                Pemesanan: <strong className="font-mono">{reassignBooking.booking_code}</strong> (Klien: {reassignBooking.customer.full_name})
              </p>
            </CardHeader>
            <form onSubmit={handleReassign} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Pilih Psikolog Pengganti:
                </label>
                <select
                  value={targetPsychologistId}
                  onChange={(e) => setTargetPsychologistId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 bg-white"
                >
                  {allPsychologists.map((psych) => (
                    <option key={psych.id} value={psych.id}>
                      {psych.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReassignBooking(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-plum-600 hover:bg-plum-700 text-white"
                >
                  Simpan Pengalihan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
