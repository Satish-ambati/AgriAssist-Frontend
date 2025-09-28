import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Updated type to match your backend schema exactly
export type Crop = {
  _id: string;
  farm: string; // ObjectId as string
  farmer: string; // ObjectId as string
  crop: {
    name: string;
    variety?: string;
    category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Vegetable' | 'Fruit' | 'Cash Crop';
  };
  season: 'Kharif' | 'Rabi' | 'Zaid';
  cropStage: 'Planning' | 'Sowing' | 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity' | 'Harvested';
  timeline: {
    sowingDate?: Date | string;
    expectedHarvestDate?: Date | string;
    actualHarvestDate?: Date | string;
    duration?: number;
  };
  aiRecommendations?: {
    initialPlan?: {
      fertilizerSchedule?: Array<{
        date?: Date | string;
        type?: string;
        quantity?: number;
        unit?: string;
        applied?: boolean;
      }>;
      irrigationSchedule?: Array<{
        date?: Date | string;
        duration?: number;
        method?: string;
        applied?: boolean;
      }>;
    };
  };
  expenses?: {
    seeds?: number;
    fertilizers?: number;
    pesticides?: number;
    irrigation?: number;
    labor?: number;
    other?: number;
    total?: number;
  };
  yield?: {
    expected?: number;
    actual?: number;
    unit?: string;
    quality?: string;
  };
  status: 'Active' | 'Completed' | 'Failed';
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

interface FarmerCurrentCropsProps {
  currentCrops: Crop[];
}

const FarmerCurrentCrops: React.FC<FarmerCurrentCropsProps> = ({ currentCrops }) => {

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: '#22c55e' }; // green-500
      case 'Completed':
        return { backgroundColor: '#3b82f6' }; // blue-500
      case 'Failed':
        return { backgroundColor: '#ef4444' }; // red-500
      default:
        return { backgroundColor: '#6b7280' }; // gray-500
    }
  };

  const getCropStageIcon = (stage: string) => {
    switch (stage) {
      case 'Planning':
        return '📋';
      case 'Sowing':
        return '🌱';
      case 'Germination':
        return '🌿';
      case 'Vegetative':
        return '🌾';
      case 'Flowering':
        return '🌸';
      case 'Fruiting':
        return '🍃';
      case 'Maturity':
        return '🌽';
      case 'Harvested':
        return '📦';
      default:
        return '🌱';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'Kharif':
        return { color: '#16a34a' }; // green-600
      case 'Rabi':
        return { color: '#dc2626' }; // red-600
      case 'Zaid':
        return { color: '#ea580c' }; // orange-600
      default:
        return { color: '#6b7280' }; // gray-500
    }
  };

  const handleGetAssist = (crop: Crop) => {
    router.push({
      pathname: '/assistantScreen',
      params: {
        cropId: crop._id,
        cropData: JSON.stringify(crop)
      }
    });
  };

  if (currentCrops.length === 0) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#16a34a', marginBottom: 16 }}>
          🌾 Your Current Crops (0)
        </Text>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>
            No crops found. Add your first crop to get started.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#16a34a', marginBottom: 16 }}>
        🌾 Your Current Crops ({currentCrops.length})
      </Text>

      {currentCrops.map((crop) => (
        <View key={crop._id} style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
          {/* Crop Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16a34a', marginBottom: 4 }}>
                {crop.crop.name} {crop.crop.variety ? `(${crop.crop.variety})` : ''}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>{crop.crop.category}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 2, ...getSeasonColor(crop.season) }}>
                {crop.season} Season
              </Text>
            </View>
            <View style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 4, 
              borderRadius: 20, 
              ...getHealthStatusColor(crop.status) 
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {crop.status}
              </Text>
            </View>
          </View>

          {/* Crop Details */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {getCropStageIcon(crop.cropStage)} Stage:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                {crop.cropStage}
              </Text>
            </View>

            {crop.timeline.sowingDate && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>🗓️ Sowing Date:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {new Date(crop.timeline.sowingDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {crop.timeline.expectedHarvestDate && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>🎯 Expected Harvest:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {new Date(crop.timeline.expectedHarvestDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {crop.expenses?.total && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>💰 Total Investment:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  ₹{crop.expenses.total.toLocaleString()}
                </Text>
              </View>
            )}

            {crop.yield?.expected && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>📦 Expected Yield:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {crop.yield.expected} {crop.yield.unit || 'units'}
                </Text>
              </View>
            )}

            {crop.timeline.duration && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>⏱️ Duration:</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {crop.timeline.duration} days
                </Text>
              </View>
            )}
          </View>

          {/* AI Recommendations Badge */}
          {crop.aiRecommendations?.initialPlan && (
            <View style={{ backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600' }}>
                🤖 AI Recommendations Available
              </Text>
            </View>
          )}

          {/* Get Assist Button */}
          <TouchableOpacity
            style={{ backgroundColor: '#16a34a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 }}
            onPress={() => handleGetAssist(crop)}
          >
            <MaterialIcons name="smart-toy" size={20} color="#ffffff" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginHorizontal: 8 }}>
              Get AI Assistance
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default FarmerCurrentCrops;