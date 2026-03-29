import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, MoreVertical, Building2, User, CreditCard,
  Users, X, Save, Trash2, Loader2, Edit2, ShoppingCart, TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import type { Dealer, Branch } from '../types';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { CardSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPhoneNumber } from '../utils/formatters';
import PhoneInput from '../components/PhoneInput';
import { toast } from '../utils/toast';
import { useScrollLock } from '../utils/useScrollLock';
import UpgradeModal from '../components/UpgradeModal';
import { usePlanLimits } from '../hooks/usePlanLimits';

const LIMIT_OPTIONS = [
  { label: '1,000,000', value: 1000000 },
  { label: '5,000,000', value: 5000000 },
  { label: '10,000,000', value: 10000000 },
  { label: '20,000,000', value: 20000000 },
  { label: '50,000,000', value: 50000000 },
  { label: '100,000,000', value: 100000000 },
];

interface DealerForm {
  name: string;
  phone: string;
  branchId: string;
  creditLimit: number;
  address?: string;
}

const emptyForm: DealerForm = { name: '', phone: '', branchId: '', creditLimit: 10000000 };

export default function Dealers() {
  const { showUpgrade, setShowUpgrade, upgradeReason, handleApiError } = usePlanLimits();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'HAS_DEBT' | 'LIMIT_REACHED'>('ALL');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [form, setForm] = useState<DealerForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const [detailDealer, setDetailDealer] = useState<Dealer | null>(null);
  const [dealerOrders, setDealerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dealerStats, setDealerStats] = useState<Map<string, { totalOrders: number; totalAmount: number }>>(new Map());

  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  useScrollLock(modalOpen || !!deleteId || !!detailDealer);

  const fetchDealers = useCallback(async () => {
    try {
      setLoading(true);
      const [dealersRes, branchesRes, statsRes] = await Promise.all([
        api.get<Dealer[]>('/dealers'),
        api.get<Branch[]>('/branches'),
        api.get<{ id: string; totalOrders: number; totalAmount: number }[]>('/analytics/top-dealers?limit=200').catch(() => ({ data: [] })),
      ]);
      setDealers(Array.isArray(dealersRes.data) ? dealersRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      const statsMap = new Map<string, { totalOrders: number; totalAmount: number }>();
      if (Array.isArray(statsRes.data)) {
        statsRes.data.forEach((s) => statsMap.set(s.id, { totalOrders: s.totalOrders, totalAmount: s.totalAmount }));
      }
      setDealerStats(statsMap);
    } catch (err: unknown) {
      setError(t.common.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t.common.error]);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  const filtered = dealers.filter((d) => {
    const matchSearch =
      !searchTerm ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || (d as any).status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditingDealer(null);
    setForm({ ...emptyForm, branchId: branches[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setForm({
      name: dealer.name,
      phone: dealer.phone,
      branchId: dealer.branchId,
      creditLimit: dealer.creditLimit,
      address: (dealer as any).address ?? '',
    });
    setModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Ism kiritilmadi');
    if (!form.phone || form.phone.replace(/\D/g, '').length < 12) return toast.error('Telefon raqami noto\'g\'ri');
    if (!form.branchId) return toast.error('Filial tanlanmadi');

    try {
      setSaving(true);
      if (editingDealer) {
        await api.patch(`/dealers/${editingDealer.id}`, form);
        toast.success('Diler yangilandi');
      } else {
        await api.post('/dealers', form);
        toast.success('Diler qo\'shildi');
      }
      setModalOpen(false);
      fetchDealers();
    } catch (e: unknown) {
      if (!handleApiError(e)) {
        const msg = (e as any)?.response?.data?.message ?? 'Xatolik yuz berdi';
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/dealers/${id}`);
      toast.success('Diler o\'chirildi');
      setDeleteId(null);
      setMenuOpenId(null);
      fetchDealers();
    } catch {
      toast.error('O\'chirishda xatolik');
    }
  };

  const handleToggleBlock = async (dealer: Dealer) => {
    const isBlocked = (dealer as any).isBlocked;
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(isBlocked ? 'Dilerni blokdan chiqarasizmi?' : 'Bu dilerni bloklamoqchimisiz?')) return;
    setBlockingId(dealer.id);
    try {
      await api.post(`/dealers/${dealer.id}/${action}`);
      toast.success(isBlocked ? 'Blok olib tashlandi' : 'Diler bloklandi');
      fetchDealers();
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setBlockingId(null);
    }
  };

  const openDealerDetail = async (dealer: Dealer) => {
    setDetailDealer(dealer);
    setLoadingOrders(true);
    try {
      const res = await api.get(`/orders/dealer/${dealer.id}`);
      setDealerOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDealerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t.sidebar.dealers}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {t.dealers.subtitle} • {dealers.length}
          </p>
        </div>
        <button onClick={openCreate} className="premium-button">
          <Plus className="h-4 w-4" />
          {t.dealers.addDealer ?? 'Diler qo\'shish'}
        </button>
      </div>

      {error && !loading && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="input-field w-full pl-12 h-14 rounded-2xl"
            placeholder={t.common.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'HEALTHY', 'HAS_DEBT', 'LIMIT_REACHED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
              }`}
            >
              {s === 'ALL' ? t.common.filter : s === 'HEALTHY' ? '✅' : s === 'HAS_DEBT' ? '⚠️' : '🔴'}
              {s !== 'ALL' && <span className="ml-1">{s.replace('_', ' ')}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : (
          filtered.map((dealer, idx) => {
            const overLimit = (dealer.currentDebt || 0) > dealer.creditLimit;
            const hasDebt = (dealer.currentDebt || 0) > 0;
            return (
              <motion.div
                key={dealer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card p-8 group hover:border-blue-200 dark:hover:border-blue-900/50 cursor-pointer overflow-hidden relative"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100 dark:border-slate-800">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-tight">{dealer.name}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{formatPhoneNumber(dealer.phone)}</p>
                    </div>
                  </div>
                  {(dealer as any).isBlocked && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-100 dark:border-rose-900/30">
                      🔒 Bloklangan
                    </span>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === dealer.id ? null : dealer.id)}
                      className="p-2 text-slate-300 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {menuOpenId === dealer.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          className="absolute right-0 top-10 z-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden w-40"
                        >
                          <button onClick={() => openEdit(dealer)} className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Tahrirlash
                          </button>
                          <button
                            onClick={() => { handleToggleBlock(dealer); setMenuOpenId(null); }}
                            className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 flex items-center gap-2 ${(dealer as any).isBlocked ? 'text-emerald-600' : 'text-amber-600'}`}
                            disabled={blockingId === dealer.id}
                          >
                            {(dealer as any).isBlocked ? '🔓 Blokdan chiqarish' : '🔒 Bloklash'}
                          </button>
                          <button onClick={() => { setDeleteId(dealer.id); setMenuOpenId(null); }} className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> O'chirish
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" /> Filial
                    </span>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">{dealer.branch?.name ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShoppingCart className="w-3 h-3" /> Buyurtmalar
                    </span>
                    <span className="text-xs font-black text-blue-600">{dealerStats.get(dealer.id)?.totalOrders ?? 0} ta</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" /> Jami savdo
                    </span>
                    <span className="text-xs font-black text-emerald-600">{(dealerStats.get(dealer.id)?.totalAmount ?? 0).toLocaleString()} <span className="text-[9px] opacity-50">{t.common.uzs}</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" /> Limit
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{dealer.creditLimit > 0 ? dealer.creditLimit.toLocaleString() : 'Cheksiz'} <span className="text-[9px] opacity-40">{dealer.creditLimit > 0 ? t.common.uzs : ''}</span></span>
                  </div>
                </div>

                {/* Debt progress bar */}
                {dealer.creditLimit > 0 && (
                  <div className="mb-6">
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${overLimit ? 'bg-rose-500' : hasDebt ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, ((dealer.currentDebt || 0) / dealer.creditLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-60">Qarzdorlik</p>
                    <p className={`text-xl font-black tracking-tighter ${overLimit ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      {(dealer.currentDebt || 0).toLocaleString()} <span className="text-[10px] font-bold opacity-30">{t.common.uzs}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border ${overLimit ? 'bg-rose-50 text-rose-600 border-rose-100' : hasDebt ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {overLimit ? 'OVER LIMIT' : hasDebt ? 'HAS DEBT' : t.dealers.healthy}
                  </span>
                </div>
                <button
                  onClick={() => openDealerDetail(dealer)}
                  className="mt-6 w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> View Orders
                </button>
              </motion.div>
            );
          })
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-32 glass-card flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200 border border-slate-100 dark:border-slate-800">
              <Users className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Dilerlar topilmadi</h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Qidiruvni o'zgartiring yoki yangi diler qo'shing</p>
            </div>
            <button onClick={openCreate} className="premium-button">
              <Plus className="w-4 h-4" /> Diler qo'shish
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">
                  {editingDealer ? 'Dilerni tahrirlash' : 'Yangi diler'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ism *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Diler ismi"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon *</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(raw) => setForm((p) => ({ ...p, phone: raw }))}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                  />
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filial *</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                  >
                    <option value="">Filial tanlang</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Credit Limit */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kredit Limit (so'm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LIMIT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, creditLimit: opt.value }))}
                        className={`py-3 rounded-2xl text-xs font-black tracking-wide border transition-all ${
                          form.creditLimit === opt.value
                            ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-blue-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={form.creditLimit}
                    onChange={(e) => setForm((p) => ({ ...p, creditLimit: Number(e.target.value) }))}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all mt-2"
                    placeholder="Yoki qo'lda kiriting"
                  />
                </div>

                {/* Address (optional) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manzil (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={form.address ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Diler manzili"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingDealer ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dealer Detail Panel */}
      <AnimatePresence>
        {detailDealer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-end bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{detailDealer.name}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{detailDealer.phone}</p>
                </div>
                <button onClick={() => setDetailDealer(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{dealerOrders.length}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-lg font-black text-emerald-600">{dealerOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Debt</p>
                  <p className={`text-lg font-black ${(detailDealer.currentDebt || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {(detailDealer.currentDebt || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Orders list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Order History</p>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : dealerOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-30">
                    <ShoppingCart className="w-12 h-12" />
                    <p className="font-black text-sm uppercase tracking-widest">No orders yet</p>
                  </div>
                ) : (
                  dealerOrders.map((order) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-amber-50 text-amber-600',
                      COMPLETED: 'bg-emerald-50 text-emerald-600',
                      DELIVERED: 'bg-emerald-50 text-emerald-600',
                      CANCELLED: 'bg-rose-50 text-rose-600',
                      ACCEPTED: 'bg-blue-50 text-blue-600',
                      PREPARING: 'bg-purple-50 text-purple-600',
                      SHIPPED: 'bg-indigo-50 text-indigo-600',
                    };
                    const items = Array.isArray(order.items) ? order.items : [];
                    return (
                      <div key={order.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-black text-blue-600">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusColors[order.status] ?? 'bg-slate-100 text-slate-500'}`}>
                            {order.status}
                          </span>
                        </div>
                        {items.length > 0 && (
                          <div className="space-y-1">
                            {items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{item.name} ×{item.qty} {item.unit}</span>
                                <span className="font-black text-slate-900 dark:text-white">{(item.total ?? item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">{(order.totalAmount || 0).toLocaleString()} so'm</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black">Dilerni o'chirish</h3>
                <p className="text-slate-500 text-sm mt-2">Bu amalni qaytarib bo'lmaydi. Davom etasizmi?</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black text-xs uppercase tracking-widest text-slate-600">
                  Bekor
                </button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20">
                  O'chirish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
        language={language}
      />
    </div>
  );
}
