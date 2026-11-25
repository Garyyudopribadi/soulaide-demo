import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { supabase } from '@/lib/supabase/client.ts'
import { CheckCircle2, ShieldCheck, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
      } else if (data.session) {
        navigate('/dashboard')
      } else {
        setIsSuccess(true)
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative py-16 sm:py-20 px-4">
      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 group cursor-pointer" aria-label="Beranda Soulaide">
            <img
              src="/Soulaide Psi Arc Logo.webp"
              alt="Soulaide"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1429] tracking-tight">
              Buat Akun <span className="font-serif italic font-semibold text-plum-700">Soulaide</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#645A70] max-w-xs mx-auto leading-relaxed">
              Daftar untuk memulai konsultasi psikologi yang aman, privat, dan terverifikasi.
            </p>
          </div>
        </div>

        <Card className="rounded-xl border border-line bg-paper-card shadow-[0_12px_32px_-16px_rgba(41,23,56,0.12)]">
          {isSuccess ? (
            <CardContent className="space-y-5 text-center p-7">
              <div className="p-4 bg-plum-50/70 text-plum-900 rounded-lg flex items-start gap-3 text-left border border-plum-200/80">
                <CheckCircle2 className="w-5 h-5 text-plum-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">Pendaftaran Berhasil!</p>
                  <p className="text-[#5A5066] leading-relaxed">
                    Tautan konfirmasi telah dikirim ke alamat surel <strong>{email}</strong>. Silakan periksa kotak masuk atau spam Anda untuk mengaktifkan akun.
                  </p>
                </div>
              </div>
              <Link to="/login" className="block">
                <Button className="w-full h-11 rounded-lg">Menuju Halaman Masuk</Button>
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-7">
                {errorMessage && (
                  <div className="p-3.5 text-xs bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3C3148] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-plum-600" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full px-4 py-2.5 text-sm border border-line rounded-lg focus:outline-hidden focus:ring-2 focus:ring-plum-500/20 focus:border-plum-600 bg-sanctuary-50/70 focus:bg-paper-card transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3C3148] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-plum-600" />
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 text-sm border border-line rounded-lg focus:outline-hidden focus:ring-2 focus:ring-plum-500/20 focus:border-plum-600 bg-sanctuary-50/70 focus:bg-paper-card transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3C3148] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-plum-600" />
                    Kata Sandi Baru (Minimal 6 karakter)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 text-sm border border-line rounded-lg focus:outline-hidden focus:ring-2 focus:ring-plum-500/20 focus:border-plum-600 bg-sanctuary-50/70 focus:bg-paper-card transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8E81A1] hover:text-plum-700 cursor-pointer"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-3.5 pt-2 border-t-0">
                <Button type="submit" className="w-full h-11 rounded-lg gap-2" disabled={loading}>
                  <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
                <p className="text-xs text-center text-[#645A70] pt-1">
                  Sudah memiliki akun?{' '}
                  <Link to="/login" className="text-plum-700 font-bold hover:underline">
                    Masuk sekarang
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>

        <div className="text-center text-xs text-[#7A6F85] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-plum-600" />
          <span>Data Anda terlindungi oleh standar privasi klinis & etika HIMPSI</span>
        </div>
      </div>
    </div>
  )
}
