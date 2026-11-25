import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Info,
  ShieldCheck,
  Sparkles,
  Check,
  Calendar,
  Clock,
  ArrowRight,
  HelpCircle,
  Video,
  MapPin,
  HeartHandshake,
  FileImage,
  CheckCircle2,
  Compass,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { useServices, calculateServicePrice, getServiceFeatures } from '@/features/services/useServices.ts'
import { formatIDR, getAssetUrl } from '@/lib/utils.ts'
import type { ProfessionalTier } from '@/types/index.ts'

const BROCHURE_GALLERY = [
  { label: 'Katalog Layanan Utama', src: getAssetUrl('/Layanan Kesehatan Mental.webp') },
  { label: 'Konseling Individu', src: getAssetUrl('/layanan/Konseling Individu.webp') },
  { label: 'MHCU & Paket Bundling', src: getAssetUrl('/layanan/Konseling Mental Health Check Up.webp') },
  { label: 'Tarif Psikolog Soul Expert', src: getAssetUrl('/layanan/Online Offline.webp') },
] as const

export const ServicesPage: React.FC = () => {
  const { data: services } = useServices()
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'online' | 'offline'>('all')
  const [previewTier, setPreviewTier] = useState<ProfessionalTier>('Soul Guidance')
  const [activeBrochure, setActiveBrochure] = useState<string | null>(null)

  const filteredServices = services.filter((svc) => {
    if (selectedMethod === 'all') return true
    if (selectedMethod === 'online') return svc.deliveryMethods ? svc.deliveryMethods.includes('online') : true
    if (selectedMethod === 'offline') return svc.deliveryMethods ? svc.deliveryMethods.includes('offline') : true
    return true
  })

  const getTierPrice = (
    svc: typeof services[0],
    method: 'online' | 'offline',
    tier: ProfessionalTier
  ): number | null => {
    if (method === 'offline') {
      if (svc.priceOffline === null || svc.priceOffline === undefined || !svc.deliveryMethods?.includes('offline')) {
        return null
      }
    }
    return calculateServicePrice(svc, method, tier)
  }

  const getServiceBrochure = (title: string): string => {
    const lower = title.toLowerCase()
    if (lower.includes('bundl') || lower.includes('mhcu')) return getAssetUrl('/layanan/Konseling Mental Health Check Up.webp')
    if (lower.includes('individu')) return getAssetUrl('/layanan/Konseling Individu.webp')
    return getAssetUrl('/Layanan Kesehatan Mental.webp')
  }

  return (
    <div className="pb-20 space-y-14">
      {/* =====================================================================
          ENHANCED SERVICES HERO HEADER
         ===================================================================== */}
      <section className="relative w-full overflow-hidden border-b border-[#E5DDD4] soulaide-hero-mesh pt-12 pb-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-plum-300/25 blur-3xl animate-breathe" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#5D728F]/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-plum-200/80 text-plum-800 text-xs font-semibold shadow-2xs backdrop-blur-sm">
            <HeartHandshake className="w-3.5 h-3.5 text-plum-600" />
            <span>Katalog Layanan Resmi Soulaide Psychology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#1E1429] tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Layanan Konseling &amp;{' '}
            <span className="font-serif italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-plum-800 via-plum-600 to-[#5D728F]">
              Pemeriksaan Kesehatan Mental
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#554B61] leading-relaxed max-w-3xl mx-auto">
            Bersama Psikolog Soulaide, kami siap membantu memahami kondisi psikologis Anda tanpa dihakimi. Tersedia secara{' '}
            <strong className="text-plum-900">Daring (Google Meet)</strong> maupun{' '}
            <strong className="text-plum-900">Tatap Muka (Luring)</strong> di Pondok Bambu, Jakarta Timur.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveBrochure('/Layanan Kesehatan Mental.webp')}
              className="rounded-full bg-white/95 hover:bg-white gap-2 h-11 px-5"
            >
              <FileImage className="w-4 h-4 text-plum-600" />
              <span>Lihat Brosur Infografis Resmi (4)</span>
            </Button>
            <Link to="/booking">
              <Button className="rounded-full gap-2 h-11 px-6">
                <Calendar className="w-4 h-4 text-plum-200" />
                <span>Langsung Reservasi Jadwal</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Professional Tier Selection Guide */}
        <div className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-plum-600">
              Pilih Kategori Pendamping
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1429]">
              Perbedaan <span className="font-serif italic font-semibold text-plum-700">Soul Guidance</span> &amp;{' '}
              <span className="font-serif italic font-semibold text-champagne-700">Soul Expert</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#645A70]">
              Klik salah satu kategori di bawah untuk melihat simulasi tarif pada seluruh kartu layanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <button
              type="button"
              onClick={() => setPreviewTier('Soul Guidance')}
              className={`p-6 sm:p-7 rounded-3xl border text-left space-y-3.5 transition-all cursor-pointer relative overflow-hidden ${
                previewTier === 'Soul Guidance'
                  ? 'border-plum-600 bg-gradient-to-br from-plum-50/90 via-white to-plum-50/40 ring-2 ring-plum-500/25 shadow-md'
                  : 'border-[#EAE3DC] bg-white hover:border-plum-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-plum-700 ring-4 ring-plum-100" />
                  <h3 className="font-extrabold text-lg text-[#1E1429]">Soul Guidance</h3>
                </div>
                <Badge className="bg-plum-700 text-white border-0 text-[10px] px-3 py-1">
                  Psikolog Klinis &amp; Konselor
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#5A5066] leading-relaxed">
                Didedikasikan bagi Anda yang menghadapi stres kerja/akademik, kecemasan harian, overthinking, quarter-life crisis, burnout, dan kebutuhan regulasi emosi.
              </p>
              <div className="pt-2 border-t border-[#EAE3DC]/80 flex items-center justify-between text-xs font-semibold text-plum-800">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-plum-600 shrink-0" />
                  Mulai Rp89.000 (MHCU) &amp; Rp110.000 (Konseling)
                </span>
                <span className="text-[11px] underline">Aktifkan Tarif</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPreviewTier('Soul Expert')}
              className={`p-6 sm:p-7 rounded-3xl border text-left space-y-3.5 transition-all cursor-pointer relative overflow-hidden ${
                previewTier === 'Soul Expert'
                  ? 'border-champagne-600 bg-gradient-to-br from-champagne-50/90 via-white to-champagne-50/40 ring-2 ring-champagne-500/25 shadow-md'
                  : 'border-[#EAE3DC] bg-white hover:border-champagne-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-champagne-600" />
                  <h3 className="font-extrabold text-lg text-[#1E1429]">Soul Expert</h3>
                </div>
                <Badge className="bg-champagne-600 text-white border-0 text-[10px] px-3 py-1">
                  Psikolog Senior &gt;10 Thn
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#5A5066] leading-relaxed">
                Dipandu oleh Finandita Utari, M.Psi., Psikolog., CTC., CGA. Khusus untuk dinamika pernikahan/keluarga, trauma mendalam, asesmen kompleks, dan parenting kebutuhan khusus.
              </p>
              <div className="pt-2 border-t border-[#EAE3DC]/80 flex items-center justify-between text-xs font-semibold text-champagne-700">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-champagne-600 shrink-0" />
                  Penanganan klinis senior &amp; diagnostik mendalam
                </span>
                <span className="text-[11px] underline">Aktifkan Tarif</span>
              </div>
            </button>
          </div>
        </div>

        {/* Modality & Tier Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-2xl bg-white border border-[#EAE3DC] shadow-2xs">
          <div className="flex flex-wrap justify-center items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedMethod('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedMethod === 'all'
                  ? 'bg-plum-700 text-white shadow-xs'
                  : 'text-[#52475E] hover:bg-sanctuary-100'
              }`}
            >
              Semua Layanan ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('online')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMethod === 'online'
                  ? 'bg-plum-700 text-white shadow-xs'
                  : 'text-[#52475E] hover:bg-sanctuary-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Sesi Daring (Google Meet)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('offline')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMethod === 'offline'
                  ? 'bg-plum-700 text-white shadow-xs'
                  : 'text-[#52475E] hover:bg-sanctuary-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Tatap Muka (Pondok Bambu)
            </button>
          </div>

          <div className="flex items-center gap-2 bg-sanctuary-100 p-1 rounded-xl border border-[#EAE3DC]">
            <span className="text-[11px] font-semibold text-[#72677E] pl-2.5 hidden md:inline">
              Simulasi Tarif:
            </span>
            {(['Soul Guidance', 'Soul Expert'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setPreviewTier(tier)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewTier === tier
                    ? tier === 'Soul Expert'
                      ? 'bg-champagne-600 text-white shadow-xs'
                      : 'bg-plum-700 text-white shadow-xs'
                    : 'text-[#52475E] hover:text-[#23192D]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Canonical Services Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {filteredServices.map((svc) => {
            const features = getServiceFeatures(svc)
            const isBundle = svc.title.toLowerCase().includes('bundl')
            const onlinePrice = getTierPrice(svc, 'online', previewTier)
            const offlinePrice = getTierPrice(svc, 'offline', previewTier)
            const brochureSrc = getServiceBrochure(svc.title)

            return (
              <Card
                key={svc.id}
                className={`flex flex-col justify-between rounded-3xl transition-all duration-300 ${
                  isBundle
                    ? 'border-2 border-champagne-500/80 bg-gradient-to-b from-champagne-50/55 via-white to-white shadow-[0_18px_40px_-18px_rgba(168,122,41,0.28)] hover:-translate-y-1'
                    : 'sanctuary-card-hover'
                }`}
              >
                <div>
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      {isBundle ? (
                        <Badge variant="warning" className="gap-1 px-3 py-0.5 text-[11px] font-bold">
                          <Sparkles className="w-3 h-3" /> Best Value • Hemat
                        </Badge>
                      ) : (
                        <Badge
                          variant={previewTier === 'Soul Expert' ? 'warning' : 'default'}
                          className="text-[10px] uppercase tracking-wider"
                        >
                          {previewTier}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-[#72677E] font-medium">
                        <Clock className="w-3.5 h-3.5 text-plum-400" />
                        <span>{isBundle ? '90 Menit Total' : svc.title.toLowerCase().includes('mhcu') ? 'Asesmen + 30m' : '60 Menit'}</span>
                      </div>
                    </div>

                    <CardTitle className="text-xl font-bold text-[#1E1429] leading-snug">
                      {svc.title}
                    </CardTitle>
                    <p className="text-[11px] font-semibold text-plum-700 leading-snug">
                      {svc.duration}
                    </p>
                    <p className="text-xs sm:text-sm text-[#645A70] leading-relaxed">
                      {svc.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Pricing Box */}
                    <div className="p-4 rounded-2xl bg-sanctuary-100 border border-[#EAE3DC] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#72677E]">
                          Struktur Tarif ({previewTier})
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveBrochure(brochureSrc)}
                          className="text-[10px] font-bold text-plum-700 hover:underline cursor-pointer"
                        >
                          Lihat Poster
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-[#52475E] flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-plum-500" /> Sesi Daring (Online)
                        </span>
                        <span className="font-bold text-[#1E1429] tabular-nums">
                          {onlinePrice !== null ? formatIDR(onlinePrice) : '-'}
                        </span>
                      </div>

                      <div className="h-px bg-[#EAE3DC]" />

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-[#52475E] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-plum-500" /> Tatap Muka (Klinik)
                        </span>
                        <span className="font-bold text-plum-800 tabular-nums">
                          {offlinePrice !== null ? formatIDR(offlinePrice) : 'Khusus Online'}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-[#23192D]">Cakupan Layanan:</div>
                      <ul className="space-y-2 text-xs text-[#5A5066]">
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-plum-100 text-plum-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                            <span className="leading-relaxed">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-4 border-t border-[#F2ECE6]">
                  <Link to={`/booking?service=${svc.id}`} className="w-full">
                    <Button className="w-full gap-2 h-11 rounded-xl">
                      <Calendar className="w-4 h-4 text-plum-200" />
                      <span>Pilih Jadwal Sesi Ini</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Counseling Topics Section (From Official Brochure) */}
        <div className="rounded-3xl bg-white border border-[#EAE3DC] p-6 sm:p-9 space-y-6 shadow-2xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="px-3 py-0.5">Panduan Topik Sesi</Badge>
            <h3 className="text-2xl font-extrabold text-[#1E1429]">
              Contoh Topik <span className="font-serif italic font-semibold text-plum-700">Konseling</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#645A70]">
              Anda tetap dapat menceritakan kondisi Anda meskipun topik yang dialami belum tertulis di bawah ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-sanctuary-100/70 border border-[#EAE3DC] space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-plum-900">
                <HeartHandshake className="w-4 h-4 text-plum-600" />
                <span>Emosi &amp; Pemahaman Diri</span>
              </div>
              <ul className="space-y-2 text-xs text-[#5A5066]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Overthinking &amp; kecemasan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Stres &amp; burnout berkepanjangan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Mengenal diri lebih dalam</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Self-esteem &amp; kepercayaan diri</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-sanctuary-100/70 border border-[#EAE3DC] space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-plum-900">
                <Compass className="w-4 h-4 text-plum-600" />
                <span>Kehidupan &amp; Pengembangan Diri</span>
              </div>
              <ul className="space-y-2 text-xs text-[#5A5066]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Quarter-life crisis &amp; transisi dewasa</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Tekanan pekerjaan atau akademik</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Membangun kebiasaan yang lebih sehat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>Mengatur tujuan hidup (goals)</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-sanctuary-100/70 border border-[#EAE3DC] space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-plum-900">
                <Users className="w-4 h-4 text-champagne-600" />
                <span>Relasi &amp; Hubungan</span>
              </div>
              <ul className="space-y-2 text-xs text-[#5A5066]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne-600 shrink-0" />
                  <span>Masalah pasangan, keluarga &amp; teman</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne-600 shrink-0" />
                  <span>Toxic relationship &amp; trust issue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne-600 shrink-0" />
                  <span>Boundaries (batasan sehat dalam relasi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-champagne-600 shrink-0" />
                  <span>Kesulitan komunikasi &amp; parenting inklusi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* MHCU Clinical Reporting Notice */}
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-plum-950 via-plum-900 to-plum-800 text-plum-100 rounded-3xl p-6 sm:p-7 flex items-start gap-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-champagne-200" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="font-bold text-white text-sm sm:text-base">
              Informasi Khusus Laporan Evaluasi MHCU
            </p>
            <p className="text-plum-100/85 leading-relaxed">
              Penyusunan dan analisis klinis mendalam laporan hasil pemeriksaan Mental Health Check Up (MHCU) memerlukan waktu hingga{' '}
              <strong className="text-white">2 minggu</strong> setelah seluruh rangkaian asesmen selesai. Dokumen hasil resmi akan diunggah secara privat ke dashboard klien Anda demi menjaga kerahasiaan medis.
            </p>
          </div>
        </div>

        {/* Trust & Guarantee Footer Card */}
        <div className="max-w-5xl mx-auto p-6 rounded-3xl bg-white border border-[#EAE3DC] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-plum-50 border border-plum-100 text-plum-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm sm:text-base text-[#1E1429]">
                Perlindungan Privasi &amp; Kode Etik HIMPSI
              </h4>
              <p className="text-xs text-[#645A70] leading-relaxed">
                Seluruh catatan dan riwayat asesmen Anda disimpan dengan proteksi akses ketat dan hanya diakses oleh psikolog penanggung jawab.
              </p>
            </div>
          </div>
          <Link to="/faq" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap rounded-full px-4">
              <HelpCircle className="w-4 h-4 text-plum-600" />
              <span>Pelajari Kebijakan Sesi</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Official Brochure Gallery Modal */}
      {activeBrochure && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/75 backdrop-blur-sm"
          onClick={() => setActiveBrochure(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAE3DC] bg-sanctuary-100">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {BROCHURE_GALLERY.map((item) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setActiveBrochure(item.src)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      activeBrochure === item.src
                        ? 'bg-plum-700 text-white'
                        : 'bg-white text-[#52475E] hover:bg-plum-50 border border-[#EAE3DC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveBrochure(null)}
                className="ml-2 px-3 py-1 rounded-full text-xs font-bold text-[#645A70] hover:text-[#1E1429] hover:bg-white cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto bg-plum-950 p-3">
              <img
                src={activeBrochure}
                alt="Brosur Resmi Layanan Soulaide"
                className="w-full h-auto rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
