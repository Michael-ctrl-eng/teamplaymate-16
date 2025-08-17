import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { ArrowRight } from 'lucide-react';

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
  path: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
    text: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
    text: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
    text: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-100',
    text: 'text-orange-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-100',
    text: 'text-indigo-600'
  }
};

export const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  color,
  path,
  stats
}) => {
  const navigate = useNavigate();
  const colors = colorClasses[color];

  const handleClick = () => {
    navigate(path);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={handleClick}
    >
      <Card className={`${colors.bg} ${colors.border} ${colors.hover} transition-all duration-200 border-2`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {icon}
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
            </div>
            <ArrowRight className={`h-5 w-5 ${colors.text}`} />
          </div>
          
          <div className="space-y-2">
            {stats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <span className={`text-sm font-medium ${colors.text}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};