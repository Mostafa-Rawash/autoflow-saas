/**
 * Error handler classes
 * Custom error types for different error scenarios
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, 'AUTHORIZATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', details = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

export class CircuitBreakerOpenError extends AppError {
  constructor(message = 'Service temporarily unavailable', details = null) {
    super(message, 503, 'CIRCUIT_BREAKER_OPEN', details);
  }
}

export function serializeError(error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details })
      }
    };
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred'
    }
  };
}

export default {
  AppError, ValidationError, AuthorizationError, NotFoundError,
  RateLimitError, ServiceUnavailableError, CircuitBreakerOpenError,
  serializeError
};
