/**
 * Standard API Response Helpers
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response format
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 * @returns {Object} Standardized success response
 */
const successResponse = (data, message = null) => {
  const response = {
    success: true,
    ...data
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
};

/**
 * Error response format
 * @param {string} error - Error message
 * @param {string} code - Error code for frontend handling
 * @param {number} status - HTTP status code
 * @param {Object} details - Additional error details (validation errors, etc.)
 * @returns {Object} Standardized error response
 */
const errorResponse = (error, code = 'ERROR', status = 400, details = null) => {
  const response = {
    success: false,
    error,
    code
  };
  
  if (details) {
    response.details = details;
  }
  
  return { response, status };
};

/**
 * Common error codes
 */
const ERROR_CODES = {
  // Authentication errors
  NO_TOKEN: 'NO_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_EXISTS: 'USER_EXISTS',
  
  // Authorization errors
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  NO_PERMISSION: 'NO_PERMISSION',
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  
  // Subscription errors
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  LIMIT_WOULD_EXCEED: 'LIMIT_WOULD_EXCEED',
  NO_SUBSCRIPTION: 'NO_SUBSCRIPTION',
  INVALID_PLAN: 'INVALID_PLAN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVER_CONFIG_ERROR: 'SERVER_CONFIG_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Channel errors
  CHANNEL_NOT_CONNECTED: 'CHANNEL_NOT_CONNECTED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

/**
 * Async handler wrapper to catch errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Express route handler with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Route error:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const { response, status } = errorResponse(
        'Validation failed',
        ERROR_CODES.VALIDATION_ERROR,
        400,
        Object.values(error.errors).map(e => ({ field: e.path, message: e.message }))
      );
      return res.status(status).json(response);
    }
    
    // Mongoose duplicate key error
    if (error.code === 11000) {
      const { response, status } = errorResponse(
        'Resource already exists',
        ERROR_CODES.ALREADY_EXISTS,
        400
      );
      return res.status(status).json(response);
    }
    
    // Mongoose cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      const { response, status } = errorResponse(
        'Invalid resource ID',
        ERROR_CODES.NOT_FOUND,
        400
      );
      return res.status(status).json(response);
    }
    
    // Default server error
    const { response, status } = errorResponse(
      process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      ERROR_CODES.SERVER_ERROR,
      500
    );
    res.status(status).json(response);
  });
};

module.exports = {
  successResponse,
  errorResponse,
  ERROR_CODES,
  asyncHandler
};