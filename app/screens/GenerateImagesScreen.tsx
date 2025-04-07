import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PatientData } from '../tabs/AddPatientScreen';
import { savePatientImages } from '../utils/patientImages';

// Veneer options
const SHAPES = ["Natural", "Hollywood", "Cannie", "Oval", "Celebrity"] as const;
const COLORS = ["Pearl White", "Ivory", "Silk White", "Natural Beige"] as const;

// Infer types from the const arrays
type Shape = typeof SHAPES[number];
type Color = typeof COLORS[number];

// Define constants at the top of the file
const SERVER_URL = 'https://c531-3-238-118-170.ngrok-free.app';
const DEFAULT_IMAGES_TO_GENERATE = 4;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  }, []); // Run only once

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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const flatListRef = useRef<FlatList<string>>(null);

  // Request media library permission on mount for saving
  useEffect(() => {
    (async () => {
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

  // Custom Action Sheet Modal for Image Source
  const renderSourceModal = () => (
    <Modal
      visible={isSourceModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsSourceModalVisible(false)}
    >
      <Pressable style={styles.modalBackdrop} onPress={() => setIsSourceModalVisible(false)}>
        <View style={[styles.actionSheetContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.actionSheetTitle, { color: theme.textSecondary }]}>Select Image Source</Text>
          <TouchableOpacity
            style={styles.actionSheetButton}
            onPress={() => { setIsSourceModalVisible(false); handleImagePick('camera'); }}
          >
            <MaterialCommunityIcons name="camera-outline" size={22} color={theme.primary} />
            <Text style={[styles.actionSheetButtonText, { color: theme.primary }]}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetButton}
            onPress={() => { setIsSourceModalVisible(false); handleImagePick('library'); }}
          >
            <MaterialCommunityIcons name="image-multiple-outline" size={22} color={theme.primary} />
            <Text style={[styles.actionSheetButtonText, { color: theme.primary }]}>Choose from Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionSheetButton, styles.cancelButton]}
            onPress={() => setIsSourceModalVisible(false)}
          >
            <Text style={[styles.actionSheetButtonText, { color: theme.error }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // Open the custom source modal instead of Alert
  const chooseImageSource = (): void => {
    setIsSourceModalVisible(true);
  };

  // Handle image picking (camera/library)
  const handleImagePick = async (source: 'camera' | 'library'): Promise<void> => {
    try {
      let permissionResult: ImagePicker.PermissionStatus;
      let pickerResult: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        permissionResult = cameraPermission.status;
        if (permissionResult !== 'granted') {
          Alert.alert('Permission required', 'Camera access is needed to take a photo.');
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7, // Compress image quality
        });
      } else { // source === 'library'
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        permissionResult = libraryPermission.status;
        if (permissionResult !== 'granted') {
          Alert.alert('Permission required', 'Photo library access is needed to choose an image.');
          return;
        }
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7, // Compress image quality
        });
      }

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const selectedAsset = pickerResult.assets[0];
        console.log(`Image selected from ${source}:`, selectedAsset.uri);
        console.log(`Image dimensions: ${selectedAsset.width}x${selectedAsset.height}`);
        if (selectedAsset.fileSize) {
            console.log(`Approximate file size: ${(selectedAsset.fileSize / 1024 / 1024).toFixed(2)} MB`);
        }
        setImage(selectedAsset.uri);
        // Reset generated images when a new source image is picked
        setGeneratedImages([]);
        setLoadingStates([]);
        setErrorMessages([]);
      } else {
        console.log('Image picking cancelled or failed');
      }
    } catch (error) {
      console.error(`Error picking image from ${source}:`, error);
      Alert.alert('Error', `There was an error selecting the image from ${source}.`);
    }
  };

  const generateImages = async (): Promise<void> => {
    if (!image) {
      Alert.alert('No image', 'Please upload or take a photo first.');
      return;
    }
    // Reset state for 4 slots
    setGeneratedImages(Array(DEFAULT_IMAGES_TO_GENERATE).fill(''));
    setLoadingStates(Array(DEFAULT_IMAGES_TO_GENERATE).fill(true));
    setErrorMessages(Array(DEFAULT_IMAGES_TO_GENERATE).fill(''));

    const formData = new FormData();
    const uriParts = image.split('/');
    const filename = uriParts.pop() || 'photo.jpg';
    let fileType = 'image/jpeg';
    if (filename.includes('.')) {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (extension === 'png') fileType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
    }

    const imageData = {
      uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
      type: fileType,
      name: filename,
    };

    formData.append('image', imageData as any);
    formData.append('shape', shape);
    formData.append('color', color);

    const serverUrl = `${SERVER_URL}/generate`;
    console.log('Starting image generation batch...');
    
    try {
      const promises = Array.from({ length: DEFAULT_IMAGES_TO_GENERATE }).map((_, i) => 
        fetchImage(serverUrl, formData, i)
      );
      await Promise.all(promises); // Run fetches concurrently if possible
      console.log('Image generation batch finished.');
    } catch (error) {
      console.error('Error during generation batch:', error);
      Alert.alert(
        'Generation Error',
        'An error occurred during image generation. Please check logs or try again.',
        [{ text: 'OK' }]
      );
      // Reset loading states on global error
      setLoadingStates(Array(DEFAULT_IMAGES_TO_GENERATE).fill(false));
    }
  };

  const fetchImage = async (url: string, formData: FormData, index: number): Promise<void> => {
     try {
         console.log(`Starting fetch for generated image ${index}`);
         // Clone formData if running concurrently to avoid issues, otherwise reuse
         const response = await fetch(url, {
             method: 'POST',
             body: formData, 
             headers: { 'Accept': 'image/jpeg, image/png, image/*' },
         });
         console.log(`Response status for generated image ${index}:`, response.status);
         const contentType = response.headers.get('Content-Type') || '';
         console.log(`Response content type for image ${index}:`, contentType);
 
         if (!response.ok) {
             const errorText = await response.text();
             console.error(`Server error for generated image ${index}: ${response.status}`, errorText);
             throw new Error(`Server error: ${response.status}`);
         }
 
         let imageUri = '';
         if (contentType.includes('application/json')) {
             const jsonData = await response.json();
             if (jsonData.image) imageUri = jsonData.image;
             else if (jsonData.url) imageUri = jsonData.url;
             else if (jsonData.data) {
                 imageUri = typeof jsonData.data === 'string' 
                     ? jsonData.data.startsWith('data:') 
                         ? jsonData.data 
                         : `data:image/jpeg;base64,${jsonData.data}`
                     : '';
             }
             if (!imageUri) throw new Error("Couldn't extract image from JSON");
         } else if (contentType.includes('image/')) {
             const blob = await response.blob();
             imageUri = await new Promise<string>((resolve, reject) => {
                 const reader = new FileReader();
                 reader.onload = () => resolve(reader.result as string);
                 reader.onerror = reject;
                 reader.readAsDataURL(blob);
             });
         } else {
             console.warn(`Unknown content type ${contentType}, handling as binary`);
             const blob = await response.blob();
             const forcedBlob = new Blob([blob], { type: 'image/jpeg' }); // Assume jpeg
             imageUri = await new Promise<string>((resolve, reject) => {
                 const reader = new FileReader();
                 reader.onload = () => resolve(reader.result as string);
                 reader.onerror = reject;
                 reader.readAsDataURL(forcedBlob);
             });
         }
 
         console.log(`Setting image ${index} in state, URI length: ${imageUri.length}`);
         setGeneratedImages(prev => {
             const newImages = [...prev];
             newImages[index] = imageUri;
             return newImages;
         });
         setErrorMessages(prev => { // Clear error on success
             const newErrors = [...prev];
             newErrors[index] = '';
             return newErrors;
         });
 
     } catch (error: any) {
         console.error(`Error generating image ${index}:`, error);
         setErrorMessages(prev => {
             const newErrors = [...prev];
             newErrors[index] = `Failed (${error.message || 'Unknown'})`;
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

  const handleImagePress = (index: number): void => {
    if (generatedImages[index]) {
      setSelectedImageIndex(index);
      setModalVisible(true);
    }
  };

  const regenerateImage = async (index: number): Promise<void> => {
    if (!image) {
      Alert.alert('No image', 'Source image is missing.');
      return;
    }
    // Set loading state for this index
    setLoadingStates(prev => prev.map((s, i) => i === index ? true : s));
    setErrorMessages(prev => prev.map((e, i) => i === index ? '' : e));

    const formData = new FormData();
    const uriParts = image.split('/');
    const filename = uriParts.pop() || 'photo.jpg';
    let fileType = 'image/jpeg';
    if (filename.includes('.')) {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (extension === 'png') fileType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
    }
    const imageData = {
      uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
      type: fileType,
      name: filename,
    };
    formData.append('image', imageData as any);
    formData.append('shape', shape);
    formData.append('color', color);

    const serverUrl = `${SERVER_URL}/generate`;
    console.log(`Regenerating image ${index}...`);
    await fetchImage(serverUrl, formData, index);
    console.log(`Finished regeneration attempt for image ${index}`);
  };

  const downloadImage = async () => {
    if (!modalVisible || selectedImageIndex === null) return;
    const imageUri = generatedImages[selectedImageIndex];
    if (!imageUri) return;

    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Need access to media library to save images.");
      return;
    }

    try {
      let fileUri = '';
      // Handle base64 URIs
      if (imageUri.startsWith('data:')) {
        const base64Code = imageUri.split("base64,")[1];
        const filename = `veneera-generated-${Date.now()}.jpg`; // Assume jpg
        fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // Assume it's a remote URL (less likely with current fetch logic, but handle just in case)
        const downloadResult = await FileSystem.downloadAsync(
          imageUri,
          FileSystem.documentDirectory + `veneera-generated-${Date.now()}.jpg`
        );
        fileUri = downloadResult.uri;
      }

      // Save the file to the media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Veneera Generated", asset, false);
      Alert.alert("Success", "Image saved to your gallery in the 'Veneera Generated' album.");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Could not save the image to your gallery.");
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

  const renderGeneratedImage = (index: number) => {
    return (
      <View key={index} style={[styles.generatedImageWrapper, { borderColor: theme.border }]}>
        {loadingStates[index] ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.text, marginTop: 10 }}>Generating...</Text>
          </View>
        ) : errorMessages[index] ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={24} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errorMessages[index]}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => regenerateImage(index)}
            >
              <MaterialIcons name="refresh" size={18} color="white" />
              <Text style={{ color: 'white', marginLeft: 5, fontSize: 12 }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : generatedImages[index] ? (
          <View style={styles.imageContainer}>
            <TouchableOpacity 
              style={styles.generatedImageTouchable}
              onPress={() => handleImagePress(index)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: generatedImages[index], cache: 'reload' }}
                style={styles.generatedImage}
                resizeMode="cover"
                onError={(e) => {
                  console.error(`Error loading image ${index} in grid:`, e.nativeEvent.error);
                  setErrorMessages(prev => {
                    const newErrors = [...prev];
                    newErrors[index] = `Display error: ${e.nativeEvent.error || 'Failed to load'}`;
                    return newErrors;
                  });
                }}
              />
              <View style={styles.imageTapHint}>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 10, fontWeight: 'bold' }}>
                  Tap to View
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.regenerateIconButton}
              onPress={() => regenerateImage(index)}
            >
              <MaterialIcons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyImageContainer}>
            <MaterialIcons name="image-search" size={40} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>
              Slot {index + 1}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Callback for FlatList view change in modal
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<any> }) => {
    if (viewableItems.length > 0) {
      setSelectedImageIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

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
          <Text style={[styles.patientName, { color: theme.text }]}>{patientData.name}</Text>
          <Text style={[styles.patientDetails, { color: theme.textSecondary }]}>
            Age: {patientData.age} {patientData.phone ? `• Phone: ${patientData.phone}` : ''}
          </Text>
          {!image ? (
            <Pressable style={[styles.uploadButton, { borderColor: theme.border }]} onPress={chooseImageSource}>
              <MaterialCommunityIcons name="camera-plus-outline" size={40} color={theme.primary} />
              <Text style={[styles.uploadText, { color: theme.text }]}>Upload or Take Photo</Text>
            </Pressable>
          ) : (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity onPress={chooseImageSource} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
                  <View style={styles.editIconOverlay}>
                      <MaterialIcons name="edit" size={18} color="white" />
                  </View>
              </TouchableOpacity>
              {renderShapeButtons()}
              {renderColorButtons()}
              <Pressable
                style={[styles.button, { backgroundColor: theme.primary, marginVertical: 16 }, loadingStates.some(state => state) && { backgroundColor: theme.textSecondary }]}
                onPress={generateImages}
                disabled={loadingStates.some(state => state)}
              >
                {loadingStates.some(state => state) ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.buttonText}>Generate Images</Text>}
              </Pressable>
              <View style={styles.generatedImagesContainer}>
                {Array.from({ length: DEFAULT_IMAGES_TO_GENERATE }).map((_, index) => renderGeneratedImage(index))}
              </View>

              {/* TODO: Add save all generated images */}
              
              {/* {generatedImages.filter(img => img).length > 0 && (
                <Pressable
                  style={[styles.saveButton, { backgroundColor: theme.success }]}
                  onPress={() => {
                    const patientId = patientData.name.replace(/\s+/g, '').toLowerCase() + Date.now().toString().slice(-4);
                    const cleanImages = generatedImages.filter(img => img);
                    savePatientImages(patientId, image || '', cleanImages);
                    Alert.alert("Success", "Images saved.", [{ text: "OK", onPress: () => router.back() }]);
                  }}
                >
                  <MaterialCommunityIcons name="content-save-all-outline" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save All Generated</Text>
                </Pressable>
              )} */}


            </View>
          )}
        </View>
      </ScrollView>

      {renderSourceModal()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainerSafeArea} edges={['top', 'bottom']}>
           <StatusBar backgroundColor="black" barStyle="light-content" />
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalHeaderButton} onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>
                  {selectedImageIndex + 1} / {generatedImages.filter(Boolean).length}
              </Text>
              <View style={{ flexDirection: 'row', gap: 15 }}>
                 <TouchableOpacity style={styles.modalHeaderButton} onPress={downloadImage}>
                   <MaterialCommunityIcons name="download-outline" size={24} color="white" />
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.modalHeaderButton} onPress={() => regenerateImage(selectedImageIndex)}>
                   <MaterialIcons name="refresh" size={24} color="white" />
                 </TouchableOpacity>
              </View>
            </View>

            {/* Image FlatList for Swiping & Zooming */}
            <FlatList
              ref={flatListRef}
              data={generatedImages.filter(img => img)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `generated-${index}`}
              initialScrollIndex={selectedImageIndex}
              getItemLayout={(data, index) => (
                { length: screenWidth, offset: screenWidth * index, index }
              )}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={({ item, index }) => (
                <View style={styles.modalPage}>
                  <ReactNativeZoomableView
                    maxZoom={2.5}
                    minZoom={1}
                    initialZoom={1}
                    bindToBorders={true}
                    style={styles.zoomableView}
                  >
                    <Image
                      source={{ uri: item, cache: 'reload' }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </ReactNativeZoomableView>
                </View>
              )}
            />
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
    height: 180,
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
    position: 'relative',
  },
  imagePreviewWrapper: {
      width: '100%',
      position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
  },
  editIconOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    borderRadius: 15,
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
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4%',
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  generatedImageTouchable: {
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
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
    width: screenWidth,
    height: screenHeight,
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
    backgroundColor: 'black',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalHeaderButton: {
      padding: 8,
  },
  modalHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalPage: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingTop: 12,
  },
  actionSheetTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    marginBottom: 8,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 15,
  },
  actionSheetButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  imageTapHint: {
    position: 'absolute',
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  regenerateIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 