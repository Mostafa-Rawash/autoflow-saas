const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const channelRoutes = require('./routes/channels');
const templateRoutes = require('./routes/templates');
const webhookRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');
const subscriptionRoutes = require('./routes/subscriptions');
const whatsappRoutes = require('./routes/whatsapp');
const autoReplyRoutes = require('./routes/auto-replies');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const logsRoutes = require('./routes/logs');
const Role = require('./models/Role');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://52.249.222.161:3000',
      'http://52.249.222.161:3001',
      'http://52.249.222.161:8080',
      'http://52.249.222.161:8081',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST']
  }
});

// Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://52.249.222.161:3000',
      'http://52.249.222.161:3001',
      'http://52.249.222.161:8080',
      'http://52.249.222.161:8081',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Database connection with in-memory MongoDB for development
let mongoUri = process.env.MONGODB_URI;

const startServer = async () => {
  // Check if MongoDB is actually available
  let useRealMongo = false;
  
  if (mongoUri) {
    try {
      const { MongoClient } = require('mongodb');
      const testClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
      await testClient.connect();
      await testClient.close();
      useRealMongo = true;
      console.log('🗄️  MongoDB server found at', mongoUri);
    } catch (err) {
      console.log('⚠️  MongoDB server not available, falling back to in-memory');
    }
  }

  if (!useRealMongo) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('📦 Using in-memory MongoDB for development');
    } catch (err) {
      console.log('⚠️  No MongoDB available, running in demo mode');
    }
  }


  if (mongoUri) {
    mongoose.connect(mongoUri)
    .then(async () => {
      console.log('✅ MongoDB connected');
      // Seed default roles
      await Role.seedDefaults();
      
      // Create admin user if not exists
      const User = require('./models/User');
      const existingAdmin = await User.findOne({ email: 'admin@autoflow.com' });
      if (!existingAdmin) {
        const adminUser = new User({
          name: 'Mostafa Rawash',
          email: 'admin@autoflow.com',
          phone: '+201099129550',
          password: 'Admin@123456',
          role: 'owner',
          subscription: {
            plan: 'premium',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isActive: true
          },
          channels: [{ type: 'whatsapp', connected: false }],
          settings: { language: 'ar', timezone: 'Africa/Cairo', notifications: { email: true, push: true, sms: false } }
        });
        await adminUser.save();
        console.log('🎉 Admin user created: admin@autoflow.com / Admin@123456');
      }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/channels', channelRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/whatsapp', whatsappRoutes);
  app.use('/api/auto-replies', autoReplyRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/logs', logsRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Socket.io for real-time messaging
  global.io = io; // Make io globally available for services
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
    });
    
    socket.on('send-message', (data) => {
      io.to(data.conversationId).emit('new-message', data);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io enabled`);
  });
};

startServer();

module.exports = { app, io };