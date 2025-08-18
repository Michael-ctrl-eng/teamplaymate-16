import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authAPI } from '../lib/api'

interface UserProfile {
  id: string
  email: string
  name: string
  picture?: string
  avatar?: string
  given_name?: string
  family_name?: string
  locale?: string
  verified_email?: boolean
  created_at?: string
  location?: string
  provider: 'google' | 'email'
  sport?: 'soccer' | 'futsal'
  sportSelected?: boolean
  display_name?: string
  phone?: string
  bio?: string
  teamId?: string;
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  isNewUser: boolean
  hasCompletedOnboarding: boolean
  signUp: (email: string, password: string, additionalData?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  handleGoogleCallback: (token: string) => Promise<any>
  signOut: () => Promise<any>
  logout: () => Promise<any>
  updateSportPreference: (sport: 'soccer' | 'futsal') => Promise<any>
  completeOnboarding: () => void
  skipOnboarding: () => void
  login: (email: string, password: string) => Promise<any>
  register: (email: string, password: string, additionalData?: any) => Promise<any>
  resetPassword?: (email: string) => Promise<any>
  verifyResetCode?: (email: string, code: string) => Promise<any>
  resetPasswordWithCode?: (email: string, code: string, newPassword: string) => Promise<any>
  updateProfile?: (data: Partial<UserProfile>) => Promise<any>
  updateUser?: (data: Partial<UserProfile>) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const navigate = useNavigate()

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('statsor_user')
    const onboardingStatus = localStorage.getItem('statsor_onboarding_completed')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setHasCompletedOnboarding(onboardingStatus === 'true')
    }
  }, [])

  const signUp = async (email: string, password: string, additionalData?: any) => {
    if (loading || isSigningIn) {
      toast.error('Please wait, authentication in progress...')
      return { data: null, error: 'Authentication in progress' }
    }

    setIsSigningIn(true)
    setLoading(true)
    try {
      const response = await authAPI.register({
        email,
        password,
        name: additionalData?.name || email.split('@')[0]
      })
      
      if (response.data.success) {
        const { user, token } = response.data.data
        setUser(user)
        setIsNewUser(true)
        setHasCompletedOnboarding(false)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('statsor_user', JSON.stringify(user))
        localStorage.removeItem('statsor_onboarding_completed')
        return { data: { user }, error: null }
      }
      return { data: null, error: response.data.message }
    } finally {
      setLoading(false)
      setIsSigningIn(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (loading || isSigningIn) {
      toast.error('Please wait, authentication in progress...')
      return { data: null, error: 'Authentication in progress' }
    }

    setIsSigningIn(true)
    setLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      
      if (response.data.success) {
        const { user, token } = response.data.data
        setUser(user)
        setIsNewUser(false)
        const onboardingStatus = localStorage.getItem('statsor_onboarding_completed')
        setHasCompletedOnboarding(onboardingStatus === 'true')
        localStorage.setItem('auth_token', token)
        localStorage.setItem('statsor_user', JSON.stringify(user))
        return { data: { user }, error: null }
      }
      return { data: null, error: response.data.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { data: null, error: 'Login failed' }
    } finally {
      setLoading(false)
      setIsSigningIn(false)
    }
  }

  const signInWithGoogle = async () => {
    if (loading || isSigningIn) {
      toast.error('Please wait, authentication in progress...')
      return { data: null, error: 'Authentication in progress' }
    }

    setIsSigningIn(true)
    setLoading(true)
    try {
      // Check if Google Client ID is configured
      const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in environment variables.');
      }
      
      // Redirect to Google OAuth
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline`;
      
      window.location.href = googleAuthUrl;
      return { data: null, error: null };
    } catch (error) {
      console.error('Google auth error:', error);
      // Fallback to mock for demo
      const mockGoogleUser = {
        id: 'google_demo',
        email: 'demo@gmail.com',
        name: 'Demo Google User',
        picture: 'https://via.placeholder.com/150',
        provider: 'google' as const,
        sportSelected: false,
        created_at: new Date().toISOString()
      };
      const mockToken = 'demo-google-token-' + Date.now();
      
      setUser(mockGoogleUser);
      setIsNewUser(true);
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('statsor_user', JSON.stringify(mockGoogleUser));
      return { data: null, error }
    } finally {
      setIsSigningIn(false)
      setLoading(false)
    }
  }

  const handleGoogleCallback = async (token: string) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyGoogleToken(token);
      if (response.data.success) {
        const { user, token: authToken } = response.data.data;
        setUser(user);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('statsor_user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      return { data: null, error: response.data.message };
    } catch (error) {
      return { data: null, error: 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('statsor_user');
      localStorage.removeItem('statsor_sport');
      localStorage.removeItem('statsor_sport_selection_completed');
      localStorage.removeItem('statsor_onboarding_completed');
      
      // Call logout API if available
      try {
        // Mock logout API call
        console.log('Logging out user...');
      } catch (apiError) {
        console.warn('Logout API call failed, but local session cleared:', apiError);
      }
      
      setUser(null)
      setIsNewUser(false)
      setHasCompletedOnboarding(false)
      
      // Force page reload to clear any cached state
      navigate('/signin');
      return { error: null }
    } finally {
      setIsSigningIn(false)
      setLoading(false)
    }
  }

  const updateSportPreference = async (sport: 'soccer' | 'futsal') => {
    try {
      const response = await authAPI.updateSportPreference(sport)
      if (response.data.success) {
        const updatedUser = { ...user, sport, sportSelected: true }
        setUser(updatedUser)
        localStorage.setItem('statsor_user', JSON.stringify(updatedUser))
        return { data: { user: updatedUser }, error: null }
      }
      return { data: null, error: response.data.message }
    } catch (error: any) {
      console.error('Update sport preference error:', error);
      return { data: null, error: error.message }
    }
  }
  
  const completeOnboarding = () => {
    setHasCompletedOnboarding(true)
    setIsNewUser(false)
    localStorage.setItem('statsor_onboarding_completed', 'true')
  }

  const skipOnboarding = () => {
    setHasCompletedOnboarding(true)
    setIsNewUser(false)
    localStorage.setItem('statsor_onboarding_completed', 'true')
  }

  // Alias methods for compatibility
  const login = signIn;
  const register = signUp;
  const logout = signOut;

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { data: null, error: 'No user logged in' };
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('statsor_user', JSON.stringify(updatedUser));
    return { data: updatedUser, error: null };
  };

  const updateUser = updateProfile;

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.data.success) {
        return { data: { message: 'Reset code sent to your email' }, error: null };
      }
      return { data: null, error: response.data.message || 'Failed to send reset code' };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { data: null, error: error.message || 'Failed to send reset code' };
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    setLoading(true);
    try {
      const response = await authAPI.verifyResetCode({ email, code });
      if (response.data.success) {
        return { data: { valid: true }, error: null };
      }
      return { data: { valid: false }, error: response.data.message || 'Invalid reset code' };
    } catch (error: any) {
      console.error('Verify reset code error:', error);
      return { data: { valid: false }, error: error.message || 'Invalid reset code' };
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
    setLoading(true);
    try {
      const response = await authAPI.resetPassword({ email, code, password: newPassword });
      if (response.data.success) {
        return { data: { message: 'Password reset successful' }, error: null };
      }
      return { data: null, error: response.data.message || 'Failed to reset password' };
    } catch (error: any) {
      console.error('Reset password with code error:', error);
      return { data: null, error: error.message || 'Failed to reset password' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isNewUser,
    hasCompletedOnboarding,
    signUp,
    signIn,
    signInWithGoogle,
    handleGoogleCallback,
    signOut,
    logout,
    login,
    register,
    resetPassword,
    verifyResetCode,
    resetPasswordWithCode,
    updateProfile,
    updateUser,
    updateSportPreference,
    completeOnboarding,
    skipOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}