import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { supabase } from '@/lib/supabase/client.ts'
import { KeyRound, CheckCircle2 } from 'lucide-react'

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memperbarui kata sandi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Card className="rounded-3xl">
        <CardHeader className="text-center pt-7">
          <div className="w-12 h-12 rounded-2xl bg-plum-50 border border-plum-100 text-plum-700 mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-5.5 h-5.5" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-[#1E1429]">Perbarui Kata Sandi</CardTitle>
          <p className="text-xs text-[#645A70] mt-1">
            Masukkan kata sandi baru untuk akun Soulaide Anda
          </p>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4 text-center pb-7">
            <div className="p-4 bg-plum-50 text-plum-900 rounded-2xl flex items-start gap-3 text-left border border-plum-200/70">
              <CheckCircle2 className="w-5 h-5 text-plum-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Kata Sandi Berhasil Diperbarui!</p>
                <p className="text-[#5A5066] mt-0.5">Mengarahkan Anda ke halaman masuk...</p>
              </div>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 text-xs bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3C3148] uppercase tracking-wider">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 text-sm border border-[#DFD7CE] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-500 bg-sanctuary-50 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3C3148] uppercase tracking-wider">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-4 py-3 text-sm border border-[#DFD7CE] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-500 bg-sanctuary-50 focus:bg-white transition-all"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t-0 pt-2">
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
                {loading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
