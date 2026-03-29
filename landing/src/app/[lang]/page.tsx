"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronRight,
  BarChart3,
  Menu,
  X,
  Newspaper,
  Calendar,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  MessageCircle,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translations, slugToLang, howItWorksTranslations, testimonialsLabel } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import Link from "next/link";
import { LangSelect } from "@/components/LangSelect";
import LeadModal from "@/components/LeadModal";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
};

interface DynamicNews {
  id: string;
  image?: string;
  createdAt: string;
  [key: string]: string | undefined;
}

interface DynamicTariff {
  id: string;
  price: string;
  isPopular: boolean;
  [key: string]: string | string[] | boolean | undefined;
}

type SafePlan = {
  name?: string;
  price: string;
  features?: string[];
  isPopular?: boolean;
  [key: string]: unknown;
};

function getBotFeature(limit: number, lang: Language): string {
  if (limit <= 0) {
    return lang === 'uz' ? 'Telegram bot yo\'q' : lang === 'ru' ? 'Bez Telegram bota' : lang === 'tr' ? 'Telegram bot yok' : 'No Telegram bot';
  }
  if (limit >= 99999) {
    return lang === 'uz' ? 'Cheksiz Telegram bot' : lang === 'ru' ? 'Bezlimit Telegram botov' : lang === 'tr' ? 'Sinirsiz Telegram bot' : 'Unlimited Telegram bots';
  }
  return lang === 'uz' ? `${limit} ta Telegram bot` : `${limit} Telegram bot`;
}

type SafeNews = {
  id?: number | string;
  title?: string;
  excerpt?: string;
  slug?: string;
  date?: string;
  createdAt?: string;
  image?: string;
  [key: string]: unknown;
};

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = 'http://localhost:5000';
  const value = (rawUrl || fallback).trim().replace(/\/+$/, '');
  return value.endsWith('/api') ? value.slice(0, -4) : value;
}

function normalizeAppBaseUrl(rawUrl?: string) {
  const fallback = 'https://app.supplio.uz';
  return (rawUrl || fallback).trim().replace(/\/+$/, '');
}

interface DynamicSettings {
  newsEnabled: boolean;
  defaultTrialDays?: number;
  globalNotifyUz?: string;
  globalNotifyRu?: string;
  globalNotifyEn?: string;
  globalNotifyTr?: string;
  superAdminPhone?: string;
  [key: string]: string | number | boolean | undefined;
}

interface DynamicLanding {
  heroTitleUz?: string; heroTitleRu?: string; heroTitleEn?: string; heroTitleTr?: string;
  heroSubtitleUz?: string; heroSubtitleRu?: string; heroSubtitleEn?: string; heroSubtitleTr?: string;
  heroBadgeUz?: string; heroBadgeRu?: string; heroBadgeEn?: string; heroBadgeTr?: string;
  contactPhone?: string; contactEmail?: string;
  socialTelegram?: string; socialLinkedin?: string; socialTwitter?: string;
  footerDescUz?: string; footerDescRu?: string; footerDescEn?: string; footerDescTr?: string;
  [key: string]: string | undefined;
}

export default function LandingPage() {
  const params = useParams();
  const lang: Language = slugToLang(params.lang as string);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [dynamicNews, setDynamicNews] = useState<DynamicNews[]>([]);
  const [dynamicTariffs, setDynamicTariffs] = useState<DynamicTariff[]>([]);
  const [settings, setSettings] = useState<DynamicSettings | null>(null);
  const [landing, setLanding] = useState<DynamicLanding | null>(null);
  const [testimonials, setTestimonials] = useState<Array<{ id: string; name: string; company?: string; roleTitle?: string; contentUz: string; contentRu: string; contentEn: string; contentTr: string; rating: number }>>([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const BACKEND = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  const APP_LOGIN_URL = `${normalizeAppBaseUrl(process.env.NEXT_PUBLIC_APP_URL)}/login`;
  const DEMO_LOGIN_URL = `${normalizeAppBaseUrl(process.env.NEXT_PUBLIC_DEMO_URL || 'https://demo.supplio.uz')}/login`;

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/public/home`);
        const data = await res.json();
        setDynamicNews(Array.isArray(data.news) ? data.news : []);
        if (data.tariffs?.length > 0) setDynamicTariffs(data.tariffs);
        if (data.settings) setSettings(data.settings);
        if (data.landing) setLanding(data.landing);

        try {
          const contentRes = await fetch(`${BACKEND}/api/public/content`);
          if (contentRes.ok) {
            const content = await contentRes.json();
            if (content.testimonials?.length > 0) setTestimonials(content.testimonials);
          }
        } catch {/* silent */}
      } catch (err) {
        console.error('Failed to fetch landing data:', err);
      }
    };
    fetchHomeData();
  }, [BACKEND]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = translations[lang];
  const notification = settings ? settings[`globalNotify${lang.charAt(0).toUpperCase() + lang.slice(1)}`] : null;
  const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
  const heroTitle = landing?.[`heroTitle${langKey}`] || t.hero.title;
  const heroSubtitle = landing?.[`heroSubtitle${langKey}`] || t.hero.subtitle;
  const heroBadge = landing?.[`heroBadge${langKey}`] || t.hero.badge;
  const footerDesc = landing?.[`footerDesc${langKey}`] || t.footer.desc;
  const contactPhone = landing?.contactPhone || settings?.superAdminPhone || null;

  return (
    <div className="min-h-screen selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans bg-white text-left">
      {/* ===== Global Notification ===== */}
      {notification && (
        <div className="bg-blue-600 text-white py-2.5 px-5 text-center text-xs sm:text-sm font-bold tracking-wide relative z-[60]">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 fill-white animate-pulse" />
            {notification}
          </div>
        </div>
      )}

      {/* ===== Navigation ===== */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/60 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <Link href={`/${params.lang}`} className="flex items-center shrink-0">
            <div className="h-16 overflow-hidden flex items-center">
              <img src="/logo.png" alt="Supplio" className="h-full object-contain" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {[
              { name: t.nav.features, href: "#features" },
              { name: t.nav.pricing, href: "#pricing" },
              { name: t.nav.news, href: "#news" },
              { name: t.nav.about, href: `/${params.lang}/about` }
            ].map((item) => (
              <Link key={item.name} href={item.href} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{item.name}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <LangSelect currentLang={lang} />
            <Link href={APP_LOGIN_URL} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              {t.nav.login}
            </Link>
            <button onClick={() => setIsLeadModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              {t.nav.register}
            </button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-40 md:hidden pt-24 px-5 bg-white">
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link href="#features" onClick={() => setIsMenuOpen(false)}>{t.nav.features}</Link>
              <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>{t.nav.pricing}</Link>
              <Link href="#news" onClick={() => setIsMenuOpen(false)}>{t.nav.news}</Link>
              <hr className="border-slate-100" />
              <Link href={APP_LOGIN_URL}>{t.nav.login}</Link>
              <button className="text-blue-600 font-bold text-left" onClick={() => { setIsMenuOpen(false); setIsLeadModalOpen(true); }}>{t.nav.register}</button>
              <div className="pt-4"><LangSelect currentLang={lang} /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Hero Section ===== */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-5 sm:px-6 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-200 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-indigo-200 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 text-xs sm:text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            {heroBadge}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
            {heroTitle}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {heroSubtitle}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setIsLeadModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]">
              {t.hero.cta}
            </button>
            <Link href={`${DEMO_LOGIN_URL}?demo=1&access=view`} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-base hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98] text-center">
              {t.hero.secondary}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="py-12 sm:py-16 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: t.stats.uptime, value: "99.9%", icon: <Zap className="w-4 h-4" /> },
              { label: t.stats.isolation, value: t.stats.isolationValue, icon: <ShieldCheck className="w-4 h-4" /> },
              { label: t.stats.response, value: "< 50ms", icon: <BarChart3 className="w-4 h-4" /> },
              { label: t.stats.audit, value: "100%", icon: <Newspaper className="w-4 h-4" /> }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center sm:items-start space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                  {stat.icon}
                  <span className="text-xs uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="py-24 sm:py-32 px-5 sm:px-6 bg-white text-left">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center md:text-left max-w-3xl mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              {t.features.title}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              {t.features.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: t.features.item1, desc: t.features.item1Desc, icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
              { title: t.features.item2, desc: t.features.item2Desc, icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
              { title: t.features.item3, desc: t.features.item3Desc, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" }
            ].map((feature, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.15 }} className="group space-y-5 p-8 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="py-24 sm:py-32 px-5 sm:px-6 bg-slate-50 text-left">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
              {howItWorksTranslations[lang]?.title ?? howItWorksTranslations.en.title}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              {howItWorksTranslations[lang]?.subtitle ?? howItWorksTranslations.en.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {(howItWorksTranslations[lang]?.steps ?? howItWorksTranslations.en.steps).map((step, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      {testimonials.length > 0 && (
        <section className="py-24 sm:py-32 px-5 sm:px-6 bg-white text-left overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                {testimonialsLabel[lang] ?? testimonialsLabel.en}
              </h2>
            </motion.div>

            {testimonials.length <= 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((tm, i) => {
                  const contentKey = `content${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof tm;
                  const content = (tm[contentKey] as string) || tm.contentEn;
                  return (
                    <motion.div key={tm.id} {...fadeInUp} transition={{ delay: i * 0.1 }} className="flex flex-col gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                      <div className="flex gap-1">
                        {Array.from({ length: tm.rating }).map((_, s) => (
                          <svg key={s} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        ))}
                      </div>
                      <p className="text-slate-700 leading-relaxed italic flex-1">"{content}"</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">{tm.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{tm.name}</p>
                          {(tm.roleTitle || tm.company) && <p className="text-slate-500 text-xs font-medium">{tm.roleTitle}{tm.roleTitle && tm.company ? " · " : ""}{tm.company}</p>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Slider for 4+ testimonials */
              <div className="relative">
                <div className="overflow-hidden">
                  <AnimatePresence mode="wait">
                    {(() => {
                      const perPage = 3;
                      const totalPages = Math.ceil(testimonials.length / perPage);
                      const pageItems = testimonials.slice(testimonialIdx * perPage, testimonialIdx * perPage + perPage);
                      return (
                        <motion.div
                          key={testimonialIdx}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.4 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                          {pageItems.map((tm, i) => {
                            const contentKey = `content${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof tm;
                            const content = (tm[contentKey] as string) || tm.contentEn;
                            return (
                              <div key={tm.id} className="flex flex-col gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                                <div className="flex gap-1">
                                  {Array.from({ length: tm.rating }).map((_, s) => (
                                    <svg key={s} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                  ))}
                                </div>
                                <p className="text-slate-700 leading-relaxed italic flex-1">"{content}"</p>
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">{tm.name.charAt(0)}</div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{tm.name}</p>
                                    {(tm.roleTitle || tm.company) && <p className="text-slate-500 text-xs font-medium">{tm.roleTitle}{tm.roleTitle && tm.company ? " · " : ""}{tm.company}</p>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>

                {/* Slider controls */}
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={() => setTestimonialIdx(i => Math.max(0, i - 1))}
                    disabled={testimonialIdx === 0}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTestimonialIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-blue-600 w-6' : 'bg-slate-300'}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setTestimonialIdx(i => Math.min(Math.ceil(testimonials.length / 3) - 1, i + 1))}
                    disabled={testimonialIdx >= Math.ceil(testimonials.length / 3) - 1}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== CTA Section ===== */}
      <section className="py-24 px-5 sm:px-6 bg-blue-600 text-center">
        {(() => {
          const trialDays = settings?.defaultTrialDays || 14;
          const ctaTitle = lang === 'uz' ? "Bugun boshlang" : lang === 'ru' ? "Начните сегодня" : lang === 'tr' ? "Bugün başlayın" : "Start Today";
          const ctaSubtitle = lang === 'uz' ? `${trialDays} kunlik bepul sinov. Kredit kartasi kerak emas.` : lang === 'ru' ? `${trialDays}-дневный бесплатный пробный период. Без кредитной карты.` : lang === 'tr' ? `${trialDays} günlük ücretsiz deneme. Kredi kartı gerekmez.` : `${trialDays}-day free trial. No credit card required.`;
          return (
            <div className="max-w-3xl mx-auto">
              <motion.h2 {...fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                {ctaTitle}
              </motion.h2>
              <motion.p {...fadeInUp} transition={{ delay: 0.1 }} className="text-blue-100 text-lg mb-10 leading-relaxed">
                {ctaSubtitle}
              </motion.p>
              <motion.button {...fadeInUp} transition={{ delay: 0.2 }} onClick={() => setIsLeadModalOpen(true)} className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-blue-50 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                {t.nav.register}
              </motion.button>
            </div>
          );
        })()}
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="py-24 sm:py-32 px-5 sm:px-6 bg-slate-900 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">{t.pricing.title}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t.pricing.subtitle}</p>
          </motion.div>

          {(() => {
            const plans = (dynamicTariffs.length > 0 ? dynamicTariffs : t.pricing.plans) as unknown as SafePlan[];
            const count = plans.length;
            const gridClass = count <= 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
              : count === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
            const isScrollable = count >= 5;

            const PlanCard = ({ plan, i }: { plan: SafePlan; i: number }) => {
              const name = dynamicTariffs.length > 0 ? String(plan[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || '') : plan.name;
              const features = dynamicTariffs.length > 0 ? (plan[`features${lang.charAt(0).toUpperCase() + lang.slice(1)}`] as string[]) : plan.features;
              const isPopular = plan.isPopular;
              const price = (plan.priceMonthly as string) || plan.price || '0';
              const trialDays = (plan.trialDays as number) || settings?.defaultTrialDays || 14;
              const maxCustomBots = Number(plan.maxCustomBots || 0);
              const displayFeatures = dynamicTariffs.length > 0 ? [...(features || []), getBotFeature(maxCustomBots, lang)] : (features || []);

              return (
                <motion.div {...fadeInUp} transition={{ delay: i * 0.1 }} className={`relative flex flex-col p-7 rounded-3xl border h-full ${isScrollable ? 'min-w-75 w-75' : ''} ${isPopular ? 'bg-white border-blue-600/20 shadow-2xl ring-2 ring-blue-600/30 z-10' : 'bg-slate-800/40 border-slate-700/50 backdrop-blur-sm'}`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                      {lang === 'uz' ? 'Ommabop' : lang === 'ru' ? 'Популярный' : lang === 'tr' ? 'Popüler' : 'Most Popular'}
                    </div>
                  )}

                  <div className="mb-8 text-left">
                    <h3 className={`text-lg font-bold mb-4 ${isPopular ? 'text-blue-600' : 'text-white'}`}>{name}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-4xl font-bold ${isPopular ? 'text-slate-900' : 'text-white'}`}>{price}</span>
                      <span className="text-slate-500 text-sm font-medium">{t.pricing.month}</span>
                    </div>
                    {trialDays > 0 && (
                      <p className={`text-xs font-semibold mt-2 ${isPopular ? 'text-blue-600' : 'text-blue-400'}`}>
                        {lang === 'uz' ? `${trialDays} kun bepul sinov` : lang === 'ru' ? `${trialDays} дней бесплатно` : lang === 'tr' ? `${trialDays} gün ücretsiz` : `${trialDays}-day free trial`}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 mb-10 flex-1 text-left">
                    {displayFeatures.map((f: string, fi: number) => (
                      <div key={fi} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPopular ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className={`text-sm font-medium ${isPopular ? 'text-slate-600' : 'text-slate-300'}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setIsLeadModalOpen(true)} className={`block w-full py-4 rounded-xl font-bold text-sm text-center transition-all active:scale-[0.97] ${isPopular ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700' : 'bg-white text-slate-900 hover:bg-slate-50'}`}>
                    {t.pricing.cta}
                  </button>
                </motion.div>
              );
            };

            if (isScrollable) {
              return (
                <div className="relative">
                  <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none -mx-2 px-2">
                    {plans.map((plan, i) => (
                      <div key={i} className="snap-start shrink-0">
                        <PlanCard plan={plan} i={i} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-sm">
                    <ArrowRight className="w-4 h-4 animate-bounce-x" />
                    <span className="font-medium text-xs">{lang === 'uz' ? 'Yana tariflar bor' : lang === 'ru' ? 'Ещё тарифы' : lang === 'tr' ? 'Daha fazla plan' : 'More plans available'}</span>
                  </div>
                </div>
              );
            }

            return (
              <div className={`grid ${gridClass} gap-6 items-stretch`}>
                {plans.map((plan, i) => (
                  <PlanCard key={i} plan={plan} i={i} />
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ===== News Section ===== */}
      {(settings?.newsEnabled !== false) && (
        <section id="news" className="py-24 sm:py-32 px-5 sm:px-6 bg-white text-left">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-left">
              <div className="space-y-4 max-w-lg">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{t.news.title}</h2>
                <p className="text-lg text-slate-500 leading-relaxed">{t.news.subtitle}</p>
              </div>
              <button className="group px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-3 shrink-0">
                {t.news.more} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicNews.length === 0 ? (
                <p className="col-span-3 text-center text-slate-400 py-12 font-medium">No articles yet.</p>
              ) : null}
              {(dynamicNews as unknown as SafeNews[]).map((news, i: number) => {
                const lkNews = lang === 'oz' ? 'UzCyr' : lang.charAt(0).toUpperCase() + lang.slice(1);
                const title = String(news[`title${lkNews}`] || news['titleEn'] || '');
                const excerpt = String(news[`excerpt${lkNews}`] || news['excerptEn'] || '');
                const slug = String(news[`slug${lkNews}`] || news['slugEn'] || '');
                const date = news.createdAt ? format(new Date(news.createdAt as string), 'dd MMM yyyy') : '';

                return (
                  <motion.div key={news.id || i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                    <Link href={`/${params.lang}/news/${slug}`} className="group flex flex-col h-full bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 text-left">
                      {/* Cover */}
                      <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden shrink-0">
                        {news.image ? (
                          <img
                            src={String(news.image).startsWith('http') ? String(news.image) : `${BACKEND}${news.image}`}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-blue-200" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-6 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" /> {date}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 pt-1 group-hover:gap-2.5 transition-all">
                          {t.news.more} <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== Footer ===== */}
      <footer className="py-16 sm:py-20 px-5 sm:px-6 border-t border-slate-100 bg-slate-50 text-left">
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-16">
          <div className="space-y-5">
            <Link href={`/${params.lang}`} className="flex items-center">
              <div className="h-11 overflow-hidden flex items-center">
                <img src="/logo.png" alt="Supplio" className="h-full object-contain" />
              </div>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
              {footerDesc}
            </p>
            {contactPhone && (
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{contactPhone}</span>
              </div>
            )}
          </div>

          {[
            {
              title: t.footer.product,
              links: [
                { name: t.nav.features, href: "#features" },
                { name: t.nav.pricing, href: "#pricing" },
                { name: t.footer.demo, href: "https://demo.supplio.uz" }
              ]
            },
            {
              title: t.footer.resources,
              links: [
                { name: t.nav.news, href: "#news" },
                { name: t.footer.docs, href: "#" },
              ]
            },
            {
              title: t.footer.company,
              links: [
                { name: t.nav.about, href: `/${params.lang}/about` },
                { name: t.footer.privacy, href: "#" },
                { name: t.footer.terms, href: "#" }
              ]
            }
          ].map((col, i) => (
            <div key={i} className="space-y-4 text-left">
              <p className="text-sm font-semibold text-slate-900">{col.title}</p>
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                {col.links.map((link, j) => (
                  <Link key={j} href={link.href} className="hover:text-blue-600 transition-colors">{link.name}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            {t.footer.copyright}
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Twitter', href: landing?.socialTwitter },
              { label: 'LinkedIn', href: landing?.socialLinkedin },
              { label: 'Telegram', href: landing?.socialTelegram },
            ].filter(s => s.href).map(social => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold">{social.label}</a>
            ))}
          </div>
        </div>
      </footer>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        lang={lang}
        unlockDemoAfterSubmit={true}
        tariffs={dynamicTariffs.length > 0 ? dynamicTariffs : (t.pricing.plans as unknown as SafePlan[])}
      />
    </div>
  );
}
