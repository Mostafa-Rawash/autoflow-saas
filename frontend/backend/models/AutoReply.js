const mongoose = require('mongoose');

const autoReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
    required: true
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
  channel: {
    type: String,
    default: 'whatsapp'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
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

autoReplySchema.methods.matches = function(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of this.keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    switch (this.matchType) {
      case 'exact':
        if (lowerMessage === lowerKeyword) return true;
        break;
      case 'contains':
        if (lowerMessage.includes(lowerKeyword)) return true;
        break;
      case 'startsWith':
        if (lowerMessage.startsWith(lowerKeyword)) return true;
        break;
      case 'regex':
        try {
          const regex = new RegExp(keyword, 'i');
          if (regex.test(message)) return true;
        } catch (e) {
          console.error('Invalid regex:', keyword);
        }
        break;
    }
  }
  return false;
};

autoReplySchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

autoReplySchema.statics.findMatching = async function(userId, message) {
  const rules = await this.find({ 
    user: userId, 
    isActive: true,
    channel: 'whatsapp'
  }).sort({ priority: -1, usageCount: 1 });
  
  for (const rule of rules) {
    if (rule.matches(message)) {
      return rule;
    }
  }
  return null;
};

module.exports = mongoose.model('AutoReply', autoReplySchema);