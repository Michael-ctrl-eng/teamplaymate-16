import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'statsor-app'
    }
  }
});

// Auth state management
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          role: 'player' | 'coach' | 'manager' | 'admin';
          is_verified: boolean;
          phone?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          role?: 'player' | 'coach' | 'manager' | 'admin';
          is_verified?: boolean;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string;
          role?: 'player' | 'coach' | 'manager' | 'admin';
          is_verified?: boolean;
          phone?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description?: string;
          logo_url?: string;
          founded_year?: number;
          home_venue?: string;
          website?: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          logo_url?: string;
          founded_year?: number;
          home_venue?: string;
          website?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          logo_url?: string;
          founded_year?: number;
          home_venue?: string;
          website?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          user_id?: string;
          first_name: string;
          last_name: string;
          position: string;
          jersey_number?: number;
          date_of_birth?: string;
          nationality?: string;
          height?: number;
          weight?: number;
          dominant_foot?: 'left' | 'right' | 'both';
          market_value?: number;
          contract_start?: string;
          contract_end?: string;
          salary?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id?: string;
          first_name: string;
          last_name: string;
          position: string;
          jersey_number?: number;
          date_of_birth?: string;
          nationality?: string;
          height?: number;
          weight?: number;
          dominant_foot?: 'left' | 'right' | 'both';
          market_value?: number;
          contract_start?: string;
          contract_end?: string;
          salary?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          position?: string;
          jersey_number?: number;
          date_of_birth?: string;
          nationality?: string;
          height?: number;
          weight?: number;
          dominant_foot?: 'left' | 'right' | 'both';
          market_value?: number;
          contract_start?: string;
          contract_end?: string;
          salary?: number;
          updated_at?: string;
        };
      };
    };
  };
}

export type { Database as SupabaseDatabase };