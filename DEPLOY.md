# Supplio — Production Deployment Guide

## Domain Structure

| Domain | Service |
|---|---|
| `supplio.uz` | Landing page |
| `api.supplio.uz` | Backend (NestJS) |
| `app.supplio.uz` | Dashboard (React) |
| `demo.supplio.uz` | Demo dashboard |

---

## 1. Server Requirements

**Recommended VPS:**
- RAM: 4 GB minimum (8 GB recommended)
- CPU: 2 vCPU
- SSD: 40 GB+
- OS: Ubuntu 22.04 LTS

**Recommended providers:**
- [Hetzner Cloud](https://hetzner.com/cloud) — best price/performance (CX21: ~€4/mo)
- [DigitalOcean](https://digitalocean.com) — good DevEx (Basic 2 CPU 4 GB: ~$24/mo)
- [AWS](https://aws.amazon.com) — enterprise scale (t3.medium)

---

## 2. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install essentials
apt install -y curl git ufw fail2ban

# Enable firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

# Create deploy user (optional but recommended)
adduser deploy
usermod -aG sudo deploy
```

---

## 3. Install Node.js + PM2

```bash
# Install Node.js 20 LTS via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node --version  # should print v20.x.x

# Install PM2 globally
npm install -g pm2

# Set PM2 to start on reboot
pm2 startup
# Copy and run the command PM2 outputs
```

---

## 4. Install PostgreSQL

```bash
# Install PostgreSQL 16
apt install -y postgresql postgresql-contrib

# Start and enable
systemctl enable postgresql
systemctl start postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER supplio WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE supplio_db OWNER supplio;
GRANT ALL PRIVILEGES ON DATABASE supplio_db TO supplio;
EOF
```

---

## 5. Install Nginx

```bash
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx
```

---

## 6. Deploy Backend (NestJS)

```bash
# Clone repository
git clone https://github.com/YOUR_ORG/supplio.git /var/www/supplio
cd /var/www/supplio/backend

# Install dependencies
npm install

# Create environment file
cat > .env <<EOF
DATABASE_URL="postgresql://supplio:YOUR_STRONG_PASSWORD@localhost:5432/supplio_db"
JWT_SECRET="your-very-long-random-jwt-secret-min-32-chars"
PORT=3001
NODE_ENV=production
EOF

# Run Prisma migrations
npx prisma db push

# Build the app
npm run build

# Start with PM2
pm2 start dist/main.js --name supplio-api --env production
pm2 save
```

**PM2 ecosystem file** (`/var/www/supplio/ecosystem.config.js`):

```js
module.exports = {
  apps: [
    {
      name: 'supplio-api',
      script: './backend/dist/main.js',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
```

---

## 7. Deploy Frontend (Dashboard)

```bash
cd /var/www/supplio/dashboard

# Create environment file
cat > .env.production <<EOF
VITE_API_URL=https://api.supplio.uz/api
EOF

# Install and build
npm install
npm run build

# Output is in /var/www/supplio/dashboard/dist
```

---

## 8. Nginx Configuration

Create `/etc/nginx/sites-available/supplio`:

```nginx
# ── API Backend ──────────────────────────────────────────────
server {
    listen 80;
    server_name api.supplio.uz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ── Dashboard (app.supplio.uz) ───────────────────────────────
server {
    listen 80;
    server_name app.supplio.uz;
    root /var/www/supplio/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# ── Demo (demo.supplio.uz) ───────────────────────────────────
server {
    listen 80;
    server_name demo.supplio.uz;
    root /var/www/supplio/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# ── Landing (supplio.uz) ────────────────────────────────────
server {
    listen 80;
    server_name supplio.uz www.supplio.uz;
    root /var/www/supplio/landing/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/supplio /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 9. SSL — Let's Encrypt

```bash
# Get certificates for all domains at once
certbot --nginx \
  -d supplio.uz \
  -d www.supplio.uz \
  -d api.supplio.uz \
  -d app.supplio.uz \
  -d demo.supplio.uz

# Auto-renewal is set up automatically by certbot
# Verify:
certbot renew --dry-run
```

---

## 10. Environment Variables Reference

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://supplio:PASSWORD@localhost:5432/supplio_db"
JWT_SECRET="min-32-char-random-string"
PORT=3001
NODE_ENV=production

# Optional: Telegram bot webhook (if using webhooks instead of polling)
# WEBHOOK_DOMAIN=https://api.supplio.uz
```

### Dashboard (`dashboard/.env.production`)

```env
VITE_API_URL=https://api.supplio.uz/api
```

---

## 11. Logging

```bash
# View backend logs in real-time
pm2 logs supplio-api

# View Nginx access/error logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 log rotation (install once)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
```

---

## 12. Update / Redeploy

```bash
#!/bin/bash
# /var/www/supplio/deploy.sh

set -e

cd /var/www/supplio

# Pull latest code
git pull origin main

# Backend
cd backend
npm install
npx prisma db push
npm run build
pm2 restart supplio-api

# Dashboard
cd ../dashboard
npm install
npm run build

echo "Deploy complete!"
```

Make executable:

```bash
chmod +x /var/www/supplio/deploy.sh
```

---

## 13. Health Check

```bash
# Check backend is running
curl https://api.supplio.uz/api/health

# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check PostgreSQL
systemctl status postgresql
```

---

## Security Checklist

- [x] UFW firewall enabled (only 22, 80, 443 open)
- [x] HTTPS enforced via Let's Encrypt
- [x] PostgreSQL only accessible locally (not exposed to internet)
- [x] JWT secret is at least 32 characters
- [x] `NODE_ENV=production` set in backend
- [x] PM2 auto-restart on crash
- [x] Fail2ban installed for SSH brute-force protection
- [ ] Consider setting up regular DB backups with `pg_dump`
- [ ] Consider adding rate limiting in Nginx for `/api/` routes

---

## Final Checklist

- [x] PostgreSQL running
- [x] Backend built and running on PM2 (port 3001)
- [x] Dashboard built (static files in `dist/`)
- [x] Nginx configured for all 4 domains
- [x] SSL certificates installed
- [x] All env variables set
- [x] Firewall enabled
