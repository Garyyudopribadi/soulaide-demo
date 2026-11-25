import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client.ts'
import type { ServiceDetail, DeliveryMethod, ProfessionalTier } from '@/types/index.ts'

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const LEGACY_SERVICE_ID_MAP: Record<string, { slug: string; canonicalId: string; title: string }> = {
  's1000000-0000-0000-0000-000000000001': {
    slug: 'individual-counseling',
    canonicalId: 'e1000000-0000-0000-0000-000000000001',
    title: 'Layanan Konseling Individu',
  },
  's2000000-0000-0000-0000-000000000002': {
    slug: 'mhcu',
    canonicalId: 'e2000000-0000-0000-0000-000000000002',
    title: 'Layanan MHCU (Mental Health Check Up)',
  },
  's3000000-0000-0000-0000-000000000003': {
    slug: 'bundle-packet',
    canonicalId: 'e3000000-0000-0000-0000-000000000003',
    title: 'Bundling MHCU+Konseling Individu Online',
  },
}

export const fallbackServices: ServiceDetail[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    title: 'Layanan Konseling Individu',
    category: 'Soul Guidance',
    duration: '1 Sesi Konseling / 60 Menit',
    method: 'Online & Tatap Muka (Offline)',
    price: 110000,
    priceOnline: 110000,
    priceOffline: 350000,
    deliveryMethods: ['online', 'offline'],
    description:
      'Sesi konseling 1-on-1 selama 60 menit bersama psikolog profesional untuk memahami pikiran, emosi, stres, quarter-life crisis, karier, maupun dinamika relasi.',
    isConfirmedPrice: true,
    features: [
      'Sesi konseling 1-on-1 (60 menit)',
      'Daring atau tatap muka Pondok Bambu',
      'Pendamping Soul Guidance atau Soul Expert',
    ],
  },
  {
    id: 'e2000000-0000-0000-0000-000000000002',
    title: 'Layanan MHCU (Mental Health Check Up)',
    category: 'Soul Guidance',
    duration: 'Asesmen + 1 Sesi Konseling / 30 Menit',
    method: 'Online & Tatap Muka (Offline)',
    price: 89000,
    priceOnline: 89000,
    priceOffline: 200000,
    deliveryMethods: ['online', 'offline'],
    description:
      'Pemeriksaan kesehatan mental terstruktur dilengkapi 1 sesi konseling pembahasan awal selama 30 menit untuk memahami kondisi emosional, tingkat stres, serta rekomendasi awal.',
    isConfirmedPrice: true,
    features: [
      'Asesmen kondisi psikologis terstruktur',
      'Sesi pembahasan awal (30 menit)',
      'Laporan analisis klinis dalam 2 minggu',
    ],
  },
  {
    id: 'e3000000-0000-0000-0000-000000000003',
    title: 'Bundling MHCU+Konseling Individu Online',
    category: 'Soul Guidance',
    duration: 'Asesmen + 1 Sesi Penyampaian Hasil MHCU / 30 Menit + 1 Sesi Konseling / 60 Menit',
    method: 'Daring (Online via Google Meet)',
    price: 169000,
    priceOnline: 169000,
    priceOffline: null,
    deliveryMethods: ['online'],
    description:
      'Paket terintegrasi terbaik: asesmen MHCU menyeluruh, 1 sesi penyampaian hasil MHCU (30 menit), dan 1 sesi konseling individu mendalam (60 menit) secara online.',
    isConfirmedPrice: true,
    features: [
      'Asesmen MHCU komprehensif',
      'Sesi penyampaian hasil (30 menit)',
      'Sesi konseling individu daring (60 menit)',
    ],
  },
]

export const SERVICES_STORAGE_KEY = 'soulaide_services_catalog_v1'

export function loadStoredServices(): ServiceDetail[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // ignore local storage error
  }
  return null
}

let memoryServicesStore: ServiceDetail[] = [...fallbackServices]

export function saveStoredServices(services: ServiceDetail[]): void {
  memoryServicesStore = [...services]
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services))
    } catch {
      // ignore local storage error
    }
  }
}

export function getEffectiveServices(): ServiceDetail[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = loadStoredServices()
    if (stored && stored.length > 0) {
      memoryServicesStore = stored
      return stored
    }
  }
  return [...memoryServicesStore]
}

export function calculateServicePrice(
  svc: ServiceDetail | undefined | null,
  method: DeliveryMethod,
  tier?: ProfessionalTier
): number {
  if (!svc) return 0
  // Untuk saat ini harga diseragamkan (Soul Expert tidak merubah atau menaikkan harga layanan)
  void tier
  const isOffline = method === 'offline'

  if (isOffline) {
    const rawOffline = svc.priceOffline
    if (rawOffline === null || rawOffline === undefined) {
      return svc.priceOnline ?? svc.price ?? 110000
    }
    return rawOffline
  }

  return svc.priceOnline ?? svc.price ?? 110000
}

export function sanitizeServiceErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!error) return fallbackMessage
  const raw = error instanceof Error ? error.message : String(error)
  const lower = raw.toLowerCase()
  if (
    lower.includes('uuid') ||
    lower.includes('syntax') ||
    lower.includes('supabase') ||
    lower.includes('postgres') ||
    lower.includes('relation') ||
    lower.includes('column') ||
    lower.includes('violates')
  ) {
    return 'Gagal memproses data layanan pada server. Format data sedang diselaraskan secara otomatis.'
  }
  return raw.replace(/supabase/gi, 'layanan').replace(/webp/gi, 'gambar')
}

export async function resolveServiceUuid(idOrSlug?: string | null, title?: string | null): Promise<string | null> {
  if (!idOrSlug) return null
  const trimmed = idOrSlug.trim()
  if (!trimmed) return null

  // 1. Direct valid hexadecimal UUID match
  if (UUID_REGEX.test(trimmed)) {
    return trimmed
  }

  // 2. Check legacy map (e.g. s1000000-... -> canonical hex e1000000-...)
  const legacyEntry = LEGACY_SERVICE_ID_MAP[trimmed]
  if (legacyEntry && UUID_REGEX.test(legacyEntry.canonicalId)) {
    return legacyEntry.canonicalId
  }

  if (trimmed.startsWith('s') && UUID_REGEX.test('e' + trimmed.slice(1))) {
    return 'e' + trimmed.slice(1)
  }

  const targetSlug = trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-')

  // 3. Attempt DB query by slug or title
  try {
    const withTimeout = <T>(promise: Promise<T>, ms = 1500): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ])

    const res = (await withTimeout(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('Soulaide_services') as any)
        .select('id, slug, name')
        .or(`slug.eq.${targetSlug}${title ? `,name.ilike.%${title}%` : ''}`)
        .limit(1)
        .maybeSingle()
    )) as { data: { id: string; slug?: string; name?: string } | null; error: unknown }

    if (!res.error && res.data && res.data.id && UUID_REGEX.test(res.data.id)) {
      return res.data.id
    }
  } catch {
    // Graceful fallback if database lookup times out or fails
  }

  // 4. Match against current effective services list
  const currentList = getEffectiveServices()
  const fallbackMatch = currentList.find(
    (s) =>
      s.id === trimmed ||
      (title && s.title.toLowerCase() === title.toLowerCase()) ||
      s.title.toLowerCase().includes(targetSlug)
  )
  if (fallbackMatch && UUID_REGEX.test(fallbackMatch.id)) {
    return fallbackMatch.id
  }

  return null
}

export async function syncServiceToDatabase(service: {
  id?: string
  slug?: string
  name: string
  description?: string
  durationMinutes: number
  deliveryMethods: DeliveryMethod[]
  priceOnline?: number | null
  priceOffline?: number | null
  isActive?: boolean
}): Promise<string | null> {
  const categoryId = 'c1000000-0000-0000-0000-000000000001'
  const fallbackSlug = service.name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')

  // 1. Ensure category row exists
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('Soulaide_service_categories') as any).upsert(
      {
        id: categoryId,
        name: 'Soul Guidance',
        slug: 'soul-guidance',
        description: 'Layanan bimbingan dan konseling psikologis',
      },
      { onConflict: 'slug' }
    )
  } catch {
    // Ignore category sync failure if already present
  }

  // 2. Identify target row by ID or slug
  let targetId = service.id && UUID_REGEX.test(service.id) ? service.id : null
  if (service.id && !targetId) {
    targetId = await resolveServiceUuid(service.id, service.name)
  }

  // Check if existing record exists in database
  let existingRecord: { id: string; slug?: string } | null = null
  if (targetId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('Soulaide_services') as any)
      .select('id, slug')
      .eq('id', targetId)
      .maybeSingle()
    if (data?.id) {
      existingRecord = data
    }
  }

  // If not found by ID, check by slug
  if (!existingRecord) {
    const slugToSearch = service.slug || fallbackSlug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('Soulaide_services') as any)
      .select('id, slug')
      .eq('slug', slugToSearch)
      .maybeSingle()
    if (data?.id) {
      existingRecord = data
      targetId = data.id
    }
  }

  // 3. Perform direct SQL UPDATE if record exists, else INSERT
  if (existingRecord && targetId) {
    const updatePayload: Record<string, unknown> = {
      category_id: categoryId,
      name: service.name,
      description: service.description ?? '',
      duration_minutes: service.durationMinutes,
      delivery_methods: service.deliveryMethods,
      price_online: service.priceOnline ?? null,
      price_offline: service.priceOffline ?? null,
      is_active: service.isActive ?? true,
      updated_at: new Date().toISOString(),
    }
    if (service.slug) {
      updatePayload.slug = service.slug
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateErr } = await (supabase.from('Soulaide_services') as any)
      .update(updatePayload)
      .eq('id', targetId)
      .select('id')
      .maybeSingle()

    if (updateErr) {
      console.warn('Update service database error:', updateErr)
      throw updateErr
    }
    return updated?.id || targetId
  } else {
    const newId = targetId || crypto.randomUUID()
    const insertPayload: Record<string, unknown> = {
      id: newId,
      category_id: categoryId,
      name: service.name,
      slug: service.slug || fallbackSlug,
      description: service.description ?? '',
      duration_minutes: service.durationMinutes,
      delivery_methods: service.deliveryMethods,
      price_online: service.priceOnline ?? null,
      price_offline: service.priceOffline ?? null,
      is_active: service.isActive ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertErr } = await (supabase.from('Soulaide_services') as any)
      .insert(insertPayload)
      .select('id')
      .maybeSingle()

    if (insertErr) {
      console.warn('Insert service database error:', insertErr)
      throw insertErr
    }
    return inserted?.id || newId
  }
}

export function getDefaultFeaturesByTitle(title: string): string[] {
  const lower = (title || '').toLowerCase()
  if (lower.includes('bundl')) {
    return [
      'Asesmen MHCU komprehensif',
      'Sesi penyampaian hasil (30 menit)',
      'Sesi konseling individu daring (60 menit)',
    ]
  }
  if (lower.includes('mhcu')) {
    return [
      'Asesmen kondisi psikologis terstruktur',
      'Sesi pembahasan awal (30 menit)',
      'Laporan analisis klinis dalam 2 minggu',
    ]
  }
  return [
    'Sesi konseling 1-on-1 (60 menit)',
    'Daring atau tatap muka Pondok Bambu',
    'Pendamping Soul Guidance atau Soul Expert',
  ]
}

export function getServiceFeatures(svc?: { title?: string; name?: string; features?: string[] } | null): string[] {
  if (!svc) return getDefaultFeaturesByTitle('')
  if (Array.isArray(svc.features) && svc.features.length > 0) {
    const cleaned = svc.features.map((f) => f.trim()).filter(Boolean)
    if (cleaned.length > 0) return cleaned
  }
  return getDefaultFeaturesByTitle(svc.title || svc.name || '')
}

export interface UpdateServiceInput {
  id: string
  title?: string
  description?: string
  durationMinutes?: number
  priceOnline?: number | null
  priceOffline?: number | null
  deliveryMethods?: DeliveryMethod[]
  isActive?: boolean
  features?: string[]
}

export interface CreateServiceInput {
  title: string
  description: string
  durationMinutes: number
  priceOnline?: number | null
  priceOffline?: number | null
  deliveryMethods: DeliveryMethod[]
  features?: string[]
}

export function useServices() {
  const queryClient = useQueryClient()

  const query = useQuery<ServiceDetail[]>({
    queryKey: ['soulaide-services'],
    queryFn: async () => {
      try {
        let featuresMap: Record<string, string[]> = {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: settingsData } = await (supabase.from('Soulaide_site_settings') as any)
            .select('value')
            .eq('key', 'service_features_catalog')
            .maybeSingle()
          if (settingsData?.value && typeof settingsData.value === 'object') {
            featuresMap = settingsData.value as Record<string, string[]>
          }
        } catch {
          // Ignore settings fetch failure
        }

        const { data, error } = await supabase
          .from('Soulaide_services')
          .select(`
            id,
            name,
            slug,
            description,
            duration_minutes,
            delivery_methods,
            price_online,
            price_offline,
            is_active,
            category_id
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (error || !data || data.length === 0) {
          const effective = getEffectiveServices()
          return effective.map((svc) => {
            const custom = featuresMap[svc.id] || (svc.title ? featuresMap[svc.title] : undefined)
            return {
              ...svc,
              features: custom && custom.length > 0 ? custom : svc.features || getDefaultFeaturesByTitle(svc.title),
            }
          })
        }

        const mapped: ServiceDetail[] = data.map((item) => {
          const customFeatures =
            featuresMap[item.id] ||
            (item.slug ? featuresMap[item.slug] : undefined) ||
            featuresMap[item.name]

          const fallbackMatch = fallbackServices.find(
            (fb) => fb.id === item.id || (item.slug && fb.id.includes(item.slug))
          )

          const features =
            customFeatures && customFeatures.length > 0
              ? customFeatures
              : fallbackMatch?.features && fallbackMatch.features.length > 0
                ? fallbackMatch.features
                : getDefaultFeaturesByTitle(item.name)

          return {
            id: item.id,
            title: item.name,
            category: 'Soul Guidance' as const,
            duration: `${item.duration_minutes} Menit`,
            method:
              item.delivery_methods?.length === 1 && item.delivery_methods[0] === 'online'
                ? 'Daring (Online via Google Meet)'
                : item.delivery_methods?.length === 1 && item.delivery_methods[0] === 'offline'
                  ? 'Tatap Muka (Offline di Pondok Bambu)'
                  : 'Online & Tatap Muka (Offline)',
            price: item.price_online ?? item.price_offline ?? null,
            priceOnline: item.price_online,
            priceOffline: item.price_offline,
            deliveryMethods: (item.delivery_methods as DeliveryMethod[]) || ['online', 'offline'],
            description: item.description ?? '',
            isConfirmedPrice: item.price_online !== null || item.price_offline !== null,
            features,
          }
        })

        // Sync fresh remote data to local store
        saveStoredServices(mapped)
        memoryServicesStore = mapped
        return mapped
      } catch {
        return getEffectiveServices()
      }
    },
    initialData: getEffectiveServices(),
  })

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const resolvedId = (await resolveServiceUuid(id)) || (UUID_REGEX.test(id) ? id : null)

      // 1. Update in-memory & local storage immediately
      const currentList = getEffectiveServices()
      const updatedList = currentList.map((svc) => {
        if (svc.id === id || (resolvedId && svc.id === resolvedId)) {
          return {
            ...svc,
            id: resolvedId || svc.id,
            priceOnline: price,
            price: price,
            isConfirmedPrice: true,
          }
        }
        return svc
      })
      saveStoredServices(updatedList)
      memoryServicesStore = updatedList

      // 2. Sync to remote database
      const targetService = updatedList.find(
        (s) => s.id === id || (resolvedId && s.id === resolvedId)
      )
      if (targetService) {
        const durationNum = parseInt(targetService.duration.replace(/\D/g, ''), 10) || 60
        await syncServiceToDatabase({
          id: resolvedId || targetService.id,
          name: targetService.title,
          description: targetService.description,
          durationMinutes: durationNum,
          deliveryMethods: targetService.deliveryMethods || ['online', 'offline'],
          priceOnline: price,
          priceOffline: targetService.priceOffline,
          isActive: true,
        })
      }

      return { id, resolvedId, price, updatedList }
    },
    onSuccess: ({ updatedList }) => {
      queryClient.setQueryData<ServiceDetail[]>(['soulaide-services'], updatedList)
      queryClient.invalidateQueries({ queryKey: ['soulaide-services'] })
    },
    onError: (err) => {
      throw new Error(sanitizeServiceErrorMessage(err, 'Gagal memperbarui tarif layanan.'))
    },
  })

  const updateServiceMutation = useMutation({
    mutationFn: async (input: UpdateServiceInput) => {
      const resolvedId =
        (await resolveServiceUuid(input.id, input.title)) || (UUID_REGEX.test(input.id) ? input.id : null)

      const cleanFeatures = input.features
        ? input.features.map((f) => f.trim()).filter(Boolean)
        : undefined

      // 1. Update in-memory & local storage immediately
      const currentList = getEffectiveServices()
      const updatedList = currentList.map((svc) => {
        if (svc.id === input.id || (resolvedId && svc.id === resolvedId)) {
          const nextDelivery = input.deliveryMethods ?? svc.deliveryMethods
          const durationStr =
            input.durationMinutes !== undefined ? `${input.durationMinutes} Menit` : svc.duration
          return {
            ...svc,
            id: resolvedId || svc.id,
            title: input.title ?? svc.title,
            description: input.description ?? svc.description,
            duration: durationStr,
            priceOnline: input.priceOnline !== undefined ? input.priceOnline : svc.priceOnline,
            priceOffline: input.priceOffline !== undefined ? input.priceOffline : svc.priceOffline,
            price:
              (input.priceOnline !== undefined ? input.priceOnline : svc.priceOnline) ??
              (input.priceOffline !== undefined ? input.priceOffline : svc.priceOffline) ??
              null,
            deliveryMethods: nextDelivery,
            method:
              nextDelivery?.length === 1 && nextDelivery[0] === 'online'
                ? 'Daring (Online via Google Meet)'
                : nextDelivery?.length === 1 && nextDelivery[0] === 'offline'
                  ? 'Tatap Muka (Offline di Pondok Bambu)'
                  : 'Online & Tatap Muka (Offline)',
            isConfirmedPrice:
              (input.priceOnline !== undefined ? input.priceOnline : svc.priceOnline) !== null ||
              (input.priceOffline !== undefined ? input.priceOffline : svc.priceOffline) !== null,
            features: cleanFeatures !== undefined ? cleanFeatures : svc.features,
          }
        }
        return svc
      })

      saveStoredServices(updatedList)
      memoryServicesStore = updatedList

      // 2. Sync service record to remote database
      const targetService = updatedList.find(
        (s) => s.id === input.id || (resolvedId && s.id === resolvedId)
      )
      if (targetService) {
        const durationNum =
          input.durationMinutes ?? (parseInt(targetService.duration.replace(/\D/g, ''), 10) || 60)
        await syncServiceToDatabase({
          id: resolvedId || targetService.id,
          name: input.title ?? targetService.title,
          description: input.description ?? targetService.description,
          durationMinutes: durationNum,
          deliveryMethods: input.deliveryMethods ?? (targetService.deliveryMethods || ['online', 'offline']),
          priceOnline: input.priceOnline !== undefined ? input.priceOnline : targetService.priceOnline,
          priceOffline: input.priceOffline !== undefined ? input.priceOffline : targetService.priceOffline,
          isActive: input.isActive ?? true,
        })
      }

      // 3. Sync bullet points to Soulaide_site_settings (service_features_catalog)
      if (cleanFeatures !== undefined) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: curSettings } = await (supabase.from('Soulaide_site_settings') as any)
            .select('value')
            .eq('key', 'service_features_catalog')
            .maybeSingle()
          const featuresMap: Record<string, string[]> =
            curSettings?.value && typeof curSettings.value === 'object'
              ? { ...(curSettings.value as Record<string, string[]>) }
              : {}

          const keyToSave = resolvedId || input.id
          featuresMap[keyToSave] = cleanFeatures
          if (input.title) {
            featuresMap[input.title] = cleanFeatures
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('Soulaide_site_settings') as any).upsert(
            {
              key: 'service_features_catalog',
              value: featuresMap,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          )
        } catch (settingsErr) {
          console.warn('Failed to sync service features to database settings:', settingsErr)
        }
      }

      return { input, resolvedId, updatedList }
    },
    onSuccess: ({ updatedList }) => {
      queryClient.setQueryData<ServiceDetail[]>(['soulaide-services'], updatedList)
      queryClient.invalidateQueries({ queryKey: ['soulaide-services'] })
    },
    onError: (err) => {
      throw new Error(sanitizeServiceErrorMessage(err, 'Gagal memperbarui layanan.'))
    },
  })

  const createServiceMutation = useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      const generatedId = crypto.randomUUID()
      const cleanFeatures = input.features
        ? input.features.map((f) => f.trim()).filter(Boolean)
        : getDefaultFeaturesByTitle(input.title)

      const newService: ServiceDetail = {
        id: generatedId,
        title: input.title,
        category: 'Soul Guidance',
        duration: `${input.durationMinutes} Menit`,
        method:
          input.deliveryMethods?.length === 1 && input.deliveryMethods[0] === 'online'
            ? 'Daring (Online via Google Meet)'
            : input.deliveryMethods?.length === 1 && input.deliveryMethods[0] === 'offline'
              ? 'Tatap Muka (Offline di Pondok Bambu)'
              : 'Online & Tatap Muka (Offline)',
        price: input.priceOnline ?? input.priceOffline ?? null,
        priceOnline: input.priceOnline ?? null,
        priceOffline: input.priceOffline ?? null,
        deliveryMethods: input.deliveryMethods,
        description: input.description,
        isConfirmedPrice: input.priceOnline !== null || input.priceOffline !== null,
        features: cleanFeatures,
      }

      // 1. Update store
      const updatedList = [...getEffectiveServices(), newService]
      saveStoredServices(updatedList)
      memoryServicesStore = updatedList

      // 2. Sync to remote DB
      await syncServiceToDatabase({
        id: generatedId,
        name: input.title,
        description: input.description,
        durationMinutes: input.durationMinutes,
        deliveryMethods: input.deliveryMethods,
        priceOnline: input.priceOnline ?? null,
        priceOffline: input.priceOffline ?? null,
        isActive: true,
      })

      // 3. Sync bullet points to Soulaide_site_settings
      if (cleanFeatures.length > 0) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: curSettings } = await (supabase.from('Soulaide_site_settings') as any)
            .select('value')
            .eq('key', 'service_features_catalog')
            .maybeSingle()
          const featuresMap: Record<string, string[]> =
            curSettings?.value && typeof curSettings.value === 'object'
              ? { ...(curSettings.value as Record<string, string[]>) }
              : {}

          featuresMap[generatedId] = cleanFeatures
          featuresMap[input.title] = cleanFeatures

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('Soulaide_site_settings') as any).upsert(
            {
              key: 'service_features_catalog',
              value: featuresMap,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          )
        } catch (settingsErr) {
          console.warn('Failed to sync new service features to database settings:', settingsErr)
        }
      }

      return { newService, updatedList }
    },
    onSuccess: ({ updatedList }) => {
      queryClient.setQueryData<ServiceDetail[]>(['soulaide-services'], updatedList)
      queryClient.invalidateQueries({ queryKey: ['soulaide-services'] })
    },
    onError: (err) => {
      throw new Error(sanitizeServiceErrorMessage(err, 'Gagal menambahkan layanan baru.'))
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const resolvedId = (await resolveServiceUuid(id)) || (UUID_REGEX.test(id) ? id : null)

      // 1. Remove from local store
      const currentList = getEffectiveServices()
      const updatedList = currentList.filter(
        (svc) => svc.id !== id && (!resolvedId || svc.id !== resolvedId)
      )
      saveStoredServices(updatedList)
      memoryServicesStore = updatedList

      // 2. Sync to remote DB (actual delete from table)
      if (resolvedId && UUID_REGEX.test(resolvedId)) {
        try {
          // Clean up junction rows first
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('Soulaide_service_psychologists') as any)
            .delete()
            .eq('service_id', resolvedId)

          // Delete service row from Soulaide_services table
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: delErr } = await (supabase.from('Soulaide_services') as any)
            .delete()
            .eq('id', resolvedId)

          if (delErr) {
            console.warn('Delete service remote note (fallback to soft-delete if past booking exists):', delErr.message)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('Soulaide_services') as any)
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', resolvedId)
          }
        } catch (err) {
          console.warn('Delete service network note:', err)
        }
      }

      return { id, resolvedId, updatedList }
    },
    onSuccess: ({ updatedList }) => {
      queryClient.setQueryData<ServiceDetail[]>(['soulaide-services'], updatedList)
      queryClient.invalidateQueries({ queryKey: ['soulaide-services'] })
    },
    onError: (err) => {
      throw new Error(sanitizeServiceErrorMessage(err, 'Gagal menonaktifkan layanan.'))
    },
  })

  return {
    ...query,
    updatePrice: updatePriceMutation.mutateAsync,
    isUpdatingPrice: updatePriceMutation.isPending,
    updateService: updateServiceMutation.mutateAsync,
    isUpdatingService: updateServiceMutation.isPending,
    createService: createServiceMutation.mutateAsync,
    isCreatingService: createServiceMutation.isPending,
    deleteService: deleteServiceMutation.mutateAsync,
    isDeletingService: deleteServiceMutation.isPending,
  }
}
