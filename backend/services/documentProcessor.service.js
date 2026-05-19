const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const vectorStoreService = require('./vectorStore.service');

/**
 * Document Processor Service
 * Extracts text from uploaded files, splits into chunks,
 * generates embeddings via OpenAI, and stores in the vector DB.
 */
class DocumentProcessorService {

  /**
   * Process an uploaded document: extract text, chunk, embed, and store.
   */
  async processDocument(userId, documentId) {
    const document = await Document.findOne({ _id: documentId, user: userId });
    if (!document) throw new Error('Document not found');

    // Check for OpenAI API key early — embeddings require it
    if (!process.env.OPENAI_API_KEY) {
      document.status = 'failed';
      document.processingError = 'OpenAI API key not configured. Set OPENAI_API_KEY to enable document processing.';
      await document.save();
      return;
    }

    try {
      // Update status to processing
      document.status = 'processing';
      await document.save();

      // Step 1: Extract text from file
      const text = await this.extractText(document);

      if (!text || text.trim().length === 0) {
        document.status = 'failed';
        document.processingError = 'Could not extract text from document';
        await document.save();
        return;
      }

      // Step 2: Split into chunks
      const chunks = this.chunkText(text, {
        maxTokens: parseInt(process.env.MAX_CHUNK_TOKENS) || 500,
        overlap: parseInt(process.env.CHUNK_OVERLAP_TOKENS) || 50
      });

      // Step 3: Create chunk records
      const chunkDocs = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = await Chunk.create({
          document: document._id,
          user: userId,
          content: chunks[i],
          index: i,
          tokenCount: Math.ceil(chunks[i].length / 4), // rough estimate
          metadata: {
            documentName: document.originalName,
            fileType: document.fileType
          }
        });
        chunkDocs.push(chunk);
      }

      // Step 4: Generate embeddings
      const ragService = require('./rag.service');
      const batchSize = 20;
      let embeddedCount = 0;
      for (let i = 0; i < chunkDocs.length; i += batchSize) {
        const batch = chunkDocs.slice(i, i + batchSize);
        const texts = batch.map(c => c.content);

        try {
          const embeddings = await ragService.generateEmbeddings(texts);
          for (let j = 0; j < batch.length; j++) {
            if (embeddings[j]) {
              await vectorStoreService.addVector(batch[j]._id, embeddings[j], batch[j].metadata);
              embeddedCount++;
            }
          }
        } catch (err) {
          console.error(`[DocumentProcessor] Embedding batch failed: ${err.message}`);
          // If no API key, mark document as failed with clear message
          if (err.message.includes('OPENAI_API_KEY')) {
            document.status = 'failed';
            document.processingError = 'OpenAI API key not configured. Set OPENAI_API_KEY to enable embeddings.';
            await document.save();
            return;
          }
        }
      }

      // Step 5: Update document status
      document.status = 'ready';
      document.chunkCount = chunkDocs.length;
      await document.save();

      return { documentId: document._id, chunkCount: chunkDocs.length };
    } catch (error) {
      console.error('[DocumentProcessor] Error processing document:', error.message);
      document.status = 'failed';
      document.processingError = error.message;
      await document.save();
      throw error;
    }
  }

  /**
   * Extract text from a document based on file type.
   */
  async extractText(document) {
    const filePath = document.filePath;
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File not found on disk');
    }

    switch (document.fileType) {
      case 'txt':
      case 'md':
      case 'csv':
        return fs.readFileSync(filePath, 'utf-8');

      case 'pdf': {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        return data.text;
      }

      case 'docx': {
        const mammoth = require('mammoth');
        const result = await mammoth.extractText({ path: filePath });
        return result.value;
      }

      case 'html': {
        const raw = fs.readFileSync(filePath, 'utf-8');
        // Strip HTML tags
        return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }

      default:
        throw new Error(`Unsupported file type: ${document.fileType}`);
    }
  }

  /**
   * Split text into overlapping chunks.
   * Uses a simple character-based approximation for token counting.
   */
  chunkText(text, options = {}) {
    const { maxTokens = 500, overlap = 50 } = options;
    const charsPerToken = 4; // rough estimate for English/Arabic mixed text
    const maxChars = maxTokens * charsPerToken;
    const overlapChars = overlap * charsPerToken;

    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + maxChars, text.length);

      // Try to break at a sentence or paragraph boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        if (breakPoint > start + maxChars * 0.5) {
          end = breakPoint + 1;
        }
      }

      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      start = end - overlapChars;
      if (start >= text.length) break;
      if (start < 0) start = 0;
    }

    return chunks;
  }

  /**
   * Delete a document and all its chunks.
   */
  async deleteDocument(userId, documentId) {
    const document = await Document.findOne({ _id: documentId, user: userId });
    if (!document) throw new Error('Document not found');

    // Delete file from disk
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete all chunks
    await vectorStoreService.deleteByDocument(documentId);

    // Delete document record
    await Document.deleteOne({ _id: documentId });
  }
}

module.exports = new DocumentProcessorService();