--
-- PostgreSQL database dump
--

\restrict 8GHVI5b72UbVhBMB71LPc9Xq36rLfys4doDtMB7rvLRdWH9rQtxsid8TUyq0FKO

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
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemSettings" (id, "maintenanceMode", "backupFrequency", "lastBackupAt", "defaultTrialDays", "newsEnabled", "superAdminPhone", "systemVersion", "globalNotifyUz", "globalNotifyRu", "globalNotifyEn", "globalNotifyTr", "updatedAt", "termsUz", "termsRu", "termsEn", "termsUzCyr", "privacyUz", "privacyRu", "privacyEn", "privacyUzCyr", "contractEn", "contractRu", "contractUz", "contractUzCyr", telegram) FROM stdin;
GLOBAL	f	DAILY	2026-04-18 20:00:08.623	14	t	+998200116877	1.0.0	\N	\N	\N	\N	2026-04-19 17:17:41.452	<p><b>1. Umumiy qoidalar</b></p><p>Ushbu Foydalanish shartlari (qisqacha "Shartlar") Supplio platformasi va uning xizmatlaridan foydalanishni tartibga soladi. Platformaga kirish yoki undan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.</p><br/><p><b>2. Ro'yxatdan o'tish va xavfsizlik</b></p><p>Foydalanuvchilar o'z akkauntlarining maxfiyligini saqlash majburiyatiga ega. Hisobingizdan qilingan har qanday harakatlar uchun to'liq javobgar bo'lasiz.</p><br/><p><b>3. Tizimdan foydalanish cheklovlari</b></p><p>Supplio tizimidan noqonuniy harakatlar, firibgarlik yoki boshqa foydalanuvchilarga zarar yetkazish maqsadida foydalanish qat'iyan man etiladi.</p><br/><p><b>4. To'lovlar va tariflar</b></p><p>Platforma pullik xizmatlarni taqdim etadi. Barcha to'lovlar oldindan amalga oshiriladi va qaytarilmaydi (qonunchilikda ko'rsatilgan holatlar bundan mustasno).</p>	\N	\N	\N	<p><b>1. Maxfiylik kafolati</b></p><p>Supplio sizning shaxsiy ma'lumotlaringizni himoya qilishga katta e'tibor qaratadi. Biz ma'lumotlaringizni uchinchi shaxslarga sotmaymiz.</p><br/><p><b>2. Qanday ma'lumotlar yig'iladi?</b></p><p>Sizning telefon raqamingiz, ismingiz, kompaniya ma'lumotlaringiz va tizimdagi harakatlar loglari xavfsizlik va xizmat sifatini oshirish uchun yig'iladi.</p><br/><p><b>3. Ma'lumotlarni saqlash muddati</b></p><p>Sizning ma'lumotlaringiz siz tizimdan foydalanayotgan davr mobaynida xavfsiz serverlarda saqlanadi. Hisobingizni o'chirmoqchi bo'lsangiz, biz bilan bog'lanishingiz mumkin.</p>	\N	\N	\N	\N	\N	<p><b>1. Xizmat ko'rsatish shartnomasi</b></p><p>Ushbu hujjat SUPPLIO va Mijoz o'rtasidagi rasmiy litsenziya va xizmat ko'rsatish kelishuvi hisoblanadi.</p><br/><p><b>2. Tomonlarning huquq va majburiyatlari</b></p><p>Biz tizimning 99.9% ishlashini (SLA) kafolatlaymiz. Mijoz esa foydalanish qoidalari va oylik obuna to'lovlarini o'z vaqtida amalga oshirishi shart.</p><br/><p><b>3. Fors-major holatlar</b></p><p>Tabiiy ofatlar, davlat miqyosidagi internet uzilishlari va bizga bog'liq bo'lmagan uzilishlar uchun SUPPLIO javobgar bo'lmaydi.</p><br/><p><b>4. Kelishuvni bekor qilish</b></p><p>Mijoz istalgan vaqtda xizmatdan foydalanishni to'xtatishi mumkin. Buning uchun 15 kun oldin yozma (yoki elektron) ogohlantirish berilishi kerak.</p>	\N	\N
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 8GHVI5b72UbVhBMB71LPc9Xq36rLfys4doDtMB7rvLRdWH9rQtxsid8TUyq0FKO

