import React from 'react';
//import 'react-native-gesture-handler';

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { ThemeProvider, useThemeMode } from './src/theme/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from './src/components/Toast';

function ThemedNav() {
  const { mode } = useThemeMode();
  return (
    <NavigationContainer theme={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
      <Toast />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedNav />
    </ThemeProvider>
  );
}