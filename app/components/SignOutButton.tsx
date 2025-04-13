import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';

// Define prop types
interface SignOutButtonProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ style, textStyle }) => {
  // Use `useAuth()` to access the `signOutUser()` function
  const { signOutUser, isLoading } = useAuth();
  const router = useRouter(); // Use router for navigation

  const handleSignOut = async () => {
    if (isLoading) return;
    
    try {
      await signOutUser();
      // Redirect to the sign-in page after successful sign-out
      router.replace('/');  // This will redirect to sign-in through the root index redirection
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      Alert.alert('Sign Out Error', err.message || 'An error occurred during sign-out.');
    }
  };

  return (
    // Apply default styles and merge with passed-in styles
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled, style]} // Merge default and custom button styles
      onPress={handleSignOut}
      disabled={isLoading}
    >
      <Text style={[styles.buttonText, textStyle]}> {/* Merge default and custom text styles */}
        {isLoading ? 'Signing Out...' : 'Sign Out'}
      </Text>
    </TouchableOpacity>
  );
};

// Default styles (can be overridden by props)
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DC3545', // Default red background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center text
    flexDirection: 'row', // Keep for potential future icons
    gap: 8, // Add gap if needed
    minHeight: 48, // Ensure decent tap target size
  },
  buttonText: {
    color: '#fff', // Default white text
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a3a3a3',
  },
}); 

export default SignOutButton;