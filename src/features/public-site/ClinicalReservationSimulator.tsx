import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { formatIDR } from '@/lib/utils.ts'
import { calculateServicePrice } from '@/features/services/useServices.ts'
import type { DeliveryMethod, ProfessionalTier, ServiceDetail } from '@/types/index.ts'
import type { PsychologistWithPresence } from '@/features/psychologists/usePsychologists.ts'

interface ClinicalReservationSimulatorProps {
  services: ServiceDetail[]
  psychologists: PsychologistWithPresence[]
}

const TIME_WINDOWS = [
  { id: 'morning', label: 'Pagi', time: '09.00 – 12.00', note: 'Fokus & tenang' },
  { id: 'afternoon', label: 'Siang', time: '13.00 – 16.00', note: 'Setelah jam istirahat' },
  { id: 'evening', label: 'Malam', time: '19.00 – 21.30', note: 'Setelah jam kerja' },
] as const

export const ClinicalReservationSimulator: React.FC<ClinicalReservationSimulatorProps> = ({
  services,
  psychologists,
}) => {
  const navigate = useNavigate()

  // State
  const [selectedTier, setSelectedTier] = useState<ProfessionalTier>('Soul Guidance')
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => services[0]?.id || '')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('online')
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string>('morning')
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string>('')

  // Active service object
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0]

  // Filter psychologists based on tier
  const tierPsychologists = psychologists.filter((p) => p.tier === selectedTier)

  // Active psychologist
  const activePsychologist =
    tierPsychologists.find((p) => p.id === selectedPsychologistId) ||
    tierPsychologists[0] ||
    psychologists[0]

  // Check if active service supports offline
  const isBundle = activeService?.title.toLowerCase().includes('bundl')
  const supportsOffline = Boolean(activeService?.deliveryMethods?.includes('offline')) && !isBundle

  // Auto-switch to online if service doesn't support offline
  const effectiveMethod = !supportsOffline && deliveryMethod === 'offline' ? 'online' : deliveryMethod

  // Calculate price dynamically based on database service model without hardcoding
  const currentPrice = calculateServicePrice(activeService, effectiveMethod, selectedTier)

  const handleProceedBooking = () => {
    const params = new URLSearchParams()
    if (activeService?.id) params.set('service', activeService.id)
    params.set('tier', selectedTier)
    params.set('method', effectiveMethod)
    if (activePsychologist?.id) params.set('psychologist', activePsychologist.id)
    navigate(`/booking?${params.toString()}`)
  }

  return (
    <div className="relative z-10 w-full rounded-xl bg-paper-card border border-line p-5 sm:p-7 lg:p-8 shadow-[0_12px_32px_-16px_rgba(41,23,56,0.12)]">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-line gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-plum-600">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Simulasi &amp; Estimasi Reservasi Klinis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink tracking-tight">
            Konfigurasi Kebutuhan Konseling Anda
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Hitung estimasi tarif transparan, sesuaikan kategori psikolog, dan pilih metode sesi sebelum reservasi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-md bg-sanctuary-100 border border-line text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted block">
              Lead Time
            </span>
            <span className="text-xs font-bold text-plum-900">Min. 24 Jam</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-sanctuary-100 border border-line text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted block">
              Privasi
            </span>
            <span className="text-xs font-bold text-emerald-800">100% SIPP</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 cols): Configuration Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Tier & Psychologist Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                  01
                </span>
                <span>Tingkat Pengalaman Psikolog (Tier)</span>
              </label>
              <span className="text-[11px] text-plum-700 font-medium">
                {selectedTier === 'Soul Expert' ? 'Senior (>10 Thn)' : 'Muda (<2 Thn)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Soul Guidance Card */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('Soul Guidance')
                  setSelectedPsychologistId('')
                }}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedTier === 'Soul Guidance'
                    ? 'border-plum-700 bg-plum-50/60 ring-1 ring-plum-700'
                    : 'border-line bg-paper hover:bg-sanctuary-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-plum-900">Soul Guidance</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] bg-plum-100 text-plum-800">
                    S.Psi., Psikolog.
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Psikolog muda berlisensi. Fokus pada adaptasi, quarter-life crisis, overthinking, dan manajemen stres awal.
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#EDE6D9] text-[10px] text-ink-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-plum-600" />
                  <span>3 Psikolog Tersedia</span>
                </div>
              </button>

              {/* Soul Expert Card */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('Soul Expert')
                  setSelectedPsychologistId('')
                }}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedTier === 'Soul Expert'
                    ? 'border-champagne-600 bg-champagne-50/60 ring-1 ring-champagne-600'
                    : 'border-line bg-paper hover:bg-sanctuary-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-ink">Soul Expert</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] bg-champagne-100 text-champagne-800">
                    M.Psi., Senior
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Psikolog senior jam terbang tinggi (&gt;10 tahun). Spesialisasi dinamika keluarga, pernikahan, trauma, dan parenting.
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#EDE6D9] text-[10px] text-ink-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-champagne-600" />
                  <span>Finandita Utari, M.Psi., CGA.</span>
                </div>
              </button>
            </div>

            {/* Quick Psychologist Selector Strip */}
            <div className="pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted block mb-2">
                Pilih Psikolog Pendamping:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tierPsychologists.map((psych) => {
                  const isSelected = activePsychologist?.id === psych.id
                  return (
                    <button
                      key={psych.id}
                      type="button"
                      onClick={() => setSelectedPsychologistId(psych.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-md border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-plum-600 bg-white shadow-xs'
                          : 'border-line bg-sanctuary-100/50 hover:bg-white'
                      }`}
                    >
                      <img
                        src={psych.profileImage || psych.cardImage}
                        alt={psych.fullName}
                        className="w-9 h-9 rounded-full object-cover object-top ring-1 ring-plum-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">{psych.fullName}</div>
                        <div className="text-[10px] text-ink-muted truncate">{psych.credentials}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-plum-700 shrink-0 mr-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Service Selection */}
          <div className="space-y-3 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                  02
                </span>
                <span>Pilih Format Layanan Konseling</span>
              </label>
              <span className="text-[11px] text-ink-muted">3 Layanan Resmi</span>
            </div>

            <div className="space-y-2">
              {services.map((svc) => {
                const isSelected = activeService?.id === svc.id
                const lower = svc.title.toLowerCase()
                const isBundleItem = lower.includes('bundl')
                const isMhcuItem = lower.includes('mhcu') && !isBundleItem

                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(svc.id)
                      if (isBundleItem) setDeliveryMethod('online')
                    }}
                    className={`w-full p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-plum-700 bg-plum-50/50 ring-1 ring-plum-700'
                        : 'border-line bg-paper hover:bg-sanctuary-100/50'
                    }`}
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">{svc.title}</span>
                        {isBundleItem && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-plum-800 text-white">
                            Paling Lengkap
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted line-clamp-1">{svc.description}</p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#EDE6D9]">
                      <span className="text-[10px] font-mono font-semibold text-plum-700">
                        {isBundleItem ? '90 Menit' : isMhcuItem ? 'Asesmen + 30m' : '60 Menit'}
                      </span>
                      <span className="text-xs font-bold text-ink">
                        {isBundleItem
                          ? 'Daring (Online)'
                          : 'Daring & Tatap Muka'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* STEP 3 & 4: Format & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line">
            {/* Format / Delivery Method */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                  03
                </span>
                <span>Metode Pelaksanaan</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('online')}
                  className={`p-2.5 rounded-md border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    effectiveMethod === 'online'
                      ? 'border-plum-700 bg-plum-50/70 text-plum-900 font-bold ring-1 ring-plum-700'
                      : 'border-line bg-paper text-ink-soft hover:bg-sanctuary-100/50'
                  }`}
                >
                  <Video className="w-4 h-4 text-plum-600" />
                  <span className="text-xs">Daring (Meet)</span>
                  <span className="text-[9px] text-ink-muted">Fleksibel</span>
                </button>

                <button
                  type="button"
                  disabled={!supportsOffline}
                  onClick={() => supportsOffline && setDeliveryMethod('offline')}
                  className={`p-2.5 rounded-md border text-center transition-all flex flex-col items-center gap-1 ${
                    !supportsOffline
                      ? 'border-line bg-gray-100/80 text-gray-400 cursor-not-allowed opacity-60'
                      : effectiveMethod === 'offline'
                        ? 'border-plum-700 bg-plum-50/70 text-plum-900 font-bold ring-1 ring-plum-700 cursor-pointer'
                        : 'border-line bg-paper text-ink-soft hover:bg-sanctuary-100/50 cursor-pointer'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-plum-600" />
                  <span className="text-xs">Tatap Muka</span>
                  <span className="text-[9px] text-ink-muted">Pondok Bambu</span>
                </button>
              </div>
            </div>

            {/* Time Window Preference */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                  04
                </span>
                <span>Preferensi Waktu Sesi</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {TIME_WINDOWS.map((w) => {
                  const isSelected = selectedTimeWindow === w.id
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedTimeWindow(w.id)}
                      className={`p-2 rounded-md border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-plum-700 bg-plum-50/80 text-plum-900 font-bold ring-1 ring-plum-700'
                          : 'border-line bg-paper text-ink-muted hover:bg-sanctuary-100/50'
                      }`}
                    >
                      <div className="text-xs font-bold">{w.label}</div>
                      <div className="text-[9px] font-mono text-ink-muted truncate">{w.time}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Live Clinical Session Slip / Summary Studio */}
        <div className="lg:col-span-5">
          <div className="rounded-lg bg-sanctuary-100/90 border border-line p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE6D9]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-plum-700">
                Ringkasan Simulasi
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Slot Tersedia
              </span>
            </div>

            {/* Selected Psychologist Spotlight */}
            <div className="flex items-center gap-3.5 p-3 rounded-md bg-white border border-line">
              <img
                src={activePsychologist?.profileImage || activePsychologist?.cardImage}
                alt={activePsychologist?.fullName}
                className="w-12 h-12 rounded-md object-cover object-top ring-1 ring-line shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-xs font-bold text-ink truncate">
                  {activePsychologist?.fullName}
                </div>
                <div className="text-[10px] font-semibold text-plum-600 truncate">
                  {activePsychologist?.credentials}
                </div>
                <div className="text-[10px] text-ink-muted flex items-center gap-2">
                  <span>Pengalaman {activePsychologist?.experienceYears}</span>
                  <span>•</span>
                  <span className="font-semibold text-plum-800">{activePsychologist?.tier}</span>
                </div>
              </div>
            </div>

            {/* Configured Item Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#EAE3DC]">
                <span className="text-ink-muted">Layanan Dipilih</span>
                <span className="font-semibold text-ink text-right max-w-[190px] truncate" title={activeService?.title}>
                  {activeService?.title}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#EAE3DC]">
                <span className="text-ink-muted">Durasi Sesi</span>
                <span className="font-mono font-semibold text-ink">{activeService?.duration}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#EAE3DC]">
                <span className="text-ink-muted">Metode Sesi</span>
                <span className="font-semibold text-ink flex items-center gap-1">
                  {effectiveMethod === 'online' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-plum-600" />
                      <span>Daring (Google Meet)</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-plum-600" />
                      <span>Klinik Pondok Bambu</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#EAE3DC]">
                <span className="text-ink-muted">Rencana Waktu</span>
                <span className="font-semibold text-ink">
                  {TIME_WINDOWS.find((w) => w.id === selectedTimeWindow)?.time}
                </span>
              </div>
            </div>

            {/* Total Transparent Fee */}
            <div className="p-4 rounded-md bg-paper border border-line">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                    Estimasi Biaya Klinis
                  </span>
                  <span className="text-2xl font-bold font-mono text-plum-900 tracking-tight">
                    {formatIDR(currentPrice)}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-ink-muted text-right">
                  Nett / Sesi
                </span>
              </div>
              <p className="text-[10px] text-ink-muted mt-2 pt-2 border-t border-line">
                *Tarif resmi sesuai katalog klinis Soulaide. Termasuk sesi privat, link konsultasi / ruang klinik, dan laporan evaluasi awal.
              </p>
            </div>

            {/* Direct Action Trigger */}
            <div className="space-y-2.5 pt-1">
              <Button
                type="button"
                size="lg"
                onClick={handleProceedBooking}
                className="w-full h-12 rounded-md bg-plum-900 hover:bg-plum-800 text-[#FBF7F0] font-semibold gap-2 shadow-xs cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-plum-200" />
                <span>Lanjutkan Reservasi Slot Ini</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-ink-muted text-center pt-1">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-plum-600" />
                  <span>Kerahasiaan Medis</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-plum-600" />
                  <span>Konfirmasi Cepat</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
