import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoStats {
  totalCompanies: number;
  totalOrders: number;
  totalRevenue: string;
  activeUsers: number;
  uptime: string;
  avgResponseMs: number;
}

interface DemoProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  sku: string;
}

interface DemoOrder {
  id: string;
  dealer: string;
  amount: number;
  status: string;
  date: string;
}

interface DemoData {
  stats: DemoStats;
  products: DemoProduct[];
  recentOrders: DemoOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-emerald-50 text-emerald-600',
  COMPLETED: 'bg-emerald-50 text-emerald-600',
  PENDING: 'bg-amber-50 text-amber-600',
  PROCESSING: 'bg-blue-50 text-blue-600',
  CANCELLED: 'bg-rose-50 text-rose-600',
  ACCEPTED: 'bg-blue-50 text-blue-600',
  PREPARING: 'bg-purple-50 text-purple-600',
  SHIPPED: 'bg-indigo-50 text-indigo-600',
};

export default function OwnerDemo() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiBase}/demo/data`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {
        // Fallback to built-in mock data if API unavailable
        setData({
          stats: { totalCompanies: 134, totalOrders: 18492, totalRevenue: '47,820,000,000', activeUsers: 312, uptime: '99.97%', avgResponseMs: 82 },
          products: [
            { id: 'p1', name: 'Premium Box Set', price: 250000, stock: 150, unit: 'box', sku: 'PBS-001' },
            { id: 'p2', name: 'Standard Pack', price: 45000, stock: 2000, unit: 'pcs', sku: 'SP-002' },
            { id: 'p3', name: 'Industrial Set', price: 1200000, stock: 45, unit: 'set', sku: 'IS-003' },
            { id: 'p4', name: 'Mini Sample', price: 12000, stock: 5000, unit: 'pcs', sku: 'MS-004' },
            { id: 'p5', name: 'Bulk Container', price: 3500000, stock: 12, unit: 'cnt', sku: 'BC-005' },
          ],
          recentOrders: [
            { id: 'o1', dealer: 'Apex Retail', amount: 4500000, status: 'DELIVERED', date: '2026-03-20' },
            { id: 'o2', dealer: 'Global Mart', amount: 1200000, status: 'PENDING', date: '2026-03-21' },
            { id: 'o3', dealer: 'City Express', amount: 2800000, status: 'PROCESSING', date: '2026-03-21' },
            { id: 'o4', dealer: 'Metro Store', amount: 650000, status: 'DELIVERED', date: '2026-03-19' },
            { id: 'o5', dealer: 'FastTrade', amount: 3200000, status: 'DELIVERED', date: '2026-03-18' },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Demo yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const products = data?.products ?? [];
  const orders = data?.recentOrders ?? [];

  const statCards = [
    { name: "Jami savdo", value: stats?.totalRevenue ? `${Number(stats.totalRevenue.replace(/,/g, '')).toLocaleString()} so'm` : '—', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { name: "Buyurtmalar", value: stats?.totalOrders?.toLocaleString() ?? '—', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { name: "Kompaniyalar", value: stats?.totalCompanies?.toString() ?? '—', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { name: "Uptime", value: stats?.uptime ?? '—', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Demo Banner */}
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">Supplio — Demo Panel</h2>
            <p className="text-xs opacity-80 font-black uppercase tracking-widest leading-none">Haqiqiy ma'lumotlar • Har kuni yangilanadi</p>
          </div>
        </div>
        <a
          href="/login"
          className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:shadow-white/20 relative z-10"
        >
          Hisob ochish
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 flex flex-col gap-8 group hover:border-blue-500/20 transition-all cursor-default"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-emerald-500/20">
                LIVE <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="glass-card p-10 border-blue-500/10">
            <div className="flex items-center gap-5 mb-10">
              <div className="p-4 bg-blue-600 rounded-[1.25rem] text-white shadow-xl shadow-blue-600/20">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">Mahsulotlar</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{products.length} ta mahsulot</p>
              </div>
            </div>
            <div className="space-y-4">
              {products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-50 group hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{p.name}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU: {p.sku}</p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${p.stock < 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {p.stock} {p.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 leading-none">{p.price.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">so'm / {p.unit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-8">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-slate-100 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">So'nggi buyurtmalar</h3>
            </div>
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate">{order.dealer}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{order.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm text-slate-900">{order.amount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-0.5 ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {order.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="glass-card p-8 bg-slate-950 text-white border-none shadow-2xl shadow-slate-950/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-10" />
            <h3 className="text-2xl font-black mb-3 relative z-10 leading-none tracking-tighter">To'liq versiya?</h3>
            <p className="text-[10px] font-black opacity-40 mb-8 relative z-10 leading-relaxed uppercase tracking-[0.15em]">
              Cheksiz dilerlar, ko'p filial qo'llab-quvvatlash va kengaytirilgan tahlillarni oching.
            </p>
            <a
              href="/login"
              className="block w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl hover:shadow-white/10 active:scale-95 transition-all relative z-10 text-center"
            >
              Bepul boshlash
            </a>
          </div>
        </div>
      </div>

      {/* Platform stats footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Faol kompaniyalar', value: stats?.totalCompanies ?? 134 },
          { label: 'Jami buyurtmalar', value: stats?.totalOrders?.toLocaleString() ?? '18,492' },
          { label: 'Uptime', value: stats?.uptime ?? '99.97%' },
          { label: 'Javob vaqti', value: `${stats?.avgResponseMs ?? 82}ms` },
        ].map(item => (
          <div key={item.label} className="glass-card p-5 text-center">
            <p className="text-2xl font-black text-slate-900">{item.value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
