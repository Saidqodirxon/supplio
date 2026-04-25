import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, DollarSign, ArrowUpRight, Activity, Plus, Search, ChevronLeft, ChevronRight, AlertCircle, TrendingDown, TrendingUp, ShoppingCart, CreditCard, X } from 'lucide-react';
import api from '../services/api';
import type { Payment } from '../types';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { TableSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../utils/toast';
import { useScrollLock } from '../utils/useScrollLock';
import { CustomSelect } from '../components/CustomSelect';
import type { SelectOption } from '../components/CustomSelect';

const PAGE_SIZE = 10;

interface DealerFull {
  id: string;
  name: string;
  phone?: string;
  currentDebt: number;
  creditLimit: number;
  ordersCount: number;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  // payType: 'add' = To'lov qo'shish (qarz kamaytiradi), 'sub' = Ayirish / Korreksiya
  const [payType, setPayType] = useState<'add' | 'sub'>('add');
  const [form, setForm] = useState({
    dealerId: '',
    amount: '',
    method: 'CASH',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [dealers, setDealers] = useState<DealerFull[]>([]);
  const dealerOptions: SelectOption[] = dealers.map(d => ({ value: d.id, label: `${d.name}${d.phone ? ' · ' + d.phone : ''}` }));
  const methodOptions: SelectOption[] = [
    { value: 'CASH', label: t.payments.methodCash },
    { value: 'BANK', label: t.payments.methodBank },
    { value: 'CLICK', label: t.payments.methodClick },
    { value: 'PAYME', label: t.payments.methodPayme },
  ];

  const selectedDealer = dealers.find(d => d.id === form.dealerId) ?? null;

  useScrollLock(isModalOpen);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, dealersRes] = await Promise.all([
        api.get<Payment[]>('/payments'),
        api.get('/dealers'),
      ]);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setDealers(Array.isArray(dealersRes.data) ? dealersRes.data : []);
    } catch (err: unknown) {
      setError(t.common.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t.common?.error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dealerId || !form.amount) return;
    if (payType === 'sub' && !form.note.trim()) {
      toast.error(language === 'uz' ? 'Sabab kiritish shart' : language === 'ru' ? 'Укажите причину' : 'Reason is required');
      return;
    }
    setSubmitting(true);
    try {
      const amount = Math.abs(Number(form.amount));
      if (payType === 'add') {
        await api.post('/payments', {
          dealerId: form.dealerId,
          amount,
          method: form.method,
          reference: form.note || undefined,
        });
      } else {
        await api.post('/payments/adjustment', {
          dealerId: form.dealerId,
          amount: -amount,
          note: form.note,
        });
      }
      toast.success(payType === 'add' ? t.payments.confirmReceipt : t.payments.adjustmentSaved);
      setIsModalOpen(false);
      setForm({ dealerId: '', amount: '', method: 'CASH', note: '' });
      fetchPayments();
    } catch (err: unknown) {
      toast.error(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
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
        <button
          onClick={() => { setPayType('add'); setForm({ dealerId: '', amount: '', method: 'CASH', note: '' }); setIsModalOpen(true); }}
          className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.payments.recordPayment}
        </button>
      </div>

      {/* Unified Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t.payments.recordPayment}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPayType('add')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      payType === 'add'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    {language === 'uz' ? "To'lov qo'shish" : language === 'ru' ? 'Принять оплату' : 'Add Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayType('sub')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      payType === 'sub'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {language === 'uz' ? 'Ayirish / Korreksiya' : language === 'ru' ? 'Коррекция / Вычет' : 'Deduct / Adjust'}
                  </button>
                </div>

                {/* Type hint */}
                <div className={`text-[11px] font-semibold px-3 py-2 rounded-lg ${payType === 'add' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                  {payType === 'add'
                    ? (language === 'uz' ? "Dilerdan qabul qilingan to'lov — qarzni kamaytiradi" : language === 'ru' ? 'Оплата от дилера — уменьшает долг' : "Payment received from dealer — reduces debt")
                    : (language === 'uz' ? 'Qarzga qo\'shish yoki korreksiya — sabab kiritish shart' : language === 'ru' ? 'Добавление к долгу или коррекция — причина обязательна' : 'Debt increase or correction — reason required')}
                </div>

                {/* Dealer select */}
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
                      value={form.dealerId}
                      onChange={v => setForm(f => ({ ...f, dealerId: v }))}
                      placeholder={t.payments.chooseDealerPlaceholder}
                      searchable
                    />
                  )}
                </div>

                {/* Dealer stats */}
                {selectedDealer && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
                      <ShoppingCart className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {language === 'uz' ? 'Buyurtmalar' : language === 'ru' ? 'Заказы' : 'Orders'}
                      </p>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{selectedDealer.ordersCount ?? 0}</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${selectedDealer.currentDebt > 0 ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                      <DollarSign className={`w-4 h-4 mx-auto mb-1 ${selectedDealer.currentDebt > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {language === 'uz' ? 'Qarz' : language === 'ru' ? 'Долг' : 'Debt'}
                      </p>
                      <p className={`text-sm font-black ${selectedDealer.currentDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {selectedDealer.currentDebt.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
                      <CreditCard className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {language === 'uz' ? 'Limit' : language === 'ru' ? 'Лимит' : 'Limit'}
                      </p>
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {selectedDealer.creditLimit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.amount}</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-field w-full pr-14"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">UZS</span>
                  </div>
                </div>

                {/* Method (only for add payment) */}
                {payType === 'add' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payments.method}</label>
                    <CustomSelect
                      options={methodOptions}
                      value={form.method}
                      onChange={v => setForm(f => ({ ...f, method: v }))}
                    />
                  </div>
                )}

                {/* Note / Reason */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    {payType === 'sub' ? (language === 'uz' ? 'Sabab' : language === 'ru' ? 'Причина' : 'Reason') : t.payments.reference}
                    {payType === 'sub' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required={payType === 'sub'}
                    className="input-field w-full"
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder={payType === 'sub'
                      ? (language === 'uz' ? 'Masalan: qaytarish, xatolik tuzatish...' : language === 'ru' ? 'Например: возврат, корректировка...' : 'e.g. refund, correction...')
                      : (language === 'uz' ? 'Kvitansiya raqami (ixtiyoriy)' : language === 'ru' ? 'Номер квитанции (необязательно)' : 'Receipt number (optional)')}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || dealerOptions.length === 0}
                    className={`flex-1 py-3.5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                      payType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submitting ? '...' : payType === 'add' ? t.payments.confirmReceipt : t.payments.saveAdjustment}
                  </button>
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
              {paginated.map((payment, idx) => {
                const isNegative = (payment.amount ?? 0) < 0;
                return (
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
                        <div className={`p-2 rounded-xl shadow-sm border ${isNegative ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-900/50' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/50'}`}>
                          {isNegative ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xl font-black tracking-tighter ${isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {(payment.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase italic tracking-widest ml-1">{t.common?.uzs || 'SUM'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                        {payment.method || '—'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Calendar className="w-4 h-4 opacity-30 text-emerald-500" />
                        {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy') : '-'}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {paginated.length === 0 && (
                <tr className="animate-in fade-in duration-1000">
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                        <DollarSign className="w-12 h-12" />
                      </div>
                      <p className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">{t.payments.noPayments}</p>
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
