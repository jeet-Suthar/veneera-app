import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../utils/theme';
import { Patient } from '../types';
import { useRouter } from 'expo-router';

// Mock patient data
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 32,
    lastVisit: '2023-03-15',
    nextAppointment: '2023-04-10',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20young%20woman%20smiling%20naturally'
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    lastVisit: '2023-03-01',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20middle%20aged%20asian%20man%20smiling'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    age: 28,
    lastVisit: '2023-02-20',
    nextAppointment: '2023-04-15',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20young%20blonde%20woman'
  },
  {
    id: '4',
    name: 'James Brown',
    age: 52,
    lastVisit: '2023-03-10',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20middle%20aged%20black%20man'
  },
  {
    id: '5',
    name: 'Lisa Garcia',
    age: 41,
    lastVisit: '2023-02-28',
    nextAppointment: '2023-05-01',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20latina%20woman%20with%20long%20dark%20hair'
  },
  {
    id: '6',
    name: 'Thomas Parker',
    age: 36,
    lastVisit: '2023-03-22',
    photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20mid%20thirties%20man%20with%20glasses'
  }
];

export default function ManageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'upcoming'>('all');
  
  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recent') {
      const lastVisitDate = new Date(patient.lastVisit);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return lastVisitDate >= oneMonthAgo;
    }
    if (activeFilter === 'upcoming') {
      return !!patient.nextAppointment;
    }
    
    return true;
  });

  const navigateToPatientDetail = (patientId: string) => {
    // Now use router to navigate to PatientDetailScreen
    router.push({
      pathname: "/screens/PatientDetailScreen",
      params: { patientId }
    });
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <Pressable 
      style={[styles.patientCard, { backgroundColor: theme.surface }]}
      onPress={() => navigateToPatientDetail(item.id)}
    >
      <Image source={{ uri: item.photoUrl }} style={styles.patientPhoto} />
      <View style={styles.patientInfo}>
        <Text style={[styles.patientName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.patientDetails, { color: theme.textSecondary }]}>
          Age: {item.age}
        </Text>
        <Text style={[styles.patientDetails, { color: theme.textSecondary }]}>
          Last Visit: {new Date(item.lastVisit).toLocaleDateString()}
        </Text>
      </View>
      {item.nextAppointment && (
        <View style={[styles.appointmentBadge, { backgroundColor: theme.secondary }]}>
          <MaterialCommunityIcons name="calendar-clock" size={14} color={theme.primary} />
          <Text style={[styles.appointmentText, { color: theme.primary }]}>
            {new Date(item.nextAppointment).toLocaleDateString()}
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Manage Patients</Text>
      
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search patients..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterContainer}>
        <Pressable 
          style={[
            styles.filterButton, 
            activeFilter === 'all' && { backgroundColor: theme.secondary },
            { borderColor: theme.border }
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: activeFilter === 'all' ? theme.primary : theme.textSecondary }
            ]}
          >
            All
          </Text>
        </Pressable>
        
        <Pressable 
          style={[
            styles.filterButton, 
            activeFilter === 'recent' && { backgroundColor: theme.secondary },
            { borderColor: theme.border }
          ]}
          onPress={() => setActiveFilter('recent')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: activeFilter === 'recent' ? theme.primary : theme.textSecondary }
            ]}
          >
            Recent
          </Text>
        </Pressable>
        
        <Pressable 
          style={[
            styles.filterButton, 
            activeFilter === 'upcoming' && { backgroundColor: theme.secondary },
            { borderColor: theme.border }
          ]}
          onPress={() => setActiveFilter('upcoming')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: activeFilter === 'upcoming' ? theme.primary : theme.textSecondary }
            ]}
          >
            Upcoming
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.patientList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No patients found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  patientList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  }
}); 