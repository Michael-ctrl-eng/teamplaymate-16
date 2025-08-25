import axios from 'axios';
import { toast } from 'sonner';

// API Configuration for development
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3006';

export const api = {
  baseURL: API_BASE_URL,
  
  // Auth endpoints
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    google: `${API_BASE_URL}/api/auth/google`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    verifyResetCode: `${API_BASE_URL}/api/auth/verify-reset-code`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  },

  // Teams endpoints
  teams: {
    list: `${API_BASE_URL}/api/teams`,
    create: `${API_BASE_URL}/api/teams`,
    get: (id: string) => `${API_BASE_URL}/api/teams/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/teams/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/teams/${id}`,
    players: (id: string) => `${API_BASE_URL}/api/teams/${id}/players`,
  },

  // Players endpoints
  players: {
    list: `${API_BASE_URL}/api/players`,
    create: `${API_BASE_URL}/api/players`,
    get: (id: string) => `${API_BASE_URL}/api/players/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/players/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/players/${id}`,
    stats: (id: string) => `${API_BASE_URL}/api/players/${id}/stats`,
  },

  // Matches endpoints
  matches: {
    list: `${API_BASE_URL}/api/matches`,
    create: `${API_BASE_URL}/api/matches`,
    get: (id: string) => `${API_BASE_URL}/api/matches/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/matches/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/matches/${id}`,
    stats: (id: string) => `${API_BASE_URL}/api/matches/${id}/stats`,
    events: (id: string) => `${API_BASE_URL}/api/matches/${id}/events`,
  },

  // Chatbot endpoints
  chatbot: {
    chat: `${API_BASE_URL}/api/chatbot/chat`,
    history: `${API_BASE_URL}/api/chatbot/history`,
    suggestions: `${API_BASE_URL}/api/chatbot/suggestions`,
    clear: `${API_BASE_URL}/api/chatbot/clear`,
  },

  // Analytics endpoints
  analytics: {
    dashboard: `${API_BASE_URL}/api/analytics/dashboard`,
    team: (id: string) => `${API_BASE_URL}/api/analytics/team/${id}`,
    player: (id: string) => `${API_BASE_URL}/api/analytics/player/${id}`,
    matches: `${API_BASE_URL}/api/analytics/matches`,
    export: `${API_BASE_URL}/api/analytics/export`,
  },

  // Upload endpoints
  upload: {
    image: `${API_BASE_URL}/api/upload/image`,
    document: `${API_BASE_URL}/api/upload/document`,
    delete: (id: string) => `${API_BASE_URL}/api/upload/${id}`,
  },

  // Subscription endpoints
  subscription: {
    plans: `${API_BASE_URL}/api/subscriptions/plans`,
    create: `${API_BASE_URL}/api/subscriptions/create`,
    current: `${API_BASE_URL}/api/subscriptions/current`,
    cancel: `${API_BASE_URL}/api/subscriptions/cancel`,
    upgrade: `${API_BASE_URL}/api/subscriptions/upgrade`,
  },

  // Health check
  health: `${API_BASE_URL}/api/health`,

  // AI Chat endpoints
  aiChat: {
    messages: `${API_BASE_URL}/api/v1/aichat/messages`,
    history: `${API_BASE_URL}/api/v1/aichat/history`,
  },
};

// Mock Auth API functions for local development
export const authAPI = {
  register: async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mock user
    const mockUser = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      picture: undefined,
      provider: 'email' as const,
      created_at: new Date().toISOString(),
      location: data.location || '',
      sport: undefined,
      sportSelected: false
    };
    
    const mockToken = `mock_token_${Date.now()}`;
    
    return {
      data: {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        },
        message: 'Registration successful'
      }
    };
  },
  
  login: async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem('statsor_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === data.email) {
        const mockToken = `mock_token_${Date.now()}`;
        return {
          data: {
            success: true,
            data: {
              user: user,
              token: mockToken
            },
            message: 'Login successful'
          }
        };
      }
    }
    
    // Create new user if not found
    const mockUser = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.email.split('@')[0],
      picture: undefined,
      provider: 'email' as const,
      created_at: new Date().toISOString(),
      location: '',
      sport: undefined,
      sportSelected: false
    };
    
    const mockToken = `mock_token_${Date.now()}`;
    
    return {
      data: {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        },
        message: 'Login successful'
      }
    };
  },
  
  verifyGoogleToken: async (code: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check if we're in mock mode
      const enableMockAuth = import.meta.env?.['VITE_ENABLE_MOCK_AUTH'] === 'true';
      
      if (enableMockAuth) {
        // Create mock Google user with more realistic data
        const mockUser = {
          id: `google_user_${Date.now()}`,
          email: 'google.demo@gmail.com',
          name: 'Google Demo User',
          given_name: 'Google',
          family_name: 'Demo',
          picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          provider: 'google' as const,
          created_at: new Date().toISOString(),
          location: '',
          sport: undefined,
          sportSelected: false,
          verified_email: true,
          locale: 'en'
        };
        
        const mockToken = `mock_google_token_${Date.now()}`;
        
        return {
          data: {
            success: true,
            data: {
              user: mockUser,
              token: mockToken
            },
            message: 'Google authentication successful (Demo Mode)'
          }
        };
      }
      
      // In a real implementation, this would:
      // 1. Exchange the authorization code for an access token
      // 2. Use the access token to get user info from Google
      // 3. Create or update the user in your database
      // 4. Return a JWT token for your app
      
      // For now, return a realistic mock response
      const mockUser = {
        id: `google_user_${Date.now()}`,
        email: 'user@gmail.com',
        name: 'Google User',
        given_name: 'Google',
        family_name: 'User',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google' as const,
        created_at: new Date().toISOString(),
        location: '',
        sport: undefined,
        sportSelected: false,
        verified_email: true,
        locale: 'en'
      };
      
      const mockToken = `google_token_${Date.now()}`;
      
      return {
        data: {
          success: true,
          data: {
            user: mockUser,
            token: mockToken
          },
          message: 'Google authentication successful'
        }
      };
      
    } catch (error) {
      console.error('Google token verification error:', error);
      return {
        data: {
          success: false,
          message: 'Google authentication failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  },
  
  updateSportPreference: async (sport: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update user in localStorage
    const savedUser = localStorage.getItem('statsor_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.sport = sport;
      user.sportSelected = true;
      localStorage.setItem('statsor_user', JSON.stringify(user));
    }
    
    return {
      data: {
        success: true,
        data: { sport },
        message: 'Sport preference updated successfully'
      }
    };
  },

  forgotPassword: async (data: { email: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store reset code in localStorage for demo
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`reset_code_${data.email}`, resetCode);
    localStorage.setItem(`reset_code_expiry_${data.email}`, (Date.now() + 15 * 60 * 1000).toString());
    
    console.log(`Mock: Reset code for ${data.email}: ${resetCode}`);
    
    return {
      data: {
        success: true,
        message: 'If the email exists, a reset code has been sent.'
      }
    };
  },

  verifyResetCode: async (data: { email: string; code: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedCode = localStorage.getItem(`reset_code_${data.email}`);
    const expiry = localStorage.getItem(`reset_code_expiry_${data.email}`);
    
    if (!storedCode || !expiry || Date.now() > parseInt(expiry)) {
      return {
        data: {
          success: false,
          message: 'Invalid or expired reset code'
        }
      };
    }
    
    if (storedCode !== data.code) {
      return {
        data: {
          success: false,
          message: 'Invalid reset code'
        }
      };
    }
    
    return {
      data: {
        success: true,
        data: { valid: true },
        message: 'Reset code verified successfully'
      }
    };
  },

  resetPassword: async (data: { email: string; code: string; password: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const storedCode = localStorage.getItem(`reset_code_${data.email}`);
    const expiry = localStorage.getItem(`reset_code_expiry_${data.email}`);
    
    if (!storedCode || !expiry || Date.now() > parseInt(expiry)) {
      return {
        data: {
          success: false,
          message: 'Invalid or expired reset code'
        }
      };
    }
    
    if (storedCode !== data.code) {
      return {
        data: {
          success: false,
          message: 'Invalid reset code'
        }
      };
    }
    
    // Clear reset code
    localStorage.removeItem(`reset_code_${data.email}`);
    localStorage.removeItem(`reset_code_expiry_${data.email}`);
    
    // Update user password (in a real app, this would be handled by the backend)
    console.log(`Mock: Password reset successful for ${data.email}`);
    
    return {
      data: {
        success: true,
        message: 'Password reset successful'
      }
    };
  }
};

// Mock chatbot API
export const chatbotAPI = {
  sendMessage: async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      data: {
        success: true,
        data: {
          response: `Mock response to: ${message}`,
          suggestions: ['Try asking about tactics', 'Formation advice', 'Training tips']
        }
      }
    };
  }
};

export default api;