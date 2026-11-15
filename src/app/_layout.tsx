import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/colors';
import { ProfileProvider, useProfile } from '@/lib/profile';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { loaded } = useProfile();

  // Keep the splash screen up until saved progress has loaded.
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="questionnaire" options={{ title: 'A few questions' }} />
      <Stack.Screen name="step/[id]" options={{ title: 'Your step' }} />
      <Stack.Screen name="benefit/[id]" options={{ title: 'Guide' }} />
      <Stack.Screen name="restore" options={{ title: 'Recovery code' }} />
      <Stack.Screen name="help" options={{ title: 'Help right now', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar style="light" />
      <RootStack />
    </ProfileProvider>
  );
}
