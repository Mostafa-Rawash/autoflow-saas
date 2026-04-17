/**
 * @fileoverview Caching Service with Redis support
 * @module services/cache.service
 * @description Provides caching with Redis in production and in-memory fallback for development
 */

const NodeCache = require('node-cache');

// Try to load Redis, fall back to in-memory if not available
let Redis;
let redisClient = null;
let memoryCache = null;

/**
 * Initialize cache service
 * @returns {Promise<void>}
 */
const initCache = async () => {
  try {
    // Try to connect to Redis if URL is provided
    if (process.env.REDIS_URL) {
      Redis = require('ioredis');
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
        connectionPoolSize: 5
      });
      
      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
      });
      
      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis error, falling back to memory cache:', err.message);
        redisClient = null;
        initMemoryCache();
      });
      
      await redisClient.ping().catch(() => {
        console.warn('⚠️ Redis not available, using in-memory cache');
        redisClient = null;
        initMemoryCache();
      });
    } else {
      initMemoryCache();
    }
  } catch (err) {
    console.warn('⚠️ Redis module not available, using in-memory cache');
    redisClient = null;
    initMemoryCache();
  }
};

/**
 * Initialize in-memory cache
 */
const initMemoryCache = () => {
  memoryCache = new NodeCache({
    stdTTL: 300, // 5 minutes default
    checkperiod: 60, // Check for expired every 60 seconds
    useClones: false
  });
  console.log('📦 Using in-memory cache');
};

/**
 * Cache key generators
 */
const CacheKeys = {
  user: (userId) => `user:${userId}`,
  userSubscription: (userId) => `subscription:${userId}`,
  conversation: (conversationId) => `conversation:${conversationId}`,
  userConversations: (userId, page = 1) => `conversations:${userId}:${page}`,
  templates: (userId, page = 1) => `templates:${userId}:${page}`,
  analytics: (userId, period) => `analytics:${userId}:${period}`,
  rateLimit: (userId) => `ratelimit:${userId}`,
  whatsappStatus: (userId) => `whatsapp:${userId}:status`
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
const get = async (key) => {
  if (redisClient) {
    const value = await redisClient.get(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return null;
  }
  
  if (memoryCache) {
    return memoryCache.get(key) || null;
  }
  
  return null;
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} [ttl=300] - Time to live in seconds
 * @returns {Promise<boolean>}
 */
const set = async (key, value, ttl = 300) => {
  if (redisClient) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await redisClient.setex(key, ttl, stringValue);
    return true;
  }
  
  if (memoryCache) {
    memoryCache.set(key, value, ttl);
    return true;
  }
  
  return false;
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
const del = async (key) => {
  if (redisClient) {
    await redisClient.del(key);
    return true;
  }
  
  if (memoryCache) {
    memoryCache.del(key);
    return true;
  }
  
  return false;
};

/**
 * Delete multiple keys by pattern
 * @param {string} pattern - Key pattern (e.g., 'user:*')
 * @returns {Promise<number>} Number of keys deleted
 */
const delPattern = async (pattern) => {
  if (redisClient) {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return keys.length;
  }
  
  if (memoryCache) {
    // For node-cache, we need to get all keys and filter
    const stats = memoryCache.getStats();
    // Can't easily pattern match in node-cache, so flush all
    memoryCache.flushAll();
    return stats.keys;
  }
  
  return 0;
};

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
const exists = async (key) => {
  if (redisClient) {
    return (await redisClient.exists(key)) === 1;
  }
  
  if (memoryCache) {
    return memoryCache.has(key);
  }
  
  return false;
};

/**
 * Get or set cache value (cache-aside pattern)
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch value if not cached
 * @param {number} [ttl=300] - Time to live in seconds
 * @returns {Promise<any>}
 */
const getOrSet = async (key, fetchFn, ttl = 300) => {
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }
  
  const value = await fetchFn();
  await set(key, value, ttl);
  return value;
};

/**
 * Increment counter
 * @param {string} key - Cache key
 * @param {number} [by=1] - Increment by
 * @returns {Promise<number>} New value
 */
const incr = async (key, by = 1) => {
  if (redisClient) {
    return redisClient.incrby(key, by);
  }
  
  if (memoryCache) {
    const current = memoryCache.get(key) || 0;
    const newValue = current + by;
    memoryCache.set(key, newValue);
    return newValue;
  }
  
  return 0;
};

/**
 * Set cache with timestamp (for cache invalidation tracking)
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} [ttl=300] - Time to live in seconds
 * @returns {Promise<boolean>}
 */
const setWithTimestamp = async (key, value, ttl = 300) => {
  return set(key, {
    data: value,
    cachedAt: Date.now()
  }, ttl);
};

/**
 * Get cache stats
 * @returns {Promise<Object>}
 */
const getStats = async () => {
  if (redisClient) {
    const info = await redisClient.info('memory');
    const dbSize = await redisClient.dbsize();
    return {
      type: 'redis',
      keys: dbSize,
      info: info.split('\r\n').slice(0, 10)
    };
  }
  
  if (memoryCache) {
    const stats = memoryCache.getStats();
    return {
      type: 'memory',
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      ksize: stats.ksize,
      vsize: stats.vsize
    };
  }
  
  return { type: 'none' };
};

/**
 * Clear all cache
 * @returns {Promise<void>}
 */
const flushAll = async () => {
  if (redisClient) {
    await redisClient.flushdb();
  }
  
  if (memoryCache) {
    memoryCache.flushAll();
  }
};

/**
 * Close cache connection
 * @returns {Promise<void>}
 */
const close = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
  
  if (memoryCache) {
    memoryCache.close();
    memoryCache = null;
  }
};

// Initialize on require
initCache();

module.exports = {
  initCache,
  get,
  set,
  del,
  delPattern,
  exists,
  getOrSet,
  incr,
  setWithTimestamp,
  getStats,
  flushAll,
  close,
  CacheKeys
};