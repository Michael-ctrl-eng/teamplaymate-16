import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Users,
  Plus,
  Edit,
  Save,
  X,
  User,
  Activity,
  Target,
  Heart,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  date_of_birth: string;
  nationality: string;
  height?: number;
  weight?: number;
  status: string;
}

export const PlayerManagementSection: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('roster');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    jerseyNumber: 0,
    dateOfBirth: '',
    nationality: '',
  });

  const positions = ['goalkeeper', 'defender', 'midfielder', 'forward'];

  useEffect(() => {
    const fetchPlayers = async () => {
      if (user && user.teamId) {
        try {
          setLoading(true);
          const response = await apiClient.get(`/players?teamId=${user.teamId}`);
          setPlayers(response.players);
        } catch (error) {
          console.error('Error fetching players:', error);
          toast.error('Failed to fetch players.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [user]);

  const handleAddPlayer = async () => {
    if (newPlayer.firstName && newPlayer.position) {
      try {
        const response = await apiClient.post('/players', newPlayer);
        setPlayers([...players, response.player]);
        setNewPlayer({
          firstName: '',
          lastName: '',
          email: '',
          position: '',
          jerseyNumber: 0,
          dateOfBirth: '',
          nationality: '',
        });
        setIsAddingPlayer(false);
        toast.success('Player added successfully!');
      } catch (error) {
        console.error('Error adding player:', error);
        toast.error('Failed to add player.');
      }
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'forward': return 'bg-red-100 text-red-800';
      case 'midfielder': return 'bg-blue-100 text-blue-800';
      case 'defender': return 'bg-green-100 text-green-800';
      case 'goalkeeper': return 'bg-purple-100 text-purple-800';
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
      transition={{ delay: 0.9 }}
      className="mt-8"
    >
      <Card className={`${
        isHighContrast ? 'hc-card' :
        theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Player Management</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your squad, track performance, and monitor fitness
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsAddingPlayer(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 m-4 mb-0">
              <TabsTrigger 
                value="roster" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Roster
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Activity className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="fitness" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Fitness
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roster" className="p-4 pt-0">
              <div className="space-y-4">
                {/* Add Player Form */}
                {isAddingPlayer && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Add New Player</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsAddingPlayer(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={newPlayer.firstName}
                            onChange={(e) => setNewPlayer({...newPlayer, firstName: e.target.value})}
                            placeholder="First Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={newPlayer.lastName}
                            onChange={(e) => setNewPlayer({...newPlayer, lastName: e.target.value})}
                            placeholder="Last Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newPlayer.email}
                            onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                            placeholder="Email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Position</Label>
                          <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer({...newPlayer, position: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map((pos) => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="jerseyNumber">Jersey Number</Label>
                          <Input
                            id="jerseyNumber"
                            type="number"
                            value={newPlayer.jerseyNumber || ''}
                            onChange={(e) => setNewPlayer({...newPlayer, jerseyNumber: parseInt(e.target.value) || 0})}
                            placeholder="Jersey Number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={newPlayer.dateOfBirth}
                            onChange={(e) => setNewPlayer({...newPlayer, dateOfBirth: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="nationality">Nationality</Label>
                          <Input
                            id="nationality"
                            value={newPlayer.nationality}
                            onChange={(e) => setNewPlayer({...newPlayer, nationality: e.target.value})}
                            placeholder="Nationality"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingPlayer(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPlayer} className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Save className="h-4 w-4 mr-2" />
                          Save Player
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Players List */}
                <div className="grid gap-4">
                  {players.map((player) => (
                    <Card key={player.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{player.first_name} {player.last_name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getPositionColor(player.position)}>
                                  {player.position}
                                </Badge>
                                <span className="text-sm text-gray-600">#{player.jersey_number}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`font-semibold`}>
                                {player.status}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="p-4 pt-0">
              {/* Performance content will be implemented later */}
              <p>Performance tracking will be implemented here.</p>
            </TabsContent>

            <TabsContent value="fitness" className="p-4 pt-0">
              {/* Fitness content will be implemented later */}
              <p>Fitness monitoring will be implemented here.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};