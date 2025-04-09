import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasSeenLanding, setHasSeenLanding] = useState<boolean | null>(null);

  // Check if the user has seen the landing screen before
  useEffect(() => {
    const checkLandingScreenStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@has_seen_landing');
        setHasSeenLanding(value === 'true');
      } catch (error) {
        console.error('Error checking landing screen status:', error);
        setHasSeenLanding(false);
      }
    };

    checkLandingScreenStatus();
  }, []);

  // Show a loading indicator while we're checking auth state and landing screen status
  if (!isLoaded || hasSeenLanding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If the user is signed in, redirect to the main tabs
  if (isSignedIn) {
    return <Redirect href="/tabs/HomeScreen" />;
  }
  
  // If the user is not signed in and hasn't seen the landing screen, show it
  if (hasSeenLanding) {
    return <Redirect href="/LandingScreen" />;
  }
  
  // If the user has seen the landing screen but is not signed in, go to sign in
  return <Redirect href="/(auth)/sign-in" />;
}
