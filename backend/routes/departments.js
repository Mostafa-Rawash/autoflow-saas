const express = require('express');
const router = express.Router();
const { auth, authorize, checkSubscription } = require('../middleware/auth');
const { successResponse, asyncHandler } = require('../utils/response');
const departmentService = require('../services/department.service');

router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const result = await departmentService.getDepartments(req.user.id, req.query);
  res.json(successResponse(result, 'تم جلب الأقسام بنجاح'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const dept = await departmentService.getDepartment(req.user.id, req.params.id);
  res.json(successResponse(dept, 'تم جلب القسم بنجاح'));
}));

router.post('/', authorize('admin'), checkSubscription, asyncHandler(async (req, res) => {
  const dept = await departmentService.createDepartment(req.user.id, req.body);
  res.status(201).json(successResponse(dept, 'تم إنشاء القسم بنجاح'));
}));

router.put('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const dept = await departmentService.updateDepartment(req.user.id, req.params.id, req.body);
  res.json(successResponse(dept, 'تم تحديث القسم بنجاح'));
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const dept = await departmentService.deleteDepartment(req.user.id, req.params.id);
  res.json(successResponse(dept, 'تم حذف القسم بنجاح'));
}));

router.post('/:id/agents', authorize('admin'), asyncHandler(async (req, res) => {
  const dept = await departmentService.addAgent(req.user.id, req.params.id, req.body.agentId);
  res.json(successResponse(dept, 'تم إضافة الوكيل بنجاح'));
}));

router.delete('/:id/agents/:agentId', authorize('admin'), asyncHandler(async (req, res) => {
  const dept = await departmentService.removeAgent(req.user.id, req.params.id, req.params.agentId);
  res.json(successResponse(dept, 'تم إزالة الوكيل بنجاح'));
}));

router.put('/:id/lead', authorize('admin'), asyncHandler(async (req, res) => {
  const dept = await departmentService.assignLead(req.user.id, req.params.id, req.body.agentId);
  res.json(successResponse(dept, 'تم تعيين قائد القسم بنجاح'));
}));

router.post('/:id/assign', auth, asyncHandler(async (req, res) => {
  const agentId = await departmentService.getNextAgent(req.user.id, req.params.id, req.query.channel);
  res.json(successResponse({ agentId }, 'تم تعيين الوكيل بنجاح'));
}));

module.exports = router;