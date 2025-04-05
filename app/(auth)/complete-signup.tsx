import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CompleteSignupScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  
  // If user is already signed in, redirect them away
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/tabs/HomeScreen');
    }
  }, [isSignedIn]);
  
  // If no activeSignUp, redirect to signup
  useEffect(() => {
    if (isLoaded && !signUp.createdSessionId && !signUp.status) {
      router.replace('/(auth)/sign-up');
    }
  }, [isLoaded, signUp]);
  
  const handleSubmitPhoneNumber = async () => {
    if (!isLoaded || !phoneNumber) return;
    
    setLoading(true);
    try {
      // Add the phone number to the sign-up
      await signUp.update({
        phoneNumber,
      });
      
      // Send verification code
      await signUp.preparePhoneNumberVerification();
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Phone update error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyPhoneNumber = async () => {
    if (!isLoaded || !verificationCode) return;
    
    setLoading(true);
    try {
      // Verify the phone number
      const result = await signUp.attemptPhoneNumberVerification({
        code: verificationCode,
      });
      
      if (result.status === 'complete') {
        // The sign-up is complete, we have a user
        await setActive({ session: result.createdSessionId });
        router.replace('/tabs/HomeScreen');
      } else {
        // Handle incomplete status
        console.log('Verification incomplete:', result);
        Alert.alert('Verification Incomplete', 'Please try again or contact support.');
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Verification Error', err.errors?.[0]?.message || 'Failed to verify phone number');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your phone number</Text>
        <Text style={styles.description}>We've sent a verification code to {phoneNumber}</Text>
        
        <TextInput
          style={styles.input}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleVerifyPhoneNumber}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your profile</Text>
      <Text style={styles.description}>Please provide your phone number to complete the sign-up process.</Text>
      
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone number (with country code)"
        keyboardType="phone-pad"
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmitPhoneNumber}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Submitting...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a3a3a3',
  },
}); 