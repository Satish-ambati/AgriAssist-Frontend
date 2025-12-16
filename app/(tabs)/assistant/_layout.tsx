import React from "react";
import { Stack, Tabs } from "expo-router";

export default function AssistantLayout() {
  return (
  <Stack screenOptions={{ headerShown: false }}>
    
    <Stack.Screen  name="FarmManagement" options={{headerShown : false}}/>
    <Stack.Screen name="AddFarm" options={{ headerShown: false }} />
    <Stack.Screen name="CropSelection" options={{ headerShown: false }} /> 
    <Stack.Screen name="CropMonitoring" options={{ headerShown: false }} />
    
  </Stack>);
}
