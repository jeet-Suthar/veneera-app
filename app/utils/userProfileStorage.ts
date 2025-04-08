import * as SecureStore from 'expo-secure-store';
import { sanitizeKey } from './patientStorage';

export interface UserProfile {
  name: string;
  photoUrl: string;
  yearsOfExperience: number;
  totalPatients: number;
  bio: string;
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const sanitizedUserId = sanitizeKey(userId);
    const key = `profile_${sanitizedUserId}`;
    const profileJson = await SecureStore.getItemAsync(key);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Save user profile
export const saveUserProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
  try {
    const sanitizedUserId = sanitizeKey(userId);
    const key = `profile_${sanitizedUserId}`;
    await SecureStore.setItemAsync(key, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    const currentProfile = await getUserProfile(userId);
    if (!currentProfile) return false;

    const updatedProfile = { ...currentProfile, ...updates };
    return await saveUserProfile(userId, updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}; 