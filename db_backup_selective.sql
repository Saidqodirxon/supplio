--
-- PostgreSQL database dump
--

\restrict AJlbMEKuAwVURykaw5hizBIDq44ruZjlRG10j0VP8oIKBzGkZihaQeZVx1QNgO6

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
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Unit" DISABLE TRIGGER ALL;

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


ALTER TABLE public."Unit" ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

\unrestrict AJlbMEKuAwVURykaw5hizBIDq44ruZjlRG10j0VP8oIKBzGkZihaQeZVx1QNgO6

