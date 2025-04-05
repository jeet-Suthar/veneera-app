import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  // If the user is signed in, redirect them to the main app
  if (isSignedIn) {
    return <Redirect href={'/tabs/HomeScreen'} /> // Redirect to the main tabs
  }

  // Only require `<Stack />` if you need to provide options for the routes under (auth)
  // Otherwise it is not necessary for groups.
  // We'll include it here in case you want to add headers later.
  return <Stack screenOptions={{ headerShown: false }} />;
} 