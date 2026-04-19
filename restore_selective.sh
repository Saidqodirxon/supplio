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

# 2. Production URL ni olish
# Ustuvorlik: 1) argument 2) env 3) backend env fayllari
if [ -n "$1" ]; then
    DATABASE_URL="$1"
elif [ -n "$DATABASE_URL" ]; then
    DATABASE_URL="$DATABASE_URL"
elif [ -f "backend/.env.production" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" backend/.env.production | cut -d'=' -f2- | sed 's/^"//; s/"$//')
elif [ -f "backend/.env" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d'=' -f2- | sed 's/^"//; s/"$//')
fi

if [ -z "$DATABASE_URL" ]; then
    fail "DATABASE_URL topilmadi yoki bo'sh!"
fi

DB_SCHEMA=$(echo "$DATABASE_URL" | sed -n 's/.*[?&]schema=\([^&]*\).*/\1/p')
if [ -z "$DB_SCHEMA" ]; then
    DB_SCHEMA="public"
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
log "  Schema: $DB_SCHEMA"

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

# Turli Postgres versiyalari orasida moslik uchun backup SQL ni tayyorlaymiz.
# Masalan, eski serverlarda `SET transaction_timeout` parametri bo'lmasligi mumkin.
TMP_SQL=$(mktemp /tmp/restore_selective.XXXXXX.sql)
trap 'rm -f "$TMP_SQL"' EXIT
sed -e '/^SET transaction_timeout =/d' \
    -e '/^ALTER TABLE .* DISABLE TRIGGER ALL;/d' \
    -e '/^ALTER TABLE .* ENABLE TRIGGER ALL;/d' \
    db_backup_selective.sql > "$TMP_SQL"

# Faqat selektiv import qilinadigan tablalarni oldindan tozalaymiz.
TRUNCATE_QUERY="SELECT quote_ident(table_schema) || '.' || quote_ident(table_name)
FROM information_schema.tables
WHERE table_schema = '$DB_SCHEMA'
    AND table_name IN (
        'system_settings','categories','units','support_contacts','company_settings',
        'SystemSettings','Category','Unit','SupportContact','CompanySettings'
    )
ORDER BY 1;"

TRUNCATE_TABLES=$(psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" --no-password -At -c "$TRUNCATE_QUERY" 2>/dev/null)

if [ -n "$TRUNCATE_TABLES" ]; then
    while IFS= read -r tbl; do
        if [ -n "$tbl" ]; then
            psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" --no-password -v ON_ERROR_STOP=1 -c "TRUNCATE TABLE $tbl CASCADE;" >/dev/null 2>&1 || fail "TRUNCATE xatolik: $tbl"
        fi
    done <<< "$TRUNCATE_TABLES"
fi

if psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" \
    --no-password -v ON_ERROR_STOP=1 -f "$TMP_SQL" > restore_selective.log 2>&1; then
    ok "Ma'lumotlar bazasi muvaffaqiyatli tikland!"
else
    warn "restore_selective.log ichida xatolik tafsilotlari bor."
    tail -n 30 restore_selective.log
    fail "Tiklashda xatolik!"
fi

unset PGPASSWORD

# 6. Verification
log "Tekshiryapman..."
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" \
    --no-password -At -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='$DB_SCHEMA';" 2>/dev/null)

SETTINGS_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" \
    --no-password -At -c "SELECT count(*) FROM \"SystemSettings\";" 2>/dev/null)

if [ -z "$TABLE_COUNT" ]; then
    TABLE_COUNT="0"
fi

if [ -z "$SETTINGS_COUNT" ]; then
    SETTINGS_COUNT="0"
fi

ok "Jami tablolar: $TABLE_COUNT"
ok "SystemSettings qatorlari: $SETTINGS_COUNT"

echo ""
echo "=========================================================="
echo " ✓ TAYYOQ! Terms va boshqa datalar yangilandi"
echo " ✓ Tarifflar saqlanib qoldi"
echo ""
echo " Endi backend'ni qayta ishlat:"
echo "   cd backend && npm run start:prod"
echo "=========================================================="
