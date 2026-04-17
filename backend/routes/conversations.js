const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { auth, checkLimit, checkSubscription } = require('../middleware/auth');

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

// @route   GET /api/conversations
// @desc    Get all conversations
// @access  Private
router.get('/', [
  query('status')
    .optional()
    .isIn(['active', 'pending', 'resolved', 'closed'])
    .withMessage('Invalid status value'),
  query('channel')
    .optional()
    .isIn(['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms', 'api'])
    .withMessage('Invalid channel value'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], validate, auth, async (req, res) => {
  try {
    const { status, channel, assignedTo, page = 1, limit = 20 } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    if (channel) query.channel = channel;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const conversations = await Conversation.find(query)
      .populate('assignedTo', 'name avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Conversation.countDocuments(query);
    
    res.json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/conversations/:id
// @desc    Get single conversation
// @access  Private
router.get('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID')
], validate, auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('assignedTo', 'name avatar');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get messages
    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 });
    
    res.json({ success: true, conversation, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/conversations
// @desc    Create new conversation
// @access  Private
router.post('/', [
  body('channel')
    .notEmpty().withMessage('Channel is required')
    .isIn(['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms', 'api'])
    .withMessage('Invalid channel'),
  body('contact.name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Contact name too long'),
  body('contact.phone')
    .optional()
    .trim(),
  body('contact.email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email'),
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object')
], validate, auth, checkSubscription, checkLimit('conversations'), async (req, res) => {
  try {
    const { channel, contact, metadata } = req.body;
    
    const conversation = new Conversation({
      user: req.user.id,
      channel,
      contact,
      metadata
    });
    
    await conversation.save();
    
    res.status(201).json({ success: true, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/conversations/:id
// @desc    Update conversation
// @access  Private
router.put('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('status')
    .optional()
    .isIn(['active', 'pending', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assignee ID'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('notes.content')
    .optional()
    .trim()
    .notEmpty().withMessage('Note content cannot be empty')
], validate, auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, tags, notes } = req.body;
    
    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status, priority, assignedTo, tags, $push: { notes } },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ success: true, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/conversations/:id/messages
// @desc    Send message in conversation
// @access  Private
router.post('/:id/messages', [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('content')
    .notEmpty().withMessage('Message content is required')
    .trim()
    .isLength({ max: 10000 }).withMessage('Message too long (max 10000 chars)'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'button', 'list'])
    .withMessage('Invalid message type'),
  body('media.url')
    .optional()
    .isURL().withMessage('Invalid media URL'),
  body('buttons')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 buttons allowed')
], validate, auth, async (req, res) => {
  try {
    const { content, type, media, buttons } = req.body;
    
    const message = new Message({
      conversation: req.params.id,
      sender: 'agent',
      senderId: req.user.id,
      content,
      type,
      media,
      buttons
    });
    
    await message.save();
    
    // Update conversation last message
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: {
        content,
        timestamp: new Date(),
        sender: 'agent'
      }
    });
    
    // TODO: Send to external channel (WhatsApp, Messenger, etc.)
    
    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/conversations/stats
// @desc    Get conversation statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await Conversation.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: 'active' } }, { $count: 'count' }],
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: 'count' }],
          byChannel: [
            { $group: { _id: '$channel', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    
    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;