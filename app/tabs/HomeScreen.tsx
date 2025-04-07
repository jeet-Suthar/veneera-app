import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, Pressable, Animated, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Patient } from '../types';
import { getCurrentUser, getPatientsForUser } from '../utils/patientStorage'; // Import helpers

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const translateYAnim = useRef(new Animated.Value(-20)).current; // Initial value for Y translation
  
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]); // State for recent patients
  const [loadingPatients, setLoadingPatients] = useState(true); // Loading state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Fetch user and patient data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoadingPatients(true);
        try {
          const userEmail = await getCurrentUser(); // Use helper
          setCurrentUserEmail(userEmail);
          
          if (userEmail) {
            const allPatients = await getPatientsForUser(userEmail); // Use helper
            const sortedPatients = allPatients
              .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
              .slice(0, 2);
            setRecentPatients(sortedPatients);
          } else {
            setRecentPatients([]); // No user logged in
          }
        } catch (error) {
          console.error('Error loading home screen data:', error);
          setRecentPatients([]); // Reset on error
        } finally {
          setLoadingPatients(false);
        }
      };

      loadData();

      // Optional: Return a cleanup function if needed, though not strictly necessary for useFocusEffect unless subscribing
      return () => {
         // console.log('HomeScreen unfocused');
      };
    }, []) // Empty dependency array means this runs once when the screen focuses, similar to useEffect mount
  );

  useEffect(() => {
    if (isOverlayVisible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOverlayVisible, fadeAnim, translateYAnim]);

  const toggleOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible);
  };

  const handleSeeAllNotifications = () => {
    router.push("/screens/NotificationScreen");
    console.log('Navigate to Notification Screen');
    toggleOverlay(); // Close overlay after clicking
  };

  const navigateToPatientDetail = (patientId: string) => {
    router.push({
      pathname: "/screens/PatientDetailScreen",
      params: { patientId }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: theme.textSecondary }]}>
              {/* Welcome */}
            </Text>
            <Text style={[styles.doctorName, { color: theme.text }]}>
              {/* {user?.fullName} */}
            </Text>
          </View>
          <Pressable
            onPress={toggleOverlay}
            style={[styles.notificationBadge, { backgroundColor: theme.surface }]}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={theme.primary} />
            <View style={[styles.badge, { backgroundColor: theme.error }]} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today's Patients</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>95%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completion Rate</Text>
          </View>
        </View>

        {/* Conditionally render Recent Patients section */}
        {loadingPatients ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : recentPatients.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Patients
              </Text>
              <Pressable onPress={() => router.push('/tabs/ManageScreen')}>
                <Text style={[styles.viewAll, { color: theme.primary }]}>View All</Text>
              </Pressable>
            </View>
            
            <View style={styles.recentPatientsContainer}>
              {recentPatients.map((patient) => (
                <Pressable 
                  key={patient.id}
                  style={[styles.patientCard, { backgroundColor: theme.surface }]} 
                  onPress={() => navigateToPatientDetail(patient.id)}
                >
                  <Image 
                    source={{ uri: patient.photoUrl }} 
                    style={styles.patientPhoto} 
                    defaultSource={require('../../assets/images/default-avatar.png')}
                  />
                  <View style={styles.patientInfo}>
                    <Text style={[styles.patientName, { color: theme.text }]}>{patient.name}</Text>
                    <Text style={[styles.patientDetails, { color: theme.textSecondary }]}>
                      Age: {patient.age}
                    </Text>
                    <Text style={[styles.patientDetails, { color: theme.textSecondary }]}>
                      Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </Text>
                  </View>
                  {patient.nextAppointment && (
                    <View style={[styles.appointmentBadge, { backgroundColor: theme.secondary }]}>
                      <MaterialCommunityIcons name="calendar-clock" size={14} color={theme.primary} />
                      <Text style={[styles.appointmentText, { color: theme.primary }]}>
                        {new Date(patient.nextAppointment).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color={theme.textSecondary}
                    style={styles.chevron}
                  />
                </Pressable>
              ))}
            </View>
          </>
        ) : (
           // Optional: Show a message or different content if no recent patients
           <View style={styles.noPatientsContainer}>
             <Text style={{ color: theme.textSecondary }}>No recent patient activity.</Text>
           </View>
        )}
      </ScrollView>

      {isOverlayVisible && (
         <Pressable style={styles.overlayBackdrop} onPress={toggleOverlay} />
      )}
      <Animated.View
        style={[
          styles.notificationOverlay,
          {
            backgroundColor: theme.cardBackground,
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
          !isOverlayVisible && styles.hiddenOverlay,
        ]}
      >
        <Text style={[styles.overlayText, { color: theme.text }]}>
            Welcome to the application! 👋
        </Text>
        <Pressable onPress={handleSeeAllNotifications}>
            <Text style={[styles.overlayLink, { color: theme.primary }]}>
                See All Notifications
            </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  welcome: {
    fontSize: 15,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  doctorName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  notificationBadge: {
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentPatientsContainer: {
    gap: 14,
    paddingBottom: 40,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    position: 'relative',
  },
  patientPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 13,
    marginBottom: 2,
  },
  appointmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    position: 'absolute',
    right: 40,
    bottom: 16,
    gap: 4,
  },
  appointmentText: {
    fontSize: 11,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  notificationOverlay: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 260,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 2,
  },
  hiddenOverlay: {
    transform: [{ translateY: -1000 }],
    opacity: 0,
  },
  overlayText: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 21,
  },
  overlayLink: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  noPatientsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 10,
    // You can add more styling here if needed
  },
});