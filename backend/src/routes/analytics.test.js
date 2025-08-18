const request = require('supertest');
const express = require('express');

const mockDbInstance = {
  query: jest.fn(),
};
const mockRedisInstance = {
  get: jest.fn(),
  setex: jest.fn(),
};
const mockDatabaseService = jest.fn().mockImplementation(() => mockDbInstance);
const mockRedisService = jest.fn().mockImplementation(() => mockRedisInstance);

jest.mock('../services/database.js', () => ({
  DatabaseService: mockDatabaseService,
}));
jest.mock('../services/redis.js', () => ({
  RedisService: mockRedisService,
}));

jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'test-user-id', team_id: 'test-team-id' };
    next();
  },
}));

const analyticsRouter = require('./analytics');
const app = express();
app.use(express.json());
app.use('/analytics', analyticsRouter);

describe('Analytics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /analytics/overview', () => {
    it('should get an overview successfully', async () => {
      mockDbInstance.query.mockResolvedValue([]);
      mockRedisInstance.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/analytics/overview?teamId=test-team-id');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('team_stats');
      expect(response.body).toHaveProperty('top_players');
      expect(response.body).toHaveProperty('recent_matches');
    });
  });
});
