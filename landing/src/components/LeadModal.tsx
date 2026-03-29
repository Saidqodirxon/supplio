"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, User, Phone, Info, Loader2, Package } from "lucide-react";
import { translations, Language } from "@/i18n/translations";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  tariffs?: Record<string, unknown>[];
  unlockDemoAfterSubmit?: boolean;
}

function normalizeApiBaseUrl(rawUrl?: string) {
  const fallback = 'https://api.supplio.uz';
  const value = (rawUrl || fallback).trim().replace(/\/+$/, '');
  return value.endsWith('/api') ? value.slice(0, -4) : value;
}

function normalizeAppBaseUrl(rawUrl?: string) {
  const fallback = 'https://demo.supplio.uz';
  return (rawUrl || fallback).trim().replace(/\/+$/, '');
}

export default function LeadModal({ isOpen, onClose, lang, tariffs, unlockDemoAfterSubmit = false }: LeadModalProps) {
  const [formData, setFormData] = useState({ fullName: "", phone: "", info: "", tariffId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = translations[lang];
  const API = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  const APP_LOGIN_FULL_DEMO_URL = `${normalizeAppBaseUrl(process.env.NEXT_PUBLIC_DEMO_URL)}/login?demo=1&access=full`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
        if (unlockDemoAfterSubmit) {
          setTimeout(() => {
            window.location.href = APP_LOGIN_FULL_DEMO_URL;
          }, 1200);
        }
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setFormData({ fullName: "", phone: "", info: "", tariffId: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Lead submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {t.common.leadForm.title}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {t.common.leadForm.subtitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {t.common.leadForm.success}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        required
                        type="text"
                        placeholder={t.common.leadForm.name}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder={t.common.leadForm.phone}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    {tariffs && tariffs.length > 0 && (
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none text-slate-700"
                          value={formData.tariffId}
                          onChange={(e) => setFormData({ ...formData, tariffId: e.target.value })}
                        >
                          <option value="" disabled className="text-slate-400">
                            {lang === 'uz' ? 'Tarifni tanlang' : lang === 'ru' ? 'Выберите тариф' : lang === 'tr' ? 'Tarife seçin' : 'Select a Plan'}
                          </option>
                          {tariffs.map((tItem: Record<string, unknown>, i: number) => {
                            const tName = String(tItem[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || tItem.name || `Plan ${i + 1}`);
                            return (
                              <option key={(tItem.id as string) || i} value={(tItem.id as string) || tName}>
                                {tName} - {tItem.price as string} {t.common.uzs || 'UZS'}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute left-4 top-4 text-slate-400">
                        <Info className="w-4 h-4" />
                      </div>
                      <textarea
                        rows={3}
                        placeholder={t.common.leadForm.info}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                        value={formData.info}
                        onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.97] transition-all text-sm disabled:opacity-50 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {t.common.leadForm.submit} <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
