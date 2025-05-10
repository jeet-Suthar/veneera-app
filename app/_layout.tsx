import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { Colors } from './utils/theme';
import { auth } from './config/firebase';
import { Platform } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // Ensure Firebase auth is initialized early
  useEffect(() => {
    // Force early initialization of Firebase auth
    // This helps with persistence on app restart
    if (Platform.OS !== 'web') {
      auth.currentUser; // Just accessing it will initialize auth
      console.log('Firebase auth initialized in RootLayout');
    }
  }, []);

  return (
    <AuthProvider>
      <AlertProvider>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="tabs" />
          </Stack>
        </View>
      </AlertProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
// This layout file is used to define the main structure of the app.