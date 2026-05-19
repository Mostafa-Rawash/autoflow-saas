const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Trigger configuration
  triggerType: {
    type: String,
    enum: ['no_reply', 'schedule', 'status_change', 'new_conversation'],
    required: true
  },

  // For 'no_reply': send after X minutes of no contact reply
  delayMinutes: {
    type: Number,
    default: null
  },

  // For 'schedule': specific datetime or recurring
  scheduleConfig: {
    type: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly']
    },
    dayOfWeek: Number, // 0-6 for weekly
    hour: Number,      // 0-23
    minute: Number     // 0-59
  },

  // For 'status_change': which status transition triggers
  fromStatus: {
    type: String,
    enum: ['active', 'pending', 'resolved', 'closed']
  },
  toStatus: {
    type: String,
    enum: ['active', 'pending', 'resolved', 'closed']
  },

  // For 'new_conversation': which channel triggers
  channel: {
    type: String,
    enum: ['all', 'whatsapp', 'telegram', 'messenger', 'instagram', 'livechat'],
    default: 'all'
  },

  // Content: direct text or template reference
  content: {
    type: String,
    default: null
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null
  },

  // Targeting: which channels this follow-up applies to
  channels: [{
    type: String,
    enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'livechat']
  }],

  // Follow-up chain settings
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  stopOnReply: {
    type: Boolean,
    default: true
  },

  // Priority for message queue (1=high, 2=normal, 3=low)
  priority: {
    type: Number,
    enum: [1, 2, 3],
    default: 2
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
FollowUpSchema.index({ user: 1, isActive: 1, triggerType: 1 });
FollowUpSchema.index({ user: 1, isActive: 1, channels: 1 });

module.exports = mongoose.model('FollowUp', FollowUpSchema);