import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { supabase } from '@/lib/supabase/client.ts'
import { Mail, CheckCircle2 } from 'lucide-react'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengirim instruksi reset kata sandi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Card className="rounded-3xl">
        <CardHeader className="text-center pt-7">
          <div className="w-12 h-12 rounded-2xl bg-plum-50 border border-plum-100 text-plum-700 mx-auto flex items-center justify-center mb-3">
            <Mail className="w-5.5 h-5.5" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-[#1E1429]">Lupa Kata Sandi?</CardTitle>
          <p className="text-xs text-[#645A70] mt-1 leading-relaxed">
            Masukkan email Anda untuk menerima tautan pemulihan kata sandi.
          </p>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4 text-center pb-7">
            <div className="p-4 bg-plum-50 text-plum-900 rounded-2xl flex items-start gap-3 text-left border border-plum-200/70">
              <CheckCircle2 className="w-5 h-5 text-plum-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Email Pemulihan Terkirim</p>
                <p className="text-[#5A5066] mt-0.5 leading-relaxed">
                  Silakan periksa kotak masuk atau spam email Anda ({email}) untuk melanjutkan reset kata sandi.
                </p>
              </div>
            </div>
            <Link to="/login" className="block pt-2">
              <Button variant="outline" className="w-full rounded-xl">
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 text-xs bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3C3148] uppercase tracking-wider">
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 text-sm border border-[#DFD7CE] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-500 bg-sanctuary-50 focus:bg-white transition-all"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 border-t-0 pt-2">
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
              </Button>
              <p className="text-xs text-center text-[#645A70]">
                Ingat kata sandi Anda?{' '}
                <Link to="/login" className="text-plum-700 font-bold hover:underline">
                  Masuk kembali
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
