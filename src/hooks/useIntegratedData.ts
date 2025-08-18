import { useState, useEffect, useCallback } from 'react';
import { dataIntegrationService } from '../services/dataIntegrationService';
import { UserData } from '../components/EnhancedAIAssistant';
import { Player, Club, AnalyticsData } from '../pages/DataManagement';

interface UseIntegratedDataReturn {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updatePlayerData: (playerId: string, updates: Partial<Player>) => Promise<boolean>;
  getPlayerStats: (playerId: string) => Promise<any>;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

/**
 * Custom hook to manage integrated data between Data Management and AI Assistant
 */
export const useIntegratedData = (): UseIntegratedDataReturn => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in a real app, this would come from your data management system
  const getMockDataManagementData = useCallback(() => {
    const players: Player[] = [
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
      },
      {
        id: 6,
        name: 'Thibaut Courtois',
        position: 'GK',
        age: 31,
        nationality: 'Belgium',
        goals: 0,
        assists: 0,
        matches: 29,
        rating: 8.4,
        status: 'active',
        contract: '2026-06-30',
        salary: 20000000,
        marketValue: 30000000
      },
      {
        id: 7,
        name: 'Luka Modrić',
        position: 'CM',
        age: 38,
        nationality: 'Croatia',
        goals: 4,
        assists: 9,
        matches: 26,
        rating: 8.0,
        status: 'active',
        contract: '2024-06-30',
        salary: 12000000,
        marketValue: 8000000
      },
      {
        id: 8,
        name: 'Karim Benzema',
        position: 'ST',
        age: 36,
        nationality: 'France',
        goals: 22,
        assists: 11,
        matches: 28,
        rating: 8.6,
        status: 'active',
        contract: '2024-06-30',
        salary: 35000000,
        marketValue: 25000000
      }
    ];

    const clubs: Club[] = [
      {
        id: 1,
        name: 'Real Madrid',
        league: 'La Liga',
        founded: 1902,
        stadium: 'Santiago Bernabéu',
        capacity: 81044,
        budget: 900000000,
        revenue: 750000000,
        expenses: 680000000,
        trophies: 97,
        ranking: 1
      }
    ];

    const analytics: AnalyticsData = {
      totalPlayers: players.length,
      activeContracts: players.filter(p => p.status === 'active').length,
      totalRevenue: clubs[0].revenue,
      avgPlayerRating: players.reduce((sum, p) => sum + p.rating, 0) / players.length,
      matchesPlayed: Math.max(...players.map(p => p.matches)),
      goalsScored: players.reduce((sum, p) => sum + p.goals, 0),
      cleanSheets: 15,
      winRate: 72
    };

    return { players, clubs, analytics };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real application, you would fetch this data from your data management system
      // For now, we'll use mock data
      const { players, clubs, analytics } = getMockDataManagementData();
      
      // Transform and integrate the data using our service
      const integratedData = await dataIntegrationService.getIntegratedUserData(
        players,
        clubs,
        analytics
      );

      setUserData(integratedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load integrated data';
      setError(errorMessage);
      console.error('Error loading integrated data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getMockDataManagementData]);

  const refreshData = useCallback(async () => {
    dataIntegrationService.clearCache();
    await loadData();
  }, [loadData]);

  const updatePlayerData = useCallback(async (playerId: string, updates: Partial<Player>): Promise<boolean> => {
    try {
      const { players } = getMockDataManagementData();
      const success = await dataIntegrationService.updatePlayerData(playerId, updates, players);
      
      if (success) {
        // Refresh the data to reflect changes
        await refreshData();
      }
      
      return success;
    } catch (err) {
      console.error('Error updating player data:', err);
      return false;
    }
  }, [getMockDataManagementData, refreshData]);

  const getPlayerStats = useCallback(async (playerId: string) => {
    try {
      const { players } = getMockDataManagementData();
      return await dataIntegrationService.getPlayerStats(playerId, players);
    } catch (err) {
      console.error('Error getting player stats:', err);
      return null;
    }
  }, [getMockDataManagementData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up periodic refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshData, isLoading]);

  return {
    userData,
    isLoading,
    error,
    refreshData,
    updatePlayerData,
    getPlayerStats,
    setUserData
  };
};

export default useIntegratedData;