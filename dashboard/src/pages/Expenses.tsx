import { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  PieChart,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useScrollLock } from '../utils/useScrollLock';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  branchId?: string;
  branch?: { name: string };
  createdAt: string;
  deletedAt?: string;
}

interface Branch {
  id: string;
  name: string;
}

const CATEGORIES = [
  'RENT', 'SALARY', 'UTILITIES', 'TRANSPORT', 'MARKETING',
  'SUPPLIES', 'MAINTENANCE', 'TAXES', 'INSURANCE', 'OTHER'
];

const CATEGORY_COLORS: Record<string, string> = {
  RENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SALARY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  UTILITIES: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  TRANSPORT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  MARKETING: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  SUPPLIES: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  TAXES: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  INSURANCE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'OTHER', description: '', branchId: '' });
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  useScrollLock(showModal);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, brRes] = await Promise.all([
        api.get<Expense[]>('/expenses'),
        api.get<Branch[]>('/branches'),
      ]);
      setExpenses(expRes.data);
      setBranches(brRes.data);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error(t.common.error);
    try {
      setSaving(true);
      await api.post('/expenses', {
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description || undefined,
        branchId: form.branchId || undefined,
      });
      toast.success(t.common.add);
      setShowModal(false);
      setForm({ amount: '', category: 'OTHER', description: '', branchId: '' });
      fetchData();
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/expenses/${deleteId}`);
      toast.success(t.common.delete);
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error(t.common.error);
    }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-rose-100 dark:border-rose-900/50">
            <Receipt className="w-3 h-3" /> {t.expenses?.title || 'Expenses'}
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {t.expenses?.title || 'Expenses'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {t.expenses?.subtitle || ''}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="premium-button">
          <Plus className="w-4 h-4" />
          {t.expenses?.addExpense || 'Add Expense'}
        </button>
      </div>

      {/* Stats + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.expenses?.totalExpenses || 'Total Expenses'}</p>
          <h3 className="text-3xl font-black text-rose-600 tracking-tight">{total.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{t.common.uzs} • {expenses.length} records</p>
        </div>
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-5 h-5 text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expenses?.byCategory || 'By Category'}</p>
          </div>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold">{t.common.noData}</p>
            ) : topCategories.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className={clsx("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest w-28 text-center", CATEGORY_COLORS[cat] || CATEGORY_COLORS.OTHER)}>{cat}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-700"
                    style={{ width: `${total > 0 ? (amt / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 w-20 text-right">{amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            All Expenses <span className="text-slate-400 font-bold text-sm ml-2">({expenses.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="p-10 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">{t.expenses?.noExpenses || 'No expenses'}</p>
            <p className="text-slate-400 text-xs mt-1">{t.expenses?.noExpensesDesc || ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-900/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expenses?.category || 'Category'}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expenses?.description || 'Description'}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expenses?.branch || 'Branch'}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expenses?.amount || 'Amount'}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.expenses?.date || 'Date'}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className={clsx("px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest", CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER)}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">{expense.description || '—'}</td>
                    <td className="px-8 py-5 text-xs font-semibold text-slate-500">{expense.branch?.name || '—'}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-rose-600">{expense.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{t.common.uzs}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-semibold text-slate-400">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => setDeleteId(expense.id)}
                        className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.expenses?.addExpense || 'Add Expense'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.expenses?.amount || 'Amount'} *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.expenses?.category || 'Category'}</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({...f, category: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.expenses?.branch || 'Branch'}</label>
                  <select
                    value={form.branchId}
                    onChange={e => setForm(f => ({...f, branchId: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  >
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.expenses?.description || 'Description'}</label>
                  <input
                    value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Optional note"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    {t.common.cancel}
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 premium-button justify-center">
                    {saving ? t.common.loading : t.common.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.common.delete}</h3>
                <p className="text-sm text-slate-500">{t.expenses?.deleteConfirm || 'Are you sure?'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  {t.common.cancel}
                </button>
                <button onClick={handleDelete} className="flex-1 px-6 py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                  {t.common.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
