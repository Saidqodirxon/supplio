import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, DollarSign, ArrowUpRight, Activity, Plus, Search, ChevronLeft, ChevronRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import api from '../services/api';
import type { Payment } from '../types';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { TableSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useScrollLock } from '../utils/useScrollLock';
import { CustomSelect } from '../components/CustomSelect';
import type { SelectOption } from '../components/CustomSelect';

const PAGE_SIZE = 10;

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    dealerId: '',
    amount: '',
    method: 'CASH',
    reference: ''
  });
  const [dealers, setDealers] = useState<{ id: string; name: string }[]>([]);
  const dealerOptions: SelectOption[] = dealers.map(d => ({ value: d.id, label: d.name }));
  const methodOptions: SelectOption[] = [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK', label: 'Bank' },
    { value: 'CLICK', label: 'Click' },
    { value: 'PAYME', label: 'Payme' },
  ];

  // Adjustment modal
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({ dealerId: '', amount: '', note: '' });

  useScrollLock(isModalOpen || isAdjOpen);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Payment[]>('/payments');
      setPayments(Array.isArray(response.data) ? response.data : []);

      const dealersRes = await api.get('/dealers');
      setDealers(Array.isArray(dealersRes.data) ? dealersRes.data : []);
    } catch (err: unknown) {
      setError(t.common?.error || 'Xatolik yuz berdi');
      setPayments([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t.common?.error]);

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payments/adjustment', {
        dealerId: adjForm.dealerId,
        amount: Number(adjForm.amount),
        note: adjForm.note,
      });
      setIsAdjOpen(false);
      setAdjForm({ dealerId: '', amount: '', note: '' });
      toast.success(t.payments.adjustmentSaved);
      fetchPayments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (t.common?.error || 'Error');
      toast.error(msg);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        ...newPayment,
        amount: Number(newPayment.amount)
      });
      setIsModalOpen(false);
      setNewPayment({ dealerId: '', amount: '', method: 'CASH', reference: '' });
      toast.success(t.payments.confirmReceipt);
      fetchPayments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (t.common?.error || 'Xatolik');
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.trim().toLowerCase();
    return payments.filter(
      (p) =>
        (p.dealer?.name ?? '').toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.method ?? '').toLowerCase().includes(q)
    );
  }, [payments, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse p-6">
        <div className="flex justify-between items-end pb-10 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-900 rounded-lg" />
          </div>
          <div className="h-14 w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 dark:border-emerald-900/50">
            <Activity className="w-3 h-3" /> {t.sidebar.payments}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t.sidebar.payments}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {t.payments.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdjOpen(true)}
            className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2"
          >
            <ArrowDownLeft className="h-4 w-4" />
            {t.payments.adjustment}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t.payments.recordPayment}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 p-10 rounded-2xl max-w-lg w-full shadow-4xl space-y-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.payments.recordPayment}</h3>
              <form onSubmit={handleCreatePayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.selectDealer}</label>
                  {dealerOptions.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {t.dealers?.noDealers || 'No dealers found'}
                    </div>
                  ) : (
                    <CustomSelect
                      options={dealerOptions}
                      value={newPayment.dealerId}
                      onChange={v => setNewPayment({ ...newPayment, dealerId: v })}
                      placeholder={t.payments.chooseDealerPlaceholder}
                      searchable
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.amount}</label>
                    <input
                      type="number"
                      required
                      className="input-field w-full"
                      value={newPayment.amount}
                      onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.method}</label>
                    <CustomSelect
                      options={methodOptions}
                      value={newPayment.method}
                      onChange={v => setNewPayment({ ...newPayment, method: v })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.reference}</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={newPayment.reference}
                    onChange={e => setNewPayment({ ...newPayment, reference: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs">{t.common.cancel}</button>
                  <button type="submit" disabled={dealerOptions.length === 0} className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-40 disabled:cursor-not-allowed">{t.payments.confirmReceipt}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjustment Modal */}
      <AnimatePresence>
        {isAdjOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 p-10 rounded-2xl max-w-lg w-full shadow-4xl space-y-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.payments.adjustmentTitle}</h3>
                <p className="text-xs text-slate-400 mt-1 font-bold">{t.payments.adjustmentDesc}</p>
              </div>
              <form onSubmit={handleCreateAdjustment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.adjustmentDealer}</label>
                  {dealerOptions.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {t.dealers?.noDealers || 'No dealers found'}
                    </div>
                  ) : (
                    <CustomSelect
                      options={dealerOptions}
                      value={adjForm.dealerId}
                      onChange={v => setAdjForm({ ...adjForm, dealerId: v })}
                      placeholder={t.payments.adjustmentDealerPlaceholder}
                      searchable
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.adjustmentAmount}</label>
                  <input type="number" required className="input-field w-full" value={adjForm.amount} onChange={e => setAdjForm({ ...adjForm, amount: e.target.value })} placeholder="e.g. 50000 or -25000" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.adjustmentNote}</label>
                  <input type="text" required className="input-field w-full" value={adjForm.note} onChange={e => setAdjForm({ ...adjForm, note: e.target.value })} placeholder="Refund, correction, etc." />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAdjOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs">{t.common.cancel}</button>
                  <button type="submit" disabled={dealerOptions.length === 0} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-40 disabled:cursor-not-allowed">{t.payments.saveAdjustment}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t.common.search ?? 'Qidirish'}...`}
          className="input-field w-full pl-9 text-sm"
        />
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden shadow-2xl shadow-emerald-500/5 border border-slate-50 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-900/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.receiptId}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.dealerName}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.amountCleared}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.channel}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.settlementDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {paginated.map((payment, idx) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={payment.id}
                  className="hover:bg-emerald-50/10 dark:hover:bg-emerald-900/5 transition-all group"
                >
                  <td className="px-10 py-6">
                    <span className="font-mono text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      REC-{payment.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm font-bold uppercase">
                        {payment?.dealer?.name ? payment.dealer.name.charAt(0) : 'D'}
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">
                        {payment?.dealer?.name || t.common?.noData || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                        {(payment.amount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-black uppercase italic tracking-widest ml-1">{t.common?.uzs || 'SUM'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Calendar className="w-4 h-4 opacity-30 text-emerald-500" />
                      {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy') : '-'}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr className="animate-in fade-in duration-1000">
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                        <DollarSign className="w-12 h-12" />
                      </div>
                      <p className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">{t.payments?.noPayments || 'To\'lovlar yo\'q'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-10 py-5 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-black border transition-all ${
                      p === page
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
