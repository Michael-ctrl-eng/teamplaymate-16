const winston = require('winston');
const config = require('../config/env');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Try to load Redis clients
let Redis, UpstashRedis;
try {
  Redis = require('ioredis');
} catch (e) {
  logger.warn('ioredis not available');
}

try {
  const upstash = require('@upstash/redis');
  UpstashRedis = upstash.Redis;
} catch (e) {
  logger.warn('@upstash/redis not available');
}

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize() {
    try {
      // Try Upstash Redis first
      if (config.redisConfig.upstash.restUrl && config.redisConfig.upstash.restToken && UpstashRedis) {
        logger.info('Attempting to connect to Upstash Redis...');
        try {
          this.client = new UpstashRedis({
            url: config.redisConfig.upstash.restUrl,
            token: config.redisConfig.upstash.restToken,
          });
          this.clientType = 'upstash';
          
          // Test connection with timeout
          const pingPromise = this.client.ping();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
          );
          
          await Promise.race([pingPromise, timeoutPromise]);
          this.isConnected = true;
          logger.info('[REDIS INFO] Upstash Redis connected successfully');
          return { connected: true, type: 'upstash' };
        } catch (upstashError) {
          logger.warn('[REDIS WARN] Upstash Redis connection failed:', upstashError.message);
          logger.warn('[REDIS WARN] This might be due to invalid credentials or network issues');
          // Continue to try traditional Redis or run without Redis
        }
      }
      
      // Fallback to traditional Redis
      if ((process.env.REDIS_URL || process.env.REDIS_HOST) && Redis) {
        logger.info('Attempting to connect to traditional Redis...');
        try {
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
          this.clientType = 'ioredis';

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
          
          logger.info('[REDIS INFO] Traditional Redis service initialized successfully');
          return { connected: true, type: 'ioredis' };
        } catch (traditionalError) {
          logger.warn('[REDIS WARN] Traditional Redis connection failed:', traditionalError.message);
        }
      }
      
      // No Redis configured or all connection attempts failed
      logger.warn('[REDIS WARN] Redis not configured or connection failed - running without caching');
      logger.info('[REDIS INFO] Application will continue with reduced functionality (no caching, rate limiting, or session storage)');
      return { connected: false, type: 'none' };
      
    } catch (error) {
      logger.error('[REDIS ERROR] Failed to initialize Redis service:', error.message);
      logger.warn('[REDIS WARN] Application will continue without Redis caching');
      this.isConnected = false;
      if (this.client) {
        this.client.disconnect();
      }
      return { connected: false, type: 'error', error: error.message };
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