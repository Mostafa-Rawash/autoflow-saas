const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  embedding: {
    type: [Number],
    default: null
  },
  tokenCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ChunkSchema.index({ document: 1, index: 1 });
ChunkSchema.index({ user: 1 });

module.exports = mongoose.model('Chunk', ChunkSchema);