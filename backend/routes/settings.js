const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

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

// @route   GET /api/settings/ai
// @desc    Get AI configuration (API key is masked)
// @access  Private
router.get('/ai', auth, async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    const maxChunkTokens = parseInt(process.env.MAX_CHUNK_TOKENS) || 500;
    const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP_TOKENS) || 50;

    // Mask the API key for security
    let maskedKey = '';
    if (apiKey && apiKey.length > 10) {
      maskedKey = apiKey.substring(0, 6) + '••••••••' + apiKey.substring(apiKey.length - 4);
    } else if (apiKey) {
      maskedKey = '••••••••';
    }

    res.json({
      success: true,
      config: {
        hasApiKey: !!apiKey,
        maskedApiKey: maskedKey,
        model,
        embeddingModel,
        maxChunkTokens,
        chunkOverlap
      }
    });
  } catch (err) {
    console.error('[Settings] AI config error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/settings/ai
// @desc    Test AI connection (check if OpenAI key works)
// @access  Private
router.post('/ai/test', auth, async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        code: 'AI_NOT_CONFIGURED'
      });
    }

    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey });

    // Quick test: generate a small embedding
    const response = await client.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: 'test'
    });

    res.json({
      success: true,
      message: 'OpenAI connection successful',
      embeddingDimension: response.data[0].embedding.length
    });
  } catch (err) {
    console.error('[Settings] AI test error:', err.message);
    res.json({
      success: false,
      error: err.message,
      code: err.status === 401 ? 'INVALID_API_KEY' : 'AI_CONNECTION_ERROR'
    });
  }
});

// @route   GET /api/settings/ai-auto-reply
// @desc    Get AI auto-reply settings and usage
// @access  Private
router.get('/ai-auto-reply', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings.aiAutoReply');
    const subscription = await Subscription.findOne({ user: req.user.id });

    const settings = user?.settings?.aiAutoReply || {
      enabled: false,
      channels: ['whatsapp', 'telegram'],
      tone: 'professional',
      includeSources: false
    };

    const usage = subscription?.usage?.aiMessages || 0;
    const limit = subscription?.limits?.aiMessages || 0;

    res.json({
      success: true,
      settings,
      usage: {
        used: usage,
        limit: limit,
        percentage: limit === Infinity ? 0 : Math.round((usage / limit) * 100)
      }
    });
  } catch (err) {
    console.error('[Settings] AI auto-reply GET error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/settings/ai-auto-reply
// @desc    Update AI auto-reply settings
// @access  Private
router.put('/ai-auto-reply', [
  body('enabled').optional().isBoolean(),
  body('channels').optional().isArray(),
  body('channels.*').optional().isIn(['whatsapp', 'telegram', 'messenger', 'instagram', 'livechat']),
  body('tone').optional().isIn(['professional', 'friendly', 'casual']),
  body('includeSources').optional().isBoolean()
], validate, auth, async (req, res) => {
  try {
    const { enabled, channels, tone, includeSources } = req.body;

    const update = {};
    if (enabled !== undefined) update['settings.aiAutoReply.enabled'] = enabled;
    if (channels !== undefined) update['settings.aiAutoReply.channels'] = channels;
    if (tone !== undefined) update['settings.aiAutoReply.tone'] = tone;
    if (includeSources !== undefined) update['settings.aiAutoReply.includeSources'] = includeSources;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('settings.aiAutoReply');

    res.json({
      success: true,
      settings: user.settings.aiAutoReply
    });
  } catch (err) {
    console.error('[Settings] AI auto-reply PUT error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;