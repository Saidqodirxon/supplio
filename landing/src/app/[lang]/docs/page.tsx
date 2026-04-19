"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  ExternalLink,
  Instagram,
  LifeBuoy,
  Linkedin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { translations, slugToLang } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import { LangSelect } from "@/components/LangSelect";
import { Footer } from "@/components/Footer";

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = "http://localhost:5000";
  const value = (rawUrl || fallback).trim().replace(/\/+$/, "");
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

function sanitizeExternalUrl(raw?: string | null) {
  const value = (raw || "").trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:") return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

function normalizeTelegramUrl(raw?: string | null) {
  const value = (raw || "").trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return sanitizeExternalUrl(value);
  }
  const handle = value.replace(/^@/, "").trim();
  return handle ? `https://t.me/${handle}` : null;
}

type ContactCard = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
};

export default function DocumentsPage() {
  const params = useParams();
  const lang: Language = slugToLang(params.lang as string);
  const t = translations[lang];
  const docText = (t as any).docsPage || {};
  const BACKEND = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supportTelegram, setSupportTelegram] = useState<string | null>(null);
  const [supportPhone, setSupportPhone] = useState<string | null>(null);
  const [supportInstagram, setSupportInstagram] = useState<string | null>(null);
  const [supportLinkedin, setSupportLinkedin] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${BACKEND}/api/public/home`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSupportTelegram(
          normalizeTelegramUrl(data?.landing?.supportTelegramUsername)
        );
        setSupportInstagram(
          sanitizeExternalUrl(data?.landing?.socialInstagram)
        );
        setSupportLinkedin(sanitizeExternalUrl(data?.landing?.socialLinkedin));
        setSupportPhone(
          String(
            data?.settings?.superAdminPhone || data?.landing?.contactPhone || ""
          ).trim() || null
        );
      })
      .catch(() => {
        setSupportTelegram(null);
        setSupportPhone(null);
        setSupportInstagram(null);
        setSupportLinkedin(null);
      });
  }, [BACKEND]);

  const labels = {
    phone:
      lang === "uz"
        ? "Telefon"
        : lang === "ru"
          ? "Телефон"
          : lang === "tr"
            ? "Telefon"
            : lang === "oz"
              ? "Телефон"
              : "Phone",
    telegram:
      lang === "uz"
        ? "Telegram"
        : lang === "ru"
          ? "Телеграм"
          : lang === "tr"
            ? "Telegram"
            : lang === "oz"
              ? "Телеграм"
              : "Telegram",
    instagram: "Instagram",
    linkedin: "LinkedIn",
  };

  const contactCards: ContactCard[] = [
    supportPhone
      ? {
          label: labels.phone,
          value: supportPhone,
          href: `tel:${supportPhone.replace(/[^\d+]/g, "")}`,
          icon: Phone,
        }
      : null,
    supportTelegram
      ? {
          label: `${labels.telegram} (${lang === "uz" ? "tezkor" : lang === "ru" ? "быстрый" : lang === "tr" ? "hızlı" : "quick"})`,
          value: supportTelegram
            .replace(/^https?:\/\/t\.me\//, "@")
            .replace(/\/$/, ""),
          href: supportTelegram,
          icon: Send,
        }
      : null,
    supportInstagram
      ? {
          label: labels.instagram,
          value: "Instagram",
          href: supportInstagram,
          icon: Instagram,
        }
      : null,
    supportLinkedin
      ? {
          label: labels.linkedin,
          value: "LinkedIn",
          href: supportLinkedin,
          icon: Linkedin,
        }
      : null,
  ].filter(Boolean) as ContactCard[];

  const contactLabel =
    lang === "uz"
      ? "Bog'lanish"
      : lang === "ru"
        ? "Связаться"
        : lang === "tr"
          ? "İletişim"
          : lang === "oz"
            ? "Боғланиш"
            : "Contact";
  const contactTitle =
    lang === "uz"
      ? "Tez bog'lanish"
      : lang === "ru"
        ? "Быстрая связь"
        : lang === "tr"
          ? "Hızlı iletişim"
          : lang === "oz"
            ? "Тез боғланиш"
            : "Quick contact";
  const contactSubtitle =
    lang === "uz"
      ? "Tezkor aloqa va yordam uchun barcha rasmiy kanallarimiz bitta sahifada."
      : lang === "ru"
        ? "Все наши официальные каналы для быстрой связи и поддержки на одной странице."
        : lang === "tr"
          ? "Hızlı iletişim ve destek için tüm resmi kanallarımız tek bir sayfada."
          : lang === "oz"
            ? "Тезкор алоқа ва ёрдам учун барча расмий каналларимиз битта саҳифада."
            : "All our official channels for quick communication and support in one page.";
  const docCount = docText.items?.length || 0;

  const docBadge =
    lang === "uz"
      ? "Hujjatlar markazi"
      : lang === "ru"
        ? "Центр документов"
        : lang === "tr"
          ? "Belge merkezi"
          : lang === "oz"
            ? "Ҳужжатлар маркази"
            : "Documents hub";

  const pageNote =
    lang === "uz"
      ? "Platformaning barcha imkoniyatlari, narxlar va so'nggi yangiliklar bilan tanishish uchun quyidagi bo'limlarga ulanishingiz mumkin."
      : lang === "ru"
        ? "Чтобы ознакомиться со всеми возможностями платформы, ценами и последними новостями, вы можете перейти в следующие разделы."
        : lang === "tr"
          ? "Platformun tüm özelliklerini, fiyatlarını ve son haberleri incelemek için aşağıdaki bölümlere bağlanabilirsiniz."
          : lang === "oz"
            ? "Платформанинг барча имкониятлари, нархлар ва сўнгги янгиликлар билан танишиш учун қуйидаги бўлимларга уланишингиз мумкин."
            : "You can connect to the following sections to explore all platform features, pricing, and the latest news.";

  return (
    <div className="min-h-screen bg-slate-950 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-white/60 py-3 shadow-sm" : "bg-white/80 backdrop-blur-md py-4 border-b border-white/40"}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <Link href={`/${params.lang}`} className="flex items-center shrink-0">
            <div className="h-12 overflow-hidden flex items-center">
              <img
                src="/logo.png"
                alt="Supplio"
                className="h-full object-contain"
              />
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
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-24 px-5 bg-white">
          <div className="flex flex-col gap-6 text-lg font-medium">
            <Link
              href={`/${params.lang}#features`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.features}
            </Link>
            <Link
              href={`/${params.lang}#pricing`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.pricing}
            </Link>
            <Link
              href={`/${params.lang}/news`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.news}
            </Link>
            <Link
              href={`/${params.lang}/about`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.about}
            </Link>
            <div className="pt-4">
              <LangSelect currentLang={lang} />
            </div>
          </div>
        </div>
      )}

      <section className="pt-36 pb-20 px-5 sm:px-6 text-white relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 w-125 h-125 bg-blue-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end">
              <div className="text-left space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-[0.25em] border border-white/10 backdrop-blur-sm">
                  <Bell className="w-3.5 h-3.5" /> {docBadge}
                </span>
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[0.95]">
                    {docText.title || "Hujjatlar"}
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    {docText.subtitle || ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-slate-100">
                    <ShieldCheck className="w-4 h-4 text-blue-300" />
                    {lang === "uz"
                      ? "Rasmiy hujjatlar"
                      : lang === "ru"
                        ? "Официальные документы"
                        : lang === "tr"
                          ? "Resmi belgeler"
                          : lang === "oz"
                            ? "Расмий ҳужжатлар"
                            : "Official documents"}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-slate-100">
                    <LifeBuoy className="w-4 h-4 text-blue-300" />
                    {docCount}{" "}
                    {lang === "uz"
                      ? "ta hujjat"
                      : lang === "ru"
                        ? "документа"
                        : lang === "tr"
                          ? "belge"
                          : lang === "oz"
                            ? "та ҳужжат"
                            : "documents"}
                  </span>
                </div>
              </div>

              <div className="rounded-4xl bg-white/10 border border-white/10 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-slate-900/30">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200 mb-3">
                  {contactLabel}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {contactSubtitle}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {contactCards.slice(0, 2).map((card) => {
                    const Icon = card.icon;
                    return (
                      <a
                        key={card.href}
                        href={card.href}
                        target={
                          card.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          card.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 p-4 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-blue-200 mb-3" />
                        <div className="text-xs uppercase tracking-widest text-slate-300">
                          {card.label}
                        </div>
                        <div className="mt-1 text-sm font-bold text-white break-all">
                          {card.value}
                        </div>
                      </a>
                    );
                  })}
                </div>
                {contactCards.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-300">
                    {lang === "uz"
                      ? "Ayni vaqtda aloqa ma'lumotlari yangilanmoqda. Iltimos, keyinroq qayta urinib ko'ring."
                      : lang === "ru"
                        ? "Контактная информация обновляется. Пожалуйста, повторите попытку позже."
                        : lang === "tr"
                          ? "Şu anda iletişim bilgileri güncellenmektedir. Lütfen daha sonra tekrar deneyin."
                          : lang === "oz"
                            ? "Айни вақтда алоқа маълумотлари янгиланмоқда. Илтимос, кейинроқ қайта уриниб кўринг."
                            : "Contact information is currently being updated. Please try again later."}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-5">
            <div className="rounded-4xl border border-white/70 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 mb-2">
                    {lang === "uz"
                      ? "Hujjatlar"
                      : lang === "ru"
                        ? "Документы"
                        : lang === "tr"
                          ? "Belgeler"
                          : lang === "oz"
                            ? "Ҳужжатлар"
                            : "Documents"}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {docText.contactTitle || "Yordam kerakmi?"}
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {lang === "uz"
                    ? "Toza va tez"
                    : lang === "ru"
                      ? "Чисто и быстро"
                      : lang === "tr"
                        ? "Temiz ve hızlı"
                        : lang === "oz"
                          ? "Тоза ва тез"
                          : "Clean and fast"}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-2xl">
                {docText.contactDesc || ""}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/${params.lang}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  {t.nav.features} <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${params.lang}/news`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors"
                >
                  {t.nav.news} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(docText.items || []).map((item: any, index: number) => {
                const palette = [
                  "from-blue-600 to-cyan-500",
                  "from-slate-900 to-slate-700",
                  "from-indigo-600 to-violet-500",
                ];
                const gradient = palette[index % palette.length];
                return (
                  <Link
                    key={item.href}
                    href={`/${params.lang}/${item.href}`}
                    className="group rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl bg-linear-to-br ${gradient} text-white flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-black text-slate-900 leading-tight">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600">
                      {lang === "uz"
                        ? "Ochish"
                        : lang === "ru"
                          ? "Открыть"
                          : lang === "tr"
                            ? "Aç"
                            : lang === "oz"
                              ? "Очиш"
                              : "Open"}{" "}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-4xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
                    {contactLabel}
                  </p>
                  <h3 className="text-xl font-black text-slate-900">
                    {contactTitle}
                  </h3>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {docText.contactDesc || ""}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3">
                {contactCards.map((item) => {
                  const Icon = item.icon;
                  const isExternal = item.href.startsWith("http");
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-slate-900 break-all">
                          {item.value}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-4xl bg-slate-900 text-white p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/15 blur-3xl rounded-full" />
              <p className="relative text-xs font-black uppercase tracking-[0.28em] text-blue-200 mb-3">
                {lang === "uz"
                  ? "Tezkor havolalar"
                  : lang === "ru"
                    ? "Быстрые ссылки"
                    : lang === "tr"
                      ? "Hızlı bağlantılar"
                      : lang === "oz"
                        ? "Тезкор ҳаволалар"
                        : "Quick links"}
              </p>
              <p className="relative text-lg font-bold leading-relaxed max-w-md text-slate-100">
                {pageNote}
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                {[t.nav.features, t.nav.pricing, t.nav.news, t.nav.about].map(
                  (label) => (
                    <span
                      key={label}
                      className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-slate-100"
                    >
                      {label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
