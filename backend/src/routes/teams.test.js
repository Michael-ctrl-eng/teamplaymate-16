const request = require('supertest');
const express = require('express');

const mockDbInstance = {
  create: jest.fn(),
  findMany: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
}));

const teamsRouter = require('./teams');
const app = express();
app.use(express.json());
app.use('/teams', teamsRouter);

describe('Teams Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /teams', () => {
    it('should create a team successfully', async () => {
      const newTeam = {
        name: 'Test Team',
        sport: 'soccer',
        description: 'A test team',
        founded: 2024,
      };
      mockDbInstance.create.mockResolvedValue({ id: 'new-team-id', ...newTeam });

      const response = await request(app)
        .post('/teams')
        .send(newTeam);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Team created successfully');
      expect(response.body.team.name).toBe('Test Team');
    });
  });

  describe('GET /teams/:id', () => {
    it('should get a team by id successfully', async () => {
      const team = { id: 'test-team-id', name: 'Test Team', owner_id: 'test-user-id' };
      mockDbInstance.findById.mockResolvedValue(team);

      const response = await request(app)
        .get('/teams/test-team-id');

      expect(response.status).toBe(200);
      expect(response.body.team.name).toBe('Test Team');
    });
  });

  describe('PUT /teams/:id', () => {
    it('should update a team successfully', async () => {
      const team = { id: 'test-team-id', name: 'Test Team', owner_id: 'test-user-id' };
      const updatedData = { name: 'Updated Test Team' };
      mockDbInstance.findById.mockResolvedValue(team);
      mockDbInstance.update.mockResolvedValue({ ...team, ...updatedData });

      const response = await request(app)
        .put('/teams/test-team-id')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Team updated successfully');
      expect(response.body.team.name).toBe('Updated Test Team');
    });
  });
});
