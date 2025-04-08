import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentUser } from '../utils/patientStorage';
import { getUserProfile, saveUserProfile, UserProfile } from '../utils/userProfileStorage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [editedBio, setEditedBio] = useState('Obsessed with perfect smiles...smilophilia');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = await getCurrentUser();
      if (userId) {
        const userProfile = await getUserProfile(userId);
        if (userProfile) {
          setProfile(userProfile);
          setEditedProfile(userProfile);
          setBio(userProfile.bio || '');
          setEditedBio(userProfile.bio || '');
        } else {
          // Create default profile if none exists
          const defaultProfile: UserProfile = {
            name: userId.split('@')[0],
            photoUrl: 'https://api.a0.dev/assets/image?text=professional%20headshot%20of%20male%20doctor%20in%20white%20coat',
            yearsOfExperience: 0,
            totalPatients: 0,
            bio: '🦷 Passionately dedicated to creating beautiful smiles! When I\'m not crafting perfect veneers, you\'ll find me exploring the latest dental innovations or dreaming about the next perfect smile transformation. Remember: A smile is the best accessory anyone can wear! 😊'
          };
          await saveUserProfile(userId, defaultProfile);
          setProfile(defaultProfile);
          setEditedProfile(defaultProfile);
          setBio(defaultProfile.bio);
          setEditedBio(defaultProfile.bio);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const userId = await getCurrentUser();
      if (userId && editedProfile) {
        const updatedProfile = {
          ...editedProfile,
          bio: editedBio
        };
        await saveUserProfile(userId, updatedProfile);
        setProfile(updatedProfile);
        setBio(editedBio);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditedBio(bio);
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && editedProfile) {
        setEditedProfile({
          ...editedProfile,
          photoUrl: result.assets[0].uri
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const StatCard = ({ icon, value, label }: { icon: string; value: string | number; label: string }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={isEditing ? pickImage : undefined}>
              <Image 
                source={{ uri: isEditing ? editedProfile?.photoUrl : profile?.photoUrl }} 
                style={styles.profileImage} 
              />
              {isEditing && (
                <View style={[styles.editPhotoButton, { backgroundColor: theme.primary }]}>
                  <MaterialCommunityIcons name="camera" size={16} color="white" />
                </View>
              )}
            </Pressable>
            <View style={styles.headerInfo}>
              {isEditing ? (
                <TextInput
                  style={[styles.nameInput, { color: theme.text }]}
                  value={editedProfile?.name}
                  onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, name: text } : null)}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textSecondary}
                />
              ) : (
                <Text style={[styles.name, { color: theme.text }]}>{profile?.name}</Text>
              )}
            </View>
          </View>
          
          {isEditing ? (
            <View style={styles.editButtons}>
              <Pressable
                style={[styles.editButton, { borderColor: theme.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.editButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.editButton, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.editButtonText, { color: 'white' }]}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.editButton, { borderColor: theme.border }]}
              onPress={handleEdit}
            >
              <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard icon="account-group" value={profile?.totalPatients || 0} label="Patients" />
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <StatCard icon="clock-outline" value={profile?.yearsOfExperience || 0} label="Years" />
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        </View>
        <View style={[styles.bioContainer, { backgroundColor: theme.surface }]}>
          {isEditing ? (
            <TextInput
              style={[styles.bioInput, { color: theme.text }]}
              value={editedBio}
              onChangeText={setEditedBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.bioText, { color: theme.text }]}>
              {bio || 'No bio provided'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 4,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statDivider: {
    width: 0.5,
    marginVertical: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bioContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bioInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});