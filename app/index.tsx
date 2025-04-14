import { useAuth } from './context/AuthContext';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, useColorScheme, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Colors } from './utils/theme';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const { user, isLoading } = useAuth();
  const [hasSeenLanding, setHasSeenLanding] = useState<boolean | null>(null);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // Check if the user has seen the landing screen before
  useEffect(() => {
    const checkLandingScreenStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@has_seen_landing');
        setHasSeenLanding(value === 'true');
        setInitialCheckComplete(true);
      } catch (error) {
        console.error('Error checking landing screen status:', error);
        setHasSeenLanding(false);
        setInitialCheckComplete(true);
      }
    };

    checkLandingScreenStatus();
  }, []);

  // Show a loading indicator while we're checking auth state and landing screen status
  if (isLoading || !initialCheckComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading your account...</Text>
      </View>
    );
  }

  // If the user is signed in, redirect to the main tabs
  if (user) {
    return <Redirect href="/tabs/HomeScreen" />;
  }
  
  // If the user is not signed in and hasn't seen the landing screen, show it
  if (!hasSeenLanding) {
    return <Redirect href="/screens/LandingScreen" />;
  }
  
  // If the user has seen the landing screen but is not signed in, go to sign in
  return <Redirect href="/(auth)/sign-in" />;
}
