#!/bin/bash
# ============================================================
#  SUPPLIO — Automated Deploy Script (Final Version)
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

# Backend (Node.js/NestJS)
build_backend() {
    log "${BOLD}BACKEND${RESET} yangilanmoqda (Port: 8999/5050)..."
    cd "$REPO_DIR/backend"
    
    npm install --silent
    npm run build
    
    pm2 restart Backend5050 || pm2 start dist/main.js --name Backend5050
    ok "Backend yangilandi."
    cd "$REPO_DIR"
}

# Dashboard (React/Vue/Static)
build_dashboard() {
    log "${BOLD}DASHBOARD${RESET} yangilanmoqda (Port: 3030)..."
    cd "$REPO_DIR/dashboard"
    
    npm install --silent
    npm run build
    
    # Dashboard PM2'da bo'lgani uchun restart qilamiz
    pm2 restart Dashboard3030 || pm2 start npm --name Dashboard3030 -- start
    ok "Dashboard yangilandi."
    cd "$REPO_DIR"
}

# Landing (Next.js)
build_landing() {
    log "${BOLD}LANDING${RESET} yangilanmoqda (Port: 3040)..."
    cd "$REPO_DIR/landing"
    
    npm install --silent
    npm run build
    
    # Next.js bo'lgani uchun PM2 orqali restart
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


