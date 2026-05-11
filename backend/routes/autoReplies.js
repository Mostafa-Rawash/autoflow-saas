const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const AutoReply = require('../models/AutoReply');
const { auth } = require('../middleware/auth');

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

// @route   GET /api/auto-replies
// @desc    Get all auto-replies for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const autoReplies = await AutoReply.find({ user: req.user.id })
      .sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, autoReplies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error', code: 'SERVER_ERROR' });
  }
});

// @route   POST /api/auto-replies
// @desc    Create a new auto-reply rule
// @access  Private
router.post('/', [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('keywords').isArray().withMessage('Keywords must be an array'),
  body('response').notEmpty().withMessage('Response is required').trim(),
  body('matchType').optional().isIn(['exact', 'contains', 'startsWith', 'regex']).withMessage('Invalid match type'),
  body('priority').optional().isInt().withMessage('Priority must be an integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], validate, auth, async (req, res) => {
  try {
    const autoReply = new AutoReply({
      user: req.user.id,
      name: req.body.name,
      keywords: req.body.keywords,
      response: req.body.response,
      matchType: req.body.matchType || 'contains',
      priority: req.body.priority || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await autoReply.save();
    res.status(201).json({ success: true, autoReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error', code: 'SERVER_ERROR' });
  }
});

// @route   PUT /api/auto-replies/:id
// @desc    Update an auto-reply rule
// @access  Private
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid auto-reply ID'),
  body('name').optional().trim(),
  body('keywords').optional().isArray().withMessage('Keywords must be an array'),
  body('response').optional().trim(),
  body('matchType').optional().isIn(['exact', 'contains', 'startsWith', 'regex']).withMessage('Invalid match type'),
  body('priority').optional().isInt().withMessage('Priority must be an integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], validate, auth, async (req, res) => {
  try {
    const autoReply = await AutoReply.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!autoReply) {
      return res.status(404).json({ success: false, error: 'Auto-reply not found' });
    }

    res.json({ success: true, autoReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error', code: 'SERVER_ERROR' });
  }
});

// @route   DELETE /api/auto-replies/:id
// @desc    Delete an auto-reply rule
// @access  Private
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid auto-reply ID')
], validate, auth, async (req, res) => {
  try {
    const autoReply = await AutoReply.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!autoReply) {
      return res.status(404).json({ success: false, error: 'Auto-reply not found' });
    }

    res.json({ success: true, message: 'Auto-reply deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error', code: 'SERVER_ERROR' });
  }
});

module.exports = router;