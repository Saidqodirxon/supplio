import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import {
  Crown,
  CheckCircle,
  Clock,
  Lock,
  Users,
  Building2,
  Bot,
  Zap,
  ExternalLink,
  RefreshCw,
  Package,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import UpgradeModal from '../components/UpgradeModal';
import { usePlanLimits } from '../hooks/usePlanLimits';

interface TariffPlan {
  id: string;
  planKey: string;
  order: number;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  nameTr?: string;
  price: string;
  priceMonthly: string;
  priceYearly: string;
  featuresEn: string[];
  featuresUz: string[];
  featuresRu: string[];
  featuresTr?: string[];
  isPopular: boolean;
  isActive: boolean;
  maxBranches: number;
  maxUsers: number;
  maxCustomBots: number;
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

interface SubscriptionInfo {
  plan: string;
  status: string;
  trialExpiresAt: string;
  isTrialExpired: boolean;
  daysLeft: number | null;
  history: Array<{
    plan: string;
    status: string;
    amount: number;
    expiresAt: string;
    createdAt: string;
  }>;
}

interface UsageStats {
  dealers: number;
  branches: number;
  bots: number;
  products: number;
  users: number;
}

const PLAN_GRADIENTS: Record<string, string> = {
  FREE: 'from-slate-400 to-slate-600',
  START: 'from-blue-400 to-blue-700',
  PRO: 'from-indigo-500 to-purple-700',
  PREMIUM: 'from-amber-400 to-orange-600',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'text-slate-500',
  START: 'text-blue-500',
  PRO: 'text-indigo-500',
  PREMIUM: 'text-amber-500',
};

const PLAN_ORDER = ['FREE', 'START', 'PRO', 'PREMIUM'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: ReactElement }> = {
  TRIAL: { label: 'Trial Active', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50', icon: <Clock className="w-4 h-4" /> },
  ACTIVE: { label: 'Active', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50', icon: <CheckCircle className="w-4 h-4" /> },
  PAST_DUE: { label: 'Past Due', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50', icon: <Clock className="w-4 h-4" /> },
  CANCELED: { label: 'Canceled', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700', icon: <Lock className="w-4 h-4" /> },
  LOCKED: { label: 'Locked', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/50', icon: <Lock className="w-4 h-4" /> },
};

function normalizeLimit(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatLimitValue(value: unknown, language: string): string {
  const limit = normalizeLimit(value);
  if (limit >= 99999) {
    return language === 'tr' ? 'Sinirsiz' : language === 'ru' ? 'Без лимита' : language === 'en' ? 'Unlimited' : 'Cheksiz';
  }
  return limit.toLocaleString();
}

function getPlanGradient(planKey: string): string {
  return PLAN_GRADIENTS[planKey] || 'from-slate-400 to-slate-600';
}

function getPlanColor(planKey: string): string {
  return PLAN_COLORS[planKey] || 'text-slate-500';
}

function getPlanFeatures(plan: TariffPlan, language: string): string[] {
  const raw =
    language === 'uz' || language === 'oz'
      ? plan.featuresUz || plan.featuresEn || []
      : language === 'ru'
        ? plan.featuresRu || plan.featuresEn || []
        : language === 'tr'
          ? plan.featuresTr || plan.featuresEn || []
          : plan.featuresEn || [];

  return raw.filter((item) => typeof item === 'string' && item.trim().length > 0);
}

function getBotLimitLabel(limit: unknown, language: string): string {
  const safeLimit = normalizeLimit(limit);
  if (safeLimit <= 0) return language === 'tr' ? 'Bot yoq' : language === 'ru' ? 'Нет ботов' : language === 'en' ? 'No bots' : 'Bot yo\'q';
  if (safeLimit >= 99999) return language === 'tr' ? 'Sinirsiz bot' : language === 'ru' ? 'Безлимит ботов' : language === 'en' ? 'Unlimited bots' : 'Cheksiz bot';
  if (language === 'uz' || language === 'oz') return `${safeLimit} ta bot`;
  return `${safeLimit} bot`;
}

function getSubscriptionCopy(language: string) {
  if (language === 'ru') {
    return {
      current: 'Текущий',
      popular: 'Популярный',
      included: 'В вашем тарифе',
      lowerPlan: 'План ниже текущего',
      upgradeAction: 'Повысить тариф',
      supportAction: 'Связаться с админом',
      renewAction: 'Повысить тариф',
      perMonth: '/мес',
      exceedsLimit: 'Лимит тарифа превышен. Для продолжения работы повысьте тариф.',
    };
  }
  if (language === 'tr') {
    return {
      current: 'Mevcut',
      popular: 'Populer',
      included: 'Planinizda mavjud',
      lowerPlan: 'Mevcut plandan past',
      upgradeAction: 'Tarifni oshirish',
      supportAction: 'Admin bilan boglanish',
      renewAction: 'Tarifni oshirish',
      perMonth: '/oy',
      exceedsLimit: 'Tarif limiti oshib ketgan. Davom etish uchun tarifni oshiring.',
    };
  }
  if (language === 'en') {
    return {
      current: 'Current',
      popular: 'Popular',
      included: 'Included',
      lowerPlan: 'Lower plan',
      upgradeAction: 'Upgrade Tariff',
      supportAction: 'Contact Admin',
      renewAction: 'Upgrade Tariff',
      perMonth: '/mo',
      exceedsLimit: 'Your tariff limit has been exceeded. Upgrade your tariff to continue.',
    };
  }
  return {
    current: 'Joriy',
    popular: 'Ommabop',
    included: 'Tarifingizda mavjud',
    lowerPlan: 'Hozirgi tarifdan past',
    upgradeAction: 'Tarifni oshirish',
    supportAction: 'Admin bilan bog\'lanish',
    renewAction: 'Tarifni oshirish',
    perMonth: '/oy',
    exceedsLimit: 'Tarif limitingiz oshib ketgan. Davom etish uchun tarifni oshiring.',
  };
}

function getDisplayName(plan: TariffPlan, language: string): string {
  if (language === 'uz' || language === 'oz') return plan.nameUz;
  if (language === 'ru') return plan.nameRu;
  if (language === 'tr') return plan.nameTr || plan.nameEn;
  return plan.nameEn;
}

export default function Subscription() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [tariffs, setTariffs] = useState<TariffPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useAuthStore();
  const { showUpgrade, setShowUpgrade, upgradeReason, triggerUpgrade } = usePlanLimits();
  const t = dashboardTranslations[language];
  const copy = getSubscriptionCopy(language);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, dealRes, brRes, botRes, prodRes, userRes, tariffRes] = await Promise.allSettled([
          api.get<SubscriptionInfo>('/company/subscription'),
          api.get('/dealers'),
          api.get('/branches'),
          api.get('/telegram/bots'),
          api.get('/products?limit=1'),
          api.get('/company/users'),
          api.get('/public/tariffs'),
        ]);

        if (subRes.status === 'fulfilled') setInfo(subRes.value.data);

        setUsage({
          dealers: dealRes.status === 'fulfilled' && Array.isArray(dealRes.value.data) ? dealRes.value.data.length : 0,
          branches: brRes.status === 'fulfilled' && Array.isArray(brRes.value.data) ? brRes.value.data.length : 0,
          bots: botRes.status === 'fulfilled' && Array.isArray(botRes.value.data) ? botRes.value.data.length : 0,
          products: prodRes.status === 'fulfilled' ? (prodRes.value.data?.total ?? 0) : 0,
          users: userRes.status === 'fulfilled' && Array.isArray(userRes.value.data) ? userRes.value.data.length : 0,
        });

        if (tariffRes.status === 'fulfilled' && Array.isArray(tariffRes.value.data)) {
          const normalized = tariffRes.value.data
            .map((plan) => ({
              ...plan,
              maxBranches: normalizeLimit(plan.maxBranches),
              maxUsers: normalizeLimit(plan.maxUsers),
              maxCustomBots: normalizeLimit(plan.maxCustomBots),
              maxDealers: normalizeLimit(plan.maxDealers),
              maxProducts: normalizeLimit(plan.maxProducts),
            }))
            .sort((a, b) => a.order - b.order);
          setTariffs(normalized);
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-[2rem]" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  const plan = info?.plan || 'FREE';
  const statusConfig = STATUS_CONFIG[info?.status || 'TRIAL'] || STATUS_CONFIG.TRIAL;
  const currentTariff = tariffs.find((item) => item.planKey === plan);
  const planGradient = getPlanGradient(plan);

  const usageItems = currentTariff && usage ? [
    {
      icon: <Users className="w-5 h-5" />,
      label: t.subscription?.dealers || 'Dealers',
      current: usage.dealers,
      limit: currentTariff.maxDealers,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: t.subscription?.branches || 'Branches',
      current: usage.branches,
      limit: currentTariff.maxBranches,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      icon: <Bot className="w-5 h-5" />,
      label: t.subscription?.bots || 'Telegram Bots',
      current: usage.bots,
      limit: currentTariff.maxCustomBots,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      unlimited: currentTariff.maxCustomBots >= 99999,
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: t.subscription?.products || 'Products',
      current: usage.products,
      limit: currentTariff.maxProducts,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: t.subscription?.users || 'Users',
      current: usage.users,
      limit: currentTariff.maxUsers,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
    },
  ] : [];

  const isOverAnyLimit = currentTariff && usage
    ? [
        usage.dealers > currentTariff.maxDealers,
        usage.branches > currentTariff.maxBranches,
        usage.bots > currentTariff.maxCustomBots,
        usage.products > currentTariff.maxProducts,
        usage.users > currentTariff.maxUsers,
      ].some(Boolean)
    : false;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-100 dark:border-amber-900/50">
          <Crown className="w-3 h-3" /> {t.subscription?.title || 'Subscription'}
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          {t.subscription?.title || 'Subscription'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
          {t.subscription?.subtitle || ''}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx("relative overflow-hidden rounded-[2rem] p-10 text-white shadow-2xl", `bg-gradient-to-br ${planGradient}`)}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6 text-white/80" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">{t.subscription?.currentPlan || 'Current Plan'}</p>
              </div>
              <h3 className="text-5xl font-black tracking-tighter">{plan}</h3>
              {currentTariff && (
                <p className="text-white/70 text-sm font-bold mt-1">
                  {getDisplayName(currentTariff, language)}
                </p>
              )}
              <div className="flex items-center gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white/20 text-white border-white/30">
                  {statusConfig.icon}
                  {info?.status || 'TRIAL'}
                </span>
                {info?.daysLeft !== null && info?.daysLeft !== undefined && (
                  <span className="text-xs font-black text-white/70">
                    {info.daysLeft} {t.subscription?.daysLeft || 'days left'}
                  </span>
                )}
              </div>
              {currentTariff && (
                <div className="flex gap-4 mt-4 flex-wrap">
                  {currentTariff.allowAnalytics && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Analytics
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-white/70 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> {getBotLimitLabel(currentTariff.maxCustomBots, language)}
                  </span>
                  {currentTariff.allowWebStore && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Web Store
                    </span>
                  )}
                  {currentTariff.allowBulkImport && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Bulk Import
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {currentTariff && (
                <div className="text-right mb-2">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                    {t.subscription?.monthlyPrice || 'Monthly'}
                  </p>
                  <p className="text-3xl font-black">
                    {Number(currentTariff.priceMonthly).toLocaleString()}
                    <span className="text-sm font-bold text-white/60 ml-1">{t.common?.uzs || 'UZS'}{copy.perMonth}</span>
                  </p>
                </div>
              )}
              <button
                onClick={() => triggerUpgrade()}
                className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {copy.renewAction}
              </button>
              <button className="px-8 py-3 bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {copy.supportAction}
              </button>
            </div>
          </div>

          {info?.trialExpiresAt && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-xs font-black text-white/60 uppercase tracking-widest">
                {t.subscription?.trialExpires || 'Trial Expires'}: {new Date(info.trialExpiresAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {isOverAnyLimit && (
            <div className="mt-4 rounded-2xl bg-amber-400/15 border border-amber-200/30 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-amber-50">
                {copy.exceedsLimit}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {currentTariff && usage && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {usageItems.map((stat) => {
            const isUnlimited = (stat as { unlimited?: boolean }).unlimited === true;
            const safeLimit = isUnlimited ? stat.limit : Math.max(stat.limit, 0);
            const pct = !isUnlimited && safeLimit > 0 ? Math.min((stat.current / safeLimit) * 100, 100) : 0;
            return (
              <div key={stat.label} className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", stat.color)}>
                    {stat.icon}
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.current}</span>
                  <span className="text-xs font-bold text-slate-400">
                    / {isUnlimited ? (t.subscription?.unlimited || '∞') : formatLimitValue(stat.limit, language)}
                  </span>
                </div>
                {!isUnlimited && (
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={clsx("h-1.5 rounded-full transition-all duration-700", pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tariffs.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.subscription?.features || 'Plan Features'}</h3>
          </div>

          <div className={clsx(
            "grid divide-x divide-slate-100 dark:divide-slate-800",
            tariffs.length === 4 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" :
            tariffs.length === 3 ? "grid-cols-1 md:grid-cols-3" :
            "grid-cols-1 md:grid-cols-2"
          )}>
            {tariffs.map((tariff) => {
              const isCurrent = tariff.planKey === plan;
              const isUpgrade = PLAN_ORDER.indexOf(tariff.planKey) > PLAN_ORDER.indexOf(plan);
              const features = getPlanFeatures(tariff, language);
              const gradient = getPlanGradient(tariff.planKey);
              const color = getPlanColor(tariff.planKey);

              return (
                <div key={tariff.id} className={clsx("p-6 space-y-4", isCurrent && "bg-blue-50/50 dark:bg-blue-900/10")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={clsx("text-sm font-black uppercase tracking-widest", color)}>{tariff.planKey}</span>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{getDisplayName(tariff, language)}</p>
                    </div>
                    {isCurrent && <span className="text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded-lg">{copy.current}</span>}
                    {tariff.isPopular && !isCurrent && <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-lg">{copy.popular}</span>}
                  </div>

                  <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {Number(tariff.priceMonthly).toLocaleString()}
                      <span className="text-xs font-bold text-slate-400 ml-1">{t.common?.uzs || 'UZS'}{copy.perMonth}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Users className="w-3 h-3" />
                      <span>{formatLimitValue(tariff.maxDealers, language)} dealers · {formatLimitValue(tariff.maxBranches, language)} branches</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Package className="w-3 h-3" />
                      <span>{formatLimitValue(tariff.maxProducts, language)} products · {formatLimitValue(tariff.maxUsers, language)} users</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Bot className="w-3 h-3" />
                      <span>{getBotLimitLabel(tariff.maxCustomBots, language)}</span>
                    </div>
                    {(tariff.allowAnalytics || tariff.allowCustomBot || tariff.allowWebStore || tariff.allowBulkImport || tariff.allowNotifications) && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tariff.allowAnalytics && <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded"><ShieldCheck className="w-2.5 h-2.5" /> Analytics</span>}
                        {tariff.allowCustomBot && <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded"><Bot className="w-2.5 h-2.5" /> {getBotLimitLabel(tariff.maxCustomBots, language)}</span>}
                        {tariff.allowWebStore && <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded"><ExternalLink className="w-2.5 h-2.5" /> Web Store</span>}
                        {tariff.allowBulkImport && <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded"><Zap className="w-2.5 h-2.5" /> Bulk Import</span>}
                      </div>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {copy.included}
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => triggerUpgrade()}
                      className={clsx("w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gradient-to-r text-white active:scale-95", gradient)}
                    >
                      <Zap className="w-3 h-3 inline mr-1" />
                      {copy.upgradeAction}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {copy.lowerPlan}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {info?.history && info.history.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.subscription?.history || 'Payment History'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-900/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {info.history.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-4 text-sm font-black text-slate-700 dark:text-slate-300">{item.plan}</td>
                    <td className="px-8 py-4">
                      <span className={clsx("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", STATUS_CONFIG[item.status]?.color || '')}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm font-black text-slate-900 dark:text-white">{item.amount.toLocaleString()} {t.common?.uzs || 'UZS'}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{new Date(item.expiresAt).toLocaleDateString()}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
        currentPlan={info?.plan}
        language={language}
      />
    </div>
  );
}
