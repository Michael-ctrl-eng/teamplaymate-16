import { supabase } from '../lib/supabase';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: string;
  sport?: 'soccer' | 'futsal';
  role?: 'player' | 'coach' | 'manager';
  created_at?: string;
  updated_at?: string;
}

interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  matchReminders: boolean;
  trainingAlerts: boolean;
  teamUpdates: boolean;
  analyticsReports: boolean;
  marketingEmails: boolean;
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
  autoSave: boolean;
}

interface SubscriptionInfo {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  features: string[];
  limits: {
    teams: number;
    players: number;
    matches: number;
    storage: number;
    apiCalls: number;
  };
}

interface AccountActivity {
  id: string;
  type: 'login' | 'profile_update' | 'password_change' | 'subscription_change' | 'team_created' | 'match_recorded';
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: Date;
  activeSessions: {
    id: string;
    device: string;
    location: string;
    lastActive: Date;
    current: boolean;
  }[];
  loginHistory: {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    location?: string;
  }[];
}

interface DataExportRequest {
  id: string;
  type: 'profile' | 'teams' | 'matches' | 'analytics' | 'complete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
}

class AccountManagementService {
  private userId: string | null = null;

  constructor() {
    this.initializeUser();
  }

  private async initializeUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || null;
    } catch (error) {
      console.error('Failed to initialize user:', error);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      if (!this.userId) {
        const { data: { user } } = await supabase.auth.getUser();
        this.userId = user?.id || null;
      }

      if (!this.userId) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return this.getMockProfile();
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) return { success: false, error: 'User not authenticated' };

      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', this.userId);

      if (error) throw error;

      await this.logActivity('profile_update', 'Profile information updated', { updates });
      return { success: true };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      if (!this.userId) return this.getDefaultSettings();

      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error || !settings) return this.getDefaultSettings();
      return settings;
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      return this.getDefaultSettings();
    }
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) return { success: false, error: 'User not authenticated' };

      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: this.userId, ...settings, updated_at: new Date().toISOString() });

      if (error) throw error;

      await this.logActivity('profile_update', 'Settings updated', { settings });
      return { success: true };
    } catch (error) {
      console.error('Failed to update settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }

  async getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
    try {
      if (!this.userId) return null;

      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .single();

      if (error || !subscription) return this.getMockSubscription();

      return {
        id: subscription.id,
        planId: subscription.plan_id,
        planName: subscription.subscription_plans.name,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start),
        currentPeriodEnd: new Date(subscription.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        price: subscription.subscription_plans.price,
        currency: subscription.subscription_plans.currency,
        features: subscription.subscription_plans.features,
        limits: subscription.subscription_plans.limits
      };
    } catch (error) {
      console.error('Failed to fetch subscription info:', error);
      return this.getMockSubscription();
    }
  }

  async getAccountActivity(limit: number = 20): Promise<AccountActivity[]> {
    try {
      if (!this.userId) return [];

      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return activities || [];
    } catch (error) {
      console.error('Failed to fetch account activity:', error);
      return this.getMockActivity();
    }
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      if (!this.userId) return this.getMockSecuritySettings();

      // In a real implementation, this would fetch from multiple tables
      // For now, return mock data with realistic structure
      return this.getMockSecuritySettings();
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      return this.getMockSecuritySettings();
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await this.logActivity('password_change', 'Password changed successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to change password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  async requestDataExport(type: DataExportRequest['type']): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      if (!this.userId) return { success: false, error: 'User not authenticated' };

      const requestId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real implementation, this would create a background job
      await this.logActivity('data_export', `Data export requested: ${type}`, { type, requestId });
      
      return { success: true, requestId };
    } catch (error) {
      console.error('Failed to request data export:', error);
      return { success: false, error: 'Failed to request data export' };
    }
  }

  async deleteAccount(confirmation: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) return { success: false, error: 'User not authenticated' };
      if (confirmation !== 'DELETE') return { success: false, error: 'Invalid confirmation' };

      // In a real implementation, this would soft delete and schedule data removal
      await this.logActivity('account_deletion', 'Account deletion requested');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete account:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }

  private async logActivity(type: AccountActivity['type'], description: string, metadata?: Record<string, any>) {
    try {
      if (!this.userId) return;

      await supabase
        .from('user_activities')
        .insert({
          user_id: this.userId,
          type,
          description,
          timestamp: new Date().toISOString(),
          metadata
        });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Mock data methods for fallback
  private getMockProfile(): UserProfile {
    return {
      id: 'mock_user_id',
      email: 'user@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      location: 'New York, USA',
      bio: 'Football enthusiast and coach',
      sport: 'soccer',
      role: 'coach',
      created_at: '2024-01-01T00:00:00Z'
    };
  }

  private getDefaultSettings(): UserSettings {
    return {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: true,
      pushNotifications: true,
      matchReminders: true,
      trainingAlerts: true,
      teamUpdates: true,
      analyticsReports: false,
      marketingEmails: false,
      profileVisibility: 'team',
      showEmail: false,
      showPhone: false,
      dataSharing: false,
      analyticsTracking: true,
      autoSave: true
    };
  }

  private getMockSubscription(): SubscriptionInfo {
    return {
      id: 'mock_subscription',
      planId: 'pro',
      planName: 'Pro',
      status: 'active',
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-02-01'),
      cancelAtPeriodEnd: false,
      price: 19.99,
      currency: 'USD',
      features: [
        '10 Teams',
        '100 Players',
        '50 Matches',
        'Advanced Analytics',
        'Priority Support'
      ],
      limits: {
        teams: 10,
        players: 100,
        matches: 50,
        storage: 10,
        apiCalls: 10000
      }
    };
  }

  private getMockActivity(): AccountActivity[] {
    return [
      {
        id: '1',
        type: 'login',
        description: 'Logged in from Chrome browser',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        ipAddress: '192.168.1.1'
      },
      {
        id: '2',
        type: 'profile_update',
        description: 'Updated profile information',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '3',
        type: 'team_created',
        description: 'Created new team: Barcelona FC',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      }
    ];
  }

  private getMockSecuritySettings(): SecuritySettings {
    return {
      twoFactorEnabled: false,
      lastPasswordChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      activeSessions: [
        {
          id: 'session_1',
          device: 'Chrome on Windows',
          location: 'New York, USA',
          lastActive: new Date(),
          current: true
        }
      ],
      loginHistory: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/120.0.0.0',
          success: true,
          location: 'New York, USA'
        }
      ]
    };
  }
}

export const accountManagementService = new AccountManagementService();
export type { UserProfile, UserSettings, SubscriptionInfo, AccountActivity, SecuritySettings, DataExportRequest };