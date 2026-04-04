/**
 * WhatsApp Client Wrapper
 * Handles WhatsApp Web.js integration with event handling
 */
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { createServiceLogger } from './logger.js';
import { CONFIG } from './constants.js';
import fs from 'fs';

const log = createServiceLogger('WhatsAppClient');

const MAX_INIT_RETRIES = 3;
const INIT_RETRY_DELAY_MS = 3000;
const AUTO_RELINK_DELAY_MS = 5000;

export class WhatsAppClientWrapper {
  constructor(messageHandler = null) {
    this.client = null;
    this.eventHandlers = new Map();
    this.isReady = false;
    this.messageHandler = messageHandler;
    this.currentQR = null;
    this.qrTimestamp = null;
    this.QR_EXPIRY_MS = 60000;
    this.autoRelinkEnabled = true;
    this.isRelinking = false;
    this.relinkAttempts = 0;
    this.maxRelinkAttempts = 3;
    this.lastRelinkTime = 0;
    this.relinkCooldownMs = 30000;
    this.qrExpiryTimer = null;
    
    // Start initialization
    this.startInitialization();
  }

  async startInitialization() {
    // Kill any existing Chrome processes before starting
    log.info('Pre-initialization cleanup: killing all Chrome processes...');
    await this.killAllChromeProcesses();
    await this.delay(3000);
    
    try {
      await this.initializeClientWithRetry();
    } catch (error) {
      log.error('Initial initialization failed, triggering auto-relink...');
      await this.autoRelink('initial_init_failed');
    }
  }

  getCurrentQR() {
    if (this.currentQR && this.qrTimestamp) {
      const age = Date.now() - this.qrTimestamp;
      if (age > this.QR_EXPIRY_MS) {
        log.warn('QR code has expired');
        this.currentQR = null;
        this.qrTimestamp = null;
        return null;
      }
    }
    return this.currentQR;
  }

  async requestNewQR() {
    log.info('Requesting new QR code...');
    this.currentQR = null;
    this.qrTimestamp = null;
    
    // Destroy current client
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (error) {
        log.warn('Error destroying client:', error.message);
      }
    }
    
    // AGGRESSIVE: Kill all Chrome processes before requesting new QR
    await this.killAllChromeProcesses();
    await this.delay(2000);
    
    // Reset relink attempts for manual QR request
    this.relinkAttempts = 0;
    await this.initializeClientWithRetry();
    return { success: true, message: 'QR code request initiated' };
  }

  getConnectionStatus() {
    return {
      isReady: this.isReady,
      hasQR: !!this.currentQR,
    };
  }

  /**
   * Initialize client with internal retries (3 attempts)
   * This does NOT trigger auto-relink - it just throws on failure
   */
  async initializeClientWithRetry() {
    let retryCount = 0;
    
    while (retryCount < MAX_INIT_RETRIES) {
      log.info(`Creating WhatsApp client (attempt ${retryCount + 1}/${MAX_INIT_RETRIES})...`);
      
      // Use stable session directory to persist authentication
      const sessionDir = CONFIG.SESSION_SAVE_PATH;
      
      // CRITICAL: Create the session directory BEFORE starting Chrome
      try {
        log.info(`Creating session directory: ${sessionDir}`);
        fs.mkdirSync(sessionDir, { recursive: true });
        // Ensure directory is writable
        fs.accessSync(sessionDir, fs.constants.W_OK);
        log.info(`Session directory created and verified: ${sessionDir}`);
      } catch (dirError) {
        log.error(`Failed to create session directory: ${dirError.message}`);
        retryCount++;
        continue;
      }
      
      try {
        // Create and configure client with unique session directory
        this.client = new Client({
          puppeteer: {
            executablePath: CONFIG.PUPPETEER_EXECUTABLE_PATH,
            args: [
              '--no-sandbox', 
              '--disable-setuid-sandbox', 
              '--disable-dev-shm-usage', 
              '--disable-gpu',
              '--headless=new',
              '--disable-web-security',
              '--disable-extensions',
              '--disable-background-networking',
              '--disable-default-apps',
              '--disable-sync',
              '--disable-translate',
              '--metrics-recording-only',
              '--mute-audio',
              '--no-first-run',
              '--safebrowsing-disable-auto-update',
              // Additional args to prevent zombie processes
              '--disable-features=site-per-process',
              '--disable-breakpad',
              '--disable-component-update',
              '--disable-ipc-flooding-protection',
              // Fix data directory issues
              '--no-default-browser-check'
            ],
            timeout: CONFIG.PUPPETEER_TIMEOUT_MS,
            protocolTimeout: 60000
          },
          authStrategy: new LocalAuth({ dataPath: sessionDir })
        });

        this.setupEventHandlers();
        
        // Try to initialize
        await this.client.initialize();
        log.info('WhatsApp client initialized successfully');
        this.relinkAttempts = 0; // Reset relink counter on success
        return;
        
      } catch (error) {
        retryCount++;
        log.error(`Failed to initialize WhatsApp client: ${error.message}`);
        
        // IMPORTANT: Destroy the client to free resources
        if (this.client) {
          try {
            log.info('Destroying client to release browser lock...');
            await this.client.destroy();
          } catch (destroyError) {
            log.warn('Error destroying client:', destroyError.message);
          } finally {
            this.client = null;
          }
        }
        
        // AGGRESSIVE: Kill all Chrome processes immediately
        log.warn('Killing all Chrome processes before retry...');
        await this.killAllChromeProcesses();
        
        if (retryCount < MAX_INIT_RETRIES) {
          log.info(`Retrying initialization (${retryCount}/${MAX_INIT_RETRIES}) in ${INIT_RETRY_DELAY_MS}ms...`);
          await this.delay(INIT_RETRY_DELAY_MS);
        }
      }
    }
    
    // All retries exhausted
    throw new Error(`Failed to initialize after ${MAX_INIT_RETRIES} attempts`);
  }
  
  isSessionError(error) {
    const sessionErrors = [
      'Execution context was destroyed',
      'Session not found',
      'Invalid session',
      'auth_failure',
      'browser is already running'
    ];
    return sessionErrors.some(e => error.message?.includes(e));
  }

  shouldAutoRelink(error) {
    const relinkTriggers = [
      'Protocol error',
      'Target closed',
      'Navigation failed',
      'net::ERR_',
      'Page crashed',
      'Protocol timeout',
      'Session closed'
    ];
    return relinkTriggers.some(trigger => error.message?.includes(trigger));
  }

  async cleanupStaleSession() {
    try {
      const sessionPath = CONFIG.SESSION_SAVE_PATH;
      if (fs.existsSync(sessionPath)) {
        const stats = fs.statSync(sessionPath);
        const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        
        if (ageInDays > 7) {
          log.info(`Removing stale session (${ageInDays.toFixed(1)} days old)`);
          fs.rmSync(sessionPath, { recursive: true, force: true });
        }
      }
    } catch (error) {
      log.warn('Error cleaning up session:', error.message);
    }
  }

  async forceCleanupAllSessions() {
    log.warn('Force cleaning up ALL session data for relink...');
    try {
      // Kill only Chrome processes using our session directory (not ALL Chrome)
      await this.killAllChromeProcesses();
      
      // Wait extra time for file locks to be released
      await this.delay(2000);
      
      const paths = [
        CONFIG.SESSION_SAVE_PATH,
        '/app/.wwebjs_auth',
        '/app/.wwebjs_cache'
      ];
      
      for (const sessionPath of paths) {
        if (fs.existsSync(sessionPath)) {
          log.info(`Removing session data: ${sessionPath}`);
          fs.rmSync(sessionPath, { recursive: true, force: true });
        }
      }
      
      log.info('All session data cleared successfully');
    } catch (error) {
      log.error('Error during force cleanup:', error.message);
    }
  }
  
  async killAllChromeProcesses() {
    try {
      const { execSync } = await import('child_process');
      
      // Only kill Chrome processes using our session directory, not ALL Chrome
      const sessionDir = CONFIG.SESSION_SAVE_PATH;
      log.info(`Checking for Chrome processes using session directory: ${sessionDir}`);
      
      try {
        // Find Chrome processes that have our session dir in their command line
        // This is much safer than killing all Chrome processes
        const result = execSync(`ps aux | grep -E "(chrome|chromium)" | grep "${sessionDir}" | awk '{print $2}'`, { encoding: 'utf8' });
        const pids = result.trim().split('\n').filter(pid => pid.length > 0);
        
        if (pids.length > 0) {
          log.warn(`Found ${pids.length} Chrome process(es) using our session directory: ${pids.join(', ')}`);
          for (const pid of pids) {
            try {
              execSync(`kill -TERM ${pid}`, { stdio: 'ignore' });
              log.info(`Sent TERM signal to Chrome process ${pid}`);
            } catch (e) {
              // Process might already be dead
            }
          }
          
          // Wait for graceful shutdown
          await this.delay(2000);
          
          // Force kill any remaining
          for (const pid of pids) {
            try {
              // Check if process still exists
              execSync(`kill -0 ${pid}`, { stdio: 'ignore' });
              // If we get here, process still exists, force kill
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              log.info(`Force killed Chrome process ${pid}`);
            } catch (e) {
              // Process already dead, which is good
            }
          }
        } else {
          log.info('No Chrome processes found using our session directory');
        }
      } catch (e) {
        // No matching processes found, which is fine
        log.info('No zombie Chrome processes found for our session directory');
      }
      
    } catch (error) {
      log.warn('Error checking for Chrome processes:', error.message);
    }
  }
  
  // Alias for backward compatibility
  async killZombieChromeProcesses() {
    return this.killAllChromeProcesses();
  }

  /**
   * Auto-relink with full cleanup and retry
   * Handles the full relink cycle with max attempts
   */
  async autoRelink(reason = 'unknown') {
    // Prevent concurrent relinks
    if (this.isRelinking) {
      log.info('Auto-relink already in progress, skipping...');
      return;
    }

    if (!this.autoRelinkEnabled) {
      log.info('Auto-relink is disabled');
      return;
    }

    // Check if we've exceeded max relink attempts
    if (this.relinkAttempts >= this.maxRelinkAttempts) {
      log.error(`Max relink attempts (${this.maxRelinkAttempts}) reached. Manual intervention required.`);
      log.error('Please scan the QR code or restart the service.');
      return;
    }

    this.isRelinking = true;
    this.relinkAttempts++;
    this.lastRelinkTime = Date.now();
    
    log.warn(`Auto-relink triggered due to: ${reason} (attempt ${this.relinkAttempts}/${this.maxRelinkAttempts})`);

    try {
      // Check cooldown period
      const timeSinceLastRelink = Date.now() - this.lastRelinkTime + (this.relinkCooldownMs * (this.relinkAttempts - 1));
      if (this.relinkAttempts > 1 && timeSinceLastRelink < this.relinkCooldownMs) {
        const waitTime = this.relinkCooldownMs - timeSinceLastRelink;
        log.info(`Waiting for cooldown period (${Math.ceil(waitTime / 1000)}s)`);
        await this.delay(waitTime);
      }

      // Destroy current client
      if (this.client) {
        try {
          await this.client.destroy();
          log.info('Previous client destroyed');
        } catch (error) {
          log.warn('Error destroying client during relink:', error.message);
        }
      }

      // Clear all session data
      await this.forceCleanupAllSessions();

      // Reset state
      this.isReady = false;
      this.currentQR = null;
      this.qrTimestamp = null;

      // Wait before reinitializing
      log.info(`Waiting ${AUTO_RELINK_DELAY_MS}ms before reinitializing...`);
      await this.delay(AUTO_RELINK_DELAY_MS);

      // Attempt to initialize with retries
      log.info('Reinitializing WhatsApp client for relink...');
      await this.initializeClientWithRetry();
      
      // If we get here, initialization succeeded
      log.info('Auto-relink completed successfully');
      this.relinkAttempts = 0; // Reset on success
      
    } catch (error) {
      log.error(`Auto-relink attempt ${this.relinkAttempts} failed: ${error.message}`);
      
      if (this.relinkAttempts < this.maxRelinkAttempts) {
        log.info(`Will attempt relink ${this.maxRelinkAttempts - this.relinkAttempts} more time(s) on next failure`);
      } else {
        log.error('All relink attempts exhausted. Manual intervention required.');
        log.error('Please: 1) Check your internet connection, 2) Restart the service, 3) Scan the QR code');
      }
    } finally {
      this.isRelinking = false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      log.info('Received QR code for scanning');
      this.currentQR = qr;
      this.qrTimestamp = Date.now();
      console.log('\n========================================');
      console.log('  SCAN THIS QR CODE WITH WHATSAPP');
      console.log(`  Expires in ${this.QR_EXPIRY_MS/1000} seconds`);
      console.log('========================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n========================================\n');
      this.emit('qr', qr);
      
      // Clear any existing QR expiry timer
      if (this.qrExpiryTimer) {
        clearTimeout(this.qrExpiryTimer);
      }
      
      // Set timer to request new QR immediately when this one expires
      this.qrExpiryTimer = setTimeout(async () => {
        if (!this.isReady && this.currentQR === qr) {
          log.warn('QR code expired - requesting new QR code immediately...');
          try {
            await this.requestNewQR();
          } catch (error) {
            log.error('Failed to request new QR code:', error.message);
          }
        }
      }, this.QR_EXPIRY_MS);
    });

    this.client.on('ready', () => {
      log.info('WhatsApp client is ready');
      this.isReady = true;
      this.currentQR = null;
      this.qrTimestamp = null;
      this.relinkAttempts = 0; // Reset on successful connection
      
      // Clear QR expiry timer since we're connected
      if (this.qrExpiryTimer) {
        clearTimeout(this.qrExpiryTimer);
        this.qrExpiryTimer = null;
      }
      
      this.emit('ready');
    });

    this.client.on('message', async (message) => {
      log.info(`Received message from ${message.from}`);
      if (this.messageHandler) {
        try {
          await this.messageHandler(message);
        } catch (error) {
          log.error('Error handling message:', error);
        }
      }
      this.emit('message', message);
    });

    this.client.on('disconnected', (reason) => {
      log.warn(`WhatsApp client disconnected: ${reason}`);
      this.isReady = false;
      this.emit('disconnected', reason);
      // Auto-relink on disconnect
      this.autoRelink(`disconnected: ${reason}`);
    });

    this.client.on('error', (error) => {
      log.error('WhatsApp client error:', error);
      this.emit('error', error);
      // Check if error requires relinking
      if (this.shouldAutoRelink(error)) {
        this.autoRelink(`client error: ${error.message}`);
      }
    });

    this.client.on('authenticated', () => {
      log.info('WhatsApp client authenticated');
      this.emit('authenticated');
    });

    this.client.on('auth_failure', async (error) => {
      log.error('WhatsApp authentication failed:', error);
      this.isReady = false;
      this.emit('auth_failure', error);
      // Auto-relink on auth failure
      this.autoRelink('auth_failure');
    });

    this.client.on('loading_screen', (percent, message) => {
      log.info(`Loading: ${percent}% - ${message}`);
    });
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try { handler(data); } catch (error) { log.error(`Error in ${event} handler:`, error); }
      });
    }
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, new Set());
    this.eventHandlers.get(event).add(handler);
    log.debug(`Registered handler for event: ${event}`);
  }

  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) handlers.delete(handler);
  }

  getIsReady() {
    return this.isReady;
  }

  async sendMessage(chatId, text) {
    if (!this.isReady) throw new Error('WhatsApp client is not ready');
    log.info(`Sending message to ${chatId}`);
    const message = await this.client.sendMessage(chatId, text);
    log.info(`Message sent to ${chatId}`);
    return message;
  }

  async sendButtonsMessage(chatId, text, buttons) {
    if (!this.isReady) throw new Error('WhatsApp client is not ready');
    const { Buttons } = await import('whatsapp-web.js');
    const buttonList = buttons.map((btn, index) => ({ id: btn.id || `button_${index}`, text: btn.text }));
    const buttonsMessage = new Buttons(text, buttonList);
    return await this.client.sendMessage(chatId, buttonsMessage);
  }

  async getChat(chatId) {
    if (!this.isReady) throw new Error('WhatsApp client is not ready');
    return await this.client.getChatById(chatId);
  }

  async destroy() {
    if (this.client) {
      log.info('Destroying WhatsApp client');
      await this.client.destroy();
      this.isReady = false;
    }
  }

  setAutoRelink(enabled) {
    this.autoRelinkEnabled = enabled;
    log.info(`Auto-relink ${enabled ? 'enabled' : 'disabled'}`);
  }

  getAutoRelinkStatus() {
    return {
      enabled: this.autoRelinkEnabled,
      isRelinking: this.isRelinking,
      attemptsRemaining: this.maxRelinkAttempts - this.relinkAttempts
    };
  }

  async forceRelink() {
    log.info('Manual relink triggered');
    // Reset attempts for manual relink
    this.relinkAttempts = 0;
    await this.autoRelink('manual_trigger');
  }
}

export default WhatsAppClientWrapper;
