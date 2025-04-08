import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Linking,
  Platform,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ContactSupportScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const supportEmail = 'Jitendrasutharwork@gmail.com'; // Placeholder email
  const supportPhone = '+91 8432737144'; // Placeholder phone

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}?subject=Veneera App Support Request`);
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${supportPhone}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Contact Support', headerBackTitle: 'Settings' }} />
      <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconHeaderContainer}>
          <MaterialCommunityIcons name="headset" size={60} color={theme.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Need Assistance?</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Our support team is here to help. Reach out via email or phone.
        </Text>

        {/* Contact Options */}
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleEmailPress}
        >
          <MaterialCommunityIcons name="email-outline" size={24} color={theme.primary} />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: theme.text }]}>Email Support</Text>
            <Text style={[styles.contactValue, { color: theme.primary }]}>{supportEmail}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handlePhonePress}
        >
          <MaterialCommunityIcons name="phone-outline" size={24} color={theme.primary} />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: theme.text }]}>Phone Support</Text>
            <Text style={[styles.contactValue, { color: theme.primary }]}>{supportPhone}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Quick Message Form (Optional) */}
        {/* <Text style={[styles.formTitle, { color: theme.text }]}>Or Send a Quick Message</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Your Name (Optional)"
          placeholderTextColor={theme.textSecondary}
        />
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Describe your issue..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.submitButtonText, { color: theme.text }]}>Send Message</Text>
        </TouchableOpacity> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  iconHeaderContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 26,
    left: 26,
    zIndex: 1000,
  },
}); 