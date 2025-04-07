import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  ColorSchemeName,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as ThemeColors } from '../utils/theme';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define the structure of your theme colors
interface Theme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

// Define the structure for patient data
export interface PatientData {
  name: string;
  age: string;
  phone: string;
  email: string;
  notes: string;
}

const AddPatientScreen: FC = () => {
  const colorScheme: ColorSchemeName = useColorScheme();
  const theme: Theme = ThemeColors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    phone: '',
    email: '',
    notes: '',
  });

  const handleNext = (): void => {
    if (patientData.name.trim() && patientData.age.trim()) {
      // Navigate to the AI generation screen with patient data
      router.push({
        pathname: "/generate-images",
        params: {
          name: patientData.name,
          age: patientData.age,
          phone: patientData.phone,
          email: patientData.email,
          notes: patientData.notes,
        }
      });
    } else {
      Alert.alert("Missing Information", "Please enter patient's name and age.");
    }
  };

  const handleInputChange = (field: keyof PatientData, value: string): void => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  // Function to clear all fields
  const handleReset = (): void => {
    setPatientData({
      name: '',
      age: '',
      phone: '',
      email: '',
      notes: '',
    });
    // Optional: Add a confirmation or feedback
    // Alert.alert("Fields Cleared", "All input fields have been reset.");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header with Title and Reset Button */}
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.text }]}>New Patient</Text>
        <Pressable onPress={handleReset} style={styles.resetButton}>
          <MaterialCommunityIcons name="refresh" size={24} color={theme.primary} />
        </Pressable>
      </View>
      
      <ScrollView
         style={styles.scrollView}
         contentContainerStyle={{ paddingBottom: 30 }}
         keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={patientData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter patient's full name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Age</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={patientData.age}
              onChangeText={(text) => handleInputChange('age', text)}
              placeholder="Enter patient's age"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={patientData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter phone number (optional)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={patientData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter email address (optional)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }
              ]}
              value={patientData.notes}
              onChangeText={(text) => handleInputChange('notes', text)}
              placeholder="Enter any additional notes (optional)"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Next Button */}
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPatientScreen;