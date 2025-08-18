const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { authenticate } = require('../middleware/auth');

// POST /api/chatbot/context
// Fetches all the necessary data for the chatbot context
router.post('/context', authenticate, async (req, res, next) => {
  try {
    const { userId, teamId } = req.body;

    if (!userId || !teamId) {
      return res.status(400).json({ message: 'userId and teamId are required' });
    }

    // Fetch team data
    const team = await db.findById('teams', teamId);

    // Fetch players in the team
    const players = await db.findMany('players', { team_id: teamId });

    // Fetch recent matches
    const recentMatches = await db.findMany('matches',
      { home_team_id: teamId },
      { orderBy: 'match_date', ascending: false, limit: 5 }
    );

    // Fetch upcoming matches
    const upcomingMatches = await db.findMany('matches',
      { home_team_id: teamId, status: 'scheduled' },
      { orderBy: 'match_date', ascending: true, limit: 5 }
    );

    // Fetch recent training sessions
    const trainingSessions = await db.findMany('training_sessions',
      { team_id: teamId },
      { orderBy: 'session_date', ascending: false, limit: 5 }
    );

    // Fetch team stats from analytics
    const teamStats = await db.getAnalytics('team', teamId, '90 days');

    const context = {
      sport: team.sport,
      userId: userId,
      teamData: {
        id: team.id,
        name: team.name,
        players: players,
        recentMatches: recentMatches,
        upcomingMatches: upcomingMatches,
        teamStats: teamStats,
      },
      // TODO: Fetch user preferences
      userPreferences: {
        language: 'en',
        experience: 'intermediate',
        coachingStyle: 'balanced',
        preferredFormations: ['4-3-3', '4-4-2'],
        focusAreas: ['attack', 'defense'],
      },
      // TODO: Fetch session history
      sessionHistory: [],
      // TODO: Fetch current context
      currentContext: {},
      isPremium: true, // TODO: Check subscription status
    };

    res.json(context);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
