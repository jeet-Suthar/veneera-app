import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import RecentPatientCard from '../components/RecentPatientCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: theme.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.doctorName, { color: theme.text }]}>
              Dr. Smith
            </Text>
          </View>
          <Pressable
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
  },
});