import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { type DashboardLanguage } from '../i18n/translations';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const languages: { code: DashboardLanguage; label: string; iso: string }[] = [
  { code: "uz", label: "O'zbek",    iso: "uz" },
  { code: "oz", label: "Ўзбекча",   iso: "uz" },
  { code: "ru", label: "Русский",   iso: "ru" },
  { code: "tr", label: "Türkçe",    iso: "tr" },
  { code: "en", label: "English",   iso: "us" },
];

function FlagImg({ iso, size = 20 }: { iso: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase w-5 text-center shrink-0">
        {iso.toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w20/${iso}.png`}
      width={size}
      height={Math.round(size * 0.7)}
      alt={iso}
      className="rounded-sm object-cover shrink-0"
      onError={() => setErr(true)}
    />
  );
}

export const LangSelect: React.FC = () => {
  const { language, setLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[1.25rem] hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-95 group shadow-sm"
      >
        <FlagImg iso={currentLang.iso} size={20} />
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
                        "w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest",
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FlagImg iso={l.iso} size={20} />
                        {l.label}
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
