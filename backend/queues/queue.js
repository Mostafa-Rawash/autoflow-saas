const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const messageQueue = new Queue('message-processing', { connection });

async function enqueueMessage(payload) {
  return messageQueue.add('process-message', payload, {
    removeOnComplete: true,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
}

module.exports = {
  connection,
  messageQueue,
  enqueueMessage
};
