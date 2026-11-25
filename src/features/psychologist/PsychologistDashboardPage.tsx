import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/shared/LoadingState'
import { DashboardShell, type DashboardNavGroup } from '@/components/dashboard/DashboardShell'
import { DashboardSubHeader } from '@/components/dashboard/DashboardSubHeader'
import { useAuth } from '@/features/auth/useAuth'
import { psychologistService } from './psychologistService'
import { PsychologistOverviewTab } from './PsychologistOverviewTab'
import { PsychologistSessionsTab } from './PsychologistSessionsTab'
import { PsychologistCalendarTab } from './PsychologistCalendarTab'
import { PsychologistClinicalModal } from './PsychologistClinicalModal'
import { CustomerChatModal } from '@/features/customer/CustomerChatModal'
import { AccountProfileSecurity } from '@/components/dashboard/AccountProfileSecurity'
import type { CustomerBookingRecord } from '@/features/booking/bookingService'
import type { BookingStatus } from '@/types'
import type {
  AssignedBookingItem,
  PresenceStatus,
  PsychologistTab,
} from './types'
import { CalendarDays, CheckCircle2, Clock, FileText, LayoutDashboard, UserCheck } from 'lucide-react'
import { toDateKey } from '@/lib/dashboard'

export const PsychologistDashboardPage: React.FC = () => {
  const { user, profile, role } = useAuth()
  const [activeTab, setActiveTab] = useState<PsychologistTab>('overview')
  const [clinicalModalBooking, setClinicalModalBooking] = useState<AssignedBookingItem | null>(null)
  const [chatBooking, setChatBooking] = useState<CustomerBookingRecord | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const { data: psychologistProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['psychologist-profile', user?.id],
    queryFn: () => (user ? psychologistService.fetchMyPsychologistProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  })

  const psychologistId = psychologistProfile?.id || ''

  const {
    data: bookings = [],
    isLoading: loadingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['psychologist-assigned-bookings', psychologistId],
    queryFn: () => (psychologistId ? psychologistService.fetchMyAssignedBookings(psychologistId) : Promise.resolve([])),
    enabled: !!psychologistId,
  })

  const { data: presence = 'online', refetch: refetchPresence } = useQuery({
    queryKey: ['psychologist-presence', psychologistId],
    queryFn: () => (psychologistId ? psychologistService.fetchPresence(psychologistId) : Promise.resolve('online' as PresenceStatus)),
    enabled: !!psychologistId,
  })

  const { data: schedules = [], refetch: refetchSchedules } = useQuery({
    queryKey: ['psychologist-weekly-schedules', psychologistId],
    queryFn: () => (psychologistId ? psychologistService.fetchWeeklySchedules(psychologistId) : Promise.resolve([])),
    enabled: !!psychologistId,
  })

  const todayKey = toDateKey(new Date())
  const todayCount = bookings.filter((booking) => booking.session_date === todayKey).length
  const upcomingCount = bookings.filter(
    (booking) => booking.session_date >= todayKey && ['confirmed', 'rescheduled'].includes(booking.status)
  ).length
  const pendingNotesCount = bookings.filter(
    (booking) => !booking.has_clinical_notes && ['confirmed', 'completed'].includes(booking.status)
  ).length

  const handlePresenceChange = async (newStatus: PresenceStatus) => {
    const targetId = psychologistId || psychologistProfile?.id
    if (!targetId) {
      setNotice('Profil psikolog belum terhubung dengan akun Anda.')
      setTimeout(() => setNotice(null), 4000)
      return
    }
    try {
      await psychologistService.updatePresence(targetId, newStatus)
      await refetchPresence()
      setNotice(`Status kehadiran diperbarui menjadi ${newStatus.toUpperCase()}.`)
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal mengubah status kehadiran')
      setTimeout(() => setNotice(null), 4000)
    }
  }

  const handleOpenChat = (booking: AssignedBookingItem) => {
    const adapted: CustomerBookingRecord = {
      id: booking.id,
      bookingCode: booking.booking_code,
      sessionDate: booking.session_date,
      sessionStartTime: booking.session_start_time,
      sessionEndTime: booking.session_end_time,
      deliveryMethod: booking.delivery_method,
      status: booking.status as BookingStatus,
      notes: booking.notes,
      meetingLink: booking.meeting_link,
      locationAddress: booking.location_address,
      createdAt: booking.created_at,
      service: {
        id: booking.service_id,
        name: booking.service_name,
        durationMinutes: booking.service_duration,
        priceOnline: null,
        priceOffline: null,
      },
      psychologist: {
        id: psychologistId,
        fullName: psychologistProfile?.full_name || 'Psikolog',
        credentials: psychologistProfile?.credentials || '',
        cardImageUrl: null,
      },
    }
    setChatBooking(adapted)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Terkonfirmasi</span>
      case 'pending_payment':
        return <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">Menunggu Pembayaran</span>
      case 'rescheduled':
        return <span className="rounded-full border border-plum-200 bg-plum-50 px-2.5 py-0.5 text-[10px] font-bold text-plum-800">Jadwal Baru</span>
      case 'completed':
        return <span className="rounded-full border border-[#DDD5CC] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#4B3F59]">Selesai</span>
      case 'cancelled':
        return <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">Dibatalkan</span>
      default:
        return <span className="rounded-full border border-[#DDD5CC] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#4B3F59]">{status}</span>
    }
  }

  const navGroups: DashboardNavGroup[] = [
    {
      label: 'Ruang Praktik',
      items: [{ key: 'overview', label: 'Beranda praktik', icon: LayoutDashboard }],
    },
    {
      label: 'Operasional',
      items: [
        {
          key: 'sessions',
          label: 'Jadwal sesi',
          icon: CalendarDays,
          badge: todayCount,
          badgeTone: 'plum',
        },
        {
          key: 'calendar',
          label: 'Ketersediaan',
          icon: Clock,
        },
        {
          key: 'profile',
          label: 'Profil & Keamanan',
          icon: UserCheck,
        },
      ],
    },
  ]

  const displayName = psychologistProfile?.full_name || profile?.full_name || 'Psikolog Soulaide'

  const shellProps = {
    portalName: 'Soulaide Practice',
    portalTag: 'Portal Psikolog',
    roleLabel: role === 'super_admin' ? 'Super Admin' : 'Psikolog',
    navGroups,
    activeKey: activeTab,
    onNavigate: (key: string) => setActiveTab(key as PsychologistTab),
    userName: displayName,
    userEmail: user?.email || 'psikolog@soulaide.id',
    userMeta: psychologistProfile?.credentials || 'Praktik klinis',
    avatarUrl: psychologistProfile?.profile_image_url,
  }

  if (loadingProfile || loadingBookings) {
    return (
      <DashboardShell {...shellProps}>
        <LoadingState message="Menyiapkan ruang praktik Anda..." />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell {...shellProps}>
      {notice && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 sm:text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <PsychologistOverviewTab
          fullName={displayName}
          credentials={psychologistProfile?.credentials || ''}
          presence={presence}
          bookings={bookings}
          schedules={schedules}
          onPresenceChange={handlePresenceChange}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenClinicalNote={(booking) => setClinicalModalBooking(booking)}
          onOpenChat={handleOpenChat}
        />
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Operasional Klinis"
            title="Jadwal"
            accent="Sesi Konseling"
            description={`Anda memiliki ${todayCount} sesi hari ini dan ${upcomingCount} sesi mendatang. Kelola catatan klinis dan koordinasi klien di sini.`}
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-800">
                <FileText className="h-3.5 w-3.5" />
                {pendingNotesCount} catatan tertunda
              </span>
            }
          />
          <PsychologistSessionsTab
            bookings={bookings}
            onOpenClinicalNote={(booking) => setClinicalModalBooking(booking)}
            onOpenChat={handleOpenChat}
            getStatusBadge={getStatusBadge}
          />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Kapasitas Praktik"
            title="Ketersediaan &"
            accent="Jam Praktik"
            description="Atur jam buka mingguan Anda. Sistem menerapkan jeda persiapan 24 jam sebelum sesi klien."
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DAD1] bg-white px-3 py-1.5 text-[10px] font-bold text-[#5A5066]">
                <Clock className="h-3.5 w-3.5 text-plum-600" />
                Zona waktu WIB
              </span>
            }
          />
          <PsychologistCalendarTab
            psychologistId={psychologistId || psychologistProfile?.id || ''}
            schedules={schedules}
            onSchedulesUpdated={() => refetchSchedules()}
          />
        </div>
      )}

      {activeTab === 'profile' && user && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Praktisi Klinis"
            title="Profil &"
            accent="Keamanan Sandi"
            description="Perbarui informasi identitas profil dan kelola kata sandi akun praktisi psikologi Anda."
          />
          <AccountProfileSecurity
            userId={user.id}
            initialFullName={psychologistProfile?.full_name || profile?.full_name || ''}
            initialPhone={profile?.phone_number || ''}
            userEmail={user.email || ''}
            roleLabel="Psikolog"
            avatarUrl={psychologistProfile?.profile_image_url || profile?.avatar_url}
            onProfileUpdated={() => {
              // trigger refresh
            }}
          />
        </div>
      )}

      {clinicalModalBooking && (
        <PsychologistClinicalModal
          booking={clinicalModalBooking}
          psychologistId={psychologistId}
          onClose={() => setClinicalModalBooking(null)}
          onSessionUpdated={() => refetchBookings()}
        />
      )}

      {chatBooking && (
        <CustomerChatModal booking={chatBooking} onClose={() => setChatBooking(null)} />
      )}
    </DashboardShell>
  )
}
