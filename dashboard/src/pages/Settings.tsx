import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Camera,
  Info,
  TrendingUp,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { dashboardTranslations } from "../i18n/translations";
import api from "../services/api";
import { motion } from "framer-motion";
import clsx from "clsx";
import { toast } from "../utils/toast";
import UpgradeModal from "../components/UpgradeModal";
import { usePlanLimits } from "../hooks/usePlanLimits";

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

// Cashback explanation per language (sodda til)
// Cashback: distributor sets % for their DEALERS — not received from system
const CASHBACK_HELP: Record<string, string> = {
  uz: "Cashback — siz (distributor) dilerlaringizga beradigan bonus. Masalan: 5% → diler 100,000 so'm buyurtma bersa, uning hisobiga 5,000 so'm bonus qo'shiladi. Bu bonus keyingi buyurtmasida chegirma sifatida ishlatiladi. Tizim sizga cashback bermaydi — bu siz dilerga beradigan rag'bat.",
  en: "Cashback — a bonus YOU (the distributor) give to your dealers. Example: 5% → on a 100,000 UZS order the dealer earns 5,000 UZS bonus, applied as a discount on their next order. The system does not give cashback to you — you give it to your dealers as an incentive.",
  oz: "Кэшбэк — сиз (дистрибутор) дилерларингизга берадиган бонус. Масалан: 5% → дилер 100,000 сўм буюртма берса, унинг ҳисобига 5,000 сўм бонус қўшилади. Тизим сизга кэшбэк бермайди — бу сиз дилерга берадиган рағбат.",
  ru: "Кэшбэк — бонус, который ВЫ (дистрибьютор) даёте своим дилерам. Пример: 5% → при заказе на 100,000 сум дилер получает бонус 5,000 сум, который применяется как скидка при следующем заказе. Система не даёт кэшбэк вам — вы даёте его дилерам в качестве стимула.",
  tr: "Cashback — SİZİN (distribütör) bayilerinize verdiğiniz bir bonustur. Örnek: %5 → 100.000 UZS siparişte bayi 5.000 UZS bonus kazanır, bu bonus sonraki siparişte indirim olarak uygulanır. Sistem size cashback vermez — siz bunu bayilerinize teşvik olarak verirsiniz.",
};

function UserProfileForm() {
  const { user, language, updateUser } = useAuthStore();
  const t = dashboardTranslations[language];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    photoUrl: user?.photoUrl || "/favicon.png",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      setLoading(true);
      const res = await api.post("/upload/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, photoUrl: res.data.url }));
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
      await api.patch("/auth/profile", formData);
      updateUser(formData);
      toast.success(t.common.save);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-8 space-y-8 border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <User className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          {t.settings.profile}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Avatar */}
        <div className="shrink-0 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 overflow-hidden relative group shadow-xl flex items-center justify-center">
            {formData.photoUrl && !loading ? (
              <img
                src={
                  formData.photoUrl.startsWith("http") ||
                  formData.photoUrl.startsWith("/")
                    ? formData.photoUrl
                    : `/api${formData.photoUrl}`
                }
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/favicon.png";
                }}
              />
            ) : (
              <User className="w-10 h-10 text-slate-300 dark:text-slate-600 animate-pulse" />
            )}
            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm rounded-full">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Avatar
          </p>
        </div>

        {/* Name */}
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t.settings.profile} — {t.common.edit}
          </label>
          <input
            type="text"
            className="input-field w-full"
            value={formData.fullName}
            placeholder={t.superadmin.fullNameLabel}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
          <p className="text-[10px] text-slate-400 font-semibold">
            {user?.phone} · {user?.roleType?.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? t.common.loading : t.common.save}
        </button>
      </div>
    </form>
  );
}

function UserSecurityForm() {
  const { user, language, updateUser } = useAuthStore();
  const t = dashboardTranslations[language];
  const [savingProfile, setSavingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [savingPassword, setSavingPassword] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    setFullName(user?.fullName || "");
  }, [user?.fullName]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = fullName.trim();

    if (normalizedName.length < 2) {
      toast.error("Ism kamida 2 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      setSavingProfile(true);
      await api.patch("/auth/profile", { fullName: normalizedName });
      updateUser({ fullName: normalizedName });
      toast.success("Ism yangilandi");
    } catch {
      toast.error(t.common.error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword)
      return toast.error(t.common.error);
    if (passwordForm.newPassword.length < 6)
      return toast.error("Yangi parol kamida 6 ta belgi bo‘lishi kerak");
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error("Yangi parollar mos emas");

    try {
      setSavingPassword(true);
      await api.patch("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Parol yangilandi");
    } catch {
      toast.error("Joriy parol noto‘g‘ri yoki amal bajarilmadi");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRequestReset = async () => {
    try {
      setRequestingReset(true);
      await api.post("/auth/request-password-reset");
      toast.success("SuperAdmin ga parol reset so‘rovi yuborildi");
    } catch {
      toast.error(t.common.error);
    } finally {
      setRequestingReset(false);
    }
  };

  return (
    <div className="glass-card p-8 space-y-8 border border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          {t.settings.profile}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t.superadmin.fullNameLabel}
          </label>
          <input
            type="text"
            className="input-field w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t.superadmin.fullNameLabel}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t.settings.phone}
          </label>
          <div className="input-field w-full opacity-80 cursor-not-allowed">
            {user?.phone || "-"}
          </div>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="flex justify-end">
        <button
          type="submit"
          disabled={savingProfile || fullName.trim() === (user?.fullName || "").trim()}
          className="px-8 py-3.5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {savingProfile ? t.common.loading : "Ismni saqlash"}
        </button>
      </form>

      <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/70 dark:bg-amber-900/10 px-5 py-4">
        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 leading-relaxed">
          Telefon raqami faqat SuperAdmin tomonidan boshqariladi. Ismni bu
          yerda yangilashingiz mumkin.
        </p>
      </div>

      <form
        onSubmit={handlePasswordChange}
        className="space-y-4 rounded-3xl border border-slate-100 dark:border-white/5 p-6 bg-slate-50/70 dark:bg-white/[0.03]"
      >
        {/* Current password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Joriy parol
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              className="input-field w-full pr-14"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords((p) => ({ ...p, current: !p.current }))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPasswords.current ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Yangi parol
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              className="input-field w-full pr-14"
              placeholder="Kamida 6 ta belgi"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPasswords.new ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {passwordForm.newPassword.length > 0 &&
            passwordForm.newPassword.length < 6 && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <X className="w-3 h-3" /> Kamida 6 ta belgi
              </p>
            )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Yangi parolni takrorlang
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              className={`input-field w-full pr-14 transition-all ${passwordForm.confirmPassword.length > 0 ? (passwordForm.confirmPassword === passwordForm.newPassword ? "border-emerald-400 focus:border-emerald-500" : "border-rose-400 focus:border-rose-500") : ""}`}
              placeholder="Parolni qayta kiriting"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {passwordForm.confirmPassword.length > 0 && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                {passwordForm.confirmPassword === passwordForm.newPassword ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-rose-500" />
                )}
              </div>
            )}
          </div>
          {passwordForm.confirmPassword.length > 0 &&
            passwordForm.confirmPassword !== passwordForm.newPassword && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <X className="w-3 h-3" /> Parollar mos emas
              </p>
            )}
          {passwordForm.confirmPassword.length > 0 &&
            passwordForm.confirmPassword === passwordForm.newPassword && (
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Parollar mos
              </p>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between pt-2">
          <button
            type="button"
            onClick={handleRequestReset}
            disabled={requestingReset}
            className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {requestingReset
              ? t.common.loading
              : "SuperAdmin dan reset so'rash"}
          </button>
          <button
            type="submit"
            disabled={savingPassword}
            className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {savingPassword ? t.common.loading : "Parolni saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}

void UserProfileForm;

export default function Settings() {
  const { user, language } = useAuthStore();
  const t = dashboardTranslations[language];
  const navigate = useNavigate();
  const { showUpgrade, setShowUpgrade, upgradeReason, triggerUpgrade } =
    usePlanLimits();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);

  const role = user?.roleType ?? "";
  const isOwnerOrAdmin = role === "OWNER" || role === "SUPER_ADMIN";

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/company/me");
        setCompany(res.data);
      } catch {
        // Manager/Seller might not have access to company/me - that's OK
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      await api.patch("/company/me", company);
      setSuccess(true);
      toast.success(t.settings.settingsSaved);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      toast.error(t.common.error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-[2rem]" />
      </div>
    );
  }

  const daysLeft = company
    ? Math.ceil(
        (new Date(company.trialExpiresAt).getTime() - Date.now()) /
          (1000 * 3600 * 24)
      )
    : 0;

  const cashbackHelp = CASHBACK_HELP[language] ?? CASHBACK_HELP.uz;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100 dark:border-indigo-900/50">
            <SettingsIcon className="w-3 h-3" /> {t.sidebar.settings}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {t.settings.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest opacity-70">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      <div
        className={
          isOwnerOrAdmin
            ? "grid grid-cols-1 lg:grid-cols-3 gap-8"
            : "flex flex-col justify-start items-center"
        }
      >
        {/* Left col */}
        <div
          className={
            isOwnerOrAdmin
              ? "lg:col-span-2 space-y-8"
              : "w-full max-w-2xl space-y-8"
          }
        >
          {/* Profile — everyone sees this */}
          <UserSecurityForm />

          {/* Company Settings — only OWNER and SUPER_ADMIN */}
          {isOwnerOrAdmin && company && (
            <form
              onSubmit={handleUpdate}
              className="glass-card p-8 space-y-8 border border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {t.sidebar.company}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />{" "}
                    {t.settings.companyAlias}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.name}
                    onChange={(e) =>
                      setCompany({ ...company, name: e.target.value })
                    }
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> {t.settings.webDomain}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.website || ""}
                    onChange={(e) =>
                      setCompany({ ...company, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Instagram className="w-3 h-3" /> Instagram
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.instagram || ""}
                    onChange={(e) =>
                      setCompany({ ...company, instagram: e.target.value })
                    }
                    placeholder="@username"
                  />
                </div>

                {/* Telegram */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Send className="w-3 h-3" /> Telegram
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.telegram || ""}
                    onChange={(e) =>
                      setCompany({ ...company, telegram: e.target.value })
                    }
                    placeholder="@channel_name"
                  />
                </div>

                {/* Cashback — only OWNER/SUPER_ADMIN */}
                <div className="sm:col-span-2 space-y-3 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <label className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />{" "}
                    {(t.settings as Record<string, string>).cashback ||
                      "Cashback (%)"}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      className="input-field w-32"
                      value={company.cashbackPercent ?? 0}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          cashbackPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="text-sm font-black text-slate-500 dark:text-slate-400">
                      %
                    </span>
                  </div>
                  {/* Cashback explanation — sodda til bilan */}
                  <div className="flex items-start gap-2 mt-2">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                      {cashbackHelp}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Visibility toggle — only OWNER/SUPER_ADMIN */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                      {t.settings.systemVisibility}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                      {t.settings.systemVisibilityDesc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCompany({
                        ...company,
                        siteActive: !company.siteActive,
                      })
                    }
                    className={clsx(
                      "w-12 h-6 rounded-full transition-all relative flex items-center px-1 shrink-0",
                      company.siteActive
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-200",
                        company.siteActive && "translate-x-6"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4">
                {success && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black text-emerald-500 uppercase tracking-widest"
                  >
                    {t.settings.settingsSaved}
                  </motion.span>
                )}
                <button
                  type="submit"
                  className="px-8 py-3.5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {t.settings.saveConfig}
                </button>
              </div>
            </form>
          )}

          {/* Info card for managers/sellers — they don't see company form */}
          {!isOwnerOrAdmin && (
            <div className="glass-card p-8 border border-slate-100 dark:border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {t.settings.profile}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {language === "uz"
                    ? "Kompaniya sozlamalarini faqat rahbar o'zgartira oladi."
                    : language === "ru"
                      ? "Настройки компании может изменить только руководитель."
                      : "Only the company owner can change company settings."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right col — subscription + account status */}
        {isOwnerOrAdmin && company && (
          <div className="space-y-6">
            {/* Subscription card */}
            <div className="glass-card p-8 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
                <Zap className="w-5 h-5" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em]">
                  {t.settings.planDynamics}
                </p>
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none mb-1">
                {company.subscriptionPlan}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">
                {company.subscriptionStatus}
              </p>
              <div className="space-y-6">
                <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[60%] shadow-lg shadow-blue-500/30" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />{" "}
                    {t.settings.usagePeriod}
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {daysLeft} {t.settings.daysLeft}
                  </span>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => navigate("/subscription")}
                  className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:opacity-90 active:scale-95"
                >
                  {t.settings.manageBilling}
                </button>
                <button
                  onClick={() => triggerUpgrade()}
                  className="w-full py-3.5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {language === "uz"
                    ? "Tarifni oshirish"
                    : language === "ru"
                      ? "Повысить тариф"
                      : language === "tr"
                        ? "Planı Yükselt"
                        : language === "oz"
                          ? "Тарифни ошириш"
                          : "Upgrade Plan"}
                </button>
              </div>
            </div>

            {/* Account status */}
            <div className="glass-card p-7 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[2rem]">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
                <CreditCard className="w-5 h-5" />
                <h4 className="font-black uppercase tracking-widest text-xs">
                  {t.settings.accountStatus}
                </h4>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-4 leading-relaxed opacity-80">
                {t.settings.accountStatusDesc}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {t.settings.verified}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
        currentPlan={company?.subscriptionPlan}
        language={language}
      />
    </div>
  );
}
