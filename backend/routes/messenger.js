const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { successResponse, errorResponse, asyncHandler } = require('../utils/response');
const messengerService = require('../services/messenger.service');

// Authenticated routes
router.use(auth);

/**
 * @route   POST /api/messenger/connect
 * @desc    Connect Messenger via Facebook Page credentials
 * @access  Private
 */
router.post('/connect', asyncHandler(async (req, res) => {
  const { pageId, pageAccessToken } = req.body;

  if (!pageId || !pageAccessToken) {
    return res.status(400).json(errorResponse('Page ID and Page Access Token are required', 'VALIDATION_ERROR', 400));
  }

  const result = await messengerService.connect(req.user._id, { pageId, pageAccessToken });

  if (result.status === 'error') {
    return res.status(400).json(errorResponse(result.message, 'MESSENGER_ERROR', 400));
  }

  return res.json(successResponse(result, 'Messenger connected successfully'));
}));

/**
 * @route   POST /api/messenger/disconnect
 * @desc    Disconnect Messenger
 * @access  Private
 */
router.post('/disconnect', asyncHandler(async (req, res) => {
  const result = await messengerService.disconnect(req.user._id);
  return res.json(successResponse(result, 'Messenger disconnected'));
}));

/**
 * @route   GET /api/messenger/status
 * @desc    Get Messenger connection status
 * @access  Private
 */
router.get('/status', asyncHandler(async (req, res) => {
  const result = await messengerService.getStatus(req.user._id);
  return res.json(successResponse(result));
}));

/**
 * @route   POST /api/messenger/send
 * @desc    Send a message via Messenger
 * @access  Private
 */
router.post('/send', asyncHandler(async (req, res) => {
  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).json(errorResponse('Recipient and content are required', 'VALIDATION_ERROR', 400));
  }

  const result = await messengerService.sendMessage(req.user._id, to, content);
  return res.json(successResponse(result, 'Message sent successfully'));
}));

module.exports = router;