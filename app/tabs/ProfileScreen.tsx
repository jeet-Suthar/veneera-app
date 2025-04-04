import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_DOCTOR = {
  name: 'Dr. John Smith',
  specialty: 'General Dentist',
  photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20male%20doctor%20in%20white%20coat',
  patientsCount: 142,
  yearsOfExperience: 12,
  rating: 4.9,
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const StatCard = ({ icon, value, label }: { icon: string; value: string | number; label: string }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image source={{ uri: MOCK_DOCTOR.photoUrl }} style={styles.profileImage} />
            <View style={styles.headerInfo}>
              <Text style={[styles.name, { color: theme.text }]}>{MOCK_DOCTOR.name}</Text>
              <Text style={[styles.specialty, { color: theme.textSecondary }]}>{MOCK_DOCTOR.specialty}</Text>
              <View style={[styles.ratingContainer, { backgroundColor: theme.secondary }]}>
                <MaterialCommunityIcons name="star" size={14} color={theme.primary} />
                <Text style={[styles.rating, { color: theme.primary }]}>{MOCK_DOCTOR.rating}</Text>
              </View>
            </View>
          </View>
          
          <Pressable
            style={[styles.editButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard icon="account-group" value={MOCK_DOCTOR.patientsCount} label="Patients" />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <StatCard icon="clock-outline" value={MOCK_DOCTOR.yearsOfExperience} label="Years" />
          </View>
          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statsRow}>
            <StatCard icon="calendar-check" value="95%" label="Appts" />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <StatCard icon="chart-line" value="142" label="Monthly" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Certifications</Text>
        </View>

        <View style={[styles.certList, { backgroundColor: theme.surface }]}>
          {['DDS - University of Michigan', 'Advanced Implant Training', 'Invisalign Certified'].map((cert, index) => (
            <View key={index} style={[
              styles.certItem, 
              index !== 2 && styles.certItemBorder,
              { borderBottomColor: theme.border }
            ]}>
              <View style={[styles.certIconContainer, { backgroundColor: theme.secondary }]}>
                <MaterialCommunityIcons name="certificate" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.certText, { color: theme.text }]}>{cert}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  specialty: {
    fontSize: 15,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statDivider: {
    width: 0.5,
    marginVertical: 10,
  },
  rowDivider: {
    height: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  certList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  certItemBorder: {
    borderBottomWidth: 0.5,
  },
  certIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  certText: {
    fontSize: 14,
    letterSpacing: 0.1,
  }
});