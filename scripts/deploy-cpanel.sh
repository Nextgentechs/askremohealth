#!/bin/bash
# ==============================================================================
# cPanel Deployment Script for Ask Remo Health
# ==============================================================================
# 
# This script is executed on the cPanel server after files are uploaded.
# It can be triggered manually via SSH or via cPanel's Git deployment.
#
# Usage: ./deploy-cpanel.sh
# ==============================================================================

set -e

echo "🚀 Starting cPanel deployment..."

# Configuration
APP_DIR="${HOME}/public_html/apps/web"
NODE_VERSION="18"
LOG_FILE="${APP_DIR}/logs/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE" 2>/dev/null || true
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ==============================================================================
# Step 1: Navigate to App Directory
# ==============================================================================
log "📁 Navigating to $APP_DIR"
cd "$APP_DIR" || { error "Failed to navigate to $APP_DIR"; exit 1; }

# Create logs directory if it doesn't exist
mkdir -p logs
mkdir -p tmp

# ==============================================================================
# Step 2: Activate Node.js Virtual Environment
# ==============================================================================
log "🔧 Activating Node.js $NODE_VERSION environment..."

NODEVENV="${HOME}/nodevenv/apps/web/${NODE_VERSION}/bin/activate"
if [ -f "$NODEVENV" ]; then
    source "$NODEVENV"
    log "✅ Node.js environment activated"
    log "   Node version: $(node --version)"
    log "   NPM version: $(npm --version)"
else
    warn "Node.js virtual environment not found at $NODEVENV"
    warn "Attempting to use system Node.js..."
fi

# ==============================================================================
# Step 3: Install Production Dependencies
# ==============================================================================
log "📦 Installing production dependencies..."
npm ci --production --ignore-scripts 2>&1 | tail -5

# ==============================================================================
# Step 4: Verify Build Exists
# ==============================================================================
if [ ! -d ".next" ]; then
    error ".next directory not found! Build may have failed."
    error "Please ensure the build was uploaded correctly."
    exit 1
fi
log "✅ Build directory verified"

# ==============================================================================
# Step 5: Restart Application
# ==============================================================================
log "🔄 Restarting application..."

# Method 1: Touch restart.txt (cPanel Passenger method)
touch tmp/restart.txt
log "✅ Touched tmp/restart.txt"

# Method 2: If PM2 is available
if command -v pm2 &> /dev/null; then
    log "📊 PM2 detected, attempting PM2 restart..."
    pm2 restart ecosystem.config.js --env production 2>/dev/null || \
    pm2 start ecosystem.config.js --env production 2>/dev/null || \
    log "⚠️ PM2 restart skipped (may not be configured)"
fi

# ==============================================================================
# Step 6: Health Check
# ==============================================================================
log "⏳ Waiting for application to start (30 seconds)..."
sleep 30

log "🔍 Running health check..."
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Application is responding on localhost:3000"
elif curl -sf http://127.0.0.1:3000 > /dev/null 2>&1; then
    log "✅ Application is responding on 127.0.0.1:3000"
else
    warn "⚠️ Application may not be responding locally."
    warn "   This could be normal if using Passenger. Check the live site."
fi

# ==============================================================================
# Deployment Complete
# ==============================================================================
echo ""
log "🎉 Deployment completed successfully!"
log "📊 Deployment log: $LOG_FILE"
log "🌐 Check your site: https://askremohealth.com"
echo ""
