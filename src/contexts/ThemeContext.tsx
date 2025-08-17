import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'midnight' | 'ocean' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isHighContrast: boolean;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('midnight');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'midnight', 'ocean', 'forest', 'high-contrast');
    root.classList.add(theme);
    
    // Theme configurations
    const themeConfigs = {
      dark: {
        bgPrimary: '#0a0a0a',
        bgSecondary: '#1a1a1a',
        bgTertiary: '#2a2a2a',
        textPrimary: '#ffffff',
        textSecondary: '#e5e5e5',
        textMuted: '#a3a3a3',
        borderPrimary: '#404040',
        borderSecondary: '#525252',
        accentPrimary: '#3b82f6',
        accentSecondary: '#1d4ed8',
        metaColor: '#0a0a0a'
      },
      midnight: {
        bgPrimary: '#0f0f23',
        bgSecondary: '#1a1a3a',
        bgTertiary: '#252550',
        textPrimary: '#e2e8f0',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        borderPrimary: '#475569',
        borderSecondary: '#64748b',
        accentPrimary: '#8b5cf6',
        accentSecondary: '#7c3aed',
        metaColor: '#0f0f23'
      },
      ocean: {
        bgPrimary: '#0c1821',
        bgSecondary: '#1e3a5f',
        bgTertiary: '#2d5a87',
        textPrimary: '#f0f9ff',
        textSecondary: '#e0f2fe',
        textMuted: '#bae6fd',
        borderPrimary: '#0369a1',
        borderSecondary: '#0284c7',
        accentPrimary: '#06b6d4',
        accentSecondary: '#0891b2',
        metaColor: '#0c1821'
      },
      forest: {
        bgPrimary: '#0f1419',
        bgSecondary: '#1a2e1a',
        bgTertiary: '#2d4a2d',
        textPrimary: '#f0fdf4',
        textSecondary: '#dcfce7',
        textMuted: '#bbf7d0',
        borderPrimary: '#166534',
        borderSecondary: '#15803d',
        accentPrimary: '#10b981',
        accentSecondary: '#059669',
        metaColor: '#0f1419'
      }
    };
    
    const config = themeConfigs[theme];
    
    // Apply theme colors
    root.style.setProperty('--bg-primary', config.bgPrimary);
    root.style.setProperty('--bg-secondary', config.bgSecondary);
    root.style.setProperty('--bg-tertiary', config.bgTertiary);
    root.style.setProperty('--text-primary', config.textPrimary);
    root.style.setProperty('--text-secondary', config.textSecondary);
    root.style.setProperty('--text-muted', config.textMuted);
    root.style.setProperty('--border-primary', config.borderPrimary);
    root.style.setProperty('--border-secondary', config.borderSecondary);
    root.style.setProperty('--accent-primary', config.accentPrimary);
    root.style.setProperty('--accent-secondary', config.accentSecondary);
    
    // Enhanced shadows and gradients
    root.style.setProperty('--shadow-soft', `0 4px 6px -1px ${config.bgPrimary}40`);
    root.style.setProperty('--shadow-medium', `0 10px 15px -3px ${config.bgPrimary}60`);
    root.style.setProperty('--shadow-strong', `0 25px 50px -12px ${config.bgPrimary}80`);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${config.bgPrimary} 0%, ${config.bgSecondary} 50%, ${config.bgTertiary} 100%)`);
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${config.accentPrimary} 0%, ${config.accentSecondary} 100%)`);
    root.style.setProperty('--gradient-glow', `radial-gradient(circle at center, ${config.accentPrimary}20 0%, transparent 70%)`);
    
    // Animation preferences
    root.style.setProperty('--animation-duration', animationsEnabled ? '0.3s' : '0s');
    root.style.setProperty('--animation-timing', 'cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', config.metaColor);
    }
  }, [theme, animationsEnabled]);

  const toggleTheme = () => {
    const themes: Theme[] = ['midnight', 'dark', 'ocean', 'forest'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const isHighContrast = false;

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isHighContrast,
    animationsEnabled,
    setAnimationsEnabled,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};