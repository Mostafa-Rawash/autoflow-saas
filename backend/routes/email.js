const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { successResponse, asyncHandler } = require('../utils/response');
const emailService = require('../services/email.service');

router.use(auth);

router.get('/config', asyncHandler(async (req, res) => {
  const config = await emailService.getConfig(req.user.id);
  res.json(successResponse(config, 'تم جلب إعدادات البريد الإلكتروني'));
}));

router.put('/config', authorize('admin'), asyncHandler(async (req, res) => {
  const config = await emailService.saveConfig(req.user.id, req.body);
  res.json(successResponse(config, 'تم حفظ إعدادات البريد الإلكتروني'));
}));

router.post('/test', authorize('admin'), asyncHandler(async (req, res) => {
  const result = await emailService.testConnection(req.user.id);
  res.json(successResponse(result, result.success ? 'تم الاتصال بنجاح' : 'فشل الاتصال'));
}));

router.delete('/config', authorize('admin'), asyncHandler(async (req, res) => {
  await emailService.deleteConfig(req.user.id);
  res.json(successResponse(null, 'تم حذف إعدادات البريد الإلكتروني'));
}));

module.exports = router;