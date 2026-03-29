--
-- PostgreSQL database dump
--

\restrict CtIfyMHj4FICmzqVOiSkyuuKG3MUJe3xYceiNWW5FbcEoDFxAvbXFweQl2SLT3r

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
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, "companyId", name, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
136299ef-398d-49a3-a896-1b6f1358ff67	2558c501-89df-4695-b56c-fbe600529b21	Elektronika	2026-03-28 18:21:44.629	2026-03-28 18:21:44.629	\N	\N
ba94a06a-7c18-4c9c-bf48-3fd5974d53ae	2558c501-89df-4695-b56c-fbe600529b21	Oziq-ovqat	2026-03-28 18:21:44.631	2026-03-28 18:21:44.631	\N	\N
aeface47-ef4e-44ef-b79d-6abfc8293e27	2558c501-89df-4695-b56c-fbe600529b21	Tozalash vositalari	2026-03-28 18:21:44.632	2026-03-28 18:21:44.632	\N	\N
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, slug, logo, website, instagram, telegram, "siteActive", "isDemo", "subscriptionPlan", "subscriptionStatus", "trialExpiresAt", "dbConnectionUrl", "createdAt", "updatedAt", "deletedAt", "deletedBy", "cashbackPercent") FROM stdin;
2558c501-89df-4695-b56c-fbe600529b21	Supplio Global Distributors	supplio-global	\N	\N	@supplio.official	supplio_uz	t	f	PREMIUM	ACTIVE	2027-03-28 18:21:44.616	\N	2026-03-28 18:21:44.619	2026-03-28 18:21:44.619	\N	\N	0
677fe634-603d-4723-8c85-afff22b41391	Demo Solutions Ltd	demo	\N	\N	\N	\N	t	t	START	TRIAL	2026-04-11 18:21:44.891	\N	2026-03-28 18:21:44.893	2026-03-28 18:21:44.893	\N	\N	0
372dcf39-46c6-4fef-a349-808c82dc8d8a	Supplio Global System	supplio-system	\N	\N	\N	\N	t	f	FREE	TRIAL	2029-12-31 19:00:00	\N	2026-03-28 18:22:04.297	2026-03-28 18:22:04.297	\N	\N	0
\.


--
-- Data for Name: CustomBot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomBot" (id, "companyId", token, username, "isActive", "hasWebApp", watermark, "createdAt", "deletedAt", "botName", description, "webhookUrl") FROM stdin;
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
14a0868a-c9ed-4962-92da-7d25d5e98e2c	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Umida Qosimova	+998904444444	\N	25000000	10000000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.885	\N	\N	f	\N	\N	f	0
eb9fdd9f-8ae4-4252-a662-ac14a105d55e	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Feruza Nazarova	+998906666666	\N	8000000	-700000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.887	\N	\N	f	\N	\N	f	0
305f8ae0-3776-4761-8278-13ecb059e48d	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Sardor Mirzayev	+998903333333	\N	15000000	26400000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.853	\N	\N	f	\N	\N	f	0
c429d9c4-5478-4478-89c2-98345a274317	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Otabek Xoliqov	+998907777777	\N	12000000	3900000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.858	\N	\N	f	\N	\N	f	0
cc8274a6-19c3-4e45-a207-c9902126e0e4	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Kamola Ergasheva	+998908888888	\N	18000000	45000000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.865	\N	\N	f	\N	\N	f	0
03f6ef3f-54a8-47ca-8153-0983ace9b797	2558c501-89df-4695-b56c-fbe600529b21	a8eb809c-172e-4d8a-a0b7-805f8286439f	Bekzod Tursunov	+998905555555	\N	10000000	9120000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.87	\N	\N	f	\N	\N	f	0
193d572b-d791-4918-8f8c-fe5b018be616	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Sherzod Rашidov	+998909999999	\N	22000000	270000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.872	\N	\N	f	\N	\N	f	0
b122c83b-1b3f-4943-90b5-6226085c997d	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Alisher Kobilov	+998944445566	\N	50000000	50310000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.876	\N	\N	f	\N	\N	f	0
5d76c986-4cad-446c-8442-21b4c0ee0cf9	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Jasur Yuldashev	+998901111111	\N	30000000	51020000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.879	\N	\N	f	\N	\N	f	0
604f7c8d-0d9b-4372-b18c-0e9f4b6bc56f	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	Nodira Hasanova	+998902222222	\N	20000000	2570000	\N	2026-03-28 18:21:44.638	2026-03-28 18:21:44.882	\N	\N	f	\N	\N	f	0
\.


--
-- Data for Name: DealerApprovalRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealerApprovalRequest" (id, "companyId", "dealerId", status, note, "requestedAt", "reviewedAt", "reviewedBy") FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, "companyId", "branchId", amount, category, description, "createdAt", "deletedAt", "deletedBy") FROM stdin;
ba1c83a0-f2f2-45b1-bd7f-9f08f3da2276	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	500000	Logistics	Asosiy yuk mashinasi yoqilg'isi	2026-03-28 18:21:44.89	\N	\N
2db4ead2-0816-429a-903f-4641379bfa0a	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	1200000	Rent	Oy ijarasi - asosiy ombor	2026-03-28 18:21:44.89	\N	\N
0c384eaf-9fc0-4a77-8302-4505f5407acc	2558c501-89df-4695-b56c-fbe600529b21	5d6566ed-592b-4fa7-a851-a361a13eae9c	350000	Utilities	Elektr energiyasi	2026-03-28 18:21:44.89	\N	\N
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
LANDING													\N	\N	\N	\N	\N					2026-03-28 18:39:09.274
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
GLOBAL	f	DAILY	\N	14	t	+998901112233	1.0.0	\N	\N	\N	\N	2026-03-28 18:21:44.566	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: TariffPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TariffPlan" (id, "order", "nameUz", "nameRu", "nameEn", "nameTr", "nameUzCyr", price, "featuresUz", "featuresRu", "featuresEn", "featuresTr", "featuresUzCyr", "isPopular", "isActive", "createdAt", "updatedAt", "allowAnalytics", "allowBulkImport", "allowCustomBot", "allowMultiCompany", "allowNotifications", "allowWebStore", "maxBranches", "maxDealers", "maxProducts", "maxUsers", "planKey", "priceMonthly", "priceYearly", "trialDays") FROM stdin;
5d298404-b596-4a6c-ae77-046389d63d1e	0	Bepul	Бесплатно	Free	Ücretsiz	Бепул	0	["1 filial", "5 xodim (rol boshqaruvi)", "50 dealer", "200 mahsulot", "Web do'kon"]	["1 филиал", "5 сотрудников (роли)", "50 дилеров", "200 товаров", "Веб-магазин"]	["1 branch", "5 staff (role management)", "50 dealers", "200 products", "Web store"]	["1 şube", "5 kullanıcı", "50 bayi", "200 ürün"]	["1 филиал", "5 фойдаланувчи", "50 дилер", "200 маҳсулот"]	f	t	2026-03-28 18:21:44.592	2026-03-28 18:25:16.464	f	f	f	f	t	t	1	50	200	5	FREE	0	0	14
ad3a5972-221d-4a02-be16-8c1b8622134f	1	Boshlang'ich	Стартовый	Starter	Başlangıç	Бошланғич	99 000	["3 filial", "15 xodim + maxsus rollar", "500 dealer", "1 000 mahsulot", "Analitika", "Telegram bot"]	["3 филиала", "15 сотрудников + роли", "500 дилеров", "1 000 товаров", "Аналитика", "Telegram бот"]	["3 branches", "15 staff + custom roles", "500 dealers", "1,000 products", "Analytics", "Telegram bot"]	["3 şube", "15 kullanıcı", "500 bayi", "1.000 ürün", "Analitik", "Telegram botu"]	["3 филиал", "15 фойдаланувчи", "500 дилер", "1 000 маҳсулот", "Аналитика", "Telegram бот"]	f	t	2026-03-28 18:21:44.6	2026-03-28 18:25:16.464	t	f	t	f	t	t	3	500	1000	15	START	99000	990000	14
0c4f4902-1fa8-4d22-a542-d5504b7559ba	3	Enterprise	Корпоративный	Enterprise	Kurumsal	Корпоратив	Muzokarali	["Cheksiz filial", "Cheksiz xodim + maxsus rollar", "Cheksiz dealer", "Cheksiz mahsulot", "Dedicated server", "SLA 99.9%", "Texnik yordam 24/7"]	["Безлимит филиалов", "Безлимит сотрудников + роли", "Безлимит дилеров", "Безлимит товаров", "Выделенный сервер", "SLA 99.9%", "Поддержка 24/7"]	["Unlimited branches", "Unlimited staff + custom roles", "Unlimited dealers", "Unlimited products", "Dedicated server", "SLA 99.9%", "24/7 support"]	["Sınırsız şube", "Sınırsız kullanıcı", "Sınırsız bayi", "Sınırsız ürün", "Özel sunucu", "SLA 99.9%", "7/24 destek"]	["Чексиз филиал", "Чексиз фойдаланувчи", "Чексиз дилер", "Чексиз маҳсулот", "Dedicated server", "SLA 99.9%", "24/7 yordam"]	f	t	2026-03-28 18:21:44.605	2026-03-28 18:25:16.464	t	t	t	t	t	t	9999	999999	999999	9999	PREMIUM	0	0	30
24f61f33-fc71-4c2c-8eec-e49ccaee25f9	2	Professional	Профессиональный	Pro	Profesyonel	Профессионал	299 000	["10 filial", "50 xodim + cheksiz maxsus rollar", "5 000 dealer", "Cheksiz mahsulot", "Analitika Pro", "Bir nechta bot", "Ommaviy import"]	["10 филиалов", "50 сотрудников + роли без лимита", "5 000 дилеров", "Безлимит товаров", "Аналитика Pro", "Несколько ботов", "Массовый импорт"]	["10 branches", "50 staff + unlimited custom roles", "5,000 dealers", "Unlimited products", "Pro Analytics", "Multiple bots", "Bulk import"]	["10 şube", "50 kullanıcı", "5.000 bayi", "Sınırsız ürün", "Pro Analitik", "Çoklu bot", "Toplu içe aktarma"]	["10 филиал", "50 фойдаланувчи", "5 000 дилер", "Чексиз маҳсулот", "Аналитика Pro", "Кўп бот", "Оммавий импорт"]	t	t	2026-03-28 18:21:44.603	2026-03-28 18:25:16.464	t	t	t	t	t	t	10	5000	99999	50	PRO	299000	2990000	14
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
\.


--
-- Data for Name: UpgradeRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UpgradeRequest" (id, "companyId", "companyName", "currentPlan", "requestedPlan", "ownerPhone", "ownerName", "dealersCount", "usersCount", "branchesCount", "productsCount", status, note, "createdAt", "updatedAt") FROM stdin;
b289ba19-d4d6-44ee-a1c7-6cad81de951d	372dcf39-46c6-4fef-a349-808c82dc8d8a	Supplio Global System	FREE	\N		\N	0	1	0	0	APPROVED	\N	2026-03-28 18:35:19.253	2026-03-28 18:46:59.881
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
abf2f3b6-8458-419c-b7cf-37d134674bf8	372dcf39-46c6-4fef-a349-808c82dc8d8a	\N	+998917505060	$2b$10$oWf5TCBHbBpG5Ir0ikRTo.yBvXOxMlIpkgl7FHO79R1AKktyH2mUC	Super Admin	/favicon.png	SUPER_ADMIN	\N	t	uz	2026-03-28 18:22:04.302	2026-03-28 18:22:04.302	\N	\N
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

\unrestrict CtIfyMHj4FICmzqVOiSkyuuKG3MUJe3xYceiNWW5FbcEoDFxAvbXFweQl2SLT3r

