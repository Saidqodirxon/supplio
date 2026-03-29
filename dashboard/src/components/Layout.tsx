import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  Box,
  TrendingUp,
  ShieldCheck,
  Settings,
  Moon,
  Sun,
  FlaskConical,
  Menu,
  X,
  LogOut,
  Bell,
  Package,
  Receipt,
  Crown,
  Bot,
  UserCheck,
  BarChart3,
  UserCog,
  ChevronRight,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { dashboardTranslations } from "../i18n/translations";
import { LangSelect } from "./LangSelect";
import NotificationDrawer from "./NotificationDrawer";
import { Helmet } from "react-helmet-async";
import api from "../services/api";

interface SubscriptionBadge {
  plan: string;
  status: string;
  daysLeft: number | null;
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, language } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionBadge | null>(null);
  const t = dashboardTranslations[language];

  const isDemo = window.location.hostname.includes("demo");
  const isOwner = user?.roleType === "OWNER" || user?.roleType === "SUPER_ADMIN";

  // Sync theme with DOM
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  // Fetch subscription info for owner/admin
  useEffect(() => {
    if (!isOwner) return;
    api.get('/company/subscription').then(res => {
      setSubscription({ plan: res.data.plan, status: res.data.status, daysLeft: res.data.daysLeft });
    }).catch(() => {});
  }, [isOwner]);

  useEffect(() => {
    api.get('/notifications/unread-count').then((res) => {
      setUnreadCount(Number(res.data?.count || 0));
    }).catch(() => {});
  }, []);

  // Role-based navigation
  const allNavigation = [
    { name: t.sidebar.overview, href: "/dashboard", icon: LayoutDashboard, roles: ["ALL"] },
    { name: t.sidebar.dealers, href: "/dealers", icon: Users, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.approvals, href: "/approvals", icon: UserCheck, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.orders, href: "/orders", icon: ShoppingCart, roles: ["ALL"] },
    { name: t.sidebar.payments, href: "/payments", icon: CreditCard, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.warehouses, href: "/branches", icon: Box, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.products, href: "/products", icon: Package, roles: ["OWNER", "MANAGER", "SUPER_ADMIN", "SELLER", "SALES"] },
    { name: t.sidebar.expenses, href: "/expenses", icon: Receipt, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.staff, href: "/staff", icon: UserCog, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.analytics, href: "/analytics", icon: TrendingUp, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.reports, href: "/reports", icon: BarChart3, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.notifications, href: "/notifications", icon: Bell, roles: ["ALL"] },
    { name: t.sidebar.subscription, href: "/subscription", icon: Crown, roles: ["OWNER", "SUPER_ADMIN"] },
    { name: t.sidebar.telegramBots, href: "/telegram-bots", icon: Bot, roles: ["OWNER", "SUPER_ADMIN"] },
  ];

  const navigation = allNavigation.filter(item =>
    item.roles.includes("ALL") || item.roles.includes(user?.roleType ?? "")
  );

  const currentTitle = (() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return t.sidebar.overview;
    if (path.includes("/dealers")) return t.sidebar.dealers;
    if (path.includes("/orders")) return t.sidebar.orders;
    if (path.includes("/payments")) return t.sidebar.payments;
    if (path.includes("/branches")) return t.sidebar.warehouses;
    if (path.includes("/products")) return t.sidebar.products;
    if (path.includes("/expenses")) return t.sidebar.expenses;
    if (path.includes("/analytics")) return t.sidebar.analytics;
    if (path.includes("/notifications")) return t.sidebar.notifications;
    if (path.includes("/subscription")) return t.sidebar.subscription;
    if (path.includes("/super")) return t.sidebar.superadmin;
    if (path.includes("/settings")) return t.sidebar.settings;
    if (path.includes("/approvals")) return t.sidebar.approvals;
    if (path.includes("/reports")) return t.sidebar.reports;
    if (path.includes("/telegram-bots")) return t.sidebar.telegramBots;
    if (path.includes("/staff")) return t.sidebar.staff;
    return "Dashboard";
  })();

  useEffect(() => {
    document.title = `${currentTitle} — Supplio`;
  }, [currentTitle]);

  const superAdminNav = [
    { name: t.sidebar.superadmin, href: "/super", icon: ShieldCheck },
    { name: t.sidebar.settings, href: "/settings", icon: Settings },
  ];

  // Subscription badge label
  const subLabel = (() => {
    if (!subscription) return null;
    const plan = subscription.plan;
    const days = subscription.daysLeft;
    if (days !== null && days > 0) {
      const daysText = language === 'ru' ? `${days} дн.` : language === 'en' ? `${days}d` : language === 'tr' ? `${days}g` : `${days} kun`;
      return { plan, extra: daysText, isWarning: days < 7 };
    }
    return { plan, extra: subscription.status, isWarning: false };
  })();

  return (
    <div className="h-screen overflow-hidden flex font-outfit transition-colors duration-300 bg-background text-foreground">
      <Helmet>
        <title>{currentTitle} — Supplio</title>
      </Helmet>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 lg:translate-x-0 transition-transform duration-500 ease-in-out lg:static lg:block shrink-0",
          "bg-background border-r border-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {isDemo && (
            <div className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.3em] py-1.5 text-center flex items-center justify-center gap-2 shrink-0">
              <FlaskConical className="w-3 h-3" /> DEMO ENVIRONMENT
            </div>
          )}

          <div className="flex h-20 items-center px-8 shrink-0">
            <Link to="/dashboard" className="flex items-center group">
              <img src="/logo.png" alt="Supplio" className="h-10 object-contain" />
            </Link>
            <button
              className="lg:hidden ml-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
            <p className="px-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 opacity-60">
              {t.sidebar.company}
            </p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    isActive
                      ? "premium-gradient text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5",
                    "flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-95"
                  )}
                >
                  <Icon className={clsx("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />
                  {item.name}
                </Link>
              );
            })}

            {(user?.roleType === "SUPER_ADMIN" || user?.roleType === "OWNER") && (
              <div className="pt-6 space-y-1">
                <p className="px-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 opacity-60">
                  Admin
                </p>
                {superAdminNav.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        isActive
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
                        "flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-95"
                      )}
                    >
                      <Icon className={clsx("h-4 w-4 shrink-0", isActive ? "text-white dark:text-slate-900" : "text-slate-400")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="pt-6 pb-4">
              <div className="p-5 rounded-2xl bg-blue-600/5 dark:bg-blue-500/10 border border-blue-500/10 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5 tracking-tight">
                    {language === 'ru' ? 'Центр поддержки' : language === 'en' ? 'Support center' : language === 'tr' ? 'Destek merkezi' : 'Yordam markazi'}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                    {language === 'ru' ? 'Помощь и документация' : language === 'en' ? 'Help & documentation' : language === 'tr' ? 'Yardım ve belgeler' : 'Yordam va qo\'llanma'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full py-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  {language === 'ru' ? 'Настройки' : language === 'en' ? 'Settings' : language === 'tr' ? 'Ayarlar' : 'Sozlamalar'}
                </button>
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className={clsx(
            "p-4 mx-4 mb-4 rounded-2xl border shrink-0 transition-all",
            isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-950 flex items-center justify-center rounded-full overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-md shrink-0">
                <img src={user?.photoUrl || "/favicon.png"} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none mb-1.5">
                  {user?.fullName || user?.phone}
                </p>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md">
                  {user?.roleType?.replace(/_/g, " ") || "STAFF"}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white premium-gradient rounded-xl transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.sidebar.signOut}
            </button>
          </div>
        </div>
      </div>

      {/* Main viewport — no double scroll */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className={clsx(
          "h-20 backdrop-blur-3xl border-b px-6 lg:px-10 flex items-center justify-between shrink-0 z-30 transition-colors duration-500",
          "bg-background/90 border-border"
        )}>
          {/* Left: Mobile menu + page title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{currentTitle}</h1>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-3">
            {/* Subscription badge — always visible for owners */}
            {isOwner && subLabel && (
              <button
                onClick={() => navigate('/subscription')}
                className={clsx(
                  "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all active:scale-95 group",
                  subLabel.isWarning
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    : "bg-blue-50/80 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                )}
              >
                <Crown className={clsx("w-3.5 h-3.5 shrink-0", subLabel.isWarning ? "text-amber-600" : "text-blue-600 dark:text-blue-400")} />
                <div className="flex flex-col items-start leading-none">
                  <span className={clsx("text-[9px] font-black uppercase tracking-wider", subLabel.isWarning ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400")}>
                    {subLabel.plan}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {subLabel.extra}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            <LangSelect />

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-slate-500 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-95"
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 transition-all relative group active:scale-95"
            >
              <Bell className="w-4.5 h-4.5 group-hover:animate-bounce" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.2rem] h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main content — single scroll area */}
        <main id="main-scroll" className="flex-1 overflow-y-auto w-full scroll-smooth">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 pb-20">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        isDark={isDark}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}
