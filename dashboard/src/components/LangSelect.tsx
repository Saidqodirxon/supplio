import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { type DashboardLanguage } from '../i18n/translations';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const languages: { code: DashboardLanguage; label: string; flag: string }[] = [
  { code: "uz", label: "O'zbek", flag: "https://flagcdn.com/w40/uz.png" },
  { code: "oz", label: "Ўзбекча", flag: "https://flagcdn.com/w40/uz.png" },
  { code: "ru", label: "Русский", flag: "https://flagcdn.com/w40/ru.png" },
  { code: "tr", label: "Türkçe", flag: "https://flagcdn.com/w40/tr.png" },
  { code: "en", label: "English", flag: "https://flagcdn.com/w40/us.png" },
];

export const LangSelect: React.FC = () => {
  const { language, setLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[1.25rem] hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-95 group shadow-sm"
      >
        <div className="w-6 h-4 overflow-hidden rounded-sm flex items-center justify-center">
          <img src={currentLang.flag} alt={currentLang.label} className="w-full h-full object-cover" />
        </div>
        <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest hidden sm:block">
          {currentLang.label}
        </span>
        <ChevronDown className={clsx("w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl shadow-slate-950/40 border border-slate-200 dark:border-white/5 p-2 z-50 overflow-hidden"
            >
              <div className="space-y-1">
                {languages.map((l) => {
                  const isActive = language === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsOpen(false);
                      }}
                      className={clsx(
                        "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-3.5 overflow-hidden rounded-sm">
                          <img src={l.flag} alt={l.label} className="w-full h-full object-cover" />
                        </div>
                        {l.label}
                      </div>
                      {isActive && <Check className="w-4 h-4" />}
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
