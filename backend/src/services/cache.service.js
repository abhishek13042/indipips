const Redis = require('ioredis');

// Redis configuration
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redis;
let isConnected = false;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
    isConnected = true;
  });

  redis.on('error', (err) => {
    console.warn('⚠️ Redis Connection Error:', err.message);
    isConnected = false;
  });
} catch (error) {
  console.error('❌ Failed to initialize Redis client:', error);
}

/**
 * Get item from cache
 */
const get = async (key) => {
  if (!isConnected) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Redis GET error for key ${key}:`, err);
    return null;
  }
};

/**
 * Set item in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds - Time to live in seconds
 */
const set = async (key, value, ttlSeconds = 60) => {
  if (!isConnected) return false;
  try {
    const data = JSON.stringify(value);
    await redis.set(key, data, 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.error(`Redis SET error for key ${key}:`, err);
    return false;
  }
};

/**
 * Delete item from cache
 */
const del = async (key) => {
  if (!isConnected) return false;
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error(`Redis DEL error for key ${key}:`, err);
    return false;
  }
};

/**
 * Utility to get or set (Cache-Aside pattern)
 */
const getOrSet = async (key, fetchCallback, ttlSeconds = 60) => {
  const cached = await get(key);
  if (cached) return cached;

  const freshData = await fetchCallback();
  if (freshData) {
    await set(key, freshData, ttlSeconds);
  }
  return freshData;
};

module.exports = {
  get,
  set,
  del,
  getOrSet,
  isConnected: () => isConnected
};
