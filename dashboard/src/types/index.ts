export const RoleType = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  SALES: "SALES",
  DELIVERY: "DELIVERY",
  CUSTOM: "CUSTOM",
} as const;
export type RoleType = (typeof RoleType)[keyof typeof RoleType];

export const SubscriptionPlan = {
  FREE: "FREE",
  START: "START",
  PRO: "PRO",
  PREMIUM: "PREMIUM",
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  LOCKED: "LOCKED",
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const OrderStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export type DealerStatus = "HEALTHY" | "HAS_DEBT" | "DEBT_EXCEEDED" | "BLOCKED";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialExpiresAt: string;
}

export interface User {
  id: string;
  companyId: string;
  branchId?: string;
  phone: string;
  fullName?: string;
  photoUrl?: string;
  roleType: RoleType;
  customRoleId?: string;
  isActive: boolean;
  language: string;
  role?: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface Dealer {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  phone: string;
  address?: string;
  creditLimit: number;
  currentDebt?: number;
  status?: DealerStatus;
  branch?: Branch;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  subcategories?: Subcategory[];
  _count?: { products: number };
}

export interface Subcategory {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
}

export interface Unit {
  id: string;
  companyId: string | null;
  name: string;
  symbol: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  costPrice: number;
  price: number;
  stock: number;
  unit: string;
  unitId?: string;
  categoryId?: string;
  subcategoryId?: string;
  isActive: boolean;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  unitRef?: { id: string; name: string; symbol: string } | null;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductStats {
  totalCount: number;
  activeCount: number;
  inventoryValue: number;
  totalRevenuePotential: number;
  avgMargin: number;
}

export interface TariffPlan {
  id: string;
  planKey: string;
  order: number;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  price: string;
  priceMonthly: string;
  priceYearly: string;
  featuresEn: string[];
  featuresUz: string[];
  featuresRu: string[];
  isPopular: boolean;
  isActive: boolean;
  maxBranches: number;
  maxUsers: number;
  maxDealers: number;
  maxProducts: number;
  allowCustomBot: boolean;
  allowWebStore: boolean;
  allowAnalytics: boolean;
  allowNotifications: boolean;
  allowMultiCompany: boolean;
  allowBulkImport: boolean;
  trialDays: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export interface Order {
  id: string;
  companyId: string;
  dealerId: string;
  branchId: string;
  totalAmount: number;
  totalCost: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  dealer?: Dealer;
  branch?: Branch;
}

export interface LedgerTransaction {
  id: string;
  companyId: string;
  dealerId?: string;
  type: "ORDER" | "PAYMENT" | "ADJUSTMENT" | "EXPENSE" | "REFUND";
  amount: number;
  reference?: string;
  note?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  companyId: string;
  dealerId: string;
  amount: number;
  method: string;
  reference?: string;
  createdAt: string;
  dealer?: Dealer;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: "INFO" | "ALERT" | "PAYMENT";
  createdAt: string;
}
