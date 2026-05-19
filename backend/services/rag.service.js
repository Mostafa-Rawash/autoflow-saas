const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const vectorStoreService = require('./vectorStore.service');

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles embedding generation, semantic search, and AI-powered answers.
 */
class RAGService {
  constructor() {
    this.openai = null;
  }

  /**
   * Lazy-load OpenAI client (requires OPENAI_API_KEY)
   */
  getOpenAIClient() {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured. Set it in your .env file.');
      }
      const { OpenAI } = require('openai');
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * Generate an embedding for a single text string.
   */
  async generateEmbedding(text) {
    const client = this.getOpenAIClient();
    const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

    const response = await client.embeddings.create({
      model,
      input: text.replace(/\n/g, ' '),
    });

    return response.data[0].embedding;
  }

  /**
   * Generate embeddings for multiple texts in a single API call.
   */
  async generateEmbeddings(texts) {
    const client = this.getOpenAIClient();
    const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

    const response = await client.embeddings.create({
      model,
      input: texts.map(t => t.replace(/\n/g, ' ')),
    });

    return response.data.map(item => item.embedding);
  }

  /**
   * Search for relevant chunks given a query string.
   * Returns top K chunks sorted by relevance.
   */
  async search(userId, query, topK = 5) {
    const queryEmbedding = await this.generateEmbedding(query);
    const results = await vectorStoreService.search(queryEmbedding, topK, { user: userId });

    return results.map(chunk => ({
      content: chunk.content,
      score: chunk.score,
      documentId: chunk.document,
      chunkIndex: chunk.index,
      metadata: chunk.metadata
    }));
  }

  /**
   * Generate an AI answer using retrieved context.
   */
  async generateAnswer(userId, query, contextChunks = []) {
    const client = this.getOpenAIClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // Build context from retrieved chunks
    const context = contextChunks.map((chunk, i) =>
      `[المصدر ${i + 1}]: ${chunk.content}`
    ).join('\n\n');

    const systemPrompt = `أنت مساعد ذكي لنظام AutoFlow. أجب على أسئلة المستخدم بناءً على السياق المقدم فقط.
إذا لم تجد الإجابة في السياق، قل أنك لا تعرف. أشر إلى المصادر التي استخدمتها.
أجب باللغة العربية ما لم يطلب المستخدم لغة أخرى.

السياق:
${context || 'لا يوجد سياق متاح.'}`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const answer = response.choices[0].message.content;

    return {
      answer,
      sources: contextChunks.map(chunk => ({
        content: chunk.content.substring(0, 200) + '...',
        score: chunk.score,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex
      })),
      tokensUsed: response.usage?.total_tokens || 0,
      model: model
    };
  }

  /**
   * Full RAG pipeline: search + generate answer.
   */
  async ask(userId, query, topK = 5) {
    // Step 1: Search for relevant chunks
    const searchResults = await this.search(userId, query, topK);

    // Step 2: Generate answer with context
    const answer = await this.generateAnswer(userId, query, searchResults);

    return answer;
  }

  /**
   * Generate an AI auto-reply for channel messages.
   * Uses a shorter, more conversational prompt suitable for chat.
   */
  async generateAutoReply(userId, query, options = {}) {
    const { tone = 'professional', includeSources = false, topK = 3 } = options;

    // Step 1: Search for relevant chunks
    let searchResults = [];
    try {
      searchResults = await this.search(userId, query, topK);
    } catch (err) {
      console.error('[RAG] Auto-reply search failed:', err.message);
    }

    // Step 2: If no context found, try a general response without RAG
    if (searchResults.length === 0) {
      return this._generateGeneralAutoReply(query, tone);
    }

    // Step 3: Generate answer with context
    const client = this.getOpenAIClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const context = searchResults.map((chunk, i) =>
      `[المصدر ${i + 1}]: ${chunk.content}`
    ).join('\n\n');

    const toneInstructions = {
      professional: 'أجب بشكل مهني ورسمي',
      friendly: 'أجب بشكل ودود وغير رسمي',
      casual: 'أجب بشكل عفوي وبسيط'
    };

    const systemPrompt = `أنت مساعد خدمة عملاء ذكي لنظام AutoFlow. ${toneInstructions[tone] || toneInstructions.professional}.
أجب بناءً على السياق المقدم فقط. إذا لم تجد إجابة كافية في السياق، اعتذر بأدب واقترح التواصل مع فريق الدعم.
أجب باللغة العربية ما لم يكتب العميل بلغة أخرى.
كن مختصراً — الإجابة للرسائل النصية يجب أن تكون قصيرة ومفيدة (أقل من 3 أسطر).

السياق:
${context}`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.4,
      max_tokens: 300,
    });

    const answer = response.choices[0].message.content;

    return {
      answer,
      sources: includeSources ? searchResults.map(chunk => ({
        content: chunk.content.substring(0, 200) + '...',
        score: chunk.score,
        documentId: chunk.documentId
      })) : [],
      tokensUsed: response.usage?.total_tokens || 0,
      model
    };
  }

  /**
   * Generate a general auto-reply when no knowledge base context is available.
   */
  async _generateGeneralAutoReply(query, tone = 'professional') {
    const client = this.getOpenAIClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const toneInstructions = {
      professional: 'بشكل مهني ورسمي',
      friendly: 'بشكل ودود وغير رسمي',
      casual: 'بشكل عفوي وبسيط'
    };

    const systemPrompt = `أنت مساعد خدمة عملاء لنظام AutoFlow. رد ${toneInstructions[tone] || toneInstructions.professional}.
لا تملك معلومات محددة من قاعدة المعرفة. اعتذر بأدب واقترح على العميل إعادة صياغة سؤاله أو التواصل مع فريق الدعم.
كن مختصراً (أقل من جملتين). أجب باللغة العربية ما لم يكتب العميل بلغة أخرى.`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    return {
      answer: response.choices[0].message.content,
      sources: [],
      tokensUsed: response.usage?.total_tokens || 0,
      model
    };
  }

  /**
   * Get document stats for a user.
   */
  async getStats(userId) {
    const totalDocs = await Document.countDocuments({ user: userId });
    const readyDocs = await Document.countDocuments({ user: userId, status: 'ready' });
    const processingDocs = await Document.countDocuments({ user: userId, status: 'processing' });
    const failedDocs = await Document.countDocuments({ user: userId, status: 'failed' });
    const chunkStats = await vectorStoreService.getStats(userId);

    return {
      documents: { total: totalDocs, ready: readyDocs, processing: processingDocs, failed: failedDocs },
      chunks: chunkStats
    };
  }
}

module.exports = new RAGService();