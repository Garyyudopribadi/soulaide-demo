import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Loader2,
} from 'lucide-react';
import type { AssignedBookingItem, ClinicalNoteRecord } from './types';
import { psychologistService } from './psychologistService';

interface PsychologistClinicalModalProps {
  booking: AssignedBookingItem | null;
  psychologistId: string;
  onClose: () => void;
  onSessionUpdated: () => void;
}

interface ClinicalNoteFormProps {
  booking: AssignedBookingItem;
  psychologistId: string;
  initialNote: ClinicalNoteRecord | null;
  onClose: () => void;
  onSessionUpdated: () => void;
}

const ClinicalNoteForm: React.FC<ClinicalNoteFormProps> = ({
  booking,
  psychologistId,
  initialNote,
  onClose,
  onSessionUpdated,
}) => {
  const [saving, setSaving] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(initialNote?.session_summary || '');
  const [clinicalObservations, setClinicalObservations] = useState(initialNote?.clinical_observations || '');
  const [interventionsUsed, setInterventionsUsed] = useState(initialNote?.interventions_used || '');
  const [recommendations, setRecommendations] = useState(initialNote?.recommendations || '');
  const [isConfidential, setIsConfidential] = useState(initialNote?.is_confidential ?? true);

  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    const notePayload: ClinicalNoteRecord = {
      booking_id: booking.id,
      psychologist_id: psychologistId,
      customer_id: booking.customer_id,
      session_summary: sessionSummary,
      clinical_observations: clinicalObservations,
      interventions_used: interventionsUsed,
      recommendations: recommendations,
      is_confidential: isConfidential,
    };

    try {
      await psychologistService.saveClinicalNote(notePayload);
      setNotice('Catatan klinis berhasil disimpan dengan aman.');
      onSessionUpdated();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Gagal menyimpan catatan.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Tandai sesi konseling ini sebagai selesai?')) return;
    try {
      await psychologistService.markSessionCompleted(booking.id);
      setNotice('Status sesi berhasil diperbarui menjadi SELESAI.');
      onSessionUpdated();
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Gagal memperbarui status sesi.');
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-white shadow-2xl border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-slate-50 border-b border-slate-200 p-5 shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>Catatan Klinis Konseling</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {booking.booking_code}
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Klien: <strong className="text-slate-800">{booking.client.full_name}</strong> |{' '}
                Layanan: {booking.service_name} | Tanggal: {booking.session_date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      </CardHeader>

      {/* Clinical Privacy Notice */}
      <div className="bg-emerald-50/80 border-b border-emerald-100 px-5 py-2.5 shrink-0 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="text-[11px]">
            Kerahasiaan Terproteksi: Hanya Anda sebagai psikolog penanggung jawab yang berhak membaca & menulis catatan ini (Kode Etik HIMPSI).
          </span>
        </div>
        <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-semibold">
          RLS STRICT
        </span>
      </div>

      {/* Form Body */}
      <CardContent className="p-5 overflow-y-auto space-y-4 text-xs">
        <form id="clinical-note-form" onSubmit={handleSaveNote} className="space-y-4">
          {notice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notice}</span>
            </div>
          )}

          {errorNotice && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Client Safety Summary */}
          {booking.client.emergency_contact_name && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 block">Kontak Darurat Klien:</span>
                <span>
                  {booking.client.emergency_contact_name} ({booking.client.emergency_contact_relation}) -{' '}
                  {booking.client.emergency_contact_phone}
                </span>
              </div>
              <ShieldCheck className="w-4 h-4 text-plum-600" />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              1. Ringkasan Sesi & Keluhan Utama (Session Summary)
            </label>
            <textarea
              autoFocus
              value={sessionSummary}
              onChange={(e) => setSessionSummary(e.target.value)}
              rows={3}
              required
              placeholder="Rangkuman dinamika yang dibahas selama sesi konseling berlangsung..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              2. Observasi Klinis & Afek (Clinical Observations)
            </label>
            <textarea
              value={clinicalObservations}
              onChange={(e) => setClinicalObservations(e.target.value)}
              rows={2}
              placeholder="Status afek, emosi, kontak mata, bahasa tubuh, serta orientasi realitas klien..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              3. Intervensi Psikologis yang Diterapkan (Interventions Used)
            </label>
            <textarea
              value={interventionsUsed}
              onChange={(e) => setInterventionsUsed(e.target.value)}
              rows={2}
              placeholder="Contoh: CBT Cognitive Restructuring, Socratic Questioning, Guided Mindfulness, Psychoeducation..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              4. Rekomendasi & Tindak Lanjut (Recommendations & Next Steps)
            </label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={2}
              placeholder="Tugas mandiri (homework), jadwal sesi follow-up, atau rujukan medis jika diperlukan..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="confidentialCheck"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="w-4 h-4 text-plum-600 rounded border-slate-300 focus:ring-plum-500"
            />
            <label htmlFor="confidentialCheck" className="text-slate-700 text-xs font-semibold cursor-pointer">
              Tandai sebagai Rekam Klinis Rahasia (Hanya dapat diakses psikolog penanggung jawab)
            </label>
          </div>
        </form>
      </CardContent>

      {/* Footer */}
      <CardFooter className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {booking.status !== 'completed' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkCompleted}
              className="text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Tandai Sesi Selesai
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-500">
            Tutup
          </Button>
          <Button
            type="submit"
            form="clinical-note-form"
            size="sm"
            disabled={saving}
            className="bg-plum-600 hover:bg-plum-700 text-white text-xs gap-1.5 font-semibold px-4"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Menyimpan...' : 'Simpan Catatan'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export const PsychologistClinicalModal: React.FC<PsychologistClinicalModalProps> = ({
  booking,
  psychologistId,
  onClose,
  onSessionUpdated,
}) => {
  const { data: initialNote, isLoading } = useQuery({
    queryKey: ['clinical-note', booking?.id],
    queryFn: () => (booking ? psychologistService.fetchClinicalNote(booking.id) : Promise.resolve(null)),
    enabled: !!booking?.id,
  });

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {isLoading ? (
        <Card className="p-8 flex flex-col items-center justify-center bg-white shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-plum-600 mb-2" />
          <p className="text-xs text-slate-500">Memuat rekam klinis...</p>
        </Card>
      ) : (
        <ClinicalNoteForm
          key={booking.id}
          booking={booking}
          psychologistId={psychologistId}
          initialNote={initialNote || null}
          onClose={onClose}
          onSessionUpdated={onSessionUpdated}
        />
      )}
    </div>
  );
};
