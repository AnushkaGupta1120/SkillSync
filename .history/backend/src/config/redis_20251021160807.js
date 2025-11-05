const Redis = require('ioredis');

let redis;

const connectRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    return redis;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};

const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};

module.exports 
