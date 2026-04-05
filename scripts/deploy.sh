#!/bin/bash

# AutoFlow Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 AutoFlow Deployment"
echo "======================="
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"
echo ""

# ========================================
# CONFIGURATION
# ========================================

if [ "$ENVIRONMENT" == "production" ]; then
    DOMAIN="autoflow.com"
    BACKUP_DIR="/var/backups/autoflow/production"
    PM2_ENV="production"
else
    DOMAIN="staging.autoflow.com"
    BACKUP_DIR="/var/backups/autoflow/staging"
    PM2_ENV="staging"
fi

# ========================================
# BACKUP
# ========================================

echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR

# Backup database
if command -v mongodump &> /dev/null; then
    mongodump --db autoflow --out "$BACKUP_DIR/db-$TIMESTAMP"
    echo "✅ Database backed up"
fi

# Backup .env files
if [ -f "frontend/backend/.env" ]; then
    cp frontend/backend/.env "$BACKUP_DIR/env-backend-$TIMESTAMP"
fi

# ========================================
# INSTALL DEPENDENCIES
# ========================================

echo ""
echo "📥 Installing dependencies..."

cd frontend/frontend
npm ci --production=false
npm run build
cd ../..

cd frontend/backend
npm ci --production
cd ../..

cd landing-pages
npm ci
node build.js
cd ..

echo "✅ Dependencies installed"

# ========================================
# ENVIRONMENT SETUP
# ========================================

echo ""
echo "⚙️ Setting up environment..."

if [ ! -f "frontend/backend/.env" ]; then
    cat > frontend/backend/.env << EOF
NODE_ENV=$PM2_ENV
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autoflow
JWT_SECRET=\$(openssl rand -hex 32)
FRONTEND_URL=https://$DOMAIN
EOF
    echo "✅ .env created"
fi

# ========================================
# PM2 SETUP
# ========================================

echo ""
echo "🔧 Configuring PM2..."

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'autoflow-backend',
      cwd: './frontend/backend',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env_$PM2_ENV: {
        NODE_ENV: '$PM2_ENV',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'autoflow-landing',
      cwd: './landing-pages',
      script: 'server.js',
      instances: 1,
      env_$PM2_ENV: {
        NODE_ENV: '$PM2_ENV',
        PORT: 8080
      },
      error_file: './logs/landing-error.log',
      out_file: './logs/landing-out.log'
    }
  ]
};
EOF

mkdir -p logs

echo "✅ PM2 configured"

# ========================================
# DATABASE MIGRATIONS
# ========================================

echo ""
echo "🗄️ Running database migrations..."

cd frontend/backend
if [ -d "migrations" ]; then
    npx migrate-mongo up
fi
cd ../..

echo "✅ Migrations complete"

# ========================================
# START SERVICES
# ========================================

echo ""
echo "🚀 Starting services..."

# Stop old processes
pm2 delete all 2>/dev/null || true

# Start new processes
pm2 start ecosystem.config.js --env $PM2_ENV

# Save PM2 process list
pm2 save

echo "✅ Services started"

# ========================================
# NGINX CONFIGURATION
# ========================================

echo ""
echo "🌐 Configuring Nginx..."

cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    
    # Logging
    access_log /var/log/nginx/$DOMAIN-access.log;
    error_log /var/log/nginx/$DOMAIN-error.log;
    
    # Landing Pages
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Dashboard
    location /dashboard {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # WhatsApp Webhook
    location /webhook {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|woff)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configured"

# ========================================
# SSL CERTIFICATE
# ========================================

echo ""
echo "🔒 Setting up SSL..."

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

echo "✅ SSL configured"

# ========================================
# HEALTH CHECK
# ========================================

echo ""
echo "🏥 Running health checks..."

sleep 5

# Check API
if curl -s https://$DOMAIN/api/../health | grep -q "ok"; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
fi

# Check Landing Page
if curl -s https://$DOMAIN | grep -q "AutoFlow"; then
    echo "✅ Landing page is accessible"
else
    echo "❌ Landing page check failed"
fi

# ========================================
# NOTIFICATION
# ========================================

echo ""
echo "📧 Sending deployment notification..."

# Slack notification (if configured)
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST $SLACK_WEBHOOK \
        -H 'Content-type: application/json' \
        -d "{\"text\":\"🚀 AutoFlow deployed to $ENVIRONMENT\",\"attachments\":[{\"fields\":[{\"title\":\"Environment\",\"value\":\"$ENVIRONMENT\",\"short\":true},{\"title\":\"Timestamp\",\"value\":\"$TIMESTAMP\",\"short\":true}]}]}"
fi

# ========================================
# SUMMARY
# ========================================

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Environment: $ENVIRONMENT"
echo "Domain: https://$DOMAIN"
echo "API: https://$DOMAIN/api"
echo "Dashboard: https://$DOMAIN/dashboard"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "View logs: pm2 logs"
echo "Monitor: pm2 monit"
echo ""