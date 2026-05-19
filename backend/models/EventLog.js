const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: String,
    required: true,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'telegram', 'instagram', 'messenger', 'livechat', 'email', 'sms', 'web', 'api', 'system'],
    default: 'system'
  },
  consumedBy: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EventLogSchema.index({ user: 1, event: 1 });
EventLogSchema.index({ user: 1, createdAt: -1 });
EventLogSchema.index({ user: 1, channel: 1 });

module.exports = mongoose.model('EventLog', EventLogSchema);