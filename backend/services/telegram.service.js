const https = require('https');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Integration = require('../models/Integration');
const autoReplyService = require('./autoReply.service');

class TelegramService {
  constructor() {
    this.bots = new Map();
    this.maxBots = parseInt(process.env.MAX_TELEGRAM_BOTS) || 20;
    this.pollIntervals = new Map(); // userId -> intervalId
    this.lastUpdateIds = new Map(); // userId -> lastUpdateId
    this.pollingEnabled = true;
    this.pollIntervalMs = parseInt(process.env.TELEGRAM_POLL_INTERVAL) || 3000;
  }

  async verifyBotToken(botToken) {
    try {
      const data = await this._apiCall(botToken, 'getMe');
      if (data.ok && data.result) {
        return { valid: true, botId: data.result.id, botUsername: data.result.username, botName: data.result.first_name };
      }
      return { valid: false, error: data.description || 'Invalid bot token' };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  _apiCall(botToken, method, params = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(params);
      const hasBody = Object.keys(params).length > 0;
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${botToken}/${method}`,
        method: hasBody ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      if (hasBody) options.headers['Content-Length'] = Buffer.byteLength(postData);
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('Parse error')); } });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('Telegram API timeout')); });
      if (hasBody) req.write(postData);
      req.end();
    });
  }

  async connectBot(userId, botToken, botUsername) {
    if (this.bots.size >= this.maxBots && !this.bots.has(userId.toString())) {
      return { status: 'limit_reached', message: `Maximum Telegram bots reached (${this.maxBots})` };
    }
    const verification = await this.verifyBotToken(botToken);
    if (!verification.valid) {
      return { status: 'error', message: verification.error || 'Invalid bot token' };
    }
    const verifiedUsername = verification.botUsername || botUsername;
    await this.disconnectBot(userId);

    const botInfo = { botToken, botUsername: verifiedUsername, botName: verification.botName, connectedAt: new Date() };
    this.bots.set(userId.toString(), botInfo);

    // Try webhook first; if it fails (e.g. localhost), fall back to polling
    const webhookUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/telegram/webhook/${userId}`;
    let usePolling = true;
    try {
      const webhookResult = await this._apiCall(botToken, 'setWebhook', { url: webhookUrl, allowed_updates: ['message'] });
      if (webhookResult.ok) {
        // Webhook set successfully — check if the URL is actually reachable
        // localhost URLs won't work with Telegram, so we still poll
        if (!webhookUrl.includes('localhost') && webhookUrl.startsWith('https://')) {
          usePolling = false;
          console.log(`✅ Telegram webhook set for user ${userId}: ${webhookUrl}`);
        }
      }
    } catch (e) { /* webhook may fail in dev */ }

    if (usePolling) {
      // Delete webhook so getUpdates works
      try { await this._apiCall(botToken, 'deleteWebhook'); } catch (e) { /* ignore */ }
      this.startPolling(userId.toString());
      console.log(`📡 Telegram polling started for user ${userId}`);
    }

    await this._updateChannel(userId, 'connected', { botToken, botUsername: verifiedUsername, botName: verification.botName });
    await Integration.findOneAndUpdate(
      { user: userId, type: 'telegram' },
      { user: userId, type: 'telegram', name: `Telegram Bot (@${verifiedUsername})`, status: 'connected', config: { botToken, botUsername: verifiedUsername, botName: verification.botName }, connectedAt: new Date() },
      { upsert: true, new: true }
    );

    if (global.io) {
      global.io.to(`user-${userId}`).emit('telegram-connected', { userId, botUsername: verifiedUsername, botName: verification.botName, timestamp: new Date() });
    }
    return {
      status: 'connected', message: 'Telegram bot connected successfully',
      data: { status: 'connected', connection: { type: 'telegram', status: 'connected', config: { botUsername: verifiedUsername, botName: verification.botName, botToken } } }
    };
  }

  startPolling(userIdStr) {
    // Stop existing polling if any
    this.stopPolling(userIdStr);

    const poll = async () => {
      const botInfo = this.bots.get(userIdStr);
      if (!botInfo) return;

      try {
        const offset = (this.lastUpdateIds.get(userIdStr) || 0) + 1;
        const result = await this._apiCall(botInfo.botToken, 'getUpdates', {
          offset,
          limit: 10,
          timeout: 5 // long polling
        });

        if (result.ok && result.result && result.result.length > 0) {
          let lastUpdateId = 0;
          for (const update of result.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);
            if (update.message) {
              await this.handleWebhook(userIdStr, update);
            }
          }
          this.lastUpdateIds.set(userIdStr, lastUpdateId);
        }
      } catch (err) {
        console.error(`Telegram polling error for user ${userIdStr}:`, err.message);
      }
    };

    // Poll every interval
    const intervalId = setInterval(poll, this.pollIntervalMs);
    this.pollIntervals.set(userIdStr, intervalId);
    // Run first poll immediately
    poll();
  }

  stopPolling(userIdStr) {
    const intervalId = this.pollIntervals.get(userIdStr);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollIntervals.delete(userIdStr);
    }
    this.lastUpdateIds.delete(userIdStr);
  }

  async disconnectBot(userId) {
    const userIdStr = userId.toString();
    this.stopPolling(userIdStr);

    const botInfo = this.bots.get(userIdStr);
    if (botInfo) {
      try { await this._apiCall(botInfo.botToken, 'deleteWebhook'); } catch (e) { /* ignore */ }
      this.bots.delete(userIdStr);
    }
    await this._updateChannel(userId, 'disconnected', {});
    await Integration.findOneAndUpdate({ user: userId, type: 'telegram' }, { status: 'disconnected', config: {} });
    if (global.io) global.io.to(`user-${userId}`).emit('telegram-disconnected', { userId, timestamp: new Date() });
    return { status: 'disconnected', message: 'Telegram bot disconnected' };
  }

  async handleWebhook(userId, update) {
    try {
      const msg = update.message;
      if (!msg) return null;
      const chatId = msg.chat.id.toString();
      const text = msg.text || '';
      const from = msg.from || {};

      let conversation = await Conversation.findOne({ user: userId, channel: 'telegram', 'contact.externalId': chatId });
      if (!conversation) {
        conversation = new Conversation({
          user: userId, channel: 'telegram',
          contact: { name: from.first_name ? `${from.first_name}${from.last_name ? ' ' + from.last_name : ''}` : from.username || chatId, phone: from.username || '', externalId: chatId },
          status: 'active'
        });
        await conversation.save();
      }

      // Skip duplicate messages
      const msgId = msg.message_id?.toString();
      if (msgId) {
        const existing = await Message.findOne({ externalId: msgId, conversation: conversation._id });
        if (existing) return { conversation, message: existing };
      }

      const newMessage = new Message({
        conversation: conversation._id, sender: 'contact', content: text, type: 'text',
        externalId: msgId, metadata: { from: { id: from.id, username: from.username, firstName: from.first_name, lastName: from.last_name }, chatId, date: msg.date }
      });
      await newMessage.save();

      conversation.lastMessage = { content: text, timestamp: new Date(), sender: 'contact' };
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await conversation.save();

      if (global.io) global.io.to(`user-${userId}`).emit('new-message', { conversationId: conversation._id, message: newMessage });

      // Auto-reply matching
      if (text) {
        const matchedRule = await autoReplyService.findMatch(userId, text);
        if (matchedRule) {
          try {
            const sendResult = await this.sendMessage(userId, chatId, matchedRule.response);
            const replyMessage = new Message({
              conversation: conversation._id, sender: 'bot', content: matchedRule.response, type: 'text',
              metadata: { autoReplyRule: matchedRule._id, autoReplyName: matchedRule.name, chatId, telegramMessageId: sendResult.messageId }
            });
            await replyMessage.save();
            conversation.lastMessage = { content: matchedRule.response, timestamp: new Date(), sender: 'bot' };
            await conversation.save();
            if (global.io) global.io.to(`user-${userId}`).emit('new-message', { conversationId: conversation._id, message: replyMessage });
          } catch (err) {
            console.error('Error sending auto-reply via Telegram:', err.message);
          }
        }
      }

      return { conversation, message: newMessage };
    } catch (error) {
      console.error('Error handling Telegram webhook:', error);
      return null;
    }
  }

  async sendMessage(userId, chatId, text) {
    let token;
    const botInfo = this.bots.get(userId.toString());
    if (botInfo) {
      token = botInfo.botToken;
    } else {
      const integration = await Integration.findOne({ user: userId, type: 'telegram', status: 'connected' });
      if (!integration?.config?.botToken) throw new Error('Telegram bot not connected');
      token = integration.config.botToken;
    }
    const data = await this._apiCall(token, 'sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
    if (!data.ok) throw new Error(data.description || 'Failed to send message');
    return { success: true, messageId: data.result.message_id, timestamp: new Date() };
  }

  async getStatus(userId) {
    const botInfo = this.bots.get(userId.toString());
    if (botInfo) return { status: 'connected', botUsername: botInfo.botUsername, botName: botInfo.botName, connectedAt: botInfo.connectedAt, polling: this.pollIntervals.has(userId.toString()) };
    const integration = await Integration.findOne({ user: userId, type: 'telegram' });
    if (integration?.status === 'connected') {
      return { status: 'connected', botUsername: integration.config?.botUsername, botName: integration.config?.botName, connectedAt: integration.connectedAt };
    }
    return { status: 'not_connected', message: 'Telegram bot not connected' };
  }

  async _updateChannel(userId, status, config = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const idx = user.channels.findIndex(c => c.type === 'telegram');
      if (idx >= 0) {
        user.channels[idx].connected = status === 'connected';
        user.channels[idx].connectedAt = status === 'connected' ? new Date() : null;
        if (config.botToken) user.channels[idx].config = config;
      } else {
        user.channels.push({ type: 'telegram', connected: status === 'connected', connectedAt: status === 'connected' ? new Date() : null, config });
      }
      await user.save();
    } catch (error) { console.error('Error updating Telegram channel status:', error); }
  }

  getActiveBotCount() { return this.bots.size; }
  async healthCheck() { return { status: 'ok', activeBots: this.bots.size, maxBots: this.maxBots, polling: [...this.pollIntervals.keys()] }; }
}

module.exports = new TelegramService();