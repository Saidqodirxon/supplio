import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import {
  Bell,
  CheckCheck,
  Send,
  X,
  Info,
  AlertTriangle,
  CreditCard,
  Plus,
  LayoutTemplate,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { toast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { uz, ru, enUS, tr } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import clsx from 'clsx';
import { useScrollLock } from '../utils/useScrollLock';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: { fullName?: string; phone: string };
}

interface Dealer { id: string; name: string; }

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  message: Record<string, string>;
  isActive: boolean;
  createdAt: string;
}

interface NotificationLog {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  dealer?: { name: string } | null;
}

const locales: Record<string, Locale> = { uz, ru, en: enUS, tr };

const TYPE_STYLES: Record<string, { bg: string; icon: ReactElement }> = {
  INFO: { bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', icon: <Info className="w-4 h-4" /> },
  ALERT: { bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', icon: <AlertTriangle className="w-4 h-4" /> },
  PAYMENT: { bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', icon: <CreditCard className="w-4 h-4" /> },
};

const TEMPLATE_TYPES = [
  { value: 'DEBT_REMINDER', label: 'Qarz eslatmasi', icon: '💰' },
  { value: 'PROMOTION', label: 'Aksiya', icon: '🎁' },
  { value: 'PAYMENT_DUE', label: "To'lov muddati", icon: '⏰' },
  { value: 'GENERAL', label: 'Umumiy', icon: '📢' },
];

const LANGS = ['uz', 'ru', 'en', 'tr'] as const;
type Lang = typeof LANGS[number];

const LANG_LABELS: Record<Lang, string> = { uz: "O'zbek", ru: 'Русский', en: 'English', tr: 'Türkçe' };

const DEFAULT_TEMPLATES = [
  {
    name: 'Qarz eslatmasi',
    type: 'DEBT_REMINDER',
    message: {
      uz: "Sizda {debt} so'm qarz mavjud. Iltimos to'lov qiling.",
      ru: 'У вас долг {debt}. Пожалуйста, оплатите.',
      en: 'You have a debt of {debt}. Please make a payment.',
      tr: '{debt} borcunuz var. Lütfen ödeme yapın.',
    },
  },
  {
    name: 'Aksiya xabari',
    type: 'PROMOTION',
    message: {
      uz: "🔥 Aksiya! {productName} chegirma bilan!",
      ru: '🔥 Акция! {productName} со скидкой!',
      en: '🔥 Sale! {productName} with discount!',
      tr: '🔥 İndirim! {productName} indirimli!',
    },
  },
  {
    name: "To'lov muddati",
    type: 'PAYMENT_DUE',
    message: {
      uz: "⏰ To'lov muddati yaqin! Iltimos, qarzingizni to'lang.",
      ru: '⏰ Срок оплаты скоро! Пожалуйста, погасите долг.',
      en: '⏰ Payment due soon! Please pay your debt.',
      tr: '⏰ Ödeme tarihi yaklaşıyor! Lütfen borcunuzu ödeyin.',
    },
  },
];

type Tab = 'inbox' | 'templates' | 'logs';

const emptyTemplateForm = {
  name: '',
  type: 'DEBT_REMINDER',
  isActive: true,
  message: { uz: '', ru: '', en: '', tr: '' } as Record<Lang, string>,
};

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [sendForm, setSendForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    receiverDealerId: '',
  });

  // Templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [activeLang, setActiveLang] = useState<Lang>('uz');
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Logs
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const { language, user } = useAuthStore();
  const t = dashboardTranslations[language];
  const locale = locales[language] || enUS;
  const isAdmin = user?.roleType === 'SUPER_ADMIN' || user?.roleType === 'OWNER' || user?.roleType === 'MANAGER';

  useScrollLock(showSendModal || showTemplateModal || !!selectedNotification);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifRes, dealRes] = await Promise.all([
        api.get<any>('/notifications'),
        api.get<Dealer[]>('/dealers'),
      ]);
      const data = notifRes.data;
      setNotifications(Array.isArray(data) ? data : data?.notifications || data?.items || []);
      setDealers(Array.isArray(dealRes.data) ? dealRes.data : []);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await api.get<NotificationTemplate[]>('/notifications/templates');
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get<NotificationLog[]>('/notifications/templates/logs');
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (tab === 'templates') fetchTemplates();
    if (tab === 'logs') fetchLogs();
  }, [tab]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Marked all read');
    } catch {
      toast.error(t.common.error);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.title || !sendForm.message) return toast.error(t.common.error);
    try {
      setSaving(true);
      await api.post('/notifications', {
        title: sendForm.title,
        message: sendForm.message,
        type: sendForm.type,
        receiverDealerId: sendForm.receiverDealerId || undefined,
      });
      toast.success('Notification sent');
      setShowSendModal(false);
      setSendForm({ title: '', message: '', type: 'INFO', receiverDealerId: '' });
      fetchNotifications();
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm(emptyTemplateForm);
    setActiveLang('uz');
    setShowTemplateModal(true);
  };

  const openEditTemplate = (tpl: NotificationTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      type: tpl.type,
      isActive: tpl.isActive,
      message: { uz: '', ru: '', en: '', tr: '', ...tpl.message } as Record<Lang, string>,
    });
    setActiveLang('uz');
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) return toast.error('Nom kiritilmadi');
    try {
      setSavingTemplate(true);
      if (editingTemplate) {
        await api.patch(`/notifications/templates/${editingTemplate.id}`, templateForm);
        toast.success('Template yangilandi');
      } else {
        await api.post('/notifications/templates', templateForm);
        toast.success('Template yaratildi');
      }
      setShowTemplateModal(false);
      fetchTemplates();
    } catch {
      toast.error(t.common.error);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleToggleTemplate = async (tpl: NotificationTemplate) => {
    try {
      await api.patch(`/notifications/templates/${tpl.id}`, { isActive: !tpl.isActive });
      setTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, isActive: !t.isActive } : t));
      toast.success(tpl.isActive ? "O'chirildi" : 'Yoqildi');
    } catch {
      toast.error(t.common.error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm("Template o'chirilsinmi?")) return;
    try {
      await api.delete(`/notifications/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("O'chirildi");
    } catch {
      toast.error(t.common.error);
    }
  };

  const seedDefaultTemplates = async () => {
    try {
      await Promise.all(DEFAULT_TEMPLATES.map(tpl => api.post('/notifications/templates', tpl)));
      toast.success('Default templatelar yaratildi');
      fetchTemplates();
    } catch {
      toast.error(t.common.error);
    }
  };

  const displayed = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.length - unreadCount;

  const TABS: { key: Tab; label: string; icon: ReactElement }[] = [
    { key: 'inbox', label: 'Kirish qutisi', icon: <Bell className="w-4 h-4" /> },
    { key: 'templates', label: 'Templatelar', icon: <LayoutTemplate className="w-4 h-4" /> },
    { key: 'logs', label: 'Yuborilganlar', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-900/50">
            <Bell className="w-3 h-3" /> Notifications
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {t.notifications?.title || 'Notifications'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            Avtomatik xabarnomalar va shablonlar
          </p>
        </div>
        <div className="flex gap-3">
          {tab === 'inbox' && unreadCount > 0 && (
            <button onClick={markAllRead} className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-all">
              <CheckCheck className="w-4 h-4" /> Barchasini o'qilgan deb belgilash
            </button>
          )}
          {isAdmin && tab === 'inbox' && (
            <button onClick={() => setShowSendModal(true)} className="premium-button">
              <Plus className="w-4 h-4" /> Yuborish
            </button>
          )}
          {isAdmin && tab === 'templates' && (
            <button onClick={openCreateTemplate} className="premium-button">
              <Plus className="w-4 h-4" /> Yangi template
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-0">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 px-5 py-3 rounded-t-2xl text-[11px] font-black uppercase tracking-widest transition-all border-b-2',
              tab === key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {icon} {label}
            {key === 'inbox' && unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── INBOX TAB ── */}
      {tab === 'inbox' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-black text-slate-900 dark:text-white">{notifications.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Jami</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-black text-blue-600">{unreadCount}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">O'qilmagan</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-black text-emerald-600">{notifications.length - unreadCount}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">O'qilgan</p>
            </div>
          </div>

          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  filter === f
                    ? 'premium-gradient text-white shadow-lg shadow-blue-500/20'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {f === 'all' ? 'Barchasi' : f === 'unread' ? `O'qilmagan (${unreadCount})` : `O'qilgan (${readCount})`}
              </button>
            ))}
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-10 space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Xabarnomalar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {displayed.map((notif) => {
                  const style = TYPE_STYLES[notif.type] || TYPE_STYLES.INFO;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={clsx(
                        'p-6 flex items-start gap-4 cursor-pointer transition-colors',
                        !notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/50' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      )}
                      onClick={() => {
                        setSelectedNotification(notif);
                        if (!notif.isRead) void markRead(notif.id);
                      }}
                    >
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', style.bg)}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={clsx('text-sm font-black text-slate-900 dark:text-white', !notif.isRead && 'text-blue-700 dark:text-blue-300')}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale })}
                            </p>
                            {!notif.isRead && (
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-1.5 shadow-lg shadow-blue-500/50" />
                            )}
                          </div>
                        </div>
                        {notif.sender && (
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            From: {notif.sender.fullName || notif.sender.phone}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-4xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                      selectedNotification.isRead ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    )}>
                      {selectedNotification.isRead ? (t.notifications?.read || "O'qilgan") : (t.notifications?.unread || "O'qilmagan")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {format(new Date(selectedNotification.createdAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <button onClick={() => setSelectedNotification(null)} className="p-3 rounded-2xl bg-slate-100 dark:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-6">
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.sender && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  From: {selectedNotification.sender.fullName || selectedNotification.sender.phone}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TEMPLATES TAB ── */}
      {tab === 'templates' && (
        <div className="space-y-6">
          {/* Info banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-blue-700 dark:text-blue-300">Avtomatik xabarnomalar</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                Qarz eslatmalari har kuni soat 09:00 da, aksiya xabarlari 10:00 da avtomatik yuboriladi.
                <br />
                <code className="text-[10px] bg-blue-100 dark:bg-blue-900/50 px-1 rounded">{'{debt}'}</code> va <code className="text-[10px] bg-blue-100 dark:bg-blue-900/50 px-1 rounded">{'{productName}'}</code> o'zgaruvchilar qo'llab-quvvatlanadi.
              </p>
            </div>
          </div>

          {loadingTemplates ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
            </div>
          ) : templates.length === 0 ? (
            <div className="glass-card p-16 text-center space-y-4">
              <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Templatelar yo'q</p>
              <button onClick={seedDefaultTemplates} className="premium-button mx-auto">
                <Plus className="w-4 h-4" /> Default templatelarni qo'shish
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((tpl) => {
                const typeInfo = TEMPLATE_TYPES.find(t => t.value === tpl.type);
                return (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 flex items-start gap-5"
                  >
                    <div className="text-2xl">{typeInfo?.icon ?? '📢'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{tpl.name}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                            {typeInfo?.label ?? tpl.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleTemplate(tpl)}
                            className={clsx('text-sm transition-colors', tpl.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-slate-600')}
                            title={tpl.isActive ? "O'chirish" : 'Yoqish'}
                          >
                            {tpl.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                          </button>
                          <button
                            onClick={() => openEditTemplate(tpl)}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 hover:text-rose-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {Object.entries(tpl.message).filter(([, v]) => v).slice(0, 2).map(([lang, msg]) => (
                          <p key={lang} className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            <span className="font-black text-[9px] uppercase tracking-widest text-slate-400 mr-2">{lang.toUpperCase()}</span>
                            {String(msg)}
                          </p>
                        ))}
                      </div>
                      <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-2">
                        {format(new Date(tpl.createdAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── LOGS TAB ── */}
      {tab === 'logs' && (
        <div className="glass-card overflow-hidden">
          {loadingLogs ? (
            <div className="p-10 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Yuborilgan xabarnomalar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {logs.map(log => (
                <div key={log.id} className="px-6 py-4 flex items-center gap-4">
                  {log.status === 'sent'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{log.message}</p>
                    {log.dealer && (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{log.dealer.name}</p>
                    )}
                  </div>
                  <span className={clsx(
                    'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0',
                    log.status === 'sent' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  )}>
                    {log.status}
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold shrink-0">
                    {format(new Date(log.createdAt), 'dd MMM HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SEND NOTIFICATION MODAL ── */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setShowSendModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <Send className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Xabar yuborish</h3>
                </div>
                <button onClick={() => setShowSendModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSend} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sarlavha *</label>
                  <input
                    value={sendForm.title}
                    onChange={e => setSendForm(f => ({...f, title: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Xabar sarlavhasi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Matn *</label>
                  <textarea
                    value={sendForm.message}
                    onChange={e => setSendForm(f => ({...f, message: e.target.value}))}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                    placeholder="Xabar matni..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tur</label>
                    <select
                      value={sendForm.type}
                      onChange={e => setSendForm(f => ({...f, type: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    >
                      <option value="INFO">Info</option>
                      <option value="ALERT">Alert</option>
                      <option value="PAYMENT">Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kimga</label>
                    <select
                      value={sendForm.receiverDealerId}
                      onChange={e => setSendForm(f => ({...f, receiverDealerId: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    >
                      <option value="">Barcha foydalanuvchilar</option>
                      {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSendModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    {t.common.cancel}
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 premium-button justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {saving ? 'Yuborilmoqda...' : 'Yuborish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TEMPLATE CREATE/EDIT MODAL ── */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setShowTemplateModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {editingTemplate ? 'Template tahrirlash' : 'Yangi template'}
                  </h3>
                </div>
                <button onClick={() => setShowTemplateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nom *</label>
                  <input
                    value={templateForm.name}
                    onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Template nomi"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tur *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATE_TYPES.map(tt => (
                      <button
                        key={tt.value}
                        type="button"
                        onClick={() => setTemplateForm(f => ({ ...f, type: tt.value }))}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-black transition-all',
                          templateForm.type === tt.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        <span>{tt.icon}</span> {tt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-language message tabs */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Xabar matni</label>
                  <div className="flex gap-1 mb-3">
                    {LANGS.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                          activeLang === lang
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  {LANGS.map(lang => (
                    <div key={lang} className={lang === activeLang ? 'block' : 'hidden'}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{LANG_LABELS[lang]}</p>
                      <textarea
                        value={templateForm.message[lang] ?? ''}
                        onChange={e => setTemplateForm(f => ({ ...f, message: { ...f.message, [lang]: e.target.value } }))}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                        placeholder={`${LANG_LABELS[lang]} matn...`}
                      />
                    </div>
                  ))}
                  <p className="text-[9px] text-slate-400 mt-2">
                    O'zgaruvchilar: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{debt}'}</code> — qarz miqdori, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{productName}'}</code> — mahsulot nomi
                  </p>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">Faol</p>
                    <p className="text-[10px] text-slate-400">Yoqilganda avtomatik yuboriladi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTemplateForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={clsx('transition-colors', templateForm.isActive ? 'text-emerald-500' : 'text-slate-400')}
                  >
                    {templateForm.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate}
                    className="flex-1 premium-button justify-center"
                  >
                    {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {savingTemplate ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
