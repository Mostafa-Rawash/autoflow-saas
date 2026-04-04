const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

class WhatsAppService {
  constructor() {
    this.clients = new Map(); // userId -> Client
  }

  // Initialize WhatsApp client for a user
  async initializeClient(userId) {
    // Check if client already exists
    if (this.clients.has(userId)) {
      return {
        status: 'already_exists',
        message: 'Client already initialized'
      };
    }

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
          '--disable-gpu'
        ]
      }
    });

    // QR Code event
    client.on('qr', (qr) => {
      console.log(`📱 QR Code for user ${userId}:`);
      qrcode.generate(qr, { small: true });
      
      // Store QR for frontend to fetch
      this.currentQR = qr;
      this.qrTimestamp = new Date();
    });

    // Ready event
    client.on('ready', () => {
      console.log(`✅ WhatsApp client ready for user ${userId}`);
      
      // Update user's channel status
      this.updateChannelStatus(userId, 'connected');
      
      // Clear QR
      this.currentQR = null;
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
      this.updateChannelStatus(userId, 'disconnected');
      this.clients.delete(userId);
    });

    // Auth failure
    client.on('auth_failure', (error) => {
      console.error(`🔐 Auth failure for user ${userId}:`, error);
      this.updateChannelStatus(userId, 'error');
    });

    // Initialize
    await client.initialize();
    this.clients.set(userId, client);

    return {
      status: 'initializing',
      message: 'QR code will be generated shortly'
    };
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
}

// Export singleton instance
module.exports = new WhatsAppService();