import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import {
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  UserPlus,
  Edit2,
  X,
  Loader2,
  Mail,
  User,
  Phone,
  Upload,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import type { AdminStaffItem } from './types';
import type { UserRole } from '@/types';
import { adminService } from './adminService';
import { uploadManagedAsset, deleteManagedAsset } from '@/lib/storageManager';
import { getInitials } from '@/lib/dashboard';

interface AdminStaffTabProps {
  staffMembers: AdminStaffItem[];
  currentUserRole: UserRole | string;
  onRefresh: () => void;
}

export const AdminStaffTab: React.FC<AdminStaffTabProps> = ({
  staffMembers,
  currentUserRole,
  onRefresh,
}) => {
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Role Filter & Search State
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Role Counts & Filtered Staff
  const roleCounts = {
    all: staffMembers.length,
    super_admin: staffMembers.filter((s) => s.role === 'super_admin').length,
    admin: staffMembers.filter((s) => s.role === 'admin').length,
    psychologist: staffMembers.filter((s) => s.role === 'psychologist').length,
    customer: staffMembers.filter((s) => s.role === 'customer').length,
  };

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
    const matchesSearch =
      !searchQuery.trim() ||
      staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.phone_number && staff.phone_number.includes(searchQuery));
    return matchesRole && matchesSearch;
  });

  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
  }>({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'admin',
  });

  // Edit Staff Modal State (Detail update)
  const [editingStaff, setEditingStaff] = useState<AdminStaffItem | null>(null);
  const [editFormData, setEditFormData] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    role: UserRole;
  }>({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
    role: 'admin',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = currentUserRole === 'super_admin';

  const notifySuccess = (message: string) => {
    setActionNotice(message);
    setActionError(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const notifyError = (message: string) => {
    setActionError(message);
    setActionNotice(null);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      notifyError('Hanya Super Admin yang berhak mempromosikan atau mendemosikan role pengguna.');
      return;
    }

    if (!window.confirm(`Ubah role pengguna ini menjadi '${newRole}'?`)) return;

    try {
      await adminService.updateUserRole(userId, newRole);
      notifySuccess('Role pengguna berhasil diperbarui.');
      onRefresh();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Gagal memperbarui role');
    }
  };

  const handleDeleteStaff = async (staff: AdminStaffItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data staf "${staff.full_name}" (${staff.role}) dari sistem? Akses otoritas staf ini akan dicabut.`)) {
      return;
    }

    try {
      await adminService.deleteStaffMember(staff.id, staff.user_id, staff.full_name);
      notifySuccess(`Data staf "${staff.full_name}" berhasil dihapus dari sistem.`);
      if (editingStaff?.id === staff.id) {
        setEditingStaff(null);
      }
      onRefresh();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Gagal menghapus data staf.');
    }
  };

  const handleOpenEdit = (staff: AdminStaffItem) => {
    setEditingStaff(staff);
    setEditFormData({
      fullName: staff.full_name,
      email: staff.email || '',
      phoneNumber: staff.phone_number || '',
      avatarUrl: staff.avatar_url || '',
      role: staff.role,
    });
  };

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStaff) return;

    setUploadingAvatar(true);
    try {
      const res = await uploadManagedAsset({
        file,
        folder: 'avatars',
        customName: `staff-${editingStaff.user_id}`,
        previousUrl: editFormData.avatarUrl || null,
      });

      setEditFormData((prev) => ({ ...prev, avatarUrl: res.url }));
      notifySuccess('Foto staf berhasil dioptimasi & diunggah.');
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Gagal mengunggah foto profil staf.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (editFormData.avatarUrl) {
      try {
        await deleteManagedAsset(editFormData.avatarUrl);
      } catch (err) {
        console.warn('Gagal menghapus file avatar:', err);
      }
    }
    setEditFormData((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    if (!editFormData.fullName.trim()) {
      notifyError('Nama lengkap wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.updateStaffMember({
        userId: editingStaff.user_id,
        fullName: editFormData.fullName.trim(),
        email: editFormData.email.trim() || undefined,
        phoneNumber: editFormData.phoneNumber.trim(),
        avatarUrl: editFormData.avatarUrl || null,
        newRole: isSuperAdmin ? editFormData.role : undefined,
      });

      notifySuccess(`Data staf "${editFormData.fullName}" berhasil diperbarui secara detail.`);
      setEditingStaff(null);
      onRefresh();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Gagal memperbarui data staf.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStaff.fullName.trim() || !newStaff.email.trim()) {
      notifyError('Nama lengkap dan email staf wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.addStaffMember({
        fullName: newStaff.fullName.trim(),
        email: newStaff.email.trim().toLowerCase(),
        role: newStaff.role,
      });

      notifySuccess(`Staf baru "${newStaff.fullName}" berhasil ditambahkan sebagai ${newStaff.role}.`);
      setIsAddModalOpen(false);
      setNewStaff({ fullName: '', email: '', phoneNumber: '', role: 'admin' });
      onRefresh();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Gagal menambahkan staf baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-plum-100 text-plum-800 border-plum-200">Admin Operasional</Badge>;
      case 'psychologist':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Psikolog Klinis</Badge>;
      default:
        return <Badge variant="secondary">Klien (Customer)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-2 border border-emerald-200 shadow-sm animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 text-red-700 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-2 border border-red-200 shadow-sm animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Super Admin Notice */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${isSuperAdmin
          ? 'bg-purple-50/70 border-purple-200 text-purple-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
      >
        <Shield className="w-5 h-5 shrink-0 mt-0.5 text-purple-700" />
        <div className="space-y-1">
          <p className="font-bold">
            {isSuperAdmin
              ? 'Akses Otoritas Penuh Super Administrator Aktif'
              : 'Mode Terbatas: Hanya Super Admin yang Dapat Mengubah Role & Otoritas'}
          </p>
          <p className="leading-relaxed opacity-90">
            {isSuperAdmin
              ? 'Sebagai Super Admin, Anda memiliki hak istimewa penuh untuk menambah staf, mengubah detail identitas profil, mengunggah foto profil, serta mengatur tingkat otoritas seluruh akun staf.'
              : 'Anda sedang masuk dengan akun Admin Operasional. Hanya Super Administrator yang berwenang mengubah hak akses role dan mempromosikan staf.'}
          </p>
        </div>
      </div>

      {/* Ringkasan & Filter Cepat per Role */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('all');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === 'all'
              ? 'bg-plum-900 text-white border-plum-900 shadow-sm ring-2 ring-plum-500/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <p className={`text-[11px] font-medium ${selectedRole === 'all' ? 'text-plum-200' : 'text-slate-500'}`}>
            Semua Pengguna
          </p>
          <p className="text-xl font-bold mt-0.5">{roleCounts.all}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('super_admin');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === 'super_admin'
              ? 'bg-purple-900 text-white border-purple-900 shadow-sm ring-2 ring-purple-500/20'
              : 'bg-white hover:bg-purple-50/50 border-purple-100 text-purple-950'
          }`}
        >
          <p className={`text-[11px] font-medium ${selectedRole === 'super_admin' ? 'text-purple-200' : 'text-purple-700'}`}>
            Super Admin
          </p>
          <p className="text-xl font-bold mt-0.5">{roleCounts.super_admin}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('admin');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === 'admin'
              ? 'bg-plum-900 text-white border-plum-900 shadow-sm ring-2 ring-plum-500/20'
              : 'bg-white hover:bg-plum-50/50 border-plum-100 text-plum-950'
          }`}
        >
          <p className={`text-[11px] font-medium ${selectedRole === 'admin' ? 'text-plum-200' : 'text-plum-700'}`}>
            Admin Operasional
          </p>
          <p className="text-xl font-bold mt-0.5">{roleCounts.admin}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('psychologist');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === 'psychologist'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-100 text-emerald-950'
          }`}
        >
          <p className={`text-[11px] font-medium ${selectedRole === 'psychologist' ? 'text-emerald-200' : 'text-emerald-700'}`}>
            Psikolog Klinis
          </p>
          <p className="text-xl font-bold mt-0.5">{roleCounts.psychologist}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('customer');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            selectedRole === 'customer'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-500/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <p className={`text-[11px] font-medium ${selectedRole === 'customer' ? 'text-slate-300' : 'text-slate-500'}`}>
            Klien (Customer)
          </p>
          <p className="text-xl font-bold mt-0.5">{roleCounts.customer}</p>
        </button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-plum-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Direktori Staf & Otoritas Sistem
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan {filteredStaff.length} dari {staffMembers.length} akun terdaftar di sistem Soulaide.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-plum-900 hover:bg-plum-950 text-[#FAF7F2] text-xs font-medium rounded-lg border border-plum-950/20 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Staf Baru</span>
          </button>
        </CardHeader>

        {/* Toolbar Filter Role & Search */}
        <div className="p-4 bg-slate-50/40 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:inline-block" />
            <button
              type="button"
              onClick={() => {
                setSelectedRole('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedRole === 'all'
                  ? 'bg-plum-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Semua ({roleCounts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('super_admin');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedRole === 'super_admin'
                  ? 'bg-purple-900 text-white shadow-2xs'
                  : 'bg-white text-purple-800 hover:bg-purple-50 border border-purple-200'
              }`}
            >
              Super Admin ({roleCounts.super_admin})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-plum-900 text-white shadow-2xs'
                  : 'bg-white text-plum-800 hover:bg-plum-50 border border-plum-200'
              }`}
            >
              Admin ({roleCounts.admin})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('psychologist');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedRole === 'psychologist'
                  ? 'bg-emerald-900 text-white shadow-2xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Psikolog ({roleCounts.psychologist})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('customer');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedRole === 'customer'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Klien ({roleCounts.customer})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, email, no. telp..."
                className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-plum-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(selectedRole !== 'all' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-xs text-plum-700 hover:text-plum-900 underline font-medium whitespace-nowrap cursor-pointer px-1"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={
                staffMembers.length === 0
                  ? 'Tidak ada data staf'
                  : 'Tidak ada data yang cocok dengan filter'
              }
              message={
                staffMembers.length === 0
                  ? 'Daftar role pengguna terdaftar akan tampil di sini.'
                  : 'Coba ubah filter role atau kata kunci pencarian Anda.'
              }
              action={
                staffMembers.length > 0 && (selectedRole !== 'all' || searchQuery.trim()) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('all');
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-plum-900 bg-plum-100 hover:bg-plum-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama & Foto</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">No. Kontak</th>
                  <th className="py-3 px-4">Terdaftar</th>
                  <th className="py-3 px-4 text-center">Role Saat Ini</th>
                  <th className="py-3 px-4 text-center">Ubah Otoritas</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        {staff.avatar_url ? (
                          <img
                            src={staff.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-plum-100 text-plum-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {getInitials(staff.full_name)}
                          </div>
                        )}
                        <span className="truncate max-w-[160px]">{staff.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {staff.email || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {staff.phone_number || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(staff.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center">{getRoleBadge(staff.role)}</td>
                    <td className="py-3.5 px-4 text-center">
                      {isSuperAdmin ? (
                        <select
                          value={staff.role}
                          onChange={(e) => handleRoleChange(staff.user_id, e.target.value as UserRole)}
                          className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-plum-500 font-medium"
                        >
                          <option value="customer">Klien (Customer)</option>
                          <option value="psychologist">Psikolog Klinis</option>
                          <option value="admin">Admin Operasional</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-slate-300" />
                          Terkunci
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(staff)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-plum-700 bg-plum-50 hover:bg-plum-100 rounded-lg border border-plum-200 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Detail &amp; Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                          title="Hapus Data Staf"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="sr-only sm:not-sr-only">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredStaff.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredStaff.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 25]}
            itemLabel="anggota staf"
          />
        )}
      </Card>

      {/* MODAL: Tambah Staf Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-plum-600" />
                <h3 className="font-bold text-slate-900 text-sm">Tambah Staf Baru & Otoritas</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Staf <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    placeholder="Contoh: drg. Rina / Amanda Putri"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="email.staf@soulaide.id"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Email ini digunakan staf untuk login ke sistem Soulaide.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role / Tingkat Otoritas <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as UserRole })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-white"
                >
                  <option value="admin">Admin Operasional</option>
                  <option value="psychologist">Psikolog Klinis</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="customer">Klien (Customer)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-plum-900 hover:bg-plum-950 text-[#FAF7F2] text-xs font-medium rounded-lg flex items-center gap-1.5 border border-plum-950/20 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Simpan &amp; Tambahkan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Full Edit Detail Staf & Otoritas */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-plum-600" />
                <h3 className="font-bold text-slate-900 text-sm">Full Edit Data Staf &amp; Otoritas</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Foto Profil Staf */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                <div className="relative shrink-0">
                  {editFormData.avatarUrl ? (
                    <img
                      src={editFormData.avatarUrl}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-plum-100 text-plum-800 font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {getInitials(editFormData.fullName || 'User')}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-bold text-slate-800">Foto Profil Staf</p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Unggah foto formal staf. Format otomatis dioptimasi untuk tampilan cepat.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="staff-avatar-upload"
                      accept="image/*"
                      disabled={uploadingAvatar}
                      onChange={handleAvatarFileSelected}
                      className="hidden"
                    />
                    <label
                      htmlFor="staff-avatar-upload"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-plum-900 hover:bg-plum-950 text-[#FAF7F2] rounded-lg text-[11px] font-medium cursor-pointer shadow-2xs border border-plum-950/20 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{editFormData.avatarUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                    </label>
                    {editFormData.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1 px-2 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={editFormData.phoneNumber}
                    placeholder="08xxxxxxxxxx"
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role / Otoritas Akses Sistem
                </label>
                <select
                  value={editFormData.role}
                  disabled={!isSuperAdmin}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-plum-500 focus:outline-none bg-white disabled:bg-slate-100"
                >
                  <option value="customer">Klien (Customer)</option>
                  <option value="psychologist">Psikolog Klinis</option>
                  <option value="admin">Admin Operasional</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {!isSuperAdmin && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    * Pengubahan wewenang role staf hanya dapat dilakukan oleh Super Admin.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteStaff(editingStaff)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Staf</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-plum-900 hover:bg-plum-950 text-[#FAF7F2] text-xs font-medium rounded-lg flex items-center gap-1.5 border border-plum-950/20 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
