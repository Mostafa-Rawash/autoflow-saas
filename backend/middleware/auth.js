/**
 * @fileoverview AutoFlow SaaS - Authentication Middleware
 * @description Handles JWT authentication, authorization, subscription checks, and rate limiting
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Role = require('../models/Role');

/**
 * Token types for JWT
 * @readonly
 * @enum {string}
 */
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh'
};

/**
 * Token expiry durations
 * @readonly
 * @enum {string}
 */
const TOKEN_EXPIRY = {
  ACCESS: '15m',
  REFRESH: '30d'
};

/**
 * Token pair returned after authentication
 * @typedef {Object} TokenPair
 * @property {string} accessToken - Short-lived access token (15 min)
 * @property {string} refreshToken - Long-lived refresh token (30 days)
 */

/**
 * JWT decoded payload
 * @typedef {Object} TokenPayload
 * @property {string} id - User ID
 * @property {string} type - Token type ('access' | 'refresh')
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 */

/**
 * Verification result
 * @typedef {Object} VerifyResult
 * @property {boolean} valid - Whether token is valid
 * @property {TokenPayload} [decoded] - Decoded payload if valid
 * @property {string} [error] - Error message if invalid
 */

/**
 * Generate access and refresh tokens for a user
 * @param {string} userId - MongoDB user ID
 * @returns {TokenPair} Object containing both tokens
 * @throws {Error} If JWT_SECRET is not configured
 */
const generateTokens = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  const accessToken = jwt.sign(
    { id: userId, type: TOKEN_TYPES.ACCESS },
    jwtSecret,
    { expiresIn: TOKEN_EXPIRY.ACCESS }
  );
  
  const refreshToken = jwt.sign(
    { id: userId, type: TOKEN_TYPES.REFRESH },
    jwtSecret,
    { expiresIn: TOKEN_EXPIRY.REFRESH }
  );
  
  return { accessToken, refreshToken };
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} [expectedType] - Expected token type ('access' | 'refresh')
 * @returns {VerifyResult} Verification result with decoded payload or error
 */
const verifyToken = (token, expectedType = null) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    if (expectedType && decoded.type !== expectedType) {
      throw new Error('Invalid token type');
    }
    
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Express middleware to protect routes with JWT authentication
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 * 
 * @example
 * router.get('/protected', auth, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
exports.auth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    const isRefreshRequest = req.path === '/refresh' && req.headers['x-refresh-token'];
    if (isRefreshRequest) {
      token = req.headers['x-refresh-token'];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authorized to access this route',
        code: 'NO_TOKEN'
      });
    }
    
    const expectedType = isRefreshRequest ? TOKEN_TYPES.REFRESH : TOKEN_TYPES.ACCESS;
    const { valid, decoded, error } = verifyToken(token, expectedType);
    
    if (!valid) {
      return res.status(401).json({ 
        success: false,
        error: error === 'jwt expired' ? 'Token expired' : 'Invalid token',
        code: error === 'jwt expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      });
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }
    
    req.user = user;
    req.tokenType = decoded.type;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ 
      success: false,
      error: 'Not authorized to access this route',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Refresh access token middleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
exports.refreshToken = async (req, res, next) => {
  try {
    if (req.tokenType !== TOKEN_TYPES.REFRESH) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }
    
    const { accessToken, refreshToken } = generateTokens(req.user._id);
    
    req.user.lastLogin = new Date();
    await req.user.save();
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to refresh token',
      code: 'REFRESH_FAILED'
    });
  }
};

/**
 * Middleware factory to authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {import('express').RequestHandler} Express middleware
 * 
 * @example
 * router.delete('/user/:id', auth, authorize('admin'), deleteUser);
 */
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`,
        code: 'FORBIDDEN_ROLE'
      });
    }
    next();
  };
};

/**
 * Middleware factory to check specific permission
 * @param {string} permission - Required permission name
 * @returns {import('express').RequestHandler} Express middleware
 * 
 * @example
 * router.post('/templates', auth, hasPermission('createTemplates'), createTemplate);
 */
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const role = await Role.findOne({ name: req.user.role });
      
      if (!role) {
        return res.status(403).json({ 
          success: false,
          error: 'Role not found',
          code: 'ROLE_NOT_FOUND'
        });
      }
      
      if (!role.hasPermission(permission)) {
        return res.status(403).json({ 
          success: false,
          error: `You don't have permission to '${permission}'`,
          code: 'NO_PERMISSION'
        });
      }
      
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        error: 'Server error checking permissions',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to check subscription status and limits
 * Attaches subscription to req.subscription
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
exports.checkSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      const newSubscription = new Subscription({
        user: req.user._id,
        plan: 'free',
        status: 'trialing',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        amount: 0
      });
      await newSubscription.save();
      req.subscription = newSubscription;
    } else {
      req.subscription = subscription;
      
      if (!subscription.isActive()) {
        return res.status(402).json({ 
          success: false,
          error: 'Your subscription is not active. Please renew your subscription.',
          code: 'SUBSCRIPTION_INACTIVE',
          subscription: {
            plan: subscription.plan,
            status: subscription.status,
            endDate: subscription.endDate
          }
        });
      }
      
      if (subscription.isTrialExpired() && subscription.status === 'trialing') {
        return res.status(402).json({ 
          success: false,
          error: 'Your trial period has ended. Please subscribe to continue.',
          code: 'TRIAL_EXPIRED',
          subscription: {
            plan: subscription.plan,
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt
          }
        });
      }
    }
    
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error checking subscription',
      code: 'SUBSCRIPTION_CHECK_ERROR'
    });
  }
};

/**
 * Middleware factory to check resource limits
 * @param {'conversations' | 'messages' | 'teamMembers' | 'templates' | 'channels'} resource - Resource type to check
 * @returns {import('express').RequestHandler} Express middleware
 * 
 * @example
 * router.post('/conversations', auth, checkSubscription, checkLimit('conversations'), createConversation);
 */
exports.checkLimit = (resource) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription || await Subscription.findOne({ user: req.user._id });
      
      if (!subscription) {
        return res.status(402).json({ 
          success: false,
          error: 'No subscription found',
          code: 'NO_SUBSCRIPTION'
        });
      }
      
      if (subscription.hasExceededLimit(resource)) {
        return res.status(402).json({ 
          success: false,
          error: `You have exceeded your ${resource} limit. Please upgrade your plan.`,
          code: 'LIMIT_EXCEEDED',
          limit: subscription.limits[resource],
          usage: subscription.usage[resource],
          percentage: subscription.getUsagePercentage(resource)
        });
      }
      
      subscription.usage[resource] += 1;
      await subscription.save();
      
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        error: 'Server error checking limits',
        code: 'LIMIT_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware factory to decrement usage counter
 * @param {'conversations' | 'messages' | 'teamMembers' | 'templates' | 'channels'} resource - Resource type
 * @returns {import('express').RequestHandler} Express middleware
 */
exports.decrementUsage = (resource) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ user: req.user._id });
      
      if (subscription && subscription.usage[resource] > 0) {
        subscription.usage[resource] -= 1;
        await subscription.save();
      }
      
      next();
    } catch (err) {
      console.error('Error decrementing usage:', err);
      next();
    }
  };
};

/**
 * Middleware factory to check if user can add more resources
 * @param {'conversations' | 'messages' | 'teamMembers' | 'templates' | 'channels'} resource - Resource type
 * @param {number} [count=1] - Number of resources to add
 * @returns {import('express').RequestHandler} Express middleware
 */
exports.canAdd = (resource, count = 1) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription || await Subscription.findOne({ user: req.user._id });
      
      if (!subscription) {
        return res.status(402).json({ 
          success: false,
          error: 'No subscription found',
          code: 'NO_SUBSCRIPTION'
        });
      }
      
      const newUsage = subscription.usage[resource] + count;
      
      if (newUsage > subscription.limits[resource] && subscription.limits[resource] !== Infinity) {
        return res.status(402).json({ 
          success: false,
          error: `Adding ${count} ${resource}(s) would exceed your plan limit.`,
          code: 'LIMIT_WOULD_EXCEED',
          current: subscription.usage[resource],
          limit: subscription.limits[resource],
          requested: count
        });
      }
      
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        error: 'Server error checking limits',
        code: 'LIMIT_CHECK_ERROR'
      });
    }
  };
};

// Export utilities
exports.generateTokens = generateTokens;
exports.verifyToken = verifyToken;
exports.TOKEN_TYPES = TOKEN_TYPES;
exports.TOKEN_EXPIRY = TOKEN_EXPIRY;