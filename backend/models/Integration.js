const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'email', 'sms', 'api', 'shopify', 'woocommerce', 'zapier', 'hubspot', 'salesforce', 'google_sheets', 'google_calendar', 'calendly', 'slack', 'teams'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  config: {
    // WhatsApp Business API
    phoneNumberId: String,
    accessToken: String,
    businessAccountId: String,
    
    // Facebook/Messenger/Instagram
    pageId: String,
    pageAccessToken: String,
    appId: String,
    appSecret: String,
    
    // Telegram
    botToken: String,
    
    // Email (SMTP)
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPass: String,
    
    // SMS (Twilio)
    accountSid: String,
    authToken: String,
    fromNumber: String,
    
    // Generic API
    apiKey: String,
    apiSecret: String,
    webhookUrl: String,
    
    // Third-party integrations
    storeUrl: String,
    accessToken: String,
    
    // Custom fields
    custom: mongoose.Schema.Types.Mixed
  },
  webhooks: [{
    event: String,
    url: String,
    active: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'connected', 'disconnected', 'error'],
    default: 'pending'
  },
  lastSync: Date,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

IntegrationSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Integration', IntegrationSchema);