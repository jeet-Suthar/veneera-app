import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SignOutButton } from '../components/SignOutButton';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.greeting}>Hello, {user?.email ?? 'User'}!</Text>
          <SignOutButton />
        </>
      ) : (
        <>
          <Text style={styles.infoText}>Please sign in or sign up to continue.</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  linkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    minWidth: 150, // Give buttons some width
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 