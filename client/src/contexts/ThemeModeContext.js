import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({ mode: 'light', toggleMode: () => {} });

export const ThemeModeProvider = ({ children }) => {
  // Detect preferred mode on first load
  const getInitialMode = () => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        primary: {
          main: '#667eea',
          light: '#8fa4f3',
          dark: '#4c63d2',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#764ba2',
          light: '#9575cd',
          dark: '#512da8',
          contrastText: '#ffffff',
        },
        ...(mode === 'light'
          ? {
              background: { default: '#f5f5f5', paper: '#ffffff' },
              text: { primary: '#2d3748', secondary: '#4a5568' },
            }
          : {
              background: { default: '#0f172a', paper: '#111827' },
              text: { primary: '#e5e7eb', secondary: '#9ca3af' },
            }),
        success: { main: '#48bb78' },
        warning: { main: '#ed8936' },
        error: { main: '#f56565' },
        info: { main: '#4299e1' },
      },
      shape: { borderRadius: 8 },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: { borderRadius: 12 },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.6)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            colorPrimary: {
              backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          },
        },
      },
    }),
  [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);