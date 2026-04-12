--
-- PostgreSQL database dump
--

\restrict UeAz2tKCS1BkEDEKNunF8U5KksrDJ4xUi5JSEsGopBXGfcdRJkNgTMCFawWPB1Z

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: BackupFrequency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BackupFrequency" AS ENUM (
    'HOURLY',
    'DAILY',
    'WEEKLY'
);


ALTER TYPE public."BackupFrequency" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'PREPARING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'RETURNED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleType" AS ENUM (
    'SUPER_ADMIN',
    'OWNER',
    'MANAGER',
    'SALES',
    'DELIVERY',
    'CUSTOM',
    'SELLER'
);


ALTER TYPE public."RoleType" OWNER TO postgres;

--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'FREE',
    'START',
    'PRO',
    'PREMIUM'
);


ALTER TYPE public."SubscriptionPlan" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'LOCKED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: TxType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TxType" AS ENUM (
    'ORDER',
    'PAYMENT',
    'ADJUSTMENT',
    'EXPENSE',
    'REFUND'
);


ALTER TYPE public."TxType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    resource text,
    metadata jsonb,
    ip text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."Branch" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    website text,
    instagram text,
    telegram text,
    "siteActive" boolean DEFAULT true NOT NULL,
    "isDemo" boolean DEFAULT false NOT NULL,
    "subscriptionPlan" public."SubscriptionPlan" DEFAULT 'FREE'::public."SubscriptionPlan" NOT NULL,
    "subscriptionStatus" public."SubscriptionStatus" DEFAULT 'TRIAL'::public."SubscriptionStatus" NOT NULL,
    "trialExpiresAt" timestamp(3) without time zone NOT NULL,
    "dbConnectionUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "cashbackPercent" double precision DEFAULT 0 NOT NULL,
    "adminLogBotToken" text,
    facebook text,
    tiktok text,
    "workingHours" text,
    youtube text
);


ALTER TABLE public."Company" OWNER TO postgres;

--
-- Name: CustomBot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CustomBot" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    token text NOT NULL,
    username text,
    "isActive" boolean DEFAULT true NOT NULL,
    "hasWebApp" boolean DEFAULT true NOT NULL,
    watermark boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "botName" text,
    description text,
    "webhookUrl" text
);


ALTER TABLE public."CustomBot" OWNER TO postgres;

--
-- Name: CustomRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CustomRole" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    permissions jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomRole" OWNER TO postgres;

--
-- Name: Dealer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Dealer" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "branchId" text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    address text,
    "creditLimit" double precision DEFAULT 0 NOT NULL,
    "currentDebt" double precision DEFAULT 0 NOT NULL,
    "telegramChatId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "cashbackBalance" double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."Dealer" OWNER TO postgres;

--
-- Name: DealerApprovalRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealerApprovalRequest" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "dealerId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    note text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedBy" text
);


ALTER TABLE public."DealerApprovalRequest" OWNER TO postgres;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "branchId" text,
    amount double precision NOT NULL,
    category text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."Expense" OWNER TO postgres;

--
-- Name: FeatureFlag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FeatureFlag" (
    id text NOT NULL,
    "companyId" text,
    "featureKey" text NOT NULL,
    "isEnabled" boolean DEFAULT false NOT NULL,
    "planLevel" public."SubscriptionPlan",
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FeatureFlag" OWNER TO postgres;

--
-- Name: LandingContent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LandingContent" (
    id text DEFAULT 'LANDING'::text NOT NULL,
    "heroTitleUz" text DEFAULT ''::text NOT NULL,
    "heroTitleRu" text DEFAULT ''::text NOT NULL,
    "heroTitleEn" text DEFAULT ''::text NOT NULL,
    "heroTitleTr" text DEFAULT ''::text NOT NULL,
    "heroSubtitleUz" text DEFAULT ''::text NOT NULL,
    "heroSubtitleRu" text DEFAULT ''::text NOT NULL,
    "heroSubtitleEn" text DEFAULT ''::text NOT NULL,
    "heroSubtitleTr" text DEFAULT ''::text NOT NULL,
    "heroBadgeUz" text DEFAULT ''::text NOT NULL,
    "heroBadgeRu" text DEFAULT ''::text NOT NULL,
    "heroBadgeEn" text DEFAULT ''::text NOT NULL,
    "heroBadgeTr" text DEFAULT ''::text NOT NULL,
    "contactPhone" text,
    "contactEmail" text,
    "socialTelegram" text,
    "socialLinkedin" text,
    "socialTwitter" text,
    "footerDescUz" text DEFAULT ''::text NOT NULL,
    "footerDescRu" text DEFAULT ''::text NOT NULL,
    "footerDescEn" text DEFAULT ''::text NOT NULL,
    "footerDescTr" text DEFAULT ''::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contactAddress" text,
    "contactAddressUrl" text,
    "contactPhoneHref" text,
    "socialInstagram" text
);


ALTER TABLE public."LandingContent" OWNER TO postgres;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    info text,
    status text DEFAULT 'NEW'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Lead" OWNER TO postgres;

--
-- Name: LedgerTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LedgerTransaction" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "branchId" text,
    "dealerId" text,
    type public."TxType" NOT NULL,
    amount double precision NOT NULL,
    reference text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."LedgerTransaction" OWNER TO postgres;

--
-- Name: News; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."News" (
    id text NOT NULL,
    "slugUz" text NOT NULL,
    "slugRu" text NOT NULL,
    "slugEn" text NOT NULL,
    "slugUzCyr" text NOT NULL,
    "slugTr" text NOT NULL,
    "titleUz" text NOT NULL,
    "titleRu" text NOT NULL,
    "titleEn" text NOT NULL,
    "titleUzCyr" text NOT NULL,
    "titleTr" text DEFAULT ''::text NOT NULL,
    "excerptUz" text,
    "excerptRu" text,
    "excerptEn" text,
    "excerptUzCyr" text,
    "excerptTr" text,
    "contentUz" text NOT NULL,
    "contentRu" text NOT NULL,
    "contentEn" text NOT NULL,
    "contentUzCyr" text NOT NULL,
    "contentTr" text DEFAULT ''::text NOT NULL,
    image text,
    "authorId" text,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."News" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "senderId" text,
    "receiverUserId" text,
    "receiverDealerId" text,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    type text DEFAULT 'INFO'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: NotificationLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationLog" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "templateId" text,
    "dealerId" text,
    message text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."NotificationLog" OWNER TO postgres;

--
-- Name: NotificationTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationTemplate" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    message jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."NotificationTemplate" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "dealerId" text NOT NULL,
    "branchId" text NOT NULL,
    "totalAmount" double precision NOT NULL,
    "totalCost" double precision DEFAULT 0 NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    items jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    note text
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "branchId" text,
    "dealerId" text NOT NULL,
    amount double precision NOT NULL,
    method text NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    note text
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    sku text,
    description text,
    "costPrice" double precision DEFAULT 0 NOT NULL,
    price double precision NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    unit text DEFAULT 'pcs'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "categoryId" text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "subcategoryId" text,
    "unitId" text,
    "discountPrice" double precision,
    "isPromo" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ReleaseNote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReleaseNote" (
    id text NOT NULL,
    version text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReleaseNote" OWNER TO postgres;

--
-- Name: ServerMetric; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ServerMetric" (
    id text NOT NULL,
    "cpuUsage" double precision NOT NULL,
    "ramUsage" double precision NOT NULL,
    "activeUsers" integer NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ServerMetric" OWNER TO postgres;

--
-- Name: Subcategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subcategory" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."Subcategory" OWNER TO postgres;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    plan public."SubscriptionPlan" NOT NULL,
    status public."SubscriptionStatus" NOT NULL,
    amount double precision DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO postgres;

--
-- Name: SupportMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportMessage" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "senderId" text,
    "senderType" text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupportMessage" OWNER TO postgres;

--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'OPEN'::text NOT NULL,
    "lastReplyAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportTicket" OWNER TO postgres;

--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSettings" (
    id text DEFAULT 'GLOBAL'::text NOT NULL,
    "maintenanceMode" boolean DEFAULT false NOT NULL,
    "backupFrequency" public."BackupFrequency" DEFAULT 'DAILY'::public."BackupFrequency" NOT NULL,
    "lastBackupAt" timestamp(3) without time zone,
    "defaultTrialDays" integer DEFAULT 14 NOT NULL,
    "newsEnabled" boolean DEFAULT true NOT NULL,
    "superAdminPhone" text,
    "systemVersion" text DEFAULT '1.0.0'::text NOT NULL,
    "globalNotifyUz" text,
    "globalNotifyRu" text,
    "globalNotifyEn" text,
    "globalNotifyTr" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "termsUz" text,
    "termsRu" text,
    "termsEn" text,
    "termsUzCyr" text,
    "privacyUz" text,
    "privacyRu" text,
    "privacyEn" text,
    "privacyUzCyr" text
);


ALTER TABLE public."SystemSettings" OWNER TO postgres;

--
-- Name: TariffPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TariffPlan" (
    id text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "nameUz" text NOT NULL,
    "nameRu" text NOT NULL,
    "nameEn" text NOT NULL,
    "nameTr" text DEFAULT ''::text NOT NULL,
    "nameUzCyr" text DEFAULT ''::text NOT NULL,
    price text NOT NULL,
    "featuresUz" jsonb NOT NULL,
    "featuresRu" jsonb NOT NULL,
    "featuresEn" jsonb NOT NULL,
    "featuresTr" jsonb,
    "featuresUzCyr" jsonb,
    "isPopular" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "allowAnalytics" boolean DEFAULT false NOT NULL,
    "allowBulkImport" boolean DEFAULT false NOT NULL,
    "allowCustomBot" boolean DEFAULT false NOT NULL,
    "allowMultiCompany" boolean DEFAULT false NOT NULL,
    "allowNotifications" boolean DEFAULT true NOT NULL,
    "allowWebStore" boolean DEFAULT true NOT NULL,
    "maxBranches" integer DEFAULT 1 NOT NULL,
    "maxDealers" integer DEFAULT 100 NOT NULL,
    "maxProducts" integer DEFAULT 500 NOT NULL,
    "maxUsers" integer DEFAULT 5 NOT NULL,
    "planKey" text DEFAULT 'FREE'::text NOT NULL,
    "priceMonthly" text DEFAULT '0'::text NOT NULL,
    "priceYearly" text DEFAULT '0'::text NOT NULL,
    "trialDays" integer DEFAULT 14 NOT NULL,
    "maxCustomBots" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."TariffPlan" OWNER TO postgres;

--
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Testimonial" (
    id text NOT NULL,
    name text NOT NULL,
    company text,
    "roleTitle" text,
    "contentUz" text DEFAULT ''::text NOT NULL,
    "contentRu" text DEFAULT ''::text NOT NULL,
    "contentEn" text DEFAULT ''::text NOT NULL,
    "contentTr" text DEFAULT ''::text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    avatar text,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Testimonial" OWNER TO postgres;

--
-- Name: Unit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Unit" (
    id text NOT NULL,
    "companyId" text,
    name text NOT NULL,
    symbol text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Unit" OWNER TO postgres;

--
-- Name: UpgradeRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UpgradeRequest" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "companyName" text NOT NULL,
    "currentPlan" text NOT NULL,
    "requestedPlan" text,
    "ownerPhone" text NOT NULL,
    "ownerName" text,
    "dealersCount" integer DEFAULT 0 NOT NULL,
    "usersCount" integer DEFAULT 0 NOT NULL,
    "branchesCount" integer DEFAULT 0 NOT NULL,
    "productsCount" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UpgradeRequest" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "branchId" text,
    phone text NOT NULL,
    "passwordHash" text NOT NULL,
    "fullName" text,
    "photoUrl" text DEFAULT '/favicon.png'::text,
    "roleType" public."RoleType" NOT NULL,
    "customRoleId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    language text DEFAULT 'uz'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, resource, metadata, ip, "createdAt") FROM stdin;
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Branch" (id, "companyId", name, address, phone, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
5d6566ed-592b-4fa7-a851-a361a13eae9c	2558c501-89df-4695-b56c-fbe600529b21	Tashkent Main Hub	Tashkent, Yunusobod	\N	2026-03-28 18:21:44.622	2026-03-28 18:21:44.622	\N	\N
a8eb809c-172e-4d8a-a0b7-805f8286439f	2558c501-89df-4695-b56c-fbe600529b21	Samarkand Branch	Samarkand shahar	\N	2026-03-28 18:21:44.624	2026-03-28 18:21:44.624	\N	\N
17c263ab-70a9-4bdd-a67f-d8cb8e330972	677fe634-603d-4723-8c85-afff22b41391	Demo Hub	\N	\N	2026-03-28 18:21:44.894	2026-03-28 18:21:44.894	\N	\N
b6ee5c42-edfe-4780-85f7-af78b91885c0	372dcf39-46c6-4fef-a349-808c82dc8d8a	Sergeli office	Navro'z 29	+998200116877	2026-03-28 18:46:21.831	2026-03-28 18:46:21.831	\N	\N
021f39ca-2b92-4d45-8549-3c02e4493d1e	49e18d1f-089d-482a-81c8-b11f0c8a067a	Main distribution Hub	Demo City, St 1	\N	2026-03-29 16:14:07.181	2026-03-29 16:14:07.181	\N	\N
e23a801b-22e3-4e63-8aa9-7c91855ab84b	33930263-cce8-4ffb-9b22-07ff6b07a268	Toshkent bosh filial	Test manzil 1	+998900001001	2026-04-12 17:37:58.131	2026-04-12 17:37:58.131	\N	\N
f6736eff-d631-4f50-86f6-ad3187d95ecf	33930263-cce8-4ffb-9b22-07ff6b07a268	Andijon filiali	Test manzil 3	+998900001003	2026-04-12 17:37:58.131	2026-04-12 17:37:58.131	\N	\N
fcecf24d-f041-4838-95da-549726630e12	33930263-cce8-4ffb-9b22-07ff6b07a268	Namangan filiali	Test manzil 4	+998900001004	2026-04-12 17:37:58.131	2026-04-12 17:37:58.131	\N	\N
3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	33930263-cce8-4ffb-9b22-07ff6b07a268	Samarqand filiali	Test manzil 2	+998900001002	2026-04-12 17:37:58.131	2026-04-12 17:37:58.131	\N	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, "companyId", name, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
136299ef-398d-49a3-a896-1b6f1358ff67	2558c501-89df-4695-b56c-fbe600529b21	Elektronika	2026-03-28 18:21:44.629	2026-03-28 18:21:44.629	\N	\N
ba94a06a-7c18-4c9c-bf48-3fd5974d53ae	2558c501-89df-4695-b56c-fbe600529b21	Oziq-ovqat	2026-03-28 18:21:44.631	2026-03-28 18:21:44.631	\N	\N
aeface47-ef4e-44ef-b79d-6abfc8293e27	2558c501-89df-4695-b56c-fbe600529b21	Tozalash vositalari	2026-03-28 18:21:44.632	2026-03-28 18:21:44.632	\N	\N
9caad36e-f91c-4af8-924e-42540dcfe0c3	372dcf39-46c6-4fef-a349-808c82dc8d8a	Muzli mahsulotlar	2026-03-29 09:41:18.522	2026-03-29 09:41:18.522	\N	\N
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, slug, logo, website, instagram, telegram, "siteActive", "isDemo", "subscriptionPlan", "subscriptionStatus", "trialExpiresAt", "dbConnectionUrl", "createdAt", "updatedAt", "deletedAt", "deletedBy", "cashbackPercent", "adminLogBotToken", facebook, tiktok, "workingHours", youtube) FROM stdin;
2558c501-89df-4695-b56c-fbe600529b21	Supplio Global Distributors	supplio-global	\N	\N	@supplio.official	supplio_uz	t	f	PREMIUM	ACTIVE	2027-03-28 18:21:44.616	\N	2026-03-28 18:21:44.619	2026-03-28 18:21:44.619	\N	\N	0	\N	\N	\N	\N	\N
677fe634-603d-4723-8c85-afff22b41391	Demo Solutions Ltd	demo	\N	\N	\N	\N	t	t	START	TRIAL	2026-04-11 18:21:44.891	\N	2026-03-28 18:21:44.893	2026-03-28 18:21:44.893	\N	\N	0	\N	\N	\N	\N	\N
372dcf39-46c6-4fef-a349-808c82dc8d8a	Supplio System	supplio-system	\N	\N	\N	\N	t	f	PREMIUM	ACTIVE	2026-04-27 19:43:42.769	postgresql://postgres:2007@127.0.0.1:5432/supplio_tenant_supplio-system_main?schema=public	2026-03-28 18:22:04.297	2026-03-28 19:43:42.772	\N	\N	0	\N	\N	\N	\N	\N
49e18d1f-089d-482a-81c8-b11f0c8a067a	Supplio Demo	supplio-demo	\N	\N	\N	\N	t	t	PREMIUM	ACTIVE	2098-12-31 19:00:00	\N	2026-03-28 19:58:28.448	2026-03-28 20:01:20.285	\N	\N	5	\N	\N	\N	\N	\N
33930263-cce8-4ffb-9b22-07ff6b07a268	Supplio Test Company	test-distributor	\N	https://app.supplio.uz/supplio-test-company	\N	@SupplioTestCompany	t	f	PREMIUM	ACTIVE	2098-12-31 19:00:00	\N	2026-04-12 17:37:58.091	2026-04-12 18:04:10.508	\N	\N	5	\N	\N	\N	\N	\N
\.


--
-- Data for Name: CustomBot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomBot" (id, "companyId", token, username, "isActive", "hasWebApp", watermark, "createdAt", "deletedAt", "botName", description, "webhookUrl") FROM stdin;
40b33a33-7404-4529-83eb-1e730edb9774	372dcf39-46c6-4fef-a349-808c82dc8d8a	6209529595:AAGCkavAP9XcX-E328M8p5KQZGZlYISh4ZI	RealCoderUzBot	t	t	t	2026-03-28 20:04:11.006	\N	Supplio test	Supplio test	\N
\.


--
-- Data for Name: CustomRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomRole" (id, "companyId", name, permissions, "createdAt", "updatedAt") FROM stdin;
2b4c4a02-57af-4063-8651-d41b0724e1d4	372dcf39-46c6-4fef-a349-808c82dc8d8a	Sotuvchi	{"viewOrders": true, "viewDealers": false, "createOrders": false, "viewBranches": false, "viewExpenses": false, "viewPayments": true, "viewProducts": false, "createDealers": false, "viewAnalytics": false, "createExpenses": false, "createPayments": true, "manageBranches": false}	2026-03-29 09:03:28.215	2026-03-29 09:03:28.215
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Dealer" (id, "companyId", "branchId", name, phone, address, "creditLimit", "currentDebt", "telegramChatId", "createdAt", "updatedAt", "deletedAt", "deletedBy", "isApproved", "approvedAt", "approvedBy", "isBlocked", "cashbackBalance") FROM stdin;
14a0868a-c9ed-4962-92da-7d25d5e98e2c	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Umida Qosimova	+998904444444	\N	25000000	10000000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.885	\N	\N	f	\N	\N	f	0
eb9fdd9f-8ae4-4252-a662-ac14a105d55e	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Feruza Nazarova	+998906666666	\N	8000000	-700000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.887	\N	\N	f	\N	\N	f	0
f844dda2-398f-41a2-b0cf-88fa3697fdcf	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Abdullayev Sardor	+99894000000	Toshkent, 1-uy	3000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
dafc9765-065a-4a7b-987e-299642d3dc4b	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Toshmatov Jasur	+99894000001	Toshkent, 2-uy	5000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
305f8ae0-3776-4761-8278-13ecb059e48d	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Sardor Mirzayev	+998903333333	\N	15000000	26400000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.853	\N	\N	f	\N	\N	f	0
c429d9c4-5478-4478-89c2-98345a274317	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Otabek Xoliqov	+998907777777	\N	12000000	3900000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.858	\N	\N	f	\N	\N	f	0
70a187cc-5375-4254-9e3c-4b7c0ea1c60b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Karimov Bobur	+99894000002	Toshkent, 3-uy	7000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	40000
cc8274a6-19c3-4e45-a207-c9902126e0e4	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Kamola Ergasheva	+998908888888	\N	18000000	45000000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.865	\N	\N	f	\N	\N	f	0
03f6ef3f-54a8-47ca-8153-0983ace9b797	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Bekzod Tursunov	+998905555555	\N	10000000	9120000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.87	\N	\N	f	\N	\N	f	0
193d572b-d791-4918-8f8c-fe5b018be616	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Sherzod Rашidov	+998909999999	\N	22000000	270000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.872	\N	\N	f	\N	\N	f	0
b122c83b-1b3f-4943-90b5-6226085c997d	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Alisher Kobilov	+998944445566	\N	50000000	50310000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.876	\N	\N	f	\N	\N	f	0
5d76c986-4cad-446c-8442-21b4c0ee0cf9	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Jasur Yuldashev	+998901111111	\N	30000000	51020000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.879	\N	\N	f	\N	\N	f	0
604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Nodira Hasanova	+998902222222	\N	20000000	2570000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.882	\N	\N	f	\N	\N	f	0
50e3208d-bf6c-4330-9d0f-2c0ef0e6be80	372dcf39-46c6-4fef-a349-808c82dc8d8a	b6ee5c42-edfe-4780-85f7-af78b91885c0	Saidqodirxon test	+998940116877	Kindudan	100000000	0	1551855614	2026-03-28 20:07:31.25	2026-03-31 18:18:52.766	\N	\N	t	2026-03-31 18:18:52.764	abf2f3b6-8458-419c-b7cf-37d134674bf8	f	0
bad3b1da-4158-41cd-ac4f-c1550ccc47d5	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Yusupov Asilbek	+99894000003	Toshkent, 4-uy	9000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	60000
476b7d56-98a3-4107-bee7-f2c0908416ff	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Nazarov Sherzod	+99894000004	Toshkent, 5-uy	11000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	80000
cf1f2560-38cd-4a75-993b-3fa73e8a3a98	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Qodirov Firdavs	+99894000005	Toshkent, 6-uy	13000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	100000
3868f60e-2952-4725-a074-0b57752220a5	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Hamidov Ulugbek	+99894000006	Toshkent, 7-uy	15000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	120000
3b1a538d-0dfe-42c9-97c0-7eb3b7850139	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Raximov Dilshod	+99894000007	Toshkent, 8-uy	17000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	140000
569bf392-d510-4e78-b4c8-f580014e1c6a	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Xoliqov Mansur	+99894000008	Toshkent, 9-uy	19000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
d6520409-350c-4741-8854-0621e3ec4328	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Botirov Sanjar	+99894000009	Toshkent, 10-uy	21000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
f7672e75-b2ca-49a9-ad1b-9ba989d80a77	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Mirzayev Elbek	+99894000010	Toshkent, 11-uy	23000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	40000
a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Sobirov Nodir	+99894000011	Toshkent, 12-uy	25000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	60000
ac85fd64-67b6-42f1-aa37-1ea9add2f500	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Holmatov Doniyor	+99894000012	Toshkent, 13-uy	27000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	80000
4e035e75-db70-4000-b6bc-e2df66cee240	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Tursunov Zafar	+99894000013	Toshkent, 14-uy	29000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	100000
82aaa0ef-6d5e-469d-8218-866dfa87ab76	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Ismoilov Jamshid	+99894000014	Toshkent, 15-uy	31000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	120000
42d9cfcb-5dfb-4e22-9560-dedbf628b385	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 16	+99894000015	Toshkent, 16-uy	3000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	140000
cad80b67-a04d-4679-88c7-883ac2b04911	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 17	+99894000016	Toshkent, 17-uy	5000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
503b7694-3480-45e9-8116-a469c79d249a	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 18	+99894000017	Toshkent, 18-uy	7000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
1213e655-58b1-4fd4-892c-c4a516f307c8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 19	+99894000018	Toshkent, 19-uy	9000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	40000
45806072-c97b-42ae-babb-c934f7141ab8	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 20	+99894000019	Toshkent, 20-uy	11000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	60000
97dce907-dede-4fad-9991-f76b02f241c0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 21	+99894000020	Toshkent, 21-uy	13000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	80000
ef364e98-dc87-4278-84fc-3cbd6cd3a449	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 22	+99894000021	Toshkent, 22-uy	15000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	100000
362df153-f937-4dfc-a047-e167af652682	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 23	+99894000022	Toshkent, 23-uy	17000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	120000
7dbe4041-1742-47f3-8bd2-0e932385bd9c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 24	+99894000023	Toshkent, 24-uy	19000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	140000
b5bf2837-4d2a-4c19-8433-c595ce528ed1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 25	+99894000024	Toshkent, 25-uy	21000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
17b030ff-132b-47ca-a099-729ff1cc3a5d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 26	+99894000025	Toshkent, 26-uy	23000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
1d12d9ab-e799-4541-b2bf-c30b8d708a8d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 27	+99894000026	Toshkent, 27-uy	25000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	40000
73062c7a-dff1-44ad-9a7e-18729e766900	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 28	+99894000027	Toshkent, 28-uy	27000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	60000
70aa161e-8ee0-4950-afaa-f2e955b6c68f	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 29	+99894000028	Toshkent, 29-uy	29000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	80000
5ed3d41f-32f4-4319-9aa7-82753bd72d2d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 30	+99894000029	Toshkent, 30-uy	31000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	100000
8ba64cce-4753-4815-841e-954ccfa3f432	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 31	+99894000030	Toshkent, 31-uy	3000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	120000
504ad46f-c593-49f3-bfa7-4b1b5c253eeb	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 32	+99894000031	Toshkent, 32-uy	5000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	140000
a2d3c202-6b97-439e-9ea1-705a8945bcc0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 33	+99894000032	Toshkent, 33-uy	7000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 34	+99894000033	Toshkent, 34-uy	9000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
b59f04da-f8e4-43f9-8488-cff1a5e1180d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 35	+99894000034	Toshkent, 35-uy	11000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	40000
ea743292-3ef3-4392-a2bf-2d5555f8e034	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 36	+99894000035	Toshkent, 36-uy	13000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	60000
db460ec1-c062-4e57-8218-ea2add3a540e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 37	+99894000036	Toshkent, 37-uy	15000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	80000
7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 38	+99894000037	Toshkent, 38-uy	17000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	100000
6a2533c3-a935-40eb-a7c3-a3bb45eb152d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 39	+99894000038	Toshkent, 39-uy	19000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	120000
0edc83d9-aaed-446e-9206-bb6ebaefd489	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 40	+99894000039	Toshkent, 40-uy	21000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	140000
d9e83212-f867-40ff-b67a-2f35b3ef3bfd	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 41	+99894000040	Toshkent, 41-uy	23000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
c6d766ef-6c99-4763-b225-a853cdee1b71	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 42	+99894000041	Toshkent, 42-uy	25000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
f48b30c0-e349-4ea0-9f74-c738acc90712	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 43	+99894000042	Toshkent, 43-uy	27000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	40000
5a1eb044-89d2-403f-ab0c-010ee51e8091	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 44	+99894000043	Toshkent, 44-uy	29000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	60000
678981d1-9c26-4b15-a842-9f66b14d4985	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 45	+99894000044	Toshkent, 45-uy	31000000	1200000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	80000
02fe2116-4394-4000-924e-8f306a09841f	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 46	+99894000045	Toshkent, 46-uy	3000000	1800000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	100000
901851a8-14d0-40f1-a4ed-e7c0bac85e71	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	Diler 47	+99894000046	Toshkent, 47-uy	5000000	2400000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	120000
6dfe2784-51bf-4d6d-a613-a8dede9ba816	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	Diler 48	+99894000047	Toshkent, 48-uy	7000000	3000000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	140000
b05a2a7a-e887-4189-9b84-bffc37cb01af	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	Diler 49	+99894000048	Toshkent, 49-uy	9000000	0	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	0
ad915ba5-8334-496d-8ee5-9daa01ce57dd	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	Diler 50	+99894000049	Toshkent, 50-uy	11000000	600000	\N	2026-04-12 17:37:58.229	2026-04-12 17:37:58.229	\N	\N	t	\N	\N	f	20000
dealer-677fe634-603d-4723-8c85-afff22b41391-1	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	Apex Retail	+998901112233	\N	10000000	4500000	\N	2026-04-12 19:00:00.127	2026-04-12 19:00:00.127	\N	\N	t	\N	\N	f	0
dealer-677fe634-603d-4723-8c85-afff22b41391-2	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	Global Mart	+998904445566	\N	5000000	1200000	\N	2026-04-12 19:00:00.127	2026-04-12 19:00:00.127	\N	\N	t	\N	\N	f	0
dealer-677fe634-603d-4723-8c85-afff22b41391-3	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	City Express	+998907778899	\N	2000000	2500000	\N	2026-04-12 19:00:00.127	2026-04-12 19:00:00.127	\N	\N	t	\N	\N	f	0
dealer-677fe634-603d-4723-8c85-afff22b41391-4	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	Metro Store	+998909990011	\N	8000000	650000	\N	2026-04-12 19:00:00.127	2026-04-12 19:00:00.127	\N	\N	t	\N	\N	f	0
dealer-677fe634-603d-4723-8c85-afff22b41391-5	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	FastTrade	+998902223344	\N	15000000	3200000	\N	2026-04-12 19:00:00.127	2026-04-12 19:00:00.127	\N	\N	t	\N	\N	f	0
\.


--
-- Data for Name: DealerApprovalRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealerApprovalRequest" (id, "companyId", "dealerId", status, note, "requestedAt", "reviewedAt", "reviewedBy") FROM stdin;
2f4303fa-6821-4d5a-9ef9-9249364fb494	372dcf39-46c6-4fef-a349-808c82dc8d8a	50e3208d-bf6c-4330-9d0f-2c0ef0e6be80	PENDING	\N	2026-03-28 20:07:31.265	\N	\N
41be8a95-932f-49b8-b023-160dcf9a58cc	372dcf39-46c6-4fef-a349-808c82dc8d8a	50e3208d-bf6c-4330-9d0f-2c0ef0e6be80	APPROVED	\N	2026-03-31 18:18:52.779	2026-03-31 18:18:52.779	abf2f3b6-8458-419c-b7cf-37d134674bf8
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, "companyId", "branchId", amount, category, description, "createdAt", "deletedAt", "deletedBy") FROM stdin;
ba1c83a0-f2f2-45b1-bd7f-9f08f3da2276	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	500000	Logistics	Asosiy yuk mashinasi yoqilg'isi	2026-03-28 18:21:44.89	\N	\N
2db4ead2-0816-429a-903f-4641379bfa0a	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	1200000	Rent	Oy ijarasi - asosiy ombor	2026-03-28 18:21:44.89	\N	\N
0c384eaf-9fc0-4a77-8302-4505f5407acc	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	350000	Utilities	Elektr energiyasi	2026-03-28 18:21:44.89	\N	\N
953a0c3d-5df9-419c-974d-21edb8a06fc8	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	80000	Logistika	Xarajat 1	2026-04-12 17:37:59.045	\N	\N
bee987e7-ef8f-47fd-a454-2fe25189a755	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	200000	Xodimlar	Xarajat 2	2026-04-09 17:37:59.045	\N	\N
c190963f-ecf9-430b-ae84-0e5e5e7e225a	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	320000	Ijara	Xarajat 3	2026-04-06 17:37:59.045	\N	\N
ac6c6192-887f-433c-b29c-37aebb8ddb20	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	440000	Marketing	Xarajat 4	2026-04-03 17:37:59.045	\N	\N
0cfb428c-8ade-406f-9c91-faa8a19462f6	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	560000	Kommunal	Xarajat 5	2026-03-31 17:37:59.045	\N	\N
fa84291c-dc5a-4ae7-8666-0e945d198edc	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	680000	Logistika	Xarajat 6	2026-03-28 17:37:59.045	\N	\N
34e13791-06a4-41dc-92fa-8e336607ec66	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	800000	Xodimlar	Xarajat 7	2026-03-25 17:37:59.045	\N	\N
20185bfa-b3c9-4789-b2ae-4445728fd506	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	920000	Ijara	Xarajat 8	2026-03-22 17:37:59.045	\N	\N
34c727bb-af25-48d9-b216-4e36de65f1df	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1040000	Marketing	Xarajat 9	2026-03-19 17:37:59.045	\N	\N
f6cb801b-f7b8-426d-b3a3-813339c3b70c	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1160000	Kommunal	Xarajat 10	2026-03-16 17:37:59.045	\N	\N
d9586661-01a1-46d7-9037-7debcc44eac0	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	80000	Logistika	Xarajat 11	2026-03-13 17:37:59.045	\N	\N
8ea42f63-ac76-4550-b39d-da2c1c5da8bd	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	200000	Xodimlar	Xarajat 12	2026-03-10 17:37:59.045	\N	\N
37c51eec-6ba0-4bb8-975e-8034e77e8a14	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	320000	Ijara	Xarajat 13	2026-03-07 17:37:59.045	\N	\N
1dc643db-0e7b-42d7-9241-0ac739e4cda5	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	440000	Marketing	Xarajat 14	2026-03-04 17:37:59.045	\N	\N
eddfe0c6-1163-4a10-928c-5bf69a9ee800	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	560000	Kommunal	Xarajat 15	2026-03-01 17:37:59.045	\N	\N
d0f7d6cc-000e-4a93-868b-dfb3f6554e6e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	680000	Logistika	Xarajat 16	2026-02-26 17:37:59.045	\N	\N
493047b4-9774-49b2-9624-232547377ba1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	800000	Xodimlar	Xarajat 17	2026-02-23 17:37:59.045	\N	\N
81831780-3a6a-4b4f-a572-3b0097ac5dad	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	920000	Ijara	Xarajat 18	2026-02-20 17:37:59.045	\N	\N
ada8ab8c-7c4b-441e-bc13-61e267a8085d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1040000	Marketing	Xarajat 19	2026-02-17 17:37:59.045	\N	\N
f157ed52-42ec-4cd0-b01d-a6da0a70042b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	1160000	Kommunal	Xarajat 20	2026-02-14 17:37:59.045	\N	\N
ef2415bb-1f17-4246-9651-d2f00ec868b2	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	80000	Logistika	Xarajat 21	2026-02-11 17:37:59.045	\N	\N
2045d3e0-ca0a-4adb-a076-7fdf2d163b0d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	200000	Xodimlar	Xarajat 22	2026-02-08 17:37:59.045	\N	\N
67c1b817-7b72-49bb-8f33-880b1062f1a8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	320000	Ijara	Xarajat 23	2026-02-05 17:37:59.045	\N	\N
92e19b94-1d8e-42bd-ae18-76fc1a6667af	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	440000	Marketing	Xarajat 24	2026-02-02 17:37:59.045	\N	\N
cf4a3392-0a02-405c-b036-02bba0cdaecf	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	560000	Kommunal	Xarajat 25	2026-01-30 17:37:59.045	\N	\N
1d363194-0c90-411a-b20d-fb548c771c83	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	680000	Logistika	Xarajat 26	2026-01-27 17:37:59.045	\N	\N
f5781574-72eb-49df-b89d-fe724e84e582	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	800000	Xodimlar	Xarajat 27	2026-01-24 17:37:59.045	\N	\N
6d411c95-9759-40fa-b234-19a1b48622e0	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	920000	Ijara	Xarajat 28	2026-01-21 17:37:59.045	\N	\N
68babbae-eef4-42eb-92c9-a991483f9676	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1040000	Marketing	Xarajat 29	2026-01-18 17:37:59.045	\N	\N
d0feba99-5358-404f-b8e5-1c51ebcf9dde	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1160000	Kommunal	Xarajat 30	2026-01-15 17:37:59.045	\N	\N
d9040625-b7b1-407d-9f4c-39b3a11fd487	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	80000	Logistika	Xarajat 31	2026-01-12 17:37:59.045	\N	\N
badc6e00-2299-4a2b-a6ee-53598f926eea	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	200000	Xodimlar	Xarajat 32	2026-01-09 17:37:59.045	\N	\N
233e81f0-ccdf-4e3d-bbe6-1805cdcdfee5	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	320000	Ijara	Xarajat 33	2026-01-06 17:37:59.045	\N	\N
351a5498-36e5-4410-a4d1-0a771db42029	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	440000	Marketing	Xarajat 34	2026-01-03 17:37:59.045	\N	\N
524a0e10-05fa-452f-894f-2c3586f64b79	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	560000	Kommunal	Xarajat 35	2025-12-31 17:37:59.045	\N	\N
c6463d91-07c5-4a52-a696-399af3289b0b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	680000	Logistika	Xarajat 36	2025-12-28 17:37:59.045	\N	\N
5a633465-7954-49c7-8175-e87a5b303062	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	800000	Xodimlar	Xarajat 37	2025-12-25 17:37:59.045	\N	\N
2751004c-6e0f-4082-a240-1c70790ac0a2	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	920000	Ijara	Xarajat 38	2025-12-22 17:37:59.045	\N	\N
30021868-0257-43bb-880c-be9efe89a5a5	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1040000	Marketing	Xarajat 39	2025-12-19 17:37:59.045	\N	\N
565d2417-69bc-4a50-aea2-8737df123e20	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	1160000	Kommunal	Xarajat 40	2025-12-16 17:37:59.045	\N	\N
64c8098a-2890-4066-9f24-9b466a950c8f	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	80000	Logistika	Xarajat 41	2025-12-13 17:37:59.045	\N	\N
9350f9ab-da07-4938-a2fe-8a09628e8257	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	200000	Xodimlar	Xarajat 42	2025-12-10 17:37:59.045	\N	\N
ed1eb4b5-84e2-4645-9466-c00ea572399f	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	320000	Ijara	Xarajat 43	2025-12-07 17:37:59.045	\N	\N
268a87b3-4535-43e9-90a8-c0b32905113a	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	440000	Marketing	Xarajat 44	2025-12-04 17:37:59.045	\N	\N
c2758671-890b-4644-97fc-81d2f7705584	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	560000	Kommunal	Xarajat 45	2025-12-01 17:37:59.045	\N	\N
8381c959-788a-474b-8fe4-5397964958b1	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	680000	Logistika	Xarajat 46	2025-11-28 17:37:59.045	\N	\N
57cacd01-10d5-4ebe-b9d6-7820c63a04e7	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	800000	Xodimlar	Xarajat 47	2025-11-25 17:37:59.045	\N	\N
1731c25b-8ea0-4318-9e56-c19d5a02bac0	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	920000	Ijara	Xarajat 48	2025-11-22 17:37:59.045	\N	\N
52a10e36-3fcc-4193-813e-e760966c1977	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1040000	Marketing	Xarajat 49	2025-11-19 17:37:59.045	\N	\N
b8675c6b-7b04-4de2-a1e9-0f254c0fae93	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1160000	Kommunal	Xarajat 50	2025-11-16 17:37:59.045	\N	\N
54f75f99-2cc6-418b-93cc-4ff4fb209cd8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	80000	Logistika	Xarajat 51	2025-11-13 17:37:59.045	\N	\N
53f0bc1c-4ca1-44bb-9b2f-0c8a034155ed	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	200000	Xodimlar	Xarajat 52	2025-11-10 17:37:59.045	\N	\N
398363c0-fb09-4453-91d1-4214fc450e2e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	320000	Ijara	Xarajat 53	2025-11-07 17:37:59.045	\N	\N
a2ffa812-a8f8-4fd6-b804-f0cc0385161a	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	440000	Marketing	Xarajat 54	2025-11-04 17:37:59.045	\N	\N
2892d1ca-aee7-43c1-a2e6-f09d9dbf7387	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	560000	Kommunal	Xarajat 55	2025-11-01 17:37:59.045	\N	\N
387da008-31fe-4703-8951-a3528540fb3e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	680000	Logistika	Xarajat 56	2025-10-29 17:37:59.045	\N	\N
4d8fa66c-d174-49db-9431-2971e0da9029	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	800000	Xodimlar	Xarajat 57	2025-10-26 17:37:59.045	\N	\N
83cab23f-a7a5-4abc-b9ba-96ff16b2eacc	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	920000	Ijara	Xarajat 58	2025-10-23 17:37:59.045	\N	\N
f1ae440f-5d63-42e5-a9bb-d8766dfd71fe	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1040000	Marketing	Xarajat 59	2025-10-20 17:37:59.045	\N	\N
6e3b1721-62ee-4acb-84ef-e2420ac79d62	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	1160000	Kommunal	Xarajat 60	2025-10-17 17:37:59.045	\N	\N
\.


--
-- Data for Name: FeatureFlag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FeatureFlag" (id, "companyId", "featureKey", "isEnabled", "planLevel", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LandingContent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LandingContent" (id, "heroTitleUz", "heroTitleRu", "heroTitleEn", "heroTitleTr", "heroSubtitleUz", "heroSubtitleRu", "heroSubtitleEn", "heroSubtitleTr", "heroBadgeUz", "heroBadgeRu", "heroBadgeEn", "heroBadgeTr", "contactPhone", "contactEmail", "socialTelegram", "socialLinkedin", "socialTwitter", "footerDescUz", "footerDescRu", "footerDescEn", "footerDescTr", "updatedAt", "contactAddress", "contactAddressUrl", "contactPhoneHref", "socialInstagram") FROM stdin;
LANDING													\N	\N	\N	\N	\N					2026-03-28 18:39:09.274	\N	\N	\N	\N
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lead" (id, "fullName", phone, info, status, "createdAt", "deletedAt") FROM stdin;
afb83ab0-cc19-43c1-abed-6d15282e5933	Akbar Toshev	+998901000001	PRO tarif haqida so'radi	NEW	2026-03-28 18:21:44.888	\N
87a1889c-5511-4791-ad8c-5dd76c0c4443	Malika Ismoilova	+998901000002	Demo ko'rmoqchi	CONTACTED	2026-03-28 18:21:44.888	\N
cd602332-2588-450f-8292-ffb07165b6e1	Davron Qodirov	+998901000003	10 ta diler bor, tarif tanlayapti	NEW	2026-03-28 18:21:44.888	\N
83f23223-433d-432b-9e99-16e8d77bea7a	Zulfiya Rahimova	+998901000004	Korxona uchun 3 filial kerak	QUALIFIED	2026-03-28 18:21:44.888	\N
51e7f2a5-134b-40bd-8d1f-80c5a24702bd	Ibrohim Nishonov	+998901000005	\N	NEW	2026-03-28 18:21:44.888	\N
421ed999-a6b1-4ec1-b257-84cb75cbe804	Sarvinoz Xoliqova	+998901000006	Telegram bot integratsiyasi	CONTACTED	2026-03-28 18:21:44.888	\N
5b71022e-90c9-4371-a81b-25d08ded4f2b	Nodir Umarov	+998901000007	Startup uchun arzon tarif	NEW	2026-03-28 18:21:44.888	\N
a3ccbed3-541e-4223-a590-70e386f8276b	Gulnora Tursunova	+998901000008	Enterprise demo so'radi	QUALIFIED	2026-03-28 18:21:44.888	\N
c32ef787-28af-49be-a1f3-36f4ae294e85	Eldor Nazarov	+998901000009	\N	LOST	2026-03-28 18:21:44.888	\N
12fc2891-9d75-4ddd-9a58-e5405f1237e1	Shahnoza Yusupova	+998901000010	Referral - Silk Road Trading	NEW	2026-03-28 18:21:44.888	\N
8a02ff19-271c-4cf1-835a-9b55ed28edb1	Super Admin	+998917505060	PASSWORD_RESET_REQUEST | Company: Supplio System | Slug: supplio-system | User: Super Admin | Role: SUPER_ADMIN	NEW	2026-03-29 09:06:24.953	\N
\.


--
-- Data for Name: LedgerTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LedgerTransaction" (id, "companyId", "branchId", "dealerId", type, amount, reference, note, "createdAt", "deletedAt", "deletedBy") FROM stdin;
9822dbac-5218-4cab-b8db-6afbbef9e275	2558c501-89df-4695-b56c-fbe600529b21	\N	b122c83b-1b3f-4943-90b5-6226085c997d	ORDER	36000000	\N	\N	2026-02-28 18:21:44.815	\N	\N
87d6653a-016c-4cc2-bc2b-8484106832e5	2558c501-89df-4695-b56c-fbe600529b21	\N	5d76c986-4cad-446c-8442-21b4c0ee0cf9	ORDER	30000000	\N	\N	2026-03-02 18:21:44.824	\N	\N
4f1bda6c-794b-4712-9841-c41b686ba0bb	2558c501-89df-4695-b56c-fbe600529b21	\N	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	ORDER	3250000	\N	\N	2026-03-03 18:21:44.827	\N	\N
c828894b-70ef-406e-805c-1377b8fa2fea	2558c501-89df-4695-b56c-fbe600529b21	\N	b122c83b-1b3f-4943-90b5-6226085c997d	ORDER	19000000	\N	\N	2026-03-04 18:21:44.83	\N	\N
58c4cf7d-7837-4231-8f8d-ffcecf08ee7b	2558c501-89df-4695-b56c-fbe600529b21	\N	305f8ae0-3776-4761-8278-13ecb059e48d	ORDER	2400000	\N	\N	2026-03-06 18:21:44.833	\N	\N
1f147bef-38eb-436b-ab9c-f8a8613c04b1	2558c501-89df-4695-b56c-fbe600529b21	\N	5d76c986-4cad-446c-8442-21b4c0ee0cf9	ORDER	620000	\N	\N	2026-03-08 18:21:44.836	\N	\N
c0c2232a-282a-4244-a070-c6928e11d9cc	2558c501-89df-4695-b56c-fbe600529b21	\N	14a0868a-c9ed-4962-92da-7d25d5e98e2c	ORDER	16000000	\N	\N	2026-03-10 18:21:44.839	\N	\N
b484ec48-5a9a-4f63-be29-92347bc906d4	2558c501-89df-4695-b56c-fbe600529b21	\N	03f6ef3f-54a8-47ca-8153-0983ace9b797	ORDER	1120000	\N	\N	2026-03-12 18:21:44.841	\N	\N
6cdad7d8-1482-49ed-9c8d-4feaff8c5295	2558c501-89df-4695-b56c-fbe600529b21	\N	b122c83b-1b3f-4943-90b5-6226085c997d	ORDER	15000000	\N	\N	2026-03-14 18:21:44.843	\N	\N
19a1fd8e-8c0f-4e94-af23-1e00a8af38aa	2558c501-89df-4695-b56c-fbe600529b21	\N	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	ORDER	360000	\N	\N	2026-03-16 18:21:44.845	\N	\N
2434089b-f207-492e-92b5-f519e1634d44	2558c501-89df-4695-b56c-fbe600529b21	\N	eb9fdd9f-8ae4-4252-a662-ac14a105d55e	ORDER	1300000	\N	\N	2026-03-18 18:21:44.848	\N	\N
b189d291-c0d6-4547-a834-8fe3811191bf	2558c501-89df-4695-b56c-fbe600529b21	\N	305f8ae0-3776-4761-8278-13ecb059e48d	ORDER	24000000	\N	\N	2026-03-19 18:21:44.851	\N	\N
da7c74b7-f8a7-4b0c-8856-df4ae0d65e14	2558c501-89df-4695-b56c-fbe600529b21	\N	5d76c986-4cad-446c-8442-21b4c0ee0cf9	ORDER	30400000	\N	\N	2026-03-21 18:21:44.853	\N	\N
a157e1ff-a845-4dab-bb13-c7a949245254	2558c501-89df-4695-b56c-fbe600529b21	\N	c429d9c4-5478-4478-89c2-98345a274317	ORDER	3900000	\N	\N	2026-03-22 18:21:44.855	\N	\N
999714ea-6d23-49cf-aa01-fbbd03d0d86a	2558c501-89df-4695-b56c-fbe600529b21	\N	14a0868a-c9ed-4962-92da-7d25d5e98e2c	ORDER	2000000	\N	\N	2026-03-23 18:21:44.857	\N	\N
501b403c-4161-4fc8-b783-f3b49712e7a0	2558c501-89df-4695-b56c-fbe600529b21	\N	b122c83b-1b3f-4943-90b5-6226085c997d	ORDER	310000	\N	\N	2026-03-24 18:21:44.859	\N	\N
55c59200-41be-4d9f-9a46-367d35c687b0	2558c501-89df-4695-b56c-fbe600529b21	\N	cc8274a6-19c3-4e45-a207-c9902126e0e4	ORDER	45000000	\N	\N	2026-03-25 18:21:44.862	\N	\N
ad80de44-e3d8-48a9-814d-f2685b7aa4c9	2558c501-89df-4695-b56c-fbe600529b21	\N	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	ORDER	1960000	\N	\N	2026-03-26 18:21:44.865	\N	\N
de7d8cc7-60c3-4a6e-aade-743718501454	2558c501-89df-4695-b56c-fbe600529b21	\N	03f6ef3f-54a8-47ca-8153-0983ace9b797	ORDER	8000000	\N	\N	2026-03-27 18:21:44.867	\N	\N
c6c90da3-4b10-4bb1-a542-eb92c324465f	2558c501-89df-4695-b56c-fbe600529b21	\N	193d572b-d791-4918-8f8c-fe5b018be616	ORDER	270000	\N	\N	2026-03-28 18:21:44.869	\N	\N
a6c3b3f4-4569-4d2d-b148-de2d75c93918	2558c501-89df-4695-b56c-fbe600529b21	\N	b122c83b-1b3f-4943-90b5-6226085c997d	PAYMENT	20000000	\N	\N	2026-03-28 18:21:44.875	\N	\N
792198d8-ab8e-4d70-ab02-9a07731833d2	2558c501-89df-4695-b56c-fbe600529b21	\N	5d76c986-4cad-446c-8442-21b4c0ee0cf9	PAYMENT	10000000	\N	\N	2026-03-28 18:21:44.878	\N	\N
366be117-be3e-4e39-a2ff-80972c29e397	2558c501-89df-4695-b56c-fbe600529b21	\N	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	PAYMENT	3000000	\N	\N	2026-03-28 18:21:44.88	\N	\N
5110e6e1-7d37-405a-bc20-53d4147ddc93	2558c501-89df-4695-b56c-fbe600529b21	\N	14a0868a-c9ed-4962-92da-7d25d5e98e2c	PAYMENT	8000000	\N	\N	2026-03-28 18:21:44.884	\N	\N
b5360d1c-df08-4eef-915c-1ae64a18cfe2	2558c501-89df-4695-b56c-fbe600529b21	\N	eb9fdd9f-8ae4-4252-a662-ac14a105d55e	PAYMENT	2000000	\N	\N	2026-03-28 18:21:44.886	\N	\N
114bbf5a-9972-4ed0-ba64-d822bfb46aa6	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	f844dda2-398f-41a2-b0cf-88fa3697fdcf	ORDER	134000	\N	\N	2025-10-14 17:37:58.239	\N	\N
88c4ef28-3ce5-49c2-aff0-ee308ae22893	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	ORDER	300000	\N	\N	2025-10-15 17:37:58.264	\N	\N
61c17b38-7c16-4ab0-9afe-d707d9031310	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	PAYMENT	180000	\N	\N	2025-10-15 20:37:58.264	\N	\N
a3c431fa-fef3-4f8c-a999-f12dd3d16551	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	ORDER	498000	\N	\N	2025-10-16 17:37:58.273	\N	\N
4464c545-f567-4f7a-bd82-1c1ccd9bba9b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	PAYMENT	348600	\N	\N	2025-10-16 20:37:58.273	\N	\N
c93744a1-3c57-4134-8c0e-6e378985f983	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	ORDER	728000	\N	\N	2025-10-17 17:37:58.28	\N	\N
f73bac06-50ed-4395-989f-2a806c6a6383	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	PAYMENT	582400	\N	\N	2025-10-17 20:37:58.28	\N	\N
594790d6-6dcc-4cd2-83ae-5f33afb32ff1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	ORDER	386000	\N	\N	2025-10-18 17:37:58.285	\N	\N
fac20e9a-c98c-4ae2-a804-88627dd06c28	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	PAYMENT	347400	\N	\N	2025-10-18 20:37:58.285	\N	\N
f57a4d9e-61cf-47be-b8f3-9f85bbbc9e46	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	ORDER	648000	\N	\N	2025-10-19 17:37:58.291	\N	\N
0d89ad2f-1a78-420e-b150-0a80ad4fd7d4	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	ORDER	942000	\N	\N	2025-10-20 17:37:58.293	\N	\N
a775a83f-e27d-43b7-a6d6-b848291daa26	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	PAYMENT	565200	\N	\N	2025-10-20 20:37:58.293	\N	\N
03e8bfdc-dcfe-459a-a9e1-112fe645ced3	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	ORDER	1268000	\N	\N	2025-10-21 17:37:58.3	\N	\N
6c580339-0356-4bdc-b4f7-cac3885f6909	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	PAYMENT	887600	\N	\N	2025-10-21 20:37:58.3	\N	\N
7cb28db7-a397-4883-ae69-a494323a7762	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	ORDER	262000	\N	\N	2025-10-22 17:37:58.305	\N	\N
c9eaacad-3020-44ea-b5bb-0704cd2c0665	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	PAYMENT	209600	\N	\N	2025-10-22 20:37:58.305	\N	\N
b4c81be5-e157-4a1e-ae45-7315335e3c60	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	ORDER	556000	\N	\N	2025-10-23 17:37:58.31	\N	\N
7e5ef703-3cad-4a77-bc7d-304de1b3c266	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	PAYMENT	500400	\N	\N	2025-10-23 20:37:58.31	\N	\N
296d1e11-f6ff-47b3-8393-e008325341ac	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	ORDER	882000	\N	\N	2025-10-23 17:37:58.317	\N	\N
d8c63c09-5eba-4eea-a8ef-df6f9d48311d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	ORDER	1240000	\N	\N	2025-10-24 17:37:58.319	\N	\N
233742c7-e611-45cf-9b85-8ec5d91be82e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	PAYMENT	744000	\N	\N	2025-10-24 20:37:58.319	\N	\N
8cd00723-8f46-436c-af3a-98b749ee0189	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	ORDER	770000	\N	\N	2025-10-25 17:37:58.324	\N	\N
b21a74c5-748f-4489-a691-9d94796fee4e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	PAYMENT	539000	\N	\N	2025-10-25 20:37:58.324	\N	\N
a35c4c8e-509c-4796-b90b-0f52772fa2f7	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	ORDER	1160000	\N	\N	2025-10-26 17:37:58.33	\N	\N
3696604d-3ef3-4230-ad0e-15a9313df995	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	PAYMENT	928000	\N	\N	2025-10-26 20:37:58.33	\N	\N
f9eeba9d-4eb3-49d0-b9ee-351254e1f386	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	ORDER	1582000	\N	\N	2025-10-27 17:37:58.336	\N	\N
f33709dc-85df-4ac3-ba5c-9085c126fc20	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	PAYMENT	1423800	\N	\N	2025-10-27 20:37:58.336	\N	\N
e68b301d-ba2c-481c-9838-5c36e01228b4	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	42d9cfcb-5dfb-4e22-9560-dedbf628b385	ORDER	2036000	\N	\N	2025-10-28 17:37:58.342	\N	\N
c4071462-9caf-469c-97ce-ecc3f5bb1273	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	ORDER	390000	\N	\N	2025-10-29 17:37:58.344	\N	\N
0017c6d3-272e-47d3-bf32-d96b572c16c0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	PAYMENT	234000	\N	\N	2025-10-29 20:37:58.344	\N	\N
6bb6b15d-9166-4dcb-9b64-bc33faae1898	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	ORDER	332000	\N	\N	2025-10-30 17:37:58.35	\N	\N
a5f03f9e-1676-4654-bb52-3cad6b559e50	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	PAYMENT	232400	\N	\N	2025-10-30 20:37:58.35	\N	\N
cd80f5de-5524-4474-b7e1-728c73c0ed29	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	ORDER	546000	\N	\N	2025-10-31 17:37:58.354	\N	\N
36062620-e312-4c05-8e5f-51e7a0fb1541	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	PAYMENT	436800	\N	\N	2025-10-31 20:37:58.354	\N	\N
479e1c0c-59c4-49ab-8706-90ac80668173	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	ORDER	792000	\N	\N	2025-11-01 17:37:58.359	\N	\N
96bbcc80-33f6-4715-aee6-b00bb3f4698e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	PAYMENT	712800	\N	\N	2025-11-01 20:37:58.359	\N	\N
979bb885-b899-4a97-9fe0-788527a0bb72	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	97dce907-dede-4fad-9991-f76b02f241c0	ORDER	914000	\N	\N	2025-11-01 17:37:58.365	\N	\N
9376ec78-c58f-47b3-ab7b-2c5ab6aff453	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	ORDER	1192000	\N	\N	2025-11-02 17:37:58.369	\N	\N
8560f60e-f6f9-475a-bd23-e22493348dc8	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	PAYMENT	715200	\N	\N	2025-11-02 20:37:58.369	\N	\N
8ad90fbe-6d42-4aee-8901-dbacbb46ac40	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	ORDER	1502000	\N	\N	2025-11-03 17:37:58.374	\N	\N
63081d1c-5176-4169-bae2-e7b69cd707b7	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	PAYMENT	1051400	\N	\N	2025-11-03 20:37:58.374	\N	\N
104252a7-7af4-4b53-ae85-76f8df65de52	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	ORDER	1844000	\N	\N	2025-11-04 17:37:58.379	\N	\N
80016833-049a-48d5-8384-27307a6e556e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	PAYMENT	1475200	\N	\N	2025-11-04 20:37:58.379	\N	\N
442df4cd-824e-442e-b638-e668187e867b	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	ORDER	278000	\N	\N	2025-11-05 17:37:58.384	\N	\N
df911798-4458-475f-bd8a-63c59033095b	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	PAYMENT	250200	\N	\N	2025-11-05 20:37:58.384	\N	\N
6cd2b132-6e3b-4993-8035-dc4ee187bd88	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	17b030ff-132b-47ca-a099-729ff1cc3a5d	ORDER	588000	\N	\N	2025-11-06 17:37:58.389	\N	\N
7717b509-4d37-4d84-a58d-a7b93a2b6862	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	ORDER	930000	\N	\N	2025-11-07 17:37:58.391	\N	\N
7f8d6720-8515-4785-ae56-59659b724185	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	PAYMENT	558000	\N	\N	2025-11-07 20:37:58.391	\N	\N
8d436e88-e767-416e-bd68-f090a44df514	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	ORDER	1304000	\N	\N	2025-11-08 17:37:58.397	\N	\N
282f9b4e-1c76-47cb-8587-b99f5dc11279	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	PAYMENT	912800	\N	\N	2025-11-08 20:37:58.397	\N	\N
7ffce76b-9f47-4001-a275-17b3032b5ff1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	ORDER	1298000	\N	\N	2025-11-09 17:37:58.401	\N	\N
ad7d667b-ea8c-41a5-a882-e2a15be53b54	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	PAYMENT	1038400	\N	\N	2025-11-09 20:37:58.401	\N	\N
c41e45df-e326-44d1-8f11-9f3ba02f460a	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	ORDER	1704000	\N	\N	2025-11-10 17:37:58.405	\N	\N
1fdeff9a-9cf7-4924-b0b4-69074e0eb141	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	PAYMENT	1533600	\N	\N	2025-11-10 20:37:58.405	\N	\N
f5e30a9d-b8c8-4289-aafc-1f286c62e0f8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	8ba64cce-4753-4815-841e-954ccfa3f432	ORDER	462000	\N	\N	2025-11-10 17:37:58.41	\N	\N
61124856-a6a2-47f1-a313-c33720f19f53	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	ORDER	692000	\N	\N	2025-11-11 17:37:58.413	\N	\N
a0c066e8-251b-4c8b-ac2f-87a9879b1617	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	PAYMENT	415200	\N	\N	2025-11-11 20:37:58.413	\N	\N
6c5655e6-6826-4750-91ce-292fe43f382e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	ORDER	166000	\N	\N	2025-11-12 17:37:58.418	\N	\N
cfd9bccd-3ec9-4edf-a018-7eb2f44bf764	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	PAYMENT	116200	\N	\N	2025-11-12 20:37:58.418	\N	\N
9b7dde69-adc4-4eef-9918-b698557e8e3b	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	ORDER	364000	\N	\N	2025-11-13 17:37:58.422	\N	\N
0db6c0b6-b42e-4500-a9ac-35847d5fd971	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	PAYMENT	291200	\N	\N	2025-11-13 20:37:58.422	\N	\N
ed6405e4-e9a6-4436-8916-e808282e02b0	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	ORDER	594000	\N	\N	2025-11-14 17:37:58.427	\N	\N
af7892b8-94f9-4620-a1f6-020527959331	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	PAYMENT	534600	\N	\N	2025-11-14 20:37:58.427	\N	\N
a15fb829-7086-4cba-aa6a-e80a6ece741b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	ea743292-3ef3-4392-a2bf-2d5555f8e034	ORDER	856000	\N	\N	2025-11-15 17:37:58.433	\N	\N
1b77f305-048f-4844-ae23-7db0f6ff66f1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	ORDER	482000	\N	\N	2025-11-16 17:37:58.435	\N	\N
ae6a34ce-b1b9-413c-83f7-44e16b64c608	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	PAYMENT	289200	\N	\N	2025-11-16 20:37:58.435	\N	\N
e195e913-be0b-4a8a-a8ce-77432ccde6fa	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	ORDER	776000	\N	\N	2025-11-17 17:37:58.439	\N	\N
f3dd0299-188a-4cac-8785-cdcc9a94a493	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	PAYMENT	543200	\N	\N	2025-11-17 20:37:58.439	\N	\N
071fca1a-f12f-4d61-8228-13b077c108f6	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	ORDER	1102000	\N	\N	2025-11-18 17:37:58.447	\N	\N
75a5039e-3799-444b-8b54-6b47a423b2a6	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	PAYMENT	881600	\N	\N	2025-11-18 20:37:58.447	\N	\N
c5682459-bcbd-4777-89df-c45248554c11	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	ORDER	1460000	\N	\N	2025-11-19 17:37:58.453	\N	\N
ac4bc21d-84f4-49e9-9600-8b38adbefd36	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	PAYMENT	1314000	\N	\N	2025-11-19 20:37:58.453	\N	\N
8b1586f6-add8-4d96-849e-19c8f8091764	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	ORDER	294000	\N	\N	2025-11-19 17:37:58.458	\N	\N
c930eee4-8bc3-41c7-bf60-8cf8125df244	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	ORDER	620000	\N	\N	2025-11-20 17:37:58.46	\N	\N
68bdc91c-ecf3-4121-b2ed-d5803751d954	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	PAYMENT	372000	\N	\N	2025-11-20 20:37:58.46	\N	\N
1b5c9344-f990-4400-8519-8d6b6f0876e1	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	ORDER	978000	\N	\N	2025-11-21 17:37:58.467	\N	\N
6cb55716-d9e5-4784-bb56-1a05e1baab0b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	PAYMENT	684600	\N	\N	2025-11-21 20:37:58.467	\N	\N
630117e0-114f-4e3c-be85-53e0c201f5ff	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	ORDER	1368000	\N	\N	2025-11-22 17:37:58.472	\N	\N
91e5b441-99e6-4dee-b32a-bd7f310c53ff	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	PAYMENT	1094400	\N	\N	2025-11-22 20:37:58.472	\N	\N
e0322993-9cca-4299-87d9-0e1d86f84c25	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	ORDER	866000	\N	\N	2025-11-23 17:37:58.479	\N	\N
4a80b3da-9178-4f94-a853-e00aa4a6677b	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	PAYMENT	779400	\N	\N	2025-11-23 20:37:58.479	\N	\N
84805437-8c26-4bb7-80de-f869ef03896e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	02fe2116-4394-4000-924e-8f306a09841f	ORDER	1288000	\N	\N	2025-11-24 17:37:58.484	\N	\N
e7ab9057-faa9-4282-8e75-8b9f6c9a3810	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	ORDER	1742000	\N	\N	2025-11-25 17:37:58.486	\N	\N
5b61bd56-05a7-4b42-89c9-0f805226c468	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	PAYMENT	1045200	\N	\N	2025-11-25 20:37:58.486	\N	\N
7a56cb58-a0aa-4cec-9e62-254b6e5bef5d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	ORDER	1268000	\N	\N	2025-11-26 17:37:58.492	\N	\N
cf0e4ce4-14ae-40e3-8bdb-46a61dc71418	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	PAYMENT	887600	\N	\N	2025-11-26 20:37:58.492	\N	\N
b48e19d4-1186-4bc5-98fb-fc53d72753e0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	ORDER	182000	\N	\N	2025-11-27 17:37:58.497	\N	\N
4a5b8f93-2bfa-4990-b876-ccf1f30a6c80	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	PAYMENT	145600	\N	\N	2025-11-27 20:37:58.497	\N	\N
04739fbc-fd0a-4342-83ea-4cfe8d32c6ef	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	ORDER	396000	\N	\N	2025-11-28 17:37:58.503	\N	\N
9fc746cb-8756-484b-a9bb-dc6a7a10f7d5	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	PAYMENT	356400	\N	\N	2025-11-28 20:37:58.503	\N	\N
312d5694-5c20-4e85-a3d3-083cf0ff3db1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	f844dda2-398f-41a2-b0cf-88fa3697fdcf	ORDER	642000	\N	\N	2025-11-28 17:37:58.508	\N	\N
3cd6cd1b-afce-41c8-b209-067c22166ef0	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	ORDER	920000	\N	\N	2025-11-29 17:37:58.511	\N	\N
33dfa304-2865-44eb-9743-13a2df03dc4d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	PAYMENT	552000	\N	\N	2025-11-29 20:37:58.511	\N	\N
edf89f69-eff3-4863-b8ff-16a5ed753491	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	ORDER	1010000	\N	\N	2025-11-30 17:37:58.518	\N	\N
2c9c049b-23b5-48ac-b62c-0d1c38b578ac	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	PAYMENT	707000	\N	\N	2025-11-30 20:37:58.518	\N	\N
045734e4-96da-46a5-9c49-87cab59784c2	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	ORDER	1320000	\N	\N	2025-12-01 17:37:58.523	\N	\N
10fab4c0-c05a-4133-bec8-9aabe2ca5b72	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	PAYMENT	1056000	\N	\N	2025-12-01 20:37:58.523	\N	\N
d546c103-ef67-4eb1-b42c-00fb4ccbbfb0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	ORDER	1662000	\N	\N	2025-12-02 17:37:58.528	\N	\N
b42efd40-6ea2-4fd8-b8bf-1b0a1e49f692	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	PAYMENT	1495800	\N	\N	2025-12-02 20:37:58.528	\N	\N
43f03038-92c4-44a5-a710-8f7fb1963ec4	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	ORDER	2036000	\N	\N	2025-12-03 17:37:58.533	\N	\N
aa64f767-3bb4-43cd-b449-ab8124c8f80b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	ORDER	310000	\N	\N	2025-12-04 17:37:58.536	\N	\N
ad198d26-7d54-4d4c-b0d4-7193b2f63ec4	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	PAYMENT	186000	\N	\N	2025-12-04 20:37:58.536	\N	\N
9ea4463d-3d8a-439e-9c6b-3f3c7d2a9d48	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	ORDER	652000	\N	\N	2025-12-05 17:37:58.54	\N	\N
37007d5b-0974-44a4-a3f0-9b0ea4041af9	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	PAYMENT	456400	\N	\N	2025-12-05 20:37:58.54	\N	\N
be4cf5ab-aa95-4235-a5ce-d04a991b5826	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	ORDER	1026000	\N	\N	2025-12-06 17:37:58.544	\N	\N
5e05f696-7602-47e2-a8a1-3d0af0cfa45a	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	PAYMENT	820800	\N	\N	2025-12-06 20:37:58.544	\N	\N
d415fcde-3a97-44fe-8d40-aa2398118c85	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	ORDER	1432000	\N	\N	2025-12-07 17:37:58.55	\N	\N
bc0a5a8e-1494-44eb-91f2-011cae2e47c8	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	PAYMENT	1288800	\N	\N	2025-12-07 20:37:58.55	\N	\N
4127d001-9725-440d-8244-70985d839762	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	ORDER	194000	\N	\N	2025-12-07 17:37:58.555	\N	\N
577da5c5-ed18-480f-ad43-9c23b8e75020	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	ORDER	392000	\N	\N	2025-12-08 17:37:58.557	\N	\N
e037332e-f0d9-40ee-9e99-cfeb72746634	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	PAYMENT	235200	\N	\N	2025-12-08 20:37:58.557	\N	\N
c210d4d9-253f-4ea5-8207-2acbb36ec9c2	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	ORDER	622000	\N	\N	2025-12-09 17:37:58.562	\N	\N
68ac1ddc-8ff7-40cf-aaeb-a3ff4d5e4ee7	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	PAYMENT	435400	\N	\N	2025-12-09 20:37:58.562	\N	\N
90cf1c59-57f0-48b9-b555-167a3b36e50c	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	ORDER	884000	\N	\N	2025-12-10 17:37:58.567	\N	\N
b74b0994-c3d2-476e-b63d-0316a1749328	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	PAYMENT	707200	\N	\N	2025-12-10 20:37:58.567	\N	\N
e850c468-0b90-4b65-8f76-d9242e0916e8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	ORDER	198000	\N	\N	2025-12-11 17:37:58.57	\N	\N
fcffd879-b236-4a00-a80d-fe368117124b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	PAYMENT	178200	\N	\N	2025-12-11 20:37:58.57	\N	\N
95a25321-718a-48be-8439-f7001d723e60	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	42d9cfcb-5dfb-4e22-9560-dedbf628b385	ORDER	428000	\N	\N	2025-12-12 17:37:58.573	\N	\N
06cc576e-487b-45a8-88cf-ed81e95a2b52	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	ORDER	690000	\N	\N	2025-12-13 17:37:58.575	\N	\N
33be2274-44a4-49fd-a627-a25ca898a98e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	PAYMENT	414000	\N	\N	2025-12-13 20:37:58.575	\N	\N
4d9f039e-d98c-4b0a-92fb-53f93f5f1143	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	ORDER	984000	\N	\N	2025-12-14 17:37:58.58	\N	\N
92aa6fda-9499-417b-a1e2-40e1dc777276	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	PAYMENT	688800	\N	\N	2025-12-14 20:37:58.58	\N	\N
476823d4-5eed-4d31-8b38-b3425191e687	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	ORDER	578000	\N	\N	2025-12-15 17:37:58.584	\N	\N
416a9587-9ae9-429e-b732-01949878ab37	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	PAYMENT	462400	\N	\N	2025-12-15 20:37:58.584	\N	\N
6175ba11-ba97-4002-b973-36f093537f14	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	ORDER	904000	\N	\N	2025-12-16 17:37:58.588	\N	\N
d5b29170-83bd-42e6-9ec2-e96ef80c4e95	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	PAYMENT	813600	\N	\N	2025-12-16 20:37:58.588	\N	\N
9b0ed6f8-87a0-4fcf-a2dc-bfdc6837d8fd	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	97dce907-dede-4fad-9991-f76b02f241c0	ORDER	1262000	\N	\N	2025-12-16 17:37:58.591	\N	\N
e70197cd-3920-4b9e-83f9-2a47426cd3c5	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	ORDER	1652000	\N	\N	2025-12-17 17:37:58.593	\N	\N
e6c2fa00-1207-4afd-8271-001384cce1b7	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	PAYMENT	991200	\N	\N	2025-12-17 20:37:58.593	\N	\N
e021ee56-2b4e-4131-9065-320aa73262b1	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	ORDER	326000	\N	\N	2025-12-18 17:37:58.598	\N	\N
fdbc4b25-eed9-4b27-90c0-d8d3d65c972b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	PAYMENT	228200	\N	\N	2025-12-18 20:37:58.598	\N	\N
0ed6c076-c12a-438b-8cb3-01eb1ab9c330	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	ORDER	684000	\N	\N	2025-12-19 17:37:58.602	\N	\N
a89c5287-8363-4782-bba5-d1f43153bb13	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	PAYMENT	547200	\N	\N	2025-12-19 20:37:58.602	\N	\N
be0dd823-a207-4e76-aac9-2cd871f5bcf9	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	ORDER	1074000	\N	\N	2025-12-20 17:37:58.605	\N	\N
f4042d4a-2e76-4d29-802a-e19a010b44b6	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	PAYMENT	966600	\N	\N	2025-12-20 20:37:58.605	\N	\N
ac9e52d3-5bd9-4957-bd98-63858ae66704	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	17b030ff-132b-47ca-a099-729ff1cc3a5d	ORDER	1496000	\N	\N	2025-12-21 17:37:58.609	\N	\N
1b167216-38fb-4d3a-903b-1f66382586d5	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	ORDER	962000	\N	\N	2025-12-22 17:37:58.61	\N	\N
ab3757be-7af0-4aa5-9166-c3afcb07769b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	PAYMENT	577200	\N	\N	2025-12-22 20:37:58.61	\N	\N
dd99f8b1-ed93-44cc-8268-fd6ee4ab3e6c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	ORDER	936000	\N	\N	2025-12-23 17:37:58.615	\N	\N
e700c236-d13b-4ad4-a8e5-e4f6f453bce3	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	PAYMENT	655200	\N	\N	2025-12-23 20:37:58.615	\N	\N
d89b4bc9-6069-46c4-ad98-2010c12b25b5	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	ORDER	1182000	\N	\N	2025-12-24 17:37:58.619	\N	\N
ef18a62e-1e1d-4621-b17b-8829cb5a290d	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	PAYMENT	945600	\N	\N	2025-12-24 20:37:58.619	\N	\N
43a0f82e-de58-4cbc-b4b7-89777bfef75e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	ORDER	1460000	\N	\N	2025-12-25 17:37:58.622	\N	\N
3b4f34ae-768f-48a5-bdab-6eda045ae98d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	PAYMENT	1314000	\N	\N	2025-12-25 20:37:58.622	\N	\N
57fde942-9f72-4e27-b130-4ba822293d9d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	8ba64cce-4753-4815-841e-954ccfa3f432	ORDER	214000	\N	\N	2025-12-25 17:37:58.625	\N	\N
1d07a9df-0fc3-4ffc-9c19-0832beb5b84b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	ORDER	460000	\N	\N	2025-12-26 17:37:58.628	\N	\N
5b7ac458-ac85-4470-8af6-71646fe03aca	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	PAYMENT	276000	\N	\N	2025-12-26 20:37:58.628	\N	\N
65eeea6e-11e3-4a1b-9050-503a034522eb	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	ORDER	738000	\N	\N	2025-12-27 17:37:58.632	\N	\N
8436ac21-f126-473b-b744-63525cb1c687	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	PAYMENT	516600	\N	\N	2025-12-27 20:37:58.632	\N	\N
891157db-8ce4-4dd7-b2f9-951c120d7db4	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	ORDER	1048000	\N	\N	2025-12-28 17:37:58.635	\N	\N
292c5da2-406e-465d-a594-01868408ce4e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	PAYMENT	838400	\N	\N	2025-12-28 20:37:58.635	\N	\N
ae00a8f7-0ea1-45f5-81b8-e5281d0899e3	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	ORDER	1106000	\N	\N	2025-12-29 17:37:58.639	\N	\N
be7f8ace-8e66-4ec5-b3f5-b3898a4d88f7	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	PAYMENT	995400	\N	\N	2025-12-29 20:37:58.639	\N	\N
6fb27bd1-37b8-44f3-914f-4a1ed5ffad89	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	ea743292-3ef3-4392-a2bf-2d5555f8e034	ORDER	1448000	\N	\N	2025-12-30 17:37:58.642	\N	\N
d22a58b0-4c47-463c-850c-7f85ddc3911e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	ORDER	1822000	\N	\N	2025-12-31 17:37:58.644	\N	\N
481d2496-6db9-4e99-b9fb-c7683f53c3a3	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	PAYMENT	1093200	\N	\N	2025-12-31 20:37:58.644	\N	\N
12b39b8d-d83d-44ee-9f46-b792f6316c6e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	ORDER	1908000	\N	\N	2026-01-01 17:37:58.649	\N	\N
2e2dd087-dc14-4d04-9d19-ba250c3823fd	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	PAYMENT	1335600	\N	\N	2026-01-01 20:37:58.649	\N	\N
74565ad2-0e6a-4c73-b9d0-212bf466202a	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	ORDER	262000	\N	\N	2026-01-02 17:37:58.652	\N	\N
8e159f2b-a73f-4052-ae54-800af8fd0c4f	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	PAYMENT	209600	\N	\N	2026-01-02 20:37:58.652	\N	\N
ec2821ff-0f00-4538-9558-6f76ed3f8d71	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	ORDER	556000	\N	\N	2026-01-03 17:37:58.655	\N	\N
ad617642-4e5a-4b03-8ef9-0b5d9a689782	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	PAYMENT	500400	\N	\N	2026-01-03 20:37:58.655	\N	\N
efd587ff-b231-4543-a62f-61b692dac02d	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	ORDER	162000	\N	\N	2026-01-03 17:37:58.658	\N	\N
41f2fc14-9404-4618-9495-eb9cc10342b8	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	ORDER	280000	\N	\N	2026-01-04 17:37:58.659	\N	\N
0c5e33f5-618c-4c59-84da-2460354014fb	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	PAYMENT	168000	\N	\N	2026-01-04 20:37:58.659	\N	\N
0371ca29-6319-44cb-9bc3-bf3a5f4f6930	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	ORDER	210000	\N	\N	2026-01-05 17:37:58.664	\N	\N
591d30bb-1292-4fa1-8ba0-ed574054adb9	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	PAYMENT	147000	\N	\N	2026-01-05 20:37:58.664	\N	\N
218b5e27-ab81-4fbc-a398-39601d404838	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	ORDER	360000	\N	\N	2026-01-06 17:37:58.667	\N	\N
a7eb6412-6a0c-45c9-a29e-8b5b7afe272c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	PAYMENT	288000	\N	\N	2026-01-06 20:37:58.667	\N	\N
77af67ce-efef-49b5-996d-0867e7890d9a	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	ORDER	542000	\N	\N	2026-01-07 17:37:58.67	\N	\N
33233a81-0e6c-4d85-9f81-62c3fa2a9b0d	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	PAYMENT	487800	\N	\N	2026-01-07 20:37:58.67	\N	\N
b4bcb4f7-b553-4f18-a065-ce8451a41e29	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	02fe2116-4394-4000-924e-8f306a09841f	ORDER	756000	\N	\N	2026-01-08 17:37:58.673	\N	\N
17dc56a4-c849-4e70-b7b0-da6b361fa039	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	ORDER	150000	\N	\N	2026-01-09 17:37:58.674	\N	\N
d5130efc-0dea-42e6-b748-97ceacf31da7	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	PAYMENT	90000	\N	\N	2026-01-09 20:37:58.674	\N	\N
24616586-6e5a-4181-977f-ab71c90358f9	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	ORDER	332000	\N	\N	2026-01-10 17:37:58.677	\N	\N
4d3f3b69-b458-4c18-a1ca-126b2a3f51b4	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	PAYMENT	232400	\N	\N	2026-01-10 20:37:58.677	\N	\N
8342a351-1168-4bf8-853c-aac6bf85c047	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	ORDER	546000	\N	\N	2026-01-11 17:37:58.682	\N	\N
a3147869-3abf-46f3-9ba2-2a0dba559447	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	PAYMENT	436800	\N	\N	2026-01-11 20:37:58.682	\N	\N
6aedf516-ca43-43c6-a6f8-b4f976864cfd	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	ORDER	792000	\N	\N	2026-01-12 17:37:58.685	\N	\N
d8bac338-4e36-4a2b-9de8-38a7cf4dcacb	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	PAYMENT	712800	\N	\N	2026-01-12 20:37:58.685	\N	\N
bbffc150-9743-4155-b2e3-8279b8d17d1a	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	f844dda2-398f-41a2-b0cf-88fa3697fdcf	ORDER	194000	\N	\N	2026-01-12 17:37:58.689	\N	\N
413a5748-3780-40cc-8eb0-b8d8d3fb19bd	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	ORDER	392000	\N	\N	2026-01-13 17:37:58.69	\N	\N
127ef52a-027a-47d4-8677-963d550243ad	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	PAYMENT	235200	\N	\N	2026-01-13 20:37:58.69	\N	\N
a404e1a6-db8b-416e-8375-ee410d13ebbe	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	ORDER	622000	\N	\N	2026-01-14 17:37:58.694	\N	\N
2ce330b7-4d54-4db4-bd24-bb33e4807de5	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	PAYMENT	435400	\N	\N	2026-01-14 20:37:58.694	\N	\N
bdae8eb3-e766-4bbf-84cd-52fdb8458bd7	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	ORDER	884000	\N	\N	2026-01-15 17:37:58.699	\N	\N
b7b8c9e1-46b0-44fd-9ff5-0a62bac53b21	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	PAYMENT	707200	\N	\N	2026-01-15 20:37:58.699	\N	\N
3e0cd221-9420-4e3d-8a0d-9499abcc9981	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	ORDER	198000	\N	\N	2026-01-16 17:37:58.702	\N	\N
f3711c82-5654-4108-8bc4-a6c765e238da	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	PAYMENT	178200	\N	\N	2026-01-16 20:37:58.702	\N	\N
fcf67f35-b4a3-4e2f-84c9-4e8b76d49193	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	ORDER	428000	\N	\N	2026-01-17 17:37:58.705	\N	\N
aad36579-7bd6-4d8f-815f-7a06560af2b9	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	ORDER	690000	\N	\N	2026-01-18 17:37:58.706	\N	\N
71bfeaac-c01c-4533-b6ec-b367e27d67df	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	PAYMENT	414000	\N	\N	2026-01-18 20:37:58.706	\N	\N
b3bdb4ba-cfd6-411a-af1c-7310bae88a0d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	ORDER	984000	\N	\N	2026-01-19 17:37:58.71	\N	\N
26dc4227-1b11-4b50-afb6-e42400c86ba8	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	PAYMENT	688800	\N	\N	2026-01-19 20:37:58.71	\N	\N
473b9fc3-7268-41cf-96b3-9401e9584f65	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	ORDER	578000	\N	\N	2026-01-20 17:37:58.715	\N	\N
eeef7b8d-3f04-42b4-a3b1-9e95e6ede41b	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	PAYMENT	462400	\N	\N	2026-01-20 20:37:58.715	\N	\N
88986892-8fe9-4785-898d-05eb32697060	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	ORDER	904000	\N	\N	2026-01-21 17:37:58.718	\N	\N
4f0e5c7d-9744-463d-90f8-d1c9658072a7	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	PAYMENT	813600	\N	\N	2026-01-21 20:37:58.718	\N	\N
b188cc7c-aa4f-4e0d-ac8f-600d343f5272	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	ORDER	1262000	\N	\N	2026-01-21 17:37:58.721	\N	\N
5f24203e-3c45-47dc-8434-5738e794ade4	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	ORDER	1652000	\N	\N	2026-01-22 17:37:58.723	\N	\N
d7103037-f243-46c2-a923-9dddec6efa07	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	PAYMENT	991200	\N	\N	2026-01-22 20:37:58.723	\N	\N
8af26942-4470-47da-8cf9-c4ed9d2802ea	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	ORDER	326000	\N	\N	2026-01-23 17:37:58.727	\N	\N
85a8a8d4-176b-47fa-9119-0331f719c086	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	PAYMENT	228200	\N	\N	2026-01-23 20:37:58.727	\N	\N
10182907-2087-44b7-af92-8de23945134a	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	ORDER	684000	\N	\N	2026-01-24 17:37:58.731	\N	\N
632d6b2f-c7dd-4d22-b3fb-600c26913811	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	PAYMENT	547200	\N	\N	2026-01-24 20:37:58.731	\N	\N
ead2ffa4-f601-43f0-99d6-07b2deb3cad1	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	ORDER	1074000	\N	\N	2026-01-25 17:37:58.735	\N	\N
55d99fb2-05a1-46b5-b77b-3e8b94551756	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	PAYMENT	966600	\N	\N	2026-01-25 20:37:58.735	\N	\N
bbd82ee3-ca89-4e03-b834-3b2b23832d95	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	42d9cfcb-5dfb-4e22-9560-dedbf628b385	ORDER	1496000	\N	\N	2026-01-26 17:37:58.738	\N	\N
5f08f585-f730-4d37-94d9-0d69de7fa7ba	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	ORDER	962000	\N	\N	2026-01-27 17:37:58.74	\N	\N
cac8010d-488a-4b6a-94da-39c1503e7798	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	PAYMENT	577200	\N	\N	2026-01-27 20:37:58.74	\N	\N
f517512f-75dc-4121-befe-9902a8d5f3e4	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	ORDER	936000	\N	\N	2026-01-28 17:37:58.743	\N	\N
91e42646-0526-4c19-ad39-7b4918d6b50f	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	PAYMENT	655200	\N	\N	2026-01-28 20:37:58.743	\N	\N
9bb60c31-badb-4221-9aa9-95d7ae857bdc	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	ORDER	1182000	\N	\N	2026-01-29 17:37:58.747	\N	\N
96ab0f2b-2437-40a3-820a-a88e8f7f3bc9	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	PAYMENT	945600	\N	\N	2026-01-29 20:37:58.747	\N	\N
ade9bd8f-d14f-4692-b780-0bbaa2625b2c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	ORDER	1460000	\N	\N	2026-01-30 17:37:58.751	\N	\N
39cf1665-81bd-420d-a5e6-aa33945ca38f	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	PAYMENT	1314000	\N	\N	2026-01-30 20:37:58.751	\N	\N
819e77e6-c801-4a5d-b49f-7463561c37a2	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	97dce907-dede-4fad-9991-f76b02f241c0	ORDER	214000	\N	\N	2026-01-30 17:37:58.753	\N	\N
4e75ae5a-2a97-4394-afa4-6ecf55ff5aac	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	ORDER	460000	\N	\N	2026-01-31 17:37:58.755	\N	\N
e6462d0a-3a3a-4c3b-9c86-4e06e643ced0	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	PAYMENT	276000	\N	\N	2026-01-31 20:37:58.755	\N	\N
537c2f28-f251-4469-9b59-1f781ef64c8e	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	ORDER	738000	\N	\N	2026-02-01 17:37:58.759	\N	\N
4cb44339-f630-4f8c-9b2c-a83a501d83ab	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	PAYMENT	516600	\N	\N	2026-02-01 20:37:58.759	\N	\N
57728322-f06f-42ad-b699-40f1601a416d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	ORDER	1048000	\N	\N	2026-02-02 17:37:58.763	\N	\N
3299d493-ab81-4a5c-b996-d375b0d2a2a0	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	PAYMENT	838400	\N	\N	2026-02-02 20:37:58.763	\N	\N
6ae7d795-97a7-45e8-b2e7-a6b5b1968ce8	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	ORDER	1106000	\N	\N	2026-02-03 17:37:58.767	\N	\N
201d20c8-56d1-4b22-a3c9-0dc8b184c1a5	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	PAYMENT	995400	\N	\N	2026-02-03 20:37:58.767	\N	\N
15b58fd1-68f7-4346-8af8-ba0356b4c9dc	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	17b030ff-132b-47ca-a099-729ff1cc3a5d	ORDER	1448000	\N	\N	2026-02-04 17:37:58.771	\N	\N
86a18a8d-5891-427e-bc2c-fad252b34c2f	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	ORDER	1822000	\N	\N	2026-02-05 17:37:58.775	\N	\N
57a07c35-dd3a-4741-b23e-3510a41a67f1	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	PAYMENT	1093200	\N	\N	2026-02-05 20:37:58.775	\N	\N
0e138e3b-7de9-4ff3-b3b5-d88c3bc2e960	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	ORDER	2228000	\N	\N	2026-02-06 17:37:58.781	\N	\N
6d266296-4cf8-49ba-863d-b7428dffc19f	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	PAYMENT	1559600	\N	\N	2026-02-06 20:37:58.781	\N	\N
428f80c9-3067-42b4-a123-45cf4a37b5bf	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	ORDER	342000	\N	\N	2026-02-07 17:37:58.786	\N	\N
ae3dc5c8-ce86-4938-948d-ebeaa01e7051	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	PAYMENT	273600	\N	\N	2026-02-07 20:37:58.786	\N	\N
bb4fc384-82e2-4df8-a31c-6e98868df0d6	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	ORDER	716000	\N	\N	2026-02-08 17:37:58.791	\N	\N
419ed866-7b08-418c-9581-7438da03c2af	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	PAYMENT	644400	\N	\N	2026-02-08 20:37:58.791	\N	\N
14c50808-f44a-4a1b-a899-c73ff373cf71	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	8ba64cce-4753-4815-841e-954ccfa3f432	ORDER	402000	\N	\N	2026-02-08 17:37:58.797	\N	\N
6704beba-3d62-4767-ac2a-849dcec810e1	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	ORDER	600000	\N	\N	2026-02-09 17:37:58.799	\N	\N
1d223e37-9647-41a6-8ed0-6547c71f2fdd	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	PAYMENT	360000	\N	\N	2026-02-09 20:37:58.799	\N	\N
28595b9c-ee79-4296-aed9-0840ee1886cd	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	ORDER	290000	\N	\N	2026-02-10 17:37:58.803	\N	\N
4f275923-df01-45a6-8171-c56af6b317d8	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	PAYMENT	203000	\N	\N	2026-02-10 20:37:58.803	\N	\N
8a64cc08-78b4-41db-9b9b-e15c3587aac1	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	ORDER	520000	\N	\N	2026-02-11 17:37:58.808	\N	\N
a8cd2b98-f023-4af4-b9f8-75f38350f083	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	PAYMENT	416000	\N	\N	2026-02-11 20:37:58.808	\N	\N
5cf11c63-0150-4856-9157-bfd06a95931d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	ORDER	782000	\N	\N	2026-02-12 17:37:58.812	\N	\N
1d4643df-edc0-48d2-a171-f2bea97f8135	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	PAYMENT	703800	\N	\N	2026-02-12 20:37:58.812	\N	\N
3bde3f38-2dd3-4c0d-acac-a6d73209b72f	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	ea743292-3ef3-4392-a2bf-2d5555f8e034	ORDER	1076000	\N	\N	2026-02-13 17:37:58.817	\N	\N
dab438e2-fda0-486f-b372-65a5bd493635	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	ORDER	230000	\N	\N	2026-02-14 17:37:58.82	\N	\N
4e604fbf-0a04-4e71-b714-c5c7c50c996e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	PAYMENT	138000	\N	\N	2026-02-14 20:37:58.82	\N	\N
82d11021-3537-452d-9167-79b40aabc023	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	ORDER	492000	\N	\N	2026-02-15 17:37:58.825	\N	\N
8a1ba76f-e63d-4928-b9ec-79e8475c39f9	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	PAYMENT	344400	\N	\N	2026-02-15 20:37:58.825	\N	\N
8eda6270-5b7e-4f37-9a8d-ca07797af81d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	ORDER	786000	\N	\N	2026-02-16 17:37:58.83	\N	\N
0100e0ef-73c8-4086-8fc7-b13ad22c72c1	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	PAYMENT	628800	\N	\N	2026-02-16 20:37:58.83	\N	\N
6fa0b013-e533-4eff-8d0c-c40e26d6610e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	ORDER	1112000	\N	\N	2026-02-17 17:37:58.835	\N	\N
77d09100-0b28-44ec-ad44-be6b91f34b12	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	PAYMENT	1000800	\N	\N	2026-02-17 20:37:58.835	\N	\N
b6c071ea-3fc8-4f3f-bfae-889615ff875c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	ORDER	674000	\N	\N	2026-02-17 17:37:58.838	\N	\N
4cf76854-d7fe-4722-a3b6-8a1ba4181165	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	ORDER	1032000	\N	\N	2026-02-18 17:37:58.84	\N	\N
bda2227e-e7e5-4fd0-aee4-4e6def845747	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	PAYMENT	619200	\N	\N	2026-02-18 20:37:58.84	\N	\N
bd506475-9972-42f8-b192-f7bbc8100e7a	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	ORDER	1422000	\N	\N	2026-02-19 17:37:58.844	\N	\N
094a9448-d550-4350-a32f-f762e81d4bc0	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	PAYMENT	995400	\N	\N	2026-02-19 20:37:58.844	\N	\N
23a3fd29-f51c-41a7-ae25-decf65ed4082	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	ORDER	1844000	\N	\N	2026-02-20 17:37:58.848	\N	\N
271151d0-1067-4d5d-8a56-b4c74e409b47	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	PAYMENT	1475200	\N	\N	2026-02-20 20:37:58.848	\N	\N
7e0367e8-b022-4c9e-a8a9-9fc72b050ecc	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	ORDER	358000	\N	\N	2026-02-21 17:37:58.852	\N	\N
286721f6-47fe-4bee-aa19-1c5e22b099eb	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	PAYMENT	322200	\N	\N	2026-02-21 20:37:58.852	\N	\N
c59c62d7-48da-4070-ac5a-bebad114ad44	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	02fe2116-4394-4000-924e-8f306a09841f	ORDER	748000	\N	\N	2026-02-22 17:37:58.855	\N	\N
0278fdc0-336d-40a5-a0f1-3f77fd3b6a11	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	ORDER	1170000	\N	\N	2026-02-23 17:37:58.856	\N	\N
f28f46e4-9aa0-4ed0-8692-ef77d5231bb4	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	PAYMENT	702000	\N	\N	2026-02-23 20:37:58.856	\N	\N
ba57f056-cc51-4957-bfda-b5be8c629512	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	ORDER	664000	\N	\N	2026-02-24 17:37:58.859	\N	\N
d0590ab6-9456-4ef5-88b2-7287b61750a9	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	PAYMENT	464800	\N	\N	2026-02-24 20:37:58.859	\N	\N
40769867-1de0-4b59-b590-f3b0b2a5735d	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	ORDER	818000	\N	\N	2026-02-25 17:37:58.863	\N	\N
e19a2c98-c000-4744-b6a7-549bb68958a9	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	PAYMENT	654400	\N	\N	2026-02-25 20:37:58.863	\N	\N
b1bed7e6-a21a-4a39-903a-1d04af0f100f	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	ORDER	1064000	\N	\N	2026-02-26 17:37:58.867	\N	\N
8a499e0a-a468-4713-80cc-d71a9654544d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	PAYMENT	957600	\N	\N	2026-02-26 20:37:58.867	\N	\N
72aec189-d46d-44ce-8fc3-90e7986a614c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	f844dda2-398f-41a2-b0cf-88fa3697fdcf	ORDER	1342000	\N	\N	2026-02-26 17:37:58.869	\N	\N
04398791-96ed-4cf2-abf1-c166156daa79	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	ORDER	1652000	\N	\N	2026-02-27 17:37:58.871	\N	\N
f34bc309-1b35-4bb7-8008-86f8906f7292	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	PAYMENT	991200	\N	\N	2026-02-27 20:37:58.871	\N	\N
664205f4-97a7-450d-a352-fc211b037191	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	ORDER	246000	\N	\N	2026-02-28 17:37:58.874	\N	\N
a2ec9e58-50c5-4611-b1ad-7137f3673d22	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	PAYMENT	172200	\N	\N	2026-02-28 20:37:58.874	\N	\N
1e46bf74-3c85-4f88-a915-698a5d141e6d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	ORDER	524000	\N	\N	2026-03-01 17:37:58.877	\N	\N
632786fe-5fd9-4ed6-a782-ab1cfff3c387	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	PAYMENT	419200	\N	\N	2026-03-01 20:37:58.877	\N	\N
7b709550-4c6a-4d2a-acd4-e4a7bd13a727	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	ORDER	834000	\N	\N	2026-03-02 17:37:58.881	\N	\N
6b576fdf-5dc9-4c4d-bb03-9a88768ba7ea	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	PAYMENT	750600	\N	\N	2026-03-02 20:37:58.881	\N	\N
e1eb51c5-0c91-4a0b-babf-7e7ff0704e80	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	ORDER	1176000	\N	\N	2026-03-03 17:37:58.885	\N	\N
20ed3f20-1db1-4f7e-bcd5-9b7d96069e58	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	ORDER	1202000	\N	\N	2026-03-04 17:37:58.887	\N	\N
ac9a0d6b-8939-450e-aab4-19c03b41c657	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	PAYMENT	721200	\N	\N	2026-03-04 20:37:58.887	\N	\N
77cb106e-6069-4a07-bbc7-dbadffa702b4	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	ORDER	1576000	\N	\N	2026-03-05 17:37:58.89	\N	\N
623a1f9a-48f6-4577-8874-2f9c6e770ea1	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	PAYMENT	1103200	\N	\N	2026-03-05 20:37:58.89	\N	\N
622a352f-5d71-4ede-90c9-13c87cab490e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	ORDER	1982000	\N	\N	2026-03-06 17:37:58.895	\N	\N
038d535d-7b2f-427e-a60a-d92a992255d6	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	PAYMENT	1585600	\N	\N	2026-03-06 20:37:58.895	\N	\N
2d68f858-d8fc-4535-828f-dea72c37b9f0	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	ORDER	2420000	\N	\N	2026-03-07 17:37:58.898	\N	\N
4da36f0f-82ef-42e4-b33c-2a80ba3f2901	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	PAYMENT	2178000	\N	\N	2026-03-07 20:37:58.898	\N	\N
4bbebe55-65b0-4cea-9e01-cfadce2c1c14	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	ORDER	134000	\N	\N	2026-03-07 17:37:58.902	\N	\N
9b5176d4-58b1-4ecc-abea-006a46932fbe	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	ORDER	300000	\N	\N	2026-03-08 17:37:58.903	\N	\N
77154c88-562c-4b81-b227-510eba196159	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	PAYMENT	180000	\N	\N	2026-03-08 20:37:58.903	\N	\N
15bd5c72-ec2b-44b1-a618-d579e9d8d831	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	ORDER	498000	\N	\N	2026-03-09 17:37:58.906	\N	\N
6fa6bc8e-d02a-4021-84a0-1d456c750ce2	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	PAYMENT	348600	\N	\N	2026-03-09 20:37:58.906	\N	\N
48b779ce-4b4a-4bdd-af86-b517356f22b4	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	ORDER	728000	\N	\N	2026-03-10 17:37:58.909	\N	\N
fba09c27-c327-41ca-aff0-d33b6c0d4830	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	PAYMENT	582400	\N	\N	2026-03-10 20:37:58.909	\N	\N
51488597-054b-4a32-9a26-ef439373eff0	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	ORDER	386000	\N	\N	2026-03-11 17:37:58.913	\N	\N
570d10f4-bac9-4e77-8a98-c98a34bfb0ed	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	PAYMENT	347400	\N	\N	2026-03-11 20:37:58.913	\N	\N
1ab29c09-ae01-4f73-8cc1-65a469e39157	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	42d9cfcb-5dfb-4e22-9560-dedbf628b385	ORDER	648000	\N	\N	2026-03-12 17:37:58.918	\N	\N
ad60e16b-7ecd-4643-9afe-a25381374f7c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	ORDER	942000	\N	\N	2026-03-13 17:37:58.92	\N	\N
7c351d4b-995a-4188-b8d9-9723ee92b198	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	PAYMENT	565200	\N	\N	2026-03-13 20:37:58.92	\N	\N
3d573a20-40de-4d9b-b992-a2a2782546f4	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	ORDER	1268000	\N	\N	2026-03-14 17:37:58.924	\N	\N
c2658d76-0e86-44ba-982d-cedb50cad044	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	PAYMENT	887600	\N	\N	2026-03-14 20:37:58.924	\N	\N
f32b030b-2a7a-41de-a8b9-a4ff8db1f971	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	ORDER	262000	\N	\N	2026-03-15 17:37:58.929	\N	\N
01236a9d-3452-4124-a115-7a37a5b86d26	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	PAYMENT	209600	\N	\N	2026-03-15 20:37:58.929	\N	\N
e359c740-ade3-4e22-a2be-f368bd9dda5c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	ORDER	556000	\N	\N	2026-03-16 17:37:58.933	\N	\N
7ca4cc1f-2518-460a-b7d0-e89be019d41b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	PAYMENT	500400	\N	\N	2026-03-16 20:37:58.933	\N	\N
047e5269-d1ea-4e55-a32a-45a490eb7478	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	97dce907-dede-4fad-9991-f76b02f241c0	ORDER	882000	\N	\N	2026-03-16 17:37:58.938	\N	\N
2f9bb650-597b-41eb-bce9-8553e3a55670	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	ORDER	1240000	\N	\N	2026-03-17 17:37:58.94	\N	\N
f5e01b3f-bff9-41b4-96da-0d6092d88434	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	PAYMENT	744000	\N	\N	2026-03-17 20:37:58.94	\N	\N
14b82b9f-975a-46bd-842e-46aa33cc04c8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	ORDER	770000	\N	\N	2026-03-18 17:37:58.945	\N	\N
b761511e-5065-499e-b990-c9eb0e28f6db	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	PAYMENT	539000	\N	\N	2026-03-18 20:37:58.945	\N	\N
8ddbfc39-9c89-4040-8e92-60a4bc1111ed	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	ORDER	1160000	\N	\N	2026-03-19 17:37:58.95	\N	\N
bda940bb-c301-4f7f-ab2e-2a0fd0ed63e6	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	PAYMENT	928000	\N	\N	2026-03-19 20:37:58.95	\N	\N
f54a5365-90e5-49dd-8fca-42841f11df35	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	ORDER	1582000	\N	\N	2026-03-20 17:37:58.955	\N	\N
0e60de3b-5567-45ee-83d8-d0725610f96d	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	PAYMENT	1423800	\N	\N	2026-03-20 20:37:58.955	\N	\N
904c3cc2-66ca-42c9-a7d6-b4ef83e9751d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	17b030ff-132b-47ca-a099-729ff1cc3a5d	ORDER	2036000	\N	\N	2026-03-21 17:37:58.958	\N	\N
cc5b029f-af03-4e7a-8dc8-a2b3fdd52ebc	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	ORDER	390000	\N	\N	2026-03-22 17:37:58.962	\N	\N
b282b60f-6b5e-47f0-8641-24a1214ff5b4	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	PAYMENT	234000	\N	\N	2026-03-22 20:37:58.962	\N	\N
1f954f4c-5714-41f7-9a72-5cfbc6b4b119	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	ORDER	332000	\N	\N	2026-03-23 17:37:58.966	\N	\N
82b6f4e6-6230-49aa-9632-ce84497ec2b7	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	PAYMENT	232400	\N	\N	2026-03-23 20:37:58.966	\N	\N
18736276-e808-4b3d-89f1-4ea5197ca3b1	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	ORDER	546000	\N	\N	2026-03-24 17:37:58.97	\N	\N
47c07beb-38cd-49c4-b25e-002ca2dcfd36	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	PAYMENT	436800	\N	\N	2026-03-24 20:37:58.97	\N	\N
8c9c7ec0-2ff7-4643-8853-866698615eaa	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	ORDER	792000	\N	\N	2026-03-25 17:37:58.973	\N	\N
afbb8356-6277-4bd9-b465-81df3e9543bb	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	PAYMENT	712800	\N	\N	2026-03-25 20:37:58.973	\N	\N
0981a7b1-e58e-4c2a-abeb-0128d2bcddf9	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	8ba64cce-4753-4815-841e-954ccfa3f432	ORDER	914000	\N	\N	2026-03-25 17:37:58.977	\N	\N
344453e7-359c-4047-9b74-8b14723b4339	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	ORDER	1192000	\N	\N	2026-03-26 17:37:58.98	\N	\N
fb5fbe89-6567-41cb-b645-eca46b58441c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	PAYMENT	715200	\N	\N	2026-03-26 20:37:58.98	\N	\N
048c3c6d-fefd-47d0-b1d2-f8b3ae76ae8f	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	ORDER	1502000	\N	\N	2026-03-27 17:37:58.983	\N	\N
85b26bf7-5d63-46d3-b192-685a9b662a19	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	PAYMENT	1051400	\N	\N	2026-03-27 20:37:58.983	\N	\N
ef29b14d-b619-437f-938b-f4c73e2a59b1	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	ORDER	1844000	\N	\N	2026-03-28 17:37:58.986	\N	\N
61d79ea5-92b8-48a1-b6d9-c6e04efeb618	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	PAYMENT	1475200	\N	\N	2026-03-28 20:37:58.986	\N	\N
b706d524-0110-4cfb-b034-e7b8a0034e98	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	ORDER	278000	\N	\N	2026-03-29 17:37:58.989	\N	\N
136ab3ef-f6e4-4c2e-a321-72c8aea3f087	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	PAYMENT	250200	\N	\N	2026-03-29 20:37:58.989	\N	\N
37b3689a-01cd-4d98-98ae-69c409158188	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	ea743292-3ef3-4392-a2bf-2d5555f8e034	ORDER	588000	\N	\N	2026-03-30 17:37:58.992	\N	\N
f69dc1ae-a928-48e6-b027-d7f73641bd14	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	ORDER	930000	\N	\N	2026-03-31 17:37:58.995	\N	\N
ba574c7a-d669-4f69-8472-ce48eabd2613	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	PAYMENT	558000	\N	\N	2026-03-31 20:37:58.995	\N	\N
f2701f3c-bcd3-4b8f-be1c-94b37a459a5c	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	ORDER	984000	\N	\N	2026-04-01 17:37:59	\N	\N
ce148c36-cb18-401b-aa6a-8199742e899e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	PAYMENT	688800	\N	\N	2026-04-01 20:37:59	\N	\N
d3362a33-5b2c-46e8-8a5c-c376a595fdf8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	ORDER	1218000	\N	\N	2026-04-02 17:37:59.003	\N	\N
c4d7e882-9763-4507-a0d8-2d29d19975d9	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	PAYMENT	974400	\N	\N	2026-04-02 20:37:59.003	\N	\N
810ad097-8e65-4855-ac9f-f03760afffc1	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	ORDER	1544000	\N	\N	2026-04-03 17:37:59.007	\N	\N
eb739cad-ceb8-411e-a601-98e20f2695e0	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	PAYMENT	1389600	\N	\N	2026-04-03 20:37:59.007	\N	\N
dc05ea27-4860-4b1d-ae74-bf22aa62cad0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	ORDER	222000	\N	\N	2026-04-03 17:37:59.012	\N	\N
4395d1e9-6e41-4143-b3b9-5435be2af1a9	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	ORDER	372000	\N	\N	2026-04-04 17:37:59.014	\N	\N
75728917-173b-495c-a4f5-498ec72ec927	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	PAYMENT	223200	\N	\N	2026-04-04 20:37:59.014	\N	\N
d879dc5c-fb0e-4c37-a6f2-3882aaa6f821	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	ORDER	86000	\N	\N	2026-04-05 17:37:59.019	\N	\N
112b0bd2-ef7e-4db5-863b-b7dfac1dcc0d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	PAYMENT	60200	\N	\N	2026-04-05 20:37:59.019	\N	\N
61c10590-ff09-44a9-aa2a-a6600c14f7f9	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	ORDER	204000	\N	\N	2026-04-06 17:37:59.022	\N	\N
5e5c479c-d643-4f25-9072-346536b8c0e9	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	PAYMENT	163200	\N	\N	2026-04-06 20:37:59.022	\N	\N
6f907288-fc9a-4e43-bacb-924feff2c721	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	ORDER	354000	\N	\N	2026-04-07 17:37:59.025	\N	\N
6651ee57-ecaa-41e1-8f3e-fe7d9347fd33	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	PAYMENT	318600	\N	\N	2026-04-07 20:37:59.025	\N	\N
87bf6c36-e070-4464-a3b8-8763331fc788	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	02fe2116-4394-4000-924e-8f306a09841f	ORDER	536000	\N	\N	2026-04-08 17:37:59.03	\N	\N
a4c257cf-2395-4294-98b2-e77dd30b7248	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	ORDER	402000	\N	\N	2026-04-09 17:37:59.032	\N	\N
c0a011df-2d14-4e93-ab49-72698169b837	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	PAYMENT	241200	\N	\N	2026-04-09 20:37:59.032	\N	\N
91c0ce78-2d01-4fa4-94c9-57a6834b286b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	ORDER	616000	\N	\N	2026-04-10 17:37:59.034	\N	\N
619bb27e-2cdf-4cda-9128-2e1ad44aaca6	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	PAYMENT	431200	\N	\N	2026-04-10 20:37:59.034	\N	\N
90609dd3-317b-400d-bcdd-9a27f594b21b	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	ORDER	862000	\N	\N	2026-04-11 17:37:59.039	\N	\N
9e63ce7d-c0f6-4fdb-a299-9e25ab18d4b7	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	PAYMENT	689600	\N	\N	2026-04-11 20:37:59.039	\N	\N
62a8db27-7105-414d-a117-62b6eb2ea20d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	ORDER	1140000	\N	\N	2026-04-12 17:37:59.042	\N	\N
d86d3748-7db2-41e1-b6d4-0dd31ab00fd8	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	PAYMENT	1026000	\N	\N	2026-04-12 20:37:59.042	\N	\N
aa69586b-07ac-48ce-82cd-04bf253878f4	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-1	ORDER	4500000	\N	\N	2026-04-02 19:00:00.15	\N	\N
602f5e1f-bc7d-492b-8a52-e1305dd5d747	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-2	ORDER	1200000	\N	\N	2026-04-04 19:00:00.15	\N	\N
dc586580-04cd-4f2f-b5c0-012f3374c5f7	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-3	ORDER	2500000	\N	\N	2026-04-05 19:00:00.15	\N	\N
c3610784-4b9e-4c74-8b14-2fa8194de671	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-4	ORDER	650000	\N	\N	2026-04-06 19:00:00.15	\N	\N
f390bf11-a72a-4311-92eb-8a5578b45faa	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-5	ORDER	3200000	\N	\N	2026-04-07 19:00:00.15	\N	\N
1aa3a4f1-2879-4c53-b8c2-f17fb80d8766	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-1	ORDER	900000	\N	\N	2026-04-08 19:00:00.15	\N	\N
52c2ef50-b44b-403e-898b-4760017b7643	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-2	ORDER	1800000	\N	\N	2026-04-09 19:00:00.15	\N	\N
f4b1d442-b08e-4aab-a757-46c0215fd928	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-3	ORDER	360000	\N	\N	2026-04-10 19:00:00.15	\N	\N
ec88327d-809b-436d-8c75-d29192d8f227	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-4	ORDER	2000000	\N	\N	2026-04-11 19:00:00.15	\N	\N
02f82037-ac7a-414a-bdbd-ed91b9f0218d	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-5	ORDER	500000	\N	\N	2026-04-12 19:00:00.15	\N	\N
c67eaec3-55c0-43c9-9d81-ba54a24612b9	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-1	PAYMENT	4500000	\N	\N	2026-04-03 19:00:00.15	\N	\N
b5be806a-9148-4b7a-bd69-cdd49bd9f6d4	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-3	PAYMENT	2360000	\N	\N	2026-04-06 19:00:00.15	\N	\N
081eee19-6a13-4fe7-bb5e-000ccced7835	677fe634-603d-4723-8c85-afff22b41391	\N	dealer-677fe634-603d-4723-8c85-afff22b41391-5	PAYMENT	3200000	\N	\N	2026-04-08 19:00:00.15	\N	\N
\.


--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."News" (id, "slugUz", "slugRu", "slugEn", "slugUzCyr", "slugTr", "titleUz", "titleRu", "titleEn", "titleUzCyr", "titleTr", "excerptUz", "excerptRu", "excerptEn", "excerptUzCyr", "excerptTr", "contentUz", "contentRu", "contentEn", "contentUzCyr", "contentTr", image, "authorId", "isPublished", "createdAt", "updatedAt", "viewCount") FROM stdin;
41b2844b-f75c-49fe-85b7-797ad611edbd	supplio-nima	chto-takoe-supplio	what-is-supplio	supplio-nima-uz-cyr	supplio-nedir	Supplio nima? Markaziy Osiyo uchun yaratilgan B2B distributsiya platformasi	Что такое Supplio? B2B-платформа дистрибуции для Центральной Азии	What is Supplio? The B2B Distribution Platform for Central Asia	Supplio нима? Марказий Осиё учун B2B дистрибуция платформаси	Supplio Nedir? Orta Asya İçin B2B Dağıtım Platformu	Supplio — ishlab chiqaruvchilar va distribyutorlar uchun dilerlarni boshqarish, kredit limitlarini nazorat qilish va Telegram orqali buyurtmalarni avtomatlashtirish imkonini beruvchi yagona SaaS platforma.	Supplio — это универсальная SaaS-платформа для управления дилерами, контроля кредитных лимитов и автоматизации заказов через Telegram.	Supplio is an all-in-one SaaS platform that helps manufacturers and distributors manage dealers, control credit limits, and automate orders through Telegram.	Supplio — дилерларни бошқариш, кредит лимитларини назорат қилиш ва Telegram орқали буюртмаларни автоматлаштириш имконини берувчи ягона SaaS платформа.	Supplio, bayileri yönetmenize, kredi limitlerini kontrol etmenize ve Telegram üzerinden siparişleri otomatikleştirmenize yardımcı olan hepsi bir arada SaaS platformudur.	## Supplio nima?\n\nSupplio — ishlab chiqaruvchilar, ulgurchi savdogarlar va distribyutorlar uchun maxsus yaratilgan zamonaviy B2B distributsiya boshqaruv platformasi.\n\nU tarqoq elektron jadvallar va qo'lda bajariladigan jarayonlar o'rniga bitta integratsiyalashgan tizim taklif etadi — dilerlar, buyurtmalar, kredit limitlar, inventar, to'lovlar, tahlillar hammasi bitta joyda.\n\n## Kim uchun?\n\n- **Ishlab chiqaruvchilar** — mintaqaviy distribyutorlar tarmog'iga sotadigan\n- **Distribyutorlar** — bir nechta filial bo'ylab yuzlab dilerlarni boshqaradigan\n- **Ulgurchi savdogarlar** — real vaqt kredit nazorati kerak bo'lgan\n\n## Asosiy imkoniyatlar\n\n**1. Telegram Bot** — Har bir filial o'zining brendlangan botini oladi. Dilerlar chatda buyurtma berishadi.\n\n**2. Kredit Nazorat** — Har bir buyurtma tasdiqlashdan oldin kredit limiti tekshiriladi. Limitdan oshganda avtomatik bloklash.\n\n**3. Ko'p Filial** — Barcha filiallarni bitta paneldan boshqaring.\n\n**4. Tahlil va Hisobotlar** — Top dilerlar, eng ko'p sotiladigan mahsulotlar, kredit utilizatsiyasi real vaqtda.\n\n**5. Veb-do'kon** — supplio.uz/store/sizning-slug manzilida ommaviy katalog.\n\n## Nima uchun Supplio?\n\nAn'anaviy ERP tizimlari qimmat va sekin. Supplio Markaziy Osiyo biznesining haqiqatiga — Telegram asosiy muloqot vositasi bo'lgan, kredit shartlari keng tarqalgan muhitga mo'ljallangan.\n\n14 kunlik bepul sinov. Sozlash to'lovi yo'q. Uzoq muddatli shartnomalar yo'q.	## Что такое Supplio?\n\nSupplio — современная платформа управления B2B-дистрибуцией для производителей, оптовиков и дистрибьюторов.\n\nЗаменяет разрозненные таблицы единой системой: дилеры, заказы, кредиты, склад, платежи, аналитика — всё в одном месте.\n\n## Для кого?\n\n- **Производители** — продающие через дилерскую сеть\n- **Дистрибьюторы** — управляющие сотнями дилеров\n- **Оптовики** — нуждающиеся в контроле кредитов\n\n## Ключевые возможности\n\n**1. Telegram-боты** — Каждый филиал получает фирменного бота. Дилеры делают заказы прямо в чате.\n\n**2. Контроль кредитов** — Каждый заказ проверяется по лимиту. Автоблокировка при превышении.\n\n**3. Мультифилиальность** — Управление всеми филиалами с одной панели.\n\n**4. Аналитика** — Топ дилеры, продажи, кредитная утилизация в реальном времени.\n\n**5. Интернет-магазин** — Публичный каталог на supplio.uz/store/ваш-slug.\n\n## Почему Supplio?\n\nТрадиционные ERP дорогие и медленные. Supplio создан для реалий Центральной Азии — где Telegram основной инструмент, а кредитные условия повсеместны.\n\n14 дней бесплатно. Без платы за настройку. Без долгосрочных контрактов.	## What is Supplio?\n\nSupplio is a modern B2B distribution management platform built for manufacturers, wholesalers, and distributors in Central Asia and beyond.\n\nIt replaces scattered spreadsheets and manual processes with one integrated system where everything — dealers, orders, credit limits, inventory, payments, analytics — is managed in a single place.\n\n## Who is it for?\n\n- **Manufacturers** selling to regional distributor networks\n- **Distributors** managing hundreds of dealers across multiple branches\n- **Wholesalers** needing real-time credit control\n\n## Key Features\n\n**1. Telegram Bot** — Each branch gets a branded bot. Dealers order directly in chat.\n\n**2. Credit Control** — Every order is checked against credit limits. Auto-block on breach.\n\n**3. Multi-Branch** — Manage all branches from one dashboard.\n\n**4. Analytics** — Top dealers, fastest-moving products, credit utilization in real time.\n\n**5. Web Store** — Public catalog at supplio.uz/store/your-slug.\n\n## Why Supplio?\n\nTraditional ERP systems are expensive and slow to implement. Supplio is built for Central Asian business reality — where Telegram is the primary tool and credit terms are standard.\n\n14-day free trial. No setup fees. No long-term contracts.	## Supplio нима?\n\nSupplio — ишлаб чиқарувчилар, улгурчи савдогарлар ва дистрибьюторлар учун замонавий B2B дистрибуция бошқарув платформаси.\n\nТарқоқ жадваллар ва қўлда бажариладиган жараёнлар ўрнига битта тизим: дилерлар, буюртмалар, кредит лимитлар, инвентар, тўловлар, таҳлиллар — ҳаммаси битта жойда.\n\n## Асосий имкониятлар\n\n**1. Telegram Бот** — Ҳар бир филиал брендланган ботини олади.\n\n**2. Кредит Назорат** — Ҳар бир буюртма лимит бўйича текширилади. Автоблоклаш.\n\n**3. Кўп Филиал** — Барча филиалларни битта панелдан бошқаринг.\n\n**4. Таҳлил** — Реал вақтда топ дилерлар, маҳсулотлар, кредит утилизацияси.\n\n14 кунлик бепул синов. Созлаш тўлови йўқ.	## Supplio Nedir?\n\nSupplio, üreticiler, toptancılar ve distribütörler için geliştirilmiş modern bir B2B dağıtım yönetim platformudur.\n\nDağınık tabloları ve manuel süreçleri tek bir entegre sistemle değiştirir: bayiler, siparişler, kredi limitleri, envanter, ödemeler, analitik — hepsi tek yerde.\n\n## Kimler İçin?\n\n- Dağıtım ağına satan **üreticiler**\n- Yüzlerce bayi yöneten **distribütörler**\n- Gerçek zamanlı kredi kontrolü gereken **toptancılar**\n\n## Temel Özellikler\n\n**1. Telegram Botu** — Her şube markalı bir bot alır. Bayiler doğrudan sohbette sipariş verir.\n\n**2. Kredi Kontrolü** — Her sipariş limitle kontrol edilir. Limit aşımında otomatik engelleme.\n\n**3. Çok Şubeli Yönetim** — Tüm şubeleri tek panelden yönetin.\n\n**4. Analitik** — Gerçek zamanlı en iyi bayiler, ürünler, kredi kullanımı.\n\n**5. Web Mağazası** — supplio.uz/store/şirket-slug adresinde genel katalog.\n\n14 günlük ücretsiz deneme. Kurulum ücreti yok. Uzun vadeli sözleşme yok.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85	\N	t	2026-03-29 16:00:42.361	2026-03-29 16:00:42.361	0
80e7e20b-53cb-47bc-a29e-45001a5a9dc1	supplio-v2-taqdimot	supplio-v2-zapusk	supplio-v2-launch	supplio-v2-taqdimot-cyr	supplio-v2-tanitim	Supplio V2: Noldan Qayta Yaratildi	Представляем Supplio V2 — Полностью Перестроен	Introducing Supplio V2 — Rebuilt from the Ground Up	Supplio V2 Тақдимоти — Нолдан Қайта Яратилди	Supplio V2'yi Tanıtıyoruz — Sıfırdan Yeniden İnşa Edildi	Markaziy Osiyodagi B2B distribyutorlar uchun eng kuchli kredit-nazorat tizimi tayyor.	Самая мощная система кредитного контроля для B2B-дистрибьюторов Центральной Азии уже здесь.	The most powerful credit-control system ever built for B2B distributors in Central Asia is here.	Марказий Осиёдаги B2B дистрибьюторлар учун энг кучли кредит-назорат тизими тайёр.	Orta Asya'daki B2B distribütörler için en güçlü kredi kontrol sistemi burada.	Biz Supplio-ni butunlay qaytadan yaratdik. Yangi versiyada real vaqt sinxronizatsiyasi, har bir buyurtmada kredit tekshiruvi va yangilangan boshqaruv paneli mavjud.\n\nHar bir Telegram bot o'zaro ta'siri endi moliyaviy panelingizga bog'langan — diler buyurtma berganda kredit limiti millisekundlarda tekshiriladi.	Мы полностью перестроили Supplio. Новая версия включает синхронизацию в реальном времени, мгновенную проверку кредитных лимитов и обновлённую панель управления.\n\nКаждое взаимодействие с Telegram-ботом теперь напрямую связано с вашей финансовой панелью.	We've completely reimagined Supplio from the ground up. The new version features real-time ledger synchronization, instant credit verification on every order, and a redesigned dashboard.\n\nEvery Telegram bot interaction is now directly linked to your financial dashboard — credit limits verified in milliseconds.	Биз Supplio-ни бутунлай қайтадан яратдик. Янги версияда реал вақт синхронизацияси ва янгиланган бошқарув панели мавжуд.	Supplio'yu tamamen yeniden hayal ettik. Yeni sürüm gerçek zamanlı senkronizasyon, anında kredi doğrulama ve yeniden tasarlanmış kontrol paneli içeriyor.	https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80	\N	t	2026-03-29 16:00:42.37	2026-03-29 16:00:42.37	0
0fb2a05b-1afd-4e62-bbbb-2ef64242a5e7	telegram-orqali-distributsiya	telegram-pervym-delom	telegram-first-distribution	telegram-orqali-distributsiya-cyr	once-telegram-dagitim	Nima Uchun Distribyutorlar Telegramga O'tmoqda	Почему Дистрибьюторы Переходят на Telegram	Why Distributors Are Moving to Telegram-First Workflows	Нима Учун Дистрибьюторлар Телеграмга Ўтмоқда	Distribütörler Neden Telegram'a Geçiyor	Ko'proq distribyutorlar an'anaviy ilovalardan Telegram asosidagi buyurtma tizimlariga o'tmoqda.	Всё больше дистрибьюторов заменяют традиционные приложения системами заказов через Telegram.	More distributors are replacing traditional apps with Telegram-based ordering systems.	Кўпроқ дистрибьюторлар анъанавий иловалардан Телеграм асосидаги тизимларига ўтмоқда.	Giderek daha fazla distribütör geleneksel uygulamaları Telegram tabanlı sistemlerle değiştiriyor.	Telegram endi shunchaki messenger emas — biznes operatsion tizimiga aylanmoqda. Supplio-ning multi-bot arxitekturasi yordamida har bir diler sekin internetda ham ishlaydigan interfeysga ega.\n\nMa'lumotlarimiz shuni ko'rsatadiki, Telegram orqali buyurtma berish an'anaviy veb-formalarga nisbatan 73% tezroq.	Telegram — это уже не просто мессенджер, а полноценная бизнес-операционная система. С Supplio каждый дилер получает лёгкий интерфейс, работающий даже при медленном интернете.\n\nНаши данные: Telegram-заказы на 73% быстрее традиционных веб-форм.	Telegram is no longer just a messenger — it's becoming a business operating system. With Supplio's multi-bot architecture, each dealer gets an interface that works even on slow connections.\n\nOur data shows Telegram-based ordering reduces order processing time by 73% vs traditional web forms.	Телеграм энди шунчаки мессенжер эмас. Supplio-нинг мулти-бот архитектураси ёрдамида ҳар бир дилер секин интернетда ҳам ишлайдиган интерфейсга эга.	Telegram artık sadece bir mesajlaşma uygulaması değil. Supplio ile her bayi, yavaş bağlantılarda bile çalışan hafif bir arayüze sahip olur.\n\nTelegram tabanlı siparişler geleneksel formlardan %73 daha hızlı.	https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&q=80	\N	t	2026-03-29 16:00:42.373	2026-03-29 16:00:42.373	0
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "companyId", "senderId", "receiverUserId", "receiverDealerId", title, message, "isRead", type, "createdAt", "deletedAt") FROM stdin;
d09c8ae7-1762-41ca-955a-54da1d49daf7	2558c501-89df-4695-b56c-fbe600529b21	\N	6cb09fb1-1ca2-4ec1-8997-4e55140ba6bc	\N	To'la qarzingni 	To'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni 	f	PAYMENT_REMINDER	2026-03-28 19:23:54.608	\N
05fab27a-7f8b-435d-9beb-492dff334a03	2558c501-89df-4695-b56c-fbe600529b21	\N	3e448462-86e6-4eae-a2c7-3d6a52b2fd96	\N	To'la qarzingni 	To'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni 	f	PAYMENT_REMINDER	2026-03-28 19:23:54.608	\N
c6d486e5-f57f-4e98-8f4c-9559d736abfe	2558c501-89df-4695-b56c-fbe600529b21	\N	867b4dea-7836-4761-b5e8-ae005f12f926	\N	To'la qarzingni 	To'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni 	f	PAYMENT_REMINDER	2026-03-28 19:23:54.608	\N
6822ae8d-7617-49a3-b2dd-0f3fdfda4390	677fe634-603d-4723-8c85-afff22b41391	\N	99cfe604-cdee-4048-a231-32c13319c327	\N	To'la qarzingni 	To'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni 	f	PAYMENT_REMINDER	2026-03-28 19:23:54.608	\N
5ac3546e-00b1-4b88-b289-80667aa6bc0c	372dcf39-46c6-4fef-a349-808c82dc8d8a	\N	abf2f3b6-8458-419c-b7cf-37d134674bf8	\N	To'la qarzingni 	To'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni \nTo'la qarzingni 	t	PAYMENT_REMINDER	2026-03-28 19:23:54.608	\N
\.


--
-- Data for Name: NotificationLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationLog" (id, "companyId", "templateId", "dealerId", message, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: NotificationTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationTemplate" (id, "companyId", name, type, message, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "companyId", "dealerId", "branchId", "totalAmount", "totalCost", status, items, "createdAt", "updatedAt", "deletedAt", "deletedBy", note) FROM stdin;
eb0e2a0b-6b8e-403a-937f-d665d689c80e	2558c501-89df-4695-b56c-fbe600529b21	b122c83b-1b3f-4943-90b5-6226085c997d	5d6566ed-592b-4fa7-a851-a361a13eae9c	36000000	24000000	DELIVERED	[{"qty": 3, "cost": 8000000, "name": "Samsung Galaxy S24 Ultra", "price": 12000000, "productId": "727295e6-6c2a-415f-9c2c-55d616daf804"}]	2026-02-28 18:21:44.815	2026-03-28 18:21:44.817	\N	\N	\N
2fd957d6-4a98-4afe-a76a-8f571770d8c9	2558c501-89df-4695-b56c-fbe600529b21	5d76c986-4cad-446c-8442-21b4c0ee0cf9	5d6566ed-592b-4fa7-a851-a361a13eae9c	30000000	20000000	DELIVERED	[{"qty": 2, "cost": 10000000, "name": "iPhone 15 Pro Max", "price": 15000000, "productId": "d83ebc32-798a-4bd0-9eea-65bfdf0f05f3"}]	2026-03-02 18:21:44.824	2026-03-28 18:21:44.826	\N	\N	\N
1e0bc278-342c-4c35-a1ca-c1298c334840	2558c501-89df-4695-b56c-fbe600529b21	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	5d6566ed-592b-4fa7-a851-a361a13eae9c	3250000	2250000	DELIVERED	[{"qty": 50, "cost": 45000, "name": "Ariel Pods 30 ta", "price": 65000, "productId": "c79ec824-1f07-40ef-94f0-984b15da0f85"}]	2026-03-03 18:21:44.827	2026-03-28 18:21:44.829	\N	\N	\N
931e5de1-0f5c-4c24-8d54-ec8079585e35	2558c501-89df-4695-b56c-fbe600529b21	b122c83b-1b3f-4943-90b5-6226085c997d	5d6566ed-592b-4fa7-a851-a361a13eae9c	19000000	12500000	DELIVERED	[{"qty": 5, "cost": 2500000, "name": "Xiaomi Redmi Note 13", "price": 3800000, "productId": "bcacd7c5-f16f-46b7-a3b2-86b41b6cc0de"}]	2026-03-04 18:21:44.83	2026-03-28 18:21:44.832	\N	\N	\N
56aa987f-53ef-4b9b-882e-ba5c4a4d6979	2558c501-89df-4695-b56c-fbe600529b21	305f8ae0-3776-4761-8278-13ecb059e48d	5d6566ed-592b-4fa7-a851-a361a13eae9c	2400000	1650000	DELIVERED	[{"qty": 30, "cost": 55000, "name": "Tide 3kg", "price": 80000, "productId": "3c41c5ca-fab2-4b59-96e3-307964f01f12"}]	2026-03-06 18:21:44.833	2026-03-28 18:21:44.835	\N	\N	\N
7b090c35-9635-4541-8dc8-518884429338	2558c501-89df-4695-b56c-fbe600529b21	5d76c986-4cad-446c-8442-21b4c0ee0cf9	5d6566ed-592b-4fa7-a851-a361a13eae9c	620000	420000	DELIVERED	[{"qty": 10, "cost": 42000, "name": "Nescafe Classic 200g", "price": 62000, "productId": "4c13e202-4250-494e-a7ec-466834b002e2"}]	2026-03-08 18:21:44.836	2026-03-28 18:21:44.837	\N	\N	\N
9b77b848-6496-42f1-84f7-5b1f8addcc0a	2558c501-89df-4695-b56c-fbe600529b21	14a0868a-c9ed-4962-92da-7d25d5e98e2c	5d6566ed-592b-4fa7-a851-a361a13eae9c	16000000	11000000	DELIVERED	[{"qty": 2, "cost": 5500000, "name": "Samsung 55\\" 4K TV", "price": 8000000, "productId": "39ac2546-bbae-49c3-9748-3e77c45f55d1"}]	2026-03-10 18:21:44.839	2026-03-28 18:21:44.84	\N	\N	\N
6c9d0fb1-28b7-45be-838f-9799f8de61ef	2558c501-89df-4695-b56c-fbe600529b21	03f6ef3f-54a8-47ca-8153-0983ace9b797	a8eb809c-172e-4d8a-a0b7-805f8286439f	1120000	720000	DELIVERED	[{"qty": 40, "cost": 18000, "name": "Domestos 750ml", "price": 28000, "productId": "25789aac-674b-41a0-932b-4bfeaf15a1fc"}]	2026-03-12 18:21:44.841	2026-03-28 18:21:44.843	\N	\N	\N
b35f97af-4355-4cfa-b059-bddf5d307c29	2558c501-89df-4695-b56c-fbe600529b21	b122c83b-1b3f-4943-90b5-6226085c997d	5d6566ed-592b-4fa7-a851-a361a13eae9c	15000000	10000000	DELIVERED	[{"qty": 1, "cost": 10000000, "name": "iPhone 15 Pro Max", "price": 15000000, "productId": "d83ebc32-798a-4bd0-9eea-65bfdf0f05f3"}]	2026-03-14 18:21:44.843	2026-03-28 18:21:44.845	\N	\N	\N
023e9384-a05a-41ad-90e9-2f4af3e3e3a6	2558c501-89df-4695-b56c-fbe600529b21	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	5d6566ed-592b-4fa7-a851-a361a13eae9c	360000	240000	DELIVERED	[{"qty": 20, "cost": 12000, "name": "Lay's 160g Assorted", "price": 18000, "productId": "6ea27cfe-d78f-4b78-96c6-b2cc6139c930"}]	2026-03-16 18:21:44.845	2026-03-28 18:21:44.847	\N	\N	\N
e642af95-fb71-49fd-b310-fc287922a7fc	2558c501-89df-4695-b56c-fbe600529b21	eb9fdd9f-8ae4-4252-a662-ac14a105d55e	a8eb809c-172e-4d8a-a0b7-805f8286439f	1300000	800000	DELIVERED	[{"qty": 100, "cost": 8000, "name": "Coca-Cola 1.5L", "price": 13000, "productId": "85b8d292-dfb9-4273-9620-1adab5224e96"}]	2026-03-18 18:21:44.848	2026-03-28 18:21:44.85	\N	\N	\N
7c7dd916-2140-4ed6-9a3a-09cacff114e0	2558c501-89df-4695-b56c-fbe600529b21	305f8ae0-3776-4761-8278-13ecb059e48d	5d6566ed-592b-4fa7-a851-a361a13eae9c	24000000	16000000	DELIVERED	[{"qty": 2, "cost": 8000000, "name": "Samsung Galaxy S24 Ultra", "price": 12000000, "productId": "727295e6-6c2a-415f-9c2c-55d616daf804"}]	2026-03-19 18:21:44.851	2026-03-28 18:21:44.852	\N	\N	\N
47079b00-808f-4ba7-8a87-b735be7b1321	2558c501-89df-4695-b56c-fbe600529b21	5d76c986-4cad-446c-8442-21b4c0ee0cf9	5d6566ed-592b-4fa7-a851-a361a13eae9c	30400000	20000000	PENDING	[{"qty": 8, "cost": 2500000, "name": "Xiaomi Redmi Note 13", "price": 3800000, "productId": "bcacd7c5-f16f-46b7-a3b2-86b41b6cc0de"}]	2026-03-21 18:21:44.853	2026-03-28 18:21:44.854	\N	\N	\N
3b50d540-bbb9-4480-8c59-f72d7d14298d	2558c501-89df-4695-b56c-fbe600529b21	c429d9c4-5478-4478-89c2-98345a274317	a8eb809c-172e-4d8a-a0b7-805f8286439f	3900000	2700000	PENDING	[{"qty": 60, "cost": 45000, "name": "Ariel Pods 30 ta", "price": 65000, "productId": "c79ec824-1f07-40ef-94f0-984b15da0f85"}]	2026-03-22 18:21:44.855	2026-03-28 18:21:44.856	\N	\N	\N
db1ee33a-637a-48d3-8299-1d1f9ff8dbd1	2558c501-89df-4695-b56c-fbe600529b21	14a0868a-c9ed-4962-92da-7d25d5e98e2c	5d6566ed-592b-4fa7-a851-a361a13eae9c	2000000	1375000	PENDING	[{"qty": 25, "cost": 55000, "name": "Tide 3kg", "price": 80000, "productId": "3c41c5ca-fab2-4b59-96e3-307964f01f12"}]	2026-03-23 18:21:44.857	2026-03-28 18:21:44.859	\N	\N	\N
d63d020a-4507-4d99-8315-8592d215d7ae	2558c501-89df-4695-b56c-fbe600529b21	b122c83b-1b3f-4943-90b5-6226085c997d	5d6566ed-592b-4fa7-a851-a361a13eae9c	310000	210000	PENDING	[{"qty": 5, "cost": 42000, "name": "Nescafe Classic 200g", "price": 62000, "productId": "4c13e202-4250-494e-a7ec-466834b002e2"}]	2026-03-24 18:21:44.859	2026-03-28 18:21:44.861	\N	\N	\N
28078c1c-2323-46af-87a8-e16125c76505	2558c501-89df-4695-b56c-fbe600529b21	cc8274a6-19c3-4e45-a207-c9902126e0e4	a8eb809c-172e-4d8a-a0b7-805f8286439f	45000000	30000000	PENDING	[{"qty": 3, "cost": 10000000, "name": "iPhone 15 Pro Max", "price": 15000000, "productId": "d83ebc32-798a-4bd0-9eea-65bfdf0f05f3"}]	2026-03-25 18:21:44.862	2026-03-28 18:21:44.864	\N	\N	\N
f7b91f0f-6087-4c34-9967-587751119dca	2558c501-89df-4695-b56c-fbe600529b21	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	5d6566ed-592b-4fa7-a851-a361a13eae9c	1960000	1260000	PENDING	[{"qty": 70, "cost": 18000, "name": "Domestos 750ml", "price": 28000, "productId": "25789aac-674b-41a0-932b-4bfeaf15a1fc"}]	2026-03-26 18:21:44.865	2026-03-28 18:21:44.866	\N	\N	\N
1031a935-0f87-41cf-91b6-3e0a9c71b825	2558c501-89df-4695-b56c-fbe600529b21	03f6ef3f-54a8-47ca-8153-0983ace9b797	a8eb809c-172e-4d8a-a0b7-805f8286439f	8000000	5500000	PENDING	[{"qty": 1, "cost": 5500000, "name": "Samsung 55\\" 4K TV", "price": 8000000, "productId": "39ac2546-bbae-49c3-9748-3e77c45f55d1"}]	2026-03-27 18:21:44.867	2026-03-28 18:21:44.869	\N	\N	\N
28aa837e-5d61-4b29-ae5e-f26f1aaec2ba	2558c501-89df-4695-b56c-fbe600529b21	193d572b-d791-4918-8f8c-fe5b018be616	5d6566ed-592b-4fa7-a851-a361a13eae9c	270000	180000	PENDING	[{"qty": 15, "cost": 12000, "name": "Lay's 160g Assorted", "price": 18000, "productId": "6ea27cfe-d78f-4b78-96c6-b2cc6139c930"}]	2026-03-28 18:21:44.869	2026-03-28 18:21:44.871	\N	\N	\N
a505ed5f-1c33-4c9b-b4f5-adfa171b9779	33930263-cce8-4ffb-9b22-07ff6b07a268	f844dda2-398f-41a2-b0cf-88fa3697fdcf	e23a801b-22e3-4e63-8aa9-7c91855ab84b	134000	83000	PENDING	[{"qty": 1, "name": "Elektronika mahsulot 1", "unit": "box", "price": 15000, "total": 15000, "productId": "083e0980-ef76-4b55-9984-7687fd62c047"}, {"qty": 1, "name": "Maishiy texnika mahsulot 14", "unit": "pcs", "price": 119000, "total": 119000, "productId": "dda131a0-5270-44f5-a47e-5ced8f8544c1"}]	2025-10-14 17:37:58.239	2026-04-12 17:37:58.24	\N	\N	\N
0fec615a-bd19-43ed-92b2-08ef1fa4841e	33930263-cce8-4ffb-9b22-07ff6b07a268	dafc9765-065a-4a7b-987e-299642d3dc4b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	300000	186000	ACCEPTED	[{"qty": 2, "name": "Oziq-ovqat mahsulot 2", "unit": "pcs", "price": 23000, "total": 46000, "productId": "c3ef2e06-a1cf-46c8-9b8d-1d907027f5f2"}, {"qty": 2, "name": "Sport mahsulot 15", "unit": "pcs", "price": 127000, "total": 254000, "productId": "3107f9a6-5f69-471b-82fc-efb24acb6c6f"}]	2025-10-15 17:37:58.264	2026-04-12 17:37:58.265	\N	\N	\N
19ca8e1a-8227-411f-a1e4-83935ef965fe	33930263-cce8-4ffb-9b22-07ff6b07a268	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	f6736eff-d631-4f50-86f6-ad3187d95ecf	498000	309000	PREPARING	[{"qty": 3, "name": "Kiyim mahsulot 3", "unit": "pcs", "price": 31000, "total": 93000, "productId": "3d14bc97-06e2-43b7-8976-7cac73e31c93"}, {"qty": 3, "name": "Elektronika mahsulot 16", "unit": "box", "price": 135000, "total": 405000, "productId": "c1fd16d4-acc8-4479-89e7-311714c6ff46"}]	2025-10-16 17:37:58.273	2026-04-12 17:37:58.274	\N	\N	\N
48d3bcf1-d128-4de6-9193-82601718b656	33930263-cce8-4ffb-9b22-07ff6b07a268	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	fcecf24d-f041-4838-95da-549726630e12	728000	452000	SHIPPED	[{"qty": 4, "name": "Maishiy texnika mahsulot 4", "unit": "box", "price": 39000, "total": 156000, "productId": "f22db48b-a300-457b-a5c1-861f85086d4c"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 17", "unit": "pcs", "price": 143000, "total": 572000, "productId": "580bb021-7cb0-4fae-8ecd-459290bfc019"}]	2025-10-17 17:37:58.28	2026-04-12 17:37:58.281	\N	\N	\N
f4e75380-2603-4532-8ac6-3428dda747a9	33930263-cce8-4ffb-9b22-07ff6b07a268	476b7d56-98a3-4107-bee7-f2c0908416ff	e23a801b-22e3-4e63-8aa9-7c91855ab84b	386000	239000	DELIVERED	[{"qty": 5, "name": "Sport mahsulot 5", "unit": "pcs", "price": 47000, "total": 235000, "productId": "2fbbc8a7-5d80-4027-90bf-592038d03dce"}, {"qty": 1, "name": "Kiyim mahsulot 18", "unit": "pcs", "price": 151000, "total": 151000, "productId": "3617506e-45b9-4ae5-b5b8-95e49604b231"}]	2025-10-18 17:37:58.285	2026-04-12 17:37:58.286	\N	\N	\N
543b08c0-8650-4da1-a687-ea89b53e625a	33930263-cce8-4ffb-9b22-07ff6b07a268	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	648000	402000	COMPLETED	[{"qty": 6, "name": "Elektronika mahsulot 6", "unit": "pcs", "price": 55000, "total": 330000, "productId": "8a7cad1c-2393-466d-8206-73092b9c771f"}, {"qty": 2, "name": "Maishiy texnika mahsulot 19", "unit": "box", "price": 159000, "total": 318000, "productId": "a0c6e78d-be69-4ffd-b323-10c67dea8c48"}]	2025-10-19 17:37:58.291	2026-04-12 17:37:58.292	\N	\N	\N
ecf91ec3-cb6d-4494-9354-2f16a7104cd6	33930263-cce8-4ffb-9b22-07ff6b07a268	3868f60e-2952-4725-a074-0b57752220a5	f6736eff-d631-4f50-86f6-ad3187d95ecf	942000	585000	CANCELLED	[{"qty": 7, "name": "Oziq-ovqat mahsulot 7", "unit": "box", "price": 63000, "total": 441000, "productId": "2e3fd8cb-b7fa-42d4-b917-09b40ed15d73"}, {"qty": 3, "name": "Sport mahsulot 20", "unit": "pcs", "price": 167000, "total": 501000, "productId": "abb1c752-bcbf-48fb-a108-426a7c9cbe57"}]	2025-10-20 17:37:58.293	2026-04-12 17:37:58.294	\N	\N	\N
96dfe889-ebda-4f26-9bca-05938f1f91b7	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-5	17c263ab-70a9-4bdd-a67f-d8cb8e330972	3200000	2400000	DELIVERED	"[{\\"productId\\":null,\\"name\\":\\"Premium Box Set\\",\\"qty\\":13,\\"unit\\":\\"pcs\\",\\"price\\":250000,\\"total\\":3250000}]"	2026-04-07 19:00:00.15	2026-04-12 19:00:00.197	\N	\N	\N
233012b0-4d67-4559-ba73-8afe51548cd3	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-1	17c263ab-70a9-4bdd-a67f-d8cb8e330972	900000	660000	ACCEPTED	"[{\\"productId\\":null,\\"name\\":\\"Standard Pack\\",\\"qty\\":20,\\"unit\\":\\"pcs\\",\\"price\\":45000,\\"total\\":900000}]"	2026-04-08 19:00:00.15	2026-04-12 19:00:00.203	\N	\N	\N
b55b161e-649c-47d2-9401-6d8c97661470	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-2	17c263ab-70a9-4bdd-a67f-d8cb8e330972	1800000	1350000	PREPARING	"[{\\"productId\\":null,\\"name\\":\\"Bulk Container\\",\\"qty\\":1,\\"unit\\":\\"pcs\\",\\"price\\":3500000,\\"total\\":3500000}]"	2026-04-09 19:00:00.15	2026-04-12 19:00:00.209	\N	\N	\N
c6ab46ce-e1da-44dc-9b63-679c76ffd24f	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-3	17c263ab-70a9-4bdd-a67f-d8cb8e330972	360000	240000	SHIPPED	"[{\\"productId\\":null,\\"name\\":\\"Mini Sample\\",\\"qty\\":30,\\"unit\\":\\"pcs\\",\\"price\\":12000,\\"total\\":360000}]"	2026-04-10 19:00:00.15	2026-04-12 19:00:00.216	\N	\N	\N
846b7d14-d2e1-4082-8943-b4b0f41380e8	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-4	17c263ab-70a9-4bdd-a67f-d8cb8e330972	2000000	1600000	PENDING	"[{\\"productId\\":null,\\"name\\":\\"Industrial Set\\",\\"qty\\":1,\\"unit\\":\\"pcs\\",\\"price\\":1200000,\\"total\\":1200000}]"	2026-04-11 19:00:00.15	2026-04-12 19:00:00.222	\N	\N	\N
8b960ede-1b1b-4a82-aff0-0c1f9a905a8c	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-5	17c263ab-70a9-4bdd-a67f-d8cb8e330972	500000	350000	CANCELLED	"[{\\"productId\\":null,\\"name\\":\\"Standard Pack\\",\\"qty\\":11,\\"unit\\":\\"pcs\\",\\"price\\":45000,\\"total\\":495000}]"	2026-04-12 19:00:00.15	2026-04-12 19:00:00.228	\N	\N	\N
98e4b3ce-4d8a-4b74-96b0-d35679c70dd3	33930263-cce8-4ffb-9b22-07ff6b07a268	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	fcecf24d-f041-4838-95da-549726630e12	1268000	788000	PENDING	[{"qty": 8, "name": "Kiyim mahsulot 8", "unit": "pcs", "price": 71000, "total": 568000, "productId": "7f1e5b9f-dccf-4291-97f8-e1a6141e7587"}, {"qty": 4, "name": "Elektronika mahsulot 21", "unit": "pcs", "price": 175000, "total": 700000, "productId": "0a9126c0-c935-4b61-9531-969d13072044"}]	2025-10-21 17:37:58.3	2026-04-12 17:37:58.301	\N	\N	\N
e4ab8e61-f518-4a43-b160-3a71e5ec9f35	33930263-cce8-4ffb-9b22-07ff6b07a268	569bf392-d510-4e78-b4c8-f580014e1c6a	e23a801b-22e3-4e63-8aa9-7c91855ab84b	262000	163000	ACCEPTED	[{"qty": 1, "name": "Maishiy texnika mahsulot 9", "unit": "pcs", "price": 79000, "total": 79000, "productId": "a2c21b37-562d-4f08-9706-0cd9665abc2a"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 22", "unit": "box", "price": 183000, "total": 183000, "productId": "d518f072-fcf5-422c-89a1-33108afd4656"}]	2025-10-22 17:37:58.305	2026-04-12 17:37:58.306	\N	\N	\N
606271f9-0ee5-4a4f-8cd4-77b431059dab	33930263-cce8-4ffb-9b22-07ff6b07a268	d6520409-350c-4741-8854-0621e3ec4328	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	556000	346000	PREPARING	[{"qty": 2, "name": "Sport mahsulot 10", "unit": "box", "price": 87000, "total": 174000, "productId": "0736c191-d62b-4fae-ab89-600f86bd1574"}, {"qty": 2, "name": "Kiyim mahsulot 23", "unit": "pcs", "price": 191000, "total": 382000, "productId": "92aec405-fede-4789-ac9d-9a4901c5d055"}]	2025-10-23 17:37:58.31	2026-04-12 17:37:58.311	\N	\N	\N
f11c7809-f9bb-4e6c-a008-4942cd97b2e6	33930263-cce8-4ffb-9b22-07ff6b07a268	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	f6736eff-d631-4f50-86f6-ad3187d95ecf	882000	549000	SHIPPED	[{"qty": 3, "name": "Elektronika mahsulot 11", "unit": "pcs", "price": 95000, "total": 285000, "productId": "7cb93dea-a617-4a46-8e70-eb9bb3662310"}, {"qty": 3, "name": "Maishiy texnika mahsulot 24", "unit": "pcs", "price": 199000, "total": 597000, "productId": "bf78405f-3f88-4b6b-9f85-6f6da9952288"}]	2025-10-23 17:37:58.317	2026-04-12 17:37:58.318	\N	\N	\N
899a026d-7efa-4da6-8ecc-84709d2fb68d	33930263-cce8-4ffb-9b22-07ff6b07a268	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	fcecf24d-f041-4838-95da-549726630e12	1240000	772000	DELIVERED	[{"qty": 4, "name": "Oziq-ovqat mahsulot 12", "unit": "pcs", "price": 103000, "total": 412000, "productId": "2cfb68ee-4fcd-492a-a10e-06bcb5e1b1b9"}, {"qty": 4, "name": "Sport mahsulot 25", "unit": "box", "price": 207000, "total": 828000, "productId": "96bf0ea0-28ab-47b4-a61d-2e7be9618e9d"}]	2025-10-24 17:37:58.319	2026-04-12 17:37:58.32	\N	\N	\N
181ee47e-9de1-4e36-b9e5-03a05280d67b	33930263-cce8-4ffb-9b22-07ff6b07a268	ac85fd64-67b6-42f1-aa37-1ea9add2f500	e23a801b-22e3-4e63-8aa9-7c91855ab84b	770000	354000	COMPLETED	[{"qty": 5, "name": "Kiyim mahsulot 13", "unit": "box", "price": 111000, "total": 555000, "productId": "e71e737e-f2d3-4980-866c-0224dac39cc7"}, {"qty": 1, "name": "Elektronika mahsulot 26", "unit": "pcs", "price": 215000, "total": 215000, "productId": "d457976e-5faf-45b3-8767-c93882827e1f"}]	2025-10-25 17:37:58.324	2026-04-12 17:37:58.325	\N	\N	\N
4d223eb7-ca61-450d-9c6a-44d2f42afc90	33930263-cce8-4ffb-9b22-07ff6b07a268	4e035e75-db70-4000-b6bc-e2df66cee240	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1160000	472000	CANCELLED	[{"qty": 6, "name": "Maishiy texnika mahsulot 14", "unit": "pcs", "price": 119000, "total": 714000, "productId": "dda131a0-5270-44f5-a47e-5ced8f8544c1"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 27", "unit": "pcs", "price": 223000, "total": 446000, "productId": "51e9021c-8a76-4dd0-880a-dad7d026f373"}]	2025-10-26 17:37:58.33	2026-04-12 17:37:58.331	\N	\N	\N
0a3d03f6-d52f-4a55-99fd-e97c7e20ac38	33930263-cce8-4ffb-9b22-07ff6b07a268	82aaa0ef-6d5e-469d-8218-866dfa87ab76	f6736eff-d631-4f50-86f6-ad3187d95ecf	1582000	610000	PENDING	[{"qty": 7, "name": "Sport mahsulot 15", "unit": "pcs", "price": 127000, "total": 889000, "productId": "3107f9a6-5f69-471b-82fc-efb24acb6c6f"}, {"qty": 3, "name": "Kiyim mahsulot 28", "unit": "box", "price": 231000, "total": 693000, "productId": "efbf1052-c2c2-4cc3-86a1-231500a6dfdc"}]	2025-10-27 17:37:58.336	2026-04-12 17:37:58.337	\N	\N	\N
1f098253-ddfc-42fb-84fd-283738c245ca	33930263-cce8-4ffb-9b22-07ff6b07a268	42d9cfcb-5dfb-4e22-9560-dedbf628b385	fcecf24d-f041-4838-95da-549726630e12	2036000	768000	ACCEPTED	[{"qty": 8, "name": "Elektronika mahsulot 16", "unit": "box", "price": 135000, "total": 1080000, "productId": "c1fd16d4-acc8-4479-89e7-311714c6ff46"}, {"qty": 4, "name": "Maishiy texnika mahsulot 29", "unit": "pcs", "price": 239000, "total": 956000, "productId": "dcf7f626-dcb7-4454-abcf-02a8036697ff"}]	2025-10-28 17:37:58.342	2026-04-12 17:37:58.342	\N	\N	\N
0dc97c26-c792-4a8e-aacf-3c4e3b9e6bd4	33930263-cce8-4ffb-9b22-07ff6b07a268	cad80b67-a04d-4679-88c7-883ac2b04911	e23a801b-22e3-4e63-8aa9-7c91855ab84b	390000	118000	PREPARING	[{"qty": 1, "name": "Oziq-ovqat mahsulot 17", "unit": "pcs", "price": 143000, "total": 143000, "productId": "580bb021-7cb0-4fae-8ecd-459290bfc019"}, {"qty": 1, "name": "Sport mahsulot 30", "unit": "pcs", "price": 247000, "total": 247000, "productId": "c0961f57-5bf4-41fb-9c57-bcb5b2234102"}]	2025-10-29 17:37:58.344	2026-04-12 17:37:58.345	\N	\N	\N
b4f4d7e5-9ede-429a-91a0-097460002b5a	33930263-cce8-4ffb-9b22-07ff6b07a268	503b7694-3480-45e9-8116-a469c79d249a	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	332000	256000	SHIPPED	[{"qty": 2, "name": "Kiyim mahsulot 18", "unit": "pcs", "price": 151000, "total": 302000, "productId": "3617506e-45b9-4ae5-b5b8-95e49604b231"}, {"qty": 2, "name": "Elektronika mahsulot 31", "unit": "box", "price": 15000, "total": 30000, "productId": "dcc1f158-ba92-4fd8-84e1-fcb05205988a"}]	2025-10-30 17:37:58.35	2026-04-12 17:37:58.351	\N	\N	\N
c111220c-0646-403e-9917-1c42f1cbf6f1	33930263-cce8-4ffb-9b22-07ff6b07a268	1213e655-58b1-4fd4-892c-c4a516f307c8	f6736eff-d631-4f50-86f6-ad3187d95ecf	546000	414000	DELIVERED	[{"qty": 3, "name": "Maishiy texnika mahsulot 19", "unit": "box", "price": 159000, "total": 477000, "productId": "a0c6e78d-be69-4ffd-b323-10c67dea8c48"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 32", "unit": "pcs", "price": 23000, "total": 69000, "productId": "e69b5dbf-8c1e-4a64-acf8-525c5a75e428"}]	2025-10-31 17:37:58.354	2026-04-12 17:37:58.355	\N	\N	\N
fa69ce27-4f46-4360-8cd9-6449841c73ac	33930263-cce8-4ffb-9b22-07ff6b07a268	45806072-c97b-42ae-babb-c934f7141ab8	fcecf24d-f041-4838-95da-549726630e12	792000	592000	COMPLETED	[{"qty": 4, "name": "Sport mahsulot 20", "unit": "pcs", "price": 167000, "total": 668000, "productId": "abb1c752-bcbf-48fb-a108-426a7c9cbe57"}, {"qty": 4, "name": "Kiyim mahsulot 33", "unit": "pcs", "price": 31000, "total": 124000, "productId": "5156b1f6-47da-47f2-bc86-c631344fa119"}]	2025-11-01 17:37:58.359	2026-04-12 17:37:58.36	\N	\N	\N
a628ad92-76ee-47ca-af85-3b6d85eb3997	33930263-cce8-4ffb-9b22-07ff6b07a268	97dce907-dede-4fad-9991-f76b02f241c0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	914000	594000	CANCELLED	[{"qty": 5, "name": "Elektronika mahsulot 21", "unit": "pcs", "price": 175000, "total": 875000, "productId": "0a9126c0-c935-4b61-9531-969d13072044"}, {"qty": 1, "name": "Maishiy texnika mahsulot 34", "unit": "box", "price": 39000, "total": 39000, "productId": "8a81236c-fd7e-4d88-aea5-7a6af0d4fb72"}]	2025-11-01 17:37:58.365	2026-04-12 17:37:58.366	\N	\N	\N
bcaebae3-62a4-4e86-8969-87e2cf367783	33930263-cce8-4ffb-9b22-07ff6b07a268	ef364e98-dc87-4278-84fc-3cbd6cd3a449	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1192000	792000	PENDING	[{"qty": 6, "name": "Oziq-ovqat mahsulot 22", "unit": "box", "price": 183000, "total": 1098000, "productId": "d518f072-fcf5-422c-89a1-33108afd4656"}, {"qty": 2, "name": "Sport mahsulot 35", "unit": "pcs", "price": 47000, "total": 94000, "productId": "b7e49c05-2750-4dc5-bed2-34e9a5852b6d"}]	2025-11-02 17:37:58.369	2026-04-12 17:37:58.369	\N	\N	\N
69c682e5-08b5-423f-a866-f5565dad7fab	33930263-cce8-4ffb-9b22-07ff6b07a268	362df153-f937-4dfc-a047-e167af652682	f6736eff-d631-4f50-86f6-ad3187d95ecf	1502000	1010000	ACCEPTED	[{"qty": 7, "name": "Kiyim mahsulot 23", "unit": "pcs", "price": 191000, "total": 1337000, "productId": "92aec405-fede-4789-ac9d-9a4901c5d055"}, {"qty": 3, "name": "Elektronika mahsulot 36", "unit": "pcs", "price": 55000, "total": 165000, "productId": "9bddfa35-565c-45e3-aa40-75301b165ee1"}]	2025-11-03 17:37:58.374	2026-04-12 17:37:58.374	\N	\N	\N
5e102f4c-f482-40ab-aeb0-4c3fab0aa66c	33930263-cce8-4ffb-9b22-07ff6b07a268	7dbe4041-1742-47f3-8bd2-0e932385bd9c	fcecf24d-f041-4838-95da-549726630e12	1844000	1248000	PREPARING	[{"qty": 8, "name": "Maishiy texnika mahsulot 24", "unit": "pcs", "price": 199000, "total": 1592000, "productId": "bf78405f-3f88-4b6b-9f85-6f6da9952288"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 37", "unit": "box", "price": 63000, "total": 252000, "productId": "93d44406-c84a-4622-8d6f-aae9c724a827"}]	2025-11-04 17:37:58.379	2026-04-12 17:37:58.38	\N	\N	\N
1e8ee226-6f11-411a-a47a-a630cd951503	33930263-cce8-4ffb-9b22-07ff6b07a268	b5bf2837-4d2a-4c19-8433-c595ce528ed1	e23a801b-22e3-4e63-8aa9-7c91855ab84b	278000	198000	SHIPPED	[{"qty": 1, "name": "Sport mahsulot 25", "unit": "box", "price": 207000, "total": 207000, "productId": "96bf0ea0-28ab-47b4-a61d-2e7be9618e9d"}, {"qty": 1, "name": "Kiyim mahsulot 38", "unit": "pcs", "price": 71000, "total": 71000, "productId": "5cfae025-87f4-42c9-ad54-42a245b252d2"}]	2025-11-05 17:37:58.384	2026-04-12 17:37:58.385	\N	\N	\N
d14116f7-fe89-4f55-a261-5eeda180f27a	33930263-cce8-4ffb-9b22-07ff6b07a268	17b030ff-132b-47ca-a099-729ff1cc3a5d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	588000	166000	DELIVERED	[{"qty": 2, "name": "Elektronika mahsulot 26", "unit": "pcs", "price": 215000, "total": 430000, "productId": "d457976e-5faf-45b3-8767-c93882827e1f"}, {"qty": 2, "name": "Maishiy texnika mahsulot 39", "unit": "pcs", "price": 79000, "total": 158000, "productId": "5ff42161-5799-41fd-9bbc-cc62904ce974"}]	2025-11-06 17:37:58.389	2026-04-12 17:37:58.39	\N	\N	\N
b91a41e9-329b-48d4-bd1d-1cec61f91a20	33930263-cce8-4ffb-9b22-07ff6b07a268	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	f6736eff-d631-4f50-86f6-ad3187d95ecf	930000	279000	COMPLETED	[{"qty": 3, "name": "Oziq-ovqat mahsulot 27", "unit": "pcs", "price": 223000, "total": 669000, "productId": "51e9021c-8a76-4dd0-880a-dad7d026f373"}, {"qty": 3, "name": "Sport mahsulot 40", "unit": "box", "price": 87000, "total": 261000, "productId": "5d9f5760-23c9-4c73-b7ee-cd907fc71730"}]	2025-11-07 17:37:58.391	2026-04-12 17:37:58.392	\N	\N	\N
6c896456-c19e-4e1e-9aa4-97999ab8df58	33930263-cce8-4ffb-9b22-07ff6b07a268	73062c7a-dff1-44ad-9a7e-18729e766900	fcecf24d-f041-4838-95da-549726630e12	1304000	412000	CANCELLED	[{"qty": 4, "name": "Kiyim mahsulot 28", "unit": "box", "price": 231000, "total": 924000, "productId": "efbf1052-c2c2-4cc3-86a1-231500a6dfdc"}, {"qty": 4, "name": "Elektronika mahsulot 41", "unit": "pcs", "price": 95000, "total": 380000, "productId": "780a65d0-2d3a-48cd-a4a5-3e3689e1879e"}]	2025-11-08 17:37:58.397	2026-04-12 17:37:58.398	\N	\N	\N
6ac758d3-3052-4311-b73e-5d18720235d3	33930263-cce8-4ffb-9b22-07ff6b07a268	70aa161e-8ee0-4950-afaa-f2e955b6c68f	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1298000	209000	PENDING	[{"qty": 5, "name": "Maishiy texnika mahsulot 29", "unit": "pcs", "price": 239000, "total": 1195000, "productId": "dcf7f626-dcb7-4454-abcf-02a8036697ff"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 42", "unit": "pcs", "price": 103000, "total": 103000, "productId": "f9b4adf6-4a42-4fe1-b890-d44d5699f8d5"}]	2025-11-09 17:37:58.401	2026-04-12 17:37:58.402	\N	\N	\N
230c3761-46a3-4958-becc-b1a114ebc7df	33930263-cce8-4ffb-9b22-07ff6b07a268	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1704000	362000	ACCEPTED	[{"qty": 6, "name": "Sport mahsulot 30", "unit": "pcs", "price": 247000, "total": 1482000, "productId": "c0961f57-5bf4-41fb-9c57-bcb5b2234102"}, {"qty": 2, "name": "Kiyim mahsulot 43", "unit": "box", "price": 111000, "total": 222000, "productId": "1faa7ac5-b969-48ad-8392-371b97f83235"}]	2025-11-10 17:37:58.405	2026-04-12 17:37:58.406	\N	\N	\N
3a4112b0-825c-48eb-9f0b-86f5b823b679	33930263-cce8-4ffb-9b22-07ff6b07a268	8ba64cce-4753-4815-841e-954ccfa3f432	f6736eff-d631-4f50-86f6-ad3187d95ecf	462000	535000	PREPARING	[{"qty": 7, "name": "Elektronika mahsulot 31", "unit": "box", "price": 15000, "total": 105000, "productId": "dcc1f158-ba92-4fd8-84e1-fcb05205988a"}, {"qty": 3, "name": "Maishiy texnika mahsulot 44", "unit": "pcs", "price": 119000, "total": 357000, "productId": "02e3b166-d99b-4e3e-8ab1-9a486493793c"}]	2025-11-10 17:37:58.41	2026-04-12 17:37:58.411	\N	\N	\N
c287b409-b5b7-4a41-bde3-63507cbba4dd	33930263-cce8-4ffb-9b22-07ff6b07a268	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	fcecf24d-f041-4838-95da-549726630e12	692000	728000	SHIPPED	[{"qty": 8, "name": "Oziq-ovqat mahsulot 32", "unit": "pcs", "price": 23000, "total": 184000, "productId": "e69b5dbf-8c1e-4a64-acf8-525c5a75e428"}, {"qty": 4, "name": "Sport mahsulot 45", "unit": "pcs", "price": 127000, "total": 508000, "productId": "5a9677ea-387e-475c-8728-ee24f7e6333a"}]	2025-11-11 17:37:58.413	2026-04-12 17:37:58.414	\N	\N	\N
cc38b1ef-9f43-4ba6-95b7-b3fef14b2b22	33930263-cce8-4ffb-9b22-07ff6b07a268	a2d3c202-6b97-439e-9ea1-705a8945bcc0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	166000	153000	DELIVERED	[{"qty": 1, "name": "Kiyim mahsulot 33", "unit": "pcs", "price": 31000, "total": 31000, "productId": "5156b1f6-47da-47f2-bc86-c631344fa119"}, {"qty": 1, "name": "Elektronika mahsulot 46", "unit": "box", "price": 135000, "total": 135000, "productId": "e14c9ae2-1c54-42e8-a4e1-9b7360c95bd2"}]	2025-11-12 17:37:58.418	2026-04-12 17:37:58.419	\N	\N	\N
083e70f1-24a9-44f3-83e7-6f7707f028fb	33930263-cce8-4ffb-9b22-07ff6b07a268	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	364000	326000	COMPLETED	[{"qty": 2, "name": "Maishiy texnika mahsulot 34", "unit": "box", "price": 39000, "total": 78000, "productId": "8a81236c-fd7e-4d88-aea5-7a6af0d4fb72"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 47", "unit": "pcs", "price": 143000, "total": 286000, "productId": "b404f8ec-1d81-49fc-81c2-fb187a526987"}]	2025-11-13 17:37:58.422	2026-04-12 17:37:58.423	\N	\N	\N
b1cfe335-fb96-470c-93d9-452b213f13ec	33930263-cce8-4ffb-9b22-07ff6b07a268	b59f04da-f8e4-43f9-8488-cff1a5e1180d	f6736eff-d631-4f50-86f6-ad3187d95ecf	594000	519000	CANCELLED	[{"qty": 3, "name": "Sport mahsulot 35", "unit": "pcs", "price": 47000, "total": 141000, "productId": "b7e49c05-2750-4dc5-bed2-34e9a5852b6d"}, {"qty": 3, "name": "Kiyim mahsulot 48", "unit": "pcs", "price": 151000, "total": 453000, "productId": "aec27ec5-8535-4b60-a0af-d44a3cefda6b"}]	2025-11-14 17:37:58.427	2026-04-12 17:37:58.428	\N	\N	\N
5f94488e-bdd1-483d-be22-820d812dbc1e	33930263-cce8-4ffb-9b22-07ff6b07a268	ea743292-3ef3-4392-a2bf-2d5555f8e034	fcecf24d-f041-4838-95da-549726630e12	856000	732000	PENDING	[{"qty": 4, "name": "Elektronika mahsulot 36", "unit": "pcs", "price": 55000, "total": 220000, "productId": "9bddfa35-565c-45e3-aa40-75301b165ee1"}, {"qty": 4, "name": "Maishiy texnika mahsulot 49", "unit": "box", "price": 159000, "total": 636000, "productId": "a012992e-ebe6-4d91-b5ad-6531acd42b60"}]	2025-11-15 17:37:58.433	2026-04-12 17:37:58.434	\N	\N	\N
6fa98a6e-55f2-4582-8c93-f6d81d9879a4	33930263-cce8-4ffb-9b22-07ff6b07a268	db460ec1-c062-4e57-8218-ea2add3a540e	e23a801b-22e3-4e63-8aa9-7c91855ab84b	482000	449000	ACCEPTED	[{"qty": 5, "name": "Oziq-ovqat mahsulot 37", "unit": "box", "price": 63000, "total": 315000, "productId": "93d44406-c84a-4622-8d6f-aae9c724a827"}, {"qty": 1, "name": "Sport mahsulot 50", "unit": "pcs", "price": 167000, "total": 167000, "productId": "2efcbe5d-6dde-45c2-b772-3e6eb86b0ef9"}]	2025-11-16 17:37:58.435	2026-04-12 17:37:58.436	\N	\N	\N
bb54f095-2504-41e4-8fd0-bd638e974145	33930263-cce8-4ffb-9b22-07ff6b07a268	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	776000	432000	PREPARING	[{"qty": 6, "name": "Kiyim mahsulot 38", "unit": "pcs", "price": 71000, "total": 426000, "productId": "5cfae025-87f4-42c9-ad54-42a245b252d2"}, {"qty": 2, "name": "Elektronika mahsulot 51", "unit": "pcs", "price": 175000, "total": 350000, "productId": "b0fb3ee1-6d8e-486e-8fa9-f5858213cf3c"}]	2025-11-17 17:37:58.439	2026-04-12 17:37:58.44	\N	\N	\N
f5a4f2a2-3074-4f2a-bce7-7045d0d8d015	33930263-cce8-4ffb-9b22-07ff6b07a268	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	f6736eff-d631-4f50-86f6-ad3187d95ecf	1102000	560000	SHIPPED	[{"qty": 7, "name": "Maishiy texnika mahsulot 39", "unit": "pcs", "price": 79000, "total": 553000, "productId": "5ff42161-5799-41fd-9bbc-cc62904ce974"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 52", "unit": "box", "price": 183000, "total": 549000, "productId": "58e36f86-5676-4784-84a3-7eb593885c4d"}]	2025-11-18 17:37:58.447	2026-04-12 17:37:58.448	\N	\N	\N
1acf61df-2bb4-48fe-916c-d19891a37b92	33930263-cce8-4ffb-9b22-07ff6b07a268	0edc83d9-aaed-446e-9206-bb6ebaefd489	fcecf24d-f041-4838-95da-549726630e12	1460000	708000	DELIVERED	[{"qty": 8, "name": "Sport mahsulot 40", "unit": "box", "price": 87000, "total": 696000, "productId": "5d9f5760-23c9-4c73-b7ee-cd907fc71730"}, {"qty": 4, "name": "Kiyim mahsulot 53", "unit": "pcs", "price": 191000, "total": 764000, "productId": "196e8df5-4b2b-4783-b3f7-d16dd4d8f4e4"}]	2025-11-19 17:37:58.453	2026-04-12 17:37:58.454	\N	\N	\N
dc09eabe-124b-413e-b514-19bf4b5e2ae2	33930263-cce8-4ffb-9b22-07ff6b07a268	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	e23a801b-22e3-4e63-8aa9-7c91855ab84b	294000	108000	COMPLETED	[{"qty": 1, "name": "Elektronika mahsulot 41", "unit": "pcs", "price": 95000, "total": 95000, "productId": "780a65d0-2d3a-48cd-a4a5-3e3689e1879e"}, {"qty": 1, "name": "Maishiy texnika mahsulot 54", "unit": "pcs", "price": 199000, "total": 199000, "productId": "8aeb8d19-036a-473b-982c-f2ce0f96e17c"}]	2025-11-19 17:37:58.458	2026-04-12 17:37:58.459	\N	\N	\N
8f078b0f-8f1a-4e3a-b9a5-a747612b79a3	33930263-cce8-4ffb-9b22-07ff6b07a268	c6d766ef-6c99-4763-b225-a853cdee1b71	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	620000	236000	CANCELLED	[{"qty": 2, "name": "Oziq-ovqat mahsulot 42", "unit": "pcs", "price": 103000, "total": 206000, "productId": "f9b4adf6-4a42-4fe1-b890-d44d5699f8d5"}, {"qty": 2, "name": "Sport mahsulot 55", "unit": "box", "price": 207000, "total": 414000, "productId": "1c7ca51e-63b6-456e-b128-ec3297f79d27"}]	2025-11-20 17:37:58.46	2026-04-12 17:37:58.461	\N	\N	\N
0efa5205-5248-4be8-8731-8af0ffd342ea	33930263-cce8-4ffb-9b22-07ff6b07a268	f48b30c0-e349-4ea0-9f74-c738acc90712	f6736eff-d631-4f50-86f6-ad3187d95ecf	978000	384000	PENDING	[{"qty": 3, "name": "Kiyim mahsulot 43", "unit": "box", "price": 111000, "total": 333000, "productId": "1faa7ac5-b969-48ad-8392-371b97f83235"}, {"qty": 3, "name": "Elektronika mahsulot 56", "unit": "pcs", "price": 215000, "total": 645000, "productId": "3809c0bb-c297-4c53-a026-e1b30beb57b7"}]	2025-11-21 17:37:58.467	2026-04-12 17:37:58.468	\N	\N	\N
07540738-a472-4290-a0a5-f86d7f827022	33930263-cce8-4ffb-9b22-07ff6b07a268	5a1eb044-89d2-403f-ab0c-010ee51e8091	fcecf24d-f041-4838-95da-549726630e12	1368000	552000	ACCEPTED	[{"qty": 4, "name": "Maishiy texnika mahsulot 44", "unit": "pcs", "price": 119000, "total": 476000, "productId": "02e3b166-d99b-4e3e-8ab1-9a486493793c"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 57", "unit": "pcs", "price": 223000, "total": 892000, "productId": "73d4bd51-6f96-4926-827d-4e941227a526"}]	2025-11-22 17:37:58.472	2026-04-12 17:37:58.473	\N	\N	\N
d400dd26-29f6-414c-8db2-d51ea507ea10	33930263-cce8-4ffb-9b22-07ff6b07a268	678981d1-9c26-4b15-a842-9f66b14d4985	e23a801b-22e3-4e63-8aa9-7c91855ab84b	866000	564000	PREPARING	[{"qty": 5, "name": "Sport mahsulot 45", "unit": "pcs", "price": 127000, "total": 635000, "productId": "5a9677ea-387e-475c-8728-ee24f7e6333a"}, {"qty": 1, "name": "Kiyim mahsulot 58", "unit": "box", "price": 231000, "total": 231000, "productId": "5d166591-169f-48a4-86d6-1260a1204697"}]	2025-11-23 17:37:58.479	2026-04-12 17:37:58.48	\N	\N	\N
2ef86fd2-324c-4580-b8be-6c16e46f0bc5	33930263-cce8-4ffb-9b22-07ff6b07a268	02fe2116-4394-4000-924e-8f306a09841f	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1288000	752000	SHIPPED	[{"qty": 6, "name": "Elektronika mahsulot 46", "unit": "box", "price": 135000, "total": 810000, "productId": "e14c9ae2-1c54-42e8-a4e1-9b7360c95bd2"}, {"qty": 2, "name": "Maishiy texnika mahsulot 59", "unit": "pcs", "price": 239000, "total": 478000, "productId": "7c9ed4f2-4784-44a9-a4ec-ed63367bf6b4"}]	2025-11-24 17:37:58.484	2026-04-12 17:37:58.485	\N	\N	\N
e1d7aede-b10d-49d9-a37f-0273e995d55f	33930263-cce8-4ffb-9b22-07ff6b07a268	901851a8-14d0-40f1-a4ed-e7c0bac85e71	f6736eff-d631-4f50-86f6-ad3187d95ecf	1742000	960000	DELIVERED	[{"qty": 7, "name": "Oziq-ovqat mahsulot 47", "unit": "pcs", "price": 143000, "total": 1001000, "productId": "b404f8ec-1d81-49fc-81c2-fb187a526987"}, {"qty": 3, "name": "Sport mahsulot 60", "unit": "pcs", "price": 247000, "total": 741000, "productId": "19bc05e4-b5d0-45d7-aff9-f91c1a43077e"}]	2025-11-25 17:37:58.486	2026-04-12 17:37:58.487	\N	\N	\N
5b1f1233-e457-41c9-90d8-8294107076d9	33930263-cce8-4ffb-9b22-07ff6b07a268	6dfe2784-51bf-4d6d-a613-a8dede9ba816	fcecf24d-f041-4838-95da-549726630e12	1268000	1188000	COMPLETED	[{"qty": 8, "name": "Kiyim mahsulot 48", "unit": "pcs", "price": 151000, "total": 1208000, "productId": "aec27ec5-8535-4b60-a0af-d44a3cefda6b"}, {"qty": 4, "name": "Elektronika mahsulot 61", "unit": "box", "price": 15000, "total": 60000, "productId": "4b2b95c0-cb71-4dbe-ac8a-6a14c85553c7"}]	2025-11-26 17:37:58.492	2026-04-12 17:37:58.493	\N	\N	\N
a8adddc0-cb15-403b-9163-a3fc073fba3e	33930263-cce8-4ffb-9b22-07ff6b07a268	b05a2a7a-e887-4189-9b84-bffc37cb01af	e23a801b-22e3-4e63-8aa9-7c91855ab84b	182000	188000	CANCELLED	[{"qty": 1, "name": "Maishiy texnika mahsulot 49", "unit": "box", "price": 159000, "total": 159000, "productId": "a012992e-ebe6-4d91-b5ad-6531acd42b60"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 62", "unit": "pcs", "price": 23000, "total": 23000, "productId": "80a48d57-ff5b-46fe-a0e9-6a2d26503d83"}]	2025-11-27 17:37:58.497	2026-04-12 17:37:58.498	\N	\N	\N
3746c7b7-babd-4da0-b35a-6b6d7e718063	33930263-cce8-4ffb-9b22-07ff6b07a268	ad915ba5-8334-496d-8ee5-9daa01ce57dd	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	396000	396000	PENDING	[{"qty": 2, "name": "Sport mahsulot 50", "unit": "pcs", "price": 167000, "total": 334000, "productId": "2efcbe5d-6dde-45c2-b772-3e6eb86b0ef9"}, {"qty": 2, "name": "Kiyim mahsulot 63", "unit": "pcs", "price": 31000, "total": 62000, "productId": "1ca217e1-d5db-48bd-a19b-bdd4540ff7cd"}]	2025-11-28 17:37:58.503	2026-04-12 17:37:58.503	\N	\N	\N
fd80f6a3-b65b-4e2b-b1b5-f449d9654a26	33930263-cce8-4ffb-9b22-07ff6b07a268	f844dda2-398f-41a2-b0cf-88fa3697fdcf	e23a801b-22e3-4e63-8aa9-7c91855ab84b	642000	249000	ACCEPTED	[{"qty": 3, "name": "Elektronika mahsulot 51", "unit": "pcs", "price": 175000, "total": 525000, "productId": "b0fb3ee1-6d8e-486e-8fa9-f5858213cf3c"}, {"qty": 3, "name": "Maishiy texnika mahsulot 64", "unit": "box", "price": 39000, "total": 117000, "productId": "f25eff91-4569-4c36-900b-1b8e0c75d567"}]	2025-11-28 17:37:58.508	2026-04-12 17:37:58.509	\N	\N	\N
2c22d246-e676-4656-9255-65e7ab1a9e5f	33930263-cce8-4ffb-9b22-07ff6b07a268	dafc9765-065a-4a7b-987e-299642d3dc4b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	920000	372000	PREPARING	[{"qty": 4, "name": "Oziq-ovqat mahsulot 52", "unit": "box", "price": 183000, "total": 732000, "productId": "58e36f86-5676-4784-84a3-7eb593885c4d"}, {"qty": 4, "name": "Sport mahsulot 65", "unit": "pcs", "price": 47000, "total": 188000, "productId": "baf2dda1-4d32-4e68-b49c-79df607a69e2"}]	2025-11-29 17:37:58.511	2026-04-12 17:37:58.512	\N	\N	\N
e8fb1939-6b9a-4b61-8ce8-78d1a38d49de	33930263-cce8-4ffb-9b22-07ff6b07a268	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	f6736eff-d631-4f50-86f6-ad3187d95ecf	1010000	179000	SHIPPED	[{"qty": 5, "name": "Kiyim mahsulot 53", "unit": "pcs", "price": 191000, "total": 955000, "productId": "196e8df5-4b2b-4783-b3f7-d16dd4d8f4e4"}, {"qty": 1, "name": "Elektronika mahsulot 66", "unit": "pcs", "price": 55000, "total": 55000, "productId": "c1b04289-23e6-43a2-abd3-9e4dea701c48"}]	2025-11-30 17:37:58.518	2026-04-12 17:37:58.519	\N	\N	\N
c1b6ae9e-5b26-418b-8b21-ca631238a6a8	33930263-cce8-4ffb-9b22-07ff6b07a268	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	fcecf24d-f041-4838-95da-549726630e12	1320000	322000	DELIVERED	[{"qty": 6, "name": "Maishiy texnika mahsulot 54", "unit": "pcs", "price": 199000, "total": 1194000, "productId": "8aeb8d19-036a-473b-982c-f2ce0f96e17c"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 67", "unit": "box", "price": 63000, "total": 126000, "productId": "a9584e43-6bd3-49ee-b364-53d7ea058bc9"}]	2025-12-01 17:37:58.523	2026-04-12 17:37:58.524	\N	\N	\N
accd3d48-a6c4-4631-80cb-ad345a32d9e1	33930263-cce8-4ffb-9b22-07ff6b07a268	476b7d56-98a3-4107-bee7-f2c0908416ff	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1662000	485000	COMPLETED	[{"qty": 7, "name": "Sport mahsulot 55", "unit": "box", "price": 207000, "total": 1449000, "productId": "1c7ca51e-63b6-456e-b128-ec3297f79d27"}, {"qty": 3, "name": "Kiyim mahsulot 68", "unit": "pcs", "price": 71000, "total": 213000, "productId": "eb411ff9-a4e5-4978-a09b-bd32ae7c56ed"}]	2025-12-02 17:37:58.528	2026-04-12 17:37:58.529	\N	\N	\N
117425f6-f2d7-49f1-911f-3be752c16082	33930263-cce8-4ffb-9b22-07ff6b07a268	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	2036000	668000	CANCELLED	[{"qty": 8, "name": "Elektronika mahsulot 56", "unit": "pcs", "price": 215000, "total": 1720000, "productId": "3809c0bb-c297-4c53-a026-e1b30beb57b7"}, {"qty": 4, "name": "Maishiy texnika mahsulot 69", "unit": "pcs", "price": 79000, "total": 316000, "productId": "66545519-05ad-4f45-a31a-8c524b69d595"}]	2025-12-03 17:37:58.533	2026-04-12 17:37:58.534	\N	\N	\N
6daed367-696d-4a44-a069-9f23e3d69405	33930263-cce8-4ffb-9b22-07ff6b07a268	3868f60e-2952-4725-a074-0b57752220a5	f6736eff-d631-4f50-86f6-ad3187d95ecf	310000	143000	PENDING	[{"qty": 1, "name": "Oziq-ovqat mahsulot 57", "unit": "pcs", "price": 223000, "total": 223000, "productId": "73d4bd51-6f96-4926-827d-4e941227a526"}, {"qty": 1, "name": "Sport mahsulot 70", "unit": "box", "price": 87000, "total": 87000, "productId": "f27a0267-a93a-4c0b-a87e-0f809a3a0f55"}]	2025-12-04 17:37:58.536	2026-04-12 17:37:58.537	\N	\N	\N
1f1562a1-be35-47c2-9892-8b629849c748	33930263-cce8-4ffb-9b22-07ff6b07a268	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	fcecf24d-f041-4838-95da-549726630e12	652000	306000	ACCEPTED	[{"qty": 2, "name": "Kiyim mahsulot 58", "unit": "box", "price": 231000, "total": 462000, "productId": "5d166591-169f-48a4-86d6-1260a1204697"}, {"qty": 2, "name": "Elektronika mahsulot 71", "unit": "pcs", "price": 95000, "total": 190000, "productId": "b3b8e141-375f-4340-9b38-c61ad4de47a2"}]	2025-12-05 17:37:58.54	2026-04-12 17:37:58.541	\N	\N	\N
91c4e11e-79af-4346-9a42-4461c6df3b5e	33930263-cce8-4ffb-9b22-07ff6b07a268	569bf392-d510-4e78-b4c8-f580014e1c6a	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1026000	489000	PREPARING	[{"qty": 3, "name": "Maishiy texnika mahsulot 59", "unit": "pcs", "price": 239000, "total": 717000, "productId": "7c9ed4f2-4784-44a9-a4ec-ed63367bf6b4"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 72", "unit": "pcs", "price": 103000, "total": 309000, "productId": "94c9bc43-5530-4f1a-9a2f-08c2fe2af05f"}]	2025-12-06 17:37:58.544	2026-04-12 17:37:58.546	\N	\N	\N
02896712-d465-4e41-9ac0-739aef98a4c2	33930263-cce8-4ffb-9b22-07ff6b07a268	d6520409-350c-4741-8854-0621e3ec4328	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1432000	692000	SHIPPED	[{"qty": 4, "name": "Sport mahsulot 60", "unit": "pcs", "price": 247000, "total": 988000, "productId": "19bc05e4-b5d0-45d7-aff9-f91c1a43077e"}, {"qty": 4, "name": "Kiyim mahsulot 73", "unit": "box", "price": 111000, "total": 444000, "productId": "a0cd7382-d275-4063-b946-aa00ee14f1b8"}]	2025-12-07 17:37:58.55	2026-04-12 17:37:58.551	\N	\N	\N
cce59921-160a-4c12-99d8-e5a72df53ab3	33930263-cce8-4ffb-9b22-07ff6b07a268	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	f6736eff-d631-4f50-86f6-ad3187d95ecf	194000	419000	DELIVERED	[{"qty": 5, "name": "Elektronika mahsulot 61", "unit": "box", "price": 15000, "total": 75000, "productId": "4b2b95c0-cb71-4dbe-ac8a-6a14c85553c7"}, {"qty": 1, "name": "Maishiy texnika mahsulot 74", "unit": "pcs", "price": 119000, "total": 119000, "productId": "9d7074f2-c558-4968-a894-6b8db7d1c055"}]	2025-12-07 17:37:58.555	2026-04-12 17:37:58.556	\N	\N	\N
e1c5890c-a56a-4342-a183-c1c40fe2ecfc	33930263-cce8-4ffb-9b22-07ff6b07a268	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	fcecf24d-f041-4838-95da-549726630e12	392000	642000	COMPLETED	[{"qty": 6, "name": "Oziq-ovqat mahsulot 62", "unit": "pcs", "price": 23000, "total": 138000, "productId": "80a48d57-ff5b-46fe-a0e9-6a2d26503d83"}, {"qty": 2, "name": "Sport mahsulot 75", "unit": "pcs", "price": 127000, "total": 254000, "productId": "c6842687-bc36-4db4-b2ed-31122b20d47f"}]	2025-12-08 17:37:58.557	2026-04-12 17:37:58.558	\N	\N	\N
20da7181-043b-442b-9d06-bcca652c0f30	33930263-cce8-4ffb-9b22-07ff6b07a268	ac85fd64-67b6-42f1-aa37-1ea9add2f500	e23a801b-22e3-4e63-8aa9-7c91855ab84b	622000	510000	CANCELLED	[{"qty": 7, "name": "Kiyim mahsulot 63", "unit": "pcs", "price": 31000, "total": 217000, "productId": "1ca217e1-d5db-48bd-a19b-bdd4540ff7cd"}, {"qty": 3, "name": "Elektronika mahsulot 76", "unit": "box", "price": 135000, "total": 405000, "productId": "c7925f7e-d793-493a-923c-fa568af3028a"}]	2025-12-09 17:37:58.562	2026-04-12 17:37:58.563	\N	\N	\N
99af3e2d-4d3b-44d3-9ff6-be583030a88d	33930263-cce8-4ffb-9b22-07ff6b07a268	4e035e75-db70-4000-b6bc-e2df66cee240	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	884000	648000	PENDING	[{"qty": 8, "name": "Maishiy texnika mahsulot 64", "unit": "box", "price": 39000, "total": 312000, "productId": "f25eff91-4569-4c36-900b-1b8e0c75d567"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 77", "unit": "pcs", "price": 143000, "total": 572000, "productId": "e6082d8b-7560-4009-822c-1e49ba970065"}]	2025-12-10 17:37:58.567	2026-04-12 17:37:58.568	\N	\N	\N
e7ae389f-f801-450f-b5d5-86cc103b042b	33930263-cce8-4ffb-9b22-07ff6b07a268	82aaa0ef-6d5e-469d-8218-866dfa87ab76	f6736eff-d631-4f50-86f6-ad3187d95ecf	198000	98000	ACCEPTED	[{"qty": 1, "name": "Sport mahsulot 65", "unit": "pcs", "price": 47000, "total": 47000, "productId": "baf2dda1-4d32-4e68-b49c-79df607a69e2"}, {"qty": 1, "name": "Kiyim mahsulot 78", "unit": "pcs", "price": 151000, "total": 151000, "productId": "31b12021-3f65-4553-b45e-eed1203923a8"}]	2025-12-11 17:37:58.57	2026-04-12 17:37:58.571	\N	\N	\N
51c25c8b-0825-40be-b1ff-2a7f73e4aae3	33930263-cce8-4ffb-9b22-07ff6b07a268	42d9cfcb-5dfb-4e22-9560-dedbf628b385	fcecf24d-f041-4838-95da-549726630e12	428000	216000	PREPARING	[{"qty": 2, "name": "Elektronika mahsulot 66", "unit": "pcs", "price": 55000, "total": 110000, "productId": "c1b04289-23e6-43a2-abd3-9e4dea701c48"}, {"qty": 2, "name": "Maishiy texnika mahsulot 79", "unit": "box", "price": 159000, "total": 318000, "productId": "3c47dc30-0d3d-44b1-9436-e513035f9ff8"}]	2025-12-12 17:37:58.573	2026-04-12 17:37:58.574	\N	\N	\N
8709400c-0742-478b-941f-5d45d49d8976	33930263-cce8-4ffb-9b22-07ff6b07a268	cad80b67-a04d-4679-88c7-883ac2b04911	e23a801b-22e3-4e63-8aa9-7c91855ab84b	690000	354000	SHIPPED	[{"qty": 3, "name": "Oziq-ovqat mahsulot 67", "unit": "box", "price": 63000, "total": 189000, "productId": "a9584e43-6bd3-49ee-b364-53d7ea058bc9"}, {"qty": 3, "name": "Sport mahsulot 80", "unit": "pcs", "price": 167000, "total": 501000, "productId": "602224e1-00ed-4e25-84c5-b89b28eb344d"}]	2025-12-13 17:37:58.575	2026-04-12 17:37:58.576	\N	\N	\N
9b86a347-f27b-4258-b0f1-6309fdaa9104	33930263-cce8-4ffb-9b22-07ff6b07a268	503b7694-3480-45e9-8116-a469c79d249a	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	984000	512000	DELIVERED	[{"qty": 4, "name": "Kiyim mahsulot 68", "unit": "pcs", "price": 71000, "total": 284000, "productId": "eb411ff9-a4e5-4978-a09b-bd32ae7c56ed"}, {"qty": 4, "name": "Elektronika mahsulot 81", "unit": "pcs", "price": 175000, "total": 700000, "productId": "de98bafe-4b00-4a27-ab5a-362af2b79081"}]	2025-12-14 17:37:58.58	2026-04-12 17:37:58.581	\N	\N	\N
a607a4a6-959f-4e80-baf8-7b950ed7b89c	33930263-cce8-4ffb-9b22-07ff6b07a268	1213e655-58b1-4fd4-892c-c4a516f307c8	f6736eff-d631-4f50-86f6-ad3187d95ecf	578000	534000	COMPLETED	[{"qty": 5, "name": "Maishiy texnika mahsulot 69", "unit": "pcs", "price": 79000, "total": 395000, "productId": "66545519-05ad-4f45-a31a-8c524b69d595"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 82", "unit": "box", "price": 183000, "total": 183000, "productId": "41b4689d-89f3-4084-929b-f905749ed883"}]	2025-12-15 17:37:58.584	2026-04-12 17:37:58.585	\N	\N	\N
6ffdf177-2cd8-4394-8b20-474858866e16	33930263-cce8-4ffb-9b22-07ff6b07a268	45806072-c97b-42ae-babb-c934f7141ab8	fcecf24d-f041-4838-95da-549726630e12	904000	712000	CANCELLED	[{"qty": 6, "name": "Sport mahsulot 70", "unit": "box", "price": 87000, "total": 522000, "productId": "f27a0267-a93a-4c0b-a87e-0f809a3a0f55"}, {"qty": 2, "name": "Kiyim mahsulot 83", "unit": "pcs", "price": 191000, "total": 382000, "productId": "a6a8f84d-6753-4863-976c-dcadfac10a6f"}]	2025-12-16 17:37:58.588	2026-04-12 17:37:58.589	\N	\N	\N
ef34e6c0-6153-472c-8771-ccc83d9d6177	33930263-cce8-4ffb-9b22-07ff6b07a268	97dce907-dede-4fad-9991-f76b02f241c0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1262000	910000	PENDING	[{"qty": 7, "name": "Elektronika mahsulot 71", "unit": "pcs", "price": 95000, "total": 665000, "productId": "b3b8e141-375f-4340-9b38-c61ad4de47a2"}, {"qty": 3, "name": "Maishiy texnika mahsulot 84", "unit": "pcs", "price": 199000, "total": 597000, "productId": "2585dc8d-6cb9-421a-9777-43eb4d84dea7"}]	2025-12-16 17:37:58.591	2026-04-12 17:37:58.592	\N	\N	\N
9cabb2a0-261c-44f2-8301-9bdbc060021f	33930263-cce8-4ffb-9b22-07ff6b07a268	ef364e98-dc87-4278-84fc-3cbd6cd3a449	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1652000	1128000	ACCEPTED	[{"qty": 8, "name": "Oziq-ovqat mahsulot 72", "unit": "pcs", "price": 103000, "total": 824000, "productId": "94c9bc43-5530-4f1a-9a2f-08c2fe2af05f"}, {"qty": 4, "name": "Sport mahsulot 85", "unit": "box", "price": 207000, "total": 828000, "productId": "f2aae172-a8f6-477d-8dd4-3e24851f0840"}]	2025-12-17 17:37:58.593	2026-04-12 17:37:58.594	\N	\N	\N
0d534173-7206-421a-9c6f-579709482262	33930263-cce8-4ffb-9b22-07ff6b07a268	362df153-f937-4dfc-a047-e167af652682	f6736eff-d631-4f50-86f6-ad3187d95ecf	326000	178000	PREPARING	[{"qty": 1, "name": "Kiyim mahsulot 73", "unit": "box", "price": 111000, "total": 111000, "productId": "a0cd7382-d275-4063-b946-aa00ee14f1b8"}, {"qty": 1, "name": "Elektronika mahsulot 86", "unit": "pcs", "price": 215000, "total": 215000, "productId": "d68c2c89-925b-496c-8789-105c0d7fde17"}]	2025-12-18 17:37:58.598	2026-04-12 17:37:58.599	\N	\N	\N
06481cee-25f5-4a96-a92e-9eebc49bb8fa	33930263-cce8-4ffb-9b22-07ff6b07a268	7dbe4041-1742-47f3-8bd2-0e932385bd9c	fcecf24d-f041-4838-95da-549726630e12	684000	376000	SHIPPED	[{"qty": 2, "name": "Maishiy texnika mahsulot 74", "unit": "pcs", "price": 119000, "total": 238000, "productId": "9d7074f2-c558-4968-a894-6b8db7d1c055"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 87", "unit": "pcs", "price": 223000, "total": 446000, "productId": "90745b2f-1ccd-48f0-9a32-cdc0654cb5c0"}]	2025-12-19 17:37:58.602	2026-04-12 17:37:58.603	\N	\N	\N
41ddb0df-5f88-4d26-aa94-9fd0e6360777	33930263-cce8-4ffb-9b22-07ff6b07a268	b5bf2837-4d2a-4c19-8433-c595ce528ed1	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1074000	594000	DELIVERED	[{"qty": 3, "name": "Sport mahsulot 75", "unit": "pcs", "price": 127000, "total": 381000, "productId": "c6842687-bc36-4db4-b2ed-31122b20d47f"}, {"qty": 3, "name": "Kiyim mahsulot 88", "unit": "box", "price": 231000, "total": 693000, "productId": "3817624d-c5ef-448a-9a1a-b7debbe79f18"}]	2025-12-20 17:37:58.605	2026-04-12 17:37:58.606	\N	\N	\N
27712a60-a3e6-47e0-956c-0028f84fc5f1	33930263-cce8-4ffb-9b22-07ff6b07a268	17b030ff-132b-47ca-a099-729ff1cc3a5d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1496000	332000	COMPLETED	[{"qty": 4, "name": "Elektronika mahsulot 76", "unit": "box", "price": 135000, "total": 540000, "productId": "c7925f7e-d793-493a-923c-fa568af3028a"}, {"qty": 4, "name": "Maishiy texnika mahsulot 89", "unit": "pcs", "price": 239000, "total": 956000, "productId": "f7273cd1-2de4-47d8-be9e-44d14d042262"}]	2025-12-21 17:37:58.609	2026-04-12 17:37:58.609	\N	\N	\N
cd1c8fd3-621b-4ed9-a1e6-3840163a481b	33930263-cce8-4ffb-9b22-07ff6b07a268	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	f6736eff-d631-4f50-86f6-ad3187d95ecf	962000	149000	CANCELLED	[{"qty": 5, "name": "Oziq-ovqat mahsulot 77", "unit": "pcs", "price": 143000, "total": 715000, "productId": "e6082d8b-7560-4009-822c-1e49ba970065"}, {"qty": 1, "name": "Sport mahsulot 90", "unit": "pcs", "price": 247000, "total": 247000, "productId": "f92e8e36-cd56-489c-8004-894ef7b91e48"}]	2025-12-22 17:37:58.61	2026-04-12 17:37:58.611	\N	\N	\N
7d93e6f2-cd5f-4bfd-a6d0-0285529c9cac	33930263-cce8-4ffb-9b22-07ff6b07a268	73062c7a-dff1-44ad-9a7e-18729e766900	fcecf24d-f041-4838-95da-549726630e12	936000	282000	PENDING	[{"qty": 6, "name": "Kiyim mahsulot 78", "unit": "pcs", "price": 151000, "total": 906000, "productId": "31b12021-3f65-4553-b45e-eed1203923a8"}, {"qty": 2, "name": "Elektronika mahsulot 91", "unit": "box", "price": 15000, "total": 30000, "productId": "69e2e698-c5c4-47d1-8afb-f2325808e30b"}]	2025-12-23 17:37:58.615	2026-04-12 17:37:58.615	\N	\N	\N
9441a26e-d3aa-4fcb-9371-55b87795c6cb	33930263-cce8-4ffb-9b22-07ff6b07a268	70aa161e-8ee0-4950-afaa-f2e955b6c68f	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1182000	435000	ACCEPTED	[{"qty": 7, "name": "Maishiy texnika mahsulot 79", "unit": "box", "price": 159000, "total": 1113000, "productId": "3c47dc30-0d3d-44b1-9436-e513035f9ff8"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 92", "unit": "pcs", "price": 23000, "total": 69000, "productId": "9dbfaa95-0d66-42b3-a3ed-28c2056ec0af"}]	2025-12-24 17:37:58.619	2026-04-12 17:37:58.619	\N	\N	\N
ac92ae3c-513a-46e8-8bf9-3c8c15891f59	33930263-cce8-4ffb-9b22-07ff6b07a268	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1460000	608000	PREPARING	[{"qty": 8, "name": "Sport mahsulot 80", "unit": "pcs", "price": 167000, "total": 1336000, "productId": "602224e1-00ed-4e25-84c5-b89b28eb344d"}, {"qty": 4, "name": "Kiyim mahsulot 93", "unit": "pcs", "price": 31000, "total": 124000, "productId": "8d142f47-3d11-4b19-b1af-bf4938566599"}]	2025-12-25 17:37:58.622	2026-04-12 17:37:58.623	\N	\N	\N
0538c1aa-d2bd-4560-bc29-8bf736df5735	33930263-cce8-4ffb-9b22-07ff6b07a268	8ba64cce-4753-4815-841e-954ccfa3f432	f6736eff-d631-4f50-86f6-ad3187d95ecf	214000	133000	SHIPPED	[{"qty": 1, "name": "Elektronika mahsulot 81", "unit": "pcs", "price": 175000, "total": 175000, "productId": "de98bafe-4b00-4a27-ab5a-362af2b79081"}, {"qty": 1, "name": "Maishiy texnika mahsulot 94", "unit": "box", "price": 39000, "total": 39000, "productId": "a27d8322-3c93-49b2-8537-2786d00d0498"}]	2025-12-25 17:37:58.625	2026-04-12 17:37:58.626	\N	\N	\N
ce506f14-d055-4102-8e9f-d6271790f2a1	33930263-cce8-4ffb-9b22-07ff6b07a268	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	fcecf24d-f041-4838-95da-549726630e12	460000	286000	DELIVERED	[{"qty": 2, "name": "Oziq-ovqat mahsulot 82", "unit": "box", "price": 183000, "total": 366000, "productId": "41b4689d-89f3-4084-929b-f905749ed883"}, {"qty": 2, "name": "Sport mahsulot 95", "unit": "pcs", "price": 47000, "total": 94000, "productId": "9a54b294-d881-42a0-84ce-8936e7c04f6e"}]	2025-12-26 17:37:58.628	2026-04-12 17:37:58.629	\N	\N	\N
a6623bca-e7a9-4130-9133-29896733f7bd	33930263-cce8-4ffb-9b22-07ff6b07a268	a2d3c202-6b97-439e-9ea1-705a8945bcc0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	738000	459000	COMPLETED	[{"qty": 3, "name": "Kiyim mahsulot 83", "unit": "pcs", "price": 191000, "total": 573000, "productId": "a6a8f84d-6753-4863-976c-dcadfac10a6f"}, {"qty": 3, "name": "Elektronika mahsulot 96", "unit": "pcs", "price": 55000, "total": 165000, "productId": "3fd14b4c-9163-4dfb-be45-18c5f3ac02f0"}]	2025-12-27 17:37:58.632	2026-04-12 17:37:58.633	\N	\N	\N
091eef7d-81e0-4e42-be41-93132394c462	33930263-cce8-4ffb-9b22-07ff6b07a268	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1048000	652000	CANCELLED	[{"qty": 4, "name": "Maishiy texnika mahsulot 84", "unit": "pcs", "price": 199000, "total": 796000, "productId": "2585dc8d-6cb9-421a-9777-43eb4d84dea7"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 97", "unit": "box", "price": 63000, "total": 252000, "productId": "0e6167a9-c89d-4f73-aad1-3e49bdb7a4fe"}]	2025-12-28 17:37:58.635	2026-04-12 17:37:58.636	\N	\N	\N
af2429b9-1557-47a7-ae02-c36d17ad0090	33930263-cce8-4ffb-9b22-07ff6b07a268	b59f04da-f8e4-43f9-8488-cff1a5e1180d	f6736eff-d631-4f50-86f6-ad3187d95ecf	1106000	389000	PENDING	[{"qty": 5, "name": "Sport mahsulot 85", "unit": "box", "price": 207000, "total": 1035000, "productId": "f2aae172-a8f6-477d-8dd4-3e24851f0840"}, {"qty": 1, "name": "Kiyim mahsulot 98", "unit": "pcs", "price": 71000, "total": 71000, "productId": "c4fe027b-bd26-474c-8a3a-5623df3deeb3"}]	2025-12-29 17:37:58.639	2026-04-12 17:37:58.64	\N	\N	\N
26f351bf-8440-4011-b980-707b3356f671	33930263-cce8-4ffb-9b22-07ff6b07a268	ea743292-3ef3-4392-a2bf-2d5555f8e034	fcecf24d-f041-4838-95da-549726630e12	1448000	602000	ACCEPTED	[{"qty": 6, "name": "Elektronika mahsulot 86", "unit": "pcs", "price": 215000, "total": 1290000, "productId": "d68c2c89-925b-496c-8789-105c0d7fde17"}, {"qty": 2, "name": "Maishiy texnika mahsulot 99", "unit": "pcs", "price": 79000, "total": 158000, "productId": "66d94936-85d5-4eb8-9c9f-8dc4e59e1c76"}]	2025-12-30 17:37:58.642	2026-04-12 17:37:58.643	\N	\N	\N
21cb8738-3003-47fa-ae26-791c607633c9	33930263-cce8-4ffb-9b22-07ff6b07a268	db460ec1-c062-4e57-8218-ea2add3a540e	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1822000	835000	PREPARING	[{"qty": 7, "name": "Oziq-ovqat mahsulot 87", "unit": "pcs", "price": 223000, "total": 1561000, "productId": "90745b2f-1ccd-48f0-9a32-cdc0654cb5c0"}, {"qty": 3, "name": "Sport mahsulot 100", "unit": "box", "price": 87000, "total": 261000, "productId": "cd0327d9-ab0e-4351-8f1e-da0d93e47fdf"}]	2025-12-31 17:37:58.644	2026-04-12 17:37:58.645	\N	\N	\N
b37faeed-e59d-4f1e-8c4b-81997fa2ec70	33930263-cce8-4ffb-9b22-07ff6b07a268	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1908000	588000	SHIPPED	[{"qty": 8, "name": "Kiyim mahsulot 88", "unit": "box", "price": 231000, "total": 1848000, "productId": "3817624d-c5ef-448a-9a1a-b7debbe79f18"}, {"qty": 4, "name": "Elektronika mahsulot 1", "unit": "box", "price": 15000, "total": 60000, "productId": "083e0980-ef76-4b55-9984-7687fd62c047"}]	2026-01-01 17:37:58.649	2026-04-12 17:37:58.649	\N	\N	\N
9ddba586-00cd-4612-8fc0-b27fe5ac40d9	33930263-cce8-4ffb-9b22-07ff6b07a268	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	f6736eff-d631-4f50-86f6-ad3187d95ecf	262000	88000	DELIVERED	[{"qty": 1, "name": "Maishiy texnika mahsulot 89", "unit": "pcs", "price": 239000, "total": 239000, "productId": "f7273cd1-2de4-47d8-be9e-44d14d042262"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 2", "unit": "pcs", "price": 23000, "total": 23000, "productId": "c3ef2e06-a1cf-46c8-9b8d-1d907027f5f2"}]	2026-01-02 17:37:58.652	2026-04-12 17:37:58.652	\N	\N	\N
4ab96101-fdea-4117-b87c-0dceb55d63d8	33930263-cce8-4ffb-9b22-07ff6b07a268	0edc83d9-aaed-446e-9206-bb6ebaefd489	fcecf24d-f041-4838-95da-549726630e12	556000	196000	COMPLETED	[{"qty": 2, "name": "Sport mahsulot 90", "unit": "pcs", "price": 247000, "total": 494000, "productId": "f92e8e36-cd56-489c-8004-894ef7b91e48"}, {"qty": 2, "name": "Kiyim mahsulot 3", "unit": "pcs", "price": 31000, "total": 62000, "productId": "3d14bc97-06e2-43b7-8976-7cac73e31c93"}]	2026-01-03 17:37:58.655	2026-04-12 17:37:58.655	\N	\N	\N
31553586-7a85-47f2-80e6-63a082b3fb4f	33930263-cce8-4ffb-9b22-07ff6b07a268	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	e23a801b-22e3-4e63-8aa9-7c91855ab84b	162000	324000	CANCELLED	[{"qty": 3, "name": "Elektronika mahsulot 91", "unit": "box", "price": 15000, "total": 45000, "productId": "69e2e698-c5c4-47d1-8afb-f2325808e30b"}, {"qty": 3, "name": "Maishiy texnika mahsulot 4", "unit": "box", "price": 39000, "total": 117000, "productId": "f22db48b-a300-457b-a5c1-861f85086d4c"}]	2026-01-03 17:37:58.658	2026-04-12 17:37:58.659	\N	\N	\N
1ab083d0-4d69-40ba-97b6-acd8c24c908c	33930263-cce8-4ffb-9b22-07ff6b07a268	c6d766ef-6c99-4763-b225-a853cdee1b71	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	280000	472000	PENDING	[{"qty": 4, "name": "Oziq-ovqat mahsulot 92", "unit": "pcs", "price": 23000, "total": 92000, "productId": "9dbfaa95-0d66-42b3-a3ed-28c2056ec0af"}, {"qty": 4, "name": "Sport mahsulot 5", "unit": "pcs", "price": 47000, "total": 188000, "productId": "2fbbc8a7-5d80-4027-90bf-592038d03dce"}]	2026-01-04 17:37:58.659	2026-04-12 17:37:58.66	\N	\N	\N
4ce7fc28-02d2-4d74-a4de-52eff61f5995	33930263-cce8-4ffb-9b22-07ff6b07a268	f48b30c0-e349-4ea0-9f74-c738acc90712	f6736eff-d631-4f50-86f6-ad3187d95ecf	210000	504000	ACCEPTED	[{"qty": 5, "name": "Kiyim mahsulot 93", "unit": "pcs", "price": 31000, "total": 155000, "productId": "8d142f47-3d11-4b19-b1af-bf4938566599"}, {"qty": 1, "name": "Elektronika mahsulot 6", "unit": "pcs", "price": 55000, "total": 55000, "productId": "8a7cad1c-2393-466d-8206-73092b9c771f"}]	2026-01-05 17:37:58.664	2026-04-12 17:37:58.665	\N	\N	\N
a2c9e687-df7a-4081-904c-3cf523b73204	33930263-cce8-4ffb-9b22-07ff6b07a268	5a1eb044-89d2-403f-ab0c-010ee51e8091	fcecf24d-f041-4838-95da-549726630e12	360000	672000	PREPARING	[{"qty": 6, "name": "Maishiy texnika mahsulot 94", "unit": "box", "price": 39000, "total": 234000, "productId": "a27d8322-3c93-49b2-8537-2786d00d0498"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 7", "unit": "box", "price": 63000, "total": 126000, "productId": "2e3fd8cb-b7fa-42d4-b917-09b40ed15d73"}]	2026-01-06 17:37:58.667	2026-04-12 17:37:58.668	\N	\N	\N
8798b2b6-ff49-4d2b-977b-e4bf71d5edc0	33930263-cce8-4ffb-9b22-07ff6b07a268	678981d1-9c26-4b15-a842-9f66b14d4985	e23a801b-22e3-4e63-8aa9-7c91855ab84b	542000	860000	SHIPPED	[{"qty": 7, "name": "Sport mahsulot 95", "unit": "pcs", "price": 47000, "total": 329000, "productId": "9a54b294-d881-42a0-84ce-8936e7c04f6e"}, {"qty": 3, "name": "Kiyim mahsulot 8", "unit": "pcs", "price": 71000, "total": 213000, "productId": "7f1e5b9f-dccf-4291-97f8-e1a6141e7587"}]	2026-01-07 17:37:58.67	2026-04-12 17:37:58.671	\N	\N	\N
ff0a72d2-2ea2-4e2a-a357-466b1aae9420	33930263-cce8-4ffb-9b22-07ff6b07a268	02fe2116-4394-4000-924e-8f306a09841f	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	756000	1068000	DELIVERED	[{"qty": 8, "name": "Elektronika mahsulot 96", "unit": "pcs", "price": 55000, "total": 440000, "productId": "3fd14b4c-9163-4dfb-be45-18c5f3ac02f0"}, {"qty": 4, "name": "Maishiy texnika mahsulot 9", "unit": "pcs", "price": 79000, "total": 316000, "productId": "a2c21b37-562d-4f08-9706-0cd9665abc2a"}]	2026-01-08 17:37:58.673	2026-04-12 17:37:58.673	\N	\N	\N
1fa1b992-f60e-4501-9f0e-20a408206ed2	33930263-cce8-4ffb-9b22-07ff6b07a268	901851a8-14d0-40f1-a4ed-e7c0bac85e71	f6736eff-d631-4f50-86f6-ad3187d95ecf	150000	168000	COMPLETED	[{"qty": 1, "name": "Oziq-ovqat mahsulot 97", "unit": "box", "price": 63000, "total": 63000, "productId": "0e6167a9-c89d-4f73-aad1-3e49bdb7a4fe"}, {"qty": 1, "name": "Sport mahsulot 10", "unit": "box", "price": 87000, "total": 87000, "productId": "0736c191-d62b-4fae-ab89-600f86bd1574"}]	2026-01-09 17:37:58.674	2026-04-12 17:37:58.675	\N	\N	\N
34d92385-e6db-4cb6-b048-6c69413eb245	33930263-cce8-4ffb-9b22-07ff6b07a268	6dfe2784-51bf-4d6d-a613-a8dede9ba816	fcecf24d-f041-4838-95da-549726630e12	332000	356000	CANCELLED	[{"qty": 2, "name": "Kiyim mahsulot 98", "unit": "pcs", "price": 71000, "total": 142000, "productId": "c4fe027b-bd26-474c-8a3a-5623df3deeb3"}, {"qty": 2, "name": "Elektronika mahsulot 11", "unit": "pcs", "price": 95000, "total": 190000, "productId": "7cb93dea-a617-4a46-8e70-eb9bb3662310"}]	2026-01-10 17:37:58.677	2026-04-12 17:37:58.678	\N	\N	\N
cc1e785b-42ac-4450-9606-b4bac168b930	33930263-cce8-4ffb-9b22-07ff6b07a268	b05a2a7a-e887-4189-9b84-bffc37cb01af	e23a801b-22e3-4e63-8aa9-7c91855ab84b	546000	564000	PENDING	[{"qty": 3, "name": "Maishiy texnika mahsulot 99", "unit": "pcs", "price": 79000, "total": 237000, "productId": "66d94936-85d5-4eb8-9c9f-8dc4e59e1c76"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 12", "unit": "pcs", "price": 103000, "total": 309000, "productId": "2cfb68ee-4fcd-492a-a10e-06bcb5e1b1b9"}]	2026-01-11 17:37:58.682	2026-04-12 17:37:58.683	\N	\N	\N
d75f1a4c-a213-4a84-8c0b-a601eb0687c6	33930263-cce8-4ffb-9b22-07ff6b07a268	ad915ba5-8334-496d-8ee5-9daa01ce57dd	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	792000	792000	ACCEPTED	[{"qty": 4, "name": "Sport mahsulot 100", "unit": "box", "price": 87000, "total": 348000, "productId": "cd0327d9-ab0e-4351-8f1e-da0d93e47fdf"}, {"qty": 4, "name": "Kiyim mahsulot 13", "unit": "box", "price": 111000, "total": 444000, "productId": "e71e737e-f2d3-4980-866c-0224dac39cc7"}]	2026-01-12 17:37:58.685	2026-04-12 17:37:58.686	\N	\N	\N
6b2c8be1-7b54-4e23-a53c-4f255b3597b2	33930263-cce8-4ffb-9b22-07ff6b07a268	f844dda2-398f-41a2-b0cf-88fa3697fdcf	e23a801b-22e3-4e63-8aa9-7c91855ab84b	194000	119000	PREPARING	[{"qty": 5, "name": "Elektronika mahsulot 1", "unit": "box", "price": 15000, "total": 75000, "productId": "083e0980-ef76-4b55-9984-7687fd62c047"}, {"qty": 1, "name": "Maishiy texnika mahsulot 14", "unit": "pcs", "price": 119000, "total": 119000, "productId": "dda131a0-5270-44f5-a47e-5ced8f8544c1"}]	2026-01-12 17:37:58.689	2026-04-12 17:37:58.689	\N	\N	\N
9eeb327e-d56d-4eb2-97d8-b13ebaa4b0fc	33930263-cce8-4ffb-9b22-07ff6b07a268	dafc9765-065a-4a7b-987e-299642d3dc4b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	392000	242000	SHIPPED	[{"qty": 6, "name": "Oziq-ovqat mahsulot 2", "unit": "pcs", "price": 23000, "total": 138000, "productId": "c3ef2e06-a1cf-46c8-9b8d-1d907027f5f2"}, {"qty": 2, "name": "Sport mahsulot 15", "unit": "pcs", "price": 127000, "total": 254000, "productId": "3107f9a6-5f69-471b-82fc-efb24acb6c6f"}]	2026-01-13 17:37:58.69	2026-04-12 17:37:58.691	\N	\N	\N
318b4d5d-1f1f-46b6-949d-995b7dfe69a7	33930263-cce8-4ffb-9b22-07ff6b07a268	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	f6736eff-d631-4f50-86f6-ad3187d95ecf	622000	385000	DELIVERED	[{"qty": 7, "name": "Kiyim mahsulot 3", "unit": "pcs", "price": 31000, "total": 217000, "productId": "3d14bc97-06e2-43b7-8976-7cac73e31c93"}, {"qty": 3, "name": "Elektronika mahsulot 16", "unit": "box", "price": 135000, "total": 405000, "productId": "c1fd16d4-acc8-4479-89e7-311714c6ff46"}]	2026-01-14 17:37:58.694	2026-04-12 17:37:58.695	\N	\N	\N
77e2e746-6c3f-44f5-8a1a-6c7e4c2723b5	33930263-cce8-4ffb-9b22-07ff6b07a268	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	fcecf24d-f041-4838-95da-549726630e12	884000	548000	COMPLETED	[{"qty": 8, "name": "Maishiy texnika mahsulot 4", "unit": "box", "price": 39000, "total": 312000, "productId": "f22db48b-a300-457b-a5c1-861f85086d4c"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 17", "unit": "pcs", "price": 143000, "total": 572000, "productId": "580bb021-7cb0-4fae-8ecd-459290bfc019"}]	2026-01-15 17:37:58.699	2026-04-12 17:37:58.7	\N	\N	\N
9a94edf6-5399-4ad5-a7a4-d9f8cbaa0f68	33930263-cce8-4ffb-9b22-07ff6b07a268	476b7d56-98a3-4107-bee7-f2c0908416ff	e23a801b-22e3-4e63-8aa9-7c91855ab84b	198000	123000	CANCELLED	[{"qty": 1, "name": "Sport mahsulot 5", "unit": "pcs", "price": 47000, "total": 47000, "productId": "2fbbc8a7-5d80-4027-90bf-592038d03dce"}, {"qty": 1, "name": "Kiyim mahsulot 18", "unit": "pcs", "price": 151000, "total": 151000, "productId": "3617506e-45b9-4ae5-b5b8-95e49604b231"}]	2026-01-16 17:37:58.702	2026-04-12 17:37:58.703	\N	\N	\N
db684d7e-aecc-4e4e-9e4c-37c8f226f0a6	33930263-cce8-4ffb-9b22-07ff6b07a268	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	428000	266000	PENDING	[{"qty": 2, "name": "Elektronika mahsulot 6", "unit": "pcs", "price": 55000, "total": 110000, "productId": "8a7cad1c-2393-466d-8206-73092b9c771f"}, {"qty": 2, "name": "Maishiy texnika mahsulot 19", "unit": "box", "price": 159000, "total": 318000, "productId": "a0c6e78d-be69-4ffd-b323-10c67dea8c48"}]	2026-01-17 17:37:58.705	2026-04-12 17:37:58.705	\N	\N	\N
d97aa9e1-e20c-4c38-912e-01131209fc30	33930263-cce8-4ffb-9b22-07ff6b07a268	3868f60e-2952-4725-a074-0b57752220a5	f6736eff-d631-4f50-86f6-ad3187d95ecf	690000	429000	ACCEPTED	[{"qty": 3, "name": "Oziq-ovqat mahsulot 7", "unit": "box", "price": 63000, "total": 189000, "productId": "2e3fd8cb-b7fa-42d4-b917-09b40ed15d73"}, {"qty": 3, "name": "Sport mahsulot 20", "unit": "pcs", "price": 167000, "total": 501000, "productId": "abb1c752-bcbf-48fb-a108-426a7c9cbe57"}]	2026-01-18 17:37:58.706	2026-04-12 17:37:58.707	\N	\N	\N
8fe5a831-831e-494e-b751-1d4fc66a70db	33930263-cce8-4ffb-9b22-07ff6b07a268	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	fcecf24d-f041-4838-95da-549726630e12	984000	612000	PREPARING	[{"qty": 4, "name": "Kiyim mahsulot 8", "unit": "pcs", "price": 71000, "total": 284000, "productId": "7f1e5b9f-dccf-4291-97f8-e1a6141e7587"}, {"qty": 4, "name": "Elektronika mahsulot 21", "unit": "pcs", "price": 175000, "total": 700000, "productId": "0a9126c0-c935-4b61-9531-969d13072044"}]	2026-01-19 17:37:58.71	2026-04-12 17:37:58.711	\N	\N	\N
33f343cd-3ef3-4415-8f3c-bef6ae5ef30b	33930263-cce8-4ffb-9b22-07ff6b07a268	569bf392-d510-4e78-b4c8-f580014e1c6a	e23a801b-22e3-4e63-8aa9-7c91855ab84b	578000	359000	SHIPPED	[{"qty": 5, "name": "Maishiy texnika mahsulot 9", "unit": "pcs", "price": 79000, "total": 395000, "productId": "a2c21b37-562d-4f08-9706-0cd9665abc2a"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 22", "unit": "box", "price": 183000, "total": 183000, "productId": "d518f072-fcf5-422c-89a1-33108afd4656"}]	2026-01-20 17:37:58.715	2026-04-12 17:37:58.716	\N	\N	\N
1b9e2b4f-768a-4a56-9bc0-76cf85ae345d	33930263-cce8-4ffb-9b22-07ff6b07a268	d6520409-350c-4741-8854-0621e3ec4328	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	904000	562000	DELIVERED	[{"qty": 6, "name": "Sport mahsulot 10", "unit": "box", "price": 87000, "total": 522000, "productId": "0736c191-d62b-4fae-ab89-600f86bd1574"}, {"qty": 2, "name": "Kiyim mahsulot 23", "unit": "pcs", "price": 191000, "total": 382000, "productId": "92aec405-fede-4789-ac9d-9a4901c5d055"}]	2026-01-21 17:37:58.718	2026-04-12 17:37:58.719	\N	\N	\N
9bad12d1-5886-4428-a570-82e86194e390	33930263-cce8-4ffb-9b22-07ff6b07a268	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	f6736eff-d631-4f50-86f6-ad3187d95ecf	1262000	785000	COMPLETED	[{"qty": 7, "name": "Elektronika mahsulot 11", "unit": "pcs", "price": 95000, "total": 665000, "productId": "7cb93dea-a617-4a46-8e70-eb9bb3662310"}, {"qty": 3, "name": "Maishiy texnika mahsulot 24", "unit": "pcs", "price": 199000, "total": 597000, "productId": "bf78405f-3f88-4b6b-9f85-6f6da9952288"}]	2026-01-21 17:37:58.721	2026-04-12 17:37:58.722	\N	\N	\N
3d4c9b1e-9b80-4788-a07d-bc925e1207b8	33930263-cce8-4ffb-9b22-07ff6b07a268	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	fcecf24d-f041-4838-95da-549726630e12	1652000	1028000	CANCELLED	[{"qty": 8, "name": "Oziq-ovqat mahsulot 12", "unit": "pcs", "price": 103000, "total": 824000, "productId": "2cfb68ee-4fcd-492a-a10e-06bcb5e1b1b9"}, {"qty": 4, "name": "Sport mahsulot 25", "unit": "box", "price": 207000, "total": 828000, "productId": "96bf0ea0-28ab-47b4-a61d-2e7be9618e9d"}]	2026-01-22 17:37:58.723	2026-04-12 17:37:58.724	\N	\N	\N
95c61549-9f7c-4ec3-a009-56799dc2debc	33930263-cce8-4ffb-9b22-07ff6b07a268	ac85fd64-67b6-42f1-aa37-1ea9add2f500	e23a801b-22e3-4e63-8aa9-7c91855ab84b	326000	78000	PENDING	[{"qty": 1, "name": "Kiyim mahsulot 13", "unit": "box", "price": 111000, "total": 111000, "productId": "e71e737e-f2d3-4980-866c-0224dac39cc7"}, {"qty": 1, "name": "Elektronika mahsulot 26", "unit": "pcs", "price": 215000, "total": 215000, "productId": "d457976e-5faf-45b3-8767-c93882827e1f"}]	2026-01-23 17:37:58.727	2026-04-12 17:37:58.728	\N	\N	\N
e6b995c1-a32b-44f4-b41a-ff79a49067a6	33930263-cce8-4ffb-9b22-07ff6b07a268	4e035e75-db70-4000-b6bc-e2df66cee240	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	684000	176000	ACCEPTED	[{"qty": 2, "name": "Maishiy texnika mahsulot 14", "unit": "pcs", "price": 119000, "total": 238000, "productId": "dda131a0-5270-44f5-a47e-5ced8f8544c1"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 27", "unit": "pcs", "price": 223000, "total": 446000, "productId": "51e9021c-8a76-4dd0-880a-dad7d026f373"}]	2026-01-24 17:37:58.731	2026-04-12 17:37:58.732	\N	\N	\N
c0ff6caa-3144-481f-a4b7-7f743ce8708d	33930263-cce8-4ffb-9b22-07ff6b07a268	82aaa0ef-6d5e-469d-8218-866dfa87ab76	f6736eff-d631-4f50-86f6-ad3187d95ecf	1074000	294000	PREPARING	[{"qty": 3, "name": "Sport mahsulot 15", "unit": "pcs", "price": 127000, "total": 381000, "productId": "3107f9a6-5f69-471b-82fc-efb24acb6c6f"}, {"qty": 3, "name": "Kiyim mahsulot 28", "unit": "box", "price": 231000, "total": 693000, "productId": "efbf1052-c2c2-4cc3-86a1-231500a6dfdc"}]	2026-01-25 17:37:58.735	2026-04-12 17:37:58.736	\N	\N	\N
148cb364-68eb-4182-88bb-e0c1f8e791ae	33930263-cce8-4ffb-9b22-07ff6b07a268	42d9cfcb-5dfb-4e22-9560-dedbf628b385	fcecf24d-f041-4838-95da-549726630e12	1496000	432000	SHIPPED	[{"qty": 4, "name": "Elektronika mahsulot 16", "unit": "box", "price": 135000, "total": 540000, "productId": "c1fd16d4-acc8-4479-89e7-311714c6ff46"}, {"qty": 4, "name": "Maishiy texnika mahsulot 29", "unit": "pcs", "price": 239000, "total": 956000, "productId": "dcf7f626-dcb7-4454-abcf-02a8036697ff"}]	2026-01-26 17:37:58.738	2026-04-12 17:37:58.739	\N	\N	\N
855f1820-2bd2-4848-b5fe-04511058918f	33930263-cce8-4ffb-9b22-07ff6b07a268	cad80b67-a04d-4679-88c7-883ac2b04911	e23a801b-22e3-4e63-8aa9-7c91855ab84b	962000	474000	DELIVERED	[{"qty": 5, "name": "Oziq-ovqat mahsulot 17", "unit": "pcs", "price": 143000, "total": 715000, "productId": "580bb021-7cb0-4fae-8ecd-459290bfc019"}, {"qty": 1, "name": "Sport mahsulot 30", "unit": "pcs", "price": 247000, "total": 247000, "productId": "c0961f57-5bf4-41fb-9c57-bcb5b2234102"}]	2026-01-27 17:37:58.74	2026-04-12 17:37:58.741	\N	\N	\N
44f7b480-c4b6-4191-8d1c-e9e532ba06d4	33930263-cce8-4ffb-9b22-07ff6b07a268	503b7694-3480-45e9-8116-a469c79d249a	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	936000	632000	COMPLETED	[{"qty": 6, "name": "Kiyim mahsulot 18", "unit": "pcs", "price": 151000, "total": 906000, "productId": "3617506e-45b9-4ae5-b5b8-95e49604b231"}, {"qty": 2, "name": "Elektronika mahsulot 31", "unit": "box", "price": 15000, "total": 30000, "productId": "dcc1f158-ba92-4fd8-84e1-fcb05205988a"}]	2026-01-28 17:37:58.743	2026-04-12 17:37:58.744	\N	\N	\N
4de5ce2b-3230-482a-bafd-e7a38d71ebd3	33930263-cce8-4ffb-9b22-07ff6b07a268	1213e655-58b1-4fd4-892c-c4a516f307c8	f6736eff-d631-4f50-86f6-ad3187d95ecf	1182000	810000	CANCELLED	[{"qty": 7, "name": "Maishiy texnika mahsulot 19", "unit": "box", "price": 159000, "total": 1113000, "productId": "a0c6e78d-be69-4ffd-b323-10c67dea8c48"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 32", "unit": "pcs", "price": 23000, "total": 69000, "productId": "e69b5dbf-8c1e-4a64-acf8-525c5a75e428"}]	2026-01-29 17:37:58.747	2026-04-12 17:37:58.748	\N	\N	\N
68c4646a-f3a1-4b33-b06a-45d6df3b897a	33930263-cce8-4ffb-9b22-07ff6b07a268	45806072-c97b-42ae-babb-c934f7141ab8	fcecf24d-f041-4838-95da-549726630e12	1460000	1008000	PENDING	[{"qty": 8, "name": "Sport mahsulot 20", "unit": "pcs", "price": 167000, "total": 1336000, "productId": "abb1c752-bcbf-48fb-a108-426a7c9cbe57"}, {"qty": 4, "name": "Kiyim mahsulot 33", "unit": "pcs", "price": 31000, "total": 124000, "productId": "5156b1f6-47da-47f2-bc86-c631344fa119"}]	2026-01-30 17:37:58.751	2026-04-12 17:37:58.751	\N	\N	\N
675813bb-84d2-4ff9-9ffc-8ed865ba42c3	33930263-cce8-4ffb-9b22-07ff6b07a268	97dce907-dede-4fad-9991-f76b02f241c0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	214000	158000	ACCEPTED	[{"qty": 1, "name": "Elektronika mahsulot 21", "unit": "pcs", "price": 175000, "total": 175000, "productId": "0a9126c0-c935-4b61-9531-969d13072044"}, {"qty": 1, "name": "Maishiy texnika mahsulot 34", "unit": "box", "price": 39000, "total": 39000, "productId": "8a81236c-fd7e-4d88-aea5-7a6af0d4fb72"}]	2026-01-30 17:37:58.753	2026-04-12 17:37:58.754	\N	\N	\N
7dc3292c-e447-4b28-94e9-e649227f7891	33930263-cce8-4ffb-9b22-07ff6b07a268	ef364e98-dc87-4278-84fc-3cbd6cd3a449	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	460000	336000	PREPARING	[{"qty": 2, "name": "Oziq-ovqat mahsulot 22", "unit": "box", "price": 183000, "total": 366000, "productId": "d518f072-fcf5-422c-89a1-33108afd4656"}, {"qty": 2, "name": "Sport mahsulot 35", "unit": "pcs", "price": 47000, "total": 94000, "productId": "b7e49c05-2750-4dc5-bed2-34e9a5852b6d"}]	2026-01-31 17:37:58.755	2026-04-12 17:37:58.756	\N	\N	\N
ac14aed4-3639-4ed7-99c8-f3532df23b64	33930263-cce8-4ffb-9b22-07ff6b07a268	362df153-f937-4dfc-a047-e167af652682	f6736eff-d631-4f50-86f6-ad3187d95ecf	738000	534000	SHIPPED	[{"qty": 3, "name": "Kiyim mahsulot 23", "unit": "pcs", "price": 191000, "total": 573000, "productId": "92aec405-fede-4789-ac9d-9a4901c5d055"}, {"qty": 3, "name": "Elektronika mahsulot 36", "unit": "pcs", "price": 55000, "total": 165000, "productId": "9bddfa35-565c-45e3-aa40-75301b165ee1"}]	2026-02-01 17:37:58.759	2026-04-12 17:37:58.759	\N	\N	\N
77b7b038-b1a4-4721-98f7-4782c779ebd2	33930263-cce8-4ffb-9b22-07ff6b07a268	7dbe4041-1742-47f3-8bd2-0e932385bd9c	fcecf24d-f041-4838-95da-549726630e12	1048000	752000	DELIVERED	[{"qty": 4, "name": "Maishiy texnika mahsulot 24", "unit": "pcs", "price": 199000, "total": 796000, "productId": "bf78405f-3f88-4b6b-9f85-6f6da9952288"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 37", "unit": "box", "price": 63000, "total": 252000, "productId": "93d44406-c84a-4622-8d6f-aae9c724a827"}]	2026-02-02 17:37:58.763	2026-04-12 17:37:58.764	\N	\N	\N
ae970e19-8532-4444-866f-eb1adcf91c85	33930263-cce8-4ffb-9b22-07ff6b07a268	b5bf2837-4d2a-4c19-8433-c595ce528ed1	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1106000	714000	COMPLETED	[{"qty": 5, "name": "Sport mahsulot 25", "unit": "box", "price": 207000, "total": 1035000, "productId": "96bf0ea0-28ab-47b4-a61d-2e7be9618e9d"}, {"qty": 1, "name": "Kiyim mahsulot 38", "unit": "pcs", "price": 71000, "total": 71000, "productId": "5cfae025-87f4-42c9-ad54-42a245b252d2"}]	2026-02-03 17:37:58.767	2026-04-12 17:37:58.768	\N	\N	\N
ac879abd-ec02-412d-ab14-acf970c97127	33930263-cce8-4ffb-9b22-07ff6b07a268	17b030ff-132b-47ca-a099-729ff1cc3a5d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1448000	202000	CANCELLED	[{"qty": 6, "name": "Elektronika mahsulot 26", "unit": "pcs", "price": 215000, "total": 1290000, "productId": "d457976e-5faf-45b3-8767-c93882827e1f"}, {"qty": 2, "name": "Maishiy texnika mahsulot 39", "unit": "pcs", "price": 79000, "total": 158000, "productId": "5ff42161-5799-41fd-9bbc-cc62904ce974"}]	2026-02-04 17:37:58.771	2026-04-12 17:37:58.772	\N	\N	\N
6d35e305-ac88-4806-94c6-e211acba7512	33930263-cce8-4ffb-9b22-07ff6b07a268	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	f6736eff-d631-4f50-86f6-ad3187d95ecf	1822000	335000	PENDING	[{"qty": 7, "name": "Oziq-ovqat mahsulot 27", "unit": "pcs", "price": 223000, "total": 1561000, "productId": "51e9021c-8a76-4dd0-880a-dad7d026f373"}, {"qty": 3, "name": "Sport mahsulot 40", "unit": "box", "price": 87000, "total": 261000, "productId": "5d9f5760-23c9-4c73-b7ee-cd907fc71730"}]	2026-02-05 17:37:58.775	2026-04-12 17:37:58.776	\N	\N	\N
b8de70e1-2326-4f88-9bdd-5d8d0f3e686b	33930263-cce8-4ffb-9b22-07ff6b07a268	73062c7a-dff1-44ad-9a7e-18729e766900	fcecf24d-f041-4838-95da-549726630e12	2228000	488000	ACCEPTED	[{"qty": 8, "name": "Kiyim mahsulot 28", "unit": "box", "price": 231000, "total": 1848000, "productId": "efbf1052-c2c2-4cc3-86a1-231500a6dfdc"}, {"qty": 4, "name": "Elektronika mahsulot 41", "unit": "pcs", "price": 95000, "total": 380000, "productId": "780a65d0-2d3a-48cd-a4a5-3e3689e1879e"}]	2026-02-06 17:37:58.781	2026-04-12 17:37:58.782	\N	\N	\N
a187495b-6eab-4208-91fc-6373d56ad1e6	33930263-cce8-4ffb-9b22-07ff6b07a268	70aa161e-8ee0-4950-afaa-f2e955b6c68f	e23a801b-22e3-4e63-8aa9-7c91855ab84b	342000	113000	PREPARING	[{"qty": 1, "name": "Maishiy texnika mahsulot 29", "unit": "pcs", "price": 239000, "total": 239000, "productId": "dcf7f626-dcb7-4454-abcf-02a8036697ff"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 42", "unit": "pcs", "price": 103000, "total": 103000, "productId": "f9b4adf6-4a42-4fe1-b890-d44d5699f8d5"}]	2026-02-07 17:37:58.786	2026-04-12 17:37:58.787	\N	\N	\N
a58156d0-9a2f-4cad-8a0e-09225da0ab0e	33930263-cce8-4ffb-9b22-07ff6b07a268	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	716000	246000	SHIPPED	[{"qty": 2, "name": "Sport mahsulot 30", "unit": "pcs", "price": 247000, "total": 494000, "productId": "c0961f57-5bf4-41fb-9c57-bcb5b2234102"}, {"qty": 2, "name": "Kiyim mahsulot 43", "unit": "box", "price": 111000, "total": 222000, "productId": "1faa7ac5-b969-48ad-8392-371b97f83235"}]	2026-02-08 17:37:58.791	2026-04-12 17:37:58.792	\N	\N	\N
c4074d92-d1bf-4808-88a6-c3c84bfa7a44	33930263-cce8-4ffb-9b22-07ff6b07a268	8ba64cce-4753-4815-841e-954ccfa3f432	f6736eff-d631-4f50-86f6-ad3187d95ecf	402000	399000	DELIVERED	[{"qty": 3, "name": "Elektronika mahsulot 31", "unit": "box", "price": 15000, "total": 45000, "productId": "dcc1f158-ba92-4fd8-84e1-fcb05205988a"}, {"qty": 3, "name": "Maishiy texnika mahsulot 44", "unit": "pcs", "price": 119000, "total": 357000, "productId": "02e3b166-d99b-4e3e-8ab1-9a486493793c"}]	2026-02-08 17:37:58.797	2026-04-12 17:37:58.798	\N	\N	\N
0b8ceb9b-b01c-4a19-ae38-ed7850157694	33930263-cce8-4ffb-9b22-07ff6b07a268	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	fcecf24d-f041-4838-95da-549726630e12	600000	572000	COMPLETED	[{"qty": 4, "name": "Oziq-ovqat mahsulot 32", "unit": "pcs", "price": 23000, "total": 92000, "productId": "e69b5dbf-8c1e-4a64-acf8-525c5a75e428"}, {"qty": 4, "name": "Sport mahsulot 45", "unit": "pcs", "price": 127000, "total": 508000, "productId": "5a9677ea-387e-475c-8728-ee24f7e6333a"}]	2026-02-09 17:37:58.799	2026-04-12 17:37:58.8	\N	\N	\N
679527d8-cb56-481f-8b2b-15866b8be277	33930263-cce8-4ffb-9b22-07ff6b07a268	a2d3c202-6b97-439e-9ea1-705a8945bcc0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	290000	329000	CANCELLED	[{"qty": 5, "name": "Kiyim mahsulot 33", "unit": "pcs", "price": 31000, "total": 155000, "productId": "5156b1f6-47da-47f2-bc86-c631344fa119"}, {"qty": 1, "name": "Elektronika mahsulot 46", "unit": "box", "price": 135000, "total": 135000, "productId": "e14c9ae2-1c54-42e8-a4e1-9b7360c95bd2"}]	2026-02-10 17:37:58.803	2026-04-12 17:37:58.804	\N	\N	\N
a7f434de-1497-4a20-bee7-4e5405a196b8	33930263-cce8-4ffb-9b22-07ff6b07a268	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	520000	522000	PENDING	[{"qty": 6, "name": "Maishiy texnika mahsulot 34", "unit": "box", "price": 39000, "total": 234000, "productId": "8a81236c-fd7e-4d88-aea5-7a6af0d4fb72"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 47", "unit": "pcs", "price": 143000, "total": 286000, "productId": "b404f8ec-1d81-49fc-81c2-fb187a526987"}]	2026-02-11 17:37:58.808	2026-04-12 17:37:58.809	\N	\N	\N
3090cae7-d151-4eb6-9caa-9a733f67982f	33930263-cce8-4ffb-9b22-07ff6b07a268	b59f04da-f8e4-43f9-8488-cff1a5e1180d	f6736eff-d631-4f50-86f6-ad3187d95ecf	782000	735000	ACCEPTED	[{"qty": 7, "name": "Sport mahsulot 35", "unit": "pcs", "price": 47000, "total": 329000, "productId": "b7e49c05-2750-4dc5-bed2-34e9a5852b6d"}, {"qty": 3, "name": "Kiyim mahsulot 48", "unit": "pcs", "price": 151000, "total": 453000, "productId": "aec27ec5-8535-4b60-a0af-d44a3cefda6b"}]	2026-02-12 17:37:58.812	2026-04-12 17:37:58.813	\N	\N	\N
3f8546e1-44ed-4992-aca4-f861e74c0742	33930263-cce8-4ffb-9b22-07ff6b07a268	ea743292-3ef3-4392-a2bf-2d5555f8e034	fcecf24d-f041-4838-95da-549726630e12	1076000	968000	PREPARING	[{"qty": 8, "name": "Elektronika mahsulot 36", "unit": "pcs", "price": 55000, "total": 440000, "productId": "9bddfa35-565c-45e3-aa40-75301b165ee1"}, {"qty": 4, "name": "Maishiy texnika mahsulot 49", "unit": "box", "price": 159000, "total": 636000, "productId": "a012992e-ebe6-4d91-b5ad-6531acd42b60"}]	2026-02-13 17:37:58.817	2026-04-12 17:37:58.818	\N	\N	\N
e470b410-0eeb-4eeb-9309-5691be55df13	33930263-cce8-4ffb-9b22-07ff6b07a268	db460ec1-c062-4e57-8218-ea2add3a540e	e23a801b-22e3-4e63-8aa9-7c91855ab84b	230000	193000	SHIPPED	[{"qty": 1, "name": "Oziq-ovqat mahsulot 37", "unit": "box", "price": 63000, "total": 63000, "productId": "93d44406-c84a-4622-8d6f-aae9c724a827"}, {"qty": 1, "name": "Sport mahsulot 50", "unit": "pcs", "price": 167000, "total": 167000, "productId": "2efcbe5d-6dde-45c2-b772-3e6eb86b0ef9"}]	2026-02-14 17:37:58.82	2026-04-12 17:37:58.821	\N	\N	\N
4467cf45-c587-411b-9425-3cf011278215	33930263-cce8-4ffb-9b22-07ff6b07a268	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	492000	156000	DELIVERED	[{"qty": 2, "name": "Kiyim mahsulot 38", "unit": "pcs", "price": 71000, "total": 142000, "productId": "5cfae025-87f4-42c9-ad54-42a245b252d2"}, {"qty": 2, "name": "Elektronika mahsulot 51", "unit": "pcs", "price": 175000, "total": 350000, "productId": "b0fb3ee1-6d8e-486e-8fa9-f5858213cf3c"}]	2026-02-15 17:37:58.825	2026-04-12 17:37:58.826	\N	\N	\N
496fdf7e-cbc3-438d-b552-97bb14781be6	33930263-cce8-4ffb-9b22-07ff6b07a268	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	f6736eff-d631-4f50-86f6-ad3187d95ecf	786000	264000	COMPLETED	[{"qty": 3, "name": "Maishiy texnika mahsulot 39", "unit": "pcs", "price": 79000, "total": 237000, "productId": "5ff42161-5799-41fd-9bbc-cc62904ce974"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 52", "unit": "box", "price": 183000, "total": 549000, "productId": "58e36f86-5676-4784-84a3-7eb593885c4d"}]	2026-02-16 17:37:58.83	2026-04-12 17:37:58.831	\N	\N	\N
2351eb72-0e6d-483b-9fb7-6c0cf4a947a8	33930263-cce8-4ffb-9b22-07ff6b07a268	0edc83d9-aaed-446e-9206-bb6ebaefd489	fcecf24d-f041-4838-95da-549726630e12	1112000	392000	CANCELLED	[{"qty": 4, "name": "Sport mahsulot 40", "unit": "box", "price": 87000, "total": 348000, "productId": "5d9f5760-23c9-4c73-b7ee-cd907fc71730"}, {"qty": 4, "name": "Kiyim mahsulot 53", "unit": "pcs", "price": 191000, "total": 764000, "productId": "196e8df5-4b2b-4783-b3f7-d16dd4d8f4e4"}]	2026-02-17 17:37:58.835	2026-04-12 17:37:58.836	\N	\N	\N
89b7b63f-47f5-4d8c-ac07-b33e2ac28e1b	33930263-cce8-4ffb-9b22-07ff6b07a268	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	e23a801b-22e3-4e63-8aa9-7c91855ab84b	674000	444000	PENDING	[{"qty": 5, "name": "Elektronika mahsulot 41", "unit": "pcs", "price": 95000, "total": 475000, "productId": "780a65d0-2d3a-48cd-a4a5-3e3689e1879e"}, {"qty": 1, "name": "Maishiy texnika mahsulot 54", "unit": "pcs", "price": 199000, "total": 199000, "productId": "8aeb8d19-036a-473b-982c-f2ce0f96e17c"}]	2026-02-17 17:37:58.838	2026-04-12 17:37:58.839	\N	\N	\N
d1ae26d5-5f19-4d59-bdfa-1afff9d47f63	33930263-cce8-4ffb-9b22-07ff6b07a268	c6d766ef-6c99-4763-b225-a853cdee1b71	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1032000	592000	ACCEPTED	[{"qty": 6, "name": "Oziq-ovqat mahsulot 42", "unit": "pcs", "price": 103000, "total": 618000, "productId": "f9b4adf6-4a42-4fe1-b890-d44d5699f8d5"}, {"qty": 2, "name": "Sport mahsulot 55", "unit": "box", "price": 207000, "total": 414000, "productId": "1c7ca51e-63b6-456e-b128-ec3297f79d27"}]	2026-02-18 17:37:58.84	2026-04-12 17:37:58.841	\N	\N	\N
78fe63e2-a32e-4ab7-8dc8-c4ccebc0af20	33930263-cce8-4ffb-9b22-07ff6b07a268	f48b30c0-e349-4ea0-9f74-c738acc90712	f6736eff-d631-4f50-86f6-ad3187d95ecf	1422000	760000	PREPARING	[{"qty": 7, "name": "Kiyim mahsulot 43", "unit": "box", "price": 111000, "total": 777000, "productId": "1faa7ac5-b969-48ad-8392-371b97f83235"}, {"qty": 3, "name": "Elektronika mahsulot 56", "unit": "pcs", "price": 215000, "total": 645000, "productId": "3809c0bb-c297-4c53-a026-e1b30beb57b7"}]	2026-02-19 17:37:58.844	2026-04-12 17:37:58.845	\N	\N	\N
0819f461-07d9-47d0-813d-acf001ab8479	33930263-cce8-4ffb-9b22-07ff6b07a268	5a1eb044-89d2-403f-ab0c-010ee51e8091	fcecf24d-f041-4838-95da-549726630e12	1844000	948000	SHIPPED	[{"qty": 8, "name": "Maishiy texnika mahsulot 44", "unit": "pcs", "price": 119000, "total": 952000, "productId": "02e3b166-d99b-4e3e-8ab1-9a486493793c"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 57", "unit": "pcs", "price": 223000, "total": 892000, "productId": "73d4bd51-6f96-4926-827d-4e941227a526"}]	2026-02-20 17:37:58.848	2026-04-12 17:37:58.849	\N	\N	\N
0eb1dec7-11a3-413d-807e-cefd828faac4	33930263-cce8-4ffb-9b22-07ff6b07a268	678981d1-9c26-4b15-a842-9f66b14d4985	e23a801b-22e3-4e63-8aa9-7c91855ab84b	358000	148000	DELIVERED	[{"qty": 1, "name": "Sport mahsulot 45", "unit": "pcs", "price": 127000, "total": 127000, "productId": "5a9677ea-387e-475c-8728-ee24f7e6333a"}, {"qty": 1, "name": "Kiyim mahsulot 58", "unit": "box", "price": 231000, "total": 231000, "productId": "5d166591-169f-48a4-86d6-1260a1204697"}]	2026-02-21 17:37:58.852	2026-04-12 17:37:58.853	\N	\N	\N
a7ba90c9-3a23-45a0-9a0d-3c24f2c6eb3f	33930263-cce8-4ffb-9b22-07ff6b07a268	02fe2116-4394-4000-924e-8f306a09841f	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	748000	316000	COMPLETED	[{"qty": 2, "name": "Elektronika mahsulot 46", "unit": "box", "price": 135000, "total": 270000, "productId": "e14c9ae2-1c54-42e8-a4e1-9b7360c95bd2"}, {"qty": 2, "name": "Maishiy texnika mahsulot 59", "unit": "pcs", "price": 239000, "total": 478000, "productId": "7c9ed4f2-4784-44a9-a4ec-ed63367bf6b4"}]	2026-02-22 17:37:58.855	2026-04-12 17:37:58.855	\N	\N	\N
edd1fb38-94e4-4068-81f0-9496055b4540	33930263-cce8-4ffb-9b22-07ff6b07a268	901851a8-14d0-40f1-a4ed-e7c0bac85e71	f6736eff-d631-4f50-86f6-ad3187d95ecf	1170000	504000	CANCELLED	[{"qty": 3, "name": "Oziq-ovqat mahsulot 47", "unit": "pcs", "price": 143000, "total": 429000, "productId": "b404f8ec-1d81-49fc-81c2-fb187a526987"}, {"qty": 3, "name": "Sport mahsulot 60", "unit": "pcs", "price": 247000, "total": 741000, "productId": "19bc05e4-b5d0-45d7-aff9-f91c1a43077e"}]	2026-02-23 17:37:58.856	2026-04-12 17:37:58.857	\N	\N	\N
1acbc130-5351-43c9-9a97-cb025fe0d8fa	33930263-cce8-4ffb-9b22-07ff6b07a268	6dfe2784-51bf-4d6d-a613-a8dede9ba816	fcecf24d-f041-4838-95da-549726630e12	664000	712000	PENDING	[{"qty": 4, "name": "Kiyim mahsulot 48", "unit": "pcs", "price": 151000, "total": 604000, "productId": "aec27ec5-8535-4b60-a0af-d44a3cefda6b"}, {"qty": 4, "name": "Elektronika mahsulot 61", "unit": "box", "price": 15000, "total": 60000, "productId": "4b2b95c0-cb71-4dbe-ac8a-6a14c85553c7"}]	2026-02-24 17:37:58.859	2026-04-12 17:37:58.86	\N	\N	\N
4beeec16-b108-4188-9add-8ae650f1d39e	33930263-cce8-4ffb-9b22-07ff6b07a268	b05a2a7a-e887-4189-9b84-bffc37cb01af	e23a801b-22e3-4e63-8aa9-7c91855ab84b	818000	684000	ACCEPTED	[{"qty": 5, "name": "Maishiy texnika mahsulot 49", "unit": "box", "price": 159000, "total": 795000, "productId": "a012992e-ebe6-4d91-b5ad-6531acd42b60"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 62", "unit": "pcs", "price": 23000, "total": 23000, "productId": "80a48d57-ff5b-46fe-a0e9-6a2d26503d83"}]	2026-02-25 17:37:58.863	2026-04-12 17:37:58.864	\N	\N	\N
26cb011c-d547-4180-a102-7926609b3002	33930263-cce8-4ffb-9b22-07ff6b07a268	ad915ba5-8334-496d-8ee5-9daa01ce57dd	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1064000	912000	PREPARING	[{"qty": 6, "name": "Sport mahsulot 50", "unit": "pcs", "price": 167000, "total": 1002000, "productId": "2efcbe5d-6dde-45c2-b772-3e6eb86b0ef9"}, {"qty": 2, "name": "Kiyim mahsulot 63", "unit": "pcs", "price": 31000, "total": 62000, "productId": "1ca217e1-d5db-48bd-a19b-bdd4540ff7cd"}]	2026-02-26 17:37:58.867	2026-04-12 17:37:58.867	\N	\N	\N
a2094e5e-0648-47ce-be53-b62fb33b1177	33930263-cce8-4ffb-9b22-07ff6b07a268	f844dda2-398f-41a2-b0cf-88fa3697fdcf	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1342000	285000	SHIPPED	[{"qty": 7, "name": "Elektronika mahsulot 51", "unit": "pcs", "price": 175000, "total": 1225000, "productId": "b0fb3ee1-6d8e-486e-8fa9-f5858213cf3c"}, {"qty": 3, "name": "Maishiy texnika mahsulot 64", "unit": "box", "price": 39000, "total": 117000, "productId": "f25eff91-4569-4c36-900b-1b8e0c75d567"}]	2026-02-26 17:37:58.869	2026-04-12 17:37:58.87	\N	\N	\N
bc1ff6f9-02a2-4183-af17-2ba5e1693a08	33930263-cce8-4ffb-9b22-07ff6b07a268	dafc9765-065a-4a7b-987e-299642d3dc4b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1652000	428000	DELIVERED	[{"qty": 8, "name": "Oziq-ovqat mahsulot 52", "unit": "box", "price": 183000, "total": 1464000, "productId": "58e36f86-5676-4784-84a3-7eb593885c4d"}, {"qty": 4, "name": "Sport mahsulot 65", "unit": "pcs", "price": 47000, "total": 188000, "productId": "baf2dda1-4d32-4e68-b49c-79df607a69e2"}]	2026-02-27 17:37:58.871	2026-04-12 17:37:58.872	\N	\N	\N
80b7fc56-92e0-429b-80e2-31979fd60c4c	33930263-cce8-4ffb-9b22-07ff6b07a268	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	f6736eff-d631-4f50-86f6-ad3187d95ecf	246000	103000	COMPLETED	[{"qty": 1, "name": "Kiyim mahsulot 53", "unit": "pcs", "price": 191000, "total": 191000, "productId": "196e8df5-4b2b-4783-b3f7-d16dd4d8f4e4"}, {"qty": 1, "name": "Elektronika mahsulot 66", "unit": "pcs", "price": 55000, "total": 55000, "productId": "c1b04289-23e6-43a2-abd3-9e4dea701c48"}]	2026-02-28 17:37:58.874	2026-04-12 17:37:58.874	\N	\N	\N
da5cc1de-9159-4e40-8509-585de83bd824	33930263-cce8-4ffb-9b22-07ff6b07a268	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	fcecf24d-f041-4838-95da-549726630e12	524000	226000	CANCELLED	[{"qty": 2, "name": "Maishiy texnika mahsulot 54", "unit": "pcs", "price": 199000, "total": 398000, "productId": "8aeb8d19-036a-473b-982c-f2ce0f96e17c"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 67", "unit": "box", "price": 63000, "total": 126000, "productId": "a9584e43-6bd3-49ee-b364-53d7ea058bc9"}]	2026-03-01 17:37:58.877	2026-04-12 17:37:58.878	\N	\N	\N
53cbd373-8b25-4bd6-87f1-8f7fd8d8bc59	33930263-cce8-4ffb-9b22-07ff6b07a268	476b7d56-98a3-4107-bee7-f2c0908416ff	e23a801b-22e3-4e63-8aa9-7c91855ab84b	834000	369000	PENDING	[{"qty": 3, "name": "Sport mahsulot 55", "unit": "box", "price": 207000, "total": 621000, "productId": "1c7ca51e-63b6-456e-b128-ec3297f79d27"}, {"qty": 3, "name": "Kiyim mahsulot 68", "unit": "pcs", "price": 71000, "total": 213000, "productId": "eb411ff9-a4e5-4978-a09b-bd32ae7c56ed"}]	2026-03-02 17:37:58.881	2026-04-12 17:37:58.882	\N	\N	\N
4491be65-ad63-4dea-92d7-2de6069b1849	33930263-cce8-4ffb-9b22-07ff6b07a268	cf1f2560-38cd-4a75-993b-3fa73e8a3a98	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1176000	532000	ACCEPTED	[{"qty": 4, "name": "Elektronika mahsulot 56", "unit": "pcs", "price": 215000, "total": 860000, "productId": "3809c0bb-c297-4c53-a026-e1b30beb57b7"}, {"qty": 4, "name": "Maishiy texnika mahsulot 69", "unit": "pcs", "price": 79000, "total": 316000, "productId": "66545519-05ad-4f45-a31a-8c524b69d595"}]	2026-03-03 17:37:58.885	2026-04-12 17:37:58.886	\N	\N	\N
d04f8ce8-b4d1-40e0-814c-2febcb102f6d	33930263-cce8-4ffb-9b22-07ff6b07a268	3868f60e-2952-4725-a074-0b57752220a5	f6736eff-d631-4f50-86f6-ad3187d95ecf	1202000	299000	PREPARING	[{"qty": 5, "name": "Oziq-ovqat mahsulot 57", "unit": "pcs", "price": 223000, "total": 1115000, "productId": "73d4bd51-6f96-4926-827d-4e941227a526"}, {"qty": 1, "name": "Sport mahsulot 70", "unit": "box", "price": 87000, "total": 87000, "productId": "f27a0267-a93a-4c0b-a87e-0f809a3a0f55"}]	2026-03-04 17:37:58.887	2026-04-12 17:37:58.888	\N	\N	\N
1a3b6bb3-5e42-4e4a-82d1-9b4c809b9808	33930263-cce8-4ffb-9b22-07ff6b07a268	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	fcecf24d-f041-4838-95da-549726630e12	1576000	482000	SHIPPED	[{"qty": 6, "name": "Kiyim mahsulot 58", "unit": "box", "price": 231000, "total": 1386000, "productId": "5d166591-169f-48a4-86d6-1260a1204697"}, {"qty": 2, "name": "Elektronika mahsulot 71", "unit": "pcs", "price": 95000, "total": 190000, "productId": "b3b8e141-375f-4340-9b38-c61ad4de47a2"}]	2026-03-05 17:37:58.89	2026-04-12 17:37:58.891	\N	\N	\N
d2a5e598-3bb5-4b20-a301-a888e6a1a1b0	33930263-cce8-4ffb-9b22-07ff6b07a268	569bf392-d510-4e78-b4c8-f580014e1c6a	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1982000	685000	DELIVERED	[{"qty": 7, "name": "Maishiy texnika mahsulot 59", "unit": "pcs", "price": 239000, "total": 1673000, "productId": "7c9ed4f2-4784-44a9-a4ec-ed63367bf6b4"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 72", "unit": "pcs", "price": 103000, "total": 309000, "productId": "94c9bc43-5530-4f1a-9a2f-08c2fe2af05f"}]	2026-03-06 17:37:58.895	2026-04-12 17:37:58.895	\N	\N	\N
bda5d333-c399-4d06-8843-b9aee30d457a	33930263-cce8-4ffb-9b22-07ff6b07a268	d6520409-350c-4741-8854-0621e3ec4328	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	2420000	908000	COMPLETED	[{"qty": 8, "name": "Sport mahsulot 60", "unit": "pcs", "price": 247000, "total": 1976000, "productId": "19bc05e4-b5d0-45d7-aff9-f91c1a43077e"}, {"qty": 4, "name": "Kiyim mahsulot 73", "unit": "box", "price": 111000, "total": 444000, "productId": "a0cd7382-d275-4063-b946-aa00ee14f1b8"}]	2026-03-07 17:37:58.898	2026-04-12 17:37:58.899	\N	\N	\N
d5cad2b6-0a02-4c3a-b8f3-8da79d1b4d2e	33930263-cce8-4ffb-9b22-07ff6b07a268	f7672e75-b2ca-49a9-ad1b-9ba989d80a77	f6736eff-d631-4f50-86f6-ad3187d95ecf	134000	183000	CANCELLED	[{"qty": 1, "name": "Elektronika mahsulot 61", "unit": "box", "price": 15000, "total": 15000, "productId": "4b2b95c0-cb71-4dbe-ac8a-6a14c85553c7"}, {"qty": 1, "name": "Maishiy texnika mahsulot 74", "unit": "pcs", "price": 119000, "total": 119000, "productId": "9d7074f2-c558-4968-a894-6b8db7d1c055"}]	2026-03-07 17:37:58.902	2026-04-12 17:37:58.902	\N	\N	\N
490b8217-a21e-4f7c-8300-8a32f3e276af	33930263-cce8-4ffb-9b22-07ff6b07a268	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	fcecf24d-f041-4838-95da-549726630e12	300000	386000	PENDING	[{"qty": 2, "name": "Oziq-ovqat mahsulot 62", "unit": "pcs", "price": 23000, "total": 46000, "productId": "80a48d57-ff5b-46fe-a0e9-6a2d26503d83"}, {"qty": 2, "name": "Sport mahsulot 75", "unit": "pcs", "price": 127000, "total": 254000, "productId": "c6842687-bc36-4db4-b2ed-31122b20d47f"}]	2026-03-08 17:37:58.903	2026-04-12 17:37:58.904	\N	\N	\N
9c2e1373-836c-4b8f-afc3-dfc9047b6722	33930263-cce8-4ffb-9b22-07ff6b07a268	ac85fd64-67b6-42f1-aa37-1ea9add2f500	e23a801b-22e3-4e63-8aa9-7c91855ab84b	498000	234000	ACCEPTED	[{"qty": 3, "name": "Kiyim mahsulot 63", "unit": "pcs", "price": 31000, "total": 93000, "productId": "1ca217e1-d5db-48bd-a19b-bdd4540ff7cd"}, {"qty": 3, "name": "Elektronika mahsulot 76", "unit": "box", "price": 135000, "total": 405000, "productId": "c7925f7e-d793-493a-923c-fa568af3028a"}]	2026-03-09 17:37:58.906	2026-04-12 17:37:58.907	\N	\N	\N
e224109f-608c-4344-9e19-af6b71645a8f	33930263-cce8-4ffb-9b22-07ff6b07a268	4e035e75-db70-4000-b6bc-e2df66cee240	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	728000	352000	PREPARING	[{"qty": 4, "name": "Maishiy texnika mahsulot 64", "unit": "box", "price": 39000, "total": 156000, "productId": "f25eff91-4569-4c36-900b-1b8e0c75d567"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 77", "unit": "pcs", "price": 143000, "total": 572000, "productId": "e6082d8b-7560-4009-822c-1e49ba970065"}]	2026-03-10 17:37:58.909	2026-04-12 17:37:58.91	\N	\N	\N
0831945a-81c2-4033-871a-67380ef18414	33930263-cce8-4ffb-9b22-07ff6b07a268	82aaa0ef-6d5e-469d-8218-866dfa87ab76	f6736eff-d631-4f50-86f6-ad3187d95ecf	386000	414000	SHIPPED	[{"qty": 5, "name": "Sport mahsulot 65", "unit": "pcs", "price": 47000, "total": 235000, "productId": "baf2dda1-4d32-4e68-b49c-79df607a69e2"}, {"qty": 1, "name": "Kiyim mahsulot 78", "unit": "pcs", "price": 151000, "total": 151000, "productId": "31b12021-3f65-4553-b45e-eed1203923a8"}]	2026-03-11 17:37:58.913	2026-04-12 17:37:58.914	\N	\N	\N
856886d6-6201-4654-ab81-0bf70991b5a5	33930263-cce8-4ffb-9b22-07ff6b07a268	42d9cfcb-5dfb-4e22-9560-dedbf628b385	fcecf24d-f041-4838-95da-549726630e12	648000	552000	DELIVERED	[{"qty": 6, "name": "Elektronika mahsulot 66", "unit": "pcs", "price": 55000, "total": 330000, "productId": "c1b04289-23e6-43a2-abd3-9e4dea701c48"}, {"qty": 2, "name": "Maishiy texnika mahsulot 79", "unit": "box", "price": 159000, "total": 318000, "productId": "3c47dc30-0d3d-44b1-9436-e513035f9ff8"}]	2026-03-12 17:37:58.918	2026-04-12 17:37:58.919	\N	\N	\N
7ce62ac5-8f15-49a1-9971-18710ba79f81	33930263-cce8-4ffb-9b22-07ff6b07a268	cad80b67-a04d-4679-88c7-883ac2b04911	e23a801b-22e3-4e63-8aa9-7c91855ab84b	942000	710000	COMPLETED	[{"qty": 7, "name": "Oziq-ovqat mahsulot 67", "unit": "box", "price": 63000, "total": 441000, "productId": "a9584e43-6bd3-49ee-b364-53d7ea058bc9"}, {"qty": 3, "name": "Sport mahsulot 80", "unit": "pcs", "price": 167000, "total": 501000, "productId": "602224e1-00ed-4e25-84c5-b89b28eb344d"}]	2026-03-13 17:37:58.92	2026-04-12 17:37:58.921	\N	\N	\N
fb8e0200-2c2a-4eb5-bc78-a126f0412033	33930263-cce8-4ffb-9b22-07ff6b07a268	503b7694-3480-45e9-8116-a469c79d249a	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1268000	888000	CANCELLED	[{"qty": 8, "name": "Kiyim mahsulot 68", "unit": "pcs", "price": 71000, "total": 568000, "productId": "eb411ff9-a4e5-4978-a09b-bd32ae7c56ed"}, {"qty": 4, "name": "Elektronika mahsulot 81", "unit": "pcs", "price": 175000, "total": 700000, "productId": "de98bafe-4b00-4a27-ab5a-362af2b79081"}]	2026-03-14 17:37:58.924	2026-04-12 17:37:58.925	\N	\N	\N
1eff8020-df26-42b2-9694-1c0b6b38af69	33930263-cce8-4ffb-9b22-07ff6b07a268	1213e655-58b1-4fd4-892c-c4a516f307c8	f6736eff-d631-4f50-86f6-ad3187d95ecf	262000	138000	PENDING	[{"qty": 1, "name": "Maishiy texnika mahsulot 69", "unit": "pcs", "price": 79000, "total": 79000, "productId": "66545519-05ad-4f45-a31a-8c524b69d595"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 82", "unit": "box", "price": 183000, "total": 183000, "productId": "41b4689d-89f3-4084-929b-f905749ed883"}]	2026-03-15 17:37:58.929	2026-04-12 17:37:58.93	\N	\N	\N
4fc83fc0-5bf9-4ac4-9788-dde074c5df4d	33930263-cce8-4ffb-9b22-07ff6b07a268	45806072-c97b-42ae-babb-c934f7141ab8	fcecf24d-f041-4838-95da-549726630e12	556000	296000	ACCEPTED	[{"qty": 2, "name": "Sport mahsulot 70", "unit": "box", "price": 87000, "total": 174000, "productId": "f27a0267-a93a-4c0b-a87e-0f809a3a0f55"}, {"qty": 2, "name": "Kiyim mahsulot 83", "unit": "pcs", "price": 191000, "total": 382000, "productId": "a6a8f84d-6753-4863-976c-dcadfac10a6f"}]	2026-03-16 17:37:58.933	2026-04-12 17:37:58.934	\N	\N	\N
4ae90c35-cf2c-4a8a-ad31-3fa6dee19b28	33930263-cce8-4ffb-9b22-07ff6b07a268	97dce907-dede-4fad-9991-f76b02f241c0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	882000	474000	PREPARING	[{"qty": 3, "name": "Elektronika mahsulot 71", "unit": "pcs", "price": 95000, "total": 285000, "productId": "b3b8e141-375f-4340-9b38-c61ad4de47a2"}, {"qty": 3, "name": "Maishiy texnika mahsulot 84", "unit": "pcs", "price": 199000, "total": 597000, "productId": "2585dc8d-6cb9-421a-9777-43eb4d84dea7"}]	2026-03-16 17:37:58.938	2026-04-12 17:37:58.939	\N	\N	\N
e1e5ef42-1316-44c4-9e45-67b2c9e47ce2	33930263-cce8-4ffb-9b22-07ff6b07a268	ef364e98-dc87-4278-84fc-3cbd6cd3a449	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1240000	672000	SHIPPED	[{"qty": 4, "name": "Oziq-ovqat mahsulot 72", "unit": "pcs", "price": 103000, "total": 412000, "productId": "94c9bc43-5530-4f1a-9a2f-08c2fe2af05f"}, {"qty": 4, "name": "Sport mahsulot 85", "unit": "box", "price": 207000, "total": 828000, "productId": "f2aae172-a8f6-477d-8dd4-3e24851f0840"}]	2026-03-17 17:37:58.94	2026-04-12 17:37:58.941	\N	\N	\N
b824745e-bc5a-440a-9418-94a8fbba9395	33930263-cce8-4ffb-9b22-07ff6b07a268	362df153-f937-4dfc-a047-e167af652682	f6736eff-d631-4f50-86f6-ad3187d95ecf	770000	654000	DELIVERED	[{"qty": 5, "name": "Kiyim mahsulot 73", "unit": "box", "price": 111000, "total": 555000, "productId": "a0cd7382-d275-4063-b946-aa00ee14f1b8"}, {"qty": 1, "name": "Elektronika mahsulot 86", "unit": "pcs", "price": 215000, "total": 215000, "productId": "d68c2c89-925b-496c-8789-105c0d7fde17"}]	2026-03-18 17:37:58.945	2026-04-12 17:37:58.946	\N	\N	\N
46550955-b356-4533-a775-b7f62f385129	33930263-cce8-4ffb-9b22-07ff6b07a268	7dbe4041-1742-47f3-8bd2-0e932385bd9c	fcecf24d-f041-4838-95da-549726630e12	1160000	872000	COMPLETED	[{"qty": 6, "name": "Maishiy texnika mahsulot 74", "unit": "pcs", "price": 119000, "total": 714000, "productId": "9d7074f2-c558-4968-a894-6b8db7d1c055"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 87", "unit": "pcs", "price": 223000, "total": 446000, "productId": "90745b2f-1ccd-48f0-9a32-cdc0654cb5c0"}]	2026-03-19 17:37:58.95	2026-04-12 17:37:58.951	\N	\N	\N
61f189a9-1e61-4417-a808-7f1aad81d1f5	33930263-cce8-4ffb-9b22-07ff6b07a268	b5bf2837-4d2a-4c19-8433-c595ce528ed1	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1582000	1110000	CANCELLED	[{"qty": 7, "name": "Sport mahsulot 75", "unit": "pcs", "price": 127000, "total": 889000, "productId": "c6842687-bc36-4db4-b2ed-31122b20d47f"}, {"qty": 3, "name": "Kiyim mahsulot 88", "unit": "box", "price": 231000, "total": 693000, "productId": "3817624d-c5ef-448a-9a1a-b7debbe79f18"}]	2026-03-20 17:37:58.955	2026-04-12 17:37:58.956	\N	\N	\N
f574fd6f-6641-4e21-ab02-78a59b14c909	33930263-cce8-4ffb-9b22-07ff6b07a268	17b030ff-132b-47ca-a099-729ff1cc3a5d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	2036000	368000	PENDING	[{"qty": 8, "name": "Elektronika mahsulot 76", "unit": "box", "price": 135000, "total": 1080000, "productId": "c7925f7e-d793-493a-923c-fa568af3028a"}, {"qty": 4, "name": "Maishiy texnika mahsulot 89", "unit": "pcs", "price": 239000, "total": 956000, "productId": "f7273cd1-2de4-47d8-be9e-44d14d042262"}]	2026-03-21 17:37:58.958	2026-04-12 17:37:58.959	\N	\N	\N
dceb0f33-434f-442a-93b2-abd0be1491c2	33930263-cce8-4ffb-9b22-07ff6b07a268	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	f6736eff-d631-4f50-86f6-ad3187d95ecf	390000	93000	ACCEPTED	[{"qty": 1, "name": "Oziq-ovqat mahsulot 77", "unit": "pcs", "price": 143000, "total": 143000, "productId": "e6082d8b-7560-4009-822c-1e49ba970065"}, {"qty": 1, "name": "Sport mahsulot 90", "unit": "pcs", "price": 247000, "total": 247000, "productId": "f92e8e36-cd56-489c-8004-894ef7b91e48"}]	2026-03-22 17:37:58.962	2026-04-12 17:37:58.963	\N	\N	\N
0955509f-b0e7-4eb5-93f7-79362eb488d1	33930263-cce8-4ffb-9b22-07ff6b07a268	73062c7a-dff1-44ad-9a7e-18729e766900	fcecf24d-f041-4838-95da-549726630e12	332000	206000	PREPARING	[{"qty": 2, "name": "Kiyim mahsulot 78", "unit": "pcs", "price": 151000, "total": 302000, "productId": "31b12021-3f65-4553-b45e-eed1203923a8"}, {"qty": 2, "name": "Elektronika mahsulot 91", "unit": "box", "price": 15000, "total": 30000, "productId": "69e2e698-c5c4-47d1-8afb-f2325808e30b"}]	2026-03-23 17:37:58.966	2026-04-12 17:37:58.967	\N	\N	\N
252e104f-2edd-4d0c-b96a-012afc6b53b0	33930263-cce8-4ffb-9b22-07ff6b07a268	70aa161e-8ee0-4950-afaa-f2e955b6c68f	e23a801b-22e3-4e63-8aa9-7c91855ab84b	546000	339000	SHIPPED	[{"qty": 3, "name": "Maishiy texnika mahsulot 79", "unit": "box", "price": 159000, "total": 477000, "productId": "3c47dc30-0d3d-44b1-9436-e513035f9ff8"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 92", "unit": "pcs", "price": 23000, "total": 69000, "productId": "9dbfaa95-0d66-42b3-a3ed-28c2056ec0af"}]	2026-03-24 17:37:58.97	2026-04-12 17:37:58.97	\N	\N	\N
be9f9a35-a689-4172-9d6e-9c312aae4108	33930263-cce8-4ffb-9b22-07ff6b07a268	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	792000	492000	DELIVERED	[{"qty": 4, "name": "Sport mahsulot 80", "unit": "pcs", "price": 167000, "total": 668000, "productId": "602224e1-00ed-4e25-84c5-b89b28eb344d"}, {"qty": 4, "name": "Kiyim mahsulot 93", "unit": "pcs", "price": 31000, "total": 124000, "productId": "8d142f47-3d11-4b19-b1af-bf4938566599"}]	2026-03-25 17:37:58.973	2026-04-12 17:37:58.974	\N	\N	\N
8a7fde3d-ddfe-4807-8b78-5143c2c228bf	33930263-cce8-4ffb-9b22-07ff6b07a268	8ba64cce-4753-4815-841e-954ccfa3f432	f6736eff-d631-4f50-86f6-ad3187d95ecf	914000	269000	COMPLETED	[{"qty": 5, "name": "Elektronika mahsulot 81", "unit": "pcs", "price": 175000, "total": 875000, "productId": "de98bafe-4b00-4a27-ab5a-362af2b79081"}, {"qty": 1, "name": "Maishiy texnika mahsulot 94", "unit": "box", "price": 39000, "total": 39000, "productId": "a27d8322-3c93-49b2-8537-2786d00d0498"}]	2026-03-25 17:37:58.977	2026-04-12 17:37:58.978	\N	\N	\N
0b29ebc6-5803-4b10-a946-2cb41e5a6406	33930263-cce8-4ffb-9b22-07ff6b07a268	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	fcecf24d-f041-4838-95da-549726630e12	1192000	442000	CANCELLED	[{"qty": 6, "name": "Oziq-ovqat mahsulot 82", "unit": "box", "price": 183000, "total": 1098000, "productId": "41b4689d-89f3-4084-929b-f905749ed883"}, {"qty": 2, "name": "Sport mahsulot 95", "unit": "pcs", "price": 47000, "total": 94000, "productId": "9a54b294-d881-42a0-84ce-8936e7c04f6e"}]	2026-03-26 17:37:58.98	2026-04-12 17:37:58.98	\N	\N	\N
ccae6635-37c2-4d43-87d4-9ded54e5e2a7	33930263-cce8-4ffb-9b22-07ff6b07a268	a2d3c202-6b97-439e-9ea1-705a8945bcc0	e23a801b-22e3-4e63-8aa9-7c91855ab84b	1502000	635000	PENDING	[{"qty": 7, "name": "Kiyim mahsulot 83", "unit": "pcs", "price": 191000, "total": 1337000, "productId": "a6a8f84d-6753-4863-976c-dcadfac10a6f"}, {"qty": 3, "name": "Elektronika mahsulot 96", "unit": "pcs", "price": 55000, "total": 165000, "productId": "3fd14b4c-9163-4dfb-be45-18c5f3ac02f0"}]	2026-03-27 17:37:58.983	2026-04-12 17:37:58.984	\N	\N	\N
d116cfe9-0586-4085-835d-1a42c59a492f	33930263-cce8-4ffb-9b22-07ff6b07a268	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1844000	848000	ACCEPTED	[{"qty": 8, "name": "Maishiy texnika mahsulot 84", "unit": "pcs", "price": 199000, "total": 1592000, "productId": "2585dc8d-6cb9-421a-9777-43eb4d84dea7"}, {"qty": 4, "name": "Oziq-ovqat mahsulot 97", "unit": "box", "price": 63000, "total": 252000, "productId": "0e6167a9-c89d-4f73-aad1-3e49bdb7a4fe"}]	2026-03-28 17:37:58.986	2026-04-12 17:37:58.987	\N	\N	\N
8c9f7a32-b016-4348-ae3f-aaedc10df835	33930263-cce8-4ffb-9b22-07ff6b07a268	b59f04da-f8e4-43f9-8488-cff1a5e1180d	f6736eff-d631-4f50-86f6-ad3187d95ecf	278000	173000	PREPARING	[{"qty": 1, "name": "Sport mahsulot 85", "unit": "box", "price": 207000, "total": 207000, "productId": "f2aae172-a8f6-477d-8dd4-3e24851f0840"}, {"qty": 1, "name": "Kiyim mahsulot 98", "unit": "pcs", "price": 71000, "total": 71000, "productId": "c4fe027b-bd26-474c-8a3a-5623df3deeb3"}]	2026-03-29 17:37:58.989	2026-04-12 17:37:58.99	\N	\N	\N
802e7a68-f227-4be2-8616-db75a75d14aa	33930263-cce8-4ffb-9b22-07ff6b07a268	ea743292-3ef3-4392-a2bf-2d5555f8e034	fcecf24d-f041-4838-95da-549726630e12	588000	366000	SHIPPED	[{"qty": 2, "name": "Elektronika mahsulot 86", "unit": "pcs", "price": 215000, "total": 430000, "productId": "d68c2c89-925b-496c-8789-105c0d7fde17"}, {"qty": 2, "name": "Maishiy texnika mahsulot 99", "unit": "pcs", "price": 79000, "total": 158000, "productId": "66d94936-85d5-4eb8-9c9f-8dc4e59e1c76"}]	2026-03-30 17:37:58.992	2026-04-12 17:37:58.993	\N	\N	\N
3692d3bd-1d76-4c39-a821-2a9a5c40bd9e	33930263-cce8-4ffb-9b22-07ff6b07a268	db460ec1-c062-4e57-8218-ea2add3a540e	e23a801b-22e3-4e63-8aa9-7c91855ab84b	930000	579000	DELIVERED	[{"qty": 3, "name": "Oziq-ovqat mahsulot 87", "unit": "pcs", "price": 223000, "total": 669000, "productId": "90745b2f-1ccd-48f0-9a32-cdc0654cb5c0"}, {"qty": 3, "name": "Sport mahsulot 100", "unit": "box", "price": 87000, "total": 261000, "productId": "cd0327d9-ab0e-4351-8f1e-da0d93e47fdf"}]	2026-03-31 17:37:58.995	2026-04-12 17:37:58.996	\N	\N	\N
beb14c2d-131d-4b1b-bb62-dec9ba19f396	33930263-cce8-4ffb-9b22-07ff6b07a268	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	984000	312000	COMPLETED	[{"qty": 4, "name": "Kiyim mahsulot 88", "unit": "box", "price": 231000, "total": 924000, "productId": "3817624d-c5ef-448a-9a1a-b7debbe79f18"}, {"qty": 4, "name": "Elektronika mahsulot 1", "unit": "box", "price": 15000, "total": 60000, "productId": "083e0980-ef76-4b55-9984-7687fd62c047"}]	2026-04-01 17:37:59	2026-04-12 17:37:59	\N	\N	\N
31d05a89-57a5-4cc8-8c67-37af9273714e	33930263-cce8-4ffb-9b22-07ff6b07a268	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	f6736eff-d631-4f50-86f6-ad3187d95ecf	1218000	384000	CANCELLED	[{"qty": 5, "name": "Maishiy texnika mahsulot 89", "unit": "pcs", "price": 239000, "total": 1195000, "productId": "f7273cd1-2de4-47d8-be9e-44d14d042262"}, {"qty": 1, "name": "Oziq-ovqat mahsulot 2", "unit": "pcs", "price": 23000, "total": 23000, "productId": "c3ef2e06-a1cf-46c8-9b8d-1d907027f5f2"}]	2026-04-02 17:37:59.003	2026-04-12 17:37:59.004	\N	\N	\N
30a8fcd5-3a91-4fc9-9178-c640d3fe771b	33930263-cce8-4ffb-9b22-07ff6b07a268	0edc83d9-aaed-446e-9206-bb6ebaefd489	fcecf24d-f041-4838-95da-549726630e12	1544000	512000	PENDING	[{"qty": 6, "name": "Sport mahsulot 90", "unit": "pcs", "price": 247000, "total": 1482000, "productId": "f92e8e36-cd56-489c-8004-894ef7b91e48"}, {"qty": 2, "name": "Kiyim mahsulot 3", "unit": "pcs", "price": 31000, "total": 62000, "productId": "3d14bc97-06e2-43b7-8976-7cac73e31c93"}]	2026-04-03 17:37:59.007	2026-04-12 17:37:59.008	\N	\N	\N
ddac8528-ade9-450d-a27e-6ecc06a8f51b	33930263-cce8-4ffb-9b22-07ff6b07a268	d9e83212-f867-40ff-b67a-2f35b3ef3bfd	e23a801b-22e3-4e63-8aa9-7c91855ab84b	222000	660000	ACCEPTED	[{"qty": 7, "name": "Elektronika mahsulot 91", "unit": "box", "price": 15000, "total": 105000, "productId": "69e2e698-c5c4-47d1-8afb-f2325808e30b"}, {"qty": 3, "name": "Maishiy texnika mahsulot 4", "unit": "box", "price": 39000, "total": 117000, "productId": "f22db48b-a300-457b-a5c1-861f85086d4c"}]	2026-04-03 17:37:59.012	2026-04-12 17:37:59.013	\N	\N	\N
86a35ca5-6704-46dd-9d90-8e13a175378d	33930263-cce8-4ffb-9b22-07ff6b07a268	c6d766ef-6c99-4763-b225-a853cdee1b71	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	372000	828000	PREPARING	[{"qty": 8, "name": "Oziq-ovqat mahsulot 92", "unit": "pcs", "price": 23000, "total": 184000, "productId": "9dbfaa95-0d66-42b3-a3ed-28c2056ec0af"}, {"qty": 4, "name": "Sport mahsulot 5", "unit": "pcs", "price": 47000, "total": 188000, "productId": "2fbbc8a7-5d80-4027-90bf-592038d03dce"}]	2026-04-04 17:37:59.014	2026-04-12 17:37:59.015	\N	\N	\N
73f3dfa4-f096-4de7-8236-5bad4309d21e	33930263-cce8-4ffb-9b22-07ff6b07a268	f48b30c0-e349-4ea0-9f74-c738acc90712	f6736eff-d631-4f50-86f6-ad3187d95ecf	86000	128000	SHIPPED	[{"qty": 1, "name": "Kiyim mahsulot 93", "unit": "pcs", "price": 31000, "total": 31000, "productId": "8d142f47-3d11-4b19-b1af-bf4938566599"}, {"qty": 1, "name": "Elektronika mahsulot 6", "unit": "pcs", "price": 55000, "total": 55000, "productId": "8a7cad1c-2393-466d-8206-73092b9c771f"}]	2026-04-05 17:37:59.019	2026-04-12 17:37:59.02	\N	\N	\N
c2a3b775-e361-455d-9fbf-9dadb8f601e4	33930263-cce8-4ffb-9b22-07ff6b07a268	5a1eb044-89d2-403f-ab0c-010ee51e8091	fcecf24d-f041-4838-95da-549726630e12	204000	276000	DELIVERED	[{"qty": 2, "name": "Maishiy texnika mahsulot 94", "unit": "box", "price": 39000, "total": 78000, "productId": "a27d8322-3c93-49b2-8537-2786d00d0498"}, {"qty": 2, "name": "Oziq-ovqat mahsulot 7", "unit": "box", "price": 63000, "total": 126000, "productId": "2e3fd8cb-b7fa-42d4-b917-09b40ed15d73"}]	2026-04-06 17:37:59.022	2026-04-12 17:37:59.023	\N	\N	\N
2978ca34-cd92-4508-b6f6-53ac26682c15	33930263-cce8-4ffb-9b22-07ff6b07a268	678981d1-9c26-4b15-a842-9f66b14d4985	e23a801b-22e3-4e63-8aa9-7c91855ab84b	354000	444000	COMPLETED	[{"qty": 3, "name": "Sport mahsulot 95", "unit": "pcs", "price": 47000, "total": 141000, "productId": "9a54b294-d881-42a0-84ce-8936e7c04f6e"}, {"qty": 3, "name": "Kiyim mahsulot 8", "unit": "pcs", "price": 71000, "total": 213000, "productId": "7f1e5b9f-dccf-4291-97f8-e1a6141e7587"}]	2026-04-07 17:37:59.025	2026-04-12 17:37:59.026	\N	\N	\N
14a45443-98a7-4e3f-9f6c-e8a5e1de29a6	33930263-cce8-4ffb-9b22-07ff6b07a268	02fe2116-4394-4000-924e-8f306a09841f	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	536000	632000	CANCELLED	[{"qty": 4, "name": "Elektronika mahsulot 96", "unit": "pcs", "price": 55000, "total": 220000, "productId": "3fd14b4c-9163-4dfb-be45-18c5f3ac02f0"}, {"qty": 4, "name": "Maishiy texnika mahsulot 9", "unit": "pcs", "price": 79000, "total": 316000, "productId": "a2c21b37-562d-4f08-9706-0cd9665abc2a"}]	2026-04-08 17:37:59.03	2026-04-12 17:37:59.031	\N	\N	\N
e75228d4-d517-4fa5-bea0-06dbf10f0acf	33930263-cce8-4ffb-9b22-07ff6b07a268	901851a8-14d0-40f1-a4ed-e7c0bac85e71	f6736eff-d631-4f50-86f6-ad3187d95ecf	402000	624000	PENDING	[{"qty": 5, "name": "Oziq-ovqat mahsulot 97", "unit": "box", "price": 63000, "total": 315000, "productId": "0e6167a9-c89d-4f73-aad1-3e49bdb7a4fe"}, {"qty": 1, "name": "Sport mahsulot 10", "unit": "box", "price": 87000, "total": 87000, "productId": "0736c191-d62b-4fae-ab89-600f86bd1574"}]	2026-04-09 17:37:59.032	2026-04-12 17:37:59.032	\N	\N	\N
17c8a79e-15e0-46b9-a748-f1eeaa0a512b	33930263-cce8-4ffb-9b22-07ff6b07a268	6dfe2784-51bf-4d6d-a613-a8dede9ba816	fcecf24d-f041-4838-95da-549726630e12	616000	832000	ACCEPTED	[{"qty": 6, "name": "Kiyim mahsulot 98", "unit": "pcs", "price": 71000, "total": 426000, "productId": "c4fe027b-bd26-474c-8a3a-5623df3deeb3"}, {"qty": 2, "name": "Elektronika mahsulot 11", "unit": "pcs", "price": 95000, "total": 190000, "productId": "7cb93dea-a617-4a46-8e70-eb9bb3662310"}]	2026-04-10 17:37:59.034	2026-04-12 17:37:59.035	\N	\N	\N
999a11e5-e81c-4300-8cc2-d7b89950dc82	33930263-cce8-4ffb-9b22-07ff6b07a268	b05a2a7a-e887-4189-9b84-bffc37cb01af	e23a801b-22e3-4e63-8aa9-7c91855ab84b	862000	1060000	PREPARING	[{"qty": 7, "name": "Maishiy texnika mahsulot 99", "unit": "pcs", "price": 79000, "total": 553000, "productId": "66d94936-85d5-4eb8-9c9f-8dc4e59e1c76"}, {"qty": 3, "name": "Oziq-ovqat mahsulot 12", "unit": "pcs", "price": 103000, "total": 309000, "productId": "2cfb68ee-4fcd-492a-a10e-06bcb5e1b1b9"}]	2026-04-11 17:37:59.039	2026-04-12 17:37:59.039	\N	\N	\N
bb1f5358-d70c-4c79-872c-b8cadce2b448	33930263-cce8-4ffb-9b22-07ff6b07a268	ad915ba5-8334-496d-8ee5-9daa01ce57dd	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	1140000	1308000	SHIPPED	[{"qty": 8, "name": "Sport mahsulot 100", "unit": "box", "price": 87000, "total": 696000, "productId": "cd0327d9-ab0e-4351-8f1e-da0d93e47fdf"}, {"qty": 4, "name": "Kiyim mahsulot 13", "unit": "box", "price": 111000, "total": 444000, "productId": "e71e737e-f2d3-4980-866c-0224dac39cc7"}]	2026-04-12 17:37:59.042	2026-04-12 17:37:59.042	\N	\N	\N
b7c967b2-6eb9-4dec-a9a5-8faa02491ac1	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-1	17c263ab-70a9-4bdd-a67f-d8cb8e330972	4500000	3240000	DELIVERED	"[{\\"productId\\":null,\\"name\\":\\"Premium Box Set\\",\\"qty\\":18,\\"unit\\":\\"pcs\\",\\"price\\":250000,\\"total\\":4500000}]"	2026-04-02 19:00:00.15	2026-04-12 19:00:00.158	\N	\N	\N
6b219e99-004e-44a9-8dcc-d42641998bd6	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-2	17c263ab-70a9-4bdd-a67f-d8cb8e330972	1200000	900000	PENDING	"[{\\"productId\\":null,\\"name\\":\\"Standard Pack\\",\\"qty\\":27,\\"unit\\":\\"pcs\\",\\"price\\":45000,\\"total\\":1215000}]"	2026-04-04 19:00:00.15	2026-04-12 19:00:00.172	\N	\N	\N
13365d35-360a-4c77-b7b0-0b81d223228c	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-3	17c263ab-70a9-4bdd-a67f-d8cb8e330972	2500000	1900000	COMPLETED	"[{\\"productId\\":null,\\"name\\":\\"Industrial Set\\",\\"qty\\":2,\\"unit\\":\\"pcs\\",\\"price\\":1200000,\\"total\\":2400000}]"	2026-04-05 19:00:00.15	2026-04-12 19:00:00.178	\N	\N	\N
a88fb0f8-a382-4263-aee0-10e9a2fb77e2	677fe634-603d-4723-8c85-afff22b41391	dealer-677fe634-603d-4723-8c85-afff22b41391-4	17c263ab-70a9-4bdd-a67f-d8cb8e330972	650000	480000	DELIVERED	"[{\\"productId\\":null,\\"name\\":\\"Mini Sample\\",\\"qty\\":54,\\"unit\\":\\"pcs\\",\\"price\\":12000,\\"total\\":648000}]"	2026-04-06 19:00:00.15	2026-04-12 19:00:00.184	\N	\N	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "companyId", "branchId", "dealerId", amount, method, reference, "createdAt", "deletedAt", "deletedBy", note) FROM stdin;
7a1b71ea-2759-4fbe-9323-cc44717b2df8	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	b122c83b-1b3f-4943-90b5-6226085c997d	20000000	BANK	\N	2026-03-28 18:21:44.873	\N	\N	\N
669e432a-8a5c-4a60-bc4f-9368a5ac658e	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	5d76c986-4cad-446c-8442-21b4c0ee0cf9	10000000	CASH	\N	2026-03-28 18:21:44.877	\N	\N	\N
e2494d8b-ae31-462e-8503-40204c6004a7	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	3000000	CLICK	\N	2026-03-28 18:21:44.88	\N	\N	\N
b3cd267a-843c-44a6-b1a7-b4080d574d5f	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	14a0868a-c9ed-4962-92da-7d25d5e98e2c	8000000	PAYME	\N	2026-03-28 18:21:44.883	\N	\N	\N
a57cc476-456a-4430-adaf-65be332cc7fb	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	eb9fdd9f-8ae4-4252-a662-ac14a105d55e	2000000	CASH	\N	2026-03-28 18:21:44.885	\N	\N	\N
2dd77013-9108-442b-a9e7-65c495675447	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	180000	bank	\N	2025-10-15 20:37:58.264	\N	\N	To'lov
84c35f67-f709-4591-98de-603ace6fd455	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	348600	card	\N	2025-10-16 20:37:58.273	\N	\N	To'lov
7a871142-26fa-4aed-9e8e-86a20b74337b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	582400	cash	\N	2025-10-17 20:37:58.28	\N	\N	To'lov
020bb9ee-b7f8-46f8-9339-175f6f2a1efa	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	347400	bank	\N	2025-10-18 20:37:58.285	\N	\N	To'lov
08cb9129-d432-421e-b3ab-497291bf0962	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	565200	cash	\N	2025-10-20 20:37:58.293	\N	\N	To'lov
15978c38-aa93-4333-8c27-e81888b4693d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	887600	bank	\N	2025-10-21 20:37:58.3	\N	\N	To'lov
14c6de47-577e-4e61-afb4-a56b8b00c1c7	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	209600	card	\N	2025-10-22 20:37:58.305	\N	\N	To'lov
0a0b7de1-b274-46d9-8500-1ba15061872f	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	500400	cash	\N	2025-10-23 20:37:58.31	\N	\N	To'lov
8ebae298-8406-4966-a28e-94da275e9246	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	744000	card	\N	2025-10-24 20:37:58.319	\N	\N	To'lov
586bd788-ca3b-4555-8bbb-e774beb8fe92	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	539000	cash	\N	2025-10-25 20:37:58.324	\N	\N	To'lov
09d95afc-0dad-4f29-ae12-76ec5d01ba66	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	928000	bank	\N	2025-10-26 20:37:58.33	\N	\N	To'lov
0797d606-9580-4113-b30c-f1e42d050cf7	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	1423800	card	\N	2025-10-27 20:37:58.336	\N	\N	To'lov
6e2a7158-56fd-436c-b750-a7248f6a22d0	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	234000	bank	\N	2025-10-29 20:37:58.344	\N	\N	To'lov
5bbdaeea-0382-40b0-8b93-41447bacdec8	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	232400	card	\N	2025-10-30 20:37:58.35	\N	\N	To'lov
3bce5d54-662e-4d3b-a260-b8e5116b4348	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	436800	cash	\N	2025-10-31 20:37:58.354	\N	\N	To'lov
007a7f84-9fdf-43d5-9a6d-774373b5f3f5	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	712800	bank	\N	2025-11-01 20:37:58.359	\N	\N	To'lov
2c2763c0-5c9d-436f-a437-5a0176d67999	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	715200	cash	\N	2025-11-02 20:37:58.369	\N	\N	To'lov
1883075b-96d4-478c-801f-65278e7a2402	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	1051400	bank	\N	2025-11-03 20:37:58.374	\N	\N	To'lov
df606d5d-b521-4588-8864-3215c32ffb6e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	1475200	card	\N	2025-11-04 20:37:58.379	\N	\N	To'lov
0cde6a50-bbf5-4fde-b4de-0ef89b4bd840	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	250200	cash	\N	2025-11-05 20:37:58.384	\N	\N	To'lov
4d3a60d1-197c-4115-9a2a-869742149ec8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	558000	card	\N	2025-11-07 20:37:58.391	\N	\N	To'lov
3e0c291f-1317-4cab-a958-0711d9906773	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	912800	cash	\N	2025-11-08 20:37:58.397	\N	\N	To'lov
79652bf7-42f8-4b8d-8dbe-f1d724be2ce7	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	1038400	bank	\N	2025-11-09 20:37:58.401	\N	\N	To'lov
97c6f79f-b621-40f9-a262-41306bfb0ebe	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	1533600	card	\N	2025-11-10 20:37:58.405	\N	\N	To'lov
351769ed-54b1-4303-ba07-2803345ae4d4	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	415200	bank	\N	2025-11-11 20:37:58.413	\N	\N	To'lov
2f4a4843-f5f7-45b2-b9c4-9a45644ea791	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	116200	card	\N	2025-11-12 20:37:58.418	\N	\N	To'lov
b1de916f-92d7-4ace-889b-ac846dc13991	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	291200	cash	\N	2025-11-13 20:37:58.422	\N	\N	To'lov
08b50f32-08e8-4054-98df-b990451739c5	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	534600	bank	\N	2025-11-14 20:37:58.427	\N	\N	To'lov
61f5e1c7-a37d-49d7-a700-385417f7e2fa	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	289200	cash	\N	2025-11-16 20:37:58.435	\N	\N	To'lov
dce76589-de00-47f2-bb84-d744407cc593	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	543200	bank	\N	2025-11-17 20:37:58.439	\N	\N	To'lov
8bfb1ec2-ce93-47e6-8e4c-1bae5dfd70f8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	881600	card	\N	2025-11-18 20:37:58.447	\N	\N	To'lov
fba5281f-8aa5-44f7-a606-69f943e98348	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	1314000	cash	\N	2025-11-19 20:37:58.453	\N	\N	To'lov
a9769801-1593-4430-8594-7dbd70066afa	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	372000	card	\N	2025-11-20 20:37:58.46	\N	\N	To'lov
2b9a62bf-2ec5-41bb-af0d-00bf0fb7230a	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	684600	cash	\N	2025-11-21 20:37:58.467	\N	\N	To'lov
534bba9d-1028-4642-9ae0-846c600e673c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	1094400	bank	\N	2025-11-22 20:37:58.472	\N	\N	To'lov
180650e7-beb1-415d-9539-e42ecb25f76c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	779400	card	\N	2025-11-23 20:37:58.479	\N	\N	To'lov
68cdbfa7-c793-47e4-8b1b-b4debfe3dfea	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	1045200	bank	\N	2025-11-25 20:37:58.486	\N	\N	To'lov
79126b09-90ff-456a-992e-131b4449b92c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	887600	card	\N	2025-11-26 20:37:58.492	\N	\N	To'lov
a83d56aa-0d53-49ad-ba70-e8e69d72eb74	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	145600	cash	\N	2025-11-27 20:37:58.497	\N	\N	To'lov
4553d288-1cad-4aad-b554-13b3cd640d7c	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	356400	bank	\N	2025-11-28 20:37:58.503	\N	\N	To'lov
cf3f074b-faa1-4a89-b33e-9ac1079b8b4b	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	552000	cash	\N	2025-11-29 20:37:58.511	\N	\N	To'lov
fcbb2783-de07-49c7-a72f-e82af215f4a8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	707000	bank	\N	2025-11-30 20:37:58.518	\N	\N	To'lov
18cc7c32-35be-43b2-928d-ad875e898182	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	1056000	card	\N	2025-12-01 20:37:58.523	\N	\N	To'lov
04e073f7-5779-4739-a8bc-41e08e7097c3	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	1495800	cash	\N	2025-12-02 20:37:58.528	\N	\N	To'lov
09d5eda8-be8e-407e-b9fb-bdccfb73ff08	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	186000	card	\N	2025-12-04 20:37:58.536	\N	\N	To'lov
699ee9e4-0849-46f4-8c70-8c8e54ee24d1	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	456400	cash	\N	2025-12-05 20:37:58.54	\N	\N	To'lov
2491be53-4137-4967-b530-5456e91cd75e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	820800	bank	\N	2025-12-06 20:37:58.544	\N	\N	To'lov
e0ce14f1-96cc-4257-9933-33c13c54917e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	1288800	card	\N	2025-12-07 20:37:58.55	\N	\N	To'lov
7625cd09-5e97-4c5c-b417-0af026424df2	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	235200	bank	\N	2025-12-08 20:37:58.557	\N	\N	To'lov
ae6ecca9-d3f6-4b0d-a4f9-15d489e9d8ca	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	435400	card	\N	2025-12-09 20:37:58.562	\N	\N	To'lov
fc1c4afb-9419-4848-b10e-6ec9a67e7957	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	707200	cash	\N	2025-12-10 20:37:58.567	\N	\N	To'lov
409f77d8-70b4-46ef-8dfd-0ddd3dcf4888	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	178200	bank	\N	2025-12-11 20:37:58.57	\N	\N	To'lov
246d56ac-2632-4563-b0a7-2388b741af55	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	414000	cash	\N	2025-12-13 20:37:58.575	\N	\N	To'lov
7151a9a2-8cf4-48c1-94a1-b38b7a5ea170	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	688800	bank	\N	2025-12-14 20:37:58.58	\N	\N	To'lov
218104e5-f14b-4f39-812c-439ec7a06d1a	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	462400	card	\N	2025-12-15 20:37:58.584	\N	\N	To'lov
48919a1f-b618-4be9-b97e-fa64f4cc2f8d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	813600	cash	\N	2025-12-16 20:37:58.588	\N	\N	To'lov
78a32bfe-3b0f-49bc-87ef-00411d248282	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	991200	card	\N	2025-12-17 20:37:58.593	\N	\N	To'lov
d3698d3c-ff8d-41a6-b85c-08b6ef549931	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	228200	cash	\N	2025-12-18 20:37:58.598	\N	\N	To'lov
429c7190-fdba-4170-9d31-7b67ad2e21d3	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	547200	bank	\N	2025-12-19 20:37:58.602	\N	\N	To'lov
05ddbf6f-a8f5-49f1-98c1-a9d685564d57	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	966600	card	\N	2025-12-20 20:37:58.605	\N	\N	To'lov
04f46bf9-104f-4070-970c-3c39a4aa81c8	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	577200	bank	\N	2025-12-22 20:37:58.61	\N	\N	To'lov
9a5e58ac-e4eb-48a7-bb5e-f8b92c718eaf	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	655200	card	\N	2025-12-23 20:37:58.615	\N	\N	To'lov
df6ad7e1-dc13-461e-9619-a8ea74fe3099	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	945600	cash	\N	2025-12-24 20:37:58.619	\N	\N	To'lov
de6b23c7-49ae-4382-a3ca-9b28b3075d97	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	1314000	bank	\N	2025-12-25 20:37:58.622	\N	\N	To'lov
26203a43-d9e9-4ba7-9be7-dd908ea71ca2	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	276000	cash	\N	2025-12-26 20:37:58.628	\N	\N	To'lov
b19c38ab-0043-4ba7-aa24-29043cf8a2b3	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	516600	bank	\N	2025-12-27 20:37:58.632	\N	\N	To'lov
25485ea2-df3e-484c-97da-5fc9a9bb00dd	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	838400	card	\N	2025-12-28 20:37:58.635	\N	\N	To'lov
025f56a7-3326-432a-a591-4025cb33c9b7	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	995400	cash	\N	2025-12-29 20:37:58.639	\N	\N	To'lov
222ac9ca-f407-4fea-a228-da24eb58c111	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	1093200	card	\N	2025-12-31 20:37:58.644	\N	\N	To'lov
74d6a3c3-0e3a-41dc-a5b1-80b239f3692e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	1335600	cash	\N	2026-01-01 20:37:58.649	\N	\N	To'lov
7485de4a-f031-446b-8f0f-6b07cfb2622a	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	209600	bank	\N	2026-01-02 20:37:58.652	\N	\N	To'lov
a1aa1c1d-fe52-4a9b-8167-5d873a49ba3c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	500400	card	\N	2026-01-03 20:37:58.655	\N	\N	To'lov
30d1dad7-398e-4b8d-a982-161cb908d4d4	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	168000	bank	\N	2026-01-04 20:37:58.659	\N	\N	To'lov
4f458e86-f043-424c-b590-6769247ede77	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	147000	card	\N	2026-01-05 20:37:58.664	\N	\N	To'lov
9cfea517-c7a6-4ffb-a985-b56a7b142b0e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	288000	cash	\N	2026-01-06 20:37:58.667	\N	\N	To'lov
7f536271-7f4a-47f8-a854-3935f5e61438	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	487800	bank	\N	2026-01-07 20:37:58.67	\N	\N	To'lov
dc72a49d-6df9-41e8-a9d6-1295b124f910	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	90000	cash	\N	2026-01-09 20:37:58.674	\N	\N	To'lov
ce32b05b-b7e5-4229-84bc-46f325bf8ea8	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	232400	bank	\N	2026-01-10 20:37:58.677	\N	\N	To'lov
c205a94e-8f9e-46a8-b5d6-43b0da8610a3	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	436800	card	\N	2026-01-11 20:37:58.682	\N	\N	To'lov
ea25bc58-1109-49d0-8ed2-b105c44b4ea5	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	712800	cash	\N	2026-01-12 20:37:58.685	\N	\N	To'lov
7a4071de-a9ed-414b-bbab-92130d45b112	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	235200	card	\N	2026-01-13 20:37:58.69	\N	\N	To'lov
069666e1-d18f-40b5-8bd5-1fa0fe53fe36	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	435400	cash	\N	2026-01-14 20:37:58.694	\N	\N	To'lov
d4e2d92f-d2a9-4c14-a0de-932b85b92c2e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	707200	bank	\N	2026-01-15 20:37:58.699	\N	\N	To'lov
c9f9da7b-7c3e-4a18-bd49-729da6e36960	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	178200	card	\N	2026-01-16 20:37:58.702	\N	\N	To'lov
0756835e-d78d-4dbb-8606-d09c795e31c6	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	414000	bank	\N	2026-01-18 20:37:58.706	\N	\N	To'lov
bbbf84b7-d3b8-4732-957b-1971839e1a44	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	688800	card	\N	2026-01-19 20:37:58.71	\N	\N	To'lov
4d61440c-45bc-46c0-9b6c-e0050ea71bd8	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	462400	cash	\N	2026-01-20 20:37:58.715	\N	\N	To'lov
f309faf5-a364-4261-964d-2a2e6c78e409	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	813600	bank	\N	2026-01-21 20:37:58.718	\N	\N	To'lov
84e58980-54a1-4315-af82-097312813708	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	991200	cash	\N	2026-01-22 20:37:58.723	\N	\N	To'lov
dfcedede-eeb6-4b5c-ad5d-3674230b372f	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	228200	bank	\N	2026-01-23 20:37:58.727	\N	\N	To'lov
5d0f9fba-9c2c-48a7-bed4-1b645924c069	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	547200	card	\N	2026-01-24 20:37:58.731	\N	\N	To'lov
ff822e49-fe72-48c3-9a6a-0f132ba01f9f	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	966600	cash	\N	2026-01-25 20:37:58.735	\N	\N	To'lov
45c3f13e-061c-4083-970c-adb9459f7bbb	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	577200	card	\N	2026-01-27 20:37:58.74	\N	\N	To'lov
4769bf32-faee-449c-b300-0e35a9bb41fa	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	655200	cash	\N	2026-01-28 20:37:58.743	\N	\N	To'lov
c6a40477-2cb7-490b-b57b-1bf91b533c56	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	945600	bank	\N	2026-01-29 20:37:58.747	\N	\N	To'lov
8fa3128b-28ce-4057-a4e0-4301686611cd	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	1314000	card	\N	2026-01-30 20:37:58.751	\N	\N	To'lov
f505b75b-5eea-4821-a623-852e9d36e66d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	276000	bank	\N	2026-01-31 20:37:58.755	\N	\N	To'lov
7923c2fb-fbab-47b2-bf23-e8e69d28ccd2	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	516600	card	\N	2026-02-01 20:37:58.759	\N	\N	To'lov
2cec321f-f685-41bd-99f0-6c9452abf8ba	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	838400	cash	\N	2026-02-02 20:37:58.763	\N	\N	To'lov
4f45458a-8d8b-4393-9871-08cc781610f3	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	995400	bank	\N	2026-02-03 20:37:58.767	\N	\N	To'lov
29bdf940-ba8e-4875-a5c6-4980f3e7a88d	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	1093200	cash	\N	2026-02-05 20:37:58.775	\N	\N	To'lov
8cd81bb8-b818-4814-8de4-a7c4396aba0d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	1559600	bank	\N	2026-02-06 20:37:58.781	\N	\N	To'lov
fa830368-2306-4f11-abd5-c76aa625f12d	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	273600	card	\N	2026-02-07 20:37:58.786	\N	\N	To'lov
a17442c9-cdbc-4552-80f5-ffdd7a850848	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	644400	cash	\N	2026-02-08 20:37:58.791	\N	\N	To'lov
d5d08e9f-5f51-4ab0-9644-e06130dfed0e	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	360000	card	\N	2026-02-09 20:37:58.799	\N	\N	To'lov
b82aaa40-4245-4303-a40e-9f98a2046331	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	203000	cash	\N	2026-02-10 20:37:58.803	\N	\N	To'lov
e8bce96e-88c0-4641-b635-e8cd12054935	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	416000	bank	\N	2026-02-11 20:37:58.808	\N	\N	To'lov
18f0a683-d1c8-4953-ac00-7dcfdebe013b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	703800	card	\N	2026-02-12 20:37:58.812	\N	\N	To'lov
9ad34b3b-4966-4bd2-89b4-39d2c589cf3c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	138000	bank	\N	2026-02-14 20:37:58.82	\N	\N	To'lov
a2d65a3a-d980-41d8-a48c-3622263f602b	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	344400	card	\N	2026-02-15 20:37:58.825	\N	\N	To'lov
40cf7cc2-92a9-425f-ae15-4fd2bbb7daf5	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	628800	cash	\N	2026-02-16 20:37:58.83	\N	\N	To'lov
a7603db3-5dd5-4a68-b29c-cc0b238dbad6	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	1000800	bank	\N	2026-02-17 20:37:58.835	\N	\N	To'lov
6ae2cfef-ec2e-434a-b21f-a342186f9a26	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	619200	cash	\N	2026-02-18 20:37:58.84	\N	\N	To'lov
0a4beab2-65d2-47f9-a942-ef6798a19c75	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	995400	bank	\N	2026-02-19 20:37:58.844	\N	\N	To'lov
cc388172-a720-45c1-ad20-8d58fc6d170b	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	1475200	card	\N	2026-02-20 20:37:58.848	\N	\N	To'lov
dd4f6bbd-24ec-483e-953b-a04f47bd9c4f	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	322200	cash	\N	2026-02-21 20:37:58.852	\N	\N	To'lov
cb4ed4cc-6313-44a9-b200-171b8979a1fe	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	702000	card	\N	2026-02-23 20:37:58.856	\N	\N	To'lov
b180fcea-0c88-4cd7-84de-75c87d3ab6d8	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	464800	cash	\N	2026-02-24 20:37:58.859	\N	\N	To'lov
aadae48a-f4bd-4be3-8159-7283bdda2553	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	654400	bank	\N	2026-02-25 20:37:58.863	\N	\N	To'lov
8ebc4a7a-87a9-478c-a849-e87eacb1c883	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	957600	card	\N	2026-02-26 20:37:58.867	\N	\N	To'lov
257a4761-83d6-4425-a1c7-a965f7b3882e	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	dafc9765-065a-4a7b-987e-299642d3dc4b	991200	bank	\N	2026-02-27 20:37:58.871	\N	\N	To'lov
cedbef0f-cf19-458f-bf01-f9f4bc992cdb	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	70a187cc-5375-4254-9e3c-4b7c0ea1c60b	172200	card	\N	2026-02-28 20:37:58.874	\N	\N	To'lov
c56ea0a0-50c9-4709-8658-a807bd5551bb	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	bad3b1da-4158-41cd-ac4f-c1550ccc47d5	419200	cash	\N	2026-03-01 20:37:58.877	\N	\N	To'lov
86f3ee3b-1142-446a-8884-be1912a5527f	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	476b7d56-98a3-4107-bee7-f2c0908416ff	750600	bank	\N	2026-03-02 20:37:58.881	\N	\N	To'lov
89cde257-c9d5-4fd8-b44d-1917ed4fab2c	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	3868f60e-2952-4725-a074-0b57752220a5	721200	cash	\N	2026-03-04 20:37:58.887	\N	\N	To'lov
474c59a0-f876-4362-b287-39eaed13ef45	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	3b1a538d-0dfe-42c9-97c0-7eb3b7850139	1103200	bank	\N	2026-03-05 20:37:58.89	\N	\N	To'lov
27a7c0f4-aaaf-4bbc-9d4f-188b8d614d3e	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	569bf392-d510-4e78-b4c8-f580014e1c6a	1585600	card	\N	2026-03-06 20:37:58.895	\N	\N	To'lov
51eed3e8-8d30-48ae-9dc5-3b28fc567b50	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	d6520409-350c-4741-8854-0621e3ec4328	2178000	cash	\N	2026-03-07 20:37:58.898	\N	\N	To'lov
469dd65f-8819-4487-b48e-bc4f5cf1563f	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	a9e55f7f-7396-4f7b-ba3a-aa7a27f088de	180000	card	\N	2026-03-08 20:37:58.903	\N	\N	To'lov
a16fdd51-92fb-4994-80d1-0a6663af1399	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	ac85fd64-67b6-42f1-aa37-1ea9add2f500	348600	cash	\N	2026-03-09 20:37:58.906	\N	\N	To'lov
49ec3aeb-4af2-4bde-a39e-fe8764cfe4e8	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	4e035e75-db70-4000-b6bc-e2df66cee240	582400	bank	\N	2026-03-10 20:37:58.909	\N	\N	To'lov
d28e4834-e1d9-4f34-b133-cc731ae47d7c	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	82aaa0ef-6d5e-469d-8218-866dfa87ab76	347400	card	\N	2026-03-11 20:37:58.913	\N	\N	To'lov
e5ec1ca0-60d9-4f9b-baf3-6990373b3152	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	cad80b67-a04d-4679-88c7-883ac2b04911	565200	bank	\N	2026-03-13 20:37:58.92	\N	\N	To'lov
7f664e2f-e63f-4ea2-8040-98282b913396	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	503b7694-3480-45e9-8116-a469c79d249a	887600	card	\N	2026-03-14 20:37:58.924	\N	\N	To'lov
a6a1b8af-544e-4afc-96ae-d1d30bc0288f	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1213e655-58b1-4fd4-892c-c4a516f307c8	209600	cash	\N	2026-03-15 20:37:58.929	\N	\N	To'lov
db75ff88-ceb2-4fc4-9561-4c62ced97eb7	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	45806072-c97b-42ae-babb-c934f7141ab8	500400	bank	\N	2026-03-16 20:37:58.933	\N	\N	To'lov
120ca78f-88a0-4821-83a7-66f3677b16a7	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ef364e98-dc87-4278-84fc-3cbd6cd3a449	744000	cash	\N	2026-03-17 20:37:58.94	\N	\N	To'lov
30886b25-8ee8-4ac9-b406-f683d1579298	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	362df153-f937-4dfc-a047-e167af652682	539000	bank	\N	2026-03-18 20:37:58.945	\N	\N	To'lov
282735c1-27aa-44a5-bbf9-621f057c54d7	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	7dbe4041-1742-47f3-8bd2-0e932385bd9c	928000	card	\N	2026-03-19 20:37:58.95	\N	\N	To'lov
8a7e1244-14b6-4000-bab4-e9f1dd212d8b	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b5bf2837-4d2a-4c19-8433-c595ce528ed1	1423800	cash	\N	2026-03-20 20:37:58.955	\N	\N	To'lov
31b7a706-7245-43cf-a3d6-a4de5e18d261	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	1d12d9ab-e799-4541-b2bf-c30b8d708a8d	234000	card	\N	2026-03-22 20:37:58.962	\N	\N	To'lov
8769ea91-ee26-446f-9a85-43a42f7ca141	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	73062c7a-dff1-44ad-9a7e-18729e766900	232400	cash	\N	2026-03-23 20:37:58.966	\N	\N	To'lov
9a6c1cbb-4ae1-4ef5-a020-d3246605c606	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	70aa161e-8ee0-4950-afaa-f2e955b6c68f	436800	bank	\N	2026-03-24 20:37:58.97	\N	\N	To'lov
d6133d4f-1315-4e24-8f96-f41cd79976cb	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	5ed3d41f-32f4-4319-9aa7-82753bd72d2d	712800	card	\N	2026-03-25 20:37:58.973	\N	\N	To'lov
8a94b7a8-5b01-4d82-8dd1-0c75c926096d	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	504ad46f-c593-49f3-bfa7-4b1b5c253eeb	715200	bank	\N	2026-03-26 20:37:58.98	\N	\N	To'lov
dc0e0a30-4409-44e5-abf4-c31746d24891	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	a2d3c202-6b97-439e-9ea1-705a8945bcc0	1051400	card	\N	2026-03-27 20:37:58.983	\N	\N	To'lov
31c84010-97d5-4c7b-a740-1ee6559c3e91	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	62ac641f-b3df-43e7-9eb4-6ffe5ee1e9f3	1475200	cash	\N	2026-03-28 20:37:58.986	\N	\N	To'lov
f97e9147-10fa-4a67-b5da-840320845a54	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	b59f04da-f8e4-43f9-8488-cff1a5e1180d	250200	bank	\N	2026-03-29 20:37:58.989	\N	\N	To'lov
799adf11-fbaa-4c5f-b284-b7e76477b7dc	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	db460ec1-c062-4e57-8218-ea2add3a540e	558000	cash	\N	2026-03-31 20:37:58.995	\N	\N	To'lov
4eaac36e-2417-4a97-a0be-8605066e1058	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	7c4ad4a8-daf1-467e-b5ad-2bcf7767727b	688800	bank	\N	2026-04-01 20:37:59	\N	\N	To'lov
f790f2d5-e2e3-4f45-be0b-e374b82bd27b	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	6a2533c3-a935-40eb-a7c3-a3bb45eb152d	974400	card	\N	2026-04-02 20:37:59.003	\N	\N	To'lov
26d9c321-04b1-4fcc-b58e-e18b596a4fb2	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	0edc83d9-aaed-446e-9206-bb6ebaefd489	1389600	cash	\N	2026-04-03 20:37:59.007	\N	\N	To'lov
2f7063f5-0dee-4da7-80ec-677a06dfa2d5	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	c6d766ef-6c99-4763-b225-a853cdee1b71	223200	card	\N	2026-04-04 20:37:59.014	\N	\N	To'lov
4e6261d8-c5dd-4f26-b095-e9c4396d39e4	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	f48b30c0-e349-4ea0-9f74-c738acc90712	60200	cash	\N	2026-04-05 20:37:59.019	\N	\N	To'lov
e16fcacd-e347-4949-b4dc-927bf9eedeb8	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	5a1eb044-89d2-403f-ab0c-010ee51e8091	163200	bank	\N	2026-04-06 20:37:59.022	\N	\N	To'lov
67bc7062-25c2-4734-be95-564efaa5896c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	678981d1-9c26-4b15-a842-9f66b14d4985	318600	card	\N	2026-04-07 20:37:59.025	\N	\N	To'lov
1c243bc8-0959-489b-a48d-f76eafdb776c	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	901851a8-14d0-40f1-a4ed-e7c0bac85e71	241200	bank	\N	2026-04-09 20:37:59.032	\N	\N	To'lov
faee6b85-f7d2-4487-a15f-bad7c85d28f3	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	6dfe2784-51bf-4d6d-a613-a8dede9ba816	431200	card	\N	2026-04-10 20:37:59.034	\N	\N	To'lov
1f03af84-2e32-4539-b7db-22d28d6257f8	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	b05a2a7a-e887-4189-9b84-bffc37cb01af	689600	cash	\N	2026-04-11 20:37:59.039	\N	\N	To'lov
b1877432-76eb-49a7-8fff-234cb0637420	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	ad915ba5-8334-496d-8ee5-9daa01ce57dd	1026000	bank	\N	2026-04-12 20:37:59.042	\N	\N	To'lov
5ee260df-8f81-4c8b-ad98-ba2952539ffd	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	dealer-677fe634-603d-4723-8c85-afff22b41391-1	4500000	cash	\N	2026-04-03 19:00:00.15	\N	\N	Demo payment
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, "companyId", name, sku, description, "costPrice", price, stock, unit, "createdAt", "updatedAt", "deletedAt", "deletedBy", "categoryId", "imageUrl", "isActive", "subcategoryId", "unitId", "discountPrice", "isPromo") FROM stdin;
727295e6-6c2a-415f-9c2c-55d616daf804	2558c501-89df-4695-b56c-fbe600529b21	Samsung Galaxy S24 Ultra	SAM-S24U	\N	8000000	12000000	45	dona	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	136299ef-398d-49a3-a896-1b6f1358ff67	\N	t	\N	\N	\N	f
d83ebc32-798a-4bd0-9eea-65bfdf0f05f3	2558c501-89df-4695-b56c-fbe600529b21	iPhone 15 Pro Max	APP-15PM	\N	10000000	15000000	30	dona	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	136299ef-398d-49a3-a896-1b6f1358ff67	\N	t	\N	\N	\N	f
bcacd7c5-f16f-46b7-a3b2-86b41b6cc0de	2558c501-89df-4695-b56c-fbe600529b21	Xiaomi Redmi Note 13	XIA-RN13	\N	2500000	3800000	120	dona	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	136299ef-398d-49a3-a896-1b6f1358ff67	\N	t	\N	\N	\N	f
39ac2546-bbae-49c3-9748-3e77c45f55d1	2558c501-89df-4695-b56c-fbe600529b21	Samsung 55" 4K TV	SAM-TV55	\N	5500000	8000000	15	dona	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	136299ef-398d-49a3-a896-1b6f1358ff67	\N	t	\N	\N	\N	f
c79ec824-1f07-40ef-94f0-984b15da0f85	2558c501-89df-4695-b56c-fbe600529b21	Ariel Pods 30 ta	ARI-POD30	\N	45000	65000	500	quti	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	aeface47-ef4e-44ef-b79d-6abfc8293e27	\N	t	\N	\N	\N	f
3c41c5ca-fab2-4b59-96e3-307964f01f12	2558c501-89df-4695-b56c-fbe600529b21	Tide 3kg	TID-3KG	\N	55000	80000	350	paket	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	aeface47-ef4e-44ef-b79d-6abfc8293e27	\N	t	\N	\N	\N	f
25789aac-674b-41a0-932b-4bfeaf15a1fc	2558c501-89df-4695-b56c-fbe600529b21	Domestos 750ml	DOM-750	\N	18000	28000	800	shisha	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	aeface47-ef4e-44ef-b79d-6abfc8293e27	\N	t	\N	\N	\N	f
4c13e202-4250-494e-a7ec-466834b002e2	2558c501-89df-4695-b56c-fbe600529b21	Nescafe Classic 200g	NES-200G	\N	42000	62000	250	quti	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	ba94a06a-7c18-4c9c-bf48-3fd5974d53ae	\N	t	\N	\N	\N	f
6ea27cfe-d78f-4b78-96c6-b2cc6139c930	2558c501-89df-4695-b56c-fbe600529b21	Lay's 160g Assorted	LAY-160	\N	12000	18000	600	dona	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	ba94a06a-7c18-4c9c-bf48-3fd5974d53ae	\N	t	\N	\N	\N	f
85b8d292-dfb9-4273-9620-1adab5224e96	2558c501-89df-4695-b56c-fbe600529b21	Coca-Cola 1.5L	CCA-1.5L	\N	8000	13000	1200	shisha	2026-03-28 18:21:44.633	2026-03-28 18:21:44.633	\N	\N	ba94a06a-7c18-4c9c-bf48-3fd5974d53ae	\N	t	\N	\N	\N	f
37ee59fd-bb25-43c7-8e51-d0ca8f4593cb	372dcf39-46c6-4fef-a349-808c82dc8d8a	KreazyMax	\N	Ajoyib muzqaymoq	400	500	1000	dona	2026-03-29 09:42:12.205	2026-03-29 09:52:49.222	\N	\N	9caad36e-f91c-4af8-924e-42540dcfe0c3	/uploads/8be7ea24-ce7f-465c-9663-4cd807244dac.jpg	t	c63adc41-0bf3-4b66-be2b-32e336af9266	ab5c9bd4-8333-4134-a5ed-60d54e62eceb	\N	f
083e0980-ef76-4b55-9984-7687fd62c047	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 1	TEST-0001	\N	9000	15000	20	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
c3ef2e06-a1cf-46c8-9b8d-1d907027f5f2	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 2	TEST-0002	\N	14000	23000	23	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3d14bc97-06e2-43b7-8976-7cac73e31c93	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 3	TEST-0003	\N	19000	31000	26	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f22db48b-a300-457b-a5c1-861f85086d4c	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 4	TEST-0004	\N	24000	39000	29	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
2fbbc8a7-5d80-4027-90bf-592038d03dce	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 5	TEST-0005	\N	29000	47000	32	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
8a7cad1c-2393-466d-8206-73092b9c771f	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 6	TEST-0006	\N	34000	55000	35	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
2e3fd8cb-b7fa-42d4-b917-09b40ed15d73	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 7	TEST-0007	\N	39000	63000	38	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
7f1e5b9f-dccf-4291-97f8-e1a6141e7587	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 8	TEST-0008	\N	44000	71000	41	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a2c21b37-562d-4f08-9706-0cd9665abc2a	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 9	TEST-0009	\N	49000	79000	44	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
0736c191-d62b-4fae-ab89-600f86bd1574	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 10	TEST-0010	\N	54000	87000	47	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
7cb93dea-a617-4a46-8e70-eb9bb3662310	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 11	TEST-0011	\N	59000	95000	50	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
2cfb68ee-4fcd-492a-a10e-06bcb5e1b1b9	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 12	TEST-0012	\N	64000	103000	53	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
e71e737e-f2d3-4980-866c-0224dac39cc7	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 13	TEST-0013	\N	69000	111000	56	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
dda131a0-5270-44f5-a47e-5ced8f8544c1	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 14	TEST-0014	\N	74000	119000	59	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3107f9a6-5f69-471b-82fc-efb24acb6c6f	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 15	TEST-0015	\N	79000	127000	62	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
c1fd16d4-acc8-4479-89e7-311714c6ff46	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 16	TEST-0016	\N	84000	135000	65	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
580bb021-7cb0-4fae-8ecd-459290bfc019	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 17	TEST-0017	\N	89000	143000	68	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3617506e-45b9-4ae5-b5b8-95e49604b231	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 18	TEST-0018	\N	94000	151000	71	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a0c6e78d-be69-4ffd-b323-10c67dea8c48	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 19	TEST-0019	\N	99000	159000	74	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
abb1c752-bcbf-48fb-a108-426a7c9cbe57	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 20	TEST-0020	\N	104000	167000	77	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
0a9126c0-c935-4b61-9531-969d13072044	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 21	TEST-0021	\N	109000	175000	80	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
d518f072-fcf5-422c-89a1-33108afd4656	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 22	TEST-0022	\N	114000	183000	83	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
92aec405-fede-4789-ac9d-9a4901c5d055	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 23	TEST-0023	\N	119000	191000	86	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
bf78405f-3f88-4b6b-9f85-6f6da9952288	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 24	TEST-0024	\N	124000	199000	89	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
96bf0ea0-28ab-47b4-a61d-2e7be9618e9d	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 25	TEST-0025	\N	129000	207000	92	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
d457976e-5faf-45b3-8767-c93882827e1f	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 26	TEST-0026	\N	9000	215000	95	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
51e9021c-8a76-4dd0-880a-dad7d026f373	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 27	TEST-0027	\N	14000	223000	98	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
efbf1052-c2c2-4cc3-86a1-231500a6dfdc	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 28	TEST-0028	\N	19000	231000	101	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
dcf7f626-dcb7-4454-abcf-02a8036697ff	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 29	TEST-0029	\N	24000	239000	104	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
c0961f57-5bf4-41fb-9c57-bcb5b2234102	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 30	TEST-0030	\N	29000	247000	107	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
dcc1f158-ba92-4fd8-84e1-fcb05205988a	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 31	TEST-0031	\N	34000	15000	110	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
e69b5dbf-8c1e-4a64-acf8-525c5a75e428	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 32	TEST-0032	\N	39000	23000	113	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
5156b1f6-47da-47f2-bc86-c631344fa119	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 33	TEST-0033	\N	44000	31000	116	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
8a81236c-fd7e-4d88-aea5-7a6af0d4fb72	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 34	TEST-0034	\N	49000	39000	119	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
b7e49c05-2750-4dc5-bed2-34e9a5852b6d	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 35	TEST-0035	\N	54000	47000	122	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
9bddfa35-565c-45e3-aa40-75301b165ee1	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 36	TEST-0036	\N	59000	55000	125	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
93d44406-c84a-4622-8d6f-aae9c724a827	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 37	TEST-0037	\N	64000	63000	128	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
5cfae025-87f4-42c9-ad54-42a245b252d2	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 38	TEST-0038	\N	69000	71000	131	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
5ff42161-5799-41fd-9bbc-cc62904ce974	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 39	TEST-0039	\N	74000	79000	134	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
5d9f5760-23c9-4c73-b7ee-cd907fc71730	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 40	TEST-0040	\N	79000	87000	137	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
780a65d0-2d3a-48cd-a4a5-3e3689e1879e	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 41	TEST-0041	\N	84000	95000	140	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
f9b4adf6-4a42-4fe1-b890-d44d5699f8d5	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 42	TEST-0042	\N	89000	103000	143	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
1faa7ac5-b969-48ad-8392-371b97f83235	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 43	TEST-0043	\N	94000	111000	146	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
02e3b166-d99b-4e3e-8ab1-9a486493793c	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 44	TEST-0044	\N	99000	119000	149	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
5a9677ea-387e-475c-8728-ee24f7e6333a	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 45	TEST-0045	\N	104000	127000	152	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
e14c9ae2-1c54-42e8-a4e1-9b7360c95bd2	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 46	TEST-0046	\N	109000	135000	155	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
b404f8ec-1d81-49fc-81c2-fb187a526987	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 47	TEST-0047	\N	114000	143000	158	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
aec27ec5-8535-4b60-a0af-d44a3cefda6b	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 48	TEST-0048	\N	119000	151000	161	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a012992e-ebe6-4d91-b5ad-6531acd42b60	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 49	TEST-0049	\N	124000	159000	164	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
2efcbe5d-6dde-45c2-b772-3e6eb86b0ef9	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 50	TEST-0050	\N	129000	167000	167	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
b0fb3ee1-6d8e-486e-8fa9-f5858213cf3c	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 51	TEST-0051	\N	9000	175000	170	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
58e36f86-5676-4784-84a3-7eb593885c4d	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 52	TEST-0052	\N	14000	183000	173	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
196e8df5-4b2b-4783-b3f7-d16dd4d8f4e4	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 53	TEST-0053	\N	19000	191000	176	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
8aeb8d19-036a-473b-982c-f2ce0f96e17c	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 54	TEST-0054	\N	24000	199000	179	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
1c7ca51e-63b6-456e-b128-ec3297f79d27	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 55	TEST-0055	\N	29000	207000	182	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3809c0bb-c297-4c53-a026-e1b30beb57b7	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 56	TEST-0056	\N	34000	215000	185	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
73d4bd51-6f96-4926-827d-4e941227a526	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 57	TEST-0057	\N	39000	223000	188	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
5d166591-169f-48a4-86d6-1260a1204697	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 58	TEST-0058	\N	44000	231000	191	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
7c9ed4f2-4784-44a9-a4ec-ed63367bf6b4	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 59	TEST-0059	\N	49000	239000	194	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
19bc05e4-b5d0-45d7-aff9-f91c1a43077e	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 60	TEST-0060	\N	54000	247000	197	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
4b2b95c0-cb71-4dbe-ac8a-6a14c85553c7	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 61	TEST-0061	\N	59000	15000	200	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
80a48d57-ff5b-46fe-a0e9-6a2d26503d83	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 62	TEST-0062	\N	64000	23000	203	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
1ca217e1-d5db-48bd-a19b-bdd4540ff7cd	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 63	TEST-0063	\N	69000	31000	206	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f25eff91-4569-4c36-900b-1b8e0c75d567	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 64	TEST-0064	\N	74000	39000	209	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
baf2dda1-4d32-4e68-b49c-79df607a69e2	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 65	TEST-0065	\N	79000	47000	212	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
c1b04289-23e6-43a2-abd3-9e4dea701c48	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 66	TEST-0066	\N	84000	55000	215	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a9584e43-6bd3-49ee-b364-53d7ea058bc9	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 67	TEST-0067	\N	89000	63000	218	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
eb411ff9-a4e5-4978-a09b-bd32ae7c56ed	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 68	TEST-0068	\N	94000	71000	221	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
66545519-05ad-4f45-a31a-8c524b69d595	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 69	TEST-0069	\N	99000	79000	224	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f27a0267-a93a-4c0b-a87e-0f809a3a0f55	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 70	TEST-0070	\N	104000	87000	227	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
b3b8e141-375f-4340-9b38-c61ad4de47a2	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 71	TEST-0071	\N	109000	95000	230	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
94c9bc43-5530-4f1a-9a2f-08c2fe2af05f	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 72	TEST-0072	\N	114000	103000	233	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a0cd7382-d275-4063-b946-aa00ee14f1b8	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 73	TEST-0073	\N	119000	111000	236	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
9d7074f2-c558-4968-a894-6b8db7d1c055	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 74	TEST-0074	\N	124000	119000	239	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
c6842687-bc36-4db4-b2ed-31122b20d47f	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 75	TEST-0075	\N	129000	127000	242	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
c7925f7e-d793-493a-923c-fa568af3028a	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 76	TEST-0076	\N	9000	135000	245	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
e6082d8b-7560-4009-822c-1e49ba970065	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 77	TEST-0077	\N	14000	143000	248	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
31b12021-3f65-4553-b45e-eed1203923a8	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 78	TEST-0078	\N	19000	151000	251	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3c47dc30-0d3d-44b1-9436-e513035f9ff8	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 79	TEST-0079	\N	24000	159000	254	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
602224e1-00ed-4e25-84c5-b89b28eb344d	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 80	TEST-0080	\N	29000	167000	257	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
de98bafe-4b00-4a27-ab5a-362af2b79081	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 81	TEST-0081	\N	34000	175000	20	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
41b4689d-89f3-4084-929b-f905749ed883	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 82	TEST-0082	\N	39000	183000	23	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a6a8f84d-6753-4863-976c-dcadfac10a6f	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 83	TEST-0083	\N	44000	191000	26	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
2585dc8d-6cb9-421a-9777-43eb4d84dea7	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 84	TEST-0084	\N	49000	199000	29	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f2aae172-a8f6-477d-8dd4-3e24851f0840	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 85	TEST-0085	\N	54000	207000	32	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
d68c2c89-925b-496c-8789-105c0d7fde17	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 86	TEST-0086	\N	59000	215000	35	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
90745b2f-1ccd-48f0-9a32-cdc0654cb5c0	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 87	TEST-0087	\N	64000	223000	38	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3817624d-c5ef-448a-9a1a-b7debbe79f18	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 88	TEST-0088	\N	69000	231000	41	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f7273cd1-2de4-47d8-be9e-44d14d042262	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 89	TEST-0089	\N	74000	239000	44	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f92e8e36-cd56-489c-8004-894ef7b91e48	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 90	TEST-0090	\N	79000	247000	47	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
69e2e698-c5c4-47d1-8afb-f2325808e30b	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 91	TEST-0091	\N	84000	15000	50	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	t
9dbfaa95-0d66-42b3-a3ed-28c2056ec0af	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 92	TEST-0092	\N	89000	23000	53	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
8d142f47-3d11-4b19-b1af-bf4938566599	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 93	TEST-0093	\N	94000	31000	56	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
a27d8322-3c93-49b2-8537-2786d00d0498	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 94	TEST-0094	\N	99000	39000	59	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
9a54b294-d881-42a0-84ce-8936e7c04f6e	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 95	TEST-0095	\N	104000	47000	62	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
3fd14b4c-9163-4dfb-be45-18c5f3ac02f0	33930263-cce8-4ffb-9b22-07ff6b07a268	Elektronika mahsulot 96	TEST-0096	\N	109000	55000	65	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
0e6167a9-c89d-4f73-aad1-3e49bdb7a4fe	33930263-cce8-4ffb-9b22-07ff6b07a268	Oziq-ovqat mahsulot 97	TEST-0097	\N	114000	63000	68	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
c4fe027b-bd26-474c-8a3a-5623df3deeb3	33930263-cce8-4ffb-9b22-07ff6b07a268	Kiyim mahsulot 98	TEST-0098	\N	119000	71000	71	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
66d94936-85d5-4eb8-9c9f-8dc4e59e1c76	33930263-cce8-4ffb-9b22-07ff6b07a268	Maishiy texnika mahsulot 99	TEST-0099	\N	124000	79000	74	pcs	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
cd0327d9-ab0e-4351-8f1e-da0d93e47fdf	33930263-cce8-4ffb-9b22-07ff6b07a268	Sport mahsulot 100	TEST-0100	\N	129000	87000	77	box	2026-04-12 17:37:58.212	2026-04-12 17:37:58.212	\N	\N	\N	\N	t	\N	\N	\N	f
f85fb2c0-067f-4ea7-b6cc-9b2de51314e0	677fe634-603d-4723-8c85-afff22b41391	Premium Box Set	PBS-001	\N	180000	250000	150	box	2026-04-12 19:00:00.141	2026-04-12 19:00:00.141	\N	\N	\N	\N	t	\N	\N	\N	f
da4872e3-5f1d-47f5-af48-ebcdcc74c970	677fe634-603d-4723-8c85-afff22b41391	Standard Pack	SP-002	\N	30000	45000	2000	pcs	2026-04-12 19:00:00.141	2026-04-12 19:00:00.141	\N	\N	\N	\N	t	\N	\N	\N	f
35ef663b-72a6-4e21-b93b-e1538efede1f	677fe634-603d-4723-8c85-afff22b41391	Industrial Set	IS-003	\N	950000	1200000	45	set	2026-04-12 19:00:00.141	2026-04-12 19:00:00.141	\N	\N	\N	\N	t	\N	\N	\N	t
09c2afd3-524b-4fa8-9b77-2da4009e1958	677fe634-603d-4723-8c85-afff22b41391	Mini Sample	MS-004	\N	8000	12000	5000	pcs	2026-04-12 19:00:00.141	2026-04-12 19:00:00.141	\N	\N	\N	\N	t	\N	\N	\N	f
47f5ad50-23af-496a-9b00-b39955e9bdef	677fe634-603d-4723-8c85-afff22b41391	Bulk Container	BC-005	\N	2800000	3500000	12	cnt	2026-04-12 19:00:00.141	2026-04-12 19:00:00.141	\N	\N	\N	\N	t	\N	\N	\N	f
\.


--
-- Data for Name: ReleaseNote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReleaseNote" (id, version, title, content, "createdAt") FROM stdin;
\.


--
-- Data for Name: ServerMetric; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ServerMetric" (id, "cpuUsage", "ramUsage", "activeUsers", "timestamp") FROM stdin;
\.


--
-- Data for Name: Subcategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subcategory" (id, "companyId", "categoryId", name, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
c63adc41-0bf3-4b66-be2b-32e336af9266	372dcf39-46c6-4fef-a349-808c82dc8d8a	9caad36e-f91c-4af8-924e-42540dcfe0c3	Muzqaymoqlar	2026-03-29 09:41:24.013	2026-03-29 09:41:24.013	\N	\N
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, "companyId", plan, status, amount, "expiresAt", "createdAt") FROM stdin;
07e91e1a-f867-465f-afaf-e0abc40b031d	372dcf39-46c6-4fef-a349-808c82dc8d8a	PREMIUM	ACTIVE	0	2026-04-27 19:43:42.769	2026-03-28 19:43:42.775
\.


--
-- Data for Name: SupportMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportMessage" (id, "ticketId", "senderId", "senderType", message, "createdAt") FROM stdin;
c2eead5f-fe23-4f66-b025-0ceb9946ff6e	a011f57d-20ee-4b9d-91eb-65c9c545112c	\N	DISTRIBUTOR	Ajoyib	2026-04-12 17:49:08.926
2d69b4f3-5865-4369-89fc-3c2253afdee5	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	a	2026-04-12 17:50:45.081
22bdb8c9-6c2e-4d0a-b3d0-c29404bceb1c	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	haaaa 	2026-04-12 18:11:08.803
a42d553e-a09f-4d9d-bfe0-840d1cb97660	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	 	2026-04-12 18:14:13.487
289a624a-04b5-4f13-ae88-4e41d5cc8947	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	a	2026-04-12 18:14:23.233
f6b204cd-dc32-488f-8bd8-c7325b75485e	a011f57d-20ee-4b9d-91eb-65c9c545112c	6cb09fb1-1ca2-4ec1-8997-4e55140ba6bc	SUPER_ADMIN	A	2026-04-12 18:32:43.014
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportTicket" (id, "companyId", subject, message, status, "lastReplyAt", "createdAt", "updatedAt") FROM stdin;
a011f57d-20ee-4b9d-91eb-65c9c545112c	33930263-cce8-4ffb-9b22-07ff6b07a268	Ajoyib	Ajoyib	IN_PROGRESS	2026-04-12 18:32:43.025	2026-04-12 17:49:08.926	2026-04-12 18:32:43.026
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSettings" (id, "maintenanceMode", "backupFrequency", "lastBackupAt", "defaultTrialDays", "newsEnabled", "superAdminPhone", "systemVersion", "globalNotifyUz", "globalNotifyRu", "globalNotifyEn", "globalNotifyTr", "updatedAt", "termsUz", "termsRu", "termsEn", "termsUzCyr", "privacyUz", "privacyRu", "privacyEn", "privacyUzCyr") FROM stdin;
GLOBAL	f	DAILY	2026-03-29 20:00:03.592	14	t	+998200116877	1.0.0	\N	\N	\N	\N	2026-04-12 18:35:52.462	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: TariffPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TariffPlan" (id, "order", "nameUz", "nameRu", "nameEn", "nameTr", "nameUzCyr", price, "featuresUz", "featuresRu", "featuresEn", "featuresTr", "featuresUzCyr", "isPopular", "isActive", "createdAt", "updatedAt", "allowAnalytics", "allowBulkImport", "allowCustomBot", "allowMultiCompany", "allowNotifications", "allowWebStore", "maxBranches", "maxDealers", "maxProducts", "maxUsers", "planKey", "priceMonthly", "priceYearly", "trialDays", "maxCustomBots") FROM stdin;
276b3b8f-9e2a-4d22-9fe2-828ee965a885	1	Boshlang'ich	Стартовый	Starter	Başlangıç	Бошланғич	99,000	["3 ta filial", "10 ta foydalanuvchi", "50 ta dealer", "100 ta mahsulot", "Asosiy hisobotlar", "Telegram orqali buyurtma", "Kredit limitni kuzatish", "Email & chat support"]	["3 филиала", "10 пользователей", "50 дилеров", "100 продуктов", "Базовые отчёты", "Заказы через Telegram", "Контроль кредитных лимитов", "Email & чат-поддержка"]	["3 branches", "10 users", "50 dealers", "100 products", "Basic reports", "Telegram ordering", "Credit limit tracking", "Email & chat support"]	["3 şube", "10 kullanıcı", "50 bayi", "100 ürün", "Temel raporlar", "Telegram ile sipariş", "Kredi limiti takibi", "E-posta & sohbet desteği"]	["3 та филиал", "10 та фойдаланувчи", "50 та дилер", "100 та маҳсулот", "Асосий ҳисоботлар", "Телеграм орқали буюртма", "Кредит лимитини кузатиш", "Email & чат қўллаб-қувватлаш"]	f	t	2026-03-29 16:37:04.182	2026-03-31 17:32:56.132	f	f	f	f	t	t	3	50	100	10	STARTER	99000	0	14	0
16dfe123-b576-4f5b-89e4-5effa76c4759	2	Professional	Professional	Professional	Professional	Professional	249,000	["10 ta filial", "50 ta foydalanuvchi", "Cheksiz dealer", "Cheksiz mahsulot", "Telegram bot (1 ta)", "Ommaviy import", "Kredit nazorat tizimi", "Analitika va hisobotlar"]	["10 филиалов", "50 пользователей", "Безлимит дилеры", "Безлимит продукты", "Telegram бот (1 шт)", "Массовый импорт", "Система контроля кредитов", "Аналитика и отчёты"]	["10 branches", "50 users", "Unlimited dealers", "Unlimited products", "Telegram bot (1)", "Bulk import", "Credit control system", "Analytics & reports"]	["10 şube", "50 kullanıcı", "Sınırsız bayi", "Sınırsız ürün", "Telegram bot (1 adet)", "Toplu import", "Kredi kontrol sistemi", "Analitik & raporlar"]	["10 та филиал", "50 та фойдаланувчи", "Чексиз дилер", "Чексиз маҳсулот", "Telegram бот (1 та)", "Оммавий импорт", "Кредит назорат тизими", "Аналитика ва ҳисоботлар"]	t	t	2026-03-29 16:37:04.194	2026-03-31 17:33:02.903	t	t	t	f	t	t	10	99999	99999	50	PROFESSIONAL	249000	0	14	1
cbacbc37-fed3-4f32-8046-26d99010cd39	3	Biznes	Бизнес	Business	İşletme	Бизнес	399,000	["20 ta filial", "100 ta foydalanuvchi", "Cheksiz dealer", "Cheksiz mahsulot", "5 ta Telegram bot", "Kengaytirilgan CRM", "API kirish", "Ustuvor support"]	["20 филиалов", "100 пользователей", "Безлимит дилеры", "Безлимит продукты", "5 Telegram ботов", "Расширенный CRM", "Доступ к API", "Приоритетная поддержка"]	["20 branches", "100 users", "Unlimited dealers", "Unlimited products", "5 Telegram bots", "Advanced CRM", "API access", "Priority support"]	["20 şube", "100 kullanıcı", "Sınırsız bayi", "Sınırsız ürün", "5 Telegram botu", "Gelişmiş CRM", "API erişimi", "Öncelikli destek"]	["20 та филиал", "100 та фойдаланувчи", "Чексиз дилер", "Чексиз маҳсулот", "5 та Telegram бот", "Кенгайтирилган CRM", "API кириш", "Устувор support"]	f	t	2026-03-29 16:37:04.196	2026-03-31 17:33:30.838	t	t	t	f	t	t	20	99999	99999	100	BUSINESS	399000	0	14	5
2038f650-6a59-4bac-a179-7b495456abe9	4	Enterprise	Корпоративный	Enterprise	Kurumsal	Корпоратив	Muzokaralar asosida	["Filiallar — kelishuv asosida", "Foydalanuvchilar — kelishuv asosida", "Cheksiz Telegram bot", "Ko'p kompaniya boshqaruvi", "Shaxsiy menejer", "API + integratsiyalar", "SLA kafolati", "Ustuvor texnik yordam"]	["Филиалы — по договорённости", "Пользователи — по договорённости", "Безлимит Telegram ботов", "Управление несколькими компаниями", "Персональный менеджер", "API + интеграции", "Гарантия SLA", "Выделенная поддержка"]	["Branches — by agreement", "Users — by agreement", "Unlimited Telegram bots", "Multi-company management", "Dedicated manager", "API + integrations", "SLA guarantee", "Dedicated support"]	["Şubeler — anlaşmaya göre", "Kullanıcılar — anlaşmaya göre", "Sınırsız Telegram botu", "Çoklu şirket yönetimi", "Kişisel yönetici", "API + entegrasyonlar", "SLA garantisi", "Özel teknik destek"]	["Филиаллар — келишув асосида", "Фойдаланувчилар — келишув асосида", "Чексиз Telegram бот", "Кўп компания бошқаруви", "Шахсий менежер", "API + интеграциялар", "SLA кафолати", "Устувор техник ёрдам"]	f	f	2026-03-29 16:37:04.199	2026-03-29 16:59:02.633	t	t	t	t	t	t	99999	99999	99999	99999	ENTERPRISE	Muzokaralar asosida	0	14	99
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Testimonial" (id, name, company, "roleTitle", "contentUz", "contentRu", "contentEn", "contentTr", rating, avatar, "isActive", "order", "createdAt") FROM stdin;
a7de4262-68f2-4b43-af68-dec5d97ccfd0	Bahodir Rahimov	Tashkent Electronics	Owner	Supplio bizning tarqatish tarmog'imizni to'liq avtomatlashtirdi. Endi barcha dilerlarimizni bitta paneldan boshqaramiz.	Supplio полностью автоматизировал нашу дистрибьюторскую сеть. Теперь управляем всеми дилерами из одной панели.	Supplio fully automated our distribution network. We now manage all our dealers from a single panel.	Supplio dağıtım ağımızı tamamen otomatize etti. Artık tüm bayilerimizi tek bir panelden yönetiyoruz.	5	\N	t	0	2026-03-28 18:21:44.608
bc461167-a72e-4942-88cd-be30871ac06e	Nilufar Yusupova	Silk Road Trading	General Manager	Telegram bot orqali dilerlarimiz buyurtma berishi va qarzlarini ko'rishi bizga juda qulaylik yaratdi.	Telegram бот для дилеров и отслеживание долгов значительно упростили нашу работу.	The Telegram bot for dealers and debt tracking greatly simplified our operations.	Bayiler için Telegram botu ve borç takibi iş süreçlerimizi büyük ölçüde kolaylaştırdı.	5	\N	t	1	2026-03-28 18:21:44.611
bcd42bf6-8639-43cb-a241-7167953fd8e2	Sardor Xolmatov	Fergana Optoviy	Sales Director	Analitika sahifasi bizga qaysi mahsulotlar yaxshi sotilayotganini va qaysi dilerlar faolroq ekanini ko'rsatadi.	Раздел аналитики показывает нам, какие продукты продаются лучше и кто из дилеров активнее.	The analytics section shows us which products sell best and which dealers are most active.	Analitik bölümü hangi ürünlerin daha iyi sattığını ve hangi bayilerin daha aktif olduğunu gösteriyor.	5	\N	t	2	2026-03-28 18:21:44.613
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Unit" (id, "companyId", name, symbol, "createdAt", "deletedAt") FROM stdin;
ab5c9bd4-8333-4134-a5ed-60d54e62eceb	\N	Dona	dona	2026-03-29 08:54:28.985	\N
ed0677af-d839-44aa-b373-dedf6d40b743	\N	Kilogramm	kg	2026-03-29 08:54:29	\N
425bd089-f7e2-427c-9af4-3dc607dfa61e	\N	Gramm	g	2026-03-29 08:54:29.003	\N
9d2cc665-9567-4a93-876b-072dca13afee	\N	Litr	l	2026-03-29 08:54:29.006	\N
cd95915b-b404-41c0-9330-2e7162c4a148	\N	Millilitr	ml	2026-03-29 08:54:29.01	\N
7f625769-d7fd-4c84-a9b8-b9957fc5eb70	\N	Metr	m	2026-03-29 08:54:29.014	\N
a7ad2a55-06e3-4467-9686-13f5e9f2f6ed	\N	Santimetr	sm	2026-03-29 08:54:29.017	\N
d12136fa-cb73-41aa-af60-e2f2cb1ac806	\N	Quti	quti	2026-03-29 08:54:29.019	\N
fdffc8b0-1dc1-45fb-8263-37fea3ffc0d1	\N	Paket	paket	2026-03-29 08:54:29.022	\N
\.


--
-- Data for Name: UpgradeRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UpgradeRequest" (id, "companyId", "companyName", "currentPlan", "requestedPlan", "ownerPhone", "ownerName", "dealersCount", "usersCount", "branchesCount", "productsCount", status, note, "createdAt", "updatedAt") FROM stdin;
b289ba19-d4d6-44ee-a1c7-6cad81de951d	372dcf39-46c6-4fef-a349-808c82dc8d8a	Supplio Global System	FREE	\N		\N	0	1	0	0	APPROVED	\N	2026-03-28 18:35:19.253	2026-03-28 18:46:59.881
46ccb97d-25fa-488c-8c62-0941d2271aea	372dcf39-46c6-4fef-a349-808c82dc8d8a	Supplio Global System	FREE	START		\N	0	1	1	0	APPROVED	\N	2026-03-28 19:13:11.673	2026-03-28 19:15:31.471
960d2022-7992-4c9b-9511-e597f84d5372	372dcf39-46c6-4fef-a349-808c82dc8d8a	Supplio System	FREE	PREMIUM		\N	0	1	1	0	APPROVED	\N	2026-03-28 19:35:26.887	2026-03-28 19:43:42.761
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "companyId", "branchId", phone, "passwordHash", "fullName", "photoUrl", "roleType", "customRoleId", "isActive", language, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
6cb09fb1-1ca2-4ec1-8997-4e55140ba6bc	2558c501-89df-4695-b56c-fbe600529b21	\N	+998901112233	$2b$10$WDehggWa14a/EZS4IJEIrelTjcF.Ui/zjJozNX1jKFItZvw/tEUyC	Super Admin	/favicon.png	SUPER_ADMIN	\N	t	uz	2026-03-28 18:21:44.625	2026-03-28 18:21:44.625	\N	\N
3e448462-86e6-4eae-a2c7-3d6a52b2fd96	2558c501-89df-4695-b56c-fbe600529b21	\N	+998901234567	$2b$10$WDehggWa14a/EZS4IJEIrelTjcF.Ui/zjJozNX1jKFItZvw/tEUyC	Aziz Karimov	/favicon.png	OWNER	\N	t	uz	2026-03-28 18:21:44.625	2026-03-28 18:21:44.625	\N	\N
867b4dea-7836-4761-b5e8-ae005f12f926	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	+998907654321	$2b$10$WDehggWa14a/EZS4IJEIrelTjcF.Ui/zjJozNX1jKFItZvw/tEUyC	Dilnoza Umarova	/favicon.png	MANAGER	\N	t	uz	2026-03-28 18:21:44.625	2026-03-28 18:21:44.625	\N	\N
0044ae1f-95de-4137-9bb1-efccd8dbcecb	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	+998909876543	$2b$10$WDehggWa14a/EZS4IJEIrelTjcF.Ui/zjJozNX1jKFItZvw/tEUyC	Bobur Toshmatov	/favicon.png	SALES	\N	t	uz	2026-03-28 18:21:44.625	2026-03-28 18:21:44.625	\N	\N
99cfe604-cdee-4048-a231-32c13319c327	677fe634-603d-4723-8c85-afff22b41391	17c263ab-70a9-4bdd-a67f-d8cb8e330972	+998991112233	$2b$10$WDehggWa14a/EZS4IJEIrelTjcF.Ui/zjJozNX1jKFItZvw/tEUyC	Demo Owner	/favicon.png	OWNER	\N	t	uz	2026-03-28 18:21:44.895	2026-03-28 18:21:44.895	\N	\N
baca4a8f-4f48-4e6e-8136-caa015acf033	49e18d1f-089d-482a-81c8-b11f0c8a067a	\N	+998000000000	$2b$10$Uqd.AQhjOjO5Ja.1ZRrE.ex9j/GaJAXUSJfs1mCCsPcW2brFSLAo2	Demo Distributor	/favicon.png	OWNER	\N	t	uz	2026-03-28 19:58:28.472	2026-03-28 20:01:20.312	\N	\N
abf2f3b6-8458-419c-b7cf-37d134674bf8	372dcf39-46c6-4fef-a349-808c82dc8d8a	\N	+998917505060	$2b$10$DsHEYUIodBcseSi9TmPHHeaJKP41c3PqqlV161TZE/cKhiZd1FlGK	Saidqodirxon	/favicon.png	SUPER_ADMIN	\N	t	uz	2026-03-28 18:22:04.302	2026-03-29 16:57:17.558	\N	\N
d3907b0a-7d0e-451e-92e0-2904dd94b92c	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	+998901000101	$2b$10$tZBkDlWmyp.6hn11viKcDe7ke6d/MpUfts0rWXvTQIw/4ci7BObrq	Xodim 1	/favicon.png	MANAGER	\N	t	uz	2026-04-12 17:37:58.202	2026-04-12 17:37:58.202	\N	\N
9ea3c749-d660-4b7a-8d70-a65c3e22ee1d	33930263-cce8-4ffb-9b22-07ff6b07a268	3c5ad1b5-8047-486b-ba82-f25d8ef0fa1d	+998901000102	$2b$10$tZBkDlWmyp.6hn11viKcDe7ke6d/MpUfts0rWXvTQIw/4ci7BObrq	Xodim 2	/favicon.png	MANAGER	\N	t	uz	2026-04-12 17:37:58.204	2026-04-12 17:37:58.204	\N	\N
dc896429-2b7e-4f48-8ca3-f173b25c98d0	33930263-cce8-4ffb-9b22-07ff6b07a268	f6736eff-d631-4f50-86f6-ad3187d95ecf	+998901000103	$2b$10$tZBkDlWmyp.6hn11viKcDe7ke6d/MpUfts0rWXvTQIw/4ci7BObrq	Xodim 3	/favicon.png	SALES	\N	t	uz	2026-04-12 17:37:58.205	2026-04-12 17:37:58.205	\N	\N
200d2c30-b90b-4421-8217-e1fc5488e96c	33930263-cce8-4ffb-9b22-07ff6b07a268	fcecf24d-f041-4838-95da-549726630e12	+998901000104	$2b$10$tZBkDlWmyp.6hn11viKcDe7ke6d/MpUfts0rWXvTQIw/4ci7BObrq	Xodim 4	/favicon.png	SALES	\N	t	uz	2026-04-12 17:37:58.207	2026-04-12 17:37:58.207	\N	\N
6ad1c8d6-b10d-47a1-8b88-c7a39284bd15	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	+998901000105	$2b$10$tZBkDlWmyp.6hn11viKcDe7ke6d/MpUfts0rWXvTQIw/4ci7BObrq	Xodim 5	/favicon.png	SALES	\N	t	uz	2026-04-12 17:37:58.208	2026-04-12 17:37:58.208	\N	\N
9e8748b4-d2a2-42f3-8f1c-790ce36321db	33930263-cce8-4ffb-9b22-07ff6b07a268	e23a801b-22e3-4e63-8aa9-7c91855ab84b	+998901112234	$2b$10$tZBkDlWmyp.6hn11viKcDe7ke6d/MpUfts0rWXvTQIw/4ci7BObrq	Saidqodirxon	/uploads/ac89b7b1-ded7-44e1-8195-e70e9fccd86e.jpg	OWNER	\N	t	uz	2026-04-12 17:37:58.198	2026-04-12 17:46:34.893	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fefc7e15-0f4a-4767-87df-cf02d3b9138a	068556d1c071927f75edf767ee85537d833d2495f7018b3ee30ab816c8e5ecaa	2026-03-29 14:08:48.752519+05	202603280001_add_max_custom_bots		\N	2026-03-29 14:08:48.752519+05	0
dfb1e539-f7ac-4d65-ac1a-788c995f673f	ae02c46d2bf97db2987191ef9d4b7be66a8b5e1ef7ecdce6a4b6fb21e2c71bf6	\N	20260303143021_add_db_connection_url	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260303143021_add_db_connection_url\n\nDatabase error code: 42710\n\nDatabase error:\nОШИБКА: тип "RoleType" уже существует\n\nDbError { severity: "ОШИБКА", parsed_severity: Some(Error), code: SqlState(E42710), message: "тип \\"RoleType\\" уже существует", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1213), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260303143021_add_db_connection_url"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260303143021_add_db_connection_url"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226	2026-03-30 02:39:30.921906+05	2026-03-30 02:39:05.17201+05	0
448c28a6-50c8-4fa9-8206-a1d2c87523de	ae02c46d2bf97db2987191ef9d4b7be66a8b5e1ef7ecdce6a4b6fb21e2c71bf6	\N	20260303143021_add_db_connection_url	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260303143021_add_db_connection_url\n\nDatabase error code: 42710\n\nDatabase error:\nОШИБКА: тип "RoleType" уже существует\n\nDbError { severity: "ОШИБКА", parsed_severity: Some(Error), code: SqlState(E42710), message: "тип \\"RoleType\\" уже существует", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1213), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260303143021_add_db_connection_url"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260303143021_add_db_connection_url"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226	2026-03-30 02:39:46.826588+05	2026-03-30 02:39:37.791471+05	0
c30d6b85-3012-4748-92e8-57ca62577adb	ae02c46d2bf97db2987191ef9d4b7be66a8b5e1ef7ecdce6a4b6fb21e2c71bf6	2026-03-30 02:39:46.838243+05	20260303143021_add_db_connection_url		\N	2026-03-30 02:39:46.838243+05	0
d009504e-8b52-4b97-8527-8ed385b611ab	872341019fdc18f212b22a6fe814a5241f259ab4ab21e25150c6b20fa714b6e4	\N	20260322000001_add_seller_role_dealer_approval	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260322000001_add_seller_role_dealer_approval\n\nDatabase error code: 42710\n\nDatabase error:\nОШИБКА: метка перечисления "SELLER" уже существует\n\nDbError { severity: "ОШИБКА", parsed_severity: Some(Error), code: SqlState(E42710), message: "метка перечисления \\"SELLER\\" уже существует", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("pg_enum.c"), line: Some(351), routine: Some("AddEnumLabel") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260322000001_add_seller_role_dealer_approval"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260322000001_add_seller_role_dealer_approval"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226	2026-04-12 21:47:07.572354+05	2026-04-12 21:46:54.060861+05	0
2d1a3fcd-9581-4a47-a790-94962d84dce7	872341019fdc18f212b22a6fe814a5241f259ab4ab21e25150c6b20fa714b6e4	2026-04-12 21:47:07.582906+05	20260322000001_add_seller_role_dealer_approval		\N	2026-04-12 21:47:07.582906+05	0
0339037f-800b-4793-8d7d-235eb176f1a0	32bca86742c6178490e97f18fe69b36a8257f922d47d1f87ccb9bb9a3415069a	2026-04-12 21:47:18.393522+05	20260322000002_add_block_promo_cashback	\N	\N	2026-04-12 21:47:18.382892+05	1
33868577-d653-4b4d-9a86-3ed6978eac5b	fb0df003843bac7eb9ffbcd6cfe4c733eeb831e05b24527561a33e735c0c2472	2026-04-12 21:47:31.873829+05	202603300002_landing_contact_links	\N	\N	2026-04-12 21:47:31.857656+05	1
1c904c5e-9db2-455f-a1ca-44912f1dbad7	dd956aa96797253af299426f0ec2498fe938b847ac22b9a7b842792c68fcc9d9	\N	202603300001_news_viewcount	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 202603300001_news_viewcount\n\nDatabase error code: 42701\n\nDatabase error:\nОШИБКА: столбец "viewCount" отношения "News" уже существует\n\nDbError { severity: "ОШИБКА", parsed_severity: Some(Error), code: SqlState(E42701), message: "столбец \\"viewCount\\" отношения \\"News\\" уже существует", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7689), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="202603300001_news_viewcount"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="202603300001_news_viewcount"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226	2026-04-12 21:47:29.708281+05	2026-04-12 21:47:18.401671+05	0
36f52520-e632-4265-81f8-8ff36421f262	dd956aa96797253af299426f0ec2498fe938b847ac22b9a7b842792c68fcc9d9	2026-04-12 21:47:29.710472+05	202603300001_news_viewcount		\N	2026-04-12 21:47:29.710472+05	0
8feb5151-b734-4fff-bcc7-661ea3d64a22	0acb0b2d3368f5bc68f029b5e3d0f5f84da8884e0241084bf92a98887f8a82a2	2026-04-12 21:47:31.884309+05	202603300003_landing_social_instagram	\N	\N	2026-04-12 21:47:31.881516+05	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: CustomBot CustomBot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomBot"
    ADD CONSTRAINT "CustomBot_pkey" PRIMARY KEY (id);


--
-- Name: CustomRole CustomRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomRole"
    ADD CONSTRAINT "CustomRole_pkey" PRIMARY KEY (id);


--
-- Name: DealerApprovalRequest DealerApprovalRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerApprovalRequest"
    ADD CONSTRAINT "DealerApprovalRequest_pkey" PRIMARY KEY (id);


--
-- Name: Dealer Dealer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: FeatureFlag FeatureFlag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FeatureFlag"
    ADD CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY (id);


--
-- Name: LandingContent LandingContent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LandingContent"
    ADD CONSTRAINT "LandingContent_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: LedgerTransaction LedgerTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerTransaction"
    ADD CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY (id);


--
-- Name: News News_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_pkey" PRIMARY KEY (id);


--
-- Name: NotificationLog NotificationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_pkey" PRIMARY KEY (id);


--
-- Name: NotificationTemplate NotificationTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationTemplate"
    ADD CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: ReleaseNote ReleaseNote_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReleaseNote"
    ADD CONSTRAINT "ReleaseNote_pkey" PRIMARY KEY (id);


--
-- Name: ServerMetric ServerMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServerMetric"
    ADD CONSTRAINT "ServerMetric_pkey" PRIMARY KEY (id);


--
-- Name: Subcategory Subcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subcategory"
    ADD CONSTRAINT "Subcategory_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: SupportMessage SupportMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: TariffPlan TariffPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TariffPlan"
    ADD CONSTRAINT "TariffPlan_pkey" PRIMARY KEY (id);


--
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- Name: Unit Unit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_pkey" PRIMARY KEY (id);


--
-- Name: UpgradeRequest UpgradeRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UpgradeRequest"
    ADD CONSTRAINT "UpgradeRequest_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Company_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Company_slug_key" ON public."Company" USING btree (slug);


--
-- Name: CustomBot_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CustomBot_token_key" ON public."CustomBot" USING btree (token);


--
-- Name: Dealer_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Dealer_phone_key" ON public."Dealer" USING btree (phone);


--
-- Name: FeatureFlag_featureKey_companyId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FeatureFlag_featureKey_companyId_key" ON public."FeatureFlag" USING btree ("featureKey", "companyId");


--
-- Name: News_slugEn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "News_slugEn_key" ON public."News" USING btree ("slugEn");


--
-- Name: News_slugRu_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "News_slugRu_key" ON public."News" USING btree ("slugRu");


--
-- Name: News_slugTr_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "News_slugTr_key" ON public."News" USING btree ("slugTr");


--
-- Name: News_slugUzCyr_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "News_slugUzCyr_key" ON public."News" USING btree ("slugUzCyr");


--
-- Name: News_slugUz_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "News_slugUz_key" ON public."News" USING btree ("slugUz");


--
-- Name: ReleaseNote_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReleaseNote_version_key" ON public."ReleaseNote" USING btree (version);


--
-- Name: TariffPlan_planKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TariffPlan_planKey_key" ON public."TariffPlan" USING btree ("planKey");


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Branch Branch_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Category Category_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomBot CustomBot_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomBot"
    ADD CONSTRAINT "CustomBot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomRole CustomRole_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomRole"
    ADD CONSTRAINT "CustomRole_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DealerApprovalRequest DealerApprovalRequest_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerApprovalRequest"
    ADD CONSTRAINT "DealerApprovalRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DealerApprovalRequest DealerApprovalRequest_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerApprovalRequest"
    ADD CONSTRAINT "DealerApprovalRequest_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Dealer Dealer_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Dealer Dealer_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expense Expense_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeatureFlag FeatureFlag_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FeatureFlag"
    ADD CONSTRAINT "FeatureFlag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LedgerTransaction LedgerTransaction_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerTransaction"
    ADD CONSTRAINT "LedgerTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LedgerTransaction LedgerTransaction_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerTransaction"
    ADD CONSTRAINT "LedgerTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LedgerTransaction LedgerTransaction_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerTransaction"
    ADD CONSTRAINT "LedgerTransaction_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: News News_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NotificationLog NotificationLog_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: NotificationLog NotificationLog_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NotificationLog NotificationLog_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."NotificationTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NotificationTemplate NotificationTemplate_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationTemplate"
    ADD CONSTRAINT "NotificationTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_receiverDealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_receiverDealerId_fkey" FOREIGN KEY ("receiverDealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_receiverUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_subcategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES public."Subcategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Subcategory Subcategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subcategory"
    ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subcategory Subcategory_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subcategory"
    ADD CONSTRAINT "Subcategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subscription Subscription_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportMessage SupportMessage_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportTicket SupportTicket_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Unit Unit_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UpgradeRequest UpgradeRequest_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UpgradeRequest"
    ADD CONSTRAINT "UpgradeRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_customRoleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES public."CustomRole"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict UeAz2tKCS1BkEDEKNunF8U5KksrDJ4xUi5JSEsGopBXGfcdRJkNgTMCFawWPB1Z

