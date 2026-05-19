const express = require('express');
const router = express.Router();
const { auth, authorize, checkSubscription, checkLimit } = require('../middleware/auth');
const { successResponse, errorResponse, asyncHandler } = require('../utils/response');
const contactService = require('../services/contact.service');

router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const result = await contactService.getContacts(req.user.id, req.query);
  res.json(successResponse(result, 'تم جلب جهات الاتصال بنجاح'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const contact = await contactService.getContact(req.user.id, req.params.id);
  res.json(successResponse(contact, 'تم جلب جهة الاتصال بنجاح'));
}));

router.get('/:id/conversations', asyncHandler(async (req, res) => {
  const conversations = await contactService.getContactConversations(req.user.id, req.params.id);
  res.json(successResponse(conversations, 'تم جلب المحادثات بنجاح'));
}));

router.post('/', authorize('manager'), checkSubscription, checkLimit('conversations'), asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.user.id, req.body);
  res.status(201).json(successResponse(contact, 'تم إنشاء جهة الاتصال بنجاح'));
}));

router.put('/:id', authorize('manager'), asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.user.id, req.params.id, req.body);
  res.json(successResponse(contact, 'تم تحديث جهة الاتصال بنجاح'));
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const contact = await contactService.deleteContact(req.user.id, req.params.id);
  res.json(successResponse(contact, 'تم حذف جهة الاتصال بنجاح'));
}));

router.post('/:primaryId/merge/:secondaryId', authorize('admin'), asyncHandler(async (req, res) => {
  const merged = await contactService.mergeContacts(req.user.id, req.params.primaryId, req.params.secondaryId);
  res.json(successResponse(merged, 'تم دمج جهات الاتصال بنجاح'));
}));

module.exports = router;