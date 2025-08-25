import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Target, 
  Users, 
  TrendingUp, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Eye,
  Crosshair,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface MatchData {
  matchId: string;
  map: string;
  score: { team1: number; team2: number };
  rounds: RoundData[];
  players: PlayerData[];
  duration: number;
}

interface RoundData {
  roundNumber: number;
  winner: 'attack' | 'defense';
  type: 'elimination' | 'spike' | 'defuse' | 'time';
  duration: number;
  economySpent: { team1: number; team2: number };
  keyEvents: KeyEvent[];
}

interface KeyEvent {
  timestamp: number;
  type: 'kill' | 'death' | 'ability' | 'spike_plant' | 'spike_defuse' | 'clutch';
  player: string;
  details: string;
  impact: 'high' | 'medium' | 'low';
}

interface PlayerData {
  name: string;
  agent: string;
  team: 'team1' | 'team2';
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    adr: number; // Average Damage per Round
    acs: number; // Average Combat Score
    kast: number; // Kill/Assist/Survive/Trade percentage
    firstKills: number;
    firstDeaths: number;
    clutchesWon: number;
    clutchesAttempted: number;
    economyRating: number;
    utilityDamage: number;
  };
  rounds: PlayerRoundData[];
}

interface PlayerRoundData {
  roundNumber: number;
  kills: number;
  deaths: number;
  damage: number;
  economy: number;
  utilityUsed: string[];
  positioning: string;
  impact: number;
}

interface AnalysisResult {
  overview: MatchOverview;
  playerAnalysis: PlayerAnalysis[];
  teamStrategy: TeamStrategy;
  criticalMoments: CriticalMoment[];
  improvements: ImprovementPlan;
}

interface MatchOverview {
  mapControl: { team1: number; team2: number };
  economyEfficiency: { team1: number; team2: number };
  roundTypes: { elimination: number; spike: number; defuse: number; time: number };
  momentumShifts: MomentumShift[];
}

interface PlayerAnalysis {
  player: string;
  strengths: string[];
  weaknesses: string[];
  keyStats: Record<string, number>;
  recommendations: string[];
}

interface TeamStrategy {
  attackSuccess: number;
  defenseSuccess: number;
  sitePreference: Record<string, number>;
  utilityCoordination: number;
  tradingEfficiency: number;
  rotationTiming: number;
}

interface CriticalMoment {
  roundNumber: number;
  timestamp: number;
  description: string;
  impact: 'game_changing' | 'momentum_shift' | 'economy_shift';
  analysis: string;
}

interface MomentumShift {
  roundNumber: number;
  previousMomentum: number;
  newMomentum: number;
  cause: string;
}

interface ImprovementPlan {
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
  practiceRoutines: PracticeRoutine[];
  strategicAdjustments: string[];
}

interface PracticeRoutine {
  name: string;
  description: string;
  duration: string;
  frequency: string;
  focus: string[];
}

export const ValorantAnalyzer: React.FC = () => {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Mock data for demonstration
  const mockMatchData: MatchData = {
    matchId: "MATCH_001",
    map: "Ascent",
    score: { team1: 13, team2: 11 },
    duration: 2847, // seconds
    rounds: Array.from({ length: 24 }, (_, i) => ({
      roundNumber: i + 1,
      winner: Math.random() > 0.5 ? 'attack' : 'defense',
      type: ['elimination', 'spike', 'defuse', 'time'][Math.floor(Math.random() * 4)] as any,
      duration: Math.floor(Math.random() * 100) + 60,
      economySpent: { 
        team1: Math.floor(Math.random() * 20000) + 10000,
        team2: Math.floor(Math.random() * 20000) + 10000
      },
      keyEvents: []
    })),
    players: [
      {
        name: "Player1",
        agent: "Jett",
        team: "team1",
        stats: {
          kills: 24,
          deaths: 18,
          assists: 7,
          adr: 165,
          acs: 245,
          kast: 78,
          firstKills: 8,
          firstDeaths: 5,
          clutchesWon: 3,
          clutchesAttempted: 5,
          economyRating: 85,
          utilityDamage: 420
        },
        rounds: []
      },
      // Add more mock players...
    ]
  };

  const analyzeMatch = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis: AnalysisResult = {
      overview: {
        mapControl: { team1: 65, team2: 35 },
        economyEfficiency: { team1: 82, team2: 76 },
        roundTypes: { elimination: 15, spike: 6, defuse: 2, time: 1 },
        momentumShifts: [
          { roundNumber: 8, previousMomentum: 40, newMomentum: 70, cause: "Successful eco round" },
          { roundNumber: 16, previousMomentum: 70, newMomentum: 30, cause: "Lost anti-eco" }
        ]
      },
      playerAnalysis: [
        {
          player: "Player1",
          strengths: ["Excellent entry fragging", "Good positioning", "Effective utility usage"],
          weaknesses: ["Overaggressive in clutches", "Poor economy management"],
          keyStats: { "Entry Success Rate": 72, "Clutch Rate": 60, "Utility Efficiency": 85 },
          recommendations: [
            "Practice patience in clutch situations",
            "Focus on economy preservation",
            "Work on crosshair placement"
          ]
        }
      ],
      teamStrategy: {
        attackSuccess: 68,
        defenseSuccess: 72,
        sitePreference: { "A Site": 65, "B Site": 35 },
        utilityCoordination: 78,
        tradingEfficiency: 82,
        rotationTiming: 75
      },
      criticalMoments: [
        {
          roundNumber: 12,
          timestamp: 1456,
          description: "3v1 clutch by Player1 to secure economy",
          impact: "game_changing",
          analysis: "This clutch prevented an economy reset and maintained momentum going into the second half."
        }
      ],
      improvements: {
        highPriority: [
          "Improve anti-eco discipline",
          "Better utility coordination on executes",
          "Reduce overrotation on defense"
        ],
        mediumPriority: [
          "Enhance individual aim consistency",
          "Optimize agent compositions",
          "Improve communication timing"
        ],
        lowPriority: [
          "Refine post-plant positioning",
          "Develop more varied attack strategies"
        ],
        practiceRoutines: [
          {
            name: "Aim Training",
            description: "Daily aim routine focusing on crosshair placement and flicking",
            duration: "30 minutes",
            frequency: "Daily",
            focus: ["Crosshair placement", "Flick accuracy", "Tracking"]
          },
          {
            name: "Utility Practice",
            description: "Practice lineups and utility coordination",
            duration: "45 minutes",
            frequency: "3x per week",
            focus: ["Smoke lineups", "Flash coordination", "Utility timing"]
          }
        ],
        strategicAdjustments: [
          "Implement default setups on defense",
          "Develop anti-eco protocols",
          "Create structured attack executes"
        ]
      }
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
      case 'game_changing':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
      case 'momentum_shift':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low':
      case 'economy_shift':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    setMatchData(mockMatchData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Target className="w-8 h-8 mr-3 text-red-500" />
                Valorant Match Analyzer
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive match analysis and improvement recommendations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Enter match ID or upload VOD"
                className="w-64"
              />
              <Button 
                onClick={analyzeMatch}
                disabled={isAnalyzing}
                className="bg-red-500 hover:bg-red-600"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </motion.div>

        {/* Match Overview */}
        {matchData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Match Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{matchData.map}</div>
                <div className="text-sm text-gray-500">Map</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {matchData.score.team1} - {matchData.score.team2}
                </div>
                <div className="text-sm text-gray-500">Final Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{matchData.rounds.length}</div>
                <div className="text-sm text-gray-500">Total Rounds</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatTime(matchData.duration)}</div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="moments">Key Moments</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Map Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Team 1</span>
                          <span>{analysis.overview.mapControl.team1}%</span>
                        </div>
                        <Progress value={analysis.overview.mapControl.team1} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Team 2</span>
                          <span>{analysis.overview.mapControl.team2}%</span>
                        </div>
                        <Progress value={analysis.overview.mapControl.team2} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Economy Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Team 1</span>
                          <span>{analysis.overview.economyEfficiency.team1}%</span>
                        </div>
                        <Progress value={analysis.overview.economyEfficiency.team1} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Team 2</span>
                          <span>{analysis.overview.economyEfficiency.team2}%</span>
                        </div>
                        <Progress value={analysis.overview.economyEfficiency.team2} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Round Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analysis.overview.roundTypes).map(([type, count]) => (
                      <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-500 capitalize">{type.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
              {analysis.playerAnalysis.map((player, index) => (
                <motion.div
                  key={player.player}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          {player.player}
                        </span>
                        <Badge variant="outline">
                          {matchData?.players.find(p => p.name === player.player)?.agent}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {player.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-gray-600">• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {player.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-sm text-gray-600">• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            Key Statistics
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(player.keyStats).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between text-sm">
                                <span className="text-gray-600">{stat}:</span>
                                <span className="font-medium">{value}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {player.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-600">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Attack vs Defense
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attack Success</span>
                          <span>{analysis.teamStrategy.attackSuccess}%</span>
                        </div>
                        <Progress value={analysis.teamStrategy.attackSuccess} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Defense Success</span>
                          <span>{analysis.teamStrategy.defenseSuccess}%</span>
                        </div>
                        <Progress value={analysis.teamStrategy.defenseSuccess} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Team Coordination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Utility Coordination</span>
                          <span>{analysis.teamStrategy.utilityCoordination}%</span>
                        </div>
                        <Progress value={analysis.teamStrategy.utilityCoordination} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Trading Efficiency</span>
                          <span>{analysis.teamStrategy.tradingEfficiency}%</span>
                        </div>
                        <Progress value={analysis.teamStrategy.tradingEfficiency} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Rotation Timing</span>
                          <span>{analysis.teamStrategy.rotationTiming}%</span>
                        </div>
                        <Progress value={analysis.teamStrategy.rotationTiming} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="moments" className="space-y-6">
              {analysis.criticalMoments.map((moment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={getImpactColor(moment.impact)}>
                              Round {moment.roundNumber}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTime(moment.timestamp)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{moment.description}</h3>
                          <p className="text-gray-600">{moment.analysis}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(moment.impact)}`}>
                          {moment.impact.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="improvements" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      High Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.improvements.highPriority.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-yellow-600 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Medium Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.improvements.mediumPriority.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Low Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.improvements.lowPriority.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crosshair className="w-5 h-5 mr-2" />
                    Practice Routines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analysis.improvements.practiceRoutines.map((routine, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">{routine.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{routine.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Duration:</span> {routine.duration}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {routine.frequency}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium text-xs">Focus Areas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {routine.focus.map((focus, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Strategic Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.improvements.strategicAdjustments.map((adjustment, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        {adjustment}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};