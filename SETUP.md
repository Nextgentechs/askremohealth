# 🚀 Quick Setup for Contabo Deployment

## ✅ What's Ready

All Vercel references have been removed. Your app is now configured for **Contabo/self-hosted deployment**:

```
✅ PM2 configuration (ecosystem.config.js)
✅ Docker setup (Dockerfile, docker-compose.yml)
✅ Nginx configuration (embedded in setup script)
✅ Automated deployment script (scripts/deploy.sh)
✅ Server setup script (scripts/setup-server.sh)
✅ GitHub Actions for Contabo (CI/CD)
✅ Next.js standalone output enabled
```

---

## 🎯 Deploy to Contabo (3 Simple Steps)

### Step 1: SSH to Your Server

```bash
ssh root@askremohealth.com
# or
ssh root@your-server-ip
```

### Step 2: Run Setup Script

```bash
# Download and run server setup
curl -sL https://raw.githubusercontent.com/Nextgentechs/askremohealth/main/scripts/setup-server.sh | bash

# Or manually:
wget https://raw.githubusercontent.com/Nextgentechs/askremohealth/main/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

This installs:

- Node.js 24.x
- PM2 process manager
- Docker & Docker Compose
- Nginx web server
- SSL certificates (Let's Encrypt)
- Firewall configuration

### Step 3: Configure & Deploy

```bash
# Edit environment variables
nano /var/www/askremohealth/apps/web/.env

# Add your credentials:
DATABASE_URL=postgresql://cloud_admin@144.91.78.222:5432/neondb
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
# ... (see .env.example)

# Deploy application
cd /var/www/askremohealth
./scripts/deploy.sh production
```

**Done!** Your site will be live at https://askremohealth.com 🎉

---

## 🔄 How to Update/Redeploy

### From Your Local Machine:

```bash
# Make changes, commit, and push
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions automatically deploys!
```

### Manual Deploy on Server:

```bash
ssh user@askremohealth.com
cd /var/www/askremohealth
./scripts/deploy.sh production
```

---

## 🔐 GitHub Secrets Setup

For automatic deployment via GitHub Actions, add these secrets:

**Settings → Secrets and variables → Actions → New repository secret**

```
CONTABO_HOST = your.server.ip.address
CONTABO_USER = your-ssh-username
CONTABO_SSH_KEY = your-private-ssh-key-content
DATABASE_URL = postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY = sk_live_...
```

---

## 📊 Monitor Your Application

```bash
# PM2 monitoring
pm2 monit                    # Real-time dashboard
pm2 logs askremohealth       # View logs
pm2 status                   # Check status

# Or Docker
docker-compose logs -f       # Follow logs
docker-compose ps            # Check containers

# Check application health
curl http://localhost:3000/api/health
curl https://askremohealth.com/api/health
```

---

## 🆘 Common Commands

```bash
# Restart application
pm2 restart askremohealth

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/askremohealth_error.log

# Database migrations
cd /var/www/askremohealth/apps/web
npm run db:push

# Emergency fix
node fix-database.mjs
```

---

## 🔒 SSL Certificate

```bash
# Install SSL (run after domain points to server)
sudo certbot --nginx -d askremohealth.com -d www.askremohealth.com

# Auto-renewal is configured automatically
```

---

## 📁 File Structure on Server

```
/var/www/askremohealth/
├── apps/web/               # Next.js application
│   ├── .next/             # Built files
│   ├── .env               # Environment variables
│   ├── ecosystem.config.js # PM2 config
│   └── docker-compose.yml  # Docker config
├── scripts/
│   ├── deploy.sh          # Deployment script
│   └── setup-server.sh    # Setup script
└── .git/                  # Git repository

/etc/nginx/sites-available/
└── askremohealth          # Nginx configuration

/var/backups/askremohealth/
└── backup_*.tar.gz        # Automatic backups
```

---

## ✨ Features

- ✅ **Zero-downtime deployments** - Users stay connected
- ✅ **Automatic backups** - Before each deployment
- ✅ **Health checks** - Automatic rollback on failure
- ✅ **SSL/HTTPS** - Let's Encrypt certificates
- ✅ **Process management** - PM2 with clustering
- ✅ **Reverse proxy** - Nginx with caching
- ✅ **CI/CD** - GitHub Actions integration

---

## 📚 Full Documentation

- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Status**: [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)
- **Repository**: https://github.com/Nextgentechs/askremohealth

---

**Need Help?**

1. Check logs: `pm2 logs askremohealth --lines 100`
2. Verify environment: `cat /var/www/askremohealth/apps/web/.env`
3. Test health: `curl http://localhost:3000/api/health`
4. Review Nginx: `sudo nginx -t && sudo tail /var/log/nginx/error.log`
