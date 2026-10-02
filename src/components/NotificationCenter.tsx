import React, { useState } from 'react';
import { Bell, CheckCheck, ShieldCheck, Trash2 } from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const supportsNotifications = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    supportsNotifications ? Notification.permission : 'unsupported',
  );
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const enableBrowserNotifications = async () => {
    if (!supportsNotifications) return;
    setPermission(await Notification.requestPermission());
  };

  return (
    <div className="fixed right-4 top-4 z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 shadow-lg transition hover:border-indigo-400 hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold">Notifications</h2>
              <p className="text-[11px] text-slate-400">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={unreadCount === 0}
                title="Mark all as read"
                aria-label="Mark all as read"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-40"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClearAll}
                disabled={notifications.length === 0}
                title="Clear all notifications"
                aria-label="Clear all notifications"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-300 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </header>

          {permission === 'default' && (
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <p className="text-[11px] text-slate-300">Enable browser alerts for task updates.</p>
              <button
                type="button"
                onClick={enableBrowserNotifications}
                className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500"
              >
                Enable
              </button>
            </div>
          )}
          {permission === 'granted' && (
            <p className="flex items-center gap-2 border-b border-slate-800 px-4 py-2 text-[11px] text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Browser alerts are enabled
            </p>
          )}
          {(permission === 'denied' || permission === 'unsupported') && (
            <p className="border-b border-slate-800 px-4 py-2 text-[11px] text-slate-400">
              Browser alerts are unavailable. In-app notifications will still appear here.
            </p>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">You are all caught up.</p>
            ) : notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className={`block w-full border-b border-slate-800/80 px-4 py-3 text-left transition hover:bg-slate-800/70 ${
                  notification.isRead ? 'opacity-70' : 'bg-indigo-950/30'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-white">{notification.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-300">{notification.message}</span>
                    <span className="mt-1.5 block text-[10px] text-slate-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </span>
                  {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};