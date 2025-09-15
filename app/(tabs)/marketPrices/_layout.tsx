import React from "react";
import { Stack } from "expo-router";
export default function dashboardLayout() {
    return (
        <Stack>
            <Stack.Screen name="marketRecommendations" options={{ headerShown: false }} />
            <Stack.Screen name="priceDashboard" options={{ headerShown: false }} />
            <Stack.Screen name="sellingGuide" options={{ headerShown: false }} />
        </Stack>
    );
}