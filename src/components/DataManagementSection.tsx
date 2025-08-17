import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { dataManagementService, Player, ClubData } from '../services/dataManagementService';
import {
  Database,
  Users,
  Building2,
  Search,
  Filter,
  Plus,
  Edit3,
  Save,
  Trash2,
  Download,
  Upload,
  Calendar,
  Trophy,
  Target,
  Heart,
  Activity,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Settings,
  Loader2
} from 'lucide-react';

// Player and ClubData interfaces are now imported from dataManagementService

const DataManagementSection: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);

  const [clubData, setClubData] = useState<ClubData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersData, clubInfo] = await Promise.all([
        dataManagementService.getPlayers(),
        dataManagementService.getClubData()
      ]);
      setPlayers(playersData);
      setClubData(clubInfo);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'DEL': return 'bg-red-100 text-red-800';
      case 'CEN': return 'bg-blue-100 text-blue-800';
      case 'DEF': return 'bg-green-100 text-green-800';
      case 'POR': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 85) return 'text-green-600';
    if (skill >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSavePlayer = async (player: Player) => {
    try {
      setSaving(true);
      if (selectedPlayer) {
        const updatedPlayer = await dataManagementService.updatePlayer(player.id, player);
        setPlayers(prev => prev.map(p => p.id === player.id ? updatedPlayer : p));
        toast.success('Player data updated successfully!');
      } else {
        const newPlayer = await dataManagementService.createPlayer(player);
        setPlayers(prev => [...prev, newPlayer]);
        toast.success('New player added successfully!');
      }
      setIsEditing(false);
      setShowAddForm(false);
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error saving player:', error);
      toast.error('Failed to save player data');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await dataManagementService.deletePlayer(playerId);
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast.success('Player removed successfully!');
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Failed to delete player');
    }
  };

  const PlayerForm: React.FC<{ player?: Player; onSave: (player: Player) => void; onCancel: () => void }> = ({ player, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Player>(player || {
      id: '',
      name: '',
      position: 'DEL',
      age: 18,
      nationality: '',
      email: '',
      phone: '',
      address: '',
      joinDate: new Date().toISOString().split('T')[0],
      contractEnd: '',
      salary: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      fitness: 100,
      injuries: [],
      notes: '',
      skills: { technical: 50, physical: 50, tactical: 50, mental: 50 },
      medicalClearance: true,
      lastMedicalCheck: new Date().toISOString().split('T')[0]
    });

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{player ? 'Edit Player' : 'Add New Player'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Player name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="DEL">Delantero (Forward)</option>
                <option value="CEN">Centrocampista (Midfielder)</option>
                <option value="DEF">Defensa (Defender)</option>
                <option value="POR">Portero (Goalkeeper)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                min="16"
                max="45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="player@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Join Date</label>
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contract End</label>
              <Input
                type="date"
                value={formData.contractEnd}
                onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Salary (€/year)</label>
            <Input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
              placeholder="Annual salary"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Technical</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.skills.technical}
                onChange={(e) => setFormData({
                  ...formData,
                  skills: { ...formData.skills, technical: parseInt(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Physical</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.skills.physical}
                onChange={(e) => setFormData({
                  ...formData,
                  skills: { ...formData.skills, physical: parseInt(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tactical</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.skills.tactical}
                onChange={(e) => setFormData({
                  ...formData,
                  skills: { ...formData.skills, tactical: parseInt(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mental</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.skills.mental}
                onChange={(e) => setFormData({
                  ...formData,
                  skills: { ...formData.skills, mental: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Coach notes, observations, development plans..."
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => onSave(formData)} 
              className="bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Player'}
            </Button>
            <Button onClick={onCancel} variant="outline" disabled={saving}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <Card className={`${
        isHighContrast ? 'hc-card' :
        theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-900">DATA Management Center</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive player and club data management with advanced features
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="players" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Players</span>
              </TabsTrigger>
              <TabsTrigger value="club" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Club Data</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-6">
              <div className="space-y-4">
                {/* Search and Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Player
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>

                {/* Add/Edit Player Form */}
                {(showAddForm || (selectedPlayer && isEditing)) && (
                  <PlayerForm
                    player={selectedPlayer || undefined}
                    onSave={handleSavePlayer}
                    onCancel={() => {
                      setShowAddForm(false);
                      setIsEditing(false);
                      setSelectedPlayer(null);
                    }}
                  />
                )}

                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlayers.map((player) => (
                    <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {player.photo ? (
                                <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <User className="h-6 w-6 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{player.name}</h3>
                              <p className="text-sm text-gray-500">{player.age} years • {player.nationality}</p>
                            </div>
                          </div>
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div className="flex items-center space-x-1">
                            <Target className="h-3 w-3 text-red-500" />
                            <span>{player.goals} goals</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span>{player.assists} assists</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-green-500" />
                            <span>{player.minutes} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-pink-500" />
                            <span>{player.fitness}% fit</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Skills Overview</div>
                          <div className="grid grid-cols-4 gap-1 text-xs">
                            <div className="text-center">
                              <div className={`font-semibold ${getSkillColor(player.skills.technical)}`}>
                                {player.skills.technical}
                              </div>
                              <div className="text-gray-400">TEC</div>
                            </div>
                            <div className="text-center">
                              <div className={`font-semibold ${getSkillColor(player.skills.physical)}`}>
                                {player.skills.physical}
                              </div>
                              <div className="text-gray-400">PHY</div>
                            </div>
                            <div className="text-center">
                              <div className={`font-semibold ${getSkillColor(player.skills.tactical)}`}>
                                {player.skills.tactical}
                              </div>
                              <div className="text-gray-400">TAC</div>
                            </div>
                            <div className="text-center">
                              <div className={`font-semibold ${getSkillColor(player.skills.mental)}`}>
                                {player.skills.mental}
                              </div>
                              <div className="text-gray-400">MEN</div>
                            </div>
                          </div>
                        </div>

                        {player.notes && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Notes</div>
                            <p className="text-xs text-gray-700 line-clamp-2">{player.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {player.medicalClearance ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-500">
                              Medical: {player.medicalClearance ? 'Clear' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPlayer(player);
                                setIsEditing(true);
                              }}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePlayer(player.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="club" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Club Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Club Name</label>
                        <Input value={clubData?.name || ''} onChange={(e) => setClubData(prev => prev ? {...prev, name: e.target.value} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Founded</label>
                        <Input type="number" value={clubData?.founded || ''} onChange={(e) => setClubData(prev => prev ? {...prev, founded: parseInt(e.target.value)} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Stadium</label>
                        <Input value={clubData?.stadium || ''} onChange={(e) => setClubData(prev => prev ? {...prev, stadium: e.target.value} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Capacity</label>
                        <Input type="number" value={clubData?.capacity || ''} onChange={(e) => setClubData(prev => prev ? {...prev, capacity: parseInt(e.target.value)} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <Input value={clubData?.phone || ''} onChange={(e) => setClubData(prev => prev ? {...prev, phone: e.target.value} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input value={clubData?.email || ''} onChange={(e) => setClubData(prev => prev ? {...prev, email: e.target.value} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">President</label>
                        <Input value={clubData?.president || ''} onChange={(e) => setClubData(prev => prev ? {...prev, president: e.target.value} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Head Coach</label>
                        <Input value={clubData?.headCoach || ''} onChange={(e) => setClubData(prev => prev ? {...prev, headCoach: e.target.value} : null)} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <Input value={clubData?.address || ''} onChange={(e) => setClubData(prev => prev ? {...prev, address: e.target.value} : null)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Annual Budget (€)</label>
                        <Input type="number" value={clubData?.budget || ''} onChange={(e) => setClubData(prev => prev ? {...prev, budget: parseInt(e.target.value)} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Trophies Won</label>
                        <Input type="number" value={clubData?.trophies || ''} onChange={(e) => setClubData(prev => prev ? {...prev, trophies: parseInt(e.target.value)} : null)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Website</label>
                        <Input value={clubData?.website || ''} onChange={(e) => setClubData(prev => prev ? {...prev, website: e.target.value} : null)} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Club Notes</label>
                      <Textarea
                        value={clubData?.notes || ''}
                        onChange={(e) => setClubData(prev => prev ? {...prev, notes: e.target.value} : null)}
                        placeholder="Club history, achievements, goals, strategic notes..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        if (clubData) {
                          try {
                            setSaving(true);
                            await dataManagementService.updateClubData(clubData);
                            toast.success('Club data updated successfully!');
                          } catch (error) {
                            console.error('Error updating club data:', error);
                            toast.error('Failed to update club data');
                          } finally {
                            setSaving(false);
                          }
                        }
                      }}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Club Data'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Staff & Facilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Staff Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Coaches</span>
                          <Badge variant="outline">{clubData?.staff.coaches || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Medical Staff</span>
                          <Badge variant="outline">{clubData?.staff.medical || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Administrative</span>
                          <Badge variant="outline">{clubData?.staff.administrative || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Facilities</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Training Grounds</span>
                          <Badge variant="outline">{clubData?.facilities.trainingGrounds || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Medical Center</span>
                          <Badge className={clubData?.facilities.medicalCenter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {clubData?.facilities.medicalCenter ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Gym</span>
                          <Badge className={clubData?.facilities.gym ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {clubData?.facilities.gym ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Restaurant</span>
                          <Badge className={clubData?.facilities.restaurant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {clubData?.facilities.restaurant ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span>Team Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Age</span>
                        <span className="font-semibold">25.0 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Goals</span>
                        <span className="font-semibold text-green-600">17</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Assists</span>
                        <span className="font-semibold text-blue-600">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Fitness</span>
                        <span className="font-semibold text-purple-600">90%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span>Top Performers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Top Scorer</span>
                        </div>
                        <span className="font-semibold">Carlos R.</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Most Assists</span>
                        </div>
                        <span className="font-semibold">Miguel S.</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-pink-500" />
                          <span className="text-sm">Best Fitness</span>
                        </div>
                        <span className="font-semibold">Carlos R.</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span>Financial Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Salaries</span>
                        <span className="font-semibold">€97,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Budget Remaining</span>
                        <span className="font-semibold text-green-600">€2,403,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Salary</span>
                        <span className="font-semibold">€48,500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">Player Performance Report</h3>
                          <p className="text-sm text-gray-500">Detailed individual statistics</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <BarChart3 className="h-8 w-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold">Team Analytics</h3>
                          <p className="text-sm text-gray-500">Comprehensive team analysis</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <DollarSign className="h-8 w-8 text-purple-500" />
                        <div>
                          <h3 className="font-semibold">Financial Summary</h3>
                          <p className="text-sm text-gray-500">Budget and salary overview</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Heart className="h-8 w-8 text-red-500" />
                        <div>
                          <h3 className="font-semibold">Medical Report</h3>
                          <p className="text-sm text-gray-500">Health and fitness status</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Calendar className="h-8 w-8 text-orange-500" />
                        <div>
                          <h3 className="font-semibold">Contract Overview</h3>
                          <p className="text-sm text-gray-500">Contract renewals and dates</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 className="h-8 w-8 text-indigo-500" />
                        <div>
                          <h3 className="font-semibold">Club Summary</h3>
                          <p className="text-sm text-gray-500">Complete club information</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataManagementSection;