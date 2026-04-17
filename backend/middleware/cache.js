/**
 * @fileoverview Caching Middleware
 * @module middleware/cache
 * @description Express middleware for route-level caching
 */

const cache = require('../services/cache.service');

/**
 * Middleware factory for caching responses
 * @param {number} [ttl=60] - Time to live in seconds
 * @param {Function} [keyFn] - Function to generate cache key from request
 * @returns {import('express').RequestHandler} Express middleware
 * 
 * @example
 * // Cache for 5 minutes with default key (user:id:path)
 * router.get('/conversations', auth, cacheMiddleware(300), getConversations);
 * 
 * // Custom key generation
 * router.get('/analytics', auth, cacheMiddleware(300, (req) => `analytics:${req.user.id}:${req.query.period}`), getAnalytics);
 */
const cacheMiddleware = (ttl = 60, keyFn = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip caching for unauthenticated routes
    if (!req.user) {
      return next();
    }
    
    // Generate cache key
    const key = keyFn 
      ? keyFn(req) 
      : `route:${req.user.id}:${req.originalUrl}`;
    
    try {
      // Try to get from cache
      const cached = await cache.get(key);
      
      if (cached !== null) {
        // Return cached response
        return res.json({
          ...cached,
          _cached: true
        });
      }
      
      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to cache response
      res.json = (data) => {
        // Only cache successful responses
        if (data && data.success !== false && res.statusCode === 200) {
          cache.set(key, data, ttl).catch(err => {
            console.error('Cache set error:', err);
          });
        }
        
        return originalJson(data);
      };
      
      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

/**
 * Middleware to invalidate cache for a pattern
 * @param {string|Function} pattern - Pattern string or function to generate pattern
 * @returns {import('express').RequestHandler} Express middleware
 * 
 * @example
 * // Invalidate all user-related cache when profile updated
 * router.put('/profile', auth, invalidateCache('user:*'), updateProfile);
 */
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to invalidate cache after successful response
    res.json = (data) => {
      if (data && data.success !== false) {
        const patternStr = typeof pattern === 'function' 
          ? pattern(req) 
          : pattern.replace('*', req.user?.id || '*');
        
        cache.delPattern(patternStr).catch(err => {
          console.error('Cache invalidation error:', err);
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Clear all cache for current user
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const clearUserCache = async (req, res, next) => {
  if (req.user) {
    await cache.delPattern(`*:${req.user.id}:*`);
    await cache.delPattern(`route:${req.user.id}:*`);
  }
  next();
};

/**
 * Cache user data middleware
 * Reduces database queries for frequently accessed user data
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const cacheUserMiddleware = async (req, res, next) => {
  if (!req.user) {
    return next();
  }
  
  try {
    const cacheKey = cache.CacheKeys.user(req.user.id);
    
    // Try to get user from cache
    const cachedUser = await cache.get(cacheKey);
    
    if (cachedUser) {
      // Use cached user data
      req.user = cachedUser;
    } else {
      // Cache user data for 5 minutes
      await cache.set(cacheKey, req.user.toObject ? req.user.toObject() : req.user, 300);
    }
    
    next();
  } catch (err) {
    console.error('Cache user middleware error:', err);
    next();
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearUserCache,
  cacheUserMiddleware
};