const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, query, param, validationResult } = require('express-validator');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const documentProcessor = require('../services/documentProcessor.service');
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

// Multer storage config for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html'
    ];
    const allowedExts = ['.pdf', '.txt', '.md', '.csv', '.docx', '.html'];

    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowedExts.join(', ')}`));
    }
  }
});

// Map MIME type to file type enum
const mimeTypeToType = (mimetype, originalName) => {
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  const typeMap = {
    pdf: 'pdf',
    txt: 'txt',
    md: 'md',
    csv: 'csv',
    docx: 'docx',
    html: 'html'
  };
  return typeMap[ext] || ext;
};

// @route   POST /api/documents/upload
// @desc    Upload a document and trigger processing
// @access  Private
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileType = mimeTypeToType(req.file.mimetype, req.file.originalname);
    const document = await Document.create({
      user: req.user.id,
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      status: 'uploading'
    });

    // Process document asynchronously
    documentProcessor.processDocument(req.user.id, document._id).then(result => {
      console.log(`[Documents] Document ${document._id} processed: ${result?.chunkCount} chunks`);
    }).catch(err => {
      console.error(`[Documents] Processing failed for ${document._id}:`, err.message);
    });

    res.status(201).json({
      success: true,
      document: {
        id: document._id,
        name: document.name,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (err) {
    console.error('[Documents] Upload error:', err.message);
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

// @route   GET /api/documents
// @desc    List user's documents
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['uploading', 'processing', 'ready', 'failed'])
], validate, auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(filter);

    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('[Documents] List error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/documents/stats
// @desc    Get document and chunk stats for user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await ragService.getStats(req.user.id);
    res.json({ success: true, stats });
  } catch (err) {
    console.error('[Documents] Stats error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/documents/:id
// @desc    Get document details
// @access  Private
router.get('/:id', [
  param('id').isMongoId()
], validate, auth, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const chunkCount = await Chunk.countDocuments({ document: document._id });

    res.json({
      success: true,
      document: {
        ...document.toObject(),
        chunkCount
      }
    });
  } catch (err) {
    console.error('[Documents] Get error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/documents/:id/chunks
// @desc    Get chunks for a document
// @access  Private
router.get('/:id/chunks', [
  param('id').isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const chunks = await Chunk.find({ document: document._id })
      .sort({ index: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-embedding');

    const total = await Chunk.countDocuments({ document: document._id });

    res.json({
      success: true,
      chunks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('[Documents] Chunks error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document and all its chunks
// @access  Private
router.delete('/:id', [
  param('id').isMongoId()
], validate, auth, async (req, res) => {
  try {
    await documentProcessor.deleteDocument(req.user.id, req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    console.error('[Documents] Delete error:', err.message);
    if (err.message === 'Document not found') {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/documents/:id/reprocess
// @desc    Reprocess a failed document
// @access  Private
router.post('/:id/reprocess', [
  param('id').isMongoId()
], validate, auth, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    if (document.status !== 'failed') {
      return res.status(400).json({ success: false, error: 'Only failed documents can be reprocessed' });
    }

    // Delete existing chunks
    await Chunk.deleteMany({ document: document._id });

    // Reset status and reprocess
    document.status = 'uploading';
    document.processingError = undefined;
    await document.save();

    documentProcessor.processDocument(req.user.id, document._id).then(result => {
      console.log(`[Documents] Reprocessed ${document._id}: ${result?.chunkCount} chunks`);
    }).catch(err => {
      console.error(`[Documents] Reprocess failed for ${document._id}:`, err.message);
    });

    res.json({ success: true, message: 'Document reprocessing started' });
  } catch (err) {
    console.error('[Documents] Reprocess error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;