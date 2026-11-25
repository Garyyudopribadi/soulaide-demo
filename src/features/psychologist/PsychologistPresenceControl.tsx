import React, { useState, useRef, useEffect } from 'react';
import type { PresenceStatus } from './types';
import { Circle, ChevronDown, Check } from 'lucide-react';

interface PsychologistPresenceControlProps {
  currentStatus: PresenceStatus;
  onStatusChange: (newStatus: PresenceStatus) => void;
  disabled?: boolean;
  align?: 'left' | 'right';
}

const STATUS_CONFIG: Record<
  PresenceStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string; desc: string }
> = {
  available: {
    label: 'Tersedia (Available)',
    dotColor: 'bg-emerald-500 animate-pulse',
    bgColor: 'bg-emerald-50/90 border-emerald-200 text-emerald-800',
    textColor: 'text-emerald-800',
    desc: 'Online & siap menerima konsultasi',
  },
  busy: {
    label: 'Sedang Sesi (Busy)',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-50/90 border-amber-200 text-amber-800',
    textColor: 'text-amber-800',
    desc: 'Sedang melayani sesi konseling klien',
  },
  away: {
    label: 'Istirahat (Away)',
    dotColor: 'bg-orange-500',
    bgColor: 'bg-orange-50/90 border-orange-200 text-orange-800',
    textColor: 'text-orange-800',
    desc: 'Jeda sementara antar sesi',
  },
  online: {
    label: 'Aktif (Online)',
    dotColor: 'bg-sky-500',
    bgColor: 'bg-sky-50/90 border-sky-200 text-sky-800',
    textColor: 'text-sky-800',
    desc: 'Online di sistem',
  },
  offline: {
    label: 'Tidak Aktif (Offline)',
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 border-slate-200 text-slate-700',
    textColor: 'text-slate-700',
    desc: 'Tidak terhubung',
  },
};

export const PsychologistPresenceControl: React.FC<PsychologistPresenceControlProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.offline;

  const handleSelect = (status: PresenceStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left z-50">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${current.bgColor} hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${current.dotColor}`} />
        <span className="font-medium whitespace-nowrap">{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200/90 py-2 z-[9999] animate-in fade-in zoom-in-95 duration-150`}
          role="menu"
        >
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ubah Status Kehadiran
            </span>
            <span className="text-[10px] text-plum-600 font-semibold">Real-time</span>
          </div>
          <div className="p-1 space-y-0.5">
            {(Object.keys(STATUS_CONFIG) as PresenceStatus[]).map((statusKey) => {
              const cfg = STATUS_CONFIG[statusKey];
              const isSelected = statusKey === currentStatus;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => handleSelect(statusKey)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-2.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-plum-50/80 font-semibold text-plum-950'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  role="menuitem"
                >
                  <Circle className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${cfg.dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${cfg.textColor}`}>{cfg.label}</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">{cfg.desc}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-plum-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
