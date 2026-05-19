const express = require('express');
const router = express.Router();
const { auth, authorize, checkSubscription } = require('../middleware/auth');
const { successResponse, asyncHandler } = require('../utils/response');
const workflowService = require('../services/workflow.service');

router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const result = await workflowService.getWorkflows(req.user.id, req.query);
  res.json(successResponse(result, 'تم جلب مسارات العمل بنجاح'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const workflow = await workflowService.getWorkflow(req.user.id, req.params.id);
  res.json(successResponse(workflow, 'تم جلب مسار العمل بنجاح'));
}));

router.post('/', authorize('manager'), checkSubscription, asyncHandler(async (req, res) => {
  const workflow = await workflowService.createWorkflow(req.user.id, req.body);
  res.status(201).json(successResponse(workflow, 'تم إنشاء مسار العمل بنجاح'));
}));

router.put('/:id', authorize('manager'), asyncHandler(async (req, res) => {
  const workflow = await workflowService.updateWorkflow(req.user.id, req.params.id, req.body);
  res.json(successResponse(workflow, 'تم تحديث مسار العمل بنجاح'));
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const workflow = await workflowService.deleteWorkflow(req.user.id, req.params.id);
  res.json(successResponse(workflow, 'تم حذف مسار العمل بنجاح'));
}));

router.post('/:id/toggle', authorize('manager'), asyncHandler(async (req, res) => {
  const workflow = await workflowService.toggleWorkflow(req.user.id, req.params.id);
  res.json(successResponse(workflow, workflow.isActive ? 'تم تفعيل مسار العمل' : 'تم تعطيل مسار العمل'));
}));

module.exports = router;