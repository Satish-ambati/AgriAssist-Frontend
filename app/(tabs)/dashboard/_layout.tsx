import React from "react";
import { Stack } from "expo-router";
export default function dashboardLayout() {
    return (
        <Stack>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
    );
}