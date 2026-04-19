import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Phone, Building2, Clock, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, MapPin, CreditCard } from 'lucide-react';
import api from '../services/api';
import { toast } from '../utils/toast';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import clsx from 'clsx';

interface PendingDealer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  region?: string;
  district?: string;
  contactPhone?: string;
  creditLimit: number;
  createdAt: string;
  branch: { name: string };
}



export default function Approvals() {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language].approvals;
  const common = dashboardTranslations[language].common;

  const [dealers, setDealers] = useState<PendingDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Approval modal state
  const [approveModal, setApproveModal] = useState<PendingDealer | null>(null);
  const [creditLimitInput, setCreditLimitInput] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dealers/pending-approvals');
      setDealers(res.data);
    } catch {
      toast.error(common.error);
    } finally {
      setLoading(false);
    }
  }, [common.error]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const openApproveModal = (dealer: PendingDealer) => {
    setApproveModal(dealer);
    setCreditLimitInput(dealer.creditLimit > 0 ? String(dealer.creditLimit) : '');
  };

  const confirmApprove = async () => {
    if (!approveModal) return;
    const id = approveModal.id;
    setApproveModal(null);
    setActionId(id);
    setActionType('approve');
    try {
      const limit = parseFloat(creditLimitInput.replace(/\s/g, '')) || 0;
      await api.post(`/dealers/${id}/approve`, { creditLimit: limit });
      toast.success(t.approved);
      setDealers(prev => prev.filter(d => d.id !== id));
    } catch {
      toast.error(common.error);
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const rejectDealer = async (id: string) => {
    if (!window.confirm(t.confirmReject)) return;
    setActionId(id);
    setActionType('reject');
    try {
      await api.post(`/dealers/${id}/reject`);
      toast.success(common.delete);
      setDealers(prev => prev.filter(d => d.id !== id));
    } catch {
      toast.error(common.error);
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {dealers.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black rounded-xl border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              {dealers.length} {t.pending}
            </span>
          )}
          <button
            onClick={fetchPending}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : dealers.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="font-black text-slate-700 dark:text-slate-300">{t.empty}</p>
            <p className="text-sm text-slate-400 mt-1">{t.emptyDesc}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {dealers.map(dealer => (
            <div
              key={dealer.id}
              className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:shadow-lg dark:hover:shadow-black/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-slate-900 dark:text-white text-lg">{dealer.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20">
                        {t.pending}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold">{dealer.phone}</span>
                      </span>
                      {dealer.contactPhone && dealer.contactPhone !== dealer.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                          <span className="font-bold">{dealer.contactPhone}</span>
                        </span>
                      )}
                      {dealer.branch && (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold">{dealer.branch.name}</span>
                        </span>
                      )}
                      {dealer.region && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold">{dealer.region}{dealer.district ? `, ${dealer.district}` : ''}</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {t.registered}: {new Date(dealer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {dealer.address && (
                      <p className="text-sm text-slate-400">{dealer.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => rejectDealer(dealer.id)}
                    disabled={actionId === dealer.id}
                    className={clsx(
                      'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95',
                      'bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
                      'hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50'
                    )}
                  >
                    {actionId === dealer.id && actionType === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {actionId === dealer.id && actionType === 'reject' ? t.rejecting : t.reject}
                  </button>
                  <button
                    onClick={() => openApproveModal(dealer)}
                    disabled={actionId === dealer.id}
                    className={clsx(
                      'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95',
                      'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20',
                      'hover:bg-emerald-700 disabled:opacity-50'
                    )}
                  >
                    {actionId === dealer.id && actionType === 'approve' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    {actionId === dealer.id && actionType === 'approve' ? t.approving : t.approve}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credit Limit Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white">{t.setCreditLimit}</h2>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">{approveModal.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.creditLimitDesc}</p>

              {/* Dealer info summary */}
              <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.branch}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{approveModal.branch?.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.region}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {[approveModal.region, approveModal.district].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.contactPhone}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{approveModal.contactPhone || approveModal.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.creditLimit} (UZS)</label>
                <input
                  type="number"
                  min={0}
                  step={100000}
                  value={creditLimitInput}
                  onChange={e => setCreditLimitInput(e.target.value)}
                  placeholder={t.limitPlaceholder}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  autoFocus
                />
                {creditLimitInput && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    = {Number(creditLimitInput).toLocaleString()} UZS
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setApproveModal(null)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmApprove}
                  className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {t.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
