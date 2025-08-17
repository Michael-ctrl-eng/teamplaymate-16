import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner';

// Use environment variables with fallback to demo values
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Mock authentication for demo when Supabase is not properly configured
export const mockAuth = {
  signUp: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { 
      data: { user: { id: '1', email } }, 
      error: null 
    }
  },
  signIn: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { 
      data: { user: { id: '1', email } }, 
      error: null 
    }
  },
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { error: null }
  }
}