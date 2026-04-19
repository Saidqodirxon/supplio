"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  LifeBuoy,
  X,
  Send,
  Instagram,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import { LangSelect } from "@/components/LangSelect";

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = "http://localhost:5000";
  const value = (rawUrl || fallback).trim().replace(/\/+$/, "");
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

export function Footer({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [landing, setLanding] = useState<any>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const BACKEND = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);

  useEffect(() => {
    fetch(`${BACKEND}/api/public/home`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: any) => {
        if (data.landing) setLanding(data.landing);
      })
      .catch(() => {});
  }, [BACKEND]);

  const footerSocialLinks = [
    { label: "Telegram", href: landing?.socialTelegram },
    { label: "Instagram", href: landing?.socialInstagram },
    { label: "LinkedIn", href: landing?.socialLinkedin },
    { label: "Twitter", href: landing?.socialTwitter },
  ].filter((s) => s.href);

  const supportTelegram = (() => {
    const raw = (landing?.supportTelegramUsername || "").trim();
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const handle = raw.replace(/^@/, "").trim();
    return handle ? `https://t.me/${handle}` : null;
  })();
  const supportTelegramLabel = (() => {
    const raw = (landing?.supportTelegramUsername || "").trim();
    if (!raw) return "@supplio_support";
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      try {
        const parsed = new URL(raw);
        const path = parsed.pathname
          .replace(/\/+$/, "")
          .split("/")
          .filter(Boolean)
          .pop();
        return path ? `@${path}` : raw;
      } catch {
        return raw;
      }
    }
    return raw.startsWith("@") ? raw : `@${raw}`;
  })();

  const contactPhone = landing?.contactPhone?.trim();
  const contactPhoneHref = contactPhone
    ? `tel:${contactPhone.replace(/[^\d+]/g, "")}`
    : null;
  const contactEmail = landing?.contactEmail?.trim();
  const contactEmailHref = contactEmail ? `mailto:${contactEmail}` : null;
  const contactAddress = landing?.contactAddress?.trim();
  const contactAddressUrl = landing?.contactAddressUrl?.trim();

  const footerDescDict: Record<string, string | undefined> = {
    uz: landing?.footerDescUz,
    ru: landing?.footerDescRu,
    en: landing?.footerDescEn,
    tr: landing?.footerDescTr,
  };
  const footerDesc = footerDescDict[lang] || t.footer.desc;

  return (
    <>
      <footer className="py-16 sm:py-20 px-5 sm:px-6 border-t border-slate-100 bg-slate-50 text-left w-full mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-16">
          <div className="space-y-5">
            <Link href={`/${lang}`} className="flex items-center">
              <div className="h-11 overflow-hidden flex items-center">
                <img
                  src="/logo.png"
                  alt="Supplio"
                  className="h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
              {footerDesc}
            </p>
            {contactPhone && (
              <a
                href={contactPhoneHref || "#"}
                className="flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{contactPhone}</span>
              </a>
            )}
            {contactEmail && contactEmailHref && (
              <a
                href={contactEmailHref}
                className="flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>{contactEmail}</span>
              </a>
            )}
            {contactAddress &&
              (contactAddressUrl ? (
                <a
                  href={contactAddressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{contactAddress}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{contactAddress}</span>
                </div>
              ))}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="inline-flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-blue-600" />
              {lang === "uz"
                ? "Yordam markazi"
                : lang === "ru"
                  ? "Центр помощи"
                  : lang === "tr"
                    ? "Yardım Merkezi"
                    : lang === "oz"
                      ? "Ёрдам маркази"
                      : "Help Center"}
            </button>
          </div>

          {[
            {
              title: t.footer.product,
              links: [
                { name: t.nav.features, href: `/${lang}#features` },
                { name: t.nav.pricing, href: `/${lang}#pricing` },
                { name: t.footer.demo, href: "https://demo.supplio.uz" },
              ],
            },
            {
              title: t.footer.resources,
              links: [
                { name: t.nav.news, href: `/${lang}/news` },
                { name: t.footer.docs, href: `/${lang}/docs` },
                { name: t.footer.terms, href: `/${lang}/terms` },
                { name: t.footer.privacy, href: `/${lang}/privacy` },
                { name: t.footer.contract, href: `/${lang}/contract` },
              ],
            },
            {
              title: t.footer.company,
              links: [{ name: t.nav.about, href: `/${lang}/about` }],
            },
          ].map((col, i) => (
            <div key={i} className="space-y-4 text-left">
              <p className="text-sm font-semibold text-slate-900">
                {col.title}
              </p>
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                {col.links.map((link, j) => (
                  <Link
                    key={j}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">{t.footer.copyright}</p>
          <div className="flex gap-6 flex-wrap justify-center sm:justify-end items-center">
            {footerSocialLinks.length > 0 ? (
              footerSocialLinks.map((social) => {
                let Icon = ExternalLink;
                if (social.label === "Telegram") Icon = Send;
                if (social.label === "Instagram") Icon = Instagram;
                if (social.label === "LinkedIn") Icon = Linkedin;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" /> {social.label}
                  </a>
                );
              })
            ) : (
              <>
                <Link
                  href={`/${lang}/terms`}
                  className="text-sm text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold"
                >
                  {t.footer.terms}
                </Link>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-sm text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold"
                >
                  {t.footer.privacy}
                </Link>
                <Link
                  href={`/${lang}/contract`}
                  className="text-sm text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold"
                >
                  {t.footer.contract}
                </Link>
              </>
            )}
            <div className="ml-4 border-l border-slate-200 pl-4">
              <LangSelect currentLang={lang} />
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsHelpModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight inline-flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-blue-600" />
                  {lang === "uz"
                    ? "Yordam markazi"
                    : lang === "ru"
                      ? "Центр помощи"
                      : lang === "tr"
                        ? "Yardım Merkezi"
                        : lang === "oz"
                          ? "Ёрдам маркази"
                          : "Help Center"}
                </h3>
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {contactPhone && (
                  <a
                    href={contactPhoneHref || "#"}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                      <Phone className="w-4 h-4 text-blue-600" />
                      {lang === "ru"
                        ? "Телефон"
                        : lang === "tr"
                          ? "Telefon"
                          : lang === "oz"
                            ? "Телефон"
                            : "Telefon"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {contactPhone}
                    </span>
                  </a>
                )}
                {contactEmail && contactEmailHref && (
                  <a
                    href={contactEmailHref}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                      <Mail className="w-4 h-4 text-blue-600" /> Email
                    </span>
                    <span className="text-xs text-slate-500">
                      {contactEmail}
                    </span>
                  </a>
                )}
                {supportTelegram && (
                  <a
                    href={supportTelegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                      <Send className="w-4 h-4 text-blue-600" />
                      Telegram support
                    </span>
                    <span className="text-xs text-slate-500">
                      {supportTelegramLabel}
                    </span>
                  </a>
                )}
                {contactAddress && (
                  <a
                    href={contactAddressUrl || "#"}
                    target={contactAddressUrl ? "_blank" : undefined}
                    rel={contactAddressUrl ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {lang === "ru"
                        ? "Адрес"
                        : lang === "tr"
                          ? "Adres"
                          : lang === "oz"
                            ? "Манзил"
                            : "Manzil"}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[55%]">
                      {contactAddress}
                    </span>
                  </a>
                )}
                {!contactPhone &&
                  !contactEmail &&
                  !contactAddress &&
                  !supportTelegram && (
                    <p className="text-sm text-slate-500">
                      Ma'lumot topilmadi.
                    </p>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
