import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Tags,
  Ruler,
  RotateCcw,
  BarChart3,
  Warehouse,
} from "lucide-react";
import api from "../services/api";
import type {
  Product,
  ProductsResponse,
  ProductStats,
  Category,
  Unit,
} from "../types";
import { useAuthStore } from "../store/authStore";
import { dashboardTranslations } from "../i18n/translations";
import { toast } from "../utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useScrollLock } from "../utils/useScrollLock";
import ImageUploader from "../components/ImageUploader";

const BACKEND = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api$/, "");
const imgSrc = (url?: string | null) =>
  !url ? "" : url.startsWith("http") ? url : `${BACKEND}${url}`;

interface ProductForm {
  name: string;
  sku: string;
  price: string;
  costPrice: string;
  stock: string;
  unit: string;
  unitId: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  discountPrice: string;
  isPromo: boolean;
}

const defaultForm: ProductForm = {
  name: "",
  sku: "",
  price: "",
  costPrice: "",
  stock: "",
  unit: "pcs",
  unitId: "",
  categoryId: "",
  subcategoryId: "",
  description: "",
  imageUrl: "",
  isActive: true,
  discountPrice: "",
  isPromo: false,
};

// ── Category Manager Modal ──────────────────────────────────────────────────

function CategoryManager({
  categories,
  onClose,
  onRefresh,
}: {
  categories: Category[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const addCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await api.post("/categories", { name: newCat.trim() });
      setNewCat("");
      onRefresh();
    } catch {
      toast.error("Error");
    }
  };

  const addSubcategory = async () => {
    if (!newSub.trim() || !selectedCat) return;
    try {
      await api.post(`/categories/${selectedCat}/subcategories`, {
        name: newSub.trim(),
      });
      setNewSub("");
      onRefresh();
    } catch {
      toast.error("Error");
    }
  };

  const deleteCat = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      onRefresh();
    } catch {
      toast.error("Error");
    }
  };

  const deleteSub = async (id: string) => {
    try {
      await api.delete(`/categories/subcategories/${id}`);
      onRefresh();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-blue-600" /> {t.products.categories}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Category */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              {t.products.newCategory}
            </label>
            <div className="flex gap-2">
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder={t.products.name}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add Subcategory */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              {t.products.newSubcategory}
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none"
              >
                <option value="">{t.products.selectCategory}...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubcategory()}
                placeholder={t.products.name}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                onClick={addSubcategory}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">
                      {cat._count?.products ?? 0} {t.dashboard.productsCount.toLowerCase()}
                    </span>
                    <button
                      onClick={() => deleteCat(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="px-5 py-2 space-y-1">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-xs text-slate-500 dark:text-slate-400 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                          {sub.name}
                        </span>
                        <button
                          onClick={() => deleteSub(sub.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Products() {
  const [response, setResponse] = useState<ProductsResponse | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Inventory
  const [stockAdjId, setStockAdjId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState<string>("");
  const [stockSaving, setStockSaving] = useState(false);

  const { language } = useAuthStore();
  const t = dashboardTranslations[language];

  useScrollLock(showModal || showCatManager || !!deleteId);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<Category[]>("/categories");
      setCategories(res.data);
    } catch {
      /* silent */
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await api.get<Unit[]>("/units");
      setUnits(res.data);
    } catch {
      /* silent */
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterCategory) params.set("categoryId", filterCategory);
      if (filterSubcategory) params.set("subcategoryId", filterSubcategory);
      if (filterUnit) params.set("unitId", filterUnit);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const [prodRes, statsRes] = await Promise.allSettled([
        api.get<ProductsResponse>(`/products?${params.toString()}`),
        api.get<ProductStats>("/products/stats"),
      ]);

      if (prodRes.status === "fulfilled") setResponse(prodRes.value.data);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    filterCategory,
    filterSubcategory,
    filterUnit,
    sortBy,
    sortOrder,
    page,
    t.common.error,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchUnits();
  }, [fetchCategories, fetchUnits]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterCategory,
    filterSubcategory,
    filterUnit,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      sku: p.sku || "",
      price: String(p.price),
      costPrice: String(p.costPrice),
      stock: String(p.stock),
      unit: p.unit,
      unitId: p.unitId || "",
      categoryId: p.categoryId || "",
      subcategoryId: p.subcategoryId || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      isActive: p.isActive,
      discountPrice:
        (p as any).discountPrice != null
          ? String((p as any).discountPrice)
          : "",
      isPromo: !!(p as any).isPromo,
    });
    setShowModal(true);
  };

  const handleAdjustStock = async (productId: string, delta: number) => {
    try {
      setStockSaving(true);
      await api.patch(`/products/${productId}/adjust-stock`, { delta });
      toast.success(delta > 0 ? `+${delta} ${t.products?.stock || 'stock'} qo'shildi` : `${delta} ${t.products?.stock || 'stock'} ayirildi`);
      setStockAdjId(null);
      setStockDelta("");
      fetchProducts();
    } catch {
      toast.error(t.common.error);
    } finally {
      setStockSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error(t.common.error);
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice) || 0,
        stock: parseInt(form.stock) || 0,
        unit: form.unit,
        unitId: form.unitId || undefined,
        categoryId: form.categoryId || undefined,
        subcategoryId: form.subcategoryId || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
        discountPrice: form.discountPrice
          ? parseFloat(form.discountPrice)
          : undefined,
        isPromo: form.isPromo,
      };
      if (editProduct) {
        await api.patch(`/products/${editProduct.id}`, payload);
        toast.success(t.common.save);
      } else {
        await api.post("/products", payload);
        toast.success(t.common.add);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success(t.common.delete);
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error(t.common.error);
    }
  };

  const subcategories =
    categories.find((c) => c.id === filterCategory)?.subcategories ?? [];
  const formSubcategories =
    categories.find((c) => c.id === form.categoryId)?.subcategories ?? [];
  const products = response?.items ?? [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 dark:border-emerald-900/50">
            <Package className="w-3 h-3" /> {t.products?.title || "Products"}
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {t.products?.title || "Products"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {t.products?.subtitle || ""} • {response?.total ?? 0} {t.products.total}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCatManager(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Tags className="w-4 h-4" /> {t.products.categories}
          </button>
          <button onClick={openAdd} className="premium-button">
            <Plus className="w-4 h-4" />
            {t.products?.addProduct || "Add Product"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: t.products.totalProducts,
            value: stats?.totalCount ?? 0,
            suffix: "",
          },
          {
            label: t.products.inventoryCost,
            value: (stats?.inventoryValue ?? 0).toLocaleString(),
            suffix: t.common.uzs,
          },
          {
            label: t.products.retailValue,
            value: (stats?.totalRevenuePotential ?? 0).toLocaleString(),
            suffix: t.common.uzs,
          },
          {
            label: t.products.avgMargin,
            value: `${stats?.avgMargin ?? 0}%`,
            suffix: "",
          },
        ].map((s) => (
          <div key={s.label} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {s.value}{" "}
              <span className="text-xs text-slate-400 font-bold">
                {s.suffix}
              </span>
            </h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative xl:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setFilterSubcategory("");
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="">{t.products.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Subcategory */}
          <select
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value)}
            disabled={!filterCategory || subcategories.length === 0}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50"
          >
            <option value="">{t.products.allSubcategories}</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(":");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="createdAt:desc">{t.products.newestFirst}</option>
            <option value="createdAt:asc">{t.products.oldestFirst}</option>
            <option value="name:asc">{t.products.nameAZ}</option>
            <option value="name:desc">{t.products.nameZA}</option>
            <option value="price:asc">{t.products.priceLowHigh}</option>
            <option value="price:desc">{t.products.priceHighLow}</option>
            <option value="stock:asc">{t.products.stockLowHigh}</option>
            <option value="stock:desc">{t.products.stockHighLow}</option>
          </select>

          {/* Reset */}
          <button
            onClick={() => {
              setSearch("");
              setFilterCategory("");
              setFilterSubcategory("");
              setFilterUnit("");
              setSortBy("createdAt");
              setSortOrder("desc");
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> {t.common.reset}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {t.products.title}{" "}
            <span className="text-slate-400 font-bold text-sm ml-2">
              ({response?.total ?? 0})
            </span>
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Filter className="w-3 h-3" />
            {search || filterCategory ? t.common.filtered : t.common.all}
          </div>
        </div>

        {loading ? (
          <div className="p-10 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
              {search || filterCategory
                ? t.common.noData
                : t.products?.noProducts || "No products"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-900/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.products.name}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.products.categories}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.products?.price || "Price"}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.products?.costPrice || "Cost"}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.products?.margin || "Margin"}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.products?.stock || "Stock"}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.superadmin.actionsCol}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {products.map((product) => {
                  const margin =
                    product.price > 0
                      ? ((product.price - product.costPrice) / product.price) *
                        100
                      : 0;
                  const unitLabel =
                    product.unitRef?.symbol ||
                    product.unitRef?.name ||
                    product.unit;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={imgSrc(product.imageUrl)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {product.name}
                              {(product as any).isPromo && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest ml-2">
                                  {t.products.promo}
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {product.sku || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {product.category ? (
                          <div>
                            <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                              {product.category.name}
                            </span>
                            {product.subcategory && (
                              <span className="text-[10px] font-bold text-slate-400 ml-2">
                                {product.subcategory.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {(product as any).discountPrice ? (
                          <span className="flex items-center gap-1">
                            <span className="text-sm font-black text-amber-600">
                              {Number(
                                (product as any).discountPrice
                              ).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-0.5">
                              {t.common.uzs}
                            </span>
                            <span className="text-xs text-slate-400 line-through ml-1">
                              {product.price.toLocaleString()}
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {product.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              {t.common.uzs}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-semibold text-slate-500">
                          {product.costPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp
                            className={clsx(
                              "w-3 h-3",
                              margin > 20
                                ? "text-emerald-500"
                                : margin > 5
                                  ? "text-amber-500"
                                  : "text-rose-500"
                            )}
                          />
                          <span
                            className={clsx(
                              "text-xs font-black",
                              margin > 20
                                ? "text-emerald-600"
                                : margin > 5
                                  ? "text-amber-600"
                                  : "text-rose-600"
                            )}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {stockAdjId === product.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Quick delta buttons */}
                            {[-10, -5, -1].map((d) => (
                              <button key={d} onClick={() => handleAdjustStock(product.id, d)}
                                disabled={stockSaving || product.stock + d < 0}
                                className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-xs font-black hover:bg-rose-100 disabled:opacity-30 transition-all">
                                {d}
                              </button>
                            ))}
                            <input
                              type="number"
                              value={stockDelta}
                              onChange={(e) => setStockDelta(e.target.value)}
                              placeholder="±"
                              className="w-14 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-center bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && stockDelta) {
                                  handleAdjustStock(product.id, parseInt(stockDelta));
                                }
                              }}
                            />
                            {[1, 5, 10].map((d) => (
                              <button key={d} onClick={() => handleAdjustStock(product.id, d)}
                                disabled={stockSaving}
                                className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-black hover:bg-emerald-100 disabled:opacity-30 transition-all">
                                +{d}
                              </button>
                            ))}
                            {stockDelta && (
                              <button onClick={() => handleAdjustStock(product.id, parseInt(stockDelta))}
                                disabled={stockSaving}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-all">
                                OK
                              </button>
                            )}
                            <button onClick={() => { setStockAdjId(null); setStockDelta(""); }}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setStockAdjId(product.id); setStockDelta(""); }}
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase hover:scale-105 transition-all cursor-pointer",
                              product.stock <= 0
                                ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-900/50"
                                : product.stock <= 5
                                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-900/50"
                                  : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/50"
                            )}
                          >
                            <div className={clsx("w-1.5 h-1.5 rounded-full",
                              product.stock <= 0 ? "bg-rose-500 animate-pulse" : product.stock <= 5 ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                            {product.stock} {unitLabel}
                            {product.stock <= 5 && product.stock > 0 && <AlertTriangle className="w-3 h-3 ml-0.5" />}
                          </button>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setStockAdjId(product.id); setStockDelta(""); }}
                            title={t.products?.stock || 'Stock'}
                            className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-all"
                          >
                            <Warehouse className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {response && response.pages > 1 && (
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t.products.page} {response.page} {t.products.of} {response.pages} • {response.total} {t.products.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, response.pages) }, (_, i) => {
                const pg =
                  Math.max(1, Math.min(response.pages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={clsx(
                      "w-9 h-9 rounded-xl text-xs font-black transition-all",
                      pg === page
                        ? "premium-gradient text-white shadow-lg"
                        : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page >= response.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[95vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {editProduct
                    ? t.products?.editProduct || "Edit Product"
                    : t.products?.addProduct || "Add Product"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-8"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Image */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.superadmin.coverImage || "Product Image"}
                    </label>
                    <ImageUploader
                      value={form.imageUrl}
                      onChange={(url) =>
                        setForm((f) => ({ ...f, imageUrl: url }))
                      }
                      onRemove={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      label={
                        t.superadmin.uploadCoverImage || "Upload product image"
                      }
                      className="h-44"
                    />
                  </div>

                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products?.name || "Name"} *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      placeholder={t.products.name}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products.categories}
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          categoryId: e.target.value,
                          subcategoryId: "",
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    >
                      <option value="">{t.products.noCategory}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products.subcategory}
                    </label>
                    <select
                      value={form.subcategoryId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          subcategoryId: e.target.value,
                        }))
                      }
                      disabled={
                        !form.categoryId || formSubcategories.length === 0
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50"
                    >
                      <option value="">{t.products.noSubcategory}</option>
                      {formSubcategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products?.price || "Price"} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      placeholder="0"
                    />
                  </div>

                  {/* Cost Price */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products?.costPrice || "Cost Price"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.costPrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, costPrice: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      placeholder="0"
                    />
                  </div>

                  {/* Discount Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t.products.discountPrice}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.discountPrice}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          discountPrice: e.target.value,
                        }))
                      }
                      placeholder="Aksiya narxi..."
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm transition-all"
                    />
                  </div>

                  {/* Promo toggle */}
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {t.products.promoProduct}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {t.products.promoProductDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, isPromo: !p.isPromo }))
                      }
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${form.isPromo ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPromo ? "right-1" : "left-1"}`}
                      />
                    </button>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products?.stock || "Stock"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stock: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      placeholder="0"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> {t.products?.unit || "Unit"}
                    </label>
                    {units.length > 0 ? (
                      <select
                        value={form.unitId || form.unit}
                        onChange={(e) => {
                          const selected = units.find(
                            (u) => u.id === e.target.value
                          );
                          setForm((f) => ({
                            ...f,
                            unitId: e.target.value,
                            unit: selected?.symbol || selected?.name || "pcs",
                          }));
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      >
                        <option value="">{t.products.customUnit}</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.symbol})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={form.unit}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, unit: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        placeholder="pcs, kg, l..."
                      />
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products?.sku || "SKU"}
                    </label>
                    <input
                      value={form.sku}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sku: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono"
                      placeholder="SKU-001"
                    />
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, isActive: !f.isActive }))
                      }
                      className={clsx(
                        "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                        form.isActive
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-4 h-4 bg-white rounded-full shadow-lg transition-all",
                          form.isActive && "translate-x-6"
                        )}
                      />
                    </button>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                      {form.isActive ? t.products.active : t.products.inactive}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t.products?.description || "Description"}
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                      placeholder={t.products.description}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 premium-button justify-center"
                  >
                    {saving ? t.common.loading : t.common.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {t.common.delete}
                </h3>
                <p className="text-sm text-slate-500">
                  {t.products?.deleteConfirm || "Are you sure?"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all"
                >
                  {t.common.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Manager */}
      <AnimatePresence>
        {showCatManager && (
          <CategoryManager
            categories={categories}
            onClose={() => setShowCatManager(false)}
            onRefresh={fetchCategories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
