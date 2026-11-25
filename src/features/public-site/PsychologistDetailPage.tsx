import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  Video,
  MapPin,
  FileBadge2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.tsx'
import { usePsychologists } from '@/features/psychologists/usePsychologists.ts'
import { handleImageFallback } from '@/lib/utils.ts'

export const PsychologistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: psychologists } = usePsychologists()
  const [showOfficialCard, setShowOfficialCard] = useState(false)

  const psychologist = psychologists.find((p) => p.id === id)

  if (!psychologist) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#1E1429]">Profil Psikolog Tidak Ditemukan</h2>
        <p className="text-sm text-[#645A70]">
          Profil psikolog yang Anda cari tidak tersedia atau sedang dinonaktifkan.
        </p>
        <Link to="/#psikolog">
          <Button variant="outline" className="gap-2 rounded-full">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    )
  }

  const isExpert = psychologist.tier === 'Soul Expert'

  return (
    <div className="pb-20 space-y-10">
      {/* Top Profile Sanctuary Banner */}
      <section className="relative w-full overflow-hidden border-b border-[#E5DDD4] soulaide-hero-mesh pt-8 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/#psikolog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-plum-800 hover:text-plum-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-plum-200/80 text-plum-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-plum-600" />
              Terverifikasi HIMPSI &amp; SIPP
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Sticky Portrait & CTA Column */}
          <Card className="overflow-hidden rounded-2xl border-line bg-paper-card lg:sticky lg:top-24">
            <div
              className={`relative h-64 sm:h-80 overflow-hidden ${
                isExpert
                  ? 'bg-gradient-to-b from-champagne-100/80 via-[#F8F3EC] to-[#F3ECE4]'
                  : 'bg-gradient-to-b from-plum-100/75 via-[#F6F2FA] to-[#EFEAF5]'
              }`}
            >
              <img
                src={psychologist.profileImage || psychologist.cardImage}
                alt={psychologist.fullName}
                className="w-full h-full object-cover object-[center_15%] mix-blend-multiply"
                onError={handleImageFallback}
              />
              <div className="absolute top-3.5 left-3.5">
                {isExpert ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-champagne-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                    Soul Expert
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xs bg-plum-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                    Soul Guidance
                  </span>
                )}
              </div>
            </div>

            <CardHeader className="text-center pb-2 pt-5 space-y-1">
              <CardTitle className="text-xl font-bold text-[#1E1429] leading-snug">
                {psychologist.fullName}
              </CardTitle>
              <p className="text-xs font-semibold text-plum-600">{psychologist.credentials}</p>
              <p className="text-xs text-[#72677E] pt-0.5">
                Pengalaman Klinis: <strong className="text-[#23192D]">{psychologist.experienceYears}</strong>
              </p>
            </CardHeader>

            <CardContent className="p-5 pt-3 space-y-4">
              <div className="p-3.5 rounded-2xl bg-sanctuary-100 border border-[#EAE3DC] space-y-2.5 text-xs text-[#4B3F59]">
                <div className="flex items-center gap-2.5 font-medium">
                  <Video className="w-4 h-4 text-plum-600 shrink-0" />
                  <span>Konseling Daring (Google Meet)</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <MapPin className="w-4 h-4 text-plum-600 shrink-0" />
                  <span>Tatap Muka (Pondok Bambu, Jaktim)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link to={`/booking?psychologist=${psychologist.id}`} className="block">
                  <Button className="w-full gap-2 h-11 rounded-xl">
                    <Calendar className="w-4 h-4 text-plum-200" />
                    <span>Booking Sesi Sekarang</span>
                  </Button>
                </Link>

                {psychologist.cardImage && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOfficialCard(true)}
                    className="w-full gap-2 h-10 rounded-xl text-xs"
                  >
                    <FileBadge2 className="w-4 h-4 text-plum-600" />
                    <span>Perbesar Kartu Profil Resmi</span>
                  </Button>
                )}
              </div>

              <div className="text-center text-[11px] text-[#8E81A1]">
                Lead time reservasi minimal 24 jam sebelum jadwal sesi
              </div>
            </CardContent>
          </Card>

          {/* Right Clinical Dossier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card className="rounded-3xl">
              <CardHeader>
                <div className="flex items-center gap-2 text-plum-600 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Profil Klinis</span>
                </div>
                <CardTitle className="text-2xl font-bold text-[#1E1429]">
                  Tentang Psikolog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#5A5066] leading-relaxed">
                <p>
                  {psychologist.fullName} adalah profesional kesehatan mental berkualifikasi{' '}
                  <strong className="text-[#23192D]">{psychologist.credentials}</strong> dengan pengalaman praktik klinis{' '}
                  <strong className="text-[#23192D]">{psychologist.experienceYears}</strong>. Berdedikasi mendampingi klien menemukan pemulihan emosional, kejelasan arah hidup, dan resiliensi psikologis melalui pendekatan konseling berbasis bukti ilmiah.
                </p>
                <div className="p-4 rounded-2xl bg-plum-50/70 border border-plum-100 flex items-start gap-3 text-xs text-plum-900">
                  <ShieldCheck className="w-5 h-5 text-plum-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Praktik resmi terdaftar dengan lisensi profesi psikolog, tunduk pada ketentuan hukum Republik Indonesia dan Kode Etik Himpunan Psikologi Indonesia (HIMPSI).
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Practice Areas */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1E1429]">
                  Fokus Tantangan &amp; Bidang Praktik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {psychologist.practiceAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-full bg-plum-50 text-plum-800 text-xs font-semibold border border-plum-200/70"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Approaches */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1E1429]">
                  Pendekatan Terapeutik Berbasis Bukti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#5A5066]">
                <p className="text-xs text-[#72677E]">
                  Metode konseling disesuaikan dengan kondisi unik setiap individu untuk mencapai hasil yang terukur dan aplikatif:
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {psychologist.approaches.map((app, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sanctuary-100 border border-[#EAE3DC] text-[#23192D] text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-plum-600" />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Notice */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1E1429] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-plum-600" />
                  <span>Pola Ketersediaan Jadwal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#5A5066]">
                <p className="font-bold text-[#23192D]">{psychologist.initialSchedule}</p>
                <p className="text-xs text-[#72677E] leading-relaxed">
                  *Jadwal di atas merupakan jam praktik rutin. Ketersediaan slot tanggal dan jam aktual dapat langsung Anda pilih pada halaman reservasi.
                </p>
              </CardContent>
            </Card>

            {/* Official Infographic Card Preview */}
            {psychologist.cardImage && (
              <Card className="rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#1E1429]">
                      Kartu Informasi Klinis Resmi
                    </CardTitle>
                    <p className="text-xs text-[#72677E] mt-0.5">
                      Ringkasan pendidikan, nomor SIAP HIMPSI, kompetensi, dan sertifikasi resmi.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOfficialCard(true)}
                    className="rounded-full text-xs"
                  >
                    Layar Penuh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div
                    onClick={() => setShowOfficialCard(true)}
                    className="rounded-2xl overflow-hidden border border-[#EAE3DC] bg-plum-950 p-2 cursor-pointer group"
                  >
                    <img
                      src={psychologist.cardImage}
                      alt={`Kartu Resmi ${psychologist.fullName}`}
                      className="w-full max-h-[34rem] object-contain rounded-xl mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Official Profile Card Lightbox Modal */}
      {showOfficialCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/75 backdrop-blur-sm"
          onClick={() => setShowOfficialCard(false)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAE3DC] bg-sanctuary-100">
              <span className="text-xs font-bold text-[#23192D]">
                Kartu Profil Resmi — {psychologist.fullName}
              </span>
              <button
                type="button"
                onClick={() => setShowOfficialCard(false)}
                className="p-1.5 rounded-full text-[#645A70] hover:text-[#1E1429] hover:bg-white cursor-pointer"
                aria-label="Tutup pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto bg-plum-950 p-2">
              <img
                src={psychologist.cardImage}
                alt={`Kartu profil resmi ${psychologist.fullName}`}
                className="w-full h-auto rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
