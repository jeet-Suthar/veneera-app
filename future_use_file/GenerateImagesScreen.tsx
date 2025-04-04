import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PatientData } from '../tabs/AddPatientScreen';
import { savePatientImages } from '../utils/patientImages';
import { useTheme } from '@react-navigation/native';

// Veneer options
const SHAPES = ["Natural", "Hollywood", "Cannie", "Oval", "Celebrity"] as const;
const COLORS = ["Pearl White", "Ivory", "Silk White", "Natural Beige"] as const;

// Infer types from the const arrays
type Shape = typeof SHAPES[number];
type Color = typeof COLORS[number];

// Define constants at the top of the file
const SERVER_URL = 'https://c531-3-238-118-170.ngrok-free.app';
const DEFAULT_IMAGES_TO_GENERATE = 4;

export default function GenerateImagesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  // Get patient data from params
  const params = useLocalSearchParams();
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    phone: '',
    email: '',
    notes: '',
  });

  // Safely extract parameter values once during initial render
  useEffect(() => {
    if (params) {
      setPatientData({
        name: String(params.name || ''),
        age: String(params.age || ''),
        phone: String(params.phone || ''),
        email: String(params.email || ''),
        notes: String(params.notes || ''),
      });
    }
  }, []); // Empty dependency array - run only once on mount

  const [image, setImage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState('');
  const [imagesToGenerate, setImagesToGenerate] = useState(DEFAULT_IMAGES_TO_GENERATE);
  const [shape, setShape] = useState<Shape>(SHAPES[0]);
  const [color, setColor] = useState<Color>(COLORS[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageUpload = async (): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'You need to grant access to your photos to upload an image.');
        return;
      }
      
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const selectedAsset = pickerResult.assets[0];
        setSelectedImage(selectedAsset.uri);
        setImage(selectedAsset.uri);
        console.log('Image selected:', selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was an error picking the image.');
    }
  };

  const generateImages = async (): Promise<void> => {
    if (!image) {
      Alert.alert('No image', 'Please upload an image first.');
      return;
    }

    // Clear previous images and set loading states
    setGeneratedImages(['', '', '', '']);
    setLoadingStates([true, true, true, true]);
    setErrorMessages(['', '', '', '']);

    // Create FormData for request
    const formData = new FormData();
    const uriParts = image.split('/');
    const filename = uriParts[uriParts.length - 1];

    let fileType = 'image/jpeg';
    if (filename.includes('.')) {
      const extension = filename.split('.').pop()?.toLowerCase();
      if (extension === 'png') fileType = 'image/png';
      else if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
    }

    // Create image data in the proper format for React Native
    const imageData = {
      uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
      type: fileType,
      name: filename,
    };

    // Add data to FormData
    formData.append('image', imageData as any);
    formData.append('shape', shape);
    formData.append('color', color);

    // Server endpoint
    const serverUrl = 'https://c531-3-238-118-170.ngrok-free.app/generate';
    console.log('Sending request to server:', serverUrl);
    
    try {
      console.log('Starting image generation process');
      console.log('Image data:', JSON.stringify(imageData));
      console.log('Shape:', shape);
      console.log('Color:', color);
      
      // Generate images sequentially
      for (let i = 0; i < 4; i++) {
        await fetchImage(serverUrl, formData, i);
      }
    } catch (error) {
      console.error('Server error:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      
      // Reset loading states
      setLoadingStates([false, false, false, false]);
    }
  };

  const fetchImage = async (url: string, formData: FormData, index: number): Promise<void> => {
    try {
        console.log(`Starting fetch for generated image ${index}`);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'image/jpeg, image/png, image/*',
            },
        });

        console.log(`Response status for generated image ${index}:`, response.status);
        
        // Check content type to determine how to handle the response
        const contentType = response.headers.get('Content-Type') || '';
        console.log(`Response content type for image ${index}:`, contentType);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error for generated image ${index}: ${response.status}`, errorText);
            throw new Error(`Server error: ${response.status}`);
        }

        // Handle different response types
        let imageUri = '';
        
        if (contentType.includes('application/json')) {
            // If the server returns JSON (which might include an image URL)
            const jsonData = await response.json();
            console.log(`Received JSON response for image ${index}:`, JSON.stringify(jsonData).substring(0, 100) + '...');
            
            // Check if JSON contains image data in a known format
            if (jsonData.image) {
                imageUri = jsonData.image;
            } else if (jsonData.url) {
                imageUri = jsonData.url;
            } else if (jsonData.data) {
                // Handle base64 data if it's directly in the JSON
                imageUri = typeof jsonData.data === 'string' 
                    ? jsonData.data.startsWith('data:') 
                        ? jsonData.data 
                        : `data:image/jpeg;base64,${jsonData.data}`
                    : '';
            }
            
            if (imageUri) {
                console.log(`Extracted image URI from JSON for image ${index}, length: ${imageUri.length}`);
            } else {
                throw new Error("Couldn't extract image data from JSON response");
            }
        } else if (contentType.includes('image/')) {
            // If the server returns an image directly
            const blob = await response.blob();
            console.log(`Received blob for image ${index}, size: ${blob.size}, type: ${blob.type}`);
            
            // Convert blob to base64
            imageUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    if (result) {
                        console.log(`Converted blob to data URI for image ${index}, length: ${result.length}`);
                        resolve(result);
                    } else {
                        reject(new Error('FileReader returned empty result'));
                    }
                };
                reader.onerror = (error) => {
                    console.error(`FileReader error for image ${index}:`, error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });
        } else {
            // Unknown response type - try to handle as image anyway
            console.warn(`Unknown content type ${contentType} for image ${index}, trying to handle as binary`);
            const blob = await response.blob();
            
            // Force the MIME type based on what we expect
            const forcedBlob = new Blob([blob], { type: 'image/jpeg' });
            
            imageUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    if (result) {
                        console.log(`Forced blob as image/jpeg for image ${index}, length: ${result.length}`);
                        resolve(result);
                    } else {
                        reject(new Error('FileReader returned empty result'));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(forcedBlob);
            });
        }

        // Set the image in state
        console.log(`Setting image ${index} in state, URI length: ${imageUri.length}`);
        if (imageUri) {
            setGeneratedImages(prev => {
                const newImages = [...prev];
                newImages[index] = imageUri;
                return newImages;
            });
        } else {
            throw new Error('Failed to get a valid image URI');
        }

    } catch (error: any) {
        console.error(`Error generating image ${index}:`, error);
        setErrorMessages(prev => {
            const newErrors = [...prev];
            newErrors[index] = `Failed (${error.message || 'Unknown error'})`;
            return newErrors;
        });
    } finally {
        setLoadingStates(prev => {
            const newLoading = [...prev];
            newLoading[index] = false;
            return newLoading;
        });
    }
  };

  const handleImagePress = (imageUri: string | null): void => {
    if (imageUri) {
        setSelectedImage(imageUri);
        setModalVisible(true);
    }
  };

  const renderShapeButtons = (): JSX.Element => {
    return (
      <View style={styles.optionsContainer}>
        <Text style={[styles.optionTitle, { color: theme.textSecondary }]}>Veneer Shape</Text>
        <View style={styles.optionsRow}>
          {SHAPES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.optionButton,
                {
                  backgroundColor: shape === s ? theme.primary : theme.surface,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setShape(s)}
            >
              <Text style={[
                styles.optionButtonText,
                { color: shape === s ? 'white' : theme.text }
              ]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderColorButtons = (): JSX.Element => {
    return (
      <View style={styles.optionsContainer}>
        <Text style={[styles.optionTitle, { color: theme.textSecondary }]}>Veneer Color</Text>
        <View style={styles.optionsRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.optionButton,
                {
                  backgroundColor: color === c ? theme.primary : theme.surface,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setColor(c)}
            >
              <Text style={[
                styles.optionButtonText,
                { color: color === c ? 'white' : theme.text }
              ]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Error state in generated image boxes
  const ErrorDisplay = ({ message }: { message: string }) => (
    <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="red" />
        <Text style={[styles.errorText, { color: 'red' }]}>{message}</Text>
    </View>
  );

  // Empty placeholder in generated image boxes
  const EmptyPlaceholder = ({ index }: { index: number }) => (
     <View style={styles.emptyBoxContainer}>
        <MaterialCommunityIcons name="image-outline" size={30} color={theme.textSecondary}/>
        <Text style={[styles.emptyBoxText, { color: theme.textSecondary }]}>
            Slot {index + 1}
        </Text>
     </View>
  );

  useEffect(() => {
    // Log when generated images state changes
    if (generatedImages.some(img => img !== null)) {
      console.log('Generated images updated:', 
        generatedImages.map((img, i) => 
          img ? `Image ${i} present (length: ${img.length})` : `Image ${i} missing`
        )
      );
    }
  }, [generatedImages]);

  // Function to handle image loading failure with fallback
  const handleImageLoadingError = (index: number, error: any) => {
    console.error(`Error loading generated image ${index}:`, error);
    
    // Try to display the error visually
    setErrorMessages(prev => {
      const newErrors = [...prev];
      newErrors[index] = `Error: ${error?.message || 'Failed to load image'}`;
      return newErrors;
    });
    
    // Clear this slot to show the error message
    setGeneratedImages(prev => {
      const newImages = [...prev];
      newImages[index] = ''; // Use empty string instead of null
      return newImages;
    });
  };

  // Add patient selection function
  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    console.log('Patient selected:', patient.name);
  };

  // Add a function to save the generated image to the patient's record
  const saveImageToPatient = async (index: number) => {
    if (!generatedImages[index]) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    try {
      // Generate a patientId from the patient data
      const patientId = patientData.name.replace(/\s+/g, '').toLowerCase() + Date.now().toString().slice(-4);
      
      // Call the savePatientImages function
      await savePatientImages(
        patientId,
        image || '', 
        [generatedImages[index]]
      );
      Alert.alert('Success', 'Image saved to patient record');
    } catch (error) {
      console.error('Error saving patient image:', error);
      Alert.alert('Error', 'Failed to save image to patient record');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>AI Image Generation</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView
         style={styles.scrollView}
         contentContainerStyle={{ paddingBottom: 30 }}
         keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageUploadContainer}>
          <Text style={[styles.patientName, { color: theme.text }]}>
            {patientData.name}
          </Text>
          <Text style={[styles.patientDetails, { color: theme.textSecondary }]}>
            Age: {patientData.age} 
            {patientData.phone ? ` • Phone: ${patientData.phone}` : ''}
          </Text>

          {/* Conditional Rendering: Upload Button or Image Preview */}
          {!image ? (
            <Pressable
              style={[styles.uploadButton, { borderColor: theme.border }]}
              onPress={handleImageUpload}
            >
              <MaterialCommunityIcons name="camera-plus" size={40} color={theme.primary} />
              <Text style={[styles.uploadText, { color: theme.text }]}>Upload Patient Photo</Text>
            </Pressable>
          ) : (
            <View style={styles.imagePreviewContainer}>
               <TouchableOpacity onPress={handleImageUpload} style={{ width: '100%' }}>
                  <Image
                      source={{ uri: image }}
                      style={styles.imagePreview}
                      resizeMode="contain"
                      onError={(e) => {
                         console.error("Error loading preview image:", e.nativeEvent.error);
                         Alert.alert("Error", "Could not load the selected preview image.");
                         setImage('');
                      }}
                  />
               </TouchableOpacity>

              {/* Shape and Color Buttons */}
              {renderShapeButtons()}
              {renderColorButtons()}

              {/* Generate Button */}
              <Pressable
                style={[
                    styles.button,
                    { backgroundColor: theme.primary, marginVertical: 16 },
                    loadingStates.some(state => state) && { backgroundColor: theme.textSecondary }
                ]}
                onPress={generateImages}
                disabled={loadingStates.some(state => state)}
              >
                {loadingStates.some(state => state) ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Generate Images</Text>
                )}
              </Pressable>

              {/* Generated images grid */}
              <View style={styles.generatedImagesContainer}>
                {Array.from({ length: imagesToGenerate }).map((_, index) => (
                  <View key={index} style={styles.generatedImageWrapper}>
                    {loadingStates[index] ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{ color: theme.text, marginTop: 10 }}>Generating...</Text>
                      </View>
                    ) : errorMessages[index] ? (
                      <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={24} color={theme.error} />
                        <Text style={{ color: theme.error, textAlign: 'center', marginTop: 5 }}>
                          {errorMessages[index]}
                        </Text>
                      </View>
                    ) : generatedImages[index] ? (
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ 
                            uri: generatedImages[index],
                            cache: 'reload' 
                          }}
                          onLoad={() => console.log(`Image ${index} loaded successfully`)}
                          onError={(e) => {
                            console.error(`Error loading image ${index}:`, e.nativeEvent.error);
                            setErrorMessages(prev => {
                              const newErrors = [...prev];
                              newErrors[index] = `Display error: ${e.nativeEvent.error || 'Failed to load'}`;
                              return newErrors;
                            });
                          }}
                          style={styles.generatedImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => saveImageToPatient(index)}
                        >
                          <MaterialIcons name="save-alt" size={20} color="#fff" />
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.emptyImageContainer}>
                        <MaterialIcons name="image" size={40} color="#999999" />
                        <Text style={{ color: "#999999", marginTop: 10 }}>
                          Image will appear here
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Save Button - Only shown when we have at least one generated image */}
              {generatedImages.some(img => img !== '') && (
                <Pressable
                  style={[styles.saveButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    // Generate a mock ID for the patient
                    const patientId = patientData.name.replace(/\s+/g, '').toLowerCase() + Date.now().toString().slice(-4);
                    
                    // First create a clean array with only non-empty values
                    const cleanImages = generatedImages.filter(img => img !== '');
                    
                    // Save the images using our utility
                    savePatientImages(
                      patientId, 
                      image || '', 
                      cleanImages
                    );
                    
                    // Show confirmation and navigate back
                    Alert.alert(
                      "Success",
                      "Images saved and associated with patient record.",
                      [{ text: "OK", onPress: () => router.back() }]
                    );
                  }}
                >
                  <MaterialCommunityIcons name="content-save" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save to Patient Record</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal for Image Zoom */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainerSafeArea}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={30} color="white" />
            </TouchableOpacity>
            {selectedImage && (
              <ReactNativeZoomableView
                maxZoom={3.0}
                minZoom={0.5}
                zoomStep={0.5}
                initialZoom={1.0}
                bindToBorders={true}
                style={styles.zoomableView}
                contentContainerStyle={{ flex: 1 }}
              >
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.modalImage}
                  resizeMode="contain"
                  onError={(e) => {
                      console.error("Error loading image in modal:", e.nativeEvent.error);
                      Alert.alert("Error", "Could not load the selected image.");
                      setModalVisible(false);
                  }}
                />
              </ReactNativeZoomableView>
            )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patientDetails: {
    fontSize: 16,
    marginBottom: 24,
  },
  imageUploadContainer: {
    flex: 1,
    alignItems: 'center',
  },
  uploadButton: {
    width: '100%',
    maxWidth: 350,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  generatedImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  generatedImageWrapper: {
    width: '48%',
    aspectRatio: 1,
    height: undefined,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  emptyImageContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    right: 15,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
  },
  zoomableView: {
    flex: 1,
    width: '100%',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    marginVertical: 8,
    width: '100%',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainerSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emptyBoxContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyBoxText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 