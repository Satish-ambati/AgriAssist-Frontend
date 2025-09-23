import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import Weather, { WeatherData } from './weather';
import FarmerCurrentCrops, { Crop } from './farmerCurrentCrops';
import QuickAccess from './quickAccess';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('Loading location...');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentCrops, setCurrentCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Weather API Configuration
  const WEATHER_API_KEY = '39a9673a646fefb7c99faca3bf0da4a8';
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'AgriAssist needs access to your location to show weather data',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setCurrentLocation('Location permission denied');
          fetchDashboardData(); // Load data without location
        }
      } catch (err) {
        console.warn(err);
        setCurrentLocation('Location error');
        fetchDashboardData(); // Load data without location
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
        getLocationName(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setCurrentLocation('Unable to get location');
        // Use default coordinates (e.g., Hyderabad, India) as fallback
        fetchWeatherData(17.3850, 78.4867);
        setCurrentLocation('Hyderabad, Telangana');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${GEOCODING_API_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        setCurrentLocation(`${location.name}, ${location.state || location.country}`);
      }
    } catch (error) {
      console.error('Error getting location name:', error);
      setCurrentLocation(`Location: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();
      
      if (data.cod === 200) {
        const weatherResponse: WeatherData = {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          condition: data.weather[0].main,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          rainfall: data.rain ? data.rain['1h'] || 0 : 0,
          forecast: [
            { day: 'Today', temp: `${Math.round(data.main.temp)}°C`, condition: data.weather[0].main },
            { day: 'Tomorrow', temp: `${Math.round(data.main.temp + 2)}°C`, condition: 'Sunny' },
            { day: 'Day 3', temp: `${Math.round(data.main.temp - 2)}°C`, condition: 'Cloudy' },
          ]
        };
        setWeatherData(weatherResponse);
      } else {
        throw new Error('Weather API error');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback sample data
      const fallbackWeather: WeatherData = {
        temperature: 28,
        humidity: 65,
        condition: 'Partly Cloudy',
        windSpeed: 12,
        rainfall: 0,
        forecast: [
          { day: 'Today', temp: '28°C', condition: 'Partly Cloudy' },
          { day: 'Tomorrow', temp: '30°C', condition: 'Sunny' },
          { day: 'Day 3', temp: '26°C', condition: 'Rainy' },
        ]
      };
      setWeatherData(fallbackWeather);
    } finally {
      fetchCropData(); // Load crop data after weather
    }
  };

  const fetchCropData = () => {
    // Current crops data (from crop cycle controller)
    const cropsResponse: Crop[] = [
      {
        _id: '1',
        crop: {
          name: 'Rice',
          variety: 'Sona Masuri',
          category: 'Cereal'
        },
        plantingArea: { value: 2, unit: 'acre' },
        cropStage: 'Flowering',
        timeline: {
          sowingDate: '2024-07-15',
          expectedHarvestDate: '2024-11-15'
        },
        expenses: { total: 15000 },
        yield: { expected: 40 },
        healthStatus: 'Good',
        nextTask: 'Fertilizer Application',
        taskDate: '2024-09-25'
      },
      {
        _id: '2',
        crop: {
          name: 'Cotton',
          variety: 'BT Cotton',
          category: 'Cash Crop'
        },
        plantingArea: { value: 1.5, unit: 'acre' },
        cropStage: 'Vegetative',
        timeline: {
          sowingDate: '2024-08-01',
          expectedHarvestDate: '2024-12-15'
        },
        expenses: { total: 12000 },
        yield: { expected: 25 },
        healthStatus: 'Moderate',
        nextTask: 'Disease Check Required',
        taskDate: '2024-09-22'
      }
    ];

    setCurrentCrops(cropsResponse);
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // If we don't have location, use default data
      if (!weatherData) {
        const defaultWeather: WeatherData = {
          temperature: 28,
          humidity: 65,
          condition: 'Partly Cloudy',
          windSpeed: 12,
          rainfall: 0,
          forecast: [
            { day: 'Today', temp: '28°C', condition: 'Partly Cloudy' },
            { day: 'Tomorrow', temp: '30°C', condition: 'Sunny' },
            { day: 'Day 3', temp: '26°C', condition: 'Rainy' },
          ]
        };
        setWeatherData(defaultWeather);
      }
      fetchCropData();
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await requestLocationPermission(); // Refresh location and weather
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50">
        <Text className="text-lg text-green-600 font-semibold">Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-green-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row justify-between items-center bg-green-600 px-5 pt-12 pb-5">
        <View>
          <Text className="text-xl font-bold text-white">AgriAssist</Text>
          <Text className="text-sm text-white opacity-90 mt-1">
            📍 {currentLocation}
          </Text>
        </View>
      </View>

      {/* Weather Component */}
      <Weather weatherData={weatherData} currentLocation={currentLocation} />

      {/* Farmer Current Crops Component */}
      <FarmerCurrentCrops currentCrops={currentCrops} />

      {/* Quick Access Component */}
      <QuickAccess scrollToTop={scrollToTop} />
    </ScrollView>
  );
};

export default Dashboard;