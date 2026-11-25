import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import {
  Calendar,
  Clock,
  CreditCard,
  RotateCcw,
  XCircle,
  Video,
  MapPin,
  MessageSquare,
  Search,
  ExternalLink,
} from 'lucide-react';
import type { CustomerBookingRecord } from '@/features/booking/bookingService';
import type { SessionFilter } from './types';

interface CustomerSessionsTabProps {
  bookings: CustomerBookingRecord[];
  onPayNow: (booking: CustomerBookingRecord) => void;
  onOpenChat: (booking: CustomerBookingRecord) => void;
  onReschedule: (booking: CustomerBookingRecord) => void;
  onCancel: (booking: CustomerBookingRecord) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const CustomerSessionsTab: React.FC<CustomerSessionsTabProps> = ({
  bookings,
  onPayNow,
  onOpenChat,
  onReschedule,
  onCancel,
  getStatusBadge,
}) => {
  const [filter, setFilter] = useState<SessionFilter>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // 1. Tab filter
      const isPast =
        booking.sessionDate < todayStr ||
        ['completed', 'cancelled', 'no_show'].includes(booking.status);

      if (filter === 'upcoming' && isPast) return false;
      if (filter === 'history' && !isPast) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = booking.bookingCode.toLowerCase().includes(query);
        const matchPsych = booking.psychologist.fullName.toLowerCase().includes(query);
        const matchService = booking.service.name.toLowerCase().includes(query);
        if (!matchCode && !matchPsych && !matchService) return false;
      }

      return true;
    });
  }, [bookings, filter, searchQuery, todayStr]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'upcoming'
                ? 'bg-white text-plum-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sesi Mendatang
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'history'
                ? 'bg-white text-plum-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Sesi
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white text-plum-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({bookings.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking / psikolog..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title={
            filter === 'upcoming'
              ? 'Tidak ada sesi mendatang'
              : filter === 'history'
              ? 'Belum ada riwayat sesi lampau'
              : 'Tidak ditemukan sesi yang cocok'
          }
          message={
            filter === 'upcoming'
              ? 'Anda tidak memiliki jadwal konseling aktif dalam waktu dekat.'
              : 'Riwayat sesi konseling yang telah selesai atau dibatalkan akan dicatat di sini.'
          }
        />
      ) : (
        <div className="space-y-4">
          {paginatedBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                {/* Session Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-plum-800 bg-plum-50 px-2.5 py-0.5 rounded-md border border-plum-200">
                      {booking.bookingCode}
                    </span>
                    {getStatusBadge(booking.status)}
                    <span className="text-xs text-slate-400">
                      Dipesan: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{booking.service.name}</h3>
                    <p className="text-xs text-slate-500">
                      Psikolog Pendamping: <strong className="text-slate-700">{booking.psychologist.fullName}</strong> ({booking.psychologist.credentials})
                    </p>
                  </div>

                  {/* Date, Time & Delivery Method */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-plum-600" />
                      {booking.sessionDate}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-plum-600" />
                      {booking.sessionStartTime.slice(0, 5)} - {booking.sessionEndTime.slice(0, 5)} WIB
                    </span>
                    <span className="flex items-center gap-1.5">
                      {booking.deliveryMethod === 'online' ? (
                        <span className="inline-flex items-center gap-1 text-sky-700 font-medium">
                          <Video className="w-3.5 h-3.5" />
                          Online (Zoom / Meet)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          Tatap Muka (Klinik Pondok Bambu, Jaktim)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Meeting link / Location address */}
                  {booking.deliveryMethod === 'online' && booking.status === 'confirmed' && (
                    <div className="pt-2">
                      <a
                        href={booking.meetingLink || 'https://meet.google.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-lg text-xs font-semibold hover:bg-sky-100 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>Buka Room Konseling Online</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {booking.deliveryMethod === 'offline' && (
                    <p className="text-[11px] text-slate-500 pt-1">
                      Lokasi: Jl. Pondok Bambu Batas No. 14, Duren Sawit, Jakarta Timur 13430
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {booking.status === 'pending_payment' && (
                    <Button
                      size="sm"
                      onClick={() => onPayNow(booking)}
                      className="w-full sm:w-auto gap-1.5 bg-plum-600 hover:bg-plum-700 text-white font-medium text-xs shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Bayar Sekarang
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenChat(booking)}
                    className="w-full sm:w-auto gap-1.5 text-xs text-slate-700 hover:text-plum-700 hover:border-plum-300"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-plum-600" />
                    Chat Koordinasi
                  </Button>

                  {(booking.status === 'confirmed' || booking.status === 'pending_payment') && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReschedule(booking)}
                        className="gap-1 text-xs text-slate-600 hover:text-slate-900 w-full sm:w-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancel(booking)}
                        className="gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Batalkan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Card className="overflow-hidden border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredBookings.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
              itemLabel="sesi konseling"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
