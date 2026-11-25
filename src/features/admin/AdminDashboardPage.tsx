import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/shared/LoadingState'
import { useAuth } from '@/features/auth/useAuth'
import {
  DashboardShell,
  type DashboardNavGroup,
} from '@/components/dashboard/DashboardShell'
import { DashboardSubHeader } from '@/components/dashboard/DashboardSubHeader'
import { adminService } from './adminService'
import { AdminOverviewTab } from './AdminOverviewTab'
import { AdminBookingsTab } from './AdminBookingsTab'
import { AdminPaymentsTab } from './AdminPaymentsTab'
import { AdminReportsTab } from './AdminReportsTab'
import { AdminStaffTab } from './AdminStaffTab'
import { AdminAuditLogsTab } from './AdminAuditLogsTab'
import { AdminCmsServices } from './AdminCmsServices'
import { AdminCmsPsychologists } from './AdminCmsPsychologists'
import { AdminCmsFaqs } from './AdminCmsFaqs'
import { AdminCmsSettings } from './AdminCmsSettings'
import { AdminCmsLanding } from './AdminCmsLanding'
import { AccountProfileSecurity } from '@/components/dashboard/AccountProfileSecurity'
import type { AdminTab } from './types'
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Users,
  Shield,
  Activity,
  HelpCircle,
  Settings,
  Globe,
  UserCheck,
} from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const { user, profile, role } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: kpis = {
      totalBookings: 0,
      confirmedBookings: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      verifiedPsychologists: 4,
      activeServices: 3,
    },
    isLoading: loadingKpis,
    refetch: refetchKpis,
  } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: () => adminService.fetchAdminKpis(),
    enabled: !!user,
  })

  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminService.fetchAdminBookings(),
    enabled: !!user,
  })

  const { data: payments = [], refetch: refetchPayments } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminService.fetchAdminPayments(),
    enabled: !!user,
  })

  const { data: staffMembers = [], refetch: refetchStaff } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => adminService.fetchStaffMembers(),
    enabled: !!user,
  })

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminService.fetchAuditLogs(50),
    enabled: !!user,
  })

  const allPsychologists = Array.from(
    new Map(bookings.map((b) => [b.psychologist.id, b.psychologist])).values()
  ).map((p) => ({
    id: p.id,
    fullName: p.full_name,
  }))

  const bookingAttentionCount =
    bookings.filter((b) => b.status === 'pending_payment' || b.status === 'reschedule_requested')
      .length
  const pendingGatewayPayments = payments.filter((p) => p.status === 'pending').length

  const navGroups: DashboardNavGroup[] = [
    {
      label: 'Ikhtisar',
      items: [{ key: 'overview', label: 'Ringkasan', icon: LayoutDashboard }],
    },
    {
      label: 'Operasional',
      items: [
        {
          key: 'bookings',
          label: 'Reservasi & Jadwal',
          icon: CalendarDays,
          badge: bookingAttentionCount,
          badgeTone: 'amber',
        },
        {
          key: 'payments',
          label: 'Pembayaran & Refund',
          icon: CreditCard,
          badge: pendingGatewayPayments,
          badgeTone: 'amber',
        },
        {
          key: 'reports',
          label: 'Laporan & Rekapitulasi',
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      label: 'Pengelolaan',
      items: [
        { key: 'landing', label: 'Konten Landing Page', icon: Globe },
        { key: 'services', label: 'Layanan & Tarif', icon: FileText },
        { key: 'psychologists', label: 'Profil Psikolog', icon: Users },
        { key: 'faqs', label: 'Pusat Bantuan', icon: HelpCircle },
        { key: 'settings', label: 'Pengaturan Situs', icon: Settings },
      ],
    },
    {
      label: 'Tata Kelola',
      items: [
        { key: 'staff', label: 'Staf & Otoritas', icon: Shield },
        { key: 'audit-logs', label: 'Jejak Audit', icon: Activity },
        { key: 'profile', label: 'Profil & Keamanan', icon: UserCheck },
      ],
    },
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetchKpis(), refetchBookings(), refetchPayments(), refetchStaff()])
    } finally {
      setIsRefreshing(false)
    }
  }

  const shellProps = {
    portalName: 'Soulaide Ops',
    portalTag: 'Portal Administrator',
    roleLabel: role === 'super_admin' ? 'Super Admin' : 'Admin',
    navGroups,
    activeKey: activeTab,
    onNavigate: (key: string) => setActiveTab(key as AdminTab),
    userName: profile?.full_name || 'Administrator Soulaide',
    userEmail: user?.email || 'admin@soulaide.id',
    userMeta: 'Operasional klinik',
    avatarUrl: profile?.avatar_url,
  }

  if (loadingKpis) {
    return (
      <DashboardShell {...shellProps}>
        <LoadingState message="Memuat dashboard operasional..." />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell {...shellProps}>
      {activeTab === 'overview' && (
        <AdminOverviewTab
          kpis={kpis}
          bookings={bookings}
          payments={payments}
          staffCount={staffMembers.length}
          recentLogs={auditLogs}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Operasional"
            title="Reservasi &"
            accent="Jadwal Sesi"
            description="Pantau alur reservasi, konfirmasi pembayaran, pengajuan reschedule, dan penugasan psikolog."
          />
          <AdminBookingsTab
            bookings={bookings}
            allPsychologists={allPsychologists}
            onRefresh={() => {
              refetchBookings()
              refetchKpis()
            }}
          />
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Keuangan"
            title="Transaksi &"
            accent="Pembayaran"
            description="Pantau pembayaran Midtrans, telusuri status transaksi, dan kelola refund secara transparan."
          />
          <AdminPaymentsTab
            payments={payments}
            onRefresh={() => {
              refetchPayments()
              refetchKpis()
            }}
          />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Eksekutif"
            title="Laporan &"
            accent="Rekapitulasi"
            description="Ekspor data operasional dan keuangan ke format Excel (.xls) dan PDF resmi berstandar klinis."
          />
          <AdminReportsTab
            bookings={bookings}
            payments={payments}
            userName={profile?.full_name || 'Administrator'}
          />
        </div>
      )}

      {activeTab === 'landing' && <AdminCmsLanding />}
      {activeTab === 'services' && <AdminCmsServices />}
      {activeTab === 'psychologists' && <AdminCmsPsychologists />}

      {activeTab === 'staff' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Tata Kelola"
            title="Staf &"
            accent="Otoritas Akses"
            description="Kelola peran pengguna. Perubahan wewenang hanya dapat dilakukan oleh Super Admin."
          />
          <AdminStaffTab
            staffMembers={staffMembers}
            currentUserRole={role || 'admin'}
            onRefresh={() => refetchStaff()}
          />
        </div>
      )}

      {activeTab === 'audit-logs' && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Tata Kelola"
            title="Catatan Audit"
            accent="Sistem"
            description="Riwayat perubahan status sesi, refund, penugasan psikolog, serta pembaruan otoritas staf."
          />
          <AdminAuditLogsTab logs={auditLogs} />
        </div>
      )}

      {activeTab === 'faqs' && <AdminCmsFaqs />}
      {activeTab === 'settings' && <AdminCmsSettings />}

      {activeTab === 'profile' && user && (
        <div className="space-y-5">
          <DashboardSubHeader
            eyebrow="Akun Pengelola"
            title="Profil &"
            accent="Keamanan Akses"
            description="Perbarui informasi identitas staf dan kelola kata sandi akun administratif Anda."
          />
          <AccountProfileSecurity
            userId={user.id}
            initialFullName={profile?.full_name || ''}
            initialPhone={profile?.phone_number || ''}
            userEmail={user.email || ''}
            roleLabel={role === 'super_admin' ? 'Super Admin' : 'Admin'}
            avatarUrl={profile?.avatar_url}
            onProfileUpdated={() => {
              // trigger refresh
            }}
          />
        </div>
      )}
    </DashboardShell>
  )
}
