const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// @route   GET /api/analytics/overview
// @desc    Get overview analytics
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = { user: req.user._id };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    
    const conversations = await Conversation.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);
    
    const messages = await Message.aggregate([
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversation',
          foreignField: '_id',
          as: 'conversation'
        }
      },
      { $unwind: '$conversation' },
      { $match: { 'conversation.user': req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byBot: { $sum: { $cond: [{ $eq: ['$sender', 'bot'] }, 1, 0] } },
          byAgent: { $sum: { $cond: [{ $eq: ['$sender', 'agent'] }, 1, 0] } },
          byContact: { $sum: { $cond: [{ $eq: ['$sender', 'contact'] }, 1, 0] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      conversations: conversations[0] || { total: 0, active: 0, resolved: 0 },
      messages: messages[0] || { total: 0, byBot: 0, byAgent: 0, byContact: 0 }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/channels
// @desc    Get channel breakdown
// @access  Private
router.get('/channels', auth, async (req, res) => {
  try {
    const breakdown = await Conversation.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$channel',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ success: true, breakdown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/timeline
// @desc   Get timeline analytics
// @access  Private
router.get('/timeline', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const timeline = await Conversation.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ success: true, timeline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const data = await Conversation.find({ user: req.user.id })
      .populate('assignedTo', 'name')
      .lean();
    
    if (format === 'csv') {
      // TODO: Convert to CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      return res.send('CSV export not implemented yet');
    }
    
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;