import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const renderSettingItem = (icon: string, title: string, value?: boolean) => (
    <Pressable style={styles.settingItem}>
      <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.primary} />
      </View>
      <Text style={[styles.settingText, { color: theme.text }]}>{title}</Text>
      {value !== undefined ? (
        <Switch 
          value={value} 
          onValueChange={() => {}} 
          trackColor={{ false: theme.border, true: theme.primary }}
          ios_backgroundColor={theme.border}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={18} color={theme.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
          {renderSettingItem('crown-outline', 'Premium Features')}
        
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Help & Information</Text>
        </View>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface }]}>
          {renderSettingItem('email-outline', 'Contact Support')}
          {renderSettingItem('information-outline', 'About')}
        </View>
      </View>

      <Pressable style={styles.logoutButton}>
        <MaterialCommunityIcons name="logout" size={18} color={theme.error} />
        <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
      </Pressable>
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 8,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});