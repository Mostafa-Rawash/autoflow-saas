function idempotencyMiddleware(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) {
    return next();
  }

  req.idempotencyKey = key;
  next();
}

module.exports = idempotencyMiddleware;
