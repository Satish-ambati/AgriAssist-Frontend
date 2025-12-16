import { Api } from "@/app/api";
import Logout from "@/app/components/logout";
import { SendNotificationButton } from "@/app/components/sendNotification";
import { useFarmerStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";

import { SafeAreaView } from "react-native-safe-area-context";

const FarmerHistory = () => {
  const { farmerInfo } = useFarmerStore();
  const [history, setHistory] = useState([]);

  const [language, setLanguage] = useState("english");
const [savingLang, setSavingLang] = useState(false);

const languages = [
  { label: "English", value: "english" },
  { label: "తెలుగు", value: "telugu" },
  { label: "हिंदी", value: "hindi" },
];

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "Kharif":
        return "bg-green-100";
      case "Rabi":
        return "bg-blue-200";
      case "Zaid":
        return "bg-yellow-200";
      default:
        return "bg-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cereal":
        return "bg-yellow-100";
      case "Cash Crop":
        return "bg-green-100";
      case "Vegetable":
        return "bg-green-50";
      case "Fruit":
        return "bg-pink-100";
      case "Pulse":
        return "bg-purple-200";
      case "Oilseed":
        return "bg-orange-200";
      default:
        return "bg-gray-100";
    }
  };

  const getCropIcon = (cropName: string) => {
    switch (cropName?.toLowerCase()) {
      case "rice":
        return "leaf-outline";
      case "cotton":
        return "flower-outline";
      case "tomato":
        return "nutrition-outline";
      default:
        return "leaf-outline";
    }
  };

  // API CALL
  const getHistoryCrops = async () => {
    try {
      const response = await axios.get(
        Api +
          `/api/crop-cycle/get-history-crop-cycles/${farmerInfo.farmer?._id}`
      );

      if (response.data.success) {
        setHistory(response.data.allCycles || []);
      }
    } catch (error) {
      console.log("Error loading crop history:", error);
    }
  };

  useEffect(() => {
    getHistoryCrops();
  }, []);

  const saveLanguage = async (lang: string) => {
  try {
    setSavingLang(true);
    const token = await SecureStore.getItemAsync("refreshToken");
    console.log(token);
    if (!token) {
      console.log("No auth token");
      return;
    }

    await axios.post(
      Api + "/api/user/save-language",
      { language: lang },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setLanguage(lang);
  } catch (err) {
    console.log("Language save error:", err);
  } finally {
    setSavingLang(false);
  }
};

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        
        {/* Header */}
        <View className="bg-green-500 px-4 py-5 rounded-b-3xl">
          <View className="flex-row items-center">
            

            <Text className="flex-1 text-center text-white text-xl font-bold">
              Crop History
            </Text>

            <View className="w-6" />
          </View>

          {/* Farmer Info */}
          <View className="bg-white/30 p-4 rounded-2xl mt-4">
            <View className="flex-row items-center">
              <View className="w-15 h-15 rounded-lg justify-center items-center mr-3">
                <Ionicons name="person" size={28} color="white" />
              </View>

              <View className="flex-1">
                <Text className="text-white text-lg font-bold">
                  {farmerInfo?.farmer?.name || "Farmer Name"}
                </Text>

                <Text className="text-white text-xs mt-1">
                  {farmerInfo?.farmer?.phonenumber || "N/A"}
                </Text>

                <Text className="text-white text-xs mt-1">
                  {farmerInfo?.farmer?.location?.district || "District"},{" "}
                  {farmerInfo?.farmer?.location?.state || "State"}
                </Text>
              </View>


              <Logout />
            </View>

          </View>
          {/* Language Selector */}
          <View className="bg-white mt-4 rounded-2xl p-4 shadow">
            <Text className="text-gray-800 font-semibold mb-3">
              Preferred Language
            </Text>

            <View className="flex-row justify-between">
              {languages.map((lang) => {
                const isActive = language === lang.value;

                return (
                  <TouchableOpacity
                    key={lang.value}
                    onPress={() => saveLanguage(lang.value)}
                    disabled={savingLang}
                    className={`flex-1 mx-1 py-3 rounded-xl items-center ${
                      isActive ? "bg-green-500" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        isActive ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {savingLang && (
              <Text className="text-xs text-gray-400 mt-2 text-center">
                Saving preference...
              </Text>
            )}
          </View>

        </View>

        {/* Crop History List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
        {history.length === 0 && (
          <View className="mt-10 items-center justify-center">
            <View className="bg-white p-6 rounded-2xl shadow items-center w-[85%]">
              <Ionicons name="time-outline" size={48} color="#6B7280" />
              <Text className="text-gray-500 mt-3 text-lg font-medium">
                No crop history found
              </Text>
              <Text className="text-gray-400 mt-1 text-center">
                Your crop logs will appear here after completing a cycle.
              </Text>
            </View>
          </View>
        )}


          {history.map((cycle: any) => (
            <View
              key={cycle._id}
              className="bg-white rounded-3xl mb-4 p-4 shadow"
            >
              {/* Header */}
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-green-50 rounded-lg justify-center items-center mr-3">
                  <Ionicons
                    name={getCropIcon(cycle.crop?.name)}
                    size={24}
                    color="#16a34a"
                  />
                </View>

                <View>
                  <Text className="text-gray-900 font-bold text-base">
                    {cycle.crop?.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {cycle.crop?.variety}
                  </Text>
                </View>
              </View>

              {/* Season & Category */}
              <View className="flex-row mb-3">
                <View
                  className={`${getSeasonColor(
                    cycle.season
                  )} px-2 py-1 rounded-full mr-2`}
                >
                  <Text className="text-xs font-semibold text-gray-900">
                    {cycle.season}
                  </Text>
                </View>

                <View
                  className={`${getCategoryColor(
                    cycle.crop?.category
                  )} px-2 py-1 rounded-full`}
                >
                  <Text className="text-xs font-semibold text-gray-900">
                    {cycle.crop?.category}
                  </Text>
                </View>
              </View>

              {/* Timeline */}
              <Text className="text-green-600 font-bold text-sm mb-2">
                Timeline
              </Text>

              <View className="flex-row justify-between mb-3">
                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-xs">Sowing</Text>
                  <Text className="text-gray-900 font-semibold text-sm mt-1">
                    {formatDate(cycle.timeline?.sowingDate)}
                  </Text>
                </View>

                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-xs">Duration</Text>
                  <Text className="text-gray-900 font-semibold text-sm mt-1">
                    {cycle.timeline?.duration} days
                  </Text>
                </View>

                <View className="flex-1 items-center">
                  <Text className="text-gray-500 text-xs">Expected Harvest</Text>
                  <Text className="text-gray-900 font-semibold text-sm mt-1">
                    {formatDate(cycle.timeline?.expectedHarvestDate)}
                  </Text>
                </View>
              </View>


              {/* Status */}
              <View className="mt-2">
                <Text className="text-gray-700 font-semibold">
                  Status:{" "}
                  <Text className="text-green-600">{cycle.status}</Text>
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default FarmerHistory;
