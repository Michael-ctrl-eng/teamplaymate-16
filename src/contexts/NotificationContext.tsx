import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('teamplaymate_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Failed to load notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('teamplaymate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Generate sample notifications on first load
  useEffect(() => {
    const hasGeneratedSample = localStorage.getItem('teamplaymate_sample_notifications');
    if (!hasGeneratedSample && notifications.length === 0) {
      const sampleNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
        {
          title: 'Welcome to TeamPlaymate!',
          message: 'Your account has been successfully created. Start exploring your dashboard.',
          type: 'success',
          actionUrl: '/dashboard',
          actionLabel: 'Go to Dashboard'
        },
        {
          title: 'Match Reminder',
          message: 'You have a match scheduled for tomorrow at 3:00 PM against FC Barcelona.',
          type: 'info',
          actionUrl: '/matches',
          actionLabel: 'View Match'
        },
        {
          title: 'Training Session',
          message: 'New training session available: "Advanced Passing Techniques"',
          type: 'info',
          actionUrl: '/training',
          actionLabel: 'Start Training'
        },
        {
          title: 'Performance Update',
          message: 'Your overall rating has improved by 0.3 points this week!',
          type: 'success',
          actionUrl: '/profile',
          actionLabel: 'View Profile'
        },
        {
          title: 'Team Update',
          message: 'New player John Smith has joined your team.',
          type: 'info',
          actionUrl: '/players',
          actionLabel: 'View Team'
        }
      ];

      sampleNotifications.forEach(notification => {
        addNotification(notification);
      });

      localStorage.setItem('teamplaymate_sample_notifications', 'true');
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    const toastOptions = {
      duration: 5000,
      action: notification.actionUrl ? {
        label: notification.actionLabel || 'View',
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, toastOptions);
        break;
      case 'error':
        toast.error(notification.title, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.title, toastOptions);
        break;
      default:
        toast.info(notification.title, toastOptions);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate notifications (for demo purposes)
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const randomNotifications = [
          {
            title: 'Match Update',
            message: 'Your team scored a goal! Current score: 2-1',
            type: 'success' as const,
            actionUrl: '/matches',
            actionLabel: 'View Match'
          },
          {
            title: 'Training Reminder',
            message: 'Don\'t forget your training session in 1 hour.',
            type: 'info' as const,
            actionUrl: '/training',
            actionLabel: 'View Training'
          },
          {
            title: 'Player Update',
            message: 'A teammate has updated their availability status.',
            type: 'info' as const,
            actionUrl: '/players',
            actionLabel: 'View Team'
          }
        ];

        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};