import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from 'react';
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

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SelectSport = lazy(() => import("./pages/SelectSport"));
const Blog = lazy(() => import("./pages/Blog"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Training = lazy(() => import("./pages/Training"));
const ValorantAnalysis = lazy(() => import("./pages/ValorantAnalysis"));
const Players = lazy(() => import("./pages/Players"));
const Matches = lazy(() => import("./pages/Matches"));
const GeneralStats = lazy(() => import("./pages/GeneralStats"));
const Attendance = lazy(() => import("./pages/Attendance"));
const ManualActions = lazy(() => import("./pages/ManualActions"));
const CommandTable = lazy(() => import("./pages/CommandTable"));
const TacticalChat = lazy(() => import("./pages/TacticalChat"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const DatabaseStatusPage = lazy(() => import("./pages/DatabaseStatusPage"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const PayPalPayment = lazy(() => import("./pages/PayPalPayment"));
const TestPage = lazy(() => import("./pages/TestPage"));
const PlayerManagement = lazy(() => import("./pages/PlayerManagement"));
const MatchTracking = lazy(() => import("./pages/MatchTracking"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const DataManagement = lazy(() => import("./pages/DataManagement"));
const Suggestions = lazy(() => import("./pages/Suggestions"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const GeneralNotepad = lazy(() => import("./pages/GeneralNotepad"));

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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Reorganize context providers for better performance
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <SportProvider>
          <DatabaseProvider>
            <SubscriptionProvider>
              <ChatbotProvider>
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </ChatbotProvider>
            </SubscriptionProvider>
          </DatabaseProvider>
        </SportProvider>
      </AuthProvider>
    </ThemeProvider>
  </LanguageProvider>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProviders>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
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
              <Route path="/auth/callback" element={<GoogleCallback />} />
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
          </Suspense>
        </AppProviders>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;