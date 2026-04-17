const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Super admin emails (can be configured via env)
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

// Check if user is super admin
exports.isSuperAdmin = (email) => {
  return SUPER_ADMIN_EMAILS.includes(email);
};

// Protect admin routes
exports.adminAuth = async (req, res, next) => {
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
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error',
        code: 'SERVER_CONFIG_ERROR'
      });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
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
    
    // Check if super admin
    if (!exports.isSuperAdmin(user.email)) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }
    
    req.user = user;
    req.isAdmin = true;
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

// Audit log middleware
exports.auditLog = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Log after response
      if (req.user) {
        console.log(`[AUDIT] ${new Date().toISOString()} | ${req.user.email} | ${action} | ${req.method} ${req.path} | ${res.statusCode}`);
        
        // TODO: Save to AuditLog model if needed
        // AuditLog.create({
        //   user: req.user._id,
        //   action,
        //   method: req.method,
        //   path: req.path,
        //   statusCode: res.statusCode,
        //   ip: req.ip,
        //   userAgent: req.headers['user-agent']
        // });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = exports;