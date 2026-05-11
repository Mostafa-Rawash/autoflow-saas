const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['frontend', 'backend', 'api', 'auth', 'whatsapp', 'telegram', 'system'],
    default: 'system',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  error: {
    name: String,
    message: String,
    code: String,
    stack: String
  },
  request: {
    method: String,
    url: String,
    ip: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ source: 1, timestamp: -1 });
LogSchema.index({ resolved: 1, level: 1 });
LogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Log', LogSchema);