import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client.ts'

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
}

export const fallbackFaqs: FaqItem[] = [
  {
    id: 'f1',
    question: 'Bagaimana cara melakukan booking konseling?',
    answer: 'Pilih layanan yang diinginkan, tentukan psikolog dan tanggal/jam yang sesuai, lalu lakukan konfirmasi dan pembayaran online melalui sistem kami.',
    category: 'booking',
    display_order: 1,
  },
  {
    id: 'f2',
    question: 'Berapa lama batas waktu reservasi sebelum sesi (lead time)?',
    answer: 'Pemesanan sesi membutuhkan lead time minimal 24 jam sebelum sesi berlangsung untuk memastikan psikolog telah mempersiapkan sesi dengan baik.',
    category: 'booking',
    display_order: 2,
  },
  {
    id: 'f3',
    question: 'Apakah data konseling saya dijamin aman dan rahasia?',
    answer: 'Ya. Seluruh data asesmen dan informasi konseling dilindungi dengan standar kerahasiaan medis psikologis dan kontrol otorisasi ketat.',
    category: 'privasi',
    display_order: 3,
  },
  {
    id: 'f4',
    question: 'Bagaimana jika saya perlu mereschedule sesi?',
    answer: 'Permintaan perubahan jadwal (reschedule) dapat diajukan minimal 8 jam sebelum sesi berlangsung melalui dashboard klien, dengan batas maksimal 1 kali reschedule.',
    category: 'reschedule',
    display_order: 4,
  },
  {
    id: 'f5',
    question: 'Berapa lama laporan asesmen MHCU selesai?',
    answer: 'Laporan hasil asesmen MHCU memerlukan waktu pengerjaan dan analisis klinis mendalam hingga 2 minggu kalender setelah seluruh rangkaian sesi selesai.',
    category: 'layanan',
    display_order: 5,
  },
]

export function useFaqs() {
  const queryClient = useQueryClient()

  const query = useQuery<FaqItem[]>({
    queryKey: ['soulaide-faqs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('Soulaide_faqs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (error || !data || data.length === 0) {
          return fallbackFaqs
        }

        return data.map((d) => ({
          id: d.id,
          question: d.question,
          answer: d.answer,
          category: d.category,
          display_order: d.display_order,
        }))
      } catch {
        return fallbackFaqs
      }
    },
    initialData: fallbackFaqs,
  })

  const addFaqMutation = useMutation({
    mutationFn: async (newFaq: Omit<FaqItem, 'id'>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('Soulaide_faqs') as any).insert({
        question: newFaq.question,
        answer: newFaq.answer,
        category: newFaq.category,
        display_order: newFaq.display_order,
        is_active: true,
      })

      if (error) {
        throw new Error(`Gagal menambahkan FAQ: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-faqs'] })
    },
  })

  const deleteFaqMutation = useMutation({
    mutationFn: async (faqId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('Soulaide_faqs') as any)
        .delete()
        .eq('id', faqId)

      if (error) {
        throw new Error(`Gagal menghapus FAQ: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-faqs'] })
    },
  })

  return {
    ...query,
    addFaq: addFaqMutation.mutateAsync,
    deleteFaq: deleteFaqMutation.mutateAsync,
  }
}
