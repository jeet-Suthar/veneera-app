import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Colors } from '../utils/theme';
import { Patient } from '../types/index';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RecentPatientCardProps {
  patient: Patient;
}

export default function RecentPatientCard({ patient }: RecentPatientCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable 
      style={[styles.card, { backgroundColor: theme.cardBackground }]}
      onPress={() => console.log(`View patient ${patient.id}`)}
    >
      <Image 
        source={{ uri: patient.photoUrl }} 
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{patient.name}</Text>
        <Text style={[styles.details, { color: theme.textSecondary }]}>
          Age: {patient.age}
        </Text>
        <Text style={[styles.details, { color: theme.textSecondary }]}>
          Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
        </Text>
      </View>
      {patient.nextAppointment && (
        <View style={[styles.appointment, { backgroundColor: theme.secondary }]}>
          <MaterialCommunityIcons 
            name="calendar-clock" 
            size={16} 
            color={theme.primary} 
          />
          <Text style={[styles.appointmentText, { color: theme.primary }]}>
            {new Date(patient.nextAppointment).toLocaleDateString()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginBottom: 2,
  },
  appointment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  appointmentText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});