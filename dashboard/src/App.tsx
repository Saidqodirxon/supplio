import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Dealers from "./pages/Dealers";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Branches from "./pages/Branches";
import Analytics from "./pages/Analytics";
import Products from "./pages/Products";
import Expenses from "./pages/Expenses";
import Notifications from "./pages/Notifications";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import TelegramBots from "./pages/TelegramBots";
import Approvals from "./pages/Approvals";
import Reports from "./pages/Reports";
import OwnerDemo from "./pages/OwnerDemo";
import Staff from "./pages/Staff";
import DemoLanding from "./pages/DemoLanding";
import HelpCenter from "./pages/HelpCenter";
import SupportTickets from "./pages/SupportTickets";
import Profile from "./pages/Profile";
import { NotFound, SubscriptionExpired, AccountLocked } from "./pages/Error";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

// Global error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-outfit">
          <div className="max-w-md w-full space-y-8">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-rose-600">
                Runtime Error
              </p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Something went wrong
              </h1>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                An unexpected error occurred. Please refresh the page or try
                again.
              </p>
              {this.state.error && (
                <pre className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-left text-slate-600 dark:text-slate-400 overflow-auto max-h-32 border border-slate-100 dark:border-slate-800">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.97] transition-all"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.97] transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function SuperAdminBlock() {
  const { logout } = useAuthStore();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-outfit p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
          <img
            src="/logo.png"
            alt="Supplio"
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin panelga o'ting
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            SuperAdmin foydalanuvchilari distributor dashboardiga kira olmaydi.
            Iltimos, maxsus admin panel orqali tizimni boshqaring.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={import.meta.env.VITE_ADMIN_URL || "http://localhost:5001"}
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20 text-center block"
          >
            Admin panelga o'tish
          </a>
          <button
            onClick={logout}
            className="w-full py-3 px-6 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // SUPER_ADMIN is a platform-level role — they must use the separate admin panel.
  // In demo mode the role is overridden to OWNER so this check won't block demo.
  const isDemo = localStorage.getItem("supplio_demo_mode") === "1";
  if (user?.roleType === "SUPER_ADMIN" && !isDemo) {
    return <SuperAdminBlock />;
  }

  return <>{children}</>;
}

// Role-based route protection
function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const getEffectiveRole = useAuthStore((state) => state.getEffectiveRole);
  const effectiveRole = getEffectiveRole();

  if (!user || !allowedRoles.includes(effectiveRole || "")) {
    return <NotFound />;
  }

  return <>{children}</>;
}

// Detect if running on demo subdomain
const DEMO_MODE_STORAGE_KEY = "supplio_demo_mode";
const DEMO_FULL_ACCESS_STORAGE_KEY = "supplio_demo_full_access";

function isDemoRuntime() {
  if (typeof window === "undefined") return false;

  const hostDemo =
    window.location.hostname === "demo.supplio.uz" ||
    window.location.hostname === "www.demo.supplio.uz" ||
    window.location.hostname.startsWith("demo.") ||
    window.location.hostname.startsWith("www.demo.");

  const params = new URLSearchParams(window.location.search);
  const demoParam = (params.get("demo") || "").toLowerCase();
  const queryDemo =
    demoParam === "1" || demoParam === "true" || demoParam === "yes";
  const fullParam = (params.get("access") || "").toLowerCase();
  const queryFull =
    fullParam === "full" || fullParam === "edit" || fullParam === "write";
  const queryView =
    fullParam === "view" || fullParam === "readonly" || fullParam === "read";

  if (queryFull) {
    localStorage.setItem(DEMO_FULL_ACCESS_STORAGE_KEY, "1");
  } else if (queryView) {
    localStorage.setItem(DEMO_FULL_ACCESS_STORAGE_KEY, "0");
  }

  if (hostDemo || queryDemo) {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, "1");
    return true;
  }

  return localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "1";
}

function App() {
  const { isDark } = useThemeStore();
  const demoRuntime = isDemoRuntime();

  // On demo domain: show demo landing if not on /login path
  if (demoRuntime) {
    return (
      <ErrorBoundary>
        <Router>
          <Toaster
            position="top-right"
            theme={isDark ? "dark" : "light"}
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "1rem",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="dealers" element={<Dealers />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="branches" element={<Branches />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="products" element={<Products />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="help-center" element={<HelpCenter />} />
              <Route path="settings" element={<Settings />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="reports" element={<Reports />} />
              <Route path="staff" element={<Staff />} />
              <Route path="support" element={<SupportTickets />} />
              <Route path="telegram-bots" element={<TelegramBots />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* Catch-all for demo domain shows demo landing */}
            <Route path="*" element={<DemoLanding />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="top-right"
          theme={isDark ? "dark" : "light"}
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "1rem",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<OwnerDemo />} />
          <Route path="/demo-landing" element={<DemoLanding />} />
          <Route path="/expired" element={<SubscriptionExpired />} />
          <Route path="/locked" element={<AccountLocked />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help-center" element={<HelpCenter />} />

            {/* Owner/Manager/Super Admin routes */}
            <Route
              path="dealers"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Dealers />
                </ProtectedRoute>
              }
            />
            <Route
              path="approvals"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Approvals />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="branches"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Branches />
                </ProtectedRoute>
              }
            />
            <Route
              path="expenses"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="support"
              element={
                <ProtectedRoute
                  allowedRoles={["OWNER", "MANAGER", "SUPER_ADMIN"]}
                >
                  <SupportTickets />
                </ProtectedRoute>
              }
            />

            {/* Owner/Super Admin routes */}
            <Route
              path="subscription"
              element={
                <ProtectedRoute allowedRoles={["OWNER", "SUPER_ADMIN"]}>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="telegram-bots"
              element={
                <ProtectedRoute allowedRoles={["OWNER", "SUPER_ADMIN"]}>
                  <TelegramBots />
                </ProtectedRoute>
              }
            />

            <Route path="demo-owner" element={<OwnerDemo />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
