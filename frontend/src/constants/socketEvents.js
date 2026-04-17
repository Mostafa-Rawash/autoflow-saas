/**
 * Socket.io Event Constants
 * Shared between frontend and backend for type safety
 */

export const SOCKET_EVENTS = {
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

export const USER_ROOM_PREFIX = 'user-';

export const SOCKET_ERRORS = {
  NOT_AUTHENTICATED: 'not_authenticated',
  ROOM_NOT_FOUND: 'room_not_found',
  PERMISSION_DENIED: 'permission_denied'
};

export default SOCKET_EVENTS;