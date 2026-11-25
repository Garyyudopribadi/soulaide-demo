import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Users,
  CheckCircle2,
  Video,
  MapPin,
  Compass,
  Play,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { usePsychologists } from '@/features/psychologists/usePsychologists.ts'
import { useServices, calculateServicePrice, getServiceFeatures } from '@/features/services/useServices.ts'
import { formatIDR, getAssetUrl, handleImageFallback } from '@/lib/utils.ts'
import { isYouTubeUrl, parseYouTubeEmbedUrl } from '@/lib/storageManager.ts'
import { useLandingContent } from './useLandingContent.ts'
import type { DeliveryMethod, ProfessionalTier } from '@/types/index.ts'
import { FaqSection } from './FaqSection.tsx'
import { ContactSection } from './ContactSection.tsx'

const LOOPING_PHRASES = [
  {
    step: '01',
    text: 'A safe space to be heard.',
    sub: 'Ruang bercerita yang hangat, rahasia, dan bebas dari penghakiman.',
    tag: 'Ruang Aman & Empatik',
  },
  {
    step: '02',
    text: 'Care that meets you where you are.',
    sub: 'Pendampingan yang menyesuaikan ritme, kebutuhan, dan kenyamanan Anda.',
    tag: 'Pendekatan Personal',
  },
  {
    step: '03',
    text: 'Small steps toward feeling well.',
    sub: 'Langkah kecil yang terukur menuju pemulihan dan kejelasan emosi.',
    tag: 'Pemulihan Berkelanjutan',
  },
] as const

const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Pilih Layanan & Psikolog',
    description:
      'Tentukan kebutuhan Anda — Konseling Individu, MHCU, atau Bundling MHCU+Konseling Individu Online — lalu pilih pendamping Soul Guidance atau Soul Expert.',
    icon: Compass,
    detail: '3 format layanan resmi, 4 psikolog terverifikasi SIPP',
  },
  {
    step: '02',
    title: 'Atur Jadwal & Metode Sesi',
    description:
      'Pilih sesi Daring (Google Meet) atau Tatap Muka di Pondok Bambu sesuai waktu nyaman Anda dengan lead time minimal 24 jam.',
    icon: Calendar,
    detail: 'Kalender sinkron, konfirmasi jadwal langsung',
  },
  {
    step: '03',
    title: 'Mulai Sesi Privat & Terjaga',
    description:
      'Konfirmasi pembayaran transparan, terima tautan ruang sesi aman, dan jalani proses pendampingan berstandar Kode Etik HIMPSI.',
    icon: HeartHandshake,
    detail: 'Kerahasiaan medis terjamin & terlindungi',
  },
] as const

const CLINICAL_DOMAINS = [
  {
    id: 'emotion',
    category: 'Domain 01',
    title: 'Emosi & Regulasi Diri',
    subtitle: 'Mengenal, mengurai, dan mengelola dinamika perasaan harian.',
    icon: HeartHandshake,
    topics: [
      { name: 'Overthinking & kecemasan berlebih', note: 'Kerap mengantisipasi skenario terburuk' },
      { name: 'Stres berkepanjangan & burnout', note: 'Kelelahan emosional yang menguras energi' },
      { name: 'Regulasi emosi & mood swing', note: 'Kesulitan menstabilkan respons emosi' },
      { name: 'Mengenal diri & self-acceptance', note: 'Menerima kerentanan tanpa menghakimi' },
      { name: 'Self-esteem & kepercayaan diri', note: 'Membangun nilai diri yang lebih sehat' },
    ],
  },
  {
    id: 'life-path',
    category: 'Domain 02',
    title: 'Fase Hidup & Arah Karier',
    subtitle: 'Navigasi transisi hidup, tuntutan peran, dan tujuan masa depan.',
    icon: Compass,
    topics: [
      { name: 'Quarter-life crisis & arah hidup', note: 'Keraguan arah karier dan pilihan masa depan' },
      { name: 'Tekanan pekerjaan & akademik', note: 'Beban target dan ekspektasi lingkungan' },
      { name: 'Membangun kebiasaan adaptif', note: 'Mengubah pola maladaptif secara bertahap' },
      { name: 'Penataan tujuan hidup (life goals)', note: 'Menentukan prioritas realistis & bermakna' },
      { name: 'Caregiver burnout & adaptasi', note: 'Kelelahan merawat anggota keluarga / anak' },
    ],
  },
  {
    id: 'relationship',
    category: 'Domain 03',
    title: 'Relasi, Pasangan & Keluarga',
    subtitle: 'Menata batasan sehat, komunikasi asertif, dan dinamika interpersonal.',
    icon: Users,
    topics: [
      { name: 'Dinamika pasangan & pernikahan', note: 'Konflik komunikasi dan perbedaan prinsip' },
      { name: 'Toxic relationship & pemulihan', note: 'Melepaskan pola hubungan manipulatif' },
      { name: 'Boundaries (batasan sehat)', note: 'Belajar berkata tidak tanpa rasa bersalah' },
      { name: 'Trust issue & hambatan intimasi', note: 'Trauma masa lalu yang memengaruhi relasi' },
      { name: 'Parenting & kebutuhan khusus', note: 'Pola asuh suportif dan inklusi anak' },
    ],
  },
] as const

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: psychologists } = usePsychologists()
  const { data: services } = useServices()
  const { data: landingContent } = useLandingContent()
  const heroData = landingContent.hero
  const philosophyData = landingContent.philosophy
  const journeyData = landingContent.journey
  const loopingPhrases = heroData.looping_phrases?.length ? heroData.looping_phrases : LOOPING_PHRASES
  const journeySteps = journeyData?.steps?.length ? journeyData.steps : JOURNEY_STEPS
  const philosophyPillars = philosophyData?.pillars?.length ? philosophyData.pillars : [
    {
      tag: '01 · Soul',
      title: 'Ruang Jiwa Empatik',
      description: 'Menghargai keunikan emosi, cerita hidup, dan kerentanan Anda dengan penerimaan utuh.',
    },
    {
      tag: '02 · Aide',
      title: 'Pendampingan Aktif',
      description: 'Berjalan bersama Anda menemukan regulasi emosi dan langkah pemulihan yang aplikatif.',
    },
    {
      tag: '03 · Psi (Ψ)',
      title: 'Keilmuan & Etika',
      description: 'Intervensi berbasis bukti ilmiah (CBT, SFBT, Humanistik, ABA) sesuai Kode Etik HIMPSI.',
    },
  ]

  const [activePhraseIndex, setActivePhraseIndex] = useState(0)
  const [showMotionVideoModal, setShowMotionVideoModal] = useState(false)
  const [activeBrochureImg, setActiveBrochureImg] = useState<string | null>(null)
  const [activeTopicTab, setActiveTopicTab] = useState<string>('emotion')

  // Quick Session Concierge Simulation State
  const [quickTier, setQuickTier] = useState<ProfessionalTier>('Soul Guidance')
  const [quickMethod, setQuickMethod] = useState<DeliveryMethod>('online')
  const [quickServiceId, setQuickServiceId] = useState<string>('')

  const activeQuickService = services.find((s) => s.id === quickServiceId) || services[0]

  const getQuickEstimate = (): number => {
    return calculateServicePrice(activeQuickService, quickMethod, quickTier)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhraseIndex((prev) => (prev + 1) % loopingPhrases.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [loopingPhrases.length])

  const getPresencePill = (presence: string) => {
    switch (presence) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#EDF3EC] px-2 py-0.5 text-[10px] font-semibold text-[#33492F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F6B48]" />
            Tersedia Sesi
          </span>
        )
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-plum-50 px-2 py-0.5 text-[10px] font-semibold text-plum-800">
            <span className="w-1.5 h-1.5 rounded-full bg-plum-500" />
            Online
          </span>
        )
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-champagne-50 px-2 py-0.5 text-[10px] font-semibold text-champagne-700">
            <span className="w-1.5 h-1.5 rounded-full bg-champagne-500" />
            Sedang Sesi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#F0EBE2] px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A8F84]" />
            Offline
          </span>
        )
    }
  }

  return (
    <div className="pb-20">
      {/* =====================================================================
          ENHANCED BERANDA HERO HEADER — Iconic Soulaide Orbital Psi Arc &
          Kinetic Looping Header Experience (STRICTLY PRESERVED)
         ===================================================================== */}
      <section className="relative w-full overflow-hidden border-b border-line soulaide-hero-mesh pt-8 sm:pt-12 lg:pt-16 pb-14 sm:pb-20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-14">
          {/* MAIN 2-COLUMN EDITORIAL HERO STAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* LEFT COLUMN (5 cols): Iconic Soulaide Psi Arc Orbital Sanctuary */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 flex items-center justify-center">
                {/* Outer Concentric Orbital Ring 3 (Slow Rotation) */}
                <svg
                  viewBox="0 0 400 400"
                  className="absolute inset-0 w-full h-full animate-orbit-slow pointer-events-none"
                  aria-hidden="true"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="186"
                    fill="none"
                    stroke="rgba(73, 46, 95, 0.12)"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="200"
                    cy="200"
                    r="186"
                    fill="none"
                    stroke="rgba(166, 130, 196, 0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="36 180"
                    strokeLinecap="round"
                  />
                  <circle cx="200" cy="14" r="4" fill="#A682C4" />
                  <circle cx="386" cy="200" r="3" fill="#5D728F" />
                </svg>

                {/* Middle Concentric Orbital Ring 2 (Reverse Rotation) */}
                <svg
                  viewBox="0 0 400 400"
                  className="absolute inset-0 w-full h-full animate-orbit-reverse pointer-events-none"
                  aria-hidden="true"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="146"
                    fill="none"
                    stroke="rgba(73, 46, 95, 0.16)"
                    strokeWidth="1.2"
                    strokeDasharray="6 10"
                  />
                  <circle cx="54" cy="200" r="3.5" fill="#492E5F" />
                </svg>

                {/* Inner Soft Halo Ring 1 */}
                <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-white/95 via-white/80 to-plum-50/75 border border-white shadow-[0_24px_60px_-18px_rgba(73,46,95,0.22),inset_0_1px_4px_rgba(255,255,255,0.9)] backdrop-blur-md flex items-center justify-center p-7 sm:p-8">
                  <img
                    src={heroData.logo_image || getAssetUrl('/Soulaide Psi Arc Logo.webp')}
                    alt="Soulaide Psi Arc Logo"
                    onError={handleImageFallback}
                    className="w-full h-full object-contain select-none drop-shadow-[0_8px_18px_rgba(73,46,95,0.14)] transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Floating Glass Chip 1 (Top Right): Live Psychologists Avatar Stack */}
                <Link
                  to="/#psikolog"
                  className="absolute -top-2 -right-2 sm:top-2 sm:-right-4 z-20 flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-md bg-paper-card border border-line shadow-[0_10px_24px_-14px_rgba(33,27,36,0.28)] hover:border-plum-300 transition-colors animate-float-gentle group"
                >
                  <div className="flex -space-x-2 overflow-hidden">
                    {psychologists.slice(0, 4).map((p) => (
                      <img
                        key={p.id}
                        src={p.profileImage || p.cardImage}
                        alt={p.fullName}
                        onError={handleImageFallback}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-[#FCF9F3] object-cover object-top bg-plum-100"
                      />
                    ))}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-ink group-hover:text-plum-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      <span>4 Psikolog Klinis</span>
                    </div>
                    <span className="text-[10px] text-ink-muted font-medium">
                      Soul Expert &amp; Guidance
                    </span>
                  </div>
                </Link>

                {/* Floating Glass Chip 2 (Bottom Left): Ethical & SIPP Verification */}
                <div className="absolute -bottom-2 -left-2 sm:bottom-3 sm:-left-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-md bg-paper-card border border-line shadow-[0_10px_24px_-14px_rgba(33,27,36,0.28)] animate-float-gentle-delayed">
                  <div className="w-8 h-8 rounded-md bg-plum-900 text-[#FBF7F0] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-plum-100" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-[11px] font-bold text-ink">
                      100% Privasi Terjaga
                    </div>
                    <span className="text-[10px] text-ink-muted font-medium">
                      Kode Etik HIMPSI &amp; SIPP
                    </span>
                  </div>
                </div>

                {/* Floating Video Preview Button (Bottom Right) */}
                <button
                  type="button"
                  onClick={() => setShowMotionVideoModal(true)}
                  className="absolute bottom-1 right-1 sm:bottom-4 sm:right-2 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-plum-900/95 hover:bg-plum-800 text-[#FBF7F0] text-[10px] font-semibold backdrop-blur-md transition-colors cursor-pointer"
                  title="Putar video Soulaide"
                >
                  <Play className="w-2.5 h-2.5 fill-plum-200 text-plum-200" />
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Editorial Headline, Looping Value Stage & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Top Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-paper-card border border-line text-plum-800 text-[11px] font-semibold uppercase tracking-[0.08em]">
                <ShieldCheck className="w-3.5 h-3.5 text-plum-600" />
                <span>Layanan Konseling Psikologi • Online &amp; Pondok Bambu</span>
              </div>

              {/* Canonical 2-Line Headline from Soulaide Looping Header */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl xl:text-[3.65rem] font-extrabold text-plum-900 tracking-tight leading-[1.05]">
                  {heroData.heading_primary}
                  <span className="block mt-1 text-ink">
                    <span className="font-serif italic font-normal text-plum-700">
                      {heroData.heading_accent}
                    </span>
                  </span>
                </h1>
              </div>

              {/* Kinetic Looping Phrase Showcase Card */}
              <div className="relative rounded-lg bg-paper-card border border-line p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EDE6D9]">
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-plum-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-plum-600" />
                    {loopingPhrases[activePhraseIndex]?.tag}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-ink-muted">
                    {loopingPhrases[activePhraseIndex]?.step} / 03
                  </span>
                </div>

                {/* Animated Quote Text */}
                <div className="min-h-[4.25rem] flex flex-col justify-center">
                  <p
                    key={`hero-phrase-${activePhraseIndex}`}
                    className="text-xl sm:text-2xl md:text-[1.7rem] font-serif font-normal text-plum-800 tracking-normal leading-snug animate-phrase-enter"
                  >
                    {loopingPhrases[activePhraseIndex]?.text}
                  </p>
                  <p
                    key={`hero-sub-${activePhraseIndex}`}
                    className="text-xs sm:text-sm text-ink-muted mt-1.5 animate-phrase-enter"
                  >
                    {loopingPhrases[activePhraseIndex]?.sub}
                  </p>
                </div>

                {/* Interactive 3-Segment Timeline Selector */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {loopingPhrases.map((item, idx) => {
                    const isActive = idx === activePhraseIndex
                    return (
                      <button
                        key={item.text}
                        type="button"
                        onClick={() => setActivePhraseIndex(idx)}
                        className={`group text-left p-2.5 rounded-md border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-plum-50 border-plum-300'
                            : 'bg-transparent border-transparent hover:border-line hover:bg-paper'
                        }`}
                      >
                        {/* Segment Progress Line */}
                        <div className="h-0.5 w-full rounded-full bg-plum-200 overflow-hidden mb-2">
                          {isActive && (
                            <div
                              key={`seg-bar-${activePhraseIndex}`}
                              className="h-full bg-plum-700 animate-progress-bar"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-plum-700' : 'text-ink-muted'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-semibold truncate ${
                              isActive ? 'text-plum-900' : 'text-ink-muted'
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Clinical Narrative */}
              <p className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Soulaide mendampingi perjalanan kesehatan mental Anda secara aman, rahasia, dan tanpa penghakiman. Pilih pendampingan dari{' '}
                <strong className="text-plum-900 font-semibold">Soul Guidance</strong> atau{' '}
                <strong className="text-plum-900 font-semibold">Soul Expert</strong>, tersedia sesi daring (Google Meet) maupun tatap muka di Pondok Bambu, Jakarta Timur.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link to="/booking">
                  <Button
                    size="lg"
                    className="gap-2.5 h-12 px-6 rounded-md bg-plum-900 hover:bg-plum-800 text-[#FBF7F0] font-semibold"
                  >
                    <Calendar className="w-4 h-4 text-plum-200" />
                    <span>Jadwalkan Konseling</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#psikolog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 h-12 px-5 rounded-md"
                  >
                    <Users className="w-4 h-4 text-plum-600" />
                    <span>Kenali Psikolog Kami</span>
                  </Button>
                </a>
                <a
                  href="#layanan"
                  className="inline-flex h-12 items-center gap-1.5 px-3 text-sm font-semibold text-plum-800 underline decoration-plum-300 underline-offset-4 hover:text-plum-900"
                >
                  <span>Lihat 3 layanan</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* =================================================================
              INTERACTIVE QUICK SESSION CONCIERGE DOCK (Simulasi & Reservasi Cepat)
              Previous Horizontal Layout Harmonized with Anti-AI-Slop Styling
             ================================================================= */}
          <div className="pt-2">
            <div className="rounded-xl bg-paper-card border border-line shadow-[0_12px_32px_-16px_rgba(41,23,56,0.12)] p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Dock Label */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-plum-50 border border-plum-100 text-plum-700 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-plum-700">
                      Simulasi &amp; Reservasi Cepat
                    </div>
                    <p className="text-xs text-[#645A70]">
                      Sesuaikan kategori pendamping dan metode sesi Anda
                    </p>
                  </div>
                </div>

                {/* Interactive Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
                  {/* 1. Tier Selector */}
                  <div className="p-2.5 rounded-lg bg-sanctuary-100/90 border border-line">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#72677E] mb-1">
                      1. Kategori Psikolog
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['Soul Guidance', 'Soul Expert'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setQuickTier(t)}
                          className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer truncate ${
                            quickTier === t
                              ? t === 'Soul Expert'
                                ? 'bg-champagne-600 text-white shadow-xs'
                                : 'bg-plum-700 text-white shadow-xs'
                              : 'text-[#52475E] hover:bg-paper-card'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Delivery Method Selector */}
                  <div className="p-2.5 rounded-lg bg-sanctuary-100/90 border border-line">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#72677E] mb-1">
                      2. Metode Sesi
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setQuickMethod('online')}
                        className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          quickMethod === 'online'
                            ? 'bg-plum-700 text-white shadow-xs'
                            : 'text-[#52475E] hover:bg-paper-card'
                        }`}
                      >
                        <Video className="w-3 h-3" />
                        <span>Online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickMethod('offline')}
                        className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          quickMethod === 'offline'
                            ? 'bg-plum-700 text-white shadow-xs'
                            : 'text-[#52475E] hover:bg-paper-card'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Klinik</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Service Selector */}
                  <div className="p-2.5 rounded-lg bg-sanctuary-100/90 border border-line">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#72677E] mb-1">
                      3. Jenis Layanan
                    </label>
                    <select
                      value={activeQuickService?.id || ''}
                      onChange={(e) => setQuickServiceId(e.target.value)}
                      aria-label="Pilih Jenis Layanan"
                      className="w-full px-2.5 py-1.5 rounded-md bg-paper-card border border-line text-xs font-bold text-[#1E1429] focus:outline-hidden focus:ring-2 focus:ring-plum-500/20 cursor-pointer"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Price & Instant Action */}
                <div className="flex items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-line">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#72677E] block">
                      Estimasi Tarif
                    </span>
                    <span className="text-lg font-extrabold text-plum-900 tabular-nums">
                      {formatIDR(getQuickEstimate())}
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams()
                      if (activeQuickService?.id) params.set('service', activeQuickService.id)
                      params.set('tier', quickTier)
                      params.set('method', quickMethod)
                      navigate(`/booking?${params.toString()}`)
                    }}
                    className="rounded-lg h-11 px-5 gap-2 shrink-0 bg-plum-700 hover:bg-plum-800 text-white font-semibold"
                  >
                    <span>Cari Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Bottom Micro-Assurance Strip inside Dock */}
              <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#6B6177]">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-plum-600" />
                    <span>Online (Google Meet) &amp; Tatap Muka (Pondok Bambu)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-plum-600" />
                    <span>Pemesanan mengikat dengan lead time min. 24 jam</span>
                  </span>
                </div>
                <span className="font-semibold text-plum-800">
                  Resmi HIMPSI • Kerahasiaan 100% Terjaga
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal (Storage Video or YouTube Embed) */}
      {showMotionVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/80 backdrop-blur-sm"
          onClick={() => setShowMotionVideoModal(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-lg overflow-hidden shadow-2xl border border-line"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-sanctuary-100">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-ink">
                Soulaide Psychology — Video
              </span>
              <button
                type="button"
                onClick={() => setShowMotionVideoModal(false)}
                className="px-3 py-1 rounded-sm text-xs font-semibold text-ink-muted hover:text-ink hover:bg-white cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="bg-[#EEF3F8] aspect-video w-full flex items-center justify-center">
              {(() => {
                const videoUrl = philosophyData.video_url || getAssetUrl('/soulaide-header-loop.mp4')
                const isYt = isYouTubeUrl(videoUrl)
                const embedUrl = isYt ? parseYouTubeEmbedUrl(videoUrl) : null

                if (isYt && embedUrl) {
                  return (
                    <iframe
                      src={`${embedUrl}?autoplay=1&rel=0`}
                      title="Soulaide Psychology Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  )
                }

                return (
                  <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-contain block"
                  />
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BEHIND SOULAIDE — Brand Philosophy & Meaning of the Psi Arc
          Swiss Editorial + Organic Wellness
         ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="rounded-xl bg-paper-card border border-line p-6 sm:p-10 lg:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Editorial Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden border border-line bg-sanctuary-100 p-2.5 group rounded-md">
                <img
                  src={philosophyData.image_url || getAssetUrl('/apa itru Soulaide.webp')}
                  alt="Behind Soulaide Psychology — Makna di balik nama dan logo Soulaide"
                  onError={handleImageFallback}
                  className="w-full h-72 sm:h-84 object-cover object-center rounded-sm transition-transform duration-500 group-hover:scale-102"
                />
                <div className="mt-3 px-1 py-1 flex items-center justify-between text-xs text-ink-muted">
                  <span className="font-semibold text-plum-900">Filosofi Identitas Soulaide</span>
                  <span className="font-mono text-[11px] text-plum-700">Soul · Aide · Psi (Ψ)</span>
                </div>
              </div>
            </div>

            {/* Right Story & 3 Philosophy Pillars */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-plum-600" aria-hidden="true" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-plum-600">
                    {philosophyData.badge || 'Filosofi Klinis'}
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.08]">
                  {philosophyData.title}{' '}
                  <span className="italic text-plum-700">
                    {philosophyData.accent}
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  {philosophyData.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                {philosophyPillars.map((pillar, idx) => (
                  <div key={idx} className="border-t border-line pt-3.5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-plum-600 block">
                      {pillar.tag}
                    </span>
                    <h3 className="text-sm font-bold text-ink">{pillar.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted border-t border-line">
                <span className="inline-flex items-center gap-1.5 font-semibold text-plum-800">
                  <ShieldCheck className="w-4 h-4 text-plum-600" />
                  Terdaftar Surat Izin Praktik Psikolog (SIPP)
                </span>
                <span className="text-line-strong">•</span>
                <span>Klinik Pondok Bambu, Jakarta Timur &amp; Google Meet daring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HOW IT WORKS — Calm 3-Step Client Journey
          Structured Horizontal Clinical Flow
         ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-line">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-plum-600" aria-hidden="true" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-plum-600">
                {journeyData?.badge || 'Alur Konseling'}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.08]">
              {journeyData?.title_primary || 'Tiga langkah menuju'}{' '}
              <span className="italic text-plum-700">
                {journeyData?.title_accent || 'ruang aman Anda'}
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted max-w-md">
            {journeyData?.subtitle || 'Alur reservasi yang terukur, transparan, dan bebas kecemasan sejak awal.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {journeySteps.map((item, idx) => {
            const icons = [Compass, Calendar, HeartHandshake]
            const Icon = icons[idx % icons.length]
            return (
              <div
                key={item.step || idx}
                className="relative p-6 rounded-lg border border-line bg-paper-card flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-plum-50 border border-plum-100 text-plum-700 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-plum-600">
                      Langkah {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-[#EDE6D9] flex items-center justify-between text-xs text-plum-700 font-semibold">
                  <span>{item.detail}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* =====================================================================
          COUNSELING TOPICS EXPLORER — Intentional 3-Domain Clinical Matrix
          Anti-AI-Slop Tabbed / Categorized Index
         ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="rounded-xl bg-paper-card border border-line p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-line">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-plum-600" aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-plum-600">
                  Cakupan Topik
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.08]">
                Apa saja yang bisa Anda{' '}
                <span className="italic text-plum-700">ceritakan?</span>
              </h2>
              <p className="text-sm text-ink-muted">
                Bersama psikolog klinis Soulaide, Anda diajak mengurai pikiran, emosi, dan pola respons secara objektif.
              </p>
            </div>

            {/* Domain Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-md bg-sanctuary-100 border border-line">
              {CLINICAL_DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setActiveTopicTab(domain.id)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    activeTopicTab === domain.id
                      ? 'bg-plum-900 text-white'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {domain.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Domain Topic Grid */}
          {CLINICAL_DOMAINS.map((domain) => {
            if (domain.id !== activeTopicTab) return null
            const DomainIcon = domain.icon
            return (
              <div key={domain.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-plum-100 text-plum-800 flex items-center justify-center">
                      <DomainIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-plum-700">
                        {domain.category} • {domain.title}
                      </div>
                      <p className="text-xs text-ink-muted">{domain.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-ink-muted">
                    {domain.topics.length} Pokok Bahasan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {domain.topics.map((t) => (
                    <div
                      key={t.name}
                      className="p-4 rounded-md border border-line bg-paper flex flex-col justify-between space-y-2 hover:border-plum-300 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-plum-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-ink">{t.name}</h4>
                          <p className="text-[11px] text-ink-muted mt-0.5">{t.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Clinical Assurance Bar */}
          <div className="p-4 rounded-md bg-plum-900 text-plum-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <HeartHandshake className="w-4 h-4 text-champagne-200 shrink-0" />
              <span>
                <strong className="text-white">Catatan Klinis:</strong> Setiap tantangan emosi adalah valid. Anda tetap dapat berkonsultasi meskipun topik Anda tidak tertulis di atas.
              </span>
            </div>
            <Link
              to="/booking"
              className="text-xs font-bold font-mono uppercase text-champagne-200 hover:text-white underline underline-offset-4 shrink-0"
            >
              Mulai Konsultasi →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FEATURED PSYCHOLOGISTS — Clean Clinical Portraits & Credentials
         ===================================================================== */}
      <section id="psikolog" className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 pb-4 border-b border-line">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-plum-600" aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-plum-600">
                  Tim Berlisensi
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.08]">
                Psikolog Klinis <span className="italic text-plum-700">Soulaide</span>
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted max-w-xl">
                Didampingi langsung oleh 4 psikolog berlisensi SIPP dengan pendekatan ilmiah berbasis bukti.
              </p>
            </div>
            <a
              href="#kontak"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase text-plum-800 hover:text-plum-900 group"
            >
              <span>Konsultasi Koordinasi Care</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {psychologists.slice(0, 4).map((psych) => {
              const isExpert = psych.tier === 'Soul Expert'
              return (
                <Card
                  key={psych.id}
                  className="flex flex-col justify-between group rounded-lg sm:rounded-md border-line bg-paper-card p-3 sm:p-0"
                >
                  <div>
                    {/* MOBILE VIEW COMPACT CARD HEADER (< sm): Compact Horizontal Card with thumbnail */}
                    <div className="flex sm:hidden items-start gap-3 pb-3 border-b border-[#EDE6D9]">
                      <div
                        className={`relative w-20 h-24 rounded-md overflow-hidden shrink-0 border border-line ${
                          isExpert ? 'bg-[#F1E8DC]' : 'bg-[#EFEAF0]'
                        }`}
                      >
                        <img
                          src={psych.profileImage || psych.cardImage}
                          alt={psych.fullName}
                          loading="lazy"
                          className="w-full h-full object-cover object-[center_15%] mix-blend-multiply"
                          onError={handleImageFallback}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-sm font-bold text-ink leading-tight truncate">
                              {psych.fullName}
                            </h3>
                            {isExpert ? (
                              <span className="inline-flex items-center rounded-xs bg-champagne-600 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase text-[#FBF7F0] shrink-0">
                                Expert
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-xs bg-plum-800 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase text-[#FBF7F0] shrink-0">
                                Guidance
                              </span>
                            )}
                          </div>
                          {getPresencePill(psych.presence)}
                        </div>
                        <p className="text-[11px] font-semibold text-plum-600 truncate">{psych.credentials}</p>
                        <p className="text-[10px] text-ink-muted">
                          Pengalaman: <strong className="text-ink">{psych.experienceYears}</strong>
                        </p>
                        <p className="text-[10px] text-ink-muted truncate">
                          Pendekatan: <strong className="text-plum-800">{psych.approaches.join(', ')}</strong>
                        </p>
                      </div>
                    </div>

                    {/* DESKTOP VIEW STUDIO PORTRAIT (sm:) */}
                    <div
                      className={`hidden sm:block relative h-64 overflow-hidden rounded-t-md ${
                        isExpert ? 'bg-[#F1E8DC]' : 'bg-[#EFEAF0]'
                      }`}
                    >
                      <img
                        src={psych.profileImage || psych.cardImage}
                        alt={psych.fullName}
                        loading="lazy"
                        className="w-full h-full object-cover object-[center_15%] mix-blend-multiply transition-transform duration-500 group-hover:scale-102"
                        onError={handleImageFallback}
                      />

                      {/* Tier Label (Top Left) */}
                      <div className="absolute top-2.5 left-2.5">
                        {isExpert ? (
                          <span className="inline-flex items-center gap-1 rounded-xs bg-champagne-600 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#FBF7F0] shadow-xs">
                            Soul Expert
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-xs bg-plum-800 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#FBF7F0] shadow-xs">
                            Soul Guidance
                          </span>
                        )}
                      </div>

                      {/* Presence Indicator (Top Right) */}
                      <div className="absolute top-2.5 right-2.5">
                        {getPresencePill(psych.presence)}
                      </div>
                    </div>

                    {/* DESKTOP CARD HEADER (sm:) */}
                    <CardHeader className="hidden sm:block p-4 pb-2 space-y-1">
                      <CardTitle className="text-sm font-bold text-ink group-hover:text-plum-800 transition-colors">
                        {psych.fullName}
                      </CardTitle>
                      <p className="text-xs font-semibold text-plum-600 truncate">{psych.credentials}</p>
                      <p className="text-[11px] text-ink-muted">
                        Pengalaman: <strong className="text-ink">{psych.experienceYears}</strong>
                      </p>
                    </CardHeader>

                    {/* CARD CONTENT (Areas of practice) */}
                    <CardContent className="p-0 sm:px-4 pt-2 sm:pt-1 pb-3 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {psych.practiceAreas.slice(0, 3).map((area, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded-xs bg-sanctuary-100 border border-line text-ink-soft text-[9px] font-medium"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                      <p className="hidden sm:block text-[10px] text-ink-muted truncate">
                        Pendekatan: <strong className="text-plum-800">{psych.approaches.join(', ')}</strong>
                      </p>
                    </CardContent>
                  </div>

                  <CardFooter className="p-0 sm:p-4 pt-3 sm:border-t border-[#EDE6D9] grid grid-cols-2 gap-2">
                    <Link to={`/psychologists/${psych.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-[11px] h-8 sm:h-9 rounded-sm">
                        Detail Profil
                      </Button>
                    </Link>
                    <Link to={`/booking?psychologist=${psych.id}&tier=${psych.tier}`} className="w-full">
                      <Button size="sm" className="w-full text-[11px] h-8 sm:h-9 rounded-sm bg-plum-900 hover:bg-plum-800">
                        Jadwalkan
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SERVICES & PRICING — Editorial Matrix with Tier Switcher
          3 Canonical Services
         ===================================================================== */}
      <section id="layanan" className="py-20 bg-paper-card border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 pb-6 border-b border-line">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-plum-600" aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-plum-600">
                  Layanan &amp; Tarif
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.08]">
                <span className="italic text-plum-700">Layanan Konseling</span>
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted max-w-xl">
                Transparansi biaya penuh tanpa biaya tersembunyi. Tersedia sesi daring (Google Meet) maupun tatap muka di klinik.
              </p>
            </div>

            {/* Official Brochure Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveBrochureImg(getAssetUrl('/Layanan Kesehatan Mental.webp'))}
                className="text-xs rounded-sm"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-plum-600" />
                <span>Brosur Tarif Resmi</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => {
              const lower = svc.title.toLowerCase()
              const isBundle = lower.includes('bundl')

              const priceOnline = svc.priceOnline ?? svc.price ?? 110000
              const priceOffline =
                svc.priceOffline !== null && svc.priceOffline !== undefined && svc.deliveryMethods?.includes('offline')
                  ? svc.priceOffline
                  : null

              return (
                <Card
                  key={svc.id}
                  className={`flex flex-col justify-between transition-colors duration-200 relative rounded-md border-line ${
                    isBundle
                      ? 'border-plum-800 bg-[#FBF7EF]'
                      : 'bg-white hover:border-plum-400'
                  }`}
                >
                  <div>
                    <CardHeader className="p-6 pb-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {isBundle ? (
                          <Badge className="gap-1 bg-plum-800 text-[#FBF7F0] rounded-xs font-mono text-[9px] uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Paling Lengkap
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-xs font-mono text-[9px] uppercase text-ink-muted"
                          >
                            {svc.deliveryMethods?.includes('offline') ? 'Online & Tatap Muka' : 'Khusus Online'}
                          </Badge>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-muted text-right">
                          <Clock className="w-3.5 h-3.5 text-plum-500 shrink-0" />
                          <span>{svc.duration}</span>
                        </span>
                      </div>

                      <CardTitle className="text-lg font-bold text-ink leading-snug">
                        {svc.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-6 pt-1 pb-6 space-y-5">
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                        {svc.description}
                      </p>

                      <ul className="space-y-2 border-t border-[#EDE6D9] pt-4">
                        {getServiceFeatures(svc).map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-ink-soft">
                            <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Pricing Breakdown */}
                      <div className="p-3.5 rounded-md bg-paper border border-line space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted inline-flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-plum-600" />
                            Sesi Daring (Online)
                          </span>
                          <span className="font-bold font-mono text-sm text-ink tabular-nums">
                            {formatIDR(priceOnline)}
                          </span>
                        </div>
                        <div className="h-px bg-line" />
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-plum-600" />
                            Tatap Muka (Klinik)
                          </span>
                          <span className="font-bold font-mono text-sm text-plum-700 tabular-nums">
                            {priceOffline ? formatIDR(priceOffline) : 'Khusus Online'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="p-6 pt-4 border-t border-[#EDE6D9]">
                    <Link to={`/booking?service=${svc.id}`} className="w-full">
                      <Button
                        size="md"
                        className="w-full gap-2 rounded-sm bg-plum-900 hover:bg-plum-800 text-white font-semibold"
                      >
                        <span>Pilih Layanan Ini</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Official Brochure Lightbox Modal */}
      {activeBrochureImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/80 backdrop-blur-sm"
          onClick={() => setActiveBrochureImg(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-lg overflow-hidden shadow-2xl border border-line"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-sanctuary-100">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {[
                  { label: 'Katalog Utama', src: getAssetUrl('/Layanan Kesehatan Mental.webp') },
                  { label: 'Konseling Individu', src: getAssetUrl('/layanan/Konseling Individu.webp') },
                  { label: 'MHCU & Bundling', src: getAssetUrl('/layanan/Konseling Mental Health Check Up.webp') },
                  { label: 'Pengertian Online & Offline', src: getAssetUrl('/layanan/Online Offline.webp') },
                ].map((item) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setActiveBrochureImg(item.src)}
                    className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      activeBrochureImg === item.src
                        ? 'bg-plum-700 text-white'
                        : 'bg-white text-ink hover:bg-plum-50 border border-line'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveBrochureImg(null)}
                className="ml-2 px-3 py-1 rounded-sm text-xs font-bold text-ink-muted hover:text-ink hover:bg-white cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto bg-plum-950 p-3">
              <img
                src={activeBrochureImg}
                alt="Brosur Resmi Layanan Kesehatan Mental Soulaide"
                className="w-full h-auto rounded-md object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <FaqSection />
      <ContactSection />
    </div>
  )
}
