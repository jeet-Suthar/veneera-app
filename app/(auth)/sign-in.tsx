import React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Ensure WebBrowser closes properly
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // --- OAuth Flow Hooks ---
  // Note: We use the same hooks as sign-up, the backend handles sign-in vs sign-up
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  // --- OAuth Handler ---
  const onPressOAuth = async (startFlow: () => Promise<any>) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const { createdSessionId, setActive, signUp } = await startFlow();

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/tabs/HomeScreen'); // Redirect to main app after successful OAuth
      } else {
        // Handle cases where OAuth flow might not immediately create a session
        if (signUp?.status === 'missing_requirements') {
          console.log('OAuth sign-in requires additional steps', JSON.stringify(signUp, null, 2));
          // Check if phone_number is in the missing fields
          if (signUp.missingFields && signUp.missingFields.includes('phone_number')) {
            // Navigate to the complete signup page
            router.push('/(auth)/complete-signup');
          } else {
            // Handle other missing requirements
            Alert.alert('Sign In Incomplete', 'Additional information is required. Please try again or contact support.');
          }
        } else {
          console.log('OAuth flow finished without creating a session ID.');
          Alert.alert('Sign In Issue', 'There was an issue signing in. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('OAuth error', JSON.stringify(err, null, 2));
      Alert.alert('OAuth Error', err.errors ? err.errors[0].message : 'An unknown error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  // --- Email/Password Sign In ---
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/tabs/HomeScreen'); // Redirect after sign-in
      } else {
        // This can happen for multi-factor auth, etc.
        console.error('Sign In Status not complete:', JSON.stringify(signInAttempt, null, 2));
        Alert.alert('Sign In Pending', 'Further action may be required to complete sign-in.');
      }
    } catch (err: any) {
      console.error('Sign In Error:', JSON.stringify(err, null, 2));
      Alert.alert('Sign In Error', err.errors ? err.errors[0].message : 'An unknown error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Sign In Form ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title , {color: theme.text} ]}>Welcome Back! Glad to see you, Again!</Text>

  

  

      {/* Email/Password Inputs */}
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email address"
        onChangeText={setEmailAddress}
        style={[styles.input, { backgroundColor: theme.textSecondary }]}
        keyboardType="email-address"
        editable={!loading}
      />
      {/* Password Input with Toggle */}
      <View style={[styles.passwordContainer, { backgroundColor: theme.textSecondary }]}>
        <TextInput
          value={password}
          placeholder="Password"
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          style={[styles.passwordInput, {  }]}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={theme.background}
          />
        </TouchableOpacity>
      </View>
      
     

      {/* Submit Button */}
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSignInPress} disabled={loading}>
        <Text style={[styles.buttonText, { color: theme.text }]}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <Text style={styles.separator}>or</Text>
           {/* OAuth Buttons */}
           <TouchableOpacity
        style={[styles.oauthButton, styles.googleButton, loading && styles.buttonDisabled]}
        onPress={() => onPressOAuth(startGoogleOAuthFlow)}
        disabled={loading}
      >
        <MaterialCommunityIcons name="google" size={24} style={{ color: theme.background }} />
        <Text style={[styles.oauthButtonText, styles.googleButtonText]}>Sign up with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.oauthButton, styles.appleButton, loading && styles.buttonDisabled]}
        onPress={() => onPressOAuth(startAppleOAuthFlow)}
        disabled={loading}
      >
        <MaterialCommunityIcons name="apple" size={24} color="#FFFFFF" />
        <Text style={[styles.oauthButtonText, styles.appleButtonText]}>Sign up with Apple</Text>
      </TouchableOpacity>

      {/* Link to Sign Up */}
      <View style={styles.footer}>
        <Text style={[ { color: theme.textSecondary }]}>Don't have an account?</Text>
        <Link href="/(auth)/sign-up" asChild>
           <TouchableOpacity>
            <Text style={[styles.linkText, { color: theme.primary }]}>Sign up</Text>
           </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// Reusing styles from sign-up for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 35,
    fontWeight: 'thin',
    marginBottom: 50,
    width: '70%',
  },
  input: {
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonDisabled: {
    backgroundColor: '#a3a3a3',
  },
  oauthButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  oauthButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  googleButtonText: {
     color: '#555',
  },
   appleButtonText: {
     color: '#fff',
  },
  separator: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 15,
    fontWeight: 'bold',
  },
  footer: {
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
  },
  
}); 