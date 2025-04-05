import { Stack } from 'expo-router/stack';

export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: true, title: 'Home' }} />;
} 