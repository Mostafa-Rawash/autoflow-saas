# Records-Analysis

AI-powered API that processes Arabic audio/text descriptions from beekeepers and converts them into structured hive inspection data using Google Gemini AI.

## Features

- **Audio Processing**: Converts Arabic speech (various dialects) to structured inspection data
- **Text Processing**: Analyzes text descriptions of hive inspections
- **Interactive Sessions**: Multi-turn conversations for confirming and editing analysis
- **Intent Detection**: Automatically detects user intent (confirm, edit, cancel, question)
- **Session Management**: 30-minute TTL sessions tied to phone numbers
- **Session Persistence**: Sessions saved to database on confirm/cancel/timeout
- **Database Integration**: Saves confirmed inspections and session history to external database service

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set GEMINI_API_KEY and DATABASE_ROBOT_URL

# Start server
npm start

# Or start in development mode
npm run dev
```

## Production Deployment

### Build for Production

```bash
# Clean install production dependencies
npm run build

# Start in production mode
npm run prod
```

### Production Environment Setup

1. **Environment Variables**
   ```bash
   # Required
   GEMINI_API_KEY=your_production_api_key
   
   # Database Configuration
   DATABASE_ROBOT_URL=https://your-database-service.com
   DATABASE_ROBOT_API_KEY=your_secure_api_key
   
   # Optional
   PORT=3001
   GEMINI_MODEL=gemini-3-flash-preview
   GEMINI_FALLBACK_MODEL=gemini-2.5-flash-preview
   ```

2. **Process Management (Recommended)**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start with PM2
   pm2 start server.js --name gemini-robot -i max
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

3. **Health Check**
   ```bash
   # Check service health
   curl http://localhost:3001/health
   ```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production API keys
- [ ] Set up database service connection
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable HTTPS/SSL
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure log management
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting
- [ ] Review security headers (CORS, Helmet)

### Reverse Proxy Example (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Session Storage

Sessions are automatically persisted to the database in these scenarios:
- **Confirm**: Session saved with `state: "completed"`
- **Cancel**: Session saved with `state: "cancelled"`
- **Timeout**: Session saved with `state: "expired"` (30 min TTL)

All sessions include:
- Conversation history
- Analysis data
- Transcription
- Metadata
- Timestamps

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Input
```
POST /api/v1/analyze
Content-Type: application/json

{
  "input": {
    "type": "audio|text",
    "data": "base64 encoded audio or text string",
    "mime_type": "audio/webm"  // optional for audio
  },
  "phone_number": "+1234567890"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `GEMINI_API_KEY` | Google Gemini API key (required) | - |
| `GEMINI_MODEL` | Primary Gemini model | gemini-3-flash-preview |
| `GEMINI_FALLBACK_MODEL` | Fallback model if primary fails | gemini-2.5-flash-preview |
| `DATABASE_ROBOT_URL` | Database service URL | http://localhost:3000 |
| `DATABASE_ROBOT_API_KEY` | API key for database service | shared-secret-key |

## Project Structure

```
├── server.js           # Express server and routes
├── audioProcessor.js   # Gemini AI integration and prompts
├── sessionStore.js     # In-memory session management
├── databaseClient.js   # Database robot API client
├── apairy_flat_schema.json  # Data schema
└── package.json
```

## Beekeeping Terminology Support

The AI understands various Arabic terms for:
- **Hive**: خلية, صندوق, قفير, قلية
- **Frame**: برواز, إطار, هذا فيه
- **Honey**: عسل, رشت, رشة, رحيق
- **Open Brood**: حضنة مفتوحة, حوي, شغال مفتوح
- **Sealed Brood**: حضنة مغلقة, غمي, ختوم, مختوم
- **Eggs**: بيض, صوب, صواب
- **Pollen**: ردم, خبز, غبار
- **Queen**: ملكة, العراد, الابو

## License

MIT
