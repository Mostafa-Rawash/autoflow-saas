const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const FollowUp = require('../models/FollowUp');
const FollowUpExecution = require('../models/FollowUpExecution');
const { auth } = require('../middleware/auth');

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

// Sanitize empty query strings
const sanitizeEmptyQuery = (req, res, next) => {
  for (const key of Object.keys(req.query)) {
    if (req.query[key] === '') delete req.query[key];
  }
  next();
};

// Strip null/undefined values from body so optional() validators work correctly
const sanitizeBody = (req, res, next) => {
  for (const key of Object.keys(req.body)) {
    if (req.body[key] === null || req.body[key] === undefined) {
      delete req.body[key];
    }
  }
  next();
};

// @route   GET /api/follow-ups
// @desc    List all follow-ups for the user
// @access  Private
router.get('/', [
  sanitizeEmptyQuery,
  query('triggerType').optional().isIn(['no_reply', 'schedule', 'status_change', 'new_conversation']),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, auth, async (req, res) => {
  try {
    const { triggerType, isActive, page = 1, limit = 20 } = req.query;
    const query = { user: req.user.id };
    if (triggerType) query.triggerType = triggerType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const followUps = await FollowUp.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('templateId', 'name category');

    const total = await FollowUp.countDocuments(query);

    res.json({
      success: true,
      followUps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/follow-ups
// @desc    Create a follow-up rule
// @access  Private
router.post('/', [
  sanitizeBody,
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ max: 100 }),
  body('triggerType').isIn(['no_reply', 'schedule', 'status_change', 'new_conversation']).withMessage('Invalid trigger type'),
  body('delayMinutes').optional().isInt({ min: 1 }).toInt(),
  body('scheduleConfig').optional().isObject(),
  body('fromStatus').optional().isIn(['active', 'pending', 'resolved', 'closed']),
  body('toStatus').optional().isIn(['active', 'pending', 'resolved', 'closed']),
  body('channel').optional().isIn(['all', 'whatsapp', 'telegram', 'messenger', 'instagram', 'livechat']),
  body('content').optional().isString().trim(),
  body('templateId').optional().isMongoId(),
  body('channels').optional().isArray(),
  body('maxAttempts').optional().isInt({ min: 1, max: 10 }).toInt(),
  body('stopOnReply').optional().isBoolean(),
  body('priority').optional().isIn([1, 2, 3]).toInt(),
  body('isActive').optional().isBoolean()
], validate, auth, async (req, res) => {
  try {
    const { name, triggerType, delayMinutes, scheduleConfig, fromStatus, toStatus,
            channel, content, templateId, channels, maxAttempts, stopOnReply, priority, isActive } = req.body;

    // Validate triggerType-specific requirements
    if (triggerType === 'no_reply' && !delayMinutes) {
      return res.status(400).json({
        success: false,
        error: 'delayMinutes is required for no_reply trigger type'
      });
    }
    if (triggerType === 'schedule' && !scheduleConfig) {
      return res.status(400).json({
        success: false,
        error: 'scheduleConfig is required for schedule trigger type'
      });
    }
    if (triggerType === 'status_change' && (!fromStatus || !toStatus)) {
      return res.status(400).json({
        success: false,
        error: 'fromStatus and toStatus are required for status_change trigger type'
      });
    }

    // Must have content or templateId
    if (!content && !templateId) {
      return res.status(400).json({
        success: false,
        error: 'Either content or templateId is required'
      });
    }

    // Verify templateId exists if provided
    if (templateId) {
      const Template = require('../models/Template');
      const template = await Template.findOne({ _id: templateId, user: req.user.id, isActive: true });
      if (!template) {
        return res.status(400).json({
          success: false,
          error: 'Template not found or inactive'
        });
      }
    }

    const followUp = await FollowUp.create({
      user: req.user.id,
      name,
      triggerType,
      delayMinutes: delayMinutes || null,
      scheduleConfig: scheduleConfig || undefined,
      fromStatus: fromStatus || undefined,
      toStatus: toStatus || undefined,
      channel: channel || 'all',
      content: content || null,
      templateId: templateId || null,
      channels: channels || [],
      maxAttempts: maxAttempts || 1,
      stopOnReply: stopOnReply !== undefined ? stopOnReply : true,
      priority: priority || 2,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, followUp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/follow-ups/:id
// @desc    Update a follow-up rule
// @access  Private
router.put('/:id', [
  sanitizeBody,
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ max: 100 }),
  body('triggerType').optional().isIn(['no_reply', 'schedule', 'status_change', 'new_conversation']),
  body('delayMinutes').optional().isInt({ min: 1 }).toInt(),
  body('content').optional().isString().trim(),
  body('templateId').optional().isMongoId(),
  body('maxAttempts').optional().isInt({ min: 1, max: 10 }).toInt(),
  body('stopOnReply').optional().isBoolean(),
  body('priority').optional().isIn([1, 2, 3]).toInt(),
  body('isActive').optional().isBoolean()
], validate, auth, async (req, res) => {
  try {
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!followUp) {
      return res.status(404).json({ success: false, error: 'Follow-up not found' });
    }

    res.json({ success: true, followUp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/follow-ups/:id
// @desc    Delete a follow-up rule (soft delete by setting isActive=false)
// @access  Private
router.delete('/:id', [
  param('id').isMongoId()
], validate, auth, async (req, res) => {
  try {
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!followUp) {
      return res.status(404).json({ success: false, error: 'Follow-up not found' });
    }

    // Cancel any pending executions
    await FollowUpExecution.updateMany(
      { followUp: req.params.id, status: 'pending' },
      { status: 'cancelled' }
    );

    res.json({ success: true, message: 'Follow-up deleted and pending executions cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/follow-ups/:id/executions
// @desc    Get execution history for a follow-up
// @access  Private
router.get('/:id/executions', [
  param('id').isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const followUp = await FollowUp.findOne({ _id: req.params.id, user: req.user.id });
    if (!followUp) {
      return res.status(404).json({ success: false, error: 'Follow-up not found' });
    }

    const executions = await FollowUpExecution.find({ followUp: req.params.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('conversation', 'contact channel status');

    const total = await FollowUpExecution.countDocuments({ followUp: req.params.id });

    res.json({
      success: true,
      executions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/follow-ups/:id/executions/:eid/cancel
// @desc    Cancel a specific pending execution
// @access  Private
router.post('/:id/executions/:eid/cancel', [
  param('id').isMongoId(),
  param('eid').isMongoId()
], validate, auth, async (req, res) => {
  try {
    const execution = await FollowUpExecution.findOne({
      _id: req.params.eid,
      followUp: req.params.id,
      status: 'pending'
    });

    if (!execution) {
      return res.status(404).json({ success: false, error: 'Pending execution not found' });
    }

    execution.status = 'cancelled';
    await execution.save();

    // Cancel the corresponding queue item
    if (execution.queueItemId) {
      try {
        const MessageQueue = require('../models/MessageQueue');
        await MessageQueue.updateOne(
          { _id: execution.queueItemId },
          { status: 'cancelled' }
        );
      } catch {}
    }

    res.json({ success: true, execution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;