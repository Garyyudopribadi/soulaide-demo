import React from 'react'
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useSiteSettings } from './useSiteSettings.ts'
import { formatWhatsAppNumber, cleanWhatsAppNumber } from '@/lib/utils.ts'

export const ContactPage: React.FC = () => {
  const { data: settings } = useSiteSettings()

  const cleanNumber = cleanWhatsAppNumber(settings.whatsappNumber)
  const displayPhone = formatWhatsAppNumber(settings.whatsappNumber)
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(settings.defaultMessage)}`

  return (
    <div className="pb-20 space-y-12">
      {/* =====================================================================
          ENHANCED CONTACT HERO HEADER
         ===================================================================== */}
      <section className="relative w-full overflow-hidden border-b border-[#E5DDD4] soulaide-hero-mesh pt-12 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-plum-200/80 text-plum-800 text-xs font-semibold shadow-2xs backdrop-blur-sm">
            <MessageSquare className="w-3.5 h-3.5 text-plum-600" />
            <span>Care Coordinator &amp; Lokasi Klinik</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1E1429] tracking-tight">
            Hubungi <span className="font-serif italic font-semibold text-plum-700">Soulaide</span>
          </h1>
          <p className="text-sm sm:text-base text-[#554B61] max-w-2xl mx-auto leading-relaxed">
            Tim operasional kami siap memandu proses reservasi, konfirmasi jadwal sesi, serta menjawab pertanyaan layanan konseling Anda.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-stretch">
          {/* WhatsApp Card */}
          <Card className="flex flex-col justify-between rounded-xl border border-line bg-paper-card shadow-xs">
            <div>
              <CardHeader className="pb-3 border-b border-line">
                <div className="w-12 h-12 rounded-lg bg-plum-50 text-plum-700 flex items-center justify-center mb-3 border border-plum-100">
                  <MessageSquare className="w-5.5 h-5.5" />
                </div>
                <CardTitle className="text-xl font-bold text-[#1E1429]">
                  WhatsApp Resmi Klien
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <p className="text-sm text-[#645A70] leading-relaxed">
                  Terkoneksi langsung dengan Care Coordinator Soulaide untuk konsultasi pemilihan layanan, konfirmasi pembayaran, dan informasi teknis sesi.
                </p>

                <div className="p-4 bg-sanctuary-100/80 rounded-lg border border-line space-y-1.5">
                  <p className="text-[11px] text-[#72677E] font-bold uppercase tracking-wider">
                    Nomor Layanan Resmi
                  </p>
                  <p className="text-lg font-extrabold text-plum-900 tracking-wide tabular-nums">
                    {displayPhone}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#645A70] pt-1">
                    <Clock className="w-3.5 h-3.5 text-plum-600" />
                    <span>Respon rata-rata &lt; 30 menit (09.00 – 20.00 WIB)</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#5A5066]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-plum-600 shrink-0" />
                    <span>Panduan langkah demi langkah proses reservasi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-plum-600 shrink-0" />
                    <span>Bantuan perubahan jadwal (reschedule) &amp; teknis link Meet</span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-6 pt-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full gap-2 h-11 rounded-lg bg-plum-700 hover:bg-plum-800 text-white font-semibold">
                  <Phone className="w-4 h-4 text-plum-200" />
                  <span>Mulai Chat di WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                </Button>
              </a>
            </div>
          </Card>

          {/* Offline Practice Card */}
          <Card className="flex flex-col justify-between rounded-xl border border-line bg-paper-card shadow-xs">
            <div>
              <CardHeader className="pb-3 border-b border-line">
                <div className="w-12 h-12 rounded-lg bg-champagne-50 text-champagne-700 flex items-center justify-center mb-3 border border-champagne-200/80">
                  <MapPin className="w-5.5 h-5.5" />
                </div>
                <CardTitle className="text-xl font-bold text-[#1E1429]">Klinik Tatap Muka</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-[#645A70] pt-5">
                <div className="p-4 bg-sanctuary-100/80 rounded-lg border border-line space-y-1">
                  <p className="text-[11px] text-[#72677E] font-bold uppercase tracking-wider">
                    Alamat Praktik
                  </p>
                  <p className="text-sm font-bold text-[#1E1429] leading-snug">
                    {settings.offlineAddress}
                  </p>
                  <p className="text-xs text-[#645A70] pt-1">
                    Kecamatan Duren Sawit, Kota Jakarta Timur, DKI Jakarta 13430
                  </p>
                </div>

                <p className="text-xs text-[#645A70] leading-relaxed">
                  Ruang konsultasi bernuansa hangat, tenang, kedap suara, dan kondusif untuk menjaga privasi mutlak sesi konseling Anda bersama psikolog.
                </p>

                <div className="pt-3 space-y-2.5 border-t border-line text-xs text-[#4B3F59]">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-plum-600 shrink-0" />
                    <span>
                      <strong className="text-[#1E1429]">Jadwal Praktik:</strong> Sesuai Janji Temu Terkonfirmasi
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-plum-600 shrink-0" />
                    <span>
                      <strong className="text-[#1E1429]">Surel Resmi:</strong> halo@soulaide.id
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-plum-600 shrink-0" />
                    <span>Hanya melayani klien dengan reservasi terjadwal</span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-6 pt-2">
              <a
                href="https://maps.google.com/?q=Pondok+Bambu+Duren+Sawit+Jakarta+Timur"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full gap-2 h-11 rounded-lg">
                  <MapPin className="w-4 h-4 text-plum-600" />
                  <span>Buka Petunjuk Arah di Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Peta Lokasi Klinik Tatap Muka */}
        <div className="rounded-xl border border-line bg-paper-card overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-line bg-sanctuary-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-plum-700" />
              <div>
                <h3 className="text-xs font-bold text-ink">Peta Lokasi Klinik Soulaide</h3>
                <p className="text-[11px] text-ink-muted">Pondok Bambu, Duren Sawit, Jakarta Timur, DKI Jakarta</p>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Pondok+Bambu+Duren+Sawit+Jakarta+Timur"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-800 hover:text-plum-950 underline underline-offset-4"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="w-full h-80 relative bg-sanctuary-100">
            <iframe
              title="Peta Lokasi Klinik Soulaide Pondok Bambu"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.045431608824!2d106.89745354999999!3d-6.230553199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f36a5cf572d3%3A0x2a9a8d11c1e57c67!2sPondok%20Bambu%2C%20Duren%20Sawit%2C%20East%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
