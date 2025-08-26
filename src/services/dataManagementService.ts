// Production Data Management Service with Supabase Integration
import { supabase, Database } from '../lib/supabase';
import { toast } from 'sonner';

type Player = Database['public']['Tables']['players']['Row'] & {
  name?: string;
  goals?: number;
  assists?: number;
  minutes?: number;
  fitness?: number;
  injuries?: string[];
  notes?: string;
  skills?: {
    technical: number;
    physical: number;
    tactical: number;
    mental: number;
  };
  medicalClearance?: boolean;
  lastMedicalCheck?: string;
  joinDate?: string;
  contractEnd?: string;
  email?: string;
  phone?: string;
  address?: string;
  age?: number;
};

type ClubData = Database['public']['Tables']['teams']['Row'] & {
  founded: number;
  stadium: string;
  capacity: number;
  address: string;
  phone: string;
  email: string;
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
  president?: string;
  headCoach?: string;
  website?: string;
};

class DataManagementService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get all players for the current user's teams
   */
  async getPlayers(teamId?: string): Promise<Player[]> {
    try {
      const cacheKey = `players_${teamId || 'all'}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      let query = supabase
        .from('players')
        .select(`
          *,
          teams!inner(*)
        `);

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const players = data || [];
      this.setCachedData(cacheKey, players);
      return players;
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
      return this.getFallbackPlayers();
    }
  }

  /**
   * Create a new player with Supabase
   */
  async createPlayer(playerData: Partial<Player>): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearPlayerCache();
      toast.success('Player created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating player:', error);
      toast.error(error.message || 'Failed to create player');
      return null;
    }
  }

  /**
   * Update a player with Supabase
   */
  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearPlayerCache();
      toast.success('Player updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating player:', error);
      toast.error(error.message || 'Failed to update player');
      return null;
    }
  }

  /**
   * Delete a player with Supabase
   */
  async deletePlayer(playerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      // Clear cache
      this.clearPlayerCache();
      toast.success('Player deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast.error(error.message || 'Failed to delete player');
      return false;
    }
  }

  private clearPlayerCache(): void {
    const keys = Array.from(this.cache.keys()).filter(key => key.startsWith('players_'));
    keys.forEach(key => this.cache.delete(key));
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
    const now = new Date().toISOString();
    return {
      id: apiPlayer.id?.toString() || '',
      first_name: apiPlayer.first_name || apiPlayer.name?.split(' ')[0] || '',
      last_name: apiPlayer.last_name || apiPlayer.name?.split(' ').slice(1).join(' ') || '',
      position: this.mapPosition(apiPlayer.position) || 'DEL',
      age: apiPlayer.age || this.calculateAge(apiPlayer.date_of_birth) || 25,
      nationality: apiPlayer.nationality || 'Unknown',
      email: apiPlayer.email || '',
      phone: apiPlayer.phone || '',
      address: apiPlayer.address || '',
      date_of_birth: apiPlayer.date_of_birth || '',
      contract_end: apiPlayer.contract_end || '',
      salary: apiPlayer.salary || 0,
      team_id: apiPlayer.team_id || '',
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
      lastMedicalCheck: apiPlayer.lastMedicalCheck || new Date().toISOString().split('T')[0],
      joinDate: apiPlayer.join_date || apiPlayer.joinDate || new Date().toISOString().split('T')[0],
      contractEnd: apiPlayer.contract_end || apiPlayer.contractEnd || '',
      jersey_number: apiPlayer.jersey_number || Math.floor(Math.random() * 99) + 1,
      height: apiPlayer.height || 180,
      weight: apiPlayer.weight || 75,
      dominant_foot: apiPlayer.dominant_foot || 'right',
      market_value: apiPlayer.market_value || 1000000,
      contract_start: apiPlayer.contract_start || new Date().toISOString().split('T')[0],
      created_at: apiPlayer.created_at || now,
      updated_at: apiPlayer.updated_at || now,
      user_id: apiPlayer.user_id || null
    };
  }

  /**
   * Transform our Player data for API submission
   */
  private transformPlayerForAPI(player: Partial<Player>): any {
    return {
      first_name: player.first_name || player.name?.split(' ')[0],
      last_name: player.last_name || player.name?.split(' ').slice(1).join(' '),
      position: player.position,
      age: player.age,
      nationality: player.nationality,
      email: player.email,
      phone: player.phone,
      address: player.address,
      date_of_birth: player.date_of_birth,
      contract_end: player.contract_end || player.contractEnd,
      salary: player.salary,
      fitness: player.fitness,
      injuries: player.injuries,
      notes: player.notes,
      skills: player.skills,
      medicalClearance: player.medicalClearance,
      lastMedicalCheck: player.lastMedicalCheck,
      join_date: player.joinDate
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
    const now = new Date().toISOString();
    return [
      {
        id: '1',
        first_name: 'Your',
        last_name: 'Player 1',
        position: 'DEL',
        age: 24,
        nationality: 'Spain',
        email: 'player1@team.com',
        phone: '+34 600 123 456',
        address: 'Madrid, Spain',
        date_of_birth: '1999-05-15',
        contract_end: '2025-06-30',
        salary: 45000,
        team_id: '1',
        goals: 12,
        assists: 8,
        minutes: 1890,
        fitness: 92,
        injuries: [],
        notes: 'Excellent striker with great positioning.',
        skills: { technical: 85, physical: 78, tactical: 82, mental: 88 },
        medicalClearance: true,
        lastMedicalCheck: '2024-01-15',
        joinDate: '2023-01-15',
        contractEnd: '2025-06-30',
        jersey_number: 9,
        height: 182,
        weight: 78,
        dominant_foot: 'right',
        market_value: 2500000,
        contract_start: '2023-01-15',
        created_at: now,
        updated_at: now
      },
      {
        id: '2',
        first_name: 'Your',
        last_name: 'Player 2',
        position: 'CEN',
        age: 26,
        nationality: 'Brazil',
        email: 'player2@team.com',
        phone: '+34 600 789 012',
        address: 'Barcelona, Spain',
        date_of_birth: '1997-03-22',
        contract_end: '2024-12-31',
        salary: 52000,
        team_id: '1',
        goals: 5,
        assists: 15,
        minutes: 2100,
        fitness: 88,
        injuries: [],
        notes: 'Creative midfielder with excellent vision.',
        skills: { technical: 92, physical: 75, tactical: 90, mental: 85 },
        medicalClearance: true,
        lastMedicalCheck: '2024-01-10',
        joinDate: '2022-07-01',
        contractEnd: '2024-12-31',
        jersey_number: 10,
        height: 178,
        weight: 72,
        dominant_foot: 'left',
        market_value: 3200000,
        contract_start: '2022-07-01',
        created_at: now,
        updated_at: now
      }
    ];
  }

  /**
   * Fallback club data when API is unavailable
   */
  private getFallbackClubData(): ClubData {
    const now = new Date().toISOString();
    return {
      id: '1',
      name: 'Your Team',
      description: 'A professional football team',
      founded_year: 1995,
      home_venue: 'Your Stadium',
      website: 'www.yourteam.com',
      created_by: 'admin',
      created_at: now,
      updated_at: now,
      founded: 1995,
      stadium: 'Your Stadium',
      capacity: 15000,
      address: 'Your Address',
      phone: '+1 234 567 8900',
      email: 'info@yourteam.com',
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
      },
      logo_url: '',
      president: 'Team President',
      headCoach: 'Head Coach'
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