import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Play,
  Pause,
  Square,
  Clock,
  Target,
  Users,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  Flag,
  Activity,
  Timer,
  Zap,
  Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';
import io from 'socket.io-client';

interface MatchEvent {
  id: string;
  type: 'goal' | 'card' | 'substitution' | 'foul' | 'corner' | 'offside';
  player: string;
  team: 'home' | 'away';
  minute: number;
  description: string;
}

interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  cards: { home: number; away: number };
}

const MATCH_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Hardcoded for now

export const MatchTrackingSection: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const [activeTab, setActiveTab] = useState('live');
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [newEventType, setNewEventType] = useState('');
  const [newEventPlayer, setNewEventPlayer] = useState('');
  const [newEventTeam, setNewEventTeam] = useState<'home' | 'away'>('home');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const [matchStats, setMatchStats] = useState<MatchStats>({
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    cards: { home: 0, away: 0 }
  });

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/matches/${MATCH_ID}`);
        const match = response.match;
        setHomeTeam(match.home_team_name);
        setAwayTeam(match.away_team_name);
        setHomeScore(match.home_score);
        setAwayScore(match.away_score);
        setEvents(match.events);
        setIsMatchActive(match.status === 'live');
        // We'll use a local timer for now, but in a real app, this should be synced with the backend
      } catch (error) {
        console.error('Error fetching match data:', error);
        toast.error('Failed to fetch match data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3006');
    socket.on(`match-update-${MATCH_ID}`, (data) => {
      toast.info(`Live update for match ${MATCH_ID}`);
      if (data.homeScore !== undefined) setHomeScore(data.homeScore);
      if (data.awayScore !== undefined) setAwayScore(data.awayScore);
      if (data.status) setIsMatchActive(data.status === 'live');
    });

    socket.on(`match-event-${MATCH_ID}`, (event) => {
      setEvents(prev => [event, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMatchActive) {
      interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatchActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentMinute = () => {
    return Math.floor(matchTime / 60);
  };

  const handleUpdateMatchStatus = async (status: 'live' | 'halftime' | 'finished' | 'scheduled') => {
    try {
      await apiClient.put(`/matches/${MATCH_ID}`, { status });
      setIsMatchActive(status === 'live');
      toast.success(`Match status updated to ${status}`);
    } catch (error) {
      console.error('Error updating match status:', error);
      toast.error('Failed to update match status.');
    }
  };

  const handleAddEvent = async () => {
    if (newEventType && newEventPlayer) {
      try {
        const payload = {
          type: newEventType,
          playerId: newEventPlayer, // This should be a player ID
          minute: getCurrentMinute(),
          description: newEventDescription,
        };
        await apiClient.post(`/matches/${MATCH_ID}/events`, payload);
        // The event will be added via WebSocket, so no need to update state here
        setNewEventType('');
        setNewEventPlayer('');
        setNewEventDescription('');
        toast.success('Event added successfully!');
      } catch (error) {
        console.error('Error adding event:', error);
        toast.error('Failed to add event.');
      }
    }
  };

    const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal': return <Target className="h-4 w-4 text-green-600" />;
      case 'card': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'substitution': return <Users className="h-4 w-4 text-blue-600" />;
      case 'foul': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'corner': return <Flag className="h-4 w-4 text-purple-600" />;
      case 'offside': return <Flag className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-yellow-100 text-yellow-800';
      case 'substitution': return 'bg-blue-100 text-blue-800';
      case 'foul': return 'bg-red-100 text-red-800';
      case 'corner': return 'bg-purple-100 text-purple-800';
      case 'offside': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="mt-8"
    >
      <Card className={`${
        isHighContrast ? 'hc-card' :
        theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="border-b border-gray-100">
          {/* ... */}
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 m-4 mb-0">
              {/* ... */}
            </TabsList>

            <TabsContent value="live" className="p-4 pt-0">
              <div className="space-y-6">
                {/* Match Timer and Score */}
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                  <CardContent className="p-6">
                    {/* ... */}
                  </CardContent>
                </Card>

                {/* Match Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Match Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center space-x-4">
                      <Button 
                        onClick={() => handleUpdateMatchStatus('live')}
                        disabled={isMatchActive}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                      <Button 
                        onClick={() => handleUpdateMatchStatus('halftime')}
                        disabled={!isMatchActive}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button 
                        onClick={() => handleUpdateMatchStatus('finished')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="p-4 pt-0">
              <div className="space-y-4">
                {/* Add Event Form */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Match Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ... form ... */}
                    <Button onClick={handleAddEvent} className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </CardContent>
                </Card>

                {/* Events Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Match Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* ... events list ... */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="p-4 pt-0">
              {/* ... stats content ... */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};