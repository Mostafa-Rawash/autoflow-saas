const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram.service');
const ChannelConnection = require('../models/ChannelConnection');
const { auth } = require('../middleware/auth');

const getOrganization = (req) => req.user.organization || req.user._id;

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'telegram',
    timestamp: new Date().toISOString()
  });
});

router.get('/status', auth, async (req, res) => {
  try {
    const organization = getOrganization(req);
    const connection = await ChannelConnection.findOne({ organization, type: 'telegram' });
    if (connection?.config?.botToken) telegramService.botToken = connection.config.botToken;
    if (connection?.config?.botUsername) telegramService.botUsername = connection.config.botUsername.replace(/^@/, '');
    if (connection?.config?.botUsername) telegramService.botLink = `https://t.me/${connection.config.botUsername.replace(/^@/, '')}`;
    if (connection?.status) telegramService.status = connection.status;
    if (connection?.lastError !== undefined) telegramService.lastError = connection.lastError;
    res.json({
      success: true,
      data: {
        ...telegramService.getStatus(),
        botUsername: connection?.config?.botUsername || telegramService.botUsername || null,
        botLink: telegramService.botLink,
        hasToken: !!(connection?.config?.botToken || telegramService.botToken),
        updatedAt: connection?.updatedAt || null
      }
    });
  } catch (error) {
    console.error('Error getting Telegram status:', error);
    res.status(500).json({ success: false, error: 'Failed to get Telegram status' });
  }
});

router.post('/connect', auth, async (req, res) => {
  try {
    const organization = getOrganization(req);
    const incomingToken = req.body.botToken?.trim();
    const incomingUsername = req.body.botUsername?.trim().replace(/^@/, '');

    const existingConnection = await ChannelConnection.findOne({ organization, type: 'telegram' });
    const savedToken = existingConnection?.config?.botToken?.trim();
    const savedUsername = existingConnection?.config?.botUsername?.trim();

    console.log('TELEGRAM CONNECT DEBUG', { organization: String(organization), hasExisting: !!existingConnection, incomingToken: !!incomingToken, incomingUsername: !!incomingUsername, savedToken: !!savedToken, savedUsername: !!savedUsername });

    const botToken = incomingToken || savedToken;
    const botUsername = incomingUsername || savedUsername;

    if (!botToken || !botUsername) {
      return res.status(400).json({
        success: false,
        error: 'Bot token and username are required'
      });
    }

    const normalizedUsername = botUsername.replace(/^@/, '');

    const connection = await ChannelConnection.findOneAndUpdate(
      { organization, type: 'telegram' },
      {
        organization,
        type: 'telegram',
        status: 'connected',
        displayName: `@${normalizedUsername}`,
        config: { botToken, botUsername: normalizedUsername },
        connectedBy: req.user._id,
        connectedAt: new Date(),
        lastError: null
      },
      { upsert: true, new: true }
    );

    telegramService.botToken = botToken;
    telegramService.botUsername = normalizedUsername;
    telegramService.botLink = `https://t.me/${normalizedUsername}`;
    const result = await telegramService.initialize({ botToken, botUsername: normalizedUsername });
    res.json({ success: true, data: { ...result, connection } });
  } catch (error) {
    console.error('Error connecting Telegram:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to connect Telegram' });
  }
});

router.post('/disconnect', auth, async (req, res) => {
  try {
    const organization = getOrganization(req);
    await ChannelConnection.findOneAndUpdate(
      { organization, type: 'telegram' },
      { status: 'disconnected', lastError: null },
      { new: true }
    );
    telegramService.botToken = '';
    telegramService.botUsername = '';
    telegramService.botLink = null;
    telegramService.lastError = null;
    const result = await telegramService.disconnect();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error disconnecting Telegram:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to disconnect Telegram' });
  }
});

module.exports = router;
