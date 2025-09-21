import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  
  type WeatherForecast = {
    day: string;
    temp: string;
    condition: string;
  };
  
  type WeatherData = {
    temperature: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    rainfall: number;
    forecast: WeatherForecast[];
  };
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  type Crop = {
    _id: string;
    crop: {
      name: string;
      variety: string;
      category: string;
    };
    plantingArea: { value: number; unit: string };
    cropStage: string;
    timeline: {
      sowingDate: string;
      expectedHarvestDate: string;
    };
    expenses: { total: number };
    yield: { expected: number };
    healthStatus: string;
    nextTask: string;
    taskDate: string;
  };

  const [currentCrops, setCurrentCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Weather API Configuration
  // To get a weather API key:
  // 1. Sign up at https://openweathermap.org/api
  // 2. Choose a plan (free tier available)
  // 3. Get your API key from dashboard
  // 4. Replace 'YOUR_API_KEY' with your actual key
  const WEATHER_API_KEY = '39a9673a646fefb7c99faca3bf0da4a8';
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchWeatherData = async () => {
    try {     
      // Sample data for demo
      const weatherResponse = {
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

      setWeatherData(weatherResponse);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback sample data
      const fallbackWeather = {
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
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch weather data
      await fetchWeatherData();

      // Current crops data (from crop cycle controller)
      const cropsResponse = [
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
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const scrollViewRef = useRef<ScrollView>(null);
  
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
  const handleGetAssist = (crop: Crop) => {
    // Navigate to AI Assistant screen with crop data
    navigation.navigate('assistantScreen', { 
      cropId: crop._id,
      cropData: crop 
    });
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'partly cloudy': return '⛅';
      case 'rainy': return '🌧️';
      case 'clear': return '☀️';
      case 'rain': return '🌧️';
      case 'clouds': return '☁️';
      default: return '🌤️';
    }
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
            🌾 Your Farming Companion
          </Text>
        </View>
      </View>

      {/* Weather Card */}
      <View className="bg-white mx-4 my-4 p-5 rounded-xl shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-green-600">🌦️ Today's Weather</Text>
          <Text className="text-3xl font-bold text-green-600">{weatherData?.temperature}°C</Text>
        </View>
        
        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <Text className="text-2xl mb-1">{getWeatherIcon(weatherData?.condition ?? '')}</Text>
            <Text className="text-xs text-gray-500">{weatherData?.condition}</Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-700 mb-1">💧 {weatherData?.humidity}%</Text>
            <Text className="text-xs text-gray-500">Humidity</Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-700 mb-1">💨 {weatherData?.windSpeed} km/h</Text>
            <Text className="text-xs text-gray-500">Wind Speed</Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-700 mb-1">🌧️ {weatherData?.rainfall} mm</Text>
            <Text className="text-xs text-gray-500">Rainfall</Text>
          </View>
        </View>

        {/* Weather Forecast */}
        <View className="flex-row justify-between border-t border-gray-200 pt-4">
          {weatherData?.forecast?.map((day, index) => (
            <View key={index} className="items-center">
              <Text className="text-xs text-gray-500 mb-1">{day.day}</Text>
              <Text className="text-xl mb-1">{getWeatherIcon(day.condition ?? '')}</Text>
              <Text className="text-sm font-semibold text-gray-700">{day.temp}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Current Crops Section */}
      <View className="mx-4">
        <Text className="text-xl font-bold text-green-600 mb-4">🌾 Your Current Crops ({currentCrops.length})</Text>
        
        {currentCrops.map((crop) => (
          <View key={crop._id} className="bg-white p-5 rounded-xl mb-4 shadow-sm">
            {/* Crop Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-green-600 mb-1">
                  {crop.crop.name} ({crop.crop.variety})
                </Text>
                <Text className="text-sm text-gray-500">{crop.crop.category}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getHealthStatusColor(crop.healthStatus)}`}>
                <Text className="text-white text-xs font-semibold">{crop.healthStatus}</Text>
              </View>
            </View>

            {/* Crop Details */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">📏 Area:</Text>
                <Text className="text-sm font-semibold text-gray-700">
                  {crop.plantingArea.value} {crop.plantingArea.unit}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">🌱 Stage:</Text>
                <Text className="text-sm font-semibold text-gray-700">{crop.cropStage}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">💰 Investment:</Text>
                <Text className="text-sm font-semibold text-gray-700">₹{crop.expenses.total.toLocaleString()}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">📦 Expected Yield:</Text>
                <Text className="text-sm font-semibold text-gray-700">
                  {crop.yield.expected} {crop.plantingArea.unit}
                </Text>
              </View>
            </View>

            {/* Get Assist Button */}
            <TouchableOpacity
              className="bg-green-600 flex-row items-center justify-center p-3 rounded-lg"
              onPress={() => handleGetAssist(crop)}
            >
              <Icon name="smart-toy" size={20} color="#ffffff" />
              <Text className="text-white text-base font-semibold mx-2">Go To Assist</Text>
              <Icon name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mb-8">
        <Text className="text-xl font-bold text-green-600 mb-4">🚀 Quick Actions</Text>
        
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity 
            className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
            onPress={() => navigation.navigate('diseaseDetection')}
          >
            <Icon name="search" size={24} color="#16A34A" />
            <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Disease Detection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
            onPress={() => navigation.navigate('marketPrices')}
          >
            <Icon name="trending-up" size={24} color="#16A34A" />
            <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Market Prices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
            onPress={scrollToTop}
          >
            <Icon name="wb-sunny" size={24} color="#16A34A" />
            <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Weather Forecast</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
            onPress={() => navigation.navigate('assistantScreen')}
          >
            <Icon name="mic" size={24} color="#16A34A" />
            <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Voice Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;