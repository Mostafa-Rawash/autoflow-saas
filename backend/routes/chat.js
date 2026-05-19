const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const ragService = require('../services/rag.service');
const { auth } = require('../middleware/auth');

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// @route   POST /api/chat
// @desc    Ask a question using RAG (search + generate)
// @access  Private
router.post('/', [
  body('query').notEmpty().withMessage('Query is required').trim().isLength({ max: 2000 }),
  body('topK').optional().isInt({ min: 1, max: 20 }).toInt(),
  body('documentIds').optional().isArray()
], validate, auth, async (req, res) => {
  try {
    const { query, topK = 5, documentIds } = req.body;

    // If specific documents are requested, filter by them
    let searchResults;
    if (documentIds && documentIds.length > 0) {
      const queryEmbedding = await ragService.generateEmbedding(query);
      const vectorStoreService = require('../services/vectorStore.service');
      const filter = { user: req.user.id };
      // Only search within specified documents
      const mongoose = require('mongoose');
      filter.document = { $in: documentIds.map(id => new mongoose.Types.ObjectId(id)) };
      searchResults = await vectorStoreService.search(queryEmbedding, topK, filter);
      searchResults = searchResults.map(chunk => ({
        content: chunk.content,
        score: chunk.score,
        documentId: chunk.document,
        chunkIndex: chunk.index,
        metadata: chunk.metadata
      }));
    } else {
      searchResults = await ragService.search(req.user.id, query, topK);
    }

    if (searchResults.length === 0) {
      return res.json({
        success: true,
        answer: 'لم أتمكن من العثور على معلومات ذات صلة في المستندات المتاحة. يرجى رفع مستندات تحتوي على المعلومات المطلوبة.',
        sources: [],
        tokensUsed: 0
      });
    }

    const result = await ragService.generateAnswer(req.user.id, query, searchResults);

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[Chat] Error:', err.message);
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not configured. Please set OPENAI_API_KEY.',
        code: 'AI_NOT_CONFIGURED'
      });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/chat/search
// @desc    Search for relevant chunks without generating an answer
// @access  Private
router.post('/search', [
  body('query').notEmpty().withMessage('Query is required').trim().isLength({ max: 2000 }),
  body('topK').optional().isInt({ min: 1, max: 20 }).toInt()
], validate, auth, async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    const results = await ragService.search(req.user.id, query, topK);

    res.json({
      success: true,
      results: results.map(r => ({
        content: r.content,
        score: r.score,
        documentId: r.documentId,
        chunkIndex: r.chunkIndex,
        metadata: r.metadata
      }))
    });
  } catch (err) {
    console.error('[Chat] Search error:', err.message);
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not configured. Please set OPENAI_API_KEY.',
        code: 'AI_NOT_CONFIGURED'
      });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/chat/ask
// @desc    Full RAG pipeline: search + generate (alias for /api/chat)
// @access  Private
router.post('/ask', [
  body('query').notEmpty().withMessage('Query is required').trim().isLength({ max: 2000 }),
  body('topK').optional().isInt({ min: 1, max: 20 }).toInt()
], validate, auth, async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    const result = await ragService.ask(req.user.id, query, topK);

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[Chat] Ask error:', err.message);
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not configured. Please set OPENAI_API_KEY.',
        code: 'AI_NOT_CONFIGURED'
      });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;