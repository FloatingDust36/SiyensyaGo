// In App.tsx

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import StackNavigator from './app/navigation/StackNavigator';
import { AppTheme } from './app/theme/theme';

export default function App() {
  let [fontsLoaded] = useFonts({
    Orbitron_700Bold,
  });

  // Show a loading screen until the font is ready
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <StackNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}