/**
 * WhatsApp Routes
 * Unified endpoint for WhatsApp integration
 * Merged from standalone WhatsApp service into main backend
 */

const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp.service');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/whatsapp/health
 * @desc    Get WhatsApp service health status
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'whatsapp',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/whatsapp/qr
 * @desc    Get QR code for WhatsApp connection
 * @access  Private
 */
router.get('/qr', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Initialize client if not exists
    if (!whatsappService.clients.has(userId.toString())) {
      await whatsappService.initializeClient(userId);
      
      // Wait a bit for QR generation
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const qrData = whatsappService.getQRCode();
    const status = whatsappService.getStatus(userId);

    res.json({
      success: true,
      data: {
        connected: status.status === 'connected',
        qr: status.status !== 'connected' ? qrData?.qr : null,
        hasQR: !!qrData?.qr,
        status: status.status,
        message: status.status === 'connected'
          ? 'WhatsApp is connected'
          : qrData?.qr
            ? 'Scan QR code with WhatsApp'
            : 'QR code generating... please wait'
      }
    });
  } catch (error) {
    console.error('Error getting QR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get QR code'
    });
  }
});

/**
 * @route   POST /api/whatsapp/connect
 * @desc    Initialize WhatsApp connection
 * @access  Private
 */
router.post('/connect', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await whatsappService.initializeClient(userId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect WhatsApp'
    });
  }
});

/**
 * @route   GET /api/whatsapp/status
 * @desc    Get WhatsApp connection status
 * @access  Private
 */
router.get('/status', auth, (req, res) => {
  const userId = req.user._id;
  const status = whatsappService.getStatus(userId);
  
  res.json({
    success: true,
    data: status
  });
});

/**
 * @route   POST /api/whatsapp/disconnect
 * @desc    Disconnect WhatsApp
 * @access  Private
 */
router.post('/disconnect', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await whatsappService.disconnect(userId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect WhatsApp'
    });
  }
});

/**
 * @route   GET /api/whatsapp/chats
 * @desc    Get all WhatsApp chats
 * @access  Private
 */
router.get('/chats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await whatsappService.getChats(userId);
    
    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get chats'
    });
  }
});

/**
 * @route   GET /api/whatsapp/chats/:chatId/messages
 * @desc    Get messages from a chat
 * @access  Private
 */
router.get('/chats/:chatId/messages', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await whatsappService.getChatMessages(userId, chatId, parseInt(limit));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get messages'
    });
  }
});

/**
 * @route   GET /api/whatsapp/contacts
 * @desc    Get all WhatsApp contacts
 * @access  Private
 */
router.get('/contacts', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const contacts = await whatsappService.getContacts(userId);
    
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get contacts'
    });
  }
});

/**
 * @route   POST /api/whatsapp/send
 * @desc    Send WhatsApp message
 * @access  Private
 */
router.post('/send', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { to, message, media, buttons } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    const result = await whatsappService.sendMessage(userId, to, message, {
      media,
      buttons
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message'
    });
  }
});

/**
 * @route   POST /api/whatsapp/refresh-qr
 * @desc    Request new QR code (disconnect and reconnect)
 * @access  Private
 */
router.post('/refresh-qr', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Disconnect existing
    await whatsappService.disconnect(userId);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reinitialize
    const result = await whatsappService.initializeClient(userId);
    
    res.json({
      success: true,
      data: {
        message: 'QR refresh initiated',
        ...result
      }
    });
  } catch (error) {
    console.error('Error refreshing QR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh QR code'
    });
  }
});

module.exports = router;