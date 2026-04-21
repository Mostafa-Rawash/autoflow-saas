/**
 * Logs Routes
 * Admin-only endpoints for viewing system logs
 */

const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { auth, authorize } = require('../middleware/auth');
const { api } = require('../utils/logger');

// Admin only middleware using authorize
const adminOnly = authorize('owner', 'admin', 'manager');

/**
 * @route   GET /api/logs
 * @desc    Get logs with filters and pagination
 * @access  Admin only
 */
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      level,
      source,
      resolved,
      userId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
      sort = '-timestamp'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (level) filter.level = level;
    if (source) filter.source = source;
    if (resolved !== undefined) filter.resolved = resolved === 'true';
    if (userId) filter['user.id'] = userId;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'error.message': { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Log.countDocuments(filter);
    
    // Get logs with pagination
    const logs = await Log.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user.id', 'name email role')
      .populate('resolvedBy', 'name email')
      .lean();

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    await api.error('Failed to get logs', { error, request: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to get logs'
    });
  }
});

/**
 * @route   GET /api/logs/stats
 * @desc    Get log statistics
 * @access  Admin only
 */
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {};
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    // Get counts by level
    const byLevel = await Log.aggregate([
      { $match: match },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get counts by source
    const bySource = await Log.aggregate([
      { $match: match },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get unresolved errors count
    const unresolvedErrors = await Log.countDocuments({
      level: 'error',
      resolved: false
    });

    // Get recent errors
    const recentErrors = await Log.find({ level: 'error' })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('user.id', 'name email')
      .lean();

    res.json({
      success: true,
      data: {
        byLevel: byLevel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySource: bySource.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        unresolvedErrors,
        recentErrors,
        total: await Log.countDocuments(match)
      }
    });
  } catch (error) {
    await api.error('Failed to get log stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get log statistics'
    });
  }
});

/**
 * @route   GET /api/logs/:id
 * @desc    Get single log details
 * @access  Admin only
 */
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id)
      .populate('user.id', 'name email role')
      .populate('resolvedBy', 'name email');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    await api.error('Failed to get log', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get log'
    });
  }
});

/**
 * @route   PUT /api/logs/:id/resolve
 * @desc    Mark log as resolved
 * @access  Admin only
 */
router.put('/:id/resolve', auth, adminOnly, async (req, res) => {
  try {
    const log = await Log.findByIdAndUpdate(
      req.params.id,
      {
        resolved: true,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('resolvedBy', 'name email');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    await api.info(`Log resolved: ${log.message}`, { user: req.user });

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    await api.error('Failed to resolve log', { error, user: req.user });
    res.status(500).json({
      success: false,
      error: 'Failed to resolve log'
    });
  }
});

/**
 * @route   DELETE /api/logs/:id
 * @desc    Delete a log
 * @access  Admin only
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    res.json({
      success: true,
      message: 'Log deleted'
    });
  } catch (error) {
    await api.error('Failed to delete log', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to delete log'
    });
  }
});

/**
 * @route   DELETE /api/logs
 * @desc    Clear logs (with filters)
 * @access  Owner only
 */
router.delete('/', auth, async (req, res) => {
  try {
    // Only owner can clear all logs
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only owner can clear logs'
      });
    }

    const { level, source, before } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (source) filter.source = source;
    if (before) filter.timestamp = { $lt: new Date(before) };

    const result = await Log.deleteMany(filter);

    await api.info(`Logs cleared: ${result.deletedCount} logs deleted`, { user: req.user });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} logs`
    });
  } catch (error) {
    await api.error('Failed to clear logs', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to clear logs'
    });
  }
});

/**
 * @route   POST /api/logs/frontend
 * @desc    Log frontend error
 * @access  Public (with auth)
 */
router.post('/frontend', auth, async (req, res) => {
  try {
    const { message, error, url, line, column, stack } = req.body;

    const log = await Log.create({
      level: 'error',
      message: `[Frontend] ${message}`,
      source: 'frontend',
      error: {
        name: 'FrontendError',
        message: error || message,
        stack: stack || `at ${url}:${line}:${column}`
      },
      request: {
        url,
        metadata: { line, column }
      },
      user: req.user ? {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      } : undefined,
      metadata: {
        url,
        line,
        column
      }
    });

    res.json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error('Failed to log frontend error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to log error'
    });
  }
});

module.exports = router;