#!/bin/bash
# ============================================================
#  SUPPLIO — Selective Database Sync (Terms, Categories, etc.)
#  Tarifflar MUTLAQO SAQLANADI, faqat qolgan datalar yuboriladi
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
# .env dagi DATABASE_URL bo'lsa o'shani olamiz, bo'lmasa fallback URL ishlatamiz.
if [ -f "backend/.env" ]; then
    DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d'=' -f2- | sed 's/^"//; s/"$//')
elif [ -f "backend/.env.production" ]; then
    DB_URL=$(grep "^DATABASE_URL=" backend/.env.production | cut -d'=' -f2- | sed 's/^"//; s/"$//')
fi

if [ -z "$DB_URL" ]; then
    DB_URL="postgresql://postgres:2007@127.0.0.1:5432/supplio_main"
fi

# Prisma URL dagi query parametrlar (masalan ?schema=public) pg_dump uchun muammo beradi.
DB_URL_CLEAN="${DB_URL%%\?*}"
BACKUP_FILE="db_backup_selective.sql"

log "Selektiv ma'lumotlar bazasi barkarorlanmoqda (tarifflar ISTISNO)..."

# Faqat kerakli mock/settings tablalarni ko'chiramiz (orders/tariffs umuman dump qilinmaydi).
TABLE_QUERY="SELECT quote_ident(table_schema) || '.' || quote_ident(table_name)
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'system_settings','categories','units','support_contacts','company_settings',
        'SystemSettings','Category','Unit','SupportContact','CompanySettings'
    )
ORDER BY 1;"

TABLE_LIST=$(psql "$DB_URL_CLEAN" -At -c "$TABLE_QUERY" 2>/dev/null)

if [ -z "$TABLE_LIST" ]; then
        fail "Ko'chirish uchun mos table topilmadi. DB nomi/yoki schema ni tekshiring."
fi

TABLE_ARGS=()
while IFS= read -r tbl; do
        [ -n "$tbl" ] && TABLE_ARGS+=("--table=$tbl")
done <<< "$TABLE_LIST"

pg_dump \
    --data-only \
    --disable-triggers \
    --no-owner \
    --no-privileges \
    "${TABLE_ARGS[@]}" \
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
git commit -m "chore: selective database backup (terms, categories, etc.) $(date +'%Y-%m-%d %H:%M:%S')"

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
