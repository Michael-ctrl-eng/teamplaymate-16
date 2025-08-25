import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  height: number;
  weight: number;
  fitness: number;
  goals: number;
  assists: number;
  minutes: number;
  cards: number;
  injuries: string[];
  notes: string;
}

export const PlayerManagementSection: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const [activeTab, setActiveTab] = useState('roster');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: 'Fernando Torres',
      position: 'DEL',
      age: 28,
      height: 183,
      weight: 75,
      fitness: 85,
      goals: 12,
      assists: 5,
      minutes: 1240,
      cards: 2,
      injuries: [],
      notes: 'Excellent finishing, needs work on headers'
    },
    {
      id: '2',
      name: 'Pablo Sánchez',
      position: 'CEN',
      age: 25,
      height: 178,
      weight: 72,
      fitness: 78,
      goals: 4,
      assists: 8,
      minutes: 1180,
      cards: 1,
      injuries: ['Minor ankle sprain'],
      notes: 'Great vision and passing ability'
    },
    {
      id: '3',
      name: 'Juan Pérez',
      position: 'DEF',
      age: 30,
      height: 185,
      weight: 80,
      fitness: 82,
      goals: 2,
      assists: 1,
      minutes: 1350,
      cards: 3,
      injuries: [],
      notes: 'Solid defender, good in the air'
    }
  ]);

  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: '',
    position: '',
    age: 0,
    height: 0,
    weight: 0,
    fitness: 0,
    goals: 0,
    assists: 0,
    minutes: 0,
    cards: 0,
    injuries: [],
    notes: ''
  });

  const positions = ['DEL', 'CEN', 'DEF', 'POR'];

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.position) {
      const player: Player = {
        id: Date.now().toString(),
        name: newPlayer.name || '',
        position: newPlayer.position || '',
        age: newPlayer.age || 0,
        height: newPlayer.height || 0,
        weight: newPlayer.weight || 0,
        fitness: newPlayer.fitness || 0,
        goals: newPlayer.goals || 0,
        assists: newPlayer.assists || 0,
        minutes: newPlayer.minutes || 0,
        cards: newPlayer.cards || 0,
        injuries: newPlayer.injuries || [],
        notes: newPlayer.notes || ''
      };
      setPlayers([...players, player]);
      setNewPlayer({
        name: '',
        position: '',
        age: 0,
        height: 0,
        weight: 0,
        fitness: 0,
        goals: 0,
        assists: 0,
        minutes: 0,
        cards: 0,
        injuries: [],
        notes: ''
      });
      setIsAddingPlayer(false);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'DEL': return 'bg-red-100 text-red-800';
      case 'CEN': return 'bg-blue-100 text-blue-800';
      case 'DEF': return 'bg-green-100 text-green-800';
      case 'POR': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFitnessColor = (fitness: number) => {
    if (fitness >= 80) return 'text-green-600';
    if (fitness >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={newPlayer.name || ''}
                            onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                            placeholder="Player name"
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
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={newPlayer.age || ''}
                            onChange={(e) => setNewPlayer({...newPlayer, age: parseInt(e.target.value) || 0})}
                            placeholder="Age"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={newPlayer.height || ''}
                            onChange={(e) => setNewPlayer({...newPlayer, height: parseInt(e.target.value) || 0})}
                            placeholder="Height"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={newPlayer.weight || ''}
                            onChange={(e) => setNewPlayer({...newPlayer, weight: parseInt(e.target.value) || 0})}
                            placeholder="Weight"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fitness">Fitness Level</Label>
                          <Input
                            id="fitness"
                            type="number"
                            min="0"
                            max="100"
                            value={newPlayer.fitness || ''}
                            onChange={(e) => setNewPlayer({...newPlayer, fitness: parseInt(e.target.value) || 0})}
                            placeholder="Fitness (0-100)"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newPlayer.notes || ''}
                          onChange={(e) => setNewPlayer({...newPlayer, notes: e.target.value})}
                          placeholder="Player notes and observations"
                          rows={3}
                        />
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
                              <h3 className="font-semibold text-gray-900">{player.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getPositionColor(player.position)}>
                                  {player.position}
                                </Badge>
                                <span className="text-sm text-gray-600">Age: {player.age}</span>
                                <span className="text-sm text-gray-600">|</span>
                                <span className="text-sm text-gray-600">{player.height}cm, {player.weight}kg</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <Heart className="h-4 w-4 text-gray-400" />
                                <span className={`font-semibold ${getFitnessColor(player.fitness)}`}>
                                  {player.fitness}%
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {player.goals}G / {player.assists}A
                              </div>
                            </div>
                            {player.injuries.length > 0 && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {player.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            {player.notes}
                          </div>
                        )}
                        {player.injuries.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {player.injuries.map((injury, index) => (
                                <Badge key={index} className="bg-red-100 text-red-800 text-xs">
                                  {injury}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="p-4 pt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Top Scorer</p>
                          <p className="text-lg font-bold text-blue-900">Fernando Torres</p>
                          <p className="text-sm text-blue-600">12 goals</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Most Assists</p>
                          <p className="text-lg font-bold text-green-900">Pablo Sánchez</p>
                          <p className="text-sm text-green-600">8 assists</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Most Minutes</p>
                          <p className="text-lg font-bold text-purple-900">Juan Pérez</p>
                          <p className="text-sm text-purple-600">1,350 min</p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600">Best Fitness</p>
                          <p className="text-lg font-bold text-yellow-900">Fernando Torres</p>
                          <p className="text-sm text-yellow-600">85%</p>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{player.name}</p>
                              <Badge className={getPositionColor(player.position)} size="sm">
                                {player.position}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-sm text-gray-600">Goals</p>
                              <p className="font-semibold text-green-600">{player.goals}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Assists</p>
                              <p className="font-semibold text-blue-600">{player.assists}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Minutes</p>
                              <p className="font-semibold text-gray-900">{player.minutes}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Fitness</p>
                              <p className={`font-semibold ${getFitnessColor(player.fitness)}`}>
                                {player.fitness}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fitness" className="p-4 pt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-600">Average Fitness</p>
                        <p className="text-2xl font-bold text-green-900">82%</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600">Injured Players</p>
                        <p className="text-2xl font-bold text-red-900">1</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-600">Ready to Play</p>
                        <p className="text-2xl font-bold text-blue-900">{players.filter(p => p.fitness >= 70 && p.injuries.length === 0).length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Fitness Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {players.map((player) => (
                        <div key={player.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{player.name}</p>
                                <Badge className={getPositionColor(player.position)} size="sm">
                                  {player.position}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Heart className="h-4 w-4 text-gray-400" />
                              <span className={`font-semibold ${getFitnessColor(player.fitness)}`}>
                                {player.fitness}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                player.fitness >= 80 ? 'bg-green-500' :
                                player.fitness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${player.fitness}%` }}
                            ></div>
                          </div>
                          {player.injuries.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">
                                Injuries: {player.injuries.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};