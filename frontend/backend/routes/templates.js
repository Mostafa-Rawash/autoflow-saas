const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { auth } = require('../middleware/auth');

// @route   GET /api/templates
// @desc    Get all templates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { channel, category } = req.query;
    
    const query = { user: req.user.id, isActive: true };
    if (channel) query.channel = channel;
    if (category) query.category = category;
    
    const templates = await Template.find(query).sort({ usageCount: -1 });
    
    res.json({ success: true, templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/templates
// @desc    Create new template
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, channel, content, triggers, language } = req.body;
    
    const template = new Template({
      user: req.user.id,
      name,
      category,
      channel,
      content,
      triggers,
      language
    });
    
    await template.save();
    
    res.status(201).json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;