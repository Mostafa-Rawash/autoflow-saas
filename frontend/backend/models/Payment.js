const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EGP'
  },
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paymob', 'fawry', 'vodafone_cash', 'bank_transfer', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    sparse: true,
    unique: true
  },
  paymobOrderId: String,
  paymobPaymentKey: String,
  fawryRefNumber: String,
  
  billingInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    country: { type: String, default: 'Egypt' }
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String
  },
  
  failureReason: String,
  refundReason: String,
  refundAmount: Number,
  
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.methods.markCompleted = async function(transactionId) {
  this.status = 'completed';
  this.transactionId = transactionId;
  this.completedAt = new Date();
  await this.save();
};

paymentSchema.methods.markFailed = async function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failedAt = new Date();
  await this.save();
};

paymentSchema.methods.markRefunded = async function(amount, reason) {
  this.status = 'refunded';
  this.refundAmount = amount || this.amount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  await this.save();
};

// Pricing configuration
const pricing = {
  starter: { monthly: 2000, yearly: 20000 },
  professional: { monthly: 4000, yearly: 40000 },
  enterprise: { monthly: 8000, yearly: 80000 }
};

paymentSchema.statics.calculateAmount = function(plan, billingCycle) {
  return pricing[plan]?.[billingCycle] || 0;
};

paymentSchema.statics.getPricing = function() {
  return pricing;
};

module.exports = mongoose.model('Payment', paymentSchema);