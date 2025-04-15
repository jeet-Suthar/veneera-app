import React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, useColorScheme } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import IconSvg from '../../assets/images/icons/icon.svg';
import GoogleSvg from '../../assets/images/icons/google-icon-logo-svgrepo-com.svg';
import { useAlert } from '../context/AlertContext';
import * as webBrowser from 'expo-web-browser'; 
// Ensure WebBrowser closes properly
webBrowser.maybeCompleteAuthSession();

const DEMO_VIEWED_KEY = '@demo_viewed';   

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const { signIn, signInWithGoogle, isLoading } = useAuth();
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
      console.log('this is the id_token', id_token);
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      await signInWithGoogle(idToken);
      router.replace('/tabs/HomeScreen');
    } catch (error: any) {
      alert.error(error.message || 'An unknown error occurred during Google sign-in.', 'Sign In Error');
      console.log(error);
      console.log(idToken);
    }
  };

  const handleTryDemo = () => {
    router.push('/screens/DemoGenerateScreen');
  };

  // Email/Password Sign In
  const onSignInPress = async () => {
    if (!emailAddress || !password) {
      alert.warning('Please enter both email and password.', 'Sign In Error');
      return;
    }

    try {
      await signIn(emailAddress, password);
      router.replace('/tabs/HomeScreen');
    } catch (error: any) {
      alert.error(error.message || 'An unknown error occurred during sign-in.', 'Sign In Error');
    }
  };

  // --- Render Sign In Form ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Logo and Title */}
      <View style={styles.headerContainer}>
        <IconSvg width={styles.logo.width} height={styles.logo.height} fill={theme.text} style={styles.logo} />
        <Text style={[styles.headerText, { color: theme.text }]}>Teethsi</Text>
      </View>

      <Text style={[styles.title , {color: theme.text} ]}>Welcome Back! Glad to see you, Again!</Text>

      {/* Email/Password Inputs */}
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email address "
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
      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onSignInPress} disabled={isLoading}>
        <Text style={[styles.buttonText, { color: theme.text }]}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
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
      
      <Text style={styles.separator}>or</Text>
      
      {/* Google Sign In Button */}
      <TouchableOpacity
        style={[styles.oauthButton, styles.googleButton, isLoading && styles.buttonDisabled]}
        onPress={() => promptAsync()}
        disabled={isLoading}
      >
        <GoogleSvg width={24} height={24} fill={theme.background} />
        <Text style={[styles.oauthButtonText, styles.googleButtonText]}>Sign in with Google</Text>
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
    paddingTop: 120,
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
  oauthButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  googleButtonText: {
     color: '#555',
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