import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import type { ScheduleDayItem } from './types';
import { psychologistService } from './psychologistService';

interface PsychologistCalendarTabProps {
  psychologistId?: string;
  schedules: ScheduleDayItem[];
  onSchedulesUpdated: () => void;
}

export const PsychologistCalendarTab: React.FC<PsychologistCalendarTabProps> = ({
  psychologistId,
  schedules: initialSchedules,
  onSchedulesUpdated,
}) => {
  const [schedules, setSchedules] = useState<ScheduleDayItem[]>(initialSchedules);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialSchedules && initialSchedules.length > 0) {
      setSchedules(initialSchedules);
    }
  }, [initialSchedules]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleToggleDay = (dayIndex: number) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === dayIndex ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      if (!psychologistId) {
        throw new Error('ID profil psikolog tidak ditemukan. Silakan hubungkan akun dengan profil psikolog.');
      }
      await psychologistService.saveWeeklySchedules(psychologistId, schedules);
      setNotice('Jadwal ketersediaan mingguan berhasil diperbarui dan tersimpan.');
      onSchedulesUpdated();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      setErrorNotice(err instanceof Error ? err.message : 'Gagal memperbarui jadwal ketersediaan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-2 border border-emerald-200 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-red-50 text-red-700 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-2 border border-red-200 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Info Lead Time */}
      <div className="p-4 bg-plum-50 border border-plum-200 rounded-2xl flex items-start gap-3 text-xs text-plum-900">
        <ShieldCheck className="w-5 h-5 text-plum-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-plum-950">Aturan Penguncian Jadwal Otomatis (24-Hour Lead Time)</p>
          <p className="leading-relaxed text-plum-800">
            Sistem Soulaide menerapkan kebijakan bahwa klien dilarang melakukan pemesanan di hari yang sama (same-day booking).
            Slot waktu yang Anda aktifkan di bawah ini hanya dapat dipesan paling cepat 24 jam ke depan, memberikan Anda waktu persiapan klinis yang optimal.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-plum-600" />
              <span>Jadwal Praktik Mingguan Berulang</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan hari dan rentang jam praktik reguler Anda untuk konsultasi klien.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Zona Waktu: WIB (UTC+7)
          </Badge>
        </CardHeader>

        <CardContent className="p-5 divide-y divide-slate-100">
          {schedules.map((day, idx) => (
            <div
              key={day.day_of_week}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 w-36">
                <input
                  type="checkbox"
                  id={`day-toggle-${day.day_of_week}`}
                  checked={day.is_active}
                  onChange={() => handleToggleDay(idx)}
                  className="w-4 h-4 text-plum-600 rounded border-slate-300 focus:ring-plum-500 cursor-pointer"
                />
                <label
                  htmlFor={`day-toggle-${day.day_of_week}`}
                  className={`font-bold cursor-pointer ${
                    day.is_active ? 'text-slate-900' : 'text-slate-400 line-through'
                  }`}
                >
                  {day.day_name}
                </label>
              </div>

              {day.is_active ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400">Jam Mulai:</span>
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => handleTimeChange(idx, 'start_time', e.target.value)}
                    className="p-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-plum-500"
                  />
                  <span className="text-slate-400">s/d</span>
                  <span className="text-[11px] text-slate-400">Jam Selesai:</span>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => handleTimeChange(idx, 'end_time', e.target.value)}
                    className="p-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-plum-500"
                  />
                  <span className="text-[11px] text-slate-400">WIB</span>
                </div>
              ) : (
                <span className="text-slate-400 italic text-xs">Libur / Tidak menerima sesi</span>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-plum-600 hover:bg-plum-700 text-white text-xs px-5 font-semibold flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan Jadwal...</span>
              </>
            ) : (
              <span>Simpan Ketersediaan Jadwal</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
