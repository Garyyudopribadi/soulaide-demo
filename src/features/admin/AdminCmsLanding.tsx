import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useLandingContent } from '@/features/public-site/useLandingContent.ts'
import {
  uploadManagedAsset,
  uploadManagedVideo,
  listStorageVideos,
  isYouTubeUrl,
  parseYouTubeEmbedUrl,
} from '@/lib/storageManager.ts'
import {
  Upload,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  MapPin,
  Share2,
  Video,
  Layers,
  Image as ImageIcon,
  Film,
  Play,
  FolderOpen,
  Compass,
  Clock,
  Phone,
  Calendar,
  ArrowUpRight,
  HeartHandshake,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react'
import { defaultLandingContent } from '@/features/public-site/landingContentService.ts'

export const AdminCmsLanding: React.FC = () => {
  const { data: content, updateSection, isUpdating } = useLandingContent()
  const [activeSubTab, setActiveSubTab] = useState<'top_bar' | 'hero' | 'philosophy' | 'journey' | 'clinical_commitment' | 'contact_maps' | 'footer'>('top_bar')

  // Top Bar Form State
  const [topBar, setTopBar] = useState(content.top_bar)

  // Hero Form State
  const [hero, setHero] = useState(content.hero)

  // Philosophy Form State
  const [philosophy, setPhilosophy] = useState(content.philosophy)

  // Journey Form State
  const [journey, setJourney] = useState(content.journey || {
    badge: 'Alur Konseling',
    title_primary: 'Tiga langkah menuju',
    title_accent: 'ruang aman Anda',
    subtitle: 'Alur reservasi yang terukur, transparan, dan bebas kecemasan sejak awal.',
    steps: [
      {
        step: '01',
        title: 'Pilih Layanan & Psikolog',
        description: 'Tentukan kebutuhan Anda — Konseling Individu, MHCU, atau Bundling MHCU+Konseling Individu Online — lalu pilih pendamping Soul Guidance atau Soul Expert.',
        detail: '3 format layanan resmi, 4 psikolog terverifikasi SIPP',
      },
      {
        step: '02',
        title: 'Atur Jadwal & Metode Sesi',
        description: 'Pilih sesi Daring (Google Meet) atau Tatap Muka di Pondok Bambu sesuai waktu nyaman Anda dengan lead time minimal 24 jam.',
        detail: 'Kalender sinkron, konfirmasi jadwal langsung',
      },
      {
        step: '03',
        title: 'Mulai Sesi Privat & Terjaga',
        description: 'Konfirmasi pembayaran transparan, terima tautan ruang sesi aman, dan jalani proses pendampingan berstandar Kode Etik HIMPSI.',
        detail: 'Kerahasiaan medis terjamin & terlindungi',
      },
    ],
  })

  // Clinical Commitment Form State
  const [clinicalCommitment, setClinicalCommitment] = useState(
    content.clinical_commitment || defaultLandingContent.clinical_commitment
  )

  // Contact & Maps Form State
  const [contactMaps, setContactMaps] = useState(content.contact_maps)

  // Footer Form State
  const [footer, setFooter] = useState(content.footer)

  // Synchronize form states when fresh content arrives from database / cache
  useEffect(() => {
    if (content) {
      /* eslint-disable react-hooks/set-state-in-effect */
      if (content.top_bar) setTopBar(content.top_bar)
      if (content.hero) setHero(content.hero)
      if (content.philosophy) {
        setPhilosophy({
          ...content.philosophy,
          pillars: content.philosophy.pillars || [
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
          ],
        })
      }
      if (content.journey) setJourney(content.journey)
      if (content.clinical_commitment) setClinicalCommitment(content.clinical_commitment)
      if (content.contact_maps) setContactMaps(content.contact_maps)
      if (content.footer) {
        setFooter({
          ...content.footer,
          youtube: content.footer.youtube || 'https://youtube.com/@soulaide',
        })
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [content])

  // Upload status feedback
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Video Form State & Storage Picker
  const [storageVideos, setStorageVideos] = useState<{ name: string; url: string; size: number }[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  // Load storage videos on mount or when switching to philosophy tab
  useEffect(() => {
    let mounted = true
    const fetchVideos = async () => {
      setLoadingVideos(true)
      const list = await listStorageVideos('public-assets')
      if (mounted) {
        setStorageVideos(list)
        setLoadingVideos(false)
      }
    }
    fetchVideos()
    return () => {
      mounted = false
    }
  }, [activeSubTab])

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    try {
      const res = await uploadManagedVideo({
        file,
        folder: 'landing',
        customName: 'soulaide-video',
        previousUrl: philosophy.video_url,
      })

      setPhilosophy({ ...philosophy, video_url: res.url })
      showNotification('success', `Video berhasil diunggah (${res.sizeKb} KB) dan terhubung ke landing page.`)

      // Refresh storage videos list
      const list = await listStorageVideos('public-assets')
      setStorageVideos(list)
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal mengunggah video.')
    } finally {
      setUploadingVideo(false)
      e.target.value = ''
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4000)
  }

  // Handle image upload with auto-WebP optimization and replacement
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    options: {
      folder: 'landing' | 'brand'
      customName: string
      currentUrl: string
      onSuccess: (newUrl: string) => void
    }
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadManagedAsset({
        file,
        folder: options.folder,
        customName: options.customName,
        previousUrl: options.currentUrl,
      })

      options.onSuccess(res.url)
      showNotification(
        'success',
        `Aset berhasil disimpan (${res.sizeSavedKb > 0 ? `hemat ${res.sizeSavedKb} KB` : 'teroptimasi'}).`
      )
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal mengunggah file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSaveTopBar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'top_bar',
        title: 'Top Micro Announcement Bar',
        content: topBar,
      })
      showNotification('success', 'Konten Top Bar pengumuman berhasil diperbarui!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Top Bar')
    }
  }

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'hero',
        title: 'Hero Section',
        content: hero,
      })
      showNotification('success', 'Konten Hero Section landing page berhasil disimpan!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Hero')
    }
  }

  const handleSavePhilosophy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'philosophy',
        title: 'Behind Soulaide Philosophy',
        content: philosophy,
      })
      showNotification('success', 'Bagian Filosofi Soulaide & 3 Pilar berhasil diperbarui!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Filosofi')
    }
  }

  const handleSaveJourney = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'journey',
        title: 'Alur Konseling Client Journey',
        content: journey,
      })
      showNotification('success', 'Bagian Alur Konseling & langkah-langkah berhasil diperbarui!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Alur Konseling')
    }
  }

  const handleSaveClinicalCommitment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'clinical_commitment',
        title: 'Komitmen Klinis Editorial Value Pillars',
        content: clinicalCommitment,
      })
      showNotification('success', 'Bagian Komitmen Klinis berhasil diperbarui dan tersimpan!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Komitmen Klinis')
    }
  }

  const handleSaveContactMaps = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'contact_maps',
        title: 'Kontak, Lokasi Klinik & Google Maps',
        content: contactMaps,
      })
      showNotification('success', 'Detail kontak dan embed Google Maps berhasil diperbarui!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Kontak')
    }
  }

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSection({
        sectionKey: 'footer',
        title: 'Footer Content & Social Media',
        content: footer,
      })
      showNotification('success', 'Konten Footer & tautan media sosial berhasil disimpan!')
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menyimpan Footer')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-plum-100 text-plum-800 text-[10px] font-bold uppercase tracking-wider">
              Super Admin Control
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink tracking-tight mt-1">
            Manajemen Konten &amp; Aset Landing Page
          </h2>
          <p className="text-xs text-ink-muted">
            Kelola teks, foto teroptimasi, video loop, embed peta klinik, dan media sosial resmi.
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold ${notice.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
        >
          {notice.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Tabs Section Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-sanctuary-100 border border-line">
        <button
          type="button"
          onClick={() => setActiveSubTab('top_bar')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubTab === 'top_bar'
            ? 'bg-plum-900 text-white shadow-xs'
            : 'text-ink-soft hover:text-ink hover:bg-white/60'
            }`}
        >
          1. Top Announcement
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubTab === 'hero'
            ? 'bg-plum-900 text-white shadow-xs'
            : 'text-ink-soft hover:text-ink hover:bg-white/60'
            }`}
        >
          2. Hero Stage &amp; Logo
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('philosophy')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubTab === 'philosophy'
            ? 'bg-plum-900 text-white shadow-xs'
            : 'text-ink-soft hover:text-ink hover:bg-white/60'
            }`}
        >
          3. Filosofi &amp; Media
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('journey')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubTab === 'journey'
            ? 'bg-plum-900 text-white shadow-xs'
            : 'text-ink-soft hover:text-ink hover:bg-white/60'
            }`}
        >
          4. Alur Konseling
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('contact_maps')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubTab === 'contact_maps'
            ? 'bg-plum-900 text-white shadow-xs'
            : 'text-ink-soft hover:text-ink hover:bg-white/60'
            }`}
        >
          5. Lokasi, Kontak &amp; Maps
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('footer')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubTab === 'footer'
            ? 'bg-plum-900 text-white shadow-xs'
            : 'text-ink-soft hover:text-ink hover:bg-white/60'
            }`}
        >
          6. Footer &amp; Sosial Media
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TOP ANNOUNCEMENT BAR
         ========================================================================= */}
      {activeSubTab === 'top_bar' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSaveTopBar}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-plum-600" />
                <span>Pengaturan Top Announcement Bar</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Pita informasi di atas navbar beranda: menampilkan jadwal operasional dan nomor kontak hotline krisis darurat.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Live Preview Box */}
              <div className="rounded-lg border border-line bg-sanctuary-50/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-plum-600" />
                    Live Preview Bilah Atas (Top Announcement Bar):
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono">Tampil di Beranda</span>
                </div>
                <div className="w-full bg-[#24152A] text-plum-100 rounded-md px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] shadow-xs">
                  <div className="flex items-center gap-2 text-plum-200">
                    <Clock className="w-3.5 h-3.5 text-plum-400 shrink-0" />
                    <span>{topBar.schedule || 'Senin–Sabtu, sesuai perjanjian'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-plum-200">
                    <Phone className="w-3.5 h-3.5 text-champagne-400 shrink-0" />
                    <span>
                      Hotline Krisis:{' '}
                      <strong className="font-semibold text-white tracking-wide">
                        {topBar.crisis_hotline || '119'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">
                  Jadwal Operasional (Sisi Kiri)
                </label>
                <input
                  type="text"
                  required
                  value={topBar.schedule}
                  onChange={(e) => setTopBar({ ...topBar, schedule: e.target.value })}
                  placeholder="Senin–Sabtu, sesuai perjanjian"
                  className="field-input"
                />
                <span className="text-[11px] text-ink-muted">
                  Teks jadwal praktik atau jam operasional yang tampil di sisi kiri bilah atas.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Teks Label Hotline Krisis (Sisi Kanan)
                  </label>
                  <input
                    type="text"
                    required
                    value={topBar.crisis_hotline}
                    onChange={(e) => setTopBar({ ...topBar, crisis_hotline: e.target.value })}
                    placeholder="119"
                    className="field-input"
                  />
                  <span className="text-[11px] text-ink-muted">
                    Label nomor krisis yang tampil, misalnya: 119
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Nomor Panggilan Cepat (tel:)
                  </label>
                  <input
                    type="text"
                    required
                    value={topBar.crisis_phone}
                    onChange={(e) => setTopBar({ ...topBar, crisis_phone: e.target.value })}
                    placeholder="119"
                    className="field-input"
                  />
                  <span className="text-[11px] text-ink-muted">
                    Nomor telepon yang langsung dipanggil saat pengunjung mengklik link hotline.
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Top Bar</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 2: HERO STAGE & LOGO
         ========================================================================= */}
      {activeSubTab === 'hero' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSaveHero}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-plum-600" />
                <span>Hero Stage &amp; Logo Brand Utama</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Judul utama, tagline, dan aset logo resmi di landing page.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Logo Management */}
              <div className="p-4 rounded-xl bg-sanctuary-100 border border-line space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-white p-2 border border-line flex items-center justify-center">
                      <img
                        src={hero.logo_image}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Logo Resmi Soulaide Psi Arc</h4>
                      <p className="text-[11px] text-ink-muted">
                        Format transparan tersimpan aman di direktori brand.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-plum-800 text-white text-xs font-semibold hover:bg-plum-900 transition-colors cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Mengoptimasi...' : 'Ganti & Optimasi Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, {
                            folder: 'brand',
                            customName: 'soulaide-psi-arc-logo',
                            currentUrl: hero.logo_image,
                            onSuccess: (newUrl) => setHero({ ...hero, logo_image: newUrl }),
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">
                  Tagline Eyebrow (Teks Kecil di Atas)
                </label>
                <input
                  type="text"
                  required
                  value={hero.tagline_eyebrow}
                  onChange={(e) => setHero({ ...hero, tagline_eyebrow: e.target.value })}
                  className="field-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Judul Utama (Baris 1)
                  </label>
                  <input
                    type="text"
                    required
                    value={hero.heading_primary}
                    onChange={(e) => setHero({ ...hero, heading_primary: e.target.value })}
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Aksen Judul (Italic/Plum)
                  </label>
                  <input
                    type="text"
                    required
                    value={hero.heading_accent}
                    onChange={(e) => setHero({ ...hero, heading_accent: e.target.value })}
                    className="field-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">
                  Deskripsi Singkat Hero
                </label>
                <textarea
                  rows={2}
                  required
                  value={hero.description}
                  onChange={(e) => setHero({ ...hero, description: e.target.value })}
                  className="field-input"
                />
              </div>

              {/* Looping Phrases Editor */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-ink">
                  3 Pesan Berganti (Looping Sanctuary Header)
                </label>
                <div className="space-y-3">
                  {hero.looping_phrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-line bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-plum-700">
                        <span>Langkah {phrase.step}</span>
                        <input
                          type="text"
                          value={phrase.tag}
                          onChange={(e) => {
                            const updated = [...hero.looping_phrases]
                            updated[idx].tag = e.target.value
                            setHero({ ...hero, looping_phrases: updated })
                          }}
                          placeholder="Tag Pill"
                          className="px-2 py-0.5 text-[11px] font-sans border border-line rounded-xs"
                        />
                      </div>
                      <input
                        type="text"
                        value={phrase.text}
                        onChange={(e) => {
                          const updated = [...hero.looping_phrases]
                          updated[idx].text = e.target.value
                          setHero({ ...hero, looping_phrases: updated })
                        }}
                        placeholder="Headline Inggris..."
                        className="field-input text-xs font-serif"
                      />
                      <input
                        type="text"
                        value={phrase.sub}
                        onChange={(e) => {
                          const updated = [...hero.looping_phrases]
                          updated[idx].sub = e.target.value
                          setHero({ ...hero, looping_phrases: updated })
                        }}
                        placeholder="Subteks Bahasa Indonesia..."
                        className="field-input text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Hero</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 3: FILOSOFI & MEDIA (Behind Soulaide)
         ========================================================================= */}
      {activeSubTab === 'philosophy' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSavePhilosophy}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Video className="w-4 h-4 text-plum-600" />
                <span>Behind Soulaide — Filosofi &amp; Media Video</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Section penjelasan makna nama Soulaide, foto filosofi, dan tautan video modal.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-sanctuary-100 border border-line space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink">
                    <ImageIcon className="w-4 h-4 text-plum-600" />
                    <span>Gambar Filosofi</span>
                  </div>
                  <div className="w-full h-36 rounded-lg overflow-hidden bg-white border border-line">
                    <img
                      src={philosophy.image_url}
                      alt="Filosofi Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-plum-800 text-white text-xs font-semibold hover:bg-plum-900 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ganti Gambar Filosofi</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, {
                          folder: 'landing',
                          customName: 'apa-itu-soulaide',
                          currentUrl: philosophy.image_url,
                          onSuccess: (newUrl) => setPhilosophy({ ...philosophy, image_url: newUrl }),
                        })
                      }
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Badge Section</label>
                    <input
                      type="text"
                      value={philosophy.badge}
                      onChange={(e) => setPhilosophy({ ...philosophy, badge: e.target.value })}
                      className="field-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Judul</label>
                    <input
                      type="text"
                      value={philosophy.title}
                      onChange={(e) => setPhilosophy({ ...philosophy, title: e.target.value })}
                      className="field-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Aksen Judul (Italic)</label>
                    <input
                      type="text"
                      value={philosophy.accent}
                      onChange={(e) => setPhilosophy({ ...philosophy, accent: e.target.value })}
                      className="field-input"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">
                  Deskripsi Narasi Filosofi
                </label>
                <textarea
                  rows={3}
                  value={philosophy.description}
                  onChange={(e) => setPhilosophy({ ...philosophy, description: e.target.value })}
                  className="field-input"
                />
              </div>

              {/* 3 Pillars of Philosophy (01. Soul, 02. Aide, 03. Psi) */}
              <div className="space-y-3 pt-3 border-t border-line">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-ink flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-plum-600" />
                      <span>3 Pilar Filosofi Soulaide</span>
                    </label>
                    <p className="text-[11px] text-ink-muted">
                      Kelola 3 pilar utama identitas Soulaide yang tampil di landing page.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(philosophy.pillars || [
                    { tag: '01 · Soul', title: 'Ruang Jiwa Empatik', description: 'Menghargai keunikan emosi...' },
                    { tag: '02 · Aide', title: 'Pendampingan Aktif', description: 'Berjalan bersama Anda...' },
                    { tag: '03 · Psi (Ψ)', title: 'Keilmuan & Etika', description: 'Intervensi berbasis bukti...' },
                  ]).map((pillar, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-line space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-plum-700">Tag / Label</label>
                        <input
                          type="text"
                          value={pillar.tag}
                          onChange={(e) => {
                            const newPillars = [...(philosophy.pillars || [])]
                            newPillars[idx] = { ...pillar, tag: e.target.value }
                            setPhilosophy({ ...philosophy, pillars: newPillars })
                          }}
                          className="field-input text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-ink">Judul Pilar</label>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => {
                            const newPillars = [...(philosophy.pillars || [])]
                            newPillars[idx] = { ...pillar, title: e.target.value }
                            setPhilosophy({ ...philosophy, pillars: newPillars })
                          }}
                          className="field-input text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Deskripsi</label>
                        <textarea
                          rows={2}
                          value={pillar.description}
                          onChange={(e) => {
                            const newPillars = [...(philosophy.pillars || [])]
                            newPillars[idx] = { ...pillar, description: e.target.value }
                            setPhilosophy({ ...philosophy, pillars: newPillars })
                          }}
                          className="field-input text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Configuration (Storage File / Upload Video / YouTube Link) */}
              <div className="space-y-4 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-ink flex items-center gap-2">
                      <Film className="w-4 h-4 text-plum-600" />
                      <span>Video Header &amp; Filosofi</span>
                    </label>
                    <p className="text-[11px] text-ink-muted">
                      Mendukung video langsung dari galeri media cloud, upload berkas video baru (.mp4, .webm), atau link video YouTube.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: Storage Video Picker & Video Uploader */}
                  <div className="p-4 rounded-xl bg-white border border-line space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-plum-600" />
                        <span>Pilih dari Storage Bucket</span>
                      </span>
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-plum-800 text-white text-[11px] font-semibold hover:bg-plum-900 transition-colors cursor-pointer shadow-xs">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingVideo ? 'Mengunggah...' : 'Upload Video Baru'}</span>
                        <input
                          type="file"
                          accept="video/*"
                          disabled={uploadingVideo}
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                      </label>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {loadingVideos ? (
                        <p className="text-[11px] text-ink-muted italic">Memuat berkas video dari storage...</p>
                      ) : storageVideos.length === 0 ? (
                        <p className="text-[11px] text-ink-muted italic">Tidak ada file video di bucket. Silakan upload video baru.</p>
                      ) : (
                        storageVideos.map((vid) => {
                          const isSelected = philosophy.video_url === vid.url
                          return (
                            <button
                              key={vid.name}
                              type="button"
                              onClick={() => setPhilosophy({ ...philosophy, video_url: vid.url })}
                              className={`w-full text-left p-2 rounded-md border text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected
                                ? 'bg-plum-50 border-plum-400 text-plum-900 font-bold'
                                : 'bg-sanctuary-100/60 border-line text-ink hover:bg-sanctuary-100'
                                }`}
                            >
                              <span className="truncate max-w-[200px] sm:max-w-[240px]">{vid.name}</span>
                              <span className="text-[10px] text-ink-muted shrink-0 ml-2">
                                {vid.size > 0 ? `${Math.round(vid.size / 1024)} KB` : ''}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Option B: Direct URL / YouTube Link */}
                  <div className="p-4 rounded-xl bg-white border border-line space-y-3">
                    <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-plum-600" />
                      <span>URL Video atau Link YouTube</span>
                    </span>

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={philosophy.video_url}
                        onChange={(e) => setPhilosophy({ ...philosophy, video_url: e.target.value })}
                        placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://.../video.mp4"
                        className="field-input text-xs"
                      />
                      <p className="text-[10px] text-ink-muted">
                        Jika menggunakan YouTube, cukup salin link video (watch, share, shorts, atau embed). Sistem otomatis memutar player YouTube di landing page.
                      </p>
                    </div>

                    {/* Preview Box */}
                    <div className="rounded-lg overflow-hidden border border-line bg-slate-900 aspect-video w-full flex items-center justify-center">
                      {(() => {
                        const isYt = isYouTubeUrl(philosophy.video_url)
                        const embedUrl = isYt ? parseYouTubeEmbedUrl(philosophy.video_url) : null

                        if (isYt && embedUrl) {
                          return (
                            <iframe
                              src={embedUrl}
                              title="Preview YouTube"
                              className="w-full h-full border-0"
                            />
                          )
                        }

                        if (philosophy.video_url) {
                          return (
                            <video
                              src={philosophy.video_url}
                              controls
                              className="w-full h-full object-contain"
                            />
                          )
                        }

                        return (
                          <span className="text-xs text-white/50 italic">
                            Belum ada video dipilih
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Filosofi</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB: ALUR KONSELING (Client Journey & Steps)
         ========================================================================= */}
      {activeSubTab === 'journey' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSaveJourney}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Compass className="w-4 h-4 text-plum-600" />
                <span>Alur Konseling &amp; Tiga Langkah Ruang Aman</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Kelola judul, sub-judul, dan detail poin langkah alur konseling bagi klien baru.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">Badge Section</label>
                  <input
                    type="text"
                    value={journey.badge}
                    onChange={(e) => setJourney({ ...journey, badge: e.target.value })}
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">Judul Utama</label>
                  <input
                    type="text"
                    value={journey.title_primary}
                    onChange={(e) => setJourney({ ...journey, title_primary: e.target.value })}
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">Aksen Judul (Italic)</label>
                  <input
                    type="text"
                    value={journey.title_accent}
                    onChange={(e) => setJourney({ ...journey, title_accent: e.target.value })}
                    className="field-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">Sub-Judul / Deskripsi Alur</label>
                <input
                  type="text"
                  value={journey.subtitle}
                  onChange={(e) => setJourney({ ...journey, subtitle: e.target.value })}
                  className="field-input"
                />
              </div>

              {/* 3 Steps Journey Editor */}
              <div className="space-y-3 pt-2 border-t border-line">
                <label className="text-xs font-bold text-ink">
                  Detail Poin-Poin Langkah (Step 01, 02, 03)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {journey.steps.map((stepItem, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-line space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-plum-700 bg-plum-50 px-2 py-0.5 rounded">
                          Langkah {stepItem.step}
                        </span>
                        <span className="text-[10px] text-ink-muted">Poin {idx + 1}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-ink">Judul Langkah</label>
                        <input
                          type="text"
                          value={stepItem.title}
                          onChange={(e) => {
                            const newSteps = [...journey.steps]
                            newSteps[idx] = { ...stepItem, title: e.target.value }
                            setJourney({ ...journey, steps: newSteps })
                          }}
                          className="field-input text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Penjelasan Langkah</label>
                        <textarea
                          rows={3}
                          value={stepItem.description}
                          onChange={(e) => {
                            const newSteps = [...journey.steps]
                            newSteps[idx] = { ...stepItem, description: e.target.value }
                            setJourney({ ...journey, steps: newSteps })
                          }}
                          className="field-input text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-plum-600">Catatan Ringkas (Bawah)</label>
                        <input
                          type="text"
                          value={stepItem.detail}
                          onChange={(e) => {
                            const newSteps = [...journey.steps]
                            newSteps[idx] = { ...stepItem, detail: e.target.value }
                            setJourney({ ...journey, steps: newSteps })
                          }}
                          className="field-input text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Alur Konseling</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 5: KOMITMEN KLINIS (EDITORIAL VALUE PILLARS)
         ========================================================================= */}
      {activeSubTab === 'clinical_commitment' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSaveClinicalCommitment}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-plum-600" />
                <span>Pengaturan Komitmen Klinis (Mengapa Memilih Soulaide)</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Kelola judul pengantar, deskripsi nilai utama, dan 3 pilar komitmen klinis yang tampil di beranda.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Live Preview Box */}
              <div className="rounded-lg border border-line bg-sanctuary-50/70 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-plum-600" />
                    Live Preview Komitmen Klinis:
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono">Tampil di Bagian Bawah Beranda</span>
                </div>

                <div className="space-y-2 pb-3 border-b border-line/60">
                  <div className="flex items-center gap-2">
                    <span className="h-px w-6 bg-plum-600" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-plum-600">
                      {clinicalCommitment.badge || 'Komitmen Klinis'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-ink">
                    {clinicalCommitment.title || 'Mengapa Memilih'}{' '}
                    <span className="italic text-plum-700">{clinicalCommitment.accent || 'Soulaide?'}</span>
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {clinicalCommitment.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {clinicalCommitment.pillars.map((pillar, idx) => {
                    const PillarIcon =
                      idx === 0 ? HeartHandshake : idx === 1 ? ShieldCheck : MessageCircle
                    const iconColor =
                      idx === 2 ? 'text-champagne-600' : 'text-plum-700'
                    return (
                      <div key={idx} className="border-t border-line pt-3 space-y-1.5 bg-white/70 p-3 rounded-md">
                        <PillarIcon className={`w-4 h-4 ${iconColor}`} />
                        <h4 className="text-xs font-bold text-ink">{pillar.title}</h4>
                        <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-3">
                          {pillar.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Header Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Badge Eyebrow
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicalCommitment.badge}
                    onChange={(e) =>
                      setClinicalCommitment({ ...clinicalCommitment, badge: e.target.value })
                    }
                    placeholder="Komitmen Klinis"
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Judul Utama
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicalCommitment.title}
                    onChange={(e) =>
                      setClinicalCommitment({ ...clinicalCommitment, title: e.target.value })
                    }
                    placeholder="Mengapa Memilih"
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Kata Aksen (Miring)
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicalCommitment.accent}
                    onChange={(e) =>
                      setClinicalCommitment({ ...clinicalCommitment, accent: e.target.value })
                    }
                    placeholder="Soulaide?"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">
                  Deskripsi Pengantar
                </label>
                <textarea
                  rows={2}
                  required
                  value={clinicalCommitment.description}
                  onChange={(e) =>
                    setClinicalCommitment({ ...clinicalCommitment, description: e.target.value })
                  }
                  className="field-input"
                />
              </div>

              {/* 3 Pillars Configuration */}
              <div className="space-y-4 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-plum-600" />
                    <span>3 Pilar Nilai Komitmen Klinis</span>
                  </h4>
                  <span className="text-[11px] text-ink-muted">Dapat disesuaikan sesuai kebutuhan</span>
                </div>

                <div className="space-y-4">
                  {clinicalCommitment.pillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-line bg-paper space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-line/60 pb-2">
                        <span className="text-xs font-bold text-plum-800">
                          Pilar 0{idx + 1}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {idx === 0
                            ? 'Ikon: Hati / Kemitraan'
                            : idx === 1
                            ? 'Ikon: Perisai / Kerahasiaan'
                            : 'Ikon: Percakapan / Fleksibilitas'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink-soft">
                          Judul Pilar
                        </label>
                        <input
                          type="text"
                          required
                          value={pillar.title}
                          onChange={(e) => {
                            const updated = [...clinicalCommitment.pillars]
                            updated[idx] = { ...updated[idx], title: e.target.value }
                            setClinicalCommitment({ ...clinicalCommitment, pillars: updated })
                          }}
                          className="field-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink-soft">
                          Uraian Penjelasan Pilar
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={pillar.description}
                          onChange={(e) => {
                            const updated = [...clinicalCommitment.pillars]
                            updated[idx] = { ...updated[idx], description: e.target.value }
                            setClinicalCommitment({ ...clinicalCommitment, pillars: updated })
                          }}
                          className="field-input"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Komitmen Klinis</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 5: LOKASI, KONTAK & MAPS (SESUAI LANDING PAGE TERBARU)
         ========================================================================= */}
      {activeSubTab === 'contact_maps' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSaveContactMaps}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <MapPin className="w-4 h-4 text-plum-600" />
                <span>Kontak, Lokasi Praktik &amp; Kartu &quot;Mulai Perjalanan Anda&quot;</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Perbarui kartu ajakan penutup (Mulai Perjalanan Anda), alamat praktik Pondok Bambu, nomor WhatsApp konsultasi, dan embed peta Google Maps sesuai landing page terbaru.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* BAGIAN A: Kartu Ajakan (Mulai Perjalanan Anda) */}
              <div className="space-y-3 pb-5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-plum-800">
                    1. Kartu Ajakan &bull; Mulai Perjalanan Anda (Pengganti WhatsApp Resmi &amp; Jam/Surel)
                  </h4>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Kartu ini tampil di sebelah kiri lokasi klinik dengan latar warna plum elegan dan tombol aksi langsung.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Label / Tag Kartu</label>
                    <input
                      type="text"
                      required
                      value={contactMaps.cta_badge || 'Mulai Perjalanan Anda'}
                      onChange={(e) => setContactMaps({ ...contactMaps, cta_badge: e.target.value })}
                      placeholder="Mulai Perjalanan Anda"
                      className="field-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Judul Utama</label>
                    <input
                      type="text"
                      required
                      value={contactMaps.cta_title || 'Anda tidak harus menghadapi semuanya'}
                      onChange={(e) => setContactMaps({ ...contactMaps, cta_title: e.target.value })}
                      placeholder="Anda tidak harus menghadapi semuanya"
                      className="field-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Kata Aksen (Miring)</label>
                    <input
                      type="text"
                      required
                      value={contactMaps.cta_accent || 'sendirian.'}
                      onChange={(e) => setContactMaps({ ...contactMaps, cta_accent: e.target.value })}
                      placeholder="sendirian."
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">Deskripsi / Kalimat Empati</label>
                  <textarea
                    rows={2}
                    required
                    value={
                      contactMaps.cta_description ||
                      'Ambil langkah kecil yang penuh makna. Tim psikolog Soulaide siap mendengarkan dan mendampingi Anda dengan empati dan keahlian klinis.'
                    }
                    onChange={(e) => setContactMaps({ ...contactMaps, cta_description: e.target.value })}
                    placeholder="Ambil langkah kecil yang penuh makna..."
                    className="field-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    Nomor WhatsApp Konsultasi (Tujuan Tombol &quot;Konsultasi via WhatsApp&quot;)
                  </label>
                  <input
                    type="text"
                    required
                    value={contactMaps.phone}
                    onChange={(e) => setContactMaps({ ...contactMaps, phone: e.target.value })}
                    placeholder="+62 896-3086-9804"
                    className="field-input"
                  />
                  <p className="text-[11px] text-ink-muted">
                    Format nomor internasional diawali +62 (contoh: +62 896-3086-9804).
                  </p>
                </div>
              </div>

              {/* BAGIAN B: Klinik Tatap Muka */}
              <div className="space-y-3 pb-5 border-b border-line">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-plum-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-plum-800">
                    2. Informasi Klinik Tatap Muka (Pondok Bambu)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Nama Klinik</label>
                    <input
                      type="text"
                      required
                      value={contactMaps.clinic_name}
                      onChange={(e) => setContactMaps({ ...contactMaps, clinic_name: e.target.value })}
                      placeholder="Klinik Praktik Soulaide Pondok Bambu"
                      className="field-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-soft">Catatan Jadwal Praktik</label>
                    <input
                      type="text"
                      required
                      value={contactMaps.schedule}
                      onChange={(e) => setContactMaps({ ...contactMaps, schedule: e.target.value })}
                      placeholder="Senin – Sabtu (Sesuai Perjanjian)"
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">Alamat Lengkap Praktik</label>
                  <input
                    type="text"
                    required
                    value={contactMaps.address}
                    onChange={(e) => setContactMaps({ ...contactMaps, address: e.target.value })}
                    placeholder="Pondok Bambu, Duren Sawit, Jakarta Timur 13430"
                    className="field-input"
                  />
                </div>
              </div>

              {/* BAGIAN C: Peta Google Maps Embed */}
              <div className="space-y-3 pb-5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-plum-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-plum-800">
                    3. Sematan Peta Interaktif (Google Maps Embed)
                  </h4>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">
                    URL Embed Google Maps (iframe src)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={contactMaps.maps_embed_url}
                    onChange={(e) => setContactMaps({ ...contactMaps, maps_embed_url: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="field-input font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-ink-muted">
                    Buka Google Maps &gt; Bagikan &gt; Sematkan Peta &gt; Salin tautan `src=&quot;...&quot;`.
                  </p>
                </div>
              </div>

              {/* BAGIAN D: Live Preview Sesuai Landing Page Terbaru */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-ink block">
                  Live Preview Bagian Kontak &amp; Lokasi (Persis Tampilan Landing Page):
                </span>

                <div className="p-4 sm:p-6 rounded-xl border border-line bg-paper-deep/40 space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Kartu Mulai Perjalanan Anda */}
                    <div className="lg:col-span-7 flex flex-col justify-between bg-plum-900 p-5 sm:p-6 text-[#FBF7F0] rounded-xl border border-plum-800 shadow-xs">
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-plum-200">
                          <span>{contactMaps.cta_badge || 'Mulai Perjalanan Anda'}</span>
                        </div>
                        <h5 className="font-serif text-lg sm:text-xl text-[#FBF7F0] leading-snug">
                          {contactMaps.cta_title || 'Anda tidak harus menghadapi semuanya'}{' '}
                          <span className="italic text-plum-200">{contactMaps.cta_accent || 'sendirian.'}</span>
                        </h5>
                        <p className="text-xs text-[#D6C9D8] leading-relaxed">
                          {contactMaps.cta_description ||
                            'Ambil langkah kecil yang penuh makna. Tim psikolog Soulaide siap mendengarkan dan mendampingi Anda dengan empati dan keahlian klinis.'}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/15 pt-3">
                        <span className="inline-flex items-center gap-1 bg-[#FBF7F0] px-3 py-1.5 text-xs font-semibold text-plum-900 rounded-md">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Reservasi Sesi Sekarang</span>
                        </span>
                        <span className="inline-flex items-center gap-1 border border-white/25 px-3 py-1.5 text-xs font-semibold text-[#FBF7F0] rounded-md">
                          <span>Konsultasi via WhatsApp</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Kartu Klinik Tatap Muka */}
                    <div className="lg:col-span-5 flex flex-col justify-between border border-line bg-paper-card p-5 rounded-xl shadow-xs">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-plum-600">
                          <MapPin className="h-3 w-3" />
                          <span>Klinik tatap muka</span>
                        </div>
                        <h6 className="mt-2 text-sm font-bold text-ink">
                          {contactMaps.clinic_name || 'Klinik Soulaide Pondok Bambu'}
                        </h6>
                        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                          {contactMaps.address || 'Pondok Bambu, Duren Sawit, Jakarta Timur 13430'}
                        </p>
                        <p className="mt-2 text-[10px] text-[#72677E]">
                          Ruang konsultasi kedap suara, tenang, dan privat untuk sesi tatap muka dengan janji temu terkonfirmasi.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                        <span className="text-ink-muted text-[11px]">{contactMaps.schedule || 'Praktik sesuai janji temu'}</span>
                        <span className="font-semibold text-plum-800 flex items-center gap-1 text-[11px]">
                          <span>Petunjuk arah</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Peta Iframe */}
                  <div className="w-full h-44 rounded-lg overflow-hidden border border-line bg-sanctuary-100">
                    <iframe
                      title="Live Maps Preview"
                      src={contactMaps.maps_embed_url}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Kontak &amp; Maps</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 5: FOOTER & SOCIAL MEDIA
         ========================================================================= */}
      {activeSubTab === 'footer' && (
        <Card className="rounded-xl border-line bg-paper-card">
          <form onSubmit={handleSaveFooter}>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Share2 className="w-4 h-4 text-plum-600" />
                <span>Footer &amp; Tautan Media Sosial</span>
              </CardTitle>
              <p className="text-xs text-ink-muted">
                Perbarui deskripsi footer, tautan akun resmi Instagram, Threads, dan Facebook.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">Tagline Footer</label>
                <textarea
                  rows={2}
                  required
                  value={footer.tagline}
                  onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                  className="field-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">URL Instagram</label>
                  <input
                    type="url"
                    required
                    value={footer.instagram}
                    onChange={(e) => setFooter({ ...footer, instagram: e.target.value })}
                    placeholder="https://instagram.com/soulaide"
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">URL Threads</label>
                  <input
                    type="url"
                    required
                    value={footer.threads}
                    onChange={(e) => setFooter({ ...footer, threads: e.target.value })}
                    placeholder="https://threads.net/@soulaide"
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">URL Facebook</label>
                  <input
                    type="url"
                    required
                    value={footer.facebook}
                    onChange={(e) => setFooter({ ...footer, facebook: e.target.value })}
                    placeholder="https://facebook.com/soulaide"
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft">URL YouTube</label>
                  <input
                    type="url"
                    value={footer.youtube || ''}
                    onChange={(e) => setFooter({ ...footer, youtube: e.target.value })}
                    placeholder="https://youtube.com/@soulaide"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-soft">Teks Hak Cipta (Copyright)</label>
                <input
                  type="text"
                  required
                  value={footer.copyright}
                  onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                  className="field-input"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-line p-4 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Footer</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}
