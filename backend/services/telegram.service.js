const EventEmitter = require('events');

class TelegramService extends EventEmitter {
  constructor() {
    super();
    this.status = 'not_initialized';
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.botUsername = process.env.TELEGRAM_BOT_USERNAME || '';
    this.botLink = this.botUsername ? `https://t.me/${this.botUsername.replace(/^@/, '')}` : null;
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.lastError = null;
  }

  getStatus() {
    return {
      status: this.status,
      botUsername: this.botUsername || null,
      botLink: this.botLink,
      chatIdConfigured: !!this.chatId,
      connected: this.status === 'connected',
      hasToken: !!this.botToken,
      lastError: this.lastError
    };
  }

  async initialize({ botToken, botUsername } = {}) {
    if (botToken) this.botToken = botToken;
    if (botUsername) this.botUsername = botUsername.replace(/^@/, '');

    if (!this.botToken || !this.botUsername) {
      this.status = 'needs_config';
      this.lastError = 'Bot token and username are required';
      return this.getStatus();
    }

    this.botLink = `https://t.me/${this.botUsername.replace(/^@/, '')}`;
    this.status = 'connected';
    this.lastError = null;
    return this.getStatus();
  }

  async disconnect() {
    this.status = 'disconnected';
    return this.getStatus();
  }

  async sendMessage(message) {
    if (this.status !== 'connected') {
      throw new Error('Telegram bot is not connected');
    }
    return {
      success: true,
      messageId: Date.now().toString(),
      message
    };
  }
}

module.exports = new TelegramService();
