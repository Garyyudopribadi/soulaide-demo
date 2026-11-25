import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Sparkles,
  Award,
  ShieldCheck,
  GraduationCap,
  X,
  FileBadge2,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { usePsychologists } from '@/features/psychologists/usePsychologists.ts'
import { handleImageFallback } from '@/lib/utils.ts'
import type { ProfessionalTier, PsychologistProfile } from '@/types/index.ts'

export const PsychologistsPage: React.FC = () => {
  const { data: psychologists } = usePsychologists()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<'all' | ProfessionalTier>('all')
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [previewCardPsych, setPreviewCardPsych] = useState<PsychologistProfile | null>(null)

  const allAreas = Array.from(new Set(psychologists.flatMap((p) => p.practiceAreas)))

  const filteredPsychologists = psychologists.filter((psych) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      psych.fullName.toLowerCase().includes(q) ||
      psych.practiceAreas.some((a) => a.toLowerCase().includes(q)) ||
      psych.approaches.some((app) => app.toLowerCase().includes(q))

    const matchesTier = selectedTier === 'all' || psych.tier === selectedTier
    const matchesArea = selectedArea === 'all' || psych.practiceAreas.includes(selectedArea)

    return matchesSearch && matchesTier && matchesArea
  })

  const hasActiveFilter = searchQuery !== '' || selectedTier !== 'all' || selectedArea !== 'all'

  const getPresencePill = (presence: string) => {
    switch (presence) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-emerald-200/80 text-emerald-800 text-[10px] font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tersedia Sesi
          </span>
        )
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-plum-200 text-plum-800 text-[10px] font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-plum-500" />
            Online
          </span>
        )
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-champagne-200 text-champagne-700 text-[10px] font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-champagne-500" />
            Sedang Sesi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#E5DDD5] text-[#645A70] text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9D94A8]" />
            Offline
          </span>
        )
    }
  }

  return (
    <div className="pb-20 space-y-12">
      {/* =====================================================================
          ENHANCED PSYCHOLOGISTS HERO HEADER
         ===================================================================== */}
      <section className="relative w-full overflow-hidden border-b border-[#E5DDD4] soulaide-hero-mesh pt-12 pb-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-plum-300/25 blur-3xl animate-breathe" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#5D728F]/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="flex justify-center mb-1">
            <Link
              to="/#psikolog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-800 hover:text-plum-950 transition-colors bg-white/80 border border-line px-3 py-1 rounded-full shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-plum-200/80 text-plum-800 text-xs font-semibold shadow-2xs backdrop-blur-sm">
            <Award className="w-3.5 h-3.5 text-plum-600" />
            <span>Psikolog Klinis &amp; Konselor Berizin Resmi (SIAP HIMPSI &amp; SIPP)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#1E1429] tracking-tight leading-tight">
            Kenali <span className="font-serif italic font-semibold text-plum-700">Psikolog Soulaide</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#554B61] leading-relaxed max-w-3xl mx-auto">
            Setiap profesional di Soulaide telah melewati verifikasi kredensial klinis ketat dan memegang teguh Kode Etik Psikologi Indonesia (HIMPSI).
          </p>

          {/* Summary Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5DDD5] text-[#23192D] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              4 Psikolog Aktif
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5DDD5] text-champagne-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
              1 Soul Expert (&gt;10 Thn)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5DDD5] text-plum-800 font-semibold">
              3 Soul Guidance
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Search & Multi-Criteria Filter Bar */}
        <div className="max-w-5xl mx-auto space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE3DC] shadow-[0_12px_36px_-18px_rgba(41,23,56,0.12)]">
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-[#8A7E96] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama psikolog, tantangan emosional (stres, kecemasan, keluarga), atau pendekatan (CBT, SFBT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-sm border border-[#E5DDD5] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-500 bg-sanctuary-100/70 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8A7E96] hover:text-[#23192D] hover:bg-sanctuary-200 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            {/* Tier Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-[#52475E] mr-1 shrink-0">Kategori:</span>
              <button
                type="button"
                onClick={() => setSelectedTier('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedTier === 'all'
                    ? 'bg-plum-700 text-white shadow-xs'
                    : 'bg-sanctuary-100 text-[#52475E] hover:bg-plum-50 border border-[#EAE3DC]'
                }`}
              >
                Semua ({psychologists.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('Soul Guidance')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedTier === 'Soul Guidance'
                    ? 'bg-plum-700 text-white shadow-xs'
                    : 'bg-sanctuary-100 text-[#52475E] hover:bg-plum-50 border border-[#EAE3DC]'
                }`}
              >
                Soul Guidance ({psychologists.filter((p) => p.tier !== 'Soul Expert').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('Soul Expert')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  selectedTier === 'Soul Expert'
                    ? 'bg-champagne-600 text-white shadow-xs'
                    : 'bg-sanctuary-100 text-[#52475E] hover:bg-champagne-50 border border-[#EAE3DC]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Soul Expert ({psychologists.filter((p) => p.tier === 'Soul Expert').length})
              </button>
            </div>

            {/* Area Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-[#52475E] mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3 text-plum-500" /> Fokus:
              </span>
              <button
                type="button"
                onClick={() => setSelectedArea('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                  selectedArea === 'all'
                    ? 'bg-[#23192D] text-white'
                    : 'bg-sanctuary-100 text-[#52475E] hover:bg-sanctuary-200 border border-[#EAE3DC]'
                }`}
              >
                Semua
              </button>
              {allAreas.slice(0, 6).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                    selectedArea === area
                      ? 'bg-[#23192D] text-white'
                      : 'bg-sanctuary-100 text-[#52475E] hover:bg-sanctuary-200 border border-[#EAE3DC]'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilter && (
            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE6] text-xs text-[#645A70]">
              <span>
                Menampilkan <strong className="text-[#1E1429]">{filteredPsychologists.length}</strong> dari{' '}
                {psychologists.length} psikolog
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTier('all')
                  setSelectedArea('all')
                }}
                className="text-plum-700 font-semibold hover:underline cursor-pointer"
              >
                Reset filter
              </button>
            </div>
          )}
        </div>

        {/* Psychologists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPsychologists.map((psych) => {
            const isExpert = psych.tier === 'Soul Expert'
            return (
              <Card
                key={psych.id}
                className="flex flex-col justify-between rounded-3xl sanctuary-card-hover group"
              >
                <div>
                  {/* Studio Portrait */}
                  <div
                    className={`relative h-72 overflow-hidden ${
                      isExpert
                        ? 'bg-gradient-to-b from-champagne-100/80 via-[#F8F3EC] to-[#F3ECE4]'
                        : 'bg-gradient-to-b from-plum-100/70 via-[#F6F2FA] to-[#EFEAF5]'
                    }`}
                  >
                    <img
                      src={psych.profileImage || psych.cardImage}
                      alt={psych.fullName}
                      className="w-full h-full object-cover object-top mix-blend-multiply transition-transform duration-500 group-hover:scale-104"
                      onError={handleImageFallback}
                    />
                    <div className="absolute top-3.5 right-3.5">
                      {getPresencePill(psych.presence)}
                    </div>
                    <div className="absolute top-3.5 left-3.5">
                      {isExpert ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-champagne-600 text-white text-[10px] font-bold shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          Soul Expert
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-plum-700 text-white text-[10px] font-bold shadow-sm">
                          Soul Guidance
                        </span>
                      )}
                    </div>

                    {/* Quick Official Card Lightbox Trigger */}
                    {psych.cardImage && (
                      <button
                        type="button"
                        onClick={() => setPreviewCardPsych(psych)}
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-plum-950/75 hover:bg-plum-900 text-white text-[10px] font-semibold backdrop-blur-md transition-all cursor-pointer shadow-sm"
                        title={`Lihat kartu profil resmi ${psych.fullName}`}
                      >
                        <FileBadge2 className="w-3 h-3 text-plum-200" />
                        <span>Kartu Resmi</span>
                      </button>
                    )}
                  </div>

                  <CardHeader className="p-5 pb-2 space-y-1">
                    <CardTitle className="text-base font-bold text-[#1E1429] group-hover:text-plum-700 transition-colors">
                      {psych.fullName}
                    </CardTitle>
                    <p className="text-xs font-semibold text-plum-600 leading-tight">
                      {psych.credentials}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#72677E] pt-1">
                      <GraduationCap className="w-3.5 h-3.5 text-plum-400" />
                      <span>
                        Pengalaman: <strong className="text-[#3C3148]">{psych.experienceYears}</strong>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-1 space-y-3">
                    <p className="text-xs text-[#645A70] line-clamp-2 leading-relaxed">
                      Pendekatan: <strong className="text-[#23192D]">{psych.approaches.join(', ')}</strong>
                    </p>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#8E81A1]">
                        Fokus Penanganan
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {psych.practiceAreas.slice(0, 3).map((area, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full bg-plum-50 text-plum-800 text-[10px] font-medium border border-plum-100"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-4 pt-3 border-t border-[#F2ECE6] grid grid-cols-2 gap-2">
                  <Link to={`/psychologists/${psych.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs h-9 rounded-xl">
                      Detail Profil
                    </Button>
                  </Link>
                  <Link to={`/booking?psychologist=${psych.id}`} className="w-full">
                    <Button size="sm" className="w-full text-xs h-9 rounded-xl">
                      Jadwalkan
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {filteredPsychologists.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE3DC] p-8 max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-plum-50 text-plum-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#1E1429]">Tidak ada profil psikolog yang cocok</h3>
            <p className="text-xs text-[#645A70]">
              Coba sesuaikan kata kunci pencarian atau ubah filter kategori pendamping.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedTier('all')
                setSelectedArea('all')
              }}
            >
              Reset Semua Filter
            </Button>
          </div>
        )}

        {/* Ethics Banner */}
        <div className="max-w-5xl mx-auto p-6 rounded-3xl bg-plum-50/70 border border-plum-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-plum-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-plum-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-plum-700" />
            </div>
            <span className="leading-relaxed">
              Setiap sesi dipandu dengan kepatuhan penuh terhadap <strong>Kode Etik HIMPSI</strong> dan prinsip kerahasiaan data klinis tanpa kompromi.
            </span>
          </div>
          <Link to="/booking" className="shrink-0">
            <Button size="sm" className="rounded-full px-5 text-xs gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-plum-200" />
              <span>Pilih Jadwal Konseling</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Official Psychologist Card Lightbox Modal */}
      {previewCardPsych && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/75 backdrop-blur-sm"
          onClick={() => setPreviewCardPsych(null)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAE3DC] bg-sanctuary-100">
              <span className="text-xs font-bold text-[#23192D]">
                Kartu Profil Resmi — {previewCardPsych.fullName}
              </span>
              <button
                type="button"
                onClick={() => setPreviewCardPsych(null)}
                className="p-1.5 rounded-full text-[#645A70] hover:text-[#1E1429] hover:bg-white cursor-pointer"
                aria-label="Tutup pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto bg-plum-950 p-2">
              <img
                src={previewCardPsych.cardImage}
                alt={`Kartu profil resmi ${previewCardPsych.fullName}`}
                className="w-full h-auto rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
