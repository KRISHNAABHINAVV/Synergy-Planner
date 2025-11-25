
import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const preferences = await api.getPreferences();
        if (preferences?.theme) {
          setTheme(preferences.theme);
        } else {
          // Fallback to system preference
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setTheme(systemTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Fallback to system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Update theme in DOM and backend
  useEffect(() => {
    if (!isLoaded) return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to backend
    api.updatePreferences({ theme }).catch(error => {
      console.error('Failed to save theme:', error);
    });
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
