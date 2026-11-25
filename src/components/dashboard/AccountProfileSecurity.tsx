import React, { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Phone,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Upload,
  Loader2,
  Trash2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { customerService } from '@/features/customer/customerService'
import { uploadManagedAsset, deleteManagedAsset } from '@/lib/storageManager'
import { getInitials } from '@/lib/dashboard'

interface AccountProfileSecurityProps {
  userId: string
  initialFullName: string
  initialPhone: string
  userEmail: string
  roleLabel: string
  avatarUrl?: string | null
  onProfileUpdated?: () => void
  extraProfileSection?: React.ReactNode
}

export const AccountProfileSecurity: React.FC<AccountProfileSecurityProps> = ({
  userId,
  initialFullName,
  initialPhone,
  userEmail,
  roleLabel,
  avatarUrl,
  onProfileUpdated,
  extraProfileSection,
}) => {
  // Profile state
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [avatar, setAvatar] = useState(avatarUrl || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUploadNotice, setAvatarUploadNotice] = useState<string | null>(null)
  const [profileSuccessNotice, setProfileSuccessNotice] = useState<string | null>(null)
  const [profileErrorNotice, setProfileErrorNotice] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Security state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccessNotice, setPasswordSuccessNotice] = useState<string | null>(null)
  const [passwordErrorNotice, setPasswordErrorNotice] = useState<string | null>(null)

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setAvatarUploadNotice(null)
    setProfileErrorNotice(null)

    try {
      // Upload with client-side WebP conversion & auto-optimization
      const res = await uploadManagedAsset({
        file,
        folder: 'avatars',
        customName: `avatar-${userId}`,
        previousUrl: avatar || null,
      })

      setAvatar(res.url)
      setAvatarUploadNotice(`Foto berhasil dioptimasi (hemat ~${res.sizeSavedKb} KB). Klik "Simpan Profil Akun" untuk menerapkan.`)
    } catch (err: unknown) {
      setProfileErrorNotice(err instanceof Error ? err.message : 'Gagal mengunggah foto profil.')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (avatar) {
      try {
        await deleteManagedAsset(avatar)
      } catch (err) {
        console.warn('Gagal menghapus file avatar di storage:', err)
      }
    }
    setAvatar('')
    try {
      await customerService.updateUserProfile(userId, {
        avatar_url: null,
      })
      onProfileUpdated?.()
      setAvatarUploadNotice('Foto profil berhasil dihapus dari sistem dan penyimpanan.')
    } catch {
      setAvatarUploadNotice('Foto profil dihapus. Klik "Simpan Profil Akun" untuk menerapkan perubahan.')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccessNotice(null)
    setProfileErrorNotice(null)

    try {
      await customerService.updateUserProfile(userId, {
        full_name: fullName.trim(),
        phone_number: phone.trim() || null,
        avatar_url: avatar.trim() || null,
      })

      setProfileSuccessNotice('Data profil akun berhasil diperbarui.')
      if (onProfileUpdated) {
        onProfileUpdated()
      }
    } catch (err: unknown) {
      setProfileErrorNotice(err instanceof Error ? err.message : 'Gagal memperbarui profil akun.')
    } finally {
      setSavingProfile(false)
      setTimeout(() => setProfileSuccessNotice(null), 4000)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccessNotice(null)
    setPasswordErrorNotice(null)

    if (newPassword.length < 6) {
      setPasswordErrorNotice('Kata sandi baru minimal 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorNotice('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.')
      return
    }

    setSavingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        throw error
      }

      setPasswordSuccessNotice('Kata sandi berhasil diperbarui. Gunakan kata sandi baru ini pada login berikutnya.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setPasswordErrorNotice(err instanceof Error ? err.message : 'Gagal memperbarui kata sandi akun.')
    } finally {
      setSavingPassword(false)
      setTimeout(() => setPasswordSuccessNotice(null), 5000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profil Akun Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <Card className="border-[#E4DCD3] shadow-sm">
          <CardHeader className="border-b border-[#EFE9E2] bg-[#FAF8F5]/60 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base font-bold text-plum-950 flex items-center gap-2">
                <User className="w-4 h-4 text-plum-600" />
                <span>Informasi Profil Akun</span>
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-bold text-plum-700 bg-plum-50 border-plum-200">
                Peran: {roleLabel}
              </Badge>
            </div>
            <p className="text-xs text-[#72677E] mt-1">
              Data identitas Anda digunakan untuk komunikasi resmi, kwitansi, dan penanda sesi konseling.
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-6 text-xs">
            {profileSuccessNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessNotice}</span>
              </div>
            )}

            {avatarUploadNotice && (
              <div className="p-3.5 bg-plum-50 text-plum-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-plum-200">
                <Sparkles className="w-4 h-4 text-plum-600 shrink-0" />
                <span>{avatarUploadNotice}</span>
              </div>
            )}

            {profileErrorNotice && (
              <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileErrorNotice}</span>
              </div>
            )}

            {/* Bagian Upload Foto Profil Terintegrasi Storage & Optimisasi WebP */}
            <div className="p-4 rounded-2xl border border-[#E9E1D8] bg-[#FDFCFB] flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName || 'Foto Profil'}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-plum-200 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-plum-100 border-2 border-plum-200 flex items-center justify-center text-plum-800 font-extrabold text-xl shadow-sm">
                    {getInitials(fullName || 'User')}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-plum-950/60 rounded-2xl flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[9px] font-bold mt-1">Mengunggah...</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-bold text-plum-950 text-xs sm:text-sm">Foto Profil Akun</h4>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                    Penyimpanan Aman Terenkripsi
                  </Badge>
                </div>
                <p className="text-[11px] text-[#72677E] leading-relaxed max-w-xl">
                  Pilih foto dari perangkat Anda. Gambar akan otomatis dioptimalkan dan dikompresi sebelum disimpan demi performa tampilan yang cepat dan tajam.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarFileSelected}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-file-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-plum-900 hover:bg-plum-950 text-[#FAF7F2] text-xs font-medium cursor-pointer transition-colors border border-plum-950/20 shadow-2xs"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengompresi & Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{avatar ? 'Ganti Foto Profil' : 'Upload Foto Profil'}</span>
                      </>
                    )}
                  </label>

                  {avatar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-8 rounded-xl gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="account-full-name" className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  id="account-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nama lengkap Anda"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label htmlFor="account-email" className="font-semibold text-slate-700 block mb-1">
                  Email Akun
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Email akun merupakan kredensial login utama dan dikunci oleh sistem autentikasi.
                </span>
              </div>

              <div>
                <label htmlFor="account-phone" className="font-semibold text-slate-700 block mb-1">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="account-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-[#FAF8F5]/60 border-t border-[#EFE9E2] p-4 flex justify-end">
            <Button
              type="submit"
              disabled={savingProfile || uploadingAvatar}
              className="px-5 text-xs font-semibold"
            >
              {savingProfile ? 'Menyimpan...' : 'Simpan Profil Akun'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Extra role-specific section (e.g. emergency contact for customer, bio for psych) */}
      {extraProfileSection}

      {/* Keamanan & Pembaruan Kata Sandi */}
      <form onSubmit={handleUpdatePassword} className="space-y-6">
        <Card className="border-[#E4DCD3] shadow-sm">
          <CardHeader className="border-b border-[#EFE9E2] bg-[#FAF8F5]/60 pb-4">
            <CardTitle className="text-base font-bold text-plum-950 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Keamanan Akun & Sandi</span>
            </CardTitle>
            <p className="text-xs text-[#72677E] mt-1">
              Perbarui kata sandi secara berkala untuk menjaga kerahasiaan akses sesi dan data pribadi Anda.
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-4 text-xs">
            {passwordSuccessNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccessNotice}</span>
              </div>
            )}

            {passwordErrorNotice && (
              <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordErrorNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="account-new-password" className="font-semibold text-slate-700 block mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="account-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="account-confirm-password" className="font-semibold text-slate-700 block mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="account-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-plum-100 bg-plum-50/60 p-3.5 flex items-start gap-2.5 text-plum-900">
              <Sparkles className="w-4 h-4 text-plum-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-semibold">Tips Keamanan Sandi:</p>
                <p className="text-plum-800">
                  Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk keamanan maksimal pada seluruh rekaman konseling Anda.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-[#FAF8F5]/60 border-t border-[#EFE9E2] p-4 flex justify-between items-center">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Terenkripsi standar sistem keamanan Soulaide
            </span>
            <Button
              type="submit"
              disabled={savingPassword || !newPassword}
              variant="dark"
              className="px-5 text-xs font-semibold"
            >
              {savingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
