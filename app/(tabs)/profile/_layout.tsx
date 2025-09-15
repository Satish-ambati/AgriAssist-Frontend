import React from "react";
import { Stack } from "expo-router";
export default function profileLayout() {
    return (
        <Stack>
            <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
    );
}