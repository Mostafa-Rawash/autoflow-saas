const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { successResponse, errorResponse, asyncHandler } = require('../utils/response');
const whatsappBusiness = require('../services/whatsappBusiness.service');

// All routes require authentication (except webhook receiver/verification)
router.use(auth);

/**
 * @route   POST /api/whatsapp-business/connect
 * @desc    Connect WhatsApp Business API with credentials
 * @access  Private
 */
router.post('/connect', asyncHandler(async (req, res) => {
  const { phoneNumberId, accessToken, businessAccountId, wabaId } = req.body;

  if (!phoneNumberId || !accessToken) {
    return res.status(400).json(errorResponse(
      'Phone Number ID and Access Token are required',
      'VALIDATION_ERROR',
      400
    ));
  }

  const result = await whatsappBusiness.connect(req.user._id, {
    phoneNumberId,
    accessToken,
    businessAccountId,
    wabaId
  });

  if (result.status === 'error') {
    return res.status(400).json(errorResponse(result.message, 'WHATSAPP_BUSINESS_ERROR', 400));
  }

  return res.json(successResponse(result, 'WhatsApp Business API connected successfully'));
}));

/**
 * @route   POST /api/whatsapp-business/disconnect
 * @desc    Disconnect WhatsApp Business API
 * @access  Private
 */
router.post('/disconnect', asyncHandler(async (req, res) => {
  const result = await whatsappBusiness.disconnect(req.user._id);
  return res.json(successResponse(result, 'WhatsApp Business API disconnected'));
}));

/**
 * @route   GET /api/whatsapp-business/status
 * @desc    Get WhatsApp Business API connection status
 * @access  Private
 */
router.get('/status', asyncHandler(async (req, res) => {
  const result = await whatsappBusiness.getStatus(req.user._id);
  return res.json(successResponse(result));
}));

/**
 * @route   POST /api/whatsapp-business/send
 * @desc    Send a text message via WhatsApp Business API
 * @access  Private
 */
router.post('/send', asyncHandler(async (req, res) => {
  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).json(errorResponse(
      'Recipient (to) and content are required',
      'VALIDATION_ERROR',
      400
    ));
  }

  const result = await whatsappBusiness.sendMessage(req.user._id, to, content);
  return res.json(successResponse(result, 'Message sent successfully'));
}));

/**
 * @route   POST /api/whatsapp-business/send-template
 * @desc    Send a template message via WhatsApp Business API
 * @access  Private
 */
router.post('/send-template', asyncHandler(async (req, res) => {
  const { to, templateName, languageCode, components } = req.body;

  if (!to || !templateName) {
    return res.status(400).json(errorResponse(
      'Recipient (to) and template name are required',
      'VALIDATION_ERROR',
      400
    ));
  }

  const result = await whatsappBusiness.sendTemplate(
    req.user._id,
    to,
    templateName,
    languageCode || 'en',
    components || []
  );
  return res.json(successResponse(result, 'Template message sent successfully'));
}));

/**
 * @route   POST /api/whatsapp-business/send-interactive
 * @desc    Send an interactive message (buttons, lists) via WhatsApp Business API
 * @access  Private
 */
router.post('/send-interactive', asyncHandler(async (req, res) => {
  const { to, interactive } = req.body;

  if (!to || !interactive) {
    return res.status(400).json(errorResponse(
      'Recipient (to) and interactive payload are required',
      'VALIDATION_ERROR',
      400
    ));
  }

  const result = await whatsappBusiness.sendInteractiveMessage(req.user._id, to, interactive);
  return res.json(successResponse(result, 'Interactive message sent successfully'));
}));

/**
 * @route   POST /api/whatsapp-business/send-media
 * @desc    Send a media message via WhatsApp Business API
 * @access  Private
 */
router.post('/send-media', asyncHandler(async (req, res) => {
  const { to, mediaType, mediaUrl, caption } = req.body;

  if (!to || !mediaType || !mediaUrl) {
    return res.status(400).json(errorResponse(
      'Recipient (to), media type, and media URL are required',
      'VALIDATION_ERROR',
      400
    ));
  }

  const result = await whatsappBusiness.sendMediaMessage(req.user._id, to, mediaType, mediaUrl, caption);
  return res.json(successResponse(result, 'Media message sent successfully'));
}));

/**
 * @route   GET /api/whatsapp-business/health
 * @desc    Health check for WhatsApp Business API connection
 * @access  Private
 */
router.get('/health', asyncHandler(async (req, res) => {
  const result = await whatsappBusiness.healthCheck(req.user._id);
  return res.json(successResponse(result));
}));

module.exports = router;