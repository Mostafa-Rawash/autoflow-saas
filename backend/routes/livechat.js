const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { successResponse, asyncHandler } = require('../utils/response');
const liveChatService = require('../services/liveChat.service');

// Authenticated routes
router.get('/config', auth, asyncHandler(async (req, res) => {
  const config = await liveChatService.getConfig(req.user.id);
  res.json(successResponse(config, 'تم جلب إعدادات الدردشة المباشرة'));
}));

router.put('/config', auth, authorize('manager'), asyncHandler(async (req, res) => {
  const config = await liveChatService.updateConfig(req.user.id, req.body);
  res.json(successResponse(config, 'تم تحديث إعدادات الدردشة المباشرة'));
}));

// Public widget routes (no auth required)
router.get('/widget/:userId', asyncHandler(async (req, res) => {
  const config = await liveChatService.getWidgetConfig(req.params.userId);
  if (!config) return res.status(404).json({ error: 'الدردشة المباشرة غير متاحة' });
  res.json(successResponse(config, 'Widget config'));
}));

router.post('/widget/:userId/initiate', asyncHandler(async (req, res) => {
  const conversation = await liveChatService.initiateChat(req.params.userId, req.body);
  res.status(201).json(successResponse(conversation, 'تم بدء المحادثة بنجاح'));
}));

router.post('/widget/message/:conversationId', asyncHandler(async (req, res) => {
  const message = await liveChatService.sendVisitorMessage(req.params.conversationId, req.body);
  res.status(201).json(successResponse(message, 'تم إرسال الرسالة'));
}));

module.exports = router;