import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import RecentPatientCard from '../components/RecentPatientCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MOCK_RECENT_PATIENTS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 32,
    lastVisit: '2025-03-28',
    nextAppointment: '2025-04-15',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20young%20woman%20smiling%20naturally'
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    lastVisit: '2025-03-30',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20middle%20aged%20asian%20man%20smiling'
  }
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const translateYAnim = useRef(new Animated.Value(-20)).current; // Initial value for Y translation

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
    // TODO: Implement navigation to NotificationScreen
    router.push({
      pathname: "/screens/NotificationScreen",
      
    });

    console.log('Navigate to Notification Screen');
    toggleOverlay(); // Close overlay after clicking
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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Patients
          </Text>
          <Pressable>
            <Text style={[styles.viewAll, { color: theme.primary }]}>View All</Text>
          </Pressable>
        </View>
        
        <View style={styles.recentPatientsContainer}>
          {MOCK_RECENT_PATIENTS.map((patient) => (
            <RecentPatientCard key={patient.id} patient={patient} />
          ))}
        </View>
      </ScrollView>

      {/* Notification Overlay */}
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
});