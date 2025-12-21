# cPanel Deployment Guide for Ask Remo Health

This guide covers deploying the Ask Remo Health Next.js application to cPanel hosting.

## Prerequisites

- [ ] cPanel hosting with **Node.js Selector** (most modern hosts have this)
- [ ] SSH access to your server
- [ ] Git repository connected to cPanel (optional but recommended)
- [ ] Domain configured in cPanel

---

## 🔐 GitHub Secrets Setup (Required for CI/CD)

Before the automated deployment will work, you must add these secrets to your GitHub repository:

1. Go to **Repository → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add each of these:

| Secret Name           | Description                  | Example                               |
| --------------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `CPANEL_FTP_HOST`     | cPanel FTP/SFTP hostname     | `ftp.askremohealth.com`               |
| `CPANEL_FTP_USER`     | cPanel FTP username          | `deueoltk`                            |
| `CPANEL_FTP_PASSWORD` | cPanel FTP password          | (your password)                       |
| `CPANEL_HOST`         | cPanel hostname (for API)    | `server.hostname.com`                 |
| `CPANEL_USER`         | cPanel username              | `deueoltk`                            |
| `CPANEL_API_TOKEN`    | cPanel API token (optional)  | Get from cPanel → Manage API Tokens   |

### Getting cPanel API Token (Optional but Recommended)

1. Log into cPanel
2. Go to **Security → Manage API Tokens**
3. Click **Create**
4. Name it `github-deploy`
5. Copy the token and add it as `CPANEL_API_TOKEN` secret

---

## 🎯 Quick Start (TL;DR)

```bash
# SSH into your server
ssh your_username@your-server-ip

# Navigate to app directory
cd ~/public_html/apps/web

# Activate Node.js environment
source ~/nodevenv/apps/web/18/bin/activate

# Install, build, and start
npm ci
npm run build
touch tmp/restart.txt
```

---

## 📋 Step-by-Step Deployment

### Step 1: Create Node.js Application in cPanel

1. Log into cPanel
2. Go to **"Setup Node.js App"** (under Software section)
3. Click **"Create Application"**
4. Configure:

| Setting                  | Value                                   |
| ------------------------ | --------------------------------------- |
| Node.js version          | 18.x or 20.x (LTS)                      |
| Application mode         | Production                              |
| Application root         | `public_html/apps/web`                  |
| Application URL          | Your domain (e.g., `askremohealth.com`) |
| Application startup file | `server.js`                             |

5. Click **Create**
6. **Important**: Note the **virtual environment path** shown (e.g., `/home/username/nodevenv/apps/web/18`)

---

### Step 2: Upload Your Application

#### Option A: Via Git (Recommended)

1. Go to **cPanel → Git Version Control**
2. Click **Create**
3. Enter:
   - Clone URL: `https://github.com/Nextgentechs/askremohealth.git`
   - Repository Path: `public_html` (or your preferred location)
4. Click **Create**
5. Use **Manage → Pull or Deploy** to fetch changes

#### Option B: Manual Upload

Upload these files/folders to `/home/username/public_html/apps/web/`:

```
├── .next/          # Build output (create locally first)
├── public/         # Static assets
├── server.js       # Custom server
├── package.json
├── package-lock.json
├── next.config.js
├── .env            # Environment variables
└── ecosystem.config.js  # PM2 config (optional)
```

---

### Step 3: Configure Environment Variables

#### Option A: Via cPanel UI

1. Go to **Setup Node.js App**
2. Click **Edit** on your application
3. Scroll to **Environment Variables**
4. Add each variable:

| Variable               | Description                       |
| ---------------------- | --------------------------------- |
| `NODE_ENV`             | `production`                      |
| `DATABASE_URL`         | Your PostgreSQL connection string |
| `NEXTAUTH_URL`         | `https://askremohealth.com`       |
| `NEXTAUTH_SECRET`      | A secure random string            |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID            |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret               |
| `GOOGLE_MAPS_API_KEY`  | Google Maps API key               |

#### Option B: Via .env file

Create `/home/username/public_html/apps/web/.env`:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://cloud_admin:yaZM4jvs2TOk@144.91.78.222:5432/neondb
NEXTAUTH_URL=https://askremohealth.com
NEXTAUTH_SECRET=your-secret-key-here
# ... other variables from .env.example
```

---

### Step 4: Build and Start

SSH into your server:

```bash
# Connect
ssh username@your-server-ip

# Navigate to app
cd ~/public_html/apps/web

# IMPORTANT: Activate Node.js virtual environment
source ~/nodevenv/apps/web/18/bin/activate

# Install dependencies
npm ci

# Build Next.js
npm run build

# Start the application
# Option 1: cPanel's built-in restart
touch tmp/restart.txt

# Option 2: Using PM2 (more reliable)
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## 🔄 Updating the Application

### Via Git

```bash
cd ~/public_html
git pull origin main
cd apps/web
source ~/nodevenv/apps/web/18/bin/activate
npm ci
npm run build
touch tmp/restart.txt
```

### Manual

1. Build locally: `npm run build`
2. Upload the new `.next/` folder
3. SSH and restart: `touch tmp/restart.txt`

---

## 🐛 Troubleshooting

### Issue: "Module not found" or build fails

**Cause**: Node.js environment not activated

**Solution**:

```bash
source ~/nodevenv/apps/web/18/bin/activate
npm ci
npm run build
```

---

### Issue: Application shows 503 or doesn't start

**Cause**: Server.js error or port conflict

**Solution**:

1. Check logs in cPanel → Setup Node.js App → view logs
2. Or check `~/public_html/apps/web/logs/`
3. Ensure `server.js` exists and is set as startup file

---

### Issue: Build runs out of memory

**Cause**: Shared hosting memory limits

**Solution**: Build locally and upload

```bash
# On your local machine
cd apps/web
npm run build

# Upload .next/ folder to server
# Use FileZilla, scp, or cPanel File Manager
```

---

### Issue: Environment variables not loading

**Solution**:

1. Ensure `.env` file is in the correct location (`apps/web/.env`)
2. Or add variables via cPanel UI
3. Restart the application after changes

---

## 📊 Monitoring

### View Logs

```bash
# Application logs (if using PM2)
pm2 logs askremohealth

# Manually check log files
tail -f ~/public_html/apps/web/logs/combined.log
```

### Check Status

```bash
# PM2 status
pm2 status

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## 🔧 Advanced: Using PM2 with cPanel

If you want more control over process management:

```bash
# Install PM2 globally (once)
npm install -g pm2

# Start with PM2
cd ~/public_html/apps/web
source ~/nodevenv/apps/web/18/bin/activate
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on server reboot
pm2 startup
# Follow the command it outputs
```

---

## 📁 File Structure on Server

After deployment, your server should look like:

```
/home/username/
├── nodevenv/
│   └── apps/web/18/    # Node.js virtual environment
├── public_html/
│   └── apps/
│       └── web/
│           ├── .next/          # Build output
│           ├── public/         # Static files
│           ├── server.js       # Custom server
│           ├── package.json
│           ├── next.config.js
│           ├── .env
│           ├── ecosystem.config.js
│           ├── tmp/
│           │   └── restart.txt  # Touch to restart
│           └── logs/            # Application logs
└── repositories/               # If using Git Version Control
    └── askremohealth/
```

---

## ✅ Deployment Checklist

- [ ] Node.js application created in cPanel
- [ ] Application root set to `public_html/apps/web`
- [ ] Startup file set to `server.js`
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm ci`)
- [ ] Application built (`npm run build`)
- [ ] Application started and accessible
- [ ] SSL certificate configured (via Let's Encrypt or cPanel SSL/TLS)

---

**Need help?** Check the logs first, then reach out to your hosting provider's support.
