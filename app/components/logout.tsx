import { Alert, TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import React, { useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useFarmerStore } from "@/store";
import { Api } from "../api";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

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
      <TouchableOpacity
        className={`bg-red-100 px-3 py-1 rounded-full border-red-500 shadow-lg ${
          isLoading ? "bg-red-400" : "bg-red-100"
        }`}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View className="flex flex-row gap-1 items-center justify-center  ">
            <MaterialIcons name="logout" size={12} color="red" />
            <Text className="text-red-500 font-semibold text-xs">Logout</Text>
          </View>
        )}
      </TouchableOpacity>
  );
};

export default Logout;
