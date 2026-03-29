import { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Clock, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { uz, ru, enUS, tr } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { useAuthStore } from '../store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

const locales: Record<string, Locale> = { uz, ru, en: enUS, tr };

export default function NotificationDrawer({
  isOpen,
  onClose,
  isDark,
  onUnreadCountChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onUnreadCountChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { language } = useAuthStore();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const data = res.data;
      const items = Array.isArray(data) ? data : (data?.notifications || data?.items || []);
      setNotifications(items);
      onUnreadCountChange?.(items.filter((item: Notification) => !item.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      onUnreadCountChange?.(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) => {
        const next = current.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        );
        onUnreadCountChange?.(next.filter((notification) => !notification.isRead).length);
        return next;
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCheck className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'ERROR': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={clsx(
              "fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l shadow-2xl flex flex-col transition-colors duration-500",
              isDark ? "bg-[#0F172A] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}
          >
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black tracking-tight">Xabarnomalar</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : !(notifications?.length > 0) ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-40">
                  <Bell className="w-16 h-16 mb-4" />
                  <p className="font-bold text-sm">Hozircha xabarlar yo'q</p>
                </div>
              ) : (
                (notifications || []).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) {
                        void markRead(notif.id);
                      }
                      setSelectedNotification(notif);
                    }}
                    className={clsx(
                      "p-4 rounded-2xl border transition-all relative group overflow-hidden",
                      !notif.isRead && "cursor-pointer",
                      notif.isRead
                        ? (isDark ? "bg-white/5 border-white/5 opacity-60" : "bg-slate-50 border-slate-100")
                        : (isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100/50")
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                    <div className="flex gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isDark ? "bg-white/5" : "bg-white shadow-sm"
                      )}>
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-tight mb-1">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-3">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: locales[language] || uz })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {(notifications || []).length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0">
                <button
                  onClick={markAllRead}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white premium-gradient rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  <CheckCheck className="w-4 h-4" />
                  Barchasini o'qilgan deb belgilash
                </button>
              </div>
            )}

            <AnimatePresence>
              {selectedNotification && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    onClick={() => setSelectedNotification(null)}
                  />
                  <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 24, opacity: 0 }}
                    className={clsx(
                      "absolute inset-x-4 bottom-4 rounded-[2rem] border p-6 shadow-2xl",
                      isDark ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-base font-black leading-tight">{selectedNotification.title}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                          {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true, locale: locales[language] || uz })}
                        </p>
                      </div>
                      <button onClick={() => setSelectedNotification(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedNotification.message}
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
