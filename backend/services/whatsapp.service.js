const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

class WhatsAppService {
  constructor() {
    this.clients = new Map(); // userId -> Client
    this.userQRs = new Map(); // userId -> { qr, timestamp }
    this.userStatus = new Map(); // userId -> 'initializing' | 'connected' | 'disconnected' | 'error'
    this.maxClients = parseInt(process.env.MAX_WHATSAPP_CLIENTS) || 10; // Limit concurrent clients
    this.clientLastActive = new Map(); // userId -> timestamp
    
    // Start periodic cleanup (every 30 minutes)
    this.startCleanupInterval();
  }

  // Start periodic cleanup of inactive clients
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupInactiveClients();
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Check if we can accept more clients
  canAcceptNewClient() {
    return this.clients.size < this.maxClients;
  }

  // Initialize WhatsApp client for a user
  async initializeClient(userId) {
    // Check limits
    if (!this.canAcceptNewClient()) {
      return {
        status: 'limit_reached',
        message: `Maximum concurrent WhatsApp connections reached (${this.maxClients}). Please try again later or contact support.`
      };
    }

    // Check if client already exists
    if (this.clients.has(userId)) {
      const status = this.userStatus.get(userId);
      return {
        status: status || 'already_exists',
        message: 'Client already initialized'
      };
    }

    // Set initializing status
    this.userStatus.set(userId, 'initializing');

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: userId.toString(),
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
          '--disable-gpu',
          '--single-process', // Important for multi-tenant
          '--no-zygote'
        ]
      }
    });

    // QR Code event - Store per user and emit via socket
    client.on('qr', (qr) => {
      console.log(`📱 QR Code generated for user ${userId}`);
      
      // Store QR for this specific user
      this.userQRs.set(userId, {
        qr: qr,
        timestamp: new Date()
      });
      
      // Update status
      this.userStatus.set(userId, 'qr_ready');
      
      // Emit to specific user via socket.io
      if (global.io) {
        global.io.to(`user-${userId}`).emit('whatsapp-qr', {
          qr: qr,
          userId: userId,
          timestamp: new Date()
        });
      }
      
      // Also log to console for debugging
      qrcode.generate(qr, { small: true });
    });

    // Ready event
    client.on('ready', () => {
      console.log(`✅ WhatsApp client ready for user ${userId}`);
      
      // Update status
      this.userStatus.set(userId, 'connected');
      this.userQRs.delete(userId); // Clear QR
      
      // Update user's channel status in DB
      this.updateChannelStatus(userId, 'connected');
      
      // Emit connected event
      if (global.io) {
        global.io.to(`user-${userId}`).emit('whatsapp-connected', {
          userId: userId,
          timestamp: new Date(),
          info: {
            pushname: client.info?.pushname,
            me: client.info?.wid?.user
          }
        });
      }
    });

    // Message received event
    client.on('message', async (message) => {
      await this.handleIncomingMessage(userId, message);
    });

    // Message sent event
    client.on('message_create', async (message) => {
      if (message.fromMe) {
        await this.handleSentMessage(userId, message);
      }
    });

    // Disconnected event
    client.on('disconnected', (reason) => {
      console.log(`❌ WhatsApp disconnected for user ${userId}: ${reason}`);
      
      this.userStatus.set(userId, 'disconnected');
      this.clients.delete(userId);
      this.userQRs.delete(userId);
      
      this.updateChannelStatus(userId, 'disconnected');
      
      if (global.io) {
        global.io.to(`user-${userId}`).emit('whatsapp-disconnected', {
          userId: userId,
          reason: reason
        });
      }
    });

    // Auth failure
    client.on('auth_failure', (error) => {
      console.error(`🔐 Auth failure for user ${userId}:`, error);
      
      this.userStatus.set(userId, 'error');
      this.clients.delete(userId);
      this.userQRs.delete(userId);
      
      this.updateChannelStatus(userId, 'error');
      
      if (global.io) {
        global.io.to(`user-${userId}`).emit('whatsapp-error', {
          userId: userId,
          error: 'Authentication failed. Please try reconnecting.'
        });
      }
    });

    // Loading screen event
    client.on('loading_screen', (percent, message) => {
      console.log(`⏳ Loading for user ${userId}: ${percent}% - ${message}`);
      this.userStatus.set(userId, 'loading');
    });

    // Initialize
    try {
      await client.initialize();
      this.clients.set(userId, client);

      return {
        status: 'initializing',
        message: 'QR code will be generated shortly. Check the QR endpoint.'
      };
    } catch (error) {
      console.error(`Failed to initialize client for user ${userId}:`, error);
      this.userStatus.set(userId, 'error');
      
      return {
        status: 'error',
        message: error.message || 'Failed to initialize WhatsApp client'
      };
    }
  }

  // Get QR Code for specific user
  getQRCode(userId) {
    const qrData = this.userQRs.get(userId);
    
    if (qrData) {
      return {
        qr: qrData.qr,
        timestamp: qrData.timestamp
      };
    }
    return null;
  }

  // Get all active QR codes (admin use)
  getAllQRs() {
    const allQRs = {};
    for (const [userId, data] of this.userQRs) {
      allQRs[userId] = data;
    }
    return allQRs;
  }

  // Send message
  async sendMessage(userId, to, content, options = {}) {
    const client = this.clients.get(userId);
    
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    if (this.userStatus.get(userId) !== 'connected') {
      throw new Error('WhatsApp client is not connected');
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
    const status = this.userStatus.get(userId) || 'not_initialized';
    
    // Update last active time
    if (client) {
      this.clientLastActive.set(userId, Date.now());
    }
    
    if (!client) {
      return {
        status: status,
        message: this.getStatusMessage(status)
      };
    }

    return {
      status: status,
      message: this.getStatusMessage(status),
      info: client.info ? {
        pushname: client.info.pushname,
        me: client.info.wid?.user,
        platform: client.info.platform
      } : null
    };
  }

  // Get status message
  getStatusMessage(status) {
    const messages = {
      'not_initialized': 'WhatsApp not connected',
      'initializing': 'Initializing WhatsApp connection...',
      'qr_ready': 'QR code ready - scan with your phone',
      'loading': 'Loading WhatsApp session...',
      'connected': 'WhatsApp is connected and ready',
      'disconnected': 'WhatsApp disconnected',
      'error': 'Connection error - please reconnect',
      'limit_reached': 'Maximum connections reached'
    };
    return messages[status] || status;
  }

  // Get all clients status (admin use)
  getAllClientsStatus() {
    const statuses = {};
    for (const [userId, status] of this.userStatus) {
      statuses[userId] = {
        status: status,
        hasClient: this.clients.has(userId)
      };
    }
    return statuses;
  }

  // Disconnect client
  async disconnect(userId) {
    const client = this.clients.get(userId);
    
    if (client) {
      try {
        await client.destroy();
      } catch (err) {
        console.error('Error destroying client:', err);
      }
      this.clients.delete(userId);
    }
    
    this.userStatus.set(userId, 'disconnected');
    this.userQRs.delete(userId);
    
    await this.updateChannelStatus(userId, 'disconnected');

    return {
      status: 'disconnected',
      message: 'Client disconnected successfully'
    };
  }

  // Handle incoming message
  async handleIncomingMessage(userId, message) {
    try {
      // Get or create conversation
      let conversation = await Conversation.findOne({
        user: userId,
        channel: 'whatsapp',
        'contact.externalId': message.from
      });

      if (!conversation) {
        // Get contact info
        const contact = await message.getContact();
        
        conversation = new Conversation({
          user: userId,
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

      // Emit via socket.io
      if (global.io) {
        global.io.to(`user-${userId}`).emit('new-message', {
          conversationId: conversation._id,
          message: newMessage
        });
        
        // Also emit to conversation room
        global.io.to(conversation._id.toString()).emit('new-message', {
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
      const conversation = await Conversation.findOne({
        user: userId,
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
      const user = await User.findById(userId);
      if (user) {
        const channelIndex = user.channels.findIndex(c => c.type === 'whatsapp');
        if (channelIndex >= 0) {
          user.channels[channelIndex].connected = status === 'connected';
          user.channels[channelIndex].connectedAt = status === 'connected' ? new Date() : null;
        } else {
          user.channels.push({
            type: 'whatsapp',
            connected: status === 'connected',
            connectedAt: status === 'connected' ? new Date() : null
          });
        }
        await user.save();
      }
    } catch (error) {
      console.error('Error updating channel status:', error);
    }
  }

  // Cleanup inactive clients (run periodically)
  async cleanupInactiveClients() {
    const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    const cleanedUp = [];
    
    for (const [userId, client] of this.clients) {
      const status = this.userStatus.get(userId);
      const lastActive = this.clientLastActive.get(userId) || 0;
      
      // Disconnect clients that are:
      // 1. Stuck in error or disconnected state
      // 2. Inactive for more than 24 hours
      if (
        status === 'error' || 
        status === 'disconnected' ||
        (status === 'connected' && (now - lastActive) > maxInactiveTime)
      ) {
        console.log(`🧹 Cleaning up inactive client for user ${userId} (status: ${status}, inactive: ${Math.round((now - lastActive) / 60000)}min)`);
        await this.disconnect(userId);
        cleanedUp.push(userId);
      }
    }
    
    if (cleanedUp.length > 0) {
      console.log(`✅ Cleanup complete: ${cleanedUp.length} clients removed`);
    }
    
    return cleanedUp;
  }
  
  // Get active client count
  getActiveClientCount() {
    let count = 0;
    for (const [userId, status] of this.userStatus) {
      if (status === 'connected' || status === 'qr_ready' || status === 'initializing') {
        count++;
      }
    }
    return count;
  }
}

// Export singleton instance
module.exports = new WhatsAppService();