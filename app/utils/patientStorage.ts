import * as SecureStore from 'expo-secure-store';
import { Patient } from '../types';

// Helper function to sanitize keys for SecureStore
export const sanitizeKey = (key: string): string => {
  // Replace disallowed characters (like '@' and '.') with underscores
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
};

// Get current logged in user
export const getCurrentUser = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('currentUser');
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Set current user (on login)
export const setCurrentUser = async (userId: string): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync('currentUser', userId);
    return true;
  } catch (error) {
    console.error('Error setting current user:', error);
    return false;
  }
};

// Clear current user (on logout)
export const clearCurrentUser = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync('currentUser');
    return true;
  } catch (error) {
    console.error('Error clearing current user:', error);
    return false;
  }
};

// Get all patients for current user
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];
    
    const patientsJson = await SecureStore.getItemAsync(`patients_${currentUser}`);
    if (!patientsJson) return [];
    
    return JSON.parse(patientsJson);
  } catch (error) {
    console.error('Error getting patients:', error);
    return [];
  }
};

// Save patients for current user
export const savePatients = async (patients: Patient[]): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;
    
    await SecureStore.setItemAsync(`patients_${currentUser}`, JSON.stringify(patients));
    return true;
  } catch (error) {
    console.error('Error saving patients:', error);
    return false;
  }
};

// Add a new patient
export const addPatient = async (patient: Patient): Promise<boolean> => {
  try {
    const patients = await getPatients();
    patients.push(patient);
    return await savePatients(patients);
  } catch (error) {
    console.error('Error adding patient:', error);
    return false;
  }
};

// Get a specific patient by ID
export const getPatient = async (patientId: string): Promise<Patient | null> => {
  try {
    const patients = await getPatients();
    return patients.find(p => p.id === patientId) || null;
  } catch (error) {
    console.error('Error getting patient:', error);
    return null;
  }
};

// Update a specific patient
export const updatePatient = async (patientId: string, updatedData: Partial<Patient>): Promise<boolean> => {
  try {
    const patients = await getPatients();
    const index = patients.findIndex(p => p.id === patientId);
    
    if (index === -1) return false;
    
    patients[index] = { ...patients[index], ...updatedData };
    return await savePatients(patients);
  } catch (error) {
    console.error('Error updating patient:', error);
    return false;
  }
};

// Delete a patient
export const deletePatient = async (patientId: string): Promise<boolean> => {
  try {
    const patients = await getPatients();
    const filtered = patients.filter(p => p.id !== patientId);
    
    if (filtered.length === patients.length) return false; // No patient was removed
    
    return await savePatients(filtered);
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
};

// Get patients for a specific user
export const getPatientsForUser = async (userId: string): Promise<Patient[]> => {
  const sanitizedUserId = sanitizeKey(userId);
  const key = `patients_${sanitizedUserId}`;
  try {
    const patientsJson = await SecureStore.getItemAsync(key);
    return patientsJson ? JSON.parse(patientsJson) : [];
  } catch (error) {
    console.error(`Error getting patients for user ${userId}:`, error);
    return [];
  }
};

// Save patients for a specific user
export const savePatientsForUser = async (userId: string, patients: Patient[]): Promise<boolean> => {
  const sanitizedUserId = sanitizeKey(userId);
  const key = `patients_${sanitizedUserId}`;
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(patients));
    return true;
  } catch (error) {
    console.error(`Error saving patients for user ${userId}:`, error);
    return false;
  }
}; 