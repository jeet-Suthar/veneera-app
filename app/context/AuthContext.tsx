import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithCredential,
  User,
  deleteUser,
  signInWithCustomToken,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentUser } from '../utils/patientStorage';
import { auth } from '../config/firebase';
import { Platform } from 'react-native';

// Keys for AsyncStorage
const USER_STORAGE_KEY = '@auth_user';
const TOKEN_STORAGE_KEY = '@auth_token';
const AUTH_PERSISTENCE_KEY = '@auth_persistence';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOutUser: async () => {},
  signInWithGoogle: async () => {},
  deleteAccount: async () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

// Helper to securely store user data in AsyncStorage
const storeUserData = async (user: User) => {
  if (!user) return;
  
  try {
    // Store essential user info
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: new Date().toISOString(),
    };
    
    // Store user data in AsyncStorage
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    
    // Store token if available
    if (user.getIdToken) {
      const token = await user.getIdToken(true); // Force refresh to get a fresh token
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);

      // Store additional auth persistence data (for manual session restoration if needed)
      await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify({
        lastLogin: new Date().toISOString(),
        email: user.email,
        tokenExpiry: new Date(Date.now() + 3600000).toISOString(), // Approximate 1hr expiry
      }));
    }
    
    // Also store email in the patient storage for compatibility
    if (user.email) {
      await setCurrentUser(user.email);
    }
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Helper to clear user data from AsyncStorage
const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for stored user on mount and set up auth state listener
  useEffect(() => {
    let unsubscribe: () => void;
    
    const attemptStoredUserLogin = async () => {
      try {
        // Check for stored user data
        const storedUserData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedUserData && storedToken) {
          // We have stored user data and token
          const userData = JSON.parse(storedUserData);
          console.log('Found stored auth data, attempting to restore session');
          
          // Update the user state with stored data temporarily
          // This will show the user as logged in immediately while Firebase validates
          setUser(userData as any);
          
          // On native platforms, Firebase should auto-restore session but let's handle edge cases
          if (Platform.OS !== 'web' && !auth.currentUser) {
            console.log('Attempting to manually refresh auth state');
            // Force auth state refresh - this helps when the token is valid but session not restored
            auth.onAuthStateChanged((user) => {
              if (!user) {
                console.log('No authenticated user found after state refresh');
                // If we're still not authenticated, don't clear stored credentials yet
                // Firebase auth instance may still be initializing
              }
            });
          }
        }
      } catch (error) {
        console.error('Error retrieving stored auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Try to restore stored user data
    attemptStoredUserLogin();

    // Set up Firebase auth state listener
    unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? 'User authenticated' : 'No user');
      
      if (currentUser) {
        // User is signed in, store their data securely
        await storeUserData(currentUser);
        setUser(currentUser);
      } else {
        // No authenticated user - but don't clear data immediately
        // This helps during app restart when auth takes time to initialize
        const storedUserData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUserData) {
          // We have stored data but no current user - wait a bit to see if auth restores
          // This is especially helpful on app restart
          setTimeout(async () => {
            // Check again after a delay
            if (!auth.currentUser) {
              console.log('No user after delay, clearing stored data');
              await clearUserData();
              setUser(null);
            }
          }, 5000); // 5 second grace period
        } else {
          // No stored data, clear everything
          await clearUserData();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      setIsLoading(true);
      // Persistence is now handled at auth initialization in firebase.js
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await storeUserData(userCredential.user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      setIsLoading(true);
      // Persistence is now handled at auth initialization in firebase.js
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await storeUserData(userCredential.user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      setIsLoading(true);
      await signOut(auth);
      await clearUserData();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    setError(null);
    try {
      setIsLoading(true);
      console.log('Signing in with Google');
      
      // Handle cases when idToken might be null or undefined
      if (!idToken) {
        throw new Error('No valid ID token provided for Google authentication');
      }
      
      // For web and native platforms
      const credential = GoogleAuthProvider.credential(idToken);
      console.log('Google credential created successfully');
      
      // Sign in with the credential
      const userCredential = await signInWithCredential(auth, credential);
      console.log('Google sign-in successful');
      
      // Store user data
      await storeUserData(userCredential.user);
    } catch (error: any) {
      console.error('Google sign-in error in AuthContext:', error);
      // Add more specific error handling
      if (error.code === 'auth/invalid-credential') {
        setError('The Google authentication credential is invalid or has expired.');
      } else {
        setError(error.message || 'An unknown error occurred with Google authentication');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setError(null);
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in.");
    }
    try {
      setIsLoading(true);
      await deleteUser(auth.currentUser);
      console.log('User deleted');
      await clearUserData();
    } catch (error: any) {
      setError(error.message);
      console.error("Delete Account Error:", error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to verify if the stored token is still valid
  const verifyToken = async (): Promise<boolean> => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) return false;
      
      // If we have a current user, try to refresh the token
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        return true;
      }
      
      // Check if we have persistent data
      const persistenceData = await AsyncStorage.getItem(AUTH_PERSISTENCE_KEY);
      if (!persistenceData) return false;
      
      // This is a simplified check - in a production app, you might want
      // to verify the token with your backend
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOutUser,
        signInWithGoogle,
        deleteAccount,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 