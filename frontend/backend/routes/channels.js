const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ChannelConnection = require('../models/ChannelConnection');

const normalizeOrg = (req) => req.user.organization || req.user._id;

router.get('/', auth, async (req, res) => {
  try {
    const organization = normalizeOrg(req);
    const connections = await ChannelConnection.find({ organization });
    res.json({ success: true, channels: connections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/connect', auth, async (req, res) => {
  try {
    const organization = normalizeOrg(req);
    const { type, displayName, config } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, error: 'Channel type is required' });
    }

    const connection = await ChannelConnection.findOneAndUpdate(
      { organization, type },
      {
        organization,
        type,
        displayName: displayName || type,
        config: config || {},
        status: 'connecting',
        connectedBy: req.user._id
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, channel: connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:type', auth, async (req, res) => {
  try {
    const organization = normalizeOrg(req);
    const connection = await ChannelConnection.findOneAndUpdate(
      { organization, type: req.params.type },
      { status: 'disconnected', lastError: null },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    res.json({ success: true, channel: connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
