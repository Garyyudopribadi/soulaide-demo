import React, { useState } from 'react'
import { MessageCircle, ExternalLink, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx'
import {
  DEFAULT_WHATSAPP_NUMBER,
  WHATSAPP_PRESET_TEMPLATES,
  buildWhatsAppUrl,
  validateSafeWhatsAppContent,
} from './whatsappService.ts'
import { useSiteSettings } from '@/features/public-site/useSiteSettings.ts'

interface WhatsAppButtonProps {
  variant?: 'button' | 'icon' | 'card'
  customText?: string
  className?: string
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  variant = 'button',
  customText,
  className = '',
}) => {
  const { data: settings } = useSiteSettings()
  const [showChooser, setShowChooser] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(WHATSAPP_PRESET_TEMPLATES[0].id)
  const [customInput, setCustomInput] = useState('')
  const [errorWarning, setErrorWarning] = useState<string | null>(null)

  const targetNumber = settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER

  const handleOpenWhatsApp = (text: string) => {
    const validation = validateSafeWhatsAppContent(text)
    if (!validation.isValid) {
      setErrorWarning(validation.warning || 'Pesan mengandung data sensitif.')
      return
    }

    const url = buildWhatsAppUrl(targetNumber, text)
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowChooser(false)
    setErrorWarning(null)
  }

  const currentTemplate =
    WHATSAPP_PRESET_TEMPLATES.find((t) => t.id === selectedTemplate) || WHATSAPP_PRESET_TEMPLATES[0]

  return (
    <>
      {variant === 'button' && (
        <Button
          type="button"
          onClick={() => {
            if (customText) {
              handleOpenWhatsApp(customText)
            } else {
              setShowChooser(true)
            }
          }}
          className={`bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold shadow-sm ${className}`}
        >
          <MessageCircle className="w-4 h-4 fill-emerald-100 text-emerald-700" />
          <span>Hubungi via WhatsApp</span>
        </Button>
      )}

      {variant === 'icon' && (
        <button
          type="button"
          onClick={() => setShowChooser(true)}
          className={`w-12 h-12 rounded-full bg-[#1F7A4C] hover:bg-[#18633D] text-white flex items-center justify-center shadow-md transition-all hover:scale-[1.02] cursor-pointer ring-2 ring-white/90 border border-emerald-900/10 ${className}`}
          title="Chat WhatsApp Resmi Soulaide"
          aria-label="Chat WhatsApp Resmi Soulaide"
        >
          <MessageCircle className="w-5 h-5 fill-white text-[#1F7A4C]" />
        </button>
      )}

      {variant === 'card' && (
        <Card className={`border-emerald-200/80 bg-emerald-50/40 ${className}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp Official Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            <p className="text-xs text-[#645A70]">
              Pertanyaan seputar pendaftaran konsultasi atau alur pembayaran dapat dikonfirmasi via WhatsApp operasional.
            </p>
            <p className="text-xs font-mono font-bold text-emerald-800">{targetNumber}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              size="sm"
              onClick={() => setShowChooser(true)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
            >
              <span>Mulai Chat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Template Chooser Modal */}
      {showChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white shadow-2xl border-[#E6DFD7] overflow-hidden">
            <CardHeader className="bg-sanctuary-100 border-b border-[#EAE3DC] p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-[#23192D]">
                    Pilih Topik Chat WhatsApp
                  </CardTitle>
                  <p className="text-[11px] text-[#645A70]">Nomor Resmi: {targetNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChooser(false)
                  setErrorWarning(null)
                }}
                className="text-[#7A6F85] hover:text-[#23192D] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#3C3148]">Pilih Template Pesan:</label>
                <div className="space-y-1.5">
                  {WHATSAPP_PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tmpl.id)
                        setCustomInput('')
                        setErrorWarning(null)
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedTemplate === tmpl.id
                          ? 'border-plum-500 bg-plum-50/70 font-semibold text-plum-900'
                          : 'border-[#EAE3DC] hover:bg-sanctuary-100 text-[#4B3F59]'
                      }`}
                    >
                      <span>{tmpl.label}</span>
                      {selectedTemplate === tmpl.id && (
                        <span className="w-2 h-2 rounded-full bg-plum-700" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3C3148]">Pratinjau Pesan:</label>
                <textarea
                  rows={3}
                  value={customInput || currentTemplate.text}
                  onChange={(e) => {
                    setCustomInput(e.target.value)
                    setErrorWarning(null)
                  }}
                  className="w-full p-3 text-xs border border-[#DFD7CE] rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-500/30 focus:border-plum-500 bg-sanctuary-50 leading-relaxed"
                />
              </div>

              {errorWarning && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                  {errorWarning}
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-[#645A70]">
                <ShieldCheck className="w-4 h-4 text-plum-600 shrink-0" />
                <span>Privasi aman. Dilarang menyertakan hasil tes atau catatan medis.</span>
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-[#EAE3DC] bg-sanctuary-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowChooser(false)
                  setErrorWarning(null)
                }}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenWhatsApp(customInput || currentTemplate.text)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
              >
                <span>Buka WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
