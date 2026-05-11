const mongoose = require('mongoose');

const AutoReplySchema = new mongoose.Schema({
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
  keywords: [{
    type: String,
    trim: true
  }],
  response: {
    type: String,
    required: true
  },
  matchType: {
    type: String,
    enum: ['exact', 'contains', 'startsWith', 'regex'],
    default: 'contains'
  },
  priority: {
    type: Number,
    default: 0
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

AutoReplySchema.index({ user: 1, isActive: 1, priority: -1 });
AutoReplySchema.index({ user: 1, createdAt: -1 });

AutoReplySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AutoReply', AutoReplySchema);