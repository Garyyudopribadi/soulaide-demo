import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useAuth } from './useAuth.ts'
import { getRoleDashboardPath } from './auth-context.ts'

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth()

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-champagne-100 border border-champagne-200 text-champagne-700 flex items-center justify-center mb-5">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#1E1429] mb-2">Akses Dibatasi</h1>
      <p className="text-sm text-[#645A70] max-w-md mb-7 leading-relaxed">
        Anda tidak memiliki izin untuk mengakses halaman ini. Peran akun Anda ({role ?? 'tamu'}) tidak memiliki wewenang untuk area yang diminta.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={getRoleDashboardPath(role)}>
          <Button className="rounded-full px-6">Menuju Dashboard Anda</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="rounded-full px-6">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  )
}
