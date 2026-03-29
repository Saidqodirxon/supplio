import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign,
  AlertTriangle, CheckCircle, BarChart3, Loader2, RefreshCw,
  Award, CreditCard
} from 'lucide-react';
import api from '../services/api';
import { toast } from '../utils/toast';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

interface DebtDealer {
  id: string;
  name: string;
  phone: string;
  currentDebt: number;
  creditLimit: number;
  utilizationPercent: number;
  orders: Array<{ id: string; totalAmount: number; createdAt: string; status: string }>;
}

interface DebtReport {
  dealers: DebtDealer[];
  totalDebt: number;
  totalCreditLimit: number;
  overLimitCount: number;
}

interface DashStats {
  totalOrders: number;
  totalRevenue: number;
  totalDealers: number;
  totalProducts: number;
  recentOrders?: Array<{ id: string; dealer: { name: string }; totalAmount: number; status: string; createdAt: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-600 bg-amber-500/10',
  ACCEPTED: 'text-blue-600 bg-blue-500/10',
  PREPARING: 'text-indigo-600 bg-indigo-500/10',
  SHIPPED: 'text-purple-600 bg-purple-500/10',
  DELIVERED: 'text-emerald-600 bg-emerald-500/10',
  COMPLETED: 'text-emerald-700 bg-emerald-500/15',
  CANCELLED: 'text-rose-600 bg-rose-500/10',
};

export default function Reports() {
  const { language } = useAuthStore();
  const [tab, setTab] = useState<'overview' | 'debts' | 'top'>('overview');
  const [debtReport, setDebtReport] = useState<DebtReport | null>(null);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [topDealers, setTopDealers] = useState<Array<{ name: string; phone: string; totalAmount: number; orderCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  const isUz = ['uz', 'oz'].includes(language);
  const isRu = language === 'ru';
  const labels = {
    title: isUz ? 'Hisobotlar' : isRu ? 'Отчёты' : 'Reports',
    overview: isUz ? 'Umumiy' : isRu ? 'Обзор' : 'Overview',
    debts: isUz ? 'Qarzlar' : isRu ? 'Долги' : 'Debts',
    top: isUz ? 'Top Dilerlar' : isRu ? 'Топ Дилеры' : 'Top Dealers',
    totalDebt: isUz ? 'Umumiy qarz' : isRu ? 'Общий долг' : 'Total Debt',
    totalLimit: isUz ? 'Umumiy limit' : isRu ? 'Общий лимит' : 'Total Credit Limit',
    overLimit: isUz ? 'Limitdan oshgan' : isRu ? 'Превысили лимит' : 'Over Limit',
    noDebt: isUz ? 'Qarzlar yo\'q' : isRu ? 'Долгов нет' : 'No debts',
    dealer: isUz ? 'Diler' : isRu ? 'Дилер' : 'Dealer',
    debt: isUz ? 'Qarz' : isRu ? 'Долг' : 'Debt',
    limit: isUz ? 'Limit' : isRu ? 'Лимит' : 'Limit',
    utilization: isUz ? 'Foydalanish' : isRu ? 'Использование' : 'Utilization',
    orders: isUz ? 'Buyurtmalar' : isRu ? 'Заказы' : 'Orders',
    revenue: isUz ? 'Daromad' : isRu ? 'Выручка' : 'Revenue',
    dealers: isUz ? 'Dilerlar' : isRu ? 'Дилеры' : 'Dealers',
    products: isUz ? 'Mahsulotlar' : isRu ? 'Товары' : 'Products',
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [debtRes, statsRes, topRes] = await Promise.allSettled([
        api.get('/analytics/debts'),
        api.get('/analytics/dashboard'),
        api.get('/analytics/top-dealers'),
      ]);
      if (debtRes.status === 'fulfilled') setDebtReport(debtRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (topRes.status === 'fulfilled') setTopDealers(topRes.value.data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const fmt = (n: number) => n?.toLocaleString() + ' so\'m';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{labels.title}</h1>
        </div>
        <button
          onClick={loadAll}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-1">
        {(['overview', 'debts', 'top'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-5 py-2.5 text-sm font-black rounded-xl transition-all',
              tab === t
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            )}
          >
            {t === 'overview' ? labels.overview : t === 'debts' ? labels.debts : labels.top}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === 'overview' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: labels.orders, value: stats.totalOrders?.toLocaleString(), icon: ShoppingCart, color: 'text-blue-600 bg-blue-500/10' },
                  { label: labels.revenue, value: fmt(stats.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-600 bg-emerald-500/10' },
                  { label: labels.dealers, value: stats.totalDealers?.toLocaleString(), icon: Users, color: 'text-indigo-600 bg-indigo-500/10' },
                  { label: labels.products, value: stats.totalProducts?.toLocaleString(), icon: BarChart3, color: 'text-amber-600 bg-amber-500/10' },
                ].map(item => (
                  <div key={item.label} className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6">
                    <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center mb-4', item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              {stats.recentOrders && stats.recentOrders.length > 0 && (
                <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-white/10">
                    <h3 className="font-black text-slate-900 dark:text-white">{isUz ? 'So\'nggi buyurtmalar' : isRu ? 'Последние заказы' : 'Recent Orders'}</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {stats.recentOrders.slice(0, 10).map(order => (
                      <div key={order.id} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{order.dealer?.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={clsx('text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg', STATUS_COLORS[order.status] || 'text-slate-400 bg-slate-500/10')}>
                            {order.status}
                          </span>
                          <span className="font-black text-slate-900 dark:text-white text-sm">{order.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Debts Tab */}
          {tab === 'debts' && (
            <div className="space-y-6">
              {debtReport && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: labels.totalDebt, value: fmt(debtReport.totalDebt), icon: TrendingDown, color: 'text-rose-600 bg-rose-500/10' },
                      { label: labels.totalLimit, value: fmt(debtReport.totalCreditLimit), icon: CreditCard, color: 'text-blue-600 bg-blue-500/10' },
                      { label: labels.overLimit, value: String(debtReport.overLimitCount), icon: AlertTriangle, color: 'text-amber-600 bg-amber-500/10' },
                    ].map(item => (
                      <div key={item.label} className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6">
                        <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center mb-4', item.color)}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {debtReport.dealers.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center py-16 gap-3">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                      <p className="font-black text-slate-700 dark:text-slate-300">{labels.noDebt}</p>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {debtReport.dealers.map(dealer => (
                          <div key={dealer.id} className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <p className="font-black text-slate-900 dark:text-white">{dealer.name}</p>
                                <p className="text-sm text-slate-400">{dealer.phone}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-rose-600 dark:text-rose-400">{fmt(dealer.currentDebt)}</p>
                                <p className="text-xs text-slate-400">{labels.limit}: {fmt(dealer.creditLimit)}</p>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={clsx(
                                  'h-full rounded-full transition-all',
                                  dealer.utilizationPercent >= 100 ? 'bg-rose-500' :
                                  dealer.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.min(dealer.utilizationPercent, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{dealer.utilizationPercent.toFixed(1)}% {labels.utilization}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Top Dealers Tab */}
          {tab === 'top' && (
            <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
              {topDealers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Award className="w-10 h-10 text-slate-300" />
                  <p className="font-black text-slate-500">{isUz ? 'Ma\'lumot yo\'q' : isRu ? 'Нет данных' : 'No data'}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {topDealers.map((dealer, i) => (
                    <div key={dealer.name} className="flex items-center gap-4 px-6 py-4">
                      <span className={clsx(
                        'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0',
                        i === 0 ? 'bg-amber-500 text-white' :
                        i === 1 ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white' :
                        i === 2 ? 'bg-orange-400 text-white' :
                        'bg-slate-100 dark:bg-white/10 text-slate-500'
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 dark:text-white truncate">{dealer.name}</p>
                        <p className="text-xs text-slate-400">{dealer.phone} · {dealer.orderCount} {labels.orders}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-slate-900 dark:text-white text-sm">{fmt(dealer.totalAmount)}</p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
