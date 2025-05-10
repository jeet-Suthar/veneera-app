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
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';

// Import SVGs as components
import FirstScreenIllustration from '../../assets/images/illustrations/firstscreen.svg';
import HowItWorksIllustration from '../../assets/images/illustrations/howitworks.svg';
import FeaturesIllustration from '../../assets/images/illustrations/features.svg';
import GetStartedIllustration from '../../assets/images/illustrations/getstarted.svg';
import IconSvg from '../../assets/images/icons/icon.svg';

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
const AnimatedText = ({ 
  children, 
  style, 
  isActive, 
  delay = 0,
  showGradient = false,
  gradientColors = ['#B786ED', '#9164FF']
}: { 
  children: React.ReactNode; 
  style?: any; 
  isActive: boolean; 
  delay?: number;
  showGradient?: boolean;
  gradientColors?: string[];
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

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

  if (showGradient && Platform.OS !== 'web') {
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        <MaskedView
          maskElement={
            <Text style={style}>{children}</Text>
          }
        >
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[style, { opacity: 0 }]}>{children}</Text>
          </LinearGradient>
        </MaskedView>
      </Animated.View>
    );
  }

  return (
    <Animated.Text style={[style, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
      {children}
    </Animated.Text>
  );
};

// --- Animated Image Container ---
const AnimatedImageContainer = ({ 
  source: SvgComponent, 
  style, 
  isActive, 
  delay = 0 
}: { 
  source: React.FC<any>; 
  style?: any; 
  isActive: boolean; 
  delay?: number 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
          easing: Easing.out(Easing.elastic(1)),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
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
      rotateAnim.setValue(0);
    }
  }, [isActive, fadeAnim, scaleAnim, rotateAnim, delay]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '0deg'],
  });

  return (
    <Animated.View 
      style={[
        style, 
        { 
          opacity: fadeAnim, 
          transform: [
            { scale: scaleAnim },
            { rotate: spin }
          ] 
        }
      ]}
    >
      <SvgComponent width="100%" height="100%" />
    </Animated.View>
  );
};

// --- Random Blob Component ---
const RandomBlob = ({ 
  color, 
  size, 
  style, 
  blur = true,
  animate = true,
}: { 
  color: string; 
  size: number; 
  style: any; 
  blur?: boolean;
  animate?: boolean;
}) => {
  const blobSize = size + Math.random() * 50;
  const floatYAnim = useRef(new Animated.Value(0)).current;
  const floatXAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (animate) {
      // Create random durations between 3-6 seconds
      const yDuration = 3000 + Math.random() * 3000;
      const xDuration = 4000 + Math.random() * 2000;
      const scaleDuration = 5000 + Math.random() * 2000;
      
      // Loop Y animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatYAnim, {
            toValue: 1,
            duration: yDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatYAnim, {
            toValue: 0,
            duration: yDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Loop X animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatXAnim, {
            toValue: 1,
            duration: xDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatXAnim, {
            toValue: 0,
            duration: xDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Loop scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: scaleDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: scaleDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [floatYAnim, floatXAnim, scaleAnim, animate]);
  
  const yOffset = floatYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15], // Move 15 pixels up and down
  });
  
  const xOffset = floatXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10], // Move 10 pixels left and right
  });
  
  return (
    <Animated.View 
      style={[
        style, 
        styles.blobContainer,
        animate ? {
          transform: [
            { translateY: yOffset },
            { translateX: xOffset },
            { scale: scaleAnim }
          ]
        } : {}
      ]}
    >
      <View
        style={{
          width: blobSize,
          height: blobSize,
          borderRadius: blobSize / 2,
          backgroundColor: color,
          opacity: 0.7,
        }}
      />
      {blur && (
        <BlurView
          intensity={50}
          style={StyleSheet.absoluteFillObject}
          tint="light"
        />
      )}
    </Animated.View>
  );
};

// --- Slide 1 Component ---
const WelcomeSlide: React.FC<SlideProps> = ({ theme, isActive }) => {
  // Animation for logo
  const logoAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      logoAnim.setValue(0);
    }
  }, [isActive, logoAnim]);
  
  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  
  const logoOpacity = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  return (
    <View style={styles.slideContainer}>
      {/* Decorative blobs */}
      <RandomBlob color="#B786ED" size={180} style={{ position: 'absolute', top: -100, right: -60 }} />
      <RandomBlob color="#64B6FF" size={150} style={{ position: 'absolute', bottom: 150, left: -70 }} />
      <RandomBlob color="#FF8CB4" size={120} style={{ position: 'absolute', top: 200, left: -40 }} />
      
      <Animated.View style={[
        styles.logoContainer,
        {
          transform: [{ scale: logoScale }],
          opacity: logoOpacity
        }
      ]}>
       
          <IconSvg width={48} height={48} fill={theme.text} />
        
        <Text style={[styles.logoText, { color: theme.text }]}>Teethsi</Text>
      </Animated.View>
      
      <AnimatedImageContainer
        source={FirstScreenIllustration}
        style={styles.illustrationContainerStyle}
        isActive={isActive}
      />
     
      <AnimatedText 
        style={[styles.slideTitle, { color: theme.text }]} 
        isActive={isActive} 
        delay={100}
      >
        Welcome to{' '}
        <Text style={[styles.highlightText, { color: theme.primary }]}>
          Teethsi
        </Text>
      </AnimatedText>
      
      <View style={styles.dividerContainer}>
        <Animated.View 
          style={[
            styles.divider, 
            { backgroundColor: theme.primary },
            isActive ? styles.dividerActive : null
          ]} 
        />
      </View>
      
      <AnimatedText 
        style={[styles.slideDescription, { color: theme.textSecondary }]} 
        isActive={isActive} 
        delay={200}
      >
        Modern healthcare platform transforming patient care with AI-powered visualizations.
      </AnimatedText>
      
      <View style={styles.bulletPointsContainer}>
        {['Instant AI Results', 'Secure Patient Data', 'Patient Engagement'].map((text, index) => (
          <AnimatedText
            key={index}
            style={[styles.bulletPoint, { color: theme.textSecondary }]}
            isActive={isActive}
            delay={300 + index * 100}
          >
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.primary} />{' '}
            {text}
          </AnimatedText>
        ))}
      </View>
    </View>
  );
};

// --- Slide 2 Component ---
const HowItWorksSlide: React.FC<SlideProps> = ({ theme, isActive }) => {
  // Animation for steps
  const stepAnimValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];
  
  useEffect(() => {
    if (isActive) {
      // Animate steps in sequence
      stepAnimValues.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 300 + index * 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Reset animations when slide is inactive
      stepAnimValues.forEach(anim => anim.setValue(0));
    }
  }, [isActive, stepAnimValues]);
  
  return (
    <View style={styles.slideContainer}>
      {/* Decorative blobs */}
      <RandomBlob color="#64D2FF" size={200} style={{ position: 'absolute', top: 120, right: -90 }} />
      <RandomBlob color="#FB96A6" size={150} style={{ position: 'absolute', bottom: 120, left: -80 }} />
      <RandomBlob color="#B786ED" size={100} style={{ position: 'absolute', top: -40, left: 60 }} />
      
      <AnimatedImageContainer
        source={HowItWorksIllustration}
        style={styles.illustrationContainerStyle}
        isActive={isActive}
      />
      
      <AnimatedText 
        style={[styles.slideTitle, { color: theme.text }]} 
        isActive={isActive} 
        delay={100}
        showGradient={true}
      >
        How It Works
      </AnimatedText>
      
      <View style={styles.dividerContainer}>
        <Animated.View 
          style={[
            styles.divider, 
            { backgroundColor: theme.primary },
            isActive ? styles.dividerActive : null
          ]} 
        />
      </View>
      
      {/* Step 1 */}
      <Animated.View 
        style={[
          styles.stepContainer,
          {
            opacity: stepAnimValues[0],
            transform: [{ 
              translateX: stepAnimValues[0].interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['#B786ED', '#9164FF']}
          style={styles.stepNumber}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.stepNumberText}>1</Text>
        </LinearGradient>
        <View style={styles.stepTextContainer}>
          <Text style={[styles.stepHeading, { color: theme.text }]}>Upload Patient Images</Text>
          <Text style={[styles.stepText, { color: theme.textSecondary }]}>
            Take or select photos of your patient's teeth
          </Text>
        </View>
      </Animated.View>
      
      {/* Step 2 */}
      <Animated.View 
        style={[
          styles.stepContainer,
          {
            opacity: stepAnimValues[1],
            transform: [{ 
              translateX: stepAnimValues[1].interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['#64B6FF', '#4A8EFF']}
          style={styles.stepNumber}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.stepNumberText}>2</Text>
        </LinearGradient>
        <View style={styles.stepTextContainer}>
          <Text style={[styles.stepHeading, { color: theme.text }]}>AI Processes Images</Text>
          <Text style={[styles.stepText, { color: theme.textSecondary }]}>
            Our advanced AI analyzes dental structure
          </Text>
        </View>
      </Animated.View>
      
      {/* Step 3 */}
      <Animated.View 
        style={[
          styles.stepContainer,
          {
            opacity: stepAnimValues[2],
            transform: [{ 
              translateX: stepAnimValues[2].interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['#FF8CB4', '#FF6492']}
          style={styles.stepNumber}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.stepNumberText}>3</Text>
        </LinearGradient>
        <View style={styles.stepTextContainer}>
          <Text style={[styles.stepHeading, { color: theme.text }]}>Get Beautiful Visualizations</Text>
          <Text style={[styles.stepText, { color: theme.textSecondary }]}>
            Show patients how veneers will enhance their smile
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// --- Slide 3 Component ---
const FeaturesSlide: React.FC<SlideProps> = ({ theme, isActive }) => {
  // Animation references for feature items
  const featureAnimValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  
  const betaAnimValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      // Animate features sequentially
      featureAnimValues.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 300 + (index * 150),
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
      
      // Animate beta badge with bounce effect
      Animated.spring(betaAnimValue, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset animations when not active
      featureAnimValues.forEach(anim => anim.setValue(0));
      betaAnimValue.setValue(0);
    }
  }, [isActive, featureAnimValues, betaAnimValue]);
  
  return (
    <View style={styles.slideContainer}>
      {/* Decorative blobs */}
      <RandomBlob color="#7CA9FF" size={180} style={{ position: 'absolute', top: -80, left: -90 }} />
      <RandomBlob color="#FF8CB4" size={150} style={{ position: 'absolute', bottom: 150, right: -60 }} />
      <RandomBlob color="#B786ED" size={130} style={{ position: 'absolute', top: 190, right: -30 }} />
      
      <AnimatedImageContainer
        source={FeaturesIllustration}
        style={styles.illustrationContainerStyle}
        isActive={isActive}
      />
      
      <AnimatedText 
        style={[styles.slideTitle, { color: theme.text }]} 
        isActive={isActive} 
        delay={100}
        showGradient={true}
        gradientColors={['#64B6FF', '#B786ED']}
      >
        Powerful Features
      </AnimatedText>
      
      <View style={styles.dividerContainer}>
        <Animated.View 
          style={[
            styles.divider, 
            { backgroundColor: theme.primary },
            isActive ? styles.dividerActive : null
          ]} 
        />
      </View>
      
      <View style={styles.featureListContainer}>
        {/* Feature 1 */}
        <Animated.View 
          style={[
            styles.featureItem,
            {
              opacity: featureAnimValues[0],
              transform: [
                { 
                  translateX: featureAnimValues[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#B786ED', '#9E64FF']}
            style={styles.featureIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="image-filter-center-focus" size={24} color="white" />
          </LinearGradient>
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureHeading, { color: theme.text }]}>Generate AI Visualizations</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Create stunning veneer previews instantly
            </Text>
          </View>
        </Animated.View>
        
        {/* Feature 2 */}
        <Animated.View 
          style={[
            styles.featureItem,
            {
              opacity: featureAnimValues[1],
              transform: [
                { 
                  translateX: featureAnimValues[1].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#64B6FF', '#4A8EFF']}
            style={styles.featureIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="folder-key-outline" size={24} color="white" />
          </LinearGradient>
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureHeading, { color: theme.text }]}>Secure Patient Records</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              HIPAA-compliant data protection
            </Text>
          </View>
        </Animated.View>
        
        {/* Feature 3 */}
        <Animated.View 
          style={[
            styles.featureItem,
            {
              opacity: featureAnimValues[2],
              transform: [
                { 
                  translateX: featureAnimValues[2].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#FF8CB4', '#FF6492']}
            style={styles.featureIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="chart-line" size={24} color="white" />
          </LinearGradient>
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureHeading, { color: theme.text }]}>Boost Patient Engagement</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Increase treatment acceptance rates
            </Text>
          </View>
        </Animated.View>
        
        {/* Beta Badge */}
        <Animated.View 
          style={[
            styles.betaContainer,
            {
              opacity: betaAnimValue,
              transform: [
                { 
                  scale: betaAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(180, 180, 180, 0.2)', 'rgba(140, 140, 140, 0.2)']}
            style={styles.betaBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={20} style={StyleSheet.absoluteFillObject} tint="light" />
            <MaterialCommunityIcons name="beta" size={24} color="#FF6492" />
            <Text style={[styles.betaText, { color: theme.textSecondary }]}>
              Beta version - More features coming soon! ✨
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
};

// --- Slide 4 Component ---
const GetStartedSlide: React.FC<SlideProps & { onGetStarted: () => void }> = ({ theme, onGetStarted, isActive }) => {
  // Animation for button pulse
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isActive) {
      // Create a pulsing animation for the button
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation when not active
      buttonPulseAnim.stopAnimation();
      buttonPulseAnim.setValue(1);
    }
  }, [isActive, buttonPulseAnim]);
  
  return (
    <View style={styles.slideContainer}>
      {/* Decorative blobs */}
      <RandomBlob color="#B786ED" size={200} style={{ position: 'absolute', top: -100, right: -80 }} />
      <RandomBlob color="#64B6FF" size={180} style={{ position: 'absolute', bottom: 100, left: -90 }} />
      <RandomBlob color="#FF8CB4" size={140} style={{ position: 'absolute', top: 150, left: 40 }} />
      
      <AnimatedImageContainer
        source={GetStartedIllustration}
        style={[styles.illustrationContainerStyle, { marginBottom: 20 }]}
        isActive={isActive}
      />
      
      <AnimatedText 
        style={[styles.slideTitle, { color: theme.text }]} 
        isActive={isActive} 
        delay={100}
        showGradient={true}
        gradientColors={['#B786ED', '#64B6FF']}
      >
        Ready to Transform Your Practice
      </AnimatedText>
      
      <View style={styles.dividerContainer}>
        <Animated.View 
          style={[
            styles.divider, 
            { backgroundColor: theme.primary },
            isActive ? styles.dividerActive : null
          ]} 
        />
      </View>
      
      <AnimatedText 
        style={[styles.getStartedDescription, { color: theme.textSecondary }]} 
        isActive={isActive} 
        delay={200}
      >
        Join healthcare providers enhancing patient care with cutting-edge AI technology.
      </AnimatedText>
      
      <View style={styles.benefitsList}>
        {[
          'Improve patient satisfaction',
          'Streamline your workflow',
          'Stay ahead of competition'
        ].map((text, index) => (
          <AnimatedText
            key={index}
            style={[styles.benefitItem, { color: theme.text }]}
            isActive={isActive}
            delay={300 + (index * 100)}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.primary} />{' '}
            {text}
          </AnimatedText>
        ))}
      </View>
      
      <Animated.View
        style={{
          marginTop: 40,
          transform: [{ scale: buttonPulseAnim }]
        }}
      >
        <TouchableOpacity 
          onPress={onGetStarted} 
          activeOpacity={0.8}
          style={styles.getStartedButtonContainer}
        >
          <LinearGradient
            colors={['#B786ED', '#9164FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.getStartedButton}
          >
            <BlurView intensity={20} style={StyleSheet.absoluteFillObject} tint="light" />
            <Text style={styles.getStartedText}>Get Started Now</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      
      <AnimatedText
        style={[styles.noRiskText, { color: theme.textSecondary }]}
        isActive={isActive}
        delay={600}
      >
        No credit card required. Start free.
      </AnimatedText>
    </View>
  );
};

export default function LandingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Animation refs
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const [blobOpacity] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Fade in background elements
    Animated.timing(blobOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Start background color animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 15000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 15000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Background gradient colors based on color scheme
  const gradientColor1 = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: 
      colorScheme === 'dark' 
        ? ['rgba(41, 41, 41, 1)', 'rgba(35, 35, 45, 1)']
        : ['rgba(248, 248, 252, 1)', 'rgba(244, 240, 255, 1)']
  });
  
  const gradientColor2 = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange:
      colorScheme === 'dark'
        ? ['rgba(25, 25, 35, 1)', 'rgba(30, 30, 40, 1)']
        : ['rgba(240, 240, 255, 1)', 'rgba(235, 235, 250, 1)']
  });

  // Mark that user has seen landing screen and navigate to sign up
  const navigateToSignUp = async () => {
    try {
      // Make sure we set the value atomically and wait for it to complete
      await AsyncStorage.setItem('@has_seen_landing', 'true');
      // Add a small delay to ensure AsyncStorage write completes
      setTimeout(() => {
        router.push('/(auth)/sign-up');
      }, 100);
    } catch (error) {
      console.error('Error saving landing screen status:', error);
      // Even if there's an error, still navigate to sign-up
      router.push('/(auth)/sign-up');
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        {/* Animated Background gradient */}
        <Animated.View style={StyleSheet.absoluteFillObject}>
          <LinearGradient  
            colors={[gradientColor1.toString(), gradientColor2.toString()]}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Show Skip button only on pages 1 and 2 */}
        {currentPage > 0 && currentPage < 3 && (
          <BlurView
            intensity={80}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={styles.skipButtonContainer}
          >
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipToSignUp}
            >
              <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
            </TouchableOpacity>
          </BlurView>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={{ width: width * 4 }}
        >
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

        <BlurView
          intensity={80}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={styles.paginationContainer}
        >
          {[0, 1, 2, 3].map((index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 25, 10],
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
                  { 
                    width: dotWidth, 
                    opacity, 
                    backgroundColor: index === currentPage 
                      ? theme.primary 
                      : 'rgba(150, 150, 150, 0.5)' 
                  }
                ]}
              />
            );
          })}
        </BlurView>

        {currentPage < 3 && (
          <TouchableOpacity
            style={styles.nextButtonContainer}
            onPress={goToNextSlide}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#B786ED', '#9164FF']}
              style={styles.nextButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFillObject} tint="light" />
              <MaterialCommunityIcons name="arrow-right" size={28} color={'white'} />
            </LinearGradient>
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
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slideContainer: {
    width: '90%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  logoBackground: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  illustrationContainerStyle: {
    width: width * 0.8,
    height: height * 0.33,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
    lineHeight: 42,
  },
  highlightText: {
    fontWeight: '900',
  },
  slideDescription: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.85,
    maxWidth: '90%',
  },
  dividerContainer: {
    width: '100%',
    height: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    width: 0,
    height: 4,
    borderRadius: 2,
    marginBottom: 5,
  },
  dividerActive: {
    width: 40,
    marginBottom: 20,
    transitionProperty: 'all',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease',
  },
  bulletPointsContainer: {
    alignItems: 'flex-start',
    marginTop: 24,
    width: '80%',
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumberText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.8,
    lineHeight: 22,
  },
  featureListContainer: {
    width: '100%',
    marginTop: 10,
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.8,
    lineHeight: 22,
  },
  getStartedDescription: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.85,
    maxWidth: '90%',
    marginBottom: 30,
  },
  benefitsList: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  benefitItem: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  getStartedButtonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 30,
    overflow: 'hidden',
  },
  getStartedButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'white',
    marginRight: 10,
  },
  noRiskText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: width / 2 - 70,
    right: 0,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  skipButtonContainer: {
    position: 'absolute',
    top: 55,
    right: 25,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonContainer: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderRadius: 30,
    overflow: 'hidden',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  betaContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  betaBadge: {
    borderWidth: 1,
    borderColor: 'rgba(160, 160, 160, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  betaText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '600',
  },
  blobContainer: {
    overflow: 'hidden',
    borderRadius: 100,
    zIndex: -1,
  },
}); 