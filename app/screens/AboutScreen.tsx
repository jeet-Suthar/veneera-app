import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors } from '../utils/theme';
import Constants from 'expo-constants'; // For app version
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const appVersion = Constants.expoConfig?.version || '1.0.0'; // Get app version
  const websiteUrl = 'https://veneera.example.com'; // Placeholder website
  const privacyUrl = 'https://veneera.example.com/privacy'; // Placeholder privacy policy
  const termsUrl = 'https://veneera.example.com/terms'; // Placeholder terms

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'About Veneera', headerBackTitle: 'Settings' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          {/* Replace with your actual logo if available */}
          <MaterialCommunityIcons name="tooth-outline" size={80} color={theme.primary} />
        </View>
        <Text style={[styles.appName, { color: theme.text }]}>Veneera</Text>
        <Text style={[styles.versionText, { color: theme.textSecondary }]}>Version {appVersion}</Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Veneera is a modern healthcare platform designed to streamline dental practice management and enhance patient care through intuitive tools and AI-powered insights.
        </Text>

        <View style={styles.linksContainer}>
          <TouchableOpacity style={styles.linkItem} onPress={() => openLink(websiteUrl)}>
            <MaterialCommunityIcons name="web" size={20} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>Visit our Website</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={() => openLink(privacyUrl)}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={() => openLink(termsUrl)}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.primary }]}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          © {new Date().getFullYear()} Veneera Technologies. All rights reserved.
        </Text>
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
    alignItems: 'center', // Center content
  },
  logoContainer: {
    marginBottom: 16,
    // Add styling if using an Image component
    // width: 100,
    // height: 100,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16, // Add some horizontal padding
  },
  linksContainer: {
    width: '100%', // Make container take full width
    marginBottom: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border, // Use fixed border color or theme.border
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border, // Use fixed border color or theme.border
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
}); 