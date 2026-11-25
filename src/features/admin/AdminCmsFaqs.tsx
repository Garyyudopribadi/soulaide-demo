import React, { useState } from 'react'
import { Card } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { useFaqs } from '@/features/public-site/useFaqs.ts'
import { Plus, Trash2, Check } from 'lucide-react'

export const AdminCmsFaqs: React.FC = () => {
  const { data: faqs, addFaq, deleteFaq } = useFaqs()
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [newCategory, setNewCategory] = useState('booking')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion || !newAnswer) return

    setIsSubmitting(true)
    try {
      await addFaq({
        question: newQuestion,
        answer: newAnswer,
        category: newCategory,
        display_order: faqs.length + 1,
      })
      setNewQuestion('')
      setNewAnswer('')
      setShowAddForm(false)
      setNotice('FAQ baru berhasil disimpan ke database!')
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menambahkan FAQ.')
      setTimeout(() => setNotice(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFaq = async (id: string) => {
    try {
      await deleteFaq(id)
      setNotice('FAQ berhasil dinonaktifkan/dihapus dari database.')
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menghapus FAQ.')
      setTimeout(() => setNotice(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Pertanyaan Umum (FAQ)</h2>
          <p className="text-xs text-slate-500">Perbarui pertanyaan yang tampil pada pusat bantuan publik.</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Tambah FAQ
        </Button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {showAddForm && (
        <Card className="p-5 border-emerald-200 bg-emerald-50/30">
          <form onSubmit={handleAddFaq} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Tambah Pertanyaan Baru</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pertanyaan</label>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Misal: Apakah konseling ini rahasia?"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kategori</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="booking">Booking</option>
                <option value="privasi">Privasi</option>
                <option value="reschedule">Reschedule</option>
                <option value="layanan">Layanan</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Jawaban</label>
              <textarea
                required
                rows={3}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Penjelasan jawaban..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan FAQ'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Batal</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{faq.category}</Badge>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{faq.question}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteFaq(faq.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
