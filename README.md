# AutoFlow SaaS 🚀

منصة اتصال ذكية متعددة القنوات - MERN Stack

## ✨ المميزات الرئيسية

### SaaS Features
- 🔐 **Multi-tenant** - كل مستخدم لديه مساحة معزولة
- 👥 **Team Management** - دعوة أعضاء وإدارة صلاحيات
- 💳 **Subscription System** - 4 خطط مع حدود واضحة
- 📊 **Admin Dashboard** - إدارة المستخدمين والاشتراكات
- 🔒 **Role-Based Access** - 5 أدوار مع صلاحيات دقيقة

### Communication Channels
- 📱 **WhatsApp** - توصيل فوري عبر QR (مجاني!)
- 💬 **Messenger** - قريباً
- 📷 **Instagram** - قريباً
- ✈️ **Telegram** - قريباً
- 📧 **Email/SMS** - قريباً

### Technical Features
- ⚡ **Real-time** - Socket.io للرسائل الفورية
- 🎨 **RTL Support** - دعم كامل للعربية
- 🌙 **Dark Mode** - تصميم عصري
- 📱 **Responsive** - يعمل على جميع الأجهزة

## 🎯 نظرة عامة

AutoFlow منصة SaaS توحد كل قنوات التواصل (WhatsApp, Messenger, Instagram, Telegram, وغيره) في لوحة تحكم واحدة مع أتمتة ذكية بالذكاء الاصطناعي.

## 🏗️ البنية التقنية

### Backend (Node.js + Express + MongoDB)
```
backend/
├── models/          # Mongoose models
│   ├── User.js
│   ├── Conversation.js
│   ├── Message.js
│   ├── Template.js
│   └── Integration.js
├── routes/          # API routes
│   ├── auth.js
│   ├── users.js
│   ├── conversations.js
│   ├── channels.js
│   ├── templates.js
│   ├── webhooks.js
│   └── analytics.js
├── middleware/      # Auth & validation
└── server.js        # Entry point
```

### Frontend (React + Tailwind CSS)
```
frontend/
├── src/
│   ├── api/         # Axios API client
│   ├── store/       # Zustand state management
│   ├── components/  # Reusable components
│   └── pages/       # Page components
│       ├── Login.js
│       ├── Register.js
│       ├── Dashboard.js
│       └── ...
└── public/
```

## 🚀 التشغيل

### 1. المتطلبات
- Node.js 18+
- MongoDB (محلي أو Atlas)
- npm أو yarn

### 2. إعداد Backend
```bash
cd backend
npm install
cp .env.example .env
# عدّل .env بمعلوماتك
npm run dev
```

### 3. إعداد Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 4. الوصول
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## 📊 الميزات

### ✅ المكتمل
- [x] نظام المصادقة (JWT)
- [x] إدارة المستخدمين
- [x] لوحة تحكم تفاعلية
- [x] تصميم RTL عربي
- [x] تصميم dark mode
- [x] Responsive design

### 🔄 قيد التطوير
- [ ] تكامل WhatsApp Business API
- [ ] تكامل Messenger
- [ ] تكامل Instagram
- [ ] تكامل Telegram
- [ ] محادثات real-time (Socket.io)
- [ ] قوالب رسائل
- [ ] تحليلات متقدمة
- [ ] إدارة الفريق

## 🔌 التكاملات المدعومة

| القناة | الحالة |
|--------|--------|
| WhatsApp Business API | 🔄 قيد التطوير |
| Facebook Messenger | 🔄 قيد التطوير |
| Instagram DM | 🔄 قيد التطوير |
| Telegram Bot | 🔄 قيد التطوير |
| Live Chat | 📋 مخطط |
| Email (SMTP) | 📋 مخطط |
| SMS (Twilio) | 📋 مخطط |
| API مفتوح | 📋 مخطط |

## 🔒 الأمان

- Helmet.js للحماية
- Rate limiting
- JWT Authentication
- Password hashing (bcrypt)
- CORS configuration
- Input validation

## 📱 التصميم

- **Dark Mode** - تصميم داكن عصري
- **RTL Support** - دعم كامل للعربية
- **Glassmorphism** - تأثيرات شفافة
- **Mobile First** - تصميم للموبايل أولاً

## 🛠️ التقنيات

| المجال | التقنية |
|--------|---------|
| Frontend | React 18 |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Express.js |
| Database | MongoDB |
| Auth | JWT |
| Real-time | Socket.io |
| HTTP Client | Axios |

## 📞 التواصل

- Email: mostafa@rawash.com
- Phone: +201099129550
- WhatsApp: https://wa.me/201099129550

## 📄 الرخصة

MIT License