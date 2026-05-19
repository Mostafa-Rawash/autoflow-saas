const Chunk = require('../models/Chunk');

/**
 * Vector Store Service
 * Stores and searches embeddings using MongoDB.
 * Initial version uses JS cosine similarity (suitable for <10K chunks).
 * Production upgrade path: Atlas Vector Search or Qdrant.
 */
class VectorStoreService {

  /**
   * Store an embedding for a chunk.
   */
  async addVector(chunkId, embedding, metadata = {}) {
    await Chunk.updateOne(
      { _id: chunkId },
      { $set: { embedding, metadata: { ...metadata, chunkId } } }
    );
    return chunkId;
  }

  /**
   * Store embeddings for multiple chunks in bulk.
   */
  async addVectors(chunks) {
    const ops = chunks.map(({ chunkId, embedding, metadata }) => ({
      updateOne: {
        filter: { _id: chunkId },
        update: { $set: { embedding, metadata: metadata || {} } }
      }
    }));
    if (ops.length > 0) {
      await Chunk.bulkWrite(ops);
    }
    return chunks.length;
  }

  /**
   * Search for similar chunks using cosine similarity.
   * @param {number[]} queryEmbedding - The embedding vector to search against
   * @param {number} topK - Number of results to return
   * @param {object} filter - MongoDB filter (e.g., { user: userId })
   * @returns {Array} - Top K chunks sorted by similarity
   */
  async search(queryEmbedding, topK = 5, filter = {}) {
    // Fetch all chunks with embeddings for the user
    const chunks = await Chunk.find({
      ...filter,
      embedding: { $ne: null, $exists: true }
    }).lean();

    if (chunks.length === 0) return [];

    // Compute cosine similarity for each chunk
    const scored = chunks.map(chunk => ({
      ...chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by score descending and return top K
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Delete all chunks belonging to a document.
   */
  async deleteByDocument(documentId) {
    await Chunk.deleteMany({ document: documentId });
  }

  /**
   * Compute cosine similarity between two vectors.
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Get count of embedded chunks for a user.
   */
  async getStats(userId) {
    const total = await Chunk.countDocuments({ user: userId });
    const embedded = await Chunk.countDocuments({ user: userId, embedding: { $ne: null } });
    return { total, embedded, pending: total - embedded };
  }
}

module.exports = new VectorStoreService();