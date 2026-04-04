const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const activeChannel = {
  id: 'whatsapp',
  type: 'whatsapp',
  name: 'واتس آب',
  status: 'connected',
  available: true,
  color: '#25D366',
  messages: 523,
  lastSync: '2026-04-04T14:30:00Z'
};

const comingSoonChannels = [
  { id: 'messenger', type: 'messenger', name: 'ماسنجر', status: 'coming-soon', available: false },
  { id: 'instagram', type: 'instagram', name: 'إنستجرام', status: 'coming-soon', available: false },
  { id: 'telegram', type: 'telegram', name: 'تيليجرام', status: 'coming-soon', available: false }
];

// @route   GET /api/channels
// @desc    Get current channel setup
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      integrations: [activeChannel],
      disabled: comingSoonChannels
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/channels/connect
// @desc    Connect WhatsApp only
// @access  Private
router.post('/connect', auth, async (req, res) => {
  try {
    const { type } = req.body;
    if (type && type !== 'whatsapp') {
      return res.status(403).json({
        success: false,
        error: 'Only WhatsApp is available right now',
        code: 'CHANNEL_DISABLED'
      });
    }

    return res.json({
      success: true,
      integration: activeChannel,
      message: 'WhatsApp is already connected in demo mode'
    });
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
    if (req.params.id !== 'whatsapp') {
      return res.status(403).json({
        success: false,
        error: 'This channel is disabled',
        code: 'CHANNEL_DISABLED'
      });
    }

    res.json({ success: true, integration: activeChannel });
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
    if (req.params.id !== 'whatsapp') {
      return res.status(403).json({
        success: false,
        error: 'This channel is disabled',
        code: 'CHANNEL_DISABLED'
      });
    }

    return res.json({ success: true, message: 'WhatsApp disconnect is not available in demo mode' });
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
    if (req.params.id !== 'whatsapp') {
      return res.status(403).json({
        success: false,
        error: 'This channel is disabled',
        code: 'CHANNEL_DISABLED'
      });
    }

    res.json({ success: true, message: 'Connection test successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
