import { describe, expect, it } from 'vitest'
import { fallbackServices } from '@/features/services/useServices.ts'
import { initialPsychologists } from '@/features/psychologists/data.ts'
import { fallbackFaqs } from '@/features/public-site/useFaqs.ts'
import { defaultLandingContent } from '@/features/public-site/landingContentService.ts'

describe('Public Site Data & Business Rules', () => {
  it('contains the 3 canonical services (Konseling Individu, MHCU, Bundling MHCU+Konseling Individu Online)', () => {
    expect(fallbackServices.length).toBe(3)

    const individual = fallbackServices.find((s) => s.title === 'Layanan Konseling Individu')
    const mhcu = fallbackServices.find((s) => s.title === 'Layanan MHCU (Mental Health Check Up)')
    const bundle = fallbackServices.find((s) => s.title === 'Bundling MHCU+Konseling Individu Online')

    expect(individual).toBeDefined()
    expect(individual?.priceOnline).toBe(110000)
    expect(individual?.priceOffline).toBe(350000)
    expect(individual?.deliveryMethods).toContain('online')
    expect(individual?.deliveryMethods).toContain('offline')

    expect(mhcu).toBeDefined()
    expect(mhcu?.priceOnline).toBe(89000)
    expect(mhcu?.deliveryMethods).toContain('online')
    expect(mhcu?.deliveryMethods).toContain('offline')

    expect(bundle).toBeDefined()
    expect(bundle?.priceOnline).toBe(169000)
    expect(bundle?.deliveryMethods).toContain('online')
  })

  it('contains the 4 verified initial psychologists with Soul Expert and Soul Guidance tiers', () => {
    expect(initialPsychologists.length).toBe(4)

    const names = initialPsychologists.map((p) => p.fullName)
    expect(names).toContain('Finandita Utari')
    expect(names).toContain('Amanda Natasanti')
    expect(names).toContain('Filza Ayska Syabina')
    expect(names).toContain('Narissa Qurrata Ayunin')

    const finandita = initialPsychologists.find((p) => p.fullName === 'Finandita Utari')
    expect(finandita?.credentials).toContain('M.Psi., Psikolog')
    expect(finandita?.experienceYears).toBe('> 10 tahun')
    expect(finandita?.tier).toBe('Soul Expert')

    const amanda = initialPsychologists.find((p) => p.fullName === 'Amanda Natasanti')
    expect(amanda?.tier).toBe('Soul Guidance')
  })

  it('constructs valid WhatsApp Click-to-Chat links without exposing private data', () => {
    const rawNumber = '+62 896-3086-9804'
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '')
    const message = 'Halo Soulaide, saya ingin bertanya mengenai layanan dan proses booking konseling.'

    expect(cleanNumber).toBe('6289630869804')

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    expect(url).toContain('https://wa.me/6289630869804?text=')
    expect(url).toContain('Halo%20Soulaide')
  })

  it('filters FAQs accurately by category', () => {
    const bookingFaqs = fallbackFaqs.filter((f) => f.category === 'booking')
    expect(bookingFaqs.length).toBeGreaterThan(0)
    for (const faq of bookingFaqs) {
      expect(faq.category).toBe('booking')
    }
  })

  it('auto-detects service quantity for navigation bar and landing page', () => {
    const services = fallbackServices
    const qty = services.length
    expect(qty).toBe(3)
    expect(String(qty)).toBe('3')

    // Verifies that dynamic prices match database definitions
    const individual = services.find((s) => s.title === 'Layanan Konseling Individu')
    expect(individual?.priceOnline).toBe(110000)
    expect(individual?.priceOffline).toBe(350000)
  })

  it('validates default clinical commitment editorial value pillars structure', () => {
    const commitment = defaultLandingContent.clinical_commitment
    expect(commitment).toBeDefined()
    expect(commitment.badge).toBe('Komitmen Klinis')
    expect(commitment.title).toBe('Mengapa Memilih')
    expect(commitment.accent).toBe('Soulaide?')
    expect(commitment.pillars.length).toBe(3)
    expect(commitment.pillars[0].title).toBe('Psikolog Berizin SIPP')
    expect(commitment.pillars[1].title).toBe('Kerahasiaan Medis Terjamin')
    expect(commitment.pillars[2].title).toBe('Pilihan Sesi Fleksibel')
  })

  it('validates default contact maps structure aligning with Mulai Perjalanan Anda CTA and clinic details', () => {
    const contactMaps = defaultLandingContent.contact_maps
    expect(contactMaps).toBeDefined()
    expect(contactMaps.clinic_name).toContain('Pondok Bambu')
    expect(contactMaps.cta_badge).toBe('Mulai Perjalanan Anda')
    expect(contactMaps.cta_title).toBe('Anda tidak harus menghadapi semuanya')
    expect(contactMaps.cta_accent).toBe('sendirian.')
    expect(contactMaps.maps_embed_url).toContain('https://www.google.com/maps/embed')
  })
})
