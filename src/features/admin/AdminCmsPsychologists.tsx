import React, { useState } from 'react'
import { Card } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  usePsychologists,
  type UpdatePsychologistInput,
} from '@/features/psychologists/usePsychologists.ts'
import { uploadManagedAsset } from '@/lib/storageManager.ts'
import { PsychologistPresenceControl } from '@/features/psychologist/PsychologistPresenceControl.tsx'
import type { PresenceStatus } from '@/features/psychologist/types.ts'
import {
  Check,
  Edit2,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Upload,
} from 'lucide-react'

export const AdminCmsPsychologists: React.FC = () => {
  const {
    data: psychologists,
    updatePresence,
    isUpdatingPresence,
    updatePsychologist,
    isUpdatingPsychologist,
    createPsychologist,
    isCreatingPsychologist,
    deletePsychologist,
    isDeletingPsychologist,
  } = usePsychologists()

  // Full Edit Modal State
  const [editingPsych, setEditingPsych] = useState<UpdatePsychologistInput | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // New Psychologist Form State
  const [newName, setNewName] = useState('')
  const [newCredentials, setNewCredentials] = useState('S.Psi., Psikolog.')
  const [newExperience, setNewExperience] = useState('2-5 tahun')
  const [newSchedule, setNewSchedule] = useState('Senin – Jumat, by appointment')
  const [newPracticeAreas, setNewPracticeAreas] = useState('Stres, Kecemasan, Relasi, Pengembangan Diri')
  const [newApproaches, setNewApproaches] = useState('CBT, Humanistic, SFBT')
  const [newCardImg, setNewCardImg] = useState('')
  const [newProfileImg, setNewProfileImg] = useState('')
  const [newBio, setNewBio] = useState('')

  const [uploadingImg, setUploadingImg] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4000)
  }

  const handlePresenceChange = async (psychId: string, name: string, nextStatus: PresenceStatus) => {
    try {
      await updatePresence({ psychologistId: psychId, status: nextStatus })
      const statusLabels: Record<PresenceStatus, string> = {
        available: 'Tersedia (Siap Melayani)',
        busy: 'Sedang Sesi (Busy)',
        away: 'Istirahat (Away)',
        online: 'Aktif (Online)',
        offline: 'Tidak Aktif (Offline)',
      }
      const label = statusLabels[nextStatus] || nextStatus
      showNotification(
        'success',
        `Status kehadiran "${name}" berhasil diubah menjadi ${label}.`
      )
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal memperbarui status ketersediaan.')
    }
  }

  const handleStartEdit = (psych: typeof psychologists[0]) => {
    setEditingPsych({
      id: psych.id,
      fullName: psych.fullName,
      credentials: psych.credentials,
      experienceYears: psych.experienceYears,
      initialSchedule: psych.initialSchedule,
      practiceAreas: psych.practiceAreas,
      approaches: psych.approaches,
      cardImageUrl: psych.cardImage,
      profileImageUrl: psych.profileImage,
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPsych) return

    try {
      await updatePsychologist(editingPsych)
      setEditingPsych(null)
      showNotification('success', `Profil "${editingPsych.fullName}" berhasil diperbarui.`)
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal memperbarui profil.')
    }
  }

  const handleCreatePsych = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return

    try {
      await createPsychologist({
        fullName: newName,
        credentials: newCredentials,
        experienceYears: newExperience,
        initialSchedule: newSchedule,
        practiceAreas: newPracticeAreas.split(',').map((s) => s.trim()).filter(Boolean),
        approaches: newApproaches.split(',').map((s) => s.trim()).filter(Boolean),
        cardImageUrl: newCardImg || undefined,
        profileImageUrl: newProfileImg || undefined,
        bio: newBio || undefined,
      })

      setShowAddModal(false)
      setNewName('')
      setNewCardImg('')
      setNewProfileImg('')
      setNewBio('')
      showNotification('success', `Psikolog baru "${newName}" berhasil ditambahkan ke direktori.`)
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menambahkan psikolog.')
    }
  }

  const handleDeletePsych = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus psikolog "${name}" dari sistem dan basis data?`)) return
    try {
      await deletePsychologist(id)
      showNotification('success', `Psikolog "${name}" berhasil dihapus dari sistem.`)
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal menghapus psikolog.')
    }
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetType: 'card' | 'profile',
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImg(true)
    try {
      const prevUrl = isEdit && editingPsych
        ? (targetType === 'card' ? editingPsych.cardImageUrl : editingPsych.profileImageUrl)
        : undefined

      const res = await uploadManagedAsset({
        file,
        folder: 'psychologists',
        customName: `psikolog-${targetType}`,
        previousUrl: prevUrl || null,
      })

      if (isEdit && editingPsych) {
        if (targetType === 'card') {
          setEditingPsych({ ...editingPsych, cardImageUrl: res.url })
        } else {
          setEditingPsych({ ...editingPsych, profileImageUrl: res.url })
        }
      } else {
        if (targetType === 'card') {
          setNewCardImg(res.url)
        } else {
          setNewProfileImg(res.url)
        }
      }
      showNotification('success', `Foto ${targetType} berhasil dioptimasi & diunggah.`)
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Gagal mengunggah foto.')
    } finally {
      setUploadingImg(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Profil Psikolog (Full Edit)</h2>
          <p className="text-xs text-slate-500">
            Kelola data profil lengkap psikolog, foto resmi teroptimasi, kredensial, keahlian, dan ketersediaan.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Psikolog Baru</span>
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

      {/* Psychologists List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {psychologists.map((psych) => (
          <Card key={psych.id} className="relative flex flex-col justify-between overflow-visible">
            <div className="p-4 sm:p-5 flex gap-4">
              <div className="w-20 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={psych.cardImage}
                  alt={psych.fullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Soulaide Psi Arc Logo.webp'
                  }}
                />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate">{psych.fullName}</h3>
                  <Badge variant="success" className="text-[10px]">Aktif</Badge>
                  {psych.tier && (
                    <Badge variant="outline" className="text-[10px]">{psych.tier}</Badge>
                  )}
                </div>
                <p className="text-xs text-emerald-700 font-medium truncate">{psych.credentials}</p>
                <p className="text-xs text-slate-500">Pengalaman: {psych.experienceYears}</p>
                <p className="text-xs text-slate-400 truncate">Jadwal: {psych.initialSchedule}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {psych.practiceAreas.slice(0, 3).map((a, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{a}</Badge>
                  ))}
                  {psych.practiceAreas.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{psych.practiceAreas.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3 relative z-30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <PsychologistPresenceControl
                  currentStatus={psych.presence as PresenceStatus}
                  onStatusChange={(status) => handlePresenceChange(psych.id, psych.fullName, status)}
                  disabled={isUpdatingPresence}
                  align="left"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartEdit(psych)}
                  className="gap-1 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeletePsych(psych.id, psych.fullName)}
                  disabled={isDeletingPsychologist}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2"
                  title="Nonaktifkan Psikolog"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: Full Edit Psychologist */}
      {editingPsych && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setEditingPsych(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSaveEdit}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Edit Profil Psikolog</h3>
                <button
                  type="button"
                  onClick={() => setEditingPsych(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={editingPsych.fullName || ''}
                      onChange={(e) => setEditingPsych({ ...editingPsych, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Gelar / Kredensial</label>
                    <input
                      type="text"
                      required
                      value={editingPsych.credentials || ''}
                      onChange={(e) => setEditingPsych({ ...editingPsych, credentials: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Pengalaman Klinis</label>
                    <input
                      type="text"
                      required
                      value={editingPsych.experienceYears || ''}
                      onChange={(e) => setEditingPsych({ ...editingPsych, experienceYears: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Jadwal Sesi</label>
                    <input
                      type="text"
                      value={editingPsych.initialSchedule || ''}
                      onChange={(e) => setEditingPsych({ ...editingPsych, initialSchedule: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Bidang Praktik (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={editingPsych.practiceAreas?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingPsych({
                        ...editingPsych,
                        practiceAreas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pendekatan Terapi (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={editingPsych.approaches?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingPsych({
                        ...editingPsych,
                        approaches: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Foto Kartu Pratinjau</label>
                    <div className="w-16 h-20 bg-slate-100 rounded overflow-hidden border">
                      <img src={editingPsych.cardImageUrl || ''} alt="Card Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 cursor-pointer border">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImg ? 'Upload...' : 'Ganti Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImg}
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'card', true)}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Foto Profil Detail</label>
                    <div className="w-16 h-20 bg-slate-100 rounded overflow-hidden border">
                      <img src={editingPsych.profileImageUrl || ''} alt="Profile Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 cursor-pointer border">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImg ? 'Upload...' : 'Ganti Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImg}
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'profile', true)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPsych(null)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isUpdatingPsychologist}>
                  {isUpdatingPsychologist ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Psychologist */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCreatePsych}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Tambah Psikolog Klinis Baru</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rina Marlina"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Gelar / Kredensial</label>
                    <input
                      type="text"
                      required
                      placeholder="M.Psi., Psikolog."
                      value={newCredentials}
                      onChange={(e) => setNewCredentials(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Pengalaman Klinis</label>
                    <input
                      type="text"
                      required
                      placeholder="> 5 tahun"
                      value={newExperience}
                      onChange={(e) => setNewExperience(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Jadwal Sesi</label>
                    <input
                      type="text"
                      placeholder="Senin – Sabtu, by appointment"
                      value={newSchedule}
                      onChange={(e) => setNewSchedule(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Bidang Praktik</label>
                  <input
                    type="text"
                    value={newPracticeAreas}
                    onChange={(e) => setNewPracticeAreas(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pendekatan Terapi</label>
                  <input
                    type="text"
                    value={newApproaches}
                    onChange={(e) => setNewApproaches(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Upload Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-700 block">Upload Foto Psikolog (Auto-Optimasi)</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImg ? 'Mengunggah & Mengonversi...' : 'Pilih Foto & Optimasi'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImg}
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'card', false)}
                    />
                  </label>
                  {newCardImg && (
                    <p className="text-xs text-emerald-700 font-medium">Foto berhasil diunggah!</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isCreatingPsychologist}>
                  {isCreatingPsychologist ? 'Menambahkan...' : 'Tambah Psikolog'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
