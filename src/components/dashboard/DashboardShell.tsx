import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'
import { getInitials } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

export interface DashboardNavItem {
  key: string
  label: string
  icon: LucideIcon
  badge?: number
  badgeTone?: 'plum' | 'amber' | 'rose'
  hint?: string
}

export interface DashboardNavGroup {
  label: string
  items: DashboardNavItem[]
}

export interface DashboardShellProps {
  portalName: string
  portalTag: string
  roleLabel: string
  navGroups: DashboardNavGroup[]
  activeKey: string
  onNavigate: (key: string) => void
  userName: string
  userEmail: string
  userMeta?: string
  avatarUrl?: string | null
  notificationCount?: number
  onNotificationsClick?: () => void
  children: React.ReactNode
}

const formatToday = (): string =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

const badgeToneClasses: Record<NonNullable<DashboardNavItem['badgeTone']>, string> = {
  plum: 'bg-plum-100 text-plum-800',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-100 text-rose-700',
}

interface SidebarContentProps {
  portalName: string
  portalTag: string
  roleLabel: string
  navGroups: DashboardNavGroup[]
  activeKey: string
  onNavigate: (key: string) => void
  userName: string
  userEmail: string
  userMeta?: string
  avatarUrl?: string | null
  onClose?: () => void
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  portalName,
  portalTag,
  roleLabel,
  navGroups,
  activeKey,
  onNavigate,
  userName,
  userEmail,
  userMeta,
  avatarUrl,
  onClose,
}) => {
  const { signOut } = useAuth()

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-none">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-plum-300"
          aria-label="Kembali ke beranda Soulaide"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-1.5">
            <img
              src="/Soulaide Psi Arc Logo.webp"
              alt=""
              className="h-full w-full object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-xl font-bold leading-none text-white">
              Soulaide
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-plum-200">
              {portalName}
            </span>
          </span>
        </Link>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-plum-200">
            {portalTag}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Aktif
          </span>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 pb-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-champagne-200 to-champagne-500 text-xs font-extrabold text-plum-950 shadow-inner">
                {getInitials(userName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{userName}</p>
              <p className="truncate text-[11px] text-plum-200">{userEmail}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
            <Badge
              variant="outline"
              className="border-champagne-200/25 bg-champagne-500/15 px-2 text-[10px] font-bold uppercase tracking-wide text-champagne-100"
            >
              {roleLabel}
            </Badge>
            {userMeta && (
              <span className="truncate text-right text-[10px] text-plum-200">{userMeta}</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 px-3 pb-5" aria-label="Navigasi dashboard">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-plum-300/80">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.key === activeKey
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-white text-plum-900 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)]'
                        : 'text-plum-100/85 hover:bg-white/[0.08] hover:text-white'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        isActive
                          ? 'border-plum-200/70 bg-plum-50 text-plum-800'
                          : 'border-white/10 bg-white/[0.05] text-plum-200 group-hover:text-white'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums',
                          isActive
                            ? 'bg-plum-100 text-plum-800'
                            : badgeToneClasses[item.badgeTone || 'plum']
                        )}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-plum-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/10 px-4 py-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
          <p className="flex items-start gap-2 text-[10px] leading-relaxed text-plum-200">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
            <span>Sesi terenkripsi, akses terisolasi, dan kepatuhan etika HIMPSI.</span>
          </p>
        </div>
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-plum-200 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            Lihat situs publik
          </span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-plum-200 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Keluar dari akun
        </button>
      </div>
    </div>
  )
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  portalName,
  portalTag,
  roleLabel,
  navGroups,
  activeKey,
  onNavigate,
  userName,
  userEmail,
  userMeta,
  avatarUrl,
  notificationCount = 0,
  onNotificationsClick,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeItem = navGroups.flatMap((group) => group.items).find((item) => item.key === activeKey)

  const handleNavigate = (key: string) => {
    onNavigate(key)
    setMobileOpen(false)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeKey])

  useEffect(() => {
    if (!mobileOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const sidebarProps = {
    portalName,
    portalTag,
    roleLabel,
    navGroups,
    activeKey,
    onNavigate: handleNavigate,
    userName,
    userEmail,
    userMeta,
    avatarUrl,
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-hidden bg-plum-950 lg:flex xl:w-[292px]">
        <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-plum-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-champagne-500/10 blur-3xl" />
        <div className="relative flex h-full w-full flex-col">
          <SidebarContent {...sidebarProps} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu dashboard">
          <button
            type="button"
            className="absolute inset-0 bg-plum-950/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu dashboard"
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] bg-plum-950 shadow-2xl">
            <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-plum-500/20 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white"
                aria-label="Tutup menu"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent {...sidebarProps} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#E8E1D9] bg-[#F7F4EF]/92 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DDD5CC] bg-white text-plum-900 shadow-2xs transition-colors hover:border-plum-300 lg:hidden"
                aria-label="Buka menu dashboard"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-plum-500">
                  {portalName}
                </p>
                <p className="truncate text-sm font-bold text-plum-950">
                  {activeItem?.label || 'Dashboard'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden text-[11px] font-medium capitalize text-[#72677E] xl:block">
                {formatToday()}
              </span>
              {onNotificationsClick && (
                <button
                  type="button"
                  onClick={onNotificationsClick}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDD5CC] bg-white text-[#5A5066] shadow-2xs transition-colors hover:border-plum-300 hover:text-plum-800"
                  aria-label={`Buka notifikasi${notificationCount > 0 ? `, ${notificationCount} belum dibaca` : ''}`}
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-500 px-1 text-[9px] font-extrabold text-plum-950">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              )}
              <Link
                to="/"
                className="hidden items-center gap-1.5 rounded-xl border border-[#DDD5CC] bg-white px-3 py-2 text-[11px] font-semibold text-[#4B3F59] shadow-2xs transition-colors hover:border-plum-300 hover:text-plum-800 sm:flex"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Situs
              </Link>
              <div className="ml-0.5 flex items-center gap-2 rounded-xl border border-[#DDD5CC] bg-white py-1 pl-1 pr-2 shadow-2xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-plum-100 text-[10px] font-extrabold text-plum-800">
                    {getInitials(userName)}
                  </span>
                )}
                <div className="hidden min-w-0 md:block">
                  <p className="max-w-[120px] truncate text-[11px] font-bold leading-tight text-plum-950">
                    {userName}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-plum-500">
                    {roleLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-enter mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
