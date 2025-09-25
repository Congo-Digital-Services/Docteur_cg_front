import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({ mode: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('theme_mode');
      if (saved) setMode(saved);
      else setMode(Appearance.getColorScheme() || 'light');
    })();
  }, []);

  const toggle = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    await AsyncStorage.setItem('theme_mode', next);
  };

  const value = useMemo(() => ({ mode, toggle }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeMode = () => useContext(ThemeContext);
