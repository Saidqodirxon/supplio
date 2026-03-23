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

# 2. .env faylidan ma'lumotlarni olish
if [ -f "backend/.env.production" ]; then
    URL=$(grep DATABASE_URL backend/.env.production | cut -d '"' -f 2 | cut -d '?' -f 1)
elif [ -f "backend/.env" ]; then
    URL=$(grep DATABASE_URL backend/.env | cut -d '"' -f 2 | cut -d '?' -f 1)
fi

if [[ $URL =~ postgresql://([^:]+):([^@]+)@([^:/]+):?([0-9]*)?/([^/]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]:-5432}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    fail "DATABASE_URL noto'g'ri formatda yoki topilmadi!"
fi

# 3. Tiklashdan oldin tasdiqlash
echo -e "${RED}${BOLD}DIQQAT!${RESET} Ushbu amal [${DB_NAME}] bazasidagi barcha ma'lumotlarni o'chirib yuboradi."
read -p "Davom etaylikmi? (y/n): " confirm

if [[ $confirm != "y" ]]; then
    log "Amal bekor qilindi."
    exit 0
fi

# 4. Tiklash (Restore)
log "[OVERWRITE] Bazani majburiy tozalash va tiklash boshlandi ($DB_HOST:$DB_PORT)..."

# PGPASSWORD orqali parolni uzatamiz
export PGPASSWORD="$DB_PASS"

# 4.1 Sxemani mutlaqo tozalash (DROP and RECREATE public schema)
log "Sxemani (public) tozalash boshlandi..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" > /dev/null 2>&1; then
    ok "Baza tozalandi."
else
    warn "Bazani tozalashda muammo (schema topilmadi, lekin davom etamiz)."
fi

# 4.2 Fayldan tiklash
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < db_backup.sql; then
    ok "Baza muvaffaqiyatli tiklandi! ✅"
else
    fail "Xatolik! Dump faylni yuklashda muammo bo'ldi."
fi

# Tozalash
unset PGPASSWORD
