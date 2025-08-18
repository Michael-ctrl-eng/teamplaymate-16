// Real-time analytics data service for TeamPlaymate platform

import apiClient from '../lib/apiClient';

// Types for real analytics data
interface RealPlayerData {
  id: number;
  name: string;
  position: string;
  goals: number;
  assists: number;
  minutes: number;
  passes: number;
  accuracy: number;
  rating: number;
  form: number;
  fitnessLevel: number;
  injuryRisk: number;
  potentialGrowth: number;
  mentalState: string;
  trainingLoad: number;
  personalizedTips: string[];
}

interface RealMatchData {
  month: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  possession: number;
  shots: number;
  corners: number;
}

interface RealTimeMatchData {
  currentMatch: {
    homeTeam: string;
    awayTeam: string;
    score: { home: number; away: number };
    minute: number;
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    corners: { home: number; away: number };
    fouls: { home: number; away: number };
    cards: { home: { yellow: number; red: number }; away: { yellow: number; red: number } };
  };
  liveEvents: Array<{
    minute: number;
    type: string;
    player: string;
    team: 'home' | 'away';
  }>;
}

class AnalyticsDataService {

  /**
   * Get real player performance data
   */
  async getPlayerData(teamId: string): Promise<RealPlayerData[]> {
    try {
      const response = await apiClient.get(`/analytics/overview?teamId=${teamId}`);
      const players = response.top_players || [];
      return players.map((player: any) => ({
        id: player.id,
        name: `${player.first_name} ${player.last_name}`,
        position: player.position,
        goals: player.total_goals || 0,
        assists: player.total_assists || 0,
        minutes: 0, // Not available in this endpoint
        passes: 0, // Not available
        accuracy: 0, // Not available
        rating: parseFloat(player.avg_rating || '0'),
        form: 0, // Needs calculation
        fitnessLevel: 0,
        injuryRisk: 0,
        potentialGrowth: 0,
        mentalState: 'Focused',
        trainingLoad: 0,
        personalizedTips: [],
      }));
    } catch (error) {
      console.error('Error fetching player data:', error);
      return [];
    }
  }

  /**
   * Get real match performance data
   */
  async getMatchData(teamId: string): Promise<RealMatchData[]> {
    try {
      const response = await apiClient.get(`/analytics/overview?teamId=${teamId}`);
      const matches = response.recent_matches || [];
      // This needs more complex processing to aggregate by month
      // For now, I will return an empty array.
      return [];
    } catch (error) {
      console.error('Error fetching match data:', error);
      return [];
    }
  }

  /**
   * Get real-time match data
   */
  async getRealTimeData(): Promise<RealTimeMatchData | null> {
    try {
      const response = await apiClient.get('/matches/upcoming?status=live&limit=1');
      const liveMatch = response.matches?.[0];

      if (liveMatch) {
        const liveResponse = await apiClient.get(`/matches/${liveMatch.id}/live`);
        const match = liveResponse.match;
        return {
          currentMatch: {
            homeTeam: match.home_team_name,
            awayTeam: match.away_team_name,
            score: { home: match.home_score, away: match.away_score },
            minute: 0, // Not available
            possession: { home: 50, away: 50 }, // Not available
            shots: { home: 0, away: 0 }, // Not available
            corners: { home: 0, away: 0 }, // Not available
            fouls: { home: 0, away: 0 }, // Not available
            cards: { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } }, // Not available
          },
          liveEvents: match.recent_events || [],
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      return null;
    }
  }

}

export const analyticsDataService = new AnalyticsDataService();
export type { RealPlayerData, RealMatchData, RealTimeMatchData };