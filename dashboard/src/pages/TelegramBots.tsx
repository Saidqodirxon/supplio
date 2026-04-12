import { useState, useEffect, useCallback } from 'react';
import { Bot, Plus, Trash2, Edit2, Check, X, Copy, ExternalLink, Loader2, RefreshCw, AlertCircle, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { toast } from '../utils/toast';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { getApiErrorMessage } from '../utils/apiError';

const T = {
  en: {
    title: 'Telegram Bots',
    subtitle: 'Connect your Telegram bot to power your web store and dealer channel.',
    addBot: 'Add Bot',
    noBots: 'No bots connected yet',
    noBotsDesc: 'Add a Telegram bot to enable your store inside Telegram.',
    botName: 'Bot Name',
    description: 'Description',
    token: 'Bot Token',
    tokenPlaceholder: 'e.g. 7123456789:AAF...',
    validate: 'Validate Token',
    validating: 'Validating...',
    valid: 'Token is valid',
    invalid: 'Invalid token',
    create: 'Add Bot',
    creating: 'Adding...',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Delete this bot?',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    connected: 'Connected',
    stopped: 'Stopped',
    not_found: 'Not Set Up',
    storeUrl: 'Store URL',
    howToTitle: 'How to get a bot token',
    howToStep1: 'Open Telegram and search for @BotFather',
    howToStep2: 'Send /newbot and follow the instructions',
    howToStep3: 'Copy the token and paste it above',
    howToStep4: 'Your bot will become the Telegram store for your dealers',
  },
  uz: {
    title: 'Telegram Botlar',
    subtitle: "Telegram botingizni veb-do'kon va dilerlar kanaliga ulang.",
    addBot: 'Bot qo\'shish',
    noBots: 'Hali bot ulangan emas',
    noBotsDesc: "Telegram ichida do'koningizni faollashtirish uchun bot qo'shing.",
    botName: 'Bot nomi',
    description: 'Tavsif',
    token: 'Bot tokeni',
    tokenPlaceholder: 'Masalan: 7123456789:AAF...',
    validate: 'Tokenni tekshirish',
    validating: 'Tekshirilmoqda...',
    valid: 'Token to\'g\'ri',
    invalid: 'Noto\'g\'ri token',
    create: 'Bot qo\'shish',
    creating: 'Qo\'shilmoqda...',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    deleteConfirm: 'Bu botni o\'chirasizmi?',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    saving: 'Saqlanmoqda...',
    connected: 'Ulangan',
    stopped: 'To\'xtatilgan',
    not_found: 'Sozlanmagan',
    storeUrl: "Do'kon manzili",
    howToTitle: 'Bot tokenini qanday olish',
    howToStep1: 'Telegramni oching va @BotFather ni qidiring',
    howToStep2: '/newbot yuboring va ko\'rsatmalarga amal qiling',
    howToStep3: 'Tokenni nusxalab yuqoriga joylashtiring',
    howToStep4: 'Botingiz dilerlar uchun Telegram do\'konga aylanadi',
  },
  oz: {
    title: 'Telegram Ботлар',
    subtitle: 'Telegram ботингизни веб-дўкон ва диллерлар каналига улаш.',
    addBot: 'Бот қўшиш',
    noBots: 'Ҳали бот улган эмас',
    noBotsDesc: 'Telegram ичида дўкон фаоллаштириш учун бот қўшинг.',
    botName: 'Бот номи',
    description: 'Тавсиф',
    token: 'Бот токени',
    tokenPlaceholder: 'Мас: 7123456789:AAF...',
    validate: 'Токенни текшириш',
    validating: 'Текширилмоқда...',
    valid: 'Токен тўғри',
    invalid: 'Нотўғри токен',
    create: 'Бот қўшиш',
    creating: 'Қўшилмоқда...',
    edit: 'Таҳрирлаш',
    delete: 'Ўчириш',
    deleteConfirm: 'Бу ботни ўчирасизми?',
    cancel: 'Бекор қилиш',
    save: 'Сақлаш',
    saving: 'Сақланмоқда...',
    connected: 'Уланган',
    stopped: 'Тўхтатилган',
    not_found: 'Созланмаган',
    storeUrl: 'Дўкон манзили',
    howToTitle: 'Бот токенини қандай олиш',
    howToStep1: 'Telegramни очинг ва @BotFather ни қидиринг',
    howToStep2: '/newbot юборинг ва кўрсатмаларга амал қилинг',
    howToStep3: 'Токенни нусхалаб юқорига жойлаштиринг',
    howToStep4: 'Ботингиз диллерлар учун Telegram дўконга айланади',
  },
  tr: {
    title: 'Telegram Botlar',
    subtitle: 'Telegram botunuzu web mağazanıza ve bayi kanalınıza bağlayın.',
    addBot: 'Bot Ekle',
    noBots: 'Henüz bot bağlı değil',
    noBotsDesc: "Telegram içinde mağazanızı etkinleştirmek için bot ekleyin.",
    botName: 'Bot Adı',
    description: 'Açıklama',
    token: 'Bot Token',
    tokenPlaceholder: 'Örn: 7123456789:AAF...',
    validate: 'Token Doğrula',
    validating: 'Doğrulanıyor...',
    valid: 'Token geçerli',
    invalid: 'Geçersiz token',
    create: 'Bot Ekle',
    creating: 'Ekleniyor...',
    edit: 'Düzenle',
    delete: 'Sil',
    deleteConfirm: 'Bu botu silmek istiyor musunuz?',
    cancel: 'İptal',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    connected: 'Bağlı',
    stopped: 'Durduruldu',
    not_found: 'Kurulmadı',
    storeUrl: 'Mağaza URL',
    howToTitle: 'Bot token nasıl alınır',
    howToStep1: "Telegram'ı açın ve @BotFather'ı arayın",
    howToStep2: '/newbot gönderin ve talimatları izleyin',
    howToStep3: 'Token\'ı kopyalayıp yukarıya yapıştırın',
    howToStep4: 'Botunuz bayiler için Telegram mağazasına dönüşür',
  },
  ru: {
    title: 'Telegram Боты',
    subtitle: 'Подключите Telegram-бота к вашему веб-магазину и каналу для дилеров.',
    addBot: 'Добавить бота',
    noBots: 'Боты не подключены',
    noBotsDesc: 'Добавьте Telegram-бота, чтобы запустить магазин внутри Telegram.',
    botName: 'Имя бота',
    description: 'Описание',
    token: 'Токен бота',
    tokenPlaceholder: 'Напр: 7123456789:AAF...',
    validate: 'Проверить токен',
    validating: 'Проверка...',
    valid: 'Токен действителен',
    invalid: 'Неверный токен',
    create: 'Добавить бота',
    creating: 'Добавление...',
    edit: 'Редактировать',
    delete: 'Удалить',
    deleteConfirm: 'Удалить этого бота?',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    connected: 'Подключён',
    stopped: 'Остановлен',
    not_found: 'Не настроен',
    storeUrl: 'URL магазина',
    howToTitle: 'Как получить токен бота',
    howToStep1: 'Откройте Telegram и найдите @BotFather',
    howToStep2: 'Отправьте /newbot и следуйте инструкциям',
    howToStep3: 'Скопируйте токен и вставьте выше',
    howToStep4: 'Ваш бот станет Telegram-магазином для дилеров',
  },
} as const;

type Lang = keyof typeof T;

interface Bot {
  id: string;
  botName: string | null;
  description: string | null;
  token: string;
  username: string | null;
  isActive: boolean;
  status: 'connected' | 'stopped' | 'not_found';
  createdAt: string;
}

interface BotFormData {
  token: string;
  botName: string;
  description: string;
}

const STATUS_COLOR = {
  connected: 'text-emerald-600 bg-emerald-500/10',
  stopped: 'text-amber-600 bg-amber-500/10',
  not_found: 'text-slate-400 bg-slate-500/10',
};

const STATUS_ICON = {
  connected: <CheckCircle className="w-3.5 h-3.5" />,
  stopped: <AlertCircle className="w-3.5 h-3.5" />,
  not_found: <Circle className="w-3.5 h-3.5" />,
};

export default function TelegramBots() {
  const { language } = useAuthStore();
  const lang = (language in T ? language : 'en') as Lang;
  const t = T[lang];
  const dt = dashboardTranslations[language as keyof typeof dashboardTranslations] ?? dashboardTranslations.en;

  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BotFormData>({ token: '', botName: '', description: '' });
  const [validating, setValidating] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BotFormData>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number } | null>(null);

  const errorText = (error: unknown, fallback: string) => getApiErrorMessage(error, fallback, language);

  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const [botsRes, companyRes] = await Promise.all([
        api.get('/telegram/bots'),
        api.get('/company/me'),
      ]);
      setBots(botsRes.data);
      const slug = companyRes.data?.slug;
      if (slug) setStoreUrl(`${window.location.origin}/store/${slug}`);
    } catch {
      toast.error(errorText(undefined, dt.common?.error ?? 'Error'));
    } finally {
      setLoading(false);
    }
  }, [dt.common?.error]);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const validateToken = async () => {
    if (!form.token.trim()) return;
    setValidating(true);
    setTokenStatus('idle');
    try {
      await api.post('/telegram/bots/validate', { token: form.token.trim() });
      setTokenStatus('valid');
    } catch {
      setTokenStatus('invalid');
      toast.error(errorText(undefined, t.invalid));
    } finally {
      setValidating(false);
    }
  };

  const createBot = async () => {
    if (!form.token.trim()) return;
    setCreating(true);
    try {
      await api.post('/telegram/bots', {
        token: form.token.trim(),
        botName: form.botName.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      toast.success('Bot qo\'shildi! Menyu tugmasi avtomatik sozlandi.');
      setShowForm(false);
      setForm({ token: '', botName: '', description: '' });
      setTokenStatus('idle');
      fetchBots();
    } catch (e: any) {
      toast.error(errorText(e, 'Failed to add bot'));
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await api.patch(`/telegram/bots/${id}`, editForm);
      toast.success('Saved');
      setEditId(null);
      fetchBots();
    } catch (e) {
      toast.error(errorText(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const deleteBot = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/telegram/bots/${id}`);
      toast.success('Bot removed');
      setBots(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      toast.error(errorText(e, 'Failed to remove bot'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return toast.error('Xabar matnini kiriting');
    if (!window.confirm(`${bots.length > 0 ? 'Barcha' : '0'} dilerlarga xabar yuborilsinmi?`)) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await api.post('/telegram/broadcast', { message: broadcastMsg });
      setBroadcastResult(res.data);
      toast.success(`Yuborildi: ${res.data.sent} ta`);
      setBroadcastMsg('');
    } catch (e) {
      toast.error(errorText(e, 'Xabar yuborishda xatolik'));
    } finally {
      setBroadcasting(false);
    }
  };

  const maskToken = (token: string) => {
    const parts = token.split(':');
    if (parts.length !== 2) return '••••••••••';
    return `${parts[0]}:${'•'.repeat(Math.min(parts[1].length, 12))}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{t.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBots}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowForm(true); setTokenStatus('idle'); setForm({ token: '', botName: '', description: '' }); }}
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
              <h3 className="font-black text-slate-900 dark:text-white">{t.addBot}</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
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
                {language === 'ru' ? 'Ещё нет бота?' : language === 'en' ? 'No bot yet?' : 'Hali bot yo\'q?'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {language === 'ru' ? 'Создайте бесплатно через BotFather — официального бота Telegram' : language === 'en' ? 'Create one free via BotFather — Telegram\'s official bot creator' : 'BotFather orqali bepul yarating — rasmiy Telegram bot yaratuvchi'}
              </p>
            </div>
            <a
              href="https://t.me/BotFather?start=newbot"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2.5 bg-[#29aee6] text-white rounded-xl text-xs font-black hover:bg-[#1a9fd6] transition-all active:scale-95 whitespace-nowrap"
            >
              {language === 'ru' ? 'Открыть BotFather' : language === 'en' ? 'Open BotFather' : 'BotFather ochish'}
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{t.botName}</label>
              <input
                value={form.botName}
                onChange={e => setForm(p => ({ ...p, botName: e.target.value }))}
                placeholder="My Store Bot"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{t.description}</label>
              <input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{t.token} *</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  value={form.token}
                  onChange={e => { setForm(p => ({ ...p, token: e.target.value })); setTokenStatus('idle'); }}
                  placeholder={t.tokenPlaceholder}
                  className={clsx(
                    'w-full px-4 py-3 rounded-2xl border bg-white dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-mono',
                    tokenStatus === 'valid' ? 'border-emerald-400 focus:ring-emerald-500/50' :
                    tokenStatus === 'invalid' ? 'border-rose-400 focus:ring-rose-500/50' :
                    'border-slate-200 dark:border-white/10 focus:ring-blue-500/50'
                  )}
                />
                {tokenStatus !== 'idle' && (
                  <div className={clsx('absolute right-4 top-1/2 -translate-y-1/2', tokenStatus === 'valid' ? 'text-emerald-500' : 'text-rose-500')}>
                    {tokenStatus === 'valid' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                )}
              </div>
              <button
                onClick={validateToken}
                disabled={!form.token.trim() || validating}
                className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black disabled:opacity-50 transition-all active:scale-95 shrink-0 flex items-center gap-2"
              >
                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {validating ? t.validating : t.validate}
              </button>
            </div>
            {tokenStatus !== 'idle' && (
              <p className={clsx('text-xs font-bold mt-2', tokenStatus === 'valid' ? 'text-emerald-600' : 'text-rose-500')}>
                {tokenStatus === 'valid' ? t.valid : t.invalid}
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-xs font-semibold text-blue-700 dark:text-blue-300">
            Bot qo'shilganda Web Do'kon havola tugmasi Telegram menyusiga avtomatik o'rnatiladi.
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
            <p className="font-black text-slate-700 dark:text-slate-300">{t.noBots}</p>
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
          {bots.map(bot => (
            <div
              key={bot.id}
              className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 transition-all hover:shadow-lg dark:hover:shadow-black/20"
            >
              {editId === bot.id ? (
                /* Edit mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{t.botName}</label>
                      <input
                        value={editForm.botName ?? bot.botName ?? ''}
                        onChange={e => setEditForm(p => ({ ...p, botName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{t.description}</label>
                      <input
                        value={editForm.description ?? bot.description ?? ''}
                        onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
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
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
                          {bot.botName || bot.username || 'Unnamed Bot'}
                        </h3>
                        {bot.username && (
                          <span className="text-xs font-bold text-slate-400">@{bot.username}</span>
                        )}
                        <span className={clsx('inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg', STATUS_COLOR[bot.status ?? 'not_found'])}>
                          {STATUS_ICON[bot.status ?? 'not_found']}
                          {t[bot.status ?? 'not_found']}
                        </span>
                      </div>
                      {bot.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{bot.description}</p>
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
                            onClick={() => { navigator.clipboard.writeText(`https://t.me/${bot.username}`); toast.success('Copied!'); }}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {storeUrl && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-bold">{t.storeUrl}:</span>
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
                            onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success('Copied!'); }}
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
                      onClick={() => { setEditId(bot.id); setEditForm({ botName: bot.botName ?? '', description: bot.description ?? '' }); }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm(t.deleteConfirm)) deleteBot(bot.id); }}
                      disabled={deletingId === bot.id}
                      className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      {deletingId === bot.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Section */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">Barcha dilerlarga xabar yuborish</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Telegram orqali broadcast</p>
          </div>
        </div>

        <textarea
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          placeholder="Xabar matnini kiriting... (Markdown qo'llab-quvvatlanadi: *qalin*, _kursiv_)"
          rows={4}
          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium text-sm transition-all resize-none"
        />

        {broadcastResult && (
          <div className="flex items-center gap-4 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Yuborildi: <strong>{broadcastResult.sent}</strong> ta · Muvaffaqiyatsiz: <strong>{broadcastResult.failed}</strong> ta
            </p>
          </div>
        )}

        <button
          onClick={handleBroadcast}
          disabled={broadcasting || !broadcastMsg.trim()}
          className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {broadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          {broadcasting ? 'Yuborilmoqda...' : 'Xabar yuborish'}
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
          {([t.howToStep1, t.howToStep2, t.howToStep3, t.howToStep4] as string[]).map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{step}</p>
                {i < 3 && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
