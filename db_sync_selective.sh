#!/bin/bash
# ============================================================
#  SUPPLIO — Selective Database Sync (SystemSettings only)
#  Terms/Privacy/Contract matnlari serverga ko'chiriladi
# ============================================================

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

log()  { echo -e "${CYAN}[SYNC]${RESET}   $1"; }
ok()   { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn() { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
fail() { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

# 1. Local DB ma'lumotlari
# Ustuvorlik: 1) argument 2) env 3) .env fayl 4) fallback
if [ -n "$1" ]; then
    DB_URL="$1"
elif [ -n "$DATABASE_URL" ]; then
    DB_URL="$DATABASE_URL"
elif [ -f "backend/.env" ]; then
    DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d'=' -f2- | sed 's/^"//; s/"$//')
elif [ -f "backend/.env.production" ]; then
    DB_URL=$(grep "^DATABASE_URL=" backend/.env.production | cut -d'=' -f2- | sed 's/^"//; s/"$//')
fi

if [ -z "$DB_URL" ]; then
    DB_URL="postgresql://postgres:2007@127.0.0.1:5432/supplio_main"
fi

# Prisma URL dagi query parametrlar (masalan ?schema=public) pg_dump uchun muammo beradi.
DB_URL_CLEAN="${DB_URL%%\?*}"
DB_SCHEMA=$(echo "$DB_URL" | sed -n 's/.*[?&]schema=\([^&]*\).*/\1/p')
if [ -z "$DB_SCHEMA" ]; then
    DB_SCHEMA="public"
fi
BACKUP_FILE="db_backup_selective.sql"

log "SystemSettings ma'lumotlari backup qilinmoqda..."
log "Schema: $DB_SCHEMA"

# SystemSettings mavjudligi va terms qiymati tekshiruvi.
SETTINGS_INFO=$(psql "$DB_URL_CLEAN" -At -c "SELECT COUNT(*), COALESCE(MAX(GREATEST(length(COALESCE(\"termsUz\",'')), length(COALESCE(\"termsRu\",'')), length(COALESCE(\"termsEn\",'')), length(COALESCE(\"privacyUz\",'')), length(COALESCE(\"privacyRu\",'')), length(COALESCE(\"privacyEn\",'')))),0) FROM \"$DB_SCHEMA\".\"SystemSettings\";" 2>/dev/null)
if [ -z "$SETTINGS_INFO" ]; then
    fail "SystemSettings jadvali o'qilmadi. DB/schema noto'g'ri bo'lishi mumkin."
fi

SETTINGS_ROWS=$(echo "$SETTINGS_INFO" | cut -d'|' -f1)
MAX_TEXT_LEN=$(echo "$SETTINGS_INFO" | cut -d'|' -f2)

if [ "$SETTINGS_ROWS" = "0" ] || [ "$MAX_TEXT_LEN" = "0" ]; then
    fail "Lokal DBda SystemSettings matnlari bo'sh yoki qator yo'q. Avval local datani to'ldiring."
fi

log "SystemSettings qatori: $SETTINGS_ROWS, max matn uzunligi: $MAX_TEXT_LEN"

pg_dump \
    --data-only \
    --no-owner \
    --no-privileges \
    --schema="$DB_SCHEMA" \
    --table="$DB_SCHEMA.\"SystemSettings\"" \
    -d "$DB_URL_CLEAN" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    ok "Selektiv dump yaratildi: $BACKUP_FILE"
else
    echo -e "${RED}[ERROR]${RESET} Dump qilishda xatolik!"
    exit 1
fi

# File hajmini ko'rsatish
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Fayl hajmi: $SIZE"

# 2. GitHub'ga yuborish
log "GitHub'ga yuklanmoqda..."
git add "$BACKUP_FILE"
git commit -m "chore: selective database backup (SystemSettings terms/privacy) $(date +'%Y-%m-%d %H:%M:%S')"

if git push origin main; then
    ok "GitHub'ga yuborildi."
else
    warn "Push qilishda xatolik yuz berdi. Qo'lda pull qiling va qayta urining."
    exit 1
fi

echo ""
echo "=========================================================="
echo " ✓ TAYYOQ! Endi serverdagi 'bash restore_selective.sh' ni ishlating"
echo "=========================================================="
