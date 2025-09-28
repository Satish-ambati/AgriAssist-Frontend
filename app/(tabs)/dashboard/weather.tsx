import { useFarmerStore } from "@/store";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

// Weather data interface
export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  rainfall: number;
  forecast: {
    day: string;
    temp: string;
    condition: string;
  }[];
}

const Weather: React.FC = () => {
  const { farmerInfo } = useFarmerStore();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = "0a429637891adce3db0321b730d2df82";

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const lat = farmerInfo?.farmer?.location?.coordinates?.latitude;
      const lon = farmerInfo?.farmer?.location?.coordinates?.longitude;

      if (!lat || !lon) throw new Error("Location coordinates not available");

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!weatherResponse.ok) throw new Error("Failed to fetch weather data");
      const weatherJson = await weatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      let forecastData: { day: string; temp: string; condition: string }[] = [];
      if (forecastResponse.ok) {
        const forecastJson = await forecastResponse.json();

        const dailyMap: Record<
          string,
          { temps: number[]; conditions: string[] }
        > = {};

        forecastJson.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000);
          const day = date.toLocaleDateString("en-US", { weekday: "short" });

          if (!dailyMap[day]) dailyMap[day] = { temps: [], conditions: [] };

          dailyMap[day].temps.push(item.main.temp);
          dailyMap[day].conditions.push(item.weather[0].main);
        });

        forecastData = Object.keys(dailyMap)
          .slice(0, 3)
          .map((day, index) => {
            const temps = dailyMap[day].temps;
            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

            const conditionCounts: Record<string, number> = {};
            dailyMap[day].conditions.forEach((c) => {
              conditionCounts[c] = (conditionCounts[c] || 0) + 1;
            });
            const condition = Object.entries(conditionCounts).sort(
              (a, b) => b[1] - a[1]
            )[0][0];

            return {
              day: index === 0 ? "Today" : index === 1 ? "Tomorrow" : day,
              temp: `${Math.round(avgTemp)}°C`,
              condition,
            };
          });
      }

      const processedWeatherData: WeatherData = {
        temperature: Math.round(weatherJson.main.temp),
        humidity: weatherJson.main.humidity,
        condition: weatherJson.weather[0].main,
        windSpeed: Math.round(weatherJson.wind.speed * 3.6),
        rainfall: weatherJson.rain ? weatherJson.rain["1h"] || 0 : 0,
        forecast: forecastData,
      };

      setWeatherData(processedWeatherData);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );

      setWeatherData({
        temperature: 28,
        humidity: 65,
        condition: "Partly Cloudy",
        windSpeed: 12,
        rainfall: 0,
        forecast: [
          { day: "Today", temp: "28°C", condition: "Partly Cloudy" },
          { day: "Tomorrow", temp: "30°C", condition: "Sunny" },
          { day: "Day 3", temp: "26°C", condition: "Rainy" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string): string => {
    switch (condition.toLowerCase()) {
      case "clear":
      case "sunny":
        return "☀️";
      case "clouds":
      case "cloudy":
        return "☁️";
      case "rain":
      case "rainy":
        return "🌧️";
      case "thunderstorm":
        return "⛈️";
      case "snow":
        return "❄️";
      case "mist":
      case "fog":
        return "🌫️";
      case "partly cloudy":
        return "⛅";
      default:
        return "🌤️";
    }
  };

  if (loading) {
    return (
      <View className="bg-white mx-4 mt-4 rounded-2xl border border-green-100 p-6 items-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="ml-3 text-green-600 text-base font-light mt-3">
          Loading weather...
        </Text>
      </View>
    );
  }

  if (error && !weatherData) {
    return (
      <View className="bg-white mx-4 mt-4 rounded-2xl border border-green-100 p-6 items-center">
        <Text className="text-red-500 text-base font-light mb-2">
          Weather data unavailable
        </Text>
        <Text className="text-gray-500 text-sm text-center mb-3">{error}</Text>
        <TouchableOpacity
          onPress={fetchWeatherData}
          className="bg-green-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white text-sm font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl border border-green-100 overflow-hidden">
      {/* Header */}
      <View className="bg-green-600 p-4 flex-row justify-between items-center">
        <Text className="text-white text-lg font-light">🌤️ Weather</Text>
        <TouchableOpacity onPress={fetchWeatherData}>
          <Text className="text-green-100 text-sm">🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {weatherData && (
        <>
          {/* Current Weather */}
          <View className="p-6">
            <View className="flex-row items-center mb-6">
              <View className="bg-green-50 rounded-full p-4 mr-4 border-2 border-green-100">
                <Text className="text-4xl">{getWeatherIcon(weatherData.condition)}</Text>
              </View>
              <View>
                <Text className="text-3xl font-light text-green-800">
                  {weatherData.temperature}°C
                </Text>
                <Text className="text-green-600 text-base font-light">
                  {weatherData.condition}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View className="flex-row justify-between bg-green-50 rounded-xl p-4 mb-6">
              <View className="items-center flex-1">
                <Text className="text-lg mb-1">💧</Text>
                <Text className="text-green-600 text-xs font-light">Humidity</Text>
                <Text className="text-green-800 text-base font-light">
                  {weatherData.humidity}%
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg mb-1">💨</Text>
                <Text className="text-green-600 text-xs font-light">Wind</Text>
                <Text className="text-green-800 text-base font-light">
                  {weatherData.windSpeed} km/h
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg mb-1">🌧️</Text>
                <Text className="text-green-600 text-xs font-light">Rainfall</Text>
                <Text className="text-green-800 text-base font-light">
                  {weatherData.rainfall} mm
                </Text>
              </View>
            </View>

            {/* Forecast */}
            <View>
              <Text className="text-green-800 text-base font-light mb-4">
                📅 3-Day Forecast
              </Text>
              <View className="flex-row justify-between">
                {weatherData.forecast.map((day, index) => (
                  <View
                    key={index}
                    className={`items-center flex-1 p-3 rounded-xl mx-1 ${
                      index === 0
                        ? "bg-green-600"
                        : "bg-green-50 border border-green-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-light mb-2 ${
                        index === 0 ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {day.day}
                    </Text>
                    <Text className="text-2xl mb-2">{getWeatherIcon(day.condition)}</Text>
                    <Text
                      className={`text-base font-light ${
                        index === 0 ? "text-white" : "text-green-800"
                      }`}
                    >
                      {day.temp}
                    </Text>
                    <Text
                      className={`text-xs text-center mt-1 font-light ${
                        index === 0 ? "text-green-100" : "text-green-600"
                      }`}
                    >
                      {day.condition}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Last updated */}
          <View className="px-4 pb-4 bg-green-50 border-t border-green-100">
            <Text className="text-green-600 text-xs text-center font-light py-2">
              🕐 Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default Weather;
