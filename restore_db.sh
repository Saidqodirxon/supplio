#!/bin/bash
# ============================================================
#  SUPPLIO — One-time Database Restore Script
#  Use this to manually restore from db_backup.sql
# ============================================================

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

log()  { echo -e "${CYAN}[RESTORE]${RESET} $1"; }
ok()   { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn() { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
fail() { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

REPO_DIR="/root/supplio"
cd "$REPO_DIR" || fail "Papka topilmadi: $REPO_DIR"

# 1. Zaxira faylini tekshirish
if [ ! -f "db_backup.sql" ]; then
    fail "db_backup.sql fayli topilmadi! Oldin 'bash db_sync.sh' qiling."
fi

# 2. .env faylidan DATABASE_URL ni olish
if [ -f "backend/.env.production" ]; then
    DB_URL=$(grep DATABASE_URL backend/.env.production | cut -d '"' -f 2)
elif [ -f "backend/.env" ]; then
    DB_URL=$(grep DATABASE_URL backend/.env | cut -d '"' -f 2)
fi

if [ -z "$DB_URL" ]; then
    fail "DATABASE_URL topilmadi! Backend .env faylini tekshiring."
fi

# 3. Tiklashdan oldin tasdiqlash
echo -e "${RED}${BOLD}DIQQAT!${RESET} Ushbu amal mavjud barcha ma'lumotlarni o'chirib yuboradi."
read -p "Davom etaylikmi? (y/n): " confirm

if [[ $confirm != "y" ]]; then
    log "Amal bekor qilindi."
    exit 0
fi

# 4. Tiklash (Restore)
log "Bazani yangilash boshlandi..."
if psql "$DB_URL" < db_backup.sql; then
    ok "Baza muvaffaqiyatli tiklandi! ✅"
else
    fail "Xatolik yuz berdi. Postgres auth yoki DB_URL noto'g'ri."
fi
