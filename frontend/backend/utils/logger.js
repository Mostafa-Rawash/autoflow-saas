const Log = require('../models/Log');

/**
 * Logger Utility
 * Centralized logging with database persistence
 */
class Logger {
  constructor(source = 'backend') {
    this.source = source;
  }

  /**
   * Log error
   */
  async error(message, data = {}) {
    console.error(`[ERROR] [${this.source}] ${message}`, data);
    
    try {
      return await Log.create({
        level: 'error',
        message,
        source: this.source,
        error: data.error ? {
          name: data.error.name,
          message: data.error.message,
          stack: data.error.stack,
          code: data.error.code
        } : undefined,
        request: data.request,
        response: data.response,
        user: data.user,
        metadata: data.metadata
      });
    } catch (err) {
      console.error('Failed to save error log:', err);
    }
  }

  /**
   * Log warning
   */
  async warn(message, data = {}) {
    console.warn(`[WARN] [${this.source}] ${message}`, data);
    
    try {
      return await Log.create({
        level: 'warn',
        message,
        source: this.source,
        user: data.user,
        metadata: data.metadata
      });
    } catch (err) {
      console.error('Failed to save warn log:', err);
    }
  }

  /**
   * Log info
   */
  async info(message, data = {}) {
    console.log(`[INFO] [${this.source}] ${message}`, data);
    
    try {
      return await Log.create({
        level: 'info',
        message,
        source: this.source,
        user: data.user,
        metadata: data.metadata
      });
    } catch (err) {
      console.error('Failed to save info log:', err);
    }
  }

  /**
   * Log debug
   */
  async debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${this.source}] ${message}`, data);
    }
    
    // Don't save debug logs to database in production
    if (process.env.NODE_ENV !== 'production') {
      try {
        return await Log.create({
          level: 'debug',
          message,
          source: this.source,
          user: data.user,
          metadata: data.metadata
        });
      } catch (err) {
        console.error('Failed to save debug log:', err);
      }
    }
  }

  /**
   * Log API request
   */
  async apiRequest(req, res, responseTime) {
    const data = {
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        },
        ip: req.ip,
        userAgent: req.headers['user-agent']
      },
      response: {
        statusCode: res.statusCode
      },
      metadata: {
        responseTime: `${responseTime}ms`
      }
    };

    // Add user info if authenticated
    if (req.user) {
      data.user = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      };
    }

    // Log errors with higher level
    if (res.statusCode >= 400) {
      await this.error(`API Error: ${req.method} ${req.originalUrl}`, data);
    } else {
      await this.info(`API: ${req.method} ${req.originalUrl}`, data);
    }
  }

  /**
   * Log frontend error
   */
  async frontendError(message, data = {}) {
    return await this.error(message, {
      ...data,
      source: 'frontend'
    });
  }
}

// Export singleton instances for different sources
module.exports = {
  Logger,
  api: new Logger('api'),
  auth: new Logger('auth'),
  whatsapp: new Logger('whatsapp'),
  database: new Logger('database'),
  system: new Logger('system')
};