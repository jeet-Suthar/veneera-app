import * as SecureStore from 'expo-secure-store';

// Keys for storing authentication data
export const AUTH_USER_KEY = 'auth_user_data';
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token';

interface StoredUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastLoginAt?: string;
}

/**
 * Store user authentication data securely
 */
export const storeAuthData = async (userData: StoredUserData, token?: string): Promise<boolean> => {
  try {
    // Store user data
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userData));
    
    // Store token if provided
    if (token) {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    }
    
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

/**
 * Retrieve stored user data
 */
export const getStoredUser = async (): Promise<StoredUserData | null> => {
  try {
    const userData = await SecureStore.getItemAsync(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving stored user data:', error);
    return null;
  }
};

/**
 * Retrieve stored auth token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving stored token:', error);
    return null;
  }
};

/**
 * Clear all stored authentication data
 */
export const clearAuthData = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Update specific fields in the stored user data
 */
export const updateStoredUserData = async (updates: Partial<StoredUserData>): Promise<boolean> => {
  try {
    const currentData = await getStoredUser();
    if (!currentData) return false;
    
    const updatedData = { ...currentData, ...updates };
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error updating stored user data:', error);
    return false;
  }
}; 