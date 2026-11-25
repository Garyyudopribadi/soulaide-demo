import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, ShieldCheck, HeartHandshake, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { ClientProfileData, CustomerConsentRecord } from './types';
import { customerService } from './customerService';
import { AccountProfileSecurity } from '@/components/dashboard/AccountProfileSecurity';

interface CustomerProfileTabProps {
  userId: string;
  initialFullName: string;
  initialPhone: string;
  userEmail: string;
  avatarUrl?: string | null;
  clientProfile: ClientProfileData | null;
  consents: CustomerConsentRecord[];
  onProfileUpdated: () => void;
}

export const CustomerProfileTab: React.FC<CustomerProfileTabProps> = ({
  userId,
  initialFullName,
  initialPhone,
  userEmail,
  avatarUrl,
  clientProfile,
  consents,
  onProfileUpdated,
}) => {
  const [dob, setDob] = useState(clientProfile?.date_of_birth || '');
  const [gender, setGender] = useState(clientProfile?.gender || 'Laki-laki');
  const [occupation, setOccupation] = useState(clientProfile?.occupation || '');
  const [emergencyName, setEmergencyName] = useState(clientProfile?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(clientProfile?.emergency_contact_phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(clientProfile?.emergency_contact_relation || '');

  const [savingIntake, setSavingIntake] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleUpdateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingIntake(true);
    setSuccessNotice(null);
    setErrorNotice(null);

    try {
      await customerService.updateCustomerClientProfile(userId, {
        date_of_birth: dob || null,
        gender: gender || null,
        occupation: occupation || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        emergency_contact_relation: emergencyRelation || null,
      });

      setSuccessNotice('Data demografis dan kontak darurat klien berhasil disimpan.');
      onProfileUpdated();
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Gagal memperbarui data kontak darurat.');
    } finally {
      setSavingIntake(false);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  const extraClientSections = (
    <div className="space-y-6">
      {/* Data Demografis & Kontak Darurat Form */}
      <form onSubmit={handleUpdateIntake} className="space-y-6">
        <Card className="border-[#E4DCD3] shadow-sm">
          <CardHeader className="border-b border-[#EFE9E2] bg-[#FAF8F5]/60 pb-4">
            <CardTitle className="text-base font-bold text-plum-950 flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600" />
              <span>Data Demografis & Kontak Darurat Medis</span>
            </CardTitle>
            <p className="text-xs text-[#72677E] mt-1">
              Data ini disimpan secara aman dan terenkripsi. Kontak darurat hanya dihubungi jika terjadi situasi darurat medis selama periode konseling.
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-4 text-xs">
            {successNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorNotice && (
              <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="client-dob" className="font-semibold text-slate-700 block mb-1">Tanggal Lahir</label>
                <input
                  id="client-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label htmlFor="client-gender" className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                <select
                  id="client-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-white text-xs"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya / Tidak ingin menyebutkan</option>
                </select>
              </div>

              <div>
                <label htmlFor="client-occupation" className="font-semibold text-slate-700 block mb-1">Pekerjaan / Aktivitas</label>
                <input
                  id="client-occupation"
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Contoh: Mahasiswa, Karyawan"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <h4 className="font-bold text-plum-950 text-xs mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-plum-600" />
                Informasi Kontak Darurat (Emergency Contact)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="client-emergency-name" className="font-semibold text-slate-700 block mb-1">Nama Kontak Darurat</label>
                  <input
                    id="client-emergency-name"
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Nama kerabat / wali"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="client-emergency-phone" className="font-semibold text-slate-700 block mb-1">Nomor Telepon Darurat</label>
                  <input
                    id="client-emergency-phone"
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="client-emergency-relation" className="font-semibold text-slate-700 block mb-1">Hubungan</label>
                  <input
                    id="client-emergency-relation"
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Contoh: Orang Tua, Pasangan"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-[#FAF8F5]/60 border-t border-[#EFE9E2] p-4 flex justify-end">
            <Button
              type="submit"
              disabled={savingIntake}
              className="px-5 text-xs font-semibold"
            >
              {savingIntake ? 'Menyimpan...' : 'Simpan Data Demografis & Kontak'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Informed Consent & Perlindungan Data Medis */}
      <Card className="border-[#E4DCD3] shadow-sm">
        <CardHeader className="border-b border-[#EFE9E2] bg-[#FAF8F5]/60 pb-4">
          <CardTitle className="text-base font-bold text-plum-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Persetujuan Layanan (Informed Consent) & Kerahasiaan Data</span>
          </CardTitle>
          <p className="text-xs text-[#72677E] mt-1">
            Hak dan perlindungan kerahasiaan Anda sesuai Kode Etik Psikologi Indonesia (HIMPSI).
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-xs">
          <div className="p-4 bg-plum-50/60 border border-plum-100 rounded-xl space-y-2 text-slate-700">
            <h4 className="font-bold text-plum-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-plum-600" />
              Prinsip Perlindungan Privasi Klinis Soulaide
            </h4>
            <p className="leading-relaxed text-[11px]">
              Setiap catatan observasi dan laporan klinis yang dibuat oleh psikolog pendamping disimpan dengan enkripsi tingkat basis data dan isolasi RLS (Row Level Security).
              Hanya psikolog yang Anda pilih yang memiliki wewenang untuk membaca catatan klinis Anda. Tim operasional umum tidak memiliki akses ke rekaman psikologis Anda.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Arsip Dokumen Persetujuan yang Telah Ditandatangani</span>
            </h4>
            {consents.length === 0 ? (
              <p className="text-slate-400 italic">
                Persetujuan layanan otomatis tercatat saat Anda menyelesaikan reservasi sesi pertama kali.
              </p>
            ) : (
              <div className="space-y-2">
                {consents.map((consent) => (
                  <div
                    key={consent.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block capitalize">
                        {consent.consent_type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500">Versi: {consent.version}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" className="text-[10px]">
                        Disetujui
                      </Badge>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(consent.agreed_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AccountProfileSecurity
      userId={userId}
      initialFullName={initialFullName}
      initialPhone={initialPhone}
      userEmail={userEmail}
      roleLabel="Klien"
      avatarUrl={avatarUrl}
      onProfileUpdated={onProfileUpdated}
      extraProfileSection={extraClientSections}
    />
  );
};
