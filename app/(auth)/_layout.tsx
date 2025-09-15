
import { Stack } from 'expo-router';
import React from 'react';
export default function AuthLayout() {
  return (
    <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="otp-verification" options={{ headerShown: false }} />
        <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
    </Stack>
  );
}
