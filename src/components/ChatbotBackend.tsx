import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { footballAnalysisService } from '../services/footballAnalysisService';
import { emailService } from '../services/emailService';

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'analysis' | 'stats' | 'chart' | 'tutorial' | 'suggestion';
  data?: any;
  actions?: any[];
  rating?: number;
  feedback: string | undefined;
}

interface ChatbotContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  createSession: (title?: string) => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, type?: string) => Promise<ChatMessage>;
  sendSuggestion: (suggestion: string, context: string) => Promise<boolean>;
  rateMessage: (messageId: string, rating: number, feedback?: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  exportSession: (sessionId: string, format: 'json' | 'pdf') => Promise<string>;
  searchSessions: (query: string) => Promise<ChatSession[]>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load user sessions on mount
  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  const loadUserSessions = async () => {
    if (!user) return;

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('xyzcompany') || supabaseKey.includes('demo')) {
      // Use mock data when Supabase is not configured
      const mockSessions: ChatSession[] = [
        {
          id: 'demo-session-1',
          userId: user.id,
          title: 'Demo Chat Session',
          messages: [
            {
              id: 'demo-msg-1',
              sessionId: 'demo-session-1',
              type: 'bot',
              content: 'Welcome to the football analysis chatbot! Ask me about match analysis, player statistics, or predictions.',
              timestamp: new Date(),
              messageType: 'text'
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setSessions(mockSessions);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedSessions = data?.map(session => ({
        id: session.id,
        userId: session.user_id,
        title: session.title,
        messages: session.chat_messages?.map((msg: any) => ({
          id: msg.id,
          sessionId: msg.session_id,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          messageType: msg.message_type,
          data: msg.data,
          actions: msg.actions,
          rating: msg.rating,
          feedback: msg.feedback
        })) || [],
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
        metadata: session.metadata
      })) || [];

      setSessions(formattedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (title?: string): Promise<ChatSession> => {
    if (!user) throw new Error('User not authenticated');

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('xyzcompany') || supabaseKey.includes('demo')) {
      // Create mock session when Supabase is not configured
      const newSession: ChatSession = {
        id: `demo-session-${Date.now()}`,
        userId: user.id,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    }
    try {
      setIsLoading(true);
      const sessionTitle = title || `Chat ${new Date().toLocaleDateString()}`;
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: sessionTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        metadata: data.metadata
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: string): Promise<void> => {
    try {
      setIsLoading(true);
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      } else {
        // Load from database if not in memory
        const { data, error } = await supabase
          .from('chat_sessions')
          .select(`
            *,
            chat_messages (*)
          `)
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        const loadedSession: ChatSession = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          messages: data.chat_messages?.map((msg: any) => ({
            id: msg.id,
            sessionId: msg.session_id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            messageType: msg.message_type,
            data: msg.data,
            actions: msg.actions,
            rating: msg.rating,
            feedback: msg.feedback
          })) || [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          metadata: data.metadata
        };

        setCurrentSession(loadedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, type: string = 'text'): Promise<ChatMessage> => {
    if (!currentSession || !user) throw new Error('No active session');

    try {
      setIsLoading(true);

      // Save user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        sessionId: currentSession.id,
        type: 'user',
        content,
        timestamp: new Date(),
        messageType: 'text'
      };

      await saveMessage(userMessage);

      // Process message and generate bot response
      const botResponse = await processUserMessage(content, type);
      await saveMessage(botResponse);

      // Update current session
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage, botResponse],
        updatedAt: new Date()
      } : null);

      // Update session in sessions list
      setSessions(prev => prev.map(session => 
        session.id === currentSession.id 
          ? { ...session, messages: [...session.messages, userMessage, botResponse], updatedAt: new Date() }
          : session
      ));

      return botResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendSuggestion = async (suggestion: string, context: string): Promise<boolean> => {
    try {
      const result = await emailService.sendSuggestionEmail(suggestion, user, context);
      return result.success;
    } catch (error) {
      console.error('Failed to send suggestion:', error);
      return false;
    }
  };

  const saveMessage = async (message: ChatMessage): Promise<void> => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('xyzcompany') || supabaseKey.includes('demo')) {
      // Skip saving to database when Supabase is not configured
      return;
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        session_id: message.sessionId,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        message_type: message.messageType,
        data: message.data,
        actions: message.actions,
        rating: message.rating,
        feedback: message.feedback
      });

    if (error) throw error;
  };

  const processUserMessage = async (content: string): Promise<ChatMessage> => {
    // AI message processing logic
    const lowerContent = content.toLowerCase();
    
    let response: ChatMessage = {
      id: `bot_${Date.now()}`,
      sessionId: currentSession!.id,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      messageType: 'text'
    };

    try {
      if (lowerContent.includes('analyze') && (lowerContent.includes('match') || lowerContent.includes('game'))) {
        // Extract team names from the message
        const teams = extractTeamNames(content);
        const analysisData = await footballAnalysisService.analyzeMatch({
          homeTeam: teams.home || 'Team A',
          awayTeam: teams.away || 'Team B',
          analysisType: 'detailed'
        });

        response = {
          ...response,
          content: `Here's the detailed analysis for ${analysisData.teams.home} vs ${analysisData.teams.away}:`,
          messageType: 'analysis',
          data: analysisData,
          actions: [
            // {
            //   id: 'export_pdf',
            //   label: 'Export as PDF',
            //   type: 'download',
            //   action: () => footballAnalysisService.exportAnalysis(analysisData, 'pdf')
            // },
            {
              id: 'share_analysis',
              label: 'Share Analysis',
              type: 'button',
              action: () => shareAnalysis(analysisData)
            }
          ]
        };
      } else if (lowerContent.includes('stats') || lowerContent.includes('statistics')) {
        const playerName = extractPlayerName(content);
        const playerStats = await footballAnalysisService.getPlayerStats({
          playerName: playerName || 'Lionel Messi'
        });

        response = {
          ...response,
          content: `Here are the latest statistics for ${playerName || 'top players'}:`,
          messageType: 'stats',
          data: { players: playerStats }
        };
      } else if (lowerContent.includes('predict') || lowerContent.includes('prediction')) {
        const teams = extractTeamNames(content);
        const predictions = await footballAnalysisService.getPredictions({
          homeTeam: teams.home || 'Team A',
          awayTeam: teams.away || 'Team B',
          venue: 'home',
          historicalData: true
        });

        response = {
          ...response,
          content: `Here are my predictions for ${teams.home || 'Team A'} vs ${teams.away || 'Team B'}:`,
          messageType: 'analysis',
          data: { predictions }
        };
      } else if (lowerContent.includes('help') || lowerContent.includes('tutorial')) {
        response = {
          ...response,
          content: 'I can help you with:\n\n• Match Analysis - "Analyze Real Madrid vs Barcelona"\n• Player Statistics - "Show me Messi\'s stats"\n• Tactical Breakdowns - "Tactical analysis of the last El Clasico"\n• Predictions - "Predict Manchester City vs Liverpool"\n• League Standings - "Show Premier League table"\n\nWhat would you like to explore?',
          actions: [
            {
              id: 'start_tutorial',
              label: 'Start Tutorial',
              type: 'button',
              action: () => {}
            }
          ]
        };
      } else {
        // General AI response
        response = {
          ...response,
          content: `I understand you're asking about "${content}". I can help you with football analysis, player statistics, match predictions, and tactical insights. Try asking me to analyze a specific match or show player statistics for more detailed information.`,
          actions: [
            {
              id: 'suggest_analysis',
              label: 'Analyze a Match',
              type: 'button',
              action: () => {}
            },
            {
              id: 'suggest_stats',
              label: 'Player Statistics',
              type: 'button',
              action: () => {}
            }
          ]
        };
      }
    } catch (error) {
      response = {
        ...response,
        content: 'I understand your question about football analysis. Let me provide you with some insights based on the available data and tactical knowledge.',
        messageType: 'text'
      };
    }

    return response;
  };

  const extractTeamNames = (content: string): { home?: string; away?: string } => {
    // Simple team name extraction - in production, use more sophisticated NLP
    const vsPattern = /(\w+(?:\s+\w+)*)\s+(?:vs|v|against)\s+(\w+(?:\s+\w+)*)/i;
    const match = content.match(vsPattern);
    
    if (match) {
      return { home: match[1].trim(), away: match[2].trim() };
    }

    // Common team names
    const teams = ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'PSG', 'Bayern Munich'];
    const foundTeam = teams.find(team => content.toLowerCase().includes(team.toLowerCase()));
    
    return foundTeam ? { home: foundTeam } : {};
  };

  const extractPlayerName = (content: string): string | null => {
    // Simple player name extraction
    const players = ['Messi', 'Ronaldo', 'Mbappé', 'Haaland', 'Neymar', 'Benzema'];
    return players.find(player => content.toLowerCase().includes(player.toLowerCase())) || null;
  };

  const shareAnalysis = (data: any) => {
    // Mock share functionality
    if (data && data.teams) {
      const shareText = `Check out this football analysis: ${data.teams.home} vs ${data.teams.away}`;
      navigator.clipboard.writeText(shareText);
    }
  };

  const rateMessage = async (messageId: string, rating: number, feedback?: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ rating, feedback })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? { ...msg, rating, feedback } : msg
          )
        } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate message');
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const exportSession = async (sessionId: string, format: 'json' | 'pdf'): Promise<string> => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const exportData = {
        session,
        exportedAt: new Date().toISOString(),
        format
      };

      // In production, generate actual files
      return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export session');
      throw err;
    }
  };

  const searchSessions = async (query: string): Promise<ChatSession[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .ilike('title', `%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.map(session => ({
        id: session.id,
        userId: session.user_id,
        title: session.title,
        messages: [],
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
        metadata: session.metadata
      })) || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search sessions');
      return [];
    }
  };

  const value: ChatbotContextType = {
    sessions,
    currentSession,
    isLoading,
    error,
    createSession,
    loadSession,
    sendMessage,
    sendSuggestion,
    rateMessage,
    deleteSession,
    exportSession,
    searchSessions
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};