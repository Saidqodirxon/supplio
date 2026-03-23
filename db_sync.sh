#!/bin/bash
# ============================================================
#  SUPPLIO — Database Sync & Backup Script
# ============================================================

# 1. Lokal DB ma'lumotlari (backend/.env dan olindi)
DB_URL="postgresql://postgres:2007@127.0.0.1:5432/supplio_main"
BACKUP_FILE="db_backup.sql"

echo "[DB-SYNC] Ma'lumotlar bazasini saqlash boshlandi..."

# Ma'lumotlarni faylga yuklash (--clean --if-exists bilan, eski datalarni ochirib yozish uchun)
if pg_dump --clean --if-exists -d "$DB_URL" > "$BACKUP_FILE"; then
    echo "[OK] Ma'lumotlar $BACKUP_FILE fayliga saqlandi (Overwrite mode)."
else
    echo "[ERROR] Dump qilishda xatolik yuz berdi!"
    exit 1
fi

# 2. GitHub'ga yuborish
echo "[DB-SYNC] GitHub'ga yuklanmoqda..."
git add "$BACKUP_FILE"
git commit -m "chore: database backup $(date +'%Y-%m-%d %H:%M:%S')"
if git push origin main; then
    echo "[OK] GitHub'ga yuborildi."
else
    echo "[ERROR] Push qilishda xatolik!"
    exit 1
fi

echo "=========================================================="
echo " ENDI SERVERDA 'bash deploy.sh' NI ISHLATING."
echo " DB avtomatik ravishda yangilanadi (deploy.sh yangilandi)."
echo "=========================================================="
