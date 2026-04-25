import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Circle,
  ChevronRight,
  Clock,
  Phone,
  Power,
  CalendarClock,
  Info,
} from "lucide-react";
import api from "../services/api";
import { toast } from "../utils/toast";
import clsx from "clsx";
import { useAuthStore } from "../store/authStore";
import { dashboardTranslations, pageTranslations } from "../i18n/translations";
import { getApiErrorMessage } from "../utils/apiError";

const T = pageTranslations.telegramBots;
type Lang = keyof typeof T;

function getPublicStoreBaseUrl() {
  return (
    import.meta.env.VITE_PUBLIC_STORE_BASE_URL || "https://supplio.uz"
  ).replace(/\/+$/, "");
}

interface Bot {
  id: string;
  botName: string | null;
  description: string | null;
  token: string;
  username: string | null;
  status?: string;
}

interface BotFormData {
  token: string;
  botName: string;
  description: string;
}

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface DaySchedule {
  open: string;
  close: string;
  active: boolean;
}

type WorkingHoursSchedule = Record<DayKey, DaySchedule>;

const DAY_LABELS: Record<DayKey, Record<string, string>> = {
  mon: { uz: "Dushanba", ru: "Понедельник", en: "Monday", oz: "Душанба" },
  tue: { uz: "Seshanba", ru: "Вторник", en: "Tuesday", oz: "Сешанба" },
  wed: { uz: "Chorshanba", ru: "Среда", en: "Wednesday", oz: "Чоршанба" },
  thu: { uz: "Payshanba", ru: "Четверг", en: "Thursday", oz: "Пайшанба" },
  fri: { uz: "Juma", ru: "Пятница", en: "Friday", oz: "Жума" },
  sat: { uz: "Shanba", ru: "Суббота", en: "Saturday", oz: "Шанба" },
  sun: { uz: "Yakshanba", ru: "Воскресенье", en: "Sunday", oz: "Якшанба" },
};

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DEFAULT_SCHEDULE: WorkingHoursSchedule = {
  mon: { open: "09:00", close: "18:00", active: true },
  tue: { open: "09:00", close: "18:00", active: true },
  wed: { open: "09:00", close: "18:00", active: true },
  thu: { open: "09:00", close: "18:00", active: true },
  fri: { open: "09:00", close: "18:00", active: true },
  sat: { open: "09:00", close: "14:00", active: false },
  sun: { open: "09:00", close: "14:00", active: false },
};

const STATUS_COLOR: Record<string, string> = {
  connected: "text-emerald-600 bg-emerald-500/10",
  stopped: "text-amber-600 bg-amber-500/10",
  not_found: "text-slate-400 bg-slate-500/10",
};

const STATUS_ICON: Record<string, ReactNode> = {
  connected: <CheckCircle className="w-3.5 h-3.5" />,
  stopped: <AlertCircle className="w-3.5 h-3.5" />,
  not_found: <Circle className="w-3.5 h-3.5" />,
};

export default function TelegramBots() {
  const { language } = useAuthStore();
  const lang = (language in T ? language : "en") as Lang;
  const t = T[lang];
  const dt =
    dashboardTranslations[language as keyof typeof dashboardTranslations] ??
    dashboardTranslations.en;

  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BotFormData>({
    token: "",
    botName: "",
    description: "",
  });
  const [validating, setValidating] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"idle" | "valid" | "invalid">(
    "idle"
  );
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BotFormData>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [reloadingBots, setReloadingBots] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    sent: number;
    failed: number;
  } | null>(null);

  // Bot schedule settings
  const [schedule, setSchedule] =
    useState<WorkingHoursSchedule>(DEFAULT_SCHEDULE);
  const [botPaused, setBotPaused] = useState(false);
  const [botAutoSchedule, setBotAutoSchedule] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Group notifications
  const [logGroupChatId, setLogGroupChatId] = useState("");
  const [orderGroupChatId, setOrderGroupChatId] = useState("");
  const [testingGroup, setTestingGroup] = useState<"log" | "order" | null>(
    null
  );
  const [sendingReport, setSendingReport] = useState(false);

  const errorText = (error: unknown, fallback: string) =>
    getApiErrorMessage(error, fallback, language);

  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const [botsRes, companyRes] = await Promise.all([
        api.get("/telegram/bots"),
        api.get("/company/me"),
      ]);
      setBots(botsRes.data);
      const c = companyRes.data;
      if (c?.slug) setStoreUrl(`${getPublicStoreBaseUrl()}/store/${c.slug}`);
      // Hydrate bot settings
      setBotPaused(c?.botPaused ?? false);
      setBotAutoSchedule(c?.botAutoSchedule ?? true);
      setLogGroupChatId(c?.logGroupChatId ?? "");
      setOrderGroupChatId(c?.orderGroupChatId ?? "");
      if (c?.workingHours) {
        try {
          setSchedule({ ...DEFAULT_SCHEDULE, ...JSON.parse(c.workingHours) });
        } catch {}
      }
    } catch {
      toast.error(errorText(undefined, dt.common?.error ?? "Error"));
    } finally {
      setLoading(false);
    }
  }, [dt.common?.error]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const validateToken = async () => {
    if (!form.token.trim()) return;
    setValidating(true);
    setTokenStatus("idle");
    try {
      await api.post("/telegram/bots/validate", { token: form.token.trim() });
      setTokenStatus("valid");
    } catch {
      setTokenStatus("invalid");
      toast.error(errorText(undefined, t.invalid));
    } finally {
      setValidating(false);
    }
  };

  const createBot = async () => {
    if (!form.token.trim()) return;
    setCreating(true);
    try {
      await api.post("/telegram/bots", {
        token: form.token.trim(),
        botName: form.botName.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      toast.success(t.create);
      setShowForm(false);
      setForm({ token: "", botName: "", description: "" });
      setTokenStatus("idle");
      fetchBots();
    } catch (e: any) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await api.patch(`/telegram/bots/${id}`, editForm);
      toast.success(dt.common?.save ?? "Saved");
      setEditId(null);
      fetchBots();
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setSaving(false);
    }
  };

  const deleteBot = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/telegram/bots/${id}`);
      toast.success(dt.common?.delete ?? "Deleted");
      setBots((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return toast.error(dt.common?.error ?? "Error");
    if (
      !window.confirm(
        t.broadcastConfirm.replace("{count}", String(bots.length))
      )
    )
      return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await api.post("/telegram/broadcast", {
        message: broadcastMsg,
      });
      setBroadcastResult(res.data);
      toast.success(`${res.data.sent} ${t.saved}`);
      setBroadcastMsg("");
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setBroadcasting(false);
    }
  };

  const handleReloadBots = async () => {
    setReloadingBots(true);
    try {
      const res = await api.post("/telegram/bots/reload");
      const count = Number(res?.data?.reloaded ?? 0);
      toast.success(`${count} ${t.reloadBots}`);
      await fetchBots();
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setReloadingBots(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.patch("/company/me", {
        botPaused,
        botAutoSchedule,
        workingHours: JSON.stringify(schedule),
        logGroupChatId: logGroupChatId.trim() || null,
        orderGroupChatId: orderGroupChatId.trim() || null,
      });
      toast.success(t.saved);
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setSavingSettings(false);
    }
  };

  const testGroup = async (type: "log" | "order") => {
    setTestingGroup(type);
    try {
      await api.post(`/telegram/groups/test/${type}`);
      toast.success(t.testSent);
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setTestingGroup(null);
    }
  };

  const sendManualReport = async () => {
    setSendingReport(true);
    try {
      await api.post("/telegram/groups/report");
      toast.success(t.reportSent);
    } catch (e) {
      toast.error(errorText(e, dt.common?.error ?? "Error"));
    } finally {
      setSendingReport(false);
    }
  };

  const maskToken = (token: string) => {
    const parts = token.split(":");
    if (parts.length !== 2) return "••••••••••";
    return `${parts[0]}:${"•".repeat(Math.min(parts[1].length, 12))}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReloadBots}
            disabled={reloadingBots}
            className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 disabled:opacity-60"
          >
            {reloadingBots ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {t.reloadBots}
          </button>
          <button
            onClick={fetchBots}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setTokenStatus("idle");
              setForm({ token: "", botName: "", description: "" });
            }}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t.addBot}
          </button>
        </div>
      </div>

      {/* Add Bot Form */}
      {showForm && (
        <div className="rounded-3xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white">
                {t.addBot}
              </h3>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* BotFather quick-start */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-[#29aee6]/10 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-[#29aee6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-700 dark:text-white">
                {t.noBotYetTitle}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {t.noBotYetDesc}
              </p>
            </div>
            <a
              href="https://t.me/BotFather?start=newbot"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2.5 bg-[#29aee6] text-white rounded-xl text-xs font-black hover:bg-[#1a9fd6] transition-all active:scale-95 whitespace-nowrap"
            >
              {t.openBotFather}
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                {t.botName}
              </label>
              <input
                value={form.botName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, botName: e.target.value }))
                }
                placeholder={t.botNamePlaceholder}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                {t.description}
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder={t.descriptionPlaceholder}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              {t.token} *
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  value={form.token}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, token: e.target.value }));
                    setTokenStatus("idle");
                  }}
                  placeholder={t.tokenPlaceholder}
                  className={clsx(
                    "w-full px-4 py-3 rounded-2xl border bg-white dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-mono",
                    tokenStatus === "valid"
                      ? "border-emerald-400 focus:ring-emerald-500/50"
                      : tokenStatus === "invalid"
                        ? "border-rose-400 focus:ring-rose-500/50"
                        : "border-slate-200 dark:border-white/10 focus:ring-blue-500/50"
                  )}
                />
                {tokenStatus !== "idle" && (
                  <div
                    className={clsx(
                      "absolute right-4 top-1/2 -translate-y-1/2",
                      tokenStatus === "valid"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    )}
                  >
                    {tokenStatus === "valid" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={validateToken}
                disabled={!form.token.trim() || validating}
                className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black disabled:opacity-50 transition-all active:scale-95 shrink-0 flex items-center gap-2"
              >
                {validating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {validating ? t.validating : t.validate}
              </button>
            </div>
            {tokenStatus !== "idle" && (
              <p
                className={clsx(
                  "text-xs font-bold mt-2",
                  tokenStatus === "valid" ? "text-emerald-600" : "text-rose-500"
                )}
              >
                {tokenStatus === "valid" ? t.valid : t.invalid}
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-xs font-semibold text-blue-700 dark:text-blue-300">
            {t.storeUrlInfo}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              {t.cancel}
            </button>
            <button
              onClick={createBot}
              disabled={creating || !form.token.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {creating ? t.creating : t.create}
            </button>
          </div>
        </div>
      )}

      {/* Bot List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : bots.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Bot className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="font-black text-slate-700 dark:text-slate-300">
              {t.noBots}
            </p>
            <p className="text-sm text-slate-400 mt-1">{t.noBotsDesc}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.addBot}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 transition-all hover:shadow-lg dark:hover:shadow-black/20"
            >
              {editId === bot.id ? (
                /* Edit mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                        {t.botName}
                      </label>
                      <input
                        value={editForm.botName ?? bot.botName ?? ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            botName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                        {t.description}
                      </label>
                      <input
                        value={editForm.description ?? bot.description ?? ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditId(null)}
                      className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => saveEdit(bot.id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-black disabled:opacity-50 transition-all active:scale-95"
                    >
                      {saving && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      {saving ? t.saving : t.save}
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-black text-slate-900 dark:text-white">
                          {bot.botName || bot.username || "Unnamed Bot"}
                        </h3>
                        {bot.username && (
                          <span className="text-xs font-bold text-slate-400">
                            @{bot.username}
                          </span>
                        )}
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                            STATUS_COLOR[bot.status ?? "not_found"]
                          )}
                        >
                          {STATUS_ICON[bot.status ?? "not_found"]}
                          {t[(bot.status ?? "not_found") as keyof typeof t] ??
                            t.not_found}
                        </span>
                      </div>
                      {bot.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {bot.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/10">
                          {maskToken(bot.token)}
                        </span>
                      </div>
                      {bot.username && (
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`https://t.me/${bot.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#29aee6] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            t.me/{bot.username}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://t.me/${bot.username}`
                              );
                              toast.success("Copied!");
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {storeUrl && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-bold">
                            {t.storeUrl}:
                          </span>
                          <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {storeUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(storeUrl);
                              toast.success("Copied!");
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditId(bot.id);
                        setEditForm({
                          botName: bot.botName ?? "",
                          description: bot.description ?? "",
                        });
                      }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t.deleteConfirm)) deleteBot(bot.id);
                      }}
                      disabled={deletingId === bot.id}
                      className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      {deletingId === bot.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bot Schedule & Contact Settings */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 p-8 space-y-7">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">
              {lang === "ru"
                ? "Настройки бота"
                : lang === "en"
                  ? "Bot Settings"
                  : "Bot sozlamalari"}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {lang === "ru"
                ? "Ish vaqti va ishlash rejimi"
                : lang === "en"
                  ? "Working hours and behavior"
                  : "Ish vaqti va ishlash rejimi"}
            </p>
          </div>
        </div>

        {/* Toggles row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bot pause toggle */}
          <button
            onClick={() => setBotPaused((p) => !p)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              botPaused
                ? "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10"
                : "border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${botPaused ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-slate-800 dark:text-white">
                {lang === "ru"
                  ? "Ручная пауза"
                  : lang === "en"
                    ? "Manual pause"
                    : "Qo'lda to'xtatish"}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {botPaused
                  ? lang === "ru"
                    ? "Бот сейчас остановлен"
                    : lang === "en"
                      ? "Bot is currently paused"
                      : "Bot hozir to'xtatilgan"
                  : lang === "ru"
                    ? "Бот работает"
                    : lang === "en"
                      ? "Bot is running"
                      : "Bot ishlayapti"}
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${botPaused ? "bg-rose-500" : "bg-slate-200 dark:bg-white/20"}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${botPaused ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
          </button>

          {/* Auto schedule toggle */}
          <button
            onClick={() => setBotAutoSchedule((p) => !p)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              botAutoSchedule
                ? "border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10"
                : "border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${botAutoSchedule ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600" : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-slate-800 dark:text-white">
                {lang === "ru"
                  ? "Авто по расписанию"
                  : lang === "en"
                    ? "Auto schedule"
                    : "Avto jadval"}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {botAutoSchedule
                  ? lang === "ru"
                    ? "Бот следует расписанию"
                    : lang === "en"
                      ? "Bot follows schedule"
                      : "Bot jadvalga mos ishlaydi"
                  : lang === "ru"
                    ? "Расписание не применяется"
                    : lang === "en"
                      ? "Schedule disabled"
                      : "Jadval qo'llanilmaydi"}
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${botAutoSchedule ? "bg-indigo-500" : "bg-slate-200 dark:bg-white/20"}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${botAutoSchedule ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
          </button>
        </div>

        {/* Working hours table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {lang === "ru"
                ? "Расписание работы"
                : lang === "en"
                  ? "Working schedule"
                  : "Ish jadvali"}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
            {DAY_KEYS.map((key, i) => {
              const day = schedule[key];
              const label = DAY_LABELS[key][lang] ?? DAY_LABELS[key].en;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 px-4 py-3 ${i < DAY_KEYS.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""} ${!day.active ? "opacity-50" : ""}`}
                >
                  {/* Day name + toggle */}
                  <button
                    onClick={() =>
                      setSchedule((s) => ({
                        ...s,
                        [key]: { ...s[key], active: !s[key].active },
                      }))
                    }
                    className="flex items-center gap-2 w-36 shrink-0"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${day.active ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-600"}`}
                    >
                      {day.active && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 select-none">
                      {label}
                    </span>
                  </button>

                  {/* Open time */}
                  <input
                    type="time"
                    value={day.open}
                    disabled={!day.active}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        [key]: { ...s[key], open: e.target.value },
                      }))
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 w-28"
                  />
                  <span className="text-slate-300 text-sm font-bold">–</span>
                  {/* Close time */}
                  <input
                    type="time"
                    value={day.close}
                    disabled={!day.active}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        [key]: { ...s[key], close: e.target.value },
                      }))
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 w-28"
                  />
                  {!day.active && (
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      {lang === "ru"
                        ? "Выходной"
                        : lang === "en"
                          ? "Day off"
                          : "Dam olish"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info hint */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
            {lang === "ru"
              ? "Дилеры могут написать /info в боте, чтобы увидеть часы работы, телефон и адрес в любое время."
              : lang === "en"
                ? "Dealers can type /info in the bot at any time to see working hours, phone and address."
                : "Dilerlar istalgan vaqtda botda /info yozib ish vaqti, telefon va manzilni ko'rishlari mumkin."}
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={saveSettings}
          disabled={savingSettings}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {savingSettings ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {lang === "ru"
            ? "Сохранить настройки"
            : lang === "en"
              ? "Save settings"
              : "Sozlamalarni saqlash"}
        </button>
      </div>


      {/* Group Notifications */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">
                {lang === "ru" ? "Группы уведомлений" : lang === "en" ? "Group Notifications" : "Guruh bildirishnomalari"}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {lang === "ru" ? "Уведомления в Telegram группах" : lang === "en" ? "Telegram group notifications" : "Telegram guruhlarga bildirishnomalar"}
              </p>
            </div>
          </div>
          <button
            disabled={sendingReport}
            onClick={sendManualReport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-40"
          >
            {sendingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {t.dailyReportNow}
          </button>
        </div>

        {/* How-to */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-black text-slate-700 dark:text-slate-200">
              {lang === "ru" ? "Qanday ulash:" : lang === "en" ? "How to connect:" : "Qanday ulash:"}
            </p>
            <p>1. {lang === "ru" ? "Botingizni guruhga admin sifatida qo'shing" : lang === "en" ? "Add your bot to the group as admin" : "Botingizni guruhga admin sifatida qo'shing"}</p>
            <p>2. {lang === "ru" ? "Guruhda /chatid yozing" : lang === "en" ? "Send /chatid in the group" : "Guruhda /chatid yozing"}</p>
            <p>3. {lang === "ru" ? "Chat ID ni quyidagi maydonga kiriting" : lang === "en" ? "Paste the Chat ID below" : "Chat ID ni quyidagi maydonga kiriting"}</p>
          </div>
        </div>

        {/* Two group cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Log group */}
          <div className={clsx(
            "rounded-2xl border-2 p-5 space-y-4 transition-all",
            logGroupChatId.trim()
              ? "border-violet-200 dark:border-violet-700/40 bg-violet-50/30 dark:bg-violet-900/10"
              : "border-slate-100 dark:border-white/10"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-black text-sm text-slate-800 dark:text-white">
                    {lang === "ru" ? "Группа логов и бэкапов" : lang === "en" ? "Log & Backup Group" : "Log va backup guruhi"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {lang === "ru" ? "Активность, отчёты, резервные копии" : lang === "en" ? "Activity, reports, backups" : "Faoliyat, hisobotlar, backuplar"}
                  </p>
                </div>
              </div>
              <span className={clsx(
                "text-[10px] font-black px-2 py-0.5 rounded-full",
                logGroupChatId.trim()
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                  : "bg-slate-100 dark:bg-white/10 text-slate-400"
              )}>
                {logGroupChatId.trim()
                  ? (lang === "ru" ? "Aktiv" : lang === "en" ? "Active" : "Aktiv")
                  : (lang === "ru" ? "Ulangan emas" : lang === "en" ? "Not connected" : "Ulanmagan")}
              </span>
            </div>

            <input
              type="text"
              value={logGroupChatId}
              onChange={(e) => setLogGroupChatId(e.target.value)}
              placeholder="-100123456789"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />

            <div className="flex gap-2">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingSettings ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                {lang === "ru" ? "Saqlash" : lang === "en" ? "Save" : "Saqlash"}
              </button>
              <button
                onClick={() => testGroup("log")}
                disabled={!logGroupChatId.trim() || testingGroup === "log"}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all disabled:opacity-40"
              >
                {testingGroup === "log" ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Test
              </button>
              {logGroupChatId.trim() && (
                <button
                  onClick={() => { setLogGroupChatId(""); saveSettings(); }}
                  title={lang === "en" ? "Remove" : "O'chirish"}
                  className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-white/10 pt-3 space-y-1">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-300">
                {lang === "ru" ? "Bu guruhga yuboriladi:" : lang === "en" ? "This group receives:" : "Bu guruhga yuboriladi:"}
              </p>
              <ul className="text-[11px] text-slate-400 space-y-0.5 pl-1">
                <li>• {lang === "ru" ? "Yangi buyurtma logi" : lang === "en" ? "New order log" : "Yangi buyurtma logi"}</li>
                <li>• {lang === "ru" ? "Mahsulot/diler o'zgarishlari" : lang === "en" ? "Product/dealer changes" : "Mahsulot/diler o'zgarishlari"}</li>
                <li>• {lang === "ru" ? "Kunlik omborxona holati (01:30)" : lang === "en" ? "Daily inventory (01:30)" : "Kunlik omborxona holati (01:30)"}</li>
                <li>• {lang === "ru" ? "Haftalik backup hisobot" : lang === "en" ? "Weekly backup report" : "Haftalik backup hisoboti"}</li>
              </ul>
            </div>
          </div>

          {/* Orders group */}
          <div className={clsx(
            "rounded-2xl border-2 p-5 space-y-4 transition-all",
            orderGroupChatId.trim()
              ? "border-emerald-200 dark:border-emerald-700/40 bg-emerald-50/30 dark:bg-emerald-900/10"
              : "border-slate-100 dark:border-white/10"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-sm text-slate-800 dark:text-white">
                    {lang === "ru" ? "Группа заказов" : lang === "en" ? "Orders Group" : "Buyurtmalar guruhi"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {lang === "ru" ? "Только новые заказы" : lang === "en" ? "New orders only" : "Faqat yangi buyurtmalar"}
                  </p>
                </div>
              </div>
              <span className={clsx(
                "text-[10px] font-black px-2 py-0.5 rounded-full",
                orderGroupChatId.trim()
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                  : "bg-slate-100 dark:bg-white/10 text-slate-400"
              )}>
                {orderGroupChatId.trim()
                  ? (lang === "ru" ? "Aktiv" : lang === "en" ? "Active" : "Aktiv")
                  : (lang === "ru" ? "Ulangan emas" : lang === "en" ? "Not connected" : "Ulanmagan")}
              </span>
            </div>

            <input
              type="text"
              value={orderGroupChatId}
              onChange={(e) => setOrderGroupChatId(e.target.value)}
              placeholder="-100987654321"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />

            <div className="flex gap-2">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingSettings ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                {lang === "ru" ? "Saqlash" : lang === "en" ? "Save" : "Saqlash"}
              </button>
              <button
                onClick={() => testGroup("order")}
                disabled={!orderGroupChatId.trim() || testingGroup === "order"}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-40"
              >
                {testingGroup === "order" ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Test
              </button>
              {orderGroupChatId.trim() && (
                <button
                  onClick={() => { setOrderGroupChatId(""); saveSettings(); }}
                  title={lang === "en" ? "Remove" : "O'chirish"}
                  className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-white/10 pt-3 space-y-1">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-300">
                {lang === "ru" ? "Bu guruhga yuboriladi:" : lang === "en" ? "This group receives:" : "Bu guruhga yuboriladi:"}
              </p>
              <ul className="text-[11px] text-slate-400 space-y-0.5 pl-1">
                <li>• {lang === "ru" ? "Har bir yangi buyurtma to'liq ma'lumoti" : lang === "en" ? "Full details of each new order" : "Har bir yangi buyurtma to'liq ma'lumoti"}</li>
                <li>• {lang === "ru" ? "Diler ismi, telefon, filial" : lang === "en" ? "Dealer name, phone, branch" : "Diler ismi, telefon, filial"}</li>
                <li>• {lang === "ru" ? "Mahsulotlar va jami summa" : lang === "en" ? "Product list and total amount" : "Mahsulotlar va jami summa"}</li>
                <li>• {lang === "ru" ? "Faqat ushbu kompaniya ma'lumotlari" : lang === "en" ? "Only this company's data" : "Faqat ushbu kompaniya ma'lumotlari"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Broadcast Section */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">
              {t.broadcastTitle}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {t.broadcastSubtitle}
            </p>
          </div>
        </div>

        <textarea
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          placeholder={t.broadcastPlaceholder}
          rows={4}
          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium text-sm transition-all resize-none"
        />

        {broadcastResult && (
          <div className="flex items-center gap-4 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {t.broadcastSummary
                .replace("{sent}", String(broadcastResult.sent))
                .replace("{failed}", String(broadcastResult.failed))}
            </p>
          </div>
        )}

        <button
          onClick={handleBroadcast}
          disabled={broadcasting || !broadcastMsg.trim()}
          className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {broadcasting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
          {broadcasting ? "Yuborilmoqda..." : "Xabar yuborish"}
        </button>
      </div>

      {/* How To Guide */}
      <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/3 p-8">
        <h3 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
            <Bot className="w-4 h-4" />
          </div>
          {t.howToTitle}
        </h3>
        <div className="space-y-4">
          {(
            [t.howToStep1, t.howToStep2, t.howToStep3, t.howToStep4] as string[]
          ).map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {step}
                </p>
                {i < 3 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
