import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxTeams: number;
  maxPlayers: number;
  maxMatches: number;
  hasAdvancedAnalytics: boolean;
  hasTacticalChat: boolean;
  hasExportFeatures: boolean;
  hasPrioritySupport: boolean;
}

export interface UserSubscription {
  planId: string;
  status: 'free' | 'trial' | 'active' | 'cancelled' | 'expired';
  trialStartDate?: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface UsageStats {
  teamsCreated: number;
  playersAdded: number;
  matchesPlayed: number;
  featuresUsed: {
    tacticalChat: number;
    advancedAnalytics: number;
    exportFeatures: number;
  };
}

const FREE_TRIAL_DAYS = 7;
const FREE_PLAN_LIMITS = {
  maxTeams: 1,
  maxPlayers: 10,
  maxMatches: 5,
  hasAdvancedAnalytics: false,
  hasTacticalChat: true,
  hasExportFeatures: false,
  hasPrioritySupport: false,
};

const PAID_PLAN_LIMITS = {
  maxTeams: 10,
  maxPlayers: 100,
  maxMatches: 50,
  hasAdvancedAnalytics: true,
  hasTacticalChat: true,
  hasExportFeatures: true,
  hasPrioritySupport: true,
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '1 Team',
      '10 Players',
      '5 Matches',
      'Basic Analytics',
      'Tactical Chat',
      'Community Support'
    ],
    ...FREE_PLAN_LIMITS
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: [
      '10 Teams',
      '100 Players',
      '50 Matches',
      'Advanced Analytics',
      'Tactical Chat',
      'Export Features',
      'Priority Support',
      'Custom Reports'
    ],
    ...PAID_PLAN_LIMITS
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited Teams',
      'Unlimited Players',
      'Unlimited Matches',
      'Advanced Analytics',
      'Tactical Chat',
      'Export Features',
      'Priority Support',
      'Custom Reports',
      'API Access',
      'White-label Options'
    ],
    maxTeams: -1, // Unlimited
    maxPlayers: -1, // Unlimited
    maxMatches: -1, // Unlimited
    hasAdvancedAnalytics: true,
    hasTacticalChat: true,
    hasExportFeatures: true,
    hasPrioritySupport: true,
  }
];

class SubscriptionService {
  private getStorageKey(userId: string, key: string): string {
    return `statsor_subscription_${userId}_${key}`;
  }

  private getUsageKey(userId: string): string {
    return `statsor_usage_${userId}`;
  }

  // Initialize user subscription (called after signup)
  initializeUserSubscription(userId: string): UserSubscription {
    const existingSubscription = this.getUserSubscription(userId);
    if (existingSubscription) {
      return existingSubscription;
    }

    const trialStartDate = new Date().toISOString();
    const trialEndDate = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const subscription: UserSubscription = {
      planId: 'free',
      status: 'trial',
      trialStartDate,
      trialEndDate,
    };

    this.saveUserSubscription(userId, subscription);
    this.initializeUsageStats(userId);

    toast.success('Welcome! You have 7 days of free access to all features.');
    return subscription;
  }

  // Get user subscription
  getUserSubscription(userId: string): UserSubscription | null {
    const key = this.getStorageKey(userId, 'data');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Save user subscription
  private saveUserSubscription(userId: string, subscription: UserSubscription): void {
    const key = this.getStorageKey(userId, 'data');
    localStorage.setItem(key, JSON.stringify(subscription));
  }

  // Get usage statistics
  getUserUsageStats(userId: string): UsageStats {
    const key = this.getUsageKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : this.initializeUsageStats(userId);
  }

  // Initialize usage statistics
  private initializeUsageStats(userId: string): UsageStats {
    const stats: UsageStats = {
      teamsCreated: 0,
      playersAdded: 0,
      matchesPlayed: 0,
      featuresUsed: {
        tacticalChat: 0,
        advancedAnalytics: 0,
        exportFeatures: 0,
      }
    };
    this.saveUserUsageStats(userId, stats);
    return stats;
  }

  // Save usage statistics
  private saveUserUsageStats(userId: string, stats: UsageStats): void {
    const key = this.getUsageKey(userId);
    localStorage.setItem(key, JSON.stringify(stats));
  }

  // Update usage statistics
  updateUsageStats(userId: string, updates: Partial<UsageStats>): void {
    const currentStats = this.getUserUsageStats(userId);
    const updatedStats = { ...currentStats, ...updates };
    this.saveUserUsageStats(userId, updatedStats);
  }

  // Check if user can access a feature
  canAccessFeature(userId: string, feature: keyof typeof FREE_PLAN_LIMITS): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    // During trial period, allow all features
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trialEndDate!);
      const now = new Date();
      if (now < trialEnd) {
        return true;
      } else {
        // Trial expired, update status to free
        subscription.status = 'free';
        this.saveUserSubscription(userId, subscription);
        toast.warning('Your free trial has expired. Upgrade to continue accessing premium features.');
      }
    }

    // Check plan limits
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) return false;

    return plan[feature] as boolean;
  }

  // Check if user can create more of a resource
  canCreateResource(userId: string, resourceType: 'teams' | 'players' | 'matches'): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    // During trial period, allow all resources
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trialEndDate!);
      const now = new Date();
      if (now < trialEnd) {
        return true;
      } else {
        // Trial expired, update status to free
        subscription.status = 'free';
        this.saveUserSubscription(userId, subscription);
        toast.warning('Your free trial has expired. Upgrade to continue creating more resources.');
      }
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    if (!plan) return false;

    const usage = this.getUserUsageStats(userId);
    const maxLimit = plan[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}` as keyof SubscriptionPlan] as number;

    // -1 means unlimited
    if (maxLimit === -1) return true;

    const currentCount = usage[`${resourceType}Created` as keyof UsageStats] as number;
    return currentCount < maxLimit;
  }

  // Get days remaining in trial
  getTrialDaysRemaining(userId: string): number {
    const subscription = this.getUserSubscription(userId);
    if (!subscription || subscription.status !== 'trial' || !subscription.trialEndDate) {
      return 0;
    }

    const trialEnd = new Date(subscription.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  // Upgrade subscription
  async upgradeSubscription(userId: string, planId: string): Promise<boolean> {
    try {
      // In a real app, this would integrate with a payment processor
      const subscription = this.getUserSubscription(userId);
      if (!subscription) return false;

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) return false;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedSubscription: UserSubscription = {
        ...subscription,
        planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        trialStartDate: undefined,
        trialEndDate: undefined,
      };

      this.saveUserSubscription(userId, updatedSubscription);
      toast.success(`Successfully upgraded to ${plan.name} plan!`);
      return true;
    } catch (error) {
      toast.error('Failed to upgrade subscription. Please try again.');
      return false;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = this.getUserSubscription(userId);
      if (!subscription) return false;

      const updatedSubscription: UserSubscription = {
        ...subscription,
        status: 'cancelled',
        cancelAtPeriodEnd: true,
      };

      this.saveUserSubscription(userId, updatedSubscription);
      toast.success('Subscription cancelled. You can continue using premium features until the end of your billing period.');
      return true;
    } catch (error) {
      toast.error('Failed to cancel subscription. Please try again.');
      return false;
    }
  }

  // Get subscription status summary
  getSubscriptionSummary(userId: string) {
    const subscription = this.getUserSubscription(userId);
    const usage = this.getUserUsageStats(userId);
    const plan = subscription ? SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId) : null;
    const trialDaysRemaining = this.getTrialDaysRemaining(userId);

    return {
      subscription,
      plan,
      usage,
      trialDaysRemaining,
      isInTrial: subscription?.status === 'trial' && trialDaysRemaining > 0,
      canAccessAdvancedFeatures: this.canAccessFeature(userId, 'hasAdvancedAnalytics'),
      canExport: this.canAccessFeature(userId, 'hasExportFeatures'),
      canCreateMoreTeams: this.canCreateResource(userId, 'teams'),
      canCreateMorePlayers: this.canCreateResource(userId, 'players'),
      canCreateMoreMatches: this.canCreateResource(userId, 'matches'),
    };
  }
}

export const subscriptionService = new SubscriptionService(); 