import {
  AlertTriangle,
  RotateCcw,
  Search,
  Home,
  ServerCrash,
  Clock,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';

function useT() {
  const { language } = useAuthStore();
  return dashboardTranslations[language];
}

export function NotFound() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <Search className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-blue-600">404</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.errors.notFound}</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.errors.notFoundDesc}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.97] transition-all">
            <Home className="w-4 h-4" /> {t.errors.goHome}
          </Link>
          <button onClick={() => window.history.back()} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.97] transition-all">
            <ArrowLeft className="w-4 h-4" /> {t.errors.goBack}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ServerError() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 mx-auto">
          <ServerCrash className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-rose-600">500</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.errors.serverError}</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.errors.serverErrorDesc}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.97] transition-all">
            <RotateCcw className="w-4 h-4" /> {t.errors.tryAgain}
          </button>
          <Link to="/" className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.97] transition-all">
            <Home className="w-4 h-4" /> {t.errors.goHome}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function Maintenance() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-amber-600">{t.errors.maintenance}</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.errors.maintenance}</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.errors.maintenanceDesc}</p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 font-medium">
          <Clock className="w-4 h-4 text-amber-500" />
          {t.errors.expectedDowntime}
        </div>
      </motion.div>
    </div>
  );
}

export function SubscriptionExpired() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mx-auto">
          <CreditCard className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-indigo-600">{t.dashboard.subscription}</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.errors.subscriptionExpired}</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.errors.subscriptionExpiredDesc}</p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link to="/settings" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.97] transition-all">
            <CreditCard className="w-4 h-4" /> {t.errors.renewSubscription}
          </Link>
          <p className="text-xs text-slate-400">
            {t.common.error}? <a href="mailto:support@supplio.uz" className="text-blue-600 hover:underline">support@supplio.uz</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function AccountLocked() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-amber-600">Locked</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.errors.lockedTitle || 'Account Locked'}</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.errors.lockedDesc || 'Access restricted due to payment issues.'}</p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <RotateCcw className="w-4 h-4" /> {t.errors.tryAgain}
          </button>
          <p className="text-xs text-slate-400">
            Please contact billing: <a href="mailto:billing@supplio.uz" className="text-blue-600 hover:underline">billing@supplio.uz</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
