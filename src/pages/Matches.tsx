import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, MapPin, Clock, Users, Target, TrendingUp, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  status: 'completed' | 'upcoming';
}

interface MatchStats {
  firstHalf: {
    goalLocations: { location: string; player: string; minute: number }[];
    goals: number;
    assists: number;
    shots: number;
    shotsOff: number;
    foulsCommitted: number;
    foulsReceived: number;
    ballsLost: number;
    ballsRecovered: number;
    duelsWon: number;
    duelsLost: number;
    saves: number;
    possession: number;
  };
  secondHalf: {
    goalLocations: { location: string; player: string; minute: number }[];
    goals: number;
    assists: number;
    shots: number;
    shotsOff: number;
    foulsCommitted: number;
    foulsReceived: number;
    ballsLost: number;
    ballsRecovered: number;
    duelsWon: number;
    duelsLost: number;
    saves: number;
    possession: number;
  };
}

interface MatchPlayer {
  id: string;
  name: string;
  number: number;
  goals: number;
  assists: number;
  mvpRating?: number;
  photo?: string;
}

const Matches = () => {
  const { t } = useTranslation();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [matchNotes, setMatchNotes] = useState<any[]>([]);
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      date: '2024-07-15',
      homeTeam: 'CD Statsor',
      awayTeam: 'Jaén FC',
      homeScore: 5,
      awayScore: 3,
      venue: 'Pabellón Municipal',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-07-08',
      homeTeam: 'Valencia CF',
      awayTeam: 'CD Statsor',
      homeScore: 2,
      awayScore: 4,
      venue: 'Estadio Mestalla',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-07-22',
      homeTeam: 'CD Statsor',
      awayTeam: 'Real Madrid',
      homeScore: 0,
      awayScore: 0,
      venue: 'Pabellón Municipal',
      status: 'upcoming'
    }
  ]);
  const [newMatch, setNewMatch] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    venue: '',
    status: 'upcoming' as 'completed' | 'upcoming',
    homeScore: 0,
    awayScore: 0
  });
  
  const handleAddMatch = () => {
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.date || !newMatch.venue) {
      alert('Please fill in all required fields');
      return;
    }

    const match: Match = {
      id: Date.now().toString(),
      ...newMatch
    };

    setMatches(prev => [...prev, match]);
    setNewMatch({
      homeTeam: '',
      awayTeam: '',
      date: '',
      venue: '',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0
    });
    setShowAddMatchForm(false);
  };

  const handleCancelAddMatch = () => {
    setNewMatch({
      homeTeam: '',
      awayTeam: '',
      date: '',
      venue: '',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0
    });
    setShowAddMatchForm(false);
  };

  const mockMatchStats: MatchStats = {
    firstHalf: {
      goalLocations: [
        { location: 'top-right', player: 'Carlos López', minute: 23 },
        { location: 'bottom-left', player: 'Miguel Torres', minute: 34 }
      ],
      goals: 3,
      assists: 2,
      shots: 8,
      shotsOff: 4,
      foulsCommitted: 5,
      foulsReceived: 3,
      ballsLost: 12,
      ballsRecovered: 15,
      duelsWon: 18,
      duelsLost: 10,
      saves: 4,
      possession: 58
    },
    secondHalf: {
      goalLocations: [
        { location: 'middle-center', player: 'Pablo Sánchez', minute: 67 }
      ],
      goals: 2,
      assists: 1,
      shots: 6,
      shotsOff: 3,
      foulsCommitted: 3,
      foulsReceived: 2,
      ballsLost: 8,
      ballsRecovered: 12,
      duelsWon: 14,
      duelsLost: 8,
      saves: 2,
      possession: 62
    }
  };

  const matchPlayers: MatchPlayer[] = [
    {
      id: '1',
      name: 'Carlos López',
      number: 10,
      goals: 2,
      assists: 1,
      mvpRating: 9.2
    },
    {
      id: '2',
      name: 'Miguel Rodríguez',
      number: 7,
      goals: 2,
      assists: 0,
      mvpRating: 8.5
    },
    {
      id: '3',
      name: 'Pablo Sánchez',
      number: 8,
      goals: 1,
      assists: 2,
      mvpRating: 8.7
    },
    {
      id: '4',
      name: 'Juan Pérez',
      number: 11,
      goals: 0,
      assists: 1,
      mvpRating: 7.8
    }
  ].sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const generateMatchSummary = () => {
    if (!selectedMatch) return '';

    const totalGoals = mockMatchStats.firstHalf.goals + mockMatchStats.secondHalf.goals;
    const totalAssists = mockMatchStats.firstHalf.assists + mockMatchStats.secondHalf.assists;
    const mvpPlayer = matchPlayers[0];
    
    const goalScorers = matchPlayers
      .filter(player => player.goals > 0)
      .map(player => `${player.name} (${player.goals} ${player.goals === 1 ? 'gol' : 'goles'})`)
      .join(', ');

    const assistProviders = matchPlayers
      .filter(player => player.assists > 0)
      .map(player => `${player.name} (${player.assists} ${player.assists === 1 ? 'asistencia' : 'asistencias'})`)
      .join(', ');

    return `El equipo ${selectedMatch.homeTeam} ${selectedMatch.homeScore > selectedMatch.awayScore ? 'ganó' : selectedMatch.homeScore < selectedMatch.awayScore ? 'perdió' : 'empató'} ${selectedMatch.homeScore}-${selectedMatch.awayScore} frente a ${selectedMatch.awayTeam}. 

En la primera parte se marcaron ${mockMatchStats.firstHalf.goals} goles y se realizaron ${mockMatchStats.firstHalf.assists} asistencias. En la segunda parte fueron ${mockMatchStats.secondHalf.goals} goles y ${mockMatchStats.secondHalf.assists} asistencias.

${goalScorers ? `Goleadores: ${goalScorers}.` : ''} ${assistProviders ? `Asistencias: ${assistProviders}.` : ''}

El jugador más destacado fue ${mvpPlayer.name} con ${mvpPlayer.goals} ${mvpPlayer.goals === 1 ? 'gol' : 'goles'} y ${mvpPlayer.assists} ${mvpPlayer.assists === 1 ? 'asistencia' : 'asistencias'} (Nota: ${mvpPlayer.mvpRating}).`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMatchSummary());
    // Aquí podrías añadir un toast de confirmación
  };

  const downloadPDF = () => {
    const summary = generateMatchSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-partido-${selectedMatch?.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMatchDetail = () => {
    if (!selectedMatch) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setSelectedMatch(null)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('players.back')}</span>
          </Button>
          
          <Button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Award className="w-4 h-4" />
            <span>Generar Resumen</span>
          </Button>
        </div>

        {/* Match Header */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </h2>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {selectedMatch.homeScore} - {selectedMatch.awayScore}
              </div>
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedMatch.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedMatch.venue}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jugadores Destacados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Jugadores Destacados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {matchPlayers.slice(0, 4).map((player) => (
                <div
                  key={player.id}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold text-gray-600">
                    {player.number}
                  </div>
                  <h4 className="font-semibold text-sm mb-2">{player.name}</h4>
                  <div className="flex justify-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-green-600" />
                      <span>{player.goals}G</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-3 h-3 text-blue-600" />
                      <span>{player.assists}A</span>
                    </div>
                  </div>
                  {player.mvpRating && (
                    <div className="mt-2 text-xs font-semibold text-yellow-600">
                      ★ {player.mvpRating}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumen del Partido */}
        {showSummary && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resumen del Partido</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </Button>
                  <Button
                    onClick={downloadPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {generateMatchSummary()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Statistics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Goal Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">Goal Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold">{t('matches.first.half')}</h4>
                {mockMatchStats.firstHalf.goalLocations.map((goal, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{goal.minute}' - {goal.player}</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {goal.location}
                    </span>
                  </div>
                ))}
                
                <h4 className="font-semibold mt-4">{t('matches.second.half')}</h4>
                {mockMatchStats.secondHalf.goalLocations.map((goal, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{goal.minute}' - {goal.player}</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {goal.location}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Primera Parte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">{t('matches.first.half')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{t('players.goals')}</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.goals}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('players.assists')}</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.assists}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiros a portería</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.shots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiros fuera</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.shotsOff}</span>
                </div>
                <div className="flex justify-between">
                  <span>Faltas cometidas</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.foulsCommitted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Faltas recibidas</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.foulsReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balones perdidos</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.ballsLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balones recuperados</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.ballsRecovered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duelos ganados / perdidos</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.duelsWon} / {mockMatchStats.firstHalf.duelsLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paradas (portero)</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.saves}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posesión (%)</span>
                  <span className="font-semibold">{mockMatchStats.firstHalf.possession}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segunda Parte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">{t('matches.second.half')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Goles</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.goals}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asistencias</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.assists}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiros a portería</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.shots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiros fuera</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.shotsOff}</span>
                </div>
                <div className="flex justify-between">
                  <span>Faltas cometidas</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.foulsCommitted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Faltas recibidas</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.foulsReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balones perdidos</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.ballsLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balones recuperados</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.ballsRecovered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duelos ganados / perdidos</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.duelsWon} / {mockMatchStats.secondHalf.duelsLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paradas (portero)</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.saves}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posesión (%)</span>
                  <span className="font-semibold">{mockMatchStats.secondHalf.possession}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Match Notes</CardTitle>
              <Button
                onClick={() => setShowNotesModal(true)}
                variant="outline"
                size="sm"
              >
                Add Notes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {matchNotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notes added for this match</p>
            ) : (
              <div className="space-y-2">
                {matchNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{note.title}</span>
                      <span className="text-sm text-gray-500">{note.minute}'</span>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Notes Modal */}
        <MatchNotesModal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          matchId={selectedMatch.id}
          notes={matchNotes}
          onSaveNotes={setMatchNotes}
        />
      </div>
    );
  };

  const renderAddMatchForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Add New Match</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelAddMatch}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homeTeam">Home Team *</Label>
            <Input
              id="homeTeam"
              value={newMatch.homeTeam}
              onChange={(e) => setNewMatch(prev => ({ ...prev, homeTeam: e.target.value }))}
              placeholder="Enter home team name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="awayTeam">Away Team *</Label>
            <Input
              id="awayTeam"
              value={newMatch.awayTeam}
              onChange={(e) => setNewMatch(prev => ({ ...prev, awayTeam: e.target.value }))}
              placeholder="Enter away team name"
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Match Date *</Label>
            <Input
              id="date"
              type="date"
              value={newMatch.date}
              onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              value={newMatch.venue}
              onChange={(e) => setNewMatch(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Enter venue name"
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={newMatch.status} onValueChange={(value: 'completed' | 'upcoming') => setNewMatch(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newMatch.status === 'completed' && (
            <>
              <div>
                <Label htmlFor="homeScore">Home Score</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={newMatch.homeScore}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, homeScore: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="awayScore">Away Score</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={newMatch.awayScore}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, awayScore: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancelAddMatch}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMatch}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Match
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderMatchList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('matches.title')}</h1>
        <Button
          onClick={() => setShowAddMatchForm(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Match</span>
        </Button>
      </div>
      
      {showAddMatchForm && renderAddMatchForm()}
      
      <div className="space-y-4">
        {matches.map((match) => (
          <Card
            key={match.id}
            onClick={() => setSelectedMatch(match)}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{match.venue}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  match.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {match.status === 'completed' ? t('matches.completed') : t('matches.upcoming')}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold">
                  {match.homeTeam} vs {match.awayTeam}
                </h3>
                {match.status === 'completed' && (
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {match.homeScore} - {match.awayScore}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {selectedMatch ? renderMatchDetail() : renderMatchList()}
    </div>
  );
};

export default Matches;
