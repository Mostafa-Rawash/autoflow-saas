/**
 * WhatsApp Routes
 * Unified endpoint for WhatsApp integration
 * Merged from standalone WhatsApp service into main backend
 */

const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp.service');
const ChannelConnection = require('../models/ChannelConnection');
const { auth } = require('../middleware/auth');
const SOCKET_EVENTS = require('../constants/socketEvents');

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
    const orgId = req.user.organization || userId;
    
    // Initialize client if not exists
    if (!whatsappService.clients.has(userId.toString())) {
      await whatsappService.initializeClient(userId, { resetSession: String(req.query.resetSession || '').toLowerCase() === 'true' });
      
      // Wait a bit for QR generation
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const connection = await ChannelConnection.findOneAndUpdate(
      { organization: orgId, type: 'whatsapp' },
      {
        organization: orgId,
        type: 'whatsapp',
        status: 'connecting',
        connectedBy: userId,
        displayName: 'WhatsApp',
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    const qrData = whatsappService.getQRCode();
    const status = whatsappService.getStatus(userId);
    const isInitializing = whatsappService.initializing?.has(userId.toString());

    if (global.io) {
      global.io.emit(SOCKET_EVENTS.CHANNEL_STATUS_CHANGED, {
        userId: userId.toString(),
        channel: 'whatsapp',
        status: 'connecting',
        connectionId: connection?._id?.toString?.() || null,
        qrAvailable: !!qrData?.qr
      });
      if (qrData?.qr) {
        global.io.emit(SOCKET_EVENTS.WHATSAPP_QR, {
          userId: userId.toString(),
          channel: 'whatsapp',
          status: 'connecting',
          qr: qrData.qr,
          qrTimestamp: qrData.timestamp
        });
      }
    }

    res.json({
      success: true,
      data: {
        connected: status.status === 'connected',
        qr: status.status !== 'connected' ? qrData?.qr : null,
        hasQR: !!qrData?.qr,
        status: qrData?.qr ? status.status : (isInitializing ? 'initializing' : status.status),
        message: status.status === 'connected'
          ? 'WhatsApp is connected'
          : qrData?.qr
            ? 'Scan QR code with WhatsApp'
            : (isInitializing ? 'WhatsApp is starting up... please wait' : 'QR code generating... please wait')
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
    const orgId = req.user.organization || userId;
    const resetSession = String(req.query.resetSession || '').toLowerCase() === 'true' || String(req.body?.resetSession || '').toLowerCase() === 'true';
    console.log('[whatsapp/connect] request', {
      userId: userId.toString(),
      resetSession,
      hasClient: whatsappService.clients.has(userId.toString()),
      isInitializing: whatsappService.initializing?.has(userId.toString())
    });
    if (resetSession) {
      console.log('[whatsapp/connect] forcing reset for', userId.toString());
      await whatsappService.forceResetTenant(userId.toString());
    }
    const result = await whatsappService.initializeClient(userId, { resetSession });
    console.log('[whatsapp/connect] initialize result', {
      userId: userId.toString(),
      resetSession,
      result
    });

    const connection = await ChannelConnection.findOneAndUpdate(
      { organization: orgId, type: 'whatsapp' },
      {
        organization: orgId,
        type: 'whatsapp',
        status: result.status === 'connected' ? 'connected' : 'connecting',
        connectedBy: userId,
        displayName: 'WhatsApp',
        connectedAt: result.status === 'connected' ? new Date() : undefined,
        lastError: result.error || null,
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );
    if (result.status === 'connected') {
      await ChannelConnection.updateOne(
        { _id: connection._id },
        { $set: { status: 'connected', connectedAt: connection.connectedAt || new Date(), lastSyncAt: new Date(), lastError: null } }
      );
      connection.status = 'connected';
      connection.connectedAt = connection.connectedAt || new Date();
      connection.lastSyncAt = new Date();
      connection.lastError = null;
    }

    if (global.io) {
      const payload = {
        userId: userId.toString(),
        channel: 'whatsapp',
        status: connection.status,
        connectionId: connection?._id?.toString?.() || null,
        connectedAt: connection.connectedAt || null,
        lastSyncAt: connection.lastSyncAt || new Date()
      };
      global.io.emit(SOCKET_EVENTS.CHANNEL_STATUS_CHANGED, payload);
      if (result.status === 'connected') {
        global.io.emit(SOCKET_EVENTS.WHATSAPP_CONNECTED, {
          ...payload,
          status: 'connected'
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        ...result,
        connection: connection.toObject ? connection.toObject() : connection
      }
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
router.get('/status', auth, async (req, res) => {
  const userId = req.user._id;
  const orgId = req.user.organization || userId;
  const status = whatsappService.getStatus(userId);

  try {
    const connection = await ChannelConnection.findOne({ organization: orgId, type: 'whatsapp' });
    const persistedStatus = connection?.status || 'disconnected';
    const mergedStatus = status.status === 'connected' || persistedStatus === 'connected'
      ? 'connected'
      : status.status === 'connecting' || persistedStatus === 'connecting'
        ? 'connecting'
        : 'disconnected';

    if (connection && connection.status !== mergedStatus) {
      connection.status = mergedStatus;
      connection.lastError = status.error || null;
      connection.lastSyncAt = new Date();
      if (mergedStatus === 'connected' && !connection.connectedAt) {
        connection.connectedAt = new Date();
      }
      await connection.save();
    }

    if (mergedStatus !== status.status) {
      status.status = mergedStatus;
    }
  } catch (error) {
    console.error('Error syncing WhatsApp status:', error.message || error);
  }
  
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
    const result = await whatsappService.disconnect(userId, { clearSession: true });
    
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
    const orgId = req.user.organization || userId;

    await whatsappService.disconnect(userId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await whatsappService.initializeClient(userId);

    const connection = await ChannelConnection.findOneAndUpdate(
      { organization: orgId, type: 'whatsapp' },
      {
        organization: orgId,
        type: 'whatsapp',
        status: result.status === 'connected' ? 'connected' : 'connecting',
        connectedBy: userId,
        displayName: 'WhatsApp',
        lastError: result.error || null,
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    if (global.io) {
      global.io.emit(SOCKET_EVENTS.CHANNEL_STATUS_CHANGED, {
        userId: userId.toString(),
        channel: 'whatsapp',
        status: connection.status,
        connectionId: connection?._id?.toString?.() || null
      });
    }

    res.json({
      success: true,
      data: {
        message: 'QR refresh initiated',
        connection: connection.toObject ? connection.toObject() : connection,
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