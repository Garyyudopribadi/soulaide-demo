import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LogOut,
  LayoutDashboard,
  Calendar,
  Menu,
  X,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { useAuth } from '@/features/auth/useAuth.ts'
import { getRoleDashboardPath } from '@/features/auth/auth-context.ts'
import { getAssetUrl, handleImageFallback } from '@/lib/utils.ts'
import { useLandingContent } from '@/features/public-site/useLandingContent.ts'
import { useServices } from '@/features/services/useServices.ts'

export const Header: React.FC = () => {
  const location = useLocation()
  const { user, profile, role, signOut } = useAuth()
  const { data: landingContent } = useLandingContent()
  const { data: services = [] } = useServices()
  const topBar = landingContent.top_bar
  const hero = landingContent.hero
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  const serviceCount = services.length > 0 ? String(services.length) : '3'

  // Scroll listener for micro-bar collapse and robust scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)

      if (location.pathname === '/') {
        // Sections in reverse document order: kontak, faq, layanan, psikolog
        const sections = ['kontak', 'faq', 'layanan', 'psikolog']
        const headerOffset = 180 // Navbar height + breathing margin
        const currentScroll = window.scrollY + headerOffset

        let currentSection = ''
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId)
          if (el) {
            const top = el.offsetTop
            if (currentScroll >= top) {
              currentSection = sectionId
              break
            }
          }
        }
        setActiveSection(currentSection)
      } else {
        setActiveSection('')
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const navLinks = [
    { label: 'Beranda', to: '/#' },
    { label: 'Psikolog', to: '/#psikolog' },
    { label: 'Layanan', to: '/#layanan', badge: serviceCount },
    { label: 'FAQ', to: '/#faq' },
    { label: 'Kontak', to: '/#kontak' },
  ]

  const isLinkActive = (to: string) => {
    if (location.pathname === '/') {
      if (to === '/#') {
        return !activeSection && !location.hash
      }
      const sectionName = to.replace('/#', '')
      return activeSection === sectionName || location.hash === `#${sectionName}`
    }
    return location.pathname === to
  }

  const handleNavClick = (to: string, e?: React.MouseEvent) => {
    setMobileMenuOpen(false)
    if (to.includes('#') && location.pathname === '/') {
      const hash = to.split('#')[1]
      if (hash) {
        e?.preventDefault()
        const el = document.getElementById(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '-1')
          }
          el.focus({ preventScroll: true })
          window.history.pushState(null, '', `/#${hash}`)
        }
      } else {
        e?.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        window.history.pushState(null, '', '/')
      }
    }
  }

  const getDashboardPath = () => getRoleDashboardPath(role)

  const getRoleBadgeVariant = () => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'warning'
      case 'psychologist':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Clinical Assurance Micro-Bar (Editorial sanctuary tone, clean hairline dividers) */}
      <div
        className={`w-full bg-[#24152A] text-plum-100 border-b border-[#3D2545] transition-all duration-300 overflow-hidden ${
          scrolled ? 'max-h-0 opacity-0 border-b-0' : 'max-h-24 sm:max-h-11 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-9 flex flex-col sm:flex-row items-center justify-between gap-y-1 sm:gap-y-0 text-[11px] tracking-normal">
          <div className="flex items-center justify-center sm:justify-start gap-x-2 text-plum-200">
            <Clock className="w-3.5 h-3.5 text-plum-400 shrink-0" />
            <span>{topBar.schedule || 'Senin–Sabtu, sesuai perjanjian'}</span>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-x-2 text-plum-200">
            <a
              href={`tel:${topBar.crisis_phone || '119'}`}
              className="inline-flex items-center gap-1.5 text-champagne-200 hover:text-white font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-champagne-400 shrink-0" />
              <span>Hotline Krisis: <strong className="font-semibold text-white tracking-wide">{topBar.crisis_hotline || '119'}</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Glass Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/92 backdrop-blur-xl border-b border-[#E5DDD4] shadow-[0_10px_30px_-14px_rgba(41,23,56,0.14)]'
            : 'bg-white/75 backdrop-blur-lg border-b border-[#EAE3DC]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-19 flex items-center justify-between gap-4">
          {/* Brand Logo + Editorial Lockup (Borderless, seamless integration) */}
          <Link
            to="/"
            className="flex items-center gap-3 py-1 group focus:outline-hidden focus:ring-2 focus:ring-plum-600/40 rounded-xl"
            aria-label="Beranda Soulaide"
            onClick={(e) => handleNavClick('/#', e)}
          >
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src={hero.logo_image || getAssetUrl('/Soulaide Psi Arc Logo.webp')}
                alt="Soulaide Psychology"
                onError={handleImageFallback}
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-plum-900">
                  Soulaide
                </span>
                <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded-sm bg-plum-50 border border-plum-200/60 text-[9px] font-bold text-plum-700 uppercase tracking-wider">
                  Psi
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5D728F] mt-1">
                Counseling Psychology
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#FAF8F5]/90 border border-[#E5DDD5] shadow-[inset_0_1px_2px_rgba(41,23,56,0.04)]"
            aria-label="Navigasi Utama"
          >
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.to)

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(link.to, e)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-plum-900 text-white shadow-xs'
                      : 'text-[#4B3F59] hover:text-plum-900 hover:bg-white/80'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-plum-100 text-plum-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={getDashboardPath()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-10 px-3.5 rounded-full border-[#E2DAD1] bg-white hover:border-plum-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-plum-100 text-plum-700 flex items-center justify-center">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-semibold text-[#23192D] max-w-[140px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <Badge variant={getRoleBadgeVariant()} className="text-[10px] py-0 px-2">
                      {role || 'klien'}
                    </Badge>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="h-10 w-10 p-0 rounded-full text-[#7A6F85] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Keluar dari akun"
                  aria-label="Keluar dari akun"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 rounded-full text-[#4B3F59] hover:text-plum-800 font-semibold"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button
                    size="sm"
                    className="gap-2 h-10.5 px-5 rounded-full bg-gradient-to-r from-plum-800 via-plum-700 to-plum-600 hover:from-plum-900 hover:to-plum-700 text-white font-semibold shadow-[0_4px_14px_-3px_rgba(73,46,95,0.5)]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-plum-200" />
                    <span>Booking Sesi</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Action + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/booking">
              <Button size="sm" className="rounded-full bg-plum-700 text-white text-xs px-3.5 h-9 gap-1">
                <Calendar className="w-3 h-3 text-plum-200" />
                <span>Booking</span>
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E6DFD7] text-[#2E223A] hover:text-plum-700 hover:border-plum-300 focus:outline-hidden focus:ring-2 focus:ring-plum-600/30 transition-colors cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE3DC] bg-white/98 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-1" aria-label="Navigasi Mobile">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.to)

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(link.to, e)}
                  className={`px-4 py-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-plum-50 text-plum-900 border border-plum-200'
                      : 'text-[#4B3F59] hover:bg-sanctuary-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight bg-plum-100 text-plum-700">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-plum-700" />}
                </Link>
              )
            })}
          </nav>

          <div className="pt-3 border-t border-[#F0EAE3] space-y-2.5">
            {user ? (
              <div className="space-y-2.5">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-sanctuary-100 border border-[#E6DFD7]"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-plum-700" />
                    <span className="text-sm font-semibold text-[#23192D]">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                  <Badge variant={getRoleBadgeVariant()} className="text-[10px]">
                    {role || 'klien'}
                  </Badge>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-center gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari Akun
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center rounded-xl">
                    Masuk
                  </Button>
                </Link>
                <Link to="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center rounded-xl bg-plum-700 hover:bg-plum-800 text-white">
                    Booking Sesi
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2 text-center text-xs text-[#7A6F85] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-plum-600" />
            <span>Kerahasiaan data terjamin &amp; Kode Etik HIMPSI</span>
          </div>
        </div>
      )}
    </header>
  )
}
