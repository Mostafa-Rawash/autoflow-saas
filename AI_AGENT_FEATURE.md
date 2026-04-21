# 🤖 AI Agent & Knowledge Base Feature

## Overview

Two powerful new features for AutoFlow SaaS:

1. **Custom AI Agent** - Each user connects their own AI agent (OpenAI, Claude, Gemini, etc.)
2. **Knowledge Base (RAG)** - Users upload documents → vectorized with Qdrant → AI can query them

---

## 🎯 Use Cases

### Why Custom AI Agent?
- **Brand Voice**: User's AI responds in their brand tone
- **Specialized Knowledge**: Industry-specific responses
- **Cost Control**: User brings their own API key
- **Flexibility**: Choose GPT-4, Claude, Gemini, or local models

### Why Knowledge Base (RAG)?
- **Product Knowledge**: Upload catalogs, FAQs, manuals
- **Company Policies**: HR docs, refund policies, terms
- **Historical Data**: Past conversations, resolved tickets
- **Custom Training**: Fine-tune AI on business-specific content

### What Can Users Enable This For?
| Use Case | Description |
|----------|-------------|
| **Auto-Replies** | AI generates contextual responses using knowledge base |
| **Smart Routing** | Route conversations based on document classification |
| **FAQ Bot** | Auto-answer from uploaded FAQ documents |
| **Product Support** | Answer product questions from manuals/specs |
| **Policy Enforcement** | Check responses against company policies |
| **Training Mode** | New agents learn from historical conversations |

---

## 📊 Plan Limits

| Feature | Free | Basic | Standard | Premium |
|---------|------|-------|----------|---------|
| Custom AI Agent | ❌ | ✅ | ✅ | ✅ |
| Knowledge Base | ❌ | ❌ | ✅ | ✅ |
| Documents | 0 | 0 | 50 | Unlimited |
| Storage | 0 | 0 | 500MB | 5GB |
| Vector Queries/mo | 0 | 0 | 10,000 | Unlimited |
| AI Models | - | 1 | 3 | Unlimited |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend API   │     │   Qdrant        │
│   - Upload docs │────▶│   - Process     │────▶│   Vector DB     │
│   - Config AI   │     │   - Embed       │     │   Collections   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   AI Providers      │
                    │   - OpenAI          │
                    │   - Claude          │
                    │   - Gemini          │
                    │   - Local (Ollama)  │
                    └─────────────────────┘
```

---

## 📁 New Models

### AI Agent Configuration

```javascript
// backend/models/AIAgent.js
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
    // openai: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
    // anthropic: claude-3-opus, claude-3-sonnet, claude-3-haiku
    // google: gemini-1.5-pro, gemini-1.5-flash
  },
  
  // API Key (encrypted)
  apiKey: {
    encrypted: { type: String, required: true },
    iv: { type: String, required: true }
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
    collectionId: String, // Qdrant collection name
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

// Encrypt API key before saving
AIAgentSchema.pre('save', function(next) {
  if (this.isModified('apiKey.encrypted')) {
    // Encryption handled in service
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AIAgent', AIAgentSchema);
```

### Knowledge Base Document

```javascript
// backend/models/KnowledgeDocument.js
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
  filePath: String, // Storage path
  
  // Processing Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'indexed', 'failed'],
    default: 'pending'
  },
  
  // Content
  content: {
    raw: String, // Original text
    chunks: [{ // Split into chunks for embedding
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
    pointIds: [String], // Vector IDs in Qdrant
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
```

---

## 🔧 Backend Services

### AI Agent Service

```javascript
// backend/services/ai-agent.service.js
const axios = require('axios');
const crypto = require('crypto');
const AIAgent = require('../models/AIAgent');
const KnowledgeDocument = require('../models/KnowledgeDocument');

class AIAgentService {
  constructor() {
    this.providers = {
      openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
      },
      anthropic: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
      },
      google: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash']
      }
    };
  }
  
  // Encrypt API key
  encryptApiKey(key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      iv
    );
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') };
  }
  
  // Decrypt API key
  decryptApiKey(encrypted, iv) {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  // Create agent
  async createAgent(organizationId, config) {
    const { encrypted, iv } = this.encryptApiKey(config.apiKey);
    
    const agent = await AIAgent.create({
      organization: organizationId,
      name: config.name || 'AutoFlow AI',
      provider: config.provider,
      model: config.model,
      apiKey: { encrypted, iv },
      endpoint: config.endpoint,
      systemPrompt: config.systemPrompt,
      settings: config.settings,
      capabilities: config.capabilities
    });
    
    // Create Qdrant collection if knowledge base enabled
    if (config.knowledgeBase?.enabled) {
      await this.createKnowledgeCollection(agent._id, organizationId);
    }
    
    return agent;
  }
  
  // Generate response
  async generateResponse(agentId, messages, context = {}) {
    const agent = await AIAgent.findById(agentId);
    if (!agent || agent.status !== 'active') {
      throw new Error('Agent not available');
    }
    
    const apiKey = this.decryptApiKey(agent.apiKey.encrypted, agent.apiKey.iv);
    
    // Get knowledge base context if enabled
    let knowledgeContext = '';
    if (agent.knowledgeBase.enabled && context.query) {
      knowledgeContext = await this.queryKnowledgeBase(
        agent.organization,
        context.query,
        agent.model
      );
    }
    
    // Build messages
    const systemPrompt = agent.systemPrompt
      .replace('{{company_name}}', context.companyName || 'our company')
      .replace('{{knowledge_context}}', knowledgeContext);
    
    // Call provider
    const response = await this.callProvider(agent.provider, {
      apiKey,
      model: agent.model,
      endpoint: agent.endpoint,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      settings: agent.settings
    });
    
    // Update usage
    agent.usage.totalRequests += 1;
    agent.usage.totalTokens += response.usage?.total_tokens || 0;
    agent.usage.lastRequest = new Date();
    
    // Monthly tracking
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (agent.usage.monthStartDate < monthStart) {
      agent.usage.monthStartDate = monthStart;
      agent.usage.monthlyRequests = 0;
    }
    agent.usage.monthlyRequests += 1;
    
    await agent.save();
    
    return {
      content: response.content,
      model: agent.model,
      usage: response.usage
    };
  }
  
  // Call AI provider
  async callProvider(provider, config) {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(config);
      case 'anthropic':
        return this.callAnthropic(config);
      case 'google':
        return this.callGoogle(config);
      case 'ollama':
        return this.callOllama(config);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
  
  async callOpenAI({ apiKey, model, endpoint, messages, settings }) {
    const response = await axios.post(
      endpoint || 'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }
  
  async callAnthropic({ apiKey, model, messages, settings }) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: settings.maxTokens,
        system: messages.find(m => m.role === 'system')?.content,
        messages: messages.filter(m => m.role !== 'system')
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      content: response.data.content[0].text,
      usage: {
        input_tokens: response.data.usage.input_tokens,
        output_tokens: response.data.usage.output_tokens,
        total_tokens: response.data.usage.input_tokens + response.data.usage.output_tokens
      }
    };
  }
  
  async callGoogle({ apiKey, model, messages, settings }) {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
          topP: settings.topP
        },
        systemInstruction: {
          parts: [{ text: messages.find(m => m.role === 'system')?.content || '' }]
        }
      }
    );
    
    return {
      content: response.data.candidates[0].content.parts[0].text,
      usage: response.data.usageMetadata
    };
  }
  
  async callOllama({ endpoint, model, messages, settings }) {
    const response = await axios.post(
      `${endpoint || 'http://localhost:11434'}/api/chat`,
      {
        model,
        messages,
        options: {
          temperature: settings.temperature,
          num_predict: settings.maxTokens
        }
      }
    );
    
    return {
      content: response.data.message.content,
      usage: { total_tokens: response.data.eval_count + response.data.prompt_eval_count }
    };
  }
  
  // Query knowledge base (RAG)
  async queryKnowledgeBase(organizationId, query, model) {
    // Get embedding for query
    const queryEmbedding = await this.getEmbedding(query, model);
    
    // Search Qdrant
    const results = await this.searchVectors(organizationId, queryEmbedding, 5);
    
    if (results.length === 0) return '';
    
    // Build context from results
    const context = results
      .map((r, i) => `[Document ${i + 1}]: ${r.payload.text}`)
      .join('\n\n');
    
    return `\n\nRelevant knowledge:\n${context}\n\nUse this information to answer the user's question.`;
  }
  
  async getEmbedding(text, model) {
    // Use OpenAI embeddings by default
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-3-small'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data[0].embedding;
  }
  
  async searchVectors(organizationId, embedding, limit = 5) {
    // Qdrant search
    const response = await axios.post(
      `${process.env.QDRANT_URL}/collections/autoflow-${organizationId}/points/search`,
      {
        vector: embedding,
        limit,
        with_payload: true
      },
      {
        headers: {
          'api-key': process.env.QDRANT_API_KEY
        }
      }
    );
    
    return response.data.result;
  }
  
  // Create knowledge collection in Qdrant
  async createKnowledgeCollection(agentId, organizationId) {
    await axios.put(
      `${process.env.QDRANT_URL}/collections/autoflow-${organizationId}`,
      {
        vectors: {
          size: 1536, // OpenAI embedding dimension
          distance: 'Cosine'
        }
      },
      {
        headers: {
          'api-key': process.env.QDRANT_API_KEY
        }
      }
    );
    
    await AIAgent.findByIdAndUpdate(agentId, {
      'knowledgeBase.collectionId': `autoflow-${organizationId}`
    });
  }
}

module.exports = new AIAgentService();
```

### Knowledge Base Service

```javascript
// backend/services/knowledge-base.service.js
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');
const KnowledgeDocument = require('../models/KnowledgeDocument');
const aiAgentService = require('./ai-agent.service');

class KnowledgeBaseService {
  
  // Process uploaded document
  async processDocument(documentId) {
    const doc = await KnowledgeDocument.findById(documentId);
    if (!doc) throw new Error('Document not found');
    
    try {
      doc.status = 'processing';
      await doc.save();
      
      // Extract text
      const text = await this.extractText(doc.filePath, doc.mimeType);
      doc.content.raw = text;
      
      // Split into chunks
      const chunks = this.splitText(text, {
        chunkSize: 500,
        overlap: 50
      });
      doc.content.chunks = chunks;
      
      // Generate embeddings and store in Qdrant
      const pointIds = [];
      for (const chunk of chunks) {
        const embedding = await aiAgentService.getEmbedding(chunk.text);
        const pointId = uuidv4();
        
        await this.storeVector(doc.organization, {
          id: pointId,
          vector: embedding,
          payload: {
            documentId: doc._id.toString(),
            text: chunk.text,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            title: doc.title,
            category: doc.category
          }
        });
        
        pointIds.push(pointId);
      }
      
      // Update document
      doc.qdrant = {
        collectionId: `autoflow-${doc.organization}`,
        pointIds,
        indexedAt: new Date()
      };
      doc.embedding = {
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        vectorCount: pointIds.length
      };
      doc.status = 'indexed';
      await doc.save();
      
      return doc;
    } catch (error) {
      doc.status = 'failed';
      doc.lastError = error.message;
      await doc.save();
      throw error;
    }
  }
  
  // Extract text from file
  async extractText(filePath, mimeType) {
    const buffer = await fs.readFile(filePath);
    
    switch (mimeType) {
      case 'application/pdf':
        const pdfData = await pdf(buffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer });
        return docxResult.value;
      
      case 'text/plain':
      case 'text/markdown':
        return buffer.toString('utf8');
      
      case 'application/json':
        const json = JSON.parse(buffer.toString('utf8'));
        return JSON.stringify(json, null, 2);
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }
  
  // Split text into chunks
  splitText(text, options = {}) {
    const { chunkSize = 500, overlap = 50 } = options;
    const chunks = [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const para of paragraphs) {
      if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          chunkIndex: chunkIndex++
        });
        // Keep overlap
        currentChunk = currentChunk.slice(-overlap) + ' ' + para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        chunkIndex: chunkIndex
      });
    }
    
    return chunks;
  }
  
  // Store vector in Qdrant
  async storeVector(organizationId, point) {
    const response = await axios.put(
      `${process.env.QDRANT_URL}/collections/autoflow-${organizationId}/points`,
      { points: [point] },
      {
        headers: {
          'api-key': process.env.QDRANT_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }
  
  // Delete document and vectors
  async deleteDocument(documentId) {
    const doc = await KnowledgeDocument.findById(documentId);
    if (!doc) throw new Error('Document not found');
    
    // Delete vectors from Qdrant
    if (doc.qdrant.pointIds.length > 0) {
      await axios.post(
        `${process.env.QDRANT_URL}/collections/${doc.qdrant.collectionId}/points/delete`,
        { ids: doc.qdrant.pointIds },
        {
          headers: {
            'api-key': process.env.QDRANT_API_KEY
          }
        }
      );
    }
    
    // Delete file
    if (doc.filePath) {
      await fs.unlink(doc.filePath).catch(() => {});
    }
    
    // Delete document
    await KnowledgeDocument.findByIdAndDelete(documentId);
    
    return { success: true };
  }
  
  // Search documents
  async search(organizationId, query, options = {}) {
    const { limit = 5, category } = options;
    
    const embedding = await aiAgentService.getEmbedding(query);
    
    const filter = category ? {
      must: [
        { key: 'category', match: { value: category } }
      ]
    } : undefined;
    
    const response = await axios.post(
      `${process.env.QDRANT_URL}/collections/autoflow-${organizationId}/points/search`,
      {
        vector: embedding,
        limit,
        filter,
        with_payload: true
      },
      {
        headers: {
          'api-key': process.env.QDRANT_API_KEY
        }
      }
    );
    
    return response.data.result.map(r => ({
      score: r.score,
      documentId: r.payload.documentId,
      title: r.payload.title,
      text: r.payload.text,
      category: r.payload.category
    }));
  }
}

module.exports = new KnowledgeBaseService();
```

---

## 🛣️ API Routes

```javascript
// backend/routes/ai-agents.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, checkLimit } = require('../middleware/auth');
const aiAgentService = require('../services/ai-agent.service');
const knowledgeBaseService = require('../services/knowledge-base.service');
const AIAgent = require('../models/AIAgent');
const KnowledgeDocument = require('../models/KnowledgeDocument');

// Multer config
const upload = multer({
  dest: 'uploads/knowledge/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ========== AI Agent Routes ==========

// List agents
router.get('/', auth, async (req, res) => {
  const agents = await AIAgent.find({ organization: req.user.organization });
  res.json({ success: true, agents });
});

// Create agent
router.post('/', auth, async (req, res) => {
  try {
    const agent = await aiAgentService.createAgent(req.user.organization, req.body);
    res.status(201).json({ success: true, agent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get agent
router.get('/:id', auth, async (req, res) => {
  const agent = await AIAgent.findOne({
    _id: req.params.id,
    organization: req.user.organization
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ success: true, agent });
});

// Update agent
router.put('/:id', auth, async (req, res) => {
  const agent = await AIAgent.findOneAndUpdate(
    { _id: req.params.id, organization: req.user.organization },
    req.body,
    { new: true }
  );
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ success: true, agent });
});

// Test agent
router.post('/:id/test', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const response = await aiAgentService.generateResponse(
      req.params.id,
      [{ role: 'user', content: message }],
      { companyName: req.organization?.name }
    );
    res.json({ success: true, response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete agent
router.delete('/:id', auth, async (req, res) => {
  await AIAgent.findOneAndDelete({
    _id: req.params.id,
    organization: req.user.organization
  });
  res.json({ success: true });
});

// ========== Knowledge Base Routes ==========

// List documents
router.get('/:agentId/documents', auth, async (req, res) => {
  const documents = await KnowledgeDocument.find({
    organization: req.user.organization
  }).sort('-createdAt');
  res.json({ success: true, documents });
});

// Upload document
router.post('/:agentId/documents', auth, checkLimit('documents'), upload.single('file'), async (req, res) => {
  try {
    const doc = await KnowledgeDocument.create({
      organization: req.user.organization,
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      category: req.body.category || 'other',
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      createdBy: req.user._id
    });
    
    // Process in background
    knowledgeBaseService.processDocument(doc._id).catch(console.error);
    
    res.status(201).json({ success: true, document: doc, status: 'processing' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get document status
router.get('/:agentId/documents/:docId', auth, async (req, res) => {
  const doc = await KnowledgeDocument.findOne({
    _id: req.params.docId,
    organization: req.user.organization
  });
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json({ success: true, document: doc });
});

// Delete document
router.delete('/:agentId/documents/:docId', auth, async (req, res) => {
  await knowledgeBaseService.deleteDocument(req.params.docId);
  res.json({ success: true });
});

// Search knowledge base
router.post('/:agentId/search', auth, async (req, res) => {
  try {
    const { query, category, limit } = req.body;
    const results = await knowledgeBaseService.search(
      req.user.organization,
      query,
      { category, limit }
    );
    res.json({ success: true, results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🖥️ Frontend Components

### AI Agent Configuration Page

```javascript
// frontend/src/pages/AIAgentConfig.js
import React, { useState, useEffect } from 'react';
import { Settings, Bot, Database, Key, TestTube, Trash2 } from 'lucide-react';
import { aiAgentAPI } from '../api';
import toast from 'react-hot-toast';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Claude (Anthropic)', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { id: 'google', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3', 'mistral', 'codellama'] }
];

const AIAgentConfig = () => {
  const [agent, setAgent] = useState(null);
  const [config, setConfig] = useState({
    name: 'AutoFlow AI',
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: '',
    systemPrompt: '',
    knowledgeBase: { enabled: false },
    capabilities: {
      autoReply: false,
      summarize: true,
      classify: true
    }
  });
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgent();
  }, []);

  const loadAgent = async () => {
    try {
      const { data } = await aiAgentAPI.get();
      if (data.agents.length > 0) {
        setAgent(data.agents[0]);
        setConfig({ ...data.agents[0], apiKey: '' });
      }
    } catch (error) {
      console.error('Load agent error:', error);
    }
  };

  const saveAgent = async () => {
    setLoading(true);
    try {
      if (agent) {
        await aiAgentAPI.update(agent._id, config);
      } else {
        const { data } = await aiAgentAPI.create(config);
        setAgent(data.agent);
      }
      toast.success('AI Agent saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save');
    }
    setLoading(false);
  };

  const testAgent = async () => {
    if (!testMessage.trim()) return;
    setLoading(true);
    try {
      const { data } = await aiAgentAPI.test(agent._id, { message: testMessage });
      setTestResponse(data.response.content);
      toast.success('Test successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Test failed');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Agent Configuration</h1>
          <p className="text-slate-500">Connect your own AI agent and knowledge base</p>
        </div>
        <button onClick={saveAgent} disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Provider Selection */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Provider
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value, model: PROVIDERS.find(p => p.id === e.target.value)?.models[0] })}
              className="w-full input"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full input"
            >
              {PROVIDERS.find(p => p.id === config.provider)?.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="sk-..."
            className="w-full input"
          />
          <p className="text-xs text-slate-400 mt-1">Your key is encrypted and stored securely</p>
        </div>
      </div>

      {/* System Prompt */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Agent Behavior
        </h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">System Prompt</label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            rows={6}
            className="w-full input"
            placeholder="You are a helpful customer service assistant..."
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.capabilities.autoReply}
              onChange={(e) => setConfig({
                ...config,
                capabilities: { ...config.capabilities, autoReply: e.target.checked }
              })}
              className="checkbox"
            />
            <span className="text-sm">Auto-Reply</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.capabilities.summarize}
              onChange={(e) => setConfig({
                ...config,
                capabilities: { ...config.capabilities, summarize: e.target.checked }
              })}
              className="checkbox"
            />
            <span className="text-sm">Summarize</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.capabilities.classify}
              onChange={(e) => setConfig({
                ...config,
                capabilities: { ...config.capabilities, classify: e.target.checked }
              })}
              className="checkbox"
            />
            <span className="text-sm">Classify</span>
          </label>
        </div>
      </div>

      {/* Test Agent */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Test Agent
        </h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 input"
          />
          <button onClick={testAgent} disabled={!agent || loading} className="btn-primary">
            Test
          </button>
        </div>
        
        {testResponse && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Response:</p>
            <p className="text-slate-700">{testResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgentConfig;
```

---

## 🐳 Docker Compose (Qdrant)

```yaml
# docker-compose.yml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__API_KEY=${QDRANT_API_KEY}

volumes:
  qdrant_storage:
```

---

## 📦 Required Packages

```json
{
  "dependencies": {
    "qdrant-client": "^1.7.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Basic AI Agent (Week 1)
- [ ] AIAgent model
- [ ] Provider integration (OpenAI, Claude, Gemini)
- [ ] API key encryption
- [ ] Basic response generation
- [ ] Frontend config page

### Phase 2: Knowledge Base (Week 2)
- [ ] Qdrant setup
- [ ] Document upload
- [ ] Text extraction (PDF, DOCX, TXT)
- [ ] Chunking strategy
- [ ] Embedding generation

### Phase 3: RAG Integration (Week 3)
- [ ] Vector search
- [ ] Context injection
- [ ] Knowledge base management UI
- [ ] Document categories

### Phase 4: Advanced Features (Week 4)
- [ ] Auto-reply with AI
- [ ] Conversation summarization
- [ ] Sentiment analysis
- [ ] Multi-language support

---

## 💡 Usage Examples

### Auto-Reply with Knowledge Base

```javascript
// When a message arrives
const response = await aiAgentService.generateResponse(agentId, [
  { role: 'user', content: message.body }
], {
  query: message.body,
  companyName: organization.name
});

// Send AI-generated reply
await whatsappService.sendMessage(userId, message.from, response.content);
```

### Knowledge Base Search

```javascript
// User asks: "What's your refund policy?"
const results = await knowledgeBaseService.search(organizationId, "refund policy", {
  category: 'policy',
  limit: 3
});

// Returns relevant document chunks with scores
// [ { score: 0.85, text: "Our refund policy...", title: "Policies" } ]
```

---

## 🔒 Security Considerations

1. **API Keys**: Encrypted at rest with AES-256
2. **Document Access**: Organization-scoped in Qdrant
3. **Rate Limiting**: Per-agent request limits
4. **Data Retention**: Configurable document expiration
5. **Audit Logging**: All AI requests logged

---

## 📈 Success Metrics

| Metric | Target |
|--------|--------|
| Document upload success | > 95% |
| Vector search latency | < 200ms |
| AI response time | < 3s |
| Knowledge base hit rate | > 60% |
| User satisfaction | > 4.5/5 |

---

*Document Version: 1.0*
*Created: April 2026*