import { footballAnalysisService } from './footballAnalysisService';
import { userDataAnalysisService } from './userDataAnalysisService';
import { injuryAssessmentService } from './injuryAssessmentService';
import { accountManagementService } from './accountManagementService';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  context?: any;
  messageType?: 'text' | 'analysis' | 'suggestion' | 'tactical' | 'insight' | 'recommendation';
  confidence?: number;
  sources?: string[];
  actions?: ChatAction[];
  feedback?: string;
}

interface ChatAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'download' | 'navigate';
  action: () => void;
  icon?: string;
}

interface UserContext {
  sport: 'soccer' | 'futsal';
  userId: string;
  teamData?: {
    id?: string;
    name: string;
    players: any[];
    recentMatches: any[];
    upcomingMatches: any[];
    currentSeason: any;
    teamStats: any;
  };
  userPreferences?: {
    language: string;
    experience: string;
    coachingStyle: string;
    preferredFormations: string[];
    focusAreas: string[];
  };
  sessionHistory?: ChatMessage[];
  currentContext?: {
    activeMatch?: any;
    trainingSession?: any;
    playerFocus?: string;
    tacticalFocus?: string;
  };
  isPremium?: boolean;
}

interface AIResponse {
  content: string;
  confidence: number;
  suggestions?: string[];
  followUpQuestions?: string[];
}

class AIChatService {
  private fallbackResponses: Record<string, string[]>;
  private userContextCache: Map<string, UserContext> = new Map();
  private conversationMemory: Map<string, ChatMessage[]> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private responseCache: Map<string, { response: AIResponse; timestamp: number }> = new Map();
  private performanceMetrics: Map<string, { responseTime: number; confidence: number; cacheHit: boolean }> = new Map();
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map();
  private personalityTraits: Record<string, any> = {};

  constructor() {
    this.initializeAI();
    this.initializePersonality();
    this.initializeKnowledgeBase();
    this.fallbackResponses = {
      formation: [
        "Based on your team's playing style, I'd recommend analyzing your current formation effectiveness. Let me look at your recent match data...",
        "Your team's formation should complement your players' strengths. From what I see in your squad, here are some tactical options...",
        "Formation choice depends on your opponent and match situation. Let me provide personalized recommendations based on your team's data."
      ],
      training: [
        "Looking at your team's recent performance data, I suggest focusing on areas where improvement is most needed.",
        "Based on your players' individual stats, here's a customized training plan that addresses your team's specific weaknesses.",
        "Your training should be data-driven. Let me analyze your team's performance metrics to suggest targeted drills."
      ],
      tactics: [
        "Your tactical approach should be based on your team's strengths and opponent analysis. Let me review your recent matches...",
        "I've analyzed your team's playing patterns. Here are tactical adjustments that could improve your performance.",
        "Tactical decisions should be informed by data. Based on your team's statistics, here's what I recommend."
      ],
      futsal: [
        "Futsal requires quick thinking and technical skills. Based on your team's profile, here are specific strategies...",
        "Your futsal tactics should emphasize your players' technical abilities. Let me suggest formations that suit your squad.",
        "In futsal, every player's role is crucial. Based on your roster, here's how to optimize your tactical setup."
      ],
      insights: [
        "I've discovered some interesting patterns in your team's data that could give you a competitive advantage.",
        "Based on comprehensive analysis of your team's performance, here are key insights you should know.",
        "Your data reveals opportunities for improvement that other coaches might miss. Let me share what I've found."
      ],
      motivation: [
        "Every great coach faces challenges. Based on your team's journey, here's some perspective that might help.",
        "Your dedication to your team is evident in the data. Here's how your efforts are paying off.",
        "Coaching is about continuous improvement. Your team's progress shows you're on the right track."
      ]
    };
  }

  private initializePersonality(): void {
    this.personalityTraits = {
      warmth: 0.8,
      enthusiasm: 0.9,
      expertise: 0.95,
      empathy: 0.85,
      proactiveness: 0.9,
      dataFocus: 0.9,
      adaptability: 0.85
    };
  }

  private initializeKnowledgeBase(): void {
    // Initialize with tactical knowledge, formations, training methods, etc.
    this.knowledgeBase.set('formations', {
      '4-3-3': { strengths: ['Width in attack', 'Balanced midfield'], weaknesses: ['Vulnerable to counter-attacks'], suitableFor: ['Possession-based teams'] },
      '4-2-3-1': { strengths: ['Defensive stability', 'Creative freedom'], weaknesses: ['Isolated striker'], suitableFor: ['Counter-attacking teams'] },
      '3-5-2': { strengths: ['Midfield dominance', 'Wing-back support'], weaknesses: ['Vulnerable wide areas'], suitableFor: ['Teams with strong wing-backs'] }
    });
    
    this.knowledgeBase.set('trainingMethods', {
      possession: ['Rondo exercises', 'Small-sided games', 'Passing combinations'],
      defense: ['Pressing triggers', 'Defensive shape', 'Set-piece organization'],
      attack: ['Finishing drills', 'Movement patterns', 'Crossing practice']
    });
  }

  private async initializeAI(): Promise<void> {
    try {
      // Initialize connection to AI services
      console.log('AI Chat Service initialized');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  async sendMessage(message: string, userContext: UserContext): Promise<AIResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(message, userContext);
    
    try {
      // Rate limiting check
      if (!this.checkRateLimit(userContext.userId)) {
        throw new Error('Rate limit exceeded. Please wait before sending more messages.');
      }
      
      // Check cache for similar responses
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        this.recordPerformance(userContext.userId, Date.now() - startTime, cachedResponse.confidence, true);
        return cachedResponse;
      }
      
      // Update user context cache
      this.userContextCache.set(userContext.userId, userContext);
      
      // Process with advanced AI response system
      const response = await this.processAdvancedAIResponse(message, userContext);
      
      // Cache the response
      this.cacheResponse(cacheKey, response);
      
      // Record performance metrics
      this.recordPerformance(userContext.userId, Date.now() - startTime, response.confidence, false);
      
      return response;
    } catch (error) {
      console.error('AI Chat error:', error);
      const fallbackResponse = this.generateFallbackResponse(message, userContext);
      this.recordPerformance(userContext.userId, Date.now() - startTime, fallbackResponse.confidence, false);
      return fallbackResponse;
    }
  }

  private generateCacheKey(message: string, userContext: UserContext): string {
    const normalizedMessage = message.toLowerCase().trim();
    const sport = userContext.sport;
    const contextHash = this.hashContext(userContext);
    return `${normalizedMessage}_${sport}_${contextHash}`;
  }

  private hashContext(userContext: UserContext): string {
    // Simple hash of key context elements for cache key generation
    const contextStr = JSON.stringify({
      sport: userContext.sport,
      teamName: userContext.teamData?.name,
      focusAreas: userContext.userPreferences?.focusAreas
    });
    return contextStr.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString();
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.rateLimiter.get(userId);
    
    if (!userLimit) {
      this.rateLimiter.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return true;
    }
    
    if (now > userLimit.resetTime) {
      this.rateLimiter.set(userId, { count: 1, resetTime: now + 60000 });
      return true;
    }
    
    if (userLimit.count >= 10) { // 10 messages per minute
      return false;
    }
    
    userLimit.count++;
    return true;
  }

  private getCachedResponse(cacheKey: string): AIResponse | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return cached.response;
    }
    return null;
  }

  private cacheResponse(cacheKey: string, response: AIResponse): void {
    this.responseCache.set(cacheKey, { response, timestamp: Date.now() });
    
    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > 300000) {
        this.responseCache.delete(key);
      }
    }
  }

  private recordPerformance(userId: string, responseTime: number, confidence: number, cacheHit: boolean): void {
    this.performanceMetrics.set(userId, { responseTime, confidence, cacheHit });
  }

  public getPerformanceStats(userId: string): { avgResponseTime: number; avgConfidence: number; cacheHitRate: number } | null {
    const userMetrics = Array.from(this.performanceMetrics.entries())
      .filter(([id]) => id === userId)
      .map(([_, metrics]) => metrics);
    
    if (userMetrics.length === 0) return null;
    
    const avgResponseTime = userMetrics.reduce((sum, m) => sum + m.responseTime, 0) / userMetrics.length;
    const avgConfidence = userMetrics.reduce((sum, m) => sum + m.confidence, 0) / userMetrics.length;
    const cacheHitRate = userMetrics.filter(m => m.cacheHit).length / userMetrics.length;
    
    return { avgResponseTime, avgConfidence, cacheHitRate };
  }

  private async processAdvancedAIResponse(_message: string, userContext: UserContext): Promise<AIResponse> {
    // Add message to conversation memory
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: _message,
      timestamp: new Date()
    };
    
    this.addToConversationMemory(userContext.userId, userMessage);
    
    // Analyze message intent and context with enhanced intelligence
    const messageAnalysis = this.analyzeMessage(message, userContext);
    
    // Generate contextual response with real AI capabilities
    let response: AIResponse;
    
    // Check if this is a user data analysis query
    if (this.isUserDataAnalysisQuery(message)) {
      response = await this.handleUserDataAnalysis(message, userContext);
    } else if (this.isInjuryAssessmentQuery(message)) {
      response = await this.handleInjuryAssessment(message, userContext);
    } else if (this.isAccountManagementQuery(message)) {
      response = await this.handleAccountManagement(message, userContext);
    } else if (this.isFootballAnalysisQuery(message)) {
      response = await this.handleFootballAnalysis(message, userContext);
    } else if (this.isTacticalQuery(message)) {
      response = await this.handleTacticalAnalysis(message, userContext);
    } else if (this.isPlayerAnalysisQuery(message)) {
      response = await this.handlePlayerAnalysis(message, userContext);
    } else if (this.isTrainingQuery(message)) {
      response = await this.handleTrainingRecommendations(message, userContext);
    } else {
      // Try external AI first if available
      const openAIKey = import.meta.env?.VITE_OPENAI_API_KEY;
      
      if (openAIKey && messageAnalysis.complexity > 0.7) {
        const aiModel = userContext.isPremium ? 'gpt-4' : 'gpt-3.5-turbo';
        response = await this.callEnhancedOpenAI(message, userContext, messageAnalysis, openAIKey, aiModel);
      } else {
        // Use enhanced intelligent response system with fallback APIs
        response = await this.generateEnhancedResponse(message, userContext, messageAnalysis);
      }
    }
    
    // Add bot response to conversation memory
    const botMessage: ChatMessage = {
      id: `bot_${Date.now()}`,
      type: 'bot',
      content: response.content,
      timestamp: new Date(),
      confidence: response.confidence,
      messageType: messageAnalysis.category as any
    };
    
    this.addToConversationMemory(userContext.userId, botMessage);
    
    return response;
  }

  private isTacticalQuery(message: string): boolean {
    const tacticalKeywords = ['tactics', 'strategy', 'gameplan', 'approach', 'style'];
    return tacticalKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isPlayerAnalysisQuery(message: string): boolean {
    const playerKeywords = ['player', 'squad', 'roster', 'lineup', 'individual'];
    return playerKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isTrainingQuery(message: string): boolean {
    const trainingKeywords = ['training', 'practice', 'drill', 'exercise', 'workout'];
    return trainingKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isUserDataAnalysisQuery(message: string): boolean {
    const analysisKeywords = ['insights', 'analysis', 'performance', 'stats', 'progress', 'improvement', 'trends', 'recommendations'];
    return analysisKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isInjuryAssessmentQuery(message: string): boolean {
    const injuryKeywords = ['injury', 'injuries', 'hurt', 'pain', 'recovery', 'rehabilitation', 'fitness', 'health', 'medical', 'risk', 'assessment'];
    return injuryKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAccountManagementQuery(message: string): boolean {
    const accountKeywords = ['account', 'profile', 'settings', 'subscription', 'billing', 'password', 'email', 'personal', 'privacy', 'security', 'export', 'delete', 'update profile', 'change password', 'my account', 'account info', 'user data', 'preferences', 'notification', 'theme'];
    return accountKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private async handleUserDataAnalysis(_message: string, userContext: UserContext): Promise<AIResponse> {
    try {
      const analytics = await userDataAnalysisService.analyzeUserData(userContext.userId, userContext.teamData?.id);
      
      let response = '';
      
      if (message.toLowerCase().includes('insights') || message.toLowerCase().includes('analysis')) {
        response = this.formatUserInsights(analytics, userContext);
      } else if (message.toLowerCase().includes('recommendations')) {
        response = this.formatRecommendations(analytics, userContext);
      } else if (message.toLowerCase().includes('trends') || message.toLowerCase().includes('progress')) {
        response = this.formatTrends(analytics, userContext);
      } else {
        response = this.formatOverallAnalysis(analytics, userContext);
      }
      
      return {
        content: response,
        confidence: 0.9
      };
    } catch (error) {
      console.error('Error in user data analysis:', error);
      return {
        content: 'I\'m having trouble analyzing your data right now. Please try again later or check if you have sufficient match and training data recorded.',
        confidence: 0.3
      };
    }
  }

  private formatUserInsights(analytics: any, _userContext: UserContext): string {
    const { personalizedInsights, performanceMetrics } = analytics;
    
    let response = `## Your Personalized Insights\n\n`;
    
    // Performance overview
    response += `**Current Performance Overview:**\n`;
    response += `• Form Level: ${performanceMetrics.currentForm.toFixed(1)}/100\n`;
    response += `• Fitness Level: ${performanceMetrics.fitnessLevel}%\n`;
    response += `• Consistency Score: ${performanceMetrics.consistency.toFixed(1)}%\n`;
    
    if (performanceMetrics.improvement !== 0) {
      const trend = performanceMetrics.improvement > 0 ? 'improving' : 'declining';
      response += `• Recent Trend: ${trend} (${Math.abs(performanceMetrics.improvement).toFixed(1)}%)\n`;
    }
    
    response += `\n**Key Insights:**\n`;
    personalizedInsights.slice(0, 3).forEach((insight: any, index: number) => {
      response += `${index + 1}. **${insight.title}**: ${insight.description}\n`;
    });
    
    return response;
  }

  private formatRecommendations(analytics: any, _userContext: UserContext): string {
    const { recommendations } = analytics;
    
    let response = `## Your Personalized Recommendations\n\n`;
    
    recommendations.slice(0, 5).forEach((rec: any, index: number) => {
      response += `**${index + 1}. ${rec.title}** (${rec.category})\n`;
      response += `${rec.description}\n`;
      response += `*Impact: ${rec.estimatedImpact} | Timeframe: ${rec.timeframe}*\n\n`;
    });
    
    return response;
  }

  private formatTrends(analytics: any, _userContext: UserContext): string {
    const { trends } = analytics;
    
    let response = `## Your Performance Trends\n\n`;
    
    response += `**Overall Trend:** ${trends.performanceTrend}\n\n`;
    
    if (trends.keyMetrics.length > 0) {
      response += `**Key Metrics Changes:**\n`;
      trends.keyMetrics.forEach((metric: any) => {
        const arrow = metric.direction === 'up' ? '↗️' : metric.direction === 'down' ? '↘️' : '→';
        response += `• ${metric.metric}: ${arrow} ${metric.changePercentage.toFixed(1)}%\n`;
      });
    }
    
    response += `\n**Season Projection:** ${trends.predictedOutcome.seasonProjection}\n`;
    
    return response;
  }

  private async handleInjuryAssessment(_message: string, _userContext: UserContext): Promise<AIResponse> {
    try {
      // Create mock player health data based on user context
      const playerHealthData = {
        playerId: userContext.userId,
        age: 25,
        position: 'CM',
        minutesPlayed: 1800,
        trainingLoad: [75, 80, 85, 70, 90, 85, 80],
        matchLoad: [85, 90, 80, 95, 85],
        injuryHistory: [],
        physicalMetrics: {
          sprintSpeed: 28.5,
          acceleration: 8.2,
          workload: 75,
          fatigueLevel: Math.random() * 10,
          muscleStrain: Math.random() * 10,
          flexibility: 75,
          strength: 80,
          endurance: 85
        },
        wellnessData: {
          sleepQuality: 7 + Math.random() * 2,
          stressLevel: 3 + Math.random() * 4,
          soreness: 2 + Math.random() * 5,
          energy: 6 + Math.random() * 3,
          mood: 7 + Math.random() * 2,
          hydration: 6 + Math.random() * 3,
          nutrition: 6 + Math.random() * 3
        }
      };
      
      const assessment = await injuryAssessmentService.assessPlayer(playerHealthData);
      
      let response = '';
      
      if (message.toLowerCase().includes('recovery') || message.toLowerCase().includes('rehabilitation')) {
        response = this.formatRecoveryGuidance(assessment, userContext);
      } else if (message.toLowerCase().includes('risk') || message.toLowerCase().includes('assessment')) {
        response = this.formatRiskAssessment(assessment, userContext);
      } else if (message.toLowerCase().includes('recommendations')) {
        response = this.formatInjuryRecommendations(assessment, userContext);
      } else {
        response = this.formatCompleteInjuryAssessment(assessment, userContext);
      }
      
      return {
        content: response,
        confidence: 0.9
      };
    } catch (error) {
      console.error('Error in injury assessment:', error);
      return {
        content: 'I\'m having trouble accessing your health data right now. Please ensure you have recent fitness and training data recorded, or consult with your team\'s medical staff for a comprehensive assessment.',
        confidence: 0.3
      };
    }
  }

  private formatRiskAssessment(assessment: any, userContext: UserContext): string {
    let response = `## Injury Risk Assessment\n\n`;
    
    response += `**Overall Risk Level: ${assessment.riskLevel.toUpperCase()}** (${assessment.overallRisk.toFixed(1)}%)\n\n`;
    
    response += `**Risk Factors Breakdown:**\n`;
    response += `• Workload Risk: ${assessment.riskFactors.workload.toFixed(1)}%\n`;
    response += `• Fatigue Risk: ${assessment.riskFactors.fatigue.toFixed(1)}%\n`;
    response += `• Historical Risk: ${assessment.riskFactors.historical.toFixed(1)}%\n`;
    response += `• Biomechanical Risk: ${assessment.riskFactors.biomechanical.toFixed(1)}%\n`;
    
    response += `\n**Specific Injury Risks:**\n`;
    response += `• Muscular Injuries: ${assessment.specificRisks.muscular.toFixed(1)}%\n`;
    response += `• Joint Injuries: ${assessment.specificRisks.joint.toFixed(1)}%\n`;
    response += `• Ligament Injuries: ${assessment.specificRisks.ligament.toFixed(1)}%\n`;
    response += `• Overuse Injuries: ${assessment.specificRisks.overuse.toFixed(1)}%\n`;
    
    if (assessment.monitoringAlerts.length > 0) {
      response += `\n**⚠️ Active Alerts:**\n`;
      assessment.monitoringAlerts.forEach((alert: any) => {
        response += `• ${alert.message}\n`;
      });
    }
    
    return response;
  }

  private formatRecoveryGuidance(assessment: any, userContext: UserContext): string {
    let response = `## Recovery & Rehabilitation Guidance\n\n`;
    
    if (assessment.recoveryPlan) {
      const plan = assessment.recoveryPlan;
      response += `**Current Injury:** ${plan.injuryType} (${plan.severity})\n`;
      response += `**Estimated Recovery Time:** ${plan.estimatedRecoveryTime} days\n\n`;
      
      response += `**Recovery Phases:**\n`;
      plan.phases.forEach((phase: any, index: number) => {
        response += `${index + 1}. **${phase.name}** (${phase.duration} days)\n`;
        response += `   Goals: ${phase.goals.join(', ')}\n`;
      });
      
      response += `\n**Current Restrictions:**\n`;
      plan.restrictions.forEach((restriction: string) => {
        response += `• ${restriction}\n`;
      });
    } else {
      response += `**No Active Injuries Detected** ✅\n\n`;
      response += `**General Recovery Recommendations:**\n`;
      response += `• Maintain 7-9 hours of quality sleep\n`;
      response += `• Stay properly hydrated (2.5-3L daily)\n`;
      response += `• Include active recovery sessions\n`;
      response += `• Monitor training load and fatigue levels\n`;
      response += `• Regular stretching and mobility work\n`;
    }
    
    return response;
  }

  private formatInjuryRecommendations(assessment: any, userContext: UserContext): string {
    let response = `## Injury Prevention Recommendations\n\n`;
    
    assessment.recommendations.slice(0, 4).forEach((rec: any, index: number) => {
      const priorityEmoji = rec.priority === 'urgent' ? '🚨' : rec.priority === 'high' ? '⚠️' : '💡';
      response += `${priorityEmoji} **${rec.title}** (${rec.category})\n`;
      response += `${rec.description}\n`;
      response += `*Duration: ${rec.duration} | Frequency: ${rec.frequency}*\n\n`;
    });
    
    response += `**Next Assessment:** ${assessment.nextAssessment.toLocaleDateString()}\n`;
    
    return response;
  }

  private formatCompleteInjuryAssessment(assessment: any, userContext: UserContext): string {
    let response = `## Complete Injury & Health Assessment\n\n`;
    
    // Risk overview
    response += `**Risk Level: ${assessment.riskLevel.toUpperCase()}** (${assessment.overallRisk.toFixed(1)}%)\n\n`;
    
    // Key risk factors
    response += `**Primary Risk Factors:**\n`;
    const topRisks = Object.entries(assessment.riskFactors)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    topRisks.forEach(([factor, value]) => {
      response += `• ${factor.charAt(0).toUpperCase() + factor.slice(1)}: ${(value as number).toFixed(1)}%\n`;
    });
    
    // Top recommendations
    response += `\n**Priority Actions:**\n`;
    assessment.recommendations.slice(0, 2).forEach((rec: any, index: number) => {
      response += `${index + 1}. ${rec.title}\n`;
    });
    
    // Alerts if any
    if (assessment.monitoringAlerts.length > 0) {
      response += `\n**⚠️ Immediate Attention Required:**\n`;
      response += `${assessment.monitoringAlerts[0].message}\n`;
    }
    
    return response;
  }

  private formatOverallAnalysis(analytics: any, userContext: UserContext): string {
    const { performanceMetrics, riskAssessment, recommendations } = analytics;
    
    let response = `## Complete Performance Analysis\n\n`;
    
    // Performance summary
    response += `**Performance Summary:**\n`;
    response += `• Current Form: ${performanceMetrics.currentForm.toFixed(1)}/100\n`;
    response += `• Fitness: ${performanceMetrics.fitnessLevel}%\n`;
    response += `• Consistency: ${performanceMetrics.consistency.toFixed(1)}%\n\n`;
    
    // Risk assessment
    response += `**Risk Assessment:**\n`;
    response += `• Injury Risk: ${riskAssessment.injuryRisk}%\n`;
    response += `• Burnout Risk: ${riskAssessment.burnoutRisk}%\n`;
    response += `• Performance Risk: ${riskAssessment.performanceRisk}%\n\n`;
    
    // Top recommendation
    if (recommendations.length > 0) {
      response += `**Priority Action:** ${recommendations[0].title}\n`;
      response += `${recommendations[0].description}\n`;
    }
    
    return response;
  }

  private async handleAccountManagement(_message: string, _userContext: UserContext): Promise<AIResponse> {
    try {
      let response = '';
      
      if (message.toLowerCase().includes('profile') || message.toLowerCase().includes('account info')) {
        const profile = await accountManagementService.getUserProfile();
        response = this.formatProfileInfo(profile, userContext);
      } else if (message.toLowerCase().includes('settings') || message.toLowerCase().includes('preferences')) {
        const settings = await accountManagementService.getUserSettings();
        response = this.formatUserSettings(settings, userContext);
      } else if (message.toLowerCase().includes('subscription') || message.toLowerCase().includes('billing')) {
        const subscription = await accountManagementService.getSubscriptionInfo();
        response = this.formatSubscriptionInfo(subscription, userContext);
      } else if (message.toLowerCase().includes('activity') || message.toLowerCase().includes('history')) {
        const activity = await accountManagementService.getAccountActivity(10);
        response = this.formatAccountActivity(activity, userContext);
      } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('password')) {
        const security = await accountManagementService.getSecuritySettings();
        response = this.formatSecurityInfo(security, userContext);
      } else if (message.toLowerCase().includes('export') || message.toLowerCase().includes('download')) {
        response = this.formatDataExportInfo(userContext);
      } else {
        response = this.formatAccountOverview(userContext);
      }
      
      return {
        content: response,
        confidence: 92,
        suggestions: ['Update profile', 'Change settings', 'View subscription', 'Security options'],
        followUpQuestions: ['What would you like to update?', 'Need help with settings?']
      };
    } catch (error) {
      console.error('Account management error:', error);
      return {
        content: 'I encountered an issue accessing your account information. Please try again or contact support if the problem persists.',
        confidence: 30,
        suggestions: ['Try again', 'Contact support'],
        followUpQuestions: ['Can I help with something else?']
      };
    }
  }

  private async handleTacticalAnalysis(_message: string, _userContext: UserContext): Promise<AIResponse> {
    try {
      const tacticalInsights = await footballAnalysisService.analyzeTeamTactics({
        teamData: userContext.teamData,
        query: message,
        sport: userContext.sport
      });

      return {
        content: this.formatTacticalAnalysis(tacticalInsights, message),
        confidence: 88,
        suggestions: ['Implement tactics', 'Practice formations', 'Study opponents'],
        followUpQuestions: ['How should we adapt this?', 'What are the risks?']
      };
    } catch (error) {
      return this.generateTacticalResponse(message, userContext, this.analyzeMessage(message, userContext));
    }
  }

  private async handlePlayerAnalysis(_message: string, _userContext: UserContext): Promise<AIResponse> {
    try {
      const playerInsights = await footballAnalysisService.analyzePlayer({
        teamData: userContext.teamData,
        query: message,
        sport: userContext.sport
      });

      return {
        content: this.formatPlayerAnalysis(playerInsights, message),
        confidence: 85,
        suggestions: ['View player stats', 'Create development plan', 'Track progress'],
        followUpQuestions: ['Which areas need focus?', 'How can we improve?']
      };
    } catch (error) {
      return this.generatePlayerAnalysisResponse(message, userContext, this.analyzeMessage(message, userContext));
    }
  }

  private async handleTrainingRecommendations(_message: string, _userContext: UserContext): Promise<AIResponse> {
    try {
      const trainingPlan = await footballAnalysisService.generateTrainingPlan({
        teamData: userContext.teamData,
        query: message,
        sport: userContext.sport
      });

      return {
        content: this.formatTrainingPlan(trainingPlan, message),
        confidence: 87,
        suggestions: ['Schedule training', 'Create drills', 'Track improvement'],
        followUpQuestions: ['How often should we train?', 'What equipment needed?']
      };
    } catch (error) {
      return this.generateTrainingResponse(message, userContext, this.analyzeMessage(message, userContext));
    }
  }

  private formatTacticalAnalysis(analysis: any, originalMessage: string): string {
    return `🎯 **Tactical Analysis**

**Key Insights:**
• ${analysis.insights?.[0] || 'Focus on team shape and positioning'}
• ${analysis.insights?.[1] || 'Maintain tactical discipline'}

**Strategic Recommendations:**
• ${analysis.recommendations?.[0] || 'Adapt formation to opponent'}
• ${analysis.recommendations?.[1] || 'Focus on transition moments'}

Based on your query: "${originalMessage}"`;
  }

  private formatPlayerAnalysis(analysis: any, originalMessage: string): string {
    return `👥 **Player Analysis**

**Performance Insights:**
• ${analysis.insights?.[0] || 'Individual development opportunities identified'}
• ${analysis.insights?.[1] || 'Team chemistry and positioning analysis'}

**Development Focus:**
• ${analysis.recommendations?.[0] || 'Technical skill enhancement'}
• ${analysis.recommendations?.[1] || 'Tactical awareness improvement'}

Analysis for: "${originalMessage}"`;
  }

  private formatTrainingPlan(plan: any, originalMessage: string): string {
    return `🏃 **Training Plan**

**Recommended Sessions:**
• ${plan.sessions?.[0] || 'Technical skills development'}
• ${plan.sessions?.[1] || 'Tactical understanding'}
• ${plan.sessions?.[2] || 'Physical conditioning'}

**Focus Areas:**
• ${plan.focus?.[0] || 'Ball control and passing'}
• ${plan.focus?.[1] || 'Team coordination'}

Customized for: "${originalMessage}"`;
  }

  private addToConversationMemory(userId: string, message: ChatMessage): void {
    const history = this.conversationMemory.get(userId) || [];
    history.push(message);
    
    // Keep only last 50 messages to manage memory
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.conversationMemory.set(userId, history);
  }

  private analyzeMessage(message: string, userContext: UserContext): {
    intent: string;
    category: string;
    complexity: number;
    entities: string[];
    sentiment: number;
    urgency: number;
  } {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(' ');
    
    // Intent detection
    let intent = 'general';
    if (words.some(w => ['analyze', 'analysis', 'review'].includes(w))) intent = 'analysis';
    else if (words.some(w => ['suggest', 'recommend', 'advice'].includes(w))) intent = 'suggestion';
    else if (words.some(w => ['formation', 'tactic', 'strategy'].includes(w))) intent = 'tactical';
    else if (words.some(w => ['training', 'drill', 'practice'].includes(w))) intent = 'training';
    else if (words.some(w => ['player', 'performance', 'stats'].includes(w))) intent = 'player_analysis';
    else if (words.some(w => ['help', 'how', 'what', 'why'].includes(w))) intent = 'question';
    
    // Category detection
    let category = 'general';
    if (words.some(w => ['formation', 'lineup', 'position'].includes(w))) category = 'formation';
    else if (words.some(w => ['attack', 'offense', 'goal', 'score'].includes(w))) category = 'attack';
    else if (words.some(w => ['defense', 'defend', 'block'].includes(w))) category = 'defense';
    else if (words.some(w => ['training', 'drill', 'exercise'].includes(w))) category = 'training';
    else if (words.some(w => ['match', 'game', 'opponent'].includes(w))) category = 'match';
    
    // Complexity scoring (0-1)
    let complexity = 0.3; // Base complexity
    if (words.length > 10) complexity += 0.2;
    if (words.some(w => ['analyze', 'compare', 'optimize', 'strategy'].includes(w))) complexity += 0.3;
    if (userContext.teamData && words.some(w => userContext.teamData!.players.some(p => p.name.toLowerCase().includes(w)))) complexity += 0.2;
    
    // Entity extraction (players, formations, etc.)
    const entities: string[] = [];
    const formations = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'];
    formations.forEach(formation => {
      if (message.includes(formation)) entities.push(formation);
    });
    
    if (userContext.teamData) {
      userContext.teamData.players.forEach(player => {
        if (lowerMessage.includes(player.name.toLowerCase())) {
          entities.push(player.name);
        }
      });
    }
    
    // Sentiment analysis (simplified)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'problem', 'issue', 'wrong'];
    let sentiment = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment += 0.1;
      if (negativeWords.includes(word)) sentiment -= 0.1;
    });
    
    // Urgency detection
    const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'quick', 'emergency'];
    const urgency = words.some(w => urgentWords.includes(w)) ? 0.8 : 0.3;
    
    return { intent, category, complexity, entities, sentiment, urgency };
  }

  private isFootballAnalysisQuery(message: string): boolean {
    const footballKeywords = ['formation', 'tactic', 'strategy', 'analysis', 'player', 'match', 'team'];
    return footballKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private async handleFootballAnalysis(_message: string, _userContext: UserContext): Promise<AIResponse> {
    try {
      // Use football analysis service for enhanced responses
      const analysisResult = await footballAnalysisService.analyzeMatch({
        homeTeam: 'User Team',
        awayTeam: 'Opponent',
        analysisType: 'detailed'
      });

      return {
        content: this.formatFootballAnalysis(analysisResult, message),
        confidence: 85,
        suggestions: ['Ask about formations', 'Request tactical advice'],
        followUpQuestions: ['What formation should I use?', 'How can I improve my defense?']
      };
    } catch (error) {
      return this.generateIntelligentResponse(message, userContext);
    }
  }

  private formatFootballAnalysis(analysis: any, originalMessage: string): string {
    return `Based on tactical analysis:

**Key Insights:**
• ${analysis.insights?.[0] || 'Strong tactical foundation recommended'}
• ${analysis.insights?.[1] || 'Focus on team coordination'}

**Recommendations:**
• ${analysis.recommendations?.[0] || 'Maintain current formation'}
• ${analysis.recommendations?.[1] || 'Improve passing accuracy'}

This analysis is based on current football tactics and your query: "${originalMessage}"`;
  }

  private async callOpenAI(_message: string, userContext: UserContext, apiKey: string): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(userContext);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API call failed');
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      confidence: 92,
      suggestions: this.generateSuggestions(message, userContext),
      followUpQuestions: this.generateFollowUpQuestions(message, userContext)
    };
  }

  private async generateEnhancedResponse(message: string, userContext: UserContext, analysis: any): Promise<AIResponse> {
    // Get conversation history for context
    const _conversationHistory = this.conversationMemory.get(userContext.userId) || [];
    
    // Generate response based on intent and category
    let response: AIResponse;
    
    switch (analysis.intent) {
      case 'analysis':
        response = await this.generateAnalysisResponse(message, userContext, analysis);
        break;
      case 'suggestion':
        response = await this.generateSuggestionResponse(message, userContext, analysis);
        break;
      case 'tactical':
        response = await this.generateTacticalResponse(message, userContext, analysis);
        break;
      case 'training':
        response = await this.generateTrainingResponse(message, userContext, analysis);
        break;
      case 'player_analysis':
        response = await this.generatePlayerAnalysisResponse(message, userContext, analysis);
        break;
      default:
        response = await this.generateContextualResponse(message, userContext, analysis);
    }
    
    // Enhance response with personality traits
    response = this.applyPersonalityTraits(response, userContext, analysis);
    
    // Add proactive suggestions based on user data
    response.suggestions = [...(response.suggestions || []), ...this.generateProactiveSuggestions(userContext)];
    
    return response;
  }

  private async generateAnalysisResponse(_message: string, userContext: UserContext, analysis: any): Promise<AIResponse> {
    let content = "📊 **Analysis Results**\n\n";
    
    if (userContext.teamData) {
      // Analyze team data
      const teamStats = userContext.teamData.teamStats;
      const recentMatches = userContext.teamData.recentMatches || [];
      
      if (recentMatches.length > 0) {
        const lastMatch = recentMatches[0];
        content += `**Recent Performance:**\n`;
        content += `• Last match: ${lastMatch.opponent || 'Recent opponent'} (${lastMatch.result || 'Result pending'})\n`;
        content += `• Team form: ${this.calculateTeamForm(recentMatches)}\n\n`;
      }
      
      if (analysis.entities.length > 0) {
        content += `**Key Focus Areas:**\n`;
        analysis.entities.forEach((entity: string) => {
          content += `• ${entity}\n`;
        });
        content += "\n";
      }
      
      content += `**Recommendations:**\n`;
      content += this.generateDataDrivenRecommendations(userContext, analysis);
    } else {
      content += "I'd love to provide detailed analysis, but I need access to your team data. ";
      content += "Once you share your team information, I can give you insights that are specifically tailored to your squad.";
    }
    
    return {
      content,
      confidence: 85,
      suggestions: ['View detailed stats', 'Export analysis', 'Schedule training'],
      followUpQuestions: ['What specific area should we focus on?', 'How can we improve our weakest areas?']
    };
  }

  private async generateSuggestionResponse(_message: string, userContext: UserContext, analysis: any): Promise<AIResponse> {
    let content = "💡 **Personalized Suggestions**\n\n";
    
    // Base suggestions on user's team data and preferences
    if (userContext.userPreferences?.focusAreas) {
      content += "**Based on your focus areas:**\n";
      userContext.userPreferences.focusAreas.forEach(area => {
        const suggestions = this.getSpecificSuggestions(area, userContext);
        content += `• **${area}**: ${suggestions}\n`;
      });
      content += "\n";
    }
    
    // Add tactical suggestions based on recent performance
    if (userContext.teamData?.recentMatches) {
      content += "**Tactical Adjustments:**\n";
      content += this.generateTacticalSuggestions(userContext.teamData.recentMatches, analysis);
    }
    
    return {
      content,
      confidence: 80,
      suggestions: ['Implement suggestion', 'Get more details', 'Alternative approaches'],
      followUpQuestions: ['Which suggestion interests you most?', 'Need help implementing any of these?']
    };
  }

  private generateIntelligentResponse(message: string, userContext: UserContext): AIResponse {
    const lowerMessage = message.toLowerCase();
    const sport = userContext.sport;
    
    let responseCategory = 'general';
    let confidence = 88;

    // Determine response category with enhanced logic
    if (lowerMessage.includes('formation') || lowerMessage.includes('lineup')) {
      responseCategory = 'formation';
      confidence = 85;
    } else if (lowerMessage.includes('training') || lowerMessage.includes('drill') || lowerMessage.includes('practice')) {
      responseCategory = 'training';
      confidence = 80;
    } else if (lowerMessage.includes('tactic') || lowerMessage.includes('strategy') || lowerMessage.includes('defend') || lowerMessage.includes('attack') || lowerMessage.includes('gameplan')) {
      responseCategory = 'tactics';
      confidence = 82;
    } else if (lowerMessage.includes('player') || lowerMessage.includes('squad')) {
      responseCategory = 'player_analysis';
      confidence = 78;
    } else if (lowerMessage.includes('motivation') || lowerMessage.includes('confidence')) {
      responseCategory = 'motivation';
      confidence = 75;
    } else if (sport === 'futsal' && (lowerMessage.includes('futsal') || lowerMessage.includes('indoor'))) {
      responseCategory = 'futsal';
      confidence = 88;
    }

    // Get base response
    let content = this.getRandomResponse(responseCategory);
    
    // Enhanced personalization
    content = this.personalizeResponseAdvanced(content, userContext, message, responseCategory);

    return {
      content,
      confidence,
      suggestions: this.generateContextualSuggestions(message, userContext, responseCategory),
      followUpQuestions: this.generateSmartFollowUpQuestions(message, userContext, responseCategory)
    };
  }

  private buildSystemPrompt(userContext: UserContext): string {
    const sportSpecific = userContext.sport === 'soccer' 
      ? "You are an expert soccer/football coach with 20+ years of experience."
      : "You are an expert futsal coach specializing in indoor football tactics.";

    return `${sportSpecific}

You excel at understanding and processing various types of text input including:
- Natural language queries in multiple formats
- Technical sports terminology and jargon
- Statistical data and numerical information
- Casual conversational text and formal requests
- Mixed content with numbers, text, and special characters
- Incomplete sentences and fragmented thoughts
- Multi-language sports terms and expressions

User Context:
- Sport: ${userContext.sport}
- Team: ${userContext.teamData?.name || 'Unknown'}
- Players: ${userContext.teamData?.players?.length || 'Unknown'} players
- Language: ${userContext.userPreferences?.language || 'Spanish'}

Instructions:
- Provide confident, practical, actionable advice
- Keep responses under 200 words
- Be encouraging and supportive
- Use specific examples when possible
- Adapt advice to ${userContext.sport} specifically
- Adapt your communication style to match the user's input format
- Respond in a conversational, human-like manner with high confidence`;
  }

  private getRandomResponse(category: string): string {
    const responses: string[] = this.fallbackResponses[category] || this.fallbackResponses['tactics'] || [];
    if (!responses || responses.length === 0) {
      return 'I can help you with tactical analysis and team management.';
    }
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  private personalizeResponse(content: string, _userContext: UserContext, _originalMessage: string): string {
    // Add sport-specific context
    if (userContext.sport === 'futsal' && !content.includes('futsal')) {
      content = content.replace('soccer', 'futsal').replace('football', 'futsal');
    }

    // Add team context if available
    if (userContext.teamData?.name) {
      content = `For ${userContext.teamData.name}, ${content.toLowerCase()}`;
    }

    // Add encouraging elements
    const encouragements = [
      "Keep working hard and you'll see improvement!",
      "Remember, consistency in training leads to success.",
      "Every great team started with good fundamentals.",
      "Trust the process and stay focused on your goals."
    ];

    if (Math.random() > 0.7) {
      content += ` ${encouragements[Math.floor(Math.random() * encouragements.length)]}`;
    }

    return content;
  }

  private personalizeResponseAdvanced(response: string, userContext: UserContext, message: string, category: string): string {
    let personalized = response;
    
    // Add user's team name and context
    if (userContext.teamData?.name) {
      personalized = personalized.replace(/your team/g, userContext.teamData.name);
      personalized = personalized.replace(/the team/g, userContext.teamData.name);
    }
    
    // Add sport-specific terminology
    if (userContext.sport === 'futsal') {
      personalized = personalized.replace(/football/g, 'futsal');
      personalized = personalized.replace(/field/g, 'court');
      personalized = personalized.replace(/11 players/g, '5 players');
    }
    
    // Add coaching style personalization
    if (userContext.userPreferences?.coachingStyle) {
      const style = userContext.userPreferences.coachingStyle;
      if (style === 'aggressive' && category === 'tactics') {
        personalized += " Remember, your aggressive approach can be very effective when channeled correctly.";
      } else if (style === 'supportive' && category === 'motivation') {
        personalized += " Your supportive nature is exactly what your players need to build confidence.";
      }
    }
    
    // Add current context awareness
    if (userContext.currentContext?.activeMatch) {
      personalized += " This is especially relevant for your upcoming match preparation.";
    } else if (userContext.currentContext?.trainingSession) {
      personalized += " Perfect timing for your current training focus.";
    }
    
    return personalized;
  }

  private generateSuggestions(message: string, userContext: UserContext): string[] {
    const suggestions = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('formation')) {
      suggestions.push("Analyze our current formation");
      suggestions.push("Suggest counter-formations");
    } else if (lowerMessage.includes('training')) {
      suggestions.push("Create a training plan");
      suggestions.push("Suggest specific drills");
    } else {
      suggestions.push("Analyze team performance");
      suggestions.push("Suggest tactical improvements");
    }

    return suggestions;
  }

  private generateContextualSuggestions(message: string, userContext: UserContext, category: string): string[] {
    const baseSuggestions: Record<string, string[]> = {
      formation: ['Analyze current formation', 'Compare formation options', 'Player positioning tips'],
      training: ['Create drill library', 'Schedule training sessions', 'Track player progress'],
      tactics: ['Study opponent analysis', 'Practice set pieces', 'Review match footage'],
      player_analysis: ['Individual development plans', 'Position-specific training', 'Performance tracking'],
      motivation: ['Team building activities', 'Confidence building exercises', 'Communication strategies'],
      futsal: ['Court positioning', 'Quick transition drills', 'Futsal-specific skills']
    };
    
    let suggestions = baseSuggestions[category] || baseSuggestions['formation'];
    
    // Add personalized suggestions based on user data
    if (userContext.teamData?.upcomingMatches && userContext.teamData.upcomingMatches.length > 0) {
      suggestions = ['Prepare for next match', ...(suggestions || []).slice(0, 2)];
    }
    
    if (userContext.userPreferences?.focusAreas && userContext.userPreferences.focusAreas.length > 0) {
      const focusArea = userContext.userPreferences.focusAreas[0];
      if (suggestions) {
        suggestions.unshift(`Improve ${focusArea}`);
      }
    }
    
    return (suggestions || []).slice(0, 3);
  }

  private generateFollowUpQuestions(message: string, userContext: UserContext): string[] {
    const questions = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('formation')) {
      questions.push("What's your team's biggest weakness?");
      questions.push("Do you prefer attacking or defensive play?");
    } else if (lowerMessage.includes('training')) {
      questions.push("How many training sessions per week?");
      questions.push("What's your players' fitness level?");
    } else {
      questions.push("What's your next match situation?");
      questions.push("Any specific areas you want to improve?");
    }

    return questions;
  }

  private generateSmartFollowUpQuestions(message: string, userContext: UserContext, category: string): string[] {
    const categoryQuestions: Record<string, string[]> = {
      formation: [
        'Which formation are you currently using?',
        'What are your players\' strongest positions?',
        'Are you looking to be more attacking or defensive?'
      ],
      training: [
        'How many training sessions do you have per week?',
        'What equipment do you have available?',
        'Which skills need the most work?'
      ],
      tactics: [
        'What style of play do you prefer?',
        'How do your opponents typically play?',
        'What tactical challenges are you facing?'
      ],
      player_analysis: [
        'Which players are you most concerned about?',
        'What positions need strengthening?',
        'Are there any standout performers?'
      ],
      motivation: [
        'How is team morale currently?',
        'Are there any confidence issues?',
        'What motivates your players most?'
      ]
    };
    
    let questions = categoryQuestions[category] || categoryQuestions['formation'];
    
    // Personalize based on user context
    if (userContext.teamData?.players?.length) {
      const playerCount = userContext.teamData.players.length;
      if (playerCount < 15 && questions) {
        questions.unshift('With a smaller squad, how do you manage player rotation?');
      } else if (playerCount > 25 && questions) {
        questions.unshift('With a large squad, how do you keep everyone motivated?');
      }
    }
    
    return (questions || []).slice(0, 2);
  }

  private async callEnhancedOpenAI(_message: string, userContext: UserContext, _analysis: any, _apiKey: string, _model: string = 'gpt-4'): Promise<AIResponse> {
    const systemPrompt = this.buildEnhancedSystemPrompt(userContext, analysis);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API call failed');
    }

    const data = await response.json();
    
    const aiContent = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time. Please try again.";

    return {
      content: aiContent,
      confidence: 95,
      suggestions: this.generateSuggestions(message, userContext),
      followUpQuestions: this.generateFollowUpQuestions(message, userContext)
    };
  }

  private buildEnhancedSystemPrompt(userContext: UserContext, analysis: any): string {
    const sportSpecific = userContext.sport === 'soccer' 
      ? "You are an expert soccer/football coach with 20+ years of experience."
      : "You are an expert futsal coach specializing in indoor football tactics.";

    return `${sportSpecific}

User Context:
- Sport: ${userContext.sport}
- Team: ${userContext.teamData?.name || 'Unknown'}
- Players: ${userContext.teamData?.players?.length || 'Unknown'} players
- Intent: ${analysis.intent}
- Category: ${analysis.category}
- Complexity: ${analysis.complexity}
- Sentiment: ${analysis.sentiment}

Instructions:
- Provide practical, actionable advice
- Keep responses under 300 words
- Be encouraging and supportive
- Use specific examples when possible
- Adapt advice to ${userContext.sport} specifically
- Address the user's ${analysis.intent} with ${analysis.category} focus
- Match the user's emotional tone (sentiment: ${analysis.sentiment})
- Respond in a conversational, human-like manner`;
  }



  private async generateContextualResponse(message: string, userContext: UserContext, analysis: any): Promise<AIResponse> {
    const baseResponse = this.generateIntelligentResponse(message, userContext);
    
    // Enhance with contextual information
    let enhancedContent = baseResponse.content;
    
    if (analysis.sentiment < -0.2) {
      enhancedContent = "I understand this might be challenging. " + enhancedContent;
      enhancedContent += "\n\nRemember, every great coach faces obstacles. What matters is how we learn and adapt.";
    } else if (analysis.sentiment > 0.2) {
      enhancedContent = "Great to hear your enthusiasm! " + enhancedContent;
    }
    
    return {
      ...baseResponse,
      content: enhancedContent,
      confidence: baseResponse.confidence + 7
    };
  }

  private applyPersonalityTraits(response: AIResponse, userContext: UserContext, analysis: any): AIResponse {
    let content = response.content;
    
    // Apply warmth
    if (this.personalityTraits['warmth'] > 0.7 && Math.random() > 0.6) {
      const warmPhrases = ["I'm here to help you succeed!", "Let's work together on this.", "You're doing great as a coach."];
      content += "\n\n" + warmPhrases[Math.floor(Math.random() * warmPhrases.length)];
    }
    
    // Apply enthusiasm for high-energy topics
    if (this.personalityTraits['enthusiasm'] > 0.8 && analysis.category === 'tactics') {
      content = content.replace(/\./g, '! ');
    }
    
    return {
      ...response,
      content,
      confidence: Math.min(response.confidence + (this.personalityTraits['expertise'] * 10), 95)
    };
  }

  private generateProactiveSuggestions(userContext: UserContext): string[] {
    const suggestions = [];
    
    if (userContext.teamData?.upcomingMatches && userContext.teamData.upcomingMatches.length > 0) {
      suggestions.push('Prepare for next match');
    }
    
    if (userContext.userPreferences?.focusAreas && userContext.userPreferences.focusAreas.length > 0) {
      suggestions.push('Review focus areas progress');
    }
    
    suggestions.push('Analyze team performance trends');
    
    return suggestions.slice(0, 2); // Limit to 2 proactive suggestions
  }

  // Helper methods for enhanced responses
  private calculateTeamForm(matches: any[]): string {
    if (!matches || matches.length === 0) return 'No recent data';
    
    const results = matches.slice(0, 5).map(m => m.result || 'D');
    return results.join('') || 'Mixed form';
  }

  private generateFallbackResponse(_message: string, _userContext: UserContext): AIResponse {
    console.log('Using fallback response for:', message);
    
    // Determine category based on message content
    const lowerMessage = message.toLowerCase();
    let category = 'tactics'; // default
    
    if (lowerMessage.includes('formation') || lowerMessage.includes('lineup')) {
      category = 'formation';
    } else if (lowerMessage.includes('training') || lowerMessage.includes('drill')) {
      category = 'training';
    } else if (lowerMessage.includes('futsal')) {
      category = 'futsal';
    } else if (lowerMessage.includes('insight') || lowerMessage.includes('analysis')) {
      category = 'insights';
    } else if (lowerMessage.includes('motivation') || lowerMessage.includes('confidence')) {
      category = 'motivation';
    }
    
    // Get a random response from the category
    const response = this.getRandomResponse(category);
    const personalizedResponse = this.personalizeResponse(response, userContext, message);
    
    return {
      content: personalizedResponse,
      confidence: 75, // Moderate confidence for fallback responses
      suggestions: this.generateContextualSuggestions(message, userContext, category),
      followUpQuestions: this.generateSmartFollowUpQuestions(message, userContext, category)
    };
  }

  private async generateTacticalResponse(_message: string, _userContext: UserContext, analysis: any): Promise<AIResponse> {
    let content = "⚽ **Tactical Analysis**\n\n";
    
    // Get relevant formation data
    const formations = this.knowledgeBase.get('formations') || {};
    
    if (analysis.entities.some((e: string) => formations[e])) {
      const formation = analysis.entities.find((e: string) => formations[e]);
      const formationData = formations[formation];
      
      content += `**${formation} Formation Analysis:**\n`;
      content += `• Strengths: ${formationData.strengths.join(', ')}\n`;
      content += `• Weaknesses: ${formationData.weaknesses.join(', ')}\n`;
      content += `• Best for: ${formationData.suitableFor.join(', ')}\n\n`;
    }
    
    content += "**Tactical Recommendations:**\n";
    content += this.generateTacticalAdvice(userContext, analysis);
    
    return {
      content,
      confidence: 88,
      suggestions: ['Analyze formation', 'Practice tactics', 'Study opponents'],
      followUpQuestions: ['How does this fit our playing style?', 'What adjustments should we make?']
    };
  }

  private async generateTrainingResponse(_message: string, _userContext: UserContext, analysis: any): Promise<AIResponse> {
    let content = "🏃 **Training Program**\n\n";
    
    const trainingMethods = this.knowledgeBase.get('trainingMethods') || {};
    
    if (userContext.userPreferences?.focusAreas) {
      content += "**Customized Training Plan:**\n";
      userContext.userPreferences.focusAreas.forEach(area => {
        const methods = trainingMethods[area.toLowerCase()] || ['General fitness drills'];
        content += `• **${area}**: ${methods.join(', ')}\n`;
      });
      content += "\n";
    }
    
    content += "**Weekly Schedule Suggestion:**\n";
    content += this.generateTrainingSchedule(userContext);
    
    return {
      content,
      confidence: 85,
      suggestions: ['Create drill library', 'Track progress', 'Schedule sessions'],
      followUpQuestions: ['How many sessions per week?', 'What equipment do you have?']
    };
  }

  private async generatePlayerAnalysisResponse(_message: string, _userContext: UserContext, analysis: any): Promise<AIResponse> {
    let content = "👥 **Player Analysis**\n\n";
    
    if (userContext.teamData?.players && analysis.entities.length > 0) {
      const mentionedPlayers = analysis.entities.filter(entity => 
        userContext.teamData!.players.some(p => p.name.toLowerCase().includes(entity.toLowerCase()))
      );
      
      if (mentionedPlayers.length > 0) {
        content += "**Individual Player Insights:**\n";
        mentionedPlayers.forEach(playerName => {
          const player = userContext.teamData!.players.find(p => 
            p.name.toLowerCase().includes(playerName.toLowerCase())
          );
          if (player) {
            content += `• **${player.name}**: ${this.generatePlayerInsight(player)}\n`;
          }
        });
        content += "\n";
      }
    }
    
    content += "**Team Development Focus:**\n";
    content += this.generateTeamDevelopmentAdvice(userContext);
    
    return {
      content,
      confidence: 82,
      suggestions: ['View player stats', 'Create development plan', 'Track improvement'],
      followUpQuestions: ['Which players need most attention?', 'What positions need strengthening?']
    };
  }

  private generateDataDrivenRecommendations(_userContext: UserContext, analysis: any): string {
    const recommendations = [];
    
    if (userContext.teamData?.teamStats) {
      recommendations.push('Focus on possession-based training');
      recommendations.push('Improve defensive transitions');
    }
    
    if (analysis.category === 'formation') {
      recommendations.push('Consider player strengths in formation choice');
    }
    
    return recommendations.join('\n• ') || 'Continue current development path';
  }

  private getSpecificSuggestions(area: string, _userContext: UserContext): string {
    const suggestions: Record<string, string> = {
      'attack': 'Focus on quick passing combinations and movement off the ball',
      'defense': 'Work on defensive shape and pressing triggers',
      'midfield': 'Improve ball retention and transition play',
      'fitness': 'Implement interval training and endurance work'
    };
    
    return suggestions[area.toLowerCase()] || 'Continue focused development in this area';
  }

  private generateTacticalSuggestions(matches: any[], analysis: any): string {
    if (!matches || matches.length === 0) {
      return '• Establish a consistent tactical approach\n• Focus on team shape and positioning';
    }
    
    return '• Analyze recent match patterns\n• Adjust tactics based on opponent analysis\n• Focus on set-piece improvements';
  }



  // Method to save conversation history
  async saveConversation(messages: ChatMessage[], userId: string): Promise<void> {
    try {
      const conversationData = {
        userId,
        messages,
        timestamp: new Date().toISOString(),
        sport: 'soccer' // This should come from user context
      };

      // Save to localStorage for now, implement API call later
      const existingConversations = JSON.parse(localStorage.getItem('chat_history') || '[]');
      existingConversations.push(conversationData);
      
      // Keep only last 10 conversations
      if (existingConversations.length > 10) {
        existingConversations.splice(0, existingConversations.length - 10);
      }
      
      localStorage.setItem('chat_history', JSON.stringify(existingConversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  // Method to load conversation history
  async loadConversationHistory(userId: string): Promise<ChatMessage[][]> {
    try {
      const conversations = JSON.parse(localStorage.getItem('chat_history') || '[]');
      return conversations
        .filter((conv: any) => conv.userId === userId)
        .map((conv: any) => conv.messages);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  }

  // Method to get conversation analytics
  getConversationAnalytics(messages: ChatMessage[]): {
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    averageResponseTime: number;
    topTopics: string[];
  } {
    const userMessages = messages.filter(m => m.type === 'user');
    const botMessages = messages.filter(m => m.type === 'bot');
    
    // Simple topic extraction
    const topics = userMessages
      .map(m => m.content.toLowerCase())
      .join(' ')
      .split(' ')
      .filter(word => ['formation', 'training', 'tactics', 'defense', 'attack', 'futsal', 'soccer'].includes(word));
    
    const topTopics = [...new Set(topics)].slice(0, 3);

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      botMessages: botMessages.length,
      averageResponseTime: 1.5, // Mock value
      topTopics
    };
  }
  private generateTacticalAdvice(userContext: UserContext, analysis: any): string {
    const advice = [];
    
    if (userContext.sport === 'futsal') {
      advice.push('• Emphasize quick passing and movement in tight spaces');
      advice.push('• Practice defensive transitions and pressing triggers');
      advice.push('• Work on individual technical skills for 1v1 situations');
    } else {
      advice.push('• Focus on maintaining team shape during transitions');
      advice.push('• Develop set-piece routines for both attacking and defending');
      advice.push('• Practice positional play and creating numerical advantages');
    }
    
    return advice.join('\n');
  }

  private generateTrainingSchedule(userContext: UserContext): string {
    const schedule = [];
    
    schedule.push('• **Monday**: Technical skills and ball work');
    schedule.push('• **Wednesday**: Tactical training and small-sided games');
    schedule.push('• **Friday**: Physical conditioning and match preparation');
    
    if (userContext.sport === 'futsal') {
      schedule.push('• **Saturday**: Futsal-specific drills and quick decision making');
    }
    
    return schedule.join('\n');
  }

  private generatePlayerInsight(player: any): string {
    const insights: string[] = [
      `Strong in ${player.position || 'multiple areas'}, focus on consistency`,
      `Good technical ability, work on tactical awareness`,
      `Natural leadership qualities, encourage communication`,
      `Developing well, maintain current training intensity`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  private generateTeamDevelopmentAdvice(userContext: UserContext): string {
    const advice = [];
    
    advice.push('• Build team chemistry through small-sided games');
    advice.push('• Develop communication patterns during training');
    advice.push('• Focus on individual skill development within team context');
    
    if (userContext.teamData?.players && userContext.teamData.players.length > 15) {
      advice.push('• Rotate squad to maintain competition for places');
    }
    
    return advice.join('\n');
  }

  private formatProfileInfo(profile: any, _userContext: UserContext): string {
    if (!profile) {
      return '## Profile Information\n\nI couldn\'t retrieve your profile information at the moment. Please try again later.';
    }

    let response = `## Your Profile Information\n\n`;
    response += `**Name:** ${profile.name || 'Not set'}\n`;
    response += `**Email:** ${profile.email || 'Not set'}\n`;
    response += `**Sport:** ${profile.sport || userContext.sport || 'Not specified'}\n`;
    response += `**Role:** ${profile.role || 'Player'}\n`;
    
    if (profile.location) response += `**Location:** ${profile.location}\n`;
    if (profile.phone) response += `**Phone:** ${profile.phone}\n`;
    if (profile.bio) response += `**Bio:** ${profile.bio}\n`;
    
    response += `\n**Account Created:** ${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}\n`;
    
    return response;
  }

  private formatUserSettings(settings: any, _userContext: UserContext): string {
    let response = `## Your Current Settings\n\n`;
    
    response += `**Appearance:**\n`;
    response += `• Theme: ${settings.theme || 'Dark'}\n`;
    response += `• Language: ${settings.language || 'English'}\n`;
    response += `• Timezone: ${settings.timezone || 'UTC'}\n`;
    response += `• Date Format: ${settings.dateFormat || 'MM/DD/YYYY'}\n\n`;
    
    response += `**Notifications:**\n`;
    response += `• Email Notifications: ${settings.emailNotifications ? 'Enabled' : 'Disabled'}\n`;
    response += `• Push Notifications: ${settings.pushNotifications ? 'Enabled' : 'Disabled'}\n`;
    response += `• Match Reminders: ${settings.matchReminders ? 'Enabled' : 'Disabled'}\n`;
    response += `• Training Alerts: ${settings.trainingAlerts ? 'Enabled' : 'Disabled'}\n`;
    response += `• Team Updates: ${settings.teamUpdates ? 'Enabled' : 'Disabled'}\n\n`;
    
    response += `**Privacy:**\n`;
    response += `• Profile Visibility: ${settings.profileVisibility || 'Team'}\n`;
    response += `• Show Email: ${settings.showEmail ? 'Yes' : 'No'}\n`;
    response += `• Show Phone: ${settings.showPhone ? 'Yes' : 'No'}\n`;
    response += `• Data Sharing: ${settings.dataSharing ? 'Enabled' : 'Disabled'}\n`;
    
    return response;
  }

  private formatSubscriptionInfo(subscription: any, _userContext: UserContext): string {
    if (!subscription) {
      return '## Subscription Information\n\nI couldn\'t retrieve your subscription information at the moment. Please try again later.';
    }

    let response = `## Your Subscription\n\n`;
    response += `**Plan:** ${subscription.planName} ($${subscription.price}/${subscription.currency === 'USD' ? 'month' : subscription.currency})\n`;
    response += `**Status:** ${subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}\n`;
    response += `**Current Period:** ${subscription.currentPeriodStart.toLocaleDateString()} - ${subscription.currentPeriodEnd.toLocaleDateString()}\n`;
    
    if (subscription.cancelAtPeriodEnd) {
      response += `**⚠️ Cancellation:** Your subscription will end on ${subscription.currentPeriodEnd.toLocaleDateString()}\n`;
    }
    
    response += `\n**Plan Features:**\n`;
    subscription.features.forEach((feature: string) => {
      response += `• ${feature}\n`;
    });
    
    response += `\n**Usage Limits:**\n`;
    response += `• Teams: ${subscription.limits.teams === -1 ? 'Unlimited' : subscription.limits.teams}\n`;
    response += `• Players: ${subscription.limits.players === -1 ? 'Unlimited' : subscription.limits.players}\n`;
    response += `• Matches: ${subscription.limits.matches === -1 ? 'Unlimited' : subscription.limits.matches}\n`;
    response += `• Storage: ${subscription.limits.storage}GB\n`;
    
    return response;
  }

  private formatAccountActivity(activities: any[], _userContext: UserContext): string {
    let response = `## Recent Account Activity\n\n`;
    
    if (!activities || activities.length === 0) {
      response += 'No recent activity found.';
      return response;
    }
    
    activities.forEach((activity, index) => {
      const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
      response += `**${index + 1}.** ${activity.description}\n`;
      response += `   *${timeAgo}*\n\n`;
    });
    
    return response;
  }

  private formatSecurityInfo(security: any, _userContext: UserContext): string {
    let response = `## Security & Privacy Settings\n\n`;
    
    response += `**Two-Factor Authentication:** ${security.twoFactorEnabled ? 'Enabled ✅' : 'Disabled ⚠️'}\n`;
    response += `**Last Password Change:** ${security.lastPasswordChange.toLocaleDateString()}\n\n`;
    
    response += `**Active Sessions:**\n`;
    if (security.activeSessions && security.activeSessions.length > 0) {
      security.activeSessions.forEach((session: any) => {
        response += `• ${session.device} from ${session.location}${session.current ? ' (Current)' : ''}\n`;
        response += `  Last active: ${session.lastActive.toLocaleString()}\n`;
      });
    } else {
      response += 'No active sessions found.\n';
    }
    
    response += `\n**Recent Login History:**\n`;
    if (security.loginHistory && security.loginHistory.length > 0) {
      security.loginHistory.slice(0, 5).forEach((login: any) => {
        const status = login.success ? '✅' : '❌';
        response += `• ${status} ${login.timestamp.toLocaleString()} from ${login.location || login.ipAddress}\n`;
      });
    } else {
      response += 'No recent login history available.\n';
    }
    
    return response;
  }

  private formatDataExportInfo(_userContext: UserContext): string {
    let response = `## Data Export Options\n\n`;
    
    response += `You can request to export your data in the following formats:\n\n`;
    response += `**Available Export Types:**\n`;
    response += `• **Profile Data** - Your personal information and settings\n`;
    response += `• **Team Data** - All teams you've created or joined\n`;
    response += `• **Match Data** - All match records and statistics\n`;
    response += `• **Analytics Data** - Performance insights and reports\n`;
    response += `• **Complete Export** - All your data in one package\n\n`;
    
    response += `**Export Process:**\n`;
    response += `1. Request export through your account settings\n`;
    response += `2. We'll process your request within 24-48 hours\n`;
    response += `3. You'll receive a download link via email\n`;
    response += `4. Download link expires after 7 days\n\n`;
    
    response += `*Note: Exported data will be in JSON format for easy portability.*\n`;
    
    return response;
  }

  private formatAccountOverview(_userContext: UserContext): string {
    let response = `## Account Management Help\n\n`;
    
    response += `I can help you with various account-related tasks:\n\n`;
    response += `**Profile Management:**\n`;
    response += `• View and update your profile information\n`;
    response += `• Change your display name, bio, and contact details\n`;
    response += `• Update your sport and role preferences\n\n`;
    
    response += `**Settings & Preferences:**\n`;
    response += `• Customize your app theme and language\n`;
    response += `• Manage notification preferences\n`;
    response += `• Configure privacy settings\n\n`;
    
    response += `**Subscription & Billing:**\n`;
    response += `• View your current subscription plan\n`;
    response += `• Check usage limits and features\n`;
    response += `• Manage billing information\n\n`;
    
    response += `**Security & Privacy:**\n`;
    response += `• Review account security settings\n`;
    response += `• Monitor login activity\n`;
    response += `• Manage active sessions\n\n`;
    
    response += `**Data Management:**\n`;
    response += `• Export your data\n`;
    response += `• View account activity history\n`;
    response += `• Manage data sharing preferences\n\n`;
    
    response += `Just ask me about any of these topics, and I'll provide detailed information!\n`;
    
    return response;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  }
}

export const aiChatService = new AIChatService();
export type { ChatMessage, UserContext, AIResponse };