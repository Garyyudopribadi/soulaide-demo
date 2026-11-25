import React from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { StatCard } from '@/components/dashboard/StatCard'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  HeartHandshake,
  MapPin,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
  Wallet,
} from 'lucide-react'
import type { CustomerBookingRecord } from '@/features/booking/bookingService'
import { PaymentStatusBadge } from '@/features/payments/PaymentStatusBadge'
import { formatIDR } from '@/lib/utils'
import {
  formatClock,
  formatSessionDate,
  getProfileCompletion,
  getRelativeDateLabel,
  toDateKey,
} from '@/lib/dashboard'
import type {
  ClientProfileData,
  CustomerConsentRecord,
  CustomerNotificationItem,
  CustomerPaymentItem,
  CustomerTab,
} from './types'

interface CustomerOverviewTabProps {
  fullName: string
  phoneNumber?: string | null
  bookings: CustomerBookingRecord[]
  payments: CustomerPaymentItem[]
  notifications: CustomerNotificationItem[]
  consents: CustomerConsentRecord[]
  clientProfile: ClientProfileData | null
  onNavigateTab: (tab: CustomerTab) => void
  onPayNow: (booking: CustomerBookingRecord) => void
  onOpenChat: (booking: CustomerBookingRecord) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="success">Terkonfirmasi</Badge>
    case 'pending_payment':
      return <Badge variant="warning">Menunggu Pembayaran</Badge>
    case 'reschedule_requested':
      return <Badge variant="secondary">Pengajuan Reschedule</Badge>
    case 'rescheduled':
      return <Badge variant="default">Jadwal Baru</Badge>
    case 'completed':
      return <Badge variant="outline">Selesai</Badge>
    case 'cancelled':
      return (
        <Badge variant="secondary" className="border-rose-200 bg-rose-50 text-rose-700">
          Dibatalkan
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({
  fullName,
  phoneNumber,
  bookings,
  payments,
  notifications,
  consents,
  clientProfile,
  onNavigateTab,
  onPayNow,
  onOpenChat,
}) => {
  const todayKey = toDateKey(new Date())

  const upcomingBookings = bookings
    .filter(
      (booking) =>
        booking.sessionDate >= todayKey &&
        !['completed', 'cancelled', 'no_show'].includes(booking.status)
    )
    .sort((a, b) =>
      `${a.sessionDate}${a.sessionStartTime}`.localeCompare(`${b.sessionDate}${b.sessionStartTime}`)
    )

  const nextBooking = upcomingBookings[0]
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length
  const paidTotal = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)
  const unreadCount = notifications.filter((notification) => !notification.is_read).length
  const pendingPayments = payments.filter((payment) => payment.status === 'pending')
  const lastPayments = [...payments]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3)

  const completion = getProfileCompletion({
    full_name: fullName,
    phone_number: phoneNumber,
    date_of_birth: clientProfile?.date_of_birth,
    emergency_contact_name: clientProfile?.emergency_contact_name,
    emergency_contact_phone: clientProfile?.emergency_contact_phone,
  })

  interface CustomerActionItem {
    key: string
    count: number
    title: string
    description: string
    icon: LucideIcon
    tone: 'amber' | 'sky' | 'plum' | 'rose'
    onClick: () => void
  }

  const actionItems: CustomerActionItem[] = []

  if (pendingPayments.length > 0) {
    actionItems.push({
      key: 'payment',
      count: pendingPayments.length,
      title: 'Selesaikan pembayaran sesi',
      description: 'Invoice pembayaran masih menunggu pelunasan agar jadwal Anda terkonfirmasi.',
      icon: Wallet,
      tone: 'amber',
      onClick: () => onNavigateTab('payments'),
    })
  }

  if (unreadCount > 0) {
    actionItems.push({
      key: 'notifications',
      count: unreadCount,
      title: 'Notifikasi belum dibaca',
      description: 'Ada pembaruan jadwal, pembayaran, atau pesan koordinasi untuk Anda.',
      icon: Bell,
      tone: 'sky',
      onClick: () => onNavigateTab('notifications'),
    })
  }

  if (completion.percent < 100) {
    actionItems.push({
      key: 'profile',
      count: completion.percent,
      title: 'Lengkapi profil konseling',
      description: `Data yang belum lengkap: ${completion.missing.slice(0, 2).join(', ')}${completion.missing.length > 2 ? ', dan lainnya' : ''}.`,
      icon: UserRound,
      tone: 'plum',
      onClick: () => onNavigateTab('profile'),
    })
  }

  if (consents.length === 0) {
    actionItems.push({
      key: 'consent',
      count: 0,
      title: 'Informed consent belum tercatat',
      description: 'Tinjau dan lengkapi persetujuan layanan sebelum sesi berikutnya.',
      icon: FileCheck2,
      tone: 'rose',
      onClick: () => onNavigateTab('profile'),
    })
  }

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        eyebrow="Ruang Klien"
        title={`Halo, ${fullName.split(' ')[0] || 'Sahabat Soulaide'}.`}
        accent="Ruang tenang Anda."
        icon={HeartHandshake}
        description="Kelola jadwal sesi, pantau pembayaran, dan siapkan kenyamanan Anda sebelum bertemu psikolog. Semua data Anda terjaga kerahasiaannya."
        meta={
          upcomingBookings.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-plum-200 bg-plum-50 px-2.5 py-1 text-[10px] font-bold text-plum-700">
              <CalendarDays className="h-3 w-3" />
              {upcomingBookings.length} sesi mendatang
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DAD1] bg-[#F7F3EF] px-2.5 py-1 text-[10px] font-bold text-[#72677E]">
              <Sparkles className="h-3 w-3" />
              Mulai langkah pertama
            </span>
          )
        }
        actions={
          <Link to="/booking">
            <Button size="sm" className="gap-1.5 text-[11px]">
              <CalendarDays className="h-3.5 w-3.5" />
              Booking sesi baru
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Sesi mendatang"
          value={upcomingBookings.length}
          hint={nextBooking ? `Berikutnya ${getRelativeDateLabel(nextBooking.sessionDate)}` : 'Belum ada jadwal aktif'}
          icon={CalendarDays}
          tone="plum"
          onClick={() => onNavigateTab('sessions')}
        />
        <StatCard
          label="Sesi selesai"
          value={completedCount}
          hint="Bagian dari perjalanan Anda"
          icon={CheckCircle2}
          tone="emerald"
          onClick={() => onNavigateTab('sessions')}
        />
        <StatCard
          label="Total pembayaran lunas"
          value={formatIDR(paidTotal)}
          hint={`${payments.filter((payment) => payment.status === 'paid').length} transaksi berhasil`}
          icon={CreditCard}
          tone="champagne"
          valueClassName="text-lg sm:text-xl"
          onClick={() => onNavigateTab('payments')}
        />
        <StatCard
          label="Notifikasi baru"
          value={unreadCount}
          hint={unreadCount > 0 ? 'Buka untuk membaca pembaruan' : 'Semua sudah dibaca'}
          icon={Bell}
          tone={unreadCount > 0 ? 'amber' : 'slate'}
          onClick={() => onNavigateTab('notifications')}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {/* Next session */}
          {nextBooking ? (
            <div className="relative overflow-hidden rounded-3xl border border-plum-800/20 bg-gradient-to-br from-plum-950 via-plum-900 to-plum-800 p-5 text-white shadow-[0_24px_48px_-30px_rgba(41,23,56,0.75)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-champagne-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-plum-400/20 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-plum-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-champagne-300" />
                    Sesi berikutnya
                  </span>
                  {getStatusBadge(nextBooking.status)}
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-plum-200">
                        {formatSessionDate(nextBooking.sessionDate, false).split(' ')[1]}
                      </span>
                      <span className="font-serif text-2xl font-bold leading-none">
                        {formatSessionDate(nextBooking.sessionDate, false).split(' ')[0]}
                      </span>
                      <span className="mt-0.5 text-[9px] text-plum-200">
                        {formatSessionDate(nextBooking.sessionDate, false).split(' ')[2]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-plum-200">
                        {getRelativeDateLabel(nextBooking.sessionDate)} ·{' '}
                        {formatClock(nextBooking.sessionStartTime)}–
                        {formatClock(nextBooking.sessionEndTime)} WIB
                      </p>
                      <h2 className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl">
                        {nextBooking.service.name}
                      </h2>
                      <p className="mt-1 text-xs text-plum-100/85">
                        Bersama{' '}
                        <strong className="font-semibold text-white">
                          {nextBooking.psychologist.fullName}
                        </strong>
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-plum-200">
                        <span className="inline-flex items-center gap-1">
                          {nextBooking.deliveryMethod === 'online' ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                          {nextBooking.deliveryMethod === 'online'
                            ? 'Sesi online'
                            : 'Tatap muka · Pondok Bambu'}
                        </span>
                        <span className="font-mono">{nextBooking.bookingCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {nextBooking.status === 'pending_payment' ? (
                      <Button
                        size="sm"
                        onClick={() => onPayNow(nextBooking)}
                        className="gap-1.5 bg-white text-plum-900 hover:bg-plum-50"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Bayar sekarang
                      </Button>
                    ) : nextBooking.deliveryMethod === 'online' && nextBooking.status === 'confirmed' ? (
                      <a href={nextBooking.meetingLink || 'https://meet.google.com'} target="_blank" rel="noreferrer">
                        <Button size="sm" className="gap-1.5 bg-white text-plum-900 hover:bg-plum-50">
                          <Video className="h-3.5 w-3.5" />
                          Buka ruang sesi
                        </Button>
                      </a>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenChat(nextBooking)}
                      className="gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat koordinasi
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-[10px] text-plum-200">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    Ruang konsultasi privat & terenkripsi
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('sessions')}
                    className="inline-flex items-center gap-1 font-bold text-white hover:text-champagne-200"
                  >
                    Detail sesi <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#E8E1D9] bg-white p-6 text-center shadow-[0_18px_40px_-32px_rgba(41,23,56,0.35)] sm:p-8">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-plum-100 bg-plum-50 text-plum-600">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-base font-extrabold text-plum-950">Belum ada sesi mendatang</h2>
              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[#72677E]">
                Saat Anda siap, pilih layanan dan psikolog yang paling sesuai. Anda dapat memulai
                kapan saja tanpa tekanan.
              </p>
              <Link to="/booking" className="mt-4 inline-block">
                <Button size="sm" className="gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Cari jadwal sesi
                </Button>
              </Link>
            </div>
          )}

          <DashboardSection
            title="Sesi mendatang"
            description="Jadwal aktif yang sudah Anda pesan."
            icon={CalendarDays}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('sessions')}
                className="gap-1 text-[11px] text-plum-700"
              >
                Semua sesi <ArrowRight className="h-3 w-3" />
              </Button>
            }
          >
            {upcomingBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#DFD7CE] bg-[#FDFBF8] px-4 py-7 text-center text-[11px] text-[#8E81A1]">
                Tidak ada sesi aktif. Riwayat sesi tetap tersedia di menu Sesi Konseling.
              </p>
            ) : (
              <div className="divide-y divide-[#F1ECE6]">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-plum-100 bg-plum-50 text-sm font-extrabold text-plum-800">
                      {formatSessionDate(booking.sessionDate, false).split(' ')[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-plum-950">{booking.service.name}</p>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-[#72677E]">
                        {getRelativeDateLabel(booking.sessionDate)} ·{' '}
                        {formatClock(booking.sessionStartTime)} WIB · {booking.psychologist.fullName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('sessions')}
                      className="shrink-0 rounded-lg border border-[#E2DAD1] bg-white p-1.5 text-plum-700 transition-colors hover:border-plum-300 hover:bg-plum-50"
                      aria-label={`Lihat detail ${booking.bookingCode}`}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Transaksi terakhir"
            description="Riwayat invoice dan status pembayaran Anda."
            icon={CreditCard}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('payments')}
                className="gap-1 text-[11px] text-plum-700"
              >
                Semua tagihan <ArrowRight className="h-3 w-3" />
              </Button>
            }
          >
            {lastPayments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#DFD7CE] bg-[#FDFBF8] px-4 py-7 text-center text-[11px] text-[#8E81A1]">
                Belum ada transaksi. Invoice akan muncul setelah Anda menyelesaikan pemesanan.
              </p>
            ) : (
              <div className="divide-y divide-[#F1ECE6]">
                {lastPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E2DAD1] bg-[#F7F3EF] text-[#5A5066]">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-plum-950">{payment.service_name}</p>
                      <p className="mt-0.5 text-[10px] text-[#72677E]">
                        {payment.booking_code} · {new Date(payment.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold tabular-nums text-plum-900">
                        {formatIDR(payment.amount)}
                      </p>
                      <PaymentStatusBadge status={payment.status} className="mt-1 scale-90" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <DashboardSection
            title="Perlu perhatian"
            description="Hal kecil yang membuat sesi Anda lebih siap."
            icon={AlertCircle}
            action={
              actionItems.length === 0 ? (
                <Badge variant="success" className="gap-1 text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Beres
                </Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">
                  {actionItems.length} item
                </Badge>
              )
            }
          >
            {actionItems.length === 0 ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-900">Semua siap</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-emerald-800/80">
                    Profil, pembayaran, dan persetujuan Anda sudah lengkap.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {actionItems.map((item) => {
                  const Icon = item.icon
                  const toneClasses = {
                    amber: 'border-amber-200/80 bg-amber-50 text-amber-700',
                    sky: 'border-sky-200/80 bg-sky-50 text-sky-700',
                    plum: 'border-plum-200/80 bg-plum-50 text-plum-700',
                    rose: 'border-rose-200/80 bg-rose-50 text-rose-700',
                  }[item.tone]

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={item.onClick}
                      className="group flex w-full items-start gap-2.5 rounded-xl border border-[#F1ECE6] bg-white p-3 text-left transition-all hover:border-plum-300 hover:shadow-sm"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${toneClasses}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-plum-950">{item.title}</span>
                          {item.count > 0 && (
                            <span className="rounded-full bg-plum-50 px-1.5 py-0.5 text-[9px] font-extrabold text-plum-700">
                              {item.count}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-[#72677E]">
                          {item.description}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-3 w-3 shrink-0 text-[#B6AABF] transition-transform group-hover:translate-x-0.5 group-hover:text-plum-600" />
                    </button>
                  )
                })}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Kelengkapan profil"
            description="Data ini membantu psikolog memahami konteks Anda."
            icon={UserRound}
            action={
              <span className="text-[11px] font-extrabold tabular-nums text-plum-800">
                {completion.percent}%
              </span>
            }
          >
            <div className="h-2 overflow-hidden rounded-full bg-[#F1ECE6]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-plum-500 to-plum-800 transition-all duration-500"
                style={{ width: `${completion.percent}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-[#72677E]">
              {completion.percent === 100
                ? 'Profil Anda sudah lengkap.'
                : `Lengkapi ${completion.missing.length} data lagi: ${completion.missing.slice(0, 3).join(', ')}.`}
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-plum-700 hover:text-plum-900"
            >
              Perbarui profil <ArrowRight className="h-3 w-3" />
            </button>
          </DashboardSection>

          <DashboardSection
            title="Ringkasan akun"
            description="Persetujuan dan kontak darurat."
            icon={ShieldCheck}
          >
            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#F1ECE6] bg-[#FDFBF8] p-3">
                <span className="inline-flex items-center gap-2 text-[#5A5066]">
                  <FileCheck2 className="h-3.5 w-3.5 text-plum-600" />
                  Informed consent
                </span>
                <span className="font-bold text-plum-900">{consents.length} tercatat</span>
              </div>
              <div className="flex items-start justify-between gap-2 rounded-xl border border-[#F1ECE6] bg-[#FDFBF8] p-3">
                <span className="inline-flex items-center gap-2 text-[#5A5066]">
                  <HeartHandshake className="h-3.5 w-3.5 text-plum-600" />
                  Kontak darurat
                </span>
                <span className="max-w-[140px] text-right font-semibold text-plum-900">
                  {clientProfile?.emergency_contact_name
                    ? `${clientProfile.emergency_contact_name}${clientProfile.emergency_contact_phone ? ` · ${clientProfile.emergency_contact_phone}` : ''}`
                    : 'Belum diisi'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#F1ECE6] bg-[#FDFBF8] p-3">
                <span className="inline-flex items-center gap-2 text-[#5A5066]">
                  <Clock className="h-3.5 w-3.5 text-plum-600" />
                  Zona waktu
                </span>
                <span className="font-bold text-plum-900">WIB (GMT+7)</span>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-[#8E81A1]">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
              Catatan klinis Anda hanya dapat diakses oleh psikolog penanggung jawab.
            </p>
          </DashboardSection>

          <DashboardSection title="Butuh bantuan?" description="Kami siap membantu." icon={RefreshCw}>
            <p className="text-[10px] leading-relaxed text-[#72677E]">
              Jika Anda mengalami kendala teknis atau membutuhkan bantuan darurat, gunakan tombol
              bantuan di pojok kanan bawah atau hubungi hotline krisis 119 ext. 8.
            </p>
            <Link to="/contact" className="mt-3 inline-block">
              <Button variant="outline" size="sm" className="gap-1.5 text-[11px]">
                Hubungi Soulaide <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}
