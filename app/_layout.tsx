
import { Stack } from 'expo-router';
import React from 'react';
import './globals.css';
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="assistantScreen" options={{ headerShown: false }} />
    </Stack>
  );
}

