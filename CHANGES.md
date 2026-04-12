# CHANGES — Supplio Overhaul Report

## 1. Admin TypeScript Configuration

**Problem:** `admin/` directory had no TypeScript config files, causing build failures.

**Fixed:**
- Created `admin/tsconfig.json` (composite references)
- Created `admin/tsconfig.app.json` (ES2022 + DOM, strict mode)
- Created `admin/tsconfig.node.json` (ESNext for vite.config.ts)

---

## 2. Admin Utility: `apiError.ts`

**Problem:** `admin/src/utils/toast.ts` imported `./apiError` which didn't exist in `admin/`.

**Fixed:**
- Copied `dashboard/src/utils/apiError.ts` → `admin/src/utils/apiError.ts`
- Handles 402/PLAN_LIMIT_REACHED with multilingual error messages

---

## 3. `admin/src/App.tsx` — Typo Fix

**Problem:** `ProtectedProtectedRoute` — double "Protected" in function name.

**Fixed:**
- Renamed to `ProtectedRoute`
- Updated all usages in `<Routes>`

---

## 4. `admin/src/pages/SuperAdmin.tsx` — Security: Remove Hardcoded Password

**Problem:** Hardcoded password `"2007"` used in:
- `handleAuth()` — secondary lock screen check
- `handleConfirmAction()` — destructive action confirmation

Hardcoded passwords are a critical security vulnerability. Anyone reading the minified JS bundle could extract it.

**Fixed:**
- Added `POST /super/verify-root` endpoint in backend (checks against `process.env.ROOT_ADMIN_PASS`)
- `handleAuth()` now calls `api.post("/super/verify-root", { password: rootPass })`
- `handleConfirmAction()` now calls the same endpoint
- Added `ROOT_ADMIN_PASS=change_this_in_production` to `backend/.env`

---

## 5. `admin/src/pages/SuperAdmin.tsx` — Duplicate Variable Declaration

**Problem:** `const activeItem = ...` was declared twice in the same function scope (lines 775 and 812), causing TS2451.

**Fixed:** Removed the second duplicate declaration.

---

## 6. `admin/src/components/Layout.tsx` — Navigation + UX Improvements

**Changes:**
- Removed 8 unused Lucide icon imports (`LayoutDashboard`, `Crown`, `Bot`, `UserCog`, `BarChart3`, `Monitor`, `Server`, `Zap`)
- Fixed active tab detection: was checking `location.search.includes(...)` incorrectly — now uses `URLSearchParams` to compare tab params properly
- Added `getTitle()` based on search params (not path) for correct header title
- Added **badge counts** for:
  - Open support tickets (red dot on "Arizalar" nav item)
  - Pending upgrade requests (red dot on "Tarif so'rovlari" nav item)
  - Auto-refreshes every 60 seconds
- Added **user info display** in sidebar (name + phone) when sidebar is expanded
- Added **"Xabarnoma" (Notify) tab** to navigation (was missing)
- Updated `logout` button area with user info card above it

---

## 7. `backend/src/super-admin/super-admin.controller.ts` — New Endpoint

**Added:**
```
POST /super/verify-root  { password: string }
```
- Protected by `JwtAuthGuard` + `RolesGuard` (`SUPER_ADMIN` only)
- Checks `body.password === process.env.ROOT_ADMIN_PASS`
- Throws `UnauthorizedException` on mismatch
- Never exposes the password in frontend code

---

## 8. `backend/src/telegram/telegram.service.ts` — Global Menu Button

**Problem:** Bot menu button (Web App link) was only set per-chat when a dealer runs `/start`. New users had no menu button until they authenticated.

**Fixed:**
- In `initBot()`, after all handlers are registered and before launch, calls:
  ```ts
  await bot.telegram.setChatMenuButton({
    menuButton: { type: "web_app", text: "🛍 Web Do'kon", web_app: { url: storeUrl } }
  })
  ```
  — No `chatId` = sets the **global default** for all users of this bot.
- Now every user who opens the bot for the first time immediately sees the Web Store button in the menu.
- This runs on both: initial server start (all existing bots) AND when a new bot is created.

---

## 9. `backend/src/telegram/telegram.service.ts` — Fix `/menu` Command

**Problem:** `/menu` command had broken user lookup (`findFirst` without chatId filter — would return any random user in the company).

**Fixed:**
- Now looks up dealer by `telegramChatId` + `companyId` + `isApproved: true` + `isBlocked: false`
- If dealer not found: replies with `t.startOver` (asks user to run `/start` first)
- Otherwise: shows the main menu inline keyboard

---

## 10. `dashboard/src/pages/TelegramBots.tsx` — Menu Button Guidance

**Changes:**
- After bot creation: success message now says "Bot qo'shildi! Menyu tugmasi avtomatik sozlandi."
- Added info note in the create form: "Bot qo'shilganda Web Do'kon havola tugmasi Telegram menyusiga avtomatik o'rnatiladi."

---

## 11. `dashboard/src/pages/SupportTickets.tsx` — TypeScript Cleanup

**Fixed:**
- Removed unused imports: `dashboardTranslations`, `useAuthStore`
- Removed unused variable `const { language: _language } = useAuthStore()`
- Changed `selectedTicket.messages.map((msg, idx) =>` → `.map((msg) =>` (unused `idx`)

---

## 12. `landing/src/app/layout.tsx` — SEO: Search Console + JSON-LD

**Added:**
- Google Search Console verification: `metadata.verification.google` from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var
- Yandex Webmaster verification: `metadata.verification.other["yandex-verification"]` from `NEXT_PUBLIC_YANDEX_VERIFICATION` env var
- **JSON-LD structured data** (`application/ld+json`) with:
  - `@type: SoftwareApplication`
  - `applicationCategory: BusinessApplication`
  - `operatingSystem: Web, iOS, Android`
  - `offers` (free tier)
  - `author` (Organization with `sameAs`, `contactPoint`, `logo`)

**Usage:** Set env vars in `landing/.env.local`:
```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code
NEXT_PUBLIC_YANDEX_VERIFICATION=your_yandex_verification_code
```

---

## 13. `landing/src/app/[lang]/page.tsx` — Contact Section

**Added:**
- New **"Quick Contact"** section between the News section and Footer
- Shows only when at least one contact/social link is set in CMS
- Blue gradient background with prominent buttons:
  - Phone (tel: link)
  - Email (mailto: link)
  - Telegram (primary CTA button in white)
  - Instagram
- Fully multilingual (uz/ru/tr/oz/en)
- Links are managed via the Super Admin CMS tab (`/super/landing`)

---

## Summary of Files Changed

| File | Type |
|---|---|
| `admin/tsconfig.json` | Created |
| `admin/tsconfig.app.json` | Created |
| `admin/tsconfig.node.json` | Created |
| `admin/src/utils/apiError.ts` | Created |
| `admin/src/App.tsx` | Fixed typo |
| `admin/src/components/Layout.tsx` | Major improvements |
| `admin/src/pages/SuperAdmin.tsx` | Security fix + duplicate var fix |
| `backend/.env` | Added ROOT_ADMIN_PASS |
| `backend/src/super-admin/super-admin.controller.ts` | Added verify-root endpoint |
| `backend/src/telegram/telegram.service.ts` | Global menu button + /menu fix |
| `dashboard/src/pages/SupportTickets.tsx` | TS cleanup |
| `dashboard/src/pages/TelegramBots.tsx` | UX guidance |
| `landing/src/app/layout.tsx` | JSON-LD + Search Console |
| `landing/src/app/[lang]/page.tsx` | Contact section |

---

*Generated: 2026-04-11*
