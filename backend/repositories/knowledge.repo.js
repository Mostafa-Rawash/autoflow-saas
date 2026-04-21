const { query } = require('../db');

async function createKnowledgeDocument(organizationId, data) {
  const result = await query(
    `INSERT INTO knowledge_documents (
      organization_id, title, source_type, source_url, file_url,
      language, category, tags, status, metadata, created_by
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      organizationId,
      data.title,
      data.sourceType,
      data.sourceUrl || null,
      data.fileUrl || null,
      data.language || 'ar',
      data.category || null,
      data.tags || [],
      data.status || 'pending',
      data.metadata || {},
      data.createdBy || null
    ]
  );
  return result.rows[0];
}

async function createDocumentChunk(organizationId, data) {
  const result = await query(
    `INSERT INTO document_chunks (
      organization_id, knowledge_document_id, chunk_index, section_path,
      content, content_tsv, chunk_summary, language, category, tags,
      token_count, quality_score, embedding_model, embedding, embedding_status, metadata
    ) VALUES (
      $1,$2,$3,$4,
      $5,to_tsvector('simple', unaccent(coalesce($5,''))),$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15
    ) RETURNING *`,
    [
      organizationId,
      data.knowledgeDocumentId,
      data.chunkIndex,
      data.sectionPath || null,
      data.content,
      data.chunkSummary || null,
      data.language || 'ar',
      data.category || null,
      data.tags || [],
      data.tokenCount || 0,
      data.qualityScore || 0,
      data.embeddingModel || null,
      data.embedding || null,
      data.embeddingStatus || 'pending',
      data.metadata || {}
    ]
  );
  return result.rows[0];
}

async function searchChunks(organizationId, embedding, category, language, limit = 10) {
  const result = await query(
    `SELECT
      id, content, chunk_summary, category, tags,
      1 - (embedding <=> $2::vector) AS similarity
     FROM document_chunks
     WHERE organization_id = $1
       AND embedding_status = 'ready'
       AND ($3::text IS NULL OR category = $3)
       AND ($4::text IS NULL OR language = $4)
     ORDER BY embedding <=> $2::vector
     LIMIT $5`,
    [organizationId, embedding, category || null, language || null, limit]
  );
  return result.rows;
}

module.exports = {
  createKnowledgeDocument,
  createDocumentChunk,
  searchChunks
};
