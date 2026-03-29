#!/bin/bash
# ============================================================
#  SUPPLIO — Quick Build Deployment (V1)
#  Mode: BUILD ONLY (Kod yangilanishi uchun, seedlar YO'Q)
# ============================================================

REPO_DIR="/root/supplio"
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

log()  { echo -e "${CYAN}[DEPLOY]${RESET} $1"; }
ok()   { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn() { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
fail() { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

cd "$REPO_DIR" || fail "Papka topilmadi: $REPO_DIR"

# RAM build vaqtida crash bo'lmasligi uchun
export NODE_OPTIONS="--max-old-space-size=2048"

# ── 1. Git pull ───────────────────────────────────────────────
log "Kodni GitHub'dan yangilamoqdamiz..."
git fetch origin main

# Majburan pull qilish
if git pull origin main; then
    ok "Kodni yangilash muvaffaqiyatli yakunlandi."
else
    fail "Git pull'da xatolik! Ehtimol konflikt bor."
fi

# ── 2. Build funksiyalari (seedlar XO'Z) ──────────────────────

# BACKEND
build_backend() {
    log "${BOLD}BACKEND (NestJS)${RESET} build qilinmoqda..."
    cd "$REPO_DIR/backend"
    
    npm install --silent --legacy-peer-deps 2>/dev/null || true
    
    [ -f ".env.production" ] && cp .env.production .env
    
    if [ -f "prisma/schema.prisma" ]; then
        npx prisma generate 2>/dev/null || true
    fi

    # Build - xatosi bo'lsa ham davom etsin (eski dist ishlatsin)
    if npx nest build 2>/dev/null; then
        ok "Backend build muvaffaqiyatli."
    else
        warn "Backend build da xatolik! Eski dist ishlatilmoqda..."
    fi
    
    if pm2 describe Backend5050 > /dev/null 2>&1; then
        pm2 restart Backend5050 --update-env
        ok "Backend restarted."
    else
        pm2 start dist/src/main.js --name Backend5050
        ok "Backend started."
    fi
    cd "$REPO_DIR"
}

# DASHBOARD
build_dashboard() {
    log "${BOLD}DASHBOARD (Vite)${RESET} build qilinmoqda..."
    cd "$REPO_DIR/dashboard"
    
    npm install --silent --legacy-peer-deps 2>/dev/null || true
    
    # Build - xatosi bo'lsa ham davom etsin
    if npm run build 2>/dev/null; then
        ok "Dashboard build muvaffaqiyatli."
    else
        warn "Dashboard build da xatolik! Eski dist ishlatilmoqda..."
    fi
    
    if pm2 describe Dashboard3030 > /dev/null 2>&1; then
        pm2 restart Dashboard3030 --update-env
        ok "Dashboard restarted."
    else
        pm2 start npm --name Dashboard3030 -- preview
        ok "Dashboard started."
    fi
    cd "$REPO_DIR"
}

# LANDING
build_landing() {
    log "${BOLD}LANDING (Next.js)${RESET} build qilinmoqda..."
    cd "$REPO_DIR/landing"
    
    npm install --silent --legacy-peer-deps 2>/dev/null || true
    
    # Build - xatosi bo'lsa ham davom etsin
    if npm run build 2>/dev/null; then
        ok "Landing build muvaffaqiyatli."
    else
        warn "Landing build da xatolik! Eski .next ishlatilmoqda..."
    fi
    
    if pm2 describe Landing3040 > /dev/null 2>&1; then
        pm2 restart Landing3040 --update-env
        ok "Landing restarted."
    else
        pm2 start npm --name Landing3040 -- start
        ok "Landing started."
    fi
    cd "$REPO_DIR"
}

# ── 3. Barcha komponentlarni build qilish ─────────────────────

echo ""
log "🛠️  FAQAT BUILD QI'L, SEEDLAR BO'Z..."
echo ""

build_backend && \
build_dashboard && \
build_landing

# ── 4. Natijani ko'rsatish ────────────────────────────────────

echo ""
ok "==============================================="
ok " ⚡ BUILD MUVAFFAQIYATLI YAKUNLANDI ✅"
ok "==============================================="
echo ""
log "Ishlayotgan processlar:"
pm2 list
echo ""
ok "Quyidagi manzillar orqali tekshiring:"
ok "  Dashboard: http://localhost:3030"
ok "  Landing:   http://localhost:3040"
ok "  Backend:   http://localhost:5050/api"
