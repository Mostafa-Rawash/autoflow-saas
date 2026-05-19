const mongoose = require('mongoose');

const LiveChatConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'تحدث معنا'
  },
  subtitle: {
    type: String,
    default: 'نحن هنا لمساعدتك'
  },
  welcomeMessage: {
    type: String,
    default: 'مرحباً! كيف يمكننا مساعدتك اليوم؟'
  },
  offlineMessage: {
    type: String,
    default: 'نحن خارج ساعات العمل حالياً. سنرد عليك في أقرب وقت ممكن.'
  },
  primaryColor: {
    type: String,
    default: '#14b8a6'
  },
  position: {
    type: String,
    enum: ['bottom-right', 'bottom-left'],
    default: 'bottom-right'
  },
  avatar: String,
  requireUserInfo: {
    type: Boolean,
    default: true
  },
  preChatForm: {
    enabled: { type: Boolean, default: true },
    fields: [{
      name: String,
      label: String,
      type: { type: String, enum: ['text', 'email', 'phone', 'dropdown'], default: 'text' },
      required: { type: Boolean, default: true },
      options: [String]
    }]
  },
  operatingHours: {
    enabled: { type: Boolean, default: false },
    timezone: { type: String, default: 'Africa/Cairo' },
    schedule: [{
      day: { type: Number, min: 0, max: 6 },
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: true }
    }]
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  autoAssignment: {
    type: Boolean,
    default: true
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

LiveChatConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LiveChatConfig', LiveChatConfigSchema);