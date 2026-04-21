function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  const organizationId = req.headers['x-organization-id'];

  if (!userId || !organizationId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    id: userId,
    organizationId,
    role: req.headers['x-user-role'] || 'agent'
  };

  next();
}

module.exports = authMiddleware;
