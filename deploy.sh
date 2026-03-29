#!/bin/bash
# ============================================================
#  SUPPLIO — Deployment Engine (V4 - Seeds + Build)
#  Mode: FULL DEPLOYMENT + SEEDS (Birinchi marta yoki data reset)
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
skip() { echo -e "${YELLOW}[SKIP]${RESET}  $1"; }

cd "$REPO_DIR" || fail "Papka topilmadi: $REPO_DIR"

# RAM build vaqtida crash bo'lmasligi uchun
export NODE_OPTIONS="--max-old-space-size=2048"

# ── 1. Git pull ───────────────────────────────────────────────
log "Kodni GitHub'dan yangilamoqdamiz..."
git fetch origin main

# Qaysi fayllar o'zgarganini aniqlash (Pull qilishdan oldin)
CHANGED=$(git diff main origin/main --name-only) || CHANGED=""

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

    # Build - xatosi bo'lsa ham davom etsin (eski dist ishlatsin)
    if npx nest build 2>/dev/null; then
        ok "Backend build muvaffaqiyatli."
    else
        warn "Backend build da xatolik! Eski dist ishlatilmoqda..."
    fi
    
    if pm2 describe Backend5050 > /dev/null 2>&1; then
        pm2 restart Backend5050 --update-env
    else
        pm2 start dist/src/main.js --name Backend5050
    fi
    ok "Backend ishga tushdi."
    cd "$REPO_DIR"
}

# BACKEND SEEDS - Barcha seedlarni ishlatish
run_backend_seeds() {
    log "${BOLD}DATABASE SEEDS${RESET} ishlatilmoqda..."
    cd "$REPO_DIR/backend"
    
    # Barcha seedlarni ishlatish (seed.ts -> seed_demo.ts -> seed_landing.ts)
    log "Main seed ishlatilmoqda..."
    if npm run seed 2>/dev/null; then
        ok "Main seed yakunlandi."
    else
        warn "Main seed da xatolik, davom etilmoqda..."
    fi
    
    log "Demo seed ishlatilmoqda..."
    if npm run seed:demo 2>/dev/null; then
        ok "Demo seed yakunlandi."
    else
        warn "Demo seed da xatolik, davom etilmoqda..."
    fi
    
    log "Landing seed ishlatilmoqda..."
    if npm run seed:landing 2>/dev/null; then
        ok "Landing seed yakunlandi."
    else
        warn "Landing seed da xatolik, davom etilmoqda..."
    fi
    
    cd "$REPO_DIR"
}


# DASHBOARD
update_dashboard() {
    log "${BOLD}DASHBOARD (Vite)${RESET} yangilanmoqda..."
    cd "$REPO_DIR/dashboard"
    
    rm -rf dist node_modules
    npm install --silent --legacy-peer-deps
    
    # Build - xatosi bo'lsa ham davom etsin
    if npm run build 2>/dev/null; then
        ok "Dashboard build muvaffaqiyatli."
    else
        warn "Dashboard build da xatolik! Eski dist ishlatilmoqda..."
    fi
    
    if pm2 describe Dashboard3030 > /dev/null 2>&1; then
        pm2 restart Dashboard3030 --update-env
    else
        pm2 start npm --name Dashboard3030 -- preview
    fi
    ok "Dashboard ishga tushdi."
    cd "$REPO_DIR"
}

# LANDING
update_landing() {
    log "${BOLD}LANDING (Next.js)${RESET} yangilanmoqda..."
    cd "$REPO_DIR/landing"
    
    rm -rf .next node_modules
    npm install --silent --legacy-peer-deps
    
    # Build - xatosi bo'lsa ham davom etsin
    if npm run build 2>/dev/null; then
        ok "Landing build muvaffaqiyatli."
    else
        warn "Landing build da xatolik! Eski .next ishlatilmoqda..."
    fi
    
    if pm2 describe Landing3040 > /dev/null 2>&1; then
        pm2 restart Landing3040 --update-env
    else
        pm2 start npm --name Landing3040 -- start
    fi
    ok "Landing ishga tushdi."
    cd "$REPO_DIR"
}

# ── 3. Hammasini yangilash + Seedlarni ishlatish ──────────────

DEPLOY_ALL=0
SKIP_SEEDS=0

# Flags'ni o'qish
while [ $# -gt 0 ]; do
    case "$1" in
        --all) DEPLOY_ALL="force" ;;
        --skip-seeds) SKIP_SEEDS=1 ;;
        *) ;;
    esac
    shift
done

DEPLOYED=0

# BACKEND - HAMISHA BUILD (o'zgargan bo'lsa yoki yo'qsa ham)
update_backend
DEPLOYED=1

# SEEDS - agar --skip-seeds bo'lmasa run qil
if [ $SKIP_SEEDS -eq 0 ]; then
    run_backend_seeds
else
    skip "Seeds o'tkazib yuborildi (--skip-seeds flag)"
fi

# DASHBOARD - HAMISHA BUILD
update_dashboard
DEPLOYED=1

# LANDING - HAMISHA BUILD
update_landing
DEPLOYED=1

# ── 4. Natijani ko'rsatish ────────────────────────────────────

if [ $DEPLOYED -eq 1 ]; then
    echo ""
    ok "==============================================="
    ok " 🚀 DEPLOY MUVAFFAQIYATLI YAKUNLANDI ✅"
    ok "==============================================="
    pm2 list
fi
