const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { auth, checkSubscription, canAdd } = require('../middleware/auth');
const { messageQueueService, MessageQueue } = require('../services/messageQueue.service');

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

// @route   POST /api/queue/add
// @desc    Add message to queue
// @access  Private
router.post('/add', [
  auth,
  checkSubscription,
  body('conversationId')
    .notEmpty().withMessage('Conversation ID is required')
    .isMongoId().withMessage('Invalid conversation ID'),
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 4096 }).withMessage('Content too long (max 4096 chars)'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'audio', 'document'])
    .withMessage('Invalid message type'),
  body('priority')
    .optional()
    .isIn([1, 2, 3])
    .withMessage('Priority must be 1 (high), 2 (normal), or 3 (low)'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format')
], validate, async (req, res) => {
  try {
    const { conversationId, content, type, media, priority, scheduledFor } = req.body;
    const userId = req.user._id;
    const plan = req.subscription.plan;

    // Check rate limit
    const rateCheck = await messageQueueService.checkRateLimit(userId, plan);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        retryAfter: rateCheck.retryAfter,
        limits: rateCheck.limits
      });
    }

    // Add to queue
    const result = await messageQueueService.addToQueue(
      userId,
      conversationId,
      { content, type, media },
      {
        priority: priority || 2,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
      }
    );

    res.status(201).json({
      success: true,
      message: 'Message added to queue',
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   POST /api/queue/bulk
// @desc    Add multiple messages to queue
// @access  Private
router.post('/bulk', [
  auth,
  checkSubscription,
  body('messages')
    .isArray({ min: 1, max: 100 }).withMessage('Messages must be an array (1-100 items)'),
  body('messages.*.conversationId')
    .notEmpty().withMessage('Conversation ID is required')
    .isMongoId().withMessage('Invalid conversation ID'),
  body('messages.*.content')
    .notEmpty().withMessage('Content is required')
], validate, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user._id;
    const plan = req.subscription.plan;

    // Check rate limit for bulk
    const rateCheck = await messageQueueService.checkRateLimit(userId, plan);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        retryAfter: rateCheck.retryAfter
      });
    }

    const results = await messageQueueService.addBulkToQueue(userId, messages);

    res.status(201).json({
      success: true,
      ...results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   GET /api/queue/stats
// @desc    Get queue statistics for current user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await messageQueueService.getUserStats(req.user._id);
    const plan = req.user.subscription?.plan || 'free';
    const rateCheck = await messageQueueService.checkRateLimit(req.user._id, plan);

    res.json({
      success: true,
      queue: stats,
      rateLimits: rateCheck.limits,
      canSend: rateCheck.allowed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   GET /api/queue/messages
// @desc    Get queued messages for current user
// @access  Private
router.get('/messages', [
  auth,
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'sent', 'failed', 'cancelled'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
], validate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const [messages, total] = await Promise.all([
      MessageQueue.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('conversation', 'contact.name contact.phone'),
      MessageQueue.countDocuments(query)
    ]);

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   DELETE /api/queue/cancel
// @desc    Cancel pending messages
// @access  Private
router.delete('/cancel', [
  auth,
  body('queueIds')
    .optional()
    .isArray()
    .withMessage('Queue IDs must be an array')
], validate, async (req, res) => {
  try {
    const { queueIds } = req.body;
    const result = await messageQueueService.cancelMessages(req.user._id, queueIds);

    res.json({
      success: true,
      message: `Cancelled ${result.cancelled} messages`,
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   POST /api/queue/retry
// @desc    Retry failed messages
// @access  Private
router.post('/retry', auth, async (req, res) => {
  try {
    const result = await messageQueueService.retryFailed(req.user._id);

    res.json({
      success: true,
      message: `Retrying ${result.retried} messages`,
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   GET /api/queue/rate-limit
// @desc    Get current rate limit status
// @access  Private
router.get('/rate-limit', auth, async (req, res) => {
  try {
    const plan = req.user.subscription?.plan || 'free';
    const rateCheck = await messageQueueService.checkRateLimit(req.user._id, plan);

    res.json({
      success: true,
      allowed: rateCheck.allowed,
      retryAfter: rateCheck.retryAfter,
      limits: rateCheck.limits
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   DELETE /api/queue/cleanup
// @desc    Clean up old processed messages (admin only)
// @access  Private (Admin)
router.delete('/cleanup', [
  auth,
  body('daysOld')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('Days old must be between 1 and 90')
], validate, async (req, res) => {
  try {
    // Only admins can trigger cleanup
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'FORBIDDEN'
      });
    }

    const { daysOld = 30 } = req.body;
    const result = await messageQueueService.cleanup(daysOld);

    res.json({
      success: true,
      message: `Cleaned up ${result.deleted} old messages`,
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;