import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Phone, Building2, Clock, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
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
  creditLimit: number;
  createdAt: string;
  branch: { name: string };
}

const T = {
  en: {
    title: 'Dealer Approvals',
    subtitle: 'Review and approve dealer registration requests.',
    pending: 'Pending',
    approved: 'Approved',
    empty: 'No pending requests',
    emptyDesc: 'All dealer registrations have been reviewed.',
    approve: 'Approve',
    reject: 'Reject',
    approving: 'Approving...',
    rejecting: 'Rejecting...',
    confirmReject: 'Reject this dealer?',
    creditLimit: 'Credit Limit',
    branch: 'Branch',
    registered: 'Registered',
  },
  uz: {
    title: 'Diler Tasdiqlari',
    subtitle: 'Diler ro\'yxatdan o\'tish so\'rovlarini ko\'rib chiqing va tasdiqlang.',
    pending: 'Kutilmoqda',
    approved: 'Tasdiqlangan',
    empty: 'Kutilayotgan so\'rovlar yo\'q',
    emptyDesc: 'Barcha diler ro\'yxatga olish so\'rovlari ko\'rib chiqilgan.',
    approve: 'Tasdiqlash',
    reject: 'Rad etish',
    approving: 'Tasdiqlanmoqda...',
    rejecting: 'Rad etilmoqda...',
    confirmReject: 'Bu dilerni rad etasizmi?',
    creditLimit: 'Kredit limiti',
    branch: 'Filial',
    registered: 'Ro\'yxatdan o\'tgan',
  },
  oz: {
    title: 'Дилер Тасдиқлари',
    subtitle: 'Дилер рўйхатдан ўтиш сўровларини кўриб чиқинг.',
    pending: 'Кутилмоқда',
    approved: 'Тасдиқланган',
    empty: 'Сўровлар йўқ',
    emptyDesc: 'Барча сўровлар кўриб чиқилди.',
    approve: 'Тасдиқлаш',
    reject: 'Рад этиш',
    approving: 'Тасдиқланмоқда...',
    rejecting: 'Рад этилмоқда...',
    confirmReject: 'Бу дилерни рад этасизми?',
    creditLimit: 'Кредит лимити',
    branch: 'Филиал',
    registered: 'Рўйхатдан ўтган',
  },
  tr: {
    title: 'Bayi Onayları',
    subtitle: 'Bayi kayıt taleplerini inceleyin ve onaylayın.',
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    empty: 'Bekleyen istek yok',
    emptyDesc: 'Tüm bayi kayıt talepleri incelendi.',
    approve: 'Onayla',
    reject: 'Reddet',
    approving: 'Onaylanıyor...',
    rejecting: 'Reddediliyor...',
    confirmReject: 'Bu bayiyi reddetmek istiyor musunuz?',
    creditLimit: 'Kredi Limiti',
    branch: 'Şube',
    registered: 'Kayıt Tarihi',
  },
  ru: {
    title: 'Одобрение Дилеров',
    subtitle: 'Рассматривайте и одобряйте заявки на регистрацию дилеров.',
    pending: 'Ожидают',
    approved: 'Одобрен',
    empty: 'Нет ожидающих заявок',
    emptyDesc: 'Все заявки на регистрацию дилеров рассмотрены.',
    approve: 'Одобрить',
    reject: 'Отклонить',
    approving: 'Одобряю...',
    rejecting: 'Отклоняю...',
    confirmReject: 'Отклонить этого дилера?',
    creditLimit: 'Кредитный лимит',
    branch: 'Филиал',
    registered: 'Зарегистрирован',
  },
} as const;
type Lang = keyof typeof T;

export default function Approvals() {
  const { language } = useAuthStore();
  const lang = (language in T ? language : 'en') as Lang;
  const t = T[lang];
  const dt = dashboardTranslations[language as keyof typeof dashboardTranslations] ?? dashboardTranslations.en;

  const [dealers, setDealers] = useState<PendingDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dealers/pending-approvals');
      setDealers(res.data);
    } catch {
      toast.error(dt.common?.error ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [dt.common?.error]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const approveDealer = async (id: string) => {
    setActionId(id);
    setActionType('approve');
    try {
      await api.post(`/dealers/${id}/approve`);
      toast.success(t.approved);
      setDealers(prev => prev.filter(d => d.id !== id));
    } catch {
      toast.error('Failed to approve');
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
      toast.success('Rejected');
      setDealers(prev => prev.filter(d => d.id !== id));
    } catch {
      toast.error('Failed to reject');
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
                    <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-bold">{dealer.phone}</span>
                      </span>
                      {dealer.branch && (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="font-bold">{dealer.branch.name}</span>
                        </span>
                      )}
                      <span className="font-bold">
                        {t.creditLimit}: {dealer.creditLimit.toLocaleString()} so'm
                      </span>
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
                    onClick={() => approveDealer(dealer.id)}
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
    </div>
  );
}
