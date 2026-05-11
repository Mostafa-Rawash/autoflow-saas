# AutoFlow RAG Platform — Architecture Design Document

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Dashboard<br/>React/Next.js]
        MOBILE[Mobile SDK]
        API_CLIENT[API Clients]
    end

    subgraph "API Gateway"
        GW[API Gateway<br/>NestJS + Express]
        RL[Rate Limiter]
        AUTH_PROXY[Auth Proxy]
    end

    subgraph "Core Services"
        AUTH_SVC[Auth Service<br/>:3001]
        USER_SVC[User Service<br/>:3002]
        CHAT_SVC[AI Chat Service<br/>:3003]
        UPLOAD_SVC[File Upload Service<br/>:3004]
        DOC_SVC[Document Processing<br/>:3005]
        EMBED_SVC[Embedding Service<br/>:3006]
        VECTOR_SVC[Vector Search Service<br/>:3007]
        CONV_SVC[Conversation Service<br/>:3008]
        BILL_SVC[Billing Service<br/>:3009]
        NOTIFY_SVC[Notification Service<br/>:3010]
    end

    subgraph "Data Layer"
        MONGO[(MongoDB<br/>Users, Docs, Convs)]
        QDRANT[(Qdrant<br/>Embeddings)]
        REDIS[(Redis<br/>Cache + Sessions)]
        S3[(S3/MinIO<br/>File Storage)]
    end

    subgraph "Infrastructure"
        RABBIT[RabbitMQ<br/>Event Bus]
        WORKERS[Worker Pool<br/>:3011]
    end

    WEB --> GW
    MOBILE --> GW
    API_CLIENT --> GW
    GW --> RL
    GW --> AUTH_PROXY
    GW --> AUTH_SVC
    GW --> USER_SVC
    GW --> CHAT_SVC
    GW --> UPLOAD_SVC
    GW --> CONV_SVC
    GW --> BILL_SVC
    GW --> NOTIFY_SVC

    CHAT_SVC --> VECTOR_SVC
    CHAT_SVC --> EMBED_SVC
    CHAT_SVC --> CONV_SVC
    UPLOAD_SVC --> S3
    UPLOAD_SVC --> RABBIT
    DOC_SVC --> RABBIT
    DOC_SVC --> MONGO
    EMBED_SVC --> RABBIT
    EMBED_SVC --> QDRANT
    VECTOR_SVC --> QDRANT
    VECTOR_SVC --> REDIS
    CONV_SVC --> MONGO
    AUTH_SVC --> REDIS
    USER_SVC --> MONGO
    BILL_SVC --> MONGO
    BILL_SVC --> RABBIT
    NOTIFY_SVC --> RABBIT
    WORKERS --> RABBIT
    WORKERS --> DOC_SVC
    WORKERS --> EMBED_SVC
```

## 2. Service Boundaries

### API Gateway (`:3000`)
- **Role**: Single entry point, routing, auth validation, rate limiting, request transformation
- **Owns**: Route table, rate limit config, JWT verification (public key only)
- **Does NOT own**: Any business logic or data
- **Communication**: REST to all downstream services

### Auth Service (`:3001`)
- **Role**: JWT issuance, refresh, validation, workspace membership resolution
- **Owns**: JWT secret, token lifecycle, session management
- **Data**: Redis for session/blacklist, MongoDB for auth logs
- **Key endpoints**: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/verify`

### User Service (`:3002`)
- **Role**: User profiles, workspace management, team invitations, RBAC
- **Owns**: User data, workspace membership, role assignments
- **Data**: MongoDB (users, workspaces, team_invitations, roles)
- **Key endpoints**: `/users`, `/workspaces`, `/workspaces/:id/members`, `/roles`

### AI Chat Service (`:3003`)
- **Role**: Orchestrate RAG pipeline — retrieve context, call LLM, stream response
- **Owns**: Chat sessions, provider config, prompt templates, context assembly
- **Does NOT own**: Embedding storage, document storage, conversation persistence
- **Data**: Redis for chat session cache, MongoDB for provider configs
- **Key endpoints**: `/chat`, `/chat/:id/messages`, `/chat/providers`, `/chat/stream`

### File Upload Service (`:3004`)
- **Role**: Handle file uploads, generate signed URLs, track upload progress
- **Owns**: Upload session state, storage credentials, file size limits per plan
- **Does NOT own**: Document processing or embedding
- **Data**: MongoDB for upload metadata, S3/MinIO for file blobs
- **Key endpoints**: `/uploads/init`, `/uploads/chunk`, `/uploads/complete`, `/uploads/:id`

### Document Processing Service (`:3005`)
- **Role**: Extract text from files, clean, chunk, and publish for embedding
- **Owns**: Processing pipeline state, chunking strategies, supported file types
- **Does NOT own**: Embedding generation or vector storage
- **Data**: MongoDB for documents, chunks
- **Key endpoints**: `/documents`, `/documents/:id`, `/documents/:id/chunks`

### Embedding Service (`:3006`)
- **Role**: Generate embeddings for text chunks, manage embedding model selection
- **Owns**: Embedding model config, batch processing, retry logic
- **Does NOT own**: Vector search or storage
- **Data**: MongoDB for embedding job tracking
- **Key endpoints**: `/embed`, `/embed/batch`, `/embed/status/:jobId`

### Vector Search Service (`:3007`)
- **Role**: CRUD on Qdrant collections, similarity search, hybrid search
- **Owns**: Qdrant connection, collection management, search ranking
- **Does NOT own**: Embedding generation
- **Data**: Qdrant (all vector data), Redis for search result caching
- **Key endpoints**: `/search`, `/collections`, `/collections/:id/points`

### Conversation Service (`:3008`)
- **Role**: Persist conversations and messages, conversation history, search
- **Owns**: Message data, conversation metadata, read receipts
- **Does NOT own**: AI generation logic
- **Data**: MongoDB (conversations, messages)
- **Key endpoints**: `/conversations`, `/conversations/:id/messages`, `/conversations/:id/history`

### Billing Service (`:3009`)
- **Role**: Subscription plans, usage metering, invoice generation, payment processing
- **Owns**: Plan limits, usage counters, payment records, invoices
- **Data**: MongoDB (subscriptions, invoices, usage_records)
- **Key endpoints**: `/billing/plans`, `/billing/subscription`, `/billing/usage`, `/billing/invoices`

### Notification Service (`:3010`)
- **Role**: Webhooks, email alerts, in-app notifications, event fan-out
- **Owns**: Notification templates, delivery channels, webhook registrations
- **Data**: MongoDB (notifications, webhook_configs)
- **Key endpoints**: `/notifications`, `/webhooks`

### Worker Pool (`:3011`)
- **Role**: Consume RabbitMQ queues, execute document processing and embedding jobs
- **Owns**: Worker lifecycle, concurrency config, dead letter handling
- **Does NOT own**: HTTP endpoints (queue consumers only)
- **Data**: None (stateless, reads from queues, calls services)

---

## 3. Folder Structure

```
autoflow-rag-platform/
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── k8s/
│       ├── base/
│       │   ├── namespace.yaml
│       │   ├── gateway-deployment.yaml
│       │   ├── auth-deployment.yaml
│       │   ├── chat-deployment.yaml
│       │   ├── upload-deployment.yaml
│       │   ├── doc-processor-deployment.yaml
│       │   ├── embedding-deployment.yaml
│       │   ├── vector-deployment.yaml
│       │   ├── conversation-deployment.yaml
│       │   ├── billing-deployment.yaml
│       │   ├── notification-deployment.yaml
│       │   ├── worker-deployment.yaml
│       │   ├── mongo-statefulset.yaml
│       │   ├── qdrant-statefulset.yaml
│       │   ├── redis-statefulset.yaml
│       │   ├── rabbitmq-statefulset.yaml
│       │   └── minio-statefulset.yaml
│       └── overlays/
│           ├── dev/
│           ├── staging/
│           └── prod/
├── libs/
│   ├── common/
│   │   ├── src/
│   │   │   ├── types/          # Shared TypeScript interfaces
│   │   │   ├── constants/      # Error codes, event names, limits
│   │   │   ├── utils/         # Logger, validator, retry helpers
│   │   │   └── middleware/     # Auth guard, tenant guard, error filter
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── rabbitmq/
│   │   ├── src/
│   │   │   ├── exchanges.ts    # Exchange definitions
│   │   │   ├── queues.ts       # Queue definitions
│   │   │   ├── publishers.ts   # Message publisher helpers
│   │   │   └── consumers.ts    # Consumer base class
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── database/
│       ├── src/
│       │   ├── mongo/          # Shared Mongoose schemas, connection helpers
│       │   ├── qdrant/         # Qdrant client wrapper
│       │   ├── redis/          # Redis client wrapper
│       │   └── s3/            # S3/MinIO client wrapper
│       ├── package.json
│       └── tsconfig.json
├── services/
│   ├── gateway/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── proxy/         # Route proxies to downstream services
│   │   │   ├── guards/        # Auth guard, rate limit guard
│   │   │   └── filters/      # Error transform filters
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── auth/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/    # JWT strategy
│   │   │   └── dto/          # Request/Response DTOs
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── user/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── workspace.controller.ts
│   │   │   ├── workspace.service.ts
│   │   │   ├── schemas/       # Mongoose schemas
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── chat/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── providers/     # LLM provider adapters
│   │   │   │   ├── provider.interface.ts
│   │   │   │   ├── openai.adapter.ts
│   │   │   │   ├── gemini.adapter.ts
│   │   │   │   ├── glm.adapter.ts
│   │   │   │   ├── claude.adapter.ts
│   │   │   │   ├── openrouter.adapter.ts
│   │   │   │   └── provider.factory.ts
│   │   │   ├── rag/           # RAG pipeline orchestration
│   │   │   │   ├── context-assembler.ts
│   │   │   │   ├── prompt-builder.ts
│   │   │   │   ├── source-citation.ts
│   │   │   │   └── rag.service.ts
│   │   │   ├── session/       # Chat session management
│   │   │   │   ├── session.service.ts
│   │   │   │   └── context-window.ts
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── upload/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── upload.module.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── storage/       # Storage backends
│   │   │   │   ├── storage.interface.ts
│   │   │   │   ├── s3.storage.ts
│   │   │   │   ├── minio.storage.ts
│   │   │   │   └── local.storage.ts
│   │   │   ├── scan/          # Virus scanning
│   │   │   │   └── clamav.scanner.ts
│   │   │   ├── schemas/
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── document/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── document.module.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── document.service.ts
│   │   │   ├── extractors/    # Per-file-type text extraction
│   │   │   │   ├── extractor.interface.ts
│   │   │   │   ├── pdf.extractor.ts
│   │   │   │   ├── docx.extractor.ts
│   │   │   │   ├── txt.extractor.ts
│   │   │   │   ├── csv.extractor.ts
│   │   │   │   ├── markdown.extractor.ts
│   │   │   │   ├── html.extractor.ts
│   │   │   │   └── extractor.factory.ts
│   │   │   ├── chunkers/      # Text chunking strategies
│   │   │   │   ├── chunker.interface.ts
│   │   │   │   ├── semantic.chunker.ts
│   │   │   │   ├── fixed.chunker.ts
│   │   │   │   └── sentence.chunker.ts
│   │   │   ├── schemas/
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── embedding/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── embedding.module.ts
│   │   │   ├── embedding.controller.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── models/        # Embedding model adapters
│   │   │   │   ├── embedding.interface.ts
│   │   │   │   ├── openai-embedding.ts
│   │   │   │   └── cohere-embedding.ts
│   │   │   ├── schemas/
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── vector/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── vector.module.ts
│   │   │   ├── vector.controller.ts
│   │   │   ├── vector.service.ts
│   │   │   ├── qdrant/        # Qdrant client wrapper
│   │   │   │   ├── qdrant.client.ts
│   │   │   │   └── collection.manager.ts
│   │   │   ├── search/        # Search strategies
│   │   │   │   ├── similarity.search.ts
│   │   │   │   ├── hybrid.search.ts
│   │   │   │   └── reranker.ts
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── conversation/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── conversation.module.ts
│   │   │   ├── conversation.controller.ts
│   │   │   ├── conversation.service.ts
│   │   │   ├── schemas/
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── billing/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── billing.module.ts
│   │   │   ├── billing.controller.ts
│   │   │   ├── billing.service.ts
│   │   │   ├── usage/         # Usage metering
│   │   │   │   ├── usage.service.ts
│   │   │   │   └── limits.service.ts
│   │   │   ├── payment/      # Payment gateway adapters
│   │   │   │   ├── payment.interface.ts
│   │   │   │   ├── stripe.adapter.ts
│   │   │   │   └── fawry.adapter.ts
│   │   │   ├── schemas/
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── notification/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── channels/     # Delivery channels
│   │   │   │   ├── email.channel.ts
│   │   │   │   ├── webhook.channel.ts
│   │   │   │   └── inapp.channel.ts
│   │   │   ├── schemas/
│   │   │   └── dto/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── worker/
│       ├── src/
│       │   ├── main.ts
│       │   ├── worker.module.ts
│       │   ├── processors/    # Queue consumer handlers
│       │   │   ├── document.processor.ts
│       │   │   ├── embedding.processor.ts
│       │   │   ├── usage.processor.ts
│       │   │   └── notification.processor.ts
│       │   └── retry/         # Dead letter + retry logic
│       │       ├── retry.handler.ts
│       │       └── dlq.handler.ts
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   ├── setup.sh              # First-time setup
│   ├── seed.sh               # Database seeding
│   └── migrate.sh            # Schema migrations
├── .env.example
├── turbo.json                # Turborepo config
├── package.json              # Root workspace config
└── README.md
```

---

## 4. Database Schemas

### 4.1 MongoDB Schemas

#### User
```typescript
// services/user/src/schemas/user.schema.ts
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, maxlength: 50 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true, select: false, minlength: 6 })
  password: string;

  @Prop({ default: 'agent', enum: ['owner', 'admin', 'manager', 'agent', 'viewer'], index: true })
  role: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  lastLogin: Date;

  @Prop()
  avatar: string;

  @Prop({ type: [ObjectId], ref: 'Workspace', default: [] })
  workspaces: Types.Array<Types.ObjectId>;
}

// Indexes: { email: 1, isActive: 1 }, { createdAt: -1 }
```

#### Workspace
```typescript
// services/user/src/schemas/workspace.schema.ts
@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ unique: true, uppercase: true, match: /^[A-Z0-9-]+$/ })
  slug: string;              // e.g. "ACME-CORP"

  @Prop({ required: true, type: ObjectId, ref: 'User', index: true })
  owner: Types.ObjectId;

  @Prop([{
    user: { type: ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'agent', 'viewer'] },
    joinedAt: Date,
  }])
  members: WorkspaceMember[];

  @Prop({ default: 'ar', enum: ['ar', 'en'] })
  defaultLanguage: string;

  @Prop({ default: 'Africa/Cairo' })
  timezone: string;

  @Prop()
  logo: string;

  @Prop({ default: false })
  onboardingCompleted: boolean;
}

// Indexes: { owner: 1 }, { 'members.user': 1 }, { slug: 1 }
```

#### Document
```typescript
// services/document/src/schemas/document.schema.ts
@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true, type: ObjectId, ref: 'User', index: true })
  user: Types.ObjectId;

  @Prop({ required: true, type: ObjectId, ref: 'Workspace', index: true })
  workspace: Types.ObjectId;

  @Prop({ required: true, trim: true })
  filename: string;

  @Prop({ required: true, enum: ['pdf', 'docx', 'txt', 'csv', 'md', 'html'] })
  fileType: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ required: true })  // S3 key: workspace/{wsId}/docs/{docId}/{filename}
  storageKey: string;

  @Prop({ default: 'pending', enum: ['pending', 'extracting', 'chunking', 'embedding', 'ready', 'failed'], index: true })
  processingStatus: string;

  @Prop()
  processingError: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  description: string;

  @Prop({ default: 0 })
  chunkCount: number;

  @Prop({ default: 0 })
  totalTokens: number;

  @Prop()
  textExtractedAt: Date;

  @Prop()
  embeddedAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

// Indexes: { workspace: 1, processingStatus: 1 }, { workspace: 1, createdAt: -1 }, { user: 1 }
```

#### Chunk
```typescript
// services/document/src/schemas/chunk.schema.ts
@Schema({ timestamps: true })
export class Chunk {
  @Prop({ required: true, type: ObjectId, ref: 'Document', index: true })
  document: Types.ObjectId;

  @Prop({ required: true, type: ObjectId, ref: 'Workspace', index: true })
  workspace: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  chunkIndex: number;         // 0-based order within document

  @Prop()
  startOffset: number;        // Character offset in original text

  @Prop()
  endOffset: number;

  @Prop({ default: 0 })
  tokenCount: number;

  @Prop({ type: ObjectId, ref: 'Chunk' })
  previousChunk: Types.ObjectId;

  @Prop({ type: ObjectId, ref: 'Chunk' })
  nextChunk: Types.ObjectId;

  @Prop()
  embeddingId: string;        // Qdrant point ID

  @Prop({ default: 'pending', enum: ['pending', 'embedded', 'failed'], index: true })
  embeddingStatus: string;

  @Prop({ default: {} })
  metadata: Record<string, any>;  // page number, section header, etc.
}

// Indexes: { document: 1, chunkIndex: 1 }, { workspace: 1, embeddingStatus: 1 }
```

#### Conversation
```typescript
// services/conversation/src/schemas/conversation.schema.ts
@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: ObjectId, ref: 'Workspace', index: true })
  workspace: Types.ObjectId;

  @Prop({ required: true, type: ObjectId, ref: 'User', index: true })
  user: Types.ObjectId;

  @Prop({ required: true, enum: ['whatsapp', 'messenger', 'instagram', 'telegram', 'livechat', 'web', 'api'] })
  channel: string;

  @Prop({
    name: String,
    phone: String,
    email: String,
    avatar: String,
    externalId: String,
  })
  contact: ContactInfo;

  @Prop({ default: 'active', enum: ['active', 'pending', 'resolved', 'closed'], index: true })
  status: string;

  @Prop({ default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] })
  priority: string;

  @Prop({ type: ObjectId, ref: 'User', index: true })
  assignedTo: Types.ObjectId;

  @Prop([String])
  tags: string[];

  @Prop({ type: [ObjectId], ref: 'Document', default: [] })
  attachedDocuments: Types.Array<Types.ObjectId>;

  @Prop({ content: String, timestamp: Date, sender: { type: String, enum: ['contact', 'agent', 'bot'] } })
  lastMessage: LastMessage;

  @Prop({ default: 0 })
  unreadCount: number;

  @Prop()
  aiProvider: string;         // Which LLM was used

  @Prop()
  aiModel: string;            // Which model was used

  @Prop({ default: {} })
  metadata: Record<string, any>;
}

// Indexes: { workspace: 1, channel: 1, 'contact.externalId': 1 }, { workspace: 1, status: 1, updatedAt: -1 }
```

#### Message
```typescript
// services/conversation/src/schemas/message.schema.ts
@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: ObjectId, ref: 'Conversation', index: true })
  conversation: Types.ObjectId;

  @Prop({ required: true, type: ObjectId, ref: 'Workspace', index: true })
  workspace: Types.ObjectId;

  @Prop({ required: true, enum: ['contact', 'agent', 'bot', 'system'] })
  sender: string;

  @Prop({ type: ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'text', enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'button'] })
  type: string;

  @Prop({ url: String, mimeType: String, size: Number, filename: String })
  media: MediaInfo;

  @Prop({ default: 'sent', enum: ['sent', 'delivered', 'read', 'failed'], index: true })
  status: string;

  @Prop()
  externalId: string;

  // RAG-specific metadata
  @Prop({
    sources: [{ documentId: ObjectId, chunkIds: [String], filename: String, relevanceScore: Number }],
    aiProvider: String,
    aiModel: String,
    tokensUsed: Number,
    embeddingTokens: Number,
    retrievalLatencyMs: Number,
    generationLatencyMs: Number,
  })
  ragMetadata: RagMetadata;
}

// Indexes: { conversation: 1, createdAt: 1 }, { workspace: 1, createdAt: -1 }
```

#### Subscription
```typescript
// services/billing/src/schemas/subscription.schema.ts
@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, type: ObjectId, ref: 'Workspace', unique: true, index: true })
  workspace: Types.ObjectId;

  @Prop({ required: true, enum: ['free', 'basic', 'standard', 'premium'], index: true })
  plan: string;

  @Prop({ default: 'monthly', enum: ['monthly', 'yearly'] })
  billingCycle: string;

  @Prop({ default: 'trialing', enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'], index: true })
  status: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'EGP' })
  currency: string;

  @Prop()
  endDate: Date;

  @Prop()
  trialEndsAt: Date;

  // Plan limits
  @Prop({
    documents: Number,
    storageMb: Number,
    aiMessagesPerDay: Number,
    teamMembers: Number,
    conversations: Number,
    embeddingRequests: Number,
  })
  limits: PlanLimits;

  // Usage counters
  @Prop({
    documents: { type: Number, default: 0 },
    storageUsedMb: { type: Number, default: 0 },
    aiMessagesToday: { type: Number, default: 0 },
    embeddingRequests: { type: Number, default: 0 },
  })
  usage: UsageCounters;
}

// Default limits per plan:
// free:      { documents: 5,  storageMb: 50,   aiMessagesPerDay: 20,   teamMembers: 2,  conversations: 100, embeddingRequests: 50 }
// basic:     { documents: 50, storageMb: 500,  aiMessagesPerDay: 200,  teamMembers: 5,  conversations: 1000, embeddingRequests: 500 }
// standard:  { documents: 200, storageMb: 2000, aiMessagesPerDay: 1000, teamMembers: 10, conversations: 5000, embeddingRequests: 2000 }
// premium:   { documents: Infinity, storageMb: Infinity, aiMessagesPerDay: Infinity, teamMembers: Infinity, conversations: Infinity, embeddingRequests: Infinity }
```

#### UsageRecord
```typescript
// services/billing/src/schemas/usage-record.schema.ts
@Schema({ timestamps: true })
export class UsageRecord {
  @Prop({ required: true, type: ObjectId, ref: 'Workspace', index: true })
  workspace: Types.ObjectId;

  @Prop({ required: true, enum: ['ai_message', 'embedding', 'storage', 'document_upload', 'conversation'] })
  resourceType: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  unit: string;              // 'tokens', 'requests', 'mb', 'count'

  @Prop()
  costAmount: number;

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  metadata: Record<string, any>; // model, provider, file info, etc.
}

// Indexes: { workspace: 1, resourceType: 1, timestamp: -1 }, { workspace: 1, timestamp: -1 }
// TTL index on timestamp for auto-cleanup after 90 days
```

### 4.2 Qdrant Collection Schema

```yaml
Collection: "workspace_{slug}"
  vectors:
    size: 1536              # OpenAI text-embedding-3-small (configurable)
    distance: cosine
  payload_schema:
    workspace_id: keyword   # For secondary filtering
    document_id: keyword
    chunk_id: keyword
    user_id: keyword
    filename: keyword
    file_type: keyword
    tags: keyword[]         # Array for multi-tag filtering
    chunk_index: integer
    created_at: datetime
    updated_at: datetime
    is_active: boolean      # Soft delete support
```

---

## 5. API Design

### 5.1 Gateway Routes

All routes prefixed with `/api/v1`. Gateway validates JWT, resolves workspace, forwards to downstream service.

| Method | Route | Target Service | Auth | Description |
|--------|-------|---------------|------|-------------|
| POST | `/auth/register` | Auth | Public | Register new user + workspace |
| POST | `/auth/login` | Auth | Public | Login, get tokens |
| POST | `/auth/refresh` | Auth | Refresh Token | Refresh access token |
| GET | `/auth/me` | User | Auth | Current user profile |
| GET | `/workspaces` | User | Auth | List user's workspaces |
| POST | `/workspaces` | User | Auth | Create workspace |
| GET | `/workspaces/:id` | User | Auth | Get workspace |
| PATCH | `/workspaces/:id` | User | Auth (Owner/Admin) | Update workspace |
| GET | `/workspaces/:id/members` | User | Auth | List members |
| POST | `/workspaces/:id/members/invite` | User | Auth (Admin+) | Invite member |
| DELETE | `/workspaces/:id/members/:userId` | User | Auth (Owner) | Remove member |
| POST | `/uploads/init` | Upload | Auth | Initialize chunked upload |
| PUT | `/uploads/:id/chunk` | Upload | Auth | Upload a chunk |
| POST | `/uploads/:id/complete` | Upload | Auth | Finalize upload |
| GET | `/uploads/:id/status` | Upload | Auth | Upload progress |
| GET | `/documents` | Document | Auth | List workspace documents |
| POST | `/documents` | Document | Auth | Create document record |
| GET | `/documents/:id` | Document | Auth | Get document + chunks |
| DELETE | `/documents/:id` | Document | Auth (Admin+) | Delete doc + vectors |
| PATCH | `/documents/:id` | Document | Auth | Update tags/description |
| POST | `/documents/:id/reprocess` | Document | Auth (Admin+) | Re-embed a document |
| POST | `/chat` | Chat | Auth | Start new chat session |
| POST | `/chat/:id/messages` | Chat | Auth | Send message, get AI reply |
| GET | `/chat/:id/messages` | Chat | Auth | Chat history |
| GET | `/chat/providers` | Chat | Auth | List available providers |
| GET | `/conversations` | Conversation | Auth | List conversations |
| GET | `/conversations/:id` | Conversation | Auth | Conversation + messages |
| POST | `/conversations` | Conversation | Auth | Create conversation |
| PATCH | `/conversations/:id` | Conversation | Auth | Update status/assignee |
| GET | `/billing/plans` | Billing | Public | Available plans |
| GET | `/billing/subscription` | Billing | Auth | Current subscription |
| POST | `/billing/upgrade` | Billing | Auth (Owner) | Upgrade plan |
| GET | `/billing/usage` | Billing | Auth | Usage stats |
| GET | `/billing/invoices` | Billing | Auth | Invoice history |
| POST | `/webhooks` | Notification | Auth (Admin) | Register webhook |
| GET | `/search` | Vector | Auth | Semantic search across docs |

### 5.2 Key API Request/Response Shapes

```typescript
// POST /api/v1/chat/:id/messages
interface ChatMessageRequest {
  content: string;
  provider?: 'openai' | 'gemini' | 'glm' | 'claude' | 'openrouter';
  model?: string;             // Override default model
  stream?: boolean;           // Default true
  documentIds?: string[];     // Restrict RAG to specific docs
  temperature?: number;       // 0-2, default 0.7
}

interface ChatMessageResponse {
  id: string;
  content: string;
  sender: 'bot';
  ragMetadata: {
    sources: SourceCitation[];
    aiProvider: string;
    aiModel: string;
    tokensUsed: number;
    retrievalLatencyMs: number;
    generationLatencyMs: number;
  };
}

interface SourceCitation {
  documentId: string;
  filename: string;
  chunkContent: string;      // Relevant excerpt
  relevanceScore: number;    // 0-1
  pageNumber?: number;
}

// POST /api/v1/uploads/init
interface InitUploadRequest {
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'md' | 'html';
  fileSize: number;
  tags?: string[];
  description?: string;
}

interface InitUploadResponse {
  uploadId: string;
  chunkSize: number;          // Max chunk size in bytes (5MB)
  totalChunks: number;
  signedUrls: string[];        // Pre-signed S3 URLs per chunk
}

// GET /api/v1/search
interface SearchRequest {
  query: string;
  topK?: number;              // Default 5, max 20
  documentIds?: string[];    // Filter by docs
  tags?: string[];            // Filter by tags
  minScore?: number;          // Minimum similarity (0-1), default 0.7
}

interface SearchResponse {
  results: SearchResult[];
  queryEmbeddingLatencyMs: number;
  searchLatencyMs: number;
}

interface SearchResult {
  chunkId: string;
  documentId: string;
  filename: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}
```

---

## 6. Queue/Event Flow

### 6.1 RabbitMQ Exchange & Queue Topology

```mermaid
graph LR
    subgraph "Exchanges"
        DOC_EX[doc.exchange<br/>topic]
        CHAT_EX[chat.exchange<br/>topic]
        BILL_EX[billing.exchange<br/>topic]
        NOTIFY_EX[notify.exchange<br/>fanout]
    end

    subgraph "Queues"
        DOC_Q[doc.processing.queue]
        EMBED_Q[embedding.queue]
        EMBED_BATCH_Q[embedding.batch.queue]
        CHAT_RESPONSE_Q[chat.response.queue]
        USAGE_Q[usage.tracking.queue]
        NOTIFY_Q[notification.queue]
        DLQ[dead.letter.queue]
    end

    subgraph "Consumers"
        DOC_W[Document Worker]
        EMBED_W[Embedding Worker]
        CHAT_W[Chat Response Worker]
        BILL_W[Billing Worker]
        NOTIFY_W[Notification Worker]
    end

    DOC_EX -->|doc.uploaded| DOC_Q
    DOC_EX -->|doc.chunked| EMBED_Q
    DOC_EX -->|doc.batch.ready| EMBED_BATCH_Q
    CHAT_EX -->|chat.response.complete| CHAT_RESPONSE_Q
    CHAT_EX -->|chat.token.counted| USAGE_Q
    BILL_EX -->|billing.usage| USAGE_Q
    NOTIFY_EX --> NOTIFY_Q

    DOC_Q --> DOC_W
    EMBED_Q --> EMBED_W
    EMBED_BATCH_Q --> EMBED_W
    CHAT_RESPONSE_Q --> CHAT_W
    USAGE_Q --> BILL_W
    NOTIFY_Q --> NOTIFY_W

    DOC_Q -->|nack + requeue| DLQ
    EMBED_Q -->|nack| DLQ
```

### 6.2 Message Schemas

```typescript
// Document uploaded event → doc.exchange, routing key: doc.uploaded
interface DocUploadedEvent {
  eventId: string;
  workspaceId: string;
  userId: string;
  documentId: string;
  storageKey: string;
  fileType: string;
  filename: string;
  uploadedAt: string;         // ISO 8601
}

// Document chunked event → doc.exchange, routing key: doc.chunked
interface DocChunkedEvent {
  eventId: string;
  workspaceId: string;
  documentId: string;
  chunks: Array<{
    chunkId: string;
    content: string;
    chunkIndex: number;
    tokenCount: number;
  }>;
  totalChunks: number;
}

// Embedding complete event → doc.exchange, routing key: doc.embedded
interface DocEmbeddedEvent {
  eventId: string;
  workspaceId: string;
  documentId: string;
  totalPoints: number;        // Points written to Qdrant
  embeddedAt: string;
}

// Chat token usage event → billing.exchange, routing key: billing.usage
interface ChatUsageEvent {
  eventId: string;
  workspaceId: string;
  userId: string;
  conversationId: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  embeddingTokens: number;
  estimatedCostUsd: number;
  timestamp: string;
}

// Dead letter message
interface DeadLetterMessage {
  originalQueue: string;
  originalRoutingKey: string;
  error: string;
  attempts: number;
  lastAttemptAt: string;
  payload: any;
}
```

### 6.3 Retry & Dead Letter Config

```yaml
# Per-queue settings
doc.processing.queue:
  prefetch: 1
  message-ttl: 3600000       # 1 hour
  x-dead-letter-exchange: dlx.exchange
  x-dead-letter-routing-key: dead.letter
  arguments:
    x-max-priority: 3         # Support priority messages

embedding.queue:
  prefetch: 5                 # Allow some parallelism
  message-ttl: 7200000        # 2 hours (embeddings can take time)
  x-dead-letter-exchange: dlx.exchange
  x-dead-letter-routing-key: dead.letter

# Retry strategy: exponential backoff
# Attempt 1: immediate
# Attempt 2: 30s delay
# Attempt 3: 5m delay
# Attempt 4: move to DLQ
```

---

## 7. RAG Pipeline

### 7.1 Document Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UP as Upload Service
    participant S3 as S3/MinIO
    participant MQ as RabbitMQ
    participant W as Worker
    participant DP as Document Service
    participant ES as Embedding Service
    participant VS as Vector Service
    participant Q as Qdrant

    U->>UP: POST /uploads/init {filename, fileType, size}
    UP->>S3: Create multipart upload
    UP-->>U: {uploadId, signedUrls[], chunkSize}

    loop For each chunk
        U->>UP: PUT /uploads/:id/chunk {chunkIndex, data}
        UP->>S3: Upload part
    end

    U->>UP: POST /uploads/:id/complete
    UP->>S3: Complete multipart upload
    UP->>DP: Create document record (status: pending)
    UP->>MQ: Publish doc.uploaded event
    UP-->>U: {documentId, status: processing}

    MQ->>W: Consume doc.uploaded
    W->>S3: Download file
    W->>DP: Extract text (per file type)
    W->>DP: Clean text (remove boilerplate, normalize)
    W->>DP: Split into semantic chunks
    W->>DP: Update document status: chunking
    W->>MQ: Publish doc.chunked event

    MQ->>W: Consume doc.chunked
    W->>ES: POST /embed/batch {chunks[]}
    ES->>ES: Generate embeddings (batched, 100 per call)
    ES->>VS: POST /collections/:id/points {vectors + payloads}
    VS->>Q: Upsert points
    Q-->>VS: OK
    VS-->>ES: Points stored
    ES->>DP: Update chunk embeddingStatus: embedded
    ES->>MQ: Publish doc.embedded event

    MQ->>W: Consume doc.embedded
    W->>DP: Update document status: ready
    W->>U: WebSocket notification: document ready
```

### 7.2 Chat Query Flow

```mermaid
sequenceDiagram
    participant U as User
    participant GW as Gateway
    participant CS as Chat Service
    participant VS as Vector Service
    participant ES as Embedding Service
    participant Q as Qdrant
    participant Conv as Conversation Service
    participant LLM as LLM Provider
    participant MQ as RabbitMQ

    U->>GW: POST /chat/:id/messages {content, stream: true}
    GW->>CS: Forward request

    CS->>CS: Validate request, check rate limits
    CS->>Conv: Save user message

    CS->>ES: POST /embed {content} (query embedding)
    ES-->>CS: {embedding, tokens: 12}

    CS->>VS: POST /search {embedding, topK: 5, workspaceId}
    VS->>Q: Search collection workspace_{slug}
    Q-->>VS: {results: [{chunk, score, metadata}...]}
    VS->>VS: Rerank by relevance + recency
    VS-->>CS: {results, latencyMs}

    CS->>CS: Assemble context from top chunks
    CS->>CS: Build prompt (system + context + history + query)
    CS->>CS: Check token budget, truncate if needed

    CS->>LLM: Stream chat completion {messages, model, stream: true}
    loop SSE chunks
        LLM-->>CS: delta chunk
        CS-->>U: SSE: data: {content_delta}
    end
    LLM-->>CS: [DONE]

    CS->>Conv: Save bot message with RAG metadata
    CS->>MQ: Publish billing.usage event {tokens, provider}
    CS-->>U: SSE: data: {metadata: {sources, tokensUsed}}
```

### 7.3 Chunking Strategy

```typescript
// Semantic chunking with overlap
interface ChunkingConfig {
  maxChunkTokens: number;      // Default: 500
  overlapTokens: number;       // Default: 50 (10% overlap)
  minChunkTokens: number;      // Default: 50 (merge small chunks)
  separatorStrategy: 'heading' | 'paragraph' | 'sentence';
}

// For structured documents (PDF with headers, Markdown):
// 1. Split by headings first (preserve section context)
// 2. Within sections, split by paragraphs
// 3. If paragraph > maxChunkTokens, split by sentences
// 4. Add overlap from previous chunk

// For unstructured documents (TXT, CSV):
// 1. Split by double newlines (paragraph boundaries)
// 2. If paragraph > maxChunkTokens, split by sentences
// 3. Add overlap

// Metadata attached to each chunk:
// - page_number (PDF only)
// - section_header (if detected)
// - previous_chunk_id, next_chunk_id (for context expansion)
```

---

## 8. AI Provider Abstraction

### 8.1 Provider Interface

```typescript
// services/chat/src/providers/provider.interface.ts

export interface LLMProvider {
  readonly name: string;
  readonly supportedModels: string[];
  readonly defaultModel: string;

  generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  streamCompletion(request: CompletionRequest): AsyncIterable<CompletionChunk>;
  countTokens(text: string): number;
  validateConfig(config: ProviderConfig): boolean;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;       // 0-2
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  stream: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionResponse {
  content: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason: string;
  latencyMs: number;
}

export interface CompletionChunk {
  content: string;
  finishReason?: string;
  tokensUsed?: number;
}

export interface ProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;           // For OpenRouter or custom endpoints
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
  getDimension(): number;
  getModelName(): string;
}
```

### 8.2 Provider Factory

```typescript
// services/chat/src/providers/provider.factory.ts

@Injectable()
export class ProviderFactory {
  private providers: Map<string, LLMProvider> = new Map();

  constructor(
    private readonly openaiAdapter: OpenAIAdapter,
    private readonly geminiAdapter: GeminiAdapter,
    private readonly glmAdapter: GLMAdapter,
    private readonly claudeAdapter: ClaudeAdapter,
    private readonly openrouterAdapter: OpenRouterAdapter,
  ) {
    this.providers.set('openai', openaiAdapter);
    this.providers.set('gemini', geminiAdapter);
    this.providers.set('glm', glmAdapter);
    this.providers.set('claude', claudeAdapter);
    this.providers.set('openrouter', openrouterAdapter);
  }

  getProvider(name: string): LLMProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new UnknownProviderError(name);
    return provider;
  }

  getProviderForModel(model: string): LLMProvider {
    for (const provider of this.providers.values()) {
      if (provider.supportedModels.includes(model)) return provider;
    }
    throw new UnknownModelError(model);
  }
}
```

### 8.3 Example Adapter (OpenAI)

```typescript
// services/chat/src/providers/openai.adapter.ts

@Injectable()
export class OpenAIAdapter implements LLMProvider {
  readonly name = 'openai';
  readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  readonly defaultModel = 'gpt-4o-mini';
  private client: OpenAI;

  constructor(@Inject('PROVIDER_CONFIG') private config: ProviderConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const start = Date.now();
    const response = await this.client.chat.completions.create({
      model: request.model || this.defaultModel,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: false,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content,
      model: response.model,
      provider: this.name,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
      finishReason: choice.finish_reason,
      latencyMs: Date.now() - start,
    };
  }

  async *streamCompletion(request: CompletionRequest): AsyncIterable<CompletionChunk> {
    const stream = await this.client.chat.completions.create({
      model: request.model || this.defaultModel,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield { content: delta.content };
      }
      if (chunk.choices[0]?.finish_reason) {
        yield { finishReason: chunk.choices[0].finish_reason };
      }
    }
  }

  countTokens(text: string): number {
    // Use tiktoken or approximation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  validateConfig(config: ProviderConfig): boolean {
    return !!config.apiKey && config.apiKey.startsWith('sk-');
  }
}
```

### 8.4 Fallback Chain

```typescript
// services/chat/src/rag/rag.service.ts

@Injectable()
export class RagService {
  private fallbackChain = ['openai', 'claude', 'openrouter'];

  async generateWithFallback(
    request: CompletionRequest,
    primaryProvider: string,
  ): Promise<CompletionResponse> {
    const providers = [primaryProvider, ...this.fallbackChain.filter(p => p !== primaryProvider)];

    for (const providerName of providers) {
      try {
        const provider = this.factory.getProvider(providerName);
        if (!provider.validateConfig(this.getConfig(providerName))) continue;
        return await provider.generateCompletion(request);
      } catch (error) {
        if (error.status === 429 || error.status >= 500) {
          this.logger.warn(`Provider ${providerName} failed, trying fallback`, error.message);
          continue;
        }
        throw error; // Re-throw client errors (4xx except 429)
      }
    }

    throw new AllProvidersFailedError();
  }
}
```

---

## 9. Multi-Tenant Isolation

### 9.1 Isolation Matrix

| Layer | Strategy | Implementation |
|-------|----------|---------------|
| **MongoDB** | Document-level filtering | Every query includes `workspace: workspaceId`. Enforced by shared `TenantGuard` middleware. |
| **Qdrant** | Collection per workspace | Each workspace gets `workspace_{slug}` collection. Vector service validates collection ownership. |
| **S3** | Prefix isolation | Files stored at `workspace/{wsId}/docs/{docId}/filename`. IAM policy restricts access by prefix. |
| **Redis** | Key prefix | Cache keys: `ws:{wsId}:session:{id}`, `ws:{wsId}:search:cache:{hash}`. |
| **RabbitMQ** | Payload validation | Every event includes `workspaceId`. Workers validate before processing. |
| **API Gateway** | JWT + header injection | Validates JWT, injects `X-Workspace-Id` header from token claims. |

### 9.2 Tenant Guard (Shared Library)

```typescript
// libs/common/src/middleware/tenant.guard.ts

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.headers['x-workspace-id'];

    if (!workspaceId) throw new ForbiddenException('Workspace not specified');

    // Verify user belongs to this workspace
    const user = request.user;
    if (!user.workspaces?.includes(workspaceId)) {
      throw new ForbiddenException('Not a member of this workspace');
    }

    // Inject into request for downstream use
    request.workspaceId = workspaceId;
    return true;
  }
}
```

---

## 10. Deployment Architecture

### 10.1 Docker Compose (Development)

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  # Infrastructure
  mongodb:
    image: mongo:7
    ports: ['27017:27017']
    volumes: [mongo_data:/data/db]
    environment:
      MONGO_INITDB_ROOT_USERNAME: autoflow
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  qdrant:
    image: qdrant/qdrant:latest
    ports: ['6333:6333', '6334:6334']
    volumes: [qdrant_data:/qdrant/storage]

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    command: redis-server --requirepass ${REDIS_PASSWORD}

  rabbitmq:
    image: rabbitmq:3-management
    ports: ['5672:5672', '15672:15672']
    environment:
      RABBITMQ_DEFAULT_USER: autoflow
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}

  minio:
    image: minio/minio
    ports: ['9000:9000', '9001:9001']
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes: [minio_data:/data]

  # Services
  gateway:
    build: ../../services/gateway
    ports: ['3000:3000']
    depends_on: [auth, user, chat, upload, document, conversation, billing]
    environment:
      - AUTH_SERVICE_URL=http://auth:3001
      - USER_SERVICE_URL=http://user:3002
      - CHAT_SERVICE_URL=http://chat:3003
      - UPLOAD_SERVICE_URL=http://upload:3004
      - DOCUMENT_SERVICE_URL=http://document:3005
      - CONVERSATION_SERVICE_URL=http://conversation:3008
      - BILLING_SERVICE_URL=http://billing:3009

  auth:
    build: ../../services/auth
    ports: ['3001:3001']
    depends_on: [mongodb, redis]
    environment: &auth-env
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}

  user:
    build: ../../services/user
    ports: ['3002:3002']
    depends_on: [mongodb]
    environment:
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow

  chat:
    build: ../../services/chat
    ports: ['3003:3003']
    depends_on: [embedding, vector, conversation, rabbitmq, redis]
    environment:
      - EMBEDDING_SERVICE_URL=http://embedding:3006
      - VECTOR_SERVICE_URL=http://vector:3007
      - CONVERSATION_SERVICE_URL=http://conversation:3008
      - RABBITMQ_URL=amqp://autoflow:${RABBITMQ_PASSWORD}@rabbitmq:5672
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GLM_API_KEY=${GLM_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}

  upload:
    build: ../../services/upload
    ports: ['3004:3004']
    depends_on: [minio, rabbitmq]
    environment:
      - MINIO_ENDPOINT=minio
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - MINIO_BUCKET=autoflow-docs
      - RABBITMQ_URL=amqp://autoflow:${RABBITMQ_PASSWORD}@rabbitmq:5672

  document:
    build: ../../services/document
    ports: ['3005:3005']
    depends_on: [mongodb]
    environment:
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow

  embedding:
    build: ../../services/embedding
    ports: ['3006:3006']
    depends_on: [mongodb, rabbitmq]
    environment:
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow
      - RABBITMQ_URL=amqp://autoflow:${RABBITMQ_PASSWORD}@rabbitmq:5672
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  vector:
    build: ../../services/vector
    ports: ['3007:3007']
    depends_on: [qdrant, redis]
    environment:
      - QDRANT_URL=http://qdrant:6333
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

  conversation:
    build: ../../services/conversation
    ports: ['3008:3008']
    depends_on: [mongodb]
    environment:
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow

  billing:
    build: ../../services/billing
    ports: ['3009:3009']
    depends_on: [mongodb, rabbitmq]
    environment:
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow
      - RABBITMQ_URL=amqp://autoflow:${RABBITMQ_PASSWORD}@rabbitmq:5672

  notification:
    build: ../../services/notification
    ports: ['3010:3010']
    depends_on: [mongodb, rabbitmq]
    environment:
      - MONGODB_URI=mongodb://autoflow:${MONGO_PASSWORD}@mongodb:27017/autoflow
      - RABBITMQ_URL=amqp://autoflow:${RABBITMQ_PASSWORD}@rabbitmq:5672

  worker:
    build: ../../services/worker
    depends_on: [rabbitmq, document, embedding, billing, notification]
    deploy:
      replicas: 3              # Scale workers independently
    environment:
      - RABBITMQ_URL=amqp://autoflow:${RABBITMQ_PASSWORD}@rabbitmq:5672
      - DOCUMENT_SERVICE_URL=http://document:3005
      - EMBEDDING_SERVICE_URL=http://embedding:3006
      - VECTOR_SERVICE_URL=http://vector:3007
      - BILLING_SERVICE_URL=http://billing:3009

volumes:
  mongo_data:
  qdrant_data:
  minio_data:
```

### 10.2 Kubernetes Structure (Production)

```yaml
# docker/k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: autoflow
  labels:
    app: autoflow-rag

---
# Example deployment for chat service
# docker/k8s/base/chat-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chat-service
  namespace: autoflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chat-service
  template:
    metadata:
      labels:
        app: chat-service
    spec:
      containers:
        - name: chat
          image: autoflow/chat:latest
          ports:
            - containerPort: 3003
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          envFrom:
            - configMapRef:
                name: chat-config
            - secretRef:
                name: chat-secrets
          readinessProbe:
            httpGet:
              path: /health
              port: 3003
            initialDelaySeconds: 10
            periodSeconds: 15
          livenessProbe:
            httpGet:
              path: /health
              port: 3003
            initialDelaySeconds: 30
            periodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: chat-service
  namespace: autoflow
spec:
  selector:
    app: chat-service
  ports:
    - port: 3003
      targetPort: 3003
```

---

## 11. Scalability Considerations

| Service | Scaling Strategy | Bottleneck |
|---------|-----------------|------------|
| **Gateway** | Horizontal (stateless) | Network I/O |
| **Auth** | Horizontal + Redis session cache | Redis connection count |
| **Chat** | Horizontal + SSE sticky sessions via IP hash | LLM API rate limits |
| **Upload** | Horizontal (stateless, S3 does storage) | S3 throughput |
| **Document** | Horizontal + read replicas | MongoDB reads |
| **Embedding** | Horizontal + batch coalescing | LLM API rate limits |
| **Vector** | Horizontal + Redis query cache | Qdrant query latency |
| **Conversation** | Horizontal + read replicas | MongoDB I/O |
| **Billing** | Horizontal (event-sourced) | RabbitMQ consumer lag |
| **Notification** | Horizontal | External API rate limits |
| **Worker** | Horizontal (add replicas) | Queue depth |

**Caching layers:**
1. **Redis** — Chat session context (TTL: 1h), search results (TTL: 5m), rate limit counters
2. **In-process** — LRU cache for provider configs, workspace membership (TTL: 60s)
3. **CDN** — Frontend static assets, uploaded document previews

**Connection pooling:**
- MongoDB: 10 connections per service instance, Mongoose auto-pooling
- Qdrant: 1 gRPC client per Vector service instance, connection multiplexed
- Redis: ioredis with 50 connection pool per service
- RabbitMQ: 1 connection per process, multiple channels (1 per queue consumer)

---

## 12. Failure Handling Strategy

### 12.1 Failure Modes & Responses

| Failure | Detection | Response |
|---------|-----------|----------|
| LLM provider down | Timeout (30s) + HTTP 5xx | Fallback to next provider in chain |
| LLM rate limit (429) | HTTP 429 response | Exponential backoff (1s → 2s → 4s), then fallback |
| Qdrant unavailable | Health check failure | Return "search unavailable" + generate without context |
| MongoDB down | Connection error | Return 503 Service Unavailable |
| RabbitMQ down | Connection close event | Buffer events in-process (max 1000), reconnect + flush |
| S3 upload fails | HTTP 5xx | Retry 3x with backoff, then mark upload failed |
| Worker crash | Kubernetes pod restart | RabbitMQ redelivers unacknowledged messages |
| Document processing fails | Worker catch block | Retry 3x, then mark document `status: failed`, notify user |

### 12.2 Circuit Breaker Pattern

```typescript
// libs/common/src/utils/circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,        // Failures before opening
    private resetTimeout: number = 30000,  // 30s before half-open
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime! > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new CircuitOpenError();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) this.state = 'open';
  }
}
```

### 12.3 Graceful Degradation for RAG

When vector search fails, the chat service still works — it generates responses without document context:

```typescript
// services/chat/src/rag/rag.service.ts
async retrieveContext(query: string, workspaceId: string): Promise<RetrievalResult> {
  try {
    const result = await this.vectorService.search({ query, workspaceId, topK: 5 });
    return { context: result, fromCache: false, degraded: false };
  } catch (error) {
    this.logger.warn('Vector search failed, generating without context', error);
    return { context: null, fromCache: false, degraded: true };
  }
}
```

---

## 13. Security Requirements

### 13.1 JWT Flow
- **Access token**: 15min TTL, contains `{sub: userId, email, workspaces: [{id, role}]}`, signed with RS256
- **Refresh token**: 30d TTL, opaque random string stored in Redis with `ws:{userId}:refresh:{token}`
- **API key auth**: Long-lived keys for programmatic access, prefixed `af_live_` / `af_test_`, hashed with bcrypt

### 13.2 Signed Upload URLs
- Upload service generates pre-signed S3 URLs (5min TTL)
- Client uploads directly to S3 — upload service never sees file content
- File size validated via `Content-Length` header on complete

### 13.3 Encryption at Rest
- MongoDB: Encrypted storage engine (cloud providers) or LUKS disk encryption
- S3: Server-side encryption with S3-managed keys (SSE-S3) or KMS (SSE-KMS)
- Qdrant: Storage encrypted at rest via disk-level encryption
- Redis: `requirepass` + TLS for in-transit, disk encryption at rest

### 13.4 GDPR Deletion Flow
```typescript
// When a workspace is deleted or user requests data deletion:
async deleteWorkspaceData(workspaceId: string): Promise<void> {
  // 1. Delete all Qdrant points in collection
  await this.vectorService.deleteCollection(`workspace_${workspaceId}`);

  // 2. Delete all S3 objects with workspace prefix
  await this.storageService.deletePrefix(`workspace/${workspaceId}/`);

  // 3. Delete all MongoDB documents scoped to workspace
  await this.documentModel.deleteMany({ workspace: workspaceId });
  await this.conversationModel.deleteMany({ workspace: workspaceId });
  await this.messageModel.deleteMany({ workspace: workspaceId });
  await this.subscriptionModel.deleteOne({ workspace: workspaceId });

  // 4. Clear Redis cache
  await this.redis.delByPattern(`ws:${workspaceId}:*`);

  // 5. Emit deletion confirmed event
  await this.eventBus.publish('workspace.deleted', { workspaceId, deletedAt: new Date() });

  // 6. Audit log
  await this.auditLog.record('DATA_DELETED', { workspaceId, scope: 'full' });
}
```

### 13.5 Rate Limiting Per Plan
```typescript
// Applied at gateway level
const PLAN_RATE_LIMITS = {
  free:      { window: '1m', limit: 10,  burstLimit: 20 },
  basic:     { window: '1m', limit: 30,  burstLimit: 60 },
  standard:  { window: '1m', limit: 60,  burstLimit: 120 },
  premium:   { window: '1m', limit: 120, burstLimit: 240 },
};

// AI-specific limits (per day)
const AI_RATE_LIMITS = {
  free:      { messages: 20,  embeddingRequests: 50 },
  basic:     { messages: 200, embeddingRequests: 500 },
  standard:  { messages: 1000, embeddingRequests: 2000 },
  premium:   { messages: Infinity, embeddingRequests: Infinity },
};
```

---

## 14. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
**Goal**: Working gateway, auth, and basic chat without RAG

| Week | Deliverable |
|------|-------------|
| 1 | Project scaffold (NestJS monorepo, Docker Compose), shared libs (common, database, rabbitmq) |
| 1 | Auth service (register, login, JWT, refresh) |
| 2 | User service (profiles, workspaces, membership) |
| 2 | API Gateway (routing, JWT validation, rate limiting) |
| 3 | Conversation service (CRUD, messages) |
| 3 | AI Chat service with OpenAI adapter only (no RAG, direct LLM call) |
| 3 | SSE streaming for chat responses |

**Exit criteria**: User can register, login, create workspace, and chat with OpenAI directly.

### Phase 2: Document Pipeline (Weeks 4-6)
**Goal**: Upload, process, and index documents

| Week | Deliverable |
|------|-------------|
| 4 | File Upload service (chunked upload, S3, signed URLs, progress tracking) |
| 4 | RabbitMQ setup (exchanges, queues, dead letters) |
| 5 | Document Processing service (text extraction: PDF, DOCX, TXT, CSV, MD, HTML) |
| 5 | Chunking strategies (semantic, with overlap) |
| 6 | Embedding service (OpenAI text-embedding-3-small) |
| 6 | Vector Search service (Qdrant client, collection management, upsert) |
| 6 | Worker pool (consume doc.processing + embedding queues) |

**Exit criteria**: User can upload a PDF, see it processed, and query it via search API.

### Phase 3: RAG Integration (Weeks 7-9)
**Goal**: Full RAG pipeline wired end-to-end

| Week | Deliverable |
|------|-------------|
| 7 | RAG orchestration in Chat service (query → embed → search → assemble → generate) |
| 7 | Source citation in responses |
| 8 | Conversation memory (last N messages in context window) |
| 8 | Token budget management (truncate context to fit model limits) |
| 9 | Remaining LLM adapters (Gemini, GLM, Claude, OpenRouter) |
| 9 | Provider fallback chain |
| 9 | Search result caching in Redis |

**Exit criteria**: User chats and gets AI responses grounded in their uploaded documents, with source citations.

### Phase 4: Billing & Usage (Weeks 10-11)
**Goal**: Subscription enforcement and usage metering

| Week | Deliverable |
|------|-------------|
| 10 | Billing service (plans, subscriptions, plan limits) |
| 10 | Usage tracking (RabbitMQ consumer, usage records, aggregation) |
| 11 | Subscription enforcement middleware at gateway |
| 11 | Invoice generation |
| 11 | Admin dashboard APIs (usage stats, revenue) |

**Exit criteria**: Users on free plan hit limits, upgrade flow works, usage is metered per workspace.

### Phase 5: Production Hardening (Weeks 12-14)
**Goal**: Production-ready deployment

| Week | Deliverable |
|------|-------------|
| 12 | Notification service (webhooks, email) |
| 12 | Audit logging (persistent, GDPR deletion flow) |
| 13 | Kubernetes manifests (all services + infra) |
| 13 | CI/CD pipeline (build, test, deploy) |
| 14 | Load testing + performance tuning |
| 14 | Security audit (OWASP checklist, penetration test) |
| 14 | Monitoring (Prometheus metrics, Grafana dashboards, distributed tracing with OpenTelemetry) |

**Exit criteria**: System handles 100 concurrent chat sessions, auto-scales workers, recovers from any single-service failure.

---

## 15. Production Best Practices

### Observability
- **Structured logging**: JSON logs with `{service, traceId, workspaceId, userId, level, message, error}`
- **Distributed tracing**: OpenTelemetry with trace propagation across service calls
- **Metrics**: Prometheus counters/histograms per service (request latency, queue depth, LLM tokens, error rate)
- **Dashboards**: Grafana per-service health, billing revenue, AI usage, queue depth
- **Alerting**: PagerDuty on: error rate >5%, queue depth >1000, LLM latency p99 >10s, pod restarts >3/5min

### CI/CD
- **Branch strategy**: `main` (production), `staging` (pre-prod), feature branches
- **Pipeline**: lint → unit test → build → integration test → deploy staging → smoke test → deploy prod
- **Container registry**: GitHub Container Registry or Docker Hub
- **Helm charts**: Parameterized per environment (dev/staging/prod)

### Database Operations
- **Migrations**: Versioned scripts in `scripts/migrations/`, run before service startup
- **Backups**: MongoDB daily snapshots, Qdrant snapshots on schedule, S3 cross-region replication
- **Index management**: Background index builds, monitor slow queries

### Cost Optimization
- **Embedding model**: Use `text-embedding-3-small` (cheaper) for production, `text-embedding-3-large` only if needed
- **Chat model**: Default to `gpt-4o-mini` for cost, auto-upgrade to `gpt-4o` for complex queries
- **Caching**: Cache embedding results for identical queries (hash-based dedup)
- **Context window**: Truncate aggressively — top 3-5 chunks usually sufficient
- **Batching**: Embed 100 chunks per API call, not 1-by-1