import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, Activity, Users, Target, 
  Clock, Download, RefreshCw, 
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Search, ChevronDown, ChevronUp,
  Plus, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

import { Switch } from './ui/switch';
import { analyticsExportService } from '../services/analyticsExportService';
import { analyticsDataService, RealPlayerData, RealMatchData, RealTimeMatchData } from '../services/analyticsDataService';
import { useLanguage } from '../contexts/LanguageContext';



const COLORS = ['#4ADE80', '#60A5FA', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { t } = useLanguage();
  const [playerData, setPlayerData] = useState<RealPlayerData[]>([]);
  const [matchData, setMatchData] = useState<RealMatchData[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeMatchData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('goals');
  const [timeRange, setTimeRange] = useState('season');
  const [autoRefresh] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [sortBy] = useState('goals');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [chartType] = useState<'bar' | 'line' | 'pie' | 'radar'>('bar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<string[]>(['overview']);
  const [dataLoading, setDataLoading] = useState(true);

  // Load real data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setDataLoading(true);
      try {
        const [players, matches, realTime] = await Promise.all([
          analyticsDataService.getPlayerData(),
          analyticsDataService.getMatchData(),
          analyticsDataService.getRealTimeData()
        ]);
        setPlayerData(players);
        setMatchData(matches);
        setRealTimeData(realTime);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        // Fallback to empty arrays/null on error
        setPlayerData([]);
        setMatchData([]);
        setRealTimeData(null);
      } finally {
        setDataLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (!autoRefresh || dataLoading) return;

    const interval = setInterval(async () => {
      setIsProcessing(true);
      
      try {
        const [players, matches, realTime] = await Promise.all([
          analyticsDataService.getPlayerData(),
          analyticsDataService.getMatchData(),
          analyticsDataService.getRealTimeData()
        ]);
        setPlayerData(players);
        setMatchData(matches);
        setRealTimeData(realTime);
      } catch (error) {
        console.error('Failed to refresh analytics data:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, dataLoading]);

  // Filtered and sorted data
  const filteredPlayers = useMemo(() => {
    let filtered = playerData.filter(player => 
      player.name.toLowerCase().includes(filterValue.toLowerCase())
    );

    if (selectedPlayers.length > 0) {
      filtered = filtered.filter(player => selectedPlayers.includes(player.id));
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [playerData, filterValue, selectedPlayers, sortBy, sortOrder]);

  // Chart data transformations
  const chartData = useMemo(() => {
    switch (chartType) {
      case 'pie':
        return filteredPlayers.slice(0, 6).map(player => ({
          name: player.name,
          value: player[selectedMetric as keyof typeof player] as number,
          fill: COLORS[filteredPlayers.indexOf(player) % COLORS.length]
        }));
      case 'radar':
        return filteredPlayers.slice(0, 1).map(player => ([
          { metric: 'Goals', value: player.goals, fullMark: 30 },
          { metric: 'Assists', value: player.assists, fullMark: 20 },
          { metric: 'Accuracy', value: player.accuracy, fullMark: 100 },
          { metric: 'Form', value: player.form, fullMark: 100 },
          { metric: 'Rating', value: parseFloat(player.rating) * 10, fullMark: 100 }
        ]))[0];
      default:
        return filteredPlayers.map(player => ({
          name: player.name,
          [selectedMetric]: player[selectedMetric as keyof typeof player],
          fill: COLORS[filteredPlayers.indexOf(player) % COLORS.length]
        }));
    }
  }, [filteredPlayers, selectedMetric, chartType]);

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handlePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const exportData = () => {
    try {
      analyticsExportService.exportPlayerStats(filteredPlayers, {
        format: 'excel',
        filename: `statsor-analytics-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true
      });
      toast.success('Analytics exported successfully!');
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };

  const exportMatchData = () => {
    try {
      const matchExportData = matchData.map(match => ({
        month: match.month,
        wins: match.wins,
        draws: match.draws,
        losses: match.losses,
        goalsFor: match.goalsFor,
        goalsAgainst: match.goalsAgainst,
        possession: match.possession
      }));
      
      analyticsExportService.exportAnalytics({
        title: 'Match Performance Data',
        data: matchExportData,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Statsor Analytics Dashboard',
          sport: 'football'
        }
      }, {
        format: 'pdf',
        includeMetadata: true
      });
      
      toast.success('Match data exported to PDF!');
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg"
        >
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  // Show loading state while data is being fetched
  if (dataLoading) {
    return (
      <div className={`space-y-6 p-6 bg-gray-50 min-h-screen ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-primary" />
              Analytics Dashboard
              {isLive && (
                <Badge className="ml-3 bg-red-500 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  LIVE
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Real-time performance analytics and insights</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <label htmlFor="auto-refresh" className="text-sm font-medium">
                Auto Refresh
              </label>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="season">Season</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="match">Match</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Players
            </Button>
            
            <Button onClick={exportMatchData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Matches
            </Button>

            <Button 
              onClick={() => {
                setIsProcessing(true);
                setTimeout(() => {
                  setPlayerData(generatePlayerData());
                  setMatchData(generateMatchData());
                  setRealTimeData(generateRealTimeData());
                  setIsProcessing(false);
                }, 1000);
              }}
              variant="outline" 
              size="sm"
              disabled={isProcessing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search players..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goals">Goals</SelectItem>
              <SelectItem value="assists">Assists</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="passes">Passes</SelectItem>
              <SelectItem value="accuracy">Accuracy</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goals">Goals</SelectItem>
              <SelectItem value="assists">Assists</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="accuracy">Accuracy</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Live Match Status */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{realTimeData.currentMatch.homeTeam}</div>
                  <div className="text-3xl font-bold">{realTimeData.currentMatch.score.home}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-75">LIVE</div>
                  <div className="text-xl font-bold">{realTimeData.currentMatch.minute}'</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{realTimeData.currentMatch.awayTeam}</div>
                  <div className="text-3xl font-bold">{realTimeData.currentMatch.score.away}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">Possession</div>
                  <div>{realTimeData.currentMatch.possession.home}% - {realTimeData.currentMatch.possession.away}%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Shots</div>
                  <div>{realTimeData.currentMatch.shots.home} - {realTimeData.currentMatch.shots.away}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Corners</div>
                  <div>{realTimeData.currentMatch.corners.home} - {realTimeData.currentMatch.corners.away}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Player Performance - {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {isProcessing && (
                  <div className="flex items-center text-sm text-gray-500">
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Processing...
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpansion('chart')}
                >
                  {expandedCards.includes('chart') ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={chartType}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <>
                      {chartType === 'bar' && (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey={selectedMetric} fill="#4ADE80" />
                        </BarChart>
                      )}
                      {chartType === 'line' && (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey={selectedMetric} 
                            stroke="#4ADE80" 
                            strokeWidth={3}
                            dot={{ fill: '#4ADE80', strokeWidth: 2, r: 6 }}
                          />
                        </LineChart>
                      )}
                      {chartType === 'pie' && (
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      )}
                    </>
                  </ResponsiveContainer>
                  {chartType === 'radar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#4ADE80"
                          fill="#4ADE80"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPlayers.slice(0, 5).map((player, index) => {
                const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
                const [isHovered, setIsHovered] = useState(false);
                const cardRef = useRef(null);

                const handleMouseMove = (e) => {
                  if (!cardRef.current) return;
                  const rect = cardRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setMousePosition({ x, y });
                };

                const handleMouseEnter = () => setIsHovered(true);
                const handleMouseLeave = () => {
                  setIsHovered(false);
                  setMousePosition({ x: 0, y: 0 });
                };

                const tiltX = isHovered ? (mousePosition.y - 30) / 6 : 0;
                const tiltY = isHovered ? (mousePosition.x - 200) / -6 : 0;

                return (
                <motion.div
                  key={player.id}
                  ref={cardRef}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isHovered ? 1.02 : 1,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    z: isHovered ? 20 : 0
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  className={`relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all overflow-hidden ${
                    selectedPlayers.includes(player.id) 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: 800
                  }}
                  onClick={() => handlePlayerSelection(player.id)}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <motion.div
                    className="absolute pointer-events-none z-10"
                    animate={{
                      x: mousePosition.x - 6,
                      y: mousePosition.y - 6,
                      opacity: isHovered ? 0.8 : 0
                    }}
                    transition={{ type: "spring", stiffness: 600, damping: 30 }}
                  >
                    <div className="w-3 h-3 rounded-full bg-primary/40 blur-sm" />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      background: isHovered 
                        ? `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.05), transparent 40%)`
                        : 'none'
                    }}
                  />

                  <div className="flex items-center space-x-3 relative z-5">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      animate={{
                        scale: isHovered ? 1.1 : 1,
                        rotateY: isHovered ? 180 : 0,
                        z: isHovered ? 15 : 0
                      }}
                      transition={{ duration: 0.4 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {index + 1}
                    </motion.div>
                    <motion.div
                      animate={{
                        x: isHovered ? 2 : 0,
                        z: isHovered ? 10 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-500">
                        Rating: {player.rating}
                      </div>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="text-right relative z-5"
                    animate={{
                      x: isHovered ? -2 : 0,
                      z: isHovered ? 10 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="font-bold text-primary">
                      {player[selectedMetric as keyof typeof player]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedMetric}
                    </div>
                  </motion.div>
                </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Live Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Live Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {realTimeData.liveEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {event.minute}'
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{event.player}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {event.type.replace('_', ' ')}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    event.team === 'home' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="team">Team Stats</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Goals', value: '127', change: '+12%', icon: Target, color: 'text-green-600' },
                { title: 'Win Rate', value: '73%', change: '+5%', icon: TrendingUp, color: 'text-blue-600' },
                { title: 'Avg Possession', value: '64%', change: '+2%', icon: Activity, color: 'text-purple-600' },
                { title: 'Clean Sheets', value: '18', change: '+3', icon: CheckCircle, color: 'text-orange-600' }
              ].map((stat, index) => {
                const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
                const [isHovered, setIsHovered] = useState(false);
                const cardRef = useRef(null);

                const handleMouseMove = (e) => {
                  if (!cardRef.current) return;
                  const rect = cardRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setMousePosition({ x, y });
                };

                const handleMouseEnter = () => setIsHovered(true);
                const handleMouseLeave = () => {
                  setIsHovered(false);
                  setMousePosition({ x: 0, y: 0 });
                };

                const tiltX = isHovered ? (mousePosition.y - 100) / 8 : 0;
                const tiltY = isHovered ? (mousePosition.x - 150) / -8 : 0;

                return (
                <motion.div
                  key={index}
                  ref={cardRef}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isHovered ? 1.05 : 1,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    z: isHovered ? 30 : 0
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: 1000
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                >
                  <motion.div
                    className="absolute pointer-events-none z-20"
                    animate={{
                      x: mousePosition.x - 8,
                      y: mousePosition.y - 8,
                      opacity: isHovered ? 1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  >
                    <div className={`w-4 h-4 rounded-full ${stat.color.replace('text-', 'bg-')} opacity-60 blur-sm`} />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      background: isHovered 
                        ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.08), transparent 40%)`
                        : 'none'
                    }}
                  />

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <motion.div
                          animate={{
                            x: isHovered ? 3 : 0,
                            z: isHovered ? 15 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                          <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                        </motion.div>
                        <motion.div
                          animate={{
                            scale: isHovered ? 1.1 : 1,
                            rotateY: isHovered ? 15 : 0,
                            z: isHovered ? 20 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <stat.icon className={`w-8 h-8 ${stat.color} drop-shadow-lg`} />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Season Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={matchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="wins" 
                        stackId="1" 
                        stroke="#4ADE80" 
                        fill="#4ADE80" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="draws" 
                        stackId="1" 
                        stroke="#F59E0B" 
                        fill="#F59E0B" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="losses" 
                        stackId="1" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlayers.slice(0, 4).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{player.name} - Personalized Insights</span>
                        <Badge variant={player.mentalState === 'Confident' ? 'default' : 'secondary'}>
                          {player.mentalState}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Fitness Level</span>
                            <span className="text-sm">{player.fitnessLevel}%</span>
                          </div>
                          <Progress value={player.fitnessLevel} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Training Load</span>
                            <span className="text-sm">{player.trainingLoad}%</span>
                          </div>
                          <Progress value={player.trainingLoad} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Injury Risk</span>
                          <Badge variant={player.injuryRisk > 30 ? 'destructive' : 'secondary'}>
                            {player.injuryRisk}%
                          </Badge>
                        </div>
                        <Progress 
                          value={player.injuryRisk} 
                          className={`h-2 ${player.injuryRisk > 30 ? 'bg-red-100' : 'bg-green-100'}`} 
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium">Growth Potential: +{player.potentialGrowth}%</span>
                        <Progress value={player.potentialGrowth * 4} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium">Personalized Tips:</span>
                        <div className="space-y-1">
                          {player.personalizedTips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Insights Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredPlayers.filter(p => p.fitnessLevel > 80).length}
                    </div>
                    <div className="text-sm text-gray-600">Players at Peak Fitness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {filteredPlayers.filter(p => p.injuryRisk > 30).length}
                    </div>
                    <div className="text-sm text-gray-600">High Injury Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(filteredPlayers.reduce((acc, p) => acc + p.potentialGrowth, 0) / filteredPlayers.length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Growth Potential</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={filteredPlayers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="goals" name="Goals" />
                        <YAxis dataKey="assists" name="Assists" />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-semibold">{data.name}</p>
                                  <p>Goals: {data.goals}</p>
                                  <p>Assists: {data.assists}</p>
                                  <p>Rating: {data.rating}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter dataKey="assists" fill="#4ADE80" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['goals', 'assists', 'accuracy', 'rating'].map((metric) => {
                      const values = filteredPlayers.map(p => p[metric as keyof typeof p] as number);
                      const avg = values.reduce((a, b) => a + b, 0) / values.length;
                      const max = Math.max(...values);
                      
                      return (
                        <div key={metric} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="capitalize font-medium">{metric}</span>
                            <span className="text-sm text-gray-500">
                              Avg: {avg.toFixed(1)} | Max: {max}
                            </span>
                          </div>
                          <Progress value={(avg / max) * 100} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={matchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="goalsFor" 
                        stroke="#4ADE80" 
                        strokeWidth={3}
                        name="Goals For"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="goalsAgainst" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Goals Against"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="possession" 
                        stroke="#60A5FA" 
                        strokeWidth={3}
                        name="Possession %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Player Selection Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Player Selection</span>
                  <Badge variant="outline">
                    {selectedPlayers.length}/2 selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                  {playerData.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPlayers.includes(player.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePlayerSelection(player.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-gray-500">{player.position}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-xs">
                            <div>G: {player.goals}</div>
                            <div>A: {player.assists}</div>
                          </div>
                          {selectedPlayers.includes(player.id) ? (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary">
                              <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Player Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedPlayers.length >= 2 ? (
                selectedPlayers.slice(0, 2).map((playerId, index) => {
                  const player = playerData.find(p => p.id === playerId);
                  if (!player) return null;

                  return (
                    <motion.div
                      key={playerId}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{player.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayerSelection(player.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(player).filter(([key]) => 
                              ['goals', 'assists', 'accuracy', 'rating'].includes(key)
                            ).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="capitalize">{key}</span>
                                <span className="font-bold">{value}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="lg:col-span-2 text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select at least 2 players to compare</p>
                  <p className="text-sm text-gray-400 mt-2">Click the + button next to players above to add them for comparison</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};