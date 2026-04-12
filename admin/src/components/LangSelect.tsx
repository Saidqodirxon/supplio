import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { type DashboardLanguage } from '../i18n/translations';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const languages: { code: DashboardLanguage; label: string; flagCode: 'uz' | 'ru' | 'tr' | 'us' }[] = [
  { code: "uz", label: "O'zbek", flagCode: "uz" },
  { code: "oz", label: "\u040E\u0437\u0431\u0435\u043A\u0447\u0430", flagCode: "uz" },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flagCode: "ru" },
  { code: "tr", label: "T\u00FCrk\u00E7e", flagCode: "tr" },
  { code: "en", label: "English", flagCode: "us" },
];

function FlagIcon({ code, size = 20 }: { code: 'uz' | 'ru' | 'tr' | 'us'; size?: number }) {
  const width = size;
  const height = Math.round(size * 0.72);

  return (
    <span
      className="inline-flex items-center justify-center rounded-[4px] overflow-hidden shadow-sm ring-1 ring-slate-200/80 shrink-0 bg-white"
      style={{ width, height }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 28 20" className="w-full h-full">
        {code === 'uz' && (
          <>
            <rect width="28" height="20" fill="#ffffff" />
            <rect width="28" height="7" fill="#1eb6e8" />
            <rect y="13" width="28" height="7" fill="#1faa59" />
            <rect y="7" width="28" height="1" fill="#d92d27" />
            <rect y="12" width="28" height="1" fill="#d92d27" />
            <circle cx="5.5" cy="4" r="2.1" fill="#ffffff" />
            <circle cx="6.3" cy="4" r="1.7" fill="#1eb6e8" />
            <circle cx="9.1" cy="2.6" r="0.45" fill="#ffffff" />
            <circle cx="10.7" cy="2.6" r="0.45" fill="#ffffff" />
            <circle cx="12.3" cy="2.6" r="0.45" fill="#ffffff" />
            <circle cx="9.9" cy="4.2" r="0.45" fill="#ffffff" />
            <circle cx="11.5" cy="4.2" r="0.45" fill="#ffffff" />
            <circle cx="13.1" cy="4.2" r="0.45" fill="#ffffff" />
            <circle cx="9.1" cy="5.8" r="0.45" fill="#ffffff" />
            <circle cx="10.7" cy="5.8" r="0.45" fill="#ffffff" />
            <circle cx="12.3" cy="5.8" r="0.45" fill="#ffffff" />
          </>
        )}
        {code === 'ru' && (
          <>
            <rect width="28" height="20" fill="#ffffff" />
            <rect y="6.67" width="28" height="6.67" fill="#1f5fbf" />
            <rect y="13.34" width="28" height="6.66" fill="#d52b1e" />
          </>
        )}
        {code === 'tr' && (
          <>
            <rect width="28" height="20" fill="#e11d48" />
            <circle cx="11" cy="10" r="5" fill="#ffffff" />
            <circle cx="12.3" cy="10" r="4" fill="#e11d48" />
            <polygon points="16.5,10 21,8.2 19.3,12.7 19.8,7.9 23.2,11 18.5,10.2 22.2,13.2" fill="#ffffff" />
          </>
        )}
        {code === 'us' && (
          <>
            <rect width="28" height="20" fill="#ffffff" />
            <rect width="28" height="2" y="0" fill="#b91c1c" />
            <rect width="28" height="2" y="4" fill="#b91c1c" />
            <rect width="28" height="2" y="8" fill="#b91c1c" />
            <rect width="28" height="2" y="12" fill="#b91c1c" />
            <rect width="28" height="2" y="16" fill="#b91c1c" />
            <rect width="12" height="10" fill="#1d4ed8" />
            <circle cx="3" cy="2.5" r="0.6" fill="#ffffff" />
            <circle cx="6" cy="2.5" r="0.6" fill="#ffffff" />
            <circle cx="9" cy="2.5" r="0.6" fill="#ffffff" />
            <circle cx="4.5" cy="5" r="0.6" fill="#ffffff" />
            <circle cx="7.5" cy="5" r="0.6" fill="#ffffff" />
            <circle cx="3" cy="7.5" r="0.6" fill="#ffffff" />
            <circle cx="6" cy="7.5" r="0.6" fill="#ffffff" />
            <circle cx="9" cy="7.5" r="0.6" fill="#ffffff" />
          </>
        )}
      </svg>
    </span>
  );
}

export const LangSelect: React.FC = () => {
  const { language, setLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((lang) => lang.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[1.25rem] hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-95 group shadow-sm"
      >
        <FlagIcon code={currentLang.flagCode} size={18} />
        <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest hidden sm:block">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-all duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-950/30 border border-slate-100 dark:border-white/5 p-2 z-50 overflow-hidden"
            >
              <div className="space-y-0.5">
                {languages.map((lang) => {
                  const isActive = language === lang.code;

                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={clsx(
                        "w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest",
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FlagIcon code={lang.flagCode} size={18} />
                        {lang.label}
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
