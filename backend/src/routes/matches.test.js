const request = require('supertest');
const express = require('express');

const mockDbInstance = {
  create: jest.fn(),
  findMany: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: jest.fn(),
};
const mockDatabaseService = jest.fn().mockImplementation(() => mockDbInstance);

jest.mock('../services/database.js', () => ({
  DatabaseService: mockDatabaseService,
}));

jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  },
  requireRole: () => (req, res, next) => next(),
}));

jest.mock('../services/socket.js', () => ({
  SocketService: jest.fn().mockImplementation(() => ({
    broadcastMatchUpdate: jest.fn(),
  })),
}));

jest.mock('../services/matchReportService.js', () => ({
    MatchReportService: jest.fn().mockImplementation(() => ({
        sendMatchReports: jest.fn(),
    })),
}));

const matchesRouter = require('./matches');
const app = express();
app.use(express.json());
app.use('/matches', matchesRouter);

describe('Matches Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /matches/:id', () => {
    it('should get a match by id successfully', async () => {
      const match = [{ id: 'test-match-id', home_team_name: 'Home', away_team_name: 'Away' }];
      mockDbInstance.query.mockResolvedValue(match);

      const response = await request(app)
        .get('/matches/test-match-id');

      expect(response.status).toBe(200);
      expect(response.body.match.home_team_name).toBe('Home');
    });
  });

  describe('PUT /matches/:id', () => {
    it('should update a match successfully', async () => {
      const match = { id: 'test-match-id', status: 'scheduled' };
      const updatedData = { status: 'live' };
      mockDbInstance.findById.mockResolvedValue(match);
      mockDbInstance.update.mockResolvedValue({ ...match, ...updatedData });

      const response = await request(app)
        .put('/matches/test-match-id')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Match updated successfully');
      expect(response.body.match.status).toBe('live');
    });
  });
});
