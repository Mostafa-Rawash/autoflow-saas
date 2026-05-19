const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
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
  email: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  phone: [{
    type: String,
    trim: true
  }],
  company: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  source: {
    type: String,
    enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'email', 'livechat', 'web', 'manual'],
    default: 'manual'
  },
  externalIds: {
    whatsapp: { type: String, sparse: true },
    telegram: { type: String, sparse: true },
    messenger: { type: String, sparse: true },
    instagram: { type: String, sparse: true },
    email: { type: String, sparse: true }
  },
  lastContactAt: {
    type: Date,
    default: null
  },
  conversationCount: {
    type: Number,
    default: 0
  },
  satisfactionScore: {
    type: Number,
    default: null,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
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

ContactSchema.index({ user: 1, email: 1 });
ContactSchema.index({ user: 1, phone: 1 });
ContactSchema.index({ user: 1, company: 1 });
ContactSchema.index({ user: 1, tags: 1 });

ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);