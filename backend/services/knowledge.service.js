const crypto = require('crypto');
const knowledgeRepo = require('../repositories/knowledge.repo');

function chunkText(text, maxTokens = 250) {
  const paragraphs = String(text || '').split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxTokens * 4 && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function mockEmbedding(text) {
  const hash = crypto.createHash('sha256').update(String(text)).digest();
  const values = [];
  for (let i = 0; i < 1536; i++) {
    values.push(((hash[i % hash.length] / 255) * 2 - 1).toFixed(6));
  }
  return `[${values.join(',')}]`;
}

async function indexDocument({ organizationId, documentId, text, category, language }) {
  const chunks = chunkText(text);
  const results = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const content = chunks[i];
    const embedding = mockEmbedding(content);
    const row = await knowledgeRepo.createDocumentChunk(organizationId, {
      knowledgeDocumentId: documentId,
      chunkIndex: i,
      sectionPath: `section-${i + 1}`,
      content,
      chunkSummary: content.slice(0, 280),
      language: language || 'ar',
      category: category || null,
      tags: [],
      tokenCount: Math.ceil(content.length / 4),
      qualityScore: 0.8,
      embeddingModel: 'mock-embedding-v1',
      embedding,
      embeddingStatus: 'ready',
      metadata: { indexed: true }
    });
    results.push(row);
  }

  return results;
}

async function searchKnowledge({ organizationId, queryVector, category, language, limit }) {
  return knowledgeRepo.searchChunks(organizationId, queryVector, category, language, limit);
}

module.exports = {
  chunkText,
  indexDocument,
  searchKnowledge,
  mockEmbedding
};
