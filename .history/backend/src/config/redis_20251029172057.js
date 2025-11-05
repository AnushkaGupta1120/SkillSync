const Redis = require('ioredis');

let redis = null;

const connectRedis = async () => {
  // Skip Redis if not available
  if (!process.env.REDIS_URL || process.env.REDIS_URL === 'redis://localhost:6379') {
    console.log('⚠️  Redis not configured, skipping...');
    return null;
  }

  try {
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 1, // Changed from 3
      enableOfflineQueue: false, // Stop retry spam
      lazyConnect: true, // Don't connect immediately
      showFriendlyErrorStack: false
    });

    await redis.connect();

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      redis.disconnect();
    });

    return redis;
  } catch (error) {
    console.warn('⚠️  Redis connection failed, continuing without cache');
    return null;
  }
};

const getRedis = () => {
  return redis;
};

module.exports = {
  connectRedis,
  getRedis
};
