/**
 * @fileoverview Tests for Message Queue Service
 * @module tests/queue.test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { messageQueueService, MessageQueue, RateLimit, PLAN_LIMITS } = require('../services/messageQueue.service');
const app = require('../server').app;
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Subscription = require('../models/Subscription');
const Role = require('../models/Role');

let mongoServer;
let testUserId;
let testConversationId;
let accessToken;

const testUser = {
  name: 'Queue Test User',
  email: 'queue@example.com',
  password: 'Test123!',
  role: 'user'
};

// Setup
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await Role.seedDefaults();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clean collections
  await User.deleteMany({});
  await Conversation.deleteMany({});
  await MessageQueue.deleteMany({});
  await RateLimit.deleteMany({});
  await Subscription.deleteMany({});
  
  // Create test user
  const res = await request(app).post('/api/auth/register').send(testUser);
  testUserId = res.body.user.id;
  accessToken = res.body.accessToken;
  
  // Create test conversation
  const conversation = new Conversation({
    user: testUserId,
    channel: 'whatsapp',
    contact: {
      name: 'Test Contact',
      phone: '+1234567890'
    }
  });
  await conversation.save();
  testConversationId = conversation._id;
});

describe('Message Queue Service', () => {
  
  describe('addToQueue', () => {
    
    it('should add message to queue successfully', async () => {
      const result = await messageQueueService.addToQueue(
        testUserId,
        testConversationId,
        { content: 'Test message', type: 'text' }
      );
      
      expect(result.success).toBe(true);
      expect(result.queueId).toBeDefined();
      expect(result.status).toBe('pending');
    });
    
    it('should add message with priority', async () => {
      const result = await messageQueueService.addToQueue(
        testUserId,
        testConversationId,
        { content: 'High priority message' },
        { priority: 1 } // High priority
      );
      
      const queueItem = await MessageQueue.findById(result.queueId);
      expect(queueItem.priority).toBe(1);
    });
    
    it('should add scheduled message', async () => {
      const scheduledFor = new Date(Date.now() + 3600000); // 1 hour from now
      
      const result = await messageQueueService.addToQueue(
        testUserId,
        testConversationId,
        { content: 'Scheduled message' },
        { scheduledFor }
      );
      
      const queueItem = await MessageQueue.findById(result.queueId);
      expect(queueItem.scheduledFor).toEqual(scheduledFor);
    });
  });
  
  describe('addBulkToQueue', () => {
    
    it('should add multiple messages at once', async () => {
      const messages = [
        { conversationId: testConversationId, messageData: { content: 'Message 1' } },
        { conversationId: testConversationId, messageData: { content: 'Message 2' } },
        { conversationId: testConversationId, messageData: { content: 'Message 3' } }
      ];
      
      const results = await messageQueueService.addBulkToQueue(testUserId, messages);
      
      expect(results.total).toBe(3);
      expect(results.queued).toBe(3);
      expect(results.failed).toBe(0);
      expect(results.queueIds).toHaveLength(3);
    });
  });
  
  describe('Rate Limiting', () => {
    
    it('should track rate limit counters', async () => {
      const rateLimit = await RateLimit.findOne({ user: testUserId });
      
      expect(rateLimit).toBeDefined();
      expect(rateLimit.minuteCount).toBe(0);
      expect(rateLimit.hourCount).toBe(0);
      expect(rateLimit.dayCount).toBe(0);
    });
    
    it('should enforce plan limits', async () => {
      // Free plan limits: 5/minute, 50/hour, 500/day
      const result = await messageQueueService.checkRateLimit(testUserId, 'free');
      
      expect(result.allowed).toBe(true);
      expect(result.limits.minute.max).toBe(PLAN_LIMITS.free.perMinute);
      expect(result.limits.hour.max).toBe(PLAN_LIMITS.free.perHour);
      expect(result.limits.day.max).toBe(PLAN_LIMITS.free.perDay);
    });
    
    it('should increment counters correctly', async () => {
      await messageQueueService.incrementRateLimit(testUserId);
      await messageQueueService.incrementRateLimit(testUserId);
      
      const rateLimit = await RateLimit.findOne({ user: testUserId });
      expect(rateLimit.minuteCount).toBe(2);
      expect(rateLimit.hourCount).toBe(2);
      expect(rateLimit.dayCount).toBe(2);
    });
  });
  
  describe('Queue Management', () => {
    
    beforeEach(async () => {
      // Add some test messages
      await messageQueueService.addBulkToQueue(testUserId, [
        { conversationId: testConversationId, messageData: { content: 'Msg 1' } },
        { conversationId: testConversationId, messageData: { content: 'Msg 2' } },
        { conversationId: testConversationId, messageData: { content: 'Msg 3' } }
      ]);
    });
    
    it('should get user stats', async () => {
      const stats = await messageQueueService.getUserStats(testUserId);
      
      expect(stats.pending).toBe(3);
      expect(stats.sent).toBe(0);
      expect(stats.failed).toBe(0);
    });
    
    it('should cancel pending messages', async () => {
      const result = await messageQueueService.cancelMessages(testUserId);
      
      expect(result.success).toBe(true);
      expect(result.cancelled).toBe(3);
      
      const stats = await messageQueueService.getUserStats(testUserId);
      expect(stats.cancelled).toBe(3);
      expect(stats.pending).toBe(0);
    });
  });
});

describe('Queue API Routes', () => {
  
  describe('POST /api/queue/add', () => {
    
    it('should add message via API', async () => {
      const res = await request(app)
        .post('/api/queue/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          conversationId: testConversationId.toString(),
          content: 'API test message'
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.queueId).toBeDefined();
    });
    
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/queue/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Missing conversation ID' })
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
    
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/queue/add')
        .send({
          conversationId: testConversationId.toString(),
          content: 'Unauthorized'
        })
        .expect(401);
      
      expect(res.body.code).toBe('NO_TOKEN');
    });
  });
  
  describe('POST /api/queue/bulk', () => {
    
    it('should add bulk messages via API', async () => {
      const res = await request(app)
        .post('/api/queue/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          messages: [
            { conversationId: testConversationId.toString(), content: 'Bulk 1' },
            { conversationId: testConversationId.toString(), content: 'Bulk 2' }
          ]
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.queued).toBe(2);
    });
    
    it('should limit bulk size to 100', async () => {
      const messages = Array(101).fill(null).map((_, i) => ({
        conversationId: testConversationId.toString(),
        content: `Message ${i}`
      }));
      
      const res = await request(app)
        .post('/api/queue/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ messages })
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('GET /api/queue/stats', () => {
    
    it('should return queue stats', async () => {
      const res = await request(app)
        .get('/api/queue/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.queue).toBeDefined();
      expect(res.body.rateLimits).toBeDefined();
    });
  });
  
  describe('GET /api/queue/rate-limit', () => {
    
    it('should return rate limit status', async () => {
      const res = await request(app)
        .get('/api/queue/rate-limit')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.limits).toBeDefined();
      expect(res.body.allowed).toBe(true);
    });
  });
});

console.log('✅ Queue tests defined. Run with: npm test');