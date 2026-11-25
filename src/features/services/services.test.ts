import { describe, it, expect, vi } from 'vitest'
import {
  resolveServiceUuid,
  sanitizeServiceErrorMessage,
  fallbackServices,
  getEffectiveServices,
  saveStoredServices,
  UUID_REGEX,
  LEGACY_SERVICE_ID_MAP,
  syncServiceToDatabase,
  getDefaultFeaturesByTitle,
  getServiceFeatures,
} from './useServices'
import { supabase } from '@/lib/supabase/client'

describe('Service UUID Resolution & Safety', () => {
  it('directly returns valid UUID strings without database lookup', async () => {
    const validUuid = 'e1000000-0000-0000-0000-000000000001'
    const result = await resolveServiceUuid(validUuid)
    expect(result).toBe(validUuid)
  })

  it('maps legacy s1000000 prefix to valid e1000000 hex UUID', async () => {
    const legacyId = 's1000000-0000-0000-0000-000000000001'
    const result = await resolveServiceUuid(legacyId)
    expect(result).toBe('e1000000-0000-0000-0000-000000000001')
    expect(UUID_REGEX.test(result!)).toBe(true)
  })

  it('maps legacy s2000000 and s3000000 IDs correctly', async () => {
    const res2 = await resolveServiceUuid('s2000000-0000-0000-0000-000000000002')
    expect(res2).toBe('e2000000-0000-0000-0000-000000000002')

    const res3 = await resolveServiceUuid('s3000000-0000-0000-0000-000000000003')
    expect(res3).toBe('e3000000-0000-0000-0000-000000000003')
  })

  it('resolves slug to database UUID if row exists in remote table', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: 'b5500000-0000-0000-0000-000000000001', slug: 'konseling-khusus', name: 'Konseling Khusus' },
      error: null,
    })
    const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockOr = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockSelect = vi.fn().mockReturnValue({ or: mockOr })
    vi.spyOn(supabase, 'from').mockReturnValue({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>)

    const result = await resolveServiceUuid('konseling-khusus', 'Konseling Khusus')
    expect(result).toBe('b5500000-0000-0000-0000-000000000001')

    vi.restoreAllMocks()
  })

  it('safely handles empty or null input without throwing', async () => {
    expect(await resolveServiceUuid('')).toBeNull()
    expect(await resolveServiceUuid(null)).toBeNull()
    expect(await resolveServiceUuid(undefined)).toBeNull()
  })

  it('ensures all fallback services have RFC 4122 hexadecimal valid UUIDs', () => {
    expect(fallbackServices.length).toBeGreaterThanOrEqual(3)
    fallbackServices.forEach((service) => {
      expect(UUID_REGEX.test(service.id)).toBe(true)
      expect(service.title).toBeTruthy()
      expect(service.priceOnline).toBeGreaterThan(0)
    })
  })

  it('ensures legacy service ID map references valid UUIDs', () => {
    Object.entries(LEGACY_SERVICE_ID_MAP).forEach(([key, val]) => {
      expect(key.startsWith('s')).toBe(true)
      expect(UUID_REGEX.test(val.canonicalId)).toBe(true)
      expect(val.slug).toBeTruthy()
    })
  })

  it('sanitizes technical errors and prevents leakage of internal stack jargon', () => {
    const leakedError = new Error('invalid input syntax for type uuid: "s1000000-0000-0000-0000-000000000001"')
    const sanitized = sanitizeServiceErrorMessage(leakedError, 'Gagal')
    expect(sanitized.toLowerCase()).not.toContain('uuid')
    expect(sanitized.toLowerCase()).not.toContain('syntax')
    expect(sanitized.toLowerCase()).not.toContain('s1000000')

    const dbLeak = new Error('supabase connection reset by peer')
    const sanitizedDb = sanitizeServiceErrorMessage(dbLeak, 'Gagal')
    expect(sanitizedDb.toLowerCase()).not.toContain('supabase')
  })

  it('persists and returns effective services without reverting to defaults', () => {
    const initial = getEffectiveServices()
    expect(initial.length).toBeGreaterThan(0)

    const updatedService = {
      ...initial[0],
      title: 'Layanan Konseling Individu (Revisi VIP)',
      priceOnline: 150000,
    }

    saveStoredServices([updatedService, ...initial.slice(1)])
    const refreshed = getEffectiveServices()
    expect(refreshed[0].title).toBe('Layanan Konseling Individu (Revisi VIP)')
    expect(refreshed[0].priceOnline).toBe(150000)
  })

  it('updates existing service via UPDATE in syncServiceToDatabase without pkey duplicate', async () => {
    const existingId = 'e1000000-0000-0000-0000-000000000001'

    const mockUpdateMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: existingId },
      error: null,
    })
    const mockUpdateSelect = vi.fn().mockReturnValue({ maybeSingle: mockUpdateMaybeSingle })
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })

    const mockSelectMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: existingId, slug: 'individual-counseling' },
      error: null,
    })
    const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockSelectMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })

    vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'Soulaide_service_categories') {
        return {
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        } as unknown as ReturnType<typeof supabase.from>
      }
      return {
        select: mockSelect,
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>
    }) as unknown as typeof supabase.from)

    const res = await syncServiceToDatabase({
      id: existingId,
      name: 'Konseling Individu Revisi Baru',
      description: 'Deskripsi baru yang telah diperbarui',
      durationMinutes: 60,
      deliveryMethods: ['online', 'offline'],
      priceOnline: 125000,
      priceOffline: 375000,
      isActive: true,
    })

    expect(res).toBe(existingId)
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockUpdateEq).toHaveBeenCalledWith('id', existingId)

    vi.restoreAllMocks()
  })

  it('correctly provides default features by service title and respects custom features', () => {
    // 1. Defaults by title
    const individuDefaults = getDefaultFeaturesByTitle('Layanan Konseling Individu')
    expect(individuDefaults).toContain('Sesi konseling 1-on-1 (60 menit)')
    expect(individuDefaults).toContain('Daring atau tatap muka Pondok Bambu')
    expect(individuDefaults).toContain('Pendamping Soul Guidance atau Soul Expert')

    const mhcuDefaults = getDefaultFeaturesByTitle('Layanan MHCU (Mental Health Check Up)')
    expect(mhcuDefaults).toContain('Asesmen kondisi psikologis terstruktur')

    const bundleDefaults = getDefaultFeaturesByTitle('Bundling MHCU+Konseling Individu Online')
    expect(bundleDefaults).toContain('Asesmen MHCU komprehensif')

    // 2. getServiceFeatures with custom override
    const customPoints = [
      'Sesi konseling 1-on-1 khusus (90 menit)',
      'Konsultasi lanjutan via WhatsApp',
    ]
    const customResult = getServiceFeatures({
      title: 'Layanan Konseling Individu',
      features: customPoints,
    })
    expect(customResult).toEqual(customPoints)

    // 3. Fallback when features is empty array
    const fallbackResult = getServiceFeatures({
      title: 'Layanan Konseling Individu',
      features: [],
    })
    expect(fallbackResult).toEqual(individuDefaults)

    // 4. Fallback when svc is undefined/null
    expect(getServiceFeatures(null)).toEqual(individuDefaults)
  })

  it('preserves features when updating stored services', () => {
    const initial = getEffectiveServices()
    const updatedFeatures = [
      'Poin fitur baru nomor 1',
      'Poin fitur baru nomor 2',
    ]

    const updated = {
      ...initial[0],
      features: updatedFeatures,
    }

    saveStoredServices([updated, ...initial.slice(1)])
    const refreshed = getEffectiveServices()
    expect(refreshed[0].features).toEqual(updatedFeatures)
  })
})
