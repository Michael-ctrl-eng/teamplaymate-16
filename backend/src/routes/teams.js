const express = require('express');
const Joi = require('joi');
const { DatabaseService } = require('../services/database.js');
const {
  asyncHandler,
  validateRequest,
  ValidationError,
  NotFoundError,
  AuthorizationError
} = require('../middleware/errorHandler.js');
const {
  authenticateToken,
  requireRole,
  checkTeamOwnership
} = require('../middleware/auth.js');

const router = express.Router();
const db = new DatabaseService();

// Validation schemas
const createTeamSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    sport: Joi.string().valid('soccer', 'futsal').required(),
    description: Joi.string().max(500).optional(),
    logo_url: Joi.string().uri().optional(),
    founded: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    stadium: Joi.string().max(255).optional(),
    capacity: Joi.number().integer().positive().optional(),
    city: Joi.string().max(255).optional(),
    country: Joi.string().max(255).optional(),
    website: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(50).optional(),
  }).required(),
  query: Joi.object(),
  params: Joi.object()
});

const updateTeamSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    logo_url: Joi.string().uri().optional(),
    founded: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    stadium: Joi.string().max(255).optional(),
    capacity: Joi.number().integer().positive().optional(),
    city: Joi.string().max(255).optional(),
    country: Joi.string().max(255).optional(),
    website: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(50).optional(),
  }).required(),
  query: Joi.object(),
  params: Joi.object()
});

// Routes

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
router.post('/',
  authenticateToken,
  validateRequest(createTeamSchema),
  asyncHandler(async (req, res) => {
    const { name, sport, description, logo_url, founded, stadium, capacity, city, country, website, email, phone } = req.body;
    const owner_id = req.user.id;

    const team = await db.create('teams', {
      name,
      sport,
      description,
      logo_url,
      founded,
      stadium,
      capacity,
      city,
      country,
      website,
      email,
      phone,
      owner_id
    });

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  })
);

// @route   GET /api/teams
// @desc    Get all teams for the authenticated user
// @access  Private
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const teams = await db.findMany('teams', { owner_id: req.user.id });
    res.json({ teams });
  })
);

// @route   GET /api/teams/:id
// @desc    Get a single team by ID
// @access  Private
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const team = await db.findById('teams', id);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (team.owner_id !== req.user.id) {
      throw new AuthorizationError('You are not authorized to view this team');
    }

    res.json({ team });
  })
);

// @route   PUT /api/teams/:id
// @desc    Update a team
// @access  Private
router.put('/:id',
  authenticateToken,
  validateRequest(updateTeamSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const team = await db.findById('teams', id);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (team.owner_id !== req.user.id) {
      throw new AuthorizationError('You are not authorized to update this team');
    }

    const updatedTeam = await db.update('teams', id, req.body);

    res.json({
      message: 'Team updated successfully',
      team: updatedTeam
    });
  })
);

// @route   DELETE /api/teams/:id
// @desc    Delete a team
// @access  Private
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const team = await db.findById('teams', id);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (team.owner_id !== req.user.id) {
      throw new AuthorizationError('You are not authorized to delete this team');
    }

    await db.delete('teams', id);

    res.json({ message: 'Team deleted successfully' });
  })
);

module.exports = router;
