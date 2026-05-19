const axios = require('axios');
const Integration = require('../models/Integration');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const eventBus = require('./eventBus.service');
const { EVENTS } = require('./eventBus.service');

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class WhatsAppBusinessService {
  constructor() {
    this.clients = new Map(); // userId → { phoneNumberId, accessToken, wabaId }
  }

  /**
   * Connect a user's WhatsApp Business API
   * Stores credentials and verifies them
   */
  async connect(userId, { phoneNumberId, accessToken, businessAccountId, wabaId }) {
    // Verify credentials by fetching the phone number info
    try {
      const response = await axios.get(
        `${GRAPH_API_BASE}/${phoneNumberId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const verifiedPhoneNumberId = response.data.id;
      const displayPhoneNumber = response.data.display_phone_number;

      // Store/update integration
      const integration = await Integration.findOneAndUpdate(
        { user: userId, type: 'whatsapp' },
        {
          user: userId,
          type: 'whatsapp',
          name: `WhatsApp Business (${displayPhoneNumber || phoneNumberId})`,
          status: 'connected',
          config: {
            whatsappMode: 'business_api',
            phoneNumberId: verifiedPhoneNumberId,
            accessToken,
            businessAccountId,
            wabaId: wabaId || businessAccountId
          },
          connectedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Cache in memory
      this.clients.set(userId.toString(), {
        phoneNumberId: verifiedPhoneNumberId,
        accessToken,
        wabaId: wabaId || businessAccountId,
        displayPhoneNumber
      });

      // Emit events
      if (global.io) {
        global.io.to(`user-${userId}`).emit('whatsapp-connected', {
          userId,
          timestamp: new Date(),
          mode: 'business_api',
          info: { displayPhoneNumber, phoneNumberId: verifiedPhoneNumberId }
        });
      }

      eventBus.emit(userId, EVENTS.CHANNEL_CONNECTED, {
        channel: 'whatsapp',
        mode: 'business_api',
        info: { displayPhoneNumber, phoneNumberId: verifiedPhoneNumberId }
      }, 'whatsapp').catch(err =>
        console.error('[EventBus] Error emitting CHANNEL_CONNECTED:', err.message)
      );

      return {
        status: 'connected',
        mode: 'business_api',
        displayPhoneNumber,
        phoneNumberId: verifiedPhoneNumberId,
        integration: integration._id
      };
    } catch (error) {
      console.error('[WhatsAppBusiness] Connection error:', error.response?.data || error.message);
      return {
        status: 'error',
        message: error.response?.data?.error?.message || 'Invalid credentials or unable to verify phone number'
      };
    }
  }

  /**
   * Disconnect WhatsApp Business API
   */
  async disconnect(userId) {
    this.clients.delete(userId.toString());

    await Integration.findOneAndUpdate(
      { user: userId, type: 'whatsapp' },
      { status: 'disconnected', 'config.whatsappMode': 'web' },
      { new: true }
    );

    if (global.io) {
      global.io.to(`user-${userId}`).emit('whatsapp-disconnected', {
        userId,
        reason: 'business_api_disconnected'
      });
    }

    eventBus.emit(userId, EVENTS.CHANNEL_DISCONNECTED, {
      channel: 'whatsapp',
      mode: 'business_api'
    }, 'whatsapp').catch(err =>
      console.error('[EventBus] Error emitting CHANNEL_DISCONNECTED:', err.message)
    );

    return { status: 'disconnected', message: 'WhatsApp Business API disconnected' };
  }

  /**
   * Get current status and cached credentials
   */
  async getStatus(userId) {
    const cached = this.clients.get(userId.toString());
    if (cached) {
      return { status: 'connected', mode: 'business_api', ...cached };
    }

    // Check DB
    const integration = await Integration.findOne({ user: userId, type: 'whatsapp' });
    if (integration?.config?.whatsappMode === 'business_api' && integration.status === 'connected') {
      const clientData = {
        phoneNumberId: integration.config.phoneNumberId,
        accessToken: integration.config.accessToken,
        wabaId: integration.config.wabaId
      };
      this.clients.set(userId.toString(), clientData);
      return { status: 'connected', mode: 'business_api', ...clientData };
    }

    return { status: 'disconnected', mode: null };
  }

  /**
   * Send a text message via WhatsApp Business API
   */
  async sendMessage(userId, to, content, options = {}) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('WhatsApp Business API not connected');

    // Normalize phone number — remove any non-digit characters except +
    const normalizedTo = to.replace(/[^\d+]/g, '');
    // WhatsApp expects number without + and without @c.us suffix
    const phoneRecipient = normalizedTo.replace(/^\+/, '').replace(/@c\.us$/, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneRecipient,
      type: 'text',
      text: { preview_url: true, body: content }
    };

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.phoneNumberId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${client.accessToken}`, 'Content-Type': 'application/json' } }
      );

      const messageId = response.data?.messages?.[0]?.id;

      // Save message to conversation
      const conversation = await Conversation.findOne({
        user: userId,
        channel: 'whatsapp',
        $or: [
          { 'contact.externalId': { $regex: phoneRecipient + '$' } },
          { 'contact.phone': phoneRecipient }
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
          metadata: { mode: 'business_api' }
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
          channel: 'whatsapp',
          mode: 'business_api'
        }, 'whatsapp').catch(err =>
          console.error('[EventBus] Error emitting MESSAGE_SENT:', err.message)
        );
      }

      return { success: true, messageId, response: response.data };
    } catch (error) {
      console.error('[WhatsAppBusiness] Send message error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send message');
    }
  }

  /**
   * Send a template message
   */
  async sendTemplate(userId, to, templateName, languageCode = 'en', components = []) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('WhatsApp Business API not connected');

    const phoneRecipient = to.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/@c\.us$/, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneRecipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    };

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.phoneNumberId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${client.accessToken}`, 'Content-Type': 'application/json' } }
      );

      return { success: true, messageId: response.data?.messages?.[0]?.id, response: response.data };
    } catch (error) {
      console.error('[WhatsAppBusiness] Send template error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send template');
    }
  }

  /**
   * Send an interactive message (buttons, list, etc.)
   */
  async sendInteractiveMessage(userId, to, interactive) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('WhatsApp Business API not connected');

    const phoneRecipient = to.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/@c\.us$/, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneRecipient,
      type: 'interactive',
      interactive
    };

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.phoneNumberId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${client.accessToken}`, 'Content-Type': 'application/json' } }
      );

      return { success: true, messageId: response.data?.messages?.[0]?.id, response: response.data };
    } catch (error) {
      console.error('[WhatsAppBusiness] Send interactive error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send interactive message');
    }
  }

  /**
   * Send a media message (image, document, video, audio, sticker)
   */
  async sendMediaMessage(userId, to, mediaType, mediaUrl, caption = '') {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('WhatsApp Business API not connected');

    const phoneRecipient = to.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/@c\.us$/, '');

    const typeMap = {
      image: 'image',
      document: 'document',
      video: 'video',
      audio: 'audio',
      sticker: 'sticker'
    };

    const mediaTypeKey = typeMap[mediaType] || 'document';

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneRecipient,
      type: mediaTypeKey,
      [mediaTypeKey]: {
        link: mediaUrl,
        ...(caption && mediaTypeKey !== 'sticker' && mediaTypeKey !== 'audio' ? { caption } : {})
      }
    };

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.phoneNumberId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${client.accessToken}`, 'Content-Type': 'application/json' } }
      );

      return { success: true, messageId: response.data?.messages?.[0]?.id, response: response.data };
    } catch (error) {
      console.error('[WhatsAppBusiness] Send media error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send media message');
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(userId, messageId) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) return;

    try {
      await axios.post(
        `${GRAPH_API_BASE}/${client.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        { headers: { Authorization: `Bearer ${client.accessToken}`, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('[WhatsAppBusiness] Mark as read error:', error.response?.data || error.message);
    }
  }

  /**
   * Upload media to WhatsApp Business API
   */
  async uploadMedia(userId, filePath, mimeType) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) throw new Error('WhatsApp Business API not connected');

    const fs = require('fs');
    const FormData = require('form-data');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), { contentType: mimeType });
    form.append('type', mimeType.split('/')[0]); // image, video, audio, document
    form.append('messaging_product', 'whatsapp');

    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${client.phoneNumberId}/media`,
        form,
        {
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            ...form.getHeaders()
          }
        }
      );

      return { success: true, mediaId: response.data.id, response: response.data };
    } catch (error) {
      console.error('[WhatsAppBusiness] Upload media error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to upload media');
    }
  }

  /**
   * Handle incoming webhook from Meta
   * Called by the webhook route handler
   */
  async handleWebhook(userId, body) {
    try {
      if (body.object !== 'whatsapp_business_account') return null;

      const entry = body.entry?.[0];
      if (!entry) return null;

      const changes = entry.changes?.[0];
      if (!changes) return null;

      const value = changes.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        // Handle status updates
        const statuses = value?.statuses;
        if (statuses) {
          for (const status of statuses) {
            // Could emit status events for read/delivered tracking
            eventBus.emit(userId, EVENTS.MESSAGE_SENT, {
              messageId: status.id,
              status: status.status,
              channel: 'whatsapp',
              mode: 'business_api'
            }, 'whatsapp').catch(() => {});
          }
        }
        return null;
      }

      const results = [];
      for (const msg of messages) {
        const from = msg.from; // Phone number of the sender
        const contactInfo = value.contacts?.find(c => c.wa_id === from);
        const contactName = contactInfo?.profile?.name || from;

        // Find or create conversation
        let conversation = await Conversation.findOne({
          user: userId,
          channel: 'whatsapp',
          $or: [
            { 'contact.externalId': from },
            { 'contact.phone': from }
          ]
        });

        if (!conversation) {
          conversation = new Conversation({
            user: userId,
            channel: 'whatsapp',
            contact: {
              name: contactName,
              phone: from,
              externalId: from
            },
            status: 'active'
          });
          await conversation.save();

          const followUpService = require('./followUp.service');
          followUpService.handleConversationCreated(conversation).catch(err =>
            console.error('[FollowUp] Error in WhatsApp Business new conversation hook:', err.message)
          );
        } else {
          // Update contact name if we got a better one
          if (contactName && contactName !== from && conversation.contact.name !== contactName) {
            conversation.contact.name = contactName;
          }
        }

        // Extract message content based on type
        let content = '';
        let type = 'text';
        let metadata = { mode: 'business_api', messageId: msg.id };

        if (msg.text) {
          content = msg.text.body;
          type = 'text';
        } else if (msg.image) {
          content = msg.image.caption || '[Image]';
          type = 'image';
          metadata.mediaId = msg.image.id;
          metadata.caption = msg.image.caption;
        } else if (msg.document) {
          content = msg.document.caption || msg.document.filename || '[Document]';
          type = 'document';
          metadata.mediaId = msg.document.id;
          metadata.filename = msg.document.filename;
        } else if (msg.video) {
          content = msg.video.caption || '[Video]';
          type = 'video';
          metadata.mediaId = msg.video.id;
        } else if (msg.audio) {
          content = '[Audio]';
          type = 'audio';
          metadata.mediaId = msg.audio.id;
        } else if (msg.sticker) {
          content = '[Sticker]';
          type = 'sticker';
          metadata.mediaId = msg.sticker.id;
        } else if (msg.location) {
          content = `📍 ${msg.location.name || 'Location'} (${msg.location.latitude}, ${msg.location.longitude})`;
          type = 'location';
          metadata.latitude = msg.location.latitude;
          metadata.longitude = msg.location.longitude;
        } else if (msg.contacts) {
          content = `[Contact: ${msg.contacts[0]?.name?.formatted_name || 'Shared Contact'}]`;
          type = 'contact';
        } else if (msg.reaction) {
          content = `Reacted: ${msg.reaction.emoji}`;
          type = 'reaction';
          metadata.emoji = msg.reaction.emoji;
        } else if (msg.interactive) {
          // Button reply or list reply
          const interactiveReply = msg.interactive.button_reply || msg.interactive.list_reply;
          content = interactiveReply?.title || interactiveReply?.id || '[Interactive Response]';
          type = 'text';
          metadata.interactiveId = interactiveReply?.id;
          metadata.interactiveTitle = interactiveReply?.title;
        } else {
          content = '[Unsupported message type]';
          type = 'text';
        }

        if (!content) continue;

        // Check for duplicate messages
        const existing = await Message.findOne({ externalId: msg.id, conversation: conversation._id });
        if (existing) continue;

        // Save message
        const newMessage = new Message({
          conversation: conversation._id,
          sender: 'contact',
          content,
          type,
          externalId: msg.id,
          metadata
        });
        await newMessage.save();

        conversation.lastMessage = { content, timestamp: new Date(), sender: 'contact' };
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        await conversation.save();

        // Follow-up: contact replied
        const followUpService = require('./followUp.service');
        followUpService.handleContactReply(userId, conversation._id).catch(err =>
          console.error('[FollowUp] Error in WhatsApp Business contact reply hook:', err.message)
        );

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
          channel: 'whatsapp',
          mode: 'business_api',
          contactId: from,
          content
        }, 'whatsapp').catch(err =>
          console.error('[EventBus] Error emitting MESSAGE_RECEIVED:', err.message)
        );

        // Mark as read
        await this.markAsRead(userId, msg.id);

        // Auto-reply matching
        if (content && type === 'text') {
          const autoReplyService = require('./autoReply.service');
          const matchedResult = await autoReplyService.findMatch(userId, content, conversation);
          if (matchedResult) {
            const { rule: matchedRule, resolvedResponse } = matchedResult;
            try {
              await this.sendMessage(userId, from, resolvedResponse);
              const replyMessage = new Message({
                conversation: conversation._id,
                sender: 'bot',
                content: resolvedResponse,
                type: 'text',
                metadata: { autoReplyRule: matchedRule._id, autoReplyName: matchedRule.name, mode: 'business_api' }
              });
              await replyMessage.save();
              conversation.lastMessage = { content: resolvedResponse, timestamp: new Date(), sender: 'bot' };
              await conversation.save();

              if (global.io) {
                global.io.to(`user-${userId}`).emit('new-message', {
                  conversationId: conversation._id,
                  message: replyMessage
                });
              }

              eventBus.emit(userId, EVENTS.AUTO_REPLY_MATCHED, {
                conversationId: conversation._id,
                ruleId: matchedRule._id,
                ruleName: matchedRule.name,
                channel: 'whatsapp',
                mode: 'business_api'
              }, 'whatsapp').catch(() => {});
            } catch (err) {
              console.error('[WhatsAppBusiness] Error sending auto-reply:', err.message);
            }
          } else {
            // Try AI auto-response
            const aiResponder = require('./aiResponder.service');
            const aiResponse = await aiResponder.handleIncomingMessage(userId, content, conversation, 'whatsapp');
            if (aiResponse) {
              try {
                await this.sendMessage(userId, from, aiResponse.text);
                const replyMessage = await aiResponder.saveMessage(conversation._id, userId, 'whatsapp', aiResponse);
                if (replyMessage && global.io) {
                  global.io.to(`user-${userId}`).emit('new-message', {
                    conversationId: conversation._id,
                    message: replyMessage
                  });
                }

                eventBus.emit(userId, EVENTS.AI_RESPONSE_SENT, {
                  conversationId: conversation._id,
                  messageId: replyMessage?._id,
                  channel: 'whatsapp',
                  mode: 'business_api',
                  source: 'auto_reply'
                }, 'whatsapp').catch(() => {});
              } catch (err) {
                console.error('[WhatsAppBusiness] Error sending AI auto-reply:', err.message);
              }
            }
          }
        }

        results.push({ conversation, message: newMessage });
      }

      return results;
    } catch (error) {
      console.error('[WhatsAppBusiness] Webhook handling error:', error);
      return null;
    }
  }

  /**
   * Verify webhook subscription (GET challenge from Meta)
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'autoflow_verify_token';
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsAppBusiness] Webhook verified');
      return challenge;
    }
    return null;
  }

  /**
   * Health check — verify the stored credentials still work
   */
  async healthCheck(userId) {
    const client = this.clients.get(userId.toString()) || await this._loadClient(userId);
    if (!client) return { connected: false, mode: 'business_api' };

    try {
      await axios.get(
        `${GRAPH_API_BASE}/${client.phoneNumberId}`,
        { headers: { Authorization: `Bearer ${client.accessToken}` } }
      );
      return { connected: true, mode: 'business_api' };
    } catch (error) {
      return { connected: false, mode: 'business_api', error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Load client credentials from DB
   */
  async _loadClient(userId) {
    const integration = await Integration.findOne({
      user: userId,
      type: 'whatsapp',
      status: 'connected',
      'config.whatsappMode': 'business_api'
    });

    if (!integration) return null;

    const clientData = {
      phoneNumberId: integration.config.phoneNumberId,
      accessToken: integration.config.accessToken,
      wabaId: integration.config.wabaId
    };

    this.clients.set(userId.toString(), clientData);
    return clientData;
  }

  /**
   * Resume all connected Business API clients on server restart
   */
  async resumeClients() {
    const integrations = await Integration.find({
      type: 'whatsapp',
      status: 'connected',
      'config.whatsappMode': 'business_api'
    });

    for (const integration of integrations) {
      const userId = integration.user.toString();
      this.clients.set(userId, {
        phoneNumberId: integration.config.phoneNumberId,
        accessToken: integration.config.accessToken,
        wabaId: integration.config.wabaId
      });
      console.log(`📱 Resumed WhatsApp Business API for user ${userId}`);
    }

    return this.clients.size;
  }
}

module.exports = new WhatsAppBusinessService();