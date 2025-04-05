import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { Colors } from './utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Interface for Slide Props (Optional but good practice)
interface SlideProps {
  theme: typeof Colors.light | typeof Colors.dark;
  // Add any other common props slides might need
}

// --- Slide 1 Component ---
const WelcomeSlide: React.FC<SlideProps> = ({ theme }) => (
  <View style={styles.slideContainer}>
    <MaterialCommunityIcons
      name="medical-bag"
      size={140} // Larger icon
      color={theme.primary}
      style={styles.slideIcon}
    />
    <Text style={[styles.slideTitle, { color: theme.text }]}>Welcome to Veneera</Text>
    <Text style={[styles.slideDescription, { color: theme.textSecondary }]}>
      The modern healthcare platform that transforms patient care and dental practice management.
    </Text>
  </View>
);

// --- Slide 2 Component ---
const HowItWorksSlide: React.FC<SlideProps> = ({ theme }) => (
  <View style={styles.slideContainer}>
    <MaterialCommunityIcons
      name="clipboard-pulse-outline" // Outline variant
      size={120}
      color={theme.primary}
      style={styles.slideIcon}
    />
    <Text style={[styles.slideTitle, { color: theme.text }]}>How It Works</Text>
    <Text style={[styles.slideDescription, { color: theme.textSecondary }]}>
        Upload your patient's images and get a AI generated Image of the perfect teeth.
    </Text>
  </View>
);

// --- Slide 3 Component ---
const FeaturesSlide: React.FC<SlideProps> = ({ theme }) => (
  <View style={styles.slideContainer}>
    <MaterialCommunityIcons
      name="feature-search-outline" // Outline variant
      size={120}
      color={theme.primary}
      style={styles.slideIcon}
    />
    <Text style={[styles.slideTitle, { color: theme.text }]}>Powerful Features</Text>
    <View style={styles.featureList}>
      <View style={styles.featureItem}>
        <MaterialCommunityIcons name="image-filter-center-focus" size={24} color={theme.primary} />
        <Text style={[styles.featureText, { color: theme.textSecondary }]}> Generate AI visualizations</Text>
      </View>
      <View style={styles.featureItem}>
        <MaterialCommunityIcons name="folder-key-outline" size={24} color={theme.primary} />
        <Text style={[styles.featureText, { color: theme.textSecondary }]}> Securely store records</Text>
      </View>
      <View style={styles.featureItem}>
        <MaterialCommunityIcons name="chart-line" size={24} color={theme.primary} />
        <Text style={[styles.featureText, { color: theme.textSecondary }]}> Increase patient engagement</Text>
      </View>
      <View style={styles.betaContainer}>
        <View style={[styles.featureItem, styles.beta]}>
          <MaterialCommunityIcons name="beta" size={24} color="rgb(255, 131, 131)" />
          <Text style={[styles.featureText ,    styles.betaText, { color: theme.textSecondary }]}> Beta version - More features coming soon! ✨</Text>
        </View>
    </View>

    </View>
  </View>
);

// --- Slide 4 Component ---
const GetStartedSlide: React.FC<SlideProps & { onGetStarted: () => void }> = ({ theme, onGetStarted }) => (
  <View style={styles.slideContainer}>
    <MaterialCommunityIcons
      name="rocket-launch-outline" // Outline variant
      size={140} // Larger icon
      color={theme.primary}
      style={styles.slideIcon}
    />
    <Text style={[styles.slideTitle, { color: theme.text }]}>Ready to Transform Your Practice?</Text>
    <Text style={[styles.slideDescription, { color: theme.textSecondary }]}>
      Join thousands of healthcare providers enhancing their patient care experience.
    </Text>
    <TouchableOpacity
      style={[styles.getStartedButton, { backgroundColor: theme.primary }]}
      onPress={onGetStarted}
    >
      <Text style={[styles.getStartedText, { color: theme.text }]}>Get Started</Text>
    </TouchableOpacity>
  </View>
);

export default function LandingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current; // For potential animations

  // Mark that user has seen landing screen and navigate to sign up
  const navigateToSignUp = async () => {
    try {
      await AsyncStorage.setItem('@has_seen_landing', 'true');
      router.push('/(auth)/sign-up');
    } catch (error) {
      console.error('Error saving landing screen status:', error);
      router.push('/(auth)/sign-up'); // Navigate anyway
    }
  };

  // Handle scroll event to update page indicator and animated value
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / width);
        setCurrentPage(page);
      },
    }
  );

  // Navigate to specific page
  const scrollToPage = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: width * index, animated: true });
    }
  };

  // Next slide function
  const goToNextSlide = () => {
    if (currentPage < 3) {
      scrollToPage(currentPage + 1);
    } else {
      navigateToSignUp();
    }
  };

  // Skip function - mark as seen and go straight to sign up
  const skipToSignUp = async () => {
    await navigateToSignUp();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        {/* Skip button (visible on first 3 slides) */}
        {currentPage < 3 && (
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={skipToSignUp}
          >
            <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll} // Use Animated event handler
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {/* Slide 1 */}
          <View style={styles.slideWrapper}>
            <WelcomeSlide theme={theme} />
          </View>
          
          {/* Slide 2 */}
          <View style={styles.slideWrapper}>
             <HowItWorksSlide theme={theme} />
          </View>
          
          {/* Slide 3 */}
          <View style={styles.slideWrapper}>
            <FeaturesSlide theme={theme} />
          </View>
          
          {/* Slide 4 */}
          <View style={styles.slideWrapper}>
            <GetStartedSlide theme={theme} onGetStarted={navigateToSignUp} />
          </View>
        </ScrollView>

        {/* Page indicators */}
        <View style={styles.paginationContainer}>
          {[0, 1, 2, 3].map((index) => { // Use index directly
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10], // Expand current dot
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3], // Fade non-current dots
              extrapolate: 'clamp',
            });

            return (
              <Animated.View // Use Animated.View for indicator
                key={index}
                style={[
                  styles.paginationDot,
                  { width: dotWidth, opacity },
                  { backgroundColor: theme.primary } // Use primary color
                ]}
              />
            );
          })}
        </View>

        {/* Next button (not on last slide) */}
        {currentPage < 3 && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={goToNextSlide}
          >
            <MaterialCommunityIcons name="arrow-right" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slideWrapper: { // Wrapper for each slide component to ensure width
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: { // Inner container for slide content
    width: '100%',
    height: height * 0.75, // Adjust height as needed
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideIcon: {
    marginBottom: 40,
    opacity: 0.9,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  featureList: {
    marginTop: 20,
    alignItems: 'flex-start', // Align items to the left
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10, // Space between icon and text
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // Position dots over the scrollview
    bottom: 100, // Adjust position as needed
    left: 0,
    right: 0,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  skipButton: {
    position: 'absolute',
    top: 60, // Adjust based on SafeAreaView
    right: 25,
    zIndex: 1,
    padding: 5,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    position: 'absolute',
    bottom: 40, // Adjust position
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  getStartedButton: {
    marginTop: 40,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30, // More rounded
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  beta: {
    marginTop: 20,
    // backgroundColor: "rgb(255, 255, 255)",
    borderWidth: 1,
    borderColor: "rgb(160, 160, 160)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    color: "red",
  },
  betaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  betaText: {
    color: "red",
    fontSize: 16,
  },
}); 