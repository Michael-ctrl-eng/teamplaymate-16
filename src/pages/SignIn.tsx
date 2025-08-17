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
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(typeof error === 'string' ? error : 'Google authentication failed');
      } else {
        toast.success('¡Autenticación exitosa con Google!');
        // Let the auth context handle navigation
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Error al autenticar con Google. Por favor, inténtalo de nuevo.');
    } finally {
      setGoogleLoading(false);
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
              disabled={googleLoading}
              variant="outline"
              className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-200"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  className="w-5 h-5 mr-3" 
                />
              )}
              {googleLoading ? 'Authenticating...' : 'Continue with Google'}
            </Button>
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