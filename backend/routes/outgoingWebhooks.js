const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { successResponse, errorResponse, asyncHandler } = require('../utils/response');
const outgoingWebhookService = require('../services/outgoingWebhook.service');

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/outgoing-webhooks
 * @desc    Get all outgoing webhooks for the current user
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const webhooks = await outgoingWebhookService.getAll(req.user._id, req.query);
  return res.json(successResponse({ webhooks }));
}));

/**
 * @route   GET /api/outgoing-webhooks/:id
 * @desc    Get a single outgoing webhook
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const webhook = await outgoingWebhookService.getById(req.user._id, req.params.id);
  if (!webhook) {
    return res.status(404).json(errorResponse('Webhook not found', 'NOT_FOUND', 404));
  }
  return res.json(successResponse(webhook));
}));

/**
 * @route   POST /api/outgoing-webhooks
 * @desc    Create a new outgoing webhook
 * @access  Private (admin/manager)
 */
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const { name, url, method, events, headers, secret, isActive, retryCount, retryDelayMs } = req.body;

  if (!name || !url) {
    return res.status(400).json(errorResponse('Name and URL are required', 'VALIDATION_ERROR', 400));
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json(errorResponse('At least one event is required', 'VALIDATION_ERROR', 400));
  }

  const webhook = await outgoingWebhookService.create(req.user._id, {
    name,
    url,
    method: method || 'POST',
    events,
    headers: headers || {},
    secret: secret || '',
    isActive: isActive !== false,
    retryCount: retryCount || 3,
    retryDelayMs: retryDelayMs || 1000
  });

  return res.status(201).json(successResponse(webhook, 'Webhook created successfully'));
}));

/**
 * @route   PUT /api/outgoing-webhooks/:id
 * @desc    Update an outgoing webhook
 * @access  Private (admin/manager)
 */
router.put('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const webhook = await outgoingWebhookService.update(req.user._id, req.params.id, req.body);
  if (!webhook) {
    return res.status(404).json(errorResponse('Webhook not found', 'NOT_FOUND', 404));
  }
  return res.json(successResponse(webhook, 'Webhook updated successfully'));
}));

/**
 * @route   DELETE /api/outgoing-webhooks/:id
 * @desc    Delete an outgoing webhook
 * @access  Private (admin/manager)
 */
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const result = await outgoingWebhookService.delete(req.user._id, req.params.id);
  if (result.deletedCount === 0) {
    return res.status(404).json(errorResponse('Webhook not found', 'NOT_FOUND', 404));
  }
  return res.json(successResponse(null, 'Webhook deleted successfully'));
}));

/**
 * @route   POST /api/outgoing-webhooks/:id/toggle
 * @desc    Toggle webhook active/inactive
 * @access  Private (admin/manager)
 */
router.post('/:id/toggle', authorize('admin'), asyncHandler(async (req, res) => {
  const webhook = await outgoingWebhookService.toggle(req.user._id, req.params.id);
  if (!webhook) {
    return res.status(404).json(errorResponse('Webhook not found', 'NOT_FOUND', 404));
  }
  return res.json(successResponse(webhook, `Webhook ${webhook.isActive ? 'activated' : 'deactivated'}`));
}));

/**
 * @route   POST /api/outgoing-webhooks/:id/test
 * @desc    Test webhook delivery
 * @access  Private
 */
router.post('/:id/test', asyncHandler(async (req, res) => {
  const result = await outgoingWebhookService.testDelivery(req.user._id, req.params.id);
  if (result.success) {
    return res.json(successResponse(result, 'Test delivery successful'));
  }
  return res.status(400).json(errorResponse(result.error || 'Test delivery failed', 'WEBHOOK_TEST_FAILED', 400));
}));

/**
 * @route   GET /api/outgoing-webhooks/:id/logs
 * @desc    Get delivery logs for a webhook
 * @access  Private
 */
router.get('/:id/logs', asyncHandler(async (req, res) => {
  const logs = await outgoingWebhookService.getDeliveryLogs(req.user._id, req.params.id, req.query);
  return res.json(successResponse(logs));
}));

module.exports = router;