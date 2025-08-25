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
  Globe,
  Loader2
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
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  
  const [activeTab, setActiveTab] = React.useState('players');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPlayers, setSelectedPlayers] = React.useState<number[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [isLoading, setIsLoading] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<string>('csv');
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null);

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
      let content: string;
      let filename: string;
      let mimeType: string;
      
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        content = "Name,Position,Age,Nationality,Goals,Assists,Rating,Status,Salary,Market Value\n"
          + players.map(p => 
            `"${p.name}",${p.position},${p.age},"${p.nationality}",${p.goals},${p.assists},${p.rating},${p.status},${p.salary},${p.marketValue}`
          ).join("\n");
        filename = `players_export_${timestamp}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify({ players, clubs, exportDate: new Date().toISOString() }, null, 2);
        filename = `data_export_${timestamp}.json`;
        mimeType = 'application/json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Data exported successfully as ${format.toUpperCase()}`, {
        description: `File: ${filename}`
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'An error occurred while exporting data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async (event?: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (!file) {
      // Create file input for import
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv';
      input.onchange = (e) => handleImportData(e as any);
      input.click();
      return;
    }
    
    setIsLoading(true);
    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
          if (data.clubs && Array.isArray(data.clubs)) {
            setClubs(data.clubs);
          }
          toast.success('JSON data imported successfully', {
            description: `Imported ${data.players.length} players`
          });
        } else {
          throw new Error('Invalid JSON format');
        }
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing (for demonstration)
        const lines = text.split('\n');
        const headers = lines[0]?.split(',') || [];
        const importedPlayers = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: players.length + index + 1,
              name: values[0]?.replace(/"/g, '') || '',
              position: values[1] || '',
              age: parseInt(values[2] || '0') || 0,
              nationality: values[3]?.replace(/"/g, '') || '',
              goals: parseInt(values[4] || '0') || 0,
              assists: parseInt(values[5] || '0') || 0,
              rating: parseFloat(values[6] || '0') || 0,
              status: (values[7] as any) || 'active',
              contract: '2025-06-30',
              salary: parseInt(values[8] || '0') || 0,
              marketValue: parseInt(values[9] || '0') || 0
            } as Player;
          });
        
        setPlayers(prev => [...prev, ...importedPlayers]);
        toast.success('CSV data imported successfully', {
          description: `Imported ${importedPlayers.length} players`
        });
      } else {
        throw new Error('Unsupported file format');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error('Import failed', {
        description: 'Please check the file format and try again'
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (event?.target) {
        event.target.value = '';
      }
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select players first');
      return;
    }
    
    switch (action) {
      case 'export':
        handleExportSelectedPlayers();
        break;
      case 'archive':
        toast.success(`Archived ${selectedPlayers.length} players`);
        break;
      case 'delete':
        handleDeleteSelectedPlayers();
        break;
    }
    setSelectedPlayers([]);
  };

  const handleExportSelectedPlayers = () => {
    const selectedPlayersData = players.filter(p => selectedPlayers.includes(p.id));
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Position,Age,Nationality,Goals,Assists,Rating\n"
      + selectedPlayersData.map(p => `${p.name},${p.position},${p.age},${p.nationality},${p.goals},${p.assists},${p.rating}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `selected_players_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${selectedPlayers.length} players`);
  };

  const handleDeleteSelectedPlayers = () => {
    setPlayers(prev => prev.filter(p => !selectedPlayers.includes(p.id)));
    toast.success(`Deleted ${selectedPlayers.length} players`);
  };

  const handleViewPlayer = (player: Player) => {
    toast.info(`Viewing player: ${player.name}`, {
      description: 'Player details would open in a modal or detailed view'
    });
  };

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setIsEditing(true);
    toast.info(`Editing player: ${player.name}`, {
      description: 'Edit form would open here'
    });
  };

  const handleDeletePlayer = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast.success(`Player ${player.name} deleted successfully`);
    }
  };

  const handleGenerateReport = async (reportTitle: string) => {
    setIsLoading(true);
    try {
      let content: string;
      
      switch (reportTitle) {
        case 'Team Analytics Report':
          content = generateTeamReport();
          break;
        case 'Financial Summary':
          content = generateFinancialReport();
          break;
        default:
          content = `${reportTitle} Report\nGenerated: ${new Date().toLocaleString()}\n\nThis is a sample report.`;
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${reportTitle} generated successfully!`, {
        description: 'Report has been downloaded to your computer'
      });
    } catch (error) {
      toast.error('Report generation failed', {
        description: 'An error occurred while generating the report'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlayerReport = (): string => {
    return `PLAYER PERFORMANCE REPORT\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `SUMMARY\n` +
      `- Total Players: ${players.length}\n` +
      `- Active Players: ${players.filter(p => p.status === 'active').length}\n` +
      `- Injured Players: ${players.filter(p => p.status === 'injured').length}\n` +
      `- Average Rating: ${(players.reduce((sum, p) => sum + p.rating, 0) / players.length).toFixed(2)}\n\n` +
      `TOP PERFORMERS\n` +
      players
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map((p, i) => `${i + 1}. ${p.name} (${p.position}) - Rating: ${p.rating}, Goals: ${p.goals}`)
        .join('\n') +
      `\n\nDETAILED STATISTICS\n` +
      players.map(p => 
        `${p.name} | ${p.position} | Age: ${p.age} | Goals: ${p.goals} | Assists: ${p.assists} | Rating: ${p.rating} | Status: ${p.status}`
      ).join('\n');
  };

  const generateTeamReport = (): string => {
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    const totalAssists = players.reduce((sum, p) => sum + p.assists, 0);
    const avgAge = players.reduce((sum, p) => sum + p.age, 0) / players.length;
    
    return `TEAM ANALYTICS REPORT\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `TEAM OVERVIEW\n` +
      `- Total Goals: ${totalGoals}\n` +
      `- Total Assists: ${totalAssists}\n` +
      `- Average Age: ${avgAge.toFixed(1)} years\n` +
      `- Squad Size: ${players.length} players\n\n` +
      `POSITION BREAKDOWN\n` +
      Object.entries(
        players.reduce((acc, p) => {
          acc[p.position] = (acc[p.position] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([pos, count]) => `- ${pos}: ${count} players`).join('\n');
  };

  const generateFinancialReport = (): string => {
    const totalSalaries = players.reduce((sum, p) => sum + p.salary, 0);
    const totalMarketValue = players.reduce((sum, p) => sum + p.marketValue, 0);
    const avgSalary = totalSalaries / players.length;
    
    const highestPaid = players.sort((a, b) => b.salary - a.salary)[0];
    const mostValuable = players.sort((a, b) => b.marketValue - a.marketValue)[0];
    
    return `FINANCIAL SUMMARY REPORT\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `FINANCIAL OVERVIEW\n` +
      `- Total Player Salaries: $${(totalSalaries / 1000000).toFixed(2)}M\n` +
      `- Total Market Value: $${(totalMarketValue / 1000000).toFixed(2)}M\n` +
      `- Average Salary: $${(avgSalary / 1000000).toFixed(2)}M\n` +
      `- Highest Paid: ${highestPaid?.name || 'N/A'} ($${((highestPaid?.salary || 0) / 1000000).toFixed(2)}M)\n` +
      `- Most Valuable: ${mostValuable?.name || 'N/A'} ($${((mostValuable?.marketValue || 0) / 1000000).toFixed(2)}M)\n\n` +
      `PLAYER FINANCIAL DETAILS\n` +
      players
        .sort((a, b) => b.salary - a.salary)
        .map(p => `${p.name} | Salary: $${(p.salary / 1000000).toFixed(2)}M | Market Value: $${(p.marketValue / 1000000).toFixed(2)}M`)
        .join('\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-8xl">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-8">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="flex-1 max-w-4xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {language === 'en' ? 'Data Management Center' : 'Centro de Gestión de Datos'}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {language === 'en' ? 'Comprehensive player and club data management system' : 'Sistema integral de gestión de datos de jugadores y clubes'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  >
                    <option value="csv">CSV Format</option>
                    <option value="json">JSON Format</option>
                  </select>
                </div>
                <Button
                  onClick={() => handleImportData()}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Import className="h-4 w-4 mr-2" />}
                  {t('dataManagement.importData')}
                </Button>
                <Button
                  onClick={() => handleExportData(exportFormat)}
                  disabled={isLoading}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-3"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t('dataManagement.exportData')}
                </Button>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dataManagement.addNew')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-semibold text-sm mb-2">{t('dataManagement.totalPlayers')}</p>
                    <p className="text-4xl font-bold drop-shadow-lg">{analyticsData.totalPlayers}</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-green-100 font-semibold text-sm mb-2">{t('dataManagement.activeContracts')}</p>
                    <p className="text-4xl font-bold drop-shadow-lg">{analyticsData.activeContracts}</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 font-semibold text-sm mb-2">{t('dataManagement.avgRating')}</p>
                    <p className="text-4xl font-bold drop-shadow-lg">{analyticsData.avgPlayerRating.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 font-semibold text-sm mb-2">{t('dataManagement.totalGoals')}</p>
                    <p className="text-4xl font-bold drop-shadow-lg">{analyticsData.goalsScored}</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Enhanced Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <TabsList className="grid w-full grid-cols-4 bg-transparent border-0 rounded-none h-16">
                  <TabsTrigger value="players" className="flex items-center gap-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:shadow-lg rounded-none py-4 transition-all duration-200">
                    <Users className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{t('dataManagement.players')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="clubs" className="flex items-center gap-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:shadow-lg rounded-none py-4 transition-all duration-200">
                    <Shield className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{t('dataManagement.clubs')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:shadow-lg rounded-none py-4 transition-all duration-200">
                    <BarChart3 className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{t('dataManagement.analytics')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:shadow-lg rounded-none py-4 transition-all duration-200">
                    <FileText className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{t('dataManagement.reports')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Players Tab */}
              <TabsContent value="players" className="p-6 space-y-6">
                {/* Search and Filter Controls */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder={t('dataManagement.search.placeholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">{t('dataManagement.filter.allStatus')}</option>
                        <option value="active">{t('dataManagement.filter.active')}</option>
                        <option value="injured">{t('dataManagement.filter.injured')}</option>
                        <option value="suspended">{t('dataManagement.filter.suspended')}</option>
                      </select>
                      
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">{t('dataManagement.sort.name')}</option>
                        <option value="rating">{t('dataManagement.sort.rating')}</option>
                        <option value="goals">{t('dataManagement.sort.goals')}</option>
                        <option value="age">{t('dataManagement.sort.age')}</option>
                        <option value="marketValue">{t('dataManagement.sort.marketValue')}</option>
                      </select>
                    </div>
                  </div>
                  
                  {selectedPlayers.length > 0 && (
                    <div className="mt-4 flex gap-3">
                      <Badge variant="secondary">
                        {selectedPlayers.length} {t('dataManagement.selected')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('export')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t('dataManagement.exportSelected')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('archive')}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        {t('dataManagement.archiveSelected')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBulkAction('delete')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('dataManagement.deleteSelected')}
                      </Button>
                    </div>
                  )}
                </div>
                {/* Enhanced Players Table */}
                <Card className="shadow-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                          <tr>
                            <th className="px-6 py-4 text-left">
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
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Player
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Position
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Contract
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Market Value
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
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
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                                    {player.name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {player.nationality} • Age {player.age}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className="font-medium px-3 py-1">{player.position}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-emerald-500" />
                                    <span className="font-medium">{player.goals}G</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{player.assists}A</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium">{player.rating}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-gray-900 dark:text-white font-medium">
                                    Until {player.contract}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">
                                    ${(player.salary / 1000000).toFixed(1)}M/year
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  ${(player.marketValue / 1000000).toFixed(1)}M
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant={player.status === 'active' ? 'default' : 
                                          player.status === 'injured' ? 'destructive' : 'secondary'}
                                  className="font-medium"
                                >
                                  {player.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditPlayer(player)}
                                    title="Edit Player"
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDeletePlayer(player.id)}
                                    title="Delete Player"
                                    className="hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
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

            {/* Enhanced Clubs Tab */}
            <TabsContent value="clubs" className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {clubs.map((club) => (
                  <Card key={club.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{club.name}</span>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-3 py-1">#{club.ranking}</Badge>
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

            {/* Enhanced Analytics Tab */}
            <TabsContent value="analytics" className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center py-3">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Win Rate</span>
                        <div className="flex items-center gap-3">
                          <div className="w-40 bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full shadow-sm transition-all duration-300" 
                              style={{ width: `${analyticsData.winRate}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 min-w-[45px]">{analyticsData.winRate}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Goals per Match</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {(analyticsData.goalsScored / analyticsData.matchesPlayed * players.length).toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Clean Sheets</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{analyticsData.cleanSheets}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Activity className="h-6 w-6 text-blue-500" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center py-3">
                        <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300">
                          <Cpu className="h-5 w-5 text-orange-500" />
                          CPU Usage
                        </span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">45%</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300">
                          <HardDrive className="h-5 w-5 text-purple-500" />
                          Storage
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">2.3GB / 10GB</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300">
                          <Wifi className="h-5 w-5 text-green-500" />
                          Network
                        </span>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold">Online</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300">
                          <Globe className="h-5 w-5 text-blue-500" />
                          API Status
                        </span>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Healthy</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced Reports Tab */}
            <TabsContent value="reports" className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Player Performance Report',
                    description: 'Comprehensive analysis of individual player statistics and performance metrics',
                    icon: <Users className="h-10 w-10 text-blue-500" />,
                    lastGenerated: '2 hours ago',
                    status: 'Ready'
                  },
                  {
                    title: 'Team Analytics Report',
                    description: 'Team-wide performance analysis including tactical insights and formation effectiveness',
                    icon: <BarChart3 className="h-10 w-10 text-emerald-500" />,
                    lastGenerated: '1 day ago',
                    status: 'Ready'
                  },
                  {
                    title: 'Financial Summary',
                    description: 'Complete financial overview including player salaries, transfer budgets, and revenue',
                    icon: <TrendingUp className="h-10 w-10 text-purple-500" />,
                    lastGenerated: '3 days ago',
                    status: 'Generating'
                  },
                  {
                    title: 'Injury & Fitness Report',
                    description: 'Player health status, injury history, and fitness level analysis',
                    icon: <Activity className="h-10 w-10 text-red-500" />,
                    lastGenerated: '5 hours ago',
                    status: 'Ready'
                  },
                  {
                    title: 'Transfer Market Analysis',
                    description: 'Market value trends, transfer opportunities, and player valuations',
                    icon: <TrendingUp className="h-10 w-10 text-orange-500" />,
                    lastGenerated: '1 week ago',
                    status: 'Outdated'
                  },
                  {
                    title: 'Match Performance Report',
                    description: 'Detailed match analysis including key events, player ratings, and tactical review',
                    icon: <Target className="h-10 w-10 text-indigo-500" />,
                    lastGenerated: '6 hours ago',
                    status: 'Ready'
                  }
                ].map((report, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform duration-200">
                            {report.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{report.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{report.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Generated</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{report.lastGenerated}</span>
                        </div>
                        
                        <div className="flex justify-between items-center gap-4">
                          <Badge
                            variant={report.status === 'Ready' ? 'default' : 
                                    report.status === 'Generating' ? 'secondary' : 'destructive'}
                            className="font-semibold px-3 py-1"
                          >
                            {report.status}
                          </Badge>
                          
                          <div className="flex gap-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toast.info(`Viewing ${report.title}`, {
                                description: 'Report viewer would open here'
                              })}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              onClick={() => handleGenerateReport(report.title)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
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
        </div>
      </motion.div>
    </div>
  </div>
  );
};

// Export interfaces for use in other components
export type { Player, Club, AnalyticsData };
export default DataManagement;