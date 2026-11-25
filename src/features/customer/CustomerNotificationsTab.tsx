import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { CheckCheck, Clock, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import type { CustomerNotificationItem } from './types';

interface CustomerNotificationsTabProps {
  notifications: CustomerNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const CustomerNotificationsTab: React.FC<CustomerNotificationsTabProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-plum-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-800">Kotak Notifikasi</h2>
          {unreadCount > 0 && (
            <Badge variant="warning" className="text-[10px]">
              {unreadCount} Belum Dibaca
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs text-plum-700 hover:text-plum-900 gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Tidak ada notifikasi baru"
          message="Anda telah membaca seluruh pembaruan status jadwal konseling dan pembayaran."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) {
                  onMarkAsRead(notif.id);
                }
                if (notif.link) {
                  window.location.href = notif.link;
                }
              }}
              className={`p-4 transition-all cursor-pointer border ${
                notif.is_read
                  ? 'bg-white border-slate-200/80 hover:border-slate-300'
                  : 'bg-plum-50/40 border-plum-200 hover:border-plum-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-plum-100 text-plum-700'
                    }`}
                  >
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          notif.is_read ? 'text-slate-800' : 'text-plum-950 font-extrabold'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-plum-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
