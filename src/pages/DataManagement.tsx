import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import {
  Database,
  Users,
  FileText,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Calendar,
  Target,
  Trophy,
  Activity,
  TrendingUp,
  Settings,
  RefreshCw,
  Import,
  Archive,
  Shield,
  Clock,
  MapPin,
  Star,
  Award,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Globe
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  goals: number;
  assists: number;
  matches: number;
  rating: number;
  status: 'active' | 'injured' | 'suspended';
  contract: string;
  salary: number;
  marketValue: number;
}

interface Club {
  id: number;
  name: string;
  league: string;
  founded: number;
  stadium: string;
  capacity: number;
  budget: number;
  revenue: number;
  expenses: number;
  trophies: number;
  ranking: number;
}

interface AnalyticsData {
  totalPlayers: number;
  activeContracts: number;
  totalRevenue: number;
  avgPlayerRating: number;
  matchesPlayed: number;
  goalsScored: number;
  cleanSheets: number;
  winRate: number;
}

const DataManagement: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const { language } = useLanguage();
  
  const [activeTab, setActiveTab] = React.useState('players');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPlayers, setSelectedPlayers] = React.useState<number[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [isLoading, setIsLoading] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<string>('csv');

  // Enhanced sample data with more realistic information
  const [players, setPlayers] = React.useState<Player[]>([
    {
      id: 1,
      name: 'Lionel Messi',
      position: 'RW',
      age: 36,
      nationality: 'Argentina',
      goals: 25,
      assists: 18,
      matches: 32,
      rating: 9.2,
      status: 'active',
      contract: '2025-06-30',
      salary: 50000000,
      marketValue: 35000000
    },
    {
      id: 2,
      name: 'Kylian Mbappé',
      position: 'LW',
      age: 25,
      nationality: 'France',
      goals: 28,
      assists: 12,
      matches: 30,
      rating: 9.0,
      status: 'active',
      contract: '2026-06-30',
      salary: 45000000,
      marketValue: 180000000
    },
    {
      id: 3,
      name: 'Erling Haaland',
      position: 'ST',
      age: 24,
      nationality: 'Norway',
      goals: 35,
      assists: 8,
      matches: 33,
      rating: 8.9,
      status: 'injured',
      contract: '2027-06-30',
      salary: 40000000,
      marketValue: 200000000
    },
    {
      id: 4,
      name: 'Pedri González',
      position: 'CM',
      age: 21,
      nationality: 'Spain',
      goals: 8,
      assists: 15,
      matches: 28,
      rating: 8.5,
      status: 'active',
      contract: '2026-06-30',
      salary: 15000000,
      marketValue: 100000000
    },
    {
      id: 5,
      name: 'Virgil van Dijk',
      position: 'CB',
      age: 32,
      nationality: 'Netherlands',
      goals: 3,
      assists: 2,
      matches: 31,
      rating: 8.7,
      status: 'active',
      contract: '2025-06-30',
      salary: 25000000,
      marketValue: 45000000
    }
  ]);

  const [clubs, setClubs] = React.useState<Club[]>([
    {
      id: 1,
      name: 'FC Barcelona',
      league: 'La Liga',
      founded: 1899,
      stadium: 'Camp Nou',
      capacity: 99354,
      budget: 800000000,
      revenue: 715000000,
      expenses: 680000000,
      trophies: 97,
      ranking: 3
    },
    {
      id: 2,
      name: 'Real Madrid',
      league: 'La Liga',
      founded: 1902,
      stadium: 'Santiago Bernabéu',
      capacity: 81044,
      budget: 900000000,
      revenue: 750000000,
      expenses: 700000000,
      trophies: 95,
      ranking: 1
    },
    {
      id: 3,
      name: 'Manchester City',
      league: 'Premier League',
      founded: 1880,
      stadium: 'Etihad Stadium',
      capacity: 55017,
      budget: 850000000,
      revenue: 731000000,
      expenses: 720000000,
      trophies: 35,
      ranking: 2
    }
  ]);

  const analyticsData: AnalyticsData = {
    totalPlayers: players.length,
    activeContracts: players.filter(p => p.status === 'active').length,
    totalRevenue: clubs.reduce((sum, club) => sum + club.revenue, 0),
    avgPlayerRating: players.reduce((sum, p) => sum + p.rating, 0) / players.length,
    matchesPlayed: players.reduce((sum, p) => sum + p.matches, 0),
    goalsScored: players.reduce((sum, p) => sum + p.goals, 0),
    cleanSheets: 15,
    winRate: 68.5
  };

  // Enhanced filtering and sorting functions
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.nationality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'rating': return b.rating - a.rating;
      case 'goals': return b.goals - a.goals;
      case 'age': return a.age - b.age;
      case 'marketValue': return b.marketValue - a.marketValue;
      default: return 0;
    }
  });

  const handleExportData = async (format: string) => {
    setIsLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    setIsLoading(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select players first');
      return;
    }
    
    switch (action) {
      case 'export':
        toast.success(`Exported ${selectedPlayers.length} players`);
        break;
      case 'archive':
        toast.success(`Archived ${selectedPlayers.length} players`);
        break;
      case 'delete':
        toast.success(`Deleted ${selectedPlayers.length} players`);
        setPlayers(prev => prev.filter(p => !selectedPlayers.includes(p.id)));
        break;
    }
    setSelectedPlayers([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              Data Management Center
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive player and club data management system
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleImportData()}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Import className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button
              onClick={() => handleExportData(exportFormat)}
              disabled={isLoading}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Players</p>
                  <p className="text-3xl font-bold">{analyticsData.totalPlayers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Contracts</p>
                  <p className="text-3xl font-bold">{analyticsData.activeContracts}</p>
                </div>
                <Shield className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg Rating</p>
                  <p className="text-3xl font-bold">{analyticsData.avgPlayerRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Total Goals</p>
                  <p className="text-3xl font-bold">{analyticsData.goalsScored}</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Players
              </TabsTrigger>
              <TabsTrigger value="clubs" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Clubs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Players Tab */}
            <TabsContent value="players" className="space-y-6">
              {/* Search and Filter Controls */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search players by name, position, or nationality..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="injured">Injured</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="goals">Sort by Goals</option>
                        <option value="age">Sort by Age</option>
                        <option value="marketValue">Sort by Market Value</option>
                      </select>
                    </div>
                  </div>
                  
                  {selectedPlayers.length > 0 && (
                    <div className="mt-4 flex gap-3">
                      <Badge variant="secondary">
                        {selectedPlayers.length} selected
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('export')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('archive')}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBulkAction('delete')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Players Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPlayers(filteredPlayers.map(p => p.id));
                                } else {
                                  setSelectedPlayers([]);
                                }
                              }}
                              checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contract
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Market Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPlayers.map((player) => (
                          <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPlayers.includes(player.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPlayers(prev => [...prev, player.id]);
                                  } else {
                                    setSelectedPlayers(prev => prev.filter(id => id !== player.id));
                                  }
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {player.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {player.nationality} • Age {player.age}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline">{player.position}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-green-500" />
                                  {player.goals}G
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-blue-500" />
                                  {player.assists}A
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  {player.rating}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="text-gray-900 dark:text-white">
                                  Until {player.contract}
                                </div>
                                <div className="text-gray-500">
                                  ${(player.salary / 1000000).toFixed(1)}M/year
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                ${(player.marketValue / 1000000).toFixed(1)}M
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={player.status === 'active' ? 'default' : 
                                        player.status === 'injured' ? 'destructive' : 'secondary'}
                              >
                                {player.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clubs Tab */}
            <TabsContent value="clubs" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {clubs.map((club) => (
                  <Card key={club.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{club.name}</span>
                        <Badge>#{club.ranking}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">League</p>
                          <p className="font-medium">{club.league}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Founded</p>
                          <p className="font-medium">{club.founded}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Stadium</p>
                          <p className="font-medium">{club.stadium}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Capacity</p>
                          <p className="font-medium">{club.capacity.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Revenue</span>
                          <span className="font-medium text-green-600">
                            ${(club.revenue / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expenses</span>
                          <span className="font-medium text-red-600">
                            ${(club.expenses / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trophies</span>
                          <span className="font-medium flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            {club.trophies}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Win Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${analyticsData.winRate}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{analyticsData.winRate}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Goals per Match</span>
                        <span className="font-medium">
                          {(analyticsData.goalsScored / analyticsData.matchesPlayed * players.length).toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Clean Sheets</span>
                        <span className="font-medium">{analyticsData.cleanSheets}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          CPU Usage
                        </span>
                        <span className="font-medium">45%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Storage
                        </span>
                        <span className="font-medium">2.3GB / 10GB</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          Network
                        </span>
                        <Badge variant="default">Online</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          API Status
                        </span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Player Performance Report',
                    description: 'Comprehensive analysis of individual player statistics and performance metrics',
                    icon: <Users className="h-8 w-8 text-blue-500" />,
                    lastGenerated: '2 hours ago',
                    status: 'Ready'
                  },
                  {
                    title: 'Team Analytics Report',
                    description: 'Team-wide performance analysis including tactical insights and formation effectiveness',
                    icon: <BarChart3 className="h-8 w-8 text-green-500" />,
                    lastGenerated: '1 day ago',
                    status: 'Ready'
                  },
                  {
                    title: 'Financial Summary',
                    description: 'Complete financial overview including player salaries, transfer budgets, and revenue',
                    icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
                    lastGenerated: '3 days ago',
                    status: 'Generating'
                  },
                  {
                    title: 'Injury & Fitness Report',
                    description: 'Player health status, injury history, and fitness level analysis',
                    icon: <Activity className="h-8 w-8 text-red-500" />,
                    lastGenerated: '5 hours ago',
                    status: 'Ready'
                  },
                  {
                    title: 'Transfer Market Analysis',
                    description: 'Market value trends, transfer opportunities, and player valuations',
                    icon: <TrendingUp className="h-8 w-8 text-orange-500" />,
                    lastGenerated: '1 week ago',
                    status: 'Outdated'
                  },
                  {
                    title: 'Match Performance Report',
                    description: 'Detailed match analysis including key events, player ratings, and tactical review',
                    icon: <Target className="h-8 w-8 text-indigo-500" />,
                    lastGenerated: '6 hours ago',
                    status: 'Ready'
                  }
                ].map((report, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {report.icon}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{report.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Last Generated</span>
                          <span className="font-medium">{report.lastGenerated}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge
                            variant={report.status === 'Ready' ? 'default' : 
                                    report.status === 'Generating' ? 'secondary' : 'destructive'}
                          >
                            {report.status}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Download className="h-4 w-4 mr-1" />
                              Generate PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DataManagement;

// Export interfaces for use in other components
export type { Player, Club, AnalyticsData };