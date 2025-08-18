const request = require('supertest');
const express = require('express');

const mockPaypalInstance = {
  createOrder: jest.fn(),
  captureOrder: jest.fn(),
};
const mockPayPalService = jest.fn().mockImplementation(() => mockPaypalInstance);

const mockDbInstance = {
  query: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};
const mockDatabaseService = jest.fn().mockImplementation(() => mockDbInstance);

const mockRedisInstance = {
  hset: jest.fn(),
};
const mockRedisService = jest.fn().mockImplementation(() => mockRedisInstance);

jest.mock('../services/paypalService.js', () => ({
  PayPalService: mockPayPalService,
}));
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
  requireSubscription: jest.fn(() => (req, res, next) => next()),
}));

const subscriptionsRouter = require('./subscriptions');
const app = express();
app.use(express.json());
app.use('/subscriptions', subscriptionsRouter.default);

describe('Subscription Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /subscriptions/create', () => {
    it('should create a subscription successfully', async () => {
      // Mock implementations
      mockPaypalInstance.createOrder.mockResolvedValue({ id: 'paypal-order-id', status: 'CREATED' });
      mockDbInstance.query.mockResolvedValue([]); // No existing subscription
      mockDbInstance.create.mockResolvedValue({ id: 'new-subscription-id' });

      const response = await request(app)
        .post('/subscriptions/create')
        .send({
          plan_id: 'pro',
          payment_method: 'paypal',
          billing_cycle: 'monthly',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Subscription creation initiated');
      expect(response.body.subscription_id).toBe('new-subscription-id');
      expect(response.body.payment_data.id).toBe('paypal-order-id');
    });
  });

  describe('POST /subscriptions/confirm', () => {
    it('should confirm a subscription successfully', async () => {
      // Mock implementations
      mockPaypalInstance.captureOrder.mockResolvedValue({ status: 'COMPLETED' });
      mockDbInstance.findById.mockResolvedValue({ id: 'test-subscription-id', user_id: 'test-user-id', status: 'pending', payment_provider: 'paypal' });
      mockDbInstance.update.mockResolvedValue({ id: 'test-subscription-id', status: 'active' });
      mockDbInstance.query.mockResolvedValue([]); // for coupon update
      mockRedisInstance.hset.mockResolvedValue(1);

      const response = await request(app)
        .post('/subscriptions/confirm')
        .send({
          subscription_id: 'test-subscription-id',
          paypal_order_id: 'paypal-order-id',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Subscription activated successfully');
      expect(response.body.subscription.status).toBe('active');
    });
  });
});
