import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '../utils/toast';
import api from '../services/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  currentPlan?: string;
  language?: string;
}

interface ModalCopy {
  title: string;
  subtitle: string;
  dealers: string;
  users: string;
  branches: string;
  products: string;
  sendRequest: string;
  sending: string;
  successTitle: string;
  successDesc: string;
  close: string;
  currentPlan: string;
  requestedPlan: string;
  selectPlan: string;
  duplicate: string;
  error: string;
  benefits: string[];
  planOptions: Array<{ value: string; label: string }>;
}

const LABELS: Record<string, ModalCopy> = {
  uz: {
    title: "Tarifni oshirish",
    subtitle: "Joriy tarif limitiga yetgansiz. Yangi tarif uchun so'rov yuboring.",
    dealers: "Dilerlar soni limitga yetdi",
    users: "Xodimlar soni limitga yetdi",
    branches: "Filiallar soni limitga yetdi",
    products: "Mahsulotlar soni limitga yetdi",
    sendRequest: "So'rov yuborish",
    sending: "Yuborilmoqda...",
    successTitle: "So'rov yuborildi",
    successDesc: "Admin tez orada siz bilan bog'lanadi.",
    close: "Yopish",
    currentPlan: "Joriy tarif",
    requestedPlan: "So'ralayotgan tarif",
    selectPlan: "Tarifni tanlang",
    duplicate: "Sizda allaqachon kutilayotgan tarif so'rovi bor.",
    error: "Xato yuz berdi",
    benefits: ["Ko'proq diler", "Ko'proq mahsulot", "Ko'proq filial", "Ko'proq xodim"],
    planOptions: [
      { value: "START", label: "START" },
      { value: "PRO", label: "PRO" },
      { value: "PREMIUM", label: "PREMIUM" },
    ],
  },
  ru: {
    title: "Повышение тарифа",
    subtitle: "Вы достигли лимита текущего тарифа. Отправьте запрос на новый план.",
    dealers: "Достигнут лимит дилеров",
    users: "Достигнут лимит сотрудников",
    branches: "Достигнут лимит филиалов",
    products: "Достигнут лимит товаров",
    sendRequest: "Отправить запрос",
    sending: "Отправка...",
    successTitle: "Запрос отправлен",
    successDesc: "Администратор скоро свяжется с вами.",
    close: "Закрыть",
    currentPlan: "Текущий тариф",
    requestedPlan: "Запрашиваемый тариф",
    selectPlan: "Выберите тариф",
    duplicate: "У вас уже есть ожидающий запрос на тариф.",
    error: "Произошла ошибка",
    benefits: ["Больше дилеров", "Больше товаров", "Больше филиалов", "Больше сотрудников"],
    planOptions: [
      { value: "START", label: "START" },
      { value: "PRO", label: "PRO" },
      { value: "PREMIUM", label: "PREMIUM" },
    ],
  },
  en: {
    title: "Upgrade Your Plan",
    subtitle: "You've reached your current plan limit. Send a request for a higher plan.",
    dealers: "Dealer limit reached",
    users: "Staff limit reached",
    branches: "Branch limit reached",
    products: "Product limit reached",
    sendRequest: "Send Request",
    sending: "Sending...",
    successTitle: "Request Sent",
    successDesc: "Admin will contact you shortly.",
    close: "Close",
    currentPlan: "Current plan",
    requestedPlan: "Requested plan",
    selectPlan: "Choose a plan",
    duplicate: "You already have a pending upgrade request.",
    error: "Something went wrong",
    benefits: ["More dealers", "More products", "More branches", "More staff"],
    planOptions: [
      { value: "START", label: "START" },
      { value: "PRO", label: "PRO" },
      { value: "PREMIUM", label: "PREMIUM" },
    ],
  },
  tr: {
    title: "Plani Yukselt",
    subtitle: "Mevcut plan limitine ulaştınız. Daha yüksek plan için istek gönderin.",
    dealers: "Bayi limiti doldu",
    users: "Personel limiti doldu",
    branches: "Şube limiti doldu",
    products: "Ürün limiti doldu",
    sendRequest: "İstek Gönder",
    sending: "Gönderiliyor...",
    successTitle: "İstek Gönderildi",
    successDesc: "Yönetici kısa süre içinde sizinle iletişime geçecek.",
    close: "Kapat",
    currentPlan: "Mevcut plan",
    requestedPlan: "İstenen plan",
    selectPlan: "Plan seçin",
    duplicate: "Zaten bekleyen bir yükseltme isteğiniz var.",
    error: "Bir hata oluştu",
    benefits: ["Daha fazla bayi", "Daha fazla ürün", "Daha fazla şube", "Daha fazla personel"],
    planOptions: [
      { value: "START", label: "START" },
      { value: "PRO", label: "PRO" },
      { value: "PREMIUM", label: "PREMIUM" },
    ],
  },
};

function getInitialRequestedPlan(currentPlan?: string) {
  if (currentPlan === 'FREE') return 'START';
  if (currentPlan === 'START') return 'PRO';
  return 'PREMIUM';
}

export default function UpgradeModal({
  isOpen,
  onClose,
  reason,
  currentPlan,
  language = 'uz',
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [requestedPlan, setRequestedPlan] = useState(getInitialRequestedPlan(currentPlan));

  const lang = (LABELS[language] ? language : 'uz') as keyof typeof LABELS;
  const l = LABELS[lang];
  const availablePlans = l.planOptions.filter((option) => option.value !== currentPlan);

  useEffect(() => {
    if (isOpen) {
      setDone(false);
      setRequestedPlan(getInitialRequestedPlan(currentPlan));
    }
  }, [isOpen, currentPlan]);

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post('/super/upgrade-requests', { requestedPlan });
      setDone(true);
    } catch (error: any) {
      const message = String(error?.response?.data?.message || '');
      if (message.toUpperCase().includes('PENDING')) {
        toast.error(l.duplicate);
      } else {
        toast.error(message || l.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white text-center relative">
              <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 fill-white" />
              </div>
              {!done ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">{l.title}</h2>
                  {reason && <p className="text-blue-100 text-sm font-semibold">{l[reason as keyof ModalCopy] as string || ''}</p>}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">{l.successTitle}</h2>
                  <p className="text-blue-100 text-sm">{l.successDesc}</p>
                </>
              )}
            </div>

            <div className="p-8">
              {!done ? (
                <>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{l.subtitle}</p>

                  <div className="space-y-3 mb-8">
                    {l.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-6">
                    {currentPlan && (
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{l.currentPlan}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{currentPlan}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        {l.requestedPlan}
                      </label>
                      <select
                        value={requestedPlan}
                        onChange={(e) => setRequestedPlan(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        {availablePlans.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={loading || !requestedPlan}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{l.sending}</>
                    ) : (
                      <>{l.sendRequest}<ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <button onClick={handleClose} className="mt-4 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-80 transition-all">
                    {l.close}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
