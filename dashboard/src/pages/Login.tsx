import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Phone,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { dashboardTranslations } from "../i18n/translations";
import { LangSelect } from "../components/LangSelect";
import { formatPhoneNumber, unformatPhoneNumber } from "../utils/formatters";
import api from "../services/api";

const DEMO_MODE_STORAGE_KEY = "supplio_demo_mode";
const DEMO_FULL_ACCESS_STORAGE_KEY = "supplio_demo_full_access";
const DEMO_PHONE = "+998000000000";
const DEMO_PASSWORD = "demo1234";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setAuth, language } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoFullAccess, setIsDemoFullAccess] = useState(false);
  const t = dashboardTranslations[language].login;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const hostDemo =
      window.location.hostname === "demo.supplio.uz" ||
      window.location.hostname === "www.demo.supplio.uz" ||
      window.location.hostname.startsWith("demo.") ||
      window.location.hostname.startsWith("www.demo.");
    const params = new URLSearchParams(window.location.search);
    const demoParam = (params.get("demo") || "").toLowerCase();
    const accessParam = (params.get("access") || "").toLowerCase();
    const queryDemo =
      demoParam === "1" || demoParam === "true" || demoParam === "yes";
    const queryFull =
      accessParam === "full" ||
      accessParam === "edit" ||
      accessParam === "write";
    const queryView =
      accessParam === "view" ||
      accessParam === "readonly" ||
      accessParam === "read";

    if (queryFull) {
      localStorage.setItem(DEMO_FULL_ACCESS_STORAGE_KEY, "1");
    } else if (queryView) {
      localStorage.setItem(DEMO_FULL_ACCESS_STORAGE_KEY, "0");
    }

    if (hostDemo || queryDemo) {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, "1");
      setIsDemoMode(true);
      setIsDemoFullAccess(
        localStorage.getItem(DEMO_FULL_ACCESS_STORAGE_KEY) === "1"
      );
      setPhoneNumber(formatPhoneNumber(DEMO_PHONE));
      setPassword(DEMO_PASSWORD);
      return;
    }

    setIsDemoMode(localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "1");
    setIsDemoFullAccess(
      localStorage.getItem(DEMO_FULL_ACCESS_STORAGE_KEY) === "1"
    );
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/public/home");
        if (res.data?.settings?.superAdminPhone) {
          setAdminPhone(res.data.settings.superAdminPhone);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isDemoMode && unformatPhoneNumber(phoneNumber) !== DEMO_PHONE) {
      setError("Demo rejimda faqat +998 00 000 00 00 bilan kirish mumkin");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        phone: unformatPhoneNumber(phoneNumber),
        password: password,
      });

      const { user, token } = response.data;
      setAuth(user, token);
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Authentication failed. Please check credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden font-outfit transition-colors duration-500">
      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LangSelect />
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm backdrop-blur-xl transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Abstract Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card bg-white dark:!bg-white/[0.03] border-slate-200 dark:!border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 transform hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Supplio"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {t.welcomeBack}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t.signInSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isDemoMode && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-400/30 bg-blue-50 dark:bg-blue-500/10 p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                  Demo credentials
                </p>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 space-y-1">
                  <p>Login: {DEMO_PHONE}</p>
                  <p>Password: {DEMO_PASSWORD}</p>
                  {isDemoFullAccess ? (
                    <p className="text-emerald-700 dark:text-emerald-300">
                      Full access ochilgan (edit/create ruxsat)
                    </p>
                  ) : (
                    <p className="text-blue-700 dark:text-blue-300">
                      To'liq edit/create uchun avval so'rov yuboring.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber(formatPhoneNumber(DEMO_PHONE));
                    setPassword(DEMO_PASSWORD);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  Login ma'lumotini to'ldirish
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                {t.phoneNumber}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                  <Phone className="h-5 w-5 opacity-40 text-slate-400 dark:text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  className="w-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="+998 90 123 45 67"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(formatPhoneNumber(e.target.value))
                  }
                  readOnly={isDemoMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {t.password}
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 uppercase tracking-widest"
                >
                  {t.forgot}
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5 opacity-40 text-slate-400 dark:text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-button !py-4 !text-base group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {t.signIn}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-slate-500 dark:text-slate-500 text-xs font-medium">
            {t.security}
            <br />
            {t.copyright}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2 alternate; }
      `}</style>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForgotModalOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {t.forgotTitle}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                  {t.forgotDesc}
                </p>

                <div className="space-y-4">
                  <a
                    href={`tel:${adminPhone || "+998901234567"}`}
                    className="flex items-center justify-center gap-3 w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    {adminPhone || "+998 90 123 45 67"}
                  </a>
                  <button
                    onClick={() => setIsForgotModalOpen(false)}
                    className="w-full text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {dashboardTranslations[language].common.close}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
