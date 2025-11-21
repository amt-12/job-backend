const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisConnection = new IORedis({
  host: 'localhost',
  port: 6379,
});

const jobQueue = new Queue('job-import', { connection: redisConnection });

module.exports = jobQueue;
