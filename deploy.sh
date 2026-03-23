#!/bin/bash
# ============================================================
#  SUPPLIO — Deployment Engine (V3 - Stable)
# ============================================================

set -e

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

# Qaysi fayllar o'zgarganini aniqlash (Pull qilishdan oldin)
CHANGED=$(git diff main origin/main --name-only)

# Majburan pull qilish
if git pull origin main; then
    ok "Kodni yangilash muvaffaqiyatli yakunlandi."
else
    fail "Git pull'da xatolik! Ehtimol konflikt bor."
fi

# ── 2. Xizmatlarni yangilash funksiyalari ──────────────────────

has_changes() {
    [ "$1" == "force" ] || echo "$CHANGED" | grep -q "^$1/"
}

# BACKEND
update_backend() {
    log "${BOLD}BACKEND (NestJS)${RESET} yangilanmoqda..."
    cd "$REPO_DIR/backend"
    
    rm -rf dist node_modules
    npm install --silent --legacy-peer-deps
    
    [ -f ".env.production" ] && cp .env.production .env && ok "Backend: .env.production nusxalandi."
    
    if [ -f "prisma/schema.prisma" ]; then
        npx prisma generate
    fi

    npx nest build
    
    if pm2 describe Backend5050 > /dev/null 2>&1; then
        pm2 restart Backend5050 --update-env
    else
        pm2 start dist/src/main.js --name Backend5050
    fi
    ok "Backend yangilandi."
    cd "$REPO_DIR"
}

# DASHBOARD
update_dashboard() {
    log "${BOLD}DASHBOARD (Vite)${RESET} yangilanmoqda..."
    cd "$REPO_DIR/dashboard"
    
    rm -rf dist node_modules
    npm install --silent --legacy-peer-deps
    
    npm run build
    
    if pm2 describe Dashboard3030 > /dev/null 2>&1; then
        pm2 restart Dashboard3030 --update-env
    else
        pm2 start npm --name Dashboard3030 -- preview
    fi
    ok "Dashboard yangilandi."
    cd "$REPO_DIR"
}

# LANDING
update_landing() {
    log "${BOLD}LANDING (Next.js)${RESET} yangilanmoqda..."
    cd "$REPO_DIR/landing"
    
    rm -rf .next node_modules
    npm install --silent --legacy-peer-deps
    
    npm run build
    
    if pm2 describe Landing3040 > /dev/null 2>&1; then
        pm2 restart Landing3040 --update-env
    else
        pm2 start npm --name Landing3040 -- start
    fi
    ok "Landing yangilandi."
    cd "$REPO_DIR"
}

# ── 3. Hammasini yangilash boshlandi ──────────────────────────

DEPLOY_ALL=0
[ "$1" == "all" ] && DEPLOY_ALL="force"

DEPLOYED=0

if has_changes "backend" || [ "$DEPLOY_ALL" == "force" ]; then
    update_backend
    DEPLOYED=1
else
    warn "Backend o'zgarmadi, o'tkazib yuborildi."
fi

if has_changes "dashboard" || [ "$DEPLOY_ALL" == "force" ]; then
    update_dashboard
    DEPLOYED=1
else
    warn "Dashboard o'zgarmadi, o'tkazib yuborildi."
fi

if has_changes "landing" || [ "$DEPLOY_ALL" == "force" ]; then
    update_landing
    DEPLOYED=1
else
    warn "Landing o'zgarmadi, o'tkazib yuborildi."
fi

# ── 4. Natijani ko'rsatish ────────────────────────────────────

if [ $DEPLOYED -eq 1 ]; then
    echo ""
    ok "==============================================="
    ok " YANGILANISH MUVAFFAQIYATLI YAKUNLANDI ✅"
    ok "==============================================="
    pm2 list
else
    echo ""
    warn "Hech qanday o'zgarish aniqlanmadi, hech narsa yangilanmadi."
fi
