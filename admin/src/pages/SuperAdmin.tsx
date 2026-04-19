import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck,
  Database,
  Bell,
  Calendar,
  Monitor,
  Server,
  AlertTriangle,
  RotateCcw,
  Lock,
  Table,
  Activity,
  Loader2,
  Trash2,
  ChevronRight,
  Send,
  Save,
  Globe,
  User,
  Info,
  FileCode,
  Layout,
  CreditCard,
  Check,
  X,
  Edit,
  BarChart3,
  Newspaper,
  Plus,
  TrendingUp,
  BadgeCheck,
  Download,
  Eye,
  Bot,
  CheckCircle2,
  Circle,
  XCircle,
  Power,
  KeyRound,
  ImageIcon,
  MessageSquare,
  UserPlus,
  Users,
  Star,
  Pencil,
  LifeBuoy,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import { useScrollLock } from "../utils/useScrollLock";
import { useAuthStore } from "../store/authStore";
import { dashboardTranslations } from "../i18n/translations";
import { motion, AnimatePresence } from "framer-motion";
import api, { BACKEND_BASE_URL } from "../services/api";
import { useSearchParams } from "react-router-dom";
import { toast } from "../utils/toast";
import { format } from "date-fns";
import { uz, ru, enUS, tr } from "date-fns/locale";
import type { Locale } from "date-fns";
import { formatPhoneNumber, unformatPhoneNumber } from "../utils/formatters";
import ImageUploader from "../components/ImageUploader";

const BACKEND = BACKEND_BASE_URL;
const LANDING_PREVIEW_URL =
  import.meta.env.VITE_LANDING_URL ||
  (typeof window !== "undefined"
    ? window.location.origin.replace("://admin.", "://")
    : "/");

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

type TabId =
  | "overview"
  | "settings"
  | "backups"
  | "activities"
  | "editor"
  | "news"
  | "leads"
  | "tickets"
  | "tariffs"
  | "cms"
  | "testimonials"
  | "distributors"
  | "notify"
  | "upgrades"
  | "support"
  | "bots"
  | "team";

const validTabs: TabId[] = [
  "overview",
  "settings",
  "backups",
  "activities",
  "editor",
  "news",
  "leads",
  "tickets",
  "tariffs",
  "testimonials",
  "team",
  "distributors",
  "notify",
  "upgrades",
  "bots",
];

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-600/10 text-blue-600 border-blue-200 dark:border-blue-800",
  CONTACTED:
    "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
  QUALIFIED:
    "bg-emerald-600/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  CONVERTED:
    "bg-violet-600/10 text-violet-600 border-violet-200 dark:border-violet-800",
  REJECTED: "bg-rose-600/10 text-rose-600 border-rose-200 dark:border-rose-800",
  CLOSED:
    "bg-slate-200 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10",
};

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  info?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface NewsItem {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  titleTr?: string;
  titleUzCyr?: string;
  excerptUz?: string;
  excerptRu?: string;
  excerptEn?: string;
  excerptTr?: string;
  excerptUzCyr?: string;
  contentUz: string;
  contentRu: string;
  contentEn: string;
  contentTr?: string;
  contentUzCyr?: string;
  slugUz: string;
  slugRu: string;
  slugEn: string;
  slugTr?: string;
  slugUzCyr?: string;
  image?: string;
  viewCount?: number;
  isPublished: boolean;
  createdAt: string;
}

interface TariffPlan {
  id: string;
  planKey: string;
  order: number;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  nameTr?: string;
  nameUzCyr?: string;
  price: string;
  priceMonthly: string;
  priceYearly: string;
  isActive: boolean;
  isPopular: boolean;
  featuresUz: string[];
  featuresRu: string[];
  featuresEn: string[];
  featuresTr?: string[];
  featuresUzCyr?: string[];
  maxBranches: number;
  maxUsers: number;
  maxCustomBots: number;
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

interface Testimonial {
  id: string;
  name: string;
  company?: string;
  roleTitle?: string;
  contentUz: string;
  contentRu: string;
  contentEn: string;
  contentTr?: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface GlobalSettings {
  telegram?: string;
  defaultTrialDays?: number;
  maintenanceMode?: boolean;
  superAdminPhone?: string;
  newsEnabled?: boolean;
  termsUz?: string;
  termsRu?: string;
  termsEn?: string;
  termsUzCyr?: string;
  privacyUz?: string;
  privacyRu?: string;
  privacyEn?: string;
  privacyUzCyr?: string;
  contractUz?: string;
  contractRu?: string;
  contractEn?: string;
  contractUzCyr?: string;
}

interface LandingContent {
  heroTitleUz: string;
  heroTitleRu: string;
  heroTitleEn: string;
  heroTitleTr: string;
  heroSubtitleUz: string;
  heroSubtitleRu: string;
  heroSubtitleEn: string;
  heroSubtitleTr: string;
  heroBadgeUz: string;
  heroBadgeRu: string;
  heroBadgeEn: string;
  heroBadgeTr: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactAddressUrl: string;
  socialTelegram: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialTwitter: string;
  supportTelegramUsername: string;
  footerDescUz: string;
  footerDescRu: string;
  footerDescEn: string;
  footerDescTr: string;
  heroGlobalBannerUz?: string;
  heroGlobalBannerRu?: string;
  heroGlobalBannerEn?: string;
  heroGlobalBannerTr?: string;
}

interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string | null;
  senderType: "SUPER_ADMIN" | "DISTRIBUTOR";
  message: string;
  imageUrl?: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  companyId: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  lastReplyAt: string;
  createdAt: string;
  company?: { name: string };
  messages: SupportMessage[];
}

interface BackupItem {
  name: string;
  size: number;
  createdAt: string;
}

interface Distributor {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialExpiresAt: string;
  createdAt: string;
  users: { id: string; phone: string; fullName?: string; isActive: boolean }[];
  _count: { dealers: number; orders: number; users: number };
}

interface DistributorForm {
  companyName: string;
  slug: string;
  phone: string;
  fullName: string;
  password: string;
  subscriptionPlan: string;
  trialDays: number;
}

const emptyDistForm: DistributorForm = {
  companyName: "",
  slug: "",
  phone: "",
  fullName: "",
  password: "",
  subscriptionPlan: "FREE",
  trialDays: 14,
};

interface ActivityLog {
  id: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown> | null;
  userId?: string;
  ip?: string | null;
  createdAt: string;
  user?: { phone: string; fullName?: string };
}

interface OverviewSummary {
  totalCompanies: number;
  totalLeads: number;
  openTickets: number;
  pendingUpgrades: number;
  activeSubscriptions: number;
  collectedPayments: number;
  subscriptionRevenue: number;
}

interface ServerMetric {
  cpuUsage: number;
  ramUsage: number;
  activeUsers: number;
  timestamp: string;
}

const locales: Record<string, Locale> = { uz, ru, en: enUS, tr };

function formatPlanMonthlyPrice(value: unknown): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : "0";
  }

  if (typeof value !== "string") return "0";

  // Keep only digits and decimal separator, then normalize comma to dot.
  const normalized = value.replace(/[^\d.,-]/g, "").replace(/,/g, ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : "0";
}

export default function SuperAdmin() {
  const { language } = useAuthStore();
  const t = dashboardTranslations[language];
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: TabId =
    tabParam && validTabs.includes(tabParam as TabId)
      ? (tabParam as TabId)
      : "overview";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    const nextTab: TabId =
      tabParam && validTabs.includes(tabParam as TabId)
        ? (tabParam as TabId)
        : "overview";
    setActiveTab(nextTab);
  }, [tabParam]);

  const [authorized, setAuthorized] = useState(false);
  const [rootPass, setRootPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [tariffs, setTariffs] = useState<TariffPlan[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialForm, setTestimonialForm] = useState<Partial<Testimonial>>({
    name: "",
    company: "",
    roleTitle: "",
    contentUz: "",
    contentRu: "",
    contentEn: "",
    contentTr: "",
    rating: 5,
    isActive: true,
    order: 0,
  });
  const [editingTestimonialId, setEditingTestimonialId] = useState<
    string | null
  >(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  // Team members
  const [teamMembers, setTeamMembers] = useState<
    {
      id: string;
      name: string;
      roleUz: string;
      roleRu: string;
      roleEn: string;
      roleTr: string;
      bioUz: string;
      bioRu: string;
      bioEn: string;
      bioTr: string;
      avatar?: string;
      order: number;
      isActive: boolean;
    }[]
  >([]);
  const [teamForm, setTeamForm] = useState({
    name: "",
    roleUz: "",
    roleRu: "",
    roleEn: "",
    roleTr: "",
    bioUz: "",
    bioRu: "",
    bioEn: "",
    bioTr: "",
    order: 0,
    isActive: true,
  });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [landingContent, setLandingContent] = useState<LandingContent>({
    heroTitleUz: "",
    heroTitleRu: "",
    heroTitleEn: "",
    heroTitleTr: "",
    heroSubtitleUz: "",
    heroSubtitleRu: "",
    heroSubtitleEn: "",
    heroSubtitleTr: "",
    heroBadgeUz: "",
    heroBadgeRu: "",
    heroBadgeEn: "",
    heroBadgeTr: "",
    contactPhone: "+998 (90) 123-45-67",
    contactEmail: "support@supplio.uz",
    contactAddress: "",
    contactAddressUrl: "",
    socialTelegram: "https://t.me/supplio_support",
    socialInstagram: "https://www.instagram.com/supplio__app/",
    socialLinkedin: "https://www.linkedin.com/company/supplioapp",
    socialTwitter: "https://x.com/supplioapp",
    supportTelegramUsername: "@supplio_support",
    footerDescUz: "",
    footerDescRu: "",
    footerDescEn: "",
    footerDescTr: "",
  });
  const [cmsLoading, setCmsLoading] = useState(false);

  const [editorData, setEditorData] = useState({
    model: "Company",
    id: "",
    field: "",
    value: "",
  });

  const [metrics, setMetrics] = useState<ServerMetric[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<
    Array<{
      id: string;
      companyId: string;
      companyName: string;
      currentPlan: string;
      requestedPlan?: string;
      ownerPhone: string;
      ownerName?: string;
      dealersCount: number;
      usersCount: number;
      branchesCount: number;
      productsCount: number;
      status: string;
      note?: string;
      createdAt: string;
    }>
  >([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [overviewSummary, setOverviewSummary] =
    useState<OverviewSummary | null>(null);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(
    null
  );
  const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<
    (() => Promise<void>) | null
  >(null);

  // Modals handle
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [editingItem, setEditingItem] = useState<
    NewsItem | Lead | TariffPlan | null
  >(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");

  const [adminBots, setAdminBots] = useState<
    Array<{
      id: string;
      botName: string | null;
      description?: string | null;
      username: string | null;
      isActive: boolean;
      status: string;
      createdAt: string;
      company: { id: string; name: string; slug: string };
    }>
  >([]);
  const [botActionLoading, setBotActionLoading] = useState<
    Record<string, string>
  >({});
  const [botEditModal, setBotEditModal] = useState<{
    id: string;
    token: string;
    botName: string;
    description: string;
    isActive: boolean;
  } | null>(null);
  const [botDeleteConfirm, setBotDeleteConfirm] = useState<string | null>(null);
  const [botCreateModal, setBotCreateModal] = useState<{
    companyId: string;
    token: string;
    botName: string;
    description: string;
  } | null>(null);
  const [botCreateLoading, setBotCreateLoading] = useState(false);
  const [botsReloadingAll, setBotsReloadingAll] = useState(false);

  const [newsLangTab, setNewsLangTab] = useState<
    "Uz" | "En" | "Ru" | "Tr" | "UzCyr"
  >("Uz");

  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    titleUz: "",
    titleRu: "",
    titleEn: "",
    titleTr: "",
    titleUzCyr: "",
    excerptUz: "",
    excerptRu: "",
    excerptEn: "",
    excerptTr: "",
    excerptUzCyr: "",
    contentUz: "",
    contentRu: "",
    contentEn: "",
    contentTr: "",
    contentUzCyr: "",
    image: "",
    isPublished: true,
    slugUz: "",
    slugRu: "",
    slugEn: "",
    slugTr: "",
    slugUzCyr: "",
  });

  const [tariffForm, setTariffForm] = useState<Partial<TariffPlan>>({
    planKey: "",
    nameUz: "",
    nameRu: "",
    nameEn: "",
    nameTr: "",
    nameUzCyr: "",
    price: "",
    priceMonthly: "0",
    priceYearly: "0",
    featuresUz: [],
    featuresRu: [],
    featuresEn: [],
    featuresTr: [],
    featuresUzCyr: [],
    isActive: true,
    isPopular: false,
    order: 0,
    maxBranches: 1,
    maxUsers: 5,
    maxCustomBots: 0,
    maxDealers: 100,
    maxProducts: 500,
    trialDays: 14,
    allowCustomBot: false,
    allowWebStore: true,
    allowAnalytics: false,
    allowNotifications: true,
    allowMultiCompany: false,
    allowBulkImport: false,
  });

  const [leadForm, setLeadForm] = useState<Partial<Lead>>({
    fullName: "",
    phone: "",
    info: "",
    status: "NEW",
  });
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Distributors tab
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [distSearch, setDistSearch] = useState("");
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [distForm, setDistForm] = useState<DistributorForm>(emptyDistForm);
  const [distSaving, setDistSaving] = useState(false);
  const [subscriptionTarget, setSubscriptionTarget] =
    useState<Distributor | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState("");
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [overviewExporting, setOverviewExporting] = useState(false);
  const [exportingDistId, setExportingDistId] = useState<string | null>(null);

  const refreshBackups = useCallback(async () => {
    const res = await api.get("/super/backups");
    setBackups(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
  }, []);

  const downloadBackup = useCallback(async (name: string) => {
    const res = await api.get("/super/backups/download", {
      params: { name },
      responseType: "blob",
    });
    const contentDisposition = res.headers["content-disposition"] as
      | string
      | undefined;
    const matchedName = contentDisposition?.match(
      /filename="?([^"]+)"?$/i
    )?.[1];
    const fileName = matchedName ? decodeURIComponent(matchedName) : name;
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }, []);

  const downloadBlobFile = useCallback(
    async (url: string, fileName: string, params?: Record<string, string>) => {
      const res = await api.get(url, {
        params,
        responseType: "blob",
      });
      const contentDisposition = res.headers["content-disposition"] as
        | string
        | undefined;
      const matchedName = contentDisposition?.match(
        /filename="?([^"]+)"?$/i
      )?.[1];
      const finalName = matchedName
        ? decodeURIComponent(matchedName)
        : fileName;
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
    []
  );

  const openSubscriptionModal = useCallback((dist: Distributor) => {
    const currentExpiry = dist.trialExpiresAt
      ? new Date(dist.trialExpiresAt)
      : new Date();
    const defaultExpiry = new Date(
      Math.max(currentExpiry.getTime(), Date.now())
    );
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);
    setSubscriptionTarget(dist);
    setSubscriptionExpiresAt(defaultExpiry.toISOString().split("T")[0]);
  }, []);

  // Notify distributors tab
  const [notifyForm, setNotifyForm] = useState({
    title: "",
    message: "",
    type: "INFO",
  });
  const [notifyAll, setNotifyAll] = useState(true);
  const [selectedDistIds, setSelectedDistIds] = useState<string[]>([]);
  const [notifySending, setNotifySending] = useState(false);

  // Scroll lock — must be after all modal state declarations
  useScrollLock(
    isNewsModalOpen ||
      isTariffModalOpen ||
      isLeadModalOpen ||
      isDistModalOpen ||
      isConfirmModalOpen ||
      isResetPasswordModalOpen ||
      !!subscriptionTarget
  );

  const getLeadStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return language === "ru"
          ? "Новый"
          : language === "en"
            ? "New"
            : "Yangi";
      case "CONTACTED":
        return language === "ru"
          ? "Связались"
          : language === "en"
            ? "Contacted"
            : "Bog'lanildi";
      case "QUALIFIED":
        return language === "ru"
          ? "Квалифицирован"
          : language === "en"
            ? "Qualified"
            : "Saralandi";
      case "CONVERTED":
        return language === "ru"
          ? "Konvert qilingan"
          : language === "en"
            ? "Converted"
            : "Mijozga aylandi";
      case "REJECTED":
        return language === "ru"
          ? "Отклонён"
          : language === "en"
            ? "Rejected"
            : "Rad etildi";
      default:
        return status;
    }
  };

  const getAttachmentSrc = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BACKEND}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm 5MB dan katta bo'lmasligi kerak");
      return;
    }
    setReplyImageFile(file);
    setReplyImagePreview(URL.createObjectURL(file));
  };

  const appendQuickReply = (text: string) => {
    setReplyMessage((current) => {
      const next = current.trim();
      return next ? `${next}\n${text}` : text;
    });
  };

  const supportQuickReplies = [
    {
      label: "TG support",
      text: `Telegram: ${landingContent.supportTelegramUsername || "@supplio_support"}`,
    },
    {
      label: "Instagram",
      text: `Instagram: ${landingContent.socialInstagram || "@supplio__app"}`,
    },
    {
      label: "LinkedIn",
      text: `LinkedIn: ${landingContent.socialLinkedin || "supplioapp"}`,
    },
  ];

  const paginatedTickets = supportTickets.slice(
    (ticketsPage - 1) * 10,
    ticketsPage * 10
  );
  const ticketTotalPages = Math.max(1, Math.ceil(supportTickets.length / 10));

  const renderPagination = (
    currentPage: number,
    totalItems: number,
    pageSize: number,
    onChange: (page: number) => void
  ) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalPages <= 1) return null;

    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);

    return (
      <div className="flex items-center justify-end gap-2 p-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black disabled:opacity-40"
        >
          Prev
        </button>
        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            className={clsx(
              "min-w-[38px] px-3 py-2 rounded-xl text-xs font-black border",
              page === currentPage
                ? "premium-gradient text-white border-transparent"
                : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  const sendTicketReply = async () => {
    if (!selectedTicket || (!replyMessage.trim() && !replyImageFile)) return;

    try {
      setSendingReply(true);
      let imageUrl: string | undefined;

      if (replyImageFile) {
        const form = new FormData();
        form.append("file", replyImageFile);
        const uploadRes = await api.post("/upload/image", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data?.url;
      }

      const messageText = replyMessage.trim() || " ";
      const res = await api.post(`/support/message/${selectedTicket.id}`, {
        message: messageText,
        imageUrl,
      });

      setSelectedTicket({
        ...selectedTicket,
        messages: [
          ...selectedTicket.messages,
          { ...res.data, imageUrl: res.data?.imageUrl || imageUrl },
        ],
        status: "IN_PROGRESS",
      });
      setReplyMessage("");
      setReplyImageFile(null);
      setReplyImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
    } catch {
      toast.error("Xabar yuborilmadi");
    } finally {
      setSendingReply(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "news") {
        const res = await api.get("/super/news");
        setNews(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } else if (activeTab === "leads") {
        const res = await api.get("/super/leads", {
          params: { page: leadsPage, limit: 10 },
        });
        setLeads(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
        setLeadsTotal(Number(res.data?.total || 0));
      } else if (activeTab === "settings") {
        const [settingsRes, landingRes] = await Promise.all([
          api.get("/super/settings"),
          api.get("/super/landing").catch(() => ({ data: null })),
        ]);
        setSettings(settingsRes.data);
        if (landingRes.data) {
          setLandingContent((prev) => ({ ...prev, ...landingRes.data }));
        }
      } else if (activeTab === "backups") {
        await refreshBackups();
      } else if (activeTab === "activities") {
        const res = await api.get("/super/audit-logs", {
          params: { page: activitiesPage, limit: 100 },
        });
        setActivities(
          Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
        );
        setActivitiesTotal(Number(res.data?.total || 0));
      } else if (activeTab === "tariffs") {
        const res = await api.get("/super/tariffs");
        setTariffs(
          Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
        );
      } else if (activeTab === "testimonials") {
        const res = await api.get("/super/testimonials");
        setTestimonials(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === "team") {
        const res = await api.get("/super/team");
        setTeamMembers(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === "overview") {
        const [metricsRes, summaryRes] = await Promise.all([
          api.get("/super/metrics"),
          api.get("/super/overview-summary"),
        ]);
        setMetrics(metricsRes.data);
        setOverviewSummary(summaryRes.data);
      } else if (activeTab === "cms") {
        const res = await api.get("/super/landing");
        if (res.data) setLandingContent(res.data);
      } else if (activeTab === "distributors" || activeTab === "notify") {
        const res = await api.get("/super/distributors");
        setDistributors(
          Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
        );
      } else if (activeTab === "upgrades") {
        const res = await api.get("/super/upgrade-requests");
        setUpgradeRequests(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === "bots") {
        const [botsRes, distributorsRes] = await Promise.all([
          api.get("/telegram/admin/bots"),
          api.get("/super/distributors", { params: { page: 1, limit: 200 } }),
        ]);
        setAdminBots(Array.isArray(botsRes.data) ? botsRes.data : []);
        setDistributors(
          Array.isArray(distributorsRes.data)
            ? distributorsRes.data
            : (distributorsRes.data?.items ?? [])
        );
      } else if (activeTab === "tickets") {
        const res = await api.get("/support/all");
        const nextTickets = Array.isArray(res.data) ? res.data : [];
        setSupportTickets(nextTickets);
        setSelectedTicket((current) =>
          current
            ? nextTickets.find((ticket) => ticket.id === current.id) || current
            : current
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, refreshBackups, activitiesPage, leadsPage]);

  const { user } = useAuthStore();

  useEffect(() => {
    // Phase 4 Correction: If user is authenticated as SUPER_ADMIN, bypass the initial root lock
    if (user?.roleType === "SUPER_ADMIN") {
      setAuthorized(true);
    }
  }, [user]);

  useEffect(() => {
    if (authorized) fetchData();
  }, [activeTab, authorized, fetchData]);

  const wrongPassMsg =
    language === "ru"
      ? "Неверный пароль"
      : language === "en"
        ? "Wrong password"
        : language === "tr"
          ? "Yanlış şifre"
          : "Parol noto'g'ri";

  const handleAuth = async () => {
    try {
      await api.post("/super/verify-root", { password: rootPass });
      setAuthorized(true);
      toast.success(t.superadmin.confirm);
    } catch {
      toast.error(wrongPassMsg);
    }
  };

  const requestConfirmation = (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      await api.post("/super/verify-root", { password: confirmPassword });
      if (pendingAction) await pendingAction();
      setIsConfirmModalOpen(false);
      setConfirmPassword("");
      setPendingAction(null);
    } catch {
      toast.error(wrongPassMsg);
    }
  };

  const handleManualReset = async () => {
    requestConfirmation(async () => {
      try {
        setLoading(true);
        await api.post("/demo/reset");
        toast.success(t.superadmin.demoReset);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.common.error;
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    });
  };

  const menuGroups: {
    group: string;
    items: {
      id: TabId;
      label: string;
      icon: React.ElementType;
      color: string;
      bg: string;
      badge?: number;
    }[];
  }[] = [
    {
      group:
        language === "ru" ? "Главное" : language === "en" ? "Main" : "Asosiy",
      items: [
        {
          id: "overview",
          label: t.superadmin.overview,
          icon: ShieldCheck,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
          id: "distributors",
          label: t.superadmin.distributors,
          icon: User,
          color: "text-violet-600",
          bg: "bg-violet-50 dark:bg-violet-900/20",
        },
        {
          id: "upgrades",
          label:
            language === "ru"
              ? "Запросы апгрейда"
              : language === "en"
                ? "Upgrade Requests"
                : "Tarif so'rovlari",
          icon: TrendingUp,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          badge:
            upgradeRequests.filter((r) => r.status === "PENDING").length || 0,
        },
        {
          id: "leads",
          label: "Lidlar",
          icon: UserPlus,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
        },
        {
          id: "tickets",
          label: "Arizalar",
          icon: BadgeCheck,
          color: "text-violet-600",
          bg: "bg-violet-50 dark:bg-violet-900/20",
        },
        {
          id: "bots",
          label:
            language === "ru"
              ? "Telegram боты"
              : language === "en"
                ? "Telegram Bots"
                : "Telegram botlar",
          icon: Bot,
          color: "text-sky-600",
          bg: "bg-sky-50 dark:bg-sky-900/20",
          badge: adminBots.filter((b) => b.isActive).length || 0,
        },
      ],
    },
    {
      group:
        language === "ru"
          ? "Контент"
          : language === "en"
            ? "Content"
            : "Kontent",
      items: [
        {
          id: "news",
          label: t.superadmin.news,
          icon: Newspaper,
          color: "text-indigo-600",
          bg: "bg-indigo-50 dark:bg-indigo-900/20",
        },
        {
          id: "tariffs",
          label: t.superadmin.tariffs,
          icon: CreditCard,
          color: "text-cyan-600",
          bg: "bg-cyan-50 dark:bg-cyan-900/20",
        },
        {
          id: "testimonials",
          label:
            language === "ru"
              ? "Отзывы клиентов"
              : language === "en"
                ? "Testimonials"
                : "Mijozlar sharhlari",
          icon: MessageSquare,
          color: "text-amber-600",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          badge: testimonials.length || undefined,
        },
        {
          id: "team",
          label:
            language === "ru"
              ? "Команда"
              : language === "en"
                ? "Team"
                : "Jamoa a'zolari",
          icon: Users,
          color: "text-indigo-600",
          bg: "bg-indigo-50 dark:bg-indigo-900/20",
          badge: teamMembers.length || undefined,
        },
        {
          id: "notify",
          label: t.superadmin.notifyTab,
          icon: Bell,
          color: "text-orange-600",
          bg: "bg-orange-50 dark:bg-orange-900/20",
        },
      ],
    },
    {
      group:
        language === "ru" ? "Система" : language === "en" ? "System" : "Tizim",
      items: [
        {
          id: "activities",
          label: t.superadmin.recentLogs,
          icon: Activity,
          color: "text-rose-600",
          bg: "bg-rose-50 dark:bg-rose-900/20",
        },
        {
          id: "backups",
          label: t.superadmin.backups,
          icon: Database,
          color: "text-amber-600",
          bg: "bg-amber-50 dark:bg-amber-900/20",
        },
        {
          id: "settings",
          label: t.superadmin.settings,
          icon: Globe,
          color: "text-slate-600",
          bg: "bg-slate-100 dark:bg-slate-800",
        },
        {
          id: "editor",
          label: t.superadmin.editor,
          icon: FileCode,
          color: "text-violet-600",
          bg: "bg-violet-50 dark:bg-violet-900/20",
        },
      ],
    },
  ];

  const activeItem = menuGroups
    .flatMap((g) => g.items)
    .find((i) => i.id === activeTab);

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-20 px-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-8 border border-blue-600/20 shadow-xl shadow-blue-600/5">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tight">
          {t.superadmin.securityPrompt}
        </h1>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-bold">
          {t.superadmin.superAdminOnly}
        </p>

        <div className="w-full max-w-xs space-y-4">
          <input
            type="password"
            placeholder={t.superadmin.passwordLabel}
            value={rootPass}
            onChange={(e) => setRootPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 focus:border-blue-600 transition-all text-center text-xl font-black tracking-[1em]"
          />
          <button
            onClick={handleAuth}
            className="w-full py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            {t.superadmin.confirm}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-5">
          <div
            className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
              activeItem?.bg || "bg-blue-600"
            )}
          >
            {activeItem ? (
              <activeItem.icon
                className={clsx(
                  "w-7 h-7",
                  activeItem.color.includes("text-")
                    ? activeItem.color
                    : "text-white"
                )}
              />
            ) : (
              <ShieldCheck className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              {activeItem?.label || t.superadmin.systemControl}
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              {activeTab === "overview"
                ? t.superadmin.systemControlDesc
                : `${t.superadmin.systemControl} • ${activeItem?.label}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleManualReset}
            className="px-5 py-3 bg-rose-600/5 text-rose-600 border border-rose-600/10 rounded-xl flex items-center gap-2.5 font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> {t.superadmin.demoReset}
          </button>
          {activeTab === "overview" && (
            <button
              onClick={async () => {
                try {
                  setOverviewExporting(true);
                  await downloadBlobFile(
                    "/super/overview/export",
                    `SUPPLIO_OVERVIEW_${new Date().toISOString().split("T")[0]}.xlsx`
                  );
                } catch {
                  toast.error(t.common.error);
                } finally {
                  setOverviewExporting(false);
                }
              }}
              disabled={overviewExporting}
              className="px-5 py-3 bg-slate-900 text-white rounded-xl flex items-center gap-2.5 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm disabled:opacity-60"
            >
              {overviewExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              Excel
            </button>
          )}
          <button className="px-6 py-3 premium-gradient text-white rounded-xl flex items-center gap-2.5 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all active:scale-95">
            <Send className="w-4 h-4" /> {t.superadmin.globalNotifyBtn}
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex-1 min-w-0">
          {/* Section header */}
          {activeItem && (
            <div className="flex items-center gap-3 mb-6">
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  activeItem.bg
                )}
              >
                <activeItem.icon
                  className={clsx("w-5 h-5", activeItem.color)}
                />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {activeItem.label}
                </h2>
              </div>
              {loading && (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 ml-auto" />
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} {...fadeInUp} className="min-h-[500px]">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        Live
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                        Kompaniyalar
                      </h3>
                      <p className="text-3xl font-black tracking-tighter">
                        {overviewSummary?.totalCompanies ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        Tarif
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                        Tariflardan tushum
                      </h3>
                      <p className="text-3xl font-black tracking-tighter">
                        {(
                          overviewSummary?.subscriptionRevenue ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                        <BadgeCheck className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        Open
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                        Ochiq ticketlar
                      </h3>
                      <p className="text-3xl font-black tracking-tighter">
                        {overviewSummary?.openTickets ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        Pipeline
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                        Lidlar / so'rovlar
                      </h3>
                      <p className="text-3xl font-black tracking-tighter">
                        {(overviewSummary?.totalLeads ?? 0) +
                          (overviewSummary?.pendingUpgrades ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black">
                        {t.superadmin.livePerformance || "Live Performance"}
                      </h3>
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4">
                      {metrics
                        .slice(0, 10)
                        .reverse()
                        .map((m, i) => (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2 group"
                          >
                            <div
                              className="w-full bg-blue-600/10 rounded-t-xl relative flex flex-col justify-end overflow-hidden"
                              style={{ height: "200px" }}
                            >
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${m.cpuUsage}%` }}
                                className="w-full bg-blue-600 rounded-t-xl group-hover:bg-blue-500 transition-colors"
                              />
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${m.ramUsage}%` }}
                                className="w-full bg-indigo-600/40 absolute bottom-0"
                              />
                            </div>
                            <span className="text-[10px] font-black text-slate-400">
                              {format(new Date(m.timestamp), "HH:mm")}
                            </span>
                          </div>
                        ))}
                      {metrics.length === 0 && (
                        <div className="w-full text-center py-20 text-slate-400 font-bold">
                          {t.superadmin.noDataMsg}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activities" && (
                <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight">
                      {t.superadmin.auditLogsTitle}
                    </h2>
                    <button
                      onClick={fetchData}
                      className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5">
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t.superadmin.actionCol}
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t.superadmin.userCol}
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t.superadmin.companyCol}
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t.superadmin.dateCol}
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t.superadmin.detailsCol}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-8 py-16 text-center text-sm font-bold text-slate-400"
                            >
                              Harakatlar tarixi mavjud emas
                            </td>
                          </tr>
                        )}
                        {activities.map((log: ActivityLog) => (
                          <tr
                            key={log.id}
                            className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Info className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-black">
                                    {log.action}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {log.resource || "system"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold">
                                  {log.user?.fullName ||
                                    log.user?.phone ||
                                    "System"}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold">
                              {log.resource || "-"}
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-slate-500 italic">
                              {format(new Date(log.createdAt), "dd.MM HH:mm", {
                                locale: locales[language] || uz,
                              })}
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-xs text-slate-500 font-semibold max-w-xs break-words">
                                {log.metadata
                                  ? JSON.stringify(log.metadata)
                                  : log.ip || "-"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(
                    activitiesPage,
                    activitiesTotal,
                    100,
                    setActivitiesPage
                  )}
                </div>
              )}

              {activeTab === "leads" &&
                (() => {
                  const realLeads = leads;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black tracking-tight">
                            Lidlar
                          </h2>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">
                            Landing sahifadan kelgan potentsial mijozlar
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setLeadForm({
                              fullName: "",
                              phone: "",
                              info: "",
                              status: "NEW",
                            });
                            setIsLeadModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Yangi lid
                        </button>
                      </div>

                      {realLeads.length === 0 ? (
                        <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 p-16 text-center">
                          <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">
                            Hali lidlar yo'q
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Mijoz
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Telefon
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Xabar / Maqsad
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Holat
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Sana
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Amal
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {realLeads.map((lead) => (
                                <tr
                                  key={lead.id}
                                  onClick={() => setViewingLead(lead)}
                                  className="border-b border-slate-50 dark:border-white/5 hover:bg-blue-50/40 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                  <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-sm border border-emerald-200 dark:border-emerald-900/50 shrink-0">
                                        {lead.fullName
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </div>
                                      <p className="text-sm font-black text-slate-900 dark:text-white">
                                        {lead.fullName}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                    {lead.phone}
                                  </td>
                                  <td className="px-8 py-5 max-w-xs">
                                    {lead.info ? (
                                      <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                        {lead.info}
                                      </p>
                                    ) : (
                                      <span className="text-[10px] italic text-slate-300">
                                        Xabar yo'q
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-8 py-5">
                                    <span
                                      className={clsx(
                                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border whitespace-nowrap",
                                        LEAD_STATUS_COLORS[lead.status] ||
                                          LEAD_STATUS_COLORS["CLOSED"]
                                      )}
                                    >
                                      {getLeadStatusLabel(lead.status)}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-xs font-bold text-slate-400 whitespace-nowrap">
                                    {format(
                                      new Date(lead.createdAt),
                                      "dd MMM yyyy",
                                      { locale: locales[language] || uz }
                                    )}
                                  </td>
                                  <td
                                    className="px-8 py-5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingItem(lead);
                                          setLeadForm({
                                            fullName: lead.fullName,
                                            phone: lead.phone,
                                            info: lead.info || "",
                                            status: lead.status,
                                          });
                                          setIsLeadModalOpen(true);
                                        }}
                                        className="p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (
                                            !window.confirm(
                                              t.superadmin.confirmDeleteLead
                                            )
                                          )
                                            return;
                                          try {
                                            await api.delete(
                                              `/super/leads/${lead.id}`
                                            );
                                            toast.success(t.superadmin.deleted);
                                            fetchData();
                                          } catch {
                                            toast.error(
                                              t.superadmin.failedToDelete
                                            );
                                          }
                                        }}
                                        className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {renderPagination(
                            leadsPage,
                            leadsTotal,
                            10,
                            setLeadsPage
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

              {activeTab === "tickets" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
                  {/* Ticket List */}
                  <div className="lg:col-span-1 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">
                        Distributor Murojaatlari
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {supportTickets.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                          Murojaatlar mavjud emas
                        </div>
                      ) : (
                        paginatedTickets.map((ticket) => (
                          <button
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={clsx(
                              "w-full text-left p-4 rounded-3xl border transition-all relative group",
                              selectedTicket?.id === ticket.id
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none"
                                : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className={clsx(
                                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                  ticket.status === "CLOSED"
                                    ? "bg-slate-200 text-slate-600"
                                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50"
                                )}
                              >
                                {ticket.status}
                              </span>
                              <span
                                className={clsx(
                                  "text-[9px] font-bold",
                                  selectedTicket?.id === ticket.id
                                    ? "text-indigo-200"
                                    : "text-slate-400"
                                )}
                              >
                                {format(new Date(ticket.lastReplyAt), "HH:mm")}
                              </span>
                            </div>
                            <h4 className="font-black text-sm truncate pr-4">
                              {ticket.subject}
                            </h4>
                            <p
                              className={clsx(
                                "text-[10px] font-bold mt-1 truncate",
                                selectedTicket?.id === ticket.id
                                  ? "text-indigo-100"
                                  : "text-slate-500"
                              )}
                            >
                              🏢 {ticket.company?.name}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                    {renderPagination(
                      ticketsPage,
                      supportTickets.length,
                      10,
                      setTicketsPage
                    )}
                  </div>

                  {/* Chat Area */}
                  <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden">
                    {selectedTicket ? (
                      <>
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                          <div>
                            <h2 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                              {selectedTicket.subject}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Distributor: {selectedTicket.company?.name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {selectedTicket.status !== "CLOSED" && (
                              <button
                                onClick={async () => {
                                  await api.patch(
                                    `/support/status/${selectedTicket.id}`,
                                    { status: "CLOSED" }
                                  );
                                  toast.success("Murojaat yopildi");
                                  fetchData();
                                  setSelectedTicket({
                                    ...selectedTicket,
                                    status: "CLOSED",
                                  });
                                }}
                                className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                              >
                                Yopish
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-black/10">
                          {selectedTicket.messages?.map(
                            (msg: SupportMessage) => {
                              const isMe = msg.senderType === "SUPER_ADMIN";
                              const attachmentSrc = getAttachmentSrc(
                                msg.imageUrl
                              );
                              return (
                                <div
                                  key={msg.id}
                                  className={clsx(
                                    "flex flex-col",
                                    isMe ? "items-end" : "items-start"
                                  )}
                                >
                                  <div
                                    className={clsx(
                                      "max-w-[85%] rounded-3xl text-sm font-bold leading-relaxed shadow-sm overflow-hidden",
                                      isMe
                                        ? "premium-gradient text-white rounded-tr-none"
                                        : "bg-white dark:bg-white/10 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-white/5"
                                    )}
                                  >
                                    {msg.imageUrl && (
                                      <a
                                        href={attachmentSrc}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <img
                                          src={attachmentSrc}
                                          alt="ticket attachment"
                                          className="w-full max-h-80 object-contain bg-black/5"
                                        />
                                      </a>
                                    )}
                                    {msg.message.trim() !== " " && (
                                      <div className="p-4">{msg.message}</div>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-400 mt-2 font-black px-2">
                                    {format(
                                      new Date(msg.createdAt),
                                      "dd MMM, HH:mm"
                                    )}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>

                        {selectedTicket.status !== "CLOSED" && (
                          <div className="p-4 bg-white dark:bg-white/5 border-t border-slate-100 dark:border-white/10 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {supportQuickReplies.map((item) => (
                                <button
                                  key={item.label}
                                  type="button"
                                  onClick={() => appendQuickReply(item.text)}
                                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                            {replyImagePreview && (
                              <div className="relative inline-block">
                                <img
                                  src={replyImagePreview}
                                  alt="preview"
                                  className="h-24 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyImagePreview(null);
                                    setReplyImageFile(null);
                                    if (fileInputRef.current)
                                      fileInputRef.current.value = "";
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="flex gap-3">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleReplyImageChange}
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-14 h-14 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                              >
                                <ImageIcon size={20} />
                              </button>
                              <input
                                type="text"
                                value={replyMessage}
                                onChange={(e) =>
                                  setReplyMessage(e.target.value)
                                }
                                placeholder="Fikr bildiring..."
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    (replyMessage.trim() || replyImageFile)
                                  ) {
                                    void sendTicketReply();
                                  }
                                }}
                                className="flex-1 px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:border-indigo-600 outline-none transition-all dark:text-white font-bold"
                              />
                              <button
                                onClick={() => void sendTicketReply()}
                                disabled={
                                  sendingReply ||
                                  (!replyMessage.trim() && !replyImageFile)
                                }
                                className="w-14 h-14 premium-gradient text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                              >
                                {sendingReply ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Send size={20} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 space-y-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-4 transition-transform hover:scale-110">
                          <BadgeCheck size={48} className="opacity-10" />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg">
                          Murojaatni tanlang
                        </h3>
                        <p className="max-w-xs text-xs font-bold leading-relaxed uppercase tracking-widest opacity-60">
                          Chap tomondagi ro'yxatdan kerakli murojaatni tanlab,
                          javob berishingiz mumkin
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "backups" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.post("/super/backups/trigger");
                          await refreshBackups();
                          toast.success(t.superadmin.backupStarted);
                        } catch {
                          toast.error(t.common.error);
                        }
                      }}
                      className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-500 transition-all group flex flex-col items-center justify-center text-center cursor-pointer gap-4"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest">
                        {t.superadmin.newBackupBtn}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold max-w-[200px]">
                        {t.superadmin.backupsDesc}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.post("/super/backups/send");
                          await refreshBackups();
                          toast.success(t.superadmin.backupSent);
                        } catch {
                          toast.error(t.common.error);
                        }
                      }}
                      className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border-2 border-dashed border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-500 transition-all group flex flex-col items-center justify-center text-center cursor-pointer gap-4"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send className="w-8 h-8" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest">
                        {t.superadmin.sendBackupNow}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold max-w-[200px]">
                        Zip → Telegram bot
                      </p>
                    </button>
                    {backups.map((b) => (
                      <div
                        key={b.name}
                        className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:shadow-2xl transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Database className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black truncate max-w-[150px]">
                              {b.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {(b.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBackup(b.name)}
                          className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl active:scale-95 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "tariffs" && (
                <div className="space-y-8">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setTariffForm({
                          planKey: "",
                          nameUz: "",
                          nameRu: "",
                          nameEn: "",
                          nameTr: "",
                          nameUzCyr: "",
                          price: "",
                          priceMonthly: "0",
                          priceYearly: "0",
                          featuresUz: [],
                          featuresRu: [],
                          featuresEn: [],
                          featuresTr: [],
                          featuresUzCyr: [],
                          isActive: true,
                          isPopular: false,
                          order: 0,
                          maxBranches: 1,
                          maxUsers: 5,
                          maxCustomBots: 0,
                          maxDealers: 100,
                          maxProducts: 500,
                          trialDays: 14,
                          allowCustomBot: false,
                          allowWebStore: true,
                          allowAnalytics: false,
                          allowNotifications: true,
                          allowMultiCompany: false,
                          allowBulkImport: false,
                        });
                        setIsTariffModalOpen(true);
                      }}
                      className="px-8 py-4 premium-gradient text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                    >
                      <Plus className="w-5 h-5" /> {t.superadmin.newTariffBtn}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tariffs.map((plan: TariffPlan) => (
                      <div
                        key={plan.id}
                        className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-8 group hover:shadow-2xl transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center">
                            <CreditCard className="w-7 h-7" />
                          </div>
                          <div className="flex gap-2">
                            {plan.isPopular && (
                              <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                {t.superadmin.popularBadge}
                              </span>
                            )}
                            <span
                              className={clsx(
                                "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest",
                                plan.isActive
                                  ? "text-emerald-500 bg-emerald-500/10"
                                  : "text-slate-400 bg-slate-400/10"
                              )}
                            >
                              {plan.isActive
                                ? t.superadmin.activeBadge
                                : t.superadmin.hiddenBadge}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {plan.planKey}
                          </p>
                          <h3 className="text-2xl font-black tracking-tight">
                            {(plan as unknown as Record<string, string>)[
                              `name${language.charAt(0).toUpperCase() + language.slice(1)}`
                            ] || plan.nameUz}
                          </h3>
                          <p className="text-3xl font-black tracking-tighter mt-2">
                            {formatPlanMonthlyPrice(plan.priceMonthly)}{" "}
                            <span className="text-sm text-slate-400 ml-1">
                              {t.subscription.monthlyPrice}
                            </span>
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                          <span>
                            {t.superadmin.maxBranches}:{" "}
                            <b className="text-slate-700 dark:text-slate-300">
                              {plan.maxBranches}
                            </b>
                          </span>
                          <span>
                            {t.superadmin.maxUsers}:{" "}
                            <b className="text-slate-700 dark:text-slate-300">
                              {plan.maxUsers}
                            </b>
                          </span>
                          <span>
                            {t.superadmin.maxDealers}:{" "}
                            <b className="text-slate-700 dark:text-slate-300">
                              {plan.maxDealers}
                            </b>
                          </span>
                          <span>
                            {t.superadmin.maxProducts}:{" "}
                            <b className="text-slate-700 dark:text-slate-300">
                              {plan.maxProducts}
                            </b>
                          </span>
                          <span>
                            Telegram Bots:{" "}
                            <b className="text-slate-700 dark:text-slate-300">
                              {plan.maxCustomBots}
                            </b>
                          </span>
                          <span>
                            {t.superadmin.trialDays2}:{" "}
                            <b className="text-slate-700 dark:text-slate-300">
                              {plan.trialDays}d
                            </b>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.allowAnalytics && (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-[9px] font-black uppercase">
                              {t.superadmin.featureFlags}
                            </span>
                          )}
                          {plan.allowCustomBot && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[9px] font-black uppercase">
                              Bot
                            </span>
                          )}
                          {plan.allowWebStore && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[9px] font-black uppercase">
                              Store
                            </span>
                          )}
                          {plan.allowBulkImport && (
                            <span className="px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 text-[9px] font-black uppercase">
                              Bulk Import
                            </span>
                          )}
                          {plan.allowMultiCompany && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[9px] font-black uppercase">
                              Multi-Co
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {(
                            ((plan as unknown as Record<string, string[]>)[
                              `features${language.charAt(0).toUpperCase() + language.slice(1)}`
                            ] || plan.featuresUz) as string[]
                          )
                            .slice(0, 3)
                            .map((f: string, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 text-sm font-bold text-slate-500"
                              >
                                <Check className="w-4 h-4 text-cyan-600" /> {f}
                              </div>
                            ))}
                          {(
                            ((plan as unknown as Record<string, string[]>)[
                              `features${language.charAt(0).toUpperCase() + language.slice(1)}`
                            ] || plan.featuresUz) as string[]
                          ).length > 3 && (
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              +
                              {(
                                ((plan as unknown as Record<string, string[]>)[
                                  `features${language.charAt(0).toUpperCase() + language.slice(1)}`
                                ] || plan.featuresUz) as string[]
                              ).length - 3}{" "}
                              yana...
                            </p>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setEditingItem(plan);
                              setTariffForm({ ...plan });
                              setIsTariffModalOpen(true);
                            }}
                            className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                          >
                            {t.superadmin.editBtn}
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  t.superadmin.confirmDeleteTariff
                                )
                              )
                                return;
                              try {
                                await api.delete(`/super/tariffs/${plan.id}`);
                                toast.success(t.superadmin.deleted);
                                fetchData();
                              } catch {
                                toast.error(t.superadmin.failedToDelete);
                              }
                            }}
                            className="p-4 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "news" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">
                          {t.superadmin.systemNewsTitle}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {t.superadmin.allTenantNews}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setNewsForm({
                          titleUz: "",
                          titleRu: "",
                          excerptUz: "",
                          excerptRu: "",
                          contentUz: "",
                          contentRu: "",
                          image: "",
                          isPublished: true,
                        });
                        setIsNewsModalOpen(true);
                      }}
                      className="px-8 py-3 premium-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      {t.superadmin.addNewsBtn}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {news.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden group hover:shadow-2xl transition-all"
                      >
                        <div className="h-56 bg-slate-900 relative overflow-hidden">
                          <img
                            src={
                              item.image
                                ? getAttachmentSrc(item.image)
                                : "/logo.png"
                            }
                            className="w-full h-full object-cover opacity-50 absolute inset-0"
                            alt=""
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                          <div className="absolute top-6 left-6 flex gap-2">
                            <span
                              className={clsx(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                item.isPublished
                                  ? "bg-emerald-500 text-white"
                                  : "bg-rose-500 text-white"
                              )}
                            >
                              {item.isPublished
                                ? t.superadmin.published
                                : t.superadmin.draft}
                            </span>
                          </div>
                        </div>
                        <div className="p-10 space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <Calendar className="w-3 h-3" />{" "}
                              {format(
                                new Date(item.createdAt),
                                "dd MMMM, yyyy",
                                { locale: locales[language] || uz }
                              )}
                            </div>
                            <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                              {(item as unknown as Record<string, string>)[
                                `title${language.charAt(0).toUpperCase() + language.slice(1)}`
                              ] || item.titleUz}
                            </h3>
                            <p className="text-slate-500 font-bold line-clamp-2 text-sm leading-relaxed">
                              {(item as unknown as Record<string, string>)[
                                `excerpt${language.charAt(0).toUpperCase() + language.slice(1)}`
                              ] || item.excerptUz}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
                            <Eye className="w-3 h-3" />
                            {item.viewCount ?? 0}{" "}
                            {language === "ru"
                              ? "просмотров"
                              : language === "en"
                                ? "views"
                                : "ko'rishlar"}
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch(`/super/news/${item.id}`, {
                                    isPublished: !item.isPublished,
                                  });
                                  toast.success(
                                    item.isPublished
                                      ? t.superadmin.draft
                                      : t.superadmin.published
                                  );
                                  fetchData();
                                } catch {
                                  toast.error(t.common.error);
                                }
                              }}
                              className={clsx(
                                "px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95",
                                item.isPublished
                                  ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                              )}
                            >
                              {item.isPublished
                                ? t.superadmin.draft
                                : t.superadmin.published}
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setNewsForm({ ...item } as NewsItem);
                                setIsNewsModalOpen(true);
                              }}
                              className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                            >
                              {t.superadmin.editBtn}
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    t.superadmin.confirmDeleteNews
                                  )
                                )
                                  return;
                                try {
                                  await api.delete(`/super/news/${item.id}`);
                                  toast.success(t.superadmin.deleted);
                                  fetchData();
                                } catch {
                                  toast.error(t.superadmin.failedToDelete);
                                }
                              }}
                              className="p-3 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 p-10 space-y-10">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />{" "}
                        {t.superadmin.maintenanceModeLabel}
                      </label>
                      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 group">
                        <div>
                          <p className="text-sm font-black">
                            {t.superadmin.freezeSystem}
                          </p>
                          <p className="text-xs text-slate-500 font-bold">
                            {t.superadmin.onlyAdminAccess}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSettings((s) =>
                              s
                                ? { ...s, maintenanceMode: !s.maintenanceMode }
                                : null
                            )
                          }
                          className={clsx(
                            "w-16 h-8 rounded-full relative transition-all duration-300",
                            settings?.maintenanceMode
                              ? "bg-rose-600"
                              : "bg-slate-200 dark:bg-white/10"
                          )}
                        >
                          <div
                            className={clsx(
                              "absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all",
                              settings?.maintenanceMode ? "right-1" : "left-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <Calendar className="w-3 h-3 text-emerald-600" />{" "}
                        {t.superadmin.trialPeriod}
                      </label>
                      <input
                        type="number"
                        value={settings?.defaultTrialDays || 14}
                        onChange={(e) =>
                          setSettings((s) =>
                            s
                              ? { ...s, defaultTrialDays: +e.target.value }
                              : null
                          )
                        }
                        className="w-full px-8 py-5 bg-white dark:bg-white/5 rounded-3xl border-2 border-slate-100 dark:border-white/10 text-xl font-black focus:border-blue-600 transition-all"
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <Bell className="w-3 h-3 text-blue-600" />{" "}
                        {t.superadmin.globalNotifBanner}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {["Uz", "Ru", "En", "Tr", "UzCyr"].map((l) => (
                          <div key={l} className="space-y-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                              {l}
                            </label>
                            <input
                              type="text"
                              value={
                                (settings
                                  ? (
                                      settings as unknown as Record<
                                        string,
                                        string
                                      >
                                    )[`globalNotify${l}`]
                                  : "") || ""
                              }
                              onChange={(e) =>
                                setSettings((s) =>
                                  s
                                    ? {
                                        ...s,
                                        [`globalNotify${l}`]: e.target.value,
                                      }
                                    : null
                                )
                              }
                              placeholder={`${l} notification text...`}
                              className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />{" "}
                        Admin telefon raqami (login sahifasida ko'rinadi)
                      </label>
                      <input
                        type="text"
                        value={settings?.superAdminPhone || ""}
                        onChange={(e) =>
                          setSettings((s) =>
                            s ? { ...s, superAdminPhone: e.target.value } : null
                          )
                        }
                        placeholder="+998901234567"
                        className="w-full px-8 py-5 bg-white dark:bg-white/5 rounded-3xl border-2 border-slate-100 dark:border-white/10 text-xl font-black focus:border-blue-600 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-2">
                        <LifeBuoy className="w-4 h-4 text-blue-600" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Dashboard yordam markazi kontaktlari
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                            Support telefon
                          </label>
                          <input
                            type="text"
                            value={landingContent.contactPhone || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                contactPhone: e.target.value,
                              }))
                            }
                            placeholder="+998901112233"
                            className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                            Support email
                          </label>
                          <input
                            type="email"
                            value={landingContent.contactEmail || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                contactEmail: e.target.value,
                              }))
                            }
                            placeholder="support@supplio.uz"
                            className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                          Support Telegram username
                        </label>
                        <input
                          type="text"
                          value={landingContent.supportTelegramUsername || ""}
                          onChange={(e) =>
                            setLandingContent((p) => ({
                              ...p,
                              supportTelegramUsername: e.target.value,
                            }))
                          }
                          placeholder="@supplio_support"
                          className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                          Telegram kanal URL (Footer)
                        </label>
                        <input
                          type="text"
                          value={landingContent.socialTelegram || ""}
                          onChange={(e) =>
                            setLandingContent((p) => ({
                              ...p,
                              socialTelegram: e.target.value,
                            }))
                          }
                          placeholder="https://t.me/your_channel"
                          className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                            Instagram URL (Footer)
                          </label>
                          <input
                            type="text"
                            value={landingContent.socialInstagram || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                socialInstagram: e.target.value,
                              }))
                            }
                            placeholder="https://instagram.com/your_page"
                            className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                            LinkedIn URL (Footer)
                          </label>
                          <input
                            type="text"
                            value={landingContent.socialLinkedin || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                socialLinkedin: e.target.value,
                              }))
                            }
                            placeholder="https://linkedin.com/company/your_page"
                            className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                            Lokatsiya (matn)
                          </label>
                          <input
                            type="text"
                            value={landingContent.contactAddress || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                contactAddress: e.target.value,
                              }))
                            }
                            placeholder="Toshkent sh., Yunusobod..."
                            className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase px-2">
                            Lokatsiya URL (xarita)
                          </label>
                          <input
                            type="text"
                            value={landingContent.contactAddressUrl || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                contactAddressUrl: e.target.value,
                              }))
                            }
                            placeholder="https://maps.google.com/..."
                            className="w-full px-5 py-3.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-bold focus:border-blue-600 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-2">
                        <FileCode className="w-4 h-4 text-violet-600" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Legal pages
                        </label>
                      </div>

                      {[
                        { key: "terms", label: "Terms / Shartlar" },
                        { key: "privacy", label: "Privacy Policy / Maxfiylik" },
                        { key: "contract", label: "Contract / Shartnoma" },
                      ].map((page) => (
                        <div
                          key={page.key}
                          className="rounded-[2rem] border border-slate-100 dark:border-white/10 p-6 space-y-4 bg-slate-50/60 dark:bg-white/5"
                        >
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {page.label}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(["Uz", "Ru", "En", "UzCyr"] as const).map(
                              (langKey) => {
                                const field =
                                  `${page.key}${langKey}` as keyof GlobalSettings;
                                return (
                                  <div key={langKey} className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                      {langKey}
                                    </label>
                                    <textarea
                                      rows={5}
                                      value={String(settings?.[field] || "")}
                                      onChange={(e) =>
                                        setSettings((s) =>
                                          s
                                            ? {
                                                ...s,
                                                [field]: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                      className="w-full px-5 py-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 font-semibold text-sm outline-none focus:border-violet-500 resize-y"
                                      placeholder={`${page.label} (${langKey})`}
                                    />
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await api.patch("/super/settings", settings ?? {});
                        await api.patch("/super/landing", {
                          contactPhone: landingContent.contactPhone,
                          contactEmail: landingContent.contactEmail,
                          contactAddress: landingContent.contactAddress,
                          contactAddressUrl: landingContent.contactAddressUrl,
                          socialTelegram: landingContent.socialTelegram,
                          socialInstagram: landingContent.socialInstagram,
                          socialLinkedin: landingContent.socialLinkedin,
                          supportTelegramUsername:
                            landingContent.supportTelegramUsername,
                        });
                        toast.success(t.superadmin.saveSettingsSuccess);
                      } catch {
                        toast.error(t.common.error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full py-5 premium-gradient text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 active:scale-95 transition-all"
                  >
                    <Save className="w-5 h-5" /> {t.superadmin.saveSettings}
                  </button>
                </div>
              )}

              {activeTab === "editor" && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-white/5 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/10 space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                        <Table className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-black">
                        {t.superadmin.coreEditor}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                          {t.superadmin.modelLabel}
                        </label>
                        <select
                          value={editorData.model}
                          onChange={(e) =>
                            setEditorData({
                              ...editorData,
                              model: e.target.value,
                            })
                          }
                          className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-black text-sm"
                        >
                          <option value="Company">
                            {t.superadmin.companyCol}
                          </option>
                          <option value="Dealer">{t.dealers.title}</option>
                          <option value="User">{t.superadmin.userCol}</option>
                          <option value="Order">{t.orders.title}</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                          {t.superadmin.recordIdLabel}
                        </label>
                        <input
                          type="text"
                          value={editorData.id}
                          onChange={(e) =>
                            setEditorData({ ...editorData, id: e.target.value })
                          }
                          className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-mono text-sm leading-none"
                          placeholder="00000000-0000-0000..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                            {t.superadmin.fieldLabel}
                          </label>
                          <input
                            type="text"
                            value={editorData.field}
                            onChange={(e) =>
                              setEditorData({
                                ...editorData,
                                field: e.target.value,
                              })
                            }
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-black text-sm"
                            placeholder="name"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                            {t.superadmin.valueLabel}
                          </label>
                          <input
                            type="text"
                            value={editorData.value}
                            onChange={(e) =>
                              setEditorData({
                                ...editorData,
                                value: e.target.value,
                              })
                            }
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-transparent focus:border-violet-500 transition-all font-black text-sm"
                            placeholder="ABC Corp"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!editorData.id || !editorData.field)
                          return toast.error(t.common.noData);
                        try {
                          setLoading(true);
                          await api.post("/super/patch-data", editorData);
                          toast.success(t.superadmin.saveSettingsSuccess);
                          setEditorData({
                            ...editorData,
                            id: "",
                            field: "",
                            value: "",
                          });
                        } catch (err: unknown) {
                          const msg =
                            err instanceof Error ? err.message : t.common.error;
                          toast.error(msg);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-violet-600/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      <Table className="w-5 h-5" /> {t.superadmin.execute}
                    </button>
                  </div>
                  <div className="bg-rose-600/10 border-2 border-rose-600/20 p-8 rounded-[2.5rem] flex gap-6 items-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/20">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-1">
                        {t.superadmin.dangerZone}
                      </h3>
                      <p className="text-xs text-rose-500/80 font-bold leading-relaxed">
                        {t.superadmin.editorDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "distributors" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black">
                          {t.superadmin.distributors}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {distributors.length} {t.superadmin.companyCol}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input
                        placeholder={t.common.search}
                        value={distSearch}
                        onChange={(e) => setDistSearch(e.target.value)}
                        className="px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none w-52"
                      />
                      <button
                        onClick={() => {
                          setDistForm(emptyDistForm);
                          setIsDistModalOpen(true);
                        }}
                        className="px-6 py-3 premium-gradient text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        {t.superadmin.createDistributor}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {distributors
                      .filter(
                        (d) =>
                          !distSearch ||
                          d.name
                            .toLowerCase()
                            .includes(distSearch.toLowerCase()) ||
                          d.slug.includes(distSearch)
                      )
                      .map((dist) => {
                        const owner = dist.users[0];
                        const expiry = dist.trialExpiresAt
                          ? new Date(dist.trialExpiresAt)
                          : null;
                        const daysLeft = expiry
                          ? Math.ceil(
                              (expiry.getTime() - Date.now()) / 86400000
                            )
                          : null;
                        const statusColor =
                          dist.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : dist.subscriptionStatus === "TRIAL"
                              ? "bg-blue-50 text-blue-600"
                              : dist.subscriptionStatus === "LOCKED"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-slate-50 text-slate-500";
                        return (
                          <div
                            key={dist.id}
                            className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 flex items-center gap-6"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center shrink-0 font-black text-lg">
                              {dist.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-black text-slate-900 dark:text-white">
                                  {dist.name}
                                </h3>
                                <span
                                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusColor}`}
                                >
                                  {dist.subscriptionPlan} ·{" "}
                                  {dist.subscriptionStatus}
                                </span>
                                {daysLeft !== null && daysLeft <= 7 && (
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                                    {daysLeft} {t.superadmin.daysLeftShort}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-400 font-bold">
                                <span>/{dist.slug}</span>
                                {owner && <span>👤 {owner.phone}</span>}
                                <span>
                                  🛒 {dist._count.orders}{" "}
                                  {t.superadmin.ordersCount}
                                </span>
                                <span>
                                  👥 {dist._count.dealers}{" "}
                                  {t.superadmin.dealersCount}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={async () => {
                                  try {
                                    setExportingDistId(`${dist.id}:xlsx`);
                                    await downloadBlobFile(
                                      `/super/distributors/${dist.id}/export`,
                                      `SUPPLIO_${dist.slug.toUpperCase()}_${new Date().toISOString().split("T")[0]}.xlsx`,
                                      { period: "30d" }
                                    );
                                  } catch {
                                    toast.error(t.common.error);
                                  } finally {
                                    setExportingDistId(null);
                                  }
                                }}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                              >
                                {exportingDistId === `${dist.id}:xlsx` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <BarChart3 className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    setExportingDistId(`${dist.id}:sql`);
                                    await downloadBlobFile(
                                      `/super/distributors/${dist.id}/export-sql`,
                                      `SUPPLIO_${dist.slug.toUpperCase()}_${new Date().toISOString().split("T")[0]}.sql`
                                    );
                                  } catch {
                                    toast.error(t.common.error);
                                  } finally {
                                    setExportingDistId(null);
                                  }
                                }}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                              >
                                {exportingDistId === `${dist.id}:sql` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <FileCode className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => openSubscriptionModal(dist)}
                                className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await api.post(
                                      `/super/backups/company/${dist.id}/trigger`
                                    );
                                    await refreshBackups();
                                    if (res.data?.name) {
                                      await downloadBackup(res.data.name);
                                    }
                                    toast.success(
                                      `${dist.name}: ${res.data?.name || "backup tayyorlandi"}`
                                    );
                                  } catch {
                                    toast.error(t.common.error);
                                  }
                                }}
                                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await api.post(
                                      `/super/backups/company/${dist.id}/send`
                                    );
                                    await refreshBackups();
                                    toast.success(
                                      `${dist.name}: ${t.superadmin.backupSent}`
                                    );
                                  } catch {
                                    toast.error(t.common.error);
                                  }
                                }}
                                className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setResetPasswordTarget({
                                    id: dist.id,
                                    name: dist.name,
                                  });
                                  setResetPasswordValue("");
                                  setIsResetPasswordModalOpen(true);
                                }}
                                className="px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setNotifyAll(false);
                                  setSelectedDistIds([dist.id]);
                                  setActiveTab("notify");
                                  setSearchParams({ tab: "notify" });
                                }}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  const newStatus =
                                    dist.subscriptionStatus === "LOCKED"
                                      ? "ACTIVE"
                                      : "LOCKED";
                                  try {
                                    await api.patch(
                                      `/super/company/${dist.id}/status`,
                                      { status: newStatus }
                                    );
                                    setDistributors((prev) =>
                                      prev.map((d) =>
                                        d.id === dist.id
                                          ? {
                                              ...d,
                                              subscriptionStatus: newStatus,
                                            }
                                          : d
                                      )
                                    );
                                    toast.success(t.superadmin.statusUpdated);
                                  } catch {
                                    toast.error(
                                      t.superadmin.failedUpdateStatus
                                    );
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 ${dist.subscriptionStatus === "LOCKED" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"}`}
                              >
                                {dist.subscriptionStatus === "LOCKED" ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Faollashtirish</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3.5 h-3.5" />
                                    <span>Faolsizlantirish</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    {distributors.length === 0 && (
                      <div className="text-center py-20 text-slate-400 font-bold">
                        {t.superadmin.noDistributors}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notify" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">
                        {t.superadmin.notifyTab}
                      </h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {t.superadmin.notifyTabDesc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 space-y-6">
                    {/* Target */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t.superadmin.recipientsLabel}
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setNotifyAll(true)}
                          className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${notifyAll ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}
                        >
                          {t.superadmin.allDistributors}
                        </button>
                        <button
                          onClick={() => setNotifyAll(false)}
                          className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${!notifyAll ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}
                        >
                          {t.superadmin.selectedOnly}
                        </button>
                      </div>

                      {!notifyAll && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {distributors.map((d) => (
                            <label
                              key={d.id}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedDistIds.includes(d.id)}
                                onChange={(e) =>
                                  setSelectedDistIds((prev) =>
                                    e.target.checked
                                      ? [...prev, d.id]
                                      : prev.filter((id) => id !== d.id)
                                  )
                                }
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {d.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {d.users[0]?.phone}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Type */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t.superadmin.typeLabel}
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          {
                            value: "INFO",
                            label: t.superadmin.infoType,
                            color: "bg-blue-50 text-blue-600",
                          },
                          {
                            value: "WARNING",
                            label: t.superadmin.warningType,
                            color: "bg-amber-50 text-amber-600",
                          },
                          {
                            value: "PAYMENT_REMINDER",
                            label: t.superadmin.paymentReminderType,
                            color: "bg-emerald-50 text-emerald-600",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setNotifyForm((f) => ({ ...f, type: opt.value }))
                            }
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${notifyForm.type === opt.value ? opt.color + " ring-2 ring-current/30" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t.superadmin.notifTitle}
                      </label>
                      <input
                        value={notifyForm.title}
                        onChange={(e) =>
                          setNotifyForm((f) => ({
                            ...f,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm outline-none"
                        placeholder={t.superadmin.notifTitlePlaceholder}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t.superadmin.notifMessage}
                      </label>
                      <textarea
                        rows={5}
                        value={notifyForm.message}
                        onChange={(e) =>
                          setNotifyForm((f) => ({
                            ...f,
                            message: e.target.value,
                          }))
                        }
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm outline-none resize-none"
                        placeholder={t.superadmin.notifMessagePlaceholder}
                      />
                    </div>

                    <button
                      disabled={
                        notifySending ||
                        !notifyForm.title ||
                        !notifyForm.message
                      }
                      onClick={async () => {
                        try {
                          setNotifySending(true);
                          const payload: {
                            title: string;
                            message: string;
                            type: string;
                            companyIds?: string[];
                          } = {
                            title: notifyForm.title,
                            message: notifyForm.message,
                            type: notifyForm.type,
                          };
                          if (!notifyAll && selectedDistIds.length > 0) {
                            payload.companyIds = selectedDistIds;
                          }
                          const res = await api.post(
                            "/super/notify-distributors",
                            payload
                          );
                          toast.success(
                            `${t.superadmin.notifSent}: ${res.data?.count ?? 0}`
                          );
                          setNotifyForm({
                            title: "",
                            message: "",
                            type: "INFO",
                          });
                        } catch {
                          toast.error(t.superadmin.failedToSend);
                        } finally {
                          setNotifySending(false);
                        }
                      }}
                      className="w-full py-4 premium-gradient text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {notifySending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {notifyAll
                        ? t.superadmin.sendToAllBtn
                        : `${t.superadmin.sendToAllBtn} (${selectedDistIds.length})`}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "cms" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-600/10 text-teal-600 flex items-center justify-center">
                        <Layout className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black">
                          {t.superadmin.landingCmsTitle}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {t.superadmin.dynamicEditor}
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={cmsLoading}
                      onClick={async () => {
                        try {
                          setCmsLoading(true);
                          await api.patch("/super/landing", landingContent);
                          toast.success(t.superadmin.contentSaved);
                        } catch {
                          toast.error(t.superadmin.failedToSave);
                        } finally {
                          setCmsLoading(false);
                        }
                      }}
                      className="px-8 py-3 premium-gradient text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {cmsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {t.superadmin.saveChanges}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 space-y-3">
                      <h3 className="text-sm font-black uppercase tracking-widest text-teal-600">
                        CMS nima qiladi
                      </h3>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                        Bu bo'lim landing bosh sahifadagi hero matnlari, footer
                        tavsifi va kontakt bloklarini boshqaradi. Saqlagandan
                        keyin o'zgarishlar public landing sahifada ko'rinadi.
                      </p>
                      <a
                        href={LANDING_PREVIEW_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest"
                      >
                        <Eye className="w-4 h-4" /> Landingni ko'rish
                      </a>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-white/5 p-6 rounded-[2rem] border border-teal-100 dark:border-teal-900/30 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                        Jonli preview
                      </p>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {landingContent.heroBadgeUz || "Badge"}
                      </p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {landingContent.heroTitleUz ||
                          "Hero sarlavha shu yerda ko'rinadi"}
                      </h3>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                        {landingContent.heroSubtitleUz ||
                          "Hero subtitle preview"}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                        <span>{landingContent.contactPhone || "Telefon"}</span>
                        <span>{landingContent.contactEmail || "Email"}</span>
                        <span>{landingContent.contactAddress || "Manzil"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest">
                      {t.superadmin.heroSection}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["Uz", "Ru", "En", "Tr"] as const).map((lang) => (
                        <div key={lang} className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {lang}
                          </p>
                          <input
                            value={
                              (landingContent as any)[`heroBadge${lang}`] || ""
                            }
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                [`heroBadge${lang}`]: e.target.value,
                              }))
                            }
                            placeholder={`Badge text (${lang})`}
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none"
                          />
                          <input
                            value={
                              (landingContent as any)[`heroTitle${lang}`] || ""
                            }
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                [`heroTitle${lang}`]: e.target.value,
                              }))
                            }
                            placeholder={`Hero title (${lang})`}
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none"
                          />
                          <textarea
                            rows={2}
                            value={
                              (landingContent as any)[`heroSubtitle${lang}`] ||
                              ""
                            }
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                [`heroSubtitle${lang}`]: e.target.value,
                              }))
                            }
                            placeholder={`Hero subtitle (${lang})`}
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Description */}
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest">
                      {t.superadmin.footerSection}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["Uz", "Ru", "En", "Tr"] as const).map((lang) => (
                        <div key={lang} className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {lang}
                          </p>
                          <textarea
                            rows={3}
                            value={
                              (landingContent as any)[`footerDesc${lang}`] || ""
                            }
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                [`footerDesc${lang}`]: e.target.value,
                              }))
                            }
                            placeholder={`Footer description (${lang})`}
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Social */}
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                    <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest">
                      {t.superadmin.contactSocial}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: "contactPhone", label: t.superadmin.phone },
                        { key: "contactEmail", label: "Email" },
                        {
                          key: "contactAddress",
                          label: "Manzil (ko'rsatiladigan matn)",
                        },
                        {
                          key: "contactAddressUrl",
                          label: "Manzil harita URL (href)",
                        },
                        { key: "socialTelegram", label: "Telegram URL" },
                        { key: "socialInstagram", label: "Instagram URL" },
                        { key: "socialLinkedin", label: "LinkedIn URL" },
                        { key: "socialTwitter", label: "Twitter URL" },
                        {
                          key: "supportTelegramUsername",
                          label: "Support Telegram username",
                        },
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {label}
                          </label>
                          <input
                            value={(landingContent as any)[key] || ""}
                            onChange={(e) =>
                              setLandingContent((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={label}
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-teal-500 text-sm font-bold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade Requests */}
              {activeTab === "upgrades" && (
                <div className="space-y-4">
                  {upgradeRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-slate-500 font-bold">
                        {language === "ru"
                          ? "Нет запросов на апгрейд"
                          : language === "en"
                            ? "No upgrade requests yet"
                            : "Tarif so'rovlari yo'q"}
                      </p>
                    </div>
                  ) : (
                    upgradeRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start gap-6"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={clsx(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl",
                                req.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : req.status === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                              )}
                            >
                              {req.status === "PENDING"
                                ? language === "ru"
                                  ? "Ожидает"
                                  : language === "en"
                                    ? "Pending"
                                    : "Kutilmoqda"
                                : req.status === "APPROVED"
                                  ? language === "ru"
                                    ? "Одобрено"
                                    : language === "en"
                                      ? "Approved"
                                      : "Tasdiqlangan"
                                  : language === "ru"
                                    ? "Отклонено"
                                    : language === "en"
                                      ? "Rejected"
                                      : "Rad etildi"}
                            </span>
                            {req.status === "PENDING" && (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            {req.status === "APPROVED" && (
                              <BadgeCheck className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-black">
                              {req.companyName}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                              {req.ownerPhone}
                              {req.ownerName ? ` · ${req.ownerName}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs font-bold">
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                              {language === "ru"
                                ? "Текущий план"
                                : language === "en"
                                  ? "Current"
                                  : "Joriy"}
                              :{" "}
                              <span className="text-blue-600">
                                {req.currentPlan}
                              </span>
                            </span>
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                              {language === "ru"
                                ? "Дилеры"
                                : language === "en"
                                  ? "Dealers"
                                  : "Dilerlar"}
                              : {req.dealersCount}
                            </span>
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                              {language === "ru"
                                ? "Польз."
                                : language === "en"
                                  ? "Users"
                                  : "Foydalanuvchi"}
                              : {req.usersCount}
                            </span>
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                              {language === "ru"
                                ? "Товары"
                                : language === "en"
                                  ? "Products"
                                  : "Mahsulot"}
                              : {req.productsCount}
                            </span>
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                              {format(
                                new Date(req.createdAt),
                                "dd.MM.yyyy HH:mm"
                              )}
                            </span>
                          </div>
                        </div>
                        {req.status === "PENDING" && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch(
                                    `/super/upgrade-requests/${req.id}`,
                                    { status: "APPROVED" }
                                  );
                                  toast.success(
                                    language === "ru"
                                      ? "Одобрено"
                                      : language === "en"
                                        ? "Approved"
                                        : "Tasdiqlandi"
                                  );
                                  const res = await api.get(
                                    "/super/upgrade-requests"
                                  );
                                  setUpgradeRequests(
                                    Array.isArray(res.data) ? res.data : []
                                  );
                                } catch {
                                  toast.error("Error");
                                }
                              }}
                              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95"
                            >
                              {language === "ru"
                                ? "Одобрить"
                                : language === "en"
                                  ? "Approve"
                                  : "Tasdiqlash"}
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch(
                                    `/super/upgrade-requests/${req.id}`,
                                    { status: "REJECTED" }
                                  );
                                  toast.success(
                                    language === "ru"
                                      ? "Отклонено"
                                      : language === "en"
                                        ? "Rejected"
                                        : "Rad etildi"
                                  );
                                  const res = await api.get(
                                    "/super/upgrade-requests"
                                  );
                                  setUpgradeRequests(
                                    Array.isArray(res.data) ? res.data : []
                                  );
                                } catch {
                                  toast.error("Error");
                                }
                              }}
                              className="px-4 py-2.5 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                            >
                              {language === "ru"
                                ? "Отклонить"
                                : language === "en"
                                  ? "Reject"
                                  : "Rad etish"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
              {activeTab === "testimonials" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {language === "ru"
                        ? "Отзывы клиентов"
                        : language === "en"
                          ? "Client Testimonials"
                          : "Mijozlar sharhlari"}
                    </h3>
                    <button
                      onClick={() => {
                        setTestimonialForm({
                          name: "",
                          company: "",
                          roleTitle: "",
                          contentUz: "",
                          contentRu: "",
                          contentEn: "",
                          contentTr: "",
                          rating: 5,
                          isActive: true,
                          order: testimonials.length,
                        });
                        setEditingTestimonialId(null);
                        setShowTestimonialForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      +{" "}
                      {language === "ru"
                        ? "Добавить"
                        : language === "en"
                          ? "Add"
                          : "Qo'shish"}
                    </button>
                  </div>

                  {showTestimonialForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-black text-sm text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                        {editingTestimonialId
                          ? language === "ru"
                            ? "Редактировать"
                            : "Tahrirlash"
                          : language === "ru"
                            ? "Новый отзыв"
                            : "Yangi sharh"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {language === "ru" ? "Имя *" : "Ism *"}
                          </label>
                          <input
                            value={testimonialForm.name || ""}
                            onChange={(e) =>
                              setTestimonialForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {language === "ru" ? "Компания" : "Kompaniya"}
                          </label>
                          <input
                            value={testimonialForm.company || ""}
                            onChange={(e) =>
                              setTestimonialForm((f) => ({
                                ...f,
                                company: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {language === "ru" ? "Должность" : "Lavozim"}
                          </label>
                          <input
                            value={testimonialForm.roleTitle || ""}
                            onChange={(e) =>
                              setTestimonialForm((f) => ({
                                ...f,
                                roleTitle: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {language === "ru"
                              ? "Рейтинг (1-5)"
                              : "Reyting (1-5)"}
                          </label>
                          <select
                            value={testimonialForm.rating || 5}
                            onChange={(e) =>
                              setTestimonialForm((f) => ({
                                ...f,
                                rating: Number(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
                          >
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n} ⭐
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {[
                        { key: "contentUz", label: "Matn (UZ)" },
                        { key: "contentRu", label: "Текст (RU)" },
                        { key: "contentEn", label: "Text (EN)" },
                        { key: "contentTr", label: "Metin (TR)" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {label}
                          </label>
                          <textarea
                            value={(testimonialForm as any)[key] || ""}
                            onChange={(e) =>
                              setTestimonialForm((f) => ({
                                ...f,
                                [key]: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={testimonialForm.isActive !== false}
                            onChange={(e) =>
                              setTestimonialForm((f) => ({
                                ...f,
                                isActive: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded"
                          />
                          {language === "ru" ? "Активный" : "Faol"}
                        </label>
                        <input
                          type="number"
                          value={testimonialForm.order || 0}
                          onChange={(e) =>
                            setTestimonialForm((f) => ({
                              ...f,
                              order: Number(e.target.value),
                            }))
                          }
                          placeholder={language === "ru" ? "Порядок" : "Tartib"}
                          className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            if (!testimonialForm.name?.trim())
                              return toast.error("Ism kiritilmadi");
                            try {
                              setLoading(true);
                              if (editingTestimonialId) {
                                await api.patch(
                                  `/super/testimonials/${editingTestimonialId}`,
                                  testimonialForm
                                );
                              } else {
                                await api.post(
                                  "/super/testimonials",
                                  testimonialForm
                                );
                              }
                              const res = await api.get("/super/testimonials");
                              setTestimonials(
                                Array.isArray(res.data) ? res.data : []
                              );
                              setShowTestimonialForm(false);
                              setEditingTestimonialId(null);
                              toast.success(
                                language === "ru" ? "Сохранено" : "Saqlandi"
                              );
                            } catch {
                              toast.error(t.common.error);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          {t.common.save}
                        </button>
                        <button
                          onClick={() => {
                            setShowTestimonialForm(false);
                            setEditingTestimonialId(null);
                          }}
                          className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {testimonials.length === 0 ? (
                      <p className="text-center text-slate-400 py-12 font-bold text-sm">
                        {language === "ru"
                          ? "Отзывов пока нет"
                          : language === "en"
                            ? "No testimonials yet"
                            : "Hozircha sharhlar yo'q"}
                      </p>
                    ) : (
                      testimonials.map((tm) => (
                        <div
                          key={tm.id}
                          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-black text-slate-900 dark:text-white text-sm">
                                {tm.name}
                              </span>
                              {tm.company && (
                                <span className="text-slate-400 text-xs">
                                  · {tm.company}
                                </span>
                              )}
                              {tm.roleTitle && (
                                <span className="text-slate-400 text-xs">
                                  · {tm.roleTitle}
                                </span>
                              )}
                              <span className="text-amber-500 text-xs">
                                {"⭐".repeat(tm.rating)}
                              </span>
                              {!tm.isActive && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold rounded-full">
                                  {language === "ru" ? "Неакт." : "Nofaol"}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                              {tm.contentUz || tm.contentRu || tm.contentEn}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setTestimonialForm({ ...tm });
                                setEditingTestimonialId(tm.id);
                                setShowTestimonialForm(true);
                              }}
                              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  !confirm(
                                    language === "ru"
                                      ? "Удалить?"
                                      : "O'chirasizmi?"
                                  )
                                )
                                  return;
                                try {
                                  await api.delete(
                                    `/super/testimonials/${tm.id}`
                                  );
                                  setTestimonials((prev) =>
                                    prev.filter((t) => t.id !== tm.id)
                                  );
                                  toast.success(
                                    language === "ru" ? "Удалено" : "O'chirildi"
                                  );
                                } catch {
                                  toast.error(t.common.error);
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {language === "ru"
                          ? "Члены команды"
                          : language === "en"
                            ? "Team Members"
                            : "Jamoa a'zolari"}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        {language === "ru"
                          ? "Отображаются на странице 'О нас'"
                          : language === "en"
                            ? "Shown on the About page"
                            : "'Biz haqimizda' sahifasida ko'rinadi"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTeamForm({
                          name: "",
                          roleUz: "",
                          roleRu: "",
                          roleEn: "",
                          roleTr: "",
                          bioUz: "",
                          bioRu: "",
                          bioEn: "",
                          bioTr: "",
                          order: teamMembers.length,
                          isActive: true,
                        });
                        setEditingTeamId(null);
                        setShowTeamForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {language === "ru"
                        ? "Добавить"
                        : language === "en"
                          ? "Add"
                          : "Qo'shish"}
                    </button>
                  </div>

                  {showTeamForm && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-black text-sm text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                        {editingTeamId
                          ? language === "ru"
                            ? "Редактировать"
                            : "Tahrirlash"
                          : language === "ru"
                            ? "Новый участник"
                            : "Yangi a'zo"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Ism / Name *
                          </label>
                          <input
                            value={teamForm.name}
                            onChange={(e) =>
                              setTeamForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                            placeholder="Ali Karimov"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Tartib / Order
                          </label>
                          <input
                            type="number"
                            value={teamForm.order}
                            onChange={(e) =>
                              setTeamForm((f) => ({
                                ...f,
                                order: Number(e.target.value),
                              }))
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: "roleUz", label: "Lavozim (UZ)" },
                          { key: "roleRu", label: "Должность (RU)" },
                          { key: "roleEn", label: "Role (EN)" },
                          { key: "roleTr", label: "Görev (TR)" },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                              {f.label}
                            </label>
                            <input
                              value={(teamForm as any)[f.key]}
                              onChange={(e) =>
                                setTeamForm((p) => ({
                                  ...p,
                                  [f.key]: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                              placeholder="CEO, Founder"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: "bioUz", label: "Bio (UZ)" },
                          { key: "bioRu", label: "Bio (RU)" },
                          { key: "bioEn", label: "Bio (EN)" },
                          { key: "bioTr", label: "Bio (TR)" },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                              {f.label}
                            </label>
                            <textarea
                              rows={2}
                              value={(teamForm as any)[f.key]}
                              onChange={(e) =>
                                setTeamForm((p) => ({
                                  ...p,
                                  [f.key]: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold resize-none"
                            />
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={teamForm.isActive}
                          onChange={(e) =>
                            setTeamForm((f) => ({
                              ...f,
                              isActive: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {language === "ru" ? "Активен" : "Faol"}
                        </span>
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            try {
                              if (editingTeamId) {
                                const res = await api.patch(
                                  `/super/team/${editingTeamId}`,
                                  teamForm
                                );
                                setTeamMembers((prev) =>
                                  prev.map((m) =>
                                    m.id === editingTeamId ? res.data : m
                                  )
                                );
                              } else {
                                const res = await api.post(
                                  "/super/team",
                                  teamForm
                                );
                                setTeamMembers((prev) => [...prev, res.data]);
                              }
                              setShowTeamForm(false);
                              setEditingTeamId(null);
                              toast.success(
                                language === "ru" ? "Сохранено" : "Saqlandi"
                              );
                            } catch {
                              toast.error(t.common.error);
                            }
                          }}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                        >
                          {t.common.save}
                        </button>
                        <button
                          onClick={() => {
                            setShowTeamForm(false);
                            setEditingTeamId(null);
                          }}
                          className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {teamMembers.length === 0 ? (
                      <p className="text-center text-slate-400 py-12 font-bold text-sm">
                        {language === "ru"
                          ? "Команда пуста"
                          : language === "en"
                            ? "No team members yet"
                            : "Jamoa bo'sh"}
                      </p>
                    ) : (
                      teamMembers.map((m) => (
                        <div
                          key={m.id}
                          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-sm">
                                {m.name}
                              </p>
                              <p className="text-slate-400 text-xs font-semibold">
                                {m.roleUz || m.roleEn}
                              </p>
                              {!m.isActive && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold rounded-full">
                                  {language === "ru" ? "Неакт." : "Nofaol"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setTeamForm({
                                  name: m.name,
                                  roleUz: m.roleUz,
                                  roleRu: m.roleRu,
                                  roleEn: m.roleEn,
                                  roleTr: m.roleTr,
                                  bioUz: m.bioUz,
                                  bioRu: m.bioRu,
                                  bioEn: m.bioEn,
                                  bioTr: m.bioTr,
                                  order: m.order,
                                  isActive: m.isActive,
                                });
                                setEditingTeamId(m.id);
                                setShowTeamForm(true);
                              }}
                              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  !confirm(
                                    language === "ru"
                                      ? "Удалить?"
                                      : "O'chirasizmi?"
                                  )
                                )
                                  return;
                                try {
                                  await api.delete(`/super/team/${m.id}`);
                                  setTeamMembers((prev) =>
                                    prev.filter((x) => x.id !== m.id)
                                  );
                                  toast.success(
                                    language === "ru" ? "Удалено" : "O'chirildi"
                                  );
                                } catch {
                                  toast.error(t.common.error);
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "bots" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                        {language === "ru"
                          ? `Всего ботов: ${adminBots.length}`
                          : language === "en"
                            ? `Total bots: ${adminBots.length}`
                            : `Jami botlar: ${adminBots.length}`}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                        {language === "ru"
                          ? `Активные: ${adminBots.filter((b) => b.isActive).length} · Неактивные: ${adminBots.length - adminBots.filter((b) => b.isActive).length}`
                          : language === "en"
                            ? `Active: ${adminBots.filter((b) => b.isActive).length} · Inactive: ${adminBots.length - adminBots.filter((b) => b.isActive).length}`
                            : `Faol: ${adminBots.filter((b) => b.isActive).length} · Faol emas: ${adminBots.length - adminBots.filter((b) => b.isActive).length}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!distributors.length) {
                            api
                              .get("/super/distributors", {
                                params: { page: 1, limit: 200 },
                              })
                              .then((res) => {
                                setDistributors(
                                  Array.isArray(res.data)
                                    ? res.data
                                    : (res.data?.items ?? [])
                                );
                              })
                              .catch(() => {});
                          }
                          setBotCreateModal({
                            companyId: "",
                            token: "",
                            botName: "",
                            description: "",
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {language === "ru"
                          ? "Добавить"
                          : language === "en"
                            ? "Add Bot"
                            : "Bot qo'shish"}
                      </button>
                      <button
                        disabled={botsReloadingAll}
                        onClick={async () => {
                          setBotsReloadingAll(true);
                          try {
                            await api.post("/telegram/admin/bots/reload-all");
                            const res = await api.get("/telegram/admin/bots");
                            setAdminBots(
                              Array.isArray(res.data) ? res.data : []
                            );
                            toast.success(
                              language === "ru"
                                ? "Полный reload выполнен"
                                : language === "en"
                                  ? "Full reload completed"
                                  : "To'liq obnovit bajarildi"
                            );
                          } catch {
                            toast.error("Xato");
                          } finally {
                            setBotsReloadingAll(false);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all disabled:opacity-60"
                      >
                        {botsReloadingAll ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        {language === "ru"
                          ? "Обновить (сброс)"
                          : language === "en"
                            ? "Refresh (Reset)"
                            : "Obnovit (reset)"}
                      </button>
                    </div>
                  </div>

                  {adminBots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <Bot className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-slate-500 font-bold">
                        {language === "ru"
                          ? "Нет подключённых ботов"
                          : language === "en"
                            ? "No bots connected"
                            : "Ulangan bot yo'q"}
                      </p>
                    </div>
                  ) : (
                    adminBots.map((bot) => (
                      <div
                        key={bot.id}
                        className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={clsx(
                              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                              bot.isActive
                                ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            )}
                          >
                            <Bot className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-slate-800 dark:text-white truncate">
                                {bot.botName || bot.username || bot.id}
                              </span>
                              {bot.username && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  @{bot.username}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                                {bot.company.name}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(bot.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {bot.description && (
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {bot.description}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0">
                            {bot.status === "connected" ? (
                              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {language === "ru"
                                  ? "Работает"
                                  : language === "en"
                                    ? "Connected"
                                    : "Ulangan"}
                              </span>
                            ) : bot.status === "stopped" ? (
                              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
                                <XCircle className="w-3.5 h-3.5" />
                                {language === "ru"
                                  ? "Остановлен"
                                  : language === "en"
                                    ? "Stopped"
                                    : "To'xtatilgan"}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                                <Circle className="w-3.5 h-3.5" />
                                {language === "ru"
                                  ? "Не найден"
                                  : language === "en"
                                    ? "Not Found"
                                    : "Topilmadi"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex-wrap">
                          {/* Reload */}
                          <button
                            disabled={!!botActionLoading[bot.id]}
                            onClick={async () => {
                              setBotActionLoading((p) => ({
                                ...p,
                                [bot.id]: "reload",
                              }));
                              try {
                                await api.post(
                                  `/telegram/admin/bots/${bot.id}/reload`
                                );
                                const res = await api.get(
                                  "/telegram/admin/bots"
                                );
                                setAdminBots(
                                  Array.isArray(res.data) ? res.data : []
                                );
                                toast.success(
                                  language === "ru"
                                    ? "Перезапущен"
                                    : language === "en"
                                      ? "Reloaded"
                                      : "Qayta ishga tushirildi"
                                );
                              } catch {
                                toast.error("Xato");
                              } finally {
                                setBotActionLoading((p) => {
                                  const n = { ...p };
                                  delete n[bot.id];
                                  return n;
                                });
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all disabled:opacity-50"
                          >
                            {botActionLoading[bot.id] === "reload" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            {language === "ru"
                              ? "Перезапуск"
                              : language === "en"
                                ? "Reload"
                                : "Reload"}
                          </button>

                          {/* Edit token */}
                          <button
                            disabled={!!botActionLoading[bot.id]}
                            onClick={() =>
                              setBotEditModal({
                                id: bot.id,
                                token: "",
                                botName: bot.botName || "",
                                description: bot.description || "",
                                isActive: !!bot.isActive,
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all disabled:opacity-50"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            {language === "ru"
                              ? "Глубокое редактирование"
                              : language === "en"
                                ? "Deep Edit"
                                : "Chuqur edit"}
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            disabled={!!botActionLoading[bot.id]}
                            onClick={async () => {
                              setBotActionLoading((p) => ({
                                ...p,
                                [bot.id]: "toggle",
                              }));
                              try {
                                await api.patch(
                                  `/telegram/admin/bots/${bot.id}`,
                                  { isActive: !bot.isActive }
                                );
                                const res = await api.get(
                                  "/telegram/admin/bots"
                                );
                                setAdminBots(
                                  Array.isArray(res.data) ? res.data : []
                                );
                                toast.success(
                                  bot.isActive
                                    ? language === "ru"
                                      ? "Деактивирован"
                                      : language === "en"
                                        ? "Deactivated"
                                        : "O'chirildi"
                                    : language === "ru"
                                      ? "Активирован"
                                      : language === "en"
                                        ? "Activated"
                                        : "Yoqildi"
                                );
                              } catch {
                                toast.error("Xato");
                              } finally {
                                setBotActionLoading((p) => {
                                  const n = { ...p };
                                  delete n[bot.id];
                                  return n;
                                });
                              }
                            }}
                            className={clsx(
                              "flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50",
                              bot.isActive
                                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                            )}
                          >
                            {botActionLoading[bot.id] === "toggle" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                            {bot.isActive
                              ? language === "ru"
                                ? "Деактивировать"
                                : language === "en"
                                  ? "Deactivate"
                                  : "O'chirish"
                              : language === "ru"
                                ? "Активировать"
                                : language === "en"
                                  ? "Activate"
                                  : "Yoqish"}
                          </button>

                          {/* Hard delete */}
                          <button
                            disabled={!!botActionLoading[bot.id]}
                            onClick={() => setBotDeleteConfirm(bot.id)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all disabled:opacity-50 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {language === "ru"
                              ? "Удалить"
                              : language === "en"
                                ? "Delete"
                                : "O'chirish"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Create bot modal */}
                  <AnimatePresence>
                    {botCreateModal && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() =>
                            !botCreateLoading && setBotCreateModal(null)
                          }
                          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                        >
                          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <Bot className="w-5 h-5" />
                              </div>
                              <h3 className="font-black text-slate-800 dark:text-white">
                                {language === "ru"
                                  ? "Добавить Telegram-бота"
                                  : language === "en"
                                    ? "Add Telegram Bot"
                                    : "Telegram bot qo'shish"}
                              </h3>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                                  {language === "ru"
                                    ? "Дистрибьютор"
                                    : language === "en"
                                      ? "Distributor"
                                      : "Distributor"}
                                </label>
                                <select
                                  value={botCreateModal.companyId}
                                  onChange={(e) =>
                                    setBotCreateModal((p) =>
                                      p
                                        ? { ...p, companyId: e.target.value }
                                        : null
                                    )
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  <option value="">
                                    {language === "ru"
                                      ? "Выберите компанию"
                                      : language === "en"
                                        ? "Select company"
                                        : "Kompaniyani tanlang"}
                                  </option>
                                  {distributors.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name} ({d.slug})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                                  {language === "ru"
                                    ? "Токен бота"
                                    : language === "en"
                                      ? "Bot token"
                                      : "Bot tokeni"}
                                </label>
                                <input
                                  type="text"
                                  value={botCreateModal.token}
                                  onChange={(e) =>
                                    setBotCreateModal((p) =>
                                      p ? { ...p, token: e.target.value } : null
                                    )
                                  }
                                  placeholder="1234567890:AA..."
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={botCreateModal.botName}
                                  onChange={(e) =>
                                    setBotCreateModal((p) =>
                                      p
                                        ? { ...p, botName: e.target.value }
                                        : null
                                    )
                                  }
                                  placeholder={
                                    language === "ru"
                                      ? "Имя бота (необязательно)"
                                      : language === "en"
                                        ? "Bot name (optional)"
                                        : "Bot nomi (ixtiyoriy)"
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <input
                                  type="text"
                                  value={botCreateModal.description}
                                  onChange={(e) =>
                                    setBotCreateModal((p) =>
                                      p
                                        ? { ...p, description: e.target.value }
                                        : null
                                    )
                                  }
                                  placeholder={
                                    language === "ru"
                                      ? "Описание (необязательно)"
                                      : language === "en"
                                        ? "Description (optional)"
                                        : "Tavsif (ixtiyoriy)"
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <button
                                disabled={botCreateLoading}
                                onClick={() => setBotCreateModal(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                              >
                                {language === "ru"
                                  ? "Отмена"
                                  : language === "en"
                                    ? "Cancel"
                                    : "Bekor"}
                              </button>
                              <button
                                disabled={
                                  botCreateLoading ||
                                  !botCreateModal.companyId ||
                                  !botCreateModal.token.trim()
                                }
                                onClick={async () => {
                                  setBotCreateLoading(true);
                                  try {
                                    await api.post("/telegram/admin/bots", {
                                      companyId: botCreateModal.companyId,
                                      token: botCreateModal.token.trim(),
                                      botName:
                                        botCreateModal.botName.trim() ||
                                        undefined,
                                      description:
                                        botCreateModal.description.trim() ||
                                        undefined,
                                    });
                                    const res = await api.get(
                                      "/telegram/admin/bots"
                                    );
                                    setAdminBots(
                                      Array.isArray(res.data) ? res.data : []
                                    );
                                    setBotCreateModal(null);
                                    toast.success(
                                      language === "ru"
                                        ? "Бот добавлен"
                                        : language === "en"
                                          ? "Bot added"
                                          : "Bot qo'shildi"
                                    );
                                  } catch (e: any) {
                                    const message =
                                      e?.response?.data?.message ||
                                      e?.message ||
                                      (language === "ru"
                                        ? "Ошибка при добавлении бота"
                                        : language === "en"
                                          ? "Failed to add bot"
                                          : "Bot qo'shishda xatolik");
                                    toast.error(
                                      Array.isArray(message)
                                        ? message[0]
                                        : message
                                    );
                                  } finally {
                                    setBotCreateLoading(false);
                                  }
                                }}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 inline-flex items-center justify-center"
                              >
                                {botCreateLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : language === "ru" ? (
                                  "Добавить"
                                ) : language === "en" ? (
                                  "Add"
                                ) : (
                                  "Qo'shish"
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Edit token modal */}
                  <AnimatePresence>
                    {botEditModal && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setBotEditModal(null)}
                          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                        >
                          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600">
                                <KeyRound className="w-5 h-5" />
                              </div>
                              <h3 className="font-black text-slate-800 dark:text-white">
                                {language === "ru"
                                  ? "Глубокое обновление бота"
                                  : language === "en"
                                    ? "Deep Bot Update"
                                    : "Botni chuqur yangilash"}
                              </h3>
                            </div>
                            <div className="space-y-3 mb-4">
                              <input
                                type="text"
                                value={botEditModal.botName}
                                onChange={(e) =>
                                  setBotEditModal((p) =>
                                    p ? { ...p, botName: e.target.value } : null
                                  )
                                }
                                placeholder={
                                  language === "ru"
                                    ? "Название бота"
                                    : language === "en"
                                      ? "Bot name"
                                      : "Bot nomi"
                                }
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                              />
                              <input
                                type="text"
                                value={botEditModal.description}
                                onChange={(e) =>
                                  setBotEditModal((p) =>
                                    p
                                      ? { ...p, description: e.target.value }
                                      : null
                                  )
                                }
                                placeholder={
                                  language === "ru"
                                    ? "Описание"
                                    : language === "en"
                                      ? "Description"
                                      : "Tavsif"
                                }
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                              />
                              <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-200">
                                <span>
                                  {language === "ru"
                                    ? "Активный"
                                    : language === "en"
                                      ? "Active"
                                      : "Faol"}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={botEditModal.isActive}
                                  onChange={(e) =>
                                    setBotEditModal((p) =>
                                      p
                                        ? { ...p, isActive: e.target.checked }
                                        : null
                                    )
                                  }
                                  className="w-4 h-4"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={botEditModal.token}
                              onChange={(e) =>
                                setBotEditModal((p) =>
                                  p ? { ...p, token: e.target.value } : null
                                )
                              }
                              placeholder={
                                language === "ru"
                                  ? "Новый токен (опционально)"
                                  : language === "en"
                                    ? "New bot token (optional)"
                                    : "Yangi bot token (ixtiyoriy)"
                              }
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => setBotEditModal(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                              >
                                {language === "ru"
                                  ? "Отмена"
                                  : language === "en"
                                    ? "Cancel"
                                    : "Bekor"}
                              </button>
                              <button
                                disabled={!!botActionLoading[botEditModal.id]}
                                onClick={async () => {
                                  const {
                                    id,
                                    token,
                                    botName,
                                    description,
                                    isActive,
                                  } = botEditModal;
                                  setBotActionLoading((p) => ({
                                    ...p,
                                    [id]: "token",
                                  }));
                                  try {
                                    const payload: Record<string, unknown> = {
                                      botName: botName.trim(),
                                      description: description.trim(),
                                      isActive,
                                    };
                                    if (token.trim()) {
                                      payload.token = token.trim();
                                    }
                                    await api.patch(
                                      `/telegram/admin/bots/${id}`,
                                      payload
                                    );
                                    const res = await api.get(
                                      "/telegram/admin/bots"
                                    );
                                    setAdminBots(
                                      Array.isArray(res.data) ? res.data : []
                                    );
                                    setBotEditModal(null);
                                    toast.success(
                                      language === "ru"
                                        ? "Токен обновлён"
                                        : language === "en"
                                          ? "Token updated"
                                          : "Token yangilandi"
                                    );
                                  } catch {
                                    toast.error("Xato");
                                  } finally {
                                    setBotActionLoading((p) => {
                                      const n = { ...p };
                                      delete n[id];
                                      return n;
                                    });
                                  }
                                }}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all disabled:opacity-50"
                              >
                                {botActionLoading[botEditModal.id] ===
                                "token" ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : language === "ru" ? (
                                  "Сохранить"
                                ) : language === "en" ? (
                                  "Save"
                                ) : (
                                  "Saqlash"
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Hard delete confirmation modal */}
                  <AnimatePresence>
                    {botDeleteConfirm && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setBotDeleteConfirm(null)}
                          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                        >
                          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 mx-auto mb-4">
                              <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-white mb-2">
                              {language === "ru"
                                ? "Удалить бота?"
                                : language === "en"
                                  ? "Delete bot?"
                                  : "Botni o'chirish?"}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                              {language === "ru"
                                ? "Это действие необратимо. Бот будет остановлен и удалён из базы данных."
                                : language === "en"
                                  ? "This action is irreversible. The bot will be stopped and permanently deleted."
                                  : "Bu amal qaytarib bo'lmaydi. Bot to'xtatiladi va bazadan o'chiriladi."}
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setBotDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                              >
                                {language === "ru"
                                  ? "Отмена"
                                  : language === "en"
                                    ? "Cancel"
                                    : "Bekor"}
                              </button>
                              <button
                                disabled={!!botActionLoading[botDeleteConfirm]}
                                onClick={async () => {
                                  const id = botDeleteConfirm;
                                  setBotActionLoading((p) => ({
                                    ...p,
                                    [id]: "delete",
                                  }));
                                  try {
                                    await api.delete(
                                      `/telegram/admin/bots/${id}`
                                    );
                                    setAdminBots((p) =>
                                      p.filter((b) => b.id !== id)
                                    );
                                    setBotDeleteConfirm(null);
                                    toast.success(
                                      language === "ru"
                                        ? "Удалён"
                                        : language === "en"
                                          ? "Deleted"
                                          : "O'chirildi"
                                    );
                                  } catch {
                                    toast.error("Xato");
                                  } finally {
                                    setBotActionLoading((p) => {
                                      const n = { ...p };
                                      delete n[id];
                                      return n;
                                    });
                                  }
                                }}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50"
                              >
                                {botActionLoading[botDeleteConfirm] ===
                                "delete" ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : language === "ru" ? (
                                  "Удалить"
                                ) : language === "en" ? (
                                  "Delete"
                                ) : (
                                  "O'chirish"
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* /flex-1 min-w-0 */}
      </div>
      {/* /flex gap-6 sidebar+content */}

      {/* Lead Detail Panel */}
      <AnimatePresence>
        {viewingLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingLead(null)}
              className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-[91] w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-200 dark:border-emerald-900/50">
                    {viewingLead.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {viewingLead.fullName}
                    </h3>
                    <p className="text-sm text-slate-400 font-semibold">
                      {viewingLead.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingLead(null)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Holat
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "NEW",
                      "CONTACTED",
                      "QUALIFIED",
                      "CONVERTED",
                      "REJECTED",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={async () => {
                          try {
                            await api.patch(`/super/leads/${viewingLead.id}`, {
                              status: s,
                            });
                            setViewingLead((v) =>
                              v ? { ...v, status: s } : null
                            );
                            setLeads((ls) =>
                              ls.map((l) =>
                                l.id === viewingLead.id
                                  ? { ...l, status: s }
                                  : l
                              )
                            );
                          } catch {
                            toast.error(t.common.error);
                          }
                        }}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          viewingLead.status === s
                            ? LEAD_STATUS_COLORS[s] +
                                " ring-2 ring-offset-1 ring-current"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-400"
                        )}
                      >
                        {getLeadStatusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Yuborgan xabar
                  </label>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10">
                    {viewingLead.info ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-wrap">
                        {viewingLead.info}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-300 italic">
                        Xabar yuborilmagan
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Ma'lumotlar
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-bold text-slate-400">
                        Ro'yxatga olingan sana
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {format(
                          new Date(viewingLead.createdAt),
                          "dd MMM yyyy, HH:mm",
                          { locale: locales[language] || uz }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-xs font-bold text-slate-400">
                        ID
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {viewingLead.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel footer */}
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3">
                <button
                  onClick={() => {
                    setEditingItem(viewingLead);
                    setLeadForm({
                      fullName: viewingLead.fullName,
                      phone: viewingLead.phone,
                      info: viewingLead.info || "",
                      status: viewingLead.status,
                    });
                    setIsLeadModalOpen(true);
                    setViewingLead(null);
                  }}
                  className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Tahrirlash
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(t.superadmin.confirmDeleteLead)) return;
                    try {
                      await api.delete(`/super/leads/${viewingLead.id}`);
                      toast.success(t.superadmin.deleted);
                      setViewingLead(null);
                      fetchData();
                    } catch {
                      toast.error(t.superadmin.failedToDelete);
                    }
                  }}
                  className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal Placeholder Removed */}

      {/* Create Distributor Modal */}
      <AnimatePresence>
        {isDistModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-4xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">
                  {t.superadmin.createDistributor}
                </h2>
                <button
                  onClick={() => setIsDistModalOpen(false)}
                  className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "companyName",
                    label: t.superadmin.companyNameLabel,
                    type: "text",
                  },
                  { key: "slug", label: t.superadmin.slugLabel, type: "text" },
                  {
                    key: "phone",
                    label: t.superadmin.phoneLoginLabel,
                    type: "text",
                  },
                  {
                    key: "fullName",
                    label: t.superadmin.fullNameLabel,
                    type: "text",
                  },
                  {
                    key: "password",
                    label: t.superadmin.passwordLabel2,
                    type: "password",
                  },
                  {
                    key: "trialDays",
                    label: t.superadmin.trialDaysLabel,
                    type: "number",
                  },
                ].map(({ key, label, type }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={(distForm as any)[key]}
                      onChange={(e) =>
                        setDistForm((f) => ({
                          ...f,
                          [key]:
                            type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-500 text-sm font-bold outline-none"
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.superadmin.subscriptionPlanLabel}
                  </label>
                  <select
                    value={distForm.subscriptionPlan}
                    onChange={(e) =>
                      setDistForm((f) => ({
                        ...f,
                        subscriptionPlan: e.target.value,
                      }))
                    }
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-500 text-sm font-bold outline-none"
                  >
                    {["FREE", "START", "PRO", "PREMIUM"].map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                disabled={
                  distSaving ||
                  !distForm.companyName ||
                  !distForm.phone ||
                  !distForm.password ||
                  !distForm.slug
                }
                onClick={async () => {
                  try {
                    setDistSaving(true);
                    await api.post("/super/distributors", distForm);
                    toast.success(t.superadmin.distributorCreated);
                    setIsDistModalOpen(false);
                    setDistForm(emptyDistForm);
                    const res = await api.get("/super/distributors");
                    setDistributors(
                      Array.isArray(res.data)
                        ? res.data
                        : (res.data?.items ?? [])
                    );
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message ?? t.common.error);
                  } finally {
                    setDistSaving(false);
                  }
                }}
                className="w-full py-4 premium-gradient text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              >
                {distSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {t.superadmin.createDistributor}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* News Modal */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[3rem] p-10 shadow-4xl space-y-8 no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">
                  {editingItem
                    ? t.superadmin.editArticle
                    : t.superadmin.newArticleBtn}
                </h2>
                <button
                  onClick={() => setIsNewsModalOpen(false)}
                  className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cover image */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t.superadmin.coverImage}
                </label>
                <ImageUploader
                  value={newsForm.image}
                  onChange={(url) => setNewsForm((f) => ({ ...f, image: url }))}
                  onRemove={() => setNewsForm((f) => ({ ...f, image: "" }))}
                  label="Upload Cover Image"
                  className="h-44"
                />
              </div>

              {/* Publish toggle */}
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <span className="text-sm font-black">
                  {t.superadmin.publishNow}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setNewsForm((f) => ({ ...f, isPublished: !f.isPublished }))
                  }
                  className={clsx(
                    "w-14 h-7 rounded-full relative transition-all duration-300",
                    newsForm.isPublished
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-white/10"
                  )}
                >
                  <div
                    className={clsx(
                      "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all",
                      newsForm.isPublished ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Language tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {(["Uz", "En", "Ru", "Tr", "UzCyr"] as const).map((lk) => (
                  <button
                    key={lk}
                    type="button"
                    onClick={() => setNewsLangTab(lk)}
                    className={clsx(
                      "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shrink-0 transition-all",
                      newsLangTab === lk
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10"
                    )}
                  >
                    {lk === "UzCyr" ? "Ўзб" : lk}
                  </button>
                ))}
              </div>

              {/* Language-specific fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      {t.superadmin.titleField}
                    </label>
                    <input
                      type="text"
                      value={
                        (newsForm as unknown as Record<string, string>)[
                          `title${newsLangTab}`
                        ] || ""
                      }
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          [`title${newsLangTab}`]: e.target.value,
                        })
                      }
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      {t.superadmin.slugField}
                    </label>
                    <input
                      type="text"
                      value={
                        (newsForm as unknown as Record<string, string>)[
                          `slug${newsLangTab}`
                        ] || ""
                      }
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          [`slug${newsLangTab}`]: e.target.value,
                        })
                      }
                      placeholder="my-article-slug"
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm font-mono focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {t.superadmin.excerptField}
                  </label>
                  <textarea
                    rows={2}
                    value={
                      (newsForm as unknown as Record<string, string>)[
                        `excerpt${newsLangTab}`
                      ] || ""
                    }
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        [`excerpt${newsLangTab}`]: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm resize-none focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {t.superadmin.contentField}
                  </label>
                  <textarea
                    rows={7}
                    value={
                      (newsForm as unknown as Record<string, string>)[
                        `content${newsLangTab}`
                      ] || ""
                    }
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        [`content${newsLangTab}`]: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm resize-none focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      if (editingItem)
                        await api.patch(
                          `/super/news/${editingItem.id}`,
                          newsForm
                        );
                      else await api.post("/super/news", newsForm);
                      toast.success(t.superadmin.articleSaved);
                      setIsNewsModalOpen(false);
                      fetchData();
                    } catch {
                      toast.error(t.superadmin.failedToSave);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  {t.common.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tariff Modal */}
      <AnimatePresence>
        {isTariffModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-12 shadow-4xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">
                  {editingItem
                    ? t.superadmin.editTariff
                    : t.superadmin.newTariffBtn}
                </h2>
                <button
                  onClick={() => setIsTariffModalOpen(false)}
                  className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto px-2 no-scrollbar">
                {["Uz", "Ru", "En", "Tr", "UzCyr"].map((langKey) => (
                  <div
                    key={langKey}
                    className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5 first:border-0 first:pt-0"
                  >
                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">
                      {langKey}
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                          {t.superadmin.fullNameLabel} ({langKey})
                        </label>
                        <input
                          type="text"
                          value={
                            (tariffForm as unknown as Record<string, string>)[
                              `name${langKey}`
                            ] || ""
                          }
                          onChange={(e) =>
                            setTariffForm({
                              ...tariffForm,
                              [`name${langKey}`]: e.target.value,
                            })
                          }
                          className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                          {t.superadmin.featureFlags} ({langKey}) —{" "}
                          {t.superadmin.featuresHint}
                        </label>
                        <textarea
                          rows={3}
                          value={(
                            (tariffForm as unknown as Record<string, string[]>)[
                              `features${langKey}`
                            ] || []
                          ).join("\n")}
                          onChange={(e) =>
                            setTariffForm({
                              ...tariffForm,
                              [`features${langKey}`]: e.target.value
                                .split("\n")
                                .filter((x) => x.trim()),
                            })
                          }
                          className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                          placeholder="Premium Support&#10;Unlimited Dealers&#10;..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.superadmin.pricingSection}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {t.superadmin.tarifName} (FREE/START/PRO/PREMIUM)
                      </label>
                      <input
                        type="text"
                        value={tariffForm.planKey || ""}
                        onChange={(e) =>
                          setTariffForm({
                            ...tariffForm,
                            planKey: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm uppercase"
                        placeholder="FREE"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {t.superadmin.orderIndex}
                      </label>
                      <input
                        type="number"
                        value={tariffForm.order}
                        onChange={(e) =>
                          setTariffForm({
                            ...tariffForm,
                            order: +e.target.value,
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {t.superadmin.monthlyPrice2}
                      </label>
                      <input
                        type="number"
                        value={tariffForm.priceMonthly || 0}
                        onChange={(e) =>
                          setTariffForm({
                            ...tariffForm,
                            priceMonthly: e.target.value,
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {t.superadmin.yearlyPrice}
                      </label>
                      <input
                        type="number"
                        value={tariffForm.priceYearly || 0}
                        onChange={(e) =>
                          setTariffForm({
                            ...tariffForm,
                            priceYearly: e.target.value,
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {t.superadmin.trialDays2}
                      </label>
                      <input
                        type="number"
                        value={tariffForm.trialDays || 14}
                        onChange={(e) =>
                          setTariffForm({
                            ...tariffForm,
                            trialDays: +e.target.value,
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {t.superadmin.priceDisplay}
                      </label>
                      <input
                        type="text"
                        value={tariffForm.price || ""}
                        onChange={(e) =>
                          setTariffForm({
                            ...tariffForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                        placeholder="Free / 99,000 UZS"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.superadmin.limits}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "maxBranches", label: t.superadmin.maxBranches },
                      { key: "maxUsers", label: t.superadmin.maxUsers },
                      { key: "maxCustomBots", label: "Telegram Bots" },
                      { key: "maxDealers", label: t.superadmin.maxDealers },
                      { key: "maxProducts", label: t.superadmin.maxProducts },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                          {label}
                        </label>
                        <input
                          type="number"
                          value={
                            (tariffForm as Record<string, number>)[key] ?? 0
                          }
                          onChange={(e) =>
                            setTariffForm({
                              ...tariffForm,
                              [key]: +e.target.value,
                            })
                          }
                          className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.superadmin.featureFlags}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        key: "isPopular",
                        label: t.superadmin.popularBadge,
                        color: "accent-blue-600",
                      },
                      {
                        key: "isActive",
                        label: t.superadmin.activeBadge,
                        color: "accent-emerald-600",
                      },
                      {
                        key: "allowAnalytics",
                        label: t.sidebar.analytics,
                        color: "accent-indigo-600",
                      },
                      {
                        key: "allowCustomBot",
                        label: "Custom Bot",
                        color: "accent-emerald-600",
                      },
                      {
                        key: "allowWebStore",
                        label: "Web Store",
                        color: "accent-blue-600",
                      },
                      {
                        key: "allowBulkImport",
                        label: "Bulk Import",
                        color: "accent-violet-600",
                      },
                      {
                        key: "allowNotifications",
                        label: t.superadmin.notifyTab,
                        color: "accent-amber-600",
                      },
                      {
                        key: "allowMultiCompany",
                        label: "Multi Company",
                        color: "accent-rose-600",
                      },
                    ].map(({ key, label, color }) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl"
                      >
                        <input
                          type="checkbox"
                          checked={
                            !!(tariffForm as Record<string, boolean>)[key]
                          }
                          onChange={(e) =>
                            setTariffForm({
                              ...tariffForm,
                              [key]: e.target.checked,
                            })
                          }
                          className={`w-5 h-5 ${color}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setIsTariffModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      if (editingItem)
                        await api.patch(
                          `/super/tariffs/${editingItem.id}`,
                          tariffForm
                        );
                      else await api.post("/super/tariffs", tariffForm);
                      toast.success(t.superadmin.tariffSaved);
                      setIsTariffModalOpen(false);
                      fetchData();
                    } catch {
                      toast.error(t.common.error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  {t.common.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Modal */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-12 shadow-4xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">
                  {editingItem
                    ? t.superadmin.editLead
                    : t.superadmin.newLeadBtn}
                </h2>
                <button
                  onClick={() => setIsLeadModalOpen(false)}
                  className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {t.superadmin.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={leadForm.fullName}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, fullName: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {t.superadmin.phone}
                  </label>
                  <input
                    type="text"
                    value={leadForm.phone}
                    onChange={(e) =>
                      setLeadForm({
                        ...leadForm,
                        phone: formatPhoneNumber(e.target.value),
                      })
                    }
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {t.superadmin.leadStatus}
                  </label>
                  <select
                    value={leadForm.status}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, status: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black uppercase tracking-widest text-xs"
                  >
                    <option value="NEW">{t.superadmin.leadNew}</option>
                    <option value="CONTACTED">
                      {t.superadmin.leadContacted}
                    </option>
                    <option value="QUALIFIED">
                      {getLeadStatusLabel("QUALIFIED")}
                    </option>
                    <option value="CONVERTED">
                      {t.superadmin.leadConverted}
                    </option>
                    <option value="REJECTED">
                      {t.superadmin.leadRejected}
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const finalForm = {
                        ...leadForm,
                        phone: unformatPhoneNumber(leadForm.phone || ""),
                      };
                      if (editingItem)
                        await api.patch(
                          `/super/leads/${editingItem.id}`,
                          finalForm
                        );
                      else await api.post("/super/leads", finalForm);
                      toast.success(t.superadmin.leadSaved);
                      setIsLeadModalOpen(false);
                      fetchData();
                    } catch {
                      toast.error(t.common.error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  {t.common.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {subscriptionTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-4xl space-y-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Tarifni uzaytirish
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {subscriptionTarget.name}
                  </p>
                </div>
                <button
                  onClick={() => setSubscriptionTarget(null)}
                  className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Yangi tugash sanasi
                </label>
                <input
                  type="date"
                  value={subscriptionExpiresAt}
                  onChange={(e) => setSubscriptionExpiresAt(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold"
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button
                  onClick={() => setSubscriptionTarget(null)}
                  className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  disabled={subscriptionSaving || !subscriptionExpiresAt}
                  onClick={async () => {
                    if (!subscriptionTarget || !subscriptionExpiresAt) return;
                    try {
                      setSubscriptionSaving(true);
                      await api.patch(
                        `/super/distributors/${subscriptionTarget.id}/subscription`,
                        { expiresAt: subscriptionExpiresAt }
                      );
                      toast.success("Tarif yangilandi");
                      setSubscriptionTarget(null);
                      const res = await api.get("/super/distributors");
                      setDistributors(
                        Array.isArray(res.data)
                          ? res.data
                          : (res.data?.items ?? [])
                      );
                    } catch {
                      toast.error(t.common.error);
                    } finally {
                      setSubscriptionSaving(false);
                    }
                  }}
                  className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {subscriptionSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResetPasswordModalOpen && resetPasswordTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-4xl space-y-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Distributor parolini yangilash
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {resetPasswordTarget.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Yangi owner paroli
                </label>
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold"
                  placeholder="Kamida 6 ta belgi"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold px-1">
                  Ushbu amal distributor kompaniyasining `OWNER` user parolini
                  yangilash imkonini beradi.
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-6 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={async () => {
                    if (resetPasswordValue.length < 6) {
                      toast.error("Parol kamida 6 ta belgi bo‘lishi kerak");
                      return;
                    }
                    try {
                      setLoading(true);
                      await api.patch(
                        `/super/distributors/${resetPasswordTarget.id}/owner-password`,
                        {
                          password: resetPasswordValue,
                        }
                      );
                      toast.success(
                        `${resetPasswordTarget.name}: parol yangilandi`
                      );
                      setResetPasswordValue("");
                      setIsResetPasswordModalOpen(false);
                    } catch {
                      toast.error(t.common.error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-8 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  Parolni yangilash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 shadow-4xl text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-600/10 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">
                  {t.superadmin.securityConfirm}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                  {t.superadmin.adminPasswordDesc}
                </p>
              </div>
              <input
                type="password"
                placeholder={t.superadmin.passwordLabel}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmAction()}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-center text-xl font-black tracking-widest focus:border-blue-600 outline-none transition-all"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  {t.common.confirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
