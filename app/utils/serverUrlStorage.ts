import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

// Constants
const URL_CACHE_KEY = 'server_url_cache';
const URL_CACHE_EXPIRY_KEY = 'server_url_cache_expiry';
const CACHE_DURATION_MS = 1000; // 1 hour

/**
 * Fetches the server URL from Firestore and caches it
 * @returns Promise<string> The server URL
 */
export const getServerUrl = async (): Promise<string> => {
  try {
    // Check cache first
    const cachedUrl = await getCachedUrl();
    if (cachedUrl) {
      console.log('Using cached server URL');
      return cachedUrl;
    }

    // If not in cache, fetch from Firestore
    console.log('Fetching server URL from Firestore...');
    const urlDoc = await getDoc(doc(db, 'url', 'ngrok_url'));
    
    if (urlDoc.exists()) {
      const data = urlDoc.data();
      const url = data.url;
      
      // Cache the URL
      await cacheUrl(url);
      
      console.log('Server URL fetched and cached');
      return url;
    } else {
      console.warn('Server URL document not found in Firestore');
      // Return fallback URL if Firestore fetch fails
      return 'https://c531-3-238-118-170.ngrok-free.app';
    }
  } catch (error) {
    console.error('Error fetching server URL:', error);
    // Return fallback URL if Firestore fetch fails
    return 'https://c531-3-238-118-170.ngrok-free.app';
  }
};

/**
 * Caches the server URL in SecureStore
 * @param url The server URL to cache
 */
const cacheUrl = async (url: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(URL_CACHE_KEY, url);
    await SecureStore.setItemAsync(URL_CACHE_EXPIRY_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching server URL:', error);
  }
};

/**
 * Gets the cached server URL if it's still valid
 * @returns The cached URL or null if not found or expired
 */
const getCachedUrl = async (): Promise<string | null> => {
  try {
    const url = await SecureStore.getItemAsync(URL_CACHE_KEY);
    const expiryTimestamp = await SecureStore.getItemAsync(URL_CACHE_EXPIRY_KEY);
    
    if (!url || !expiryTimestamp) return null;
    
    const expiry = parseInt(expiryTimestamp);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - expiry > CACHE_DURATION_MS) {
      console.log('Server URL cache expired');
      return null;
    }
    
    return url;
  } catch (error) {
    console.error('Error retrieving cached server URL:', error);
    return null;
  }
};

/**
 * Clears the cached server URL
 */
export const clearCachedUrl = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(URL_CACHE_KEY);
    await SecureStore.deleteItemAsync(URL_CACHE_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing cached server URL:', error);
  }
}; 