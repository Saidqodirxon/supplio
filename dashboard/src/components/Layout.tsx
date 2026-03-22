import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { dashboardTranslations } from "../i18n/translations";
import { LangSelect } from "./LangSelect";
import NotificationDrawer from "./NotificationDrawer";
import { Helmet } from "react-helmet-async";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, language } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const t = dashboardTranslations[language];

  const isDemo = window.location.hostname.includes("demo");

  // Sync theme with DOM to prevent out-of-sync visibility issues
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

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
    { name: t.sidebar.analytics, href: "/analytics", icon: TrendingUp, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.reports, href: "/reports", icon: BarChart3, roles: ["OWNER", "MANAGER", "SUPER_ADMIN"] },
    { name: t.sidebar.notifications, href: "/notifications", icon: Bell, roles: ["ALL"] },
    { name: t.sidebar.subscription, href: "/subscription", icon: Crown, roles: ["OWNER", "SUPER_ADMIN"] },
    { name: t.sidebar.telegramBots, href: "/telegram-bots", icon: Bot, roles: ["OWNER", "SUPER_ADMIN"] },
  ];

  const navigation = allNavigation.filter(item =>
    item.roles.includes("ALL") || item.roles.includes(user?.roleType ?? "")
  );

  // Dynamic page title that reacts to language changes
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
    return "Dashboard";
  })();

  // Fallback title update to ensure tab changes immediately
  useEffect(() => {
    document.title = `${currentTitle} — Supplio`;
  }, [currentTitle]);

  // SuperAdmin specific tools
  const superAdminNav = [
    { name: t.sidebar.superadmin, href: "/super", icon: ShieldCheck },
    { name: t.sidebar.settings, href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex font-outfit transition-colors duration-300 bg-background text-foreground">
      <Helmet>
        <title>{currentTitle} — Supplio</title>
      </Helmet>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 lg:translate-x-0 transition-transform duration-500 ease-in-out lg:static lg:block",
          "bg-background border-r border-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden relative">
          {isDemo && (
            <div className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.3em] py-1.5 text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              <FlaskConical className="w-3 h-3" /> DEMO ENVIRONMENT
            </div>
          )}

          <div className="flex h-24 items-center px-10 shrink-0 mt-4">
            <Link to="/dashboard" className="flex items-center gap-4 group">
              <img src="/logo.png" alt="" />
            </Link>
            <button
              className="lg:hidden ml-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto no-scrollbar">
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 opacity-60">
              {t.sidebar.company}
            </p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={clsx(
                    isActive
                      ? "premium-gradient text-white shadow-xl shadow-blue-600/20 scale-[1.02]"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-500/5",
                    "group flex items-center gap-x-4 rounded-2xl px-5 py-3.5 text-sm font-black transition-all duration-300 active:scale-95"
                  )}
                >
                  <Icon
                    className={clsx(
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-500",
                      "h-4.5 w-4.5 shrink-0 transition-colors"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}

            {(user?.roleType === "SUPER_ADMIN" ||
              user?.roleType === "OWNER") && (
              <div className="pt-10 space-y-2">
                <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 opacity-60">
                  {t.sidebar.superadmin}
                </p>
                {superAdminNav.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href.includes("?") &&
                      location.pathname + location.search === item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={clsx(
                        isActive
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 scale-[1.02]"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
                        "group flex items-center gap-x-4 rounded-2xl px-5 py-3.5 text-sm font-black transition-all duration-300 active:scale-95"
                      )}
                    >
                      <Icon
                        className={clsx(
                          isActive
                            ? "text-white dark:text-slate-900"
                            : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white",
                          "h-4.5 w-4.5 shrink-0 transition-colors"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-20 pt-10 border-t border-slate-100 dark:border-white/5">
              <div className="p-6 rounded-[2rem] bg-indigo-600/5 dark:bg-indigo-500/10 border border-indigo-500/10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                    Support center
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    System help & documentation
                  </p>
                </div>
                <button className="w-full py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                  Contact admin
                </button>
              </div>
            </div>
          </nav>

          {/* User Profile Hook */}
          <div
            className={clsx(
              "p-6 m-8 rounded-[2.5rem] border shrink-0 transition-all",
              isDark
                ? "bg-white/5 border-white/5"
                : "bg-slate-50 border-slate-100"
            )}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white dark:bg-slate-950 profile-img flex items-center justify-center rounded-full overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-xl shrink-0">
                <img
                  src={user?.photoUrl || "/favicon.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none mb-2">
                  {user?.fullName || user?.phone}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-lg">
                    {user?.roleType?.replace(/_/g, " ") || "STAFF"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white premium-gradient rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <LogOut className="h-4 w-4" />
              {t.sidebar.signOut}
            </button>
          </div>
        </div>
      </div>

      {/* Main viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header
          className={clsx(
            "h-24 backdrop-blur-3xl border-b px-12 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors duration-500",
            "bg-background/80 border-border"
          )}
        >
          <div className="flex items-center gap-4 lg:hidden">
            <button
              type="button"
              className="p-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="overflow-hidden flex items-center">
              <img
                src="/logo.png"
                alt="Supplio"
                className="h-full object-contain"
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <LangSelect />

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

            <button
              onClick={toggleTheme}
              className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-slate-500 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-95 shadow-sm"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 transition-all relative group active:scale-95 shadow-sm"
            >
              <Bell className="w-5 h-5 group-hover:animate-bounce" />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white dark:border-slate-950 shadow-lg shadow-blue-500/20"></span>
            </button>

            <div className="hidden xl:flex flex-col items-end text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none opacity-50">
                {t.sidebar.company}
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                {user?.fullName || user?.phone || "Supplio"}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main id="main-scroll" className="main-scroll flex-1 overflow-y-auto w-full p-8 md:p-14 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-40">
            <Outlet />
          </div>
        </main>
      </div>
      <NotificationDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}
