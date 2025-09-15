
import { Stack } from 'expo-router';
import React from 'react';
export default function OnboardingLayout() {
  return (
    <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="farm-setup" options={{ headerShown: false }} />
        <Stack.Screen name="language-select" options={{ headerShown: false }} />
    </Stack>
  );
}
