const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp.service');
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

module.exports = router;