import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bot, AlertTriangle } from 'lucide-react';

// Lazy load the EnhancedAIAssistant component
const EnhancedAIAssistant = React.lazy(() => 
  import('../components/EnhancedAIAssistant').then(module => ({
    default: module.EnhancedAIAssistant
  }))
);

// Loading component for suspense
const LoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Card className="w-96">
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading AI Assistant...</p>
        <p className="text-sm text-gray-500 mt-2">Initializing enhanced features...</p>
      </CardContent>
    </Card>
  </div>
);

// Error boundary component
class AIAssistantErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Assistant Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen p-6 bg-gray-50">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                AI Assistant Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  The AI Assistant encountered an error:
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <code className="text-red-800 text-sm">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </code>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => this.setState({ hasError: false, error: null })}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

const AIAssistant: React.FC = () => {
  return (
    <AIAssistantErrorBoundary>
      <div className="h-full">
        <Suspense fallback={<LoadingComponent />}>
          <EnhancedAIAssistant />
        </Suspense>
      </div>
    </AIAssistantErrorBoundary>
  );
};

export default AIAssistant;