const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { successResponse, errorResponse, asyncHandler } = require('../utils/response');
const instagramService = require('../services/instagram.service');

// Authenticated routes
router.use(auth);

/**
 * @route   POST /api/instagram/connect
 * @desc    Connect Instagram via Facebook Page credentials
 * @access  Private
 */
router.post('/connect', asyncHandler(async (req, res) => {
  const { pageId, pageAccessToken, igUserId } = req.body;

  if (!pageId || !pageAccessToken) {
    return res.status(400).json(errorResponse('Page ID and Page Access Token are required', 'VALIDATION_ERROR', 400));
  }

  const result = await instagramService.connect(req.user._id, { pageId, pageAccessToken, igUserId });

  if (result.status === 'error') {
    return res.status(400).json(errorResponse(result.message, 'INSTAGRAM_ERROR', 400));
  }

  return res.json(successResponse(result, 'Instagram connected successfully'));
}));

/**
 * @route   POST /api/instagram/disconnect
 * @desc    Disconnect Instagram
 * @access  Private
 */
router.post('/disconnect', asyncHandler(async (req, res) => {
  const result = await instagramService.disconnect(req.user._id);
  return res.json(successResponse(result, 'Instagram disconnected'));
}));

/**
 * @route   GET /api/instagram/status
 * @desc    Get Instagram connection status
 * @access  Private
 */
router.get('/status', asyncHandler(async (req, res) => {
  const result = await instagramService.getStatus(req.user._id);
  return res.json(successResponse(result));
}));

/**
 * @route   POST /api/instagram/send
 * @desc    Send a message via Instagram DM
 * @access  Private
 */
router.post('/send', asyncHandler(async (req, res) => {
  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).json(errorResponse('Recipient and content are required', 'VALIDATION_ERROR', 400));
  }

  const result = await instagramService.sendMessage(req.user._id, to, content);
  return res.json(successResponse(result, 'Message sent successfully'));
}));

module.exports = router;