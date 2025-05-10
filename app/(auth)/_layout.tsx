import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { View, useColorScheme, StyleSheet } from 'react-native'
import { Colors } from '../utils/theme'

export default function AuthRoutesLayout() {
  const { user } = useAuth()
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // If the user is signed in, redirect them to the main app
  if (user) {
    return <Redirect href={'/tabs/HomeScreen'} /> // Redirect to the main tabs
  }

  // Only require `<Stack />` if you need to provide options for the routes under (auth)
  // Otherwise it is not necessary for groups.
  // We'll include it here in case you want to add headers later.
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 