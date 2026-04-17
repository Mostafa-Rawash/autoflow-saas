const mongoose = require('mongoose');

const ChannelConnectionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms', 'api'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'connecting', 'needs_config', 'error'],
    default: 'disconnected'
  },
  displayName: String,
  config: mongoose.Schema.Types.Mixed,
  connectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  connectedAt: Date,
  lastSyncAt: Date,
  lastError: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ChannelConnectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

ChannelConnectionSchema.index({ organization: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('ChannelConnection', ChannelConnectionSchema);
