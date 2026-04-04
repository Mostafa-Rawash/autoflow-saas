const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { auth, checkLimit, checkSubscription } = require('../middleware/auth');

// @route   GET /api/conversations
// @desc    Get all conversations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, channel, assignedTo, page = 1, limit = 20 } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    if (channel) query.channel = channel;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const conversations = await Conversation.find(query)
      .populate('assignedTo', 'name avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Conversation.countDocuments(query);
    
    res.json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/conversations/:id
// @desc    Get single conversation
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('assignedTo', 'name avatar');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get messages
    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 });
    
    res.json({ success: true, conversation, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/conversations
// @desc    Create new conversation
// @access  Private
router.post('/', auth, checkSubscription, checkLimit('conversations'), async (req, res) => {
  try {
    const { channel, contact, metadata } = req.body;
    
    const conversation = new Conversation({
      user: req.user.id,
      channel,
      contact,
      metadata
    });
    
    await conversation.save();
    
    res.status(201).json({ success: true, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/conversations/:id
// @desc    Update conversation
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, tags, notes } = req.body;
    
    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status, priority, assignedTo, tags, $push: { notes } },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ success: true, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/conversations/:id/messages
// @desc    Send message in conversation
// @access  Private
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { content, type, media, buttons } = req.body;
    
    const message = new Message({
      conversation: req.params.id,
      sender: 'agent',
      senderId: req.user.id,
      content,
      type,
      media,
      buttons
    });
    
    await message.save();
    
    // Update conversation last message
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: {
        content,
        timestamp: new Date(),
        sender: 'agent'
      }
    });
    
    // TODO: Send to external channel (WhatsApp, Messenger, etc.)
    
    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/conversations/stats
// @desc    Get conversation statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await Conversation.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: 'active' } }, { $count: 'count' }],
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: 'count' }],
          byChannel: [
            { $group: { _id: '$channel', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    
    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;