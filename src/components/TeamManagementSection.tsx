import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import {
  Users,
  Settings,
  Trophy,
  Target,
  Shield,
  Zap,
  Star,
  Plus,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';

interface TeamInfo {
  id: string;
  name: string;
  founded: number;
  stadium: string;
  capacity: number;
  city: string;
  country: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  logo_url: string;
}

interface Formation {
  id: string;
  name: string;
  formation: string;
  description: string;
  isActive: boolean;
}

interface TacticalSetting {
  id: string;
  name: string;
  value: string;
  category: 'attacking' | 'defending' | 'general';
}

export const TeamManagementSection: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [formations, setFormations] = useState<Formation[]>([
    {
      id: '1',
      name: '4-3-3 Attacking',
      formation: '4-3-3',
      description: 'Offensive formation with wide wingers and attacking midfielder',
      isActive: true
    },
    {
      id: '2',
      name: '4-4-2 Classic',
      formation: '4-4-2',
      description: 'Balanced formation with two strikers and solid midfield',
      isActive: false
    },
    {
      id: '3',
      name: '3-5-2 Defensive',
      formation: '3-5-2',
      description: 'Defensive setup with wing-backs and compact midfield',
      isActive: false
    },
    {
      id: '4',
      name: '4-2-3-1 Modern',
      formation: '4-2-3-1',
      description: 'Modern formation with defensive midfielders and attacking midfielder',
      isActive: false
    }
  ]);

  const [tacticalSettings, setTacticalSettings] = useState<TacticalSetting[]>([
    { id: '1', name: 'Pressing Intensity', value: 'High', category: 'defending' },
    { id: '2', name: 'Attacking Style', value: 'Possession', category: 'attacking' },
    { id: '3', name: 'Defensive Line', value: 'Medium', category: 'defending' },
    { id: '4', name: 'Tempo', value: 'Fast', category: 'general' },
    { id: '5', name: 'Width', value: 'Wide', category: 'attacking' },
    { id: '6', name: 'Mentality', value: 'Attacking', category: 'general' }
  ]);

  const [newFormation, setNewFormation] = useState({
    name: '',
    formation: '',
    description: ''
  });

  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (user && user.teamId) {
        try {
          setLoading(true);
          const response = await apiClient.get(`/teams/${user.teamId}`);
          setTeamInfo(response.team);
        } catch (error) {
          console.error('Error fetching team info:', error);
          toast.error('Failed to fetch team information.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTeamInfo();
  }, [user]);

  const handleSaveTeamInfo = async () => {
    if (user && user.teamId && teamInfo) {
      try {
        setIsEditing(false);
        const response = await apiClient.put(`/teams/${user.teamId}`, teamInfo);
        setTeamInfo(response.team);
        toast.success('Team information saved successfully!');
      } catch (error) {
        console.error('Error saving team info:', error);
        toast.error('Failed to save team information.');
      }
    }
  };

  const handleAddFormation = () => {
    if (newFormation.name && newFormation.formation) {
      const formation: Formation = {
        id: Date.now().toString(),
        name: newFormation.name,
        formation: newFormation.formation,
        description: newFormation.description,
        isActive: false
      };
      setFormations(prev => [...prev, formation]);
      setNewFormation({ name: '', formation: '', description: '' });
    }
  };

  const handleSetActiveFormation = (formationId: string) => {
    setFormations(prev => prev.map(f => ({
      ...f,
      isActive: f.id === formationId
    })));
  };

  const handleUpdateTacticalSetting = (id: string, value: string) => {
    setTacticalSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attacking': return 'bg-red-100 text-red-800';
      case 'defending': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attacking': return <Target className="h-4 w-4" />;
      case 'defending': return <Shield className="h-4 w-4" />;
      case 'general': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!teamInfo) {
    return (
      <div className="text-center p-8">
        <p>No team information available. Please create a team first.</p>
        {/* Optionally, add a button to create a team */}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
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
                <CardTitle className="text-gray-900">Team Management</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage team information, formations, and tactical settings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active Season
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 m-4 mb-0">
              <TabsTrigger 
                value="info" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Team Info
              </TabsTrigger>
              <TabsTrigger 
                value="formations" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Formations
              </TabsTrigger>
              <TabsTrigger 
                value="tactics" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Tactics
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="p-4 pt-0">
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Team Information</CardTitle>
                      <Button
                        onClick={() => isEditing ? handleSaveTeamInfo() : setIsEditing(true)}
                        className={isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
                      >
                        {isEditing ? (
                          <><Save className="h-4 w-4 mr-2" />Save</>
                        ) : (
                          <><Edit className="h-4 w-4 mr-2" />Edit</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          value={teamInfo.name || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, name: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="founded">Founded</Label>
                        <Input
                          id="founded"
                          type="number"
                          value={teamInfo.founded || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, founded: parseInt(e.target.value) } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stadium">Stadium</Label>
                        <Input
                          id="stadium"
                          value={teamInfo.stadium || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, stadium: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={teamInfo.capacity || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, capacity: parseInt(e.target.value) } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={teamInfo.city || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, city: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={teamInfo.country || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, country: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={teamInfo.website || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, website: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={teamInfo.email || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, email: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={teamInfo.phone || ''}
                          onChange={(e) => setTeamInfo(prev => prev ? { ...prev, phone: e.target.value } : null)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={teamInfo.description || ''}
                        onChange={(e) => setTeamInfo(prev => prev ? { ...prev, description: e.target.value } : null)}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{teamInfo.founded}</div>
                      <div className="text-sm text-gray-600">Founded</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{teamInfo.capacity}</div>
                      <div className="text-sm text-gray-600">Capacity</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-gray-900">{teamInfo.city}</div>
                      <div className="text-sm text-gray-600">Location</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">25</div>
                      <div className="text-sm text-gray-600">Players</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="formations" className="p-4 pt-0">
              {/* ... formations content ... */}
            </TabsContent>

            <TabsContent value="tactics" className="p-4 pt-0">
              {/* ... tactics content ... */}
            </TabsContent>

            <TabsContent value="achievements" className="p-4 pt-0">
              {/* ... achievements content ... */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};