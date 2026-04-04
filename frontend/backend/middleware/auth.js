const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Role = require('../models/Role');

// Protect routes
exports.auth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authorized to access this route',
        code: 'NO_TOKEN'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
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

// Authorize specific roles
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    // Check if user has one of the allowed roles
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

// Check specific permission
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

// Check subscription and limits
exports.checkSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      // Create free trial subscription
      const newSubscription = new Subscription({
        user: req.user._id,
        plan: 'free',
        status: 'trialing',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        amount: 0
      });
      await newSubscription.save();
      req.subscription = newSubscription;
    } else {
      req.subscription = subscription;
      
      // Check if subscription is active
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
      
      // Check if trial is expired
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

// Check if resource limit is exceeded
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
      
      // Track usage (increment)
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

// Check if subscription can add more (without incrementing)
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

// Get subscription limits for response
exports.getLimits = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (subscription) {
      req.limits = {
        plan: subscription.plan,
        limits: subscription.limits,
        usage: subscription.usage,
        isActive: subscription.isActive()
      };
    }
    
    next();
  } catch (err) {
    next(); // Continue even if error
  }
};