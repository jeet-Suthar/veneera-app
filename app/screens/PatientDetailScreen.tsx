import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, useColorScheme, ActivityIndicator, Modal, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../utils/theme';
import { Patient } from '../types/index';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getCurrentUser, getPatientsForUser, deletePatient } from '../utils/patientStorage'; // Import helpers and deletePatient
import { useAlert } from '../context/AlertContext';
import { 
  PinchGestureHandler, 
  TapGestureHandler, 
  PanGestureHandler,
  State, 
  GestureHandlerRootView,
  PinchGestureHandlerGestureEvent,
  PanGestureHandlerGestureEvent
} from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define extended patient type with additional fields
type ExtendedPatient = Patient & {
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  userId?: string;
};

export default function PatientDetailScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const alert = useAlert();
  
  const [patient, setPatient] = useState<ExtendedPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  
  // Animated values for pinch zoom
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const lastScale = useSharedValue(1);
  
  // Additional animation values for panning
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);
  
  // Reference for double-tap handler
  const doubleTapRef = React.useRef(null);
  
  // Handle pinch gesture with proper typing
  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onStart: (event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onActive: (event) => {
      // Limit scale between 0.5 and 5
      scale.value = Math.min(Math.max(event.scale * lastScale.value, 0.5), 5);
    },
    onEnd: () => {
      lastScale.value = scale.value;
      // Reset to original scale if zoomed out too much
      if (scale.value < 0.9) {
        scale.value = withTiming(1);
        lastScale.value = 1;
      }
    }
  });
  
  // Handle pan gesture for moving the image when zoomed
  const panHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    },
    onActive: (event) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        // Calculate max pan distance based on current zoom level
        const maxPanX = (scale.value - 1) * SCREEN_WIDTH / 2;
        const maxPanY = (scale.value - 1) * SCREEN_HEIGHT / 2;
        
        // Limit pan to the boundaries of the image
        translateX.value = Math.min(
          Math.max(lastTranslateX.value + event.translationX, -maxPanX),
          maxPanX
        );
        translateY.value = Math.min(
          Math.max(lastTranslateY.value + event.translationY, -maxPanY),
          maxPanY
        );
      }
    },
    onEnd: () => {
      // Add a little spring animation when releasing pan
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);
    }
  });
  
  // Animated style for the image in modal (updated to include translation)
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });
  
  // Reset zoom and translation when modal is closed
  const resetZoom = () => {
    scale.value = 1;
    lastScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    lastTranslateX.value = 0;
    lastTranslateY.value = 0;
    setImageViewerVisible(false);
  };

  // Function to reset zoom on double-tap
  const onDoubleTap = () => {
    if (scale.value !== 1) {
      scale.value = withTiming(1);
      lastScale.value = 1;
    } else {
      // Zoom in to 2x if already at 1x
      scale.value = withTiming(2);
      lastScale.value = 2;
    }
  };

  // Load patient data from SecureStore
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!patientId) {
          setError('No patient ID provided');
          setLoading(false);
          return;
        }
        
        const currentUser = await getCurrentUser(); // Use helper
        if (!currentUser) {
          setError('Not logged in');
          setLoading(false);
          return;
        }
        
        const patients = await getPatientsForUser(currentUser); // Use helper
        const foundPatient = patients.find((p: ExtendedPatient) => p.id === patientId);
        
        if (foundPatient) {
          setPatient(foundPatient);
        } else {
          setError('Patient not found');
        }
      } catch (error) {
        console.error('Error loading patient:', error);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientData();
  }, [patientId]);

  // Function to handle patient deletion
  const handleDeletePatient = async () => {
    if (!patientId) return;
    
    alert.confirm(
      "Delete Patient",
      "Are you sure you want to delete this patient? This action cannot be undone.",
      async () => {
        try {
          setLoading(true);
          const success = await deletePatient(patientId);
          
          if (success) {
            alert.success("Patient deleted successfully");
            router.back();
          } else {
            alert.error("Failed to delete patient");
          }
        } catch (error) {
          console.error('Error deleting patient:', error);
          alert.error("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      },
      undefined,
      "warning"
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 12 }}>Loading patient data...</Text>
      </SafeAreaView>
    );
  }

  if (error || !patient) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Patient Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error || 'Failed to load patient'}</Text>
          <Pressable 
            style={[styles.errorButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: 'white' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Patient Details</Text>
        <Pressable style={styles.actionButton} onPress={handleDeletePatient}>
          <MaterialCommunityIcons name="delete-outline" size={24} color={theme.error} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: patient.photoUrl }} 
            style={styles.patientPhoto}
            defaultSource={require('../../assets/images/default-avatar.png')}
          />
          <Text style={[styles.patientName, { color: theme.text }]}>{patient.name}</Text>
          <Text style={[styles.patientAge, { color: theme.textSecondary }]}>
            Age: {patient.age}
          </Text>
          
          {patient.createdAt && (
            <View style={[styles.nextAppointment, { backgroundColor: theme.secondary }]}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={theme.primary} />
              <Text style={[styles.appointmentText, { color: theme.primary }]}>
                Created: {new Date(patient.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="card-account-details-outline" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          {patient.email && (
            <>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="email-outline" size={18} color={theme.primary} style={styles.infoIcon} />
                <View>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{patient.email}</Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </>
          )}
          
          {patient.phone && (
            <>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="phone-outline" size={18} color={theme.primary} style={styles.infoIcon} />
                <View>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{patient.phone}</Text>
                </View>
              </View>
              {patient.address && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </>
          )}
          
          {patient.address && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.primary} style={styles.infoIcon} />
              <View>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Address</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{patient.address}</Text>
              </View>
            </View>
          )}
          
          {!patient.email && !patient.phone && !patient.address && (
            <View style={styles.infoItem}>
              <Text style={[styles.infoValue, { color: theme.textSecondary, textAlign: 'center', width: '100%' }]}>
                No contact information available
              </Text>
            </View>
          )}
        </View>

        {/* Notes Section (if available) */}
        {patient.notes && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            </View>

            <View style={[styles.noteCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.noteText, { color: theme.text }]}>{patient.notes}</Text>
            </View>
          </>
        )}

        {/* AI Generated Image */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="image-outline" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Generated Image</Text>
        </View>

        <View style={styles.imagesContainer}>
          <Pressable 
            style={[styles.imageCard, { backgroundColor: theme.surface }]}
            onPress={() => setImageViewerVisible(true)}
          >
            <Image 
              source={{ uri: patient.photoUrl }} 
              style={styles.aiImage}
              resizeMode="cover"
            />
            <View style={styles.imageFooter}>
              <Text style={[styles.imageText, { color: theme.textSecondary }]}>Veneer Design</Text>
              <MaterialCommunityIcons name="magnify-plus-outline" size={20} color={theme.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          {patient.phone && (
            <Pressable style={[styles.actionButton2, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="phone" size={20} color="white" />
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
          )}
          
          {patient.email && (
            <Pressable style={[styles.actionButton2, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="email" size={20} color="white" />
              <Text style={styles.actionText}>Email</Text>
            </Pressable>
          )}
          {/* will add this feature later */}
          {/* <Pressable style={[styles.actionButton2, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="calendar-plus" size={20} color="white" />
            <Text style={styles.actionText}>Schedule</Text>
          </Pressable> */}
        </View>
      </ScrollView>

      {/* Updated Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={resetZoom}
      >
        <GestureHandlerRootView style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
            <StatusBar hidden />
            
            <Pressable style={styles.closeButton} onPress={resetZoom}>
              <MaterialCommunityIcons name="close" size={28} color="white" />
            </Pressable>
            
            {/* Double tap handler */}
            <TapGestureHandler
              ref={doubleTapRef}
              numberOfTaps={2}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) {
                  onDoubleTap();
                }
              }}
            >
              {/* Pan handler for moving image when zoomed */}
              <Animated.View style={styles.gestureContainer}>
                <PanGestureHandler onGestureEvent={panHandler}>
                  <Animated.View style={styles.gestureContainer}>
                    {/* Pinch handler for zooming */}
                    <PinchGestureHandler onGestureEvent={pinchHandler}>
                      <Animated.View style={[styles.animatedImageContainer, animatedImageStyle]}>
                        {patient && (
                          <Image
                            source={{ uri: patient.photoUrl }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                          />
                        )}
                      </Animated.View>
                    </PinchGestureHandler>
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </TapGestureHandler>
            
            <View style={styles.zoomInstructions}>
              <MaterialCommunityIcons name="gesture-spread" size={24} color="white" />
              <Text style={styles.zoomInstructionsText}>Pinch to zoom • Double-tap to toggle • Pan to move</Text>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
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
  },
  actionButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  patientPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 16,
    marginBottom: 12,
  },
  nextAppointment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  appointmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 16,
  },
  divider: {
    height: 0.5,
    width: '100%',
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  imagesContainer: {
    marginTop: 8,
    gap: 16,
  },
  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  aiImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  imageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    gap: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  zoomInstructions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  zoomInstructionsText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  gestureContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 