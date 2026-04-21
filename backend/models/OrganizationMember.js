const mongoose = require('mongoose');

const OrganizationMemberSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'agent', 'viewer'],
    default: 'agent'
  },
  status: {
    type: String,
    enum: ['active', 'invited', 'removed'],
    default: 'active'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

OrganizationMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

OrganizationMemberSchema.index({ organization: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('OrganizationMember', OrganizationMemberSchema);
