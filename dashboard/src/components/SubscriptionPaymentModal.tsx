import { useState, useEffect } from 'react';
import { X, CreditCard, ExternalLink, Loader2, CheckCircle, AlertCircle, Plus, Star } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface TariffPlan {
  id: string;
  planKey: string;
  priceMonthly: string;
  priceYearly: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
}

interface SavedCard {
  id: string;
  last4: string;
  maskedExpire: string;
  cardName: string;
  isDefault: boolean;
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

type PaymentMethod = 'CLICK' | 'PAYLOV';
type ModalStep = 'method' | 'paylov-cards' | 'paylov-add' | 'processing' | 'success' | 'error';

const INIT_ADD: AddCardState = {
  step: 'form', cardNumber: '', expireDate: '', phoneNumber: '', cardName: '',
  cid: '', otp: '', loading: false, error: '',
};

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

const COPY: Record<string, Record<string, string>> = {
  en: {
    title: 'Purchase Plan', chooseMethod: 'Choose payment method',
    click: 'Pay via Click', clickDesc: 'Redirect to Click payment page',
    paylov: 'Pay via Paylov Card', paylovDesc: 'Pay directly with saved card',
    selectCard: 'Select a card', addNewCard: 'Add new card',
    pay: 'Pay', paying: 'Processing...', cancel: 'Cancel',
    back: 'Back', success: 'Payment Successful!', successDesc: 'Your subscription has been activated.',
    error: 'Payment Failed', retry: 'Try Again', close: 'Close',
    cardNumber: 'Card Number', expire: 'Expire (MMYY)', phone: 'Phone Number',
    cardName: 'Card Name (optional)', sendOtp: 'Send OTP', confirm: 'Confirm',
    otpCode: 'Enter OTP code', otpHint: 'Paylov sent OTP to your phone',
    monthly: 'Monthly', noCards: 'No saved cards', amount: 'Amount',
    redirecting: 'Redirecting to Click...',
  },
  uz: {
    title: 'Tarifni sotib olish', chooseMethod: "To'lov usulini tanlang",
    click: 'Click orqali', clickDesc: "Click to'lov sahifasiga yo'naltiradi",
    paylov: 'Paylov kartasi bilan', paylovDesc: "Saqlangan karta orqali to'lash",
    selectCard: 'Kartani tanlang', addNewCard: 'Yangi karta qo\'shish',
    pay: "To'lash", paying: 'Jarayon...', cancel: 'Bekor',
    back: 'Orqaga', success: "To'lov muvaffaqiyatli!", successDesc: "Obunangiz faollashtirildi.",
    error: "To'lov xatosi", retry: 'Qayta urinish', close: 'Yopish',
    cardNumber: 'Karta raqami', expire: 'Muddat (MMYY)', phone: 'Telefon',
    cardName: 'Karta nomi (ixtiyoriy)', sendOtp: 'OTP yuborish', confirm: 'Tasdiqlash',
    otpCode: 'OTP kodni kiriting', otpHint: 'Paylov telefoningizga OTP yubordi',
    monthly: 'Oylik', noCards: 'Saqlangan kartalar yo\'q', amount: 'Summa',
    redirecting: 'Click sahifasiga yo\'naltirilmoqda...',
  },
  ru: {
    title: 'Купить тариф', chooseMethod: 'Выберите способ оплаты',
    click: 'Оплатить через Click', clickDesc: 'Перенаправление на страницу Click',
    paylov: 'Оплатить картой Paylov', paylovDesc: 'Оплата сохранённой картой',
    selectCard: 'Выберите карту', addNewCard: 'Добавить карту',
    pay: 'Оплатить', paying: 'Обработка...', cancel: 'Отмена',
    back: 'Назад', success: 'Оплата прошла!', successDesc: 'Ваша подписка активирована.',
    error: 'Ошибка оплаты', retry: 'Попробовать снова', close: 'Закрыть',
    cardNumber: 'Номер карты', expire: 'Срок (MMYY)', phone: 'Телефон',
    cardName: 'Название карты (необяз.)', sendOtp: 'Отправить OTP', confirm: 'Подтвердить',
    otpCode: 'Введите OTP код', otpHint: 'Paylov отправил OTP на ваш телефон',
    monthly: 'Ежемес.', noCards: 'Нет сохранённых карт', amount: 'Сумма',
    redirecting: 'Перенаправление на Click...',
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tariff: TariffPlan;
  billingYearly: boolean;
  language: string;
  onSuccess?: () => void;
}

export default function SubscriptionPaymentModal({ isOpen, onClose, tariff, billingYearly, language, onSuccess }: Props) {
  const lang = language === 'ru' ? 'ru' : language === 'uz' || language === 'oz' ? 'uz' : 'en';
  const c = COPY[lang] || COPY.en;

  const amount = billingYearly && Number(tariff.priceYearly) > 0
    ? Number(tariff.priceYearly)
    : Number(tariff.priceMonthly);

  const displayName = lang === 'uz' ? tariff.nameUz : lang === 'ru' ? tariff.nameRu : tariff.nameEn;

  const [step, setStep] = useState<ModalStep>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [add, setAdd] = useState<AddCardState>(INIT_ADD);

  useEffect(() => {
    if (!isOpen) {
      setStep('method');
      setMethod(null);
      setSelectedCard('');
      setErrorMsg('');
      setAdd(INIT_ADD);
    }
  }, [isOpen]);

  async function loadCards() {
    setCardsLoading(true);
    try {
      const res = await api.get<SavedCard[]>('/saas-payment/cards');
      const list = Array.isArray(res.data) ? res.data : [];
      setCards(list);
      const def = list.find(c => c.isDefault);
      if (def) setSelectedCard(def.id);
      else if (list.length > 0) setSelectedCard(list[0].id);
    } finally {
      setCardsLoading(false);
    }
  }

  async function handleMethodSelect(m: PaymentMethod) {
    setMethod(m);
    if (m === 'PAYLOV') {
      await loadCards();
      setStep('paylov-cards');
    } else {
      setStep('processing');
      try {
        const res = await api.post<{ paymentUrl: string }>('/saas-payment/click/create', {
          planKey: tariff.planKey,
          amount,
        });
        window.location.href = res.data.paymentUrl;
      } catch (e: any) {
        setErrorMsg(e.response?.data?.message || 'Error creating Click payment');
        setStep('error');
      }
    }
  }

  async function handlePaylovPay() {
    if (!selectedCard) return;
    setPaying(true);
    try {
      await api.post('/saas-payment/paylov/pay', {
        savedCardId: selectedCard,
        planKey: tariff.planKey,
        amount,
      });
      setStep('success');
      onSuccess?.();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Payment failed');
      setStep('error');
    } finally {
      setPaying(false);
    }
  }

  async function handleAddCardSubmit() {
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
      await api.post('/saas-payment/cards/confirm', { cid: add.cid, otp: add.otp, cardName: add.cardName || undefined });
      await loadCards();
      setAdd(INIT_ADD);
      setStep('paylov-cards');
    } catch (e: any) {
      setAdd(p => ({ ...p, loading: false, error: e.response?.data?.message || 'Wrong OTP' }));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{c.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              {tariff.planKey} · {displayName} · {amount.toLocaleString()} UZS {c.monthly}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step: choose method */}
          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{c.chooseMethod}</p>
              <button
                onClick={() => handleMethodSelect('CLICK')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                  <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{c.click}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{c.clickDesc}</p>
                </div>
              </button>
              <button
                onClick={() => handleMethodSelect('PAYLOV')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60 transition-colors">
                  <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{c.paylov}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{c.paylovDesc}</p>
                </div>
              </button>
            </div>
          )}

          {/* Step: select paylov card */}
          {step === 'paylov-cards' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep('method')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">← {c.back}</button>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.selectCard}</span>
              </div>

              {cardsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : cards.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm font-black text-slate-500">{c.noCards}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cards.map(card => (
                    <label key={card.id} className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                      selectedCard === card.id
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-violet-300"
                    )}>
                      <input type="radio" name="card" value={card.id} checked={selectedCard === card.id} onChange={() => setSelectedCard(card.id)} className="accent-violet-600" />
                      <CreditCard className={clsx("w-5 h-5 shrink-0", selectedCard === card.id ? "text-violet-600" : "text-slate-400")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white font-mono">•••• {card.last4}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{card.cardName} · {card.maskedExpire}</p>
                      </div>
                      {card.isDefault && <Star className="w-3.5 h-3.5 text-violet-500" />}
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setAdd(INIT_ADD); setStep('paylov-add'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> {c.addNewCard}
              </button>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePaylovPay}
                  disabled={!selectedCard || paying}
                  className="flex-1 py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {paying ? c.paying : `${c.pay} ${amount.toLocaleString()} UZS`}
                </button>
              </div>
            </div>
          )}

          {/* Step: add card */}
          {step === 'paylov-add' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep('paylov-cards')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">← {c.back}</button>
              </div>

              {add.step === 'form' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.cardNumber}</label>
                    <input
                      type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                      value={formatCardNumber(add.cardNumber)}
                      onChange={e => setAdd(p => ({ ...p, cardNumber: e.target.value.replace(/\s/g, '') }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.expire}</label>
                      <input
                        type="text" inputMode="numeric" placeholder="MMYY"
                        value={add.expireDate}
                        onChange={e => setAdd(p => ({ ...p, expireDate: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{c.phone}</label>
                      <input
                        type="tel" placeholder="+998..."
                        value={add.phoneNumber}
                        onChange={e => setAdd(p => ({ ...p, phoneNumber: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                  {add.error && <p className="text-xs text-rose-600 font-bold">{add.error}</p>}
                  <button
                    onClick={handleAddCardSubmit}
                    disabled={add.loading || add.cardNumber.length !== 16 || add.expireDate.length !== 4 || add.phoneNumber.length < 10}
                    className="w-full py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {add.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {c.sendOtp}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500 font-bold">{c.otpHint}</p>
                  <input
                    type="text" inputMode="numeric" placeholder="000000"
                    value={add.otp}
                    onChange={e => setAdd(p => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-mono font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {add.error && <p className="text-xs text-rose-600 font-bold">{add.error}</p>}
                  <button
                    onClick={handleOtpConfirm}
                    disabled={add.loading || add.otp.length < 4}
                    className="w-full py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {add.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {c.confirm}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step: processing (Click redirect) */}
          {step === 'processing' && (
            <div className="py-10 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="text-sm font-black text-slate-600 dark:text-slate-400">{c.redirecting}</p>
            </div>
          )}

          {/* Step: success */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white">{c.success}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{c.successDesc}</p>
              </div>
              <button onClick={onClose} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                {c.close}
              </button>
            </div>
          )}

          {/* Step: error */}
          {step === 'error' && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-rose-500" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white">{c.error}</p>
                {errorMsg && <p className="text-sm text-rose-500 mt-1">{errorMsg}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('method')} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  {c.retry}
                </button>
                <button onClick={onClose} className="px-6 py-2.5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {c.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
