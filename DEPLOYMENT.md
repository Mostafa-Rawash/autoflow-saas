# AutoFlow Production Deployment Guide

## Prerequisites

- Node.js 18+
- PM2 (`npm install -g pm2`)
- Nginx
- MongoDB (local or Atlas)
- SSL certificates (Let's Encrypt)

## 1. Environment Setup

### Backend Environment Variables

Create `frontend/backend/.env`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autoflow
JWT_SECRET=your_secure_jwt_secret_here
FRONTEND_URL=https://your-domain.com

# Payment Gateway (optional)
PAYMOB_API_KEY=your_paymob_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret

# AI Service
GEMINI_API_KEY=your_gemini_key
```

### WhatsApp Service Environment

Create `whatsapp-service/.env`:

```env
GEMINI_ROBOT_API_KEY=your_gemini_key
AUTHORIZED_NUMBERS=+2010xxxx,+2011xxxx
SESSION_SAVE_PATH=/var/lib/autoflow/sessions
```

## 2. Install Dependencies

```bash
# Backend
cd frontend/backend
npm install --production

# Frontend
cd ../frontend
npm install
npm run build

# WhatsApp Service
cd ../../whatsapp-service
npm install --production

# Landing Pages
cd ../landing-pages
npm install
npm run build
```

## 3. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'autoflow-backend',
      cwd: './frontend/backend',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'autoflow-landing',
      cwd: './landing-pages',
      script: 'server.js',
      instances: 1,
      env_production: {
        PORT: 8080
      }
    },
    {
      name: 'autoflow-frontend',
      cwd: './frontend/frontend',
      script: 'server.js',
      instances: 1,
      env_production: {
        PORT: 8081
      }
    },
    {
      name: 'whatsapp-service',
      cwd: './whatsapp-service/src',
      script: 'server.js',
      instances: 1,
      env_production: {
        PORT: 3002
      }
    }
  ]
};
```

Start services:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 4. Nginx Configuration

Create `/etc/nginx/sites-available/autoflow`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Landing Pages
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Dashboard
    location /app {
        rewrite ^/app(.*)$ $1 break;
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/autoflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL Certificates (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 6. MongoDB Setup

### Local MongoDB

```bash
# Install MongoDB
sudo apt install mongodb

# Start service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### MongoDB Atlas

1. Create cluster at mongodb.com
2. Whitelist server IP
3. Update `MONGODB_URI` in `.env`

## 7. Monitoring & Logs

```bash
# View logs
pm2 logs

# Monitor
pm2 monit

# Health check
node health-check.js

# QA check
node qa-check.js
```

## 8. Backup Strategy

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/autoflow-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db autoflow --out /backups/$DATE
find /backups -type d -mtime +30 -exec rm -rf {} \;
EOF

chmod +x /usr/local/bin/autoflow-backup.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/autoflow-backup.sh" | crontab -
```

## 9. Security Checklist

- [ ] Firewall configured (ufw)
- [ ] SSH key-only authentication
- [ ] Fail2ban installed
- [ ] SSL enabled
- [ ] Environment variables secured
- [ ] MongoDB authentication enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured

## 10. Quick Commands

```bash
# Restart all services
pm2 restart all

# View status
pm2 status

# Pull latest code and redeploy
git pull
pm2 restart all

# Emergency: stop everything
pm2 stop all

# Emergency: check logs
pm2 logs --lines 100
```

## Support

- Email: mostafa@rawash.com
- WhatsApp: +201099129550
- GitHub: https://github.com/Mostafa-Rawash/autoflow-saas