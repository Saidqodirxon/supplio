--
-- PostgreSQL database dump
--

\restrict 27CjrkPUugefIPcQLgzs7owEmj5duZilRQ6xAanxf9MrdQkOFaxjXLGvCWSWYFa

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

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


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
    "cashbackPercent" double precision DEFAULT 0 NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    "trialDays" integer DEFAULT 14 NOT NULL
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
20672623-c98e-4b1e-8f58-a7d6273e5a74	26a74d18-e098-417d-82c9-844d84b533f4	Tashkent Main Hub	\N	\N	2026-03-03 14:30:25.473	2026-03-03 14:30:25.473	\N	\N
3fa6a86e-4ca9-4251-b391-22ab6fc754a1	80c5133c-a6e8-4efc-88ea-1cd5720f429d	Demo Hub	\N	\N	2026-03-03 14:30:25.519	2026-03-03 14:30:25.519	\N	\N
86bd929a-3400-48e5-98c3-c2e16072a532	4a0e4655-a9df-403c-a5cc-aee7172f8e61	Main Headquarters	\N	\N	2026-03-21 14:36:56.068	2026-03-21 14:36:56.068	\N	\N
15ac82f7-996b-4703-b2fb-3c3a46f8936f	66c3a6ed-6af9-4a65-88a7-354310d2d6e7	Main Branch	\N	\N	2026-03-21 14:36:56.071	2026-03-21 14:36:56.071	\N	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, "companyId", name, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
49885eb6-3544-43c7-a211-c9ad36f26338	4a0e4655-a9df-403c-a5cc-aee7172f8e61	Muzlatilgan mahsulotlar	2026-03-21 20:59:34.573	2026-03-21 20:59:34.573	\N	\N
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, slug, logo, website, instagram, telegram, "siteActive", "isDemo", "subscriptionPlan", "subscriptionStatus", "trialExpiresAt", "dbConnectionUrl", "createdAt", "updatedAt", "deletedAt", "deletedBy", "cashbackPercent") FROM stdin;
26a74d18-e098-417d-82c9-844d84b533f4	Supplio Global Distributors	supplio-global	\N	\N	@supplio.official	t.me/supplio_uz	t	f	PREMIUM	ACTIVE	2026-04-02 14:30:25.465	\N	2026-03-03 14:30:25.468	2026-03-03 14:30:25.468	\N	\N	0
80c5133c-a6e8-4efc-88ea-1cd5720f429d	Demo Solutions Ltd	demo	\N	\N	\N	\N	t	t	START	TRIAL	2026-03-17 14:30:25.515	\N	2026-03-03 14:30:25.517	2026-03-03 14:30:25.517	\N	\N	0
66c3a6ed-6af9-4a65-88a7-354310d2d6e7	RealCoder Distributor	realcoder	\N	\N	\N	\N	t	f	PRO	ACTIVE	2099-01-01 00:00:00	\N	2026-03-21 14:36:56.061	2026-03-21 14:36:56.061	\N	\N	0
4a0e4655-a9df-403c-a5cc-aee7172f8e61	Supplio System	system	\N	https://supplio.uz	supplio__app	supplioapp	t	f	PREMIUM	ACTIVE	2099-01-01 00:00:00	\N	2026-03-21 14:36:56.041	2026-03-21 20:36:20.468	\N	\N	0
\.


--
-- Data for Name: CustomBot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomBot" (id, "companyId", token, username, "isActive", "hasWebApp", watermark, "createdAt", "deletedAt", "botName", description, "webhookUrl") FROM stdin;
8e3e30aa-df53-4c84-974a-c6597acb8704	4a0e4655-a9df-403c-a5cc-aee7172f8e61	6209529595:AAGCkavAP9XcX-E328M8p5KQZGZlYISh4ZI	RealCoderUzBot	t	t	t	2026-03-21 20:54:59.184	\N	Supplio test bot	Bu test uchun	\N
\.


--
-- Data for Name: CustomRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomRole" (id, "companyId", name, permissions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Dealer" (id, "companyId", "branchId", name, phone, address, "creditLimit", "currentDebt", "telegramChatId", "createdAt", "updatedAt", "deletedAt", "deletedBy", "isApproved", "approvedAt", "approvedBy", "isBlocked", "cashbackBalance") FROM stdin;
7a8db3bb-87a8-4398-b491-04939ff80741	4a0e4655-a9df-403c-a5cc-aee7172f8e61	86bd929a-3400-48e5-98c3-c2e16072a532	Saidqodirxon	+998940116877	\N	1000000	15000	1551855614	2026-03-21 20:55:41.228	2026-03-21 21:55:05.339	\N	\N	t	2026-03-21 21:32:30.671	083edef7-6283-41ee-81a8-5cc159b53c82	f	0
dealer-80c5133c-a6e8-4efc-88ea-1cd5720f429d-1	80c5133c-a6e8-4efc-88ea-1cd5720f429d	3fa6a86e-4ca9-4251-b391-22ab6fc754a1	Apex Retail	+998901112233	\N	10000000	4500000	\N	2026-03-21 19:00:00.135	2026-03-22 19:00:00.149	2026-03-22 19:00:00.148	\N	f	\N	\N	f	0
dealer-80c5133c-a6e8-4efc-88ea-1cd5720f429d-2	80c5133c-a6e8-4efc-88ea-1cd5720f429d	3fa6a86e-4ca9-4251-b391-22ab6fc754a1	Global Mart	+998904445566	\N	5000000	1200000	\N	2026-03-21 19:00:00.135	2026-03-22 19:00:00.149	2026-03-22 19:00:00.148	\N	f	\N	\N	f	0
dealer-80c5133c-a6e8-4efc-88ea-1cd5720f429d-3	80c5133c-a6e8-4efc-88ea-1cd5720f429d	3fa6a86e-4ca9-4251-b391-22ab6fc754a1	City Express	+998907778899	\N	2000000	2500000	\N	2026-03-21 19:00:00.135	2026-03-22 19:00:00.149	2026-03-22 19:00:00.148	\N	f	\N	\N	f	0
\.


--
-- Data for Name: DealerApprovalRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealerApprovalRequest" (id, "companyId", "dealerId", status, note, "requestedAt", "reviewedAt", "reviewedBy") FROM stdin;
f8a32280-022e-4dcc-a265-d8d4b4a23801	4a0e4655-a9df-403c-a5cc-aee7172f8e61	7a8db3bb-87a8-4398-b491-04939ff80741	APPROVED	\N	2026-03-21 21:32:30.676	2026-03-21 21:32:30.676	083edef7-6283-41ee-81a8-5cc159b53c82
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, "companyId", "branchId", amount, category, description, "createdAt", "deletedAt", "deletedBy") FROM stdin;
04e0e714-1f4a-41d0-8e3b-430ef98b1aec	26a74d18-e098-417d-82c9-844d84b533f4	\N	500000	Logistics	Fuel for main hub delivery truck	2026-03-03 14:30:25.514	\N	\N
\.


--
-- Data for Name: FeatureFlag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FeatureFlag" (id, "companyId", "featureKey", "isEnabled", "planLevel", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LandingContent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LandingContent" (id, "heroTitleUz", "heroTitleRu", "heroTitleEn", "heroTitleTr", "heroSubtitleUz", "heroSubtitleRu", "heroSubtitleEn", "heroSubtitleTr", "heroBadgeUz", "heroBadgeRu", "heroBadgeEn", "heroBadgeTr", "contactPhone", "contactEmail", "socialTelegram", "socialLinkedin", "socialTwitter", "footerDescUz", "footerDescRu", "footerDescEn", "footerDescTr", "updatedAt") FROM stdin;
LANDING													\N	\N	\N	\N	\N					2026-03-21 17:42:48.597
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lead" (id, "fullName", phone, info, status, "createdAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: LedgerTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LedgerTransaction" (id, "companyId", "branchId", "dealerId", type, amount, reference, note, "createdAt", "deletedAt", "deletedBy") FROM stdin;
6761304b-ed65-40e8-8cb7-1f94eded4894	4a0e4655-a9df-403c-a5cc-aee7172f8e61	86bd929a-3400-48e5-98c3-c2e16072a532	7a8db3bb-87a8-4398-b491-04939ff80741	PAYMENT	1000	\N	\N	2026-03-21 21:41:14.717	\N	\N
4def270d-2ed5-4cff-b765-e5f174a66d5a	4a0e4655-a9df-403c-a5cc-aee7172f8e61	\N	7a8db3bb-87a8-4398-b491-04939ff80741	ORDER	15000	\N	Telegram buyurtma #161821	2026-03-21 21:55:05.345	\N	\N
2eafd391-bce5-404d-8510-a164b051affc	80c5133c-a6e8-4efc-88ea-1cd5720f429d	\N	dealer-80c5133c-a6e8-4efc-88ea-1cd5720f429d-1	ORDER	4500000	\N	\N	2026-03-21 19:00:00.15	2026-03-22 19:00:00.142	\N
e9a2db8d-4d15-47e8-9e23-5652a15a6277	80c5133c-a6e8-4efc-88ea-1cd5720f429d	\N	dealer-80c5133c-a6e8-4efc-88ea-1cd5720f429d-2	ORDER	1200000	\N	\N	2026-03-21 19:00:00.15	2026-03-22 19:00:00.142	\N
2e122898-5fc1-4e9f-93e1-63be251c7e1e	80c5133c-a6e8-4efc-88ea-1cd5720f429d	\N	dealer-80c5133c-a6e8-4efc-88ea-1cd5720f429d-3	ORDER	2500000	\N	\N	2026-03-21 19:00:00.15	2026-03-22 19:00:00.142	\N
\.


--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."News" (id, "slugUz", "slugRu", "slugEn", "slugUzCyr", "slugTr", "titleUz", "titleRu", "titleEn", "titleUzCyr", "titleTr", "excerptUz", "excerptRu", "excerptEn", "excerptUzCyr", "excerptTr", "contentUz", "contentRu", "contentEn", "contentUzCyr", "contentTr", image, "authorId", "isPublished", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "companyId", "senderId", "receiverUserId", "receiverDealerId", title, message, "isRead", type, "createdAt", "deletedAt") FROM stdin;
d9514d85-7084-4733-befb-5f90d0b53400	4a0e4655-a9df-403c-a5cc-aee7172f8e61	083edef7-6283-41ee-81a8-5cc159b53c82	083edef7-6283-41ee-81a8-5cc159b53c82	\N	A	A	t	INFO	2026-03-22 06:57:06.402	\N
4f07acfb-5143-42e3-bb6a-861f744e3bbf	4a0e4655-a9df-403c-a5cc-aee7172f8e61	083edef7-6283-41ee-81a8-5cc159b53c82	083edef7-6283-41ee-81a8-5cc159b53c82	\N	A	A	t	INFO	2026-03-22 06:56:59.002	\N
368699fa-de37-4649-bf2f-5b32e5d80ea3	4a0e4655-a9df-403c-a5cc-aee7172f8e61	083edef7-6283-41ee-81a8-5cc159b53c82	083edef7-6283-41ee-81a8-5cc159b53c82	\N	A	A	t	ALERT	2026-03-22 08:09:36.898	\N
6939bc4c-3b1f-49f9-8364-c654c25a27bc	66c3a6ed-6af9-4a65-88a7-354310d2d6e7	\N	1533926a-9876-4147-94f6-b809d6e20a88	\N	Tolov qil 	Tolov qil 	f	WARNING	2026-03-22 14:58:40.45	\N
cd69ed0a-345e-4d8c-a203-afe687568943	66c3a6ed-6af9-4a65-88a7-354310d2d6e7	\N	1533926a-9876-4147-94f6-b809d6e20a88	\N	A	A	f	INFO	2026-03-22 19:49:08.144	\N
e9193dde-bcfd-45cd-afa1-4ee48701ae17	4a0e4655-a9df-403c-a5cc-aee7172f8e61	\N	083edef7-6283-41ee-81a8-5cc159b53c82	\N	A	A	f	INFO	2026-03-22 19:49:08.144	\N
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
e3f4c7ef-f00b-4deb-90f3-be57f822b053	4a0e4655-a9df-403c-a5cc-aee7172f8e61	Qarz eslatmasi	DEBT_REMINDER	{"en": "You have a debt of {debt}. Please make a payment.", "ru": "У вас долг {debt}. Пожалуйста, оплатите.", "tr": "{debt} borcunuz var. Lütfen ödeme yapın.", "uz": "Sizda {debt} so'm qarz mavjud. Iltimos to'lov qiling."}	t	2026-03-22 08:09:08.258	2026-03-22 08:09:08.258	\N
7b6b2a07-b70c-4f35-a9a5-335b4e0dcdeb	4a0e4655-a9df-403c-a5cc-aee7172f8e61	Aksiya xabari	PROMOTION	{"en": "🔥 Sale! {productName} with discount!", "ru": "🔥 Акция! {productName} со скидкой!", "tr": "🔥 İndirim! {productName} indirimli!", "uz": "🔥 Aksiya! {productName} chegirma bilan!"}	t	2026-03-22 08:09:08.259	2026-03-22 08:09:08.259	\N
81af7c9b-5c02-40d9-b5c5-d828a91cb6f0	4a0e4655-a9df-403c-a5cc-aee7172f8e61	To'lov muddati	PAYMENT_DUE	{"en": "⏰ Payment due soon! Please pay your debt.", "ru": "⏰ Срок оплаты скоро! Пожалуйста, погасите долг.", "tr": "⏰ Ödeme tarihi yaklaşıyor! Lütfen borcunuzu ödeyin.", "uz": "⏰ To'lov muddati yaqin! Iltimos, qarzingizni to'lang."}	t	2026-03-22 08:09:08.26	2026-03-22 08:09:08.26	\N
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "companyId", "dealerId", "branchId", "totalAmount", "totalCost", status, items, "createdAt", "updatedAt", "deletedAt", "deletedBy", note) FROM stdin;
962c6ab0-de97-4950-8258-787019161821	4a0e4655-a9df-403c-a5cc-aee7172f8e61	7a8db3bb-87a8-4398-b491-04939ff80741	86bd929a-3400-48e5-98c3-c2e16072a532	15000	0	ACCEPTED	[{"qty": 10, "unit": "dona", "price": 1500, "total": 15000, "productId": "65b2b985-092f-492a-bb9f-8885ed96b753"}]	2026-03-21 21:55:05.328	2026-03-21 21:55:24.798	\N	\N	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "companyId", "branchId", "dealerId", amount, method, reference, "createdAt", "deletedAt", "deletedBy", note) FROM stdin;
ace7df69-c2d8-4994-b09c-280f6419917e	4a0e4655-a9df-403c-a5cc-aee7172f8e61	86bd929a-3400-48e5-98c3-c2e16072a532	7a8db3bb-87a8-4398-b491-04939ff80741	1000	CASH	TEST	2026-03-21 21:41:14.711	\N	\N	\N
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, "companyId", name, sku, description, "costPrice", price, stock, unit, "createdAt", "updatedAt", "deletedAt", "deletedBy", "categoryId", "imageUrl", "isActive", "subcategoryId", "unitId", "discountPrice", "isPromo") FROM stdin;
65b2b985-092f-492a-bb9f-8885ed96b753	4a0e4655-a9df-403c-a5cc-aee7172f8e61	KreazyMax	AAAAA	TEST	1000	1500	90	dona	2026-03-21 21:00:33.978	2026-03-21 21:55:05.336	\N	\N	49885eb6-3544-43c7-a211-c9ad36f26338	\N	t	d5969388-d10a-4d67-b258-12e955503fb3	\N	\N	f
e0b6f6a3-d24b-42f4-b00d-dca495c76867	80c5133c-a6e8-4efc-88ea-1cd5720f429d	Supplio Box Premium	S-PREM	\N	180000	250000	150	box	2026-03-21 19:00:00.147	2026-03-22 19:00:00.153	2026-03-22 19:00:00.152	\N	\N	\N	t	\N	\N	\N	f
62065dd4-3a7a-48a8-bdeb-40a9d4720df6	80c5133c-a6e8-4efc-88ea-1cd5720f429d	Supplio Lite Tube	S-LITE	\N	30000	45000	2000	pcs	2026-03-21 19:00:00.147	2026-03-22 19:00:00.153	2026-03-22 19:00:00.152	\N	\N	\N	t	\N	\N	\N	f
fd0340f5-543b-4bc1-b838-af650b3f9b1b	80c5133c-a6e8-4efc-88ea-1cd5720f429d	Industrial Pack	IND-P	\N	950000	1200000	45	set	2026-03-21 19:00:00.147	2026-03-22 19:00:00.153	2026-03-22 19:00:00.152	\N	\N	\N	t	\N	\N	\N	f
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
d5969388-d10a-4d67-b258-12e955503fb3	4a0e4655-a9df-403c-a5cc-aee7172f8e61	49885eb6-3544-43c7-a211-c9ad36f26338	Muzqaymoqlar	2026-03-21 20:59:42.37	2026-03-21 20:59:42.37	\N	\N
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, "companyId", plan, status, amount, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSettings" (id, "maintenanceMode", "backupFrequency", "lastBackupAt", "defaultTrialDays", "newsEnabled", "superAdminPhone", "systemVersion", "globalNotifyUz", "globalNotifyRu", "globalNotifyEn", "globalNotifyTr", "updatedAt", "termsUz", "termsRu", "termsEn", "termsUzCyr", "privacyUz", "privacyRu", "privacyEn", "privacyUzCyr") FROM stdin;
GLOBAL	f	DAILY	2026-03-21 22:00:00.51	14	t	+998901112233	1.0.0	\N	\N	\N	\N	2026-03-22 19:46:23.141	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: TariffPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TariffPlan" (id, "order", "nameUz", "nameRu", "nameEn", "nameTr", "nameUzCyr", price, "featuresUz", "featuresRu", "featuresEn", "featuresTr", "featuresUzCyr", "isPopular", "isActive", "createdAt", "updatedAt", "allowAnalytics", "allowBulkImport", "allowCustomBot", "allowMultiCompany", "allowNotifications", "allowWebStore", "maxBranches", "maxDealers", "maxProducts", "maxUsers", "planKey", "priceMonthly", "priceYearly", "trialDays") FROM stdin;
4bd91f1a-0371-4a54-bb17-aab8b57a8f71	1	Boshlang'ich	Стартовый	Start	Başlangıç	Бошланғич	99 000	["3 filial", "10 foydalanuvchi", "50 dealer", "100 mahsulot", "Analitika"]	["3 филиала", "10 пользователей", "50 дилеров", "100 товаров", "Аналитика"]	["3 branches", "10 users", "50 dealers", "100 products", "Analytics"]	["3 şube", "10 kullanıcı", "50 bayi", "100 ürün", "Analitik"]	["3 филиал", "10 фойдаланувчи", "50 дилер", "100 маҳсулот", "Аналитика"]	f	t	2026-03-21 19:04:30.15	2026-03-22 07:24:39.378	t	f	f	f	t	t	3	50	100	6	START	99000	990000	14
4025ed38-c341-4d3d-a89c-bd6ee6d49651	2	Professional	Профессиональный	Professional	Profesyonel	Профессионал	249 000	["10 filial", "50 foydalanuvchi", "Cheksiz dealer", "Cheksiz mahsulot", "Bot", "Ommaviy import"]	["10 филиалов", "50 пользователей", "Неограниченно дилеров", "Неограниченно товаров", "Бот", "Массовый импорт"]	["10 branches", "50 users", "Unlimited dealers", "Unlimited products", "Bot", "Bulk import"]	["10 şube", "50 kullanıcı", "Sınırsız bayi", "Sınırsız ürün", "Bot", "Toplu içe aktarma"]	["10 филиал", "50 фойдаланувчи", "Чексиз дилер", "Чексиз маҳсулот", "Бот", "Оммавий импорт"]	t	t	2026-03-21 19:04:30.153	2026-03-22 07:24:39.381	t	t	t	f	t	t	10	99999	99999	50	PRO	249000	2490000	14
df33025f-a522-4d55-9dec-afc8743b6da5	3	Enterprise	Корпоративный	Enterprise	Kurumsal	Корпоратив	499 000	["Cheksiz filial", "Cheksiz foydalanuvchi", "Maxsus bot", "Ko'p kompaniya", "Ustuvor support"]	["Неограниченно филиалов", "Неограниченно пользователей", "Кастомный бот", "Мультикомпания", "Приоритетная поддержка"]	["Unlimited branches", "Unlimited users", "Custom bot", "Multi-company", "Priority support"]	["Sınırsız şube", "Sınırsız kullanıcı", "Özel bot", "Çoklu şirket", "Öncelikli destek"]	["Чексиз филиал", "Чексиз фойдаланувчи", "Махсус бот", "Кўп компания", "Устувор support"]	f	t	2026-03-21 19:04:30.157	2026-03-22 07:24:39.39	t	t	t	t	t	t	99999	99999	99999	99999	PREMIUM	499000	4990000	30
536c7c8a-e296-4a51-b3ac-93597ae47dd6	0	Bepul	Бесплатно	Free	Ücretsiz	Бепул	0	["1 filial", "5 foydalanuvchi", "5 dealer", "50 mahsulot"]	["1 филиал", "5 пользователей", "5 дилеров", "50 товаров"]	["1 branch", "5 users", "5 dealers", "50 products"]	["1 şube", "5 kullanıcı", "5 bayi", "50 ürün"]	["1 филиал", "5 фойдаланувчи", "5 дилер", "50 маҳсулот"]	f	t	2026-03-21 19:04:30.133	2026-03-22 07:24:39.362	f	f	f	f	t	t	1	5	50	5	FREE	0	0	14
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Testimonial" (id, name, company, "roleTitle", "contentUz", "contentRu", "contentEn", "contentTr", rating, avatar, "isActive", "order", "createdAt") FROM stdin;
4f078739-ae18-4a77-ae44-a8cf1ab17f57	Bahodir Rahimov	Tashkent Electronics	Owner	Supplio bizning tarqatish tarmog'imizni to'liq avtomatlashtirdi. Endi barcha dilerlarimizni bitta paneldan boshqaramiz.	Supplio полностью автоматизировал нашу дистрибьюторскую сеть. Теперь управляем всеми дилерами из одной панели.	Supplio fully automated our distribution network. We now manage all our dealers from a single panel.	Supplio dağıtım ağımızı tamamen otomatize etti. Artık tüm bayilerimizi tek bir panelden yönetiyoruz.	5	\N	t	0	2026-03-21 19:04:30.165
2a5a4443-86c7-46d5-a63a-5298091e09d9	Nilufar Yusupova	Silk Road Trading	General Manager	Telegram bot orqali dilerlarimiz buyurtma berishi va qarzlarini ko'rishi bizga juda qulaylik yaratdi.	Telegram бот для дилеров и отслеживание долгов значительно упростили нашу работу.	The Telegram bot for dealers and debt tracking greatly simplified our operations.	Bayiler için Telegram botu ve borç takibi iş süreçlerimizi büyük ölçüde kolaylaştırdı.	5	\N	t	1	2026-03-21 19:04:30.17
d9cfdc60-b3ff-49b3-88ec-83b5f39b4fe1	Sardor Xolmatov	Fergana Optoviy	Sales Director	Analitika sahifasi bizga qaysi mahsulotlar yaxshi sotilayotganini va qaysi dilerlar faolroq ekanini ko'rsatadi.	Раздел аналитики показывает нам, какие продукты продаются лучше и кто из дилеров активнее.	The analytics section shows us which products sell best and which dealers are most active.	Analitik bölümü hangi ürünlerin daha iyi sattığını ve hangi bayilerin daha aktif olduğunu gösteriyor.	5	\N	t	2	2026-03-21 19:04:30.175
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Unit" (id, "companyId", name, symbol, "createdAt", "deletedAt") FROM stdin;
6fbf7cab-75a2-4f2b-b597-69c25517cbad	\N	Dona	dona	2026-03-22 07:24:37.973	\N
aeccd6a6-68e3-4bf3-9d1d-ae5870f06174	\N	Kilogramm	kg	2026-03-22 07:24:37.992	\N
15c767f7-5bda-4679-8386-48a5f866d229	\N	Gramm	g	2026-03-22 07:24:37.996	\N
1a6e679a-2fb0-4025-a58d-b8d576cc05d2	\N	Litr	l	2026-03-22 07:24:37.998	\N
5b8b7121-94aa-4a8b-bef3-077c9a28cfd0	\N	Millilitr	ml	2026-03-22 07:24:38.007	\N
249d113b-76ed-4b7e-b7e0-19abe21f451e	\N	Metr	m	2026-03-22 07:24:38.01	\N
846cf583-6191-4df7-9f54-7a5158ba051d	\N	Santimetr	sm	2026-03-22 07:24:38.011	\N
9d57c94e-56d8-4eb2-b1ea-75d7ff5cdc59	\N	Quti	quti	2026-03-22 07:24:38.013	\N
f67fcbf3-b4af-4e67-9d20-f6e7a58f3b61	\N	Paket	paket	2026-03-22 07:24:38.014	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "companyId", "branchId", phone, "passwordHash", "fullName", "photoUrl", "roleType", "customRoleId", "isActive", language, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
1533926a-9876-4147-94f6-b809d6e20a88	66c3a6ed-6af9-4a65-88a7-354310d2d6e7	15ac82f7-996b-4703-b2fb-3c3a46f8936f	+998200116877	$2b$10$lfnFjZdtWN2lkVu3yxFCzuB8dvayZz12wTZlL.n2AMW1D0oCld9lC	RealCoder Distributor	/favicon.png	OWNER	\N	t	uz	2026-03-21 14:36:56.079	2026-03-21 14:36:56.079	\N	\N
083edef7-6283-41ee-81a8-5cc159b53c82	4a0e4655-a9df-403c-a5cc-aee7172f8e61	86bd929a-3400-48e5-98c3-c2e16072a532	+998917505060	$2b$10$lfnFjZdtWN2lkVu3yxFCzuB8dvayZz12wTZlL.n2AMW1D0oCld9lC	Saidqodirxon Rahimov	/favicon.png	SUPER_ADMIN	\N	t	uz	2026-03-21 14:36:56.076	2026-03-21 15:47:55.238	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f4df99f7-422f-4e18-9963-fab3902d8f12	ae02c46d2bf97db2987191ef9d4b7be66a8b5e1ef7ecdce6a4b6fb21e2c71bf6	2026-03-03 19:30:22.043964+05	20260303143021_add_db_connection_url	\N	\N	2026-03-03 19:30:21.858469+05	1
dbb56271-7727-4000-a9b0-15097f71c7f9	872341019fdc18f212b22a6fe814a5241f259ab4ab21e25150c6b20fa714b6e4	2026-03-22 02:26:01.258225+05	20260322000001_add_seller_role_dealer_approval	\N	\N	2026-03-22 02:26:01.093327+05	1
27a05ee7-e39e-4e2d-9555-27e01820eb54	32bca86742c6178490e97f18fe69b36a8257f922d47d1f87ccb9bb9a3415069a	2026-03-22 03:07:00.156002+05	20260322000002_add_block_promo_cashback	\N	\N	2026-03-22 03:07:00.127009+05	1
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
-- Name: Unit Unit_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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

\unrestrict 27CjrkPUugefIPcQLgzs7owEmj5duZilRQ6xAanxf9MrdQkOFaxjXLGvCWSWYFa

