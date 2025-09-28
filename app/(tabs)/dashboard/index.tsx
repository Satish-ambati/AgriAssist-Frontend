import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Weather from "./weather";
import axios from "axios";

import FarmerCurrentCrops, { Crop } from "./farmerCurrentCrops";
import QuickAccess from "./quickAccess";
import { Api } from "@/app/api";
import { useFarmerStore } from "@/store";

const Dashboard = () => {
  const { farmerInfo } = useFarmerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentCrops, setCurrentCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const fetchCropData = async () => {
    try {
      setError(null);

      if (!farmerInfo?.farmer?._id) {
        throw new Error("Farmer information not available");
      }

      const farmerId = farmerInfo.farmer._id;
      console.log("Fetching crop cycles for farmer:", farmerId);

      const response = await axios.get(
        `${Api}/api/crop-cycle/get-all-crop-cycles/${farmerId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success && response.data.allCycles) {
        setCurrentCrops(response.data.allCycles);
      } else {
        throw new Error(response.data.message || "Failed to fetch crop cycles");
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching crop data:", error);
      setError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load crop data"
      );

      // Fallback crop data
      const fallbackCrops: Crop[] = [
        {
          _id: "fallback_1",
          farm: "farm_001",
          farmer: farmerInfo?.farmer?._id || "farmer_001",
          crop: {
            name: "Rice",
            variety: "Sona Masuri",
            category: "Cereal",
          },
          season: "Kharif",
          cropStage: "Flowering",
          timeline: {
            sowingDate: "2024-07-15",
            expectedHarvestDate: "2024-11-15",
            duration: 120,
          },
          expenses: {
            seeds: 2000,
            fertilizers: 5000,
            pesticides: 1500,
            irrigation: 3000,
            labor: 3000,
            other: 500,
            total: 15000,
          },
          yield: {
            expected: 40,
            unit: "quintal",
            quality: "Grade A",
          },
          status: "Active",
          createdAt: "2024-07-15",
          updatedAt: "2024-09-20",
        },
      ];

      setCurrentCrops(fallbackCrops);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchCropData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCropData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-lg text-green-600 font-semibold mt-3">
          Loading Dashboard...
        </Text>
        {farmerInfo?.farmer?.name && (
          <Text className="text-sm text-gray-500 mt-1">
            Welcome back, {farmerInfo.farmer.name}
          </Text>
        )}
      </View>
    );
  }

  if (error && currentCrops.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50 px-5">
        <Text className="text-xl font-bold text-red-600 mb-2">
          Unable to Load Data
        </Text>
        <Text className="text-base text-gray-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchCropData}
          className="bg-green-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-green-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row justify-between items-center bg-green-600 px-5 pt-12 pb-5 rounded-b-2xl shadow">
        <View>
          <Text className="text-2xl font-bold text-white">AgriAssist</Text>
          <Text className="text-sm text-green-100 mt-1">
            Smart Farming Dashboard
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-green-100">Active Crops</Text>
          <Text className="text-xl font-bold text-white">
            {currentCrops.filter((crop) => crop.status === "Active").length}
          </Text>
        </View>
      </View>

      {/* Weather Component */}
      <View className="pb-6">
        <Weather />
      </View>

      {/* Farmer Current Crops */}
      <View className="pb-6">
        <FarmerCurrentCrops currentCrops={currentCrops} />
      </View>

      {/* Quick Access */}
      <View className="pb-6">
        <QuickAccess scrollToTop={scrollToTop} />
      </View>

      <View className="h-6" />
    </ScrollView>
  );
};

export default Dashboard;
