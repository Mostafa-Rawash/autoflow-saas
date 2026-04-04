const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.GEMINI_ROBOT_API_KEY || "shared-secret-key";

/**
 * Dual Authentication Middleware
 * Accepts two types of authentication:
 * 1. JWT Bearer Token (API - PHP Web App) -> source: "api"
 * 2. API Key (WhatsApp - Internal) -> source: "whatsapp"
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const apiKey = req.headers["x-api-key"];

  // Option 1: Check API Key first (WhatsApp - Internal)
  if (apiKey) {
    if (apiKey === API_KEY) {
      req.user = { source: "whatsapp", role: "internal" };
      console.log(`🔓 Auth: WhatsApp (API Key)`);
      return next();
    } else {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_API_KEY", message: "Invalid API key" },
      });
    }
  }

  // Option 2: Check JWT Bearer Token (API - PHP Web App)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");

    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: "JWT authentication not configured" },
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        ...decoded,
        source: "api"
      };
      console.log(`🔓 Auth: API (JWT) - User: ${decoded.userId || decoded.phone || "unknown"}`);
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
      });
    }
  }

  // No authentication provided
  return res.status(401).json({
    success: false,
    error: { code: "UNAUTHORIZED", message: "Authentication required" },
  });
}

/**
 * Optional Auth Middleware
 * Allows requests without auth, but attaches user if present
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const apiKey = req.headers["x-api-key"];

  // Check API Key
  if (apiKey && apiKey === API_KEY) {
    req.user = { source: "whatsapp", role: "internal" };
    return next();
  }

  // Check JWT
  if (authHeader && authHeader.startsWith("Bearer ") && JWT_SECRET) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { ...decoded, source: "api" };
    } catch (error) {
      // Token invalid, but continue without user
    }
  }

  next();
}

module.exports = { authMiddleware, optionalAuth };