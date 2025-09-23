import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export type Crop = {
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

interface FarmerCurrentCropsProps {
  currentCrops: Crop[];
}

const FarmerCurrentCrops: React.FC<FarmerCurrentCropsProps> = ({ currentCrops }) => {
  const navigation = useNavigation<any>();

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleGetAssist = (crop: Crop) => {
    navigation.navigate('assistantScreen', { 
      cropId: crop._id,
      cropData: crop 
    });
  };

  if (currentCrops.length === 0) {
    return (
      <View className="mx-4">
        <Text className="text-xl font-bold text-green-600 mb-4">🌾 Your Current Crops (0)</Text>
        <View className="bg-white p-5 rounded-xl shadow-sm items-center">
          <Text className="text-gray-500">No crops found. Add your first crop to get started.</Text>
        </View>
      </View>
    );
  }

  return (
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
  );
};

export default FarmerCurrentCrops;