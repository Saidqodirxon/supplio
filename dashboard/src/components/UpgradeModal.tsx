import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string; // e.g. "dealers", "users", "branches", "products"
  currentPlan?: string;
  language?: string;
}

const LABELS: Record<string, Record<string, string>> = {
  uz: {
    title: "Tarifni oshirish",
    subtitle: "Sizning joriy rejangiz limitiga yetdi. Kengaytirish uchun so'rov yuboring.",
    dealers: "Dilerlar soni limitga yetdi",
    users: "Foydalanuvchilar soni limitga yetdi",
    branches: "Filiallar soni limitga yetdi",
    products: "Mahsulotlar soni limitga yetdi",
    sendRequest: "So'rov yuborish",
    sending: "Yuborilmoqda...",
    successTitle: "So'rov yuborildi!",
    successDesc: "Admin tez orada siz bilan bog'lanadi.",
    close: "Yopish",
    benefits: ["Ko'proq diler qo'shing", "Ko'proq mahsulot boshqaring", "Ko'proq filial oching", "Ko'proq xodim qo'shing"],
  },
  ru: {
    title: "Повышение тарифа",
    subtitle: "Ваш текущий план достиг лимита. Отправьте запрос для расширения.",
    dealers: "Лимит дилеров достигнут",
    users: "Лимит пользователей достигнут",
    branches: "Лимит филиалов достигнут",
    products: "Лимит продуктов достигнут",
    sendRequest: "Отправить запрос",
    sending: "Отправка...",
    successTitle: "Запрос отправлен!",
    successDesc: "Администратор свяжется с вами в ближайшее время.",
    close: "Закрыть",
    benefits: ["Добавьте больше дилеров", "Управляйте большим числом продуктов", "Откройте больше филиалов", "Добавьте больше сотрудников"],
  },
  en: {
    title: "Upgrade Your Plan",
    subtitle: "Your current plan has reached its limit. Send a request to upgrade.",
    dealers: "Dealer limit reached",
    users: "User limit reached",
    branches: "Branch limit reached",
    products: "Product limit reached",
    sendRequest: "Send Request",
    sending: "Sending...",
    successTitle: "Request Sent!",
    successDesc: "Admin will contact you shortly.",
    close: "Close",
    benefits: ["Add more dealers", "Manage more products", "Open more branches", "Add more staff"],
  },
  tr: {
    title: "Planı Yükselt",
    subtitle: "Mevcut planınız limite ulaştı. Yükseltme talebi gönderin.",
    dealers: "Bayi limiti doldu",
    users: "Kullanıcı limiti doldu",
    branches: "Şube limiti doldu",
    products: "Ürün limiti doldu",
    sendRequest: "İstek Gönder",
    sending: "Gönderiliyor...",
    successTitle: "İstek Gönderildi!",
    successDesc: "Yönetici kısa süre içinde sizinle iletişime geçecek.",
    close: "Kapat",
    benefits: ["Daha fazla bayi ekleyin", "Daha fazla ürün yönetin", "Daha fazla şube açın", "Daha fazla personel ekleyin"],
  },
};

export default function UpgradeModal({ isOpen, onClose, reason, currentPlan, language = 'uz' }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const lang = (LABELS[language] ? language : 'uz') as keyof typeof LABELS;
  const l = LABELS[lang];

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post('/super/upgrade-requests', { requestedPlan: null });
      setDone(true);
    } catch {
      toast.error(lang === 'uz' ? 'Xato yuz berdi' : lang === 'ru' ? 'Произошла ошибка' : 'An error occurred');
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
            {/* Header gradient */}
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
                  {reason && <p className="text-blue-100 text-sm font-semibold">{l[reason as keyof typeof l] || ''}</p>}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">{l.successTitle}</h2>
                  <p className="text-blue-100 text-sm">{l.successDesc}</p>
                </>
              )}
            </div>

            {/* Body */}
            <div className="p-8">
              {!done ? (
                <>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{l.subtitle}</p>

                  <div className="space-y-3 mb-8">
                    {l.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        {b}
                      </div>
                    ))}
                  </div>

                  {currentPlan && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {lang === 'uz' ? 'Joriy tarif' : lang === 'ru' ? 'Текущий план' : 'Current plan'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{currentPlan}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={loading}
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
