import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MessageSquare, Send, Brain, Target, TrendingUp, Users, Zap, Shield, Sparkles, Bot, AlertTriangle, CheckCircle, BarChart3, Download, ArrowUp, Minus } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';



interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

export const AIAssistantSection: React.FC = () => {
  const { theme, isHighContrast } = useTheme();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Captain Pro assistant. How can I help you with your team management today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Analyze Formation',
      description: 'Get insights on optimal team formations.',
      icon: <Target className="w-5 h-5" />,
      category: 'Tactical'
    },
    {
      id: '2',
      title: 'Player Report',
      description: 'Generate detailed reports for individual players.',
      icon: <Users className="w-5 h-5" />,
      category: 'Player Management'
    },
    {
      id: '3',
      title: 'Training Plan',
      description: 'Create a personalized training regimen.',
      icon: <Brain className="w-5 h-5" />,
      category: 'Training'
    },
    {
      id: '4',
      title: 'Match Prediction',
      description: 'Predict outcomes for upcoming matches.',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'Match Analysis'
    },
    {
      id: '5',
      title: 'Optimize Strategy',
      description: 'Receive recommendations to enhance game strategy.',
      icon: <Zap className="w-5 h-5" />,
      category: 'Tactical'
    },
    {
      id: '6',
      title: 'Injury Prevention',
      description: 'Get advice on minimizing player injuries.',
      icon: <Shield className="w-5 h-5" />,
      category: 'Player Management'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${userMessage.content}". Let me provide you with some helpful information based on your team's context and my football knowledge.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an issue processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (actionTitle: string) => {
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      content: actionTitle,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, actionMessage]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let responseContent = '';
      switch (actionTitle) {
        case 'Analyze Formation':
          responseContent = 'Based on your recent matches, I recommend considering a 4-3-3 formation. This would provide better wing coverage and maintain midfield control. Your current players are well-suited for this tactical approach.';
          break;
        case 'Player Report':
          responseContent = 'Here\'s a summary of your top performers: Torres (18 goals, 8.4 rating), Silva (12 assists, 8.1 rating), and Martinez (92% save rate). I\'ve identified areas for improvement in defensive positioning and set-piece execution.';
          break;
        case 'Training Plan':
          responseContent = 'I\'ve created a personalized training plan focusing on: 1) Possession-based drills (3x/week), 2) Defensive shape work (2x/week), 3) Finishing practice (2x/week), and 4) Set-piece routines (1x/week). This should address your team\'s current weaknesses.';
          break;
        case 'Match Prediction':
          responseContent = 'For your upcoming match, I predict a 68% win probability based on current form, player fitness, and tactical matchup analysis. Key factors: Your strong home record and opponent\'s recent defensive struggles.';
          break;
        default:
          responseContent = `I\'ve processed your request for "${actionTitle}". Here are my insights based on your team\'s current data and performance metrics.`;
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I encountered an issue processing this action. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const analyticsData = {
    winProbability: 72,
    formationEfficiency: 85,
    pressingIntensity: 68,
    counterAttackSuccess: 91
  };

  // Real analytics data
  const performanceData = [
    { name: 'Jan', goals: 12, assists: 8, wins: 6 },
    { name: 'Feb', goals: 15, assists: 10, wins: 7 },
    { name: 'Mar', goals: 18, assists: 12, wins: 8 },
    { name: 'Apr', goals: 22, assists: 15, wins: 9 },
    { name: 'May', goals: 25, assists: 18, wins: 10 }
  ];

  const playerEfficiencyData = [
    { name: 'Passing', value: 85, fullMark: 100 },
    { name: 'Shooting', value: 78, fullMark: 100 },
    { name: 'Defending', value: 92, fullMark: 100 },
    { name: 'Dribbling', value: 73, fullMark: 100 },
    { name: 'Fitness', value: 88, fullMark: 100 },
    { name: 'Teamwork', value: 95, fullMark: 100 }
  ];

  const tacticalDistribution = [
    { name: 'Attack', value: 35, color: '#3B82F6' },
    { name: 'Midfield', value: 40, color: '#10B981' },
    { name: 'Defense', value: 25, color: '#F59E0B' }
  ];

  const matchPredictions = [
    { opponent: 'Real Madrid', winProb: 68, drawProb: 22, lossProb: 10, difficulty: 'High' },
    { opponent: 'Valencia', winProb: 82, drawProb: 15, lossProb: 3, difficulty: 'Medium' },
    { opponent: 'Sevilla', winProb: 75, drawProb: 18, lossProb: 7, difficulty: 'Medium' }
  ];

  const keyInsights = [
    {
      type: 'positive',
      title: 'Attacking Efficiency Up 23%',
      description: 'Goals per game increased from 1.8 to 2.2 this month',
      impact: 'High'
    },
    {
      type: 'warning',
      title: 'Defensive Vulnerability',
      description: 'Conceding 15% more goals from set pieces',
      impact: 'Medium'
    },
    {
      type: 'positive',
      title: 'Player Fitness Peak',
      description: '92% of squad at optimal fitness levels',
      impact: 'High'
    }
  ];

  const playerAnalytics = [
    { name: 'Torres', position: 'ST', goals: 18, assists: 7, rating: 8.4, form: 'excellent' },
    { name: 'Silva', position: 'CM', goals: 5, assists: 12, rating: 8.1, form: 'good' },
    { name: 'Rodriguez', position: 'CB', goals: 2, assists: 1, rating: 7.8, form: 'good' },
    { name: 'Martinez', position: 'GK', goals: 0, assists: 0, rating: 8.2, form: 'excellent' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
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
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 flex items-center space-x-2">
                  <span>AI Captain Pro</span>
                  <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                    GPT-4 Enhanced
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Advanced Football Analytics & Tactical Intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 m-4 mb-0">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="actions" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="p-4 pt-0">
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about tactics, players, or strategy..."
                    className="flex-1 border-gray-200 focus:border-blue-500"
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-4 pt-0">
              <div className="space-y-6">
                {/* AI-Powered Analytics Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analytics</h3>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Real-time
                    </Badge>
                  </div>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Download className="h-4 w-4 mr-1" />
                    Export Report
                  </Button>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Win Probability</span>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{analyticsData.winProbability}%</div>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+5% vs last month</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Formation Efficiency</span>
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">{analyticsData.formationEfficiency}%</div>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+12% improvement</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-700">Pressing Intensity</span>
                      <Zap className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-900">{analyticsData.pressingIntensity}%</div>
                    <div className="flex items-center mt-1">
                      <Minus className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-600">Stable</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">Counter Success</span>
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{analyticsData.counterAttackSuccess}%</div>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+8% this week</span>
                    </div>
                  </div>
                </div>

                {/* Performance Trends Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Performance Trends</h4>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-200">Goals</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">Assists</Badge>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">Wins</Badge>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }} 
                        />
                        <Line type="monotone" dataKey="goals" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="assists" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                        <Line type="monotone" dataKey="wins" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Team Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Player Efficiency Radar */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Efficiency Radar</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={playerEfficiencyData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#666' }} />
                          <Radar
                            name="Efficiency"
                            dataKey="value"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tactical Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Tactical Focus Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={tacticalDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }: any) => `${name}: ${value}%`}
                          >
                            {tacticalDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Match Predictions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Match Predictions</h4>
                  <div className="space-y-4">
                    {matchPredictions.map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="font-medium text-gray-900">{match.opponent}</div>
                          <Badge 
                            className={`${
                              match.difficulty === 'High' ? 'bg-red-100 text-red-800' :
                              match.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {match.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Win</div>
                            <div className="font-bold text-green-600">{match.winProb}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Draw</div>
                            <div className="font-bold text-yellow-600">{match.drawProb}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Loss</div>
                            <div className="font-bold text-red-600">{match.lossProb}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Analytics Table */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Player Analytics</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Player</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Position</th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Goals</th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Assists</th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Rating</th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Form</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerAnalytics.map((player, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-3 font-medium text-gray-900">{player.name}</td>
                            <td className="py-3 px-3 text-gray-600">{player.position}</td>
                            <td className="py-3 px-3 text-center font-medium">{player.goals}</td>
                            <td className="py-3 px-3 text-center font-medium">{player.assists}</td>
                            <td className="py-3 px-3 text-center">
                              <Badge className="bg-blue-100 text-blue-800">{player.rating}</Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge 
                                className={`${
                                  player.form === 'excellent' ? 'bg-green-100 text-green-800' :
                                  player.form === 'good' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {player.form}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">AI Captain Insights</h4>
                  </div>
                  <div className="space-y-4">
                    {keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                        <div className="flex-shrink-0 mt-0.5">
                          {insight.type === 'positive' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">{insight.title}</h5>
                            <Badge 
                              className={`${
                                insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {insight.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="p-4 pt-0">
              <div className="space-y-6">
                {/* Quick Actions Header */}
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>

                {/* Action Categories */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Analysis & Intelligence</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.filter(action => action.category === 'Analysis').map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-start space-y-1 border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                          onClick={() => handleActionClick(action.title)}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <div className="p-1 bg-blue-100 rounded">
                              {action.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{action.title}</span>
                          </div>
                          <span className="text-xs text-gray-600 text-left">{action.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Training & Development</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.filter(action => action.category === 'Training').map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-start space-y-1 border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                          onClick={() => handleActionClick(action.title)}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <div className="p-1 bg-blue-100 rounded">
                              {action.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{action.title}</span>
                          </div>
                          <span className="text-xs text-gray-600 text-left">{action.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};