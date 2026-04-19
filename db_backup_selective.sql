--
-- PostgreSQL database dump
--

\restrict aRlUFPdYK55aDd1AhsECk7tZAgx48AYINu7HbGYzVHIIvZE9RNBSSiHznuEdmku

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
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, "companyId", name, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
136299ef-398d-49a3-a896-1b6f1358ff67	2558c501-89df-4695-b56c-fbe600529b21	Elektronika	2026-03-28 18:21:44.629	2026-03-28 18:21:44.629	\N	\N
ba94a06a-7c18-4c9c-bf48-3fd5974d53ae	2558c501-89df-4695-b56c-fbe600529b21	Oziq-ovqat	2026-03-28 18:21:44.631	2026-03-28 18:21:44.631	\N	\N
aeface47-ef4e-44ef-b79d-6abfc8293e27	2558c501-89df-4695-b56c-fbe600529b21	Tozalash vositalari	2026-03-28 18:21:44.632	2026-03-28 18:21:44.632	\N	\N
9caad36e-f91c-4af8-924e-42540dcfe0c3	372dcf39-46c6-4fef-a349-808c82dc8d8a	Muzli mahsulotlar	2026-03-29 09:41:18.522	2026-03-29 09:41:18.522	\N	\N
\.


--
-- Data for Name: Subcategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subcategory" (id, "companyId", "categoryId", name, "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
c63adc41-0bf3-4b66-be2b-32e336af9266	372dcf39-46c6-4fef-a349-808c82dc8d8a	9caad36e-f91c-4af8-924e-42540dcfe0c3	Muzqaymoqlar	2026-03-29 09:41:24.013	2026-03-29 09:41:24.013	\N	\N
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupportTicket" (id, "companyId", subject, message, status, "lastReplyAt", "createdAt", "updatedAt") FROM stdin;
a011f57d-20ee-4b9d-91eb-65c9c545112c	33930263-cce8-4ffb-9b22-07ff6b07a268	Ajoyib	Ajoyib	IN_PROGRESS	2026-04-12 18:32:43.025	2026-04-12 17:49:08.926	2026-04-12 18:32:43.026
\.


--
-- Data for Name: SupportMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupportMessage" (id, "ticketId", "senderId", "senderType", message, "createdAt", "imageUrl") FROM stdin;
c2eead5f-fe23-4f66-b025-0ceb9946ff6e	a011f57d-20ee-4b9d-91eb-65c9c545112c	\N	DISTRIBUTOR	Ajoyib	2026-04-12 17:49:08.926	\N
2d69b4f3-5865-4369-89fc-3c2253afdee5	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	a	2026-04-12 17:50:45.081	\N
22bdb8c9-6c2e-4d0a-b3d0-c29404bceb1c	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	haaaa 	2026-04-12 18:11:08.803	\N
a42d553e-a09f-4d9d-bfe0-840d1cb97660	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	 	2026-04-12 18:14:13.487	\N
289a624a-04b5-4f13-ae88-4e41d5cc8947	a011f57d-20ee-4b9d-91eb-65c9c545112c	9e8748b4-d2a2-42f3-8f1c-790ce36321db	DISTRIBUTOR	a	2026-04-12 18:14:23.233	\N
f6b204cd-dc32-488f-8bd8-c7325b75485e	a011f57d-20ee-4b9d-91eb-65c9c545112c	6cb09fb1-1ca2-4ec1-8997-4e55140ba6bc	SUPER_ADMIN	A	2026-04-12 18:32:43.014	\N
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemSettings" (id, "maintenanceMode", "backupFrequency", "lastBackupAt", "defaultTrialDays", "newsEnabled", "superAdminPhone", "systemVersion", "globalNotifyUz", "globalNotifyRu", "globalNotifyEn", "globalNotifyTr", "updatedAt", "termsUz", "termsRu", "termsEn", "termsUzCyr", "privacyUz", "privacyRu", "privacyEn", "privacyUzCyr", "contractEn", "contractRu", "contractUz", "contractUzCyr", telegram) FROM stdin;
GLOBAL	f	DAILY	2026-04-18 20:00:08.623	14	t	+998200116877	1.0.0	\N	\N	\N	\N	2026-04-19 17:17:41.452	<p><b>1. Umumiy qoidalar</b></p><p>Ushbu Foydalanish shartlari (qisqacha "Shartlar") Supplio platformasi va uning xizmatlaridan foydalanishni tartibga soladi. Platformaga kirish yoki undan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.</p><br/><p><b>2. Ro'yxatdan o'tish va xavfsizlik</b></p><p>Foydalanuvchilar o'z akkauntlarining maxfiyligini saqlash majburiyatiga ega. Hisobingizdan qilingan har qanday harakatlar uchun to'liq javobgar bo'lasiz.</p><br/><p><b>3. Tizimdan foydalanish cheklovlari</b></p><p>Supplio tizimidan noqonuniy harakatlar, firibgarlik yoki boshqa foydalanuvchilarga zarar yetkazish maqsadida foydalanish qat'iyan man etiladi.</p><br/><p><b>4. To'lovlar va tariflar</b></p><p>Platforma pullik xizmatlarni taqdim etadi. Barcha to'lovlar oldindan amalga oshiriladi va qaytarilmaydi (qonunchilikda ko'rsatilgan holatlar bundan mustasno).</p>	\N	\N	\N	<p><b>1. Maxfiylik kafolati</b></p><p>Supplio sizning shaxsiy ma'lumotlaringizni himoya qilishga katta e'tibor qaratadi. Biz ma'lumotlaringizni uchinchi shaxslarga sotmaymiz.</p><br/><p><b>2. Qanday ma'lumotlar yig'iladi?</b></p><p>Sizning telefon raqamingiz, ismingiz, kompaniya ma'lumotlaringiz va tizimdagi harakatlar loglari xavfsizlik va xizmat sifatini oshirish uchun yig'iladi.</p><br/><p><b>3. Ma'lumotlarni saqlash muddati</b></p><p>Sizning ma'lumotlaringiz siz tizimdan foydalanayotgan davr mobaynida xavfsiz serverlarda saqlanadi. Hisobingizni o'chirmoqchi bo'lsangiz, biz bilan bog'lanishingiz mumkin.</p>	\N	\N	\N	\N	\N	<p><b>1. Xizmat ko'rsatish shartnomasi</b></p><p>Ushbu hujjat SUPPLIO va Mijoz o'rtasidagi rasmiy litsenziya va xizmat ko'rsatish kelishuvi hisoblanadi.</p><br/><p><b>2. Tomonlarning huquq va majburiyatlari</b></p><p>Biz tizimning 99.9% ishlashini (SLA) kafolatlaymiz. Mijoz esa foydalanish qoidalari va oylik obuna to'lovlarini o'z vaqtida amalga oshirishi shart.</p><br/><p><b>3. Fors-major holatlar</b></p><p>Tabiiy ofatlar, davlat miqyosidagi internet uzilishlari va bizga bog'liq bo'lmagan uzilishlar uchun SUPPLIO javobgar bo'lmaydi.</p><br/><p><b>4. Kelishuvni bekor qilish</b></p><p>Mijoz istalgan vaqtda xizmatdan foydalanishni to'xtatishi mumkin. Buning uchun 15 kun oldin yozma (yoki elektron) ogohlantirish berilishi kerak.</p>	\N	\N
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: -
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
-- PostgreSQL database dump complete
--

\unrestrict aRlUFPdYK55aDd1AhsECk7tZAgx48AYINu7HbGYzVHIIvZE9RNBSSiHznuEdmku

