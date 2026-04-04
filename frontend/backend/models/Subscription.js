const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
    default: 'trialing'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndsAt: Date,
  cancelledAt: Date,
  
  // Pricing
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EGP'
  },
  discount: {
    code: String,
    percentage: Number,
    amount: Number
  },
  
  // Payment Info
  paymentMethod: {
    type: String,
    enum: ['card', 'wallet', 'bank_transfer', 'fawry', 'vodafone_cash'],
  },
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  
  // Usage tracking
  usage: {
    conversations: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    teamMembers: { type: Number, default: 1 },
    templates: { type: Number, default: 0 },
    channels: { type: Number, default: 0 }
  },
  
  // Limits based on plan
  limits: {
    conversations: { type: Number, default: 100 },
    messages: { type: Number, default: 1000 },
    teamMembers: { type: Number, default: 2 },
    templates: { type: Number, default: 10 },
    channels: { type: Number, default: 1 }
  },
  
  // Invoices
  invoices: [{
    invoiceNumber: String,
    amount: Number,
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed']
    },
    paidAt: Date,
    pdf: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update limits based on plan
SubscriptionSchema.pre('save', function(next) {
  const planLimits = {
    free: { conversations: 100, messages: 1000, teamMembers: 2, templates: 10, channels: 1 },
    basic: { conversations: 1000, messages: 10000, teamMembers: 5, templates: 50, channels: 3 },
    standard: { conversations: 5000, messages: 50000, teamMembers: 10, templates: 100, channels: 5 },
    premium: { conversations: Infinity, messages: Infinity, teamMembers: Infinity, templates: Infinity, channels: 8 }
  };
  
  this.limits = planLimits[this.plan];
  this.updatedAt = Date.now();
  next();
});

// Check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

// Check if trial is expired
SubscriptionSchema.methods.isTrialExpired = function() {
  if (!this.trialEndsAt) return false;
  return new Date() > this.trialEndsAt;
};

// Check if subscription has exceeded limits
SubscriptionSchema.methods.hasExceededLimit = function(resource) {
  return this.usage[resource] >= this.limits[resource];
};

// Get usage percentage
SubscriptionSchema.methods.getUsagePercentage = function(resource) {
  if (this.limits[resource] === Infinity) return 0;
  return Math.round((this.usage[resource] / this.limits[resource]) * 100);
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);