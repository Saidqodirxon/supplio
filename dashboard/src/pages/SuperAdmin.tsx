import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Database,
  Bell,
  Monitor,
  Server,
  AlertTriangle,
  RotateCcw,
  Lock,
  Table,
  Activity,
  Calendar,
  Loader2,
  Trash2,
  ChevronRight,
  Send,
  Save,
  Globe,
  User,
  Info,
  FileCode,
  Layout,
  CreditCard,
  Check,
  X,
  Edit,
  BarChart3,
  UserPlus,
  Newspaper,
  Plus,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { useScrollLock } from '../utils/useScrollLock';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { uz, ru, enUS, tr } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { formatPhoneNumber, unformatPhoneNumber } from '../utils/formatters';
import ImageUploader from '../components/ImageUploader';

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

type TabId = 'overview' | 'settings' | 'backups' | 'activities' | 'editor' | 'news' | 'leads' | 'tariffs' | 'cms' | 'distributors' | 'notify';

const validTabs: TabId[] = ['overview', 'settings', 'backups', 'activities', 'editor', 'news', 'leads', 'tariffs', 'cms', 'distributors', 'notify'];

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  info?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface NewsItem {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  titleTr?: string;
  titleUzCyr?: string;
  excerptUz?: string;
  excerptRu?: string;
  excerptEn?: string;
  excerptTr?: string;
  excerptUzCyr?: string;
  contentUz: string;
  contentRu: string;
  contentEn: string;
  contentTr?: string;
  contentUzCyr?: string;
  slugUz: string;
  slugRu: string;
  slugEn: string;
  slugTr?: string;
  slugUzCyr?: string;
  image?: string;
  isPublished: boolean;
  createdAt: string;
}

interface TariffPlan {
  id: string;
  planKey: string;
  order: number;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  nameTr?: string;
  nameUzCyr?: string;
  price: string;
  priceMonthly: string;
  priceYearly: string;
  isActive: boolean;
  isPopular: boolean;
  featuresUz: string[];
  featuresRu: string[];
  featuresEn: string[];
  featuresTr?: string[];
  featuresUzCyr?: string[];
  maxBranches: number;
  maxUsers: number;
  maxDealers: number;
  maxProducts: number;
  allowCustomBot: boolean;
  allowWebStore: boolean;
  allowAnalytics: boolean;
  allowNotifications: boolean;
  allowMultiCompany: boolean;
  allowBulkImport: boolean;
  trialDays: number;
}

interface GlobalSettings {
  telegram?: string;
  defaultTrialDays?: number;
  maintenanceMode?: boolean;
}

interface LandingContent {
  heroTitleUz: string; heroTitleRu: string; heroTitleEn: string; heroTitleTr: string;
  heroSubtitleUz: string; heroSubtitleRu: string; heroSubtitleEn: string; heroSubtitleTr: string;
  heroBadgeUz: string; heroBadgeRu: string; heroBadgeEn: string; heroBadgeTr: string;
  contactPhone: string; contactEmail: string;
  socialTelegram: string; socialLinkedin: string; socialTwitter: string;
  footerDescUz: string; footerDescRu: string; footerDescEn: string; footerDescTr: string;
}

interface BackupItem {
  name: string;
  size: number;
  createdAt: string;
}

interface Distributor {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialExpiresAt: string;
  createdAt: string;
  users: { id: string; phone: string; fullName?: string; isActive: boolean }[];
  _count: { dealers: number; orders: number; users: number };
}

interface DistributorForm {
  companyName: string;
  slug: string;
  phone: string;
  fullName: string;
  password: string;
  subscriptionPlan: string;
  trialDays: number;
}

const emptyDistForm: DistributorForm = {
  companyName: '', slug: '', phone: '', fullName: '', password: '', subscriptionPlan: 'FREE', trialDays: 14,
};

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  companyId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { phone: string };
  company?: { name: string };
}

interface ServerMetric {
  cpuUsage: number;
  ramUsage: number;
  activeUsers: number;
  timestamp: string;
}

const locales: Record<string, Locale> = { uz, ru, en: enUS, tr };

export default function SuperAdmin() {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: TabId = (tabParam && validTabs.includes(tabParam as TabId)) ? tabParam as TabId : 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const [authorized, setAuthorized] = useState(false);
  const [rootPass, setRootPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [tariffs, setTariffs] = useState<TariffPlan[]>([]);
  const [landingContent, setLandingContent] = useState<LandingContent>({
    heroTitleUz: '', heroTitleRu: '', heroTitleEn: '', heroTitleTr: '',
    heroSubtitleUz: '', heroSubtitleRu: '', heroSubtitleEn: '', heroSubtitleTr: '',
    heroBadgeUz: '', heroBadgeRu: '', heroBadgeEn: '', heroBadgeTr: '',
    contactPhone: '', contactEmail: '',
    socialTelegram: '', socialLinkedin: '', socialTwitter: '',
    footerDescUz: '', footerDescRu: '', footerDescEn: '', footerDescTr: '',
  });
  const [cmsLoading, setCmsLoading] = useState(false);

  const [editorData, setEditorData] = useState({
    model: 'Company',
    id: '',
    field: '',
    value: ''
  });

  const [metrics, setMetrics] = useState<ServerMetric[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Modals handle
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | Lead | TariffPlan | null>(null);

  const [newsLangTab, setNewsLangTab] = useState<'Uz' | 'En' | 'Ru' | 'Tr' | 'UzCyr'>('Uz');

  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    titleUz: '', titleRu: '', titleEn: '', titleTr: '', titleUzCyr: '',
    excerptUz: '', excerptRu: '', excerptEn: '', excerptTr: '', excerptUzCyr: '',
    contentUz: '', contentRu: '', contentEn: '', contentTr: '', contentUzCyr: '',
    image: '', isPublished: true, slugUz: '', slugRu: '', slugEn: '', slugTr: '', slugUzCyr: ''
  });

  const [tariffForm, setTariffForm] = useState<Partial<TariffPlan>>({
    planKey: '', nameUz: '', nameRu: '', nameEn: '', nameTr: '', nameUzCyr: '',
    price: '', priceMonthly: '0', priceYearly: '0',
    featuresUz: [], featuresRu: [], featuresEn: [], featuresTr: [], featuresUzCyr: [],
    isActive: true, isPopular: false, order: 0,
    maxBranches: 1, maxUsers: 5, maxDealers: 100, maxProducts: 500, trialDays: 14,
    allowCustomBot: false, allowWebStore: true, allowAnalytics: false,
    allowNotifications: true, allowMultiCompany: false, allowBulkImport: false,
  });

  const [leadForm, setLeadForm] = useState<Partial<Lead>>({
    fullName: '', phone: '', info: '', status: 'NEW'
  });

  // Distributors tab
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [distSearch, setDistSearch] = useState('');
  const [distStatusFilter, setDistStatusFilter] = useState('');
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [distForm, setDistForm] = useState<DistributorForm>(emptyDistForm);
  const [distSaving, setDistSaving] = useState(false);

  // Notify distributors tab
  const [notifyForm, setNotifyForm] = useState({ title: '', message: '', type: 'INFO' });
  const [notifyAll, setNotifyAll] = useState(true);
  const [selectedDistIds, setSelectedDistIds] = useState<string[]>([]);
  const [notifySending, setNotifySending] = useState(false);

  // Scroll lock — must be after all modal state declarations
  useScrollLock(isNewsModalOpen || isTariffModalOpen || isLeadModalOpen || isDistModalOpen || isConfirmModalOpen);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'news') {
        const res = await api.get('/super/news');
        setNews(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } else if (activeTab === 'leads') {
        const res = await api.get('/super/leads');
        setLeads(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } else if (activeTab === 'settings') {
        const res = await api.get('/super/settings');
        setSettings(res.data);
      } else if (activeTab === 'backups') {
        const res = await api.get('/super/backups');
        setBackups(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } else if (activeTab === 'activities') {
        const res = await api.get('/super/audit-logs');
        setActivities(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } else if (activeTab === 'tariffs') {
        const res = await api.get('/super/tariffs');
        setTariffs(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } else if (activeTab === 'overview') {
        const res = await api.get('/super/metrics');
        setMetrics(res.data);
      } else if (activeTab === 'cms') {
        const res = await api.get('/super/landing');
        if (res.data) setLandingContent(res.data);
      } else if (activeTab === 'distributors' || activeTab === 'notify') {
        const res = await api.get('/super/distributors');
        setDistributors(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ma\'lumotlarni yuklashda xatolik';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const { user } = useAuthStore();

  useEffect(() => {
    // Phase 4 Correction: If user is authenticated as SUPER_ADMIN, bypass the initial root lock
    if (user?.roleType === 'SUPER_ADMIN') {
      setAuthorized(true);
    }
  }, [user]);

  useEffect(() => {
    if (authorized) fetchData();
  }, [activeTab, authorized, fetchData]);

  const handleAuth = () => {
    if (rootPass === "9911") {
      setAuthorized(true);
      toast.success(t.superadmin.confirm);
    } else {
      toast.error(t.superadmin.passwordLabel);
    }
  };

  const requestConfirmation = (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmPassword === "9911") {
      if (pendingAction) await pendingAction();
      setIsConfirmModalOpen(false);
      setConfirmPassword('');
      setPendingAction(null);
    } else {
      toast.error(t.superadmin.passwordLabel);
    }
  };

  const handleManualReset = async () => {
    requestConfirmation(async () => {
      try {
        setLoading(true);
        await api.post('/demo/reset');
        toast.success(t.superadmin.demoReset);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.common.error;
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    });
  };

  const TAB_DESC: Record<TabId, string> = {
    overview: t.superadmin.systemStatus,
    news: t.superadmin.newsManagement,
    leads: t.superadmin.publicLeads,
    tariffs: t.superadmin.tariffs,
    activities: t.superadmin.auditLogsTitle,
    backups: t.superadmin.backups,
    settings: t.superadmin.globalConfig,
    editor: t.superadmin.editor,
    cms: t.superadmin.landingCmsTitle,
    distributors: t.superadmin.distributors,
    notify: t.superadmin.notifyTab,
  };

  const menuItems: { id: TabId; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'overview', label: t.superadmin.overview, icon: ShieldCheck, color: 'text-blue-600' },
    { id: 'distributors', label: t.superadmin.distributors, icon: User, color: 'text-violet-600' },
    { id: 'notify', label: t.superadmin.notifyTab, icon: Bell, color: 'text-orange-600' },
    { id: 'news', label: t.superadmin.news, icon: Newspaper, color: 'text-indigo-600' },
    { id: 'leads', label: t.superadmin.leads, icon: UserPlus, color: 'text-emerald-600' },
    { id: 'tariffs', label: t.superadmin.tariffs, icon: CreditCard, color: 'text-cyan-600' },
    { id: 'activities', label: t.superadmin.recentLogs, icon: Activity, color: 'text-rose-600' },
    { id: 'backups', label: t.superadmin.backups, icon: Database, color: 'text-amber-600' },
    { id: 'settings', label: t.superadmin.settings, icon: Globe, color: 'text-slate-600' },
    { id: 'editor', label: t.superadmin.editor, icon: FileCode, color: 'text-violet-600' },
    { id: 'cms', label: t.superadmin.landingCmsTitle, icon: Layout, color: 'text-teal-600' },
  ];

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-8 border border-blue-600/20">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tight">{t.superadmin.securityPrompt}</h1>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-bold">{t.superadmin.superAdminOnly}</p>

        <div className="w-full max-w-xs space-y-4">
          <input
            type="password"
            placeholder={t.superadmin.passwordLabel}
            value={rootPass}
            onChange={(e) => setRootPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 focus:border-blue-600 transition-all text-center text-xl font-black tracking-[1em]"
          />
          <button
            onClick={handleAuth}
            className="w-full py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            {t.superadmin.confirm}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            {t.superadmin.systemControl}
          </h1>
          <p className="text-slate-500 font-bold tracking-tight">{t.superadmin.systemControlDesc}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleManualReset}
            className="px-6 py-3 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> {t.superadmin.demoReset}
          </button>
          <button className="px-6 py-3 premium-gradient text-white rounded-2xl flex items-center gap-3 font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <Send className="w-4 h-4" /> {t.superadmin.globalNotifyBtn}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setSearchParams({ tab: item.id }); }}
            className={clsx(
              "px-5 py-4 rounded-2xl font-black text-sm flex flex-col items-start gap-1 transition-all shrink-0 active:scale-95 min-w-[100px]",
              activeTab === item.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl"
                : "bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10"
            )}
          >
            <item.icon className={clsx("w-4 h-4", activeTab === item.id ? "" : item.color)} />
            <span className="leading-none">{item.label}</span>
            <span className={clsx("text-[10px] font-bold leading-none uppercase tracking-wide", activeTab === item.id ? "opacity-60" : "text-slate-400")}>
              {TAB_DESC[item.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...fadeInUp} className="min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.superadmin.activeBadge}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{t.superadmin.livePerformance}</h3>
                  <p className="text-3xl font-black tracking-tighter">842 req/sec</p>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                    <Server className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.superadmin.systemStatus}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{t.superadmin.serverMetrics}</h3>
                  <p className="text-3xl font-black tracking-tighter">14d 6h 22m</p>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black">{t.superadmin.livePerformance || 'Live Performance'}</h3>
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="h-64 flex items-end justify-between gap-4">
                  {(metrics.slice(0, 10).reverse()).map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-blue-600/10 rounded-t-xl relative flex flex-col justify-end overflow-hidden" style={{ height: '200px' }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${m.cpuUsage}%` }} className="w-full bg-blue-600 rounded-t-xl group-hover:bg-blue-500 transition-colors" />
                        <motion.div initial={{ height: 0 }} animate={{ height: `${m.ramUsage}%` }} className="w-full bg-indigo-600/40 absolute bottom-0" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{format(new Date(m.timestamp), 'HH:mm')}</span>
                    </div>
                  ))}
                  {metrics.length === 0 && <div className="w-full text-center py-20 text-slate-400 font-bold">{t.superadmin.noDataMsg}</div>}
                </div>
              </div>

              <div
                onClick={async () => {
                  try {
                    setLoading(true);
                    await api.post('/super/fix-users');
                    toast.success(t.superadmin.photoFixed);
                  } catch {
                    toast.error(t.common.error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 cursor-pointer hover:border-blue-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.superadmin.maintenanceModeLabel}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{t.superadmin.fixPhotosBtn}</h3>
                  <p className="text-2xl font-black tracking-tighter">{t.superadmin.fixPhotosBtn}</p>
                </div>
              </div>

              <div
                onClick={async () => {
                  try {
                    setLoading(true);
                    await api.post('/super/tariffs/seed');
                    toast.success(t.superadmin.seedDone);
                  } catch {
                    toast.error(t.common.error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 cursor-pointer hover:border-cyan-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.superadmin.tariffs}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{t.superadmin.tariffs}</h3>
                  <p className="text-2xl font-black tracking-tighter">{t.superadmin.seedTariffsBtn}</p>
                </div>
              </div>

              <div
                onClick={async () => {
                  try {
                    setLoading(true);
                    await api.post('/super/units/seed');
                    toast.success(t.superadmin.seedDone);
                  } catch {
                    toast.error(t.common.error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 cursor-pointer hover:border-violet-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-violet-500 bg-violet-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">Seed</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{t.superadmin.seedUnitsBtn}</h3>
                  <p className="text-2xl font-black tracking-tighter">{t.superadmin.seedUnitsBtn}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">{t.superadmin.auditLogsTitle}</h2>
                <button onClick={fetchData} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 transition-all"><RotateCcw className="w-5 h-5" /></button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.actionCol}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.userCol}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.companyCol}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.dateCol}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.detailsCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((log: ActivityLog) => (
                      <tr key={log.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Info className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black">{log.action}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.entityType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold">{log.user?.phone || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold">{log.company?.name || '-'}</td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-500 italic">
                          {format(new Date(log.createdAt), 'dd.MM HH:mm', { locale: locales[language] || uz })}
                        </td>
                        <td className="px-8 py-6">
                          <button className="p-3 bg-slate-100 dark:bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden">
              <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tight uppercase tracking-[0.1em]">{t.superadmin.publicLeads}</h2>
                <button
                  onClick={() => { setEditingItem(null); setLeadForm({ fullName: '', phone: '', info: '', status: 'NEW' }); setIsLeadModalOpen(true); }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                  {t.superadmin.newLeadBtn}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.userCol}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.phone}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.progressCol}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.dateCol}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.superadmin.actionsCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead: Lead) => (
                      <tr key={lead.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black italic border-2 border-emerald-600/20">
                              {lead.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black tracking-tight">{lead.fullName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{lead.info || t.superadmin.noDetails}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-sm font-black text-slate-700 dark:text-slate-300">{lead.phone}</td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <span className={clsx(
                              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                              lead.status === 'NEW' ? "bg-blue-600/10 text-blue-600" : "bg-emerald-600/10 text-emerald-600"
                            )}>
                              {lead.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-xs font-bold text-slate-400 italic">
                          {format(new Date(lead.createdAt), 'dd MMM yyyy', { locale: locales[language] || uz })}
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingItem(lead); setLeadForm({ fullName: lead.fullName, phone: lead.phone, info: lead.info || '', status: lead.status }); setIsLeadModalOpen(true); }}
                              className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm(t.superadmin.confirmDeleteLead)) return;
                                try { await api.delete(`/super/leads/${lead.id}`); toast.success(t.superadmin.deleted); fetchData(); } catch { toast.error(t.superadmin.failedToDelete); }
                              }}
                              className="p-3 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div onClick={() => toast.success(t.superadmin.backupStarted)} className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-500 transition-all group flex flex-col items-center justify-center text-center cursor-pointer gap-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">{t.superadmin.newBackupBtn}</h3>
                <p className="text-xs text-slate-500 font-bold max-w-[200px]">{t.superadmin.backupsDesc}</p>
              </div>
              {backups.map((b) => (
                <div key={b.name} className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black truncate max-w-[150px]">{b.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(b.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl active:scale-95 transition-all">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tariffs' && (
            <div className="space-y-8">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setTariffForm({
                      planKey: '', nameUz: '', nameRu: '', nameEn: '', nameTr: '', nameUzCyr: '',
                      price: '', priceMonthly: '0', priceYearly: '0',
                      featuresUz: [], featuresRu: [], featuresEn: [], featuresTr: [], featuresUzCyr: [],
                      isActive: true, isPopular: false, order: 0,
                      maxBranches: 1, maxUsers: 5, maxDealers: 100, maxProducts: 500, trialDays: 14,
                      allowCustomBot: false, allowWebStore: true, allowAnalytics: false,
                      allowNotifications: true, allowMultiCompany: false, allowBulkImport: false,
                    });
                    setIsTariffModalOpen(true);
                  }}
                  className="px-8 py-4 premium-gradient text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" /> {t.superadmin.newTariffBtn}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tariffs.map((plan: TariffPlan) => (
                  <div key={plan.id} className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-8 group hover:shadow-2xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="flex gap-2">
                        {plan.isPopular && <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.superadmin.popularBadge}</span>}
                        <span className={clsx("text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest", plan.isActive ? "text-emerald-500 bg-emerald-500/10" : "text-slate-400 bg-slate-400/10")}>{plan.isActive ? t.superadmin.activeBadge : t.superadmin.hiddenBadge}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{plan.planKey}</p>
                      <h3 className="text-2xl font-black tracking-tight">
                        {((plan as unknown) as Record<string, string>)[`name${language.charAt(0).toUpperCase() + language.slice(1)}`] || plan.nameUz}
                      </h3>
                      <p className="text-3xl font-black tracking-tighter mt-2">{Number(plan.priceMonthly).toLocaleString()} <span className="text-sm text-slate-400 ml-1">{t.subscription.monthlyPrice}</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                      <span>{t.superadmin.maxBranches}: <b className="text-slate-700 dark:text-slate-300">{plan.maxBranches}</b></span>
                      <span>{t.superadmin.maxUsers}: <b className="text-slate-700 dark:text-slate-300">{plan.maxUsers}</b></span>
                      <span>{t.superadmin.maxDealers}: <b className="text-slate-700 dark:text-slate-300">{plan.maxDealers}</b></span>
                      <span>{t.superadmin.maxProducts}: <b className="text-slate-700 dark:text-slate-300">{plan.maxProducts}</b></span>
                      <span>{t.superadmin.trialDays2}: <b className="text-slate-700 dark:text-slate-300">{plan.trialDays}d</b></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.allowAnalytics && <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-[9px] font-black uppercase">{t.superadmin.featureFlags}</span>}
                      {plan.allowCustomBot && <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[9px] font-black uppercase">Bot</span>}
                      {plan.allowWebStore && <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[9px] font-black uppercase">Store</span>}
                      {plan.allowBulkImport && <span className="px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 text-[9px] font-black uppercase">Bulk Import</span>}
                      {plan.allowMultiCompany && <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[9px] font-black uppercase">Multi-Co</span>}
                    </div>
                    <div className="space-y-3">
                      {((((plan as unknown) as Record<string, string[]>)[`features${language.charAt(0).toUpperCase() + language.slice(1)}`] || plan.featuresUz) as string[]).slice(0, 3).map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                          <Check className="w-4 h-4 text-cyan-600" /> {f}
                        </div>
                      ))}
                      {((((plan as unknown) as Record<string, string[]>)[`features${language.charAt(0).toUpperCase() + language.slice(1)}`] || plan.featuresUz) as string[]).length > 3 && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          +{((((plan as unknown) as Record<string, string[]>)[`features${language.charAt(0).toUpperCase() + language.slice(1)}`] || plan.featuresUz) as string[]).length - 3} yana...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => { setEditingItem(plan); setTariffForm({ ...plan }); setIsTariffModalOpen(true); }}
                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        {t.superadmin.editBtn}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(t.superadmin.confirmDeleteTariff)) return;
                          try { await api.delete(`/super/tariffs/${plan.id}`); toast.success(t.superadmin.deleted); fetchData(); } catch { toast.error(t.superadmin.failedToDelete); }
                        }}
                        className="p-4 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{t.superadmin.systemNewsTitle}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.superadmin.allTenantNews}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingItem(null); setNewsForm({ titleUz: '', titleRu: '', excerptUz: '', excerptRu: '', contentUz: '', contentRu: '', image: '', isPublished: true }); setIsNewsModalOpen(true); }}
                  className="px-8 py-3 premium-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  {t.superadmin.addNewsBtn}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {news.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden group hover:shadow-2xl transition-all">
                    <div className="h-56 bg-slate-900 relative overflow-hidden">
                      <img src={item.image || '/logo.png'} className="w-full h-full object-cover opacity-50 absolute inset-0" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      <div className="absolute top-6 left-6 flex gap-2">
                        <span className={clsx("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest", item.isPublished ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                          {item.isPublished ? t.superadmin.published : t.superadmin.draft}
                        </span>
                      </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" /> {format(new Date(item.createdAt), 'dd MMMM, yyyy', { locale: locales[language] || uz })}
                        </div>
                        <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                          {((item as unknown) as Record<string, string>)[`title${language.charAt(0).toUpperCase() + language.slice(1)}`] || item.titleUz}
                        </h3>
                        <p className="text-slate-500 font-bold line-clamp-2 text-sm leading-relaxed">
                          {((item as unknown) as Record<string, string>)[`excerpt${language.charAt(0).toUpperCase() + language.slice(1)}`] || item.excerptUz}
                        </p>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={() => { setEditingItem(item); setNewsForm({ ...item } as NewsItem); setIsNewsModalOpen(true); }}
                          className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                        >
                          {t.superadmin.editBtn}
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(t.superadmin.confirmDeleteNews)) return;
                            try { await api.delete(`/super/news/${item.id}`); toast.success(t.superadmin.deleted); fetchData(); } catch { toast.error(t.superadmin.failedToDelete); }
                          }}
                          className="p-4 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 p-12 space-y-12">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><ShieldCheck className="w-3 h-3 text-blue-600" /> {t.superadmin.maintenanceModeLabel}</label>
                  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 group">
                    <div>
                      <p className="text-sm font-black">{t.superadmin.freezeSystem}</p>
                      <p className="text-xs text-slate-500 font-bold">{t.superadmin.onlyAdminAccess}</p>
                    </div>
                    <button
                      onClick={() => setSettings(s => s ? ({ ...s, maintenanceMode: !s.maintenanceMode }) : null)}
                      className={clsx(
                        "w-16 h-8 rounded-full relative transition-all duration-300",
                        settings?.maintenanceMode ? "bg-rose-600" : "bg-slate-200 dark:bg-white/10"
                      )}
                    >
                      <div className={clsx("absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all", settings?.maintenanceMode ? "right-1" : "left-1")} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><Calendar className="w-3 h-3 text-emerald-600" /> {t.superadmin.trialPeriod}</label>
                  <input
                    type="number"
                    value={settings?.defaultTrialDays || 14}
                    onChange={(e) => setSettings(s => s ? ({ ...s, defaultTrialDays: +e.target.value }) : null)}
                    className="w-full px-8 py-5 bg-white dark:bg-white/5 rounded-3xl border-2 border-slate-100 dark:border-white/10 text-xl font-black focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><Bell className="w-3 h-3 text-blue-600" /> {t.superadmin.globalNotifBanner}</label>
                  <div className="grid grid-cols-1 gap-6">
                    {['Uz', 'Ru', 'En', 'Tr', 'UzCyr'].map(l => (
                      <div key={l} className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-500 uppercase px-2">{l}</label>
                        <input
                          type="text"
                          value={(settings ? (settings as unknown as Record<string, string>)[`globalNotify${l}`] : '') || ''}
                          onChange={(e) => setSettings(s => s ? ({ ...s, [`globalNotify${l}`]: e.target.value }) : null)}
                          placeholder={`${l} notification text...`}
                          className="w-full px-6 py-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><Bell className="w-3 h-3 text-indigo-600" /> {t.superadmin.systemSupportTelegram}</label>
                  <input
                    type="text"
                    value={settings?.telegram || '@supplio_admin'}
                    onChange={(e) => setSettings(s => s ? ({ ...s, telegram: e.target.value }) : null)}
                    className="w-full px-8 py-5 bg-white dark:bg-white/5 rounded-3xl border-2 border-slate-100 dark:border-white/10 text-xl font-black focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await api.patch('/super/settings', settings);
                    toast.success(t.superadmin.saveSettingsSuccess);
                  } catch { toast.error(t.common.error); }
                  finally { setLoading(false); }
                }}
                className="w-full py-5 premium-gradient text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 active:scale-95 transition-all"
              >
                <Save className="w-5 h-5" /> {t.superadmin.saveSettings}
              </button>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-white dark:bg-white/5 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/10 space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                    <Table className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black">Yadro Muharriri</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Kengaytma</label>
                    <select
                      value={editorData.model}
                      onChange={(e) => setEditorData({ ...editorData, model: e.target.value })}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-black text-sm"
                    >
                      <option value="Company">Kompaniya</option>
                      <option value="Dealer">Diler</option>
                      <option value="User">Foydalanuvchi</option>
                      <option value="Order">Buyurtma</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px) font-black text-slate-400 uppercase tracking-widest px-2">Unique Identifier (ID)</label>
                    <input
                      type="text"
                      value={editorData.id}
                      onChange={(e) => setEditorData({ ...editorData, id: e.target.value })}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-mono text-sm leading-none"
                      placeholder="00000000-0000-0000..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Field</label>
                      <input
                        type="text"
                        value={editorData.field}
                        onChange={(e) => setEditorData({ ...editorData, field: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-black text-sm"
                        placeholder="name"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">New Value</label>
                      <input
                        type="text"
                        value={editorData.value}
                        onChange={(e) => setEditorData({ ...editorData, value: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-black text-sm"
                        placeholder="ABC Corp"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!editorData.id || !editorData.field) return toast.error('Ma\'lumotlarni kiriting');
                    try {
                      setLoading(true);
                      await api.post('/super/patch-data', editorData);
                      toast.success('Ma\'lumotlar muvaffaqiyatli o\'zgartirildi');
                      setEditorData({ ...editorData, id: '', field: '', value: '' });
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : 'O\'zgartirishda xatolik';
                      toast.error(msg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-violet-600/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  <Table className="w-5 h-5" /> Execute Update
                </button>
              </div>
              <div className="bg-rose-600/10 border-2 border-rose-600/20 p-8 rounded-[2.5rem] flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/20">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-1">Xavf: To'g'ridan-to'g'ri tahrir</h3>
                  <p className="text-xs text-rose-500/80 font-bold leading-relaxed">Ushbu vosita yordamida bazadagi ma'lumotlarni validatsiyasiz o'zgartirish mumkin. Ehtiyot bo'ling!</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'distributors' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">
                      {language === 'uz' ? 'Distribyutorlar' : language === 'ru' ? 'Дистрибьюторы' : 'Distributors'}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {distributors.length} {language === 'uz' ? 'ta kompaniya' : language === 'ru' ? 'компаний' : 'companies'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    placeholder={language === 'uz' ? 'Qidirish...' : language === 'ru' ? 'Поиск...' : 'Search...'}
                    value={distSearch}
                    onChange={e => setDistSearch(e.target.value)}
                    className="px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none w-52"
                  />
                  <button
                    onClick={() => { setDistForm(emptyDistForm); setIsDistModalOpen(true); }}
                    className="px-6 py-3 premium-gradient text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'uz' ? 'Yangi' : language === 'ru' ? 'Создать' : 'Create'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {distributors
                  .filter(d => !distSearch || d.name.toLowerCase().includes(distSearch.toLowerCase()) || d.slug.includes(distSearch))
                  .map(dist => {
                    const owner = dist.users[0];
                    const expiry = dist.trialExpiresAt ? new Date(dist.trialExpiresAt) : null;
                    const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86400000) : null;
                    const statusColor = dist.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                      dist.subscriptionStatus === 'TRIAL' ? 'bg-blue-50 text-blue-600' :
                      dist.subscriptionStatus === 'LOCKED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500';
                    return (
                      <div key={dist.id} className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center shrink-0 font-black text-lg">
                          {dist.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-black text-slate-900 dark:text-white">{dist.name}</h3>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusColor}`}>
                              {dist.subscriptionPlan} · {dist.subscriptionStatus}
                            </span>
                            {daysLeft !== null && daysLeft <= 7 && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                                {daysLeft}d left
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-400 font-bold">
                            <span>/{dist.slug}</span>
                            {owner && <span>👤 {owner.phone}</span>}
                            <span>🛒 {dist._count.orders} orders</span>
                            <span>👥 {dist._count.dealers} dealers</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => { setNotifyAll(false); setSelectedDistIds([dist.id]); setActiveTab('notify'); setSearchParams({ tab: 'notify' }); }}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              const newStatus = dist.subscriptionStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
                              try {
                                await api.patch(`/super/company/${dist.id}/status`, { status: newStatus });
                                setDistributors(prev => prev.map(d => d.id === dist.id ? { ...d, subscriptionStatus: newStatus } : d));
                                toast.success(`Status updated to ${newStatus}`);
                              } catch { toast.error('Failed to update status'); }
                            }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dist.subscriptionStatus === 'LOCKED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                          >
                            {dist.subscriptionStatus === 'LOCKED' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {distributors.length === 0 && (
                  <div className="text-center py-20 text-slate-400 font-bold">
                    {language === 'uz' ? 'Distribyutorlar topilmadi' : language === 'ru' ? 'Дистрибьюторы не найдены' : 'No distributors found'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notify' && (
            <div className="space-y-8 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">
                    {language === 'uz' ? 'Distribyutorlarga xabarnoma' : language === 'ru' ? 'Уведомить дистрибьюторов' : 'Notify Distributors'}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {language === 'uz' ? 'Barcha yoki tanlangan distribyutorlarga xabar yuboring' : language === 'ru' ? 'Отправить сообщение всем или выбранным' : 'Send to all or selected distributors'}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 space-y-6">
                {/* Target */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {language === 'uz' ? 'Kimga' : language === 'ru' ? 'Кому' : 'Recipients'}
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setNotifyAll(true)}
                      className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${notifyAll ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
                    >
                      {language === 'uz' ? 'Barchaga' : language === 'ru' ? 'Всем' : 'All distributors'}
                    </button>
                    <button
                      onClick={() => setNotifyAll(false)}
                      className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${!notifyAll ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
                    >
                      {language === 'uz' ? 'Tanlangan' : language === 'ru' ? 'Выбранным' : 'Selected'}
                    </button>
                  </div>

                  {!notifyAll && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {distributors.map(d => (
                        <label key={d.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDistIds.includes(d.id)}
                            onChange={e => setSelectedDistIds(prev => e.target.checked ? [...prev, d.id] : prev.filter(id => id !== d.id))}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</span>
                          <span className="text-[10px] text-slate-400">{d.users[0]?.phone}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {language === 'uz' ? 'Turi' : language === 'ru' ? 'Тип' : 'Type'}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'INFO', label: language === 'uz' ? 'Ma\'lumot' : language === 'ru' ? 'Инфо' : 'Info', color: 'bg-blue-50 text-blue-600' },
                      { value: 'WARNING', label: language === 'uz' ? 'Ogohlantirish' : language === 'ru' ? 'Предупреждение' : 'Warning', color: 'bg-amber-50 text-amber-600' },
                      { value: 'PAYMENT_REMINDER', label: language === 'uz' ? 'To\'lov eslatmasi' : language === 'ru' ? 'Напоминание об оплате' : 'Payment reminder', color: 'bg-emerald-50 text-emerald-600' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setNotifyForm(f => ({ ...f, type: opt.value }))}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${notifyForm.type === opt.value ? opt.color + ' ring-2 ring-current/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {language === 'uz' ? 'Sarlavha' : language === 'ru' ? 'Заголовок' : 'Title'}
                  </label>
                  <input
                    value={notifyForm.title}
                    onChange={e => setNotifyForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm outline-none"
                    placeholder={language === 'uz' ? 'Xabar sarlavhasi...' : language === 'ru' ? 'Заголовок сообщения...' : 'Message title...'}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {language === 'uz' ? 'Xabar matni' : language === 'ru' ? 'Текст сообщения' : 'Message body'}
                  </label>
                  <textarea
                    rows={5}
                    value={notifyForm.message}
                    onChange={e => setNotifyForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm outline-none resize-none"
                    placeholder={language === 'uz' ? 'Xabar matni...' : language === 'ru' ? 'Текст сообщения...' : 'Write your message...'}
                  />
                </div>

                <button
                  disabled={notifySending || !notifyForm.title || !notifyForm.message}
                  onClick={async () => {
                    try {
                      setNotifySending(true);
                      const payload: any = {
                        title: notifyForm.title,
                        message: notifyForm.message,
                        type: notifyForm.type,
                      };
                      if (!notifyAll && selectedDistIds.length > 0) {
                        payload.companyIds = selectedDistIds;
                      }
                      const res = await api.post('/super/notify-distributors', payload);
                      toast.success(`${language === 'uz' ? 'Yuborildi' : language === 'ru' ? 'Отправлено' : 'Sent'}: ${res.data?.count ?? 0} ${language === 'uz' ? 'ta foydalanuvchi' : language === 'ru' ? 'пользователей' : 'users'}`);
                      setNotifyForm({ title: '', message: '', type: 'INFO' });
                    } catch {
                      toast.error(language === 'uz' ? 'Yuborishda xatolik' : 'Failed to send');
                    } finally {
                      setNotifySending(false);
                    }
                  }}
                  className="w-full py-4 premium-gradient text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {notifySending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {notifyAll
                    ? (language === 'uz' ? 'Barcha distribyutorlarga yuborish' : language === 'ru' ? 'Отправить всем дистрибьюторам' : 'Send to all distributors')
                    : (language === 'uz' ? `${selectedDistIds.length} ta distribyutorga yuborish` : language === 'ru' ? `Отправить ${selectedDistIds.length} дистрибьюторам` : `Send to ${selectedDistIds.length} distributors`)}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600/10 text-teal-600 flex items-center justify-center">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Landing Page CMS</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dynamic content editor</p>
                  </div>
                </div>
                <button
                  disabled={cmsLoading}
                  onClick={async () => {
                    try {
                      setCmsLoading(true);
                      await api.patch('/super/landing', landingContent);
                      toast.success('Landing content saved');
                    } catch {
                      toast.error('Failed to save');
                    } finally {
                      setCmsLoading(false);
                    }
                  }}
                  className="px-8 py-3 premium-gradient text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {cmsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>

              {/* Hero Section */}
              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['Uz', 'Ru', 'En', 'Tr'] as const).map(lang => (
                    <div key={lang} className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang}</p>
                      <input
                        value={(landingContent as any)[`heroBadge${lang}`] || ''}
                        onChange={e => setLandingContent(p => ({ ...p, [`heroBadge${lang}`]: e.target.value }))}
                        placeholder={`Badge text (${lang})`}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none"
                      />
                      <input
                        value={(landingContent as any)[`heroTitle${lang}`] || ''}
                        onChange={e => setLandingContent(p => ({ ...p, [`heroTitle${lang}`]: e.target.value }))}
                        placeholder={`Hero title (${lang})`}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none"
                      />
                      <textarea
                        rows={2}
                        value={(landingContent as any)[`heroSubtitle${lang}`] || ''}
                        onChange={e => setLandingContent(p => ({ ...p, [`heroSubtitle${lang}`]: e.target.value }))}
                        placeholder={`Hero subtitle (${lang})`}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Description */}
              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest">Footer Description</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['Uz', 'Ru', 'En', 'Tr'] as const).map(lang => (
                    <div key={lang} className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang}</p>
                      <textarea
                        rows={3}
                        value={(landingContent as any)[`footerDesc${lang}`] || ''}
                        onChange={e => setLandingContent(p => ({ ...p, [`footerDesc${lang}`]: e.target.value }))}
                        placeholder={`Footer description (${lang})`}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Social */}
              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest">Contact & Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'contactPhone', label: 'Phone' },
                    { key: 'contactEmail', label: 'Email' },
                    { key: 'socialTelegram', label: 'Telegram URL' },
                    { key: 'socialLinkedin', label: 'LinkedIn URL' },
                    { key: 'socialTwitter', label: 'Twitter URL' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                      <input
                        value={(landingContent as any)[key] || ''}
                        onChange={e => setLandingContent(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={label}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Modal Placeholder Removed */}

      {/* Create Distributor Modal */}
      <AnimatePresence>
        {isDistModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-4xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">
                  {language === 'uz' ? 'Yangi distribyutor' : language === 'ru' ? 'Новый дистрибьютор' : 'Create Distributor'}
                </h2>
                <button onClick={() => setIsDistModalOpen(false)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'companyName', label: language === 'uz' ? 'Kompaniya nomi' : language === 'ru' ? 'Название компании' : 'Company name', type: 'text' },
                  { key: 'slug', label: 'Slug (URL)', type: 'text' },
                  { key: 'phone', label: language === 'uz' ? 'Telefon (login)' : language === 'ru' ? 'Телефон (логин)' : 'Phone (login)', type: 'text' },
                  { key: 'fullName', label: language === 'uz' ? 'To\'liq ism' : language === 'ru' ? 'Полное имя' : 'Full name', type: 'text' },
                  { key: 'password', label: language === 'uz' ? 'Parol' : language === 'ru' ? 'Пароль' : 'Password', type: 'password' },
                  { key: 'trialDays', label: language === 'uz' ? 'Trial kunlar' : language === 'ru' ? 'Дней пробного периода' : 'Trial days', type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                    <input
                      type={type}
                      value={(distForm as any)[key]}
                      onChange={e => setDistForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-500 text-sm font-bold outline-none"
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {language === 'uz' ? 'Tarif rejasi' : language === 'ru' ? 'Тарифный план' : 'Subscription plan'}
                  </label>
                  <select
                    value={distForm.subscriptionPlan}
                    onChange={e => setDistForm(f => ({ ...f, subscriptionPlan: e.target.value }))}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-500 text-sm font-bold outline-none"
                  >
                    {['FREE', 'START', 'PRO', 'PREMIUM'].map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                disabled={distSaving || !distForm.companyName || !distForm.phone || !distForm.password || !distForm.slug}
                onClick={async () => {
                  try {
                    setDistSaving(true);
                    await api.post('/super/distributors', distForm);
                    toast.success(language === 'uz' ? 'Distribyutor yaratildi' : language === 'ru' ? 'Дистрибьютор создан' : 'Distributor created');
                    setIsDistModalOpen(false);
                    setDistForm(emptyDistForm);
                    const res = await api.get('/super/distributors');
                    setDistributors(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message ?? 'Error creating distributor');
                  } finally {
                    setDistSaving(false);
                  }
                }}
                className="w-full py-4 premium-gradient text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              >
                {distSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {language === 'uz' ? 'Yaratish' : language === 'ru' ? 'Создать' : 'Create Distributor'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* News Modal */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[3rem] p-10 shadow-4xl space-y-8 no-scrollbar">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">{editingItem ? 'Edit Article' : 'New Article'}</h2>
                <button onClick={() => setIsNewsModalOpen(false)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"><X className="w-6 h-6" /></button>
              </div>

              {/* Cover image */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cover Image</label>
                <ImageUploader
                  value={newsForm.image}
                  onChange={url => setNewsForm(f => ({ ...f, image: url }))}
                  onRemove={() => setNewsForm(f => ({ ...f, image: '' }))}
                  label="Upload Cover Image"
                  className="h-44"
                />
              </div>

              {/* Publish toggle */}
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <span className="text-sm font-black">Publish immediately</span>
                <button
                  type="button"
                  onClick={() => setNewsForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={clsx('w-14 h-7 rounded-full relative transition-all duration-300', newsForm.isPublished ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10')}
                >
                  <div className={clsx('absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all', newsForm.isPublished ? 'right-0.5' : 'left-0.5')} />
                </button>
              </div>

              {/* Language tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {(['Uz', 'En', 'Ru', 'Tr', 'UzCyr'] as const).map(lk => (
                  <button
                    key={lk}
                    type="button"
                    onClick={() => setNewsLangTab(lk)}
                    className={clsx(
                      'px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shrink-0 transition-all',
                      newsLangTab === lk
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                    )}
                  >
                    {lk === 'UzCyr' ? 'Ўзб' : lk}
                  </button>
                ))}
              </div>

              {/* Language-specific fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Title</label>
                    <input
                      type="text"
                      value={((newsForm as unknown) as Record<string, string>)[`title${newsLangTab}`] || ''}
                      onChange={e => setNewsForm({ ...newsForm, [`title${newsLangTab}`]: e.target.value })}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Slug</label>
                    <input
                      type="text"
                      value={((newsForm as unknown) as Record<string, string>)[`slug${newsLangTab}`] || ''}
                      onChange={e => setNewsForm({ ...newsForm, [`slug${newsLangTab}`]: e.target.value })}
                      placeholder="my-article-slug"
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm font-mono focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Excerpt</label>
                  <textarea
                    rows={2}
                    value={((newsForm as unknown) as Record<string, string>)[`excerpt${newsLangTab}`] || ''}
                    onChange={e => setNewsForm({ ...newsForm, [`excerpt${newsLangTab}`]: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm resize-none focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Content (HTML or markdown)</label>
                  <textarea
                    rows={7}
                    value={((newsForm as unknown) as Record<string, string>)[`content${newsLangTab}`] || ''}
                    onChange={e => setNewsForm({ ...newsForm, [`content${newsLangTab}`]: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm resize-none focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button onClick={() => setIsNewsModalOpen(false)} className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      if (editingItem) await api.patch(`/super/news/${editingItem.id}`, newsForm);
                      else await api.post('/super/news', newsForm);
                      toast.success('Article saved');
                      setIsNewsModalOpen(false);
                      fetchData();
                    } catch { toast.error('Failed to save'); }
                    finally { setLoading(false); }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Save Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tariff Modal */}
      <AnimatePresence>
        {isTariffModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-12 shadow-4xl space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">{editingItem ? 'Tarifni Tahrirlash' : 'Yangi Tarif'}</h2>
                <button onClick={() => setIsTariffModalOpen(false)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto px-2 no-scrollbar">
                {['Uz', 'Ru', 'En', 'Tr', 'UzCyr'].map(langKey => (
                  <div key={langKey} className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5 first:border-0 first:pt-0">
                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{langKey} Translation</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Name ({langKey})</label>
                        <input type="text" value={((tariffForm as unknown) as Record<string, string>)[`name${langKey}`] || ''} onChange={e => setTariffForm({ ...tariffForm, [`name${langKey}`]: e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Features ({langKey}) — bir qatorda bittadan</label>
                        <textarea 
                          rows={3}
                          value={(((tariffForm as unknown) as Record<string, string[]>)[`features${langKey}`] || []).join('\n')} 
                          onChange={e => setTariffForm({ ...tariffForm, [`features${langKey}`]: e.target.value.split('\n').filter(x => x.trim()) })} 
                          className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" 
                          placeholder="Premium Support&#10;Unlimited Dealers&#10;..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing & Plan Key</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Plan Key (FREE/START/PRO/PREMIUM)</label>
                      <input type="text" value={tariffForm.planKey || ''} onChange={e => setTariffForm({ ...tariffForm, planKey: e.target.value.toUpperCase() })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm uppercase" placeholder="FREE" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Order Index</label>
                      <input type="number" value={tariffForm.order} onChange={e => setTariffForm({ ...tariffForm, order: +e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Monthly Price (UZS)</label>
                      <input type="number" value={tariffForm.priceMonthly || 0} onChange={e => setTariffForm({ ...tariffForm, priceMonthly: e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Yearly Price (UZS)</label>
                      <input type="number" value={tariffForm.priceYearly || 0} onChange={e => setTariffForm({ ...tariffForm, priceYearly: e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Trial Days</label>
                      <input type="number" value={tariffForm.trialDays || 14} onChange={e => setTariffForm({ ...tariffForm, trialDays: +e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Price Display String</label>
                      <input type="text" value={tariffForm.price || ''} onChange={e => setTariffForm({ ...tariffForm, price: e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" placeholder="Free / 99,000 UZS" />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'maxBranches', label: 'Max Branches' },
                      { key: 'maxUsers', label: 'Max Users' },
                      { key: 'maxDealers', label: 'Max Dealers' },
                      { key: 'maxProducts', label: 'Max Products' },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>
                        <input type="number" value={(tariffForm as Record<string, number>)[key] ?? 0} onChange={e => setTariffForm({ ...tariffForm, [key]: +e.target.value })} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feature Flags</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'isPopular', label: 'Popular', color: 'accent-blue-600' },
                      { key: 'isActive', label: 'Active', color: 'accent-emerald-600' },
                      { key: 'allowAnalytics', label: 'Analytics', color: 'accent-indigo-600' },
                      { key: 'allowCustomBot', label: 'Custom Bot', color: 'accent-emerald-600' },
                      { key: 'allowWebStore', label: 'Web Store', color: 'accent-blue-600' },
                      { key: 'allowBulkImport', label: 'Bulk Import', color: 'accent-violet-600' },
                      { key: 'allowNotifications', label: 'Notifications', color: 'accent-amber-600' },
                      { key: 'allowMultiCompany', label: 'Multi Company', color: 'accent-rose-600' },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <input type="checkbox" checked={!!(tariffForm as Record<string, boolean>)[key]} onChange={e => setTariffForm({ ...tariffForm, [key]: e.target.checked })} className={`w-5 h-5 ${color}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsTariffModalOpen(false)} className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs">Bekor qilish</button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      if (editingItem) await api.patch(`/super/tariffs/${editingItem.id}`, tariffForm);
                      else await api.post('/super/tariffs', tariffForm);
                      toast.success('Tarif saqlandi');
                      setIsTariffModalOpen(false);
                      fetchData();
                    } catch { toast.error('Xatolik yuz berdi'); }
                    finally { setLoading(false); }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  Saqlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Modal */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-12 shadow-4xl space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">{editingItem ? 'Lidni Tahrirlash' : 'Yangi Lid'}</h2>
                <button onClick={() => setIsLeadModalOpen(false)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Toliq Ism</label>
                  <input type="text" value={leadForm.fullName} onChange={e => setLeadForm({ ...leadForm, fullName: e.target.value })} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Telefon</label>
                  <input type="text" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: formatPhoneNumber(e.target.value) })} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Status</label>
                  <select value={leadForm.status} onChange={e => setLeadForm({ ...leadForm, status: e.target.value })} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black uppercase tracking-widest text-xs">
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsLeadModalOpen(false)} className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs">Bekor qilish</button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const finalForm = { ...leadForm, phone: unformatPhoneNumber(leadForm.phone || '') };
                      if (editingItem) await api.patch(`/super/leads/${editingItem.id}`, finalForm);
                      else await api.post('/super/leads', finalForm);
                      toast.success('Lid saqlandi');
                      setIsLeadModalOpen(false);
                      fetchData();
                    } catch { toast.error('Xatolik yuz berdi'); }
                    finally { setLoading(false); }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  Saqlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 shadow-4xl text-center space-y-8">
              <div className="w-20 h-20 rounded-3xl bg-rose-600/10 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Xavfsizlikni Tasdiqlash</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Ushbu amalni bajarish uchun administrator parolini kiriting</p>
              </div>
              <input
                type="password"
                placeholder="Parol"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmAction()}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-center text-xl font-black tracking-widest focus:border-blue-600 outline-none transition-all"
              />
              <div className="flex gap-4">
                <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Bekor Qilish</button>
                <button onClick={handleConfirmAction} className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">Tasdiqlash</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
