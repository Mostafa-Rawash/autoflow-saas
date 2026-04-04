const express = require('express');
const router = express.Router();
const AutoReply = require('../models/AutoReply');
const { auth, checkLimit, checkSubscription } = require('../middleware/auth');

// Demo auto-replies for when DB is empty
const demoAutoReplies = [
  {
    _id: 'demo-1',
    name: 'مرحباً',
    keywords: ['مرحبا', 'السلام عليكم', 'hi', 'hello'],
    response: 'أهلاً بك! كيف يمكنني مساعدتك؟',
    matchType: 'contains',
    channel: 'whatsapp',
    isActive: true,
    priority: 1,
    usageCount: 45
  },
  {
    _id: 'demo-2',
    name: 'أسعار',
    keywords: ['سعر', 'أسعار', 'باقة', 'pricing'],
    response: 'باقاتنا تبدأ من 2000 جنيه شهرياً وتشمل قناة واتس آب واحدة. هل تريد معرفة المزيد؟',
    matchType: 'contains',
    channel: 'whatsapp',
    isActive: true,
    priority: 2,
    usageCount: 32
  },
  {
    _id: 'demo-3',
    name: 'تواصل',
    keywords: ['تواصل', 'اتصال', 'رقم', 'phone'],
    response: 'يمكنك التواصل معنا على واتس آب: 01099129550 أو إيميل: mostafa@rawash.com',
    matchType: 'contains',
    channel: 'whatsapp',
    isActive: true,
    priority: 3,
    usageCount: 28
  }
];

// @route   GET /api/auto-replies
// @desc    Get all auto-reply rules
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const rules = await AutoReply.find({ user: req.user.id }).sort({ priority: -1 });
    
    if (rules.length === 0) {
      return res.json({ success: true, autoReplies: demoAutoReplies, demo: true });
    }
    
    res.json({ success: true, autoReplies: rules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auto-replies
// @desc    Create auto-reply rule
// @access  Private
router.post('/', auth, checkSubscription, checkLimit('templates'), async (req, res) => {
  try {
    const { name, keywords, response, matchType, priority, isActive } = req.body;
    
    const autoReply = new AutoReply({
      user: req.user.id,
      name,
      keywords,
      response,
      matchType: matchType || 'contains',
      channel: 'whatsapp',
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await autoReply.save();
    res.status(201).json({ success: true, autoReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/auto-replies/:id
// @desc    Update auto-reply rule
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, keywords, response, matchType, priority, isActive } = req.body;
    
    const autoReply = await AutoReply.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { 
        name, 
        keywords, 
        response, 
        matchType, 
        priority, 
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!autoReply) {
      return res.status(404).json({ error: 'Auto-reply not found' });
    }
    
    res.json({ success: true, autoReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/auto-replies/:id
// @desc    Delete auto-reply rule
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const autoReply = await AutoReply.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!autoReply) {
      return res.status(404).json({ error: 'Auto-reply not found' });
    }
    
    res.json({ success: true, message: 'Auto-reply deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auto-replies/match
// @desc    Find matching auto-reply for a message
// @access  Private
router.post('/match', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    const rule = await AutoReply.findMatching(req.user.id, message);
    
    if (!rule) {
      // Try demo rules
      for (const demoRule of demoAutoReplies) {
        if (demoRule.isActive) {
          const lowerMessage = message.toLowerCase();
          for (const keyword of demoRule.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
              return res.json({ 
                success: true, 
                matched: true, 
                autoReply: demoRule,
                response: demoRule.response,
                demo: true
              });
            }
          }
        }
      }
      
      return res.json({ 
        success: true, 
        matched: false, 
        response: null 
      });
    }
    
    await rule.incrementUsage();
    
    res.json({ 
      success: true, 
      matched: true, 
      autoReply: rule,
      response: rule.response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;