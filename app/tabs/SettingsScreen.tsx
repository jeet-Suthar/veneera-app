import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SignOutButton } from '../components/SignOutButton';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const renderSettingItem = (icon: string, title: string, value?: boolean, onPress?: () => void) => (
    <Pressable style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.primary} />
      </View>
      <Text style={[styles.settingText, { color: theme.text }]}>{title}</Text>
      {value !== undefined ? (
        <Switch 
          value={value} 
          onValueChange={() => console.log('Theme toggle requires system implementation')} 
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.background}
          ios_backgroundColor={theme.border}
        />
      ) : (
        onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={theme.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>
        </View>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface }]}>
          {renderSettingItem('theme-light-dark', 'Dark Mode', colorScheme === 'dark')}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Subscription</Text>
        </View>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface }]}>
          {renderSettingItem('crown-outline', 'Premium Features', undefined, () => router.push('/screens/PremiumFeaturesScreen'))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Help & Information</Text>
        </View>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface }]}>
          {renderSettingItem('email-outline', 'Contact Support', undefined, () => router.push('/screens/ContactSupportScreen'))}
          {renderSettingItem('information-outline', 'About', undefined, () => router.push('/screens/AboutScreen'))}
        </View>
      <View style={styles.logoutContainer}>
         <SignOutButton
           style={[styles.logoutButtonBase, { backgroundColor: theme.secondary }]}
           textStyle={{ color: theme.text }}
         />
      </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  settingGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  logoutButtonBase: {
    padding: 20,
    borderRadius: 30,
  },
});