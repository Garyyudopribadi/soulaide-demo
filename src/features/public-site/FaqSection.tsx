import React, { useState } from 'react'
import { ChevronDown, HelpCircle, Search, X } from 'lucide-react'
import { useFaqs } from './useFaqs.ts'

const CATEGORIES = ['all', 'booking', 'privasi', 'reschedule', 'layanan'] as const

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Semua',
  booking: 'Reservasi & biaya',
  privasi: 'Kerahasiaan',
  reschedule: 'Jadwal',
  layanan: 'Metode sesi',
}

export const FaqSection: React.FC = () => {
  const { data: faqs } = useFaqs()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' || faq.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section id="faq" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Editorial heading rail */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-plum-500" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-plum-600">
                  Pertanyaan umum
                </span>
              </div>
              <h2 className="mt-5 font-serif text-3xl sm:text-4xl leading-[1.08] text-ink">
                Yang biasanya ditanyakan sebelum sesi pertama.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Ketentuan reservasi, batas antara Soul Guidance dan Soul Expert, sampai cara kami
                menjaga catatan klinis Anda.
              </p>

              <div className="mt-7 border-t border-line pt-5 text-sm">
                <p className="text-ink-muted">Belum menemukan jawabannya?</p>
                <a
                  href="#kontak"
                  className="mt-1 inline-flex items-center gap-1.5 font-semibold text-plum-800 underline decoration-plum-300 decoration-1 underline-offset-4 hover:text-plum-900"
                >
                  Tanya care coordinator
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Accordion rail */}
          <div className="lg:col-span-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari: reschedule, laporan MHCU, privasi…"
                  aria-label="Cari pertanyaan umum"
                  className="field-input pl-10 pr-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-3">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={isSelected}
                    className={`text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-plum-900 underline decoration-2 underline-offset-[9px]'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                )
              })}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="mt-8 border border-line bg-paper-card p-8 text-center">
                <HelpCircle className="mx-auto h-5 w-5 text-plum-500" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-bold text-ink">Belum ada yang cocok</h3>
                <p className="mt-1 text-xs text-ink-muted">
                  Coba kata kunci lain, atau tanyakan langsung ke care coordinator kami.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="mt-4 text-xs font-semibold text-plum-800 underline underline-offset-4 cursor-pointer"
                >
                  Tampilkan semua pertanyaan
                </button>
              </div>
            ) : (
              <div className="mt-2 divide-y divide-[#E7DFD2] border-b border-[#E7DFD2]">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id
                  return (
                    <div key={faq.id}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-6 py-5 text-left cursor-pointer group"
                      >
                        <span className="text-sm font-semibold leading-relaxed text-ink group-hover:text-plum-800">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-plum-700' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-ink-soft">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
