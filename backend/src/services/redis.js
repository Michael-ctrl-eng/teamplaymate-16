const Redis = require('ioredis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize() {
    try {
      // Check if Redis is configured
      if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
        logger.info('Redis not configured - running without caching');
        return;
      }

      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      };

      if (process.env.REDIS_URL) {
        this.client = new Redis(process.env.REDIS_URL, {
          ...redisConfig,
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined
        });
      } else {
        this.client = new Redis(redisConfig);
      }

      this.client.on('connect', () => {
        logger.info('[REDIS INFO] Redis client connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('error', (error) => {
        logger.error('[REDIS ERROR] Redis connection error');
        this.isConnected = false;
        // Don't attempt to reconnect if we can't connect initially
        if (this.reconnectAttempts === 0) {
          logger.warn('[REDIS WARN] Disabling Redis - continuing without caching');
          this.client.disconnect();
        }
      });

      this.client.on('close', () => {
        logger.warn('[REDIS WARN] Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++;
        logger.info('[REDIS INFO] Redis reconnecting');
        // Stop reconnecting after max attempts
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
          logger.warn('[REDIS WARN] Max reconnection attempts reached - disabling Redis');
          this.client.disconnect();
        }
      });

      await this.client.connect();
      await this.client.ping();
      
      logger.info('[REDIS INFO] Redis service initialized successfully');
      
    } catch (error) {
      logger.error('[REDIS ERROR] Failed to initialize Redis service:', error.message);
      logger.warn('[REDIS WARN] Application will continue without Redis caching');
      this.isConnected = false;
      if (this.client) {
        this.client.disconnect();
      }
    }
  }

  async setSession(sessionId, data, ttl = 3600) {
    try {
      if (!this.isConnected) return false;
      const sessionKey = `session:${sessionId}`;
      await this.client.setex(sessionKey, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error('Error setting session:', error);
      return false;
    }
  }

  async getSession(sessionId) {
    try {
      if (!this.isConnected) return null;
      const sessionKey = `session:${sessionId}`;
      const data = await this.client.get(sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    try {
      if (!this.isConnected) return false;
      const sessionKey = `session:${sessionId}`;
      await this.client.del(sessionKey);
      return true;
    } catch (error) {
      logger.error('Error deleting session:', error);
      return false;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected) return false;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error('Error setting cache:', error);
      return false;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) return null;
      const value = await this.client.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Error getting cache:', error);
      return null;
    }
  }

  async incrementRateLimit(key, window = 60, limit = 100) {
    try {
      if (!this.isConnected) return { allowed: true, remaining: limit };
      const current = await this.client.incr(key);
      if (current === 1) {
        await this.client.expire(key, window);
      }
      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;
      return { allowed, remaining, current };
    } catch (error) {
      logger.error('Error checking rate limit:', error);
      return { allowed: true, remaining: limit };
    }
  }

  async keys(pattern) {
    try {
      if (!this.isConnected) return [];
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Error getting keys:', error);
      return [];
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) return false;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Error deleting key:', error);
      return false;
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected) return -1;
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Error getting TTL:', error);
      return -1;
    }
  }

  async incr(key) {
    try {
      if (!this.isConnected) return 0;
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Error incrementing key:', error);
      return 0;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.isConnected) return false;
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Error setting expiration:', error);
      return false;
    }
  }

  async setex(key, seconds, value) {
    try {
      if (!this.isConnected) return false;
      await this.client.setex(key, seconds, value);
      return true;
    } catch (error) {
      logger.error('Error setting key with expiration:', error);
      return false;
    }
  }

  async lpush(key, value) {
    try {
      if (!this.isConnected) return false;
      await this.client.lpush(key, value);
      return true;
    } catch (error) {
      logger.error('Error pushing to list:', error);
      return false;
    }
  }

  async ltrim(key, start, stop) {
    try {
      if (!this.isConnected) return false;
      await this.client.ltrim(key, start, stop);
      return true;
    } catch (error) {
      logger.error('Error trimming list:', error);
      return false;
    }
  }

  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis service closed');
      }
    } catch (error) {
      logger.error('Error closing Redis service:', error);
    }
  }

  isHealthy() {
    return this.isConnected;
  }

  getClient() {
    return this.client;
  }
}

const redisServiceInstance = new RedisService();

module.exports = redisServiceInstance;
module.exports.RedisService = RedisService;
module.exports.default = redisServiceInstance;