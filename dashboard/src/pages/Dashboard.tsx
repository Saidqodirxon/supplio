import { ArrowUpRight, DollarSign, ShoppingCart, Users, Activity, TrendingUp, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Dealer } from '../types';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { TableSkeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

interface AnalyticsStats {
  revenue: number;
  profit: number;
  activeDealers: number;
  debt: number;
  collected: number;
  products: number;
  periodOrders: number;
  periodRevenue: number;
}

interface RecentOrder {
  id: string;
  totalAmount: number;
  createdAt: string;
  dealer?: { name: string };
}

export default function Dashboard() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, user } = useAuthStore();
  const t = dashboardTranslations[language];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealersRes, analyticsRes, ordersRes] = await Promise.allSettled([
          api.get<Dealer[]>('/dealers'),
          api.get<{ stats: AnalyticsStats }>('/analytics/dashboard'),
          api.get<{ orders: RecentOrder[] }>('/orders?limit=5'),
        ]);

        if (dealersRes.status === 'fulfilled') setDealers(dealersRes.value.data);
        // Gracefully handle 402 plan limit — analytics may not be available on current plan
        if (analyticsRes.status === 'fulfilled') {
          setStats(analyticsRes.value.data.stats);
        }
        // analyticsRes.status === 'rejected' is OK — we'll use dealer fallback data
        if (ordersRes.status === 'fulfilled') {
          const data = ordersRes.value.data;
          setRecentOrders(Array.isArray(data) ? data.slice(0, 5) : (data.orders || []).slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalOutstanding = stats?.debt ?? dealers.reduce((acc, d) => acc + (d.currentDebt || 0), 0);
  const totalDealers = stats?.activeDealers ?? dealers.length;
  const totalRevenue = stats?.revenue ?? 0;
  const totalProducts = stats?.products ?? 0;
  const periodOrders = stats?.periodOrders ?? 0;

  const statCards = [
    {
      name: t.dashboard.revenue,
      value: `${totalRevenue.toLocaleString()} ${t.common.uzs}`,
      icon: DollarSign,
      trend: stats ? `${((stats.profit / Math.max(stats.revenue, 1)) * 100).toFixed(1)}%` : '—',
      trendPositive: true,
    },
    {
      name: t.dashboard.activeDealers,
      value: totalDealers.toString(),
      icon: Users,
      trend: `${totalDealers}`,
      trendPositive: true,
    },
    {
      name: t.orders.title,
      value: `${periodOrders} ${language === 'uz' ? 'ta' : language === 'ru' ? 'шт' : 'pcs'}`,
      icon: ShoppingCart,
      trend: stats ? `${stats.periodRevenue.toLocaleString()} ${t.common.uzs}` : '—',
      trendPositive: true,
    },
    {
      name: t.sidebar.products,
      value: `${totalProducts} ${language === 'uz' ? 'ta' : language === 'ru' ? 'шт' : 'pcs'}`,
      icon: Package,
      trend: '—',
      trendPositive: true,
    },
    {
      name: t.dashboard.balance,
      value: `${totalOutstanding.toLocaleString()} ${t.common.uzs}`,
      icon: TrendingUp,
      trend: stats ? `${((stats.collected / Math.max(stats.revenue, 1)) * 100).toFixed(0)}%` : '—',
      trendPositive: (stats?.collected ?? 0) >= (stats?.debt ?? 0),
    },
  ];

  const topDebtors = [...dealers]
    .sort((a, b) => (b.currentDebt || 0) - (a.currentDebt || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse p-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-[2rem]" />)}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-900/50">
            <Activity className="w-3 h-3" /> {t.dashboard.title}
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none flex items-center gap-4">
            {t.dashboard.title}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
              {user?.roleType || 'ROOT'}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {t.dashboard.subtitle} • {user?.phone}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')} className="premium-button">
            <ShoppingCart className="w-4 h-4" />
            {t.common.newOrder}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {statCards.map((item) => (
          <motion.div
            key={item.name}
            whileHover={{ y: -5 }}
            className="glass-card p-8 group cursor-default"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-blue-600 group-hover:premium-gradient group-hover:text-white transition-all duration-500 shadow-sm">
                <item.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${item.trendPositive
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50'
                : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/50'
              }`}>
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {item.trend}
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.name}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 glass-card overflow-hidden">
          <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.dashboard.criticalDebtors}</h3>
            <button onClick={() => navigate('/dealers')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">{t.common.viewMore}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-900/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.dealerName}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.branch}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.balance}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.riskLevel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {topDebtors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.common.noData}</td>
                  </tr>
                ) : topDebtors.map((debtor) => (
                  <tr key={debtor.id} onClick={() => navigate('/dealers')} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {debtor.name.charAt(0)}
                        </div>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{debtor.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{debtor.branch?.name || t.branches.mainPoint}</td>
                    <td className="px-10 py-6 text-sm font-black text-slate-900 dark:text-white">
                      {(debtor.currentDebt || 0).toLocaleString()} <span className="text-[10px] text-slate-400 ml-1">{t.common.uzs}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase ${(debtor.currentDebt || 0) > debtor.creditLimit
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${(debtor.currentDebt || 0) > debtor.creditLimit ? 'bg-rose-600 animate-pulse shadow-lg shadow-rose-500/50' : 'bg-emerald-500'}`} />
                        {(debtor.currentDebt || 0) > debtor.creditLimit ? t.dashboard.overLimit : t.dashboard.healthy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 premium-gradient opacity-10 dark:opacity-20 w-full h-1/2 blur-[80px]" />
            <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 relative z-10">{t.dashboard.subscription}</p>
            <h4 className="text-2xl font-black mb-6 tracking-tighter relative z-10 leading-tight text-slate-900 dark:text-white">{t.dashboard.upgradePlanDesc}</h4>
            <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full mb-8 relative z-10">
              <div className="premium-gradient h-2 rounded-full w-[73%] shadow-lg shadow-blue-500/50" />
            </div>
            <button className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all relative z-10 shadow-xl border-none">
              {t.dashboard.upgradePlan}
            </button>
          </div>

          <div className="glass-card p-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              {t.dashboard.recentActivity}
            </h4>
            <div className="space-y-6">
              {recentOrders.length === 0 ? (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4">{t.common.noData}</p>
              ) : recentOrders.map((order) => (
                <div key={order.id} className="flex gap-4 group cursor-default">
                  <div className="w-2 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 transition-colors shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-200 tracking-tight uppercase truncate">
                      {order.dealer?.name || t.dashboard.dealerName} — {order.totalAmount.toLocaleString()} {t.common.uzs}
                    </p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
