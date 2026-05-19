const express = require('express');
const router = express.Router();
const whatsappBusiness = require('../services/whatsappBusiness.service');
const Integration = require('../models/Integration');

/**
 * WhatsApp Business API webhook verification (GET)
 * Meta calls this to verify the webhook subscription
 */
router.get('/whatsapp-business', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const result = whatsappBusiness.verifyWebhook(mode, token, challenge);
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(403).send('Forbidden');
  }
});

/**
 * WhatsApp Business API webhook receiver (POST)
 * Meta calls this with incoming messages and status updates
 */
router.post('/whatsapp-business', async (req, res) => {
  // Always respond quickly to Meta — processing happens asynchronously
  res.status(200).send('OK');

  try {
    const body = req.body;

    // Validate webhook payload
    if (!body.object || body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    if (!entry) return;

    // Extract user ID from the WABA ID
    // We need to find which user owns this WABA ID
    const wabaId = entry.id;

    // Look up the integration by wabaId
    const integration = await Integration.findOne({
      type: 'whatsapp',
      status: 'connected',
      'config.wabaId': wabaId
    });

    if (!integration) {
      // Try matching by phone number ID from the payload
      const phoneNumberId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
      if (phoneNumberId) {
        const altIntegration = await Integration.findOne({
          type: 'whatsapp',
          status: 'connected',
          'config.phoneNumberId': phoneNumberId
        });
        if (altIntegration) {
          await whatsappBusiness.handleWebhook(altIntegration.user, body);
        }
      }
      return;
    }

    await whatsappBusiness.handleWebhook(integration.user, body);
  } catch (error) {
    console.error('[Webhook] WhatsApp Business webhook error:', error.message);
  }
});

// Legacy WhatsApp webhook (placeholder)
router.post('/whatsapp', async (req, res) => {
  res.status(200).send('OK');
});

// Webhook verification for legacy WhatsApp
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'autoflow_verify_token')) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Messenger webhook verification
router.get('/messenger', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.MESSENGER_VERIFY_TOKEN || 'autoflow_verify_token')) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Messenger webhook receiver
router.post('/messenger', async (req, res) => {
  res.status(200).send('OK');

  try {
    const body = req.body;
    if (body.object !== 'page') return;

    const entry = body.entry?.[0];
    if (!entry) return;

    const messaging = entry.messaging?.[0];
    if (!messaging || !messaging.message) return;

    const recipientId = messaging.recipient?.id;
    if (!recipientId) return;

    // Find user by Messenger page ID (recipient is our page)
    const Integration = require('../models/Integration');
    const integration = await Integration.findOne({
      type: 'messenger',
      status: 'connected',
      'config.pageId': recipientId
    });

    if (!integration) {
      console.log('[Webhook] No Messenger integration found for page:', recipientId);
      return;
    }

    const messengerService = require('../services/messenger.service');
    await messengerService.handleWebhook(integration.user, body);
  } catch (error) {
    console.error('[Webhook] Messenger webhook error:', error.message);
  }
});

// Instagram webhook verification
router.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.INSTAGRAM_VERIFY_TOKEN || 'autoflow_verify_token')) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Instagram webhook receiver
router.post('/instagram', async (req, res) => {
  res.status(200).send('OK');

  try {
    const body = req.body;
    if (body.object !== 'instagram') return;

    const entry = body.entry?.[0];
    if (!entry) return;

    const messaging = entry.messaging?.[0];
    if (!messaging) return;

    const recipientId = messaging.recipient?.id;
    if (!recipientId) return;

    // Find user by Instagram page ID (recipient is our page)
    const Integration = require('../models/Integration');
    const integration = await Integration.findOne({
      type: 'instagram',
      status: 'connected',
      'config.pageId': recipientId
    });

    if (!integration) {
      console.log('[Webhook] No Instagram integration found for page:', recipientId);
      return;
    }

    const instagramService = require('../services/instagram.service');
    await instagramService.handleWebhook(integration.user, body);
  } catch (error) {
    console.error('[Webhook] Instagram webhook error:', error.message);
  }
});

// Telegram webhook receiver
router.post('/telegram', async (req, res) => {
  res.status(200).send('OK');
  // Telegram webhooks are handled via polling in the telegram.service.js
});

module.exports = router;