import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Users, TrendingUp, Package, ArrowUpRight, CheckCircle2, Loader2, Eye, Lock, Send, X } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { label: 'Companies', value: '134+', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Orders / month', value: '18,492', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Active dealers', value: '2,800+', icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Products tracked', value: '45,000+', icon: Package, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
];

const DEMO_ORDERS = [
  { dealer: 'Apex Retail', amount: '4,500,000', status: 'DELIVERED', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { dealer: 'Global Mart', amount: '1,200,000', status: 'PENDING', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { dealer: 'City Express', amount: '2,800,000', status: 'DELIVERED', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { dealer: 'Metro Store', amount: '650,000', status: 'PREPARING', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { dealer: 'FastTrade', amount: '3,200,000', status: 'DELIVERED', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

interface DemoCredentials {
  phone: string;
  password: string;
  url: string;
  note: string;
}

export default function DemoLanding() {
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<DemoCredentials | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/demo/access', form);
      setCredentials(res.data.demo);
      setShowForm(false);
    } catch {
      setError('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-outfit">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Supplio" className="h-8 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Supplio</span>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">DEMO</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Kirish
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">
            <Eye className="w-3.5 h-3.5" /> Ko'rish rejimi — faqat o'qish
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Supplio<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Demo</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            B2B distribyutorlar uchun kuchli boshqaruv tizimi. Demo ma'lumotlarini ko'ring yoki to'liq kirish uchun ariza yuboring.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 justify-center"
            >
              <Lock className="w-4 h-4" />
              To'liq demo olish
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-sm hover:border-slate-400 active:scale-95 transition-all"
            >
              Akkauntga kirish
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Demo dashboard preview */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Fake topbar */}
          <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-slate-400 font-mono">app.supplio.uz/dashboard</span>
          </div>
          {/* Demo orders table */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">So'nggi buyurtmalar</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Real vaqt
              </div>
            </div>
            <div className="space-y-3">
              {DEMO_ORDERS.map((o, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 text-sm">
                      {o.dealer.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{o.dealer}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900 dark:text-white text-sm">{o.amount} UZS</span>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${o.color}`}>{o.status}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Blur overlay - read-only indicator */}
            <div className="mt-6 text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <Lock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">To'liq versiya uchun</p>
              <button onClick={() => setShowForm(true)} className="mt-3 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
                Ariza yuborish
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Credentials display ────────────────────────────────────────────── */}
      <AnimatePresence>
        {credentials && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Demo tayyor!</h3>
                <p className="text-slate-400 text-sm">{credentials.note}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">{credentials.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parol</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">{credentials.password}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all"
              >
                Kirish sahifasiga o'tish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Request form modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Demo so'rovi</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleRequest} className="p-8 space-y-5">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ma'lumotlaringizni kiriting va biz sizga demo kirish ma'lumotlarini beramiz. Data kunlik yangilanadi.
                </p>
                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ism Familya *</label>
                  <input
                    value={form.fullName}
                    onChange={e => setForm(f => ({...f, fullName: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="Ali Karimov"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefon *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="+998901234567"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kompaniya nomi</label>
                  <input
                    value={form.company}
                    onChange={e => setForm(f => ({...f, company: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="MChJ Namuna"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? 'Yuborilmoqda...' : 'Demo olish'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
