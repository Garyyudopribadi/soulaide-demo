import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'
import { DashboardShell, type DashboardNavGroup } from '@/components/dashboard/DashboardShell'
import { DashboardSubHeader } from '@/components/dashboard/DashboardSubHeader'
import { useAuth } from '@/features/auth/useAuth'
import {
  fetchCustomerBookings,
  submitRescheduleRequest,
  cancelBooking,
  type CustomerBookingRecord,
} from '@/features/booking/bookingService'
import { validateRescheduleEligibility, getSelectableDates } from '@/features/booking/availability'
import { customerService } from './customerService'
import { CustomerOverviewTab } from './CustomerOverviewTab'
import { CustomerSessionsTab } from './CustomerSessionsTab'
import { CustomerPaymentsTab } from './CustomerPaymentsTab'
import { CustomerProfileTab } from './CustomerProfileTab'
import { CustomerNotificationsTab } from './CustomerNotificationsTab'
import { notificationService } from '@/features/chat/notificationService'
import { toDateKey } from '@/lib/dashboard'
import { CustomerReceiptModal } from './CustomerReceiptModal'
import { CustomerChatModal } from './CustomerChatModal'
import { MidtransSnapModal } from '@/features/payments/MidtransSnapModal'
import type { CustomerTab, CustomerPaymentItem } from './types'
import {
  CalendarDays,
  CreditCard,
  User,
  Bell,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react'

export const CustomerDashboardPage: React.FC = () => {
  const { user, profile, role } = useAuth()
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview')
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [rescheduleBooking, setRescheduleBooking] = useState<CustomerBookingRecord | null>(null)
  const [paymentBooking, setPaymentBooking] = useState<CustomerBookingRecord | null>(null)
  const [chatBooking, setChatBooking] = useState<CustomerBookingRecord | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<CustomerPaymentItem | null>(null)

  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('10:30')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false)

  const {
    data: bookings = [],
    isLoading: loadingBookings,
    refetch: loadBookings,
  } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () => (user ? fetchCustomerBookings(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const { data: clientProfile = null, refetch: loadProfile } = useQuery({
    queryKey: ['customer-client-profile', user?.id],
    queryFn: () => (user ? customerService.fetchCustomerClientProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  })

  const { data: payments = [], refetch: loadPayments } = useQuery({
    queryKey: ['customer-payments', user?.id],
    queryFn: () => (user ? customerService.fetchCustomerPaymentHistory(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const { data: consents = [] } = useQuery({
    queryKey: ['customer-consents', user?.id],
    queryFn: () => (user ? customerService.fetchCustomerConsents(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const { data: notifications = [], refetch: loadNotifications } = useQuery({
    queryKey: ['customer-notifications', user?.id],
    queryFn: () => (user ? customerService.fetchCustomerNotifications(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  useEffect(() => {
    if (!user) return
    const unsubscribe = notificationService.subscribeToNotifications(user.id, () => {
      loadNotifications()
    })
    return () => unsubscribe()
  }, [user, loadNotifications])

  const unreadNotifCount = notifications.filter((notification) => !notification.is_read).length
  const pendingPaymentCount = payments.filter((payment) => payment.status === 'pending').length
  const todayKey = toDateKey(new Date())
  const upcomingCount = bookings.filter(
    (booking) =>
      booking.sessionDate >= todayKey &&
      ['confirmed', 'pending_payment', 'reschedule_requested', 'rescheduled'].includes(booking.status)
  ).length

  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'Sahabat Soulaide'

  const navGroups: DashboardNavGroup[] = [
    {
      label: 'Ringkasan',
      items: [{ key: 'overview', label: 'Beranda saya', icon: LayoutDashboard }],
    },
    {
      label: 'Layanan',
      items: [
        {
          key: 'sessions',
          label: 'Sesi konseling',
          icon: CalendarDays,
          badge: upcomingCount,
        },
        {
          key: 'payments',
          label: 'Tagihan & kwitansi',
          icon: CreditCard,
          badge: pendingPaymentCount,
          badgeTone: 'amber',
        },
      ],
    },
    {
      label: 'Akun',
      items: [
        { key: 'profile', label: 'Profil & consent', icon: User },
        {
          key: 'notifications',
          label: 'Notifikasi',
          icon: Bell,
          badge: unreadNotifCount,
          badgeTone: 'amber',
        },
      ],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Terkonfirmasi</span>
      case 'pending_payment':
        return <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">Menunggu Pembayaran</span>
      case 'reschedule_requested':
        return <span className="rounded-full border border-[#E2DAD1] bg-[#F7F3EF] px-2.5 py-0.5 text-[10px] font-bold text-[#52475E]">Pengajuan Reschedule</span>
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

  const handleCancelBooking = async (booking: CustomerBookingRecord) => {
    if (!user) return
    if (!window.confirm(`Apakah Anda yakin ingin membatalkan sesi ${booking.bookingCode}?`)) return

    const res = await cancelBooking(booking.id, user.id, booking.status, 'Dibatalkan oleh klien')
    if (res.success) {
      setActionNotice(`Sesi ${booking.bookingCode} berhasil dibatalkan.`)
      loadBookings()
    } else {
      setActionError(res.error || 'Gagal membatalkan sesi.')
    }
    setTimeout(() => {
      setActionNotice(null)
      setActionError(null)
    }, 4000)
  }

  const handleOpenReschedule = (booking: CustomerBookingRecord) => {
    const check = validateRescheduleEligibility(booking.sessionDate, booking.sessionStartTime)
    if (!check.isEligible) {
      alert(check.message)
      return
    }
    setRescheduleBooking(booking)
    const dates = getSelectableDates(7)
    if (dates.length > 0) setProposedDate(dates[0].dateStr)
  }

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !rescheduleBooking || !proposedDate) return

    setIsSubmittingReschedule(true)
    const res = await submitRescheduleRequest(
      rescheduleBooking,
      user.id,
      proposedDate,
      proposedTime,
      rescheduleReason || 'Klien berhalangan pada jadwal sebelumnya'
    )
    setIsSubmittingReschedule(false)

    if (res.success) {
      setRescheduleBooking(null)
      setActionNotice('Permintaan reschedule berhasil diajukan dan sedang diproses tim admin.')
      loadBookings()
    } else {
      setActionError(res.error || 'Gagal mengajukan reschedule.')
    }
    setTimeout(() => {
      setActionNotice(null)
      setActionError(null)
    }, 4000)
  }

  const shellProps = {
    portalName: 'Soulaide Care',
    portalTag: 'Portal Klien',
    roleLabel: role === 'super_admin' ? 'Super Admin' : 'Klien',
    navGroups,
    activeKey: activeTab,
    onNavigate: (key: string) => setActiveTab(key as CustomerTab),
    userName: fullName,
    userEmail: user?.email || 'klien@soulaide.id',
    userMeta: 'Ruang konseling privat',
    avatarUrl: profile?.avatar_url,
    notificationCount: unreadNotifCount,
    onNotificationsClick: () => setActiveTab('notifications'),
  }

  if (loadingBookings) {
    return (
      <DashboardShell {...shellProps}>
        <LoadingState message="Menyiapkan ruang konseling Anda..." />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell {...shellProps}>
      {actionNotice && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 sm:text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 sm:text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <CustomerOverviewTab
          fullName={fullName}
          phoneNumber={profile?.phone_number}
          bookings={bookings}
          payments={payments}
          notifications={notifications}
          consents={consents}
          clientProfile={clientProfile}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onPayNow={(booking) => setPaymentBooking(booking)}
          onOpenChat={(booking) => setChatBooking(booking)}
        />
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Pusat Layanan"
            title="Sesi"
            accent="Konseling"
            description="Kelola jadwal, pembayaran, reschedule, dan koordinasi dengan psikolog pendamping."
          />
          <CustomerSessionsTab
            bookings={bookings}
            onPayNow={(booking) => setPaymentBooking(booking)}
            onOpenChat={(booking) => setChatBooking(booking)}
            onReschedule={(booking) => handleOpenReschedule(booking)}
            onCancel={(booking) => handleCancelBooking(booking)}
            getStatusBadge={getStatusBadge}
          />
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Keuangan"
            title="Tagihan &"
            accent="Kwitansi"
            description="Pantau status invoice pembayaran dan unduh kwitansi resmi untuk setiap transaksi."
          />
          <CustomerPaymentsTab
            payments={payments}
            onViewReceipt={(payment) => setSelectedReceipt(payment)}
          />
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Akun"
            title="Profil &"
            accent="Persetujuan"
            description="Lengkapi identitas dan kontak darurat, serta tinjau arsip informed consent Anda."
          />
          <CustomerProfileTab
            userId={user?.id || ''}
            initialFullName={profile?.full_name || ''}
            initialPhone={profile?.phone_number || ''}
            userEmail={user?.email || ''}
            avatarUrl={profile?.avatar_url}
            clientProfile={clientProfile}
            consents={consents}
            onProfileUpdated={() => loadProfile()}
          />
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Akun"
            title="Kotak"
            accent="Notifikasi"
            description="Pembaruan jadwal, status pembayaran, dan pesan penting dari tim Soulaide."
          />
          <CustomerNotificationsTab
            notifications={notifications}
            onMarkAsRead={async (id) => {
              await customerService.markNotificationRead(id)
              loadNotifications()
            }}
            onMarkAllAsRead={async () => {
              if (user?.id) {
                await customerService.markAllNotificationsRead(user.id)
                loadNotifications()
              }
            }}
          />
        </div>
      )}

      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-plum-950/55 backdrop-blur-sm"
            onClick={() => setRescheduleBooking(null)}
            aria-label="Tutup formulir reschedule"
          />
          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-[#EAE3DC] bg-white p-5 shadow-2xl sm:p-6">
            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-plum-200 bg-plum-50 text-plum-700">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-plum-950">
                    Ajukan perubahan jadwal
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] text-[#8E81A1]">
                    {rescheduleBooking.bookingCode}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#72677E]">
                    Diajukan minimal 8 jam sebelum sesi dan maksimal 1 kali per pemesanan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="block text-[11px] font-bold text-[#3C3148]">Tanggal baru</span>
                  <select
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#DFD7CE] bg-white p-3 text-xs focus:border-plum-500 focus:ring-2 focus:ring-plum-500/30"
                  >
                    {getSelectableDates(7).map((date) => (
                      <option key={date.dateStr} value={date.dateStr}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-[11px] font-bold text-[#3C3148]">Jam sesi</span>
                  <select
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#DFD7CE] bg-white p-3 text-xs focus:border-plum-500 focus:ring-2 focus:ring-plum-500/30"
                  >
                    <option value="09:00">09:00 WIB</option>
                    <option value="10:30">10:30 WIB</option>
                    <option value="13:30">13:30 WIB</option>
                    <option value="15:00">15:00 WIB</option>
                    <option value="16:30">16:30 WIB</option>
                    <option value="19:00">19:00 WIB</option>
                  </select>
                </label>
              </div>

              <label className="space-y-1">
                <span className="block text-[11px] font-bold text-[#3C3148]">Alasan pengajuan</span>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={3}
                  placeholder="Berikan alasan perubahan jadwal agar psikolog dan admin dapat mengonfirmasi slot alternatif..."
                  className="w-full rounded-xl border border-[#DFD7CE] bg-white p-3 text-xs focus:border-plum-500 focus:ring-2 focus:ring-plum-500/30"
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleBooking(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingReschedule} className="text-xs">
                  {isSubmittingReschedule ? 'Mengirim...' : 'Kirim pengajuan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentBooking && (
        <MidtransSnapModal
          isOpen={Boolean(paymentBooking)}
          onClose={() => setPaymentBooking(null)}
          bookingId={paymentBooking.id}
          bookingCode={paymentBooking.bookingCode}
          serviceName={paymentBooking.service.name}
          amount={
            paymentBooking.deliveryMethod === 'offline'
              ? (paymentBooking.service.priceOffline || 0)
              : (paymentBooking.service.priceOnline || 0)
          }
          onPaymentSuccess={() => {
            setPaymentBooking(null)
            setActionNotice('Pembayaran berhasil diverifikasi. Status sesi kini dikonfirmasi.')
            loadBookings()
            loadPayments()
          }}
        />
      )}

      {selectedReceipt && (
        <CustomerReceiptModal
          payment={selectedReceipt}
          customerName={profile?.full_name || user?.email?.split('@')[0] || 'Klien Soulaide'}
          customerEmail={user?.email || ''}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {chatBooking && (
        <CustomerChatModal booking={chatBooking} onClose={() => setChatBooking(null)} />
      )}
    </DashboardShell>
  )
}
