const mongoose = require('mongoose');

const FollowUpExecutionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  followUp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FollowUp',
    required: true,
    index: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: ['pending', 'sent', 'cancelled', 'failed'],
    default: 'pending'
  },
  attemptNumber: {
    type: Number,
    default: 1
  },

  scheduledFor: {
    type: Date,
    index: true
  },
  sentAt: {
    type: Date
  },

  // The resolved message content after variable substitution
  resolvedContent: {
    type: String
  },

  // Reference to the MessageQueue item for cancellation
  queueItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageQueue'
  },

  // Whether the contact replied before this execution fired
  contactRepliedBefore: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
FollowUpExecutionSchema.index({ user: 1, followUp: 1, conversation: 1 });
FollowUpExecutionSchema.index({ user: 1, status: 1, scheduledFor: 1 });
FollowUpExecutionSchema.index({ followUp: 1, conversation: 1, status: 1 });

module.exports = mongoose.model('FollowUpExecution', FollowUpExecutionSchema);