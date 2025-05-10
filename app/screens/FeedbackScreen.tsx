import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function FeedbackScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { user } = useAuth();
  const alert = useAlert();

  const [rating, setRating] = useState(0);
  const [name, setName] = useState(user?.displayName || ''); // Pre-fill name if available
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert.warning('Please select a star rating.');
      return;
    }
    if (!name.trim()) {
      alert.warning('Please enter your name.');
      return;
    }
    if (!feedback.trim()) {
      alert.warning('Please enter your feedback.');
      return;
    }
    if (!user?.email) {
      alert.error('Could not find your email address. Please ensure you are logged in correctly.');
      return;
    }

    setIsSubmitting(true);

    const recipient = 'teethsiapp@gmail.com';
    const subject = `Feedback from ${name} (${user.email}) - Rating: ${rating}/5`;
    const body = `Rating: ${rating}/5\n\nName: ${name}\nEmail: ${user.email}\n\nFeedback:\n${feedback}`;
    
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        alert.success(
          'Please complete sending the feedback using your email app.',
          'Thank You!'
        );
        router.back();
      } else {
        alert.error('Could not open email app', 'Please ensure you have an email app configured on your device.');
      }
    } catch (error) {
      console.error('Error opening mailto link:', error);
      alert.error('Failed to open email app', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
       <KeyboardAvoidingView 
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         style={{ flex: 1 }}
       >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Provide Feedback</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Star Rating */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Rate your experience</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)} style={styles.starButton}>
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#FFD700' : theme.textSecondary} // Gold color for selected stars
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Name Input */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Your Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
          />

          {/* Feedback Input */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Your Feedback</Text>
          <TextInput
            style={[
              styles.input, 
              styles.textArea, 
              { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }
            ]}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Tell us what you think..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback via Email'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)', // Use theme.border if preferred
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Align edge
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  starButton: {
    paddingHorizontal: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 150,
    paddingTop: 12,
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
}); 