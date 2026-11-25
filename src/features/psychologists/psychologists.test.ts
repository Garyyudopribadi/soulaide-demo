import { describe, it, expect, vi } from 'vitest'
import { resolvePsychologistUuid } from './usePsychologists'
import { initialPsychologists } from './data'
import { supabase } from '@/lib/supabase/client'

describe('Psychologist UUID Resolution & Presence Safety', () => {
  it('directly returns valid UUID strings without database lookup', async () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    const result = await resolvePsychologistUuid(validUuid)
    expect(result).toBe(validUuid)
  })

  it('resolves non-UUID slugs using database lookup or returns fallback without crashing', async () => {
    // Mock supabase select response for 'filza-ayska'
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'a3000000-0000-0000-0000-000000000003' },
      error: null,
    })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.spyOn(supabase, 'from').mockReturnValue({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>)

    const result = await resolvePsychologistUuid('filza-ayska')
    expect(result).toBe('a3000000-0000-0000-0000-000000000003')

    vi.restoreAllMocks()
  })

  it('safely handles empty or null input', async () => {
    const emptyResult = await resolvePsychologistUuid('')
    expect(emptyResult).toBeNull()
  })

  it('ensures all initial psychologists have consistent slug definitions', () => {
    expect(initialPsychologists.length).toBe(4)
    initialPsychologists.forEach((p) => {
      expect(p.slug).toBeDefined()
      expect(p.fullName).toBeTruthy()
    })
  })
})
