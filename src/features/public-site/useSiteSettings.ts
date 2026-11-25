import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client.ts'

export interface SiteSettings {
  whatsappNumber: string
  defaultMessage: string
  minimumLeadTimeHours: number
  offlineAddress: string
}

export const fallbackSettings: SiteSettings = {
  whatsappNumber: '+62 896-3086-9804',
  defaultMessage: 'Halo Soulaide, saya ingin bertanya mengenai layanan dan proses booking konseling.',
  minimumLeadTimeHours: 24,
  offlineAddress: 'Pondok Bambu, Duren Sawit, Jakarta Timur, DKI Jakarta, Indonesia',
}

export function useSiteSettings() {
  const queryClient = useQueryClient()

  const query = useQuery<SiteSettings>({
    queryKey: ['soulaide-site-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('Soulaide_site_settings')
          .select('*')

        if (error || !data || data.length === 0) {
          return fallbackSettings
        }

        const settings = { ...fallbackSettings }
        for (const row of data) {
          if (row.key === 'whatsapp' && typeof row.value === 'object' && row.value !== null) {
            const val = row.value as Record<string, unknown>
            if (typeof val.phone_number === 'string') settings.whatsappNumber = val.phone_number
            if (typeof val.default_message === 'string') settings.defaultMessage = val.default_message
          }
          if (row.key === 'booking_policy' && typeof row.value === 'object' && row.value !== null) {
            const val = row.value as Record<string, unknown>
            if (typeof val.minimum_lead_time_hours === 'number') {
              settings.minimumLeadTimeHours = val.minimum_lead_time_hours
            }
          }
          if (row.key === 'offline_location' && typeof row.value === 'object' && row.value !== null) {
            const val = row.value as Record<string, unknown>
            if (typeof val.subdistrict === 'string' && typeof val.city === 'string') {
              settings.offlineAddress = `${val.subdistrict}, ${val.city}, DKI Jakarta, Indonesia`
            }
          }
        }

        return settings
      } catch {
        return fallbackSettings
      }
    },
    initialData: fallbackSettings,
  })

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettings>) => {
      // Update whatsapp
      if (newSettings.whatsappNumber || newSettings.defaultMessage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('Soulaide_site_settings') as any).upsert({
          key: 'whatsapp',
          value: {
            phone_number: newSettings.whatsappNumber || query.data.whatsappNumber,
            default_message: newSettings.defaultMessage || query.data.defaultMessage,
          },
          updated_at: new Date().toISOString(),
        })
      }

      // Update booking policy
      if (newSettings.minimumLeadTimeHours !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('Soulaide_site_settings') as any).upsert({
          key: 'booking_policy',
          value: {
            minimum_lead_time_hours: newSettings.minimumLeadTimeHours,
          },
          updated_at: new Date().toISOString(),
        })
      }

      // Update offline location
      if (newSettings.offlineAddress) {
        const parts = newSettings.offlineAddress.split(',').map((s) => s.trim())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('Soulaide_site_settings') as any).upsert({
          key: 'offline_location',
          value: {
            subdistrict: parts[0] || 'Pondok Bambu',
            city: parts[1] || 'Jakarta Timur',
            province: 'DKI Jakarta',
            country: 'Indonesia',
          },
          updated_at: new Date().toISOString(),
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-site-settings'] })
    },
  })

  return {
    ...query,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
