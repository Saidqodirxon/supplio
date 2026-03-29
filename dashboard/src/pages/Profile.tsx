"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import {
  Building2,
  Percent,
  Eye,
  MessageCircle,
  Instagram,
  Globe,
} from "lucide-react";
import api from "../services/api";

interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  cashbackPercent: number;
  siteActive: boolean;
  isDemo: boolean;
}

interface LandingSettings {
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  socialTelegram?: string;
  socialInstagram?: string;
  contactAddressUrl?: string;
}

export default function Profile() {
  const { user, language } = useAuthStore();
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [landing, setLanding] = useState<LandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwner = user?.roleType === "OWNER";
  const isSuperAdmin = user?.roleType === "SUPER_ADMIN";
  const isOwnerOrAdmin = isOwner || isSuperAdmin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company info
        const companyRes = await api.get("/company/info");
        setCompany(companyRes.data);

        // Fetch landing settings for super admin
        if (isSuperAdmin) {
          try {
            const landingRes = await api.get("/landing/info");
            setLanding(landingRes.data);
          } catch {
            // Silent fail for landing data
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {language === "uz"
              ? "Yuklanmoqda..."
              : language === "ru"
                ? "Загрузка..."
                : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Profile (Only for Owner & Super Admin) */}
      {isOwnerOrAdmin && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {language === "uz"
                ? "Kompaniya profi"
                : language === "ru"
                  ? "Профиль компании"
                  : "Company Profile"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Company Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                {language === "uz"
                  ? "Kompaniya nomi"
                  : language === "ru"
                    ? "Название компании"
                    : "Company Name"}
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {company?.name || "—"}
                </p>
              </div>
            </div>

            {/* Cashback */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <Percent className="w-4 h-4" />
                {language === "uz"
                  ? "Cashback"
                  : language === "ru"
                    ? "Кешбэк"
                    : "Cashback"}
              </label>
              <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {company?.cashbackPercent || 0}%
                </p>
              </div>
            </div>

            {/* Site Status */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {language === "uz"
                  ? "Sayt holati"
                  : language === "ru"
                    ? "Статус сайта"
                    : "System View"}
              </label>
              <div
                className={`px-4 py-3 rounded-xl border ${
                  company?.siteActive
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/30"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/30"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    company?.siteActive
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {company?.siteActive
                    ? language === "uz"
                      ? "Aktiv"
                      : language === "ru"
                        ? "Активно"
                        : "Active"
                    : language === "uz"
                      ? "Faol emas"
                      : language === "ru"
                        ? "Неактивно"
                        : "Inactive"}
                </p>
              </div>
            </div>

            {/* Demo Status */}
            {company?.isDemo && (
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  {language === "uz"
                    ? "Rejim"
                    : language === "ru"
                      ? "Режим"
                      : "Mode"}
                </label>
                <div className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                    {language === "uz"
                      ? "Demo"
                      : language === "ru"
                        ? "Демо"
                        : "Demo"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Super Admin Settings - Landing Configuration */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {language === "uz"
                ? "Sayt sozlamalari"
                : language === "ru"
                  ? "Параметры сайта"
                  : "Website Settings"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Telegram */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Telegram
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                  {landing?.socialTelegram || "—"}
                </p>
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                  {landing?.socialInstagram || "—"}
                </p>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                {language === "uz"
                  ? "Telefon"
                  : language === "ru"
                    ? "Телефон"
                    : "Phone"}
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                  {landing?.contactPhone || "—"}
                </p>
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                {language === "uz"
                  ? "Email"
                  : language === "ru"
                    ? "Эл. почта"
                    : "Email"}
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                  {landing?.contactEmail || "—"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                {language === "uz"
                  ? "Manzil"
                  : language === "ru"
                    ? "Адрес"
                    : "Address"}
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {landing?.contactAddress || "—"}
                </p>
              </div>
            </div>

            {/* Address URL / Domain */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                {language === "uz"
                  ? "Domen joyalashuvi"
                  : language === "ru"
                    ? "Домен"
                    : "Domain"}
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                  {landing?.contactAddressUrl || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Account Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {language === "uz"
            ? "Hisob ma'lumotlari"
            : language === "ru"
              ? "Учетные данные"
              : "Account Details"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
              {language === "uz" ? "Ism" : language === "ru" ? "Имя" : "Name"}
            </label>
            <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {user?.fullName || "—"}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
              {language === "uz"
                ? "Telefon"
                : language === "ru"
                  ? "Телефон"
                  : "Phone"}
            </label>
            <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {user?.phone || "—"}
              </p>
            </div>
          </div>

          {/* System View Status (show for all) */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {language === "uz"
                ? "Sayt kurinishi"
                : language === "ru"
                  ? "Системный вид"
                  : "System View"}
            </label>
            <div
              className={`px-4 py-3 rounded-xl border ${
                company?.siteActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/30"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/30"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  company?.siteActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {company?.siteActive
                  ? language === "uz"
                    ? "Aktiv"
                    : language === "ru"
                      ? "Активно"
                      : "Active"
                  : language === "uz"
                    ? "Faol emas"
                    : language === "ru"
                      ? "Неактивно"
                      : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
