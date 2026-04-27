import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Trash2, Star, Eye, EyeOff, Loader2, X } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface SavedCard {
  id: string;
  last4: string;
  maskedExpire: string;
  cardName: string;
  isDefault: boolean;
  createdAt: string;
}

interface CardBalance {
  balance: number | null;
  currency: string;
  last4: string;
  cardName: string;
}

interface AddCardState {
  step: 'form' | 'otp';
  cardNumber: string;
  expireDate: string;
  phoneNumber: string;
  cardName: string;
  cid: string;
  otp: string;
  loading: boolean;
  error: string;
}

const INIT_ADD: AddCardState = {
  step: 'form', cardNumber: '', expireDate: '', phoneNumber: '', cardName: '',
  cid: '', otp: '', loading: false, error: '',
};

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpire(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length >= 3) return d.slice(0, 2) + d.slice(2);
  return d;
}

interface Props {
  language: string;
}

const COPY: Record<string, Record<string, string>> = {
  en: {
    title: 'Saved Cards', addCard: 'Add Card', delete: 'Delete', setDefault: 'Set Default',
    default: 'Default', balance: 'Balance', hideBalance: 'Hide', cardNumber: 'Card Number',
    expire: 'Expire (MMYY)', phone: 'Phone Number', cardName: 'Card Name (optional)',
    next: 'Continue', sendOtp: 'Send OTP', confirm: 'Confirm', cancel: 'Cancel',
    otp: 'Enter OTP code', otpHint: 'Paylov sent OTP to your phone',
    deleteConfirm: 'Delete this card?', noCards: 'No cards added',
    noCardsHint: 'Add a Paylov card to pay without entering details each time',
    maxCards: 'Maximum 5 cards allowed', fetching: 'Loading balance...',
    noBalance: 'Balance not available', expires: 'Expires',
  },
  uz: {
    title: 'Saqlangan kartalar', addCard: 'Karta qo\'shish', delete: 'O\'chirish', setDefault: 'Asosiy qilish',
    default: 'Asosiy', balance: 'Balans', hideBalance: 'Yashirish', cardNumber: 'Karta raqami',
    expire: 'Muddat (MMYY)', phone: 'Telefon raqam', cardName: 'Karta nomi (ixtiyoriy)',
    next: 'Davom etish', sendOtp: 'OTP yuborish', confirm: 'Tasdiqlash', cancel: 'Bekor',
    otp: 'OTP kodni kiriting', otpHint: 'Paylov telefoningizga OTP yubordi',
    deleteConfirm: 'Kartani o\'chirasizmi?', noCards: 'Kartalar yo\'q',
    noCardsHint: 'Paylov kartasini qo\'shing — keyingi safar qayta kiritmasdan to\'laysiz',
    maxCards: 'Maksimal 5 ta karta', fetching: 'Balans yuklanmoqda...',
    noBalance: 'Balans mavjud emas', expires: 'Muddat',
  },
  ru: {
    title: 'Сохранённые карты', addCard: 'Добавить карту', delete: 'Удалить', setDefault: 'Сделать основной',
    default: 'Основная', balance: 'Баланс', hideBalance: 'Скрыть', cardNumber: 'Номер карты',
    expire: 'Срок (MMYY)', phone: 'Номер телефона', cardName: 'Название карты (необяз.)',
    next: 'Продолжить', sendOtp: 'Отправить OTP', confirm: 'Подтвердить', cancel: 'Отмена',
    otp: 'Введите OTP код', otpHint: 'Paylov отправил OTP на ваш телефон',
    deleteConfirm: 'Удалить карту?', noCards: 'Карты не добавлены',
    noCardsHint: 'Добавьте карту Paylov — платите без повторного ввода данных',
    maxCards: 'Максимум 5 карт', fetching: 'Загрузка баланса...',
    noBalance: 'Баланс недоступен', expires: 'Срок',
  },
};

export default function CardManager({ language }: Props) {
  const lang = language === 'ru' ? 'ru' : language === 'uz' || language === 'oz' ? 'uz' : 'en';
  const c = COPY[lang] || COPY.en;

  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState<AddCardState>(INIT_ADD);
  const [balances, setBalances] = useState<Record<string, CardBalance | null | 'loading'>>({});
  const [showBalances, setShowBalances] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const res = await api.get<SavedCard[]>('/saas-payment/cards');
      setCards(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCards(); }, [fetchCards]);

  async function toggleBalance(card: SavedCard) {
    if (showBalances[card.id]) {
      setShowBalances(p => ({ ...p, [card.id]: false }));
      return;
    }
    setShowBalances(p => ({ ...p, [card.id]: true }));
    if (balances[card.id] !== undefined) return;
    setBalances(p => ({ ...p, [card.id]: 'loading' }));
    try {
      const res = await api.get<CardBalance>(`/saas-payment/cards/${card.id}/balance`);
      setBalances(p => ({ ...p, [card.id]: res.data }));
    } catch {
      setBalances(p => ({ ...p, [card.id]: null }));
    }
  }

  async function handleAddSubmit() {
    setAdd(p => ({ ...p, loading: true, error: '' }));
    try {
      const raw = add.cardNumber.replace(/\s/g, '');
      const res = await api.post('/saas-payment/cards', {
        cardNumber: raw,
        expireDate: add.expireDate,
        phoneNumber: add.phoneNumber,
        cardName: add.cardName || undefined,
      });
      setAdd(p => ({ ...p, step: 'otp', cid: res.data.cid, loading: false }));
    } catch (e: any) {
      setAdd(p => ({ ...p, loading: false, error: e.response?.data?.message || 'Error' }));
    }
  }

  async function handleOtpConfirm() {
    setAdd(p => ({ ...p, loading: true, error: '' }));
    try {
      await api.post('/saas-payment/cards/confirm', {
        cid: add.cid,
        otp: add.otp,
        cardName: add.cardName || undefined,
      });
      setAdd(INIT_ADD);
      setShowAdd(false);
      void fetchCards();
    } catch (e: any) {
      setAdd(p => ({ ...p, loading: false, error: e.response?.data?.message || 'Wrong OTP' }));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(c.deleteConfirm)) return;
    setDeletingId(id);
    try {
      await api.delete(`/saas-payment/cards/${id}`);
      setCards(prev => prev.filter(x => x.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefaultId(id);
    try {
      await api.patch(`/saas-payment/cards/${id}/default`);
      setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    } finally {
      setSettingDefaultId(null);
    }
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{c.title}</h3>
        </div>
        {cards.length < 5 && (
          <button
            onClick={() => { setShowAdd(true); setAdd(INIT_ADD); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> {c.addCard}
          </button>
        )}
      </div>

      {/* Add card panel */}
      {showAdd && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {add.step === 'form' ? c.addCard : c.otp}
            </p>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {add.step === 'form' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.cardNumber}</label>
                <input
                  type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                  value={formatCardNumber(add.cardNumber)}
                  onChange={e => setAdd(p => ({ ...p, cardNumber: e.target.value.replace(/\s/g, '') }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  maxLength={19}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.expire}</label>
                <input
                  type="text" inputMode="numeric" placeholder="MMYY"
                  value={formatExpire(add.expireDate)}
                  onChange={e => setAdd(p => ({ ...p, expireDate: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  maxLength={4}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.phone}</label>
                <input
                  type="tel" placeholder="+998901234567"
                  value={add.phoneNumber}
                  onChange={e => setAdd(p => ({ ...p, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.cardName}</label>
                <input
                  type="text" placeholder="My Uzcard"
                  value={add.cardName}
                  onChange={e => setAdd(p => ({ ...p, cardName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              {add.error && <p className="sm:col-span-2 text-xs text-rose-600 font-bold">{add.error}</p>}
              <div className="sm:col-span-2 flex gap-3">
                <button
                  onClick={handleAddSubmit} disabled={add.loading || add.cardNumber.replace(/\s/g,'').length !== 16 || add.expireDate.length !== 4 || add.phoneNumber.length < 10}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {add.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {c.sendOtp}
                </button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {c.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-bold">{c.otpHint}</p>
              <input
                type="text" inputMode="numeric" placeholder="000000"
                value={add.otp}
                onChange={e => setAdd(p => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xl font-mono font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {add.error && <p className="text-xs text-rose-600 font-bold">{add.error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleOtpConfirm} disabled={add.loading || add.otp.length < 4}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {add.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {c.confirm}
                </button>
                <button onClick={() => setAdd(p => ({ ...p, step: 'form' }))} className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 text-slate-500">
                  {c.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cards list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : cards.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">{c.noCards}</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{c.noCardsHint}</p>
          </div>
        ) : (
          cards.map(card => {
            const bal = balances[card.id];
            const visible = showBalances[card.id];
            return (
              <div key={card.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={clsx(
                  "w-12 h-8 rounded-lg flex items-center justify-center shrink-0",
                  card.isDefault ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"
                )}>
                  <CreditCard className={clsx("w-5 h-5", card.isDefault ? "text-white" : "text-slate-500")} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      •••• •••• •••• {card.last4}
                    </span>
                    {card.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" /> {c.default}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {card.cardName} · {c.expires}: {card.maskedExpire}
                  </p>
                  {visible && (
                    <p className="text-[10px] font-black mt-1 text-violet-600 dark:text-violet-400">
                      {bal === 'loading'
                        ? c.fetching
                        : bal === null
                        ? c.noBalance
                        : bal?.balance !== null
                        ? `${bal.balance?.toLocaleString()} ${bal.currency}`
                        : c.noBalance}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => toggleBalance(card)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {visible ? c.hideBalance : c.balance}
                  </button>
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      disabled={settingDefaultId === card.id}
                      className="px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800 text-[10px] font-black uppercase tracking-widest text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-50"
                    >
                      {settingDefaultId === card.id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : c.setDefault}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
