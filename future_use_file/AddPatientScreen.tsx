import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ColorSchemeName,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as ThemeColors } from '../utils/theme'; // Assuming Colors is exported from theme
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import * as ImagePicker from 'expo-image-picker';

// Define the structure of your theme colors
interface Theme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  // Add other colors from your Colors util if needed
}

// Define the structure for patient data
interface PatientData {
  name: string;
  age: string;
  phone: string;
  email: string;
  notes: string;
}

// Veneer options (using 'as const' for stricter typing)
const SHAPES = ["Natural", "Hollywood", "Cannie", "Oval", "Celebrity"] as const;
const COLORS = ["Pearl White", "Ivory", "Silk White", "Natural Beige"] as const;

// Infer types from the const arrays
type Shape = typeof SHAPES[number];
type Color = typeof COLORS[number];

const AddPatientScreen: FC = () => {
  const colorScheme: ColorSchemeName = useColorScheme();
  // Provide type safety for the theme object
  const theme: Theme = ThemeColors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [step, setStep] = useState<number>(1);
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [image, setImage] = useState<string | null>(null); // URI is a string
  const [generatedImages, setGeneratedImages] = useState<(string | null)[]>([null, null, null, null]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([false, false, false, false]);
  const [errorMessages, setErrorMessages] = useState<(string | null)[]>([null, null, null, null]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // URI is a string

  const [shape, setShape] = useState<Shape>("Natural");
  const [color, setColor] = useState<Color>(COLORS[0]);

  const handleNext = (): void => {
    if (step === 1 && patientData.name.trim() && patientData.age.trim()) {
      setStep(2);
    } else if (step === 1) {
      Alert.alert("Missing Information", "Please enter patient's name and age.");
    }
  };

  const handleImageUpload = async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3], // Keep original aspect ratio if needed
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        console.log('Image URI selected:', uri); // Log the URI
        setImage(uri); // Set the state for the preview
        setGeneratedImages([null, null, null, null]); // Reset previous results
        setErrorMessages([null, null, null, null]); // Reset previous errors
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading the image.');
      console.error("Image upload error:", error);
    }
  };

  const generateImages = async (): Promise<void> => {
    if (!image) {
      Alert.alert('No image', 'Please upload an image first.');
      return;
    }

    setGeneratedImages([null, null, null, null]);
    setLoadingStates([true, true, true, true]);
    setErrorMessages([null, null, null, null]);

    const formData = new FormData();
    const uriParts = image.split('/');
    const filename = uriParts[uriParts.length - 1];

    let fileType = 'image/jpeg'; // Default
    if (filename.includes('.')) {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (extension === 'png') fileType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
    }

    formData.append('image', {
      uri: image,
      name: filename,
      type: fileType,
    } as any); // Using 'as any' for simplicity
    formData.append('shape', shape);
    formData.append('color', color);

    // **IMPORTANT**: Replace with your actual API endpoint
    const url = 'https://c531-3-238-118-170.ngrok-free.app/generate';

    for (let i = 0; i < 4; i++) {
      // Pass the same formData, assuming the server handles generating
      // multiple variations from one upload call or is called independently.
      fetchImage(url, formData, i);
    }
  };

 const fetchImage = async (url: string, formData: FormData, index: number): Promise<void> => {
    try {
        console.log(`Starting fetch for generated image ${index}`);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                // Content-Type is usually set automatically for FormData
            },
        });

        console.log(`Response status for generated image ${index}:`, response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error for generated image ${index}: ${response.status}`, errorText);
            throw new Error(`Server error: ${response.status}. ${errorText.substring(0, 100)}`);
        }

        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        console.log(`Generated blob ${index}: Size=${blob.size}, Type=${blob.type}, Server Content-Type=${contentType}`);

        const base64data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                if (!result || !result.startsWith('data:image')) {
                     console.warn(`Generated base64 for image ${index} might be invalid: ${result.substring(0,100)}...`);
                     // You could attempt a fix here if needed, e.g., using blob.type
                     // if (result && blob.type.startsWith('image/')) {
                     //    resolve(`data:${blob.type};base64,${result.split(',')[1] || ''}`); return;
                     // }
                }
                console.log(`Generated image URI (first 70 chars) for index ${index}: ${result.substring(0, 70)}...`);
                resolve(result);
            };
            reader.onerror = (error) => {
                console.error(`FileReader error for generated image ${index}:`, error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });

        setGeneratedImages(prev => {
            const newImages = [...prev];
            newImages[index] = base64data;
            return newImages;
        });

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
        console.log("Opening image in modal:", imageUri.substring(0, 100) + "...");
        setSelectedImage(imageUri);
        setModalVisible(true);
    }
  };

  const handleInputChange = (field: keyof PatientData, value: string): void => {
    setPatientData(prev => ({ ...prev, [field]: value }));
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

  // Component to render the error state in generated image boxes
  const ErrorDisplay = ({ message, theme }: { message: string, theme: Theme }) => (
    <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="red" />
        <Text style={[styles.errorText, { color: 'red' }]}>{message}</Text>
    </View>
  );

  // Component to render the empty placeholder in generated image boxes
  const EmptyPlaceholder = ({ index, theme }: { index: number, theme: Theme }) => (
     <View style={styles.emptyBoxContainer}>
        <MaterialCommunityIcons name="image-outline" size={30} color={theme.textSecondary}/>
        <Text style={[styles.emptyBoxText, { color: theme.textSecondary }]}>
            Slot {index + 1}
        </Text>
     </View>
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
         style={styles.scrollView}
         contentContainerStyle={{ paddingBottom: 30 }} // Add padding to bottom
         keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside inputs
      >
        {step === 1 ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>New Patient</Text>
            <View style={styles.form}>
              {/* Input Fields */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={patientData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter patient's full name"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Age</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={patientData.age}
                  onChangeText={(text) => handleInputChange('age', text)}
                  placeholder="Enter patient's age"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={patientData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Enter phone number (optional)"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Next Button */}
              <Pressable
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </View>
          </>
        ) : ( // Step 2: Image Upload and Generation
          <View style={styles.imageUploadContainer}>
            <Text style={[styles.title, { color: theme.text }]}>Upload Photo & Generate</Text>

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
                 {/* --- Uploaded Image Preview --- */}
                 {/* Added TouchableOpacity to allow re-uploading by tapping the preview */}
                 <TouchableOpacity onPress={handleImageUpload} style={{ width: '100%' }}>
                    <Image
                        source={{ uri: image }}
                        style={styles.imagePreview} // Uses the original style
                        resizeMode="contain" // Changed to contain to see the whole image
                        onError={(e) => { // Add error handler for preview image
                           console.error("Error loading preview image:", e.nativeEvent.error);
                           Alert.alert("Error", "Could not load the selected preview image.");
                           setImage(null); // Reset if it fails to load
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
                      loadingStates.some(state => state) && { backgroundColor: theme.textSecondary } // Visual disable state
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

                {/* Generated Images Grid */}
                <View style={styles.generatedImages}>
                  {loadingStates.map((isLoading, index) => ( // Map over loading states to ensure 4 boxes
                    <View key={index} style={[styles.imageBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                      ) : errorMessages[index] ? (
                         <ErrorDisplay message={errorMessages[index]!} theme={theme} />
                      ) : generatedImages[index] ? (
                        <TouchableOpacity
                          onPress={() => handleImagePress(generatedImages[index])}
                          style={styles.generatedImageTouchable} // Added style for touchable area
                        >
                          <Image
                            source={{ uri: generatedImages[index]! }} // Use non-null assertion as we checked
                            style={styles.generatedImagePreview}
                            resizeMode="cover"
                            onError={(e) => console.log(`Error loading generated image ${index}:`, e.nativeEvent.error)}
                          />
                        </TouchableOpacity>
                      ) : (
                         <EmptyPlaceholder index={index} theme={theme} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal for Image Zoom */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Use SafeAreaView for content inside modal */}
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
                contentContainerStyle={{ flex: 1 }} // Helps image fill if needed
              >
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.modalImage} // Ensure this style works
                  resizeMode="contain"
                  onError={(e) => {
                      console.error("Error loading image in modal:", e.nativeEvent.error, 'URI:', selectedImage.substring(0,100));
                      Alert.alert("Error", "Could not load the selected image.");
                      setModalVisible(false); // Close modal on error
                  }}
                />
              </ReactNativeZoomableView>
            )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles (Using the original styles + necessary additions/fixes) ---
const styles = StyleSheet.create({
  // --- Original Styles ---
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageUploadContainer: {
    flex: 1, // Takes remaining space if needed
    alignItems: 'center', // Center upload button if no image shown yet
  },
  uploadButton: {
    width: '100%',
    maxWidth: 350, // Prevent it being overly wide on large screens
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Added padding inside the button
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center', // Ensure text is centered
  },
  imagePreviewContainer: {
    width: '100%', // Takes full width
    alignItems: 'center', // Center preview image and other content
  },
  imagePreview: { // Style for the initially uploaded image
    width: '100%',
    height: 200, // Original height
    borderRadius: 12, // Original border radius
    marginBottom: 16, // Original margin
    backgroundColor: '#e0e0e0', // Added background color for placeholder visibility
  },
  generatedImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%', // Ensure grid takes full width
  },
  imageBox: { // Container for each generated image/loader/error
    width: '48%',
    aspectRatio: 1, // Make boxes square
    height: undefined, // Let aspect ratio calculate height
    borderRadius: 8,
    borderWidth: 1,
    // borderStyle: 'dashed', // Original style had dashed here too
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden', // Important for Image borderRadius or fitting content
  },
  emptyBoxText: { // Text inside the empty placeholder box
    fontSize: 12, // Made text smaller
    marginTop: 4, // Spacing from icon
    textAlign: 'center',
  },
  generatedImagePreview: { // The actual generated image inside the box
    width: '100%',
    height: '100%',
    // borderRadius: 8, // Let parent View handle clipping with overflow: 'hidden'
  },
  loadingContainer: { // For ActivityIndicator
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { // Text for error messages in the box
    textAlign: 'center',
    paddingHorizontal: 8, // Add horizontal padding
    fontSize: 12, // Smaller error text
    marginTop: 4,
  },
  modalContainer: { // Original style, might be fine if SafeAreaView is inside
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    // Adjusted positioning to be relative to SafeAreaView top/right
    top: Platform.OS === 'ios' ? 10 : 20, // Adjust as needed
    right: 15,
    zIndex: 10, // Ensure it's above everything else
    padding: 8, // Make touch target slightly larger
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
    borderRadius: 20, // Make it round
  },
  zoomableView: {
    flex: 1, // Take available space within the modal SafeAreaView
    width: '100%',
  },
  modalImage: { // Style for the image inside the zoom view
    width: '100%',
    height: '100%', // Critical for resizeMode="contain" to work well in zoom view
  },
  optionsContainer: { // Container for shape/color options
    marginVertical: 8, // Original margin
    width: '100%', // Ensure it takes full width
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  optionsRow: { // Row containing the buttons
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Use gap for spacing between buttons
  },
  optionButton: { // Individual shape/color button
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    // Removed margins, rely on 'gap' in optionsRow
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // --- Added/Modified Styles ---
  modalContainerSafeArea: { // Use SafeAreaView as the root inside the Modal
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)', // Apply background here now
    // Removed justifyContent/alignItems to allow zoom view full control
  },
   generatedImageTouchable: { // Ensure touchable fills the box
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
  },
  errorContainer: { // Container for error icon + text in generated box
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Take available space
  },
  emptyBoxContainer: { // Container for empty state icon + text
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default AddPatientScreen;