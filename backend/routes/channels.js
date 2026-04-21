const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ChannelConnection = require('../models/ChannelConnection');
const SOCKET_EVENTS = require('../constants/socketEvents');

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
        connectedBy: req.user._id,
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    if (global.io) {
      global.io.emit(SOCKET_EVENTS.CHANNEL_STATUS_CHANGED, {
        userId: req.user._id.toString(),
        channel: type,
        status: connection.status,
        connectionId: connection._id?.toString?.() || null,
        lastSyncAt: connection.lastSyncAt
      });
    }

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
      { status: 'disconnected', lastError: null, lastSyncAt: new Date() },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    if (global.io) {
      global.io.emit(SOCKET_EVENTS.CHANNEL_STATUS_CHANGED, {
        userId: req.user._id.toString(),
        channel: req.params.type,
        status: connection.status,
        connectionId: connection._id?.toString?.() || null,
        lastSyncAt: connection.lastSyncAt
      });
    }

    res.json({ success: true, channel: connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
