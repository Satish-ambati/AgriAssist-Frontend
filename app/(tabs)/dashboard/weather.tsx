import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type WeatherForecast = {
  day: string;
  temp: string;
  condition: string;
};

export type WeatherData = {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  rainfall: number;
  forecast: WeatherForecast[];
};

interface WeatherProps {
  weatherData: WeatherData | null;
  currentLocation: string;
}

const Weather: React.FC<WeatherProps> = ({ weatherData, currentLocation }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return '☀️';
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'partly cloudy': return '⛅';
      case 'rainy': return '🌧️';
      case 'rain': return '🌧️';
      case 'clouds': return '☁️';
      case 'thunderstorm': return '⛈️';
      case 'snow': return '❄️';
      case 'mist': return '🌫️';
      case 'fog': return '🌫️';
      default: return '🌤️';
    }
  };

  if (!weatherData) {
    return (
      <View className="bg-white mx-4 my-4 p-5 rounded-xl shadow-sm">
        <Text className="text-lg font-bold text-green-600">🌦️ Today's Weather</Text>
        <Text className="text-center py-4 text-gray-500">Loading weather data...</Text>
      </View>
    );
  }

  return (
    <View className="bg-white mx-4 my-4 p-5 rounded-xl shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-green-600">🌦️ Today's Weather</Text>
        <Text className="text-3xl font-bold text-green-600">{weatherData.temperature}°C</Text>
      </View>
      
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <Text className="text-2xl mb-1">{getWeatherIcon(weatherData.condition)}</Text>
          <Text className="text-xs text-gray-500 capitalize">{weatherData.condition.toLowerCase()}</Text>
        </View>
        <View className="items-center">
          <Text className="text-base font-semibold text-gray-700 mb-1">💧 {weatherData.humidity}%</Text>
          <Text className="text-xs text-gray-500">Humidity</Text>
        </View>
        <View className="items-center">
          <Text className="text-base font-semibold text-gray-700 mb-1">💨 {weatherData.windSpeed} km/h</Text>
          <Text className="text-xs text-gray-500">Wind Speed</Text>
        </View>
        <View className="items-center">
          <Text className="text-base font-semibold text-gray-700 mb-1">🌧️ {weatherData.rainfall} mm</Text>
          <Text className="text-xs text-gray-500">Rainfall</Text>
        </View>
      </View>

      {/* Weather Forecast */}
      <View className="flex-row justify-between border-t border-gray-200 pt-4">
        {weatherData.forecast.map((day, index) => (
          <View key={index} className="items-center">
            <Text className="text-xs text-gray-500 mb-1">{day.day}</Text>
            <Text className="text-xl mb-1">{getWeatherIcon(day.condition)}</Text>
            <Text className="text-sm font-semibold text-gray-700">{day.temp}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Weather;