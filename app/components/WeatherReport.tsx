import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from '@expo/vector-icons';
import { useFarmerStore } from '@/store';

const { height } = Dimensions.get('window');

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  location: string;
}

const WeatherReport: React.FC = () => {
  const { farmerInfo } = useFarmerStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      farmerInfo.farmer && farmerInfo?.farmer.location?.coordinates?.latitude &&
      farmerInfo?.farmer.location?.coordinates?.longitude
    ) {
      fetchWeatherData(
        farmerInfo.farmer.location.coordinates.latitude,
        farmerInfo.farmer.location.coordinates.longitude
      );
    } else {
      setError('Location coordinates not available');
      setLoading(false);
    }
  }, [farmerInfo]);

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);

      // Using OpenWeatherMap API - you'll need to replace 'YOUR_API_KEY' with your actual API key
      const API_KEY = '0a429637891adce3db0321b730d2df82'; // Replace with your OpenWeatherMap API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Map OpenWeatherMap conditions to our condition types
      const mapWeatherCondition = (main: string, description: string) => {
        const mainLower = main.toLowerCase();
        const descLower = description.toLowerCase();

        if (mainLower === 'clear') return 'sunny';
        if (mainLower === 'clouds') {
          if (descLower.includes('few') || descLower.includes('scattered'))
            return 'partly-cloudy';
          return 'cloudy';
        }
        if (mainLower === 'rain') {
          if (descLower.includes('drizzle')) return 'drizzle';
          return 'rainy';
        }
        if (mainLower === 'drizzle') return 'drizzle';
        if (mainLower === 'thunderstorm') return 'thunderstorm';
        if (mainLower === 'snow') return 'snowy';
        if (mainLower === 'mist' || mainLower === 'fog') return 'cloudy';
        return 'partly-cloudy';
      };

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: mapWeatherCondition(
          data.weather[0].main,
          data.weather[0].description
        ),
        description: data.weather[0].description.replace(
          /\b\w/g,
          (l: string) => l.toUpperCase()
        ),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        visibility: data.visibility
          ? Math.round(data.visibility / 1000)
          : 10, // Convert m to km
        pressure: data.main.pressure,
        feelsLike: Math.round(data.main.feels_like),
        location: `${data.name}, ${data.sys.country}`,
      };

      setWeather(weatherData);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setError('Unable to fetch weather data');

      // Fallback to mock data for demonstration
      const mockWeatherData: WeatherData = {
        temperature: 24,
        condition: 'partly-cloudy',
        description: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        pressure: 1013,
        feelsLike: 26,
        location: 'Farm Location',
      };
      setWeather(mockWeatherData);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconSize = 48;
    const iconColor = '#ffffff';

    switch (condition) {
      case 'sunny':
      case 'clear':
        return <Feather name="sun" size={iconSize} color={iconColor} />;
      case 'partly-cloudy':
        return <Feather name="cloud" size={iconSize} color={iconColor} />;
      case 'cloudy':
        return <Feather name="cloud" size={iconSize} color={iconColor} />;
      case 'rainy':
        return <Feather name="cloud-rain" size={iconSize} color={iconColor} />;
      case 'drizzle':
        return <Feather name="cloud-drizzle" size={iconSize} color={iconColor} />;
      case 'snowy':
        return <Feather name="cloud-snow" size={iconSize} color={iconColor} />;
      case 'thunderstorm':
        return <MaterialCommunityIcons name="weather-lightning" size={iconSize} color={iconColor} />;
      default:
        return <Feather name="sun" size={iconSize} color={iconColor} />;
    }
  };

  const getBackgroundColors = (condition: string) => {
    switch (condition) {
      case 'sunny':
      case 'clear':
        return 'bg-orange-500';
      case 'partly-cloudy':
        return 'bg-blue-500';
      case 'cloudy':
        return 'bg-gray-600';
      case 'rainy':
        return 'bg-slate-700';
      case 'drizzle':
        return 'bg-slate-600';
      case 'snowy':
        return 'bg-blue-300';
      case 'thunderstorm':
        return 'bg-purple-700';
      default:
        return 'bg-blue-500';
    }
  };

  const getTextColor = (condition: string) => {
    switch (condition) {
      case 'snowy':
        return 'text-gray-800';
      default:
        return 'text-white';
    }
  };

  if (loading) {
    return (
      <View
        className="w-full mx-4 my-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl flex justify-center items-center px-6 py-8"
        style={{ height: height * 0.5 }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white text-lg font-medium mt-4">
          Getting weather data...
        </Text>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View
        className="w-full mx-4 my-2 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl shadow-2xl flex justify-center items-center px-6 py-8"
        style={{ height: height * 0.5 }}
      >
        <Text className="text-white text-lg font-medium text-center mb-4">
          {error || 'Failed to load weather data'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (
              farmerInfo?.farmer?.location?.coordinates?.latitude &&
              farmerInfo?.farmer?.location?.coordinates?.longitude
            ) {
              fetchWeatherData(
                farmerInfo.farmer.location.coordinates.latitude,
                farmerInfo.farmer.location.coordinates.longitude
              );
            }
          }}
          className="bg-white bg-opacity-20 px-4 py-2 rounded-lg"
        >
          <Text className="text-white text-sm font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const backgroundClass = getBackgroundColors(weather.condition);
  const textColorClass = getTextColor(weather.condition);

  return (
    <View
      className={`w-full mx-4 my-2 ${backgroundClass} rounded-3xl shadow-2xl overflow-hidden relative`}
      style={{ height: height * 0.5 }}
    >
      {/* Animated Background Elements */}
      <View className="absolute inset-0 opacity-10">
        <View className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full" />
        <View className="absolute top-16 left-8 w-12 h-12 bg-white rounded-full" />
        <View className="absolute bottom-20 right-12 w-16 h-16 bg-white rounded-full" />
      </View>

      {/* Main Weather Section */}
      <View className="relative z-10 flex-1 px-6 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1">
            <Text className={`${textColorClass} text-lg font-semibold opacity-90`}>
              {weather.location}
            </Text>
            <Text className={`${textColorClass} text-sm opacity-70`}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View className='mr-1'>{getWeatherIcon(weather.condition)}</View>
        </View>

        {/* Temperature Display */}
        <View className="mb-8">
          <Text className={`${textColorClass} text-6xl font-thin`}>
            {Math.round(weather.temperature)}°
          </Text>
          <Text className={`${textColorClass} text-xl font-medium opacity-90 mt-1`}>
            {weather.description}
          </Text>
          <Text className={`${textColorClass} text-sm opacity-70 mt-1`}>
            Feels like {Math.round(weather.feelsLike)}°
          </Text>
        </View>

        {/* Weather Details Grid */}
        <View className="flex-row flex-wrap justify-between">
          <View className="w-1/2 pr-2 mb-4">
            <View className="flex-row items-center mb-2">
              <Feather name="wind" size={16} color="rgba(255,255,255,0.8)" />
              <Text className={`${textColorClass} text-xs ml-2 opacity-80`}>
                Wind
              </Text>
            </View>
            <Text className={`${textColorClass} text-lg font-semibold`}>
              {weather.windSpeed} km/h
            </Text>
          </View>

          <View className="w-1/2 pl-2 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text className={`${textColorClass} text-xs ml-2 opacity-80`}>
                Humidity
              </Text>
            </View>
            <Text className={`${textColorClass} text-lg font-semibold`}>
              {weather.humidity}%
            </Text>
          </View>

          <View className="w-1/2 pr-2">
            <View className="flex-row items-center mb-2">
              <Feather name="eye" size={16} color="rgba(255,255,255,0.8)" />
              <Text className={`${textColorClass} text-xs ml-2 opacity-80`}>
                Visibility
              </Text>
            </View>
            <Text className={`${textColorClass} text-lg font-semibold`}>
              {weather.visibility} km
            </Text>
          </View>

          <View className="w-1/2 pl-2">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons 
                name="gauge" 
                size={16} 
                color="rgba(255,255,255,0.8)" 
              />
              <Text className={`${textColorClass} text-xs ml-2 opacity-80`}>
                Pressure
              </Text>
            </View>
            <Text className={`${textColorClass} text-lg font-semibold`}>
              {weather.pressure} hPa
            </Text>
          </View>
        </View>

        {/* Subtle Bottom Decoration */}
        <View className="h-px bg-white opacity-20 mt-auto" />
      </View>
    </View>
  );
};

export default WeatherReport;