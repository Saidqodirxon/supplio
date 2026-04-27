import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, CreditCard, ExternalLink, ChevronLeft, ChevronRight, Copy, Check, Link2 } from 'lucide-react';
import api from '../../../services/api';
import clsx from 'clsx';

interface SaasTransaction {
  id: string;
  companyId: string;
  companyName: string;
  planKey: string;
  amount: number;
  provider: string;
  status: string;
  externalId: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface PageData {
  data: SaasTransaction[];
  total: number;
  page: number;
  limit: number;
}

interface WebhookUrls {
  click: string;
  paylov: string;
}

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const PROVIDER_COLORS: Record<string, string> = {
  CLICK: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PAYLOV: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'text-slate-500', START: 'text-blue-600', PRO: 'text-indigo-600', PREMIUM: 'text-amber-600',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
      title="Nusxa olish"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function SaasTransactionsTab() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterProvider, setFilterProvider] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [webhookUrls, setWebhookUrls] = useState<WebhookUrls | null>(null);
  const LIMIT = 20;

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<PageData>(`/super/saas-transactions?page=${p}&limit=${LIMIT}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(page);
    api.get<WebhookUrls>('/saas-payment/webhook-urls')
      .then(r => setWebhookUrls(r.data))
      .catch(() => {});
  }, [page, fetchData]);

  const filtered = (data?.data || []).filter(tx => {
    if (filterProvider && tx.provider !== filterProvider) return false;
    if (filterStatus && tx.status !== filterStatus) return false;
    return true;
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">SaaS Tranzaksiyalar</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
            {data ? `Jami: ${data.total}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterProvider}
            onChange={e => setFilterProvider(e.target.value)}
            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Barcha provider</option>
            <option value="CLICK">Click</option>
            <option value="PAYLOV">Paylov</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Barcha status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            onClick={() => fetchData(page)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Webhook URLs */}
      {webhookUrls && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Callback / Webhook URL'lar</p>
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-400">Provider paneliga nusxa olib kiriting</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {/* Click */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Click</p>
                  <p className="text-[9px] text-slate-400 font-bold">Prepare + Complete (bir URL)</p>
                </div>
              </div>
              <div className="flex-1 flex items-center min-w-0 sm:ml-4 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                <code className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex-1 select-all">
                  {webhookUrls.click}
                </code>
                <CopyButton text={webhookUrls.click} />
              </div>
            </div>
            {/* Paylov */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paylov</p>
                  <p className="text-[9px] text-slate-400 font-bold">Checkout link to'lov bildirishnomasi</p>
                </div>
              </div>
              <div className="flex-1 flex items-center min-w-0 sm:ml-4 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                <code className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex-1 select-all">
                  {webhookUrls.paylov}
                </code>
                <CopyButton text={webhookUrls.paylov} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Tranzaksiyalar yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  {['Kompaniya', 'Tarif', 'Summa', 'Provider', 'Status', "To'langan", 'Sana'].map(h => (
                    <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{tx.companyName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{tx.companyId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-sm font-black uppercase tracking-widest", PLAN_COLORS[tx.planKey] || 'text-slate-500')}>
                        {tx.planKey}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {tx.amount.toLocaleString()} UZS
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest", PROVIDER_COLORS[tx.provider] || 'bg-slate-100 text-slate-500')}>
                        {tx.provider === 'CLICK' ? <ExternalLink className="w-2.5 h-2.5" /> : <CreditCard className="w-2.5 h-2.5" />}
                        {tx.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest", STATUS_COLORS[tx.status] || 'bg-slate-100 text-slate-500')}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
