const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Integration = require('../models/Integration');
const whatsappService = require('../services/whatsapp.service');
const { adminAuth, auditLog } = require('../middleware/admin');

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array() 
    });
  }
  next();
};

// Apply admin auth to all routes
router.use(adminAuth);

// ============================================
// DASHBOARD
// ============================================

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', auditLog('VIEW_DASHBOARD'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersLast30Days,
      subscriptionStats,
      conversationStats,
      messageStats,
      whatsappConnections
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: last30Days } }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      Subscription.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } }
      ]),
      Conversation.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: null, total: { $sum: 1 }, byChannel: { $push: '$channel' } } }
      ]),
      Message.countDocuments({ createdAt: { $gte: last30Days } }),
      Integration.countDocuments({ type: 'whatsapp', status: 'connected' })
    ]);
    
    // Format subscription stats
    const planStats = {};
    subscriptionStats.forEach(s => {
      planStats[s._id] = s.count;
    });
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newLast30Days: newUsersLast30Days
        },
        subscriptions: {
          free: planStats.free || 0,
          basic: planStats.basic || 0,
          standard: planStats.standard || 0,
          premium: planStats.premium || 0,
          totalRevenue: (planStats.basic || 0) * 299 + 
                        (planStats.standard || 0) * 599 + 
                        (planStats.premium || 0) * 999
        },
        activity: {
          conversationsLast30Days: conversationStats[0]?.total || 0,
          messagesLast30Days: messageStats
        },
        integrations: {
          whatsappConnected: whatsappConnections,
          whatsappMaxLimit: parseInt(process.env.MAX_WHATSAPP_CLIENTS) || 10,
          whatsappActiveNow: whatsappService.getActiveClientCount()
        }
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

// @route   GET /api/admin/users
// @desc    List all users with filters
// @access  Admin
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('plan').optional().isIn(['free', 'basic', 'standard', 'premium']),
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().trim()
], validate, async (req, res) => {
  try {
    const { page = 1, limit = 20, plan, status, search } = req.query;
    
    const query = {};
    if (plan) query['subscription.plan'] = plan;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Admin
router.get('/users/:id', [
  param('id').isMongoId()
], validate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const subscription = await Subscription.findOne({ user: user._id });
    const integrations = await Integration.find({ user: user._id });
    const conversationCount = await Conversation.countDocuments({ user: user._id });
    const messageCount = await Message.countDocuments({ conversation: { $in: await Conversation.find({ user: user._id }).distinct('_id') } });
    
    res.json({
      success: true,
      user,
      subscription,
      integrations,
      stats: {
        conversations: conversationCount,
        messages: messageCount
      }
    });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   PUT /api/admin/users/:id/plan
// @desc    Update user's subscription plan
// @access  Admin
router.put('/users/:id/plan', [
  param('id').isMongoId(),
  body('plan').isIn(['free', 'basic', 'standard', 'premium']),
  body('endDate').optional().isISO8601()
], validate, auditLog('UPDATE_USER_PLAN'), async (req, res) => {
  try {
    const { plan, endDate } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Update user subscription
    user.subscription.plan = plan;
    user.subscription.isActive = plan !== 'free';
    await user.save();
    
    // Update subscription record
    let subscription = await Subscription.findOne({ user: user._id });
    if (subscription) {
      subscription.plan = plan;
      subscription.status = plan !== 'free' ? 'active' : 'trialing';
      if (endDate) subscription.endDate = new Date(endDate);
      await subscription.save();
    } else {
      subscription = new Subscription({
        user: user._id,
        plan,
        status: plan !== 'free' ? 'active' : 'trialing',
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 0
      });
      await subscription.save();
    }
    
    res.json({
      success: true,
      message: `User plan updated to ${plan}`,
      user: {
        id: user._id,
        email: user.email,
        plan: user.subscription.plan
      }
    });
  } catch (err) {
    console.error('Admin update plan error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/deactivate user
// @access  Admin
router.put('/users/:id/status', [
  param('id').isMongoId(),
  body('isActive').isBoolean()
], validate, auditLog('UPDATE_USER_STATUS'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (err) {
    console.error('Admin update status error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// ============================================
// WHATSAPP MANAGEMENT
// ============================================

// @route   GET /api/admin/whatsapp/status
// @desc    Get all WhatsApp connections status
// @access  Admin
router.get('/whatsapp/status', async (req, res) => {
  try {
    const allStatus = whatsappService.getAllClientsStatus();
    
    res.json({
      success: true,
      connections: allStatus,
      summary: {
        maxClients: parseInt(process.env.MAX_WHATSAPP_CLIENTS) || 10,
        activeCount: whatsappService.getActiveClientCount()
      }
    });
  } catch (err) {
    console.error('Admin WhatsApp status error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   POST /api/admin/whatsapp/cleanup
// @desc    Force cleanup of inactive WhatsApp clients
// @access  Admin
router.post('/whatsapp/cleanup', auditLog('WHATSAPP_CLEANUP'), async (req, res) => {
  try {
    const cleanedUp = await whatsappService.cleanupInactiveClients();
    
    res.json({
      success: true,
      message: `Cleaned up ${cleanedUp.length} inactive clients`,
      cleanedUp
    });
  } catch (err) {
    console.error('Admin WhatsApp cleanup error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// ============================================
// SYSTEM CONFIG
// ============================================

// @route   GET /api/admin/config
// @desc    Get system configuration
// @access  Admin
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      whatsappMaxClients: parseInt(process.env.MAX_WHANTSAPP_CLIENTS) || 10,
      jwtExpiry: '30d',
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100
      },
      plans: {
        free: { conversations: 100, messages: 1000, team: 2 },
        basic: { conversations: 1000, messages: 10000, team: 5 },
        standard: { conversations: 5000, messages: 50000, team: 10 },
        premium: { conversations: Infinity, messages: Infinity, team: Infinity }
      }
    }
  });
});

module.exports = router;