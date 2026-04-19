import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Loader2,
  RefreshCw,
  Award,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useAuthStore } from "../store/authStore";
import clsx from "clsx";

interface DebtDealer {
  id: string;
  name: string;
  phone: string;
  currentDebt: number;
  creditLimit: number;
  utilizationPercent: number;
  orders: Array<{
    id: string;
    totalAmount: number;
    createdAt: string;
    status: string;
  }>;
}

interface DebtReport {
  dealers: DebtDealer[];
  totalDebt: number;
  totalCreditLimit: number;
  overLimitCount: number;
}

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  dealer: { name: string; phone: string } | null;
}

interface DashData {
  stats: {
    revenue: number;
    profit: number;
    activeDealers: number;
    products: number;
    periodOrders: number;
    totalOrders: number;
    debt: number;
    collected: number;
    totalExpenses: number;
    periodRevenue: number;
  };
  recentOrders: RecentOrder[];
  statusDistribution: Array<{ status: string; count: number; amount: number }>;
}

interface TopDealer {
  id: string;
  name: string;
  totalOrders: number;
  totalAmount: number;
  currentDebt: number;
  creditLimit: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-500/10",
  ACCEPTED: "text-blue-600 bg-blue-500/10",
  PREPARING: "text-indigo-600 bg-indigo-500/10",
  SHIPPED: "text-purple-600 bg-purple-500/10",
  DELIVERED: "text-emerald-600 bg-emerald-500/10",
  COMPLETED: "text-emerald-700 bg-emerald-500/15",
  CANCELLED: "text-rose-600 bg-rose-500/10",
};

function downloadCsv(filename: string, rows: string[][]) {
  const bom = "\uFEFF"; // UTF-8 BOM for Excel
  const csv =
    bom +
    rows
      .map((r) =>
        r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { language } = useAuthStore();
  const [tab, setTab] = useState<"overview" | "debts" | "top">("overview");
  const [debtReport, setDebtReport] = useState<DebtReport | null>(null);
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [topDealers, setTopDealers] = useState<TopDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [planError, setPlanError] = useState(false);

  const isUz = ["uz", "oz"].includes(language);
  const isRu = language === "ru";

  const t = {
    title: isUz ? "Hisobotlar" : isRu ? "Отчёты" : "Reports",
    overview: isUz ? "Umumiy" : isRu ? "Обзор" : "Overview",
    debts: isUz ? "Qarzlar" : isRu ? "Долги" : "Debts",
    top: isUz ? "Top Dilerlar" : isRu ? "Топ Дилеры" : "Top Dealers",
    totalDebt: isUz ? "Umumiy qarz" : isRu ? "Общий долг" : "Total Debt",
    totalLimit: isUz
      ? "Umumiy limit"
      : isRu
        ? "Общий лимит"
        : "Total Credit Limit",
    overLimit: isUz
      ? "Limitdan oshgan"
      : isRu
        ? "Превысили лимит"
        : "Over Limit",
    noDebt: isUz ? "Qarzlar yo'q" : isRu ? "Долгов нет" : "No debts",
    dealer: isUz ? "Diler" : isRu ? "Дилер" : "Dealer",
    debt: isUz ? "Qarz" : isRu ? "Долг" : "Debt",
    limit: isUz ? "Limit" : isRu ? "Лимит" : "Limit",
    utilization: isUz ? "Foydalanish" : isRu ? "Использование" : "Utilization",
    orders: isUz ? "Buyurtmalar" : isRu ? "Заказы" : "Orders",
    revenue: isUz ? "Daromad" : isRu ? "Выручка" : "Revenue",
    profit: isUz ? "Foyda" : isRu ? "Прибыль" : "Profit",
    dealers: isUz ? "Dilerlar" : isRu ? "Дилеры" : "Dealers",
    products: isUz ? "Mahsulotlar" : isRu ? "Товары" : "Products",
    debt2: isUz ? "Qarzdorlik" : isRu ? "Задолженность" : "Debt",
    exportXlsx: isUz
      ? "Excel yuklash"
      : isRu
        ? "Скачать Excel"
        : "Export Excel",
    recentOrders: isUz
      ? "So'nggi buyurtmalar"
      : isRu
        ? "Последние заказы"
        : "Recent Orders",
    noData: isUz ? "Ma'lumot yo'q" : isRu ? "Нет данных" : "No data",
  };

  const loadAll = async () => {
    setLoading(true);
    setPlanError(false);
    try {
      const [debtRes, statsRes, topRes] = await Promise.allSettled([
        api.get("/analytics/debts"),
        api.get("/analytics/dashboard?period=all"),
        api.get("/analytics/top-dealers?limit=20"),
      ]);
      // Check if any 402 plan-limit error occurred (same as Analytics page pattern)
      const isPlanError = [debtRes, statsRes, topRes].some(
        (r) => r.status === "rejected" && (
          r.reason?.response?.status === 402 ||
          r.reason?.response?.data?.limitReached === true
        )
      );
      if (isPlanError) {
        setPlanError(true);
        setLoading(false);
        return;
      }
      if (debtRes.status === "fulfilled") setDebtReport(debtRes.value.data);
      if (statsRes.status === "fulfilled") setDashData(statsRes.value.data);
      if (topRes.status === "fulfilled") setTopDealers(topRes.value.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const fmt = (n: number) => (n ?? 0).toLocaleString() + " so'm";

  // Export handlers
  const exportOverview = () => {
    if (!dashData) return;
    const s = dashData.stats;
    const rows: string[][] = [
      [t.title + " - " + t.overview, new Date().toLocaleDateString()],
      [],
      ["Ko'rsatkich", "Qiymat"],
      [t.orders, String(s.totalOrders)],
      [t.revenue, fmt(s.revenue)],
      [t.profit, fmt(s.profit)],
      [t.dealers, String(s.activeDealers)],
      [t.products, String(s.products)],
      [t.debt2, fmt(s.debt)],
      [],
      [t.recentOrders],
      ["Diler", "Sana", "Summa", "Status"],
      ...dashData.recentOrders.map((o) => [
        o.dealer?.name ?? "-",
        new Date(o.createdAt).toLocaleDateString(),
        fmt(o.totalAmount),
        o.status,
      ]),
    ];
    downloadCsv(
      `hisobot-umumiy-${new Date().toISOString().split("T")[0]}.csv`,
      rows
    );
    toast.success("Excel tayyor!");
  };

  const exportDebts = () => {
    if (!debtReport) return;
    const rows: string[][] = [
      [t.title + " - " + t.debts, new Date().toLocaleDateString()],
      [],
      ["Umumiy qarz", fmt(debtReport.totalDebt)],
      ["Umumiy limit", fmt(debtReport.totalCreditLimit)],
      ["Limitdan oshgan", String(debtReport.overLimitCount)],
      [],
      [t.dealer, "Telefon", t.debt, t.limit, t.utilization],
      ...debtReport.dealers.map((d) => [
        d.name,
        d.phone,
        fmt(d.currentDebt),
        fmt(d.creditLimit),
        d.utilizationPercent.toFixed(1) + "%",
      ]),
    ];
    downloadCsv(
      `hisobot-qarzlar-${new Date().toISOString().split("T")[0]}.csv`,
      rows
    );
    toast.success("Excel tayyor!");
  };

  const exportTop = () => {
    if (!topDealers.length) return;
    const rows: string[][] = [
      [t.title + " - " + t.top, new Date().toLocaleDateString()],
      [],
      ["#", t.dealer, t.orders, t.revenue, t.debt2],
      ...topDealers.map((d, i) => [
        String(i + 1),
        d.name,
        String(d.totalOrders),
        fmt(d.totalAmount),
        fmt(d.currentDebt),
      ]),
    ];
    downloadCsv(
      `hisobot-top-dilerlar-${new Date().toISOString().split("T")[0]}.csv`,
      rows
    );
    toast.success("Excel tayyor!");
  };

  const handleExport = () => {
    if (tab === "overview") exportOverview();
    else if (tab === "debts") exportDebts();
    else exportTop();
  };

  if (planError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            {isUz ? "Kompaniya faoliyati bo'yicha to'liq hisobot" : isRu ? "Полный отчёт по деятельности компании" : "Full company activity report"}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-16 h-16 text-amber-600 dark:text-amber-400 mb-4 opacity-70" />
          <h2 className="text-2xl font-black text-amber-900 dark:text-amber-100 mb-2">
            {isUz ? "Hisobotlar mavjud emas" : isRu ? "Отчёты недоступны" : "Reports Unavailable"}
          </h2>
          <p className="text-amber-700 dark:text-amber-300 font-bold max-w-md mb-6">
            {isUz
              ? "Hisobotlar funksiyasi tarifingizda mavjud emas. Yangilash uchun tarifni upgrade qiling."
              : isRu
                ? "Отчёты недоступны в текущем плане. Пожалуйста, обновите тариф."
                : "Reports are not available on your current plan. Please upgrade your tariff."}
          </p>
          <a
            href="/subscription"
            className="premium-button"
          >
            {isUz ? "Tarifni yangilash" : isRu ? "Обновить тариф" : "Upgrade Plan"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            {isUz
              ? "Kompaniya faoliyati bo'yicha to'liq hisobot"
              : isRu
                ? "Полный отчёт по деятельности компании"
                : "Full company activity report"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-widest transition-all active:scale-95 hover:bg-emerald-100"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t.exportXlsx}
          </button>
          <button
            onClick={loadAll}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-1">
        {(["overview", "debts", "top"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={clsx(
              "px-5 py-2.5 text-sm font-black rounded-xl transition-all",
              tab === tabKey
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            )}
          >
            {tabKey === "overview"
              ? t.overview
              : tabKey === "debts"
                ? t.debts
                : t.top}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === "overview" && dashData && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: t.orders,
                    value: dashData.stats.totalOrders.toLocaleString(),
                    icon: ShoppingCart,
                    color: "text-blue-600 bg-blue-500/10",
                  },
                  {
                    label: t.revenue,
                    value: fmt(dashData.stats.revenue),
                    icon: DollarSign,
                    color: "text-emerald-600 bg-emerald-500/10",
                  },
                  {
                    label: t.profit,
                    value: fmt(dashData.stats.profit),
                    icon: TrendingUp,
                    color: "text-indigo-600 bg-indigo-500/10",
                  },
                  {
                    label: t.dealers,
                    value: dashData.stats.activeDealers.toLocaleString(),
                    icon: Users,
                    color: "text-violet-600 bg-violet-500/10",
                  },
                  {
                    label: t.products,
                    value: dashData.stats.products.toLocaleString(),
                    icon: BarChart3,
                    color: "text-amber-600 bg-amber-500/10",
                  },
                  {
                    label: t.debt2,
                    value: fmt(dashData.stats.debt),
                    icon: CreditCard,
                    color: "text-rose-600 bg-rose-500/10",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6"
                  >
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-2xl flex items-center justify-center mb-4",
                        item.color
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status distribution */}
              {dashData.statusDistribution.length > 0 && (
                <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4">
                    {isUz
                      ? "Buyurtma holatlari"
                      : isRu
                        ? "Статусы заказов"
                        : "Order statuses"}
                  </h3>
                  <div className="space-y-3">
                    {dashData.statusDistribution.map((s) => (
                      <div key={s.status} className="flex items-center gap-3">
                        <span
                          className={clsx(
                            "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg w-28 text-center shrink-0",
                            STATUS_COLORS[s.status] ||
                              "text-slate-400 bg-slate-500/10"
                          )}
                        >
                          {s.status}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min(100, (s.count / (dashData.stats.totalOrders || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-500 w-8 text-right">
                          {s.count}
                        </span>
                        <span className="text-xs font-bold text-slate-400 w-32 text-right hidden sm:block">
                          {fmt(s.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent orders */}
              {dashData.recentOrders.length > 0 && (
                <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 dark:text-white">
                      {t.recentOrders}
                    </h3>
                    <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                      {dashData.recentOrders.length}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {dashData.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between px-6 py-4"
                      >
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">
                            {order.dealer?.name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                              STATUS_COLORS[order.status] ||
                                "text-slate-400 bg-slate-500/10"
                            )}
                          >
                            {order.status}
                          </span>
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {order.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Debts Tab */}
          {tab === "debts" && (
            <div className="space-y-6">
              {debtReport ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: t.totalDebt,
                        value: fmt(debtReport.totalDebt),
                        icon: TrendingDown,
                        color: "text-rose-600 bg-rose-500/10",
                      },
                      {
                        label: t.totalLimit,
                        value: fmt(debtReport.totalCreditLimit),
                        icon: CreditCard,
                        color: "text-blue-600 bg-blue-500/10",
                      },
                      {
                        label: t.overLimit,
                        value: String(debtReport.overLimitCount),
                        icon: AlertTriangle,
                        color: "text-amber-600 bg-amber-500/10",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-6"
                      >
                        <div
                          className={clsx(
                            "w-10 h-10 rounded-2xl flex items-center justify-center mb-4",
                            item.color
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                          {item.value}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {debtReport.dealers.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center py-16 gap-3">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                      <p className="font-black text-slate-700 dark:text-slate-300">
                        {t.noDebt}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {debtReport.dealers.map((dealer) => (
                          <div key={dealer.id} className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <p className="font-black text-slate-900 dark:text-white">
                                  {dealer.name}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {dealer.phone}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-rose-600 dark:text-rose-400">
                                  {fmt(dealer.currentDebt)}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {t.limit}: {fmt(dealer.creditLimit)}
                                </p>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={clsx(
                                  "h-full rounded-full transition-all",
                                  dealer.utilizationPercent >= 100
                                    ? "bg-rose-500"
                                    : dealer.utilizationPercent >= 80
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                )}
                                style={{
                                  width: `${Math.min(dealer.utilizationPercent, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {dealer.utilizationPercent.toFixed(1)}%{" "}
                              {t.utilization}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <TrendingDown className="w-10 h-10 text-slate-300" />
                  <p className="font-black text-slate-500">{t.noData}</p>
                </div>
              )}
            </div>
          )}

          {/* Top Dealers Tab */}
          {tab === "top" && (
            <div className="rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
              {topDealers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Award className="w-10 h-10 text-slate-300" />
                  <p className="font-black text-slate-500">{t.noData}</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 dark:text-white">
                      {t.top}
                    </h3>
                    <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                      Top {topDealers.length}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {topDealers.map((dealer, i) => (
                      <div
                        key={dealer.id}
                        className="flex items-center gap-4 px-6 py-4"
                      >
                        <span
                          className={clsx(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0",
                            i === 0
                              ? "bg-amber-500 text-white"
                              : i === 1
                                ? "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white"
                                : i === 2
                                  ? "bg-orange-400 text-white"
                                  : "bg-slate-100 dark:bg-white/10 text-slate-500"
                          )}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 dark:text-white truncate">
                            {dealer.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {dealer.totalOrders} {t.orders}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-slate-900 dark:text-white text-sm">
                            {fmt(dealer.totalAmount)}
                          </p>
                          {dealer.currentDebt > 0 && (
                            <p className="text-xs text-rose-500 font-bold mt-0.5">
                              {t.debt}: {fmt(dealer.currentDebt)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
