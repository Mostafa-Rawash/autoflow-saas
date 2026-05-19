const axios = require('axios');
const Integration = require('../models/Integration');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const eventBus = require('./eventBus.service');
const { EVENTS } = require('./eventBus.service');

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class InstagramService {
  constructor() {
    this.clients = new Map(); // userId → { pageId, accessToken, igUserId }
  }

  /**
   * Connect Instagram via Facebook Page access token
   */
  async connect(userId, { pageId, pageAccessToken, igUserId }) {
    try {
      // Verify the page access token and get Instagram business account
      const response = await axios.get(
        `${GRAPH_API_BASE}/${pageId}`,
        {
          params: { fields: 'id,name,instagram_business_account', access_token: pageAccessToken }
        }
      );

      const verifiedIgUserId = response.data.instagram_business_account?.id || igUserId;
      if (!verifiedIgUserId) {
        return { status: 'error', message: 'No Instagram Business Account linked to this Facebook Page. Make sure your Instagram account is connected to the Facebook Page.' };
      }

      const pageName = response.data.name;

      // Store/update integration
      const integration = await Integration.findOneAndUpdate(
        { user: userId, type: 'instagram' },
        {
          user: userId,
          type: 'instagram',
          name: `Instagram (@${verifiedIgUserId})`,
          status: 'connected',
          config: {
            pageId,
            pageAccessToken,
            igUserId: verifiedIgUserId,
            pageName
          },
          connectedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Cache in memory
      this.clients.set(userId.toString(), { pageId, pageAccessToken, igUserId: verifiedIgUserId });

      // Emit events
      if (global.io) {
        global.io.to(`user-${userId}`).emit('instagram-connected', {
          userId,
          igUserId: verifiedIgUserId,
          pageName,
          timestamp: new Date()
        });
      }

      eventBus.emit(userId, EVENTS.CHANNEL_CONNECTED, {
        channel: 'instagram',
        info: { igUserId: verifiedIgUserId, pageName }
      }, 'instagram').catch(err =>
        console.error('[EventBus] Error emitting CHANNEL_CONNECTED:', err.message)
      );

      return {
        status: 'connected',
        mode: 'instagram',
        igUserId: verifiedIgUserId,
        pageName,
        integration: integration._id
      };
    } catch (error) {
      console.error('[Instagram] Connection error:', error.response?.data || error.message);
      return {
        status: 'error',
        message: error.response?.data?.error?.message || 'Failed to verify Instagram connection'
      };
    }
  }

  /**
   * Disconnect Instagram
   */
  async disconnect(userId) {
    this.clients.delete(userId.toString());
    await Integration.findOneAndUpdate(
      { user: userId, type: 'instagram' },
      { status: 'disconnected' }
    );

    if (global.io) {
      global.io.to(`user-${userId}`).emit('instagram-disconnected', { userId });
    }

    eventBus.emit(userId, EVENTS.CHANNEL_DISCONNECTED, { channel: 'instagram' }, 'instagram').catch(() => {});

    return { status: 'disconnected', message: 'Instagram disconnected' };
  }

  /**
   * Get status
   */
  async getStatus(userId) {
    const cached = this.clients.get(userId.toString());
    if (cached) return { status: 'connected', ...cached };

    const integration = await Integration.findOne({ user: userId, type: 'instagram' });
    if (integration?.status === 'connected' && integration.config?.pageAccessToken) {
      this.clients.set(userId.toString(), {
        pageId: integration.config.pageId,
        pageAccessToken: integration.config.pageAccessToken,
        igUserId: integration.config.igUserId
      });
      return { status: 'connected', igUserId: integration.config.igUserId, pageName: integration.config.pageName };
    }

    return { status: 'disconnected' };
  }

  /**
   * Send a message via Instagram DM
   */
  async sendMessage(userId, recipientId, content) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('Instagram not connected');

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.igUserId}/messages`,
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
        channel: 'instagram',
        $or: [
          { 'contact.externalId': recipientId },
          { 'contact.igId': recipientId }
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
          metadata: { channel: 'instagram' }
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
          channel: 'instagram'
        }, 'instagram').catch(() => {});
      }

      return { success: true, messageId, response: response.data };
    } catch (error) {
      console.error('[Instagram] Send message error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send Instagram message');
    }
  }

  /**
   * Handle incoming webhook from Meta (Instagram DMs)
   */
  async handleWebhook(userId, body) {
    try {
      if (body.object !== 'instagram') return null;

      const entry = body.entry?.[0];
      if (!entry) return null;

      const messaging = entry.messaging?.[0];
      if (!messaging) return null;

      const senderId = messaging.sender?.id;
      const recipientId = messaging.recipient?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !messageText) return null;

      // Get sender profile info
      let senderName = senderId;
      try {
        const profileResponse = await axios.get(
          `${GRAPH_API_BASE}/${senderId}`,
          { params: { fields: 'id,name,username', access_token: this.clients.get(userId.toString())?.pageAccessToken } }
        );
        senderName = profileResponse.data?.username || profileResponse.data?.name || senderId;
      } catch (e) { /* use senderId as fallback */ }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        user: userId,
        channel: 'instagram',
        $or: [
          { 'contact.externalId': senderId },
          { 'contact.igId': senderId }
        ]
      });

      if (!conversation) {
        conversation = new Conversation({
          user: userId,
          channel: 'instagram',
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
          console.error('[FollowUp] Error in Instagram new conversation hook:', err.message)
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
          channel: 'instagram',
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
        channel: 'instagram',
        contactId: senderId,
        content: messageText
      }, 'instagram').catch(() => {});

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
            metadata: { autoReplyRule: matchedRule._id, autoReplyName: matchedRule.name, channel: 'instagram' }
          });
          await replyMessage.save();
          conversation.lastMessage = { content: resolvedResponse, timestamp: new Date(), sender: 'bot' };
          await conversation.save();

          eventBus.emit(userId, EVENTS.AUTO_REPLY_MATCHED, {
            conversationId: conversation._id,
            ruleId: matchedRule._id,
            ruleName: matchedRule.name,
            channel: 'instagram'
          }, 'instagram').catch(() => {});
        } catch (err) {
          console.error('[Instagram] Error sending auto-reply:', err.message);
        }
      } else {
        // Try AI auto-response
        const aiResponder = require('./aiResponder.service');
        const aiResponse = await aiResponder.handleIncomingMessage(userId, messageText, conversation, 'instagram');
        if (aiResponse) {
          try {
            await this.sendMessage(userId, senderId, aiResponse.text);
            const replyMessage = await aiResponder.saveMessage(conversation._id, userId, 'instagram', aiResponse);

            eventBus.emit(userId, EVENTS.AI_RESPONSE_SENT, {
              conversationId: conversation._id,
              messageId: replyMessage?._id,
              channel: 'instagram',
              source: 'auto_reply'
            }, 'instagram').catch(() => {});
          } catch (err) {
            console.error('[Instagram] Error sending AI auto-reply:', err.message);
          }
        }
      }

      return { conversation, message: newMessage };
    } catch (error) {
      console.error('[Instagram] Webhook handling error:', error);
      return null;
    }
  }

  /**
   * Verify webhook subscription
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'autoflow_verify_token';
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Instagram] Webhook verified');
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
      type: 'instagram',
      status: 'connected'
    });
    if (!integration?.config?.pageAccessToken) return null;

    const clientData = {
      pageId: integration.config.pageId,
      pageAccessToken: integration.config.pageAccessToken,
      igUserId: integration.config.igUserId
    };
    this.clients.set(userId.toString(), clientData);
    return clientData;
  }

  /**
   * Resume connected clients on server restart
   */
  async resumeClients() {
    const integrations = await Integration.find({ type: 'instagram', status: 'connected' });
    for (const integration of integrations) {
      if (integration.config?.pageAccessToken) {
        this.clients.set(integration.user.toString(), {
          pageId: integration.config.pageId,
          pageAccessToken: integration.config.pageAccessToken,
          igUserId: integration.config.igUserId
        });
        console.log(`📷 Resumed Instagram for user ${integration.user}`);
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

module.exports = new InstagramService();