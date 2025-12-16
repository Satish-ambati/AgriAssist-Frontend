import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../services/notifications/registerForPushNotifications";
import { useFarmerStore } from "@/store";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { farmerInfo } = useFarmerStore();

  const notificationListener = useRef<ReturnType<
    typeof Notifications.addNotificationReceivedListener
  > | null>(null);

  const responseListener = useRef<ReturnType<
    typeof Notifications.addNotificationResponseReceivedListener
  > | null>(null);

  // 🔥 Wait for farmerInfo to load
  useEffect(() => {
    if (!farmerInfo?.farmer) {
      console.log("⏳ farmerInfo not ready yet...");
      return;
    }

    console.log("✅ farmerInfo loaded. Registering push notifications...");

    registerForPushNotificationsAsync(
      farmerInfo.farmer._id,
      farmerInfo.farmer.expoPushToken
    )
      .then((token) => setExpoPushToken(token))
      .catch((err) => setError(err));

    // Listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        setNotification(notif);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("📩 Notification Response:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [farmerInfo?.farmer]); // Re-run only when farmer loads

  const value = { expoPushToken, notification, error };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
