import React, { useState } from 'react'
import { Card } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { useServices, sanitizeServiceErrorMessage, getServiceFeatures, type UpdateServiceInput } from '@/features/services/useServices.ts'
import { formatIDR } from '@/lib/utils.ts'
import { Check, Edit2, Plus, Trash2, X, AlertCircle } from 'lucide-react'
import type { DeliveryMethod } from '@/types/index.ts'

export const AdminCmsServices: React.FC = () => {
  const {
    data: services,
    updateService,
    isUpdatingService,
    createService,
    isCreatingService,
    deleteService,
    isDeletingService,
  } = useServices()

  // Full Edit Modal State
  const [editingService, setEditingService] = useState<UpdateServiceInput | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // New Service Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDuration, setNewDuration] = useState(60)
  const [newPriceOnline, setNewPriceOnline] = useState<number>(110000)
  const [newPriceOffline, setNewPriceOffline] = useState<number>(350000)
  const [newDeliveryMethods, setNewDeliveryMethods] = useState<DeliveryMethod[]>(['online', 'offline'])
  const [newFeatures, setNewFeatures] = useState<string[]>([
    'Sesi konseling 1-on-1 (60 menit)',
    'Daring atau tatap muka Pondok Bambu',
    'Pendamping Soul Guidance atau Soul Expert',
  ])

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4000)
  }

  const handleStartFullEdit = (svc: typeof services[0]) => {
    // Parse duration integer from string (e.g. "60 Menit" -> 60)
    const durationNum = parseInt(svc.duration.replace(/\D/g, ''), 10) || 60
    const currentFeatures = getServiceFeatures(svc)

    setEditingService({
      id: svc.id,
      title: svc.title,
      description: svc.description,
      durationMinutes: durationNum,
      priceOnline: svc.priceOnline ?? null,
      priceOffline: svc.priceOffline ?? null,
      deliveryMethods: svc.deliveryMethods || ['online', 'offline'],
      features: [...currentFeatures],
    })
  }

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    const hasOnline = editingService.deliveryMethods?.includes('online')
    const hasOffline = editingService.deliveryMethods?.includes('offline')

    const cleanFeatures = (editingService.features || []).map((f) => f.trim()).filter(Boolean)

    const payload: UpdateServiceInput = {
      ...editingService,
      title: editingService.title?.trim(),
      description: editingService.description?.trim(),
      priceOnline: hasOnline ? (editingService.priceOnline ?? 0) : null,
      priceOffline: hasOffline ? (editingService.priceOffline ?? 0) : null,
      features: cleanFeatures,
    }

    try {
      await updateService(payload)
      const updatedTitle = payload.title || editingService.title
      setEditingService(null)
      showNotification('success', `Layanan "${updatedTitle}" berhasil diperbarui sepenuhnya.`)
    } catch (err) {
      showNotification('error', sanitizeServiceErrorMessage(err, 'Gagal memperbarui layanan.'))
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return

    const cleanFeatures = newFeatures.map((f) => f.trim()).filter(Boolean)

    try {
      await createService({
        title: newTitle,
        description: newDescription,
        durationMinutes: newDuration,
        priceOnline: newPriceOnline > 0 ? newPriceOnline : null,
        priceOffline: newPriceOffline > 0 ? newPriceOffline : null,
        deliveryMethods: newDeliveryMethods,
        features: cleanFeatures,
      })

      setShowAddModal(false)
      setNewTitle('')
      setNewDescription('')
      setNewDuration(60)
      setNewPriceOnline(110000)
      setNewPriceOffline(350000)
      setNewDeliveryMethods(['online', 'offline'])
      setNewFeatures([
        'Sesi konseling 1-on-1 (60 menit)',
        'Daring atau tatap muka Pondok Bambu',
        'Pendamping Soul Guidance atau Soul Expert',
      ])
      showNotification('success', `Layanan baru "${newTitle}" berhasil ditambahkan ke katalog.`)
    } catch (err) {
      showNotification('error', sanitizeServiceErrorMessage(err, 'Gagal menambahkan layanan.'))
    }
  }

  const handleDeleteService = async (id: string, title: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus layanan "${title}" dari sistem dan basis data?`)) return
    try {
      await deleteService(id)
      showNotification('success', `Layanan "${title}" berhasil dihapus dari sistem.`)
    } catch (err) {
      showNotification('error', sanitizeServiceErrorMessage(err, 'Gagal menghapus layanan.'))
    }
  }

  const toggleMethod = (
    currentList: DeliveryMethod[],
    method: DeliveryMethod,
    setList: (m: DeliveryMethod[]) => void
  ) => {
    if (currentList.includes(method)) {
      if (currentList.length === 1) return // Min 1 method required
      setList(currentList.filter((m) => m !== method))
    } else {
      setList([...currentList, method])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Layanan Konseling (Full Edit)</h2>
          <p className="text-xs text-slate-500">
            Kelola judul layanan, deskripsi lengkap, durasi sesi, metode (Online/Offline), dan tarif biaya.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </Button>
      </div>

      {notice && (
        <div
          className={`p-3 text-xs font-medium rounded-lg flex items-center gap-2 border ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
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

      {/* Services List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {services.map((svc) => (
          <Card key={svc.id}>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{svc.category}</Badge>
                  <span className="text-xs text-slate-400 font-medium">{svc.duration}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {svc.method}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">{svc.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{svc.description}</p>
                <div className="pt-1.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Poin Fitur Layanan:</span>
                  <ul className="space-y-1">
                    {getServiceFeatures(svc).map((point, pIdx) => (
                      <li key={pIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-700">
                  {svc.priceOnline !== null && svc.priceOnline !== undefined && (
                    <span>Online: <span className="text-emerald-700">{formatIDR(svc.priceOnline)}</span></span>
                  )}
                  {svc.priceOffline !== null && svc.priceOffline !== undefined && (
                    <span>Offline: <span className="text-emerald-700">{formatIDR(svc.priceOffline)}</span></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartFullEdit(svc)}
                  className="gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Lengkap</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteService(svc.id, svc.title)}
                  disabled={isDeletingService}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  title="Nonaktifkan Layanan"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: Full Edit Service */}
      {editingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setEditingService(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSaveFullEdit}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Edit Layanan Konseling</h3>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama / Judul Layanan</label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ''}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Deskripsi Lengkap</label>
                  <textarea
                    rows={3}
                    required
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Durasi Sesi (Menit)</label>
                    <input
                      type="number"
                      min={15}
                      step={5}
                      required
                      value={editingService.durationMinutes ?? 60}
                      onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Metode Tersedia</label>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          toggleMethod(
                            editingService.deliveryMethods || ['online'],
                            'online',
                            (m) => setEditingService({ ...editingService, deliveryMethods: m })
                          )
                        }
                        className={`px-3 py-1.5 rounded text-xs font-semibold border cursor-pointer ${
                          editingService.deliveryMethods?.includes('online')
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Online
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleMethod(
                            editingService.deliveryMethods || ['offline'],
                            'offline',
                            (m) => setEditingService({ ...editingService, deliveryMethods: m })
                          )
                        }
                        className={`px-3 py-1.5 rounded text-xs font-semibold border cursor-pointer ${
                          editingService.deliveryMethods?.includes('offline')
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Offline
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tarif Online (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editingService.priceOnline ?? 0}
                      onChange={(e) => setEditingService({ ...editingService, priceOnline: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tarif Offline (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editingService.priceOffline ?? 0}
                      onChange={(e) => setEditingService({ ...editingService, priceOffline: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Poin-Poin Fitur Layanan */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Poin-Poin Fitur Layanan (Bullet Points)</label>
                      <p className="text-[11px] text-slate-500">
                        Poin fitur ini tampil di kartu layanan landing page, halaman booking, dan seluruh dashboard.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const cur = editingService.features || []
                        setEditingService({ ...editingService, features: [...cur, ''] })
                      }}
                      className="text-xs h-7 gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Poin</span>
                    </Button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {(editingService.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 w-4 shrink-0">{fIdx + 1}.</span>
                        <input
                          type="text"
                          required
                          value={feat}
                          onChange={(e) => {
                            const next = [...(editingService.features || [])]
                            next[fIdx] = e.target.value
                            setEditingService({ ...editingService, features: next })
                          }}
                          placeholder="Contoh: Sesi konseling 1-on-1 (60 menit)"
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (editingService.features || []).filter((_, i) => i !== fIdx)
                            setEditingService({ ...editingService, features: next })
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                          title="Hapus Poin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {(!editingService.features || editingService.features.length === 0) && (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        Belum ada poin fitur. Klik <strong>"+ Tambah Poin"</strong> untuk menambahkan.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingService(null)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isUpdatingService}>
                  {isUpdatingService ? 'Menyimpan...' : 'Simpan Perubahan Layanan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Service */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCreateService}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Tambah Layanan Konseling Baru</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama / Judul Layanan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Konseling Pasangan & Pernikahan"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Deskripsi Lengkap</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Penjelasan tujuan sesi, manfaat, dan format..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Durasi Sesi (Menit)</label>
                    <input
                      type="number"
                      min={15}
                      step={5}
                      required
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Metode Tersedia</label>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => toggleMethod(newDeliveryMethods, 'online', setNewDeliveryMethods)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border cursor-pointer ${
                          newDeliveryMethods.includes('online')
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Online
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMethod(newDeliveryMethods, 'offline', setNewDeliveryMethods)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border cursor-pointer ${
                          newDeliveryMethods.includes('offline')
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Offline
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tarif Online (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={newPriceOnline}
                      onChange={(e) => setNewPriceOnline(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tarif Offline (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={newPriceOffline}
                      onChange={(e) => setNewPriceOffline(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Poin-Poin Fitur Layanan */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Poin-Poin Fitur Layanan (Bullet Points)</label>
                      <p className="text-[11px] text-slate-500">
                        Poin fitur ini tampil di kartu layanan landing page, halaman booking, dan seluruh dashboard.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setNewFeatures([...newFeatures, ''])}
                      className="text-xs h-7 gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Poin</span>
                    </Button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {newFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 w-4 shrink-0">{fIdx + 1}.</span>
                        <input
                          type="text"
                          required
                          value={feat}
                          onChange={(e) => {
                            const next = [...newFeatures]
                            next[fIdx] = e.target.value
                            setNewFeatures(next)
                          }}
                          placeholder="Contoh: Sesi konseling 1-on-1 (60 menit)"
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setNewFeatures(newFeatures.filter((_, i) => i !== fIdx))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                          title="Hapus Poin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {newFeatures.length === 0 && (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        Belum ada poin fitur. Klik <strong>"+ Tambah Poin"</strong> untuk menambahkan.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isCreatingService}>
                  {isCreatingService ? 'Menambahkan...' : 'Tambah Layanan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
