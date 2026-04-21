const mongoose = require('mongoose');

const KnowledgeDocumentSchema = new mongoose.Schema({
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true,
    index: true
  },
  
  // Document Info
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['faq', 'product', 'policy', 'manual', 'conversation', 'other'],
    default: 'other'
  },
  
  // File Info
  originalName: String,
  mimeType: String,
  fileSize: Number,
  filePath: String,
  
  // Processing Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'indexed', 'failed'],
    default: 'pending'
  },
  
  // Content
  content: {
    raw: String,
    chunks: [{
      text: String,
      pageNumber: Number,
      chunkIndex: Number
    }]
  },
  
  // Embedding Info
  embedding: {
    provider: { type: String, enum: ['openai', 'cohere', 'local'] },
    model: String,
    dimensions: Number,
    vectorCount: Number
  },
  
  // Qdrant Reference
  qdrant: {
    collectionId: String,
    pointIds: [String],
    indexedAt: Date
  },
  
  // Metadata
  metadata: {
    author: String,
    version: String,
    tags: [String],
    language: { type: String, default: 'ar' }
  },
  
  // Access Control
  accessLevel: {
    type: String,
    enum: ['organization', 'team', 'private'],
    default: 'organization'
  },
  
  // Usage Stats
  usage: {
    queryCount: { type: Number, default: 0 },
    lastQueried: Date
  },
  
  // Retention
  expiresAt: Date,
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for search
KnowledgeDocumentSchema.index({ title: 'text', 'content.raw': 'text' });

module.exports = mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);