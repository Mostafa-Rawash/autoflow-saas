const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @route   POST /api/webhooks/whatsapp
// @desc    WhatsApp webhook
// @access  Public
router.post('/whatsapp', async (req, res) => {
  try {
    // TODO: Verify webhook signature
    
    const { entry } = req.body;
    
    for (const e of entry) {
      for (const change of e.changes) {
        if (change.field === 'messages') {
          const { contacts, messages } = change.value;
          
          // Process incoming message
          // TODO: Save to database and notify via socket.io
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// @route   POST /api/webhooks/messenger
// @desc    Messenger webhook
// @access  Public
router.post('/messenger', async (req, res) => {
  try {
    // TODO: Process Messenger webhook
    
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// @route   POST /api/webhooks/instagram
// @desc    Instagram webhook
// @access  Public
router.post('/instagram', async (req, res) => {
  try {
    // TODO: Process Instagram webhook
    
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// @route   POST /api/webhooks/telegram
// @desc    Telegram webhook
// @access  Public
router.post('/telegram', async (req, res) => {
  try {
    // TODO: Process Telegram webhook
    
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// Webhook verification endpoints
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

module.exports = router;