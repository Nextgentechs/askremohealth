# Deployment Guide - Contabo/Self-Hosted Server

## 🚀 Production Deployment for askremohealth.com

**Platform**: Contabo VPS / Self-Hosted Server  
**Repository**: https://github.com/Nextgentechs/askremohealth  
**Live Site**: https://askremohealth.com

---

## 📋 Quick Start Deployment

### On Your Contabo Server:

```bash
# 1. Initial setup (run once)
curl -o setup.sh https://raw.githubusercontent.com/Nextgentechs/askremohealth/main/scripts/setup-server.sh
chmod +x setup.sh
./setup.sh

# 2. Configure environment
nano /var/www/askremohealth/apps/web/.env
# Add your actual credentials

# 3. Deploy application
cd /var/www/askremohealth
./scripts/deploy.sh production
```

---

## 🛠️ Deployment Options

### Option 1: PM2 (Recommended - Lightweight)

```bash
cd /var/www/askremohealth/apps/web
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### Option 2: Docker Compose (Containerized)

```bash
cd /var/www/askremohealth/apps/web
docker-compose up -d --build
```

---

## 🔐 Environment Variables

Update `/var/www/askremohealth/apps/web/.env`:

```bash
DATABASE_URL=postgresql://cloud_admin@144.91.78.222:5432/neondb
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
SENTRY_AUTH_TOKEN=xxxxx
GOOGLE_MAPS_API_KEY=xxxxx
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
NODE_ENV=production
PORT=3000
```

---

## 🌐 SSL & Nginx

```bash
# Install SSL certificate
sudo certbot --nginx -d askremohealth.com -d www.askremohealth.com

# Restart nginx
sudo systemctl reload nginx
```

---

## 🔄 Update & Redeploy

```bash
cd /var/www/askremohealth
git pull origin main
./scripts/deploy.sh production
```

---

## 📊 Monitoring

```bash
# PM2
pm2 monit
pm2 logs askremohealth

# Docker
docker-compose logs -f

# Nginx
sudo tail -f /var/log/nginx/askremohealth_error.log
```

---

## 🆘 Troubleshooting

```bash
# Restart application
pm2 restart askremohealth

# Check health
curl http://localhost:3000/api/health

# View logs
pm2 logs --lines 100
```

---

**Full Documentation**: See complete setup guide in repository
