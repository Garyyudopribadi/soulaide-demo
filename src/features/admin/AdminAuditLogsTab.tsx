import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Activity, Clock, Search, ChevronRight, ChevronDown } from 'lucide-react';
import type { AdminAuditLogItem } from './types';

interface AdminAuditLogsTabProps {
  logs: AdminAuditLogItem[];
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = l.action.toLowerCase().includes(q);
        const matchRes = l.resource_type.toLowerCase().includes(q);
        const matchResId = l.resource_id?.toLowerCase().includes(q);
        if (!matchAction && !matchRes && !matchResId) return false;
      }
      return true;
    });
  }, [logs, searchQuery]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-plum-600" />
            <span>Riwayat & Catatan Audit Sistem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Merekam seluruh aksi transaksi, pembaruan status booking, dan perubahan otoritas staf.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi / resource ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="Tidak ada log yang cocok"
          message="Tidak ditemukan riwayat jejak audit yang sesuai dengan kata kunci pencarian Anda."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">
              Riwayat Aktivitas ({filteredLogs.length} Log)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Aksi Sistem</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Actor ID</th>
                  <th className="py-3 px-4 text-right">Detail Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {paginatedLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 text-slate-500 font-sans flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(log.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            {new Date(log.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 font-sans">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-plum-800 font-semibold uppercase text-[10px] block">
                            {log.resource_type}
                          </span>
                          <span className="text-slate-400 text-[10px] truncate max-w-xs block">
                            {log.resource_id || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[10px] truncate max-w-xs">
                          {log.actor_id || 'System / Anonymous'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] text-plum-700 font-medium hover:underline"
                          >
                            <span>JSON</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-900 text-plum-300 font-mono text-[10px]">
                          <td colSpan={5} className="p-4 overflow-x-auto">
                            <pre className="whitespace-pre-wrap leading-relaxed">
                              {JSON.stringify(log.metadata || {}, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[15, 30, 50, 100]}
            itemLabel="log aktivitas"
          />
        </Card>
      )}
    </div>
  );
};
