import Logout from "@/app/components/logout";
import { useFarmerStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const cropHistoryData = [
  {
    _id: "674a1b2c3d4e5f6a7b8c9d0e",
    crop: { name: "Rice", variety: "BPT 5204", category: "Cereal" },
    season: "Kharif",
    timeline: { sowingDate: "2024-06-15", expectedHarvestDate: "2024-10-15", actualHarvestDate: "2024-10-18", duration: 125 },
    plantingArea: { value: 2.5, unit: "acre" },
    expenses: { total: 63000 },
    yield: { expected: 75, actual: 82, unit: "quintal", quality: "Grade A" },
    status: "Completed",
    profit: 42000,
  },
  {
    _id: "674a1b2c3d4e5f6a7b8c9d0f",
    crop: { name: "Cotton", variety: "Bt Cotton", category: "Cash Crop" },
    season: "Kharif",
    timeline: { sowingDate: "2024-05-20", expectedHarvestDate: "2024-11-30", actualHarvestDate: "2024-12-05", duration: 200 },
    plantingArea: { value: 1.8, unit: "acre" },
    expenses: { total: 82000 },
    yield: { expected: 15, actual: 17.5, unit: "quintal", quality: "Premium" },
    status: "Completed",
    profit: 58000,
  },
  {
    _id: "674a1b2c3d4e5f6a7b8c9d10",
    crop: { name: "Tomato", variety: "Hybrid", category: "Vegetable" },
    season: "Rabi",
    timeline: { sowingDate: "2023-11-10", expectedHarvestDate: "2024-03-15", actualHarvestDate: "2024-03-20", duration: 130 },
    plantingArea: { value: 0.8, unit: "acre" },
    expenses: { total: 41000 },
    yield: { expected: 120, actual: 135, unit: "quintal", quality: "Grade A" },
    status: "Completed",
    profit: 34000,
  },
];

const FarmerHistory = () => {
  const { farmerInfo } = useFarmerStore();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "Kharif": return "bg-green-100";
      case "Rabi": return "bg-blue-200";
      case "Zaid": return "bg-yellow-200";
      default: return "bg-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cereal": return "bg-yellow-100";
      case "Cash Crop": return "bg-green-100";
      case "Vegetable": return "bg-green-50";
      case "Fruit": return "bg-pink-100";
      case "Pulse": return "bg-purple-200";
      case "Oilseed": return "bg-orange-200";
      default: return "bg-gray-100";
    }
  };

  const getCropIcon = (cropName: string) => {
    switch (cropName.toLowerCase()) {
      case "rice": return "leaf-outline";
      case "cotton": return "flower-outline";
      case "tomato": return "nutrition-outline";
      default: return "leaf-outline";
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="bg-green-500 px-4 py-5 rounded-b-3xl">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-white text-xl font-bold">Crop History</Text>
            <View className="w-6" />
          </View>

          {/* Farmer Info */}
          <View className="bg-white/30 p-4 rounded-2xl mt-4">
            <View className="flex-row items-center">
              <View className="w-15 h-15  rounded-lg justify-center items-center mr-3">
                <Ionicons name="person" size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">{farmerInfo?.farmer?.name || "Farmer Name"}</Text>
                <Text className="text-white text-xs mt-1">{farmerInfo?.farmer?.phonenumber || "N/A"}</Text>
                <Text className="text-white text-xs mt-1">
                  {farmerInfo?.farmer?.location?.district || "District"}, {farmerInfo?.farmer?.location?.state || "State"}
                </Text>
              </View>
              <Logout />
            </View>
          </View>
        </View>

        {/* Crop History ScrollView */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {cropHistoryData.map((cycle) => (
            <View key={cycle._id} className="bg-white rounded-3xl mb-4 p-4 shadow">
              {/* Card Header */}
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-green-50 rounded-lg justify-center items-center mr-3">
                  <Ionicons name={getCropIcon(cycle.crop.name)} size={24} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-gray-900 font-bold text-base">{cycle.crop.name}</Text>
                  <Text className="text-gray-500 text-xs">{cycle.crop.variety} • {cycle.plantingArea.value} {cycle.plantingArea.unit}</Text>
                </View>
              </View>

              {/* Season & Category */}
              <View className="flex-row mb-3">
                <View className={`${getSeasonColor(cycle.season)} px-2 py-1 rounded-full mr-2`}>
                  <Text className="text-xs font-semibold text-gray-900">{cycle.season}</Text>
                </View>
                <View className={`${getCategoryColor(cycle.crop.category)} px-2 py-1 rounded-full`}>
                  <Text className="text-xs font-semibold text-gray-900">{cycle.crop.category}</Text>
                </View>
              </View>

              {/* Timeline */}
              <Text className="text-green-600 font-bold text-sm mb-2">Timeline</Text>
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-xs">Sowing</Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-green-600 my-1" />
                  <Text className="text-gray-900 text-sm font-semibold">{formatDate(cycle.timeline.sowingDate)}</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-xs">Duration</Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-yellow-400 my-1" />
                  <Text className="text-gray-900 text-sm font-semibold">{cycle.timeline.duration} days</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-xs">Harvest</Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-orange-500 my-1" />
                  <Text className="text-gray-900 text-sm font-semibold">{formatDate(cycle.timeline.actualHarvestDate)}</Text>
                </View>
              </View>

              {/* Yield & Quality */}
              <Text className="text-green-600 font-bold text-sm mb-2">Yield & Quality</Text>
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 bg-green-50 rounded-2xl p-3 mr-2 items-center">
                  <Text className="text-green-600 text-xs">Total Yield</Text>
                  <Text className="text-green-600 font-bold text-base">{cycle.yield.actual}</Text>
                  <Text className="text-green-600 text-xs">{cycle.yield.unit}</Text>
                </View>
                <View className="flex-1 bg-blue-100 rounded-2xl p-3 items-center">
                  <Text className="text-blue-700 text-xs">Quality Grade</Text>
                  <Text className="text-blue-700 font-bold text-sm">{cycle.yield.quality}</Text>
                </View>
              </View>

              {/* Financial Summary */}
              <Text className="text-green-600 font-bold text-sm mb-2">Financial Summary</Text>
              <View className="flex-row justify-between bg-green-50 rounded-2xl p-3">
                <View>
                  <Text className="text-gray-500 text-xs">Investment</Text>
                  <Text className="text-gray-900 font-bold text-sm">{formatCurrency(cycle.expenses.total)}</Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Net Profit</Text>
                  <Text className={`text-sm font-bold ${cycle.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(cycle.profit)}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default FarmerHistory;
