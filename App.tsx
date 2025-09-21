// In App.tsx

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { Session } from '@supabase/supabase-js';
import { supabase } from './app/lib/supabase';
import StackNavigator from './app/navigation/StackNavigator';
import LoginScreen from './app/screens/LoginScreen';
import { AppTheme } from './app/theme/theme';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  let [fontsLoaded] = useFonts({ Orbitron_700Bold });

  useEffect(() => {
    // Check for an existing session when the app starts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes in authentication state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Show a loading screen until the font is ready
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer theme={AppTheme}>
      {/* If a session exists, show the main app. Otherwise, show the Login screen. */}
      {session && session.user ? <StackNavigator /> : <LoginScreen />}
      <StatusBar style="light" />
    </NavigationContainer>
  );
}