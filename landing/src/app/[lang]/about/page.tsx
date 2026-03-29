"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShieldCheck, Zap, Users, BarChart3, Globe, Heart,
  ArrowRight, Menu, X, Check, Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { translations, slugToLang } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import Link from "next/link";
import { LangSelect } from "@/components/LangSelect";
import LeadModal from "@/components/LeadModal";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const TEAM = [
  { name: "Azizbek Yusupov", role: "CEO & Co-founder", avatar: "AY", color: "bg-blue-600" },
  { name: "Dilnoza Mirzayeva", role: "CTO & Co-founder", avatar: "DM", color: "bg-indigo-600" },
  { name: "Rustam Karimov", role: "Head of Product", avatar: "RK", color: "bg-violet-600" },
  { name: "Shahlo Toshmatova", role: "Lead Engineer", avatar: "ST", color: "bg-emerald-600" },
  { name: "Bobur Nazarov", role: "Head of Sales", avatar: "BN", color: "bg-amber-600" },
  { name: "Kamola Ergasheva", role: "UX Designer", avatar: "KE", color: "bg-rose-600" },
];

const VALUE_ICONS = [Zap, BarChart3, Users, ShieldCheck];

export default function AboutPage() {
  const params = useParams();
  const lang: Language = slugToLang(params.lang as string);
  const t = translations[lang];
  const a = t.about;
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-left overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* ===== Nav ===== */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/60 py-3 shadow-sm" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <Link href={`/${params.lang}`} className="flex items-center shrink-0">
            <div className="h-14 overflow-hidden flex items-center">
              <img src="/logo.png" alt="Supplio" className="h-full object-contain" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {[
              { name: t.nav.features, href: `/${params.lang}#features` },
              { name: t.nav.pricing, href: `/${params.lang}#pricing` },
              { name: t.nav.news, href: `/${params.lang}#news` },
              { name: t.nav.about, href: `/${params.lang}/about` },
            ].map((item) => (
              <Link key={item.name} href={item.href} className={`text-sm font-medium transition-colors ${item.href.includes("/about") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>{item.name}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LangSelect currentLang={lang} />
            <Link href="https://app.supplio.uz/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">{t.nav.login}</Link>
            <button onClick={() => setIsLeadModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.97] shadow-lg shadow-blue-600/20">
              {t.nav.register}
            </button>
          </div>

          <button className="md:hidden p-2.5 rounded-xl border border-slate-200" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-24 px-5 bg-white">
          <div className="flex flex-col gap-6 text-lg font-medium">
            <Link href={`/${params.lang}#features`} onClick={() => setIsMenuOpen(false)}>{t.nav.features}</Link>
            <Link href={`/${params.lang}#pricing`} onClick={() => setIsMenuOpen(false)}>{t.nav.pricing}</Link>
            <Link href={`/${params.lang}#news`} onClick={() => setIsMenuOpen(false)}>{t.nav.news}</Link>
            <hr className="border-slate-100" />
            <Link href="https://app.supplio.uz/login">{t.nav.login}</Link>
            <button className="text-blue-600 font-bold text-left" onClick={() => { setIsMenuOpen(false); setIsLeadModalOpen(true); }}>{t.nav.register}</button>
            <div className="pt-4"><LangSelect currentLang={lang} /></div>
          </div>
        </div>
      )}

      {/* ===== Hero ===== */}
      <section className="pt-40 pb-24 px-5 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-600/20">
              <Heart className="w-3.5 h-3.5" /> {t.nav.about}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
              {a.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {a.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="py-16 px-5 sm:px-6 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.p {...fadeInUp} className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-10">{a.statsLabel}</motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {a.stats.map((s, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.08 }} className="text-center space-y-2">
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                <p className="text-sm font-semibold text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Mission ===== */}
      <section className="py-24 sm:py-32 px-5 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp} className="space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">{a.missionTitle}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {a.missionTitle}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">{a.missionBody}</p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-1 h-16 bg-blue-600 rounded-full" />
              <p className="text-slate-500 text-sm italic leading-relaxed max-w-sm">
                "Enterprise tools for every distributor — regardless of size."
              </p>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-6">
            {[
              { icon: Globe, label: "Multi-Region", color: "text-blue-600 bg-blue-50" },
              { icon: ShieldCheck, label: "SOC2 Ready", color: "text-emerald-600 bg-emerald-50" },
              { icon: Zap, label: "Real-Time", color: "text-amber-600 bg-amber-50" },
              { icon: BarChart3, label: "Analytics", color: "text-violet-600 bg-violet-50" },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-900 text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== Values ===== */}
      <section className="py-24 sm:py-32 px-5 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">{a.valuesTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {a.values.map((v, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="group p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all bg-white">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 leading-tight">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Team ===== */}
      <section className="py-24 sm:py-32 px-5 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{a.teamTitle}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">{a.teamSubtitle}</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.08 }} className="text-center space-y-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl ${member.color} text-white flex items-center justify-center text-lg font-black mx-auto shadow-xl`}>
                  {member.avatar}
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">{member.name}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-tight">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 sm:py-32 px-5 sm:px-6 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{a.ctaTitle}</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setIsLeadModalOpen(true)} className="group px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.97] shadow-xl flex items-center justify-center gap-3">
                {a.ctaBtn} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link href={`/${params.lang}`} className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                {t.nav.features}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-12 px-5 sm:px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href={`/${params.lang}`} className="flex items-center">
            <div className="h-10 overflow-hidden flex items-center">
              <img src="/logo.png" alt="Supplio" className="h-full object-contain" />
            </div>
          </Link>
          <p className="text-slate-400 text-sm">{t.footer.copyright}</p>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All systems operational</span>
          </div>
        </div>
      </footer>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        lang={lang}
        unlockDemoAfterSubmit={true}
        tariffs={[]}
      />
    </div>
  );
}
