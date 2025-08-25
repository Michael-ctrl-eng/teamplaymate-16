import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from 'react';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SportProvider, useSport } from "./contexts/SportContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

import { DatabaseProvider } from "./contexts/DatabaseContext";
import { ChatbotProvider } from "./components/ChatbotBackend";
import { SportSelectionModal } from "./components/SportSelectionModal";
import ResponsiveLayout from "./components/ResponsiveLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import SelectSport from "./pages/SelectSport";
import Blog from "./pages/Blog";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import ValorantAnalysis from "./pages/ValorantAnalysis";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import GeneralStats from "./pages/GeneralStats";
import Attendance from "./pages/Attendance";
import ManualActions from "./pages/ManualActions";
import CommandTable from "./pages/CommandTable";
import TacticalChat from "./pages/TacticalChat";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import CommunityHub from "./pages/CommunityHub";
import DatabaseStatusPage from "./pages/DatabaseStatusPage";
import GoogleCallback from "./pages/GoogleCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PayPalPayment from "./pages/PayPalPayment";
import TestPage from "./pages/TestPage";
import PlayerManagement from "./pages/PlayerManagement";
import MatchTracking from "./pages/MatchTracking";
import TeamManagement from "./pages/TeamManagement";
import AIAssistant from "./pages/AIAssistant";
import DataManagement from "./pages/DataManagement";
import Suggestions from "./pages/Suggestions";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import GeneralNotepad from "./pages/GeneralNotepad";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { sport, isFirstTime } = useSport();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" />;
  }

  // Show sport selection for first-time users
  if (isFirstTime && !sport && user) {
    return <SportSelectionModal isOpen={true} onClose={() => {}} />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <SportProvider>
              <DatabaseProvider>
                <SubscriptionProvider>
                  <ChatbotProvider>
                    <TooltipProvider>
                      <ThemeProvider>
                        <Toaster />
                        <Sonner />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/select-sport" element={<SelectSport />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/test" element={<TestPage />} />
                      <Route path="/valorant" element={<ValorantAnalysis />} />
                      <Route path="/auth/google/callback" element={<GoogleCallback />} />
                      <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/paypal-payment" element={<PayPalPayment />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Dashboard />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/training" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Training />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/players" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Players />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/matches" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Matches />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/general-stats" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <GeneralStats />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/data-management" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <DataManagement />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/attendance" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Attendance />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/manual-actions" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <ManualActions />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/command-table" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <CommandTable />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/tactical-chat" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <TacticalChat />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/advanced-analytics" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <AdvancedAnalytics />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/community" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <CommunityHub />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/database-status" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <DatabaseStatusPage />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/player-management" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <PlayerManagement />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/match-tracking" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <MatchTracking />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/team-management" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <TeamManagement />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/analytics" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <GeneralNotepad />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/ai-assistant" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <AIAssistant />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/suggestions" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Suggestions />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Settings />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <ResponsiveLayout>
                              <Profile />
                            </ResponsiveLayout>
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                      </ThemeProvider>
                    </TooltipProvider>
                  </ChatbotProvider>
                </SubscriptionProvider>
              </DatabaseProvider>
            </SportProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;