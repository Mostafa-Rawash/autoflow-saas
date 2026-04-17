const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
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
  category: {
    type: String,
    enum: ['greeting', 'faq', 'promotion', 'reminder', 'follow_up', 'custom'],
    default: 'custom'
  },
  channel: {
    type: String,
    enum: ['all', 'whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms'],
    default: 'all'
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
    default: true
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

TemplateSchema.index({ user: 1, category: 1, channel: 1 });

module.exports = mongoose.model('Template', TemplateSchema);