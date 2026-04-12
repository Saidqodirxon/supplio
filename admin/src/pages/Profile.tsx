import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Camera, Eye, EyeOff, Loader2, Save, User } from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import clsx from "clsx";

export default function Profile() {
  const { user, updateUser, language } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  const isRu = language === "ru";
  const isEn = language === "en";
  const t = {
    profile: isRu ? "Профиль" : isEn ? "Profile" : "Profil",
    fullName: isRu ? "Полное имя" : isEn ? "Full Name" : "To'liq ism",
    phone: isRu ? "Телефон" : isEn ? "Phone" : "Telefon",
    save: isRu ? "Сохранить" : isEn ? "Save" : "Saqlash",
    saving: isRu ? "Сохранение..." : isEn ? "Saving..." : "Saqlanmoqda...",
    updated: isRu ? "Профиль обновлен" : isEn ? "Profile updated" : "Profil yangilandi",
    uploadTip: isRu ? "Нажмите на фото для замены" : isEn ? "Click photo to change" : "Rasmni almashtirish uchun ustiga bosing",
    currentPw: isRu ? "Текущий пароль" : isEn ? "Current password" : "Joriy parol",
    newPw: isRu ? "Новый пароль" : isEn ? "New password" : "Yangi parol",
    confirmPw: isRu ? "Повторите пароль" : isEn ? "Confirm password" : "Parolni takrorlang",
    passwordChanged: isRu ? "Пароль обновлен" : isEn ? "Password updated" : "Parol yangilandi",
    wrongPassword: isRu ? "Неверный текущий пароль" : isEn ? "Wrong current password" : "Joriy parol noto'g'ri",
    mismatch: isRu ? "Пароли не совпадают" : isEn ? "Passwords do not match" : "Parollar mos emas",
    short: isRu ? "Минимум 6 символов" : isEn ? "Minimum 6 characters" : "Kamida 6 ta belgi",
    error: isRu ? "Произошла ошибка" : isEn ? "Something went wrong" : "Xatolik yuz berdi",
  };

  useEffect(() => {
    setFullName(user?.fullName || "");
    setPhotoUrl(user?.photoUrl || "");
  }, [user?.fullName, user?.photoUrl]);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      setUploadingPhoto(true);
      const res = await api.post("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const nextUrl = res.data.url;
      await api.patch("/auth/profile", { photoUrl: nextUrl });
      setPhotoUrl(nextUrl);
      updateUser({ photoUrl: nextUrl });
      toast.success(t.updated);
    } catch {
      toast.error(t.error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      toast.error(t.error);
      return;
    }
    try {
      setSavingProfile(true);
      await api.patch("/auth/profile", { fullName: fullName.trim() });
      updateUser({ fullName: fullName.trim() });
      toast.success(t.updated);
    } catch {
      toast.error(t.error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6) {
      toast.error(t.short);
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error(t.mismatch);
      return;
    }
    try {
      setSavingPw(true);
      await api.patch("/auth/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      toast.success(t.passwordChanged);
    } catch {
      toast.error(t.wrongPassword);
    } finally {
      setSavingPw(false);
    }
  };

  const normalizedPhotoUrl =
    photoUrl && !photoUrl.startsWith("http") && !photoUrl.startsWith("/")
      ? `/api${photoUrl}`
      : photoUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-8 border border-slate-100 dark:border-white/5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.profile}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.roleType || "SUPER_ADMIN"}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg">
              {uploadingPhoto ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : normalizedPhotoUrl ? (
                <img
                  src={normalizedPhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.png";
                  }}
                />
              ) : (
                <User className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.uploadTip}</p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t.fullName}</label>
            <input
              type="text"
              className="input-field w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t.phone}</label>
            <div className="input-field w-full opacity-70 cursor-not-allowed select-none">{user?.phone}</div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 premium-gradient text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-8 border border-slate-100 dark:border-white/5 space-y-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">{isRu ? "Смена пароля" : isEn ? "Change Password" : "Parolni o'zgartirish"}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {(["current", "next", "confirm"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {key === "current" ? t.currentPw : key === "next" ? t.newPw : t.confirmPw}
              </label>
              <div className="relative">
                <input
                  type={showPw[key] ? "text" : "password"}
                  className={clsx("input-field w-full pr-12")}
                  value={pwForm[key]}
                  onChange={(e) => setPwForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingPw ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
