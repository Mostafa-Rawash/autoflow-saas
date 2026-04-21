const IORedis = require('ioredis');

const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

async function getJson(key) {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

async function setJson(key, value, ttlSeconds = 300) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function del(key) {
  await redis.del(key);
}

module.exports = {
  redis,
  getJson,
  setJson,
  del
};
