import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, Pressable, Animated, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Patient } from '../types/index';
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
  const [totalPatients, setTotalPatients] = useState(0);
  const [recentActivityCount, setRecentActivityCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review patient records', completed: false },
    { id: '2', title: 'Schedule follow-ups', completed: false },
    { id: '3', title: 'Update treatment plans', completed: false },
  ]);

  // Fetch user and patient data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoadingPatients(true);
        try {
          const userEmail = await getCurrentUser();
          setCurrentUserEmail(userEmail);
          
          if (userEmail) {
            const allPatients = await getPatientsForUser(userEmail);
            setTotalPatients(allPatients.length);
            
            // Calculate recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentPatients = allPatients.filter(patient => 
              new Date(patient.lastVisit) >= sevenDaysAgo
            );
            setRecentActivityCount(recentPatients.length);

            // Sort and get recent patients for display
            const sortedPatients = allPatients
              .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
              .slice(0, 2);
            setRecentPatients(sortedPatients);
            
            // Get upcoming appointments
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcomingPatients = allPatients
              .filter(patient => patient.nextAppointment && new Date(patient.nextAppointment) >= today)
              .sort((a, b) => new Date(a.nextAppointment || 0).getTime() - new Date(b.nextAppointment || 0).getTime())
              .slice(0, 3);
            setUpcomingAppointments(upcomingPatients);
          } else {
            setTotalPatients(0);
            setRecentActivityCount(0);
            setRecentPatients([]);
            setUpcomingAppointments([]);
          }
        } catch (error) {
          console.error('Error loading home screen data:', error);
          setTotalPatients(0);
          setRecentActivityCount(0);
          setRecentPatients([]);
          setUpcomingAppointments([]);
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
    try {
      router.push({
        pathname: "/screens/PatientDetailScreen",
        params: { patientId }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation or show error toast
      Alert.alert('Navigation Error', 'Unable to open patient details. Please try again.'+ error);
    }
  };

  const navigateToAddPatient = () => {
    try {
      router.push('/tabs/AddPatientScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate. Please try again.'+ error);
    }
  };

  const navigateToGenerateImages = () => {
    try {
      router.push('/screens/GenerateImagesScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate. Please try again.'+ error);
    }
  };

  const navigateToManageScreen = () => {
    try {
      router.push('/tabs/ManageScreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate. Please try again.');
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: theme.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.doctorName, { color: theme.text }]}>
              Dr. {currentUserEmail?.split('@')[0] || 'User'}
            </Text>
          </View>
          {/* will do this in update 2 */}
          {/* <Pressable
            onPress={toggleOverlay}
            style={[styles.notificationBadge, { backgroundColor: theme.surface }]}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={theme.primary} />
            <View style={[styles.badge, { backgroundColor: theme.error }]} />
          </Pressable> */}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{totalPatients}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Patients</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{recentActivityCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Last 7 Days</Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
        </View>
        <View style={styles.quickActionsContainer}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
            onPress={navigateToAddPatient}
          >
            <MaterialCommunityIcons name="account-plus" size={24} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Add Patient</Text>
          </Pressable>
          {/* <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
            onPress={navigateToGenerateImages}
          >
            <MaterialCommunityIcons name="image-plus" size={24} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Generate Images</Text>
          </Pressable> */}
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
            onPress={navigateToManageScreen}
          >
            <MaterialCommunityIcons name="account-group" size={24} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Manage Patients</Text>
          </Pressable>
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Schedule
          </Text>
        </View>
        {upcomingAppointments.length > 0 ? (
          <View style={styles.scheduleContainer}>
            {upcomingAppointments.map((patient) => (
              <View 
                key={patient.id}
                style={[styles.scheduleItem, { backgroundColor: theme.cardBackground }]}
              >
                <View style={styles.scheduleTime}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={theme.primary} />
                  <Text style={[styles.scheduleTimeText, { color: theme.text }]}>
                    {new Date(patient.nextAppointment || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.schedulePatientName, { color: theme.text }]}>{patient.name}</Text>
                  <Text style={[styles.scheduleDetails, { color: theme.textSecondary }]}>
                    {patient.age} years • {patient.phone}
                  </Text>
                </View>
                <Pressable 
                  style={[styles.scheduleAction, { backgroundColor: theme.primary }]}
                  onPress={() => navigateToPatientDetail(patient.id)}
                >
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: theme.cardBackground }]}>
            <MaterialCommunityIcons name="calendar-blank" size={24} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No appointments scheduled for today
            </Text>
          </View>
        )}

        {/* Tasks Section (replacing Tips & Reminders) */}
        {/* <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tasks
          </Text>
        </View>
        <View style={[styles.tasksContainer, { backgroundColor: theme.cardBackground }]}>
          {tasks.map((task) => (
            <Pressable 
              key={task.id}
              style={styles.taskItem}
              onPress={() => toggleTaskCompletion(task.id)}
            >
              <View style={[
                styles.checkbox, 
                { 
                  backgroundColor: task.completed ? theme.primary : 'transparent',
                  borderColor: task.completed ? theme.primary : theme.textSecondary
                }
              ]}>
                {task.completed && (
                  <MaterialCommunityIcons name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={[
                styles.taskText, 
                { 
                  color: theme.text,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.7 : 1
                }
              ]}>
                {task.title}
              </Text>
            </Pressable>
          ))}
        </View>  */}

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
        
        {/* Add extra padding at the bottom to prevent content from being hidden behind navbar */}
        <View style={styles.bottomPadding} />
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
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
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
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
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
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
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
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  scheduleContainer: {
    marginBottom: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 70,
  },
  scheduleTimeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleInfo: {
    flex: 1,
  },
  schedulePatientName: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  scheduleAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  tasksContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskText: {
    fontSize: 14,
    flex: 1,
  },
  bottomPadding: {
    height: 80, // Add enough padding to prevent content from being hidden behind navbar
  },
});