/**
 * Message Queue Service
 * Handles queuing and processing of bulk messages with rate limiting
 */

const mongoose = require('mongoose');

// Message Queue Schema
const MessageQueueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document'],
    default: 'text'
  },
  media: {
    url: String,
    mimeType: String,
    size: Number,
    filename: String
  },
  priority: {
    type: Number,
    enum: [1, 2, 3], // 1=high, 2=normal, 3=low
    default: 2,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  processedAt: Date,
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  lastError: String,
  externalId: String, // Message ID from external platform after sending
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes
MessageQueueSchema.index({ user: 1, status: 1, priority: 1 });
MessageQueueSchema.index({ status: 1, scheduledFor: 1 });
MessageQueueSchema.index({ user: 1, createdAt: -1 });

const MessageQueue = mongoose.models.MessageQueue || mongoose.model('MessageQueue', MessageQueueSchema);

// Rate limit tracking
const RateLimitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  minuteCount: {
    type: Number,
    default: 0
  },
  hourCount: {
    type: Number,
    default: 0
  },
  dayCount: {
    type: Number,
    default: 0
  },
  lastMinuteReset: {
    type: Date,
    default: Date.now
  },
  lastHourReset: {
    type: Date,
    default: Date.now
  },
  lastDayReset: {
    type: Date,
    default: Date.now
  }
});

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

// Rate limits per plan
const PLAN_LIMITS = {
  free: { perMinute: 5, perHour: 50, perDay: 500 },
  basic: { perMinute: 15, perHour: 200, perDay: 2000 },
  standard: { perMinute: 30, perHour: 500, perDay: 5000 },
  premium: { perMinute: 60, perHour: 1000, perDay: 10000 }
};

class MessageQueueService {
  constructor() {
    this.processingInterval = null;
    this.isProcessing = false;
  }

  /**
   * Add message to queue
   */
  async addToQueue(userId, conversationId, messageData, options = {}) {
    const {
      priority = 2,
      scheduledFor = null,
      metadata = {}
    } = options;

    const queueItem = new MessageQueue({
      user: userId,
      conversation: conversationId,
      content: messageData.content,
      type: messageData.type || 'text',
      media: messageData.media,
      priority,
      scheduledFor,
      metadata
    });

    await queueItem.save();

    return {
      success: true,
      queueId: queueItem._id,
      status: queueItem.status,
      scheduledFor: queueItem.scheduledFor
    };
  }

  /**
   * Add bulk messages to queue
   */
  async addBulkToQueue(userId, messages) {
    const results = {
      total: messages.length,
      queued: 0,
      failed: 0,
      queueIds: []
    };

    for (const msg of messages) {
      try {
        const result = await this.addToQueue(
          userId,
          msg.conversationId,
          msg.messageData,
          msg.options
        );
        results.queued++;
        results.queueIds.push(result.queueId);
      } catch (error) {
        results.failed++;
        console.error('Failed to queue message:', error);
      }
    }

    return results;
  }

  /**
   * Check rate limit for user
   */
  async checkRateLimit(userId, plan = 'free') {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const now = new Date();

    let rateLimit = await RateLimit.findOne({ user: userId });
    if (!rateLimit) {
      rateLimit = new RateLimit({ user: userId });
    }

    // Reset counters based on time elapsed
    const minuteAgo = new Date(now - 60 * 1000);
    const hourAgo = new Date(now - 60 * 60 * 1000);
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

    if (rateLimit.lastMinuteReset < minuteAgo) {
      rateLimit.minuteCount = 0;
      rateLimit.lastMinuteReset = now;
    }

    if (rateLimit.lastHourReset < hourAgo) {
      rateLimit.hourCount = 0;
      rateLimit.lastHourReset = now;
    }

    if (rateLimit.lastDayReset < dayAgo) {
      rateLimit.dayCount = 0;
      rateLimit.lastDayReset = now;
    }

    // Check limits
    const canSend = {
      allowed: true,
      limits: {
        minute: { current: rateLimit.minuteCount, max: limits.perMinute },
        hour: { current: rateLimit.hourCount, max: limits.perHour },
        day: { current: rateLimit.dayCount, max: limits.perDay }
      },
      retryAfter: null
    };

    if (rateLimit.minuteCount >= limits.perMinute) {
      canSend.allowed = false;
      canSend.retryAfter = new Date(rateLimit.lastMinuteReset.getTime() + 60 * 1000);
    } else if (rateLimit.hourCount >= limits.perHour) {
      canSend.allowed = false;
      canSend.retryAfter = new Date(rateLimit.lastHourReset.getTime() + 60 * 60 * 1000);
    } else if (rateLimit.dayCount >= limits.perDay) {
      canSend.allowed = false;
      canSend.retryAfter = new Date(rateLimit.lastDayReset.getTime() + 24 * 60 * 60 * 1000);
    }

    return canSend;
  }

  /**
   * Increment rate limit counter
   */
  async incrementRateLimit(userId) {
    let rateLimit = await RateLimit.findOne({ user: userId });
    if (!rateLimit) {
      rateLimit = new RateLimit({ user: userId });
    }

    rateLimit.minuteCount += 1;
    rateLimit.hourCount += 1;
    rateLimit.dayCount += 1;

    await rateLimit.save();
  }

  /**
   * Get next batch of messages to process
   */
  async getNextBatch(batchSize = 10) {
    const now = new Date();

    return MessageQueue.find({
      status: 'pending',
      $or: [
        { scheduledFor: { $exists: false } },
        { scheduledFor: null },
        { scheduledFor: { $lte: now } }
      ]
    })
    .sort({ priority: 1, createdAt: 1 })
    .limit(batchSize)
    .populate('user', 'role subscription.plan')
    .populate('conversation', 'user channel contact');
  }

  /**
   * Process single queue item
   */
  async processItem(queueItem, whatsappService) {
    try {
      // Update status to processing
      queueItem.status = 'processing';
      queueItem.attempts += 1;
      await queueItem.save();

      // Check rate limit
      const plan = queueItem.user.subscription?.plan || 'free';
      const rateCheck = await this.checkRateLimit(queueItem.user._id, plan);
      
      if (!rateCheck.allowed) {
        queueItem.status = 'pending';
        queueItem.lastError = `Rate limited. Retry after ${rateCheck.retryAfter}`;
        await queueItem.save();
        return { success: false, reason: 'rate_limited', retryAfter: rateCheck.retryAfter };
      }

      // Get WhatsApp client for user
      const client = whatsappService.getClient(queueItem.user._id);
      if (!client || !client.isConnected()) {
        queueItem.status = 'pending';
        queueItem.lastError = 'WhatsApp not connected';
        await queueItem.save();
        return { success: false, reason: 'not_connected' };
      }

      // Send message based on type
      let result;
      const contact = queueItem.conversation.contact;
      
      if (queueItem.type === 'text') {
        result = await client.sendMessage(contact.phone, queueItem.content);
      } else if (queueItem.media?.url) {
        const media = await whatsappService.createMedia(queueItem.media.url);
        result = await client.sendMessage(contact.phone, media, {
          caption: queueItem.content
        });
      }

      // Update queue item
      queueItem.status = 'sent';
      queueItem.processedAt = new Date();
      queueItem.externalId = result?.id?._serialized || result?.id;
      await queueItem.save();

      // Increment rate limit
      await this.incrementRateLimit(queueItem.user._id);

      return { success: true, externalId: queueItem.externalId };
    } catch (error) {
      console.error('Error processing queue item:', error);
      
      queueItem.lastError = error.message;
      
      if (queueItem.attempts >= queueItem.maxAttempts) {
        queueItem.status = 'failed';
      } else {
        queueItem.status = 'pending';
      }
      
      await queueItem.save();
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Start queue processor
   */
  startProcessor(whatsappService, intervalMs = 5000) {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(async () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      try {
        const batch = await this.getNextBatch(10);
        
        for (const item of batch) {
          await this.processItem(item, whatsappService);
          // Small delay between messages
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error('Queue processor error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, intervalMs);

    console.log('Message queue processor started');
  }

  /**
   * Stop queue processor
   */
  stopProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Message queue processor stopped');
    }
  }

  /**
   * Get queue stats for user
   */
  async getUserStats(userId) {
    const stats = await MessageQueue.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const result = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  /**
   * Cancel pending messages
   */
  async cancelMessages(userId, queueIds = null) {
    const query = {
      user: userId,
      status: 'pending'
    };

    if (queueIds) {
      query._id = { $in: queueIds };
    }

    const result = await MessageQueue.updateMany(query, {
      status: 'cancelled'
    });

    return {
      success: true,
      cancelled: result.modifiedCount
    };
  }

  /**
   * Retry failed messages
   */
  async retryFailed(userId) {
    const result = await MessageQueue.updateMany({
      user: userId,
      status: 'failed'
    }, {
      status: 'pending',
      attempts: 0,
      lastError: null
    });

    return {
      success: true,
      retried: result.modifiedCount
    };
  }

  /**
   * Clean up old processed messages
   */
  async cleanup(daysOld = 30) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    const result = await MessageQueue.deleteMany({
      status: { $in: ['sent', 'failed', 'cancelled'] },
      processedAt: { $lt: cutoff }
    });

    return {
      success: true,
      deleted: result.deletedCount
    };
  }
}

// Export singleton instance
const messageQueueService = new MessageQueueService();

module.exports = {
  MessageQueue,
  RateLimit,
  messageQueueService,
  PLAN_LIMITS
};