# 🚀 AutoFlow SaaS - Deployment Checklist

## Pre-Deployment

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Set `JWT_SECRET` (generate secure key)
- [ ] Set `MONGODB_URI` for production database
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Configure `REDIS_URL` (optional, for caching)
- [ ] Set `NODE_ENV=production`

### 2. Database
- [ ] Create MongoDB database (Atlas or self-hosted)
- [ ] Run seed script: `npm run seed`
- [ ] Set `SUPER_ADMIN_EMAIL` for admin account
- [ ] Verify admin login works

### 3. Security
- [ ] Ensure `JWT_SECRET` is 64+ character random string
- [ ] Verify HTTPS is enabled (via nginx/SSL)
- [ ] Check CORS settings match production domain
- [ ] Review rate limiting settings
- [ ] Enable Helmet.js security headers (already on)

### 4. Frontend Build
```bash
cd frontend
npm run build
```
- [ ] Serve `build/` folder with nginx
- [ ] Configure SPA routing (all routes → index.html)

### 5. Backend Production
```bash
cd backend
npm install --production
npm start
```
- [ ] Use PM2 for process management
- [ ] Configure log rotation
- [ ] Set up monitoring

---

## Production Server Setup

### PM2 Configuration

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name autoflow-api

# Save PM2 config
pm2 save

# Startup on boot
pm2 startup
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/autoflow
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/autoflow/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
    }
}
```

### Environment Variables (Production)

```env
# Required
JWT_SECRET=<64-char-random-string>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/autoflow
FRONTEND_URL=https://yourdomain.com

# Recommended
NODE_ENV=production
PORT=5000
REDIS_URL=redis://redis-server:6379
MAX_WHATSAPP_CLIENTS=20

# Admin
SUPER_ADMIN_EMAIL=admin@yourdomain.com
```

---

## WhatsApp Setup

### Dependencies (Linux)
```bash
# Chrome dependencies for Puppeteer
sudo apt-get update
sudo apt-get install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget
```

### Session Storage
- [ ] Create `./sessions` directory
- [ ] Set appropriate permissions
- [ ] Consider persistent volume for sessions

---

## Monitoring

### Health Check Endpoint
```bash
curl https://yourdomain.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs autoflow-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Recommended Alerts
- [ ] API response time > 500ms
- [ ] Error rate > 1%
- [ ] MongoDB connection failures
- [ ] WhatsApp disconnections
- [ ] Memory usage > 80%
- [ ] Disk usage > 80%

---

## Backup Strategy

### MongoDB Backup
```bash
# Daily backup script
mongodump --uri="$MONGODB_URI" --out=/backup/$(date +%Y%m%d)

# Retain 7 days
find /backup -type d -mtime +7 -exec rm -rf {} +
```

### Session Backup
```bash
# Backup WhatsApp sessions
tar -czf sessions-$(date +%Y%m%d).tar.gz ./sessions/
```

---

## Post-Deployment Tests

### API Tests
```bash
# Health check
curl https://yourdomain.com/health

# API info
curl https://yourdomain.com/api

# Register user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'

# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### WebSocket Test
```javascript
// Browser console
const socket = io('https://yourdomain.com');
socket.on('connect', () => console.log('Connected!'));
```

---

## Scaling Considerations

### Vertical Scaling
- Increase RAM for more WhatsApp clients
- Each WhatsApp client: ~150-200MB RAM
- Default max clients: 10 (configurable)

### Horizontal Scaling
- Use Redis for Socket.io adapter
- Configure sticky sessions for WebSocket
- Load balance with nginx upstream

### Multi-Instance Setup
```javascript
// Add to server.js for Socket.io clustering
const { createAdapter } = require('@socket.io/redis-adapter');
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

---

## Support

- **Docs**: `/QUICKSTART.md`, `/FIXES_SUMMARY.md`
- **Health**: `GET /health`
- **API Info**: `GET /api`
- **Tests**: `npm test`

---

**Deployment complete when all checkboxes are verified ✅**