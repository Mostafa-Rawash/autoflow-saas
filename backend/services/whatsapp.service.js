const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AutoReply = require('../models/AutoReply');
const Template = require('../models/Template');
const ChannelConnection = require('../models/ChannelConnection');
const SOCKET_EVENTS = require('../constants/socketEvents');

class WhatsAppService {
  constructor() {
    this.clients = new Map(); // tenantKey -> Client
    this.initializing = new Set();
    this.reconnectTimers = new Map();
  }

  // Initialize WhatsApp client for a user
  async initializeClient(userId, options = {}) {
    const tenantKey = userId.toString();
    const { resetSession = false } = options;

    if (resetSession) {
      console.log('[whatsapp] resetSession requested before initialize', { tenantKey });
      await this.forceResetTenant(tenantKey);
    }

    // Check if client already exists or is being initialized
    if (this.clients.has(tenantKey)) {
      return {
        status: 'already_exists',
        message: 'Client already initialized'
      };
    }

    if (this.initializing.has(tenantKey)) {
      return {
        status: 'initializing',
        message: 'Client initialization already in progress'
      };
    }

    this.initializing.add(tenantKey);

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: tenantKey,
        dataPath: './sessions'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // QR Code event
    client.on('qr', (qr) => {
      console.log('[whatsapp] qr event', {
        tenantKey,
        hasCurrentClient: this.clients.get(tenantKey) === client,
        initializing: this.initializing.has(tenantKey),
        hasExistingQR: !!this.currentQR
      });
      if (this.clients.get(tenantKey) !== client) return;
      console.log(`📱 QR Code for tenant ${tenantKey}:`, {
        tenantKey,
        hasClient: this.clients.get(tenantKey) === client,
        initializing: this.initializing.has(tenantKey)
      });
      qrcode.generate(qr, { small: true });
      
      this.currentQR = qr;
      this.qrTimestamp = new Date();
      this.emitChannelEvent(userId, SOCKET_EVENTS.WHATSAPP_QR, {
        status: 'connecting',
        qr,
        qrTimestamp: this.qrTimestamp
      });
    });

    // Ready event
    client.on('ready', async () => {
      if (this.clients.get(tenantKey) !== client) return;
      console.log(`✅ WhatsApp client ready for tenant ${tenantKey}`, {
        tenantKey,
        initialized: !this.initializing.has(tenantKey),
        clientCount: this.clients.size
      });
      await this.syncConnectedState(userId, 'connected');
      this.currentQR = null;
      this.qrTimestamp = null;
      this.initializing.delete(tenantKey);
      this.reconnectTimers.delete(tenantKey);
      this.emitChannelEvent(userId, SOCKET_EVENTS.WHATSAPP_CONNECTED, {
        status: 'connected',
        info: {
          pushname: client.info?.pushname,
          me: client.info?.wid?.user,
          platform: client.info?.platform
        }
      });
    });

    // Message received event
    client.on('message', async (message) => {
      await this.handleIncomingMessage(userId, message);
      if (message.fromMe) {
        console.log('[auto-replies] skipped self message', {
          userId: userId?.toString?.() || String(userId),
          messageId: message.id?._serialized || null
        });
        return;
      }
      const connection = await ChannelConnection.findOne({
        organization: (await User.findById(userId).select('organization'))?.organization || userId,
        type: 'whatsapp'
      }).catch(() => null);
      const isConnected = connection?.status === 'connected';
      if (!isConnected) {
        console.log('[auto-replies] skipped because channel is not fully connected', {
          userId: userId?.toString?.() || String(userId),
          messageFrom: message.from,
          channelStatus: connection?.status || null
        });
        return;
      }
      await this.processAutomations(userId, message);
    });

    // Message sent event
    client.on('message_create', async (message) => {
      if (message.fromMe) {
        await this.handleSentMessage(userId, message);
      }
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      if (this.clients.get(tenantKey) !== client) return;
      console.log(`❌ WhatsApp disconnected for tenant ${tenantKey}: ${reason}`, {
        tenantKey,
        stillRegistered: this.clients.get(tenantKey) === client,
        initializing: this.initializing.has(tenantKey)
      });
      await this.syncConnectedState(userId, 'disconnected', reason);
      this.clients.delete(tenantKey);
      this.currentQR = null;
      this.qrTimestamp = null;
      this.initializing.delete(tenantKey);
      this.emitChannelEvent(userId, SOCKET_EVENTS.WHATSAPP_DISCONNECTED, {
        status: 'disconnected',
        reason
      });
      this.scheduleReconnect(tenantKey, reason);
    });

    // Auth failure
    client.on('auth_failure', async (error) => {
      console.error(`🔐 Auth failure for tenant ${tenantKey}:`, {
        tenantKey,
        message: error?.message || String(error),
        stack: error?.stack
      });
      await this.syncConnectedState(userId, 'error', error?.message || String(error));
      this.clients.delete(tenantKey);
      this.currentQR = null;
      this.qrTimestamp = null;
      this.initializing.delete(tenantKey);
      this.emitChannelEvent(userId, SOCKET_EVENTS.WHATSAPP_ERROR, {
        status: 'error',
        error: error?.message || String(error)
      });
    });

    // Initialize
    this.clients.set(tenantKey, client);

    try {
      await client.initialize();
    } catch (error) {
      this.clients.delete(tenantKey);
      this.initializing.delete(tenantKey);
      throw error;
    }

    this.initializing.delete(tenantKey);

    return {
      status: 'initializing',
      message: 'QR code will be generated shortly'
    };
  }

  async forceResetTenant(tenantKey) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const baseDir = path.resolve('./sessions');
      const existing = this.clients.get(tenantKey);
      if (existing) {
        try { await existing.destroy(); } catch (_) {}
        this.clients.delete(tenantKey);
      }
      this.initializing.delete(tenantKey);
      this.currentQR = null;
      this.qrTimestamp = null;

      const targets = [
        path.join(baseDir, `session-${tenantKey}`),
        path.join(baseDir, tenantKey),
        path.join(baseDir, `session-${tenantKey}.json`)
      ];
      for (const target of targets) {
        await fs.rm(target, { recursive: true, force: true }).catch(() => {});
      }
      await fs.readdir(baseDir).then(async (entries) => {
        for (const entry of entries) {
          if (entry.includes(tenantKey)) {
            await fs.rm(path.join(baseDir, entry), { recursive: true, force: true }).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch (error) {
      console.error('Error force resetting WhatsApp tenant:', error.message || error);
    }
  }

  scheduleReconnect(userId, reason) {
    const tenantKey = userId.toString();
    if (this.reconnectTimers.has(tenantKey)) return;

    if (String(reason || '').toLowerCase().includes('logout') || String(reason || '').toLowerCase().includes('auth')) {
      console.log(`⏭️ Skipping auto-reconnect for tenant ${tenantKey} after auth/logout reason: ${reason}`);
      return;
    }

    const timer = setTimeout(async () => {
      this.reconnectTimers.delete(tenantKey);
      try {
        console.log(`🔄 Attempting WhatsApp reconnect for tenant ${tenantKey} after: ${reason}`);
        await this.initializeClient(tenantKey);
      } catch (error) {
        console.error(`❌ Reconnect failed for user ${userId}:`, error.message || error);
      }
    }, 15000);

    this.reconnectTimers.set(tenantKey, timer);
  }

  // Get QR Code
  getQRCode() {
    if (this.currentQR) {
      return {
        qr: this.currentQR,
        timestamp: this.qrTimestamp
      };
    }
    return null;
  }

  async syncConnectedState(userId, status, lastError = null) {
    try {
      const user = await User.findById(userId);
      const orgId = user?.organization || userId;
      await ChannelConnection.findOneAndUpdate(
        { organization: orgId, type: 'whatsapp' },
        {
          organization: orgId,
          type: 'whatsapp',
          status,
          connectedAt: status === 'connected' ? new Date() : undefined,
          lastError,
          lastSyncAt: new Date()
        },
        { upsert: true, new: true }
      );
      return orgId;
    } catch (err) {
      console.error('Error syncing WhatsApp state:', err.message || err);
      return null;
    }
  }

  emitChannelEvent(userId, eventName, payload = {}) {
    try {
      if (!global.io) return;
      const socketPayload = { userId: userId?.toString?.() || String(userId), channel: 'whatsapp', ...payload };
      global.io.emit(eventName, socketPayload);
      global.io.emit('channel-status-changed', socketPayload);
    } catch (err) {
      console.error('Error emitting channel event:', err.message || err);
    }
  }

  async processAutomations(userId, message) {
    try {
      const text = (message.body || '').trim();
      if (!text) return;
      const user = await User.findById(userId).select('organization');
      const scopeId = user?.organization || userId;
      const autoReply = await AutoReply.findMatching(userId, text, scopeId);
      console.log('[auto-replies]', {
        userId: userId?.toString?.() || String(userId),
        scopeId: scopeId?.toString?.() || String(scopeId),
        text,
        matchedRule: autoReply ? { id: autoReply._id?.toString?.(), name: autoReply.name, matchType: autoReply.matchType } : null
      });

      let matchedResponse = null;
      if (autoReply) {
        matchedResponse = autoReply.response;
        if (typeof autoReply.incrementUsage === 'function') await autoReply.incrementUsage();
      }

      if (!matchedResponse) {
        const templates = await Template.find({
          $or: [{ user: userId }, { organization: scopeId }],
          channel: 'whatsapp',
          isActive: true
        }).sort({ usageCount: -1 }).limit(5);

        for (const template of templates) {
          const triggers = Array.isArray(template.triggers) ? template.triggers : [];
          const lower = text.toLowerCase();
          if (triggers.some(trigger => lower.includes(String(trigger).toLowerCase()))) {
            matchedResponse = template.content;
            await Template.findByIdAndUpdate(template._id, { $inc: { usageCount: 1 } }).catch(() => {});
            break;
          }
        }
      }

      if (matchedResponse) {
        const client = this.clients.get(userId.toString()) || this.clients.get(userId);
        if (client) {
          console.log('[auto-replies] sending reply', {
            userId: userId?.toString?.() || String(userId),
            to: message.from,
            content: matchedResponse,
            clientRegistered: this.clients.get(userId.toString()) === client || this.clients.get(userId) === client,
            channelStatus: (await ChannelConnection.findOne({ organization: scopeId, type: 'whatsapp' }).catch(() => null))?.status || null
          });
          try {
            await client.sendMessage(message.from, matchedResponse);
            console.log('[auto-replies] sendMessage succeeded', {
              userId: userId?.toString?.() || String(userId),
              to: message.from
            });
            try {
              await this.saveBotReply(userId, message, matchedResponse, scopeId);
              console.log('[auto-replies] bot reply saved', {
                userId: userId?.toString?.() || String(userId),
                to: message.from
              });
            } catch (saveError) {
              console.error('[auto-replies] saveBotReply failed', {
                userId: userId?.toString?.() || String(userId),
                to: message.from,
                error: saveError?.message || String(saveError),
                stack: saveError?.stack
              });
            }
          } catch (sendError) {
            console.error('[auto-replies] sendMessage failed', {
              userId: userId?.toString?.() || String(userId),
              to: message.from,
              error: sendError?.message || String(sendError),
              stack: sendError?.stack
            });
          }
        } else {
          console.log('[auto-replies] matched but no client available', {
            userId: userId?.toString?.() || String(userId),
            to: message.from
          });
        }
      }
    } catch (error) {
      console.error('Error processing automations:', error.message || error);
    }
  }

  async saveBotReply(userId, incomingMessage, content, organizationId) {
    try {
      const conversation = await Conversation.findOne({
        organization: organizationId,
        channel: 'whatsapp',
        'contact.externalId': incomingMessage.from
      });

      if (!conversation) return;

      const botMessage = new Message({
        conversation: conversation._id,
        organization: organizationId,
        sender: 'bot',
        content,
        type: 'text',
        externalId: `bot_${incomingMessage.id?._serialized || Date.now()}`,
        metadata: {
          quotedMessage: null,
          edited: false,
          deleted: false
        },
        status: 'sent'
      });

      await botMessage.save();

      conversation.lastMessage = {
        content,
        timestamp: new Date(),
        sender: 'bot'
      };
      await conversation.save();

      if (global.io) {
        global.io.to(userId.toString()).emit('new-message', {
          conversationId: conversation._id,
          message: botMessage
        });
      }
    } catch (error) {
      console.error('Error saving bot reply:', error.message || error);
    }
  }

  // Send message
  async sendMessage(userId, to, content, options = {}) {
    const client = this.clients.get(userId.toString()) || this.clients.get(userId);
    
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    // Format phone number (add @c.us suffix)
    const normalizedTo = String(to || '').trim();
    const digitsOnly = normalizedTo.replace(/[^0-9]/g, '');
    const chatId = normalizedTo.includes('@c.us') ? normalizedTo : (digitsOnly ? `${digitsOnly}@c.us` : '');

    if (!chatId) {
      throw new Error(`Invalid WhatsApp target: "${to}"`);
    }

    try {
      let message;

      if (options.media) {
        // Send media
        const media = await MessageMedia.fromUrl(options.media.url);
        message = await client.sendMessage(chatId, media, {
          caption: content,
          ...options
        });
      } else if (options.buttons && options.buttons.length > 0) {
        // Send message with buttons
        message = await client.sendMessage(chatId, content, {
          buttons: options.buttons.map((btn, i) => ({
            buttonId: btn.id || `btn_${i}`,
            buttonText: { displayText: btn.text },
            type: 1
          })),
          headerType: 1
        });
      } else {
        // Send simple text
        message = await client.sendMessage(chatId, content);
      }

      return {
        success: true,
        messageId: message.id._serialized,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get chats list
  async getChats(userId) {
    const client = this.clients.get(userId.toString()) || this.clients.get(userId);
    
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    const chats = await client.getChats();
    
    return chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name || chat.id.user,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp,
      lastMessage: chat.lastMessage ? {
        content: chat.lastMessage.body,
        timestamp: chat.lastMessage.timestamp,
        fromMe: chat.lastMessage.fromMe
      } : null
    }));
  }

  // Get chat messages
  async getChatMessages(userId, chatId, limit = 50) {
    const client = this.clients.get(userId.toString()) || this.clients.get(userId);
    
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });

    return messages.map(msg => ({
      id: msg.id._serialized,
      content: msg.body,
      type: msg.type,
      fromMe: msg.fromMe,
      timestamp: msg.timestamp,
      author: msg.author,
      hasMedia: msg.hasMedia
    }));
  }

  // Get contacts
  async getContacts(userId) {
    const client = this.clients.get(userId.toString()) || this.clients.get(userId);
    
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    const contacts = await client.getContacts();
    
    return contacts
      .filter(c => !c.isGroup && c.number)
      .map(contact => ({
        id: contact.id._serialized,
        name: contact.name || contact.pushname || contact.number,
        number: contact.number,
        isMe: contact.isMe,
        isWAContact: contact.isWAContact
      }));
  }

  // Get client status
  getStatus(userId) {
    const tenantKey = userId?.toString?.() || String(userId);
    const client = this.clients.get(tenantKey) || this.clients.get(userId);

    if (!client) {
      return {
        status: 'not_initialized',
        message: 'Client not initialized',
        info: null,
        connected: false
      };
    }

    return {
      status: 'connected',
      message: 'Client is ready',
      connected: true,
      info: {
        pushname: client.info?.pushname,
        me: client.info?.wid?.user,
        platform: client.info?.platform
      }
    };
  }

  // Disconnect client
  async disconnect(userId, { clearSession = true } = {}) {
    const tenantKey = userId.toString();
    const client = this.clients.get(tenantKey);
    
    if (client) {
      await client.destroy();
      this.clients.delete(tenantKey);
    }

    this.initializing.delete(tenantKey);
    this.currentQR = null;
    this.qrTimestamp = null;

    if (clearSession) {
      await this.clearSessionData(tenantKey);
    }

    await this.updateChannelStatus(userId, 'disconnected');
    this.emitChannelEvent(userId, SOCKET_EVENTS.WHATSAPP_DISCONNECTED, {
      status: 'disconnected',
      clearedSession: clearSession
    });

    return {
      status: 'disconnected',
      message: 'Client disconnected successfully'
    };
  }

  async clearSessionData(tenantKey) {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const baseDir = path.resolve(process.cwd(), 'sessions');
      const targets = [
        path.join(baseDir, `session-${tenantKey}`),
        path.join(baseDir, tenantKey)
      ];

      for (const target of targets) {
        await fs.rm(target, { recursive: true, force: true }).catch(() => {});
      }

      await fs.readdir(baseDir).then(async (entries) => {
        for (const entry of entries) {
          if (entry.includes(tenantKey)) {
            await fs.rm(path.join(baseDir, entry), { recursive: true, force: true }).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch (error) {
      console.error('Error clearing WhatsApp session data:', error.message || error);
    }
  }

  // Handle incoming message
  async handleIncomingMessage(userId, message) {
    try {
      const user = await User.findById(userId).select('organization');
      const organizationId = user?.organization || userId;

      // Get or create conversation
      let conversation = await Conversation.findOne({
        organization: organizationId,
        channel: 'whatsapp',
        'contact.externalId': message.from
      });

      if (!conversation) {
        // Get contact info
        const contact = await message.getContact();
        
        conversation = new Conversation({
          user: userId,
          organization: organizationId,
          channel: 'whatsapp',
          contact: {
            name: contact.name || contact.pushname || message.from,
            phone: message.from.replace('@c.us', ''),
            externalId: message.from
          },
          status: 'active'
        });
        await conversation.save();
      }

      // Save message
      const newMessage = new Message({
        conversation: conversation._id,
        sender: 'contact',
        content: message.body,
        type: this.mapMessageType(message.type),
        externalId: message.id._serialized,
        metadata: {
          hasMedia: message.hasMedia,
          mediaType: message.type
        }
      });
      await newMessage.save();

      // Update conversation
      conversation.lastMessage = {
        content: message.body,
        timestamp: new Date(),
        sender: 'contact'
      };
      conversation.unreadCount += 1;
      await conversation.save();

      // Emit via socket.io (if available)
      if (global.io) {
        global.io.to(userId.toString()).emit('new-message', {
          conversationId: conversation._id,
          message: newMessage
        });
      }

    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  // Handle sent message
  async handleSentMessage(userId, message) {
    try {
      // Find conversation
      const user = await User.findById(userId).select('organization');
      const organizationId = user?.organization || userId;
      const conversation = await Conversation.findOne({
        organization: organizationId,
        channel: 'whatsapp',
        'contact.externalId': message.to
      });

      if (conversation) {
        // Save message
        const newMessage = new Message({
          conversation: conversation._id,
          sender: 'agent',
          senderId: userId,
          content: message.body,
          type: this.mapMessageType(message.type),
          externalId: message.id._serialized
        });
        await newMessage.save();

        // Update conversation
        conversation.lastMessage = {
          content: message.body,
          timestamp: new Date(),
          sender: 'agent'
        };
        await conversation.save();
      }
    } catch (error) {
      console.error('Error handling sent message:', error);
    }
  }

  // Map WhatsApp message type to our type
  mapMessageType(type) {
    const typeMap = {
      'chat': 'text',
      'image': 'image',
      'video': 'video',
      'audio': 'audio',
      'document': 'document',
      'sticker': 'image',
      'location': 'location',
      'vcard': 'contact'
    };
    return typeMap[type] || 'text';
  }

  // Update channel status in user's channels
  async updateChannelStatus(userId, status) {
    try {
      const user = await User.findById(userId).select('organization');
      const orgId = user?.organization || userId;
      await ChannelConnection.findOneAndUpdate(
        { organization: orgId, type: 'whatsapp' },
        {
          organization: orgId,
          type: 'whatsapp',
          status,
          connectedAt: status === 'connected' ? new Date() : undefined,
          lastSyncAt: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error updating channel status:', error);
    }
  }
}

// Export singleton instance
module.exports = new WhatsAppService();