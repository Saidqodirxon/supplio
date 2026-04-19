"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { translations, slugToLang } from "@/i18n/translations";
import Link from "next/link";
import { LangSelect } from "@/components/LangSelect";
import LeadModal from "@/components/LeadModal";
import { format } from "date-fns";

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = "http://localhost:5000";
  const value = (rawUrl || fallback).trim().replace(/\/+$/, "");
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

const BACKEND = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);

const NEWS_DETAIL_TEXT = {
  uz: {
    loading: "Maqola yuklanmoqda...",
    notFoundTitle: "Maqola topilmadi",
    notFoundDesc: "Siz qidirgan maqola mavjud emas yoki o'chirilgan.",
    backHome: "Bosh sahifaga qaytish",
    shareInsight: "Ulashish",
    copyLink: "Havolani nusxalash",
    copied: "Havola nusxalandi",
    copyFailed: "Havolani nusxalab bo'lmadi",
    save: "Saqlash",
    saved: "Saqlangan",
    removed: "Saqlangandan olib tashlandi",
    ctaTitle: "Supplio bilan biznesingizni kengaytiring",
    ctaSubtitle: "14 kunlik premium sinovni boshlang. Karta talab qilinmaydi.",
    home: "Bosh sahifa",
    allArticles: "Barcha maqolalar",
  },
  ru: {
    loading: "Загрузка статьи...",
    notFoundTitle: "Статья не найдена",
    notFoundDesc: "Статья не существует или была удалена.",
    backHome: "Назад на главную",
    shareInsight: "Поделиться",
    copyLink: "Скопировать ссылку",
    copied: "Ссылка скопирована",
    copyFailed: "Не удалось скопировать ссылку",
    save: "Сохранить",
    saved: "Сохранено",
    removed: "Удалено из сохраненных",
    ctaTitle: "Масштабируйте бизнес с Supplio",
    ctaSubtitle:
      "Запустите 14-дневный премиум-тест. Банковская карта не нужна.",
    home: "Главная",
    allArticles: "Все статьи",
  },
  en: {
    loading: "Loading article...",
    notFoundTitle: "Article not found",
    notFoundDesc:
      "The article you are looking for doesn't exist or was removed.",
    backHome: "Back to Home",
    shareInsight: "Share this insight",
    copyLink: "Copy Link",
    copied: "Link copied",
    copyFailed: "Failed to copy link",
    save: "Save",
    saved: "Saved",
    removed: "Removed from saved",
    ctaTitle: "Scale Your Business with Supplio",
    ctaSubtitle: "Start your 14-day premium trial. No credit card required.",
    home: "Home",
    allArticles: "All Articles",
  },
  tr: {
    loading: "Makale yükleniyor...",
    notFoundTitle: "Makale bulunamadı",
    notFoundDesc: "Aradığınız makale mevcut değil veya kaldırılmış.",
    backHome: "Ana sayfaya dön",
    shareInsight: "Bu içgörüyü paylaş",
    copyLink: "Bağlantıyı kopyala",
    copied: "Bağlantı kopyalandı",
    copyFailed: "Bağlantı kopyalanamadı",
    save: "Kaydet",
    saved: "Kaydedildi",
    removed: "Kaydedilenlerden kaldırıldı",
    ctaTitle: "Supplio ile işinizi büyütün",
    ctaSubtitle: "14 günlük premium denemeyi başlatın. Kredi kartı gerekmez.",
    home: "Ana sayfa",
    allArticles: "Tüm makaleler",
  },
  oz: {
    loading: "Мақола юкланмоқда...",
    notFoundTitle: "Мақола топилмади",
    notFoundDesc: "Сиз излаган мақола мавжуд эмас ёки ўчирилган.",
    backHome: "Бош саҳифага қайтиш",
    shareInsight: "Улашиш",
    copyLink: "Ҳаволани нусхалаш",
    copied: "Ҳавола нусхаланди",
    copyFailed: "Ҳаволани нусхалаб бўлмади",
    save: "Сақлаш",
    saved: "Сақланди",
    removed: "Сақланганлардан олиб ташланди",
    ctaTitle: "Supplio билан бизнесингизни кенгайтиринг",
    ctaSubtitle: "14 кунлик premium синовни бошланг. Карта талаб қилинмайди.",
    home: "Бош саҳифа",
    allArticles: "Барча мақолалар",
  },
} as const;

interface BackendNewsItem {
  id: string;
  slugUz: string;
  slugRu: string;
  slugEn: string;
  slugTr: string;
  slugUzCyr: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  titleTr: string;
  titleUzCyr: string;
  excerptUz?: string;
  excerptRu?: string;
  excerptEn?: string;
  excerptTr?: string;
  excerptUzCyr?: string;
  contentUz: string;
  contentRu: string;
  contentEn: string;
  contentTr: string;
  contentUzCyr: string;
  image?: string;
  viewCount?: number;
  createdAt: string;
  [key: string]: string | number | undefined;
}

function getLangKey(lang: string): string {
  if (lang === "oz") return "UzCyr";
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

function renderMarkdown(raw: string) {
  const lines = raw.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      nodes.push(
        <ul key={key++} className="space-y-2 my-4 pl-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const inlineFormat = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      nodes.push(
        <h3
          key={key++}
          className="text-xl font-black text-slate-900 mt-8 mb-3 tracking-tight"
        >
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(
        <h2
          key={key++}
          className="text-2xl font-black text-slate-900 mt-10 mb-4 tracking-tight border-b border-slate-100 pb-3"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      nodes.push(
        <h1
          key={key++}
          className="text-3xl font-black text-slate-900 mt-10 mb-4 tracking-tight"
        >
          {trimmed.slice(2)}
        </h1>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      nodes.push(
        <p
          key={key++}
          className="text-slate-600 leading-relaxed font-medium mb-4"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    }
  }
  flushList();
  return nodes;
}

export default function NewsDetailPage() {
  const params = useParams();
  const lang = slugToLang(params.lang as string);
  const slug = params.slug as string;
  const t = translations[lang];
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [article, setArticle] = useState<BackendNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [tariffs, setTariffs] = useState<Record<string, unknown>[]>([]);

  const uiText = NEWS_DETAIL_TEXT[lang] ?? NEWS_DETAIL_TEXT.uz;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(
          `${BACKEND}/api/public/news/${slug}?lang=${lang}`
        );
        if (!res.ok || res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!data) {
          setNotFound(true);
          return;
        }
        setArticle(data);
        // Increment view count via POST (non-GET to avoid bot inflation)
        if (data?.id) {
          fetch(`${BACKEND}/api/public/news/${data.id}/view`, {
            method: "POST",
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((viewData) => {
              if (viewData && typeof viewData.viewCount === "number") {
                setArticle((prev) =>
                  prev ? { ...prev, viewCount: viewData.viewCount } : prev
                );
              }
            })
            .catch(() => {});
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, lang]);

  useEffect(() => {
    fetch(`${BACKEND}/api/public/tariffs`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setTariffs(Array.isArray(data) ? data : []);
      })
      .catch(() => setTariffs([]));
  }, [BACKEND]);

  const lk = getLangKey(lang);
  const title = article
    ? String(article[`title${lk}`] || article.titleEn || "")
    : "";
  const excerpt = article
    ? String(article[`excerpt${lk}`] || article.excerptEn || "")
    : "";
  const content = article
    ? String(article[`content${lk}`] || article.contentEn || "")
    : "";
  const dateStr = article
    ? format(new Date(article.createdAt), "dd.MM.yyyy")
    : "";

  useEffect(() => {
    if (!article) return;
    const savedRaw = localStorage.getItem("supplio:saved-news") || "[]";
    try {
      const saved = JSON.parse(savedRaw) as Array<{
        id?: string;
        slug?: string;
      }>;
      setIsSaved(
        saved.some((item) => item.id === article.id || item.slug === slug)
      );
    } catch {
      setIsSaved(false);
    }
  }, [article, slug]);

  const showFeedback = (message: string) => {
    setFeedbackText(message);
    window.setTimeout(() => setFeedbackText(null), 1800);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showFeedback(uiText.copied);
    } catch {
      showFeedback(uiText.copyFailed);
    }
  };

  const handleToggleSave = () => {
    if (!article) return;

    const savedRaw = localStorage.getItem("supplio:saved-news") || "[]";
    let saved: Array<{
      id: string;
      slug: string;
      title: string;
      lang: string;
      savedAt: string;
    }> = [];

    try {
      saved = JSON.parse(savedRaw);
    } catch {
      saved = [];
    }

    const exists = saved.some(
      (item) => item.id === article.id || item.slug === slug
    );

    if (exists) {
      const next = saved.filter(
        (item) => item.id !== article.id && item.slug !== slug
      );
      localStorage.setItem("supplio:saved-news", JSON.stringify(next));
      setIsSaved(false);
      showFeedback(uiText.removed);
      return;
    }

    const next = [
      ...saved,
      {
        id: article.id,
        slug,
        title,
        lang,
        savedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem("supplio:saved-news", JSON.stringify(next));
    setIsSaved(true);
    showFeedback(uiText.saved);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-bold uppercase tracking-widest">
            {uiText.loading}
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-outfit gap-8">
        <div className="text-center space-y-8 p-12 rounded-[3rem] border border-slate-100 max-w-sm bg-white shadow-xl">
          <Link href={`/${params.lang}`} className="block mb-8">
            <div className="h-10 overflow-hidden flex items-center justify-center mx-auto">
              <img
                src="/logo.png"
                alt="Supplio"
                className="h-full object-contain"
              />
            </div>
          </Link>
          <div className="w-24 h-24 rounded-[2rem] bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xl">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            {uiText.notFoundTitle}
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            {uiText.notFoundDesc}
          </p>
          <Link
            href={`/${params.lang}`}
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 inline-block hover:bg-blue-700 transition-all"
          >
            {uiText.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-outfit selection:bg-blue-100 selection:text-blue-900 text-left overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${params.lang}`} className="flex items-center">
            <div className="h-9 overflow-hidden flex items-center">
              <img
                src="/logo.png"
                alt="Supplio"
                className="h-full object-contain"
              />
            </div>
          </Link>
          <LangSelect currentLang={lang} />
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-48 pb-24 px-6 relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto text-left space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href={`/${params.lang}/news`}
              className="inline-flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-colors font-black text-[10px] uppercase tracking-[0.3em] group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
              {t.nav.news}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <Calendar className="w-4 h-4" /> {dateStr}
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Eye className="w-4 h-4" /> {article.viewCount ?? 0}
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">
              {title}
            </h1>
            {excerpt && (
              <p className="text-2xl md:text-3xl text-slate-500 font-semibold leading-relaxed opacity-80">
                {excerpt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-56 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Cover image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full h-[400px] md:h-[600px] rounded-[4rem] overflow-hidden mb-24 shadow-4xl relative border border-white bg-slate-900 group"
          >
            {article.image ? (
              <img
                src={
                  article.image.startsWith("http")
                    ? article.image
                    : `${BACKEND}${article.image}`
                }
                alt={title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/20">
                    <div className="text-9xl font-black tracking-tighter">
                      {title.charAt(0)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-24 font-outfit">
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-left text-base leading-relaxed"
            >
              {renderMarkdown(content)}
            </motion.article>

            <aside className="space-y-16">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {uiText.shareInsight}
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-between w-full p-6 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all font-black text-slate-700 text-[10px] uppercase tracking-widest group"
                  >
                    <span className="flex items-center gap-4">
                      <Share2 className="w-5 h-5" /> {uiText.copyLink}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={handleToggleSave}
                    className="flex items-center justify-between w-full p-6 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all font-black text-slate-700 text-[10px] uppercase tracking-widest group"
                  >
                    <span className="flex items-center gap-4">
                      {isSaved ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}{" "}
                      {isSaved ? uiText.saved : uiText.save}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                {feedbackText && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    {feedbackText}
                  </p>
                )}
              </div>

              <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl shadow-slate-900/40 space-y-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
                <p className="text-3xl font-black leading-tight relative z-10 tracking-tighter">
                  {uiText.ctaTitle}
                </p>
                <p className="text-sm font-bold text-slate-400 relative z-10 leading-relaxed">
                  {uiText.ctaSubtitle}
                </p>
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="block w-full py-6 bg-white text-slate-900 rounded-[2rem] text-center font-black uppercase tracking-widest text-[11px] shadow-2xl relative z-10 active:scale-95 transition-all hover:translate-y-[-2px]"
                >
                  {t.common.leadForm.submit}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-20 px-5 sm:px-6 border-t border-slate-100 bg-slate-50 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href={`/${params.lang}`}>
              <div className="h-10 overflow-hidden flex items-center">
                <img
                  src="/logo.png"
                  alt="Supplio"
                  className="h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 Supplio
            </p>
          </div>
          <div className="flex gap-12 font-black items-center text-slate-400 text-[10px] uppercase tracking-[0.2em]">
            <Link
              href={`/${params.lang}`}
              className="hover:text-blue-600 transition-colors"
            >
              {uiText.home}
            </Link>
            <Link
              href={`/${params.lang}/news`}
              className="hover:text-blue-600 transition-colors"
            >
              {uiText.allArticles}
            </Link>
            <Link
              href={`/${params.lang}/docs`}
              className="hover:text-blue-600 transition-colors"
            >
              {t.footer.docs}
            </Link>
          </div>
        </div>
      </footer>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        lang={lang}
        unlockDemoAfterSubmit={true}
        tariffs={tariffs}
      />
    </div>
  );
}
