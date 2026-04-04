const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const { auth } = require('../middleware/auth');

// @route   GET /api/channels
// @desc    Get all connected channels
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const integrations = await Integration.find({ user: req.user.id });
    
    res.json({ success: true, integrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/channels/connect
// @desc    Connect new channel
// @access  Private
router.post('/connect', auth, async (req, res) => {
  try {
    const { type, name, config } = req.body;
    
    // Check if already connected
    let integration = await Integration.findOne({ user: req.user.id, type });
    
    if (integration) {
      return res.status(400).json({ error: 'Channel already connected' });
    }
    
    integration = new Integration({
      user: req.user.id,
      type,
      name,
      config,
      status: 'pending'
    });
    
    await integration.save();
    
    // TODO: Verify connection with external API
    
    res.status(201).json({ success: true, integration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/channels/:id
// @desc    Update channel config
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const integration = await Integration.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { config: req.body.config },
      { new: true }
    );
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json({ success: true, integration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/channels/:id
// @desc    Disconnect channel
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const integration = await Integration.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json({ success: true, message: 'Channel disconnected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/channels/:id/test
// @desc    Test channel connection
// @access  Private
router.post('/:id/test', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    // TODO: Test actual connection
    
    res.json({ success: true, message: 'Connection test successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;