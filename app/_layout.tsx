import React from 'react';
import './globals.css'
import { Stack } from 'expo-router';
import { NotificationProvider } from '@/context/NotificationContext';
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:true ,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// Background notification task
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log("📩 Background notification received!", { 
      data,
      error,
      executionInfo,
    });

    if (error) {
      console.error("❌ Task error:", error);
      return Promise.resolve();
    }

    return Promise.resolve();
  }
);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseDiary" options={{ headerShown: false }} />
        </Stack>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
}
