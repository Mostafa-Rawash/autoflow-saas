const mongoose = require('mongoose');

const AIAgentSchema = new mongoose.Schema({
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true,
    index: true
  },
  
  // Agent Identity
  name: { type: String, default: 'AutoFlow AI' },
  description: String,
  avatar: String,
  
  // Provider Configuration
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'google', 'azure', 'ollama', 'custom'],
    required: true
  },
  
  model: {
    type: String,
    default: 'gpt-4o-mini'
  },
  
  // API Key (encrypted)
  apiKey: {
    encrypted: { type: String },
    iv: { type: String }
  },
  
  // API Endpoint (for custom/ollama)
  endpoint: String,
  
  // Agent Behavior
  systemPrompt: {
    type: String,
    default: `You are a helpful customer service assistant for {{company_name}}.
Use the provided knowledge base to answer questions accurately.
Be friendly, professional, and helpful.
If you don't know something, say so honestly.`
  },
  
  // Response Settings
  settings: {
    temperature: { type: Number, default: 0.7, min: 0, max: 2 },
    maxTokens: { type: Number, default: 1000 },
    topP: { type: Number, default: 1 },
    frequencyPenalty: { type: Number, default: 0 },
    presencePenalty: { type: Number, default: 0 }
  },
  
  // Knowledge Base Integration
  knowledgeBase: {
    enabled: { type: Boolean, default: false },
    collectionId: String,
    documentCount: { type: Number, default: 0 },
    lastIndexed: Date
  },
  
  // Capabilities
  capabilities: {
    autoReply: { type: Boolean, default: false },
    summarize: { type: Boolean, default: true },
    translate: { type: Boolean, default: false },
    classify: { type: Boolean, default: true },
    sentimentAnalysis: { type: Boolean, default: true }
  },
  
  // Usage Tracking
  usage: {
    totalRequests: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    lastRequest: Date,
    monthlyRequests: { type: Number, default: 0 },
    monthStartDate: { type: Date, default: Date.now }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'rate_limited'],
    default: 'active'
  },
  lastError: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AIAgentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AIAgent', AIAgentSchema);