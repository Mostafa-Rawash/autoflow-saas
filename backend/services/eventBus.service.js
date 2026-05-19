const EventLog = require('../models/EventLog');

class EventBusService {
  constructor() {
    this.handlers = new Map(); // eventName -> [handlerFn]
    this.MAX_LOG_DAYS = 7; // Auto-delete logs older than 7 days
  }

  /**
   * Emit an event — saves to EventLog, fires socket, calls registered handlers
   * @param {string} userId - The user/tenant ID
   * @param {string} eventName - e.g. 'message.received', 'conversation.created'
   * @param {object} payload - Event data
   * @param {string} [channel] - Channel that triggered the event
   */
  async emit(userId, eventName, payload = {}, channel = 'system') {
    try {
      // Save to event log
      const log = await EventLog.create({
        user: userId,
        event: eventName,
        payload,
        channel,
        consumedBy: []
      });

      // Emit via socket.io for real-time updates
      if (global.io) {
        global.io.to(`user-${userId}`).emit('event', {
          id: log._id,
          event: eventName,
          payload,
          channel,
          timestamp: log.createdAt
        });
      }

      // Call registered handlers for this event
      const handlers = this.handlers.get(eventName) || [];
      for (const handler of handlers) {
        try {
          await handler(userId, eventName, payload, channel);
        } catch (err) {
          console.error(`EventBus handler error for ${eventName}:`, err.message);
        }
      }

      // Call wildcard handlers (listen to all events)
      const wildcardHandlers = this.handlers.get('*') || [];
      for (const handler of wildcardHandlers) {
        try {
          await handler(userId, eventName, payload, channel);
        } catch (err) {
          console.error(`EventBus wildcard handler error:`, err.message);
        }
      }

      return log;
    } catch (err) {
      console.error(`EventBus emit error (${eventName}):`, err.message);
      return null;
    }
  }

  /**
   * Register a handler for an event
   * @param {string} eventName - Event name or '*' for all events
   * @param {function} handlerFn - Async function(userId, eventName, payload, channel)
   */
  on(eventName, handlerFn) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName).push(handlerFn);
  }

  /**
   * Remove a handler for an event
   * @param {string} eventName
   * @param {function} handlerFn
   */
  off(eventName, handlerFn) {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handlerFn);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get recent event logs for a user
   * @param {string} userId
   * @param {object} filters - { event, channel, limit, skip }
   */
  async getRecentEvents(userId, filters = {}) {
    const query = { user: userId };
    if (filters.event) query.event = filters.event;
    if (filters.channel) query.channel = filters.channel;

    const limit = parseInt(filters.limit) || 50;
    const skip = parseInt(filters.skip) || 0;

    const [events, total] = await Promise.all([
      EventLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EventLog.countDocuments(query)
    ]);

    return {
      events,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark an event as consumed by a specific consumer
   * @param {string} eventId - EventLog _id
   * @param {string} consumerId - e.g. 'outgoingWebhook', 'chatbotFlow'
   */
  async markConsumed(eventId, consumerId) {
    return EventLog.findByIdAndUpdate(
      eventId,
      { $addToSet: { consumedBy: consumerId } },
      { new: true }
    );
  }

  /**
   * Clean up old event logs (call periodically)
   */
  async cleanup() {
    const cutoff = new Date(Date.now() - this.MAX_LOG_DAYS * 24 * 60 * 60 * 1000);
    const result = await EventLog.deleteMany({ createdAt: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} old event logs`);
    }
    return result.deletedCount;
  }
}

module.exports = new EventBusService();

// Standard event names for consistency
module.exports.EVENTS = {
  // Message events
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_SENT: 'message.sent',
  MESSAGE_FAILED: 'message.failed',

  // Conversation events
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_UPDATED: 'conversation.updated',
  CONVERSATION_STATUS_CHANGED: 'conversation.status_changed',
  CONVERSATION_ASSIGNED: 'conversation.assigned',
  CONVERSATION_RESOLVED: 'conversation.resolved',

  // Contact events
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_MERGED: 'contact.merged',

  // Channel events
  CHANNEL_CONNECTED: 'channel.connected',
  CHANNEL_DISCONNECTED: 'channel.disconnected',

  // Auto-reply events
  AUTO_REPLY_MATCHED: 'autoreply.matched',
  AUTO_REPLY_SENT: 'autoreply.sent',

  // AI events
  AI_RESPONSE_SENT: 'ai.response_sent',
  AI_INTENT_DETECTED: 'ai.intent_detected',

  // Workflow events
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  WORKFLOW_ACTION_EXECUTED: 'workflow.action_executed',

  // Follow-up events
  FOLLOWUP_TRIGGERED: 'followup.triggered',
  FOLLOWUP_SENT: 'followup.sent',

  // Campaign events
  CAMPAIGN_STARTED: 'campaign.started',
  CAMPAIGN_COMPLETED: 'campaign.completed',
  CAMPAIGN_MESSAGE_SENT: 'campaign.message_sent',

  // Chatbot events
  CHATBOT_FLOW_STARTED: 'chatbot.flow_started',
  CHATBOT_FLOW_COMPLETED: 'chatbot.flow_completed',
  CHATBOT_NODE_EXECUTED: 'chatbot.node_executed',

  // CSAT events
  CSAT_SUBMITTED: 'csat.submitted',

  // Department events
  DEPARTMENT_ASSIGNED: 'department.assigned',

  // Webhook events
  WEBHOOK_DELIVERED: 'webhook.delivered',
  WEBHOOK_FAILED: 'webhook.failed'
};