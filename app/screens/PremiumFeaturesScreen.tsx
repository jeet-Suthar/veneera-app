import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FeatureItemProps {
  text: string;
  theme: typeof Colors.light | typeof Colors.dark;
  included: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text, theme, included }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons
      name={included ? "check-circle" : "close-circle"}
      size={20}
      color={included ? theme.success : theme.textSecondary}
      style={{ marginRight: 8, opacity: included ? 1 : 0.5 }}
    />
    <Text
      style={[
        styles.featureText,
        { color: included ? theme.text : theme.textSecondary },
        !included && styles.featureTextExcluded
      ]}
    >
      {text}
    </Text>
  </View>
);

interface PlanCardProps {
  plan: {
    name: string;
    price?: string;
    features: { text: string; included: boolean }[];
    highlight?: boolean;
    ctaText: string;
  };
  theme: typeof Colors.light | typeof Colors.dark;
  onSelectPlan: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, theme, onSelectPlan }) => (
  <View style={[styles.planCard, { backgroundColor: theme.surface }, plan.highlight && styles.highlightedCard]}>
    {plan.highlight && <Text style={[styles.highlightBadge, {backgroundColor: theme.primary, color: theme.background}]}>Recommended</Text>}
    <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
    {plan.price ? (
        <Text style={[styles.planPrice, { color: theme.primary }]}>{plan.price}</Text>
    ) : (
        <Text style={[styles.planPrice, { color: theme.primary }]}>Free</Text>
    )}

    <View style={styles.featuresContainer}>
      {plan.features.map((feature, index) => (
        <FeatureItem key={index} text={feature.text} theme={theme} included={feature.included} />
      ))}
    </View>

    <TouchableOpacity
      style={[
        styles.ctaButton,
        { backgroundColor: plan.highlight ? theme.primary : theme.secondary }
      ]}
      onPress={onSelectPlan}
    >
      <Text style={[styles.ctaText, { color: plan.highlight ? theme.background : theme.primary }]}>
        {plan.ctaText}
      </Text>
    </TouchableOpacity>
  </View>
);

export default function PremiumFeaturesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const plans = [
    {
      name: 'Free',
      features: [
        { text: 'Manage up to 25 Patients', included: true },
        { text: '5 AI Visualizations / month', included: true },
        { text: 'Basic Patient Record Storage', included: true },
        { text: 'Standard Support', included: true },
        { text: 'Basic Analytics', included: false },
        { text: 'Team Collaboration', included: false },
      ],
      ctaText: 'Current Plan'
    },
    {
      name: 'Standard',
      price: '$19 / month', // Placeholder price
      highlight: true,
      features: [
        { text: 'Manage up to 70 Patients', included: true },
        { text: '50 AI Visualizations / month', included: true },
        { text: 'Enhanced Storage Capacity', included: true },
        { text: 'Email Support', included: true },
        { text: 'Basic Analytics Dashboard', included: true },
        { text: 'Team Collaboration', included: false },
      ],
      ctaText: 'Upgrade to Standard'
    },
    {
      name: 'Pro',
      price: '$49 / month', // Placeholder price
      features: [
        { text: 'Unlimited Patients', included: true },
        { text: 'Unlimited AI Visualizations', included: true },
        { text: 'Large Storage + Backups', included: true },
        { text: 'Priority Phone & Email Support', included: true },
        { text: 'Advanced Analytics & Reporting', included: true },
        { text: 'Team Collaboration Features', included: true },
      ],
      ctaText: 'Upgrade to Pro'
    },
  ];

  const handleSelectPlan = (planName: string) => {
    console.log(`Selected Plan: ${planName}`);
    // TODO: Implement actual subscription logic (e.g., navigate to payment)
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Subscription Plans', headerBackTitle: 'Settings' }} />
      <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>     
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Teethsi App</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Your Digital Dental Practice Assistant
        </Text>

        {/* Beta Phase Notice */}
        <View style={[styles.betaNotice, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="beta" size={24} color={theme.primary} style={styles.betaIcon} />
          <View style={styles.betaTextContainer}>
            <Text style={[styles.betaTitle, { color: theme.text }]}>Beta Phase Notice</Text>
            <Text style={[styles.betaDescription, { color: theme.textSecondary }]}>
              Our app is currently in beta phase. There are no subscriptions available at this time. You may encounter some bugs or issues - we appreciate your patience and feedback as we work towards our full launch.
            </Text>
          </View>
        </View>

        {/* Current Features Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="star" size={20} color={theme.primary} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Features</Text>
        </View>

        <View style={[styles.featuresCard, { backgroundColor: theme.surface }]}>
          <FeatureItem 
            text="Patient Management - Add, view, and manage patient records" 
            theme={theme} 
            included={true} 
          />
          <FeatureItem 
            text="AI-Powered Veneer Visualization - Generate realistic veneer previews" 
            theme={theme} 
            included={true} 
          />
          <FeatureItem 
            text="Secure Data Storage - Patient information is stored securely" 
            theme={theme} 
            included={true} 
          />
          <FeatureItem 
            text="Appointment Tracking - Schedule and manage patient appointments" 
            theme={theme} 
            included={true} 
          />
          <FeatureItem 
            text="User Authentication - Secure login and account management" 
            theme={theme} 
            included={true} 
          />
        </View>

        {/* Coming Soon Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="rocket-launch" size={20} color={theme.primary} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Coming Soon</Text>
        </View>

        <View style={[styles.featuresCard, { backgroundColor: theme.surface }]}>
          <FeatureItem 
            text="Advanced Analytics Dashboard" 
            theme={theme} 
            included={false} 
          />
          <FeatureItem 
            text="Team Collaboration Features" 
            theme={theme} 
            included={false} 
          />
          <FeatureItem 
            text="Enhanced Storage with Automatic Backups" 
            theme={theme} 
            included={false} 
          />
          <FeatureItem 
            text="Priority Support" 
            theme={theme} 
            included={false} 
          />
          <FeatureItem 
            text="Customizable Treatment Plans" 
            theme={theme} 
            included={false} 
          />
        </View>

        {/* Feedback Section */}
        <View style={[styles.feedbackCard, { backgroundColor: theme.primary }]}>
          <MaterialCommunityIcons name="message-text-outline" size={24} color="#fff" style={styles.feedbackIcon} />
          <Text style={styles.feedbackTitle}>Help Us Improve</Text>
          <Text style={styles.feedbackText}>
            We're constantly working to enhance your experience. Your feedback is invaluable to us as we develop new features and improvements.
          </Text>
          <TouchableOpacity
            style={[styles.feedbackButton, { backgroundColor: '#fff' }]}
            onPress={() => router.push('/screens/ContactSupportScreen')}
          >
            <Text style={[styles.feedbackButtonText, { color: theme.primary }]}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'transparent', // Default no border
    overflow: 'hidden', // For badge positioning
    position: 'relative',
  },
  highlightedCard: {
    borderColor: Colors.light.primary, // Use a fixed color or theme.primary
    borderWidth: 2,
  },
  highlightBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontSize: 11,
    fontWeight: 'bold',
    borderBottomLeftRadius: 16, // Stylish corner
    borderTopRightRadius: 14, // Match card radius
  },
  planName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    flexShrink: 1, // Allow text to wrap
    lineHeight: 21,
  },
  featureTextExcluded: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  betaNotice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 133, 133, 0.64)',
  },
  betaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  betaTextContainer: {
    flex: 1,
    
  },
  betaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  betaDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    position: 'absolute',
    top: 46,
    left: 26,
    zIndex: 1000,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  featuresCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  feedbackIcon: {
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  feedbackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 