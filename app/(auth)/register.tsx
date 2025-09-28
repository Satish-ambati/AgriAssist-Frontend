import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";

import { Api } from '../api';
import { useFarmerStore } from '@/store';
import { router } from 'expo-router';
import { LocationData } from '@/types';




interface FormData {
  name: string;
  phoneNumber: string;
  otp: string[];
  language: string;
  location: LocationData;
}

type RegistrationStep = 'phone' | 'otp' | 'details';

const languages = [
  { value: 'telugu', label: 'Telugu', native: 'తెలుగు' },
  { value: 'hindi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'english', label: 'English', native: 'English' },
];

const RegisterScreen = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [serverOtp , setServerOtp] = useState();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    otp: ['', '', '', '', '', ''],
    language: '',
    location: {
      state: '',
      district: '',
      mandal: '',
      village: '',
      coordinates: { latitude: 0, longitude: 0 }
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { farmerInfo, setFarmerInfo, clearFarmerInfo } = useFarmerStore();

  // OTP input refs
  const otpInputs = useRef<(TextInput | null)[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Auto-fetch location when reaching details step
  useEffect(() => {
    if (currentStep === 'details' && !locationFetched) {
      getCurrentLocation();
    }
  }, [currentStep]);

  // Save refresh token securely
  const saveRefreshToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync("refreshToken", token);
    } catch (err) {
      console.error("Failed to store refresh token:", err);
      Alert.alert("Error", "Failed to save authentication data");
    }
  };

  const slideToStep = (step: number) => {
    Animated.timing(slideAnim, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Phone number validation
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Send OTP function
  const sendOTP = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (!validatePhone(formData.phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${Api}/api/auth/send-otp-to-register`,
        { phonenumber: formData.phoneNumber },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setCurrentStep('otp');
        slideToStep(1);
        setOtpTimer(60);
        setServerOtp(response.data.otp)
        Alert.alert('Success', 'OTP sent to your phone number');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    
    setFormData(prev => ({ ...prev, otp: newOtp }));
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = formData.otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      if (serverOtp === otpString) {
        setCurrentStep('details');
        slideToStep(2);
        Alert.alert('Success', 'OTP verified successfully');
      } else {
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Location functions
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please enable location access');
        setIsLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
      });

      const { latitude, longitude } = location.coords;
      
      // Update coordinates
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: { latitude, longitude }
        }
      }));
      
      // Reverse geocode
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get location. Please enter manually.');
      setIsLocationLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (result.length > 0) {
        const address = result[0];
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            state: address.region || '',
            district: address.district || address.subregion || address.city || '',
            mandal: address.subregion || address.city || address.street || '',
            village: address.city || address.name || address.district || ''
          }
        }));
        setLocationFetched(true);
      } else {
        // Fallback to external geocoding service
        await fallbackGeocode(latitude, longitude);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      await fallbackGeocode(latitude, longitude);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Fallback geocoding using external API
  const fallbackGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          state: data.principalSubdivision || prev.location.state,
          district: data.localityInfo?.administrative?.[2]?.name || data.city || prev.location.district,
          mandal: data.localityInfo?.administrative?.[3]?.name || data.locality || prev.location.mandal,
          village: data.localityInfo?.administrative?.[4]?.name || data.city || prev.location.village
        }
      }));
      
      setLocationFetched(true);
    } catch (error) {
      console.error('Fallback geocoding error:', error);
      Alert.alert('Error', 'Could not get location details. Please enter manually.');
    }
  };

  // Complete registration
  const completeRegistration = async () => {
    if (!formData.language) {
      Alert.alert('Error', 'Please select a language');
      return;
    }

    if (!formData.location.state || !formData.location.district) {
      Alert.alert('Error', 'Please provide location details');
      return;
    }

    // Prepare clean registration data
    const registrationData = {
      name: formData.name,
      phonenumber: formData.phoneNumber,
      location: {
        state: formData.location.state,
        district: formData.location.district,
        mandal: formData.location.mandal,
        village: formData.location.village,
        coordinates : {
            latitude: formData.location.coordinates.latitude,
            longitude: formData.location.coordinates.longitude
        }
      },
      language: formData.language
    };

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${Api}/api/auth/register`,
        registrationData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store refresh token securely
        await saveRefreshToken(refreshToken);
        
        // Keep access token in memory
        setAccessToken(accessToken);
        setFarmerInfo(user, accessToken);
        
        console.log('Registration Data Sent:', registrationData);
        console.log('User:', user);
        console.log('Access Token:', accessToken);
        console.log('Refresh Token stored securely');
        
        Alert.alert(
          "Welcome!", 
          `Registration successful! Hello ${user?.name || 'Farmer'}`, 
          [{
            text: "Continue",
            onPress: () => {
              router.push('/(tabs)/dashboard');
            }
          }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${Api}/api/auth/send-otp-to-register`,
        { phonenumber: formData.phoneNumber },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setOtpTimer(60);
        setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-green-600 pt-12 pb-6 px-6">
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Registration
        </Text>
        <View className="flex-row justify-center gap-2">
          {['phone', 'otp', 'details'].map((step, index) => (
            <View
              key={step}
              className={`w-8 h-2 rounded-full ${
                index <= ['phone', 'otp', 'details'].indexOf(currentStep)
                  ? 'bg-white'
                  : 'bg-green-400'
              }`}
            />
          ))}
        </View>
      </View>

      <Animated.View
        style={{
          transform: [{ 
            translateX: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: ['0%', '-33.333%', '-66.666%'],
            })
          }],
          flexDirection: 'row',
          width: '300%'
        }}
      >
        {/* Step 1: Phone Number */}
        <View className="w-1/3 px-6 py-8">
          <Text className="text-gray-800 text-xl font-semibold mb-6 text-center">
            Enter Your Details
          </Text>

          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-3">Full Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-base"
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-8">
            <Text className="text-gray-700 text-base font-medium mb-3">Phone Number</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-base"
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#9CA3AF"
              value={formData.phoneNumber}
              onChangeText={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            onPress={sendOTP}
            disabled={isLoading}
            className={`rounded-xl py-4 px-6 ${
              isLoading ? 'bg-gray-400' : 'bg-green-600'
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Sending...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-lg">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Step 2: OTP Verification */}
        <View className="w-1/3 px-6 py-8">
          <Text className="text-gray-800 text-xl font-semibold mb-2 text-center">
            Verify OTP
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Enter the 6-digit code sent to {formData.phoneNumber}
          </Text>

          {/* OTP Input Boxes */}
          <View className="flex-row justify-center mb-6">
            {formData.otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {otpInputs.current[index] = ref}}
                className="w-12 h-14 mx-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:border-green-500"
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer */}
          <View className="flex-row justify-center mb-6">
            {otpTimer > 0 ? (
              <Text className="text-gray-600">
                Resend OTP in {otpTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={resendOTP} disabled={isLoading}>
                <Text className="text-green-600 font-medium">Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={verifyOTP}
            disabled={isLoading}
            className={`rounded-xl py-4 px-6 mb-4 ${
              isLoading ? 'bg-gray-400' : 'bg-green-600'
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Verifying...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-lg">Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setCurrentStep('phone');
              slideToStep(0);
            }}
            className="py-2"
          >
            <Text className="text-gray-600 text-center">Change Phone Number</Text>
          </TouchableOpacity>
        </View>

        {/* Step 3: Language and Location */}
        <View className="w-1/3 px-6 py-8">
          <Text className="text-gray-800 text-xl font-semibold mb-6 text-center">
            Complete Your Profile
          </Text>

          {/* Language Selection */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-3">
              Preferred Language
            </Text>
            <TouchableOpacity
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 flex-row justify-between items-center"
            >
              <Text className={`text-base ${formData.language ? 'text-gray-800' : 'text-gray-500'}`}>
                {formData.language 
                  ? languages.find(l => l.value === formData.language)?.native + ' (' + languages.find(l => l.value === formData.language)?.label + ')'
                  : 'Select Language'
                }
              </Text>
              <Text className="text-gray-500 text-lg">
                {showLanguageDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showLanguageDropdown && (
              <View className="mt-2 bg-white border border-gray-300 rounded-xl shadow-lg">
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, language: lang.value }));
                      setShowLanguageDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text className="text-base text-gray-800">{lang.native}</Text>
                    <Text className="text-sm text-gray-500">{lang.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-700 text-base font-medium">Location</Text>
              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={isLocationLoading}
                className={`px-3 py-2 rounded-lg ${
                  isLocationLoading 
                    ? 'bg-gray-300'
                    : locationFetched
                      ? 'bg-green-100 border border-green-400'
                      : 'bg-green-600'
                }`}
              >
                {isLocationLoading ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Text className={`text-sm font-medium ${
                    locationFetched ? 'text-green-700' : 'text-white'
                  }`}>
                    {locationFetched ? '📍 Update' : '📍 Get Location'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">State</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your state"
                  placeholderTextColor="#9CA3AF"
                  value={formData.location.state}
                  onChangeText={(value) => 
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: value }
                    }))
                  }
                />
              </View>
              
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">District</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your district"
                  placeholderTextColor="#9CA3AF"
                  value={formData.location.district}
                  onChangeText={(value) => 
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, district: value }
                    }))
                  }
                />
              </View>
              
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Mandal</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your mandal"
                  placeholderTextColor="#9CA3AF"
                  value={formData.location.mandal}
                  onChangeText={(value) => 
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, mandal: value }
                    }))
                  }
                />
              </View>
              
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Village</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter your village"
                  placeholderTextColor="#9CA3AF"
                  value={formData.location.village}
                  onChangeText={(value) => 
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, village: value }
                    }))
                  }
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={completeRegistration}
            disabled={isLoading}
            className={`rounded-xl py-4 px-6 ${
              isLoading ? 'bg-gray-400' : 'bg-green-600'
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Completing...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Complete Registration
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom spacing */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default RegisterScreen;