import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { Api } from "../api";
import { router } from "expo-router";
import { useFarmerStore } from "@/store";



const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const { farmerInfo, setFarmerInfo, clearFarmerInfo } = useFarmerStore();

  // Access token in memory (not persisted)
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // inside Login component
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");
        console.log(storedRefreshToken);
        if (!storedRefreshToken) {
          console.log("No refresh token found, user needs to log in");
          return;
        }

        console.log("Found refresh token, trying to refresh access token...");

        const response = await axios.post(
          Api + "/api/auth/refresh-token",
          { refreshToken: storedRefreshToken },
          { timeout: 10000 }
        );

        if (response.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken , user } = response.data;

          // update state
          setAccessToken(newAccessToken);

          // update refresh token in SecureStore
          await saveRefreshToken(newRefreshToken);

          console.log("✅ Tokens refreshed successfully");
          setFarmerInfo(user , newAccessToken) ;

          // Optionally navigate user directly if already authenticated
          router.replace("/(tabs)/dashboard/dashboard");
        } else {
          console.warn("Refresh token rejected:", response.data.message);
          await SecureStore.deleteItemAsync("refreshToken");
          resetForm();
        }
      } catch (error: any) {
        console.error("Failed to refresh token:", error.response?.data || error.message);
        await SecureStore.deleteItemAsync("refreshToken");
        resetForm();
      }
    };

    initializeAuth();
  }, []); // run once on mount

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && showOtpInput) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, showOtpInput]);

  // Save refresh token securely
  const saveRefreshToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync("refreshToken", token);
    } catch (err) {
      console.error("Failed to store refresh token:", err);
      Alert.alert("Error", "Failed to save authentication data");
    }
  };

  // Handle sending OTP
  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        Api + "/api/auth/send-otp",
        { phonenumber: phoneNumber },
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success) {
        setShowOtpInput(true);
        setTimer(60);
        setCanResend(false);
        Alert.alert("Success", `OTP sent to +91 ${phoneNumber}`);
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      if (error.response) {
        Alert.alert("Error", error.response.data?.message || "Server error occurred");
      } else if (error.request) {
        Alert.alert("Network Error", "Please check your internet connection and try again");
      } else {
        Alert.alert("Error", "Something went wrong while sending OTP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP change
  const handleOtpChange = (value: string, index: number): void => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP keypress
  const handleOtpKeyPress = (key: string, index: number): void => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle login
  const handleLogin = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        Api + "/api/auth/login",
        { phonenumber: phoneNumber, code: otpString },
        { 
          withCredentials: true,
          timeout: 10000
        }
      );

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data;

        // Store refresh token securely
        await saveRefreshToken(refreshToken);

        // Keep access token in memory
        setAccessToken(accessToken);
        setFarmerInfo(response.data.user, response.data.accessToken);


        Alert.alert("Welcome!", `Login successful! Hello ${user?.name || 'Farmer'}`, [
          {
            text: "Continue",
            onPress: () => {
              // Navigate to dashboard or main app screen
              router.push('/(tabs)/dashboard/dashboard')
            }
          }
        ]);

        console.log("User:", user);
        console.log("Access Token:", accessToken);
        console.log("Refresh Token stored securely");
      } else {
        Alert.alert("Login Failed", response.data.message || "Invalid OTP or login failed");
        // Clear OTP on failure
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.response?.status === 401) {
        Alert.alert("Invalid OTP", "The OTP you entered is incorrect. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else if (error.response?.status === 429) {
        Alert.alert("Too Many Attempts", "Please wait before trying again.");
      } else {
        Alert.alert("Login Error", error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async (): Promise<void> => {
    if (!canResend) return;

    setIsResending(true);
    try {
      const response = await axios.post(
        Api + "/api/auth/send-otp",
        { phonenumber: phoneNumber },
        { 
          withCredentials: true,
          timeout: 10000
        }
      );

      if (response.data.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        Alert.alert("Success", "New OTP sent successfully");
      } else {
        Alert.alert("Error", "Failed to resend OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Resend OTP Error:", error);
      Alert.alert("Error", "Failed to resend OTP. Please check your connection.");
    } finally {
      setIsResending(false);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset form
  const resetForm = () => {
    setShowOtpInput(false);
    setOtp(["", "", "", "", "", ""]);
    setTimer(0);
    setCanResend(false);
    setPhoneNumber("");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="items-center pt-10 pb-8">
            <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-6 shadow-lg shadow-green-500/20">
              <Text className="text-4xl">🌾</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Farmer Login
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6 px-5">
              {!showOtpInput 
                ? "Enter your phone number to get started" 
                : `Enter the 6-digit OTP sent to +91 ${phoneNumber}`
              }
            </Text>
          </View>

          {/* Form Section */}
          <View className="flex-1">
            {/* Phone Number Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Phone Number
              </Text>
              <View className={`flex-row items-center border-2 rounded-xl bg-white shadow-sm mb-4 ${
                showOtpInput ? 'border-gray-300 opacity-60' : 'border-gray-200'
              }`}>
                <Text className="text-base font-semibold text-gray-900 px-4 py-4 border-r border-gray-200">
                  +91
                </Text>
                <TextInput
                  className="flex-1 h-13 px-4 text-base text-gray-900"
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!showOtpInput}
                />
              </View>
              
              {!showOtpInput && (
                <TouchableOpacity 
                  className={`h-12 rounded-xl justify-center items-center shadow-lg ${
                    isLoading 
                      ? 'bg-green-400 shadow-green-400/20' 
                      : 'bg-green-600 shadow-green-500/30'
                  }`}
                  onPress={handleSendOtp}
                  disabled={isLoading || phoneNumber.length < 10}
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-base font-semibold text-white ml-2">
                        Sending...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-base font-semibold text-white">
                      Send OTP
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* OTP Input Section */}
            {showOtpInput && (
              <>
                <View className="mb-8">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Enter OTP
                  </Text>
                  <View className="flex-row justify-between mb-4">
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          otpRefs.current[index] = ref;
                        }}
                        className={`w-12 h-14 border-2 rounded-xl text-xl font-semibold text-gray-900 bg-white text-center shadow-sm ${
                          digit 
                            ? 'border-green-600 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={({ nativeEvent }) => 
                          handleOtpKeyPress(nativeEvent.key, index)
                        }
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        editable={!isLoading}
                      />
                    ))}
                  </View>
                  
                  {/* Timer and Resend */}
                  <View className="items-center">
                    {timer > 0 ? (
                      <Text className="text-sm text-gray-600">
                        Resend OTP in {formatTime(timer)}
                      </Text>
                    ) : (
                      <TouchableOpacity 
                        onPress={handleResendOtp}
                        disabled={isResending}
                      >
                        {isResending ? (
                          <View className="flex-row items-center">
                            <ActivityIndicator color="#16A34A" size="small" />
                            <Text className="text-sm text-green-600 font-semibold ml-2">
                              Resending...
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-sm text-green-600 font-semibold">
                            Resend OTP
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity 
                  className={`h-14 rounded-2xl justify-center items-center mb-5 shadow-lg ${
                    isLoading 
                      ? 'bg-green-400 shadow-green-400/30' 
                      : 'bg-green-600 shadow-green-500/40'
                  }`}
                  onPress={handleLogin}
                  disabled={isLoading || otp.join('').length < 6}
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-lg font-bold text-white tracking-wide ml-2">
                        Logging in...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white tracking-wide">
                      Login
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Change Number */}
            {showOtpInput && (
              <TouchableOpacity 
                className="items-center py-3 mb-6"
                onPress={() => {
                  setShowOtpInput(false);
                  setOtp(["", "", "", "", "", ""]);
                  setTimer(0);
                  setCanResend(false);
                }}
                disabled={isLoading}
              >
                <Text className="text-sm text-green-600 font-medium">
                  Change Phone Number
                </Text>
              </TouchableOpacity>
            )}

            {/* Help Section */}
            <View className="items-center py-5">
              <Text className="text-xs text-gray-400 text-center">
                Are you a new user ? {' '}
                <Text className="text-green-600 font-medium" onPress={() => router.push('/(auth)/register')}>
                  Register here
                </Text>
              </Text>
              {showOtpInput && (
                <TouchableOpacity 
                  className="mt-3" 
                  onPress={resetForm}
                  disabled={isLoading}
                >
                  <Text className="text-xs text-red-500 font-medium">
                    Start Over
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;