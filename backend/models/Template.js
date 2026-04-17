const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['greeting', 'faq', 'promotion', 'reminder', 'follow_up', 'custom'],
    default: 'custom',
    index: true
  },
  channel: {
    type: String,
    enum: ['all', 'whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms'],
    default: 'all',
    index: true
  },
  content: {
    text: {
      type: String,
      required: true
    },
    buttons: [{
      id: String,
      text: String,
      type: {
        type: String,
        enum: ['reply', 'url', 'call']
      },
      payload: String
    }],
    media: {
      url: String,
      type: String
    },
    variables: [String] // e.g., ['name', 'order_id']
  },
  triggers: [{
    type: {
      type: String,
      enum: ['keyword', 'intent', 'time', 'event']
    },
    value: String
  }],
  language: {
    type: String,
    enum: ['ar', 'en', 'mixed'],
    default: 'ar'
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
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
TemplateSchema.index({ user: 1, category: 1, channel: 1 });
TemplateSchema.index({ user: 1, isActive: 1, usageCount: -1 });
TemplateSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Template', TemplateSchema);