import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Settings, 
  Crown,
  BarChart3,
  Target,
  Activity,
  Star,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { subscriptionService } from '../services/subscriptionService';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
import { StatsCard } from '../components/StatsCard';
import NotificationDemo from '../components/NotificationDemo';

interface Team {
  id: string;
  name: string;
  players: number;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: 'scheduled' | 'live' | 'completed';
}

const Dashboard: React.FC = () => {
  // Add demo notifications component
  const demoNotifications = <NotificationDemo />;
  console.log('Dashboard component rendering...');
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  
  console.log('User:', user);
  console.log('Language:', language);
  console.log('Theme:', theme);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [subscriptionSummary, setSubscriptionSummary] = useState<any>(null);

  const canCreateTeam = () => {
    if (!user?.email) return false;
    return subscriptionService.canCreateResource(user.email, 'teams');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load from localStorage
        const savedTeams = localStorage.getItem('statsor_teams');
        const savedMatches = localStorage.getItem('statsor_matches');
        
        if (savedTeams) {
          setTeams(JSON.parse(savedTeams));
        } else {
          // Start with empty teams
          setTeams([]);
        }

        if (savedMatches) {
          setMatches(JSON.parse(savedMatches));
        } else {
          // Start with empty matches
          setMatches([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    if (user?.email) {
      const summary = subscriptionService.getSubscriptionSummary(user.email);
      setSubscriptionSummary(summary);
    }
  }, [user]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error(language === 'en' ? 'Please enter a team name' : 'Por favor ingresa un nombre de equipo');
      return;
    }

    if (!canCreateTeam()) {
      toast.error(language === 'en' ? 'You have reached the maximum number of teams for your plan' : 'Has alcanzado el número máximo de equipos para tu plan');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      players: 0,
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem('statsor_teams', JSON.stringify(updatedTeams));
    localStorage.setItem('statsor_team_count', updatedTeams.length.toString());

    // Update usage stats
    if (user?.email) {
      subscriptionService.updateUsageStats(user.email, {
        teamsCreated: updatedTeams.length
      });
    }
    
    setNewTeamName('');
    setShowCreateTeam(false);
    toast.success(language === 'en' ? 'Team created successfully!' : '¡Equipo creado exitosamente!');
  };

  const getTotalStats = () => {
    return teams.reduce((acc, team) => ({
      players: acc.players + team.players,
      matches: acc.matches + team.matches,
      wins: acc.wins + team.wins,
      losses: acc.losses + team.losses,
      draws: acc.draws + team.draws
    }), { players: 0, matches: 0, wins: 0, losses: 0, draws: 0 });
  };

  const getWinRate = () => {
    const stats = getTotalStats();
    const totalMatches = stats.wins + stats.losses + stats.draws;
    return totalMatches > 0 ? Math.round((stats.wins / totalMatches) * 100) : 0;
  };

  const upcomingMatches = matches.filter(match => match.status === 'scheduled').slice(0, 3);
  const recentMatches = matches.filter(match => match.status === 'completed').slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Add error boundary for user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Authentication Required' : 'Autenticación Requerida'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'en' ? 'Please sign in to access the dashboard.' : 'Por favor inicia sesión para acceder al panel.'}
          </p>
          <Link to="/signin">
            <Button className="bg-green-600 hover:bg-green-700">
              {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Return the interactive dashboard that matches the Statsor design from screenshots
  return (
    <>
      {demoNotifications}
      <InteractiveDashboard />
    </>
  );
};

export default Dashboard;