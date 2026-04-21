function tenantMiddleware(req, res, next) {
  const organizationId = req.headers['x-organization-id'] || req.user?.organizationId || req.organizationId;

  if (!organizationId) {
    return res.status(400).json({ error: 'organization_id is required' });
  }

  req.organizationId = organizationId;
  res.locals.organizationId = organizationId;
  next();
}

module.exports = tenantMiddleware;
