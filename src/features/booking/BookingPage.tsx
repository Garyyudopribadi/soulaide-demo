import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Clock,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Video,
  MapPin,
  ShieldCheck,
  UserCheck,
  FileCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { useServices, calculateServicePrice, getServiceFeatures } from '@/features/services/useServices.ts'
import { usePsychologists } from '@/features/psychologists/usePsychologists.ts'
import { useAuth } from '@/features/auth/useAuth.ts'
import {
  getSelectableDates,
  DEFAULT_DAILY_SLOTS,
  validateBookingLeadTime,
} from './availability.ts'
import { createBookingAtomic } from './bookingService.ts'
import { formatIDR, handleImageFallback } from '@/lib/utils.ts'
import type { DeliveryMethod, ProfessionalTier } from '@/types/index.ts'
import { MidtransSnapModal } from '@/features/payments/MidtransSnapModal.tsx'

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: services } = useServices()
  const { data: psychologists } = usePsychologists()

  // Initial State from URL params or defaults
  const [selectedTier, setSelectedTier] = useState<ProfessionalTier>(
    () => (searchParams.get('tier') as ProfessionalTier) || 'Soul Guidance'
  )
  const [serviceIdState, setServiceIdState] = useState<string>(() => searchParams.get('service') || '')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    () => (searchParams.get('method') as DeliveryMethod) || 'online'
  )
  const [psychologistIdState, setPsychologistIdState] = useState<string>(
    () => searchParams.get('psychologist') || ''
  )
  const [dateState, setDateState] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [completedBooking, setCompletedBooking] = useState<{
    bookingId: string
    bookingCode: string
  } | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const selectableDates = getSelectableDates(14)

  const selectedServiceId = serviceIdState || services[0]?.id || ''
  const selectedDate = dateState || selectableDates[0]?.dateStr || ''

  // Filter psychologists based on selected tier
  const tierPsychologists = psychologists.filter((p) => {
    const pTier = p.tier || (p.experienceYears.includes('> 10') ? 'Soul Expert' : 'Soul Guidance')
    return pTier === selectedTier
  })

  // Selected psychologist
  const selectedPsychologist =
    tierPsychologists.find((p) => p.id === psychologistIdState || (p.slug && p.slug === psychologistIdState)) ||
    tierPsychologists[0] ||
    psychologists[0]

  const selectedService =
    services.find(
      (s) =>
        s.id === selectedServiceId ||
        (selectedServiceId.startsWith('s') && s.id === 'e' + selectedServiceId.slice(1)) ||
        s.title.toLowerCase().includes(selectedServiceId.toLowerCase())
    ) || services[0]

  // Check if active service supports offline directly from database columns
  const supportsOffline = Boolean(
    selectedService?.deliveryMethods?.includes('offline') &&
    selectedService?.priceOffline !== null &&
    selectedService?.priceOffline !== undefined
  )
  const effectiveMethod = !supportsOffline && deliveryMethod === 'offline' ? 'online' : deliveryMethod

  const calculatedPrice = calculateServicePrice(selectedService, effectiveMethod, selectedTier)

  const handleSelectTime = (time: string) => {
    setSelectedTime(time)
    setBookingError(null)
  }

  const handleConfirmBooking = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/booking' } } })
      return
    }

    if (!selectedService || !selectedPsychologist || !selectedDate || !selectedTime) {
      setBookingError('Silakan pilih psikolog, layanan, tanggal, dan jam sesi.')
      return
    }

    if (!consentAgreed) {
      setBookingError('Anda wajib menyetujui pernyataan persetujuan konseling dan kebijakan lead time.')
      return
    }

    const timeFormatted = selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime
    const leadCheck = validateBookingLeadTime(selectedDate, selectedTime)
    if (!leadCheck.isValid) {
      setBookingError(leadCheck.message || 'Waktu yang dipilih melanggar ketentuan lead time minimal 24 jam.')
      return
    }

    setIsSubmitting(true)
    setBookingError(null)

    const result = await createBookingAtomic({
      customerId: user.id,
      psychologistId: selectedPsychologist.id,
      serviceId: selectedService.id,
      sessionDate: selectedDate,
      sessionStartTime: timeFormatted,
      deliveryMethod: effectiveMethod,
      notes,
    })

    setIsSubmitting(false)

    if (result.success && result.bookingId && result.bookingCode) {
      setCompletedBooking({
        bookingId: result.bookingId,
        bookingCode: result.bookingCode,
      })
    } else {
      setBookingError(result.error || 'Gagal membuat reservasi. Slot mungkin sudah diambil pengguna lain.')
    }
  }

  return (
    <div className="pb-20 space-y-8">
      {/* Header Studio Section */}
      <section className="relative w-full overflow-hidden border-b border-line bg-sanctuary-50/50 pt-8 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-paper-card border border-line text-plum-900 text-xs font-semibold shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-plum-700" />
                <span>Studio Reservasi Sesi Klinis • Terverifikasi HIMPSI &amp; SIPP</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E1429] tracking-tight">
                Reservasi <span className="font-serif italic font-semibold text-plum-700">Sesi Konseling</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#554B61] max-w-2xl leading-relaxed">
                Konfigurasi kebutuhan konseling Anda secara langsung. Seluruh pemilihan slot terikat secara atomik dengan kerahasiaan klinis dan transparansi tarif tanpa biaya tersembunyi.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="px-3.5 py-2 rounded-lg bg-paper-card border border-line text-left shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#72677E] block">
                  Lead Time
                </span>
                <span className="text-xs font-extrabold text-plum-900">Min. 24 Jam</span>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-paper-card border border-line text-left shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#72677E] block">
                  Privasi Sesi
                </span>
                <span className="text-xs font-extrabold text-emerald-800">100% Terenkripsi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Error Alert */}
        {bookingError && (
          <div className="max-w-4xl mx-auto p-4 bg-rose-50 text-rose-800 text-xs sm:text-sm rounded-lg border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{bookingError}</span>
          </div>
        )}

        {/* Simulator-Style 2-Column Responsive Workspace */}
        {!completedBooking ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* LEFT COLUMN (7 cols): Guided Interactive Configuration */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-xl border border-line bg-paper-card shadow-xs">
                <CardContent className="p-5 sm:p-7 space-y-7">
                  {/* STEP 1: Tier & Psychologist Selection */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#3C3148] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-xs bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                          01
                        </span>
                        <span>Tingkat Pengalaman &amp; Psikolog Pendamping</span>
                      </label>
                      <span className="text-[11px] text-plum-700 font-medium">
                        {selectedTier === 'Soul Expert' ? 'Senior (> 10 Tahun)' : 'Muda (< 2 Tahun)'}
                      </span>
                    </div>

                    {/* Tier Selection Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTier('Soul Guidance')
                          const firstGuide = psychologists.find((p) => p.tier === 'Soul Guidance')
                          if (firstGuide) setPsychologistIdState(firstGuide.id)
                        }}
                        className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${selectedTier === 'Soul Guidance'
                            ? 'border-plum-700 bg-plum-50/70 ring-1 ring-plum-700 shadow-xs'
                            : 'border-line hover:border-plum-300 bg-paper-card'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-[#1E1429]">Soul Guidance</span>
                          <Badge className="bg-plum-700 text-white border-0 text-[10px] rounded-xs">
                            Psikolog &amp; Konselor
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#645A70] leading-relaxed">
                          Psikolog muda berlisensi. Fokus pada stres harian, quarter-life crisis, kecemasan, dan resiliensi emosi.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTier('Soul Expert')
                          const firstExpert = psychologists.find((p) => p.tier === 'Soul Expert')
                          if (firstExpert) setPsychologistIdState(firstExpert.id)
                        }}
                        className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${selectedTier === 'Soul Expert'
                            ? 'border-champagne-600 bg-champagne-50/70 ring-1 ring-champagne-600 shadow-xs'
                            : 'border-line hover:border-champagne-200 bg-paper-card'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-[#1E1429]">Soul Expert</span>
                          <Badge className="bg-champagne-600 text-white border-0 text-[10px] rounded-xs">
                            Senior &gt; 10 Thn
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#645A70] leading-relaxed">
                          Psikolog senior jam terbang tinggi. Penanganan mendalam pernikahan/keluarga, trauma, dan parenting inklusi.
                        </p>
                      </button>
                    </div>

                    {/* Psychologist Selector Strip */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#72677E] block mb-2">
                        Pilih Psikolog Pendamping ({selectedTier}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tierPsychologists.map((psych) => {
                          const isSelected = selectedPsychologist?.id === psych.id
                          return (
                            <button
                              key={psych.id}
                              type="button"
                              onClick={() => setPsychologistIdState(psych.id)}
                              className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${isSelected
                                  ? 'border-plum-700 bg-plum-50/60 ring-1 ring-plum-700 shadow-xs'
                                  : 'border-line hover:border-plum-300 bg-paper-card'
                                }`}
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-plum-100 border border-line shrink-0">
                                <img
                                  src={psych.profileImage || psych.cardImage}
                                  alt={psych.fullName}
                                  className="w-full h-full object-cover object-top mix-blend-multiply"
                                  onError={handleImageFallback}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-[#1E1429] truncate">{psych.fullName}</div>
                                <div className="text-[10px] text-plum-700 truncate">{psych.credentials}</div>
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
                  <div className="space-y-3 pt-4 border-t border-line">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#3C3148] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-xs bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                          02
                        </span>
                        <span>Format Layanan Konseling</span>
                      </label>
                      <span className="text-[11px] text-[#72677E]">{services.length} Format Layanan</span>
                    </div>

                    <div className="space-y-2.5">
                      {services.map((svc) => {
                        const isSelected = selectedService?.id === svc.id
                        const price = calculateServicePrice(svc, effectiveMethod, selectedTier)
                        const svcSupportsOffline = Boolean(
                          svc.deliveryMethods?.includes('offline') &&
                          svc.priceOffline !== null &&
                          svc.priceOffline !== undefined
                        )
                        const lower = svc.title.toLowerCase()
                        const isBundleItem = lower.includes('bundl')

                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => {
                              setServiceIdState(svc.id)
                              if (!svcSupportsOffline && deliveryMethod === 'offline') {
                                setDeliveryMethod('online')
                              }
                            }}
                            className={`w-full p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isSelected
                                ? 'border-plum-700 bg-plum-50/70 ring-1 ring-plum-700 shadow-xs'
                                : 'border-line hover:border-plum-300 bg-paper-card'
                              }`}
                          >
                            <div className="space-y-1.5 max-w-md">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-[#1E1429]">{svc.title}</span>
                                {isBundleItem && (
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-plum-800 text-white">
                                    Paket Lengkap
                                  </span>
                                )}
                                {svcSupportsOffline ? (
                                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 rounded-xs font-normal">
                                    Online &amp; Tatap Muka
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5 rounded-xs font-normal">
                                    Khusus Online
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-[#645A70] line-clamp-2 leading-relaxed">{svc.description}</p>
                              <ul className="pt-1.5 space-y-1">
                                {getServiceFeatures(svc).map((point, pIdx) => (
                                  <li key={pIdx} className="text-[10px] text-plum-900/90 flex items-center gap-1.5">
                                    <Check className="w-2.5 h-2.5 text-plum-700 shrink-0" />
                                    <span className="line-clamp-1">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-line">
                              <span className="text-[10px] font-mono font-semibold text-plum-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-plum-500 shrink-0" />
                                <span>{svc.duration}</span>
                              </span>
                              <span className="text-xs font-extrabold text-[#1E1429] tabular-nums">
                                {formatIDR(price)}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* STEP 3: Modality Selection */}
                  <div className="space-y-3 pt-4 border-t border-line">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#3C3148] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-xs bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                          03
                        </span>
                        <span>Metode Pelaksanaan Sesi</span>
                      </label>
                      <span className="text-[11px] text-[#72677E]">
                        {supportsOffline ? '2 Metode Tersedia' : '1 Metode (Khusus Online)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('online')}
                        className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${effectiveMethod === 'online'
                            ? 'border-plum-700 bg-plum-50/70 ring-1 ring-plum-700 shadow-xs'
                            : 'border-line hover:border-plum-300 bg-paper-card'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-plum-700" />
                              <p className="font-bold text-xs text-[#1E1429]">Sesi Daring (Online)</p>
                            </div>
                            <span className="text-[11px] font-extrabold text-plum-900 font-mono tabular-nums">
                              {formatIDR(calculateServicePrice(selectedService, 'online', selectedTier))}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#645A70] leading-relaxed">
                            Konseling privat via Google Meet berenkripsi dari kenyamanan ruang Anda.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        disabled={!supportsOffline}
                        onClick={() => supportsOffline && setDeliveryMethod('offline')}
                        className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${!supportsOffline
                            ? 'border-line/40 bg-gray-100/60 text-gray-400 cursor-not-allowed opacity-60'
                            : effectiveMethod === 'offline'
                              ? 'border-plum-700 bg-plum-50/70 ring-1 ring-plum-700 shadow-xs cursor-pointer'
                              : 'border-line hover:border-plum-300 bg-paper-card cursor-pointer'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-plum-700" />
                              <p className="font-bold text-xs text-[#1E1429]">Tatap Muka (Offline)</p>
                            </div>
                            <span className="text-[11px] font-extrabold text-plum-900 font-mono tabular-nums">
                              {supportsOffline
                                ? formatIDR(calculateServicePrice(selectedService, 'offline', selectedTier))
                                : 'Tidak Tersedia'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#645A70] leading-relaxed">
                            {!supportsOffline
                              ? `Layanan "${selectedService?.title || 'ini'}" hanya tersedia dalam format Daring (Online).`
                              : 'Klinik tenang di Pondok Bambu, Duren Sawit, Jakarta Timur.'}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* STEP 4: Date & Time Slot Selection */}
                  <div className="space-y-4 pt-4 border-t border-line">
                    <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#3C3148] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-xs bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                        04
                      </span>
                      <span>Tentukan Tanggal &amp; Slot Jam Sesi (WIB)</span>
                    </label>

                    <div className="p-3 bg-amber-50/70 text-amber-900 text-xs rounded-lg flex items-center gap-2.5 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        Pemesanan membutuhkan lead time minimal 24 jam untuk persiapan psikolog. Jadwal hari ini tidak dapat dipesan.
                      </span>
                    </div>

                    {/* Date Picker Grid */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#72677E] block">
                        Pilih Tanggal Sesi:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {selectableDates.map((d) => {
                          const isSelected = selectedDate === d.dateStr
                          const parts = d.label.split(' ')
                          return (
                            <button
                              key={d.dateStr}
                              type="button"
                              onClick={() => setDateState(d.dateStr)}
                              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${isSelected
                                  ? 'border-plum-700 bg-plum-700 text-white font-bold shadow-xs'
                                  : 'border-line bg-paper-card hover:border-plum-300 hover:bg-plum-50/30 text-[#23192D]'
                                }`}
                            >
                              <p className="text-[9px] uppercase opacity-80">{parts[0]}</p>
                              <p className="text-sm font-extrabold mt-0.5 tabular-nums">{parts[1]}</p>
                              <p className="text-[9px] opacity-80">{parts[2]}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#72677E] block">
                        Pilih Jam Sesi (WIB):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {DEFAULT_DAILY_SLOTS.map((time) => {
                          const isSelected = selectedTime === time
                          const leadValidation = selectedDate
                            ? validateBookingLeadTime(selectedDate, time)
                            : { isValid: true }
                          const isAllowed = leadValidation.isValid

                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={!isAllowed}
                              onClick={() => handleSelectTime(time)}
                              className={`p-2.5 rounded-lg border text-center font-bold text-xs tabular-nums transition-all ${isSelected
                                  ? 'border-plum-700 bg-plum-50/80 text-plum-950 ring-1 ring-plum-700 shadow-xs cursor-pointer'
                                  : isAllowed
                                    ? 'border-line bg-paper-card hover:border-plum-300 text-[#23192D] cursor-pointer'
                                    : 'border-line/40 bg-sanctuary-100 text-[#C2B9CB] cursor-not-allowed'
                                }`}
                            >
                              {time} WIB
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* STEP 5: Notes & Informed Consent */}
                  <div className="space-y-4 pt-4 border-t border-line">
                    <label className="text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#3C3148] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-xs bg-plum-100 text-plum-800 flex items-center justify-center text-[10px] font-bold">
                        05
                      </span>
                      <span>Catatan Awal &amp; Informed Consent</span>
                    </label>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#3C3148] block">
                        Topik atau Keluhan yang Ingin Dibahas (Opsional)
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ceritakan secara ringkas hal apa yang ingin Anda konsultasikan bersama psikolog..."
                        className="w-full px-3.5 py-2 text-xs border border-line rounded-lg focus:ring-2 focus:ring-plum-500/20 focus:border-plum-600 focus:outline-hidden bg-sanctuary-50/70 focus:bg-paper-card transition-all"
                      />
                    </div>

                    <div className="p-3.5 bg-plum-50/50 rounded-lg border border-plum-200/80 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="consentCheckbox"
                          checked={consentAgreed}
                          onChange={(e) => setConsentAgreed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded-xs border-plum-300 accent-plum-700 cursor-pointer"
                        />
                        <label
                          htmlFor="consentCheckbox"
                          className="text-[11px] text-[#3C3148] leading-relaxed cursor-pointer"
                        >
                          Saya menyetujui <strong className="text-plum-900">Informed Consent</strong> layanan konseling psikologi Soulaide. Saya memahami bahwa slot dikunci secara atomik, reschedule maksimal 8 jam sebelum sesi, dan bukan untuk situasi gawat darurat jiwa (hubungi 119 ext 8 untuk krisis darurat).
                        </label>
                      </div>
                    </div>

                    {!user && (
                      <div className="p-3.5 bg-amber-50/70 text-amber-900 rounded-lg text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-200">
                        <span>
                          Anda belum masuk ke akun Anda. Silakan masuk untuk mengunci reservasi sesi ini.
                        </span>
                        <Link to="/login" state={{ from: { pathname: '/booking' } }}>
                          <Button size="sm" variant="outline" className="text-xs whitespace-nowrap rounded-md">
                            Masuk Akun
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN (5 cols, sticky): Live Clinical Reservation Slip */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24">
              <Card className="rounded-xl border border-line bg-paper-card shadow-xs overflow-hidden">
                <div className="border-b border-line bg-sanctuary-50/80 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-plum-900 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-plum-700" />
                      Slip Reservasi Sesi
                    </span>
                    <span className="text-[10px] text-plum-700 font-mono font-medium">SOULAIDE-SLIP</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1E1429] mt-0.5">Detail Sesi Terpilih</h3>
                </div>

                <CardContent className="p-5 space-y-4 text-xs">
                  {/* Selected Service */}
                  <div className="space-y-1 pb-3 border-b border-line">
                    <span className="text-[10px] text-[#8E81A1] uppercase tracking-wider font-semibold">Layanan</span>
                    <p className="text-sm font-bold text-[#1E1429]">
                      {selectedService?.title || 'Belum dipilih'}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Badge variant={selectedTier === 'Soul Expert' ? 'warning' : 'default'} className="text-[10px] rounded-xs">
                        {selectedTier}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] rounded-xs">
                        {effectiveMethod === 'offline' ? 'Tatap Muka' : 'Daring (Online)'}
                      </Badge>
                      {selectedService?.duration && (
                        <span className="text-[10px] text-plum-700 font-mono font-medium inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-plum-500" />
                          <span>{selectedService.duration}</span>
                        </span>
                      )}
                    </div>
                    {selectedService && (
                      <div className="pt-2 border-t border-line/60">
                        <span className="text-[10px] text-[#8E81A1] uppercase tracking-wider font-semibold block mb-1">
                          Cakupan &amp; Poin Layanan
                        </span>
                        <ul className="space-y-1">
                          {getServiceFeatures(selectedService).map((feat, fIdx) => (
                            <li key={fIdx} className="text-[11px] text-[#645A70] flex items-start gap-1.5">
                              <Check className="w-3 h-3 text-plum-700 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Selected Psychologist */}
                  <div className="flex items-center gap-3 pb-3 border-b border-line">
                    {selectedPsychologist ? (
                      <>
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-plum-50 border border-line shrink-0">
                          <img
                            src={selectedPsychologist.profileImage || selectedPsychologist.cardImage}
                            alt={selectedPsychologist.fullName}
                            className="w-full h-full object-cover object-top mix-blend-multiply"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#8E81A1] uppercase tracking-wider font-semibold block">Psikolog</span>
                          <p className="font-bold text-[#1E1429] truncate">
                            {selectedPsychologist.fullName}
                          </p>
                          <p className="text-[11px] text-plum-700 truncate">
                            {selectedPsychologist.credentials}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-[#8E81A1]">
                        <UserCheck className="w-4 h-4" />
                        <span>Belum memilih psikolog</span>
                      </div>
                    )}
                  </div>

                  {/* Selected Schedule */}
                  <div className="space-y-1 pb-3 border-b border-line">
                    <span className="text-[10px] text-[#8E81A1] uppercase tracking-wider font-semibold">Jadwal Sesi</span>
                    <div className="flex items-center justify-between text-[#1E1429] font-semibold">
                      <span>{selectedDate || 'Belum dipilih'}</span>
                      <span className="text-plum-700 tabular-nums">
                        {selectedTime ? `${selectedTime} WIB` : 'Pilih jam'}
                      </span>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="p-3.5 rounded-lg bg-sanctuary-50/80 border border-line flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#52475E]">Total Tagihan</span>
                    <span className="text-base font-extrabold text-plum-950 tabular-nums">
                      {formatIDR(calculatedPrice)}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-1">
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting || !consentAgreed || !user || !selectedTime}
                      className="w-full h-11 rounded-lg gap-2 bg-plum-700 hover:bg-plum-800 text-white font-bold"
                    >
                      {isSubmitting ? (
                        'Mengunci Slot...'
                      ) : !user ? (
                        'Masuk Akun untuk Reservasi'
                      ) : !selectedTime ? (
                        'Pilih Jam Sesi Terlebih Dahulu'
                      ) : (
                        <>
                          <span>Kunci Reservasi Sesi</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#72677E] pt-1">
                    <ShieldCheck className="w-4 h-4 text-plum-700 shrink-0" />
                    <span>Pembayaran aman via QRISGate (QRIS &amp; Transfer Bank) &amp; Kode Etik HIMPSI.</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : (
          /* Confirmed Reservation Receipt */
          <Card className="max-w-2xl mx-auto p-6 sm:p-8 text-center space-y-6 rounded-xl border border-line bg-paper-card shadow-xs">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="success" className="text-xs font-bold px-3 py-1 rounded-xs">
                Reservasi Berhasil Dikunci
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1429]">
                Slot Jadwal Berhasil Dipesan!
              </h2>
              <p className="text-xs sm:text-sm text-[#645A70] max-w-md mx-auto leading-relaxed">
                Kode booking Anda telah terdaftar secara resmi di sistem Soulaide. Lanjutkan ke pembayaran untuk aktivasi tautan sesi.
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 bg-sanctuary-50/80 rounded-lg border border-line text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-line pb-2.5">
                <span className="text-[#72677E] font-semibold uppercase tracking-wider">Kode Booking</span>
                <span className="font-mono font-bold text-sm text-plum-900">
                  {completedBooking.bookingCode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#72677E]">Layanan</span>
                <span className="font-semibold text-[#1E1429]">
                  {selectedService?.title} ({selectedTier})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#72677E]">Metode Sesi</span>
                <span className="font-semibold text-plum-800">
                  {effectiveMethod === 'offline' ? 'Tatap Muka (Pondok Bambu)' : 'Daring (Google Meet)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#72677E]">Psikolog</span>
                <span className="font-semibold text-[#1E1429]">{selectedPsychologist?.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#72677E]">Jadwal</span>
                <span className="font-semibold text-[#1E1429] tabular-nums">
                  {selectedDate} pukul {selectedTime} WIB
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-line pt-2.5">
                <span className="text-[#72677E] font-semibold">Total Tagihan</span>
                <span className="font-extrabold text-base text-plum-950 tabular-nums">
                  {formatIDR(calculatedPrice)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto h-11 px-5 rounded-lg">
                  Buka Dashboard Klien
                </Button>
              </Link>
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full sm:w-auto gap-2 h-11 px-6 rounded-lg bg-plum-700 hover:bg-plum-800 text-white"
              >
                <CreditCard className="w-4 h-4 text-plum-200" />
                <span>Bayar Sekarang via QRIS / Bank Transfer</span>
              </Button>
            </div>

            <MidtransSnapModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              bookingId={completedBooking.bookingId}
              bookingCode={completedBooking.bookingCode}
              serviceName={selectedService?.title || 'Konseling Psikologi'}
              amount={calculatedPrice}
              onPaymentSuccess={() => {
                setShowPaymentModal(false)
                navigate('/dashboard')
              }}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
