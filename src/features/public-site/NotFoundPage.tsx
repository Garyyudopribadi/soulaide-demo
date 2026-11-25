import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-14 h-14 rounded-2xl bg-plum-50 border border-plum-100 text-plum-700 flex items-center justify-center mb-5">
        <Compass className="w-7 h-7" />
      </div>
      <p className="font-serif italic text-6xl font-semibold text-plum-800">404</p>
      <h1 className="text-2xl font-extrabold text-[#1E1429] mt-2 mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-[#645A70] max-w-sm mb-7 leading-relaxed">
        Halaman yang Anda cari tidak tersedia atau mungkin telah berpindah alamat.
      </p>
      <Link to="/">
        <Button className="gap-2 rounded-full px-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Button>
      </Link>
    </div>
  )
}
