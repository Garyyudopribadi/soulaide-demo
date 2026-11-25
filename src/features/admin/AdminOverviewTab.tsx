import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { StatCard } from '@/components/dashboard/StatCard'
import {
  StatusBreakdown,
  WeeklyLoadChart,
  type StatusBreakdownItem,
} from '@/components/dashboard/DashboardCharts'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import type { AdminKpiSummary, AdminAuditLogItem, AdminBookingItem, AdminPaymentItem, AdminTab } from './types'
import { formatIDR } from '@/lib/utils'
import {
  countByDate,
  formatClock,
  formatSessionDate,
  getDayWindow,
  getRelativeDateLabel,
  toDateKey,
} from '@/lib/dashboard'

interface AdminOverviewTabProps {
  kpis: AdminKpiSummary
  bookings: AdminBookingItem[]
  payments: AdminPaymentItem[]
  staffCount: number
  recentLogs: AdminAuditLogItem[]
  isRefreshing: boolean
  onRefresh: () => void
  onNavigateTab: (tab: AdminTab) => void
}

const ACTIVE_STATUSES = ['confirmed', 'pending_payment', 'reschedule_requested', 'rescheduled']

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  kpis,
  bookings,
  payments,
  staffCount,
  recentLogs,
  isRefreshing,
  onRefresh,
  onNavigateTab,
}) => {
  const todayKey = toDateKey(new Date())

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.session_date >= todayKey && ACTIVE_STATUSES.includes(booking.status))
        .sort((a, b) =>
          `${a.session_date}${a.session_start_time}`.localeCompare(
            `${b.session_date}${b.session_start_time}`
          )
        ),
    [bookings, todayKey]
  )

  const todayBookings = useMemo(
    () => bookings.filter((booking) => booking.session_date === todayKey && booking.status !== 'cancelled'),
    [bookings, todayKey]
  )

  const rescheduleCount = bookings.filter((b) => b.status === 'reschedule_requested').length
  const pendingPaymentCount = bookings.filter((b) => b.status === 'pending_payment').length
  const failedPaymentCount = payments.filter(
    (payment) => payment.status === 'failed' || payment.status === 'expired'
  ).length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  const dayWindow = getDayWindow(7)
  const weeklyCounts = countByDate(
    bookings.filter((booking) => booking.status !== 'cancelled'),
    dayWindow.map((day) => day.date)
  )

  const statusItems: StatusBreakdownItem[] = [
    {
      label: 'Terkonfirmasi',
      value: bookings.filter((b) => b.status === 'confirmed' || b.status === 'rescheduled').length,
      tone: 'emerald',
    },
    { label: 'Menunggu bayar', value: pendingPaymentCount, tone: 'amber' },
    {
      label: 'Reschedule',
      value: rescheduleCount,
      tone: 'sky',
    },
    { label: 'Selesai', value: completedCount, tone: 'plum' },
    {
      label: 'Dibatalkan',
      value: bookings.filter((b) => b.status === 'cancelled').length,
      tone: 'rose',
    },
  ]

  const actionItems = [
    {
      key: 'pending-payment',
      count: pendingPaymentCount,
      title: 'Reservasi menunggu pembayaran',
      description: 'Pastikan klien menyelesaikan invoice Midtrans sebelum jadwal sesi.',
      icon: Wallet,
      tone: 'amber' as const,
      target: 'bookings' as AdminTab,
      actionLabel: 'Tinjau reservasi',
    },
    {
      key: 'reschedule',
      count: rescheduleCount,
      title: 'Pengajuan perubahan jadwal',
      description: 'Setujui atau carikan slot alternatif bersama psikolog terkait.',
      icon: CalendarDays,
      tone: 'sky' as const,
      target: 'bookings' as AdminTab,
      actionLabel: 'Proses reschedule',
    },
    {
      key: 'failed-payment',
      count: failedPaymentCount,
      title: 'Transaksi gagal atau kedaluwarsa',
      description: 'Periksa status gateway dan hubungi klien untuk instruksi pembayaran ulang.',
      icon: CreditCard,
      tone: 'rose' as const,
      target: 'payments' as AdminTab,
      actionLabel: 'Buka rekonsiliasi',
    },
  ].filter((item) => item.count > 0)

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        eyebrow="Ringkasan Operasional"
        title="Selamat bertugas,"
        accent="Administrator"
        icon={ShieldCheck}
        description="Pantau alur reservasi, kesiapan tim psikolog, transaksi pembayaran, dan operasional layanan Soulaide dalam satu tampilan."
        meta={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sistem berjalan normal
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-[11px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Menyegarkan...' : 'Segarkan data'}
            </Button>
            <Button size="sm" onClick={() => onNavigateTab('bookings')} className="gap-1.5 text-[11px]">
              <CalendarDays className="h-3.5 w-3.5" />
              Kelola reservasi
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total reservasi"
          value={kpis.totalBookings}
          hint={`${upcomingBookings.length} sesi aktif terjadwal`}
          icon={CalendarDays}
          tone="plum"
          onClick={() => onNavigateTab('bookings')}
        />
        <StatCard
          label="Sesi terkonfirmasi"
          value={kpis.confirmedBookings}
          hint={`${todayBookings.length} sesi berlangsung hari ini`}
          icon={CheckCircle2}
          tone="emerald"
          onClick={() => onNavigateTab('bookings')}
        />
        <StatCard
          label="Menunggu pembayaran"
          value={pendingPaymentCount}
          hint="Perlu ditindaklanjuti hari ini"
          icon={Wallet}
          tone={pendingPaymentCount > 0 ? 'amber' : 'slate'}
          onClick={() => onNavigateTab('payments')}
        />
        <StatCard
          label="Pendapatan bersih"
          value={formatIDR(kpis.totalRevenue)}
          hint="Akumulasi transaksi berstatus lunas"
          icon={CreditCard}
          tone="champagne"
          valueClassName="text-xl sm:text-2xl"
          onClick={() => onNavigateTab('payments')}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <DashboardSection
            title="Perlu Ditindaklanjuti"
            description="Daftar reservasi dan transaksi yang memerlukan konfirmasi segera."
            icon={AlertTriangle}
            action={
              actionItems.length > 0 ? (
                <Badge variant="warning" className="text-[10px]">
                  {actionItems.reduce((sum, item) => sum + item.count, 0)} item
                </Badge>
              ) : (
                <Badge variant="success" className="gap-1 text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Bersih
                </Badge>
              )
            }
          >
            {actionItems.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-2xs">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Tidak ada antrean mendesak</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800/80">
                    Semua reservasi dan transaksi telah berada pada status yang diharapkan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {actionItems.map((item) => {
                  const Icon = item.icon
                  const toneClasses = {
                    amber: 'border-amber-200/80 bg-amber-50/70 text-amber-800',
                    sky: 'border-sky-200/80 bg-sky-50/70 text-sky-800',
                    rose: 'border-rose-200/80 bg-rose-50/70 text-rose-800',
                  }[item.tone]

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onNavigateTab(item.target)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-[#EEE8E1] bg-white p-3 text-left transition-all hover:border-plum-300 hover:shadow-sm"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClasses}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-bold text-plum-950">{item.title}</span>
                          <span className="rounded-full bg-plum-50 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-plum-700">
                            {item.count}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-[#72677E]">
                          {item.description}
                        </span>
                      </span>
                      <span className="mt-1 hidden items-center gap-1 text-[10px] font-bold text-plum-700 group-hover:flex sm:flex">
                        {item.actionLabel}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Sesi terdekat"
            description="Jadwal aktif yang akan berlangsung berikutnya."
            icon={Clock}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('bookings')}
                className="gap-1 text-[11px] text-plum-700"
              >
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Button>
            }
          >
            {upcomingBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#DFD7CE] bg-[#FDFBF8] px-4 py-8 text-center text-[11px] text-[#8E81A1]">
                Belum ada sesi aktif terjadwal.
              </p>
            ) : (
              <div className="divide-y divide-[#F1ECE6]">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => onNavigateTab('bookings')}
                    className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
                  >
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-plum-200/70 bg-plum-50 text-plum-800">
                      <span className="text-[9px] font-bold uppercase tracking-wide">
                        {formatSessionDate(booking.session_date, false).split(' ')[1]}
                      </span>
                      <span className="text-sm font-extrabold leading-none">
                        {formatSessionDate(booking.session_date, false).split(' ')[0]}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-plum-700">
                          {booking.booking_code}
                        </span>
                        <span className="text-[10px] text-[#998EA4]">
                          {getRelativeDateLabel(booking.session_date)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-bold text-plum-950">
                        {booking.customer.full_name}
                      </p>
                      <p className="truncate text-[10px] text-[#72677E]">
                        {booking.service.name} · {booking.psychologist.full_name}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[11px] font-bold tabular-nums text-plum-900">
                        {formatClock(booking.session_start_time)} WIB
                      </p>
                      <p className="mt-0.5 text-[10px] capitalize text-[#998EA4]">
                        {booking.delivery_method === 'online' ? 'Online' : 'Tatap muka'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Aktivitas operasional terbaru"
            description="Jejak perubahan terakhir dari audit log sistem."
            icon={Activity}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('audit-logs')}
                className="gap-1 text-[11px] text-plum-700"
              >
                Semua log <ArrowRight className="h-3 w-3" />
              </Button>
            }
            contentClassName="p-0 sm:p-0"
          >
            {recentLogs.length === 0 ? (
              <p className="px-4 py-8 text-center text-[11px] text-[#8E81A1]">
                Belum ada aktivitas operasional yang tercatat.
              </p>
            ) : (
              <div className="divide-y divide-[#F1ECE6]">
                {recentLogs.slice(0, 4).map((log) => {
                  const createdAt = new Date(log.created_at)
                  return (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-plum-100 bg-plum-50 text-plum-700">
                        <Activity className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-plum-800">
                            {log.action}
                          </span>
                          <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                            {log.resource_type}
                          </Badge>
                        </div>
                        {log.resource_id && (
                          <p className="mt-0.5 truncate font-mono text-[9px] text-[#998EA4]">
                            ID: {log.resource_id}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-right text-[10px] text-[#998EA4]">
                        <span className="block font-semibold text-[#72677E]">
                          {getRelativeDateLabel(toDateKey(createdAt))}
                        </span>
                        {createdAt.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <DashboardSection
            title="Sesi booking 7 hari ke depan"
            description="Perkiraan jadwal dan jumlah sesi per hari."
            icon={CalendarDays}
          >
            <WeeklyLoadChart
              data={dayWindow.map((day) => ({
                label: day.label,
                date: day.date,
                count: weeklyCounts[day.date] || 0,
                isToday: day.isToday,
              }))}
            />
          </DashboardSection>

          <DashboardSection
            title="Status Pemesanan"
            description="Ringkasan status seluruh sesi booking."
            icon={FileText}
          >
            <StatusBreakdown items={statusItems} />
          </DashboardSection>

          <DashboardSection
            title="Kapasitas & Layanan Aktif"
            description="Ketersediaan psikolog dan katalog layanan."
            icon={Users}
          >
            <div className="space-y-3">
              <ReadinessRow
                icon={UserRound}
                label="Psikolog terdaftar"
                value={kpis.verifiedPsychologists}
                hint="Profil aktif untuk menerima sesi"
              />
              <ReadinessRow
                icon={FileText}
                label="Layanan aktif"
                value={kpis.activeServices}
                hint="Katalog siap dipesan publik"
              />
              <ReadinessRow
                icon={ShieldCheck}
                label="Staf terdaftar"
                value={staffCount}
                hint="Termasuk admin dan psikolog"
              />
              <ReadinessRow
                icon={CheckCircle2}
                label="Sesi selesai"
                value={completedCount}
                hint="Tercatat dari seluruh riwayat"
              />
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}

interface ReadinessRowProps {
  icon: React.ElementType
  label: string
  value: number
  hint: string
}

const ReadinessRow: React.FC<ReadinessRowProps> = ({ icon: Icon, label, value, hint }) => (
  <div className="flex items-center gap-3 rounded-xl border border-[#F1ECE6] bg-[#FDFBF8] p-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-plum-100 bg-white text-plum-700">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold text-plum-950">{label}</p>
      <p className="text-[10px] text-[#998EA4]">{hint}</p>
    </div>
    <span className="text-lg font-extrabold tabular-nums text-plum-900">{value}</span>
  </div>
)
