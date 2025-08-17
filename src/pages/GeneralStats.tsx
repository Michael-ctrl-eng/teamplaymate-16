import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, Target, Users, Award, TrendingUp, Activity, ChevronDown, ChevronRight, Zap, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const GeneralStats = () => {
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState({
    rendimiento: false,
    ataque: false,
    defensa: false,
    disciplina: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Mock data for general statistics
  const teamStats = {
    totalMatches: 12,
    goalsFor: 36,
    goalsAgainst: 18,
    totalAssists: 24,
    foulsCommitted: 45,
    foulsReceived: 52,
    winPercentage: 66.7,
    wins: 8,
    draws: 2,
    losses: 2
  };

  const performanceData = [
    { month: 'Sep', wins: 2, goals: 8, assists: 6 },
    { month: 'Oct', wins: 3, goals: 12, assists: 9 },
    { month: 'Nov', wins: 2, goals: 10, assists: 6 },
    { month: 'Dec', wins: 1, goals: 6, assists: 3 },
  ];

  const positionStats = [
    { position: 'Delantero', players: 4, goals: 20, assists: 8 },
    { position: 'Centrocampista', players: 6, goals: 12, assists: 14 },
    { position: 'Defensa', players: 5, goals: 3, assists: 2 },
    { position: 'Portero', players: 2, goals: 1, assists: 0 },
  ];

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t('stats.title')}</h1>
          <div className="text-sm text-gray-500">{t('general.season')} 2024/25</div>
        </div>

        {/* Estadísticas por Categorías Plegables */}
        <div className="space-y-3">
          {/* Rendimiento */}
          <Collapsible open={openSections.rendimiento} onOpenChange={() => toggleSection('rendimiento')}>
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors p-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-lg font-semibold">{t('stats.performance')}</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${openSections.rendimiento ? 'rotate-90' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">{t('stats.wins')}</p>
                      <p className="text-2xl font-bold text-blue-700">{teamStats.wins}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">{t('stats.draws')}</p>
                      <p className="text-2xl font-bold text-gray-700">{teamStats.draws}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">{t('stats.losses')}</p>
                      <p className="text-2xl font-bold text-red-700">{teamStats.losses}</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="wins" stroke="#3b82f6" strokeWidth={3} name={t('stats.wins')} />
                      <Line type="monotone" dataKey="goals" stroke="#10b981" strokeWidth={3} name={t('players.goals')} />
                      <Line type="monotone" dataKey="assists" stroke="#8b5cf6" strokeWidth={3} name={t('players.assists')} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Ataque */}
          <Collapsible open={openSections.ataque} onOpenChange={() => toggleSection('ataque')}>
            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors p-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-lg font-semibold">{t('stats.attack')}</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${openSections.ataque ? 'rotate-90' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">{t('stats.goals.for')}</p>
                      <p className="text-2xl font-bold text-green-700">{teamStats.goalsFor}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">{t('stats.assists.total')}</p>
                      <p className="text-2xl font-bold text-blue-700">{teamStats.totalAssists}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">{t('stats.shots.goal')}</p>
                      <p className="text-2xl font-bold text-purple-700">124</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">{t('stats.shots.out')}</p>
                      <p className="text-2xl font-bold text-yellow-700">89</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={positionStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="goals" fill="#10b981" name={t('players.goals')} />
                      <Bar dataKey="assists" fill="#3b82f6" name={t('players.assists')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Defensa */}
          <Collapsible open={openSections.defensa} onOpenChange={() => toggleSection('defensa')}>
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors p-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-lg font-semibold">{t('stats.defense')}</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${openSections.defensa ? 'rotate-90' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">{t('stats.goals.against')}</p>
                      <p className="text-2xl font-bold text-red-700">{teamStats.goalsAgainst}</p>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                      <p className="text-sm text-teal-600 font-medium">{t('stats.balls.recovered')}</p>
                      <p className="text-2xl font-bold text-teal-700">156</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">{t('stats.duels.won')}</p>
                      <p className="text-2xl font-bold text-yellow-700">89</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-600 font-medium">{t('stats.saves')}</p>
                      <p className="text-2xl font-bold text-indigo-700">67</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Disciplina */}
          <Collapsible open={openSections.disciplina} onOpenChange={() => toggleSection('disciplina')}>
            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors p-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <span className="text-lg font-semibold">{t('stats.discipline')}</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${openSections.disciplina ? 'rotate-90' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">{t('stats.fouls.committed')}</p>
                      <p className="text-2xl font-bold text-red-700">{teamStats.foulsCommitted}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">{t('stats.fouls.received')}</p>
                      <p className="text-2xl font-bold text-green-700">{teamStats.foulsReceived}</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">{t('stats.yellow.cards')}</p>
                      <p className="text-2xl font-bold text-yellow-700">8</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">{t('stats.red.cards')}</p>
                      <p className="text-2xl font-bold text-red-700">2</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
  );
};

export default GeneralStats;