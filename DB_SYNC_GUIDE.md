# 📊 Selektiv Database Sync Qo'llanmasi

## 🎯 Maqsadi

Lokal mock datalarni (terms, categories, settings va boshqa) serverdaga yuborishni, **tarifflar, buyurtmalar va boshqa kritik datalarni saqlab qolishni** ta'minlaydi.

---

## 📋 Sync Ketma-ketligi

### 1️⃣ **Lokal kompyuterda (Local Machine)**

Barkaror ma'lumotlarni lokal DBdan cherry-pick qiling:

```bash
cd /e/projects/realcoder/supplio
bash db_sync_selective.sh
```

**Bu script quyidagini bajaradi:**

- ✅ **Qo'shiladi (dump-ga):** Categories, Units, Terms, Support Contacts, System Settings, Company Settings
- ❌ **Istisno qilinadi:** Tariffs, Orders, Transactions, Invoices, Notifications, Analytics
- 📤 GitHub'ga `db_backup_selective.sql` faylini push qiladi

---

### 2️⃣ **Server'da (Production Server)**

SSH orqali server'ga kirish:

```bash
cd /root/supplio

# GitHub'dan yangi datalarni pull qiling
git pull origin main

# Selective restore qo'llang
bash restore_selective.sh
```

**Confirm qilgandan so'ng:**

- ✅ New terms, categories, va settings qabul qilinadi
- ✅ Tarifflar va buyurtmalar **o'chirilmaydi** va **o'zgarmaydi**
- ✅ Connection test va stats ko'rsatiladi

---

## 📊 Qaysi Tablalar Sync Qilinadi?

### ✅ **Sync-lanadi (Include)**

| Tabla              | Maqsadi                             |
| ------------------ | ----------------------------------- |
| `categories`       | Tovarlar kategoriyalari             |
| `units`            | O'lchov birliklari (kg, dona, litr) |
| `company_settings` | Kompaniya sozlamalari               |
| `terms`            | Payment terms, shartlar             |
| `support_contacts` | Qo'llab-quvvatlash aloqalari        |
| `system_settings`  | Global sistema sozlamalari          |

### ❌ **Saqlanadi (Exclude)**

| Tabla           | Sababi                                                          |
| --------------- | --------------------------------------------------------------- |
| `tariffs`       | ₹ Sotib olish narxlari - serverdagi ma'lumotlarni saqlab qolish |
| `orders`        | 📦 Mavjud buyurtmalar - saqlab qolish                           |
| `transactions`  | 💳 To'lov tarixlari - saqlab qolish                             |
| `invoices`      | 🧾 Hisob-kitoblar - saqlab qolish                               |
| `notifications` | 🔔 Yuborilgan bildirishnomalar - saqlab qolish                  |
| `analytics`     | 📈 Tahlil ma'lumotlari - saqlab qolish                          |

---

## 🔄 Qayta Yuborish (Re-sync)

Agar keyinroq termlarni yoki kategoriyalarni o'zgartirsangiz:

```bash
# Lokal'da
bash db_sync_selective.sh

# Server'da
bash restore_selective.sh
```

**Tarifflar va buyurtmalar har doim saqlanib qoladi!**

---

## 💡 Tips

### Faqat Tarifflarni Sync Qilish

Agar tarifflarni ham sync qilmoqchi bo'lsangiz, oddiy `db_sync.sh` ishlating:

```bash
bash db_sync.sh          # Lokal'da
```

### Specific Tabla Sync Qilish

Faqat `categories` jadvalini sync qilish:

```bash
pg_dump -t categories postgresql://user:pass@host/db > categories.sql
```

### Full Restore (Barcha Ma'lumotlar)

Agar barcha narsani qayta yuborishni istasangiz:

```bash
bash restore_db.sh  # Lokal dumpdan
```

---

## 🆘 Muammolar

### **ERROR: "db_backup_selective.sql fayli topilmadi"**

→ Avval lokal'da `bash db_sync_selective.sh` qiling

### **ERROR: "DATABASE_URL topilmadi"**

→ `/root/supplio/backend/.env.production` fayli mavjudligini tekshiring

### **ERROR: "psql: command not found"**

→ Server'da PostgreSQL client o'rnatilmagan:

```bash
apt-get update && apt-get install -y postgresql-client
```

---

## 📝 Script Fayllar

| Fayl                   | Joyi          | Maqsadi                         |
| ---------------------- | ------------- | ------------------------------- |
| `db_sync_selective.sh` | Root          | Lokal DB dan selektiv dump      |
| `restore_selective.sh` | Root (server) | Server da restore qilish        |
| `db_sync.sh`           | Root          | Barcha datalarni dump qilish    |
| `restore_db.sh`        | Root (server) | Barcha datalarni restore qilish |

---

**✅ Tayyoq bo'ldi! Terms, categories, va boshqa sozlamalarni osonlikcha server'ga yuborish endi mumkin!** 🚀
