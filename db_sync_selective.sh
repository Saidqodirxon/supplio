#!/bin/bash
# ============================================================
#  SUPPLIO — Selective Database Sync (Terms, Categories, etc.)
#  Tarifflar MUTLAQO SAQLANADI, faqat qolgan datalar yuboriladi
# ============================================================

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

log()  { echo -e "${CYAN}[SYNC]${RESET}   $1"; }
ok()   { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn() { echo -e "${YELLOW}[WARN]${RESET}  $1"; }

# 1. Local DB ma'lumotlari
DB_URL="postgresql://postgres:2007@127.0.0.1:5432/supplio_main"
BACKUP_FILE="db_backup_selective.sql"

log "Selektiv ma'lumotlar bazasi barkarorlanmoqda (tarifflar ISTISNO)..."

# ============================================================
# Exclude tables (bu tablalarni SAQLAMIZ, dump-ga kiritmaymiz):
# ============================================================
# EXCLUDE_TABLES:
#   - tariffs: tarif ma'lumotlari (saqlanadi)
#   - orders: buyurtmalar (saqlanadi)
#   - transactions: tranzaksiyalar (saqlanadi)
#   - invoices: hisob-kitoblar (saqlanadi)
#   - notifications: bildirishnomalar (saqlanadi)
# 
# INCLUDE (dump-ga kiritiladi):
#   - categories: kategoriyalar
#   - units: o'lchov birliklari
#   - company_settings: kompaniya sozlamalari
#   - terms: shartlar va yo'riqnomalar
#   - support_contacts: qo'llab-quvvatlash aloqalari
#   - system_settings: global sozlamalar
# ============================================================

# pg_dump bilan exclude qilish
pg_dump \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --exclude-table-data=tariffs \
  --exclude-table-data=orders \
  --exclude-table-data=transactions \
  --exclude-table-data=invoices \
  --exclude-table-data=notifications \
  --exclude-table-data=analytics \
  --exclude-table-data=dealer_activity \
  -d "$DB_URL" > "$BACKUP_FILE"

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
