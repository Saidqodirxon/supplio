import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Users,
  Moon,
  Sun,
  Menu,
  LogOut,
  Bell,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Database,
  Newspaper,
  Layout as LayoutIcon,
  Globe,
  Activity,
  FileCode,
  TrendingUp,
  Send,
  User,
  MessageSquare,
  Bot,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { dashboardTranslations } from "../i18n/translations";
import { LangSelect } from "./LangSelect";
import { Helmet } from "react-helmet-async";
import api from "../services/api";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ tickets: 0, upgrades: 0 });
  const location = useLocation();
  const { user, logout, language } = useAuthStore();
  const { isDark, toggleTheme, isCollapsed, toggleSidebar } = useThemeStore();
  const t = dashboardTranslations[language];

  // Fetch badge counts for sidebar
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [ticketsRes, upgradesRes] = await Promise.all([
          api.get("/support/all"),
          api.get("/super/upgrade-requests"),
        ]);
        const openTickets = Array.isArray(ticketsRes.data)
          ? ticketsRes.data.filter((t: { status: string }) => t.status === "OPEN").length
          : 0;
        const pendingUpgrades = Array.isArray(upgradesRes.data)
          ? upgradesRes.data.filter((r: { status: string }) => r.status === "PENDING").length
          : 0;
        setBadges({ tickets: openTickets, upgrades: pendingUpgrades });
      } catch {
        // silent
      }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Map of routes to titles for the header
  const getTitle = (pathname: string, search: string) => {
    if (pathname === "/profile") {
      return language === "ru" ? "Профиль" : language === "en" ? "Profile" : "Profil";
    }
    const tab = new URLSearchParams(search).get("tab");
    if (!tab || tab === "overview") return t.superadmin.overview;
    if (tab === "distributors") return t.superadmin.distributors;
    if (tab === "news") return t.superadmin.news;
    if (tab === "tariffs") return t.superadmin.tariffs;
    if (tab === "activities") return t.superadmin.recentLogs;
    if (tab === "backups") return t.superadmin.backups;
    if (tab === "settings") return t.superadmin.settings;
    if (tab === "tickets") return language === "ru" ? "Обращения" : "Arizalar";
    if (tab === "upgrades") return language === "ru" ? "Запросы апгрейда" : "Tarif so'rovlari";
    if (tab === "leads") return "Lidlar";
    if (tab === "notify") return language === "ru" ? "Рассылка" : "Xabarnoma";
    if (tab === "bots") {
      return language === "ru"
        ? "Telegram боты"
        : language === "en"
          ? "Telegram Bots"
          : "Telegram botlar";
    }
    if (tab === "editor") return t.superadmin.editor;
    if (tab === "testimonials") return language === "ru" ? "Отзывы клиентов" : language === "en" ? "Testimonials" : "Mijozlar sharhlari";
    if (tab === "team") return language === "ru" ? "Команда" : language === "en" ? "Team" : "Jamoa a'zolari";
    return t.sidebar.overview;
  };

  const currentTitle = getTitle(location.pathname, location.search);

  const navigation = [
    { name: t.superadmin.overview, href: "/?tab=overview", icon: ShieldCheck, badge: 0 },
    { name: t.superadmin.distributors, href: "/?tab=distributors", icon: Users, badge: 0 },
    { name: language === "ru" ? "Запросы апгрейда" : "Tarif so'rovlari", href: "/?tab=upgrades", icon: TrendingUp, badge: badges.upgrades },
    { name: "Lidlar", href: "/?tab=leads", icon: UserCheck, badge: 0 },
    { name: language === "ru" ? "Обращения" : "Arizalar", href: "/?tab=tickets", icon: Bell, badge: badges.tickets },
    { name: language === "ru" ? "Рассылка" : "Xabarnoma", href: "/?tab=notify", icon: Send, badge: 0 },
    {
      name:
        language === "ru"
          ? "Telegram боты"
          : language === "en"
            ? "Telegram Bots"
            : "Telegram botlar",
      href: "/?tab=bots",
      icon: Bot,
      badge: 0,
    },
    { name: t.superadmin.news, href: "/?tab=news", icon: Newspaper, badge: 0 },
    { name: t.superadmin.tariffs, href: "/?tab=tariffs", icon: CreditCard, badge: 0 },
    { name: language === "ru" ? "Отзывы клиентов" : language === "en" ? "Testimonials" : "Mijozlar sharhlari", href: "/?tab=testimonials", icon: MessageSquare, badge: 0 },
    { name: language === "ru" ? "Команда" : language === "en" ? "Team" : "Jamoa a'zolari", href: "/?tab=team", icon: Users, badge: 0 },
    { name: t.superadmin.recentLogs, href: "/?tab=activities", icon: Activity, badge: 0 },
    { name: t.superadmin.backups, href: "/?tab=backups", icon: Database, badge: 0 },
    { name: t.superadmin.settings, href: "/?tab=settings", icon: Globe, badge: 0 },
    { name: t.superadmin.editor, href: "/?tab=editor", icon: FileCode, badge: 0 },
  ];

  useEffect(() => {
    document.title = `${currentTitle} — Supplio Admin`;
  }, [currentTitle]);

  return (
    <div className="min-h-screen bg-background text-foreground font-medium flex overflow-hidden">
      <Helmet>
        <title>{`${currentTitle} - Supplio Admin`}</title>
      </Helmet>

      {/* Sidebar background overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 lg:translate-x-0 transition-all duration-500 ease-in-out lg:static lg:block shrink-0 overflow-hidden",
          "bg-background border-r border-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className={clsx(
            "flex h-20 items-center shrink-0 transition-all",
            isCollapsed ? "px-4 justify-center" : "px-8"
          )}>
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Supplio"
                className={clsx(
                  "object-contain transition-all duration-500",
                  isCollapsed ? "h-6 w-6" : "h-10"
                )}
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar scroll-smooth">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 opacity-60">
                ADMIN PANEL
              </p>
            )}
            {navigation.map((item) => {
              const tabParam = new URLSearchParams(item.href.split('?')[1]).get('tab');
              const currentTab = new URLSearchParams(location.search).get('tab');
              const isActive = tabParam === currentTab || (!currentTab && tabParam === 'overview');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={clsx(
                    isActive
                      ? "premium-gradient text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5",
                    "flex items-center rounded-xl p-3 text-sm font-bold transition-all duration-200 active:scale-95 group relative",
                    isCollapsed ? "justify-center" : "gap-x-3 px-4"
                  )}
                >
                  <Icon
                    className={clsx(
                      "shrink-0 transition-all",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-500"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {item.badge > 0 && (
                    <span className={clsx(
                      "flex items-center justify-center rounded-full text-[10px] font-black min-w-[18px] h-[18px] px-1",
                      isActive ? "bg-white/30 text-white" : "bg-rose-500 text-white",
                      isCollapsed ? "absolute top-1 right-1" : ""
                    )}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info + Logout */}
          <div className="p-3 border-t border-border space-y-1">
            {!isCollapsed && user && (
              <Link to="/profile" className="block px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 mb-1 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">{user.fullName || "Super Admin"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.phone}</p>
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                "w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95",
                isCollapsed ? "justify-center" : "gap-3 px-5"
              )}
            >
              <User className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-extrabold uppercase tracking-widest">{language === "ru" ? "Профиль" : "Profil"}</span>}
            </Link>
            <button
              onClick={logout}
              className={clsx(
                "w-full flex items-center p-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95",
                isCollapsed ? "justify-center" : "gap-3 px-5"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-extrabold uppercase tracking-widest">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <button
              type="button"
              className="lg:hidden p-2.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="hidden lg:flex p-2.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LangSelect />

            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-slate-500 hover:text-blue-500 transition-all active:scale-95"
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-700" />
              )}
            </button>
            
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden">
               <img src="/logo.png" className="w-full h-full object-contain" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/30 dark:bg-slate-900/20">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
