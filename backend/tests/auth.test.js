/**
 * @fileoverview Tests for Authentication Routes
 * @module tests/auth.test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server').app;
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Role = require('../models/Role');

let mongoServer;

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123!',
  role: 'user'
};

const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'Admin123!',
  role: 'admin'
};

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Seed roles
  await Role.seedDefaults();
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clean database before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Subscription.deleteMany({});
});

describe('Auth Routes', () => {
  
  describe('POST /api/auth/register', () => {
    
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined();
    });
    
    it('should not register user with existing email', async () => {
      // Create first user
      await request(app).post('/api/auth/register').send(testUser);
      
      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('USER_EXISTS');
    });
    
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' }) // Missing email and password
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeDefined();
    });
    
    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
    
    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: '123' })
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('POST /api/auth/login', () => {
    
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });
    
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.expiresIn).toBe(900); // 15 minutes
    });
    
    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
    
    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
        .expect(401);
      
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });
  
  describe('GET /api/auth/me', () => {
    
    let accessToken;
    
    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      accessToken = res.body.accessToken;
    });
    
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
    });
    
    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);
      
      expect(res.body.code).toBe('NO_TOKEN');
    });
    
    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
      
      expect(res.body.code).toBe('INVALID_TOKEN');
    });
  });
  
  describe('POST /api/auth/refresh', () => {
    
    let accessToken, refreshToken;
    
    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });
    
    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('x-refresh-token', refreshToken)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.accessToken).not.toBe(accessToken);
    });
    
    it('should reject refresh with access token instead of refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('x-refresh-token', accessToken)
        .expect(401);
      
      expect(res.body.code).toBe('INVALID_TOKEN');
    });
    
    it('should reject refresh without token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .expect(401);
      
      expect(res.body.code).toBe('NO_TOKEN');
    });
  });
  
  describe('Subscription creation on registration', () => {
    
    it('should create trial subscription for new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      const subscription = await Subscription.findOne({ 
        user: res.body.user.id 
      });
      
      expect(subscription).toBeDefined();
      expect(subscription.plan).toBe('free');
      expect(subscription.status).toBe('trialing');
      expect(subscription.trialEndsAt).toBeDefined();
    });
  });
});

console.log('✅ Auth tests defined. Run with: npm test');