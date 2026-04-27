import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Calendar,
  User as UserIcon,
  Building2,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Trash2,
  Loader2,
  Printer,
} from "lucide-react";
import api from "../services/api";
import type { Order, Dealer, Branch, Product } from "../types";
import { OrderStatus } from "../types";
import { format } from "date-fns";
import { useAuthStore } from "../store/authStore";
import { dashboardTranslations } from "../i18n/translations";
import { TableSkeleton } from "../components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../utils/toast";
import { useScrollLock } from "../utils/useScrollLock";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_KEY_MAP: Record<string, string> = {
  PENDING: "statusPending",
  ACCEPTED: "statusAccepted",
  PREPARING: "statusPreparing",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  COMPLETED: "statusCompleted",
  CANCELLED: "statusCancelled",
  RETURNED: "statusReturned",
};

const ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.RETURNED,
] as const;

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-600",
  DELIVERED: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  PROCESSING: "bg-blue-50 text-blue-600",
  ACCEPTED: "bg-blue-50 text-blue-600",
  PREPARING: "bg-purple-50 text-purple-600",
  SHIPPED: "bg-indigo-50 text-indigo-600",
  CANCELLED: "bg-rose-50 text-rose-600",
  RETURNED: "bg-slate-50 text-slate-600",
};

interface OrderLineItem {
  productId: string;
  price: number;
  quantity: number;
}

interface CreateOrderForm {
  dealerId: string;
  branchId: string;
  products: OrderLineItem[];
}

const emptyCreateForm: CreateOrderForm = {
  dealerId: "",
  branchId: "",
  products: [{ productId: "", price: 0, quantity: 1 }],
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dealerFilter, setDealerFilter] = useState("");
  const [page, setPage] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateOrderForm>(emptyCreateForm);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [saving, setSaving] = useState(false);

  // Detail panel
  const [showDetail, setShowDetail] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [preparingVariants, setPreparingVariants] = useState<string[]>([]);

  const { language } = useAuthStore();
  const t = dashboardTranslations[language];
  const getStatusLabel = (status: string) =>
    (t.orders as Record<string, string>)[STATUS_KEY_MAP[status]] ?? status;

  useScrollLock(showCreate || showDetail);

  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const response = await api.get("/orders");
        const data = response.data;
        // Handle both old array format and new paginated format
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data?.items) {
          setOrders(Array.isArray(data.items) ? data.items : []);
        } else {
          setOrders([]);
        }
      } catch (err: unknown) {
        if (!silent) {
          setError(t.common.error);
          console.error(err);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [t.common.error]
  );

  useEffect(() => {
    fetchOrders();
    // Fetch company variants
    api
      .get("/company/me")
      .then((res) => {
        setPreparingVariants(res.data.preparingVariants || []);
      })
      .catch(() => {});

    // Poll every 30 seconds for new orders from Telegram bot
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dealerFilter]);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "ALL")
      list = list.filter((o) => o.status === statusFilter);
    if (dealerFilter) list = list.filter((o) => o.dealerId === dealerFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.dealer?.name ?? "").toLowerCase().includes(q) ||
          (o.branch?.name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, search, statusFilter, dealerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ---- Create modal helpers ----
  const openCreate = async () => {
    setCreateForm(emptyCreateForm);
    setShowCreate(true);
    setLoadingModalData(true);
    try {
      const [dealersRes, branchesRes, productsRes] = await Promise.all([
        api.get<Dealer[]>("/dealers"),
        api.get<Branch[]>("/branches"),
        api.get<{ items?: Product[] } | Product[]>("/products"),
      ]);
      setDealers(Array.isArray(dealersRes.data) ? dealersRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      const rawProducts = Array.isArray(productsRes.data)
        ? productsRes.data
        : ((productsRes.data as { items?: Product[] }).items ?? []);
      setProducts(rawProducts);

      const firstDealer = Array.isArray(dealersRes.data)
        ? dealersRes.data[0]
        : undefined;
      const firstBranch = Array.isArray(branchesRes.data)
        ? branchesRes.data[0]
        : undefined;
      const firstProduct = rawProducts[0];
      setCreateForm({
        dealerId: firstDealer?.id ?? "",
        branchId: firstBranch?.id ?? "",
        products: [
          {
            productId: firstProduct?.id ?? "",
            price: firstProduct?.price ?? 0,
            quantity: 1,
          },
        ],
      });
    } catch {
      toast.error("Failed to load form data");
    } finally {
      setLoadingModalData(false);
    }
  };

  const updateLine = (
    index: number,
    field: keyof OrderLineItem,
    value: string | number
  ) => {
    setCreateForm((prev) => {
      const updated = [...prev.products];
      if (field === "productId") {
        const p = products.find((x) => x.id === value);
        updated[index] = {
          ...updated[index],
          productId: String(value),
          price: p?.price ?? 0,
        };
      } else {
        updated[index] = { ...updated[index], [field]: Number(value) };
      }
      return { ...prev, products: updated };
    });
  };

  const addLine = () => {
    const firstProduct = products[0];
    setCreateForm((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          productId: firstProduct?.id ?? "",
          price: firstProduct?.price ?? 0,
          quantity: 1,
        },
      ],
    }));
  };

  const removeLine = (index: number) => {
    setCreateForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleCreate = async () => {
    if (!createForm.dealerId) return toast.error(t.orders.selectDealer);
    if (!createForm.branchId) return toast.error(t.orders.selectBranch);
    if (createForm.products.some((p) => !p.productId))
      return toast.error(t.orders.selectProduct);
    try {
      setSaving(true);
      await api.post("/orders", {
        dealerId: createForm.dealerId,
        branchId: createForm.branchId,
        products: createForm.products,
      });
      toast.success(t.orders.orderCreated);
      setShowCreate(false);
      fetchOrders();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t.orders.orderCreateFailed);
    } finally {
      setSaving(false);
    }
  };

  // ---- Detail panel helpers ----
  const openDetail = (order: Order) => {
    setDetailOrder(order);
    setShowDetail(true);
  };

  const handleStatusUpdate = async (
    orderId: string,
    status: string,
    subStatus?: string
  ) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/orders/${orderId}/status`, { status, subStatus });
      toast.success(t.orders.statusUpdated);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: status as Order["status"], subStatus }
            : o
        )
      );
      setDetailOrder((prev) =>
        prev ? { ...prev, status: status as Order["status"], subStatus } : prev
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t.orders.failedToUpdateStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const printReceipt = (order: Order) => {
    const date = format(new Date(order.createdAt), "dd.MM.yyyy HH:mm");
    const itemRows = (order.items ?? [])
      .map(
        (item) =>
          `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #eee">${item.name}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:center">${item.qty} ${item.unit}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right">${item.price.toLocaleString()}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:700">${(item.qty * item.price).toLocaleString()}</td>
          </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Chek #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        body{font-family:monospace;max-width:320px;margin:0 auto;padding:16px;font-size:13px}
        h2{text-align:center;margin:0 0 4px}
        .center{text-align:center}
        .sep{border:none;border-top:1px dashed #000;margin:8px 0}
        table{width:100%;border-collapse:collapse}
        th{font-size:10px;text-transform:uppercase;padding:4px 8px;border-bottom:2px solid #000;text-align:left}
        .total{font-size:16px;font-weight:900;text-align:right;padding:8px 8px 0}
      </style></head><body>
      <h2>SUPPLIO</h2>
      <p class="center" style="margin:0;font-size:11px">Buyurtma kvitansiyasi</p>
      <hr class="sep"/>
      <p style="margin:2px 0"><b>№:</b> #${order.id.slice(0, 8).toUpperCase()}</p>
      <p style="margin:2px 0"><b>Diler:</b> ${order.dealer?.name ?? "—"} ${order.dealer?.phone ? "(" + order.dealer.phone + ")" : ""}</p>
      <p style="margin:2px 0"><b>Filial:</b> ${order.branch?.name ?? "—"}</p>
      <p style="margin:2px 0"><b>Sana:</b> ${date}</p>
      <hr class="sep"/>
      <table>
        <thead><tr>
          <th>Mahsulot</th><th style="text-align:center">Miqdor</th><th style="text-align:right">Narx</th><th style="text-align:right">Jami</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <hr class="sep"/>
      <div class="total">JAMI: ${order.totalAmount.toLocaleString()} so'm</div>
      <hr class="sep"/>
      <p class="center" style="font-size:10px;margin:4px 0">supplio.uz</p>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`;

    const win = window.open("", "_blank", "width=400,height=600");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-12 w-40 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.sidebar.orders}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic opacity-70">
            {t.orders.subtitle}
          </p>
        </div>
        <button onClick={openCreate} className="premium-button">
          <ShoppingCart className="h-4 w-4" />
          {t.common.newOrder}
        </button>
      </div>

      {/* Search + Dealer Filter + Status filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${t.common.search ?? "Qidirish"}...`}
              className="input-field w-full pl-9 text-sm"
            />
          </div>
          <select
            value={dealerFilter}
            onChange={(e) => setDealerFilter(e.target.value)}
            className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-all min-w-[200px]"
          >
            <option value="">{t.dashboard.activeDealers}</option>
            {[
              ...new Map(
                orders
                  .filter((o) => o.dealer)
                  .map((o) => [o.dealerId, o.dealer!.name])
              ).entries(),
            ].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              {s === "ALL" ? t.common.all : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden border border-slate-100/50 shadow-2xl shadow-blue-500/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-10 py-6 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  ID
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {t.dashboard.dealerName}
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {t.sidebar.products}
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {t.dashboard.balance}
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {t.orders.orderDate}
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {t.orders.orderStatus}
                </th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {t.superadmin.actionsCol}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white/10 backdrop-blur-sm">
              {paginated.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-blue-50/40 transition-all duration-300 group"
                >
                  <td className="px-10 py-6">
                    <span className="font-mono text-[10px] font-black text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-blue-50 shadow-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <div className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" />{" "}
                        {order.dealer?.name || t.common.noData}
                      </div>
                      <div className="text-[10px] text-blue-500/60 dark:text-blue-400/60 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <Building2 className="h-3 w-3" />{" "}
                        {order.branch?.name || t.branches.mainPoint}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {order.items && order.items.length > 0 ? (
                      <div>
                        <p className="font-black text-sm text-slate-900 dark:text-white">
                          {order.items[0].name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                          ×{order.items[0].qty} {order.items[0].unit}
                          {order.items.length > 1 &&
                            ` +${order.items.length - 1} more`}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                      {order.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black ml-1 uppercase">
                      {t.common.uzs}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 opacity-50 text-blue-400" />{" "}
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span
                      className={`inline-flex items-center rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_COLORS[order.status] ?? "bg-slate-50 text-slate-600"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${order.status === OrderStatus.PENDING ? "bg-amber-500 animate-pulse" : "bg-current"}`}
                      />
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button
                      onClick={() => openDetail(order)}
                      className="p-3 rounded-2xl bg-white text-slate-400 hover:text-blue-600 hover:scale-110 active:scale-90 transition-all border border-slate-100/50 shadow-sm"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20 group">
                      <ShoppingCart className="w-16 h-16 group-hover:animate-bounce" />
                      <p className="font-black text-xl italic uppercase tracking-tighter">
                        {t.orders.noOrders}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-10 py-5 border-t border-slate-100/50 bg-slate-50/30">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-black border transition-all ${
                      p === page
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t.common.newOrder}
                </h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingModalData ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dealer */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t.orders.dealer} *
                    </label>
                    <select
                      value={createForm.dealerId}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          dealerId: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border-2 border-transparent dark:border-slate-700 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                    >
                      <option value="">{t.orders.selectDealer}...</option>
                      {dealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t.dashboard.branch} *
                    </label>
                    <select
                      value={createForm.branchId}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          branchId: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border-2 border-transparent dark:border-slate-700 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                    >
                      <option value="">{t.orders.selectBranch}...</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Products */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t.sidebar.products} *
                      </label>
                      <button
                        type="button"
                        onClick={addLine}
                        className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t.common.add}
                      </button>
                    </div>
                    {createForm.products.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl"
                      >
                        <select
                          value={line.productId}
                          onChange={(e) =>
                            updateLine(idx, "productId", e.target.value)
                          }
                          className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border-2 border-transparent dark:border-slate-600 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                        >
                          <option value="">{t.products.name}...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={0}
                          value={line.price}
                          onChange={(e) =>
                            updateLine(idx, "price", e.target.value)
                          }
                          placeholder={t.products.price}
                          className="w-28 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white rounded-xl border-2 border-transparent dark:border-slate-600 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                        />
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(idx, "quantity", e.target.value)
                          }
                          placeholder={t.products.stock}
                          className="w-20 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white rounded-xl border-2 border-transparent dark:border-slate-600 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                        />
                        {createForm.products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || loadingModalData}
                  className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {t.common.newOrder}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Panel */}
      <AnimatePresence>
        {showDetail && detailOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center p-10 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {t.orders.orderDetails}
                  </h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
                    #{detailOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printReceipt(detailOrder)}
                    title="Chek chiqarish"
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8 flex-1">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t.orders.dealer}
                    </p>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {detailOrder.dealer?.name ?? t.common.noData}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t.dashboard.branch}
                    </p>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {detailOrder.branch?.name ?? "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t.orders.orderDate}
                    </p>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {format(new Date(detailOrder.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t.payments.amount}
                    </p>
                    <p className="font-black text-sm text-slate-900">
                      {detailOrder.totalAmount.toLocaleString()}{" "}
                      <span className="text-[9px] opacity-40">
                        {t.common.uzs}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.orders.orderStatus}
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={detailOrder.status}
                      onChange={(e) =>
                        handleStatusUpdate(detailOrder.id, e.target.value)
                      }
                      disabled={updatingStatus}
                      className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-2 border-transparent dark:border-slate-700 focus:border-blue-500 outline-none font-bold text-sm transition-all disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {getStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                    {updatingStatus && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500 shrink-0" />
                    )}
                  </div>

                  {detailOrder.status === "PREPARING" &&
                    preparingVariants.length > 0 && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                          {t.orders.subStatus}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {preparingVariants.map((v) => (
                            <button
                              key={v}
                              onClick={() =>
                                handleStatusUpdate(
                                  detailOrder.id,
                                  "PREPARING",
                                  v
                                )
                              }
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                detailOrder.subStatus === v
                                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                  : "bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-400"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Items */}
                {detailOrder.items && detailOrder.items.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t.orders.items}
                    </label>
                    <div className="space-y-2">
                      {detailOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-5 py-4 rounded-2xl"
                        >
                          <div>
                            <p className="font-black text-sm text-slate-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                              x{item.qty} × {item.price.toLocaleString()}{" "}
                              {t.common.uzs}
                            </p>
                          </div>
                          <p className="font-black text-sm text-slate-900 dark:text-white">
                            {(item.qty * item.price).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
