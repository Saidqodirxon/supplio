import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, MoreVertical, MapPin, Phone, X, Save, Trash2, Loader2, Edit2 } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';
import type { Branch } from '../types';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { CardSkeleton } from '../components/Skeleton';
import { toast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BranchForm {
  name: string;
  address: string;
  phone: string;
}

const emptyForm: BranchForm = { name: '', address: '', phone: '' };

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<Branch[]>('/branches');
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      setError(t.common.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t.common.error]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      name: branch.name,
      address: branch.address ?? '',
      phone: branch.phone ?? '',
    });
    setShowModal(true);
    setMenuOpenId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Branch name is required');

    try {
      setSaving(true);
      if (editing) {
        await api.patch(`/branches/${editing.id}`, form);
        toast.success('Branch updated');
      } else {
        await api.post('/branches', form);
        toast.success('Branch created');
      }
      setShowModal(false);
      fetchBranches();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/branches/${id}`);
      toast.success('Branch deleted');
      setDeleting(null);
      setMenuOpenId(null);
      fetchBranches();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete branch');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-64 bg-slate-200 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t.sidebar.warehouses}</h1>
          <p className="text-slate-500 mt-1 font-medium">{t.branches.subtitle}</p>
        </div>
        <button onClick={openCreate} className="premium-button">
          <Plus className="h-4 w-4" />
          {t.branches.addBranch}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="glass-card p-8 group hover:border-blue-200 transition-all cursor-pointer relative">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:premium-gradient group-hover:text-white transition-all duration-500">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpenId(menuOpenId === branch.id ? null : branch.id)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {menuOpenId === branch.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-40"
                    >
                      <button
                        onClick={() => openEdit(branch)}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> {t.common.edit}
                      </button>
                      <button
                        onClick={() => { setDeleting(branch.id); setMenuOpenId(null); }}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> {t.common.delete}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{branch.name}</h3>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                {branch.address || t.branches.mainPoint}
              </div>
              {branch.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {branch.phone}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{t.branches.companyId}</p>
                <p className="text-sm font-bold text-slate-900">{branch.companyId.slice(0, 8)}</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                {t.branches.active}
              </div>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">No branches found</h4>
              <p className="text-slate-400 font-medium">Add your first distribution node to start scaling.</p>
            </div>
            <button onClick={openCreate} className="premium-button">
              <Plus className="w-4 h-4" /> {t.branches.addBranch}
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">
                  {editing ? 'Edit Branch' : t.branches.addBranch}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Toshkent Markaz"
                    className={clsx(
                      'w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all'
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="e.g. Yunusobod, 12-uy"
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+998 90 000 00 00"
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing ? t.common.save : t.common.add}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleting && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black">Delete Branch</h3>
                <p className="text-slate-500 text-sm mt-2">This action cannot be undone. Continue?</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleting(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 font-black text-xs uppercase tracking-widest text-slate-600"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={() => handleDelete(deleting)}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20"
                >
                  {t.common.delete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
