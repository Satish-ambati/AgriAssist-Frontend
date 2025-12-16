import React, { useEffect, useState } from "react";
import { View, Button, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { useNotification } from "@/context/NotificationContext";
import { Api } from "../api";


interface SendNotificationButtonProps {
  message?: string;
  title?: string;
  sendTime?: string; // optional, ISO string
}

export const SendNotificationButton: React.FC<SendNotificationButtonProps> = ({
  message = "Hello! This is a test notification",
  sendTime = new Date().toISOString(), // default: now
}) => {
  const { expoPushToken, error } = useNotification();
  const [loading, setLoading] = useState(false);

      useEffect(() => {
        if(error){
            console.log(error);
        }
    } , [])

  const handleSendNotification = async () => {
    if (!expoPushToken) {
      Alert.alert("Error", "Push token not available yet.");
      return;
    }



    setLoading(true);
    try {
      const payload = {
        expoPushToken: expoPushToken,
        message,
        time: sendTime, // send a static or dynamic time
      };

      console.log(payload);
      console.log(`${Api}/api/notifications/send`);

      const response = await axios.post(`${Api}/api/notifications/send`, payload);
      if (response.data.success) {
        Alert.alert("Success", "Notification sent!");
      } else {
        Alert.alert("Failed", "Could not send notification.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while sending the notification.");
    } finally {
      setLoading(false);

    }
  };

  if (error) {
    return <View><Button title="Push Notification Error" onPress={() => Alert.alert("Error", error.message)} /></View>;
  }

  return (
    <View style={{ marginVertical: 10 }}>
      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Button title="Send Notification" onPress={handleSendNotification} />
      )}
    </View>
  );
};
