/**
 * Express Server
 * HTTP server setup with QR code endpoint for WhatsApp authentication
 */
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './constants.js';
import { createServiceLogger } from './logger.js';

const log = createServiceLogger('Server');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(whatsappClient = null) {
  const app = express();
  const httpServer = createServer(app);

  app.use(express.json({ limit: '50mb' }));
  
  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'whatsapp-webjs-service',
        connected: whatsappClient ? whatsappClient.getIsReady() : false,
      },
    });
  });

  // QR code HTML page
  app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'qr.html'));
  });

  // QR code API endpoint
  app.get('/api/qr', async (req, res) => {
    if (!whatsappClient) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'WhatsApp client not initialized',
        },
      });
    }

    const status = whatsappClient.getConnectionStatus();
    const qr = whatsappClient.getCurrentQR();

    res.json({
      success: true,
      data: {
        connected: status.isReady,
        qr: status.isReady ? null : qr,
        hasQR: !!qr,
        timestamp: new Date().toISOString(),
        message: status.isReady
          ? 'Already connected'
          : qr
            ? 'Scan QR code with WhatsApp'
            : 'QR code not available yet. Please wait or request a new one.',
      },
    });
  });

  // Request new QR code endpoint
  app.post('/api/qr/refresh', async (req, res) => {
    if (!whatsappClient) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'WhatsApp client not initialized',
        },
      });
    }

    try {
      const result = await whatsappClient.requestNewQR();
      res.json({
        success: true,
        data: {
          message: result.message,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      log.error('Error requesting new QR code:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  return { app, httpServer };
}

export async function startServer({ httpServer }) {
  return new Promise((resolve, reject) => {
    httpServer.listen(CONFIG.PORT, CONFIG.HOST, () => {
      log.info(`Server listening on ${CONFIG.HOST}:${CONFIG.PORT}`);
      resolve(CONFIG.PORT);
    });

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        log.error(`Port ${CONFIG.PORT} is already in use`);
      } else {
        log.error('Server error:', error);
      }
      reject(error);
    });
  });
}

export default { createApp, startServer };
