import { HeaderShownContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import React from 'react';
export default function financeLayout() {
    return (
        <Stack screenOptions={{headerShown  : false}}>
            <Stack.Screen name="financeManager" options={{ headerShown: false }}/>
        </Stack>
    );
}