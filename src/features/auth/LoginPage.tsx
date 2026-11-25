import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { supabase } from '@/lib/supabase/client.ts'
import { useAuth } from './useAuth.ts'
import { getRoleDashboardPath } from './auth-context.ts'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, loading: authLoading, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // If already authenticated with a resolved role, immediately redirect to their proper dashboard
  useEffect(() => {
    if (!authLoading && user && role) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname
      let destination = getRoleDashboardPath(role)
      if (from && from !== '/login' && from !== '/unauthorized') {
        if (from.startsWith('/admin') && (role === 'admin' || role === 'super_admin')) {
          destination = from
        } else if (from.startsWith('/psychologist') && (role === 'psychologist' || role === 'super_admin')) {
          destination = from
        } else if (from.startsWith('/dashboard') && (role === 'customer' || role === 'super_admin')) {
          destination = from
        } else if (!from.startsWith('/admin') && !from.startsWith('/psychologist') && !from.startsWith('/dashboard')) {
          destination = from
        }
      }
      navigate(destination, { replace: true })
    }
  }, [user, role, authLoading, navigate, location.state])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
      } else if (data.user) {
        // Explicitly pass data.user.id to fetch and receive the resolved role immediately
        const resolvedRole = await refreshProfile(data.user.id)

        const from = (location.state as { from?: { pathname: string } })?.from?.pathname
        let destination = getRoleDashboardPath(resolvedRole)

        if (from && from !== '/login' && from !== '/unauthorized') {
          if (from.startsWith('/admin')) {
            if (resolvedRole === 'admin' || resolvedRole === 'super_admin') {
              destination = from
            }
          } else if (from.startsWith('/psychologist')) {
            if (resolvedRole === 'psychologist' || resolvedRole === 'super_admin') {
              destination = from
            }
          } else if (from.startsWith('/dashboard')) {
            if (resolvedRole === 'customer' || resolvedRole === 'super_admin') {
              destination = from
            }
          } else {
            destination = from
          }
        }

        navigate(destination, { replace: true })
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal melakukan login')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickAccount = (quickEmail: string, quickPwd: string) => {
    setEmail(quickEmail)
    setPassword(quickPwd)
    setErrorMessage(null)
  }

  return (
    <div className="relative py-14 sm:py-20 px-4 min-h-[82vh] flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center group"
            aria-label="Kembali ke Beranda Soulaide"
          >
            <img
              src="/Soulaide Psi Arc Logo.webp"
              alt="Soulaide Psychology"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">
              Masuk ke <span className="italic text-plum-700">Portal Layanan</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted max-w-xs mx-auto leading-relaxed">
              Akses jadwal konseling aktif, riwayat sesi privat, dan laporan klinis Anda.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="rounded-xl border border-line bg-paper-card shadow-[0_12px_32px_-16px_rgba(41,23,56,0.12)]">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              {errorMessage && (
                <div className="p-3.5 text-xs bg-rose-50 text-rose-800 rounded-md border border-rose-200">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-plum-600" />
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-line rounded-md focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-600 bg-white transition-all text-ink"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-plum-600" />
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-plum-700 font-semibold hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-11 py-2.5 text-sm border border-line rounded-md focus:outline-hidden focus:ring-2 focus:ring-plum-500/30 focus:border-plum-600 bg-white transition-all text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-plum-700 cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-2 border-t border-[#EDE6D9]">
              <Button
                type="submit"
                className="w-full h-11 rounded-sm bg-plum-900 hover:bg-plum-800 text-white font-semibold gap-2 cursor-pointer shadow-xs"
                disabled={loading}
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Akun'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>

              <p className="text-xs text-center text-ink-muted pt-1">
                Belum memiliki akun?{' '}
                <Link to="/register" className="text-plum-800 font-bold hover:underline">
                  Daftar akun baru
                </Link>
              </p>
            </CardFooter>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="p-4 bg-sanctuary-100/90 border-t border-line space-y-2 rounded-b-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted block">
              Pilih Akun Demo Cepat:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillQuickAccount('admin@soulaide.id', 'AdminSoulaide2026!')}
                className="px-2 py-1.5 rounded-sm bg-white border border-line text-ink font-semibold hover:border-plum-400 transition-colors cursor-pointer text-center truncate"
                title="Super Admin: admin@soulaide.id"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('finandita@soulaide.id', 'Psikolog2026!')}
                className="px-2 py-1.5 rounded-sm bg-white border border-line text-ink font-semibold hover:border-plum-400 transition-colors cursor-pointer text-center truncate"
                title="Psikolog: finandita@soulaide.id"
              >
                Psikolog
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('klien@soulaide.id', 'KlienSoulaide2026!')}
                className="px-2 py-1.5 rounded-sm bg-white border border-line text-ink font-semibold hover:border-plum-400 transition-colors cursor-pointer text-center truncate"
                title="Klien: klien@soulaide.id"
              >
                Klien
              </button>
            </div>
          </div>
        </Card>

        {/* Security Assurance */}
        <div className="text-center text-xs text-ink-muted flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-plum-600" />
          <span>Koneksi aman berstandar enkripsi data medis &amp; HIMPSI</span>
        </div>
      </div>
    </div>
  )
}
