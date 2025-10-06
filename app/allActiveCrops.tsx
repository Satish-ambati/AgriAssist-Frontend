import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Crop } from "./(tabs)/dashboard/farmerCurrentCrops";
import { SafeAreaView } from "react-native-safe-area-context";

const AllActiveCrops: React.FC = () => {
  const { crops } = useLocalSearchParams<{ crops: string }>();
  const currentCrops: Crop[] = crops ? JSON.parse(crops) : [];
  const activeCrops = currentCrops.filter((crop) => crop.status === "Active");

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Completed": return "bg-blue-500";
      case "Failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getCropStageIcon = (stage: string) => {
    switch (stage) {
      case "Planning": return "📋";
      case "Sowing": return "🌱";
      case "Germination": return "🌿";
      case "Vegetative": return "🌾";
      case "Flowering": return "🌸";
      case "Fruiting": return "🍃";
      case "Maturity": return "🌽";
      case "Harvested": return "📦";
      default: return "🌱";
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "Kharif": return "text-green-600";
      case "Rabi": return "text-red-600";
      case "Zaid": return "text-orange-600";
      default: return "text-gray-500";
    }
  };

  const handleGetAssist = (crop: Crop) => {
    router.push({
      pathname: "/assistantScreen",
      params: {
        cropId: crop._id,
        cropData: JSON.stringify(crop),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 ">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <MaterialIcons name="arrow-back" size={24} color="#16a34a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-green-500">🌾 All Active Crops ({activeCrops.length})</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Content */}
      <ScrollView className="mx-4 mt-4">


        {activeCrops.length === 0 ? (
          <View className="bg-white p-5 rounded-xl shadow items-center">
            <Text className="text-gray-500">No active crops found.</Text>
          </View>
        ) : (
          activeCrops.map((crop) => (
            <View key={crop._id} className="bg-green-50 border border-green-400  p-5 rounded-xl mb-4 shadow">
              {/* Crop Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-green-500 mb-1">
                    {crop.crop.name} {crop.crop.variety ? `(${crop.crop.variety})` : ""}
                  </Text>
                  <Text className="text-sm text-gray-500">{crop.crop.category}</Text>
                  <Text className={`text-sm font-semibold mt-1 ${getSeasonColor(crop.season)}`}>
                    {crop.season} Season
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getHealthStatusColor(crop.status)}`}>
                  <Text className="text-white text-xs font-semibold">{crop.status}</Text>
                </View>
              </View>

              {/* Crop Details */}
              <View className="mb-4 space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">{getCropStageIcon(crop.cropStage)} Stage:</Text>
                  <Text className="text-sm font-semibold text-gray-700">{crop.cropStage}</Text>
                </View>

                {crop.timeline.sowingDate && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">🗓️ Sowing Date:</Text>
                    <Text className="text-sm font-semibold text-gray-700">
                      {new Date(crop.timeline.sowingDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {crop.timeline.expectedHarvestDate && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">🎯 Expected Harvest:</Text>
                    <Text className="text-sm font-semibold text-gray-700">
                      {new Date(crop.timeline.expectedHarvestDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {crop.expenses?.total && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">💰 Total Investment:</Text>
                    <Text className="text-sm font-semibold text-gray-700">
                      ₹{crop.expenses.total.toLocaleString()}
                    </Text>
                  </View>
                )}

                {crop.yield?.expected && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">📦 Expected Yield:</Text>
                    <Text className="text-sm font-semibold text-gray-700">
                      {crop.yield.expected} {crop.yield.unit || "units"}
                    </Text>
                  </View>
                )}

                {crop.timeline.duration && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">⏱️ Duration:</Text>
                    <Text className="text-sm font-semibold text-gray-700">{crop.timeline.duration} days</Text>
                  </View>
                )}
              </View>

              {/* AI Recommendations */}
              {crop.aiRecommendations?.initialPlan && (
                <View className="bg-green-50 p-2 rounded-md mb-3">
                  <Text className="text-green-500 text-xs font-semibold">🤖 AI Recommendations Available</Text>
                </View>
              )}

              {/* Get Assist Button */}
              <TouchableOpacity
                className="bg-green-500 flex-row items-center justify-center py-3 rounded-xl"
                onPress={() => handleGetAssist(crop)}
              >
                <MaterialIcons name="smart-toy" size={20} color="white" />
                <Text className="text-white text-base font-semibold mx-2">Get AI Assistance</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllActiveCrops;
