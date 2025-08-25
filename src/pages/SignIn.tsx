import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, Target } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const navigate = useNavigate();

  // Prevent multiple sign-in attempts
  useEffect(() => {
    if (loading || googleLoading) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [loading, googleLoading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || googleLoading) {
      toast.error('Please wait, sign-in in progress...');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(typeof error === 'string' ? error : 'Sign-in failed. Please try again.');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || googleLoading) {
      toast.error('Please wait, authentication in progress...');
      return;
    }

    setGoogleLoading(true);
    
    try {
      toast.info('Redirecting to Google...', { duration: 2000 });
      
      const result = await signInWithGoogle();
      
      if (result.error && !result.error.includes('Authentication in progress')) {
        // Only show error if it's not a redirect (which is expected)
        if (!window.location.href.includes('accounts.google.com')) {
          toast.error(typeof result.error === 'string' ? result.error : 'Google authentication failed');
        }
      } else if (result.data?.user) {
        // This handles the mock/demo case
        toast.success('Welcome! Google sign-in successful.');
        // Navigation is handled in the auth context
      }
      
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Error during Google authentication. Please try again.');
    } finally {
      // Only clear loading if we're still on the same page
      // (not redirected to Google)
      if (!window.location.href.includes('accounts.google.com')) {
        setGoogleLoading(false);
      }
    }
  };

  const { theme } = useTheme();

  // Enhanced animation variants matching landing page
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, 5, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const backgroundParticles = {
    animate: {
      y: [0, -100, 0],
      x: [0, 50, 0],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 2
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-500 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-blue-900">
        
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Multiple layers of animated particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-2 h-2 bg-purple-400' :
                i % 3 === 1 ? 'w-3 h-3 bg-blue-400' :
                'w-1 h-1 bg-green-400'
              } opacity-60`}
              style={{
                left: `${10 + (i * 8) % 80}%`,
                top: `${15 + (i * 7) % 70}%`,
              }}
              variants={backgroundParticles}
              animate="animate"
              transition={{
                delay: i * 0.3,
                duration: 6 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Orbiting elements */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2"
            variants={orbitVariants}
            animate="animate"
          >
            <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-40 blur-sm -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-purple-500 rounded-full opacity-40 blur-sm -translate-x-1/2" />
            <div className="absolute left-0 top-1/2 w-2 h-2 bg-green-500 rounded-full opacity-40 blur-sm -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-3 h-3 bg-pink-500 rounded-full opacity-40 blur-sm -translate-y-1/2" />
          </motion.div>
          
          {/* Enhanced Background Gradients with pulsing */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl bg-gradient-to-r from-blue-500 to-purple-500"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl bg-gradient-to-r from-purple-500 to-pink-500"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10 blur-2xl bg-gradient-to-r from-green-500 to-blue-500 -translate-x-1/2 -translate-y-1/2"
            variants={pulseVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
          
          {/* Floating geometric shapes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`shape-${i}`}
              className={`absolute ${
                i % 4 === 0 ? 'w-8 h-8 bg-blue-400/20 rounded-full' :
                i % 4 === 1 ? 'w-6 h-6 bg-purple-400/20 rotate-45' :
                i % 4 === 2 ? 'w-4 h-4 bg-green-400/20 rounded-full' :
                'w-5 h-5 bg-pink-400/20 rounded-sm rotate-12'
              } blur-sm`}
              style={{
                left: `${15 + (i * 12) % 70}%`,
                top: `${20 + (i * 9) % 60}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 8 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      

      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center items-center space-x-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25"
          >
            <div className="relative">
              <Target className="h-9 w-9 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Statsor
            </span>
            <span className="text-xs opacity-70 -mt-1">
              Football Analytics
            </span>
          </div>
        </div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-200 bg-clip-text text-transparent"
        >
          Sign In
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-center text-sm text-gray-300"
        >
          Welcome back! Please sign in to your account
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-gray-900 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-700 backdrop-blur-sm bg-opacity-95">
          {/* Google Sign In Button */}
          <div className="mb-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              variant="outline"
              className="w-full h-12 border-2 border-gray-600 bg-white hover:bg-gray-50 text-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
                  <span className="text-gray-700">Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </>
              )}
            </Button>
            {googleLoading && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                You may be redirected to Google for authentication
              </p>
            )}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800/70 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800/70 transition-all"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-500 bg-gray-800 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 font-semibold shadow-lg shadow-blue-900/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg backdrop-blur-sm">
            <div className="text-xs text-blue-300">
              <p className="font-medium mb-1 text-blue-200">Information about collected data:</p>
              <ul className="space-y-1 text-blue-300">
                <li>• Email and name for personalization</li>
                <li>• Profile picture (optional)</li>
                <li>• Language and region preferences</li>
                <li>• Data encrypted and secure according to GDPR</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SignIn;