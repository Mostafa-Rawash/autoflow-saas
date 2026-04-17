const mongoose = require('mongoose');

const TeamInvitationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent', 'viewer'],
    default: 'agent'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: Date,
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
TeamInvitationSchema.index({ team: 1, status: 1 });
TeamInvitationSchema.index({ token: 1 });
TeamInvitationSchema.index({ email: 1, team: 1 });

// Check if invitation is expired
TeamInvitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Generate invitation token
TeamInvitationSchema.statics.generateToken = function() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('TeamInvitation', TeamInvitationSchema);