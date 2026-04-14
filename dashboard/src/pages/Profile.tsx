import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import {
  Building2,
  User,
  Camera,
  Save,
  Eye,
  EyeOff,
  Instagram,
  Send,
  Globe,
  Phone,
  MapPin,
  Check,
  X,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import { toast } from "../utils/toast";
import clsx from "clsx";
import { pageTranslations } from "../i18n/translations";

interface CompanyInfo {
  name: string;
  slug: string;
  website: string | null;
  instagram: string | null;
  telegram: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  siteActive: boolean;
  cashbackPercent: number;
}

export default function Profile() {
  const { user, language, updateUser } = useAuthStore();
  const lang =
    language in pageTranslations.profile
      ? (language as keyof typeof pageTranslations.profile)
      : "en";
  const t = pageTranslations.profile[lang];
  const isOwner = user?.roleType === "OWNER";
  const isDemoMode = localStorage.getItem("supplio_demo_mode") === "1";

  // Personal
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPw, setSavingPw] = useState(false);

  // Company
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(isOwner);
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setPhotoUrl(user?.photoUrl || "");
  }, [user?.fullName, user?.photoUrl]);

  useEffect(() => {
    if (!isOwner) return;
    api
      .get("/company/me")
      .then((r) => setCompany(r.data))
      .catch(() => {})
      .finally(() => setLoadingCompany(false));
  }, [isOwner]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      setUploadingPhoto(true);
      const res = await api.post("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;
      setPhotoUrl(url);
      await api.patch("/auth/profile", { photoUrl: url });
      updateUser({ photoUrl: url });
      toast.success(t.photoUpdated);
    } catch {
      toast.error(t.error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (name.length < 2) {
      toast.error(t.minName);
      return;
    }
    try {
      setSavingProfile(true);
      await api.patch("/auth/profile", { fullName: name });
      updateUser({ fullName: name });
      toast.success(t.saved);
    } catch {
      toast.error(t.error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      setSavingCompany(true);
      await api.patch("/company/me", {
        name: company.name,
        website: company.website,
        instagram: company.instagram,
        telegram: company.telegram,
        contactPhone: company.contactPhone,
        contactAddress: company.contactAddress,
      });
      toast.success(t.saved);
    } catch {
      toast.error(t.error);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6) {
      toast.error(t.pwShort);
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error(t.pwMismatch);
      return;
    }
    try {
      setSavingPw(true);
      await api.patch("/auth/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      toast.success(t.pwUpdated);
    } catch {
      toast.error(
        t.wrongCurrentPw
      );
    } finally {
      setSavingPw(false);
    }
  };

  const websiteUrl = company?.website?.trim() || "https://app.supplio.uz";
  const canEditPassword = !isDemoMode;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ── Personal Info ── */}
      <div className="glass-card p-8 border border-slate-100 dark:border-white/5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {t.personalTitle}
          </h2>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg">
              {uploadingPhoto ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : photoUrl ? (
                <img
                  src={
                    photoUrl.startsWith("http") || photoUrl.startsWith("/")
                      ? photoUrl
                      : `/api${photoUrl}`
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.png";
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {user?.fullName || user?.phone}
            </p>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              {user?.roleType?.replace(/_/g, " ") || "STAFF"}
            </span>
            <p className="text-xs text-slate-400 pt-1">
              {t.avatarHint}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.name}
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.phoneReadonly}
              </label>
              <div className="input-field w-full opacity-60 cursor-not-allowed select-none">
                {user?.phone}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                savingProfile ||
                fullName.trim() === (user?.fullName || "").trim()
              }
              className="px-6 py-3 premium-gradient text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>

      {/* ── Company Info (OWNER only) ── */}
      {isOwner && (
        <div className="glass-card p-8 border border-slate-100 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {t.companyTitle}
            </h2>
          </div>

          {loadingCompany ? (
            <div className="flex items-center gap-3 py-4 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-bold">
                {t.loading}
              </span>
            </div>
          ) : company ? (
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> {t.companyName}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.name}
                    onChange={(e) =>
                      setCompany({ ...company, name: e.target.value })
                    }
                    placeholder={t.companyNamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> {t.website}
                  </label>
                  <div className="space-y-2">
                    <a
                      href={websiteUrl || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={clsx(
                        "input-field w-full gap-3",
                        websiteUrl
                          ? "hover:border-blue-300 hover:bg-blue-50/60 dark:hover:bg-slate-900/70"
                          : "pointer-events-none opacity-70"
                      )}
                    >
                      <span className="truncate">
                        {websiteUrl || "https://app.supplio.uz"}
                      </span>
                      {websiteUrl && (
                        <Globe className="w-4 h-4 shrink-0 text-blue-500" />
                      )}
                    </a>
                    <p className="text-[11px] font-medium leading-5 text-slate-400">
                      {t.websiteReadonly}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Send className="w-3 h-3" /> {t.telegramLabel}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.telegram || ""}
                    onChange={(e) =>
                      setCompany({ ...company, telegram: e.target.value })
                    }
                    placeholder={t.telegramPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    {t.contactPhone}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.contactPhone || ""}
                    onChange={(e) =>
                      setCompany({ ...company, contactPhone: e.target.value })
                    }
                    placeholder={t.phonePlaceholder}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {t.officeAddress}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.contactAddress || ""}
                    onChange={(e) =>
                      setCompany({ ...company, contactAddress: e.target.value })
                    }
                    placeholder={t.officeAddressPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Instagram className="w-3 h-3" /> {t.instagramLabel}
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={company.instagram || ""}
                    onChange={(e) =>
                      setCompany({ ...company, instagram: e.target.value })
                    }
                    placeholder={t.instagramPlaceholder}
                  />
                </div>
              </div>

              {/* siteActive info — read-only here, editable in Settings */}
              <div
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold",
                  company.siteActive
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400"
                )}
              >
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full shrink-0",
                    company.siteActive
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  )}
                />
                <span>
                  {company.siteActive
                    ? t.b2bOn
                    : t.b2bOff}
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-6 py-3 premium-gradient text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingCompany ? t.saving : t.save}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-400">{t.notFound}</p>
          )}
        </div>
      )}

      {/* ── Password Change ── */}
      <div className="glass-card p-8 border border-slate-100 dark:border-white/5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Eye className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {t.passwordTitle}
          </h2>
        </div>

        {!canEditPassword && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm font-bold">
            {t.demoPwDisabled}
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4">
          {(["current", "next", "confirm"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {key === "current"
                  ? t.currentPw
                  : key === "next"
                    ? t.newPw
                    : t.confirmPw}
              </label>
              <div className="relative">
                <input
                  type={showPw[key] ? "text" : "password"}
                  className={clsx(
                    "input-field w-full pr-12",
                    key === "confirm" &&
                      pwForm.confirm.length > 0 &&
                      (pwForm.confirm === pwForm.next
                        ? "border-emerald-400"
                        : "border-rose-400")
                  )}
                  placeholder={t.passwordPlaceholder}
                  value={pwForm[key]}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  disabled={!canEditPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                  disabled={!canEditPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw[key] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {key === "confirm" && pwForm.confirm.length > 0 && (
                  <div className="absolute right-11 top-1/2 -translate-y-1/2">
                    {pwForm.confirm === pwForm.next ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              {key === "next" &&
                pwForm.next.length > 0 &&
                pwForm.next.length < 6 && (
                  <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                    <X className="w-3 h-3" /> {t.pwShort}
                  </p>
                )}
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={
                !canEditPassword ||
                savingPw ||
                !pwForm.current ||
                !pwForm.next ||
                !pwForm.confirm
              }
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {savingPw ? t.saving : t.passwordTitle}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
