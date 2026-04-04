# AutoFlow SaaS

🚀 **Multi-channel communication automation platform for MENA businesses**

## 🎯 Overview

AutoFlow is an AI-powered customer communication platform that helps Arabic-speaking businesses automate their customer support across multiple channels, starting with WhatsApp.

## ✨ Features

### Current (MVP)
- 📱 **WhatsApp Integration** - Connect via QR code or API
- 🤖 **Auto-Reply System** - Automated responses with keyword matching
- 💬 **Conversation Management** - Real-time message handling
- 👤 **User Authentication** - Secure login with session persistence
- 🌐 **Arabic-First UI** - RTL support with Egyptian Arabic dialect
- 💳 **Subscription Plans** - Starting at 2,000 EGP/month

### Coming Soon
- 💬 Messenger Integration
- 📷 Instagram Integration
- ✈️ Telegram Integration
- 📊 Analytics Dashboard
- 👥 Team Management
- 📝 Message Templates

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │  WhatsApp       │     │   AI Service    │
│   (React)       │────▶│  Service        │────▶│   (Gemini)      │
│   Port: 8081    │     │   Port: 3002    │     │   Port: 3001    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   Backend API   │                           │   Database      │
│   (Express)     │                           │   (MongoDB)     │
│   Port: 5000    │                           │                 │
└─────────────────┘                           └─────────────────┘
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express, Socket.io |
| **WhatsApp** | whatsapp-web.js (Puppeteer) |
| **AI** | Google Gemini API |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT, bcrypt |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/Mostafa-Rawash/autoflow-saas.git
cd autoflow-saas

# Install dependencies
cd frontend && npm install
cd ../whatsapp-service && npm install
cd ../ai-service && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start services
npm run dev  # in each service directory
```

### Environment Variables

```env
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autoflow
JWT_SECRET=your_jwt_secret

# WhatsApp Service
WHAPI_PORT=3002
GEMINI_API_KEY=your_gemini_key

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

## 📦 Project Structure

```
autoflow-saas/
├── frontend/           # React dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── api/
│   └── public/
├── whatsapp-service/   # WhatsApp Web.js integration
│   ├── src/
│   └── session/
├── ai-service/         # Gemini AI processing
│   ├── prompts/
│   └── processors/
├── landing-pages/      # Marketing pages (Arabic/English)
│   ├── dist/
│   └── templates/
└── README.md
```

## 💰 Pricing

| Plan | Monthly | Yearly | Channels |
|------|---------|--------|----------|
| **Starter** ⭐ | 2,000 EGP | 20,000 EGP | 1 (WhatsApp) |
| **Standard** | 4,000 EGP | 40,000 EGP | 3 |
| **Premium** | 8,000 EGP | 80,000 EGP | 8 |

All plans include 14-day free trial.

## 🌐 Live Demo

- **Dashboard:** http://52.249.222.161:8081
- **Landing Pages:** http://52.249.222.161:8080

**Demo Credentials:**
- Email: `mostafa@rawash.com`
- Password: `Test123456`

## 🗺️ Roadmap

### Phase 1: MVP (12 days)
- [x] User authentication
- [ ] WhatsApp QR connection
- [ ] Auto-reply system
- [ ] Conversation management
- [ ] Production deployment

### Phase 2: Growth (17 days)
- [ ] Payment integration (Paymob/Fawry)
- [ ] Arabic onboarding flow
- [ ] Message templates
- [ ] Analytics dashboard
- [ ] Landing page optimization

### Phase 3: Multi-channel (16 days)
- [ ] Messenger integration
- [ ] Instagram integration
- [ ] Telegram integration
- [ ] Team management

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details.

## 📧 Contact

- **Email:** mostafa@rawash.com
- **WhatsApp:** +201099129550
- **Website:** https://autoflow.com

---

Built with ❤️ for MENA businesses