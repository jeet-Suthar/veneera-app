import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../utils/theme';
import { Patient } from '../types';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Define extended patient type with additional fields
type ExtendedPatient = Patient & {
  email: string;
  phone: string;
  address: string;
  notes?: string;
  aiImages?: string[];
};

// Mock data for patients to look up by ID
const MOCK_PATIENTS: Record<string, ExtendedPatient> = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    age: 32,
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA 94123',
    lastVisit: '2023-03-15',
    nextAppointment: '2023-04-10',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20young%20woman%20smiling%20naturally',
    notes: 'Patient reported sensitivity in upper right molar.',
    aiImages: [
      'https://api.a0.dev/assets/image?text=dental%20xray%20showing%20molar%20with%20cavity',
      'https://api.a0.dev/assets/image?text=3d%20model%20of%20upper%20teeth'
    ]
  },
  '2': {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    email: 'michael.chen@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Anytown, CA 94123',
    lastVisit: '2023-03-01',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20middle%20aged%20asian%20man%20smiling',
    notes: 'Routine cleaning completed. No issues found.',
    aiImages: [
      'https://api.a0.dev/assets/image?text=dental%20xray%20showing%20healthy%20teeth',
      'https://api.a0.dev/assets/image?text=healthy%20gums%20closeup%20image'
    ]
  },
  '3': {
    id: '3',
    name: 'Emma Wilson',
    age: 28,
    email: 'emma.wilson@example.com',
    phone: '(555) 456-7890',
    address: '789 Maple St, Anytown, CA 94123',
    lastVisit: '2023-02-20',
    nextAppointment: '2023-04-15',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20young%20blonde%20woman',
    aiImages: [
      'https://api.a0.dev/assets/image?text=dental%20scan%20of%20wisdom%20teeth',
      'https://api.a0.dev/assets/image?text=jawline%20xray%20profile%20view'
    ]
  }
};

export default function PatientDetailScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Get patient data or default to first patient if not found
  const patient = patientId && MOCK_PATIENTS[patientId] 
    ? MOCK_PATIENTS[patientId] 
    : MOCK_PATIENTS['1'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Patient Details</Text>
        <Pressable style={styles.actionButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Profile Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: patient.photoUrl }} style={styles.patientPhoto} />
          <Text style={[styles.patientName, { color: theme.text }]}>{patient.name}</Text>
          <Text style={[styles.patientAge, { color: theme.textSecondary }]}>
            Age: {patient.age}
          </Text>
          
          {patient.nextAppointment && (
            <View style={[styles.nextAppointment, { backgroundColor: theme.secondary }]}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={theme.primary} />
              <Text style={[styles.appointmentText, { color: theme.primary }]}>
                Next: {new Date(patient.nextAppointment).toLocaleDateString()}
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
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="email-outline" size={18} color={theme.primary} style={styles.infoIcon} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{patient.email}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="phone-outline" size={18} color={theme.primary} style={styles.infoIcon} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{patient.phone}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.primary} style={styles.infoIcon} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Address</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{patient.address}</Text>
            </View>
          </View>
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

        {/* AI Generated Images */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="image-outline" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Generated Images</Text>
        </View>

        <View style={styles.imagesContainer}>
          {patient.aiImages?.map((imageUrl, index) => (
            <Pressable key={index} style={[styles.imageCard, { backgroundColor: theme.surface }]}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.aiImage}
                resizeMode="cover"
              />
              <View style={styles.imageFooter}>
                <Text style={[styles.imageText, { color: theme.textSecondary }]}>Image {index + 1}</Text>
                <MaterialCommunityIcons name="arrow-expand" size={20} color={theme.primary} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Pressable style={[styles.actionButton2, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="phone" size={20} color="white" />
            <Text style={styles.actionText}>Call</Text>
          </Pressable>
          <Pressable style={[styles.actionButton2, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="email" size={20} color="white" />
            <Text style={styles.actionText}>Email</Text>
          </Pressable>
          <Pressable style={[styles.actionButton2, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="calendar-plus" size={20} color="white" />
            <Text style={styles.actionText}>Schedule</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  }
}); 