const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  // Log Level
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info'
  },
  
  // Message
  message: {
    type: String,
    required: true
  },
  
  // Source
  source: {
    type: String,
    enum: ['frontend', 'backend', 'whatsapp', 'api', 'auth', 'database', 'system'],
    default: 'system'
  },
  
  // Error details (for errors)
  error: {
    name: String,
    message: String,
    stack: String,
    code: String
  },
  
  // Request info
  request: {
    method: String,
    url: String,
    body: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String
  },
  
  // Response info
  response: {
    statusCode: Number,
    body: mongoose.Schema.Types.Mixed
  },
  
  // User info
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    name: String,
    role: String
  },
  
  // Additional metadata
  metadata: mongoose.Schema.Types.Mixed,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Resolved status
  resolved: {
    type: Boolean,
    default: false
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: Date
});

// Indexes for efficient querying
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ source: 1, timestamp: -1 });
LogSchema.index({ resolved: 1, timestamp: -1 });
LogSchema.index({ 'user.id': 1 });

// Static method to create log
LogSchema.statics.log = async function(level, message, data = {}) {
  try {
    const logEntry = new this({
      level,
      message,
      ...data
    });
    await logEntry.save();
    return logEntry;
  } catch (err) {
    console.error('Failed to save log:', err);
    return null;
  }
};

// Static methods for convenience
LogSchema.statics.error = function(message, data = {}) {
  return this.log('error', message, { ...data, level: 'error' });
};

LogSchema.statics.warn = function(message, data = {}) {
  return this.log('warn', message, { ...data, level: 'warn' });
};

LogSchema.statics.info = function(message, data = {}) {
  return this.log('info', message, { ...data, level: 'info' });
};

LogSchema.statics.debug = function(message, data = {}) {
  return this.log('debug', message, { ...data, level: 'debug' });
};

module.exports = mongoose.model('Log', LogSchema);