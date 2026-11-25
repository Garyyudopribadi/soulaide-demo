import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'
import { getAssetUrl, handleImageFallback } from '@/lib/utils.ts'
import { useLandingContent } from '@/features/public-site/useLandingContent.ts'

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="1.9"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const ThreadsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.095 5.467 0 12.186 0c6.719 0 12.186 5.467 12.186 11.814 0 .686-.065 1.365-.19 2.029-.208 1.107-1.196 1.838-2.308 1.63-1.109-.208-1.84-1.197-1.632-2.308a9.47 9.47 0 0 0 .13-1.351c0-5.195-4.225-9.42-9.42-9.42-5.195 0-9.42 4.225-9.42 9.42s4.225 9.42 9.42 9.42c2.81 0 5.434-1.258 7.185-3.418.734-.906 2.06-.98 2.873-.166.814.814.773 2.115-.166 2.873C18.665 22.42 15.534 24 12.186 24z" />
    <path d="M12.186 17.558c-3.172 0-5.744-2.572-5.744-5.744s2.572-5.744 5.744-5.744 5.744 2.572 5.744 5.744c0 .604-.49 1.094-1.094 1.094s-1.094-.49-1.094-1.094c0-1.965-1.591-3.556-3.556-3.556s-3.556 1.591-3.556 3.556 1.591 3.556 3.556 3.556c1.173 0 2.219-.57 2.868-1.455.518-.707 1.488-.868 2.203-.357.715.51.876 1.484.364 2.202-1.206 1.666-3.14 2.723-5.32 2.723z" />
  </svg>
)

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

export const Footer: React.FC = () => {
  const location = useLocation()
  const { data: landingContent } = useLandingContent()
  const footerData = landingContent.footer
  const heroData = landingContent.hero

  const handleAnchorClick = (to: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to.includes('#') && location.pathname === '/') {
      const hash = to.split('#')[1]
      if (hash) {
        e.preventDefault()
        const el = document.getElementById(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '-1')
          }
          el.focus({ preventScroll: true })
          window.history.pushState(null, '', `/#${hash}`)
        }
      }
    }
  }

  return (
    <footer className="bg-plum-950 text-[#D7CEE0] mt-auto relative overflow-hidden">
      {/* Subtle Ambient Aura */}
      <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-plum-700/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-plum-500/10 blur-3xl pointer-events-none" />

      {/* Upper Crisis Safety Bar */}
      <div className="border-b border-white/10 bg-[#231333]/90 backdrop-blur-sm py-3.5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-champagne-200 text-center sm:text-left">
            <AlertTriangle className="w-4 h-4 text-champagne-500 shrink-0" />
            <span>
              <strong className="text-white">Layanan Krisis Darurat:</strong> Jika Anda atau orang terdekat berada dalam bahaya, segera hubungi Hotline Kesehatan Jiwa di{' '}
              <strong className="text-champagne-100">119 ext 8</strong>.
            </span>
          </div>
          <a
            href="tel:119"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-champagne-500/15 text-champagne-100 border border-champagne-500/40 font-semibold hover:bg-champagne-500/25 transition-colors shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-champagne-200" />
            Hubungi 119 Bebas Pulsa
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3.5 group" aria-label="Beranda Soulaide">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <img
                  src={heroData.logo_image || getAssetUrl('/Soulaide Psi Arc Logo.webp')}
                  alt="Soulaide Psychology"
                  onError={handleImageFallback}
                  className="h-10 w-auto object-contain brightness-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-xl font-semibold text-white tracking-tight">
                  Soulaide
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-plum-300 mt-1">
                  Counseling Psychology
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#B7ABCA] leading-relaxed max-w-sm">
              {footerData.tagline}
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={footerData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#C8BCD8] hover:text-white hover:border-plum-400/60 hover:bg-plum-700/60 flex items-center justify-center transition-all"
                aria-label="Kunjungi Instagram Soulaide"
                title="Instagram @soulaide"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={footerData.threads}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#C8BCD8] hover:text-white hover:border-plum-400/60 hover:bg-plum-700/60 flex items-center justify-center transition-all"
                aria-label="Kunjungi Threads Soulaide"
                title="Threads @soulaide"
              >
                <ThreadsIcon className="w-4 h-4" />
              </a>
              <a
                href={footerData.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#C8BCD8] hover:text-white hover:border-plum-400/60 hover:bg-plum-700/60 flex items-center justify-center transition-all"
                aria-label="Kunjungi Facebook Soulaide"
                title="Facebook Soulaide"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={footerData.youtube || 'https://youtube.com/@soulaide'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#C8BCD8] hover:text-white hover:border-plum-400/60 hover:bg-plum-700/60 flex items-center justify-center transition-all"
                aria-label="Kunjungi Channel YouTube Soulaide"
                title="YouTube Soulaide"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-plum-300">
              Layanan
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C8BCD8]">
              <li>
                <Link
                  to="/#layanan"
                  onClick={(e) => handleAnchorClick('/#layanan', e)}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Layanan Konseling Individu
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
              <li>
                <Link
                  to="/#layanan"
                  onClick={(e) => handleAnchorClick('/#layanan', e)}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Layanan MHCU (Check Up)
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
              <li>
                <Link
                  to="/#layanan"
                  onClick={(e) => handleAnchorClick('/#layanan', e)}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Bundling MHCU + Konseling
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
              <li className="pt-1 text-xs text-plum-300/80">
                Daring &amp; Tatap Muka
              </li>
            </ul>
          </div>

          {/* Navigation Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-plum-300">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C8BCD8]">
              <li>
                <Link
                  to="/#psikolog"
                  onClick={(e) => handleAnchorClick('/#psikolog', e)}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Profil Psikolog
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                  Reservasi Jadwal
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
              <li>
                <Link
                  to="/#faq"
                  onClick={(e) => handleAnchorClick('/#faq', e)}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Pertanyaan Umum
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
              <li>
                <Link
                  to="/#kontak"
                  onClick={(e) => handleAnchorClick('/#kontak', e)}
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Kontak &amp; Lokasi
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all text-plum-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Location Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-plum-300">
              Lokasi Praktik
            </h4>
            <div className="space-y-3 text-xs text-[#C8BCD8] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-plum-300 shrink-0 mt-0.5" />
                <span>Pondok Bambu, Duren Sawit, Jakarta Timur 13430</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-plum-300 shrink-0 mt-0.5" />
                <span>Senin – Sabtu (Sesuai Perjanjian)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-plum-300 shrink-0" />
                <span>halo@soulaide.id</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-plum-300 shrink-0" />
                <span>+62 896-3086-9804</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-14 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E81A1]">
          <p>© {new Date().getFullYear()} {footerData.copyright}</p>
          <div className="flex items-center gap-4">
            <Link
              to="/#faq"
              onClick={(e) => handleAnchorClick('/#faq', e)}
              className="hover:text-white transition-colors"
            >
              Privasi &amp; Kerahasiaan
            </Link>
            <span className="opacity-40">•</span>
            <Link
              to="/#faq"
              onClick={(e) => handleAnchorClick('/#faq', e)}
              className="hover:text-white transition-colors"
            >
              Ketentuan Reservasi
            </Link>
            <span className="opacity-40">•</span>
            <Link
              to="/#kontak"
              onClick={(e) => handleAnchorClick('/#kontak', e)}
              className="hover:text-white transition-colors"
            >
              Bantuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
