import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useSiteSettings } from '@/features/public-site/useSiteSettings.ts'
import { Check, Settings, Loader2 } from 'lucide-react'

export const AdminCmsSettings: React.FC = () => {
  const { data: initialSettings, updateSettings, isUpdating } = useSiteSettings()
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber)
  const [defaultMessage, setDefaultMessage] = useState(initialSettings.defaultMessage)
  const [leadTime, setLeadTime] = useState(initialSettings.minimumLeadTimeHours)
  const [offlineAddress, setOfflineAddress] = useState(initialSettings.offlineAddress)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (initialSettings) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setWhatsappNumber(initialSettings.whatsappNumber)
      setDefaultMessage(initialSettings.defaultMessage)
      setLeadTime(initialSettings.minimumLeadTimeHours)
      setOfflineAddress(initialSettings.offlineAddress)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [initialSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings({
        whatsappNumber,
        defaultMessage,
        minimumLeadTimeHours: leadTime,
        offlineAddress,
      })
      setNotice('Pengaturan sistem dan kontak situs berhasil disimpan ke database.')
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.')
      setTimeout(() => setNotice(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengaturan Situs & Kontak</h2>
        <p className="text-xs text-slate-500">Konfigurasi nomor WhatsApp Click-to-Chat, ketentuan booking, dan lokasi klinik.</p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              Konfigurasi Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp Layanan</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+6289630869804"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Gunakan format internasional dengan tanda tambah (+62...).</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pesan Awal WhatsApp Otomatis</label>
              <textarea
                rows={2}
                required
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Lead Time Minimal Booking (Jam)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">Waktu minimal antara pemesanan dan jadwal sesi (default: 24 jam).</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Alamat Praktik Offline</label>
                <input
                  type="text"
                  required
                  value={offlineAddress}
                  onChange={(e) => setOfflineAddress(e.target.value)}
                  placeholder="Pondok Bambu, Jakarta Timur..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Konfigurasi'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
