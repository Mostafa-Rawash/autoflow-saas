const crypto = require('crypto');
const axios = require('axios');
const OutgoingWebhook = require('../models/OutgoingWebhook');
const eventBus = require('./eventBus.service');
const { EVENTS } = require('./eventBus.service');

class OutgoingWebhookService {
  constructor() {
    this.deliveryQueue = [];
    this.isProcessing = false;
  }

  /**
   * Create a new outgoing webhook
   */
  async create(userId, data) {
    const webhook = await OutgoingWebhook.create({
      user: userId,
      ...data,
      stats: { totalDelivered: 0, totalFailed: 0 }
    });
    return webhook;
  }

  /**
   * Get all webhooks for a user
   */
  async getAll(userId, filters = {}) {
    const query = { user: userId };
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.event) query.events = filters.event;

    return OutgoingWebhook.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get a single webhook
   */
  async getById(userId, webhookId) {
    return OutgoingWebhook.findOne({ _id: webhookId, user: userId }).lean();
  }

  /**
   * Update a webhook
   */
  async update(userId, webhookId, data) {
    const webhook = await OutgoingWebhook.findOneAndUpdate(
      { _id: webhookId, user: userId },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
    return webhook;
  }

  /**
   * Delete a webhook
   */
  async delete(userId, webhookId) {
    return OutgoingWebhook.deleteOne({ _id: webhookId, user: userId });
  }

  /**
   * Toggle webhook active/inactive
   */
  async toggle(userId, webhookId) {
    const webhook = await OutgoingWebhook.findOne({ _id: webhookId, user: userId });
    if (!webhook) return null;
    webhook.isActive = !webhook.isActive;
    await webhook.save();
    return webhook.toObject();
  }

  /**
   * Test webhook delivery with a sample payload
   */
  async testDelivery(userId, webhookId) {
    const webhook = await OutgoingWebhook.findOne({ _id: webhookId, user: userId });
    if (!webhook) return { success: false, error: 'Webhook not found' };

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test delivery from AutoFlow',
        userId
      }
    };

    try {
      const result = await this._deliver(webhook, testPayload);
      return { success: true, response: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get delivery logs for a webhook (from event bus)
   */
  async getDeliveryLogs(userId, webhookId, filters = {}) {
    const webhook = await OutgoingWebhook.findOne({ _id: webhookId, user: userId });
    if (!webhook) return [];

    const limit = parseInt(filters.limit) || 20;
    const skip = parseInt(filters.skip) || 0;

    return eventBus.getRecentEvents(userId, {
      event: 'webhook.delivered',
      limit,
      skip
    });
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  _generateSignature(payload, secret) {
    if (!secret) return '';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Deliver a webhook payload with retries
   */
  async _deliver(webhook, payload) {
    const signature = this._generateSignature(payload, webhook.secret);
    const headers = {
      'Content-Type': 'application/json',
      'X-AutoFlow-Event': payload.event || 'unknown',
      'X-AutoFlow-Delivery': payload.deliveryId || crypto.randomUUID(),
      'X-AutoFlow-Signature': signature,
      'X-AutoFlow-Timestamp': new Date().toISOString(),
      ...(webhook.headers instanceof Map ? Object.fromEntries(webhook.headers) : (webhook.headers || {}))
    };

    let lastError;
    for (let attempt = 0; attempt <= webhook.retryCount; attempt++) {
      try {
        const response = await axios({
          method: webhook.method.toLowerCase(),
          url: webhook.url,
          data: payload,
          headers,
          timeout: 10000,
          validateStatus: (status) => status < 500 // Retry on server errors
        });

        // Update stats
        await OutgoingWebhook.updateOne(
          { _id: webhook._id },
          {
            $inc: { 'stats.totalDelivered': 1 },
            $set: { 'stats.lastDeliveredAt': new Date() }
          }
        );

        return {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        };
      } catch (error) {
        lastError = error;
        if (attempt < webhook.retryCount) {
          await new Promise(resolve => setTimeout(resolve, webhook.retryDelayMs * (attempt + 1)));
        }
      }
    }

    // All retries failed
    await OutgoingWebhook.updateOne(
      { _id: webhook._id },
      {
        $inc: { 'stats.totalFailed': 1 },
        $set: { 'stats.lastFailedAt': new Date() }
      }
    );

    throw lastError || new Error('Webhook delivery failed after retries');
  }

  /**
   * Handle an event from the event bus — find matching webhooks and deliver
   */
  async handleEvent(userId, eventName, payload, channel) {
    try {
      const webhooks = await OutgoingWebhook.find({
        user: userId,
        isActive: true,
        events: eventName
      }).lean();

      for (const webhook of webhooks) {
        const deliveryPayload = {
          event: eventName,
          channel,
          timestamp: new Date().toISOString(),
          deliveryId: crypto.randomUUID(),
          data: payload
        };

        try {
          await this._deliver(webhook, deliveryPayload);

          // Mark event as consumed by this webhook
          if (payload?._eventId) {
            await eventBus.markConsumed(payload._eventId, `webhook:${webhook._id}`);
          }
        } catch (error) {
          console.error(`[OutgoingWebhook] Delivery failed for ${webhook._id} (${webhook.name}):`, error.message);
        }
      }
    } catch (error) {
      console.error('[OutgoingWebhook] Error handling event:', error.message);
    }
  }

  /**
   * Register all webhook handlers for a user's active webhooks
   */
  async registerUserWebhooks(userId) {
    const webhooks = await OutgoingWebhook.find({ user: userId, isActive: true }).lean();
    for (const webhook of webhooks) {
      for (const eventName of webhook.events) {
        eventBus.on(eventName, (uid, evtName, payload, channel) => {
          if (uid.toString() === userId.toString()) {
            this.handleEvent(uid, evtName, payload, channel);
          }
        });
      }
    }
  }

  /**
   * Register a wildcard handler that delivers to all matching webhooks per event
   * Called once at server startup
   */
  registerGlobalHandler() {
    eventBus.on('*', async (userId, eventName, payload, channel) => {
      await this.handleEvent(userId, eventName, payload, channel);
    });
    console.log('🔗 Outgoing webhook global handler registered');
  }
}

module.exports = new OutgoingWebhookService();