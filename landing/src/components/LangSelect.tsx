"use client";

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Language, langToSlug } from '../i18n/translations';
import { useRouter } from 'next/navigation';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "uz", label: "O'zbek", flag: "https://flagcdn.com/w20/uz.png" },
  { code: "oz", label: "Ўзбек", flag: "https://flagcdn.com/w20/uz.png" },
  { code: "ru", label: "Русский", flag: "https://flagcdn.com/w20/ru.png" },
  { code: "tr", label: "Türkçe", flag: "https://flagcdn.com/w20/tr.png" },
  { code: "en", label: "English", flag: "https://flagcdn.com/w20/us.png" },
];

interface LangSelectProps {
  currentLang: Language;
}

export const LangSelect: React.FC<LangSelectProps> = ({ currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const selected = languages.find(l => l.code === currentLang) || languages[0];

  const handleLangChange = (code: Language) => {
    const slug = langToSlug(code);
    router.push(`/${slug}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all active:scale-[0.97] group shadow-sm"
      >
        <img src={selected.flag} alt={selected.code} width={20} height={14} className="rounded-sm object-cover shrink-0" />
        <span className="text-xs font-semibold text-slate-700 hidden sm:block">
          {selected.label}
        </span>
        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-50 overflow-hidden"
            >
              <div className="space-y-1.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                      currentLang === l.code
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img src={l.flag} alt={l.code} width={20} height={14} className="rounded-sm object-cover shrink-0" />
                      {l.label}
                    </div>
                    {currentLang === l.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
