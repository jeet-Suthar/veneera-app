import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';

// Define prop types
interface SignOutButtonProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ style, textStyle }) => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter(); // Use router for navigation
  const [loading, setLoading] = React.useState(false);

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOut();
      // Redirect to the sign-in page after successful sign-out
      // Replace might be better if you don't want the user going back to the signed-in state
      router.replace('/');  // This will redirect to sign-in through the root index redirection
    } catch (err: any) {
      console.error('Sign Out Error:', JSON.stringify(err, null, 2));
      Alert.alert('Sign Out Error', err.errors ? err.errors[0].message : 'An error occurred during sign-out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Apply default styles and merge with passed-in styles
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled, style]} // Merge default and custom button styles
      onPress={handleSignOut}
      disabled={loading}
    >
      <Text style={[styles.buttonText, textStyle]}> {/* Merge default and custom text styles */}
        {loading ? 'Signing Out...' : 'Sign Out'}
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