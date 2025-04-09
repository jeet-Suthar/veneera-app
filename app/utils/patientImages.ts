// This is a basic utility for handling patient image storage
// In a real app, you would want to connect this to a backend API

interface PatientImages {
  patientId: string;
  originalImage?: string;
  generatedImages: string[];
}

// Mock storage - in a real app, this would be persisted to AsyncStorage or similar
const patientImagesStore: Record<string, PatientImages> = {};

/**
 * Save images for a patient
 */
export const savePatientImages = (
  patientId: string, 
  originalImage: string, 
  generatedImages: string[]
): void => {
  patientImagesStore[patientId] = {
    patientId,
    originalImage,
    generatedImages: generatedImages.filter(img => img !== null) as string[],
  };
  
  console.log(`Saved ${generatedImages.length} images for patient ${patientId}`);
};

/**
 * Get images for a patient
 */
export const getPatientImages = (patientId: string): PatientImages | null => {
  return patientImagesStore[patientId] || null;
};

/**
 * Check if a patient has images
 */
export const hasPatientImages = (patientId: string): boolean => {
  return !!patientImagesStore[patientId];
};

/**
 * Get all patient images for listing
 */
export const getAllPatientImages = (): PatientImages[] => {
  return Object.values(patientImagesStore);
}; 

export default savePatientImages;