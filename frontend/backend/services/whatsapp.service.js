const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AutoReply = require('../models/AutoReply');
const Template = require('../models/Template');
const ChannelConnection = require('../models/ChannelConnection');

class WhatsAppService {
  constructor() {
    this.clients = new Map(); // tenantKey -> Client
    this.initializing = new Set();
    this.reconnectTimers = new Map();
  }

  // Initialize WhatsApp client for a user
  async initializeClient(userId) {
    const tenantKey = userId.toString();
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
      console.log(`📱 QR Code for tenant ${tenantKey}:`);
      qrcode.generate(qr, { small: true });
      
      // Store QR for frontend to fetch
      this.currentQR = qr;
      this.qrTimestamp = new Date();
    });

    // Ready event
    client.on('ready', async () => {
      console.log(`✅ WhatsApp client ready for tenant ${tenantKey}`);
      await this.updateChannelStatus(tenantKey, 'connected');
      this.currentQR = null;
      this.initializing.delete(tenantKey);
      this.reconnectTimers.delete(tenantKey);
    });

    // Message received event
    client.on('message', async (message) => {
      await this.handleIncomingMessage(userId, message);
      await this.processAutomations(userId, message);
    });

    // Message sent event
    client.on('message_create', async (message) => {
      if (message.fromMe) {
        await this.handleSentMessage(userId, message);
      }
    });

    // Disconnected event
    client.on('disconnected', (reason) => {
      console.log(`❌ WhatsApp disconnected for tenant ${tenantKey}: ${reason}`);
      this.updateChannelStatus(tenantKey, 'disconnected');
      this.clients.delete(tenantKey);
      this.scheduleReconnect(tenantKey, reason);
    });

    // Auth failure
    client.on('auth_failure', (error) => {
      console.error(`🔐 Auth failure for tenant ${tenantKey}:`, error);
      this.updateChannelStatus(tenantKey, 'error');
      this.clients.delete(tenantKey);
      this.initializing.delete(tenantKey);
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

  scheduleReconnect(userId, reason) {
    const tenantKey = userId.toString();
    if (this.reconnectTimers.has(tenantKey)) return;

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
    } catch (err) {
      console.error('Error syncing WhatsApp state:', err.message || err);
    }
  }

  async processAutomations(userId, message) {
    try {
      const text = (message.body || '').trim();
      if (!text) return;
      const user = await User.findById(userId).select('organization');
      const scopeId = user?.organization || userId;
      const autoReply = await AutoReply.findOne({
        $or: [{ user: userId }, { organization: scopeId }],
        channel: 'whatsapp',
        isActive: true
      }).sort({ priority: -1 });

      let matchedResponse = null;
      if (autoReply) {
        const lower = text.toLowerCase();
        const kws = Array.isArray(autoReply.keywords) ? autoReply.keywords : [];
        const matched = autoReply.matchType === 'exact'
          ? kws.some(k => lower === String(k).toLowerCase())
          : kws.some(k => lower.includes(String(k).toLowerCase()));
        if (matched) {
          matchedResponse = autoReply.response;
          if (typeof autoReply.incrementUsage === 'function') await autoReply.incrementUsage();
        }
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
        const client = this.clients.get(userId.toString());
        if (client) await client.sendMessage(message.from, matchedResponse);
      }
    } catch (error) {
      console.error('Error processing automations:', error.message || error);
    }
  }

  // Send message
  async sendMessage(userId, to, content, options = {}) {
    const client = this.clients.get(userId);
    
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    // Format phone number (add @c.us suffix)
    const chatId = to.includes('@c.us') ? to : `${to.replace(/[^0-9]/g, '')}@c.us`;

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
    const client = this.clients.get(userId);
    
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
    const client = this.clients.get(userId);
    
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
    const client = this.clients.get(userId);
    
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
    const client = this.clients.get(userId);
    
    if (!client) {
      return {
        status: 'not_initialized',
        message: 'Client not initialized'
      };
    }

    return {
      status: 'connected',
      message: 'Client is ready',
      info: {
        pushname: client.info?.pushname,
        me: client.info?.wid?.user,
        platform: client.info?.platform
      }
    };
  }

  // Disconnect client
  async disconnect(userId) {
    const client = this.clients.get(userId);
    
    if (client) {
      await client.destroy();
      this.clients.delete(userId);
      await this.updateChannelStatus(userId, 'disconnected');
    }

    return {
      status: 'disconnected',
      message: 'Client disconnected successfully'
    };
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