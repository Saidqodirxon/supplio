# 🚀 Deploy Skriptlari Qo'llanma

## 2 Ta Deploy Mode

### 1. **deploy.sh** - To'liq Deploy + Seeds

**Qachon ishlatamiz**: Birinchi marta deploy yoki database reset kerak bo'lsa

```bash
# Asosiy - barcha seedlarni ishlatib to'liq deploy
bash /root/supplio/deploy.sh

# Seeds o'tkazib yuborish (shunchaki build qil uchun)
bash /root/supplio/deploy.sh --skip-seeds
```

**Nima qiladi**:

- ✅ Git pull
- ✅ Backend, Dashboard, Admin, Landing build
- ✅ **Barcha seeds ishlatadi** (seed → seed:demo → seed:landing)
- ✅ Build xatosi bo'lsa ham eski dist ishlatadi, to'xtamadi
- ✅ PM2 orqali restart/start
- ✅ Prisma migrate + db push orqali schema sinxronlanadi

---

### 2. **deploy-build.sh** - Faqat Build (seedlar YO'Q)

**Qachon ishlatamiz**: Kod o'zgarganda, seedlarni qayta ishlatmayman

```bash
# Kod yangilash (tezroq)
bash /root/supplio/deploy-build.sh
```

**Nima qiladi**:

- ✅ Git pull
- ✅ Backend, Dashboard, Admin, Landing build **ONLY**
- ❌ **SEEDLAR TO'XTALGAN** (data qoladi)
- ✅ Build xatosi bo'lsa ham davom etadi
- ✅ PM2 orqali restart/start
- ✅ Prisma migrate + db push orqali schema sinxronlanadi

---

## Qo'llanma

### Birinchi marta (Fresh Deploy + Seeds)

```bash
cd /root/supplio
bash deploy.sh
```

Bu 30-40 daqiqa vaqt oladi (seeds katta).

### Kod o'zgardi (quick update)

```bash
cd /root/supplio
bash deploy-build.sh
```

Bu 5-10 daqiqa oladi (seedlar emas, faqat build).

### Agar database reset kerak bo'lsa

```bash
cd /root/supplio
bash deploy.sh --skip-seeds
# yoki
bash deploy.sh
```

---

## Build Xatosiga Nisbatan Ishonch

**Muhim**: Agar build da xatolik bo'lsa:

- ✅ **Eski dist saqlanib qoladi** (o'chiriladi emas)
- ✅ **Qolgan processlar to'xtamadi** (continue etadi)
- ✅ **PM2 eski version bilan ishlashda davom etadi**
- ❌ Yangi kod deploy qilina olmadi (eski ishlatiladi)

Buning uchun hech narsani o'chirmaydi, faqat "warn" chiqaradi.

---

## Environment Variables

Kerakli `.env.production` fayllar:

- `/root/supplio/backend/.env.production` (DATABASE_URL, JWT_SECRET va boshqalar)

---

## PM2 Processlar

Quyidagilar PM2 orqali run bo'ladi:

- **Backend5050** - NestJS (port 5050)
- **Dashboard3030** - React/Vite (port 3030)
- **Admin3050** - React/Vite (port 3050)
- **Landing3040** - Next.js (port 3040)

**Qulayliq**:

```bash
pm2 list                    # Barcha processlarni ko'r
pm2 logs Backend5050        # Backend logsni ko'r
pm2 restart Backend5050     # Qayta start
pm2 stop Backend5050        # To'xtat
```

---

## Demo Mode Uchun Seedlar

Seedlar quyidagilarni yaratadi:

1. **seed.ts** - Asosiy super-admin user
2. **seed:demo** - Demo company + data (5 branches, 30 dealers, 180 products, 140 orders)
3. **seed:landing** - Landing page uchun static data

Demo orqali kirish:

- URL: `https://demo.supplio.uz/login`
- Phone: `+998000000000`
- Password: `demo1234`
- **Birinchida**: Read-only (ko'rish uchun)
- **Form yuborish bilan**: Full access (tahrir uchun)

---

## Xatolarni Shaxsiy O'qish

### Backend Logs

```bash
pm2 logs Backend5050 -n 50  # Oxirgi 50 ta log
pm2 logs Backend5050 --err  # Faqat xatolar
```

### Database Ulanish

```bash
# SSH orqali
ssh root@your_server
psql -U postgres -d supplio  # ya database nomi
# \dt                         # Tablelar
# \du                         # Users
```

---

## Deployment Checklist

Har safar deploy qilishdan oldin:

- [ ] Git changes pulled muvaffaqiyatli
- [ ] `.env.production` file mavjud
- [ ] PM2 installed (`pm2 -v`)
- [ ] Database alive (`pm2 logs Backend5050`)
- [ ] Ports available (3030, 3040, 3050, 5050)
- [ ] RAM etarli (≥2GB)

---

## Yangilashlar

- **v4** (deploy.sh): Build xatosiga nisbatan barqararligi, seedlar, hamisha build
- **v1** (deploy-build.sh): Kod-only updates, seedlar yo'q
