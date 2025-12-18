#!/bin/bash

# Deployment script for Contabo server
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
APP_NAME="askremohealth"
APP_DIR="/var/www/askremohealth"
BACKUP_DIR="/var/backups/askremohealth"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment to $ENV environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running on server
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found. Are you on the correct server?"
    exit 1
fi

# Backup current deployment
print_status "Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C $APP_DIR . 2>/dev/null || true
print_status "Backup created: backup_$TIMESTAMP.tar.gz"

# Navigate to app directory
cd $APP_DIR

# Pull latest code from GitHub
print_status "Pulling latest code from GitHub..."
git fetch origin
if [ "$ENV" == "production" ]; then
    git checkout main
    git pull origin main
else
    git checkout dev
    git pull origin dev
fi

# Install dependencies
print_status "Installing dependencies..."
cd apps/web
npm ci --only=production

# Run database migrations
print_status "Running database migrations..."
npm run db:push || print_warning "Database migration had warnings (might be expected)"

# Build application
print_status "Building application..."
npm run build

# Restart application
print_status "Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart $APP_NAME || pm2 start ecosystem.config.js
    pm2 save
    print_status "Application restarted with PM2"
elif command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose up -d --build
    print_status "Application restarted with Docker"
else
    print_warning "No process manager found. Please restart manually."
fi

# Health check
print_status "Running health check..."
sleep 10
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "Health check passed!"
else
    print_error "Health check failed!"
    print_warning "Rolling back to previous version..."
    tar -xzf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C $APP_DIR
    if command -v pm2 &> /dev/null; then
        pm2 restart $APP_NAME
    fi
    exit 1
fi

# Clean up old backups (keep last 5)
print_status "Cleaning up old backups..."
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm --

print_status "🎉 Deployment completed successfully!"
echo ""
echo "Deployment Details:"
echo "- Environment: $ENV"
echo "- Timestamp: $TIMESTAMP"
echo "- Commit: $(git -C $APP_DIR rev-parse --short HEAD)"
echo "- Branch: $(git -C $APP_DIR rev-parse --abbrev-ref HEAD)"
echo ""
print_status "Application is running at http://localhost:3000"
