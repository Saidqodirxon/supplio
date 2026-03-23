#!/bin/bash
# ============================================================
#  SUPPLIO — Manual Deploy Script
#  Usage: bash deploy.sh
#  /root/supplio da ishga tushiring
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

# ── 1. Git pull ───────────────────────────────────────────────
log "Git pull boshlandi..."
git fetch origin main

CHANGED=$(git diff origin/main --name-only)

if [ -z "$CHANGED" ]; then
  ok "Hech qanday o'zgarish yo'q. Deploy kerak emas."
  exit 0
fi

log "O'zgargan fayllar:"
echo "$CHANGED" | sed 's/^/  → /'

git pull origin main
ok "Git pull bajarildi"

# ── 2. Funksiyalar ────────────────────────────────────────────

has_changes() {
  echo "$CHANGED" | grep -q "^$1/"
}

build_backend() {
  log "${BOLD}BACKEND${RESET} yangilanmoqda..."
  cd "$REPO_DIR/backend"

  npm install --silent
  npm run build

  # PM2 bilan restart
  if pm2 describe supplio-backend > /dev/null 2>&1; then
    pm2 restart supplio-backend
    ok "Backend PM2 restart bajarildi"
  else
    pm2 start dist/src/main.js --name supplio-backend
    pm2 save
    ok "Backend PM2 ishga tushirildi"
  fi

  cd "$REPO_DIR"
}

build_dashboard() {
  log "${BOLD}DASHBOARD${RESET} yangilanmoqda..."
  cd "$REPO_DIR/dashboard"

  npm install --silent
  npm run build

  # Nginx uchun statik fayllar dist/ ga tushadi, nginx qayta start shart emas
  ok "Dashboard build bajarildi (dist/ tayyor)"

  cd "$REPO_DIR"
}

build_landing() {
  log "${BOLD}LANDING${RESET} yangilanmoqda..."
  cd "$REPO_DIR/landing"

  npm install --silent
  npm run build

  if pm2 describe supplio-landing > /dev/null 2>&1; then
    pm2 restart supplio-landing
    ok "Landing PM2 restart bajarildi"
  else
    pm2 start npm --name supplio-landing -- start
    pm2 save
    ok "Landing PM2 ishga tushirildi"
  fi

  cd "$REPO_DIR"
}

# ── 3. Qaysi papka o'zgardi? ──────────────────────────────────

DEPLOYED=0

if has_changes "backend"; then
  build_backend
  DEPLOYED=1
else
  warn "backend/ da o'zgarish yo'q — skip"
fi

if has_changes "dashboard"; then
  build_dashboard
  DEPLOYED=1
else
  warn "dashboard/ da o'zgarish yo'q — skip"
fi

if has_changes "landing"; then
  build_landing
  DEPLOYED=1
else
  warn "landing/ da o'zgarish yo'q — skip"
fi

# ── 4. Yakuniy holat ──────────────────────────────────────────
echo ""
if [ $DEPLOYED -eq 1 ]; then
  ok "======================================"
  ok " DEPLOY MUVAFFAQIYATLI BAJARILDI ✅"
  ok "======================================"
  pm2 list
else
  warn "Hech narsa deploy qilinmadi."
fi
