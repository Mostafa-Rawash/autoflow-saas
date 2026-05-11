const Log = require('../models/Log');

const log = async ({ level = 'info', message, source = 'system', user = null, error = null, request = null, metadata = null }) => {
  try {
    const entry = {
      level,
      message,
      source,
      timestamp: new Date()
    };

    if (user) entry.user = user;
    if (error) {
      entry.error = {
        name: error.name || undefined,
        message: error.message || String(error),
        code: error.code || undefined,
        stack: error.stack || undefined
      };
    }
    if (request) {
      entry.request = {
        method: request.method || undefined,
        url: request.url || undefined,
        ip: request.ip || undefined
      };
    }
    if (metadata) entry.metadata = metadata;

    await Log.create(entry);
  } catch (err) {
    console.error('Failed to write log entry:', err.message);
  }
};

module.exports = { log };