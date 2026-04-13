"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Package,
  Phone,
  ChevronRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  sku?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: { id: string; name: string };
}

interface CompanyInfo {
  name: string;
  slug: string;
  logo?: string;
  telegram?: string;
  instagram?: string;
  website?: string;
}

interface Dealer {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  currentDebt: number;
  branchId: string;
}

type OrderState = "idle" | "loading" | "success" | "error";

function normalizeApiBaseUrl(rawUrl?: string) {
  const envValue = (rawUrl || "").trim();
  const inBrowser = typeof window !== "undefined";
  const host = inBrowser ? window.location.hostname : "";
  const isProdHost =
    host === "supplio.uz" ||
    host.endsWith(".supplio.uz") ||
    host === "www.supplio.uz";
  const isLocalEnvValue =
    !envValue || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(envValue);

  const fallback = isProdHost
    ? "https://api.supplio.uz"
    : "http://localhost:5000";
  const value = (isLocalEnvValue ? fallback : envValue).replace(/\/+$/, "");
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

export default function StorePage() {
  const params = useParams();
  const companySlug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [isIdentified, setIsIdentified] = useState(false);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [orderError, setOrderError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  const API = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  const imgUrl = (url?: string | null) =>
    !url ? "" : url.startsWith("http") ? url : `${API}${url}`;
  const botUrl = company?.telegram
    ? `https://t.me/${company.telegram.replace("@", "")}`
    : "https://t.me";

  useEffect(() => {
    const isTg =
      typeof window !== "undefined" &&
      Boolean((window as any)?.Telegram?.WebApp);
    setIsTelegramWebApp(isTg);
    if (!isTg) {
      setIsIdentified(true);
    }
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const [productsRes, companyRes, categoriesRes] = await Promise.all([
          fetch(`${API}/api/store/${companySlug}/products`),
          fetch(`${API}/api/store/${companySlug}/info`),
          fetch(`${API}/api/store/${companySlug}/categories`),
        ]);

        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
        if (companyRes.ok) {
          setCompany(await companyRes.json());
        } else {
          const err = await companyRes.json();
          setError(err.message || "Store unavailable");
        }
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
      } catch {
        setError("Failed to load store. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [companySlug, API]);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCategory =
      !selectedCategory || p.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  const updateCart = (productId: string, delta: number) => {
    if (!isTelegramWebApp) return;
    setCart((prev) => {
      const next = new Map(prev);
      const current = next.get(productId) || 0;
      const newQty = current + delta;
      if (newQty <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, newQty);
      }
      return next;
    });
  };

  const totalItems = Array.from(cart.values()).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const totalPrice = Array.from(cart.entries()).reduce((sum, [id, qty]) => {
    const p = products.find((p) => p.id === id);
    return sum + (p?.price || 0) * qty;
  }, 0);

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTelegramWebApp) {
      setPhoneError("Buyurtma berish uchun Telegram botga kiring.");
      return;
    }
    setPhoneError("");
    try {
      const res = await fetch(`${API}/api/store/${companySlug}/identify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-supplio-channel": "telegram-webapp",
        },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        setDealer(data);
        setIsIdentified(true);
      } else {
        const err = await res.json();
        setPhoneError(
          err.message || "Dealer not found. Please check your number."
        );
      }
    } catch {
      setPhoneError("Connection error. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!isTelegramWebApp) {
      setOrderState("error");
      setOrderError("Buyurtma berish uchun Telegram botdan foydalaning.");
      return;
    }
    if (!dealer) return;
    setOrderState("loading");
    setOrderError("");
    try {
      const items = Array.from(cart.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));
      const res = await fetch(`${API}/api/store/${companySlug}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-supplio-channel": "telegram-webapp",
        },
        body: JSON.stringify({ dealerId: dealer.id, items }),
      });
      if (res.ok) {
        const order = await res.json();
        setOrderId(order.id?.slice(0, 8)?.toUpperCase() || "");
        setOrderState("success");
        setCart(new Map());
      } else {
        const err = await res.json();
        setOrderError(err.message || "Order failed. Please try again.");
        setOrderState("error");
      }
    } catch {
      setOrderError("Connection error. Please try again.");
      setOrderState("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Store Unavailable
          </h2>
          <p className="text-slate-500 text-sm">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            Go to Supplio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
            </Link>
            <div className="flex items-center gap-3">
              {company?.logo ? (
                <img
                  src={imgUrl(company.logo)}
                  alt={company.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  {company?.name || companySlug}
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Product Catalog
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {company?.telegram && (
              <a
                href={`https://t.me/${company.telegram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold items-center gap-2 hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Telegram
              </a>
            )}
            {totalItems > 0 && (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {!isTelegramWebApp && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-900">
                Bu sahifa faqat katalog rejimida ishlayapti
              </p>
              <p className="text-xs text-amber-700">
                Narxlar va mahsulotlarni ko'rasiz. Buyurtma berish uchun
                Telegram botga kiring.
              </p>
            </div>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              Botni ochish
            </a>
          </div>
        )}

        {/* Dealer info banner */}
        {dealer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900 text-sm">
                  {dealer.name}
                </p>
                <p className="text-xs text-emerald-600">
                  Debt: <b>{dealer.currentDebt.toLocaleString()} UZS</b>
                  {dealer.creditLimit > 0 && (
                    <>
                      {" "}
                      · Limit: <b>{dealer.creditLimit.toLocaleString()} UZS</b>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsIdentified(false);
                setDealer(null);
                setPhone("");
              }}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
            >
              Change
            </button>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                !selectedCategory
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Package className="w-16 h-16 text-slate-200 mx-auto" />
            <p className="text-lg font-semibold text-slate-400">
              No products found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filtered.map((product, i) => {
                const qty = cart.get(product.id) || 0;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="h-44 bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={imgUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-14 h-14 text-slate-200 group-hover:text-blue-200 transition-colors" />
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="px-3 py-1 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                            Out of stock
                          </span>
                        </div>
                      )}
                      {product.stock > 0 && product.stock <= 10 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                            {product.stock} left
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        {product.sku && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {product.sku}
                          </p>
                        )}
                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-lg font-extrabold text-slate-900 tracking-tight">
                            {product.price.toLocaleString()}
                            <span className="text-xs font-medium text-slate-400 ml-1">
                              UZS / {product.unit}
                            </span>
                          </p>
                        </div>
                      </div>

                      {isTelegramWebApp && qty > 0 ? (
                        <div className="flex items-center justify-between bg-blue-50 rounded-xl p-1">
                          <button
                            onClick={() => updateCart(product.id, -1)}
                            className="w-9 h-9 rounded-lg bg-white border border-blue-100 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-black text-blue-700">
                            {qty} {product.unit}
                          </span>
                          <button
                            onClick={() => updateCart(product.id, 1)}
                            disabled={product.stock <= qty}
                            className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isTelegramWebApp ? (
                        <button
                          onClick={() => updateCart(product.id, 1)}
                          disabled={product.stock <= 0}
                          className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to cart
                        </button>
                      ) : (
                        <a
                          href={botUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          Buyurtma uchun botga o'ting
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Cart CTA */}
      {isTelegramWebApp && totalItems > 0 && !isCheckoutOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-5"
        >
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-between shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.97] transition-all"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              <span>{totalPrice.toLocaleString()} UZS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">{totalItems} items</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Identification Screen */}
      <AnimatePresence>
        {isTelegramWebApp && !isIdentified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-white p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-600/30">
                  <Package className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome!
                </h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Enter your phone number to access the{" "}
                  {company?.name || "store"} catalog
                </p>
              </div>
              <form onSubmit={handleIdentify} className="space-y-4">
                <div>
                  <input
                    required
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                    }}
                    className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-center ${phoneError ? "border-rose-400 focus:border-rose-400" : "border-slate-200 focus:border-blue-500"}`}
                  />
                  {phoneError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-rose-600 font-medium flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {phoneError}
                    </motion.p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                >
                  Access Catalog
                </button>
              </form>
              <p className="text-xs text-slate-400">
                Powered by{" "}
                <Link
                  href="/"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Supplio
                </Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {isTelegramWebApp && isCheckoutOpen && (
          <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Success State */}
              {orderState === "success" ? (
                <div className="p-10 text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Order Placed!
                    </h3>
                    {orderId && (
                      <p className="text-slate-500 text-sm">Order #{orderId}</p>
                    )}
                    <p className="text-slate-500 text-sm mt-2">
                      Your order has been received and will be processed
                      shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setOrderState("idle");
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-slate-600" />
                      <h3 className="text-xl font-bold text-slate-900">
                        Checkout
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {Array.from(cart.entries()).map(([id, qty]) => {
                        const product = products.find((p) => p.id === id);
                        if (!product) return null;
                        return (
                          <div
                            key={id}
                            className="flex gap-4 p-4 bg-slate-50 rounded-2xl"
                          >
                            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100">
                              <Package className="w-7 h-7 text-slate-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateCart(id, -1)}
                                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-all"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-slate-700 w-8 text-center">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => updateCart(id, 1)}
                                  disabled={product.stock <= qty}
                                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all disabled:opacity-40"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <span className="text-xs text-slate-400 ml-1">
                                  {product.unit}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-slate-900 text-sm">
                                {(product.price * qty).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-400">UZS</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">
                          Items:
                        </span>
                        <span className="font-bold text-slate-700">
                          {totalItems}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-900">Total:</span>
                        <span className="text-blue-600 font-black text-lg">
                          {totalPrice.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>

                    {/* Credit info */}
                    {dealer && (
                      <div
                        className={`p-4 rounded-2xl space-y-2 ${totalPrice > (dealer.creditLimit || 0) - (dealer.currentDebt || 0) && dealer.creditLimit > 0 ? "bg-rose-50 border border-rose-100" : "bg-blue-50 border border-blue-100"}`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-blue-700">
                          <ShieldCheck className="w-4 h-4" /> Credit Status
                        </div>
                        <div className="text-xs text-blue-600/80 space-y-1">
                          <p>
                            Current debt:{" "}
                            <b>{dealer.currentDebt.toLocaleString()} UZS</b>
                          </p>
                          {dealer.creditLimit > 0 && (
                            <p>
                              Available credit:{" "}
                              <b>
                                {Math.max(
                                  0,
                                  dealer.creditLimit - dealer.currentDebt
                                ).toLocaleString()}{" "}
                                UZS
                              </b>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {orderState === "error" && orderError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700 font-medium">
                          {orderError}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderState === "loading" || totalItems === 0}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {orderState === "loading" ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Confirm Order
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
