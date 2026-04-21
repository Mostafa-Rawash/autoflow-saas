const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial'],
    default: 'trial'
  },
  settings: {
    language: { type: String, enum: ['ar', 'en'], default: 'ar' },
    timezone: { type: String, default: 'Africa/Cairo' }
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

OrganizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Organization', OrganizationSchema);
