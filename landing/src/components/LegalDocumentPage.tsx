"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translations, slugToLang } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import { LangSelect } from "@/components/LangSelect";
import { Footer } from "@/components/Footer";

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = "http://localhost:5000";
  const value = (rawUrl || fallback).trim().replace(/\/+$/, "");
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

function renderContent(raw: string) {
  const text = raw.trim();
  if (!text) return null;

  return (
    <div
      className="text-slate-600 leading-relaxed space-y-4 [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

export default function LegalDocumentPage({
  type,
  title,
  subtitle,
}: {
  type: "terms" | "privacy" | "contract";
  title: string;
  subtitle: string;
}) {
  const params = useParams();
  const lang: Language = slugToLang(params.lang as string);
  const t = translations[lang];
  const BACKEND = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${BACKEND}/api/public/legal/${type}?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setContent(String(data?.content || ""));
        setUpdatedAt(data?.updatedAt || null);
      })
      .catch(() => {
        setContent("");
        setUpdatedAt(null);
      });
  }, [BACKEND, lang, type]);

  const pageLabel =
    lang === "uz"
      ? "Hujjat"
      : lang === "ru"
        ? "Документ"
        : lang === "tr"
          ? "Belge"
          : lang === "oz"
            ? "Ҳужжат"
            : "Document";

  const pageSummary =
    lang === "uz"
      ? "Qonuniy matnlar, shartlar va siyosatlar uchun markazlashtirilgan sahifa."
      : lang === "ru"
        ? "Централизованная страница для юридических текстов, условий и политик."
        : lang === "tr"
          ? "Yasal metinler, şartlar ve politikalar için merkez sayfa."
          : lang === "oz"
            ? "Қонуний матнлар, шартлар ва сиёсатлар учун марказлашган саҳифа."
            : "Central page for legal texts, terms, and policies.";

  return (
    <div className="min-h-screen bg-slate-950 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-white/60 py-3 shadow-sm" : "bg-white/80 backdrop-blur-md py-4 border-b border-white/40"}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <Link href={`/${params.lang}`} className="flex items-center shrink-0">
            <div className="h-12 overflow-hidden flex items-center">
              <img src="/logo.png" alt="Supplio" className="h-full object-contain" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {[
              { name: t.nav.features, href: `/${params.lang}#features` },
              { name: t.nav.pricing, href: `/${params.lang}#pricing` },
              { name: t.nav.news, href: `/${params.lang}/news` },
              { name: t.nav.about, href: `/${params.lang}/about` },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LangSelect currentLang={lang} />
            <Link
              href={process.env.NEXT_PUBLIC_APP_URL || "https://app.supplio.uz"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_APP_URL || "https://app.supplio.uz"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.97] shadow-lg shadow-blue-600/20"
            >
              {t.nav.register}
            </Link>
          </div>

          <button
            className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white/80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden pt-24 px-5 bg-white">
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link href={`/${params.lang}#features`} onClick={() => setIsMenuOpen(false)}>
                {t.nav.features}
              </Link>
              <Link href={`/${params.lang}#pricing`} onClick={() => setIsMenuOpen(false)}>
                {t.nav.pricing}
              </Link>
              <Link href={`/${params.lang}/news`} onClick={() => setIsMenuOpen(false)}>
                {t.nav.news}
              </Link>
              <Link href={`/${params.lang}/about`} onClick={() => setIsMenuOpen(false)}>
                {t.nav.about}
              </Link>
              <div className="pt-4">
                <LangSelect currentLang={lang} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <section className="pt-36 pb-24 px-5 sm:px-6 text-white relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.16),_transparent_26%)]" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end">
              <div className="text-left space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-[0.25em] border border-white/10 backdrop-blur-sm">
                  <Bell className="w-3.5 h-3.5" /> {pageLabel}
                </span>
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[0.95]">
                    {title}
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    {subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-slate-100">
                    <ShieldCheck className="w-4 h-4 text-blue-300" />
                    {lang === "uz"
                      ? "Rasmiy hujjat"
                      : lang === "ru"
                        ? "Официальный документ"
                        : lang === "tr"
                          ? "Resmi belge"
                          : lang === "oz"
                            ? "Расмий ҳужжат"
                            : "Official document"}
                  </span>
                  {updatedAt && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-slate-100">
                      <BookOpen className="w-4 h-4 text-blue-300" />
                      {format(new Date(updatedAt), "dd.MM.yyyy")}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white/10 border border-white/10 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-slate-900/30">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200 mb-3">
                  {pageLabel}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {pageSummary}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    {
                      label:
                        lang === "uz"
                          ? "Versiya"
                          : lang === "ru"
                            ? "Версия"
                            : lang === "tr"
                              ? "Sürüm"
                              : lang === "oz"
                                ? "Версия"
                                : "Version",
                      value: "v1",
                    },
                    {
                      label:
                        lang === "uz"
                          ? "Qamrov"
                          : lang === "ru"
                            ? "Покрытие"
                            : lang === "tr"
                              ? "Kapsam"
                              : lang === "oz"
                                ? "Қамров"
                                : "Coverage",
                      value:
                        lang === "uz"
                          ? "5 tilda"
                          : lang === "ru"
                            ? "На 5 языках"
                            : lang === "tr"
                              ? "5 dilde"
                              : lang === "oz"
                                ? "5 тилда"
                                : "5 languages",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white/10 border border-white/10 p-4"
                    >
                      <div className="text-xs uppercase tracking-widest text-slate-300">
                        {item.label}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 mb-2">
                  {pageLabel}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {title}
                </h2>
              </div>
              {updatedAt && (
                <p className="text-xs font-bold text-slate-400">
                  {format(new Date(updatedAt), "dd.MM.yyyy")}
                </p>
              )}
            </div>

            <div className="space-y-6 text-base">
              {renderContent(content)}
              {!content && (
                <p className="text-slate-500">
                  {lang === "uz"
                    ? "Bu sahifa hozircha admin panel orqali to'ldirilmagan."
                    : lang === "ru"
                      ? "Эта страница пока не заполнена в админ-панели."
                      : lang === "tr"
                        ? "Bu sayfa henüz admin panelinde doldurulmadı."
                        : "This page has not been filled in from the admin panel yet."}
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-slate-900 text-white p-6 sm:p-7 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/15 blur-3xl rounded-full" />
              <p className="relative text-xs font-black uppercase tracking-[0.28em] text-blue-200 mb-3">
                {lang === "uz"
                  ? "Yordam"
                  : lang === "ru"
                    ? "Помощь"
                    : lang === "tr"
                      ? "Yardım"
                      : lang === "oz"
                        ? "Ёрдам"
                        : "Help"}
              </p>
              <p className="relative text-lg font-bold leading-relaxed text-slate-100">
                {lang === "uz"
                  ? "Savollaringiz bormi? Texnik yordam xizmati sizga kun-u tun yordam berishga tayyor."
                  : lang === "ru"
                    ? "У вас есть вопросы? Наша служба поддержки готова помочь вам круглосуточно."
                    : lang === "tr"
                      ? "Sorularınız mı var? Teknik destek ekibimiz size 7/24 yardımcı olmaya hazırdır."
                      : lang === "oz"
                        ? "Саволларингиз борми? Техник ёрдам хизмати сизга кун-у тун ёрдам беришга тайёр."
                        : "Do you have any questions? Our technical support team is ready to help you 24/7."}
              </p>
              <Link
                href={`/${params.lang}/docs`}
                className="relative mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-blue-50 transition-colors"
              >
                {lang === "uz"
                  ? "Barcha hujjatlar"
                  : lang === "ru"
                    ? "Все документы"
                    : lang === "tr"
                      ? "Tüm belgeler"
                      : lang === "oz"
                        ? "Барча ҳужжатлар"
                        : "All documents"}{" "}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 mb-3">
                {lang === "uz"
                  ? "Navigatsiya"
                  : lang === "ru"
                    ? "Навигация"
                    : lang === "tr"
                      ? "Gezinti"
                      : lang === "oz"
                        ? "Навигация"
                        : "Navigation"}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: t.nav.features, href: `/${params.lang}#features` },
                  { label: t.nav.pricing, href: `/${params.lang}#pricing` },
                  { label: t.nav.news, href: `/${params.lang}/news` },
                  { label: t.nav.about, href: `/${params.lang}/about` },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
