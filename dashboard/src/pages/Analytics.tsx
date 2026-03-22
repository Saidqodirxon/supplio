import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Package,
  CreditCard,
  ShoppingCart,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { motion } from 'framer-motion';
import api from '../services/api';

type Period = '7d' | '30d' | '1y' | 'all';

interface ChartPoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

interface StatusDist {
  status: string;
  count: number;
  amount: number;
}

interface DashboardData {
  stats: {
    revenue: number;
    profit: number;
    activeDealers: number;
    debt: number;
    collected: number;
    products: number;
    periodRevenue: number;
    periodProfit: number;
    periodOrders: number;
  };
  chart: ChartPoint[];
  statusDistribution: StatusDist[];
  period: Period;
}

interface TopDealer {
  id: string;
  name: string;
  totalOrders: number;
  totalAmount: number;
  currentDebt: number;
  creditLimit: number;
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  RETURNED: '#8b5cf6',
};

function fmt(n: number) {
  return n.toLocaleString();
}

function BarChart({ data }: { data: ChartPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data.length) return (
    <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs font-bold uppercase tracking-widest">No data</div>
  );

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const barW = Math.max(8, Math.floor(540 / data.length) - 4);
  const gap = Math.max(2, Math.floor(540 / data.length) - barW);
  const totalW = data.length * (barW + gap);
  const chartH = 220;

  return (
    <div className="relative overflow-x-auto">
      <svg width={Math.max(totalW, 300)} height={chartH + 40} className="min-w-full">
        {data.map((d, i) => {
          const revH = Math.max(2, (d.revenue / maxRevenue) * chartH);
          const profH = Math.max(2, (d.profit / maxRevenue) * chartH);
          const x = i * (barW + gap);
          const isHov = hovered === i;
          const label = d.date.length === 7 ? d.date.slice(2) : d.date.slice(5);
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              {/* revenue bar */}
              <rect x={x} y={chartH - revH} width={barW} height={revH} rx={4}
                fill={isHov ? '#2563eb' : '#93c5fd'} className="transition-all duration-150" />
              {/* profit bar */}
              <rect x={x} y={chartH - profH} width={barW} height={profH} rx={4}
                fill={isHov ? '#059669' : '#6ee7b7'} className="transition-all duration-150" />
              {/* label */}
              <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={9} fontWeight="700"
                fill="currentColor" className="text-slate-400" opacity={0.7}>{label}</text>
              {/* tooltip */}
              {isHov && (
                <g>
                  <rect x={Math.min(x - 10, totalW - 140)} y={chartH - revH - 58} width={130} height={52} rx={8} fill="#1e293b" opacity={0.95} />
                  <text x={Math.min(x - 10, totalW - 140) + 10} y={chartH - revH - 38} fontSize={9} fontWeight="700" fill="#93c5fd">
                    Rev: {fmt(d.revenue)}
                  </text>
                  <text x={Math.min(x - 10, totalW - 140) + 10} y={chartH - revH - 22} fontSize={9} fontWeight="700" fill="#6ee7b7">
                    Profit: {fmt(d.profit)}
                  </text>
                  <text x={Math.min(x - 10, totalW - 140) + 10} y={chartH - revH - 6} fontSize={9} fontWeight="700" fill="#94a3b8">
                    Orders: {d.orders}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {/* legend */}
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" /> Revenue
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="w-3 h-3 rounded-sm bg-emerald-300 inline-block" /> Profit
        </span>
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: StatusDist[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const R = 80;
  const cx = 100, cy = 100;
  let cumulative = 0;

  const slices = data.map((d, _i) => {
    const pct = d.count / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const large = pct > 0.5 ? 1 : 0;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const innerR = 52;
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { ...d, path, pct, color: STATUS_COLORS[d.status] ?? '#94a3b8' };
  });

  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-slate-300 dark:text-slate-700 text-xs font-bold uppercase tracking-widest">No data</div>
  );

  const hovSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={200} height={200}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hovered === null || hovered === i ? 1 : 0.4}
            className="transition-all duration-150 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={22} fontWeight="900" fill="currentColor" className="text-slate-900 dark:text-white">
          {hovSlice ? hovSlice.count : total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fontWeight="700" fill="#94a3b8">
          {hovSlice ? hovSlice.status : 'ORDERS'}
        </text>
      </svg>
      <div className="flex flex-wrap gap-2 justify-center">
        {slices.map((s, i) => (
          <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.color }} />
            {s.status} ({s.count})
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];
  const [period, setPeriod] = useState<Period>('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [topDealers, setTopDealers] = useState<TopDealer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const fetchAll = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const [dash, dealers, products] = await Promise.all([
        api.get<DashboardData>(`/analytics/dashboard?period=${p}`),
        api.get<TopDealer[]>('/analytics/top-dealers?limit=5'),
        api.get<TopProduct[]>('/analytics/top-products?limit=5'),
      ]);
      setData(dash.data);
      setTopDealers(Array.isArray(dealers.data) ? dealers.data : []);
      setTopProducts(Array.isArray(products.data) ? products.data : []);
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(period); }, [period, fetchAll]);

  const PERIOD_LABELS: { key: Period; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '1y', label: '1Y' },
    { key: 'all', label: 'ALL' },
  ];

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse p-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-[2rem]" />)}
        </div>
        <div className="h-80 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem]" />
      </div>
    );
  }

  const stats = data?.stats;
  const chart = data?.chart ?? [];
  const statusDist = data?.statusDistribution ?? [];

  const maxProductRevenue = Math.max(...topProducts.map(p => p.revenue), 1);
  const maxDealerAmount = Math.max(...topDealers.map(d => d.totalAmount), 1);

  const kpiCards = [
    {
      label: t.dashboard.revenue,
      value: stats?.revenue ?? 0,
      sub: `${t.dashboard.revenue}: ${fmt(stats?.periodRevenue ?? 0)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: t.dashboard.balance,
      value: stats?.debt ?? 0,
      sub: `Collected: ${fmt(stats?.collected ?? 0)}`,
      icon: CreditCard,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
    },
    {
      label: t.dashboard.activeDealers,
      value: stats?.activeDealers ?? 0,
      sub: `Orders: ${stats?.periodOrders ?? 0}`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Profit',
      value: stats?.profit ?? 0,
      sub: `Period: ${fmt(stats?.periodProfit ?? 0)}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.sidebar.analytics}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          {PERIOD_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                period === key ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => (
          <motion.div key={idx} whileHover={{ y: -4 }} className="glass-card p-7 group">
            <div className="flex justify-between items-start mb-5">
              <div className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {fmt(card.value)} <span className="text-xs opacity-30 font-bold uppercase ml-1">{t.common.uzs}</span>
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2 opacity-70">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Period summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Period Revenue', value: fmt(stats?.periodRevenue ?? 0), icon: DollarSign, color: 'text-blue-500' },
          { label: 'Period Profit', value: fmt(stats?.periodProfit ?? 0), icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Period Orders', value: String(stats?.periodOrders ?? 0), icon: ShoppingCart, color: 'text-indigo-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 flex items-center gap-4">
            <s.icon className={`w-8 h-8 ${s.color} flex-shrink-0`} />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Revenue & Profit</h3>
          </div>
          <BarChart data={chart} />
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Order Status</h3>
          <DonutChart data={statusDist} />
        </div>
      </div>

      {/* Top Dealers + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Dealers */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Top Dealers</h3>
          </div>
          {topDealers.length === 0 ? (
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{t.common.noData}</p>
          ) : (
            <div className="space-y-4">
              {topDealers.map((dealer, i) => {
                const pct = Math.round((dealer.totalAmount / maxDealerAmount) * 100);
                const debtPct = dealer.creditLimit > 0 ? Math.min(100, Math.round((dealer.currentDebt / dealer.creditLimit) * 100)) : 0;
                return (
                  <div key={dealer.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 w-4">#{i + 1}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{dealer.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{fmt(dealer.totalAmount)}</span>
                        <span className="text-[9px] text-slate-400 ml-1 uppercase">{t.common.uzs}</span>
                      </div>
                    </div>
                    {/* Revenue bar */}
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                    {/* Debt bar */}
                    {debtPct > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Debt {debtPct}%</span>
                        <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${debtPct > 80 ? 'bg-rose-500' : debtPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${debtPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Top Products</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{t.common.noData}</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, i) => {
                const pct = Math.round((product.revenue / maxProductRevenue) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 w-4">#{i + 1}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{fmt(product.revenue)}</span>
                        <span className="text-[9px] text-slate-400 ml-1 uppercase">{t.common.uzs}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">×{product.qty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
