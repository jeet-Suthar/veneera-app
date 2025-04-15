import * as React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, useColorScheme } from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import IconSvg from '../../assets/images/icons/icon.svg';
import { useAlert } from '../context/AlertContext';
import GoogleSvg from '../../assets/images/icons/google-icon-logo-svgrepo-com.svg';

// Ensure WebBrowser closes properly
WebBrowser.maybeCompleteAuthSession();

const DEMO_VIEWED_KEY = '@demo_viewed';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const router = useRouter();
  const alert = useAlert();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [demoViewed, setDemoViewed] = React.useState(false);

  // Google Auth Configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  });

  // Check if demo has been viewed
  React.useEffect(() => {
    const checkDemoViewed = async () => {
      try {
        const viewed = await AsyncStorage.getItem(DEMO_VIEWED_KEY);
        setDemoViewed(viewed === 'true');
      } catch (error) {
        console.error('Error checking demo viewed status:', error);
      }
    };
    checkDemoViewed();
  }, []);

  // Handle Google Auth Response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    console.log('handleGoogleLogin', idToken);
    try {
      await signInWithGoogle(idToken);
      router.replace('/tabs/HomeScreen');
    } catch (error: any) {
      alert.error(error.message || 'An unknown error occurred during Google sign-up.', 'Sign Up Error');
      console.warn('Error signing in with Google:', error);
    }
  };

  const handleTryDemo = () => {
    router.push('/screens/DemoGenerateScreen');
  };

  // Email/Password Sign Up
  const onSignUpPress = async () => {
    if (!emailAddress || !password) {
      alert.warning('Please enter both email and password.', 'Sign Up Error');
      return;
    }
    
    try {
      await signUp(emailAddress, password);
      // Show success message and navigate
      alert.success('Account created successfully! You can now sign in.');
      router.replace('/tabs/HomeScreen');
    } catch (error: any) {
      alert.error(error.message || 'An unknown error occurred during sign-up.', 'Sign Up Error');
    }
  };

  // --- Render Main Sign Up Form ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Logo and Title */}
      <View style={styles.headerContainer}>
        <IconSvg width={styles.logo.width} height={styles.logo.height} fill={theme.text} style={styles.logo} />
        <Text style={[styles.headerText, { color: theme.text }]}>Teethsi</Text>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>

      {/* Email Input */}
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email address"
        onChangeText={setEmailAddress}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
        keyboardType="email-address"
        editable={!isLoading}
      />

      {/* Password Input with Toggle */}
      <View style={[styles.passwordContainer, { backgroundColor: theme.surface }]}>
        <TextInput
          value={password}
          placeholder="Password"
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          placeholderTextColor={theme.textSecondary}
          style={[styles.passwordInput, { backgroundColor: theme.surface, color: theme.text }]}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]} onPress={onSignUpPress} disabled={isLoading}>
        <Text style={[styles.buttonText, { color: '#fff'}]}>{isLoading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      {/* Demo Button (conditional based on previous usage) */}
      {!demoViewed && (
        <TouchableOpacity 
          style={[styles.demoButton, { borderColor: theme.primary }]} 
          onPress={handleTryDemo}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="image-filter-hdr" size={20} color={theme.primary} />
          <Text style={[styles.demoButtonText, { color: theme.primary }]}>Try Our AI Demo First</Text>
        </TouchableOpacity>
      )}

      {/* Separator */}
      <Text style={[styles.separator, { color: theme.textSecondary }]}>or</Text>

      {/* OAuth Button */}
      <TouchableOpacity
        style={[styles.oauthButton, styles.googleButton, isLoading && styles.buttonDisabled]}
        onPress={() => promptAsync()}
        disabled={isLoading}
      >
        <GoogleSvg width={24} height={24} fill={theme.background} />

        <Text style={[styles.oauthButtonText, styles.googleButtonText]}>Sign up with Google</Text>
      </TouchableOpacity>

      {/* Link to Sign In */}
      <View style={styles.footer}>
        <Text style={[{ color: theme.textSecondary }]}>Already have an account?</Text>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <Text style={[styles.linkText, { color: theme.primary }]}>Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// Styles based on sign-in.tsx (no theme references here)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 40,
    paddingTop: 120,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'left',
    width: '70%',
  },
  input: {
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
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
  button: {
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
    gap: 10,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  oauthButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButtonText: {
     color: '#555',
  },
  separator: {
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  linkText: {
    fontWeight: 'bold',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  demoButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
    left: 20,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});