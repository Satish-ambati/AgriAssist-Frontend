import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useCropStore } from "@/store/cropStore";
import { useFarmerStore } from "@/store";

const FarmerCurrentCrops: React.FC = () => {
  const { crops, fetchCrops } = useCropStore(); // Zustand store
  const { farmerInfo } = useFarmerStore(); // Farmer info

  const activeCrops = crops.filter((crop) => crop.status === "Active");

  // Fetch crops when farmerInfo is available
  useEffect(() => {
    const loadCrops = async () => {
      if (!farmerInfo?.farmer?._id) return;

      try {
        await fetchCrops(farmerInfo.farmer._id); // Pass farmerId to fetchCrops
      } catch (err) {
        console.error("Failed to fetch crops:", err);
      }
    };

    loadCrops();
  }, [farmerInfo]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Completed":
        return "bg-blue-500";
      case "Failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCropStageIcon = (stage: string) => {
    switch (stage) {
      case "Planning":
        return "📋";
      case "Sowing":
        return "🌱";
      case "Germination":
        return "🌿";
      case "Vegetative":
        return "🌾";
      case "Flowering":
        return "🌸";
      case "Fruiting":
        return "🍃";
      case "Maturity":
        return "🌽";
      case "Harvested":
        return "📦";
      default:
        return "🌱";
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "Kharif":
        return "text-green-600";
      case "Rabi":
        return "text-red-600";
      case "Zaid":
        return "text-orange-600";
      default:
        return "text-gray-500";
    }
  };

  const handleGetAssist = (crop: any) => {
    router.push({
      pathname: "/assistant/CropMonitoring/CropGrowth",
      params: {
        cropCycleId: crop._id,
        cropData: JSON.stringify(crop),
      },
    });
  };

  const handleSeeAll = () => {
    router.push({
      pathname: "/allActiveCrops",
      params: { crops: JSON.stringify(activeCrops) },
    });
  };

  if (!farmerInfo) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-500 mt-3">Loading Farmer Data...</Text>
      </View>
    );
  }

  return (
    <View className="mx-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-green-500">
          🌾 Your Current Crops ({activeCrops.length})
        </Text>
        {activeCrops.length > 2 && (
          <TouchableOpacity
            onPress={handleSeeAll}
            className="flex flex-row items-center justify-center"
          >
            <Text className="px-1 text-sm" style={{ color: "skyblue" }}>
              View all
            </Text>
            <MaterialIcons name="chevron-right" color={"skyblue"} />
          </TouchableOpacity>
        )}
      </View>

      {activeCrops.length === 0 ? (
        <View className="bg-white p-6 rounded-2xl  items-center gap-2">
          <Ionicons name="leaf-outline" size={42} color="#16a34a" />
          
          <Text className="text-gray-700 font-bold text-xl">
            No Active Crops
          </Text>

          <Text className="text-gray-500 text-center text-sm px-4">
            Add your first crop to start tracking your crop cycle and farm activities.
          </Text>
        </View>

      ) : (
        <ScrollView horizontal={false}>
          {activeCrops.slice(0, 2).map((crop) => (
            <View key={crop._id} className="bg-white p-5 rounded-xl mb-4 ">
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

                {crop.timeline?.sowingDate && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">🗓️ Sowing Date:</Text>
                    <Text className="text-sm font-semibold text-gray-700">
                      {new Date(crop.timeline.sowingDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {crop.timeline?.expectedHarvestDate && (
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

                {crop.timeline?.duration && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">⏱️ Duration:</Text>
                    <Text className="text-sm font-semibold text-gray-700">{crop.timeline.duration} days</Text>
                  </View>
                )}
              </View>

              {/* AI Recommendations */}
              {crop.aiRecommendations?.initialPlan && (
                <View className="bg-green-50 p-2 rounded-md mb-3">
                  <Text className="text-green-500 text-xs font-semibold">
                    🤖 AI Recommendations Available
                  </Text>
                </View>
              )}

              {/* Get Assist Button */}
              <TouchableOpacity
                className="bg-green-500 flex-row items-center justify-center py-3 rounded-xl"
                onPress={() => handleGetAssist(crop)}
              >
                <MaterialIcons name="smart-toy" size={20} color="white" />
                <Text className="text-white text-base font-semibold mx-2">
                  Get AI Assistance
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default FarmerCurrentCrops;
