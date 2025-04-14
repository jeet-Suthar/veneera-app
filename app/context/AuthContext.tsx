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

// Keys for AsyncStorage
const USER_STORAGE_KEY = '@auth_user';
const TOKEN_STORAGE_KEY = '@auth_token';

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
      const token = await user.getIdToken();
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
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
    const attemptStoredUserLogin = async () => {
      try {
        // Check for stored user data
        const storedUserData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedUserData && storedToken) {
          // We have stored user data and token
          const userData = JSON.parse(storedUserData);
          console.log('Found stored auth data, attempting to restore session');
          
          // Update the user state with stored data
          // This will show the user as logged in immediately while Firebase validates
          setUser(userData as any);
          
          // Try to use the token with Firebase if needed
          // But we'll let onAuthStateChanged handle the final verification
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in, store their data securely
        await storeUserData(currentUser);
      } else {
        // No authenticated user
        await clearUserData();
      }
      
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      setIsLoading(true);
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
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      await storeUserData(userCredential.user);
    } catch (error: any) {
      setError(error.message);
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