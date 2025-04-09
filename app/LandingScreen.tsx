import React, { useState, useRef, useEffect } from 'react';
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
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { Colors } from './utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import SVGs as components
import FirstScreenIllustration from '../assets/images/illustrations/firstscreen.svg';
import HowItWorksIllustration from '../assets/images/illustrations/howitworks.svg';
import FeaturesIllustration from '../assets/images/illustrations/features.svg';
import GetStartedIllustration from '../assets/images/illustrations/getstarted.svg';

const { width, height } = Dimensions.get('window');

// Custom Fonts (Example - you might need to load these)
const Fonts = {
  Bold: 'YourApp-Bold', // Replace with actual bold font name if loaded
  Regular: 'YourApp-Regular', // Replace with actual regular font name if loaded
};

// Interface for Slide Props
interface SlideProps {
  theme: typeof Colors.light | typeof Colors.dark;
  isActive: boolean;
}

// --- Animated Text Component ---
const AnimatedText = ({ children, style, isActive, delay = 0 }: { children: React.ReactNode; style?: any; isActive: boolean; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current; // Start slightly lower

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 600,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation values when slide is inactive
      fadeAnim.setValue(0);
      translateYAnim.setValue(20);
    }
  }, [isActive, fadeAnim, translateYAnim, delay]);

  return (
    <Animated.Text style={[style, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
      {children}
    </Animated.Text>
  );
};

// --- Animated Image Container (No changes needed here) ---
const AnimatedImageContainer = ({ source: SvgComponent, style, isActive, delay = 0 }: { source: React.FC<any>; style?: any; isActive: boolean; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [isActive, fadeAnim, scaleAnim, delay]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Use the SVG component directly */}
      <SvgComponent width="100%" height="100%" />
    </Animated.View>
  );
};

// --- Slide 1 Component ---
const WelcomeSlide: React.FC<SlideProps> = ({ theme, isActive }) => (
  <View style={styles.slideContainer}>
    <AnimatedImageContainer
      source={FirstScreenIllustration} // Pass imported component
      style={styles.illustrationContainerStyle}
      isActive={isActive}
    />
   
    <AnimatedText style={[styles.slideTitle, { color: theme.text }]} isActive={isActive} delay={100}>
      Welcome to Veneera
    </AnimatedText>
    <AnimatedText style={[styles.slideDescription, { color: theme.textSecondary }]} isActive={isActive} delay={200}>
      Modern healthcare platform transforming patient care.
    </AnimatedText>
  </View>
);

// --- Slide 2 Component ---
const HowItWorksSlide: React.FC<SlideProps> = ({ theme, isActive }) => (
  <View style={styles.slideContainer}>
    <AnimatedImageContainer
      source={HowItWorksIllustration} // Pass imported component
      style={styles.illustrationContainerStyle}
      isActive={isActive}
    />
    <AnimatedText style={[styles.slideTitle, { color: theme.text }]} isActive={isActive} delay={100}>
      How It Works
    </AnimatedText>
    <AnimatedText style={[styles.slideDescription, { color: theme.textSecondary }]} isActive={isActive} delay={200}>
      Upload patient images, get AI-powered veneer visualizations instantly.
    </AnimatedText>
  </View>
);

// --- Slide 3 Component ---
const FeaturesSlide: React.FC<SlideProps> = ({ theme, isActive }) => (
  <View style={styles.slideContainer}>
    <AnimatedImageContainer
      source={FeaturesIllustration} // Pass imported component
      style={styles.illustrationContainerStyle}
      isActive={isActive}
    />
    <AnimatedText style={[styles.slideTitle, { color: theme.text }]} isActive={isActive} delay={100}>
      Powerful Features
    </AnimatedText>
    <Animated.View style={[styles.featureListContainer, { opacity: isActive ? 1 : 0 }]}>
      {/* Add Animated.View wrapper for list items if desired */}
      <View style={styles.featureItem}>
        <MaterialCommunityIcons name="image-filter-center-focus" size={24} color={theme.primary} />
        <AnimatedText style={[styles.featureText, { color: theme.textSecondary }]} isActive={isActive} delay={200}>Generate AI visualizations</AnimatedText>
      </View>
      <View style={styles.featureItem}>
        <MaterialCommunityIcons name="folder-key-outline" size={24} color={theme.primary} />
        <AnimatedText style={[styles.featureText, { color: theme.textSecondary }]} isActive={isActive} delay={300}>Securely store records</AnimatedText>
      </View>
      <View style={styles.featureItem}>
        <MaterialCommunityIcons name="chart-line" size={24} color={theme.primary} />
        <AnimatedText style={[styles.featureText, { color: theme.textSecondary }]} isActive={isActive} delay={400}>Increase patient engagement</AnimatedText>
      </View>
      {/* Beta notice can remain static or be animated */}
      <View style={styles.betaContainer}>
          <View style={[styles.featureItem, styles.beta]}>
            <MaterialCommunityIcons name="beta" size={24} color="rgb(255, 131, 131)" />
            <Text style={[styles.featureText , styles.betaText, { color: theme.textSecondary }]}> Beta version - More features coming soon! ✨</Text>
          </View>
      </View>
    </Animated.View>
  </View>
);

// --- Slide 4 Component ---
const GetStartedSlide: React.FC<SlideProps & { onGetStarted: () => void }> = ({ theme, onGetStarted, isActive }) => (
  <View style={styles.slideContainer}>
    <AnimatedImageContainer
        source={GetStartedIllustration} // Pass imported component
        style={styles.illustrationContainerStyle}
        isActive={isActive}
    />
    <AnimatedText style={[styles.slideTitle, { color: theme.text }]} isActive={isActive} delay={100}>
        Ready to Transform Your Practice?
    </AnimatedText>
    <AnimatedText style={[styles.slideDescription, { color: theme.textSecondary }]} isActive={isActive} delay={200}>
        Join healthcare providers enhancing patient care.
    </AnimatedText>
    <TouchableOpacity
      style={[styles.getStartedButton, { backgroundColor: theme.primary }]}
      onPress={onGetStarted}
    >
      {/* Add Animated.Text if desired */}
      <Text style={[styles.getStartedText, { color: 'white' }]}>Get Started</Text>
    </TouchableOpacity>
  </View>
);

export default function LandingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / width);
        if (page !== currentPage) {
           setCurrentPage(page);
        }
      },
    }
  );

  const scrollToPage = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: width * index, animated: true });
    }
  };

  const goToNextSlide = () => {
    const nextPageIndex = currentPage + 1;
    if (nextPageIndex < 4) { // Total 4 slides (0, 1, 2, 3)
      scrollToPage(nextPageIndex);
    } else {
      navigateToSignUp();
    }
  };

  const skipToSignUp = async () => {
    await navigateToSignUp();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        {/* Show Skip button only on pages 1 and 2 */}
        {currentPage > 0 && currentPage < 3 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipToSignUp}
          >
            <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
          </TouchableOpacity>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Important for smooth scroll tracking
          style={styles.scrollView}
          contentContainerStyle={{ width: width * 4 }} // Ensure content width matches total slides
        >
          {/* Pass isActive prop based on currentPage */}
          <View style={styles.slideWrapper}>
            <WelcomeSlide theme={theme} isActive={currentPage === 0} />
          </View>
          <View style={styles.slideWrapper}>
             <HowItWorksSlide theme={theme} isActive={currentPage === 1} />
          </View>
          <View style={styles.slideWrapper}>
            <FeaturesSlide theme={theme} isActive={currentPage === 2} />
          </View>
          <View style={styles.slideWrapper}>
            <GetStartedSlide theme={theme} onGetStarted={navigateToSignUp} isActive={currentPage === 3} />
          </View>
        </ScrollView>

        <View style={styles.paginationContainer}>
          {[0, 1, 2, 3].map((index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 25, 10], // Make active dot wider
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  { width: dotWidth, opacity, backgroundColor: theme.primary }
                ]}
              />
            );
          })}
        </View>

        {currentPage < 3 && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={goToNextSlide}
          >
            <MaterialCommunityIcons name="arrow-right" size={28} color={'white'} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </>
  );
}

// --- Updated Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slideWrapper: {
    width: width,
    height: '100%', // Ensure wrapper takes full height for alignment
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Prevent content overflow during animations
  },
  slideContainer: {
    width: '90%', // Use percentage for responsiveness
    flex: 1, // Allow container to grow and center content vertically
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
    paddingHorizontal: 20, // Horizontal padding within the slide
    paddingBottom: 150, // Space above pagination/button
  },
  illustrationContainerStyle: {
    width: width * 0.7,
    height: height * 0.35,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImageStyle: {
    width: '100%',
    height: '100%',
  },
  slideTitle: {
    fontSize: 28, // Slightly larger
    fontWeight: 'bold', // Use font weight instead of custom font for simplicity
    textAlign: 'center',
    marginBottom: 15, // Adjusted spacing
    letterSpacing: 0.5,
  },
  slideDescription: {
    fontSize: 18, // Slightly smaller for better balance
    textAlign: 'center',
    lineHeight: 26, // Increased line height for readability
    opacity: 0.85, // Slightly less prominent than title
  },
  featureListContainer: { // Added container for feature list animations
      width: '100%',
      marginTop: 30,
      alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18, // Increased spacing
  },
  featureText: {
    fontSize: 17, // Slightly larger feature text
    marginLeft: 12,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100, // Keep same position
    left: 0,
    right: 0,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5, // Reduced horizontal margin
  },
  skipButton: {
    position: 'absolute',
    top: 55, // Adjusted slightly
    right: 25,
    zIndex: 10, // Ensure it's above other elements
    padding: 10, // Larger touch area
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600', // Bolder skip text
  },
  nextButton: {
    position: 'absolute',
    bottom: 35, // Adjusted slightly
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Removed shadow for a flatter design, add back if desired
    elevation: 4, // Keep some elevation for Android
  },
  getStartedButton: {
    marginTop: 50, // Increased space above button
    paddingVertical: 16, // Slightly smaller padding
    paddingHorizontal: 60, // Wider button
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: 'white',
  },
  betaContainer: {
    width: '100%', // Ensure beta container takes full width
    alignItems: 'center', // Center the beta box
    marginTop: 20,
  },
  beta: {
    borderWidth: 1,
    borderColor: "rgb(160, 160, 160)",
    paddingHorizontal: 10,
    paddingVertical: 8, // Adjusted padding
    borderRadius: 10,
    flexDirection: 'row', // Ensure icon and text are in a row
    alignItems: 'center', // Align icon and text vertically
    marginBottom: 0, // Reset margin from featureItem
  },
  betaText: {
    color: "red", // Keep red color
    fontSize: 15, // Adjusted size
    marginLeft: 8, // Space between beta icon and text
    fontWeight: '500',
  },
}); 