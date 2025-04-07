import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
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
        { text: 'Manage up to 150 Patients', included: true },
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Unlock More Features</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Choose the plan that best fits your practice needs.
        </Text>

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => (
            <PlanCard
              key={index}
              plan={plan}
              theme={theme}
              onSelectPlan={() => handleSelectPlan(plan.name)}
            />
          ))}
        </View>
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
}); 