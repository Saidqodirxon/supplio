import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Instagram,
  Send,
  Globe,
  Zap,
  Save,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Building2,
  Camera
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import api from '../services/api';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'sonner';

interface CompanySettings {
  name: string;
  slug: string;
  website: string | null;
  instagram: string | null;
  telegram: string | null;
  siteActive: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialExpiresAt: string;
  cashbackPercent: number;
}

function UserProfileForm() {
  const { user, language, updateUser } = useAuthStore();
  const t = dashboardTranslations[language];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    photoUrl: user?.photoUrl || '/favicon.png'
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, photoUrl: res.data.url }));
      toast.success(t.common.save);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.patch('/auth/profile', formData);
      updateUser(formData);
      toast.success(t.common.save);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-10 space-y-10 border border-slate-50 dark:border-white/5">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black tracking-tight">{t.settings.profile}</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="shrink-0 flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 overflow-hidden relative group shadow-2xl flex items-center justify-center">
            {formData.photoUrl && !loading ? (
              <img
                src={formData.photoUrl.startsWith('http') || formData.photoUrl.startsWith('/') ? formData.photoUrl : `/api${formData.photoUrl}`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.png';
                }}
              />
            ) : (
              <User className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
            )}
            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
              <Camera className="w-8 h-8 text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Avatar</p>
        </div>

        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Full Name
            </label>
            <input
              type="text"
              className="input-field w-full"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? t.common.loading : t.common.save}
        </button>
      </div>
    </form>
  );
}

export default function Settings() {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/company/me');
        setCompany(res.data);
      } catch (err) {
        console.error('Failed to fetch company:', err);
        setLoading(false); // Phase 1 Fix: Stop loading on error
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/company/me', company);
      setSuccess(true);
      toast.success(t.common.save);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ma\'lumotlarni yuklashda xatolik');
    }
  };

  if (loading || !company) {
    return (
      <div className="space-y-10 animate-pulse p-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-[600px] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem]" />
      </div>
    );
  }

  const expiresAt = new Date(company.trialExpiresAt);
  const daysLeft = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <SettingsIcon className="w-3 h-3" /> {t.sidebar.settings}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t.settings.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* User Profile Section */}
          <UserProfileForm />

          {/* Company Settings Section */}
          <form onSubmit={handleUpdate} className="glass-card p-10 space-y-10 border border-slate-50 dark:border-white/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight">{t.sidebar.company}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> {t.settings.companyAlias}
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={company.name}
                  onChange={e => setCompany({ ...company, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> {t.settings.webDomain}
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={company.website || ''}
                  onChange={e => setCompany({ ...company, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Instagram className="w-3 h-3" /> {t.settings.instagramHandle}
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={company.instagram || ''}
                  onChange={e => setCompany({ ...company, instagram: e.target.value })}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Send className="w-3 h-3" /> {t.settings.telegramChannel}
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={company.telegram || ''}
                  onChange={e => setCompany({ ...company, telegram: e.target.value })}
                  placeholder="@channel_name"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Cashback (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field w-full"
                  value={company.cashbackPercent ?? 0}
                  onChange={e => setCompany({ ...company, cashbackPercent: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Har buyurtmadan dilerga beriladi</p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{t.settings.systemVisibility}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic leading-none">{t.settings.systemVisibilityDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompany({ ...company, siteActive: !company.siteActive })}
                  className={clsx(
                    "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                    company.siteActive ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  )}
                >
                  <div className={clsx("w-4 h-4 bg-white rounded-full shadow-lg transition-all", company.siteActive && "translate-x-6")} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              {success && (
                <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                  {t.settings.settingsSaved}
                </motion.span>
              )}
              <button
                type="submit"
                className="px-10 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {t.settings.saveConfig}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-10 border border-slate-100 dark:border-white/5 relative group">
            <div className="flex items-center gap-3 mb-10 text-blue-600 dark:text-blue-400">
              <Zap className="w-6 h-6" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em]">{t.settings.planDynamics}</p>
            </div>

            <h3 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-slate-900 dark:text-white leading-none">{company.subscriptionPlan}</h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-10">{company.subscriptionStatus}</p>

            <div className="space-y-8">
              <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[60%] shadow-lg shadow-blue-500/50" />
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {t.settings.usagePeriod}</span>
                <span className="text-slate-900 dark:text-white">{daysLeft} {t.settings.daysLeft}</span>
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest transition-all">
              {t.settings.manageBilling}
            </button>
          </div>

          <div className="glass-card p-8 border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-900/10 rounded-[2.5rem]">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-6">
              <CreditCard className="w-6 h-6" />
              <h4 className="font-black uppercase tracking-widest text-xs">{t.settings.accountStatus}</h4>
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-6 leading-relaxed opacity-70 italic">{t.settings.accountStatusDesc}</p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{t.settings.verified}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
