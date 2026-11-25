import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client.ts'
import type { PsychologistProfile, PresenceStatus } from '@/types/index.ts'
import { initialPsychologists } from './data.ts'
import { getAssetUrl } from '@/lib/utils.ts'

export interface UpdatePsychologistInput {
  id: string
  fullName?: string
  credentials?: string
  experienceYears?: string
  initialSchedule?: string
  practiceAreas?: string[]
  approaches?: string[]
  cardImageUrl?: string
  profileImageUrl?: string
  bio?: string
  isActive?: boolean
}

export interface PsychologistWithPresence extends PsychologistProfile {
  presence: PresenceStatus
  isActive?: boolean
  bio?: string
}

export interface CreatePsychologistInput {
  fullName: string
  credentials: string
  experienceYears: string
  initialSchedule?: string
  practiceAreas: string[]
  approaches: string[]
  cardImageUrl?: string
  profileImageUrl?: string
  bio?: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Module-level in-memory cache for presence status so updates are immediately preserved
const localPresenceCache = new Map<string, PresenceStatus>()

async function withTimeout<T>(promiseLike: PromiseLike<T>, timeoutMs = 2000): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout>
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs)
  })
  try {
    const result = await Promise.race([Promise.resolve(promiseLike), timeoutPromise])
    clearTimeout(timer!)
    return result as T
  } catch {
    clearTimeout(timer!)
    return null
  }
}

export async function resolvePsychologistUuid(idOrSlug: string): Promise<string | null> {
  if (!idOrSlug) return null
  if (UUID_REGEX.test(idOrSlug)) {
    return idOrSlug
  }

  try {
    // 1. Try finding by slug in Soulaide_psychologists
    const bySlugResult = await withTimeout(
      supabase
        .from('Soulaide_psychologists')
        .select('id')
        .eq('slug', idOrSlug)
        .maybeSingle()
    )

    if (bySlugResult?.data?.id && UUID_REGEX.test(bySlugResult.data.id)) {
      return bySlugResult.data.id
    }

    // 2. Try finding by matching partial slug or name
    const cleanTerm = idOrSlug.replace(/-/g, ' ')
    const byTermResult = await withTimeout(
      supabase
        .from('Soulaide_psychologists')
        .select('id')
        .or(`slug.ilike.%${idOrSlug}%,full_name.ilike.%${cleanTerm}%`)
        .limit(1)
        .maybeSingle()
    )

    if (byTermResult?.data?.id && UUID_REGEX.test(byTermResult.data.id)) {
      return byTermResult.data.id
    }

    // 3. Fallback: check matching psychologist in initialPsychologists
    const matchingInitial = initialPsychologists.find(
      (p) =>
        p.id === idOrSlug ||
        p.fullName.toLowerCase().includes(cleanTerm.toLowerCase()) ||
        cleanTerm.toLowerCase().includes(p.fullName.toLowerCase())
    )

    if (matchingInitial) {
      if (UUID_REGEX.test(matchingInitial.id)) {
        return matchingInitial.id
      }

      // Try inserting into Soulaide_psychologists so database generates a real UUID
      const insertResult = await withTimeout(
        supabase
          .from('Soulaide_psychologists')
          .insert({
            slug: idOrSlug,
            full_name: matchingInitial.fullName,
            credentials: matchingInitial.credentials,
            experience_years: matchingInitial.experienceYears,
            initial_schedule: matchingInitial.initialSchedule,
            practice_areas: matchingInitial.practiceAreas,
            approaches: matchingInitial.approaches,
            card_image_url: matchingInitial.cardImage,
            profile_image_url: matchingInitial.profileImage,
            is_active: true,
          })
          .select('id')
          .single()
      )

      if (insertResult?.data?.id && UUID_REGEX.test(insertResult.data.id)) {
        return insertResult.data.id
      }
    }
  } catch (err) {
    console.warn('Could not resolve psychologist UUID from slug:', idOrSlug, err)
  }

  return null
}

export function usePsychologists() {
  const queryClient = useQueryClient()

  const query = useQuery<PsychologistWithPresence[]>({
    queryKey: ['soulaide-psychologists'],
    queryFn: async () => {
      try {
        const { data: fetchedPsychs, error: psychsError } = await supabase
          .from('Soulaide_psychologists')
          .select('*')

        let psychs = fetchedPsychs

        // If the table is accessible but empty, seed initial psychologists
        if (!psychsError && psychs && psychs.length === 0) {
          try {
            const seedRows = initialPsychologists.map((p) => ({
              slug: p.id,
              full_name: p.fullName,
              credentials: p.credentials,
              experience_years: p.experienceYears,
              initial_schedule: p.initialSchedule,
              practice_areas: p.practiceAreas,
              approaches: p.approaches,
              card_image_url: p.cardImage,
              profile_image_url: p.profileImage,
              is_active: true,
            }))
            const { data: seeded } = await supabase
              .from('Soulaide_psychologists')
              .insert(seedRows)
              .select('*')
            if (seeded && seeded.length > 0) {
              psychs = seeded
            }
          } catch {
            // fallback
          }
        }

        const { data: presenceData } = await supabase
          .from('Soulaide_psychologist_presence')
          .select('psychologist_id, status')

        const presenceMap = new Map<string, PresenceStatus>()
        if (presenceData) {
          presenceData.forEach((p) => {
            presenceMap.set(p.psychologist_id, p.status as PresenceStatus)
          })
        }
        // Incorporate in-memory presence cache
        localPresenceCache.forEach((status, id) => {
          presenceMap.set(id, status)
        })

        if (psychsError || !psychs || psychs.length === 0) {
          return initialPsychologists.map((p) => ({
            ...p,
            presence: presenceMap.get(p.id) ?? localPresenceCache.get(p.id) ?? 'available',
            isActive: true,
          }))
        }

        return psychs.map((p) => {
          const isSenior =
            (p.experience_years &&
              (p.experience_years.includes('> 10') ||
                p.experience_years.toLowerCase().includes('senior'))) ||
            p.full_name.includes('Finandita')

          // Match matching initial profile for fallbacks if database image fields are missing
          const matchingInitial = initialPsychologists.find((init) =>
            init.fullName.toLowerCase().includes(p.full_name.toLowerCase()) ||
            p.full_name.toLowerCase().includes(init.fullName.toLowerCase())
          )

          const cardImg = p.card_image_url
            ? getAssetUrl(p.card_image_url)
            : matchingInitial?.cardImage || getAssetUrl('/Soulaide Psi Arc Logo.webp')

          const profileImg = p.profile_image_url
            ? getAssetUrl(p.profile_image_url)
            : matchingInitial?.profileImage || getAssetUrl('/Soulaide Psi Arc Logo.webp')

          const presenceStatus =
            presenceMap.get(p.id) ??
            (p.slug ? presenceMap.get(p.slug) : undefined) ??
            localPresenceCache.get(p.id) ??
            'available'

          return {
            id: p.id,
            slug: p.slug,
            fullName: p.full_name,
            credentials: p.credentials,
            experienceYears: p.experience_years,
            initialSchedule: p.initial_schedule ?? 'By appointment',
            practiceAreas: p.practice_areas,
            approaches: p.approaches,
            cardImage: cardImg,
            profileImage: profileImg,
            presence: presenceStatus,
            tier: isSenior ? ('Soul Expert' as const) : ('Soul Guidance' as const),
            isActive: p.is_active,
          }
        })
      } catch {
        return initialPsychologists.map((p) => ({
          ...p,
          presence: localPresenceCache.get(p.id) ?? 'available',
          isActive: true,
        }))
      }
    },
    initialData: initialPsychologists.map((p) => ({
      ...p,
      presence: localPresenceCache.get(p.id) ?? 'available',
      isActive: true,
    })),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const updatePresenceMutation = useMutation({
    mutationFn: async ({
      psychologistId,
      status,
    }: {
      psychologistId: string
      status: PresenceStatus
    }) => {
      // Store in local cache immediately
      localPresenceCache.set(psychologistId, status)

      const targetUuid = await resolvePsychologistUuid(psychologistId)

      if (targetUuid && UUID_REGEX.test(targetUuid)) {
        localPresenceCache.set(targetUuid, status)
        const { error } = await supabase.from('Soulaide_psychologist_presence').upsert(
          {
            psychologist_id: targetUuid,
            status,
            last_active_at: new Date().toISOString(),
          },
          { onConflict: 'psychologist_id' }
        )

        if (error) {
          const cleanMessage = error.message
            .replace(/supabase/gi, 'layanan')
            .replace(/webp/gi, 'gambar')
          throw new Error(`Gagal mengubah ketersediaan: ${cleanMessage}`)
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<PsychologistWithPresence[]>(['soulaide-psychologists'], (old) => {
        if (!old) return old
        return old.map((p) => {
          if (p.id === variables.psychologistId || (p.slug && p.slug === variables.psychologistId)) {
            return { ...p, presence: variables.status }
          }
          return p
        })
      })
      queryClient.invalidateQueries({ queryKey: ['soulaide-psychologists'] })
    },
  })

  const updatePsychologistMutation = useMutation({
    mutationFn: async (input: UpdatePsychologistInput) => {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (input.fullName !== undefined) {
        payload.full_name = input.fullName
        payload.slug = input.fullName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-')
      }
      if (input.credentials !== undefined) payload.credentials = input.credentials
      if (input.experienceYears !== undefined) payload.experience_years = input.experienceYears
      if (input.initialSchedule !== undefined) payload.initial_schedule = input.initialSchedule
      if (input.practiceAreas !== undefined) payload.practice_areas = input.practiceAreas
      if (input.approaches !== undefined) payload.approaches = input.approaches
      if (input.cardImageUrl !== undefined) payload.card_image_url = input.cardImageUrl
      if (input.profileImageUrl !== undefined) payload.profile_image_url = input.profileImageUrl
      if (input.bio !== undefined) payload.bio = input.bio
      if (input.isActive !== undefined) payload.is_active = input.isActive

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('Soulaide_psychologists') as any)
        .update(payload)
        .eq('id', input.id)

      if (error) {
        throw new Error(`Gagal memperbarui profil psikolog: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-psychologists'] })
    },
  })

  const createPsychologistMutation = useMutation({
    mutationFn: async (input: CreatePsychologistInput) => {
      const slug = input.fullName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('Soulaide_psychologists') as any).insert({
        full_name: input.fullName,
        slug,
        credentials: input.credentials,
        experience_years: input.experienceYears,
        initial_schedule: input.initialSchedule || 'Senin – Sabtu, by appointment',
        practice_areas: input.practiceAreas,
        approaches: input.approaches,
        card_image_url: input.cardImageUrl || null,
        profile_image_url: input.profileImageUrl || null,
        bio: input.bio || null,
        is_active: true,
        is_bot: false,
      })

      if (error) {
        throw new Error(`Gagal menambahkan psikolog baru: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-psychologists'] })
    },
  })

  const deletePsychologistMutation = useMutation({
    mutationFn: async (id: string) => {
      const resolvedId = (await resolvePsychologistUuid(id)) || id

      // 1. Delete relations
      try {
        await supabase.from('Soulaide_psychologist_presence').delete().eq('psychologist_id', resolvedId)
        await supabase.from('Soulaide_psychologist_schedules').delete().eq('psychologist_id', resolvedId)
        await supabase.from('Soulaide_service_psychologists').delete().eq('psychologist_id', resolvedId)
      } catch (relErr) {
        console.warn('Delete relations remote note:', relErr)
      }

      // 2. Delete psychologist row from Soulaide_psychologists table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: delErr } = await (supabase.from('Soulaide_psychologists') as any)
        .delete()
        .eq('id', resolvedId)

      if (delErr) {
        // Fallback to soft delete if restricted by foreign key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('Soulaide_psychologists') as any)
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', resolvedId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-psychologists'] })
    },
  })

  return {
    ...query,
    updatePresence: updatePresenceMutation.mutateAsync,
    isUpdatingPresence: updatePresenceMutation.isPending,
    updatePsychologist: updatePsychologistMutation.mutateAsync,
    isUpdatingPsychologist: updatePsychologistMutation.isPending,
    createPsychologist: createPsychologistMutation.mutateAsync,
    isCreatingPsychologist: createPsychologistMutation.isPending,
    deletePsychologist: deletePsychologistMutation.mutateAsync,
    isDeletingPsychologist: deletePsychologistMutation.isPending,
  }
}
