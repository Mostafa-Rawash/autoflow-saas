const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram.service');
const { auth, hasPermission } = require('../middleware/auth');

// @route   GET /api/telegram/health
// @desc    Health check for Telegram service
// @access  Public
router.get('/health', async (req, res) => {
  const health = await telegramService.healthCheck();
  res.json({ success: true, ...health });
});

// @route   GET /api/telegram/status
// @desc    Get Telegram connection status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const status = await telegramService.getStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Error getting Telegram status:', error);
    res.status(500).json({ success: false, error: 'Failed to get Telegram status' });
  }
});

// @route   POST /api/telegram/connect
// @desc    Connect Telegram bot
// @access  Private (requires connectChannels permission)
router.post('/connect', auth, hasPermission('connectChannels'), async (req, res) => {
  try {
    // Check if already connected via integration
    const Integration = require('../models/Integration');
    const existing = await Integration.findOne({ user: req.user.id, type: 'telegram' });
    
    let botToken, botUsername;
    
    if (existing?.config?.botToken && !req.body.botToken) {
      // Reconnect with stored token
      botToken = existing.config.botToken;
      botUsername = existing.config.botUsername;
    } else {
      botToken = req.body.botToken;
      botUsername = req.body.botUsername;
    }

    if (!botToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bot token is required',
        code: 'BOT_TOKEN_REQUIRED'
      });
    }

    // Clean username (remove @ prefix)
    if (botUsername) botUsername = botUsername.replace(/^@/, '');

    const result = await telegramService.connectBot(req.user.id, botToken, botUsername);
    
    if (result.status === 'error' || result.status === 'limit_reached') {
      return res.status(result.status === 'limit_reached' ? 429 : 400).json({ success: false, error: result.message });
    }

    res.json({ success: true, data: result.data || result });
  } catch (error) {
    console.error('Error connecting Telegram bot:', error);
    res.status(500).json({ success: false, error: 'Failed to connect Telegram bot' });
  }
});

// @route   POST /api/telegram/disconnect
// @desc    Disconnect Telegram bot
// @access  Private
router.post('/disconnect', auth, async (req, res) => {
  try {
    const result = await telegramService.disconnectBot(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error disconnecting Telegram bot:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect Telegram bot' });
  }
});

// @route   POST /api/telegram/webhook/:userId
// @desc    Telegram webhook endpoint
// @access  Public (verified by secret token)
router.post('/webhook/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const update = req.body;
    
    // Process the update asynchronously
    telegramService.handleWebhook(userId, update).catch(err => {
      console.error('Async webhook processing error:', err);
    });
    
    // Always respond quickly to Telegram
    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({ ok: true }); // Still return ok to Telegram
  }
});

// @route   POST /api/telegram/send
// @desc    Send a message via Telegram
// @access  Private (requires replyConversations permission)
router.post('/send', auth, hasPermission('replyConversations'), async (req, res) => {
  try {
    const { chatId, text } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ success: false, error: 'chatId and text are required' });
    }
    const result = await telegramService.sendMessage(req.user.id, chatId, text);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send message' });
  }
});

module.exports = router;
