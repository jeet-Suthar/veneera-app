import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, useColorScheme, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../utils/theme';
import { Patient } from '../types';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getCurrentUser, getPatientsForUser } from '../utils/patientStorage'; // Import helpers

export default function ManageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'upcoming'>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUser(); // Use helper
        setCurrentUser(userId);
        
        if (userId) {
          const userPatients = await getPatientsForUser(userId); // Use helper
          setPatients(userPatients);
        } else {
          setPatients([]);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPatients();
    
    const intervalId = setInterval(loadPatients, 50000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredPatients = patients.filter(patient => {
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
      <Image 
        source={{ uri: item.photoUrl }} 
        style={styles.patientPhoto} 
        defaultSource={require('../../assets/images/default-avatar.png')}
      />
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

  const addNewPatient = () => {
    router.push('/tabs/AddPatientScreen');
  };

  // Header component for the FlatList
  const ListHeaderComponent = () => (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Manage Patients</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={addNewPatient}
        >
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </Pressable>
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
    </>
  );

  // Empty state component
  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      {!currentUser ? (
        <>
          <MaterialCommunityIcons name="account-alert-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Please login to view your patients
          </Text>
        </>
      ) : (
        <>
          <MaterialCommunityIcons name="account-search-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No patients found
          </Text>
          <Pressable 
            style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
            onPress={addNewPatient}
          >
            <Text style={{ color: 'white' }}>Add New Patient</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text, marginTop: 12 }}>Loading patients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.patientList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
        />
      )}
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
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
}); 