import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { StatCard } from '@/components/dashboard/StatCard'
import { WeeklyLoadChart } from '@/components/dashboard/DashboardCharts'
import { PsychologistPresenceControl } from './PsychologistPresenceControl'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  Users,
  Video,
} from 'lucide-react'
import type { AssignedBookingItem, PresenceStatus, PsychologistTab, ScheduleDayItem } from './types'
import {
  countByDate,
  formatClock,
  formatSessionDate,
  getDayWindow,
  getRelativeDateLabel,
  toDateKey,
} from '@/lib/dashboard'

interface PsychologistOverviewTabProps {
  fullName: string
  credentials: string
  presence: PresenceStatus
  bookings: AssignedBookingItem[]
  schedules: ScheduleDayItem[]
  onPresenceChange: (status: PresenceStatus) => void
  onNavigateTab: (tab: PsychologistTab) => void
  onOpenClinicalNote: (booking: AssignedBookingItem) => void
  onOpenChat: (booking: AssignedBookingItem) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="success">Terkonfirmasi</Badge>
    case 'pending_payment':
      return <Badge variant="warning">Menunggu Pembayaran</Badge>
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

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

export const PsychologistOverviewTab: React.FC<PsychologistOverviewTabProps> = ({
  fullName,
  credentials,
  presence,
  bookings,
  schedules,
  onPresenceChange,
  onNavigateTab,
  onOpenClinicalNote,
  onOpenChat,
}) => {
  const todayKey = toDateKey(new Date())

  const todayBookings = bookings
    .filter((booking) => booking.session_date === todayKey && booking.status !== 'cancelled')
    .sort((a, b) => a.session_start_time.localeCompare(b.session_start_time))

  const upcomingBookings = bookings
    .filter(
      (booking) =>
        booking.session_date >= todayKey &&
        ['confirmed', 'rescheduled'].includes(booking.status)
    )
    .sort((a, b) =>
      `${a.session_date}${a.session_start_time}`.localeCompare(
        `${b.session_date}${b.session_start_time}`
      )
    )

  const completedCount = bookings.filter((booking) => booking.status === 'completed').length
  const pendingNotes = bookings.filter(
    (booking) => !booking.has_clinical_notes && ['confirmed', 'completed'].includes(booking.status)
  )

  const dayWindow = getDayWindow(7)
  const weeklyCounts = countByDate(bookings, dayWindow.map((day) => day.date))

  const activeSchedules = schedules.filter((schedule) => schedule.is_active)
  const weeklyHours = activeSchedules.reduce(
    (total, schedule) =>
      total + Math.max(0, timeToMinutes(schedule.end_time) - timeToMinutes(schedule.start_time)) / 60,
    0
  )

  const nextBooking = upcomingBookings.find(
    (booking) => booking.session_date > todayKey || booking.session_start_time > new Date().toTimeString().slice(0, 8)
  ) || upcomingBookings[0]

  return (
    <div className="space-y-5">
      <DashboardPageHeader
        eyebrow="Ruang Praktik Klinis"
        title="Selamat bertugas,"
        accent={fullName.split(',')[0]}
        icon={Stethoscope}
        description="Fokus pada klien yang Anda dampingi. Jadwal, catatan klinis, dan ketersediaan praktik tersusun dalam satu ruang kerja yang tenang."
        meta={
          <>
            {credentials && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DAD1] bg-white px-2.5 py-1 text-[10px] font-bold text-[#5A5066]">
                <ShieldCheck className="h-3 w-3 text-plum-600" />
                {credentials}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Kepatuhan etika HIMPSI
            </span>
          </>
        }
        actions={
          <>
            <div className="relative z-50 rounded-xl border border-[#E2DAD1] bg-white px-3 py-1.5 shadow-2xs flex flex-col items-start min-w-[210px]">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8E81A1]">
                Status kehadiran
              </p>
              <PsychologistPresenceControl
                currentStatus={presence}
                onStatusChange={onPresenceChange}
                align="right"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('calendar')}
              className="gap-1.5 text-[11px]"
            >
              <Clock className="h-3.5 w-3.5" />
              Kelola ketersediaan
            </Button>
          </>
        }
      />

      <div className="relative z-0 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Sesi hari ini"
          value={todayBookings.length}
          hint={todayBookings.length > 0 ? 'Siapkan ruang dan catatan' : 'Tidak ada sesi hari ini'}
          icon={CalendarDays}
          tone="plum"
          onClick={() => onNavigateTab('sessions')}
        />
        <StatCard
          label="Sesi mendatang"
          value={upcomingBookings.length}
          hint={nextBooking ? `Berikutnya ${getRelativeDateLabel(nextBooking.session_date)}` : 'Belum ada jadwal aktif'}
          icon={Clock}
          tone="sky"
          onClick={() => onNavigateTab('sessions')}
        />
        <StatCard
          label="Sesi selesai"
          value={completedCount}
          hint="Total riwayat pendampingan"
          icon={CheckCircle2}
          tone="emerald"
          onClick={() => onNavigateTab('sessions')}
        />
        <StatCard
          label="Catatan perlu diisi"
          value={pendingNotes.length}
          hint={pendingNotes.length > 0 ? 'Lengkapi sebelum lupa detail' : 'Semua catatan lengkap'}
          icon={FileText}
          tone={pendingNotes.length > 0 ? 'amber' : 'slate'}
          onClick={() => {
            if (pendingNotes[0]) onOpenClinicalNote(pendingNotes[0])
            else onNavigateTab('sessions')
          }}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <DashboardSection
            title="Agenda hari ini"
            description={`Jadwal praktik untuk ${formatSessionDate(todayKey, true)}.`}
            icon={Clock}
            action={
              todayBookings.length > 0 ? (
                <Badge variant="default" className="text-[10px]">
                  {todayBookings.length} sesi
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Kosong
                </Badge>
              )
            }
          >
            {todayBookings.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-[#DFD7CE] bg-[#FDFBF8] px-4 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-plum-100 bg-plum-50 text-plum-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-bold text-plum-950">Hari ini tanpa sesi terjadwal</p>
                <p className="mt-1 max-w-sm text-[10px] leading-relaxed text-[#72677E]">
                  Gunakan waktu ini untuk meninjau catatan, memperbarui ketersediaan, atau beristirahat.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateTab('sessions')}
                  className="mt-3 gap-1.5 text-[11px]"
                >
                  Lihat semua sesi <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative space-y-3">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#EEE8E1] bg-white p-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3 sm:w-32 sm:shrink-0">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-plum-200/70 bg-plum-50 text-plum-800">
                        <span className="text-sm font-extrabold leading-none">
                          {formatClock(booking.session_start_time)}
                        </span>
                        <span className="mt-0.5 text-[9px] font-semibold">
                          {formatClock(booking.session_end_time)}
                        </span>
                      </span>
                      <div className="sm:hidden">
                        <p className="text-xs font-bold text-plum-950">{booking.client.full_name}</p>
                        <p className="text-[10px] text-[#72677E]">{booking.service_name}</p>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
                        <p className="text-xs font-bold text-plum-950">{booking.client.full_name}</p>
                        {getStatusBadge(booking.status)}
                        {booking.has_clinical_notes ? (
                          <Badge variant="success" className="text-[9px]">
                            Catatan terisi
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[9px]">
                            Catatan belum
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-[#72677E]">
                        {booking.service_name} · {booking.service_duration} menit
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-[#8E81A1]">
                        {booking.delivery_method === 'online' ? (
                          <>
                            <Video className="h-3 w-3 text-sky-600" />
                            Sesi online
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 text-emerald-600" />
                            Tatap muka · Pondok Bambu
                          </>
                        )}
                        <span className="mx-1 text-[#D9D0C7]">•</span>
                        <span className="font-mono text-[9px]">{booking.booking_code}</span>
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {booking.delivery_method === 'online' && (
                        <a
                          href={booking.meeting_link || 'https://meet.google.com'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[10px] font-bold text-sky-800 transition-colors hover:bg-sky-100"
                        >
                          <Video className="h-3 w-3" />
                          Ruang sesi
                        </a>
                      )}
                      <Button
                        size="sm"
                        onClick={() => onOpenClinicalNote(booking)}
                        className="gap-1 px-2.5 text-[10px]"
                      >
                        <FileText className="h-3 w-3" />
                        Catatan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChat(booking)}
                        className="gap-1 px-2.5 text-[10px]"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Catatan klinis tertunda"
            description="Sesi yang memerlukan dokumentasi profesional Anda."
            icon={AlertCircle}
            action={
              pendingNotes.length > 0 ? (
                <Badge variant="warning" className="text-[10px]">
                  {pendingNotes.length} sesi
                </Badge>
              ) : (
                <Badge variant="success" className="gap-1 text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Lengkap
                </Badge>
              )
            }
          >
            {pendingNotes.length === 0 ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-900">Semua catatan sudah terisi</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-emerald-800/80">
                    Dokumentasi klinis Anda rapi dan siap untuk ditinjau kembali.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#F1ECE6]">
                {pendingNotes.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-plum-950">{booking.client.full_name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[#72677E]">
                        {getRelativeDateLabel(booking.session_date)} · {formatClock(booking.session_start_time)} WIB · {booking.service_name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenClinicalNote(booking)}
                      className="shrink-0 gap-1 text-[10px]"
                    >
                      Isi catatan <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Sesi mendatang"
            description="Klien yang akan Anda dampingi berikutnya."
            icon={Users}
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
                Belum ada sesi mendatang yang ditugaskan kepada Anda.
              </p>
            ) : (
              <div className="divide-y divide-[#F1ECE6]">
                {upcomingBookings.slice(0, 4).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-plum-100 bg-plum-50 text-plum-800">
                      <span className="text-[9px] font-bold uppercase">
                        {formatSessionDate(booking.session_date, false).split(' ')[1]}
                      </span>
                      <span className="text-xs font-extrabold leading-none">
                        {formatSessionDate(booking.session_date, false).split(' ')[0]}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-plum-950">{booking.client.full_name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[#72677E]">
                        {getRelativeDateLabel(booking.session_date)} · {formatClock(booking.session_start_time)} WIB · {booking.service_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenClinicalNote(booking)}
                      className="shrink-0 text-[10px] text-plum-700"
                    >
                      Detail <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <DashboardSection
            title="Sesi booking 7 hari ke depan"
            description="Jadwal sesi konsultasi per hari dalam sepekan ke depan."
            icon={CalendarDays}
          >
            <WeeklyLoadChart
              data={dayWindow.map((day) => ({
                label: day.label,
                date: day.date,
                count: weeklyCounts[day.date] || 0,
                isToday: day.isToday,
              }))}
              emptyMessage="Belum ada sesi dalam 7 hari ke depan."
            />
          </DashboardSection>

          <DashboardSection
            title="Ketersediaan praktik"
            description="Ringkasan jam buka yang aktif."
            icon={Clock}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('calendar')}
                className="text-[10px] text-plum-700"
              >
                Atur
              </Button>
            }
          >
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-[#F1ECE6] bg-[#FDFBF8] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#998EA4]">Hari aktif</p>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-plum-900">
                  {activeSchedules.length}
                  <span className="ml-1 text-[10px] font-semibold text-[#8E81A1]">/ 7</span>
                </p>
              </div>
              <div className="rounded-xl border border-[#F1ECE6] bg-[#FDFBF8] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#998EA4]">Jam / pekan</p>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-plum-900">
                  {Math.round(weeklyHours)}
                  <span className="ml-1 text-[10px] font-semibold text-[#8E81A1]">jam</span>
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {activeSchedules.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#DFD7CE] bg-white px-3 py-2 text-[10px] text-[#8E81A1]">
                  Belum ada jam praktik aktif. Atur ketersediaan agar klien dapat memesan.
                </p>
              ) : (
                activeSchedules.slice(0, 4).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#F1ECE6] bg-white px-3 py-2 text-[10px]"
                  >
                    <span className="font-bold text-[#5A5066]">{schedule.day_name}</span>
                    <span className="font-mono text-[#72677E]">
                      {formatClock(schedule.start_time)}–{formatClock(schedule.end_time)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Keamanan & Privasi"
            description="Standar kerahasiaan dan privasi data rekam medis klien."
            icon={ShieldCheck}
          >
            <div className="rounded-xl border border-plum-100 bg-plum-50/70 p-3.5">
              <p className="text-[10px] leading-relaxed text-plum-900">
                Catatan klinis bersifat rahasia dan hanya dapat diakses oleh Anda sebagai psikolog penanggung jawab serta
                super admin. Staf administrasi umum tidak memiliki akses ke rekam medis ini.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
                Data Terenkripsi & Akses Terlindungi
              </p>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}
