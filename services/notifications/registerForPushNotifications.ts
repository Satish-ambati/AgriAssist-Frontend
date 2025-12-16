import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import axios from "axios";
import { Api } from "@/app/api";

export async function registerForPushNotificationsAsync(
  farmerId: string,
  existingExpoToken?: string | null
) {
  if (!farmerId) {
    console.log("❌ farmerId missing. Cannot register push token.");
    return null;
  }

  // Android channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Permission check
  if (!Device.isDevice) {
    throw new Error("Must use a physical device for push notifications.");
  }

  const { status : existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Push notification permission not granted.");
  }

  // Get project ID for EAS
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Project ID not found in Constants.");
  }

  try {
    // Get new token
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log("📱 Current Expo Token:", pushTokenString);

    // Update server only if different
    if (existingExpoToken !== pushTokenString) {
      try {
        await axios.post(Api + "/api/user/update-push-token", {
          farmerId,
          expoPushToken: pushTokenString,
        });

        console.log("✅ Expo push token updated successfully.");
      } catch (err) {
        console.warn("⚠ Failed to update Expo push token:", err);
      }
    } else {
      console.log("ℹ Token unchanged. No update needed.");
    }

    return pushTokenString;
  } catch (err) {
    throw new Error("Expo token fetch failed: " + err);
  }
}
