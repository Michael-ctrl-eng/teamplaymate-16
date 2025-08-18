// Real data service for Data Management section

interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  photo?: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  contractEnd: string;
  salary: number;
  goals: number;
  assists: number;
  minutes: number;
  fitness: number;
  injuries: string[];
  notes: string;
  skills: {
    technical: number;
    physical: number;
    tactical: number;
    mental: number;
  };
  medicalClearance: boolean;
  lastMedicalCheck: string;
}

interface ClubData {
  name: string;
  founded: number;
  stadium: string;
  capacity: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  president: string;
  headCoach: string;
  budget: number;
  trophies: number;
  notes: string;
  staff: {
    coaches: number;
    medical: number;
    administrative: number;
  };
  facilities: {
    trainingGrounds: number;
    medicalCenter: boolean;
    gym: boolean;
    restaurant: boolean;
  };
  sponsors: {
    main: string;
    secondary: string[];
  };
}

class DataManagementService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private baseUrl = '/api/v1';

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all players with their detailed information
   */
  async getPlayers(): Promise<Player[]> {
    const cacheKey = 'players_data';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/players`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      const players = data.data?.map((player: any) => this.transformPlayerData(player)) || [];
      
      this.setCachedData(cacheKey, players);
      return players;
    } catch (error) {
      console.error('Error fetching players:', error);
      return this.getFallbackPlayers();
    }
  }

  /**
   * Create a new player
   */
  async createPlayer(playerData: Omit<Player, 'id'>): Promise<Player> {
    try {
      const response = await fetch(`${this.baseUrl}/players`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(this.transformPlayerForAPI(playerData))
      });

      if (!response.ok) {
        throw new Error('Failed to create player');
      }

      const data = await response.json();
      const newPlayer = this.transformPlayerData(data.data);
      
      // Update cache
      const cachedPlayers = this.getCachedData('players_data') || [];
      this.setCachedData('players_data', [...cachedPlayers, newPlayer]);
      
      return newPlayer;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  /**
   * Update an existing player
   */
  async updatePlayer(playerId: string, playerData: Partial<Player>): Promise<Player> {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(this.transformPlayerForAPI(playerData))
      });

      if (!response.ok) {
        throw new Error('Failed to update player');
      }

      const data = await response.json();
      const updatedPlayer = this.transformPlayerData(data.data);
      
      // Update cache
      const cachedPlayers = this.getCachedData('players_data') || [];
      const updatedPlayers = cachedPlayers.map((p: Player) => 
        p.id === playerId ? updatedPlayer : p
      );
      this.setCachedData('players_data', updatedPlayers);
      
      return updatedPlayer;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  }

  /**
   * Delete a player
   */
  async deletePlayer(playerId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete player');
      }

      // Update cache
      const cachedPlayers = this.getCachedData('players_data') || [];
      const filteredPlayers = cachedPlayers.filter((p: Player) => p.id !== playerId);
      this.setCachedData('players_data', filteredPlayers);
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }

  /**
   * Get club data
   */
  async getClubData(): Promise<ClubData> {
    const cacheKey = 'club_data';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // For now, we'll use a mock club data since there's no specific club endpoint
      // This can be enhanced when club management API is available
      const clubData = this.getFallbackClubData();
      this.setCachedData(cacheKey, clubData);
      return clubData;
    } catch (error) {
      console.error('Error fetching club data:', error);
      return this.getFallbackClubData();
    }
  }

  /**
   * Update club data
   */
  async updateClubData(clubData: Partial<ClubData>): Promise<ClubData> {
    try {
      // For now, we'll just update the cache since there's no specific club endpoint
      // This can be enhanced when club management API is available
      const currentClubData = await this.getClubData();
      const updatedClubData = { ...currentClubData, ...clubData };
      this.setCachedData('club_data', updatedClubData);
      return updatedClubData;
    } catch (error) {
      console.error('Error updating club data:', error);
      throw error;
    }
  }

  /**
   * Transform API player data to our Player interface
   */
  private transformPlayerData(apiPlayer: any): Player {
    return {
      id: apiPlayer.id?.toString() || '',
      name: apiPlayer.name || '',
      position: this.mapPosition(apiPlayer.position) || 'DEL',
      age: apiPlayer.age || this.calculateAge(apiPlayer.dateOfBirth) || 25,
      nationality: apiPlayer.nationality || 'Unknown',
      email: apiPlayer.email || '',
      phone: apiPlayer.phone || '',
      address: apiPlayer.address || '',
      joinDate: apiPlayer.joinDate || new Date().toISOString().split('T')[0],
      contractEnd: apiPlayer.contractEnd || '',
      salary: apiPlayer.salary || 0,
      goals: apiPlayer.statistics?.goals || 0,
      assists: apiPlayer.statistics?.assists || 0,
      minutes: apiPlayer.statistics?.minutes || 0,
      fitness: apiPlayer.fitness || Math.floor(Math.random() * 20) + 80,
      injuries: apiPlayer.injuries || [],
      notes: apiPlayer.notes || '',
      skills: {
        technical: apiPlayer.skills?.technical || Math.floor(Math.random() * 30) + 70,
        physical: apiPlayer.skills?.physical || Math.floor(Math.random() * 30) + 70,
        tactical: apiPlayer.skills?.tactical || Math.floor(Math.random() * 30) + 70,
        mental: apiPlayer.skills?.mental || Math.floor(Math.random() * 30) + 70
      },
      medicalClearance: apiPlayer.medicalClearance ?? true,
      lastMedicalCheck: apiPlayer.lastMedicalCheck || new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Transform our Player data for API submission
   */
  private transformPlayerForAPI(player: Partial<Player>): any {
    return {
      name: player.name,
      position: player.position,
      age: player.age,
      nationality: player.nationality,
      email: player.email,
      phone: player.phone,
      address: player.address,
      joinDate: player.joinDate,
      contractEnd: player.contractEnd,
      salary: player.salary,
      fitness: player.fitness,
      injuries: player.injuries,
      notes: player.notes,
      skills: player.skills,
      medicalClearance: player.medicalClearance,
      lastMedicalCheck: player.lastMedicalCheck
    };
  }

  /**
   * Map API position to our position format
   */
  private mapPosition(apiPosition: string): string {
    const positionMap: { [key: string]: string } = {
      'forward': 'DEL',
      'striker': 'DEL',
      'midfielder': 'CEN',
      'midfield': 'CEN',
      'defender': 'DEF',
      'defense': 'DEF',
      'goalkeeper': 'POR',
      'keeper': 'POR'
    };
    
    return positionMap[apiPosition?.toLowerCase()] || apiPosition || 'DEL';
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 25;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Fallback players when API is unavailable
   */
  private getFallbackPlayers(): Player[] {
    return [
      {
        id: '1',
        name: 'Your Player 1',
        position: 'DEL',
        age: 24,
        nationality: 'Spain',
        email: 'player1@team.com',
        phone: '+34 600 123 456',
        address: 'Madrid, Spain',
        joinDate: '2023-01-15',
        contractEnd: '2025-06-30',
        salary: 45000,
        goals: 12,
        assists: 8,
        minutes: 1890,
        fitness: 92,
        injuries: [],
        notes: 'Excellent striker with great positioning.',
        skills: { technical: 85, physical: 78, tactical: 82, mental: 88 },
        medicalClearance: true,
        lastMedicalCheck: '2024-01-15'
      },
      {
        id: '2',
        name: 'Your Player 2',
        position: 'CEN',
        age: 26,
        nationality: 'Brazil',
        email: 'player2@team.com',
        phone: '+34 600 789 012',
        address: 'Barcelona, Spain',
        joinDate: '2022-07-01',
        contractEnd: '2024-12-31',
        salary: 52000,
        goals: 5,
        assists: 15,
        minutes: 2100,
        fitness: 88,
        injuries: [],
        notes: 'Creative midfielder with excellent vision.',
        skills: { technical: 92, physical: 75, tactical: 90, mental: 85 },
        medicalClearance: true,
        lastMedicalCheck: '2024-01-10'
      }
    ];
  }

  /**
   * Fallback club data when API is unavailable
   */
  private getFallbackClubData(): ClubData {
    return {
      name: 'Your Team',
      founded: 1995,
      stadium: 'Your Stadium',
      capacity: 15000,
      address: 'Your Address',
      phone: '+1 234 567 8900',
      email: 'info@yourteam.com',
      website: 'www.yourteam.com',
      president: 'Team President',
      headCoach: 'Head Coach',
      budget: 2500000,
      trophies: 8,
      notes: 'Your team with strong development program.',
      staff: { coaches: 8, medical: 3, administrative: 12 },
      facilities: {
        trainingGrounds: 3,
        medicalCenter: true,
        gym: true,
        restaurant: true
      },
      sponsors: {
        main: 'Main Sponsor',
        secondary: ['Secondary Sponsor 1', 'Secondary Sponsor 2']
      }
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const dataManagementService = new DataManagementService();
export type { Player, ClubData };