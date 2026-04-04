/**
 * WhatsApp Robot - Main Entry Point
 * 
 * Main application file that:
 * 1. Initializes all services (WhatsApp, Gemini, Conversation Manager)
 * 2. Sets up the HTTP server
 * 3. Handles WhatsApp messages
 * 4. Manages process locking to prevent multiple instances
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createApp, startServer } from './server.js';
import { ConversationManager } from './conversation-manager.js';
import { WhatsAppClientWrapper } from './whatsapp-client.js';
import { CONFIG } from './constants.js';
import { logger } from './logger.js';
import messageFormatter from './message-formatter.js';

const log = logger;

const LOCK_FILE = path.join(CONFIG.SESSION_SAVE_PATH, '.app-lock');

function acquireLock() {
  // Skip lock in Docker/container environments (no reliable PID)
  if (process.env.NODE_ENV === 'production' || process.env.CONTAINER === 'true') {
    log.info('Running in container mode - skipping process lock');
    return true;
  }

  try {
    const lockDir = path.dirname(LOCK_FILE);
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true });
    }

    if (fs.existsSync(LOCK_FILE)) {
      const lockAge = Date.now() - fs.statSync(LOCK_FILE).mtimeMs;
      const LOCK_TIMEOUT_MS = 5000; // Reduced to 5 seconds for faster recovery

      if (lockAge < LOCK_TIMEOUT_MS) {
        log.error(`Another instance is running (lock age: ${lockAge}ms)`);
        return false;
      } else {
        log.info(`Removing old lock (age: ${lockAge}ms)`);
        fs.unlinkSync(LOCK_FILE);
      }
    }

    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    log.info('Process lock acquired successfully');
    return true;
  } catch (error) {
    log.error('Failed to acquire lock', error);
    return false;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
      log.info('Process lock released');
    }
  } catch (error) {
    log.error('Failed to release lock', error);
  }
}

async function handleMessage(message) {
  try {
    if (message.isStatus || message.isGroup) return;

    const phoneNumber = message.from;
    const contact = await message.getContact();
    const name = contact.pushname || contact.name || 'User';

    log.info(`[${phoneNumber}] Message from ${name}: ${message.type}`);

    if (CONFIG.AUTHORIZED_NUMBERS.length > 0 && 
        !CONFIG.AUTHORIZED_NUMBERS.some(num => phoneNumber.includes(num))) {
      log.warn(`[${phoneNumber}] Unauthorized number, ignoring`);
      // await message.reply('⛔ Unauthorized. Please contact the administrator.');
      return;
    }

    const conversationManager = global.conversationManager;
    conversationManager.getConversation(phoneNumber);

    if (message.type === 'audio' || message.type === 'voice') {
      await handleAudioMessage(message, phoneNumber, conversationManager);
    } 
    else if (message.type === 'text' || message.type === 'chat') {
      await handleTextMessage(message, phoneNumber, conversationManager);
    }
    else {
      log.info(`[${phoneNumber}] Unsupported message type: ${message.type}`);
    }
  } catch (error) {
    log.error(`[${message.from}] Error handling message:`, error);
    try {
      await message.reply(messageFormatter.errorMessage(error));
    } catch (replyError) {
      log.error('Failed to send error message:', replyError);
    }
  }
}

async function handleAudioMessage(message, phoneNumber, conversationManager) {
  try {
    log.info(`[${phoneNumber}] Processing audio message`);
    
    const media = await message.downloadMedia();
    
    if (!media || !media.data) {
      await message.reply('❌ Failed to download audio. Please try again.');
      return;
    }

    const result = await conversationManager.processAudio(phoneNumber, media.data, phoneNumber);

    if (result.questions) {
      const questionMsg = messageFormatter.clarificationQuestions(result.questions, result.transcription);
      await message.reply(questionMsg);
    } 
    else if (result.message) {
      await message.reply(result.message);
    }
  } catch (error) {
    log.error(`[${phoneNumber}] Audio processing error:`, error);
    await message.reply(messageFormatter.errorMessage(error));
  }
}

async function handleTextMessage(message, phoneNumber, conversationManager) {
  const text = message.body.trim().toLowerCase();

  if (text === 'help' || text === '/help') {
    await message.reply(messageFormatter.helpMessage());
    return;
  }
  
  if (text === 'status' || text === '/status') {
    await message.reply('✅ Service is running normally');
    return;
  }

  if (text === 'start' || text === '/start') {
    await message.reply(messageFormatter.welcomeMessage());
    return;
  }

  try {
    const result = await conversationManager.processText(phoneNumber, message.body);
    if (result.message) await message.reply(result.message);
  } catch (error) {
    log.error(`[${phoneNumber}] Text processing error:`, error);
    await message.reply(messageFormatter.errorMessage(error));
  }
}

async function main() {
  if (!acquireLock()) {
    log.error('Cannot start - another instance is running');
    process.exit(1);
  }

  try {
    log.info('Starting WhatsApp Robot service...');
    log.info(`Authorized numbers: ${CONFIG.AUTHORIZED_NUMBERS.join(', ') || 'None'}`);

    const conversationManager = new ConversationManager(CONFIG.GEMINI_URL);
    
    global.conversationManager = conversationManager;

    const whatsappClient = new WhatsAppClientWrapper(handleMessage);

    const { app, httpServer } = createApp(whatsappClient);

    await startServer({ app, httpServer });

    log.info('WhatsApp Robot service started successfully');
    log.info(`Server running on port ${CONFIG.PORT}`);

  } catch (error) {
    log.error('Failed to start application', error);
    releaseLock();
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  log.info('Received SIGTERM, shutting down...');
  releaseLock();
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('Received SIGINT, shutting down...');
  releaseLock();
  process.exit(0);
});

main().catch((error) => {
  log.error('Unexpected error in main', error);
  releaseLock();
  process.exit(1);
});

export default main;
