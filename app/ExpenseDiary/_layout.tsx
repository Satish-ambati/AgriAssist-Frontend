import { HeaderShownContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import React from 'react';
export default function financeLayout() {
    return (
        <Stack screenOptions={{headerShown  : false}}>
            <Stack.Screen name="financeManager" options={{ headerShown: false }}/>
            <Stack.Screen name="addNote" options={{  headerTitle: 'Add Note', headerStyle: { backgroundColor: '#F5FDF7' }, headerTitleStyle: { color: '#22543D', fontWeight: 'bold' }, headerTintColor: '#22543D' }}/>
            <Stack.Screen name="addDebt" options={{  headerTitle: 'Add Debt', headerStyle: { backgroundColor: '#F5FDF7' }, headerTitleStyle: { color: '#22543D', fontWeight: 'bold' }, headerTintColor: '#22543D' }}/>
        </Stack>
    );
}