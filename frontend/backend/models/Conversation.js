const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms', 'api'],
    required: true
  },
  contact: {
    name: String,
    phone: String,
    email: String,
    avatar: String,
    externalId: String // ID from external platform
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'resolved', 'closed'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      type: String,
      enum: ['contact', 'agent', 'bot']
    }
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  metadata: {
    source: String, // e.g., 'landing_page', 'qr_code'
    campaign: String,
    referrer: String
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ConversationSchema.index({ user: 1, channel: 1, 'contact.externalId': 1 });
ConversationSchema.index({ user: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);