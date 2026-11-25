import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  MessageSquare,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import type { AssignedBookingItem } from './types';

interface PsychologistSessionsTabProps {
  bookings: AssignedBookingItem[];
  onOpenClinicalNote: (booking: AssignedBookingItem) => void;
  onOpenChat: (booking: AssignedBookingItem) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const PsychologistSessionsTab: React.FC<PsychologistSessionsTabProps> = ({
  bookings,
  onOpenClinicalNote,
  onOpenChat,
  getStatusBadge,
}) => {
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filter === 'today' && b.session_date !== todayStr) return false;
      if (
        filter === 'upcoming' &&
        (b.session_date < todayStr || ['completed', 'cancelled'].includes(b.status))
      )
        return false;
      if (filter === 'completed' && b.status !== 'completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = b.booking_code.toLowerCase().includes(q);
        const matchClient = b.client.full_name.toLowerCase().includes(q);
        const matchService = b.service_name.toLowerCase().includes(q);
        if (!matchCode && !matchClient && !matchService) return false;
      }

      return true;
    });
  }, [bookings, filter, searchQuery, todayStr]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const todayCount = bookings.filter((b) => b.session_date === todayStr).length;

  return (
    <div className="space-y-6">
      {/* Sub-nav filters and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilter('today')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'today'
                ? 'bg-white text-plum-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Hari Ini</span>
            {todayCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-plum-600 text-white text-[10px] flex items-center justify-center font-bold">
                {todayCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'upcoming'
                ? 'bg-white text-plum-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mendatang
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-white text-plum-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai
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

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama klien / kode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title={
            filter === 'today'
              ? 'Tidak ada jadwal sesi hari ini'
              : filter === 'upcoming'
              ? 'Tidak ada sesi mendatang'
              : 'Tidak ditemukan sesi yang sesuai'
          }
          message="Jadwal sesi yang dipesan klien dan ditugaskan kepada Anda akan tampil di sini."
        />
      ) : (
        <div className="space-y-4">
          {paginatedBookings.map((b) => (
            <Card
              key={b.id}
              className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-plum-800 bg-plum-50 px-2.5 py-0.5 rounded-md border border-plum-200">
                      {b.booking_code}
                    </span>
                    {getStatusBadge(b.status)}
                    {b.has_clinical_notes ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Catatan Terisi</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] text-amber-800 bg-amber-50 border-amber-200">
                        Catatan Belum Diisi
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{b.client.full_name}</h3>
                    <p className="text-xs text-slate-500">
                      Layanan: <strong className="text-slate-700">{b.service_name}</strong> ({b.service_duration} Menit)
                    </p>
                  </div>

                  {/* Date, Time & Delivery Method */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-plum-600" />
                      {b.session_date}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-plum-600" />
                      {b.session_start_time.slice(0, 5)} - {b.session_end_time.slice(0, 5)} WIB
                    </span>
                    <span className="flex items-center gap-1.5">
                      {b.delivery_method === 'online' ? (
                        <span className="inline-flex items-center gap-1 text-sky-700 font-medium">
                          <Video className="w-3.5 h-3.5" />
                          Online (Zoom / Meet)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          Tatap Muka (Klinik Pondok Bambu)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Online link or Offline address */}
                  {b.delivery_method === 'online' && (
                    <div className="pt-1.5">
                      <a
                        href={b.meeting_link || 'https://meet.google.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded-lg text-xs font-semibold hover:bg-sky-100 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>Buka Room Konseling (Google Meet / Zoom)</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {/* Emergency Contact Quick Peek */}
                  {b.client.emergency_contact_phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Kontak Darurat: {b.client.emergency_contact_name} ({b.client.emergency_contact_relation}) -{' '}
                        {b.client.emergency_contact_phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => onOpenClinicalNote(b)}
                    className="w-full sm:w-auto gap-1.5 bg-plum-600 hover:bg-plum-700 text-white font-medium text-xs shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Catatan Klinis
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenChat(b)}
                    className="w-full sm:w-auto gap-1.5 text-xs text-slate-700 hover:text-plum-700 hover:border-plum-300"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-plum-600" />
                    Koordinasi Klien
                  </Button>
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
              itemLabel="sesi"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
