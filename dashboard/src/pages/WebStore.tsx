import { useState, useEffect, useCallback } from 'react';
import {
  Store, Globe, Copy, Check, ExternalLink, Instagram,
  Send, Link2, ToggleLeft, ToggleRight, Loader2, Save,
  ShoppingCart, Package, TrendingUp, QrCode, Download, Bot, Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { toast } from '../utils/toast';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  instagram?: string;
  telegram?: string;
  siteActive: boolean;
  subscriptionPlan: string;
  workingHours?: string;
  adminLogBotToken?: string;
}

interface StoreStats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

interface WebStoreData {
  website?: string;
  instagram?: string;
  telegram?: string;
  workingHours?: string;
  adminLogBotToken?: string;
}

export default function WebStorePage() {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<StoreStats>({ totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<WebStoreData>({ website: '', instagram: '', telegram: '', workingHours: '', adminLogBotToken: '' });

  const storeUrl = company ? `${window.location.origin}/store/${company.slug}` : '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [compRes, ordersRes, productsRes] = await Promise.all([
        api.get('/company/me'),
        api.get('/orders?limit=1000'),
        api.get('/products?limit=1&page=1'),
      ]);
      const c: Company = compRes.data;
      setCompany(c);
      setForm({
        website: c.website || '',
        instagram: c.instagram || '',
        telegram: c.telegram || '',
        workingHours: c.workingHours || '',
        adminLogBotToken: c.adminLogBotToken || ''
      });

      const orders = ordersRes.data?.items || [];
      const storeOrders = orders.filter((o: { source?: string; channel?: string }) => o.source === 'STORE' || o.channel === 'STORE');
      const revenue = storeOrders.reduce((s: number, o: { totalAmount?: number | string }) => s + (Number(o.totalAmount) || 0), 0);
      setStats({
        totalOrders: storeOrders.length,
        totalProducts: productsRes.data?.total || 0,
        totalRevenue: revenue,
      });
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  }, [t.common.error]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleStore = async () => {
    if (!company) return;
    try {
      const res = await api.patch('/company/me', { siteActive: !company.siteActive });
      setCompany(res.data);
      toast.success(res.data.siteActive ? 'Do\'kon yoqildi' : 'Do\'kon o\'chirildi');
    } catch {
      toast.error(t.common.error);
    }
  };

  const saveLinks = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/company/me', form);
      setCompany(res.data);
      toast.success(t.common.save);
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(storeUrl)}&margin=20`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company?.slug || 'store'}-qr.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(language === 'uz' ? 'QR Kod yuklab olindi' : 'QR Code downloaded');
    } catch {
      toast.error(t.common.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) return null;

  const statCards = [
    { label: t.sidebar.orders, value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-600/10' },
    { label: t.sidebar.products, value: stats.totalProducts, icon: Package, color: 'text-emerald-600 bg-emerald-600/10' },
    { label: 'Revenue', value: `${stats.totalRevenue.toLocaleString()} UZS`, icon: TrendingUp, color: 'text-violet-600 bg-violet-600/10' },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <Store className="w-10 h-10 text-blue-600" />
            {t.sidebar.webStore}
          </h1>
          <p className="text-slate-500 font-bold tracking-tight">
            {language === 'uz' ? 'Onlayn katalog va mijozlar uchun buyurtma sahifasi'
              : language === 'ru' ? 'Онлайн-каталог и страница заказов для клиентов'
              : language === 'tr' ? 'Çevrimiçi katalog ve müşteriler için sipariş sayfası'
              : 'Online catalog and order page for your customers'}
          </p>
        </div>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-700"
        >
          <ExternalLink className="w-4 h-4" />
          {language === 'uz' ? 'Do\'konni ochish' : language === 'ru' ? 'Открыть магазин' : language === 'tr' ? 'Mağazayı Aç' : 'Open Store'}
        </a>
      </motion.div>

      {/* Status card + URL */}
      <motion.div {...fadeInUp} transition={{ delay: 0.05 }} className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 dark:text-white text-lg">
              {language === 'uz' ? 'Do\'kon holati' : language === 'ru' ? 'Статус магазина' : language === 'tr' ? 'Mağaza Durumu' : 'Store Status'}
            </h3>
            <p className="text-sm font-bold text-slate-400">
              {company.siteActive
                ? (language === 'uz' ? 'Do\'koningiz faol — mijozlar buyurtma bera oladi' : language === 'ru' ? 'Магазин активен — клиенты могут делать заказы' : language === 'tr' ? 'Mağaza aktif — müşteriler sipariş verebilir' : 'Store is live — customers can place orders')
                : (language === 'uz' ? 'Do\'kon o\'chirilgan — hech kim kira olmaydi' : language === 'ru' ? 'Магазин отключён — доступ закрыт' : language === 'tr' ? 'Mağaza kapalı — erişim yok' : 'Store is disabled — no one can access it')}
            </p>
          </div>
          <button
            onClick={toggleStore}
            className={clsx(
              'flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all active:scale-95',
              company.siteActive
                ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 hover:bg-emerald-600 hover:text-white'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-600'
            )}
          >
            {company.siteActive
              ? <><ToggleRight className="w-5 h-5" /> {language === 'uz' ? 'Faol' : language === 'ru' ? 'Активен' : language === 'tr' ? 'Aktif' : 'Active'}</>
              : <><ToggleLeft className="w-5 h-5" /> {language === 'uz' ? 'O\'chirilgan' : language === 'ru' ? 'Отключён' : language === 'tr' ? 'Kapalı' : 'Disabled'}</>}
          </button>
        </div>

        {/* Store URL */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            {language === 'uz' ? 'Do\'kon manzili' : language === 'ru' ? 'Адрес магазина' : language === 'tr' ? 'Mağaza Adresi' : 'Store URL'}
          </p>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-5 py-4">
            <Globe className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="flex-1 font-mono text-sm text-slate-700 dark:text-slate-300 truncate">{storeUrl}</span>
            <button onClick={copyUrl} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shrink-0" title={language === 'uz' ? "Nusxa olish" : "Copy"}>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
            <button onClick={downloadQR} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shrink-0" title={language === 'uz' ? "QR kodni yuklab olish" : "Download QR Code"}>
              <Download className="w-4 h-4 text-blue-600" />
            </button>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shrink-0" title={language === 'uz' ? "Ochish" : "Open"}>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* QR hint */}
        <div className="flex items-center gap-3 p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
          <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
            {language === 'uz' ? 'Ushbu manzilni dilerlaringizga yuboring yoki QR kod chiqarib bering.'
              : language === 'ru' ? 'Отправьте этот адрес своим дилерам или распечатайте QR-код.'
              : language === 'tr' ? 'Bu adresi bayilerinize gönderin veya QR kodu yazdırın.'
              : 'Share this URL with your dealers or print it as a QR code.'}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 p-7 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Links & Contacts */}
      <motion.div {...fadeInUp} transition={{ delay: 0.15 }} className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 space-y-6">
        <h3 className="font-black text-slate-900 dark:text-white text-lg">
          {language === 'uz' ? 'Aloqa va Havolalar' : language === 'ru' ? 'Контакты и Ссылки' : language === 'tr' ? 'İletişim ve Bağlantılar' : 'Contacts & Links'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { key: 'website', label: language === 'uz' ? 'Vebsayt' : language === 'ru' ? 'Сайт' : language === 'tr' ? 'Web Sitesi' : 'Website', icon: Link2, placeholder: 'https://yoursite.com' },
            { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@yourhandle' },
            { key: 'telegram', label: 'Telegram', icon: Send, placeholder: '@yourbotortelegram' },
            { key: 'workingHours', label: language === 'uz' ? 'Ish vaqti' : language === 'ru' ? 'Рабочее время' : language === 'tr' ? 'Çalışma Saatleri' : 'Working Hours', icon: Clock, placeholder: '09:00 - 18:00' },
            { key: 'adminLogBotToken', label: language === 'uz' ? 'Loglar uchun Bot Token' : language === 'ru' ? 'Bot Token для логов' : language === 'tr' ? 'Loglar İçin Bot Token' : 'Log Bot Token', icon: Bot, placeholder: '123456:ABC...' },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                <field.icon className="w-3.5 h-3.5" /> {field.label}
              </label>
              <input
                type="text"
                value={form[field.key as keyof WebStoreData] || ''}
                onChange={(e) => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveLinks}
          disabled={saving}
          className="flex items-center gap-3 px-6 py-4 premium-gradient text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t.common.save}
        </button>
      </motion.div>

      {/* Plan notice */}
      {(company.subscriptionPlan === 'FREE' || company.subscriptionPlan === 'START') && (
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-[2rem] p-6 flex items-start gap-4">
          <Store className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-black text-amber-800 dark:text-amber-400 text-sm mb-1">
              {language === 'uz' ? 'Veb do\'kon PRO tarifida to\'liq ochiladi' : language === 'ru' ? 'Полный функционал веб-магазина доступен на тарифе PRO' : language === 'tr' ? 'Web mağazanın tam özelliği PRO planında açılır' : 'Full Web Store features unlock on PRO plan'}
            </p>
            <p className="text-amber-700 dark:text-amber-500 text-xs font-bold">
              {language === 'uz' ? 'Hozirgi rejada asosiy funksiyalar mavjud. Obunangizni yangilang.' : language === 'ru' ? 'На текущем тарифе доступны базовые функции. Обновите подписку.' : language === 'tr' ? 'Mevcut planda temel özellikler mevcut. Aboneliğinizi güncelleyin.' : 'Basic features available on current plan. Upgrade your subscription.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
