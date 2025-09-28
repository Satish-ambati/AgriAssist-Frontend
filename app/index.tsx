import React, { useEffect, useState } from "react";
import { Text, View, Alert, Animated } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Api } from "./api";
import { useFarmerStore } from "@/store";

export const options = {
  headerShown: false, // <- hides the header
};

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pulseAnim = new Animated.Value(1);
  const fadeAnim = new Animated.Value(0);
  const { farmerInfo, setFarmerInfo, clearFarmerInfo } = useFarmerStore();
  
    // Access token in memory (not persisted)
    const [accessToken, setAccessToken] = useState<string | null>(null);
  

  // Save refresh token securely
  const saveRefreshToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync("refreshToken", token);
    } catch (err) {
      console.error("Failed to store refresh token:", err);
      Alert.alert("Error", "Failed to save authentication data");
    }
  };

  // Reset form function
  const resetForm = () => {
    setIsAuthenticated(false);
  };

  

  // Initial fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Continuous pulse animation
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (isLoading) {
      startPulse();
    }
  }, [isLoading]);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait a bit for animation to show
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const storedRefreshToken = await SecureStore.getItemAsync(
          "refreshToken"
        );
        console.log("Stored refresh token:", storedRefreshToken);

        if (!storedRefreshToken) {
          setIsLoading(false);
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 1000);
          return;
        }

        const response = await axios.post(
          Api + "/api/auth/refresh-token",
          { refreshToken: storedRefreshToken },
          { timeout: 10000 }
        );

        if (response.data.success) {
          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user,
          } = response.data;

          setAccessToken(newAccessToken);
          await saveRefreshToken(newRefreshToken);
          setFarmerInfo(user, newAccessToken);
          setIsAuthenticated(true);
          setIsLoading(false);
          setFarmerInfo(user , newAccessToken) ;

          setTimeout(() => {
            router.replace("/(tabs)/dashboard");
          }, 1500);
        } else {
          await SecureStore.deleteItemAsync("refreshToken");
          resetForm();
          setIsLoading(false);
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 1000);
        }
      } catch (error: any) {
        console.error(
          "Failed to refresh token:",
          error.response?.data || error.message
        );
        await SecureStore.deleteItemAsync("refreshToken");
        resetForm();
        setIsLoading(false);
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 1000);
      }
    };

    initializeAuth();
  }, []);

  // Enhanced animated dot component
  const Dot = ({ delay }: { delay: number }) => {
    const opacity = useState(new Animated.Value(0.3))[0];
    const scale = useState(new Animated.Value(0.8))[0];

    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              delay,
            }),
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 600,
              useNativeDriver: true,
              delay,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { 
              toValue: 0.3, 
              duration: 600, 
              useNativeDriver: true 
            }),
            Animated.timing(scale, { 
              toValue: 0.8, 
              duration: 600, 
              useNativeDriver: true 
            }),
          ]),
        ])
      );
      loop.start();
    }, []);

    return (
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#22C55E",
          opacity,
          transform: [{ scale }],
          marginHorizontal: 4,
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-green-50">
      {/* Decorative background elements */}
      <View className="absolute top-24 right-12 w-16 h-16 bg-green-100 rounded-full opacity-60" />
      <View className="absolute top-48 left-10 w-12 h-12 bg-green-200 rounded-full opacity-40" />
      <View className="absolute bottom-40 right-20 w-10 h-10 bg-green-200 rounded-full opacity-50" />
      <View className="absolute bottom-60 left-16 w-8 h-8 bg-green-100 rounded-full opacity-30" />
      
      <Animated.View 
        className="flex-1 items-center justify-center px-8"
        style={{ opacity: fadeAnim }}
      >
        {/* Main Content Container */}
        <View className="items-center w-full max-w-sm">
          
          {/* App Icon Section */}
          <View className="items-center mb-12">
            <Animated.View
              className="w-32 h-32 bg-green-500 rounded-full items-center justify-center shadow-lg"
              style={{
                transform: [{ scale: pulseAnim }],
                backgroundColor: isAuthenticated ? "#22C55E" : "#22C55E",
              }}
            >
              <Text className="text-white text-6xl">
                {isAuthenticated ? "✓" : "🌾"}
              </Text>
            </Animated.View>
          </View>

          {/* Title Section */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
              FarmConnect
            </Text>
            <Text className="text-lg text-green-600 font-medium text-center">
              Empowering Farmers • Growing Together
            </Text>
          </View>

          {/* Status Section */}
          <View className="w-full items-center mb-8">
            <View className="bg-white px-8 py-6 rounded-3xl shadow-md border border-green-100 w-full">
              {isLoading && (
                <View className="items-center">
                  <Text className="text-green-700 font-semibold text-xl text-center mb-2">
                    Authenticating Account
                  </Text>
                  <Text className="text-green-600 text-center text-base">
                    Connecting to your farm dashboard...
                  </Text>
                </View>
              )}

              {!isLoading && !isAuthenticated && (
                <View className="items-center">
                  <Text className="text-orange-700 font-semibold text-xl text-center mb-2">
                    Preparing Login
                  </Text>
                  <Text className="text-orange-600 text-center text-base">
                    Setting up your session...
                  </Text>
                </View>
              )}

              {isAuthenticated && (
                <View className="items-center">
                  <Text className="text-green-700 font-semibold text-xl text-center mb-2">
                    Welcome Back!
                  </Text>
                  <Text className="text-green-600 text-center text-base">
                    Loading your dashboard...
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Loading Dots */}
          {isLoading && (
            <View className="flex-row items-center">
              <Dot delay={0} />
              <Dot delay={200} />
              <Dot delay={400} />
            </View>
          )}
        </View>

        {/* Bottom Section */}
        <View className="absolute bottom-12 items-center">
          <View className="flex-row items-center mb-3">
            <View className="w-2 h-2 bg-green-400 rounded-full mr-3" />
            <Text className="text-green-600 text-sm font-medium">Secure & Reliable</Text>
            <View className="w-2 h-2 bg-green-400 rounded-full mx-3" />
            <Text className="text-green-600 text-sm font-medium">Always Connected</Text>
            <View className="w-2 h-2 bg-green-400 rounded-full ml-3" />
          </View>
          <Text className="text-green-500 text-xs text-center">
            Version 2.1.0 • Built for Farmers
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}