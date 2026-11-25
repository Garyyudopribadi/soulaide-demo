import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatIDR } from '@/lib/utils';
import { exportToExcelXml, exportToCsv, printPdfReport, type ExportColumn, type SummaryMetric } from '@/lib/exportUtils';
import type { AdminBookingItem, AdminPaymentItem } from './types';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Search,
  Download,
} from 'lucide-react';

interface AdminReportsTabProps {
  bookings: AdminBookingItem[];
  payments: AdminPaymentItem[];
  userName?: string;
}

type ReportType = 'bookings' | 'payments' | 'psychologists';
type DateRangePreset = 'all' | 'today' | '7days' | '30days' | 'this_month' | 'last_month';

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({
  bookings,
  payments,
  userName = 'Administrator Operasional',
}) => {
  const [reportType, setReportType] = useState<ReportType>('bookings');
  const [dateRange, setDateRange] = useState<DateRangePreset>('30days');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Calculate Date filter threshold
  const dateThreshold = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (dateRange === 'all') return null;

    if (dateRange === 'today') {
      return { start: todayStr, end: todayStr };
    }

    if (dateRange === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }

    if (dateRange === '30days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }

    if (dateRange === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      return { start: firstDay, end: todayStr };
    }

    if (dateRange === 'last_month') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { start: firstDayLastMonth, end: lastDayLastMonth };
    }

    return null;
  }, [dateRange]);

  // 1. Filtered Bookings Data
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Date filter
      if (dateThreshold) {
        if (b.session_date < dateThreshold.start || b.session_date > dateThreshold.end) {
          return false;
        }
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = b.booking_code.toLowerCase().includes(q);
        const matchClient = b.customer.full_name.toLowerCase().includes(q);
        const matchPsych = b.psychologist.full_name.toLowerCase().includes(q);
        const matchService = b.service.name.toLowerCase().includes(q);
        if (!matchCode && !matchClient && !matchPsych && !matchService) return false;
      }

      return true;
    });
  }, [bookings, dateThreshold, searchQuery]);

  // 2. Filtered Payments Data
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Date filter based on created_at
      if (dateThreshold && p.created_at) {
        const pDate = p.created_at.split('T')[0];
        if (pDate < dateThreshold.start || pDate > dateThreshold.end) {
          return false;
        }
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrder = p.midtrans_order_id.toLowerCase().includes(q);
        const matchClient = p.customer_name.toLowerCase().includes(q);
        const matchBooking = p.booking_code.toLowerCase().includes(q);
        const matchService = p.service_name.toLowerCase().includes(q);
        if (!matchOrder && !matchClient && !matchBooking && !matchService) return false;
      }

      return true;
    });
  }, [payments, dateThreshold, searchQuery]);

  // 3. Aggregate Psychologist Performance Data
  const psychologistSummary = useMemo(() => {
    const psychMap = new Map<
      string,
      {
        id: string;
        name: string;
        credentials: string;
        totalSessions: number;
        completed: number;
        confirmed: number;
        cancelled: number;
        totalRevenue: number;
      }
    >();

    filteredBookings.forEach((b) => {
      const pid = b.psychologist.id;
      if (!psychMap.has(pid)) {
        psychMap.set(pid, {
          id: pid,
          name: b.psychologist.full_name,
          credentials: b.psychologist.credentials,
          totalSessions: 0,
          completed: 0,
          confirmed: 0,
          cancelled: 0,
          totalRevenue: 0,
        });
      }

      const rec = psychMap.get(pid)!;
      rec.totalSessions += 1;
      if (b.status === 'completed') rec.completed += 1;
      if (b.status === 'confirmed') rec.confirmed += 1;
      if (b.status === 'cancelled') rec.cancelled += 1;

      const price =
        b.delivery_method === 'offline'
          ? b.service.price_offline || 350000
          : b.service.price_online || 110000;
      if (b.status === 'completed' || b.status === 'confirmed') {
        rec.totalRevenue += price;
      }
    });

    return Array.from(psychMap.values()).sort((a, b) => b.totalSessions - a.totalSessions);
  }, [filteredBookings]);

  // Current active data set & pagination
  const currentTotalItems =
    reportType === 'bookings'
      ? filteredBookings.length
      : reportType === 'payments'
      ? filteredPayments.length
      : psychologistSummary.length;

  // Paginated Data Slices
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const paginatedPsychologists = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return psychologistSummary.slice(start, start + pageSize);
  }, [psychologistSummary, currentPage, pageSize]);

  // Summary Metrics based on Report Type
  const summaryMetrics: SummaryMetric[] = useMemo(() => {
    if (reportType === 'bookings') {
      const total = filteredBookings.length;
      const completed = filteredBookings.filter((b) => b.status === 'completed').length;
      const confirmed = filteredBookings.filter((b) => b.status === 'confirmed').length;
      const completionRate = total > 0 ? Math.round(((completed + confirmed) / total) * 100) : 0;
      return [
        { label: 'Total Reservasi', value: total, subtext: 'Seluruh permohonan sesi' },
        { label: 'Sesi Terkonfirmasi', value: confirmed, subtext: 'Siap dilaksanakan' },
        { label: 'Sesi Selesai', value: completed, subtext: 'Selesai didampingi' },
        { label: 'Tingkat Realisasi', value: `${completionRate}%`, subtext: 'Rasio sesi aktif' },
      ];
    } else if (reportType === 'payments') {
      const totalCount = filteredPayments.length;
      const totalRevenue = filteredPayments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const totalRefund = filteredPayments
        .filter((p) => p.status === 'refunded' || p.status === 'partially_refunded')
        .reduce((sum, p) => sum + p.amount, 0);
      const paidCount = filteredPayments.filter((p) => p.status === 'paid').length;
      return [
        { label: 'Transaksi Masuk', value: totalCount, subtext: 'Total invoice terbit' },
        { label: 'Transaksi Lunas', value: paidCount, subtext: 'Berhasil diverifikasi' },
        { label: 'Total Pendapatan', value: formatIDR(totalRevenue), subtext: 'Dana masuk bersih' },
        { label: 'Total Dana Refund', value: formatIDR(totalRefund), subtext: 'Dana dikembalikan' },
      ];
    } else {
      const totalPsychs = psychologistSummary.length;
      const totalSessions = psychologistSummary.reduce((sum, p) => sum + p.totalSessions, 0);
      const totalEstRevenue = psychologistSummary.reduce((sum, p) => sum + p.totalRevenue, 0);
      return [
        { label: 'Psikolog Aktif', value: totalPsychs, subtext: 'Bertugas melayani' },
        { label: 'Akumulasi Sesi', value: totalSessions, subtext: 'Total beban konsultasi' },
        { label: 'Estimasi Nilai Layanan', value: formatIDR(totalEstRevenue), subtext: 'Nilai sesi terealisasi' },
      ];
    }
  }, [reportType, filteredBookings, filteredPayments, psychologistSummary]);

  // Export Format Preparation
  const getExportConfig = () => {
    const periodLabel =
      dateRange === 'all'
        ? 'Semua Waktu'
        : dateRange === 'today'
        ? 'Hari Ini'
        : dateRange === '7days'
        ? '7 Hari Terakhir'
        : dateRange === '30days'
        ? '30 Hari Terakhir'
        : dateRange === 'this_month'
        ? 'Bulan Ini'
        : 'Bulan Lalu';

    if (reportType === 'bookings') {
      const columns: ExportColumn[] = [
        { header: 'No', key: '_no', width: 6, align: 'center' },
        { header: 'Kode Booking', key: 'booking_code', width: 14, align: 'left' },
        { header: 'Tanggal Sesi', key: 'session_date', width: 12, align: 'center', format: 'date' },
        { header: 'Waktu (WIB)', key: 'session_time', width: 14, align: 'center' },
        { header: 'Nama Klien', key: 'client_name', width: 22, align: 'left' },
        { header: 'Kontak / Email', key: 'client_contact', width: 24, align: 'left' },
        { header: 'Layanan', key: 'service_name', width: 22, align: 'left' },
        { header: 'Metode', key: 'delivery_method', width: 12, align: 'center' },
        { header: 'Psikolog Penanggung Jawab', key: 'psychologist_name', width: 24, align: 'left' },
        { header: 'Tarif Layanan', key: 'price_formatted', width: 16, align: 'right' },
        { header: 'Status Operasional', key: 'status_label', width: 16, align: 'center' },
      ];

      const data = filteredBookings.map((b, idx) => {
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
          client_contact: b.customer.phone_number || b.customer.email || '-',
          service_name: b.service.name,
          delivery_method: b.delivery_method === 'offline' ? 'Tatap Muka' : 'Online',
          psychologist_name: b.psychologist.full_name,
          price_formatted: formatIDR(price),
          status_label:
            b.status === 'confirmed'
              ? 'Terkonfirmasi'
              : b.status === 'completed'
              ? 'Selesai'
              : b.status === 'pending_payment'
              ? 'Menunggu Bayar'
              : b.status === 'rescheduled'
              ? 'Jadwal Baru'
              : b.status === 'cancelled'
              ? 'Dibatalkan'
              : b.status,
        };
      });

      return {
        filename: `Laporan_Reservasi_Soulaide_${dateRange}_${new Date().toISOString().split('T')[0]}`,
        title: 'LAPORAN OPERASIONAL RESERVASI & JADWAL SESI',
        subtitle: 'Rekapitulasi Reservasi Konseling Psikologi & Pelayanan Klien',
        period: periodLabel,
        generatedBy: userName,
        columns,
        data,
        summaryMetrics,
      };
    } else if (reportType === 'payments') {
      const columns: ExportColumn[] = [
        { header: 'No', key: '_no', width: 6, align: 'center' },
        { header: 'Order ID Transaksi', key: 'midtrans_order_id', width: 18, align: 'left' },
        { header: 'Kode Booking', key: 'booking_code', width: 14, align: 'left' },
        { header: 'Nama Klien', key: 'customer_name', width: 22, align: 'left' },
        { header: 'Layanan Konseling', key: 'service_name', width: 24, align: 'left' },
        { header: 'Metode Pembayaran', key: 'payment_method', width: 16, align: 'center' },
        { header: 'Nominal Transaksi', key: 'amount_formatted', width: 16, align: 'right' },
        { header: 'Status Pembayaran', key: 'status_label', width: 16, align: 'center' },
        { header: 'Tanggal Transaksi', key: 'created_at_formatted', width: 18, align: 'center' },
      ];

      const data = filteredPayments.map((p, idx) => ({
        _no: idx + 1,
        midtrans_order_id: p.midtrans_order_id,
        booking_code: p.booking_code,
        customer_name: p.customer_name,
        service_name: p.service_name,
        payment_method: p.payment_type ? p.payment_type.toUpperCase() : 'VA / QRIS',
        amount_formatted: formatIDR(p.amount),
        status_label:
          p.status === 'paid'
            ? 'Lunas'
            : p.status === 'pending'
            ? 'Menunggu Bayar'
            : p.status === 'refunded'
            ? 'Dana Direfund'
            : p.status === 'failed'
            ? 'Gagal / Kedaluwarsa'
            : p.status,
        created_at_formatted: new Date(p.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      return {
        filename: `Laporan_Keuangan_Soulaide_${dateRange}_${new Date().toISOString().split('T')[0]}`,
        title: 'LAPORAN REKAPITULASI KEUANGAN & PEMBAYARAN',
        subtitle: 'Laporan Rekonsiliasi Transaksi Gateway & Status Pembayaran Klien',
        period: periodLabel,
        generatedBy: userName,
        columns,
        data,
        summaryMetrics,
      };
    } else {
      const columns: ExportColumn[] = [
        { header: 'No', key: '_no', width: 6, align: 'center' },
        { header: 'Nama Psikolog', key: 'name', width: 24, align: 'left' },
        { header: 'Gelar & Kredensial', key: 'credentials', width: 22, align: 'left' },
        { header: 'Total Sesi Diberikan', key: 'totalSessions', width: 16, align: 'center', format: 'number' },
        { header: 'Sesi Selesai', key: 'completed', width: 14, align: 'center', format: 'number' },
        { header: 'Sesi Terkonfirmasi', key: 'confirmed', width: 14, align: 'center', format: 'number' },
        { header: 'Sesi Batal', key: 'cancelled', width: 12, align: 'center', format: 'number' },
        { header: 'Akumulasi Nilai Layanan', key: 'revenue_formatted', width: 18, align: 'right' },
      ];

      const data = psychologistSummary.map((p, idx) => ({
        _no: idx + 1,
        name: p.name,
        credentials: p.credentials,
        totalSessions: p.totalSessions,
        completed: p.completed,
        confirmed: p.confirmed,
        cancelled: p.cancelled,
        revenue_formatted: formatIDR(p.totalRevenue),
      }));

      return {
        filename: `Laporan_Kinerja_Psikolog_Soulaide_${dateRange}_${new Date().toISOString().split('T')[0]}`,
        title: 'LAPORAN DISTRIBUSI & BEBAN KERJA PSIKOLOG',
        subtitle: 'Statistik Pelayanan Konseling Berdasarkan Penugasan Psikolog',
        period: periodLabel,
        generatedBy: userName,
        columns,
        data,
        summaryMetrics,
      };
    }
  };

  const handleExportExcel = () => {
    const config = getExportConfig();
    exportToExcelXml(config);
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    const config = getExportConfig();
    exportToCsv(config);
    setShowExportMenu(false);
  };

  const handlePrintPdf = () => {
    const config = getExportConfig();
    printPdfReport(config);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-5 bg-gradient-to-r from-plum-950 via-plum-900 to-slate-900 rounded-2xl text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-plum-800 text-plum-100 text-[10px] font-bold uppercase tracking-wider">
              Pusat Pelaporan Resmi
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Laporan &amp; Rekapitulasi Eksekutif</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Ekspor rekapitulasi operasional sesi, audit keuangan transaksi, dan beban psikolog ke format spreadsheet Excel (.xls) atau dokumen resmi PDF siap cetak.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs border border-emerald-600 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel / Spreadsheet</span>
              <Download className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-slate-800 text-xs">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Microsoft Excel (.xls)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>File Data CSV (.csv)</span>
                </button>
              </div>
            )}
          </div>

          <Button
            size="sm"
            onClick={handlePrintPdf}
            className="gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryMetrics.map((kpi, idx) => (
          <Card key={idx} className="p-4 border-slate-200 bg-white shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {kpi.label}
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {kpi.value}
            </div>
            {kpi.subtext && (
              <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                {kpi.subtext}
              </span>
            )}
          </Card>
        ))}
      </div>

      {/* Filter and Selection Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Report Type Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setReportType('bookings');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              reportType === 'bookings'
                ? 'bg-white text-plum-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reservasi Sesi ({filteredBookings.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setReportType('payments');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              reportType === 'payments'
                ? 'bg-white text-plum-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keuangan &amp; Transaksi ({filteredPayments.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setReportType('psychologists');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              reportType === 'psychologists'
                ? 'bg-white text-plum-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kinerja Psikolog ({psychologistSummary.length})
          </button>
        </div>

        {/* Date Presets & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as DateRangePreset);
                setCurrentPage(1);
              }}
              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-plum-500 cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="all">Semua Waktu</option>
            </select>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari data..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-plum-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table Preview */}
      {currentTotalItems === 0 ? (
        <EmptyState
          title="Tidak ada data untuk periode ini"
          message="Tidak ditemukan data rekapitulasi yang sesuai dengan rentang tanggal atau filter pencarian Anda."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200 shadow-2xs">
          <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-plum-600" />
              <span>
                Pratinjau Data Laporan ({currentTotalItems} baris)
              </span>
            </CardTitle>
            <span className="text-[11px] text-slate-400 font-medium">
              Data terintegrasi realtime
            </span>
          </CardHeader>

          {/* TABLE: Bookings */}
          {reportType === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center">No</th>
                    <th className="py-2.5 px-3">Kode Booking</th>
                    <th className="py-2.5 px-3">Tanggal Sesi</th>
                    <th className="py-2.5 px-3">Klien</th>
                    <th className="py-2.5 px-3">Layanan &amp; Metode</th>
                    <th className="py-2.5 px-3">Psikolog</th>
                    <th className="py-2.5 px-3 text-right">Biaya</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedBookings.map((b, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const price =
                      b.delivery_method === 'offline'
                        ? b.service.price_offline || 350000
                        : b.service.price_online || 110000;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400">{rowNumber}</td>
                        <td className="py-3 px-3 font-mono font-bold text-plum-900">{b.booking_code}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{b.session_date}</span>
                          <span className="text-[11px] text-slate-500">
                            {b.session_start_time.slice(0, 5)}–{b.session_end_time.slice(0, 5)} WIB
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{b.customer.full_name}</span>
                          <span className="text-[11px] text-slate-500">
                            {b.customer.phone_number || b.customer.email || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">{b.service.name}</span>
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            {b.delivery_method === 'offline' ? 'Tatap Muka' : 'Online'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">{b.psychologist.full_name}</span>
                          <span className="text-[11px] text-emerald-700">{b.psychologist.credentials}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-800">
                          {formatIDR(price)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant={
                              b.status === 'confirmed'
                                ? 'success'
                                : b.status === 'completed'
                                ? 'outline'
                                : b.status === 'pending_payment'
                                ? 'warning'
                                : 'secondary'
                            }
                            className="text-[10px] capitalize"
                          >
                            {b.status === 'confirmed'
                              ? 'Terkonfirmasi'
                              : b.status === 'completed'
                              ? 'Selesai'
                              : b.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE: Payments */}
          {reportType === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center">No</th>
                    <th className="py-2.5 px-3">Order ID Gateway</th>
                    <th className="py-2.5 px-3">Kode Booking</th>
                    <th className="py-2.5 px-3">Klien</th>
                    <th className="py-2.5 px-3">Layanan</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayments.map((p, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400">{rowNumber}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.midtrans_order_id}</td>
                        <td className="py-3 px-3 font-mono text-plum-900">{p.booking_code}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{p.customer_name}</td>
                        <td className="py-3 px-3 text-slate-700">{p.service_name}</td>
                        <td className="py-3 px-3 uppercase text-[11px] text-slate-600 font-semibold">
                          {p.payment_type || 'VA / QRIS'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">{formatIDR(p.amount)}</td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant={
                              p.status === 'paid'
                                ? 'success'
                                : p.status === 'pending'
                                ? 'warning'
                                : p.status === 'refunded'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-[10px] capitalize"
                          >
                            {p.status === 'paid' ? 'Lunas' : p.status === 'refunded' ? 'Direfund' : p.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE: Psychologists */}
          {reportType === 'psychologists' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Psikolog</th>
                    <th className="py-2.5 px-3">Kredensial</th>
                    <th className="py-2.5 px-3 text-center">Total Sesi</th>
                    <th className="py-2.5 px-3 text-center">Selesai</th>
                    <th className="py-2.5 px-3 text-center">Terkonfirmasi</th>
                    <th className="py-2.5 px-3 text-center">Dibatalkan</th>
                    <th className="py-2.5 px-3 text-right">Nilai Layanan Terkait</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPsychologists.map((p, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400">{rowNumber}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-3 text-emerald-700 font-medium">{p.credentials}</td>
                        <td className="py-3 px-3 text-center font-bold text-plum-900">{p.totalSessions}</td>
                        <td className="py-3 px-3 text-center text-emerald-700 font-semibold">{p.completed}</td>
                        <td className="py-3 px-3 text-center text-sky-700 font-semibold">{p.confirmed}</td>
                        <td className="py-3 px-3 text-center text-slate-400">{p.cancelled}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatIDR(p.totalRevenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={currentTotalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            itemLabel="baris laporan"
          />
        </Card>
      )}
    </div>
  );
};
