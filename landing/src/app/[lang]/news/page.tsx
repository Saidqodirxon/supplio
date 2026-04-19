"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translations, slugToLang } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import { LangSelect } from "@/components/LangSelect";
import LeadModal from "@/components/LeadModal";
import { Footer } from "@/components/Footer";

const APP_LOGIN_URL = `${(process.env.NEXT_PUBLIC_APP_URL || "https://app.supplio.uz").replace(/\/+$/, "")}/login`;

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = "http://localhost:5000";
  const value = (rawUrl || fallback).trim().replace(/\/+$/, "");
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

type NewsItem = {
  id: string;
  image?: string;
  createdAt: string;
  [key: string]: string | number | undefined;
};

const PAGE_TEXTS: Record<
  string,
  {
    title: string;
    subtitle: string;
    socialHint: string;
    followLabel: string;
    newsTitle: string;
    newsSubtitle: string;
    emptyNews: string;
    telegram: { title: string; desc: string; btn: string };
  }
> = {
  uz: {
    title: "Yangiliklar",
    subtitle:
      "Supplio haqidagi so'nggi yangiliklar, e'lonlar va mahsulot yangilanishlari shu sahifada jamlanadi.",
    socialHint:
      "Yanada yangi o'zgarishlarni tezda xabar olishni istasangiz, ijtimoiy tarmoqlarda kuzating.",
    followLabel: "Kuzatish",
    newsTitle: "So'nggi postlar",
    newsSubtitle: "Yangiliklar va e'lonlarni shu yerdan o'qing.",
    emptyNews: "Hozircha yangiliklar yo'q.",
    telegram: {
      title: "Telegram kanal",
      desc: "Eng tezkor yangiliklar, yangi funksiyalar va maxsus takliflar birinchi bo'lib Telegram kanalimizda e'lon qilinadi.",
      btn: "Kanalga o'tish",
    },
  },
  ru: {
    title: "Новости",
    subtitle:
      "Свежие новости, анонсы и обновления Supplio собраны на этой странице.",
    socialHint:
      "Чтобы быстрее узнавать о новых изменениях, подписывайтесь на нас в соцсетях.",
    followLabel: "Следить",
    newsTitle: "Свежие посты",
    newsSubtitle: "Читайте новости и объявления здесь.",
    emptyNews: "Пока новостей нет.",
    telegram: {
      title: "Telegram-канал",
      desc: "Самые свежие новости, новые функции и специальные предложения первыми публикуются в нашем Telegram-канале.",
      btn: "Перейти в канал",
    },
  },
  en: {
    title: "News",
    subtitle:
      "Supplio news, announcements and product updates are collected on this page.",
    socialHint: "If you want to get updates faster, follow us on social media.",
    followLabel: "Follow",
    newsTitle: "Latest posts",
    newsSubtitle: "Read the latest news and announcements here.",
    emptyNews: "No news available yet.",
    telegram: {
      title: "Telegram Channel",
      desc: "The fastest news, new features and special offers are announced first in our Telegram channel.",
      btn: "Open channel",
    },
  },
  tr: {
    title: "Haberler",
    subtitle:
      "Supplio haberleri, duyurulari ve urun guncellemeleri bu sayfada toplanir.",
    socialHint:
      "Yeni degisikliklerden daha hizli haberdar olmak icin bizi sosyal medyada takip edin.",
    followLabel: "Takip et",
    newsTitle: "Son paylasimlar",
    newsSubtitle: "En son haberleri ve duyurulari buradan okuyun.",
    emptyNews: "Henüz haber yok.",
    telegram: {
      title: "Telegram Kanalı",
      desc: "En güncel haberler, yeni özellikler ve özel teklifler ilk olarak Telegram kanalımızda duyurulur.",
      btn: "Kanala git",
    },
  },
  oz: {
    title: "Янгиликлар",
    subtitle:
      "Supplio ҳақидаги сўнгги янгиликлар, эълонлар ва маҳсулот янгиланишлари шу саҳифада жамланади.",
    socialHint:
      "Янги ўзгаришлардан тезроқ хабардор бўлишни истасангиз, бизни ижтимоий тармоқларда кузатинг.",
    followLabel: "Кузатиш",
    newsTitle: "Сўнгги постлар",
    newsSubtitle: "Янгиликлар ва эълонларни шу ердан ўқинг.",
    emptyNews: "Ҳозирча янгиликлар йўқ.",
    telegram: {
      title: "Telegram канал",
      desc: "Энг тезкор янгиликлар, янги функциялар ва махсус таклифлар биринчи бўлиб Telegram каналида эълон қилинади.",
      btn: "Каналга ўтиш",
    },
  },
};

export default function NewsPage() {
  const params = useParams();
  const lang: Language = slugToLang(params.lang as string);
  const t = translations[lang];
  const pt = PAGE_TEXTS[lang] ?? PAGE_TEXTS.uz;

  const BACKEND = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [tariffs, setTariffs] = useState<Record<string, unknown>[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [socialTelegram, setSocialTelegram] = useState(
    "https://t.me/supplioapp"
  );
  const [socialInstagram, setSocialInstagram] = useState(
    "https://www.instagram.com/supplio__app/"
  );
  const [socialLinkedin, setSocialLinkedin] = useState(
    "https://www.linkedin.com/company/supplioapp"
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${BACKEND}/api/public/home`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: any) => {
        setTariffs(Array.isArray(data.tariffs) ? data.tariffs : []);
        if (data.landing?.socialTelegram)
          setSocialTelegram(data.landing.socialTelegram);
        if (data.landing?.socialInstagram)
          setSocialInstagram(data.landing.socialInstagram);
        if (data.landing?.socialLinkedin)
          setSocialLinkedin(data.landing.socialLinkedin);
      })
      .catch(() => setTariffs([]));

    fetch(`${BACKEND}/api/public/news?lang=${lang}&limit=20`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setNewsItems(Array.isArray(data) ? data : []))
      .catch(() => setNewsItems([]));
  }, [BACKEND, lang]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/60 py-3 shadow-sm" : "bg-white/90 backdrop-blur-md py-4 border-b border-slate-100"}`}
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
                className={`text-sm font-medium transition-colors ${item.href.includes("/news") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LangSelect currentLang={lang} />
            <Link
              href={APP_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              {t.nav.login}
            </Link>
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.97] shadow-lg shadow-blue-600/20"
            >
              {t.nav.register}
            </button>
          </div>

          <button
            className="md:hidden p-2.5 rounded-xl border border-slate-200"
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

      <AnimatePresence>
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
                className="text-blue-600"
              >
                {t.nav.news}
              </Link>
              <Link
                href={`/${params.lang}/about`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <hr className="border-slate-100" />
              <Link
                href={APP_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.nav.login}
              </Link>
              <button
                className="text-blue-600 font-bold text-left"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLeadModalOpen(true);
                }}
              >
                {t.nav.register}
              </button>
              <div className="pt-4">
                <LangSelect currentLang={lang} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <section className="pt-36 pb-20 px-5 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-10 w-48 h-48 bg-pink-600/5 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-600/20">
              <Bell className="w-3.5 h-3.5" /> {pt.followLabel}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
              {pt.title}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              {pt.subtitle}
            </p>
            {/* <p className="text-blue-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mt-4">
              {pt.socialHint}
            </p> */}
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                {pt.followLabel}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                {pt.newsTitle}
              </h2>
              <p className="text-slate-500 max-w-2xl">{pt.newsSubtitle}</p>
            </div>
            <Link
              href={`/${params.lang}#features`}
              className="hidden md:inline-flex px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest"
            >
              {t.nav.features}
            </Link>
          </div>

          {newsItems.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-10 text-center text-slate-500 font-semibold">
              {pt.emptyNews}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {newsItems.map((news, i) => {
                const lk =
                  lang === "oz"
                    ? "UzCyr"
                    : lang.charAt(0).toUpperCase() + lang.slice(1);
                const title = String(news[`title${lk}`] || news.titleEn || "");
                const excerpt = String(
                  news[`excerpt${lk}`] || news.excerptEn || ""
                );
                const slug = String(news[`slug${lk}`] || news.slugEn || "");
                const date = format(new Date(news.createdAt), "dd.MM.yyyy");
                return (
                  <motion.div
                    key={news.id || slug || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                  >
                    <Link
                      href={`/${params.lang}/news/${slug}`}
                      className="group block h-full rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="h-56 bg-slate-900 relative overflow-hidden">
                        {news.image ? (
                          <img
                            src={
                              news.image.startsWith("http")
                                ? news.image
                                : `${BACKEND}${news.image}`
                            }
                            alt={title}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
                        <div className="absolute left-6 top-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                          {date}
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                          {excerpt}
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm font-black text-blue-600">
                          {t.news.more}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <Footer lang={lang} />

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        lang={lang}
        unlockDemoAfterSubmit={true}
        tariffs={tariffs.length > 0 ? tariffs : []}
      />
    </div>
  );
}
