import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { AlertCircle, Phone, X, ShieldAlert } from 'lucide-react';
import { EMERGENCY_HOTLINES } from './crisisService.ts';

interface CrisisEscalationModalProps {
  onClose: () => void;
}

export const CrisisEscalationModal: React.FC<CrisisEscalationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-amber-200 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-amber-500 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">
                  Pusat Bantuan & Tanggap Darurat Krisis
                </CardTitle>
                <p className="text-xs text-amber-100">
                  Layanan siaga kedaruratan mental dan medis Indonesia
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Disclaimer Notice */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Jika Anda atau kerabat sedang mengalami dorongan menyakiti diri, krisis kejiwaan akut, atau darurat medis fisik, segera hubungi salah satu kontak darurat 24 jam di bawah ini atau kunjungi IGD rumah sakit terdekat.
          </p>
        </div>

        {/* Hotlines List */}
        <CardContent className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {EMERGENCY_HOTLINES.map((hotline, idx) => (
            <div
              key={idx}
              className="p-3.5 border border-slate-200 rounded-xl hover:border-amber-300 transition-colors bg-slate-50/50 flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{hotline.name}</span>
                  {hotline.is24Hours && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      24 Jam
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{hotline.description}</p>
                <p className="text-xs font-mono font-semibold text-amber-800">{hotline.phone}</p>
              </div>
              <a href={hotline.telUri} className="shrink-0">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Panggil</span>
                </Button>
              </a>
            </div>
          ))}
        </CardContent>

        <CardFooter className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
