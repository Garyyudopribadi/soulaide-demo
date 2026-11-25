import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  X,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useFaqs } from './useFaqs.ts'

export const FaqPage: React.FC = () => {
  const { data: faqs } = useFaqs()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  const categories = ['all', 'booking', 'privasi', 'reschedule', 'layanan']

  const categoryLabels: Record<string, string> = {
    all: 'Semua Pertanyaan',
    booking: 'Reservasi & Biaya',
    privasi: 'Kerahasiaan & Data',
    reschedule: 'Jadwal & Reschedule',
    layanan: 'Metode & Fasilitas',
  }

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' || faq.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="pb-20 space-y-12">
      {/* =====================================================================
          ENHANCED FAQ HERO HEADER
         ===================================================================== */}
      <section className="relative w-full overflow-hidden border-b border-[#E5DDD4] soulaide-hero-mesh pt-12 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-plum-200/80 text-plum-800 text-xs font-semibold shadow-2xs backdrop-blur-sm">
            <HelpCircle className="w-3.5 h-3.5 text-plum-600" />
            <span>Pusat Informasi &amp; Bantuan Klien</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1E1429] tracking-tight">
            Pertanyaan yang{' '}
            <span className="font-serif italic font-semibold text-plum-700">Sering Diajukan</span>
          </h1>
          <p className="text-sm sm:text-base text-[#554B61] max-w-2xl mx-auto leading-relaxed">
            Temukan jawaban transparan mengenai reservasi, perbedaan Soul Guidance &amp; Soul Expert, privasi klinis, dan ketentuan perubahan jadwal.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Category Filter */}
        <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE3DC] shadow-[0_12px_36px_-18px_rgba(41,23,56,0.12)]">
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-[#8A7E96] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ketik kata kunci (misal: reschedule, tatap muka, privasi, laporan MHCU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-sm border border-[#E5DDD5] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-500 bg-sanctuary-100/70 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8A7E96] hover:text-[#23192D] cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-plum-700 text-white shadow-xs'
                      : 'bg-sanctuary-100 text-[#52475E] hover:bg-plum-50 border border-[#EAE3DC]'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE3DC] p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-plum-50 text-plum-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1E1429]">Pertanyaan tidak ditemukan</h3>
              <p className="text-xs text-[#645A70]">
                Coba gunakan kata kunci pencarian yang lain atau tanyakan langsung pada tim kami.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
              >
                Tampilkan Semua FAQ
              </Button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id
              return (
                <Card
                  key={faq.id}
                  className={`border transition-all duration-200 rounded-2xl overflow-hidden ${
                    isOpen
                      ? 'border-plum-300 shadow-[0_12px_30px_-16px_rgba(73,46,95,0.2)] bg-white'
                      : 'border-[#EAE3DC] hover:border-plum-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden focus:bg-sanctuary-100/70"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#1E1429] leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen
                          ? 'bg-plum-700 text-white rotate-180'
                          : 'bg-sanctuary-100 text-[#645A70] border border-[#EAE3DC]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <CardContent className="pt-0 pb-5 px-5 text-sm text-[#5A5066] leading-relaxed border-t border-[#F2ECE6]">
                      <p className="pt-4">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Support Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-plum-900 to-plum-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-plum-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-champagne-200" />
              <span>Layanan Bantuan Klien Soulaide</span>
            </div>
            <h4 className="font-bold text-lg text-white">
              Belum menemukan jawaban yang Anda cari?
            </h4>
            <p className="text-xs sm:text-sm text-plum-100/80 leading-relaxed">
              Care Coordinator kami siap membantu menjelaskan secara ramah melalui WhatsApp resmi Soulaide.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to="/contact">
              <Button className="gap-2 rounded-full px-5 bg-white text-plum-900 hover:bg-sanctuary-100">
                <MessageCircle className="w-4 h-4 text-plum-700" />
                <span>Tanya Tim Soulaide</span>
              </Button>
            </Link>
            <Link to="/booking">
              <Button
                variant="outline"
                className="gap-1.5 rounded-full px-5 border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Booking</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
