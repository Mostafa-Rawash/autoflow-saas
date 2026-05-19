/**
 * Socket.io Event Constants
 * Shared between frontend and backend for type safety
 */

// Connection events
const SOCKET_EVENTS = {
  // Authentication
  AUTHENTICATE: 'authenticate',
  
  // WhatsApp lifecycle
  WHATSAPP_QR: 'whatsapp-qr',
  WHATSAPP_CONNECTED: 'whatsapp-connected',
  WHATSAPP_DISCONNECTED: 'whatsapp-disconnected',
  WHATSAPP_ERROR: 'whatsapp-error',
  WHATSAPP_LOADING: 'whatsapp-loading',
  
  // Conversation events
  JOIN_CONVERSATION: 'join-conversation',
  LEAVE_CONVERSATION: 'leave-conversation',
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message',
  
  // Generic
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect'
};

// User room prefix for targeted events
const USER_ROOM_PREFIX = 'user-';

// Error codes
const SOCKET_ERRORS = {
  NOT_AUTHENTICATED: 'not_authenticated',
  ROOM_NOT_FOUND: 'room_not_found',
  PERMISSION_DENIED: 'permission_denote'
};

// Event Bus event names (shared with eventBus.service.js)
const EVENT_BUS_EVENTS = {
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_SENT: 'message.sent',
  MESSAGE_FAILED: 'message.failed',
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_UPDATED: 'conversation.updated',
  CONVERSATION_STATUS_CHANGED: 'conversation.status_changed',
  CONVERSATION_ASSIGNED: 'conversation.assigned',
  CONVERSATION_RESOLVED: 'conversation.resolved',
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CHANNEL_CONNECTED: 'channel.connected',
  CHANNEL_DISCONNECTED: 'channel.disconnected',
  AUTO_REPLY_MATCHED: 'autoreply.matched',
  AI_RESPONSE_SENT: 'ai.response_sent',
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  CSAT_SUBMITTED: 'csat.submitted'
};

module.exports = {
  SOCKET_EVENTS,
  USER_ROOM_PREFIX,
  SOCKET_ERRORS,
  EVENT_BUS_EVENTS
};