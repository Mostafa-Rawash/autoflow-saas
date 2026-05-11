import { logsAPI } from '../api';

/**
 * Frontend Error Catcher
 * Catches and logs all frontend errors to the backend
 */

// Initialize error catching
export const initErrorCatcher = () => {
  // Catch unhandled errors
  window.onerror = function(message, source, lineno, colno, error) {
    logFrontendError({
      message: message?.toString() || 'Unknown error',
      error: error?.message || message?.toString(),
      url: source || window.location.href,
      line: lineno,
      column: colno,
      stack: error?.stack
    });
    return false;
  };

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    logFrontendError({
      message: error?.message || 'Unhandled Promise Rejection',
      error: error?.message || String(error),
      url: window.location.href,
      stack: error?.stack
    });
  });

  // Catch React errors (via error boundary)
  console.log('🔍 Frontend error catcher initialized');
};

// Log frontend error to backend
const logFrontendError = async (errorData) => {
  try {
    // Only log if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      await logsAPI.logFrontendError(errorData);
    }
  } catch (err) {
    // Don't cause infinite loop
    console.error('Failed to log frontend error:', err);
  }
};

// Log API error
export const logAPIError = async (error, request) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await logsAPI.logFrontendError({
        message: `API Error: ${request?.method || 'GET'} ${request?.url || ''}`,
        error: error?.response?.data?.error || error?.message || String(error),
        url: request?.url || window.location.href,
        stack: error?.stack
      });
    }
  } catch (err) {
    console.error('Failed to log API error:', err);
  }
};

// Console override for development
export const overrideConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function(...args) {
    // Call original
    originalError.apply(console, args);
    
    // Log to backend (debounced)
    const message = args.map(a => 
      typeof a === 'object' ? JSON.stringify(a) : String(a)
    ).join(' ');
    
    logFrontendError({
      message: `Console Error: ${message.substring(0, 200)}`,
      error: message,
      url: window.location.href
    });
  };

  console.warn = function(...args) {
    // Call original
    originalWarn.apply(console, args);
    
    // Optionally log warnings too
  };
};

export default {
  init: initErrorCatcher,
  logAPIError,
  overrideConsole
};