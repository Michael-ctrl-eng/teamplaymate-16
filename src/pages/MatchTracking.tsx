import React from 'react';
import { motion } from 'framer-motion';
import { MatchTrackingSection } from '../components/MatchTrackingSection';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Timer, ArrowLeft, Play, Target, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const MatchTracking: React.FC = () => {
  const navigate = useNavigate();
  const { theme, isHighContrast } = useTheme();

  return (
    <div className={`min-h-screen ${
      isHighContrast ? 'hc-bg' :
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Timer className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${
                    isHighContrast ? 'hc-text' :
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Match Tracking
                  </h1>
                  <p className={`text-lg ${
                    isHighContrast ? 'hc-text-secondary' :
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Live match monitoring, events, and statistics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Match Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className={`${
            isHighContrast ? 'hc-card' :
            theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-6 text-center">
              <Play className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">LIVE</div>
              <div className="text-sm text-gray-600">Match Status</div>
            </CardContent>
          </Card>
          
          <Card className={`${
            isHighContrast ? 'hc-card' :
            theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-6 text-center">
              <Timer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">45:00</div>
              <div className="text-sm text-gray-600">Match Time</div>
            </CardContent>
          </Card>
          
          <Card className={`${
            isHighContrast ? 'hc-card' :
            theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">2-1</div>
              <div className="text-sm text-gray-600">Current Score</div>
            </CardContent>
          </Card>
          
          <Card className={`${
            isHighContrast ? 'hc-card' :
            theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">8</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Match Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className={`${
            isHighContrast ? 'hc-card' :
            theme === 'dark' ? 'bg-white border-gray-200' : 'bg-white border-gray-200'
          } bg-gradient-to-r from-blue-50 to-green-50 border-blue-200`}>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Current Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">CD Statsor</div>
                  <div className="text-lg text-gray-600">Home</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">2 - 1</div>
                  <div className="text-sm text-gray-600">45' - First Half</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">Jaén FS</div>
                  <div className="text-lg text-gray-600">Away</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Match Tracking Section */}
        <MatchTrackingSection />
      </div>
    </div>
  );
};

export default MatchTracking;