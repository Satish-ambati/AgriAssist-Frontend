import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import Weather from "./weather";
import FarmerCurrentCrops from "./farmerCurrentCrops";
import QuickAccess from "./quickAccess";
import { useCropStore } from "@/store/cropStore";
import { useFarmerStore } from "@/store";

const Dashboard = () => {
  const { fetchCrops } = useCropStore(); 
  const {farmerInfo} = useFarmerStore() ;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      let farmerId = farmerInfo?.farmer?._id ;
      await fetchCrops(farmerId);
    } finally {
      setRefreshing(false);
    }
  };


  useEffect(() => {
    const fetchCropsInUI = async() => {
      let farmerId = farmerInfo?.farmer?._id ;
      await fetchCrops(farmerId);
    }
    fetchCropsInUI() ;
  })

  return (
    <ScrollView
      className="flex-1 bg-green-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
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
          <ActiveCropsCount />
        </View>
      </View>

      {/* Weather Component */}
      <View className="pb-6">
        <Weather />
      </View>

      {/* Farmer Current Crops */}
      <View className="pb-6">
        <FarmerCurrentCrops /> 
      </View>

      {/* Quick Access */}
      <View className="pb-4">
        <QuickAccess />
      </View>

      <View className="flex flex-row items-center justify-center "><Text className="text-xs ">Are you having any debts ? <Text className="text-green-600">click here .</Text></Text></View>

      <View className="h-6" />

    </ScrollView>
  );
};

// optional helper to show active crop count from store
const ActiveCropsCount = () => {
  const { crops } = useCropStore();
  return (
    <Text className="text-xl font-bold text-white">
      {crops.filter(c => c.status === "Active").length}
    </Text>
  );
};

export default Dashboard;
