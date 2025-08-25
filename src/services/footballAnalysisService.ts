import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface MatchAnalysisRequest {
  matchId?: string;
  homeTeam: string;
  awayTeam: string;
  date?: string;
  league?: string;
  analysisType: 'basic' | 'detailed' | 'expert';
}

export interface PlayerStatsRequest {
  playerName: string;
  season?: string;
  league?: string;
  position?: string;
  comparisonPlayers?: string[];
}

export interface TacticalAnalysisRequest {
  matchId: string;
  focusAreas: string[];
  depth: 'overview' | 'detailed' | 'expert';
}

export interface PredictionRequest {
  homeTeam: string;
  awayTeam: string;
  venue: 'home' | 'away' | 'neutral';
  league?: string;
  historicalData?: boolean;
}

class FootballAnalysisService {
  private isDemo = true; // Set to false when real API is available

  async analyzeMatch(request: MatchAnalysisRequest) {
    if (this.isDemo) {
      return this.generateMockMatchAnalysis(request);
    }
    
    try {
      const { data, error } = await supabase
        .from('match_analysis')
        .select('*')
        .eq('match_id', request.matchId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Match analysis error:', error);
      return this.generateMockMatchAnalysis(request);
    }
  }

  async getPlayerStats(request: PlayerStatsRequest) {
    if (this.isDemo) {
      return this.generateMockPlayerStats(request);
    }

    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', request.playerName)
        .eq('season', request.season || '2024')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Player stats error:', error);
      return this.generateMockPlayerStats(request);
    }
  }

  async getTacticalAnalysis(request: TacticalAnalysisRequest) {
    if (this.isDemo) {
      return this.generateMockTacticalAnalysis(request);
    }

    try {
      const { data, error } = await supabase
        .from('tactical_analysis')
        .select('*')
        .eq('match_id', request.matchId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Tactical analysis error:', error);
      return this.generateMockTacticalAnalysis(request);
    }
  }

  async getPredictions(request: PredictionRequest) {
    if (this.isDemo) {
      return this.generateMockPredictions(request);
    }

    try {
      const { data, error } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('home_team', request.homeTeam)
        .eq('away_team', request.awayTeam)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Predictions error:', error);
      return this.generateMockPredictions(request);
    }
  }

  async getLeagueStandings(league: string) {
    return this.generateMockLeagueStandings(league);
  }

  async searchPlayers(query: string) {
    return this.generateMockPlayerSearch(query);
  }

  async getHistoricalData(teamA: string, teamB: string) {
    return this.generateMockHistoricalData(teamA, teamB);
  }

  // Mock data generators
  private generateMockMatchAnalysis(request: MatchAnalysisRequest) {
    return {
      matchId: request.matchId || 'mock-match-1',
      homeTeam: request.homeTeam,
      awayTeam: request.awayTeam,
      analysis: {
        keyMoments: [
          { minute: 23, event: 'Goal', player: 'Player A', team: request.homeTeam },
          { minute: 67, event: 'Yellow Card', player: 'Player B', team: request.awayTeam },
          { minute: 89, event: 'Goal', player: 'Player C', team: request.awayTeam }
        ],
        statistics: {
          possession: { home: 58, away: 42 },
          shots: { home: 12, away: 8 },
          shotsOnTarget: { home: 5, away: 3 },
          corners: { home: 7, away: 4 },
          fouls: { home: 11, away: 14 }
        },
        tacticalInsights: [
          'Home team dominated possession in midfield',
          'Away team effective on counter-attacks',
          'Set pieces were crucial in the outcome'
        ]
      },
      confidence: 85
    };
  }

  private generateMockPlayerStats(request: PlayerStatsRequest) {
    return {
      playerName: request.playerName,
      season: request.season || '2024',
      stats: {
        appearances: Math.floor(Math.random() * 30) + 10,
        goals: Math.floor(Math.random() * 20),
        assists: Math.floor(Math.random() * 15),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2),
        minutesPlayed: Math.floor(Math.random() * 2000) + 500
      },
      performance: {
        rating: (Math.random() * 3 + 6).toFixed(1),
        strengths: ['Passing', 'Vision', 'Work Rate'],
        weaknesses: ['Pace', 'Finishing'],
        form: 'Good'
      }
    };
  }

  private generateMockTacticalAnalysis(request: TacticalAnalysisRequest) {
    return {
      matchId: request.matchId,
      formation: {
        home: '4-3-3',
        away: '4-4-2'
      },
      heatMaps: {
        home: 'Mock heat map data for home team',
        away: 'Mock heat map data for away team'
      },
      passingNetworks: {
        home: 'Mock passing network for home team',
        away: 'Mock passing network for away team'
      },
      insights: [
        'Home team pressed high in the first half',
        'Away team dropped deeper after taking the lead',
        'Midfield battle was crucial to the outcome'
      ]
    };
  }

  private generateMockPredictions(request: PredictionRequest) {
    const homeWinProb = Math.random() * 0.6 + 0.2;
    const drawProb = Math.random() * 0.3 + 0.1;
    const awayWinProb = 1 - homeWinProb - drawProb;

    return {
      homeTeam: request.homeTeam,
      awayTeam: request.awayTeam,
      predictions: {
        homeWin: Math.round(homeWinProb * 100),
        draw: Math.round(drawProb * 100),
        awayWin: Math.round(awayWinProb * 100)
      },
      scorePrediction: {
        home: Math.floor(Math.random() * 3) + 1,
        away: Math.floor(Math.random() * 3) + 1
      },
      confidence: Math.floor(Math.random() * 30) + 70
    };
  }

  private generateMockLeagueStandings(league: string) {
    const teams = [
      'Manchester City', 'Arsenal', 'Liverpool', 'Chelsea',
      'Newcastle', 'Manchester United', 'Tottenham', 'Brighton'
    ];

    return teams.map((team, index) => ({
      position: index + 1,
      team,
      played: 20,
      won: 15 - index,
      drawn: 3,
      lost: 2 + index,
      goalsFor: 45 - index * 3,
      goalsAgainst: 15 + index * 2,
      goalDifference: 30 - index * 5,
      points: 48 - index * 3
    }));
  }

  private generateMockPlayerSearch(query: string) {
    const mockPlayers = [
      'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé',
      'Erling Haaland', 'Kevin De Bruyne', 'Mohamed Salah'
    ];

    return mockPlayers
      .filter(player => player.toLowerCase().includes(query.toLowerCase()))
      .map(player => ({
        name: player,
        team: 'Mock Team',
        position: 'Forward',
        age: Math.floor(Math.random() * 15) + 20,
        nationality: 'Mock Country'
      }));
  }

  private generateMockHistoricalData(teamA: string, teamB: string) {
    return {
      totalMatches: 25,
      teamAWins: 10,
      teamBWins: 8,
      draws: 7,
      recentForm: [
        { date: '2024-01-15', result: `${teamA} 2-1 ${teamB}` },
        { date: '2023-08-20', result: `${teamB} 1-1 ${teamA}` },
        { date: '2023-03-10', result: `${teamA} 0-2 ${teamB}` }
      ],
      averageGoals: {
        teamA: 1.8,
        teamB: 1.5
      }
    };
  }

  async generateAdvancedReport(data: any) {
    return {
      summary: 'Advanced tactical analysis completed',
      keyInsights: [
        'Team showed strong defensive organization',
        'Midfield creativity needs improvement',
        'Set pieces were effectively executed'
      ],
      recommendations: [
        'Focus on quick passing combinations',
        'Improve defensive transitions',
        'Work on finishing in the final third'
      ],
      confidence: 85
    };
  }

  async getPlayerComparison(players: string[]) {
    return {
      comparison: players.map(player => ({
        name: player,
        rating: Math.floor(Math.random() * 40) + 60,
        strengths: ['Passing', 'Vision', 'Work Rate'],
        weaknesses: ['Pace', 'Finishing']
      })),
      recommendation: 'Focus on developing weaker areas while maintaining strengths'
    };
  }

  async analyzeTeamTactics(request: { teamData: any; query: string; sport: string }) {
    return {
      insights: [
        'Team shows strong tactical discipline',
        'Formation flexibility allows for multiple playing styles',
        'Player positioning and movement patterns are well-coordinated'
      ],
      recommendations: [
        'Continue developing set-piece variations',
        'Work on quick transition play',
        'Maintain defensive shape during attacking phases'
      ],
      formations: request.sport === 'futsal' ? ['2-2', '3-1', '1-2-1'] : ['4-3-3', '4-4-2', '3-5-2']
    };
  }

  async analyzePlayer(request: { teamData: any; query: string; sport: string }) {
    const players = request.teamData?.players || [];
    return {
      insights: [
        'Individual player development shows positive trends',
        'Team chemistry and player interactions are improving',
        'Key players are maintaining consistent performance levels'
      ],
      recommendations: [
        'Focus on individual skill development during training',
        'Rotate players to maintain squad fitness and motivation',
        'Develop leadership qualities in key players'
      ],
      playerStats: players.slice(0, 3).map((p: any) => ({
        name: p.name || 'Player',
        rating: Math.floor(Math.random() * 30) + 70,
        strengths: ['Technical ability', 'Game awareness']
      }))
    };
  }

  async generateTrainingPlan(request: { teamData: any; query: string; sport: string }) {
    const futsalSessions = [
      'Quick passing and first touch drills',
      'Small-sided games for decision making',
      'Defensive pressing and transitions'
    ];
    
    const soccerSessions = [
      'Tactical shape and positioning',
      'Set-piece practice and execution',
      'Fitness and conditioning work'
    ];

    return {
      sessions: request.sport === 'futsal' ? futsalSessions : soccerSessions,
      focus: [
        'Technical skill development',
        'Tactical understanding and game intelligence',
        'Physical preparation and injury prevention'
      ],
      duration: '90 minutes per session',
      frequency: '3-4 sessions per week'
    };
  }
}

export const footballAnalysisService = new FootballAnalysisService();