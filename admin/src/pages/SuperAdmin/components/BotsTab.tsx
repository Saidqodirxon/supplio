import { useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  Bot,
  CheckCircle2,
  Circle,
  Globe,
  KeyRound,
  Loader2,
  Power,
  RotateCcw,
  Trash2,
  XCircle,
  Plus,
} from "lucide-react";
import api from "../../../services/api";
import { toast } from "../../../utils/toast";

type BotRecord = {
  id: string;
  botName: string | null;
  description?: string | null;
  username: string | null;
  isActive: boolean;
  status: string;
  createdAt: string;
  company: { id: string; name: string; slug: string };
};

type Distributor = {
  id: string;
  name: string;
  slug: string;
};

type BotEditModalState = {
  id: string;
  token: string;
  botName: string;
  description: string;
  isActive: boolean;
} | null;

type BotCreateModalState = {
  companyId: string;
  token: string;
  botName: string;
  description: string;
} | null;

type Props = {
  language: "uz" | "ru" | "en" | "tr" | string;
  adminBots: BotRecord[];
  setAdminBots: Dispatch<SetStateAction<BotRecord[]>>;
  distributors: Distributor[];
  setDistributors: Dispatch<SetStateAction<Distributor[]>>;
  botActionLoading: Record<string, string>;
  setBotActionLoading: Dispatch<SetStateAction<Record<string, string>>>;
  botEditModal: BotEditModalState;
  setBotEditModal: Dispatch<SetStateAction<BotEditModalState>>;
  botDeleteConfirm: string | null;
  setBotDeleteConfirm: Dispatch<SetStateAction<string | null>>;
  botCreateModal: BotCreateModalState;
  setBotCreateModal: Dispatch<SetStateAction<BotCreateModalState>>;
  botCreateLoading: boolean;
  setBotCreateLoading: Dispatch<SetStateAction<boolean>>;
  botsReloadingAll: boolean;
  setBotsReloadingAll: Dispatch<SetStateAction<boolean>>;
};

function botStatusLabel(language: Props["language"], status: string) {
  if (status === "connected") {
    return language === "ru" ? "Работает" : language === "en" ? "Connected" : "Ulangan";
  }
  if (status === "stopped") {
    return language === "ru" ? "Остановлен" : language === "en" ? "Stopped" : "To'xtatilgan";
  }
  return language === "ru" ? "Не найден" : language === "en" ? "Not Found" : "Topilmadi";
}

export default function BotsTab({
  language,
  adminBots,
  setAdminBots,
  distributors,
  setDistributors,
  botActionLoading,
  setBotActionLoading,
  botEditModal,
  setBotEditModal,
  botDeleteConfirm,
  setBotDeleteConfirm,
  botCreateModal,
  setBotCreateModal,
  botCreateLoading,
  setBotCreateLoading,
  botsReloadingAll,
  setBotsReloadingAll,
}: Props) {
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
            {language === "ru"
              ? `Всего ботов: ${adminBots.length}`
              : language === "en"
                ? `Total bots: ${adminBots.length}`
                : `Jami botlar: ${adminBots.length}`}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
            {language === "ru"
              ? `Активные: ${adminBots.filter((b) => b.isActive).length} · Неактивные: ${adminBots.length - adminBots.filter((b) => b.isActive).length}`
              : language === "en"
                ? `Active: ${adminBots.filter((b) => b.isActive).length} · Inactive: ${adminBots.length - adminBots.filter((b) => b.isActive).length}`
                : `Faol: ${adminBots.filter((b) => b.isActive).length} · Faol emas: ${adminBots.length - adminBots.filter((b) => b.isActive).length}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!distributors.length) {
                api
                  .get("/super/distributors", { params: { page: 1, limit: 200 } })
                  .then((res) => {
                    setDistributors(
                      Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
                    );
                  })
                  .catch(() => {});
              }
              setBotCreateModal({
                companyId: "",
                token: "",
                botName: "",
                description: "",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === "ru" ? "Добавить" : language === "en" ? "Add Bot" : "Bot qo'shish"}
          </button>
          <button
            disabled={botsReloadingAll}
            onClick={async () => {
              setBotsReloadingAll(true);
              try {
                await api.post("/telegram/admin/bots/reload-all");
                const res = await api.get("/telegram/admin/bots");
                setAdminBots(Array.isArray(res.data) ? res.data : []);
                toast.success(
                  language === "ru"
                    ? "Полный reload выполнен"
                    : language === "en"
                      ? "Full reload completed"
                      : "To'liq obnovit bajarildi"
                );
              } catch {
                toast.error("Xato");
              } finally {
                setBotsReloadingAll(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all disabled:opacity-60"
          >
            {botsReloadingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            {language === "ru" ? "Обновить (сброс)" : language === "en" ? "Refresh (Reset)" : "Obnovit (reset)"}
          </button>
          {adminBots.length > 0 && (
            <button
              onClick={() => setDeleteAllConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {language === "ru" ? "Удалить всё" : language === "en" ? "Delete All" : "Hammasini o'chirish"}
            </button>
          )}
        </div>
      </div>

      {adminBots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          <Bot className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold">
            {language === "ru" ? "Нет подключённых ботов" : language === "en" ? "No bots connected" : "Ulangan bot yo'q"}
          </p>
        </div>
      ) : (
        adminBots.map((bot) => (
          <div key={bot.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div
                className={clsx(
                  "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                  bot.isActive ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-slate-800 dark:text-white truncate">{bot.botName || bot.username || bot.id}</span>
                  {bot.username && <span className="text-[10px] font-bold text-slate-400">@{bot.username}</span>}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{bot.company.name}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{new Date(bot.createdAt).toLocaleDateString()}</span>
                </div>
                {bot.description && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{bot.description}</p>}
              </div>
              <div className="shrink-0">
                {bot.status === "connected" ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl"><CheckCircle2 className="w-3.5 h-3.5" />{botStatusLabel(language, bot.status)}</span>
                ) : bot.status === "stopped" ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl"><XCircle className="w-3.5 h-3.5" />{botStatusLabel(language, bot.status)}</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl"><Circle className="w-3.5 h-3.5" />{botStatusLabel(language, bot.status)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex-wrap">
              <button
                disabled={!!botActionLoading[bot.id]}
                onClick={async () => {
                  setBotActionLoading((p) => ({ ...p, [bot.id]: "reload" }));
                  try {
                    await api.post(`/telegram/admin/bots/${bot.id}/reload`);
                    const res = await api.get("/telegram/admin/bots");
                    setAdminBots(Array.isArray(res.data) ? res.data : []);
                    toast.success(language === "ru" ? "Перезапущен" : language === "en" ? "Reloaded" : "Qayta ishga tushirildi");
                  } catch {
                    toast.error("Xato");
                  } finally {
                    setBotActionLoading((p) => {
                      const n = { ...p };
                      delete n[bot.id];
                      return n;
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all disabled:opacity-50"
              >
                {botActionLoading[bot.id] === "reload" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {language === "ru" ? "Перезапуск" : "Reload"}
              </button>

              <button
                disabled={!!botActionLoading[bot.id]}
                onClick={() =>
                  setBotEditModal({
                    id: bot.id,
                    token: "",
                    botName: bot.botName || "",
                    description: bot.description || "",
                    isActive: !!bot.isActive,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {language === "ru" ? "Глубокое редактирование" : language === "en" ? "Deep Edit" : "Chuqur edit"}
              </button>

              <button
                disabled={!!botActionLoading[bot.id]}
                onClick={async () => {
                  setBotActionLoading((p) => ({ ...p, [bot.id]: "toggle" }));
                  try {
                    await api.patch(`/telegram/admin/bots/${bot.id}`, { isActive: !bot.isActive });
                    const res = await api.get("/telegram/admin/bots");
                    setAdminBots(Array.isArray(res.data) ? res.data : []);
                    toast.success(
                      bot.isActive
                        ? language === "ru" ? "Деактивирован" : language === "en" ? "Deactivated" : "O'chirildi"
                        : language === "ru" ? "Активирован" : language === "en" ? "Activated" : "Yoqildi"
                    );
                  } catch {
                    toast.error("Xato");
                  } finally {
                    setBotActionLoading((p) => {
                      const n = { ...p };
                      delete n[bot.id];
                      return n;
                    });
                  }
                }}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50",
                  bot.isActive ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                )}
              >
                {botActionLoading[bot.id] === "toggle" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                {bot.isActive
                  ? language === "ru"
                    ? "Деактивировать"
                    : language === "en"
                      ? "Deactivate"
                      : "O'chirish"
                  : language === "ru"
                    ? "Активировать"
                    : language === "en"
                      ? "Activate"
                      : "Yoqish"}
              </button>

              <button
                disabled={!!botActionLoading[bot.id]}
                onClick={async () => {
                  setBotActionLoading((p) => ({ ...p, [bot.id]: "webapp" }));
                  try {
                    await api.post(`/telegram/bots/${bot.id}/branding`, {}, {
                      headers: { "x-company-id": bot.company.id },
                    });
                    toast.success(language === "ru" ? "Web App применён" : language === "en" ? "Web App applied" : "Web App ulandi");
                  } catch {
                    toast.error("Xato");
                  } finally {
                    setBotActionLoading((p) => { const n = { ...p }; delete n[bot.id]; return n; });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all disabled:opacity-50"
              >
                {botActionLoading[bot.id] === "webapp" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                {language === "ru" ? "Web App" : language === "en" ? "Web App" : "Web ulash"}
              </button>
              <button
                disabled={!!botActionLoading[bot.id]}
                onClick={() => setBotDeleteConfirm(bot.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all disabled:opacity-50 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {language === "ru" ? "Удалить" : language === "en" ? "Delete" : "O'chirish"}
              </button>
            </div>
          </div>
        ))
      )}

      <AnimatePresence>
        {botCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !botCreateLoading && setBotCreateModal(null)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><Bot className="w-5 h-5" /></div>
                  <h3 className="font-black text-slate-800 dark:text-white">
                    {language === "ru" ? "Добавить Telegram-бота" : language === "en" ? "Add Telegram Bot" : "Telegram bot qo'shish"}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                      {language === "ru" ? "Дистрибьютор" : language === "en" ? "Distributor" : "Distributor"}
                    </label>
                    <select
                      value={botCreateModal.companyId}
                      onChange={(e) => setBotCreateModal((p) => (p ? { ...p, companyId: e.target.value } : null))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">{language === "ru" ? "Выберите компанию" : language === "en" ? "Select company" : "Kompaniyani tanlang"}</option>
                      {distributors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.slug})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                      {language === "ru" ? "Токен бота" : language === "en" ? "Bot token" : "Bot tokeni"}
                    </label>
                    <input
                      type="text"
                      value={botCreateModal.token}
                      onChange={(e) => setBotCreateModal((p) => (p ? { ...p, token: e.target.value } : null))}
                      placeholder="1234567890:AA..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={botCreateModal.botName}
                      onChange={(e) => setBotCreateModal((p) => (p ? { ...p, botName: e.target.value } : null))}
                      placeholder={language === "ru" ? "Имя бота (необязательно)" : language === "en" ? "Bot name (optional)" : "Bot nomi (ixtiyoriy)"}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={botCreateModal.description}
                      onChange={(e) => setBotCreateModal((p) => (p ? { ...p, description: e.target.value } : null))}
                      placeholder={language === "ru" ? "Описание (необязательно)" : language === "en" ? "Description (optional)" : "Tavsif (ixtiyoriy)"}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button disabled={botCreateLoading} onClick={() => setBotCreateModal(null)} className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50">
                    {language === "ru" ? "Отмена" : language === "en" ? "Cancel" : "Bekor"}
                  </button>
                  <button
                    disabled={botCreateLoading || !botCreateModal.companyId || !botCreateModal.token.trim()}
                    onClick={async () => {
                      setBotCreateLoading(true);
                      try {
                        await api.post("/telegram/admin/bots", {
                          companyId: botCreateModal.companyId,
                          token: botCreateModal.token.trim(),
                          botName: botCreateModal.botName.trim() || undefined,
                          description: botCreateModal.description.trim() || undefined,
                        });
                        const res = await api.get("/telegram/admin/bots");
                        setAdminBots(Array.isArray(res.data) ? res.data : []);
                        setBotCreateModal(null);
                        toast.success(language === "ru" ? "Бот добавлен" : language === "en" ? "Bot added" : "Bot qo'shildi");
                      } catch (e: any) {
                        const message = e?.response?.data?.message || e?.message || (language === "ru" ? "Ошибка при добавлении бота" : language === "en" ? "Failed to add bot" : "Bot qo'shishda xatolik");
                        toast.error(Array.isArray(message) ? message[0] : message);
                      } finally {
                        setBotCreateLoading(false);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 inline-flex items-center justify-center"
                  >
                    {botCreateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : language === "ru" ? "Добавить" : language === "en" ? "Add" : "Qo'shish"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {botEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBotEditModal(null)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600"><KeyRound className="w-5 h-5" /></div>
                  <h3 className="font-black text-slate-800 dark:text-white">
                    {language === "ru" ? "Глубокое обновление бота" : language === "en" ? "Deep Bot Update" : "Botni chuqur yangilash"}
                  </h3>
                </div>
                <div className="space-y-3 mb-4">
                  <input type="text" value={botEditModal.botName} onChange={(e) => setBotEditModal((p) => (p ? { ...p, botName: e.target.value } : null))} placeholder={language === "ru" ? "Название бота" : language === "en" ? "Bot name" : "Bot nomi"} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <input type="text" value={botEditModal.description} onChange={(e) => setBotEditModal((p) => (p ? { ...p, description: e.target.value } : null))} placeholder={language === "ru" ? "Описание" : language === "en" ? "Description" : "Tavsif"} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-200"><span>{language === "ru" ? "Активный" : language === "en" ? "Active" : "Faol"}</span><input type="checkbox" checked={botEditModal.isActive} onChange={(e) => setBotEditModal((p) => (p ? { ...p, isActive: e.target.checked } : null))} className="w-4 h-4" /></label>
                </div>
                <input type="text" value={botEditModal.token} onChange={(e) => setBotEditModal((p) => (p ? { ...p, token: e.target.value } : null))} placeholder={language === "ru" ? "Новый токен (опционально)" : language === "en" ? "New bot token (optional)" : "Yangi bot token (ixtiyoriy)"} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => setBotEditModal(null)} className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all">{language === "ru" ? "Отмена" : language === "en" ? "Cancel" : "Bekor"}</button>
                  <button disabled={!!botActionLoading[botEditModal.id]} onClick={async () => {
                    const { id, token, botName, description, isActive } = botEditModal;
                    setBotActionLoading((p) => ({ ...p, [id]: "token" }));
                    try {
                      const payload: Record<string, unknown> = { botName: botName.trim(), description: description.trim(), isActive };
                      if (token.trim()) payload.token = token.trim();
                      await api.patch(`/telegram/admin/bots/${id}`, payload);
                      const res = await api.get("/telegram/admin/bots");
                      setAdminBots(Array.isArray(res.data) ? res.data : []);
                      setBotEditModal(null);
                      toast.success(language === "ru" ? "Токен обновлён" : language === "en" ? "Token updated" : "Token yangilandi");
                    } catch {
                      toast.error("Xato");
                    } finally {
                      setBotActionLoading((p) => {
                        const n = { ...p };
                        delete n[id];
                        return n;
                      });
                    }
                  }} className="flex-1 px-4 py-2.5 text-sm font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all disabled:opacity-50">
                    {botActionLoading[botEditModal.id] === "token" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : language === "ru" ? "Сохранить" : language === "en" ? "Save" : "Saqlash"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {botDeleteConfirm && (() => {
          const targetBot = adminBots.find((b) => b.id === botDeleteConfirm);
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !botActionLoading[botDeleteConfirm] && setBotDeleteConfirm(null)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
                  <h3 className="font-black text-slate-800 dark:text-white mb-2">
                    {language === "ru" ? "Удалить бота?" : language === "en" ? "Delete bot?" : "Botni o'chirish?"}
                  </h3>
                  {targetBot && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-xs font-black mb-3">
                      <Bot className="w-3.5 h-3.5" />
                      {targetBot.botName || targetBot.username || targetBot.id}
                      {targetBot.username && <span className="opacity-70">@{targetBot.username}</span>}
                    </div>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {language === "ru"
                      ? "Это действие необратимо. Бот будет остановлен и удалён из базы данных. Повторное подключение с тем же токеном возможно."
                      : language === "en"
                        ? "This action is irreversible. The bot will be stopped and permanently deleted. You can reconnect the same token later."
                        : "Bu amal qaytarib bo'lmaydi. Bot to'xtatiladi va bazadan o'chiriladi. Keyinchalik xuddi shu tokenni qayta qo'shish mumkin."}
                  </p>
                  <div className="flex gap-3">
                    <button
                      disabled={!!botActionLoading[botDeleteConfirm]}
                      onClick={() => setBotDeleteConfirm(null)}
                      className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      {language === "ru" ? "Отмена" : language === "en" ? "Cancel" : "Bekor"}
                    </button>
                    <button
                      disabled={!!botActionLoading[botDeleteConfirm]}
                      onClick={async () => {
                        const id = botDeleteConfirm;
                        setBotActionLoading((p) => ({ ...p, [id]: "delete" }));
                        try {
                          await api.delete(`/telegram/admin/bots/${id}`);
                          setAdminBots((p) => p.filter((b) => b.id !== id));
                          setBotDeleteConfirm(null);
                          toast.success(language === "ru" ? "Удалён" : language === "en" ? "Deleted" : "O'chirildi");
                        } catch (e: any) {
                          const msg = e?.response?.data?.message || e?.message || "Xato";
                          toast.error(Array.isArray(msg) ? msg[0] : msg);
                        } finally {
                          setBotActionLoading((p) => {
                            const n = { ...p };
                            delete n[id];
                            return n;
                          });
                        }
                      }}
                      className="flex-1 px-4 py-2.5 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 inline-flex items-center justify-center"
                    >
                      {botActionLoading[botDeleteConfirm] === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : language === "ru" ? "Удалить" : language === "en" ? "Delete" : "O'chirish"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {deleteAllConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deletingAll && setDeleteAllConfirm(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white">
                    {language === "ru" ? "Удалить все боты?" : language === "en" ? "Delete all bots?" : "Barcha botlarni o'chirish?"}
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {language === "ru"
                    ? `Все ${adminBots.length} ботов будут навсегда удалены. Это действие необратимо.`
                    : language === "en"
                      ? `All ${adminBots.length} bots will be permanently deleted. This cannot be undone.`
                      : `Barcha ${adminBots.length} ta bot butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={deletingAll}
                    onClick={() => setDeleteAllConfirm(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    {language === "ru" ? "Отмена" : language === "en" ? "Cancel" : "Bekor"}
                  </button>
                  <button
                    disabled={deletingAll}
                    onClick={async () => {
                      setDeletingAll(true);
                      try {
                        await api.delete("/telegram/admin/bots/all");
                        setAdminBots([]);
                        setDeleteAllConfirm(false);
                        toast.success(
                          language === "ru" ? "Все боты удалены" : language === "en" ? "All bots deleted" : "Barcha botlar o'chirildi"
                        );
                      } catch {
                        toast.error("Xato");
                      } finally {
                        setDeletingAll(false);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 inline-flex items-center justify-center"
                  >
                    {deletingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : language === "ru" ? "Удалить всё" : language === "en" ? "Delete All" : "O'chirish"}
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