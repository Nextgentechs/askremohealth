#!/bin/bash

# Server setup script for Contabo
# Run this once on a fresh server to set up the environment

set -e

echo "🔧 Setting up Contabo server for AskRemoHealth..."

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 24
print_status "Installing Node.js 24..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build essentials
print_status "Installing build essentials..."
sudo apt-get install -y build-essential git curl wget

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2
pm2 startup systemd -u $USER --hp $HOME
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Install Docker (optional)
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
print_status "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
print_status "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/askremohealth
sudo chown -R $USER:$USER /var/www/askremohealth
sudo mkdir -p /var/backups/askremohealth
sudo chown -R $USER:$USER /var/backups/askremohealth

# Clone repository
print_status "Cloning repository..."
cd /var/www/askremohealth
git clone https://github.com/Nextgentechs/askremohealth.git .

# Set up environment variables
print_status "Setting up environment variables..."
cat > /var/www/askremohealth/apps/web/.env << 'EOF'
# Database
DATABASE_URL=postgresql://cloud_admin@144.91.78.222:5432/neondb

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
CLERK_SECRET_KEY=your_clerk_secret_here

# Monitoring
SENTRY_AUTH_TOKEN=your_sentry_token_here
SENTRY_DSN=your_sentry_dsn_here

# External Services
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here

NODE_ENV=production
EOF

print_status "⚠️  Please update the .env file with actual credentials!"

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/askremohealth > /dev/null << 'EOF'
upstream askremohealth {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name askremohealth.com www.askremohealth.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name askremohealth.com www.askremohealth.com;

    # SSL certificates (update paths after obtaining certificates)
    ssl_certificate /etc/letsencrypt/live/askremohealth.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/askremohealth.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Client body size
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/askremohealth_access.log;
    error_log /var/log/nginx/askremohealth_error.log;

    # Static files
    location /_next/static/ {
        alias /var/www/askremohealth/apps/web/.next/static/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /var/www/askremohealth/apps/web/public/;
        expires 1y;
        access_log off;
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://askremohealth;
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
EOF

sudo ln -sf /etc/nginx/sites-available/askremohealth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate with Let's Encrypt
print_status "Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

print_status "⚠️  Run: sudo certbot --nginx -d askremohealth.com -d www.askremohealth.com"

# Set up firewall
print_status "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_status "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update /var/www/askremohealth/apps/web/.env with actual credentials"
echo "2. Run: cd /var/www/askremohealth/apps/web && npm ci"
echo "3. Run: npm run build"
echo "4. Run: pm2 start ecosystem.config.js"
echo "5. Run: sudo certbot --nginx -d askremohealth.com -d www.askremohealth.com"
echo "6. Run: pm2 save"
echo ""
print_status "Server is ready for deployment!"
