const express = require('express');
const router = express.Router();
const { query, param, body, validationResult } = require('express-validator');
const Log = require('../models/Log');
const { auth, authorize } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');
const { successResponse, errorResponse, asyncHandler, ERROR_CODES } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Convert empty-string query params to undefined so .optional() works correctly
const sanitizeEmptyQuery = (req, res, next) => {
  for (const key of Object.keys(req.query)) {
    if (req.query[key] === '') delete req.query[key];
  }
  next();
};

// All log routes require admin access
router.use(adminAuth);

// GET /api/logs — List logs with filtering and pagination
router.get('/', sanitizeEmptyQuery, [
  query('level').optional().isIn(['error', 'warn', 'info', 'debug']),
  query('source').optional().isIn(['frontend', 'backend', 'api', 'auth', 'whatsapp', 'telegram', 'system']),
  query('resolved').optional().isIn(['true', 'false']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, asyncHandler(async (req, res) => {
  const { level, source, resolved, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (level) filter.level = level;
  if (source) filter.source = source;
  if (resolved !== undefined) filter.resolved = resolved === 'true';
  if (search) {
    filter.$or = [
      { message: { $regex: search, $options: 'i' } },
      { 'error.message': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    Log.find(filter)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Log.countDocuments(filter)
  ]);

  res.json(successResponse({
    logs,
    pagination: {
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page)
    }
  }));
}));

// GET /api/logs/stats — Log statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const [byLevel, bySource, unresolvedErrors] = await Promise.all([
    Log.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]),
    Log.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]),
    Log.countDocuments({ level: 'error', resolved: false })
  ]);

  const levelStats = {};
  byLevel.forEach(item => { levelStats[item._id] = item.count; });

  const sourceStats = {};
  bySource.forEach(item => { sourceStats[item._id] = item.count; });

  res.json(successResponse({
    stats: {
      byLevel: levelStats,
      bySource: sourceStats,
      unresolvedErrors
    }
  }));
}));

// GET /api/logs/:id — Get single log
router.get('/:id', [
  param('id').isMongoId()
], validate, asyncHandler(async (req, res) => {
  const log = await Log.findById(req.params.id).populate('user', 'name email role');

  if (!log) {
    return res.status(404).json(errorResponse('Log not found', ERROR_CODES.NOT_FOUND, 404));
  }

  res.json(successResponse({ log }));
}));

// PUT /api/logs/:id/resolve — Mark log as resolved
router.put('/:id/resolve', [
  param('id').isMongoId()
], validate, asyncHandler(async (req, res) => {
  const log = await Log.findByIdAndUpdate(
    req.params.id,
    { resolved: true },
    { new: true }
  ).populate('user', 'name email role');

  if (!log) {
    return res.status(404).json(errorResponse('Log not found', ERROR_CODES.NOT_FOUND, 404));
  }

  res.json(successResponse({ log }, 'Log marked as resolved'));
}));

// DELETE /api/logs/:id — Delete a single log
router.delete('/:id', [
  param('id').isMongoId()
], validate, asyncHandler(async (req, res) => {
  const log = await Log.findByIdAndDelete(req.params.id);

  if (!log) {
    return res.status(404).json(errorResponse('Log not found', ERROR_CODES.NOT_FOUND, 404));
  }

  res.json(successResponse({}, 'Log deleted'));
}));

// DELETE /api/logs — Clear logs (with optional filters)
router.delete('/', asyncHandler(async (req, res) => {
  const { level, source, resolved, before } = req.query;

  const filter = {};
  if (level) filter.level = level;
  if (source) filter.source = source;
  if (resolved !== undefined) filter.resolved = resolved === 'true';
  if (before) filter.timestamp = { $lt: new Date(before) };

  const result = await Log.deleteMany(filter);

  res.json(successResponse({
    deletedCount: result.deletedCount
  }, `Deleted ${result.deletedCount} logs`));
}));

// POST /api/logs/frontend — Log frontend errors (no admin auth required, only regular auth)
// This route is mounted separately in server.js with only `auth` middleware
// We still define it here but it will be overridden in server.js for non-admin access
router.post('/frontend', asyncHandler(async (req, res) => {
  const { level = 'error', message, source = 'frontend', error, request, metadata } = req.body;

  const log = await Log.create({
    level,
    message: message || 'Frontend error',
    source,
    user: req.user?._id || null,
    error: error ? {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    } : undefined,
    request: request ? {
      method: request.method,
      url: request.url,
      ip: req.ip
    } : undefined,
    metadata
  });

  res.status(201).json(successResponse({ log }, 'Frontend error logged'));
}));

module.exports = router;