const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Template = require('../models/Template');
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

// @route   GET /api/templates
// @desc    Get all templates
// @access  Private
router.get('/', [
  query('channel')
    .optional()
    .isIn(['all', 'whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms'])
    .withMessage('Invalid channel'),
  query('category')
    .optional()
    .isIn(['greeting', 'faq', 'promotion', 'reminder', 'follow_up', 'custom'])
    .withMessage('Invalid category'),
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
    const { channel, category, page = 1, limit = 20 } = req.query;
    
    const query = { user: req.user.id, isActive: true };
    if (channel) query.channel = channel;
    if (category) query.category = category;
    
    const templates = await Template.find(query)
      .sort({ usageCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Template.countDocuments(query);
    
    res.json({ 
      success: true, 
      templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
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

// @route   POST /api/templates
// @desc    Create new template
// @access  Private
router.post('/', [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('category')
    .optional()
    .isIn(['greeting', 'faq', 'promotion', 'reminder', 'follow_up', 'custom'])
    .withMessage('Invalid category'),
  body('channel')
    .optional()
    .isIn(['all', 'whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms'])
    .withMessage('Invalid channel'),
  body('content')
    .custom((value) => {
      if (typeof value === 'string') return value.length > 0;
      if (typeof value === 'object' && value.text) return value.text.length > 0;
      return false;
    }).withMessage('Content is required'),
  body('content.text')
    .optional()
    .notEmpty().withMessage('Content text cannot be empty')
    .isLength({ max: 10000 }).withMessage('Content too long'),
  body('variables')
    .optional()
    .isArray().withMessage('Variables must be an array'),
  body('triggers')
    .optional()
    .isArray().withMessage('Triggers must be an array')
], validate, auth, async (req, res) => {
  try {
    const { name, category, channel, content, triggers, language, variables, buttons, media } = req.body;
    
    // Handle content - can be string or object
    const contentObj = typeof content === 'string' 
      ? { text: content, variables: variables || [] }
      : { 
          text: content?.text || content, 
          variables: content?.variables || variables || [],
          buttons: content?.buttons || buttons || [],
          media: content?.media || media || null
        };
    
    const template = new Template({
      user: req.user.id,
      name,
      category: category || 'custom',
      channel: channel || 'all',
      content: contentObj,
      triggers: triggers || [],
      language: language || 'ar'
    });
    
    await template.save();
    
    res.status(201).json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private
router.put('/:id', [
  param('id')
    .isMongoId().withMessage('Invalid template ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('category')
    .optional()
    .isIn(['greeting', 'faq', 'promotion', 'reminder', 'follow_up', 'custom'])
    .withMessage('Invalid category'),
  body('content')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') return true;
      if (typeof value === 'object') return true;
      return false;
    }).withMessage('Invalid content format')
], validate, auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private
router.delete('/:id', [
  param('id')
    .isMongoId().withMessage('Invalid template ID')
], validate, auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;