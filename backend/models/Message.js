const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['contact', 'agent', 'bot'],
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
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
    default: 'sent',
    index: true
  },
  externalId: String, // Message ID from external platform
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient queries
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ conversation: 1, sender: 1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ externalId: 1 });

module.exports = mongoose.model('Message', MessageSchema);