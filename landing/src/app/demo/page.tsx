"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3, ShoppingCart, Users, Package, TrendingUp, Zap, CheckCircle,
  ArrowRight, Bot, Globe, CreditCard, Building2, Loader2, Star,
  ExternalLink, Play, ChevronRight, Shield, Clock, Activity
} from "lucide-react";
import { format } from "date-fns";
import LeadModal from "@/components/LeadModal";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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

interface DemoStore {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  dealers: number;
  products: number;
  revenue: string;
  websiteUrl?: string;
}

interface DemoTariff {
  id: string;
  planKey: string;
  nameEn: string;
  priceMonthly: string;
  featuresEn: string[];
  isPopular: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  DELIVERED: 'text-emerald-600 bg-emerald-50',
  PENDING: 'text-amber-600 bg-amber-50',
  PROCESSING: 'text-blue-600 bg-blue-50',
  CANCELLED: 'text-rose-600 bg-rose-50',
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function DemoPage() {
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [products, setProducts] = useState<DemoProduct[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [stores, setStores] = useState<DemoStore[]>([]);
  const [tariffs, setTariffs] = useState<DemoTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'stores'>('orders');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BACKEND}/api/demo/data`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setProducts(data.products || []);
          setOrders(data.recentOrders || []);
          setStores(data.stores || []);
          setTariffs(data.tariffs || []);
        }
      } catch {
        // fallback silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-outfit text-left overflow-x-hidden">
      {/* Demo banner */}
      <div className="bg-blue-600 text-white py-2.5 px-5 text-center text-xs font-bold tracking-wide relative z-[60]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 fill-white animate-pulse" />
          INTERACTIVE DEMO — No login required. All data is simulated.
          <Link href="/uz" className="underline ml-2 hover:text-blue-200 transition-colors">← Back to Landing</Link>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 overflow-hidden flex items-center">
              <img src="/logo.png" alt="Supplio" className="h-full object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-lg">DEMO</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Explore without signing up</span>
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-12 space-y-16">

        {/* Hero */}
        <motion.div {...fadeInUp} className="text-center space-y-6 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-widest">
            <Play className="w-3 h-3" /> Live Demo Environment
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
            See Supplio in Action
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Explore the full B2B distribution platform — real data, real UI. No demo account needed.
          </p>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <motion.div {...fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Companies', value: stats?.totalCompanies?.toLocaleString() || '134', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() || '18,492', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Revenue (UZS)', value: stats?.totalRevenue || '47.8B', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Active Users', value: stats?.activeUsers?.toLocaleString() || '312', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Uptime', value: stats?.uptime || '99.97%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'API Response', value: `${stats?.avgResponseMs || 82}ms`, icon: Zap, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Dashboard preview tabs */}
        <motion.div {...fadeInUp} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/30">
          {/* Tab header */}
          <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Live Dashboard Preview</h2>
              <p className="text-sm text-slate-400 mt-1">Sample data from a demo distribution company</p>
            </div>
            <div className="flex gap-2">
              {(['orders', 'products', 'stores'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dealer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                            {order.dealer.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{order.dealer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 text-sm">
                        {Number(order.amount).toLocaleString()} <span className="text-slate-400 font-medium text-xs">UZS</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${STATUS_COLOR[order.status] || 'bg-slate-50 text-slate-500'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Products tab */}
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <Package className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{product.sku}</td>
                      <td className="px-6 py-4 font-black text-slate-900 text-sm">
                        {Number(product.price).toLocaleString()} <span className="text-slate-400 font-medium text-xs">UZS</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${product.stock > 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stores tab */}
          {activeTab === 'stores' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map((store) => (
                <div key={store.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0">
                      <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-tight">{store.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{store.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Dealers', value: store.dealers },
                      { label: 'Products', value: store.products },
                      { label: 'Revenue', value: `${store.revenue} UZS` },
                    ].map((m) => (
                      <div key={m.label} className="bg-white rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-sm font-black text-slate-900">{m.value}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:gap-3 transition-all">
                    <Globe className="w-3.5 h-3.5" /> View Store
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Features highlight */}
        <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              title: 'Telegram Bot Integration',
              desc: 'Each dealer gets a branded Telegram bot. Orders, payments, and credit checks — all through chat.',
            },
            {
              icon: CreditCard,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              title: 'Real-Time Credit Control',
              desc: 'Set limits per dealer. Get instant alerts when limits are exceeded. Block orders automatically.',
            },
            {
              icon: BarChart3,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
              title: 'Analytics Dashboard',
              desc: 'Track revenue by branch, monitor top dealers, and see your entire network at a glance.',
            },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-all space-y-4 group">
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-black text-slate-900 text-lg leading-tight">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing preview */}
        {tariffs.length > 0 && (
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-slate-500">Start free. Upgrade when you're ready. No lock-in.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {tariffs.map((plan) => (
                <div key={plan.id} className={`bg-white p-7 rounded-2xl border ${plan.isPopular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100'} space-y-6 relative hover:shadow-xl transition-all`}>
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/30">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{plan.planKey}</p>
                    <h3 className="text-xl font-black text-slate-900">{plan.nameEn}</h3>
                    <p className="text-3xl font-black tracking-tight mt-2">
                      {Number(plan.priceMonthly) === 0 ? 'Free' : `${Number(plan.priceMonthly).toLocaleString()}`}
                      {Number(plan.priceMonthly) > 0 && <span className="text-sm text-slate-400 font-medium ml-1">UZS/mo</span>}
                    </p>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.featuresEn.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all active:scale-[0.97] ${
                      plan.isPopular ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trust indicators */}
        <motion.div {...fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: 'Enterprise Security', desc: 'Per-tenant data isolation', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Clock, label: '99.9% Uptime SLA', desc: 'Always online', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: Star, label: '5-Language UI', desc: 'UZ, EN, RU, TR, UZ_CYRL', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Zap, label: '<100ms Response', desc: 'Real-time data sync', color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-3">
              <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center mx-auto`}>
                <t.icon className={`w-5 h-5 ${t.color}`} />
              </div>
              <p className="font-black text-slate-900 text-sm">{t.label}</p>
              <p className="text-xs text-slate-400">{t.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeInUp} className="bg-slate-900 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Ready to Transform Your Distribution?</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">Join 130+ companies already using Supplio to manage their dealer networks.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-[0.97] flex items-center gap-3 justify-center"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <Link href="/uz" className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center gap-3 justify-center">
              Learn More <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </main>

      <LeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} lang="en" />
    </div>
  );
}
