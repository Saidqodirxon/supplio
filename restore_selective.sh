#!/bin/bash
# ============================================================
#  SUPPLIO — Selective Database Restore (Server)
#  Terms, categories va boshqa datalarni qabul qiladi (tarifflar saqlanadi)
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

# 1. Fayl tekshirish
if [ ! -f "db_backup_selective.sql" ]; then
    fail "db_backup_selective.sql fayli topilmadi! Oldin lokal 'bash db_sync_selective.sh' qiding."
fi

log "Faylni tekshiryapman..."

# 2. Production .env faylidan oxiri o'qish
if [ -f "backend/.env.production" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" backend/.env.production | cut -d'=' -f2 | sed 's/"//g')
elif [ -f "backend/.env" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d'=' -f2 | sed 's/"//g')
fi

if [ -z "$DATABASE_URL" ]; then
    fail "DATABASE_URL topilmadi yoki bo'sh!"
fi

log "Database URL parslanmoqda..."

# 3. Connection parameters
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:/]+):?([0-9]*)?/([^/?]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]:-5432}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    fail "DATABASE_URL noto'g'ri formatda!"
fi

log "Ma'lumotlar:"
log "  Host: $DB_HOST"
log "  Port: $DB_PORT"
log "  Database: $DB_NAME"
log "  User: $DB_USER"

# 4. Confirmation
echo ""
echo -e "${RED}${BOLD}DIQQAT!${RESET} Bu amal quyidagini qiladi:"
echo "  ✓ Terms, categories, units, settings kabi datalarni YANGILAYDI"
echo "  ✓ Tarifflar va buyurtmalar SAQLANIB QOLADI (o'chirilmaydi)"
echo ""
read -p "Davom etaylikmi? (y/n): " confirm

if [[ $confirm != "y" ]]; then
    log "Amal bekor qilindi."
    exit 0
fi

# 5. PGPASSWORD bilan tiklash
export PGPASSWORD="$DB_PASS"

log "Ma'lumotlar bazasi tiklanmoqda..."

if psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" \
    --no-password -f db_backup_selective.sql > /dev/null 2>&1; then
    ok "Ma'lumotlar bazasi muvaffaqiyatli tikland!"
else
    fail "Tiklashda xatolik!"
fi

unset PGPASSWORD

# 6. Verification
log "Tekshiryapman..."
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" \
  --no-password -t -c "SELECT count(*) FROM pg_tables WHERE schemaname='public';" 2>/dev/null || echo "0")

ok "Jami tablolar: $TABLE_COUNT"

echo ""
echo "=========================================================="
echo " ✓ TAYYOQ! Terms va boshqa datalar yangilandi"
echo " ✓ Tarifflar saqlanib qoldi"
echo ""
echo " Endi backend'ni qayta ishlat:"
echo "   npm run start:prod"
echo "=========================================================="
