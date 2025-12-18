# Contabo Deployment - Quick Reference

## ✅ Deployment Complete

Your application is now configured for **Contabo self-hosted deployment** with:

- ✅ PM2 process manager configuration
- ✅ Docker & Docker Compose setup
- ✅ Nginx reverse proxy configuration
- ✅ Automated deployment scripts
- ✅ GitHub Actions CI/CD
- ✅ Zero-downtime deployments
- ✅ Automatic rollback on failure

---

## 🚀 Files Created

### Deployment Infrastructure

```
apps/web/
├── ecosystem.config.js      # PM2 configuration
├── Dockerfile               # Docker container setup
├── docker-compose.yml       # Multi-container orchestration
└── .dockerignore           # Docker build optimization

scripts/
├── deploy.sh               # Automated deployment script
└── setup-server.sh         # Initial server setup

.github/workflows/
└── deploy-contabo.yml      # CI/CD pipeline
```

### Configuration Changes

- ✅ Removed `vercel.json` (not needed)
- ✅ Updated `next.config.js` with `output: 'standalone'`
- ✅ Uninstalled Vercel CLI
- ✅ Updated all documentation

---

## 📝 Next Steps

### 1. Set Up Contabo Server

```bash
# SSH into your Contabo server
ssh root@your-server-ip

# Run the setup script
curl -o setup.sh https://raw.githubusercontent.com/Nextgentechs/askremohealth/main/scripts/setup-server.sh
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment Variables

```bash
# On server
nano /var/www/askremohealth/apps/web/.env

# Add:
DATABASE_URL=postgresql://cloud_admin@144.91.78.222:5432/neondb
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
# ... other variables
```

### 3. Deploy Application

```bash
# On server
cd /var/www/askremohealth
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### 4. Configure GitHub Secrets

Add these secrets to your GitHub repository settings:

```
CONTABO_HOST=your-server-ip
CONTABO_USER=your-username
CONTABO_SSH_KEY=your-private-ssh-key
DATABASE_URL=your-database-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
```

### 5. Set Up SSL

```bash
# On server
sudo certbot --nginx -d askremohealth.com -d www.askremohealth.com
```

---

## 🔄 How to Deploy

### Automatic (Recommended)

Push to main branch → GitHub Actions automatically deploys:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual (On Server)

```bash
ssh user@your-server
cd /var/www/askremohealth
./scripts/deploy.sh production
```

---

## 🎯 Quick Commands

```bash
# PM2
pm2 restart askremohealth    # Restart app
pm2 logs askremohealth       # View logs
pm2 monit                    # Monitor performance

# Docker
docker-compose up -d         # Start containers
docker-compose logs -f       # View logs
docker-compose restart       # Restart services

# Nginx
sudo systemctl reload nginx  # Reload config
sudo nginx -t                # Test config

# Health check
curl http://localhost:3000/api/health
curl https://askremohealth.com/api/health
```

---

## 📚 Documentation

- **Full Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Repository**: https://github.com/Nextgentechs/askremohealth
- **Database**: PostgreSQL at 144.91.78.222:5432

---

## ✨ What Changed

**Removed:**

- ❌ Vercel CLI
- ❌ Vercel configuration (vercel.json)
- ❌ Vercel-specific deployment docs

**Added:**

- ✅ PM2 configuration for process management
- ✅ Docker & Docker Compose setup
- ✅ Nginx reverse proxy configuration
- ✅ Automated deployment scripts
- ✅ Server setup automation
- ✅ GitHub Actions for Contabo deployment
- ✅ Standalone Next.js output mode

---

**Status**: ✅ Ready for Contabo Deployment  
**Platform**: Self-Hosted / VPS  
**Process Manager**: PM2 + Docker  
**Web Server**: Nginx + SSL
