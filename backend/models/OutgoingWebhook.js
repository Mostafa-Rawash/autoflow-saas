const mongoose = require('mongoose');

const OutgoingWebhookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    enum: ['POST', 'PUT', 'PATCH'],
    default: 'POST'
  },
  events: [{
    type: String,
    enum: [
      'message.received',
      'message.sent',
      'message.failed',
      'conversation.created',
      'conversation.updated',
      'conversation.status_changed',
      'conversation.assigned',
      'conversation.resolved',
      'contact.created',
      'contact.updated',
      'channel.connected',
      'channel.disconnected',
      'autoreply.matched',
      'ai.response_sent',
      'workflow.triggered',
      'csat.submitted'
    ]
  }],
  headers: {
    type: Map,
    of: String,
    default: {}
  },
  secret: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  retryCount: {
    type: Number,
    default: 3,
    min: 0,
    max: 5
  },
  retryDelayMs: {
    type: Number,
    default: 1000,
    min: 500,
    max: 10000
  },
  stats: {
    totalDelivered: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 },
    lastDeliveredAt: Date,
    lastFailedAt: Date
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

OutgoingWebhookSchema.index({ user: 1, isActive: 1 });
OutgoingWebhookSchema.index({ user: 1, events: 1 });

module.exports = mongoose.model('OutgoingWebhook', OutgoingWebhookSchema);