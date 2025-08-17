import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the authorization code from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('No authorization code found in the callback URL');
        }

        // Exchange the code for a token
        const result = await handleGoogleCallback(code);

        if (result.error) {
          throw new Error(result.error);
        }

        // Redirect to dashboard on success
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Google callback error:', err);
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [handleGoogleCallback, location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          <h2 className="text-xl font-bold">Authentication Error</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/signin')} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;