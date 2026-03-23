#!/bin/bash
# ============================================================
#  SUPPLIO — Automated Deploy Script (Robust Version)
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
warn() { echo -e "${YELLOW}[SKIP]${RESET}  $1"; }
fail() { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

cd "$REPO_DIR" || fail "Papka topilmadi: $REPO_DIR"

# RAM/CPU limitini oshirish (Build vaqtida crash bo'lmasligi uchun)
export NODE_OPTIONS="--max-old-space-size=2048"

# ── 1. Git yangilash ──────────────────────────────────────────
log "Git fetch qilinmoqda..."
git fetch origin main

CHANGED=$(git diff origin/main --name-only)

if [ -z "$CHANGED" ]; then
    log "Hech qanday o'zgarish yo'q. Baribir davom etamiz (Force Deploy)..."
fi

log "Git pull boshlandi..."
if git pull origin main; then
    ok "Git pull muvaffaqiyatli yakunlandi"
else
    fail "Git pull'da xatolik! Ehtimol .env fayllarida konflikt bor."
fi

# ── 2. Build va Restart funksiyalari ──────────────────────────

has_changes() {
    [ -z "$CHANGED" ] || echo "$CHANGED" | grep -q "^$1/"
}

# Backend (NestJS + Prisma)
build_backend() {
    log "${BOLD}BACKEND${RESET} yangilanmoqda (NestJS + .env.production)..."
    cd "$REPO_DIR/backend"
    
    # Eskidan qolgan buildlarni o'chirish (ts/js chalkashmasligi uchun)
    rm -rf dist
    
    # --legacy-peer-deps versiya konfliktlarini chetlab o'tish uchun
    npm install --silent --legacy-peer-deps
    
    # .env.production faylini .env ga ko'chirib olamiz (NestJS uchun)
    if [ -f ".env.production" ]; then
        cp .env.production .env
        ok ".env.production .env ga nusxa ko'chirildi."
    fi

    # Prisma ishlatilsa generate qilinishi shart
    if [ -f "prisma/schema.prisma" ]; then
        npx prisma generate
    fi

    npx nest build
    
    # PM2 restart (fayl path: dist/src/main.js)
    # --update-env bayrog'i yangi env'larni PM2 ga tanitadi
    if pm2 describe Backend5050 > /dev/null 2>&1; then
        pm2 restart Backend5050 --update-env
    else
        pm2 start dist/src/main.js --name Backend5050
    fi
    
    ok "Backend muvaffaqiyatli yangilandi va ishga tushdi."
    cd "$REPO_DIR"
}

# Dashboard (Vite/React/PM2)
build_dashboard() {
    log "${BOLD}DASHBOARD${RESET} yangilanmoqda..."
    cd "$REPO_DIR/dashboard"
    
    npm install --silent --legacy-peer-deps
    npm run build
    
    pm2 restart Dashboard3030 || pm2 start npm --name Dashboard3030 -- start
    ok "Dashboard yangilandi."
    cd "$REPO_DIR"
}

# Landing (Next.js)
build_landing() {
    log "${BOLD}LANDING${RESET} yangilanmoqda..."
    cd "$REPO_DIR/landing"
    
    npm install --silent --legacy-peer-deps
    npm run build
    
    pm2 restart Landing3040 || pm2 start npm --name Landing3040 -- start
    ok "Landing yangilandi."
    cd "$REPO_DIR"
}

# ── 3. Ishga tushirish ────────────────────────────────────────

DEPLOYED_COUNT=0

if has_changes "backend"; then
    build_backend
    ((DEPLOYED_COUNT++))
fi

if has_changes "dashboard"; then
    build_dashboard
    ((DEPLOYED_COUNT++))
fi

if has_changes "landing"; then
    build_landing
    ((DEPLOYED_COUNT++))
fi

# ── 4. Natija ─────────────────────────────────────────────────

echo ""
if [ $DEPLOYED_COUNT -gt 0 ]; then
    ok "======================================"
    ok " $DEPLOYED_COUNT ta xizmat yangilandi ✅"
    ok "======================================"
    pm2 list
else
    warn "Hech qanday o'zgarish aniqlanmadi (Skip)."
fi



