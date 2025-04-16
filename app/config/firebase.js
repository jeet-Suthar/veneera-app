// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// Import Analytics conditionally to avoid errors in React Native
import { isSupported, getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { Platform } from 'react-native';

// @ts-ignore
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpsdqQ4RL1KWb-9359j5-H7k8Qqgqrt2A",
  authDomain: "teethsi-app.firebaseapp.com",
  projectId: "teethsi-app",
  storageBucket: "teethsi-app.firebasestorage.app",
  messagingSenderId: "729681182814",
  appId: "1:729681182814:web:65ebcdab4982e7cae074cf",
  measurementId: "G-W72XM2BHM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics only if supported (won't run in React Native environment)
let analytics = null;
// This check is needed because Firebase Analytics is not supported in React Native
if (typeof window !== 'undefined') {
  // Only initialize analytics in web environments
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

// Initialize Auth with proper persistence for React Native
let auth;
// Use different initialization based on platform
if (Platform.OS === 'web') {
  // For web, use standard getAuth
  auth = getAuth(app);
} else {
  // For React Native (iOS/Android), use persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { auth, app, db }; 