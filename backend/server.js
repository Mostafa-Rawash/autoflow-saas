const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these in your .env file or environment');
  process.exit(1);
}

// Warn about optional but recommended env vars
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set - will use in-memory MongoDB (data lost on restart)');
}

if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL not set - some CORS features may not work correctly');
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const channelRoutes = require('./routes/channels');
const templateRoutes = require('./routes/templates');
const webhookRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');
const subscriptionRoutes = require('./routes/subscriptions');
const whatsappRoutes = require('./routes/whatsapp');
const whatsappBusinessRoutes = require('./routes/whatsappBusiness');
const telegramRoutes = require('./routes/telegram');
const adminRoutes = require('./routes/admin');
const queueRoutes = require('./routes/queue');
const autoReplyRoutes = require('./routes/autoReplies');
const followUpRoutes = require('./routes/followUps');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');
const settingsRoutes = require('./routes/settings');
const logRoutes = require('./routes/logs');
const contactRoutes = require('./routes/contacts');
const departmentRoutes = require('./routes/departments');
const workflowRoutes = require('./routes/workflows');
const livechatRoutes = require('./routes/livechat');
const helpArticleRoutes = require('./routes/helpArticles');
const emailRoutes = require('./routes/email');
const outgoingWebhookRoutes = require('./routes/outgoingWebhooks');
const instagramRoutes = require('./routes/instagram');
const messengerRoutes = require('./routes/messenger');
const Role = require('./models/Role');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:8081',
  process.env.FRONTEND_URL
].filter(Boolean);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files (live chat widget)
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  skip: (req) => req.path.startsWith('/api/auth/') // skip auth routes
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
  if (!mongoUri || mongoUri.includes('localhost:27017')) {
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
    mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    })
    .then(async () => {
      console.log('✅ MongoDB connected');
      // Seed default roles
      await Role.seedDefaults();
    })
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected, reconnecting...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
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
  app.use('/api/whatsapp-business', whatsappBusinessRoutes);
  app.use('/api/telegram', telegramRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/auto-replies', autoReplyRoutes);
  app.use('/api/follow-ups', followUpRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/livechat', livechatRoutes);
  app.use('/api/help-articles', helpArticleRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api/outgoing-webhooks', outgoingWebhookRoutes);
  app.use('/api/instagram', instagramRoutes);
  app.use('/api/messenger', messengerRoutes);
  // Frontend error logging — regular auth, not admin-only
  const { auth } = require('./middleware/auth');
  const Log = require('./models/Log');
  app.post('/api/logs/frontend', auth, async (req, res) => {
    try {
      const { level = 'error', message, source = 'frontend', error, metadata } = req.body;
      const log = await Log.create({
        level,
        message: message || 'Frontend error',
        source,
        user: req.user?._id || null,
        error: error ? { name: error.name, message: error.message, code: error.code, stack: error.stack } : undefined,
        metadata
      });
      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to log error' });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API Version info
  app.get('/api', (req, res) => {
    res.json({
      name: 'AutoFlow API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        conversations: '/api/conversations',
        channels: '/api/channels',
        templates: '/api/templates',
        subscriptions: '/api/subscriptions',
        analytics: '/api/analytics',
        whatsapp: '/api/whatsapp',
        'whatsapp-business': '/api/whatsapp-business',
        telegram: '/api/telegram',
        webhooks: '/api/webhooks',
        admin: '/api/admin',
        queue: '/api/queue',
        documents: '/api/documents',
        chat: '/api/chat',
        settings: '/api/settings',
        logs: '/api/logs',
        'auto-replies': '/api/auto-replies',
        'follow-ups': '/api/follow-ups',
        contacts: '/api/contacts',
        departments: '/api/departments',
        workflows: '/api/workflows',
        livechat: '/api/livechat',
        'help-articles': '/api/help-articles',
        email: '/api/email',
        'outgoing-webhooks': '/api/outgoing-webhooks',
        instagram: '/api/instagram',
        messenger: '/api/messenger'
      }
    });
  });

  // Socket.io for real-time messaging
  global.io = io; // Make io globally available for services
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // User joins their personal room for WhatsApp events
    socket.on('authenticate', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });
    
    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
    });
    
    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(conversationId);
    });
    
    // Send message event
    socket.on('send-message', (data) => {
      io.to(data.conversationId).emit('new-message', data);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Error handling — log 500s to Log collection
  app.use((err, req, res, next) => {
    console.error(err.stack);
    const Log = require('./models/Log');
    Log.create({
      level: 'error',
      message: err.message || 'Unhandled server error',
      source: 'api',
      user: req.user?._id || null,
      error: { name: err.name, message: err.message, code: err.code, stack: err.stack },
      request: { method: req.method, url: req.originalUrl, ip: req.ip }
    }).catch(() => {});
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io enabled`);

    // Seed sample system logs if collection is empty
    const Log = require('./models/Log');
    Log.countDocuments().then(count => {
      if (count === 0) {
        const sampleLogs = [
          { level: 'info', message: 'Server started successfully', source: 'system', timestamp: new Date() },
          { level: 'info', message: 'MongoDB connection established', source: 'backend', timestamp: new Date(Date.now() - 60000) },
          { level: 'info', message: 'Default roles seeded', source: 'system', timestamp: new Date(Date.now() - 30000) },
          { level: 'warn', message: 'REDIS_URL not set — using in-memory cache', source: 'backend', timestamp: new Date(Date.now() - 120000) },
        ];
        Log.insertMany(sampleLogs).then(() => console.log('📋 Sample logs seeded')).catch(() => {});
      }
    }).catch(() => {});

    // Start message queue processor
    const { messageQueueService } = require('./services/messageQueue.service');
    const whatsappService = require('./services/whatsapp.service');
    messageQueueService.startProcessor(whatsappService, 5000);

    // Start follow-up checker (runs every 60 seconds)
    const followUpService = require('./services/followUp.service');
    followUpService.startChecker(60000);

    // Start event bus cleanup (runs every 24 hours)
    const eventBusService = require('./services/eventBus.service');
    setInterval(() => { eventBusService.cleanup(); }, 24 * 60 * 60 * 1000);
    console.log('🚌 Event bus ready');

    // Register outgoing webhook global handler
    const outgoingWebhookService = require('./services/outgoingWebhook.service');
    outgoingWebhookService.registerGlobalHandler();

    // Log Telegram service status and resume polling for connected bots
    const telegramService = require('./services/telegram.service');
    telegramService.healthCheck().then(health => {
      console.log(`📱 Telegram service ready (max bots: ${health.maxBots})`);
    });
    // Resume polling for bots that were connected before restart
    const Integration = require('./models/Integration');
    Integration.find({ type: 'telegram', status: 'connected' }).then(integrations => {
      for (const integration of integrations) {
        if (integration.config?.botToken) {
          telegramService.bots.set(integration.user.toString(), {
            botToken: integration.config.botToken,
            botUsername: integration.config.botUsername,
            botName: integration.config.botName,
            connectedAt: integration.connectedAt || new Date()
          });
          telegramService.startPolling(integration.user.toString());
          console.log(`📱 Resumed Telegram polling for user ${integration.user}`);
        }
      }
    }).catch(err => console.error('Error resuming Telegram bots:', err.message));

    // Resume WhatsApp Business API connections
    const whatsappBusiness = require('./services/whatsappBusiness.service');
    whatsappBusiness.resumeClients().then(count => {
      if (count > 0) console.log(`📱 Resumed ${count} WhatsApp Business API client(s)`);
    }).catch(err => console.error('Error resuming WhatsApp Business API clients:', err.message));

    // Resume Instagram connections
    const instagramService = require('./services/instagram.service');
    instagramService.resumeClients().then(count => {
      if (count > 0) console.log(`📷 Resumed ${count} Instagram client(s)`);
    }).catch(err => console.error('Error resuming Instagram clients:', err.message));

    // Resume Messenger connections
    const messengerService = require('./services/messenger.service');
    messengerService.resumeClients().then(count => {
      if (count > 0) console.log(`💬 Resumed ${count} Messenger client(s)`);
    }).catch(err => console.error('Error resuming Messenger clients:', err.message));
  });
};

startServer();

module.exports = { app, io };