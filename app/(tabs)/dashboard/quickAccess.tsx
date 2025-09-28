import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface QuickAccessProps {
  scrollToTop: () => void;
}

const QuickAccess: React.FC<QuickAccessProps> = ({ scrollToTop }) => {

  return (
    <View className="mx-4 mb-8">
      <Text className="text-xl font-bold text-green-600 mb-4">🚀 Quick Actions</Text>

      <View className="flex-row flex-wrap justify-between">
        <TouchableOpacity
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm border border-green-100"
          onPress={() => router.push('/diseaseDetection')}
        >
          <View className="bg-green-50 rounded-full p-2 mb-2">
            <MaterialIcons name="search" size={24} color="#16A34A" />
          </View>
          <Text className="text-green-600 text-sm font-semibold text-center">
            Disease Detection
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm border border-green-100"
          onPress={() => router.push('/marketPrices')}
        >
          <View className="bg-green-50 rounded-full p-2 mb-2">
            <MaterialIcons name="trending-up" size={24} color="#16A34A" />
          </View>
          <Text className="text-green-600 text-sm font-semibold text-center">
            Market Prices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm border border-green-100"
          onPress={scrollToTop}
        >
          <View className="bg-green-50 rounded-full p-2 mb-2">
            <MaterialIcons name="wb-sunny" size={24} color="#16A34A" />
          </View>
          <Text className="text-green-600 text-sm font-semibold text-center">
            Weather Forecast
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm border border-green-100"
          onPress={() => router.push('/chat')}
        >
          <View className="bg-green-50 rounded-full p-2 mb-2">
            <MaterialIcons name="mic" size={24} color="#16A34A" />
          </View>
          <Text className="text-green-600 text-sm font-semibold text-center">
            AI Assistant
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickAccess;