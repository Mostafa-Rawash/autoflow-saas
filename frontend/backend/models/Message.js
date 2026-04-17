const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['contact', 'agent', 'bot'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'button', 'list'],
    default: 'text'
  },
  media: {
    url: String,
    mimeType: String,
    size: Number,
    filename: String
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
  metadata: {
    quotedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  externalId: String, // Message ID from external platform
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
MessageSchema.index({ organization: 1, conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);