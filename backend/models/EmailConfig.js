const mongoose = require('mongoose');

const EmailConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  host: {
    type: String,
    required: true,
    trim: true
  },
  port: {
    type: Number,
    default: 587
  },
  secure: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fromName: {
    type: String,
    trim: true,
    default: 'AutoFlow Support'
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  imapHost: {
    type: String,
    trim: true
  },
  imapPort: {
    type: Number,
    default: 993
  },
  imapSecure: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastSyncAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

EmailConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EmailConfig', EmailConfigSchema);