# AutoFlow SaaS - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas) - optional, in-memory mode available for dev
- npm or yarn

### 1. Environment Setup

#### Backend
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and set these REQUIRED values:
# JWT_SECRET=your-super-secret-key-here
# Generate a secure key: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Optional:
# MONGODB_URI=mongodb://localhost:27017/autoflow
# FRONTEND_URL=http://localhost:3000
# SUPER_ADMIN_EMAIL=admin@yourcompany.com
```

#### Frontend
```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env (defaults work for local dev):
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### 3. Seed Database (Optional)

Create initial data including admin user:

```bash
cd backend
npm run seed
```

This creates:
- 5 default roles (owner, admin, manager, agent, viewer)
- Admin user (if SUPER_ADMIN_EMAIL is set)
- Default message templates

### 4. Start the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend (build and serve)
cd frontend
npm run build
# Serve with nginx or similar
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 🔐 Admin Access

To access admin features:

1. Set `SUPER_ADMIN_EMAIL` in your `.env` file
2. Run `npm run seed` to create the admin user
3. Login with the admin email and password (default: `Admin123!`)
4. Access admin endpoints at `/api/admin/*`

## 📱 WhatsApp Integration

### Connect WhatsApp
1. Login to the dashboard
2. Go to Channels → WhatsApp
3. Click "Connect"
4. Scan the QR code with WhatsApp on your phone:
   - Open WhatsApp
   - Settings → Linked Devices → Link Device
   - Scan the QR code

### Limitations
- Phone must stay connected to internet
- Max 10 concurrent connections (configurable)
- Not designed for bulk messaging
- Each user gets isolated WhatsApp session

## 👥 Team Management

### Invite Team Members
1. Go to Team page
2. Click "Invite Member"
3. Enter email and select role
4. Invitation is sent (or displayed for testing)

### Accept Invitation
1. User receives invitation link
2. Creates account with invitation token
3. Automatically added to team

## 💳 Subscription System

### Plans
| Plan | Conversations | Messages | Team | Price |
|------|--------------|----------|------|-------|
| Free | 100 | 1,000 | 2 | EGP 0 |
| Basic | 1,000 | 10,000 | 5 | EGP 299/mo |
| Standard | 5,000 | 50,000 | 10 | EGP 599/mo |
| Premium | ∞ | ∞ | ∞ | EGP 999/mo |

### Trial
- 14-day free trial on new accounts
- Full access to Free plan features

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (if installed locally)
mongod

# Or use in-memory mode (default for dev)
# Just leave MONGODB_URI empty
```

### WhatsApp Connection Issues
1. Make sure Puppeteer can run:
   ```bash
   # Install Chrome dependencies (Linux)
   sudo apt-get install -y libgbm1
   ```
2. Check the sessions folder permissions
3. Try disconnecting and reconnecting

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Generate a new secret if needed
- Restart the server after changing

### CORS Errors
- Add your frontend URL to `FRONTEND_URL` in `.env`
- Restart the backend server

## 📊 API Endpoints

### Public
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/subscriptions/plans` - List plans

### Protected (Auth Required)
- `GET /api/auth/me` - Current user
- `GET /api/conversations` - List conversations
- `GET /api/templates` - List templates
- `POST /api/whatsapp/connect` - Initialize WhatsApp
- `GET /api/whatsapp/qr` - Get QR code
- `POST /api/subscriptions/upgrade` - Upgrade plan

### Admin (Super Admin Only)
- `GET /api/admin/dashboard` - Admin stats
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/plan` - Update user plan
- `GET /api/admin/whatsapp/status` - All WhatsApp connections

## 🧪 Testing

```bash
# Run backend tests (when available)
cd backend
npm test

# Run frontend tests (when available)
cd frontend
npm test
```

## 📝 Development Notes

### Multi-Tenant WhatsApp
Each user gets their own WhatsApp client instance:
- Sessions stored in `./sessions/{userId}`
- QR codes delivered via Socket.io to specific user
- Max concurrent connections: 10 (configurable via `MAX_WHATSAPP_CLIENTS`)

### Real-time Features
Socket.io events:
- `authenticate` - Join user room
- `whatsapp-qr` - Receive QR code
- `whatsapp-connected` - Connection success
- `whatsapp-disconnected` - Connection lost
- `new-message` - New message received

### Security Features
- Helmet.js for HTTP headers
- CORS with whitelist
- Rate limiting (100 req/15min)
- JWT authentication (30-day expiry)
- bcrypt password hashing
- Express-validator for input

## 🚢 Production Deployment

### Environment Variables
```env
# Required
JWT_SECRET=<your-secure-secret>
MONGODB_URI=<production-mongodb-uri>
FRONTEND_URL=<production-frontend-url>

# Recommended
NODE_ENV=production
SUPER_ADMIN_EMAIL=<admin-email>
MAX_WHATSAPP_CLIENTS=20
```

### Deployment Steps
1. Build frontend: `cd frontend && npm run build`
2. Set production env vars
3. Start backend: `cd backend && npm start`
4. Serve frontend with nginx/PM2
5. Configure SSL
6. Set up MongoDB backups

### PM2 Configuration
```bash
# Install PM2
npm install -g pm2

# Start with PM2
cd backend
pm2 start server.js --name autoflow-api

# Save PM2 config
pm2 save
pm2 startup
```

---

Need help? Check the logs:
- Backend: Console output
- Frontend: Browser console
- WhatsApp: `./sessions/` folder logs