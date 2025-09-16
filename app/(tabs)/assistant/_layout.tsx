

import React from "react";
import { Stack, Tabs } from "expo-router";

export default function AssistantLayout() {
  return (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="crop-monitoring" options={{ headerShown: false }} />
    <Stack.Screen name="crop-selection" options={{ headerShown: false }} /> 
    <Stack.Screen name="fertilizer-schedule" options={{ headerShown: false }} />
    <Stack.Screen name="harvest-planning" options={{ headerShown: false }} /> 
    <Stack.Screen name="irrigation-schedule" options={{ headerShown: false }} />
    <Stack.Screen name="soil-report-upload" options={{ headerShown: false }} />
       
  </Stack>);
}