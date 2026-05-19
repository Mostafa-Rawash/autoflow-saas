const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp.service');
const whatsappBusiness = require('../services/whatsappBusiness.service');
const Integration = require('../models/Integration');
const { auth, hasPermission } = require('../middleware/auth');

// @route   POST /api/whatsapp/connect
// @desc    Initialize WhatsApp connection
// @access  Private
router.post('/connect', auth, async (req, res) => {
  try {
    const result = await whatsappService.initializeClient(req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize WhatsApp connection'
    });
  }
});

// @route   POST /api/whatsapp/refresh-qr
// @desc    Re-initialize WhatsApp connection to get fresh QR
// @access  Private
router.post('/refresh-qr', auth, async (req, res) => {
  try {
    // Disconnect existing client first
    await whatsappService.disconnect(req.user.id);
    // Small delay before re-initializing
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await whatsappService.initializeClient(req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error refreshing QR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh QR code'
    });
  }
});

// @route   GET /api/whatsapp/qr
// @desc    Get QR code for scanning (user-specific)
// @access  Private
router.get('/qr', auth, (req, res) => {
  // Get QR for THIS user specifically
  const qrData = whatsappService.getQRCode(req.user.id);
  
  if (qrData) {
    res.json({
      success: true,
      qr: qrData.qr,
      timestamp: qrData.timestamp,
      message: 'Scan this QR code with WhatsApp on your phone'
    });
  } else {
    const status = whatsappService.getStatus(req.user.id);
    res.json({
      success: true,
      status: status.status,
      message: status.status === 'connected' 
        ? 'WhatsApp is already connected' 
        : 'No QR code available. Please initialize connection first.'
    });
  }
});

// @route   GET /api/whatsapp/status
// @desc    Get WhatsApp connection status
// @access  Private
router.get('/status', auth, (req, res) => {
  const status = whatsappService.getStatus(req.user.id);
  res.json({
    success: true,
    ...status
  });
});

// @route   POST /api/whatsapp/disconnect
// @desc    Disconnect WhatsApp
// @access  Private
router.post('/disconnect', auth, async (req, res) => {
  try {
    const result = await whatsappService.disconnect(req.user.id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to disconnect WhatsApp' 
    });
  }
});

// @route   GET /api/whatsapp/chats
// @desc    Get all chats
// @access  Private
router.get('/chats', auth, hasPermission('viewConversations'), async (req, res) => {
  try {
    const chats = await whatsappService.getChats(req.user.id);
    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get chats' 
    });
  }
});

// @route   GET /api/whatsapp/chats/:chatId/messages
// @desc    Get messages from a chat
// @access  Private
router.get('/chats/:chatId/messages', auth, hasPermission('viewConversations'), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const messages = await whatsappService.getChatMessages(
      req.user.id, 
      req.params.chatId, 
      parseInt(limit)
    );
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get messages' 
    });
  }
});

// @route   GET /api/whatsapp/contacts
// @desc    Get all contacts
// @access  Private
router.get('/contacts', auth, async (req, res) => {
  try {
    const contacts = await whatsappService.getContacts(req.user.id);
    res.json({
      success: true,
      contacts
    });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get contacts' 
    });
  }
});

// @route   POST /api/whatsapp/send
// @desc    Send message
// @access  Private
router.post('/send', auth, hasPermission('replyConversations'), async (req, res) => {
  try {
    const { to, content, buttons, media } = req.body;
    
    const result = await whatsappService.sendMessage(
      req.user.id, 
      to, 
      content, 
      { buttons, media }
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to send message' 
    });
  }
});

// @route   POST /api/whatsapp/send-bulk
// @desc    Send bulk messages
// @access  Private
router.post('/send-bulk', auth, hasPermission('replyConversations'), async (req, res) => {
  try {
    const { recipients, content } = req.body;
    const results = [];

    for (const to of recipients) {
      try {
        const result = await whatsappService.sendMessage(req.user.id, to, content);
        results.push({ to, success: true, ...result });
        
        // Wait 1 second between messages to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ to, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      results,
      summary: {
        total: recipients.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send bulk messages' 
    });
  }
});

// @route   GET /api/whatsapp/mode
// @desc    Get current WhatsApp mode (web or business_api)
// @access  Private
router.get('/mode', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({ user: req.user.id, type: 'whatsapp' });
    const mode = integration?.config?.whatsappMode || 'web';
    res.json({ success: true, mode });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get WhatsApp mode' });
  }
});

// @route   PUT /api/whatsapp/mode
// @desc    Switch WhatsApp mode (web or business_api)
// @access  Private
router.put('/mode', auth, async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['web', 'business_api'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'Mode must be "web" or "business_api"' });
    }

    // If switching away from web mode, disconnect the web client
    if (mode === 'business_api') {
      try { await whatsappService.disconnect(req.user.id); } catch (e) { /* ignore if not connected */ }
    }

    // If switching away from business_api, disconnect business API
    if (mode === 'web') {
      try { await whatsappBusiness.disconnect(req.user.id); } catch (e) { /* ignore if not connected */ }
    }

    // Update the integration mode
    await Integration.findOneAndUpdate(
      { user: req.user.id, type: 'whatsapp' },
      { $set: { 'config.whatsappMode': mode } },
      { upsert: true, new: true }
    );

    res.json({ success: true, mode, message: `WhatsApp mode switched to ${mode}` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to switch WhatsApp mode' });
  }
});

module.exports = router;