const axios = require('axios');
const Integration = require('../models/Integration');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const eventBus = require('./eventBus.service');
const { EVENTS } = require('./eventBus.service');

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class MessengerService {
  constructor() {
    this.clients = new Map(); // userId → { pageId, accessToken }
  }

  /**
   * Connect Messenger via Facebook Page access token
   */
  async connect(userId, { pageId, pageAccessToken }) {
    try {
      // Verify the page access token
      const response = await axios.get(
        `${GRAPH_API_BASE}/${pageId}`,
        {
          params: { fields: 'id,name', access_token: pageAccessToken }
        }
      );

      const pageName = response.data.name;

      // Store/update integration
      const integration = await Integration.findOneAndUpdate(
        { user: userId, type: 'messenger' },
        {
          user: userId,
          type: 'messenger',
          name: `Messenger (${pageName})`,
          status: 'connected',
          config: {
            pageId,
            pageAccessToken,
            pageName
          },
          connectedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Cache in memory
      this.clients.set(userId.toString(), { pageId, pageAccessToken });

      // Emit events
      if (global.io) {
        global.io.to(`user-${userId}`).emit('messenger-connected', {
          userId,
          pageName,
          timestamp: new Date()
        });
      }

      eventBus.emit(userId, EVENTS.CHANNEL_CONNECTED, {
        channel: 'messenger',
        info: { pageName }
      }, 'messenger').catch(err =>
        console.error('[EventBus] Error emitting CHANNEL_CONNECTED:', err.message)
      );

      return {
        status: 'connected',
        mode: 'messenger',
        pageName,
        integration: integration._id
      };
    } catch (error) {
      console.error('[Messenger] Connection error:', error.response?.data || error.message);
      return {
        status: 'error',
        message: error.response?.data?.error?.message || 'Failed to verify Messenger connection'
      };
    }
  }

  /**
   * Disconnect Messenger
   */
  async disconnect(userId) {
    this.clients.delete(userId.toString());
    await Integration.findOneAndUpdate(
      { user: userId, type: 'messenger' },
      { status: 'disconnected' }
    );

    if (global.io) {
      global.io.to(`user-${userId}`).emit('messenger-disconnected', { userId });
    }

    eventBus.emit(userId, EVENTS.CHANNEL_DISCONNECTED, { channel: 'messenger' }, 'messenger').catch(() => {});

    return { status: 'disconnected', message: 'Messenger disconnected' };
  }

  /**
   * Get status
   */
  async getStatus(userId) {
    const cached = this.clients.get(userId.toString());
    if (cached) return { status: 'connected', ...cached };

    const integration = await Integration.findOne({ user: userId, type: 'messenger' });
    if (integration?.status === 'connected' && integration.config?.pageAccessToken) {
      this.clients.set(userId.toString(), {
        pageId: integration.config.pageId,
        pageAccessToken: integration.config.pageAccessToken
      });
      return { status: 'connected', pageName: integration.config.pageName };
    }

    return { status: 'disconnected' };
  }

  /**
   * Send a message via Messenger
   */
  async sendMessage(userId, recipientId, content) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('Messenger not connected');

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.pageId}/messages`,
        {
          recipient: { id: recipientId },
          message: { text: content }
        },
        {
          headers: {
            Authorization: `Bearer ${client.pageAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const messageId = response.data?.message_id;

      // Save to conversation
      const conversation = await Conversation.findOne({
        user: userId,
        channel: 'messenger',
        $or: [
          { 'contact.externalId': recipientId },
          { 'contact.messengerId': recipientId }
        ]
      });

      if (conversation) {
        const newMessage = new Message({
          conversation: conversation._id,
          sender: 'agent',
          senderId: userId,
          content,
          type: 'text',
          externalId: messageId,
          metadata: { channel: 'messenger' }
        });
        await newMessage.save();

        conversation.lastMessage = { content, timestamp: new Date(), sender: 'agent' };
        await conversation.save();

        if (global.io) {
          global.io.to(`user-${userId}`).emit('new-message', {
            conversationId: conversation._id,
            message: newMessage
          });
        }

        eventBus.emit(userId, EVENTS.MESSAGE_SENT, {
          conversationId: conversation._id,
          messageId: newMessage._id,
          channel: 'messenger'
        }, 'messenger').catch(() => {});
      }

      return { success: true, messageId, response: response.data };
    } catch (error) {
      console.error('[Messenger] Send message error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send Messenger message');
    }
  }

  /**
   * Handle incoming webhook from Meta (Messenger messages)
   */
  async handleWebhook(userId, body) {
    try {
      if (body.object !== 'page') return null;

      const entry = body.entry?.[0];
      if (!entry) return null;

      const messaging = entry.messaging?.[0];
      if (!messaging) return null;

      // Ignore deliveries, reads, etc. — only process messages
      if (!messaging.message) return null;

      const senderId = messaging.sender?.id;
      const recipientId = messaging.recipient?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !messageText) return null;

      // Get sender profile info
      let senderName = senderId;
      try {
        const profileResponse = await axios.get(
          `${GRAPH_API_BASE}/${senderId}`,
          { params: { fields: 'id,name,first_name,last_name', access_token: this.clients.get(userId.toString())?.pageAccessToken } }
        );
        senderName = profileResponse.data?.name || profileResponse.data?.first_name || senderId;
      } catch (e) { /* use senderId as fallback */ }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        user: userId,
        channel: 'messenger',
        $or: [
          { 'contact.externalId': senderId },
          { 'contact.messengerId': senderId }
        ]
      });

      if (!conversation) {
        conversation = new Conversation({
          user: userId,
          channel: 'messenger',
          contact: {
            name: senderName,
            phone: '',
            externalId: senderId
          },
          status: 'active'
        });
        await conversation.save();

        const followUpService = require('./followUp.service');
        followUpService.handleConversationCreated(conversation).catch(err =>
          console.error('[FollowUp] Error in Messenger new conversation hook:', err.message)
        );
      }

      // Check for duplicate
      const msgId = messaging.message?.mid;
      if (msgId) {
        const existing = await Message.findOne({ externalId: msgId, conversation: conversation._id });
        if (existing) return { conversation, message: existing };
      }

      const newMessage = new Message({
        conversation: conversation._id,
        sender: 'contact',
        content: messageText,
        type: 'text',
        externalId: msgId,
        metadata: {
          channel: 'messenger',
          senderId,
          recipientId,
          timestamp: messaging.timestamp
        }
      });
      await newMessage.save();

      conversation.lastMessage = { content: messageText, timestamp: new Date(), sender: 'contact' };
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await conversation.save();

      // Follow-up: contact replied
      const followUpService = require('./followUp.service');
      followUpService.handleContactReply(userId, conversation._id).catch(() => {});

      // Socket emission
      if (global.io) {
        global.io.to(`user-${userId}`).emit('new-message', {
          conversationId: conversation._id,
          message: newMessage
        });
        global.io.to(conversation._id.toString()).emit('new-message', {
          conversationId: conversation._id,
          message: newMessage
        });
      }

      // Event bus
      eventBus.emit(userId, EVENTS.MESSAGE_RECEIVED, {
        conversationId: conversation._id,
        messageId: newMessage._id,
        channel: 'messenger',
        contactId: senderId,
        content: messageText
      }, 'messenger').catch(() => {});

      // Auto-reply matching
      const autoReplyService = require('./autoReply.service');
      const matchedResult = await autoReplyService.findMatch(userId, messageText, conversation);
      if (matchedResult) {
        const { rule: matchedRule, resolvedResponse } = matchedResult;
        try {
          await this.sendMessage(userId, senderId, resolvedResponse);
          const replyMessage = new Message({
            conversation: conversation._id,
            sender: 'bot',
            content: resolvedResponse,
            type: 'text',
            metadata: { autoReplyRule: matchedRule._id, autoReplyName: matchedRule.name, channel: 'messenger' }
          });
          await replyMessage.save();
          conversation.lastMessage = { content: resolvedResponse, timestamp: new Date(), sender: 'bot' };
          await conversation.save();

          eventBus.emit(userId, EVENTS.AUTO_REPLY_MATCHED, {
            conversationId: conversation._id,
            ruleId: matchedRule._id,
            ruleName: matchedRule.name,
            channel: 'messenger'
          }, 'messenger').catch(() => {});
        } catch (err) {
          console.error('[Messenger] Error sending auto-reply:', err.message);
        }
      } else {
        // Try AI auto-response
        const aiResponder = require('./aiResponder.service');
        const aiResponse = await aiResponder.handleIncomingMessage(userId, messageText, conversation, 'messenger');
        if (aiResponse) {
          try {
            await this.sendMessage(userId, senderId, aiResponse.text);
            const replyMessage = await aiResponder.saveMessage(conversation._id, userId, 'messenger', aiResponse);

            eventBus.emit(userId, EVENTS.AI_RESPONSE_SENT, {
              conversationId: conversation._id,
              messageId: replyMessage?._id,
              channel: 'messenger',
              source: 'auto_reply'
            }, 'messenger').catch(() => {});
          } catch (err) {
            console.error('[Messenger] Error sending AI auto-reply:', err.message);
          }
        }
      }

      return { conversation, message: newMessage };
    } catch (error) {
      console.error('[Messenger] Webhook handling error:', error);
      return null;
    }
  }

  /**
   * Verify webhook subscription
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.MESSENGER_VERIFY_TOKEN || 'autoflow_verify_token';
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Messenger] Webhook verified');
      return challenge;
    }
    return null;
  }

  /**
   * Load client from DB
   */
  async _loadClient(userId) {
    const integration = await Integration.findOne({
      user: userId,
      type: 'messenger',
      status: 'connected'
    });
    if (!integration?.config?.pageAccessToken) return null;

    const clientData = {
      pageId: integration.config.pageId,
      pageAccessToken: integration.config.pageAccessToken
    };
    this.clients.set(userId.toString(), clientData);
    return clientData;
  }

  /**
   * Resume connected clients on server restart
   */
  async resumeClients() {
    const integrations = await Integration.find({ type: 'messenger', status: 'connected' });
    for (const integration of integrations) {
      if (integration.config?.pageAccessToken) {
        this.clients.set(integration.user.toString(), {
          pageId: integration.config.pageId,
          pageAccessToken: integration.config.pageAccessToken
        });
        console.log(`💬 Resumed Messenger for user ${integration.user}`);
      }
    }
    return this.clients.size;
  }

  /**
   * Health check
   */
  async healthCheck() {
    return { maxClients: Infinity, connected: this.clients.size };
  }
}

module.exports = new MessengerService();