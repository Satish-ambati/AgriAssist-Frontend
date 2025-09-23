import { Alert, TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useFarmerStore } from "@/store";
import { Api } from "../api";
import { router } from "expo-router";

const Logout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { clearFarmerInfo } = useFarmerStore();

  const handleLogout = async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    setIsLoading(true);
    try {
      // Call logout API
      await axios.post(Api + "/api/auth/logout", {refreshToken}, { withCredentials: true });

      // Clear refresh token from secure store
      await SecureStore.deleteItemAsync("refreshToken");

      // Clear farmer info from Zustand
      clearFarmerInfo();

      Alert.alert("Success", "You have been logged out.");
      router.replace('/(auth)/login')
    } catch (error: any) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <TouchableOpacity
        className={`bg-red-600 px-6 py-3 rounded-xl shadow-lg ${
          isLoading ? "bg-red-400" : "bg-red-600"
        }`}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white font-semibold text-lg">Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Logout;
