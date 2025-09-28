import Logout from "@/app/components/logout";
import { useFarmerStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const cropHistoryData = [
  {
    _id: "674a1b2c3d4e5f6a7b8c9d0e",
    crop: { name: "Rice", variety: "BPT 5204", category: "Cereal" },
    season: "Kharif",
    timeline: {
      sowingDate: "2024-06-15",
      expectedHarvestDate: "2024-10-15",
      actualHarvestDate: "2024-10-18",
      duration: 125,
    },
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
    timeline: {
      sowingDate: "2024-05-20",
      expectedHarvestDate: "2024-11-30",
      actualHarvestDate: "2024-12-05",
      duration: 200,
    },
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
    timeline: {
      sowingDate: "2023-11-10",
      expectedHarvestDate: "2024-03-15",
      actualHarvestDate: "2024-03-20",
      duration: 130,
    },
    plantingArea: { value: 0.8, unit: "acre" },
    expenses: { total: 41000 },
    yield: { expected: 120, actual: 135, unit: "quintal", quality: "Grade A" },
    status: "Completed",
    profit: 34000,
  },
];

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
];

interface FarmerHistoryProps {
  navigation?: any;
}

const FarmerHistory: React.FC<FarmerHistoryProps> = ({ navigation }) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { farmerInfo } = useFarmerStore();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "Kharif":
        return "bg-green-100 text-green-800";
      case "Rabi":
        return "bg-blue-100 text-blue-800";
      case "Zaid":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cereal":
        return "bg-amber-100 text-amber-800";
      case "Cash Crop":
        return "bg-emerald-100 text-emerald-800";
      case "Vegetable":
        return "bg-green-100 text-green-800";
      case "Fruit":
        return "bg-red-100 text-red-800";
      case "Pulse":
        return "bg-purple-100 text-purple-800";
      case "Oilseed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguageModal(false);
    console.log(`Language changed to: ${languageCode}`);
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find((l) => l.code === selectedLanguage);
    return lang ? lang.nativeName : "English";
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl mx-4 w-11/12 max-w-md">
            <View className="px-6 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">
                Select Language
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Choose your preferred language
              </Text>
            </View>
            <View className="py-2">
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  className={`flex-row items-center justify-between px-6 py-4 ${
                    selectedLanguage === language.code ? "bg-emerald-50" : ""
                  }`}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <View>
                    <Text className="text-lg font-medium text-gray-800">
                      {language.nativeName}
                    </Text>
                    <Text className="text-sm text-gray-500">{language.name}</Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              className="px-6 py-4 border-t border-gray-200"
              onPress={() => setShowLanguageModal(false)}
            >
              <Text className="text-center text-emerald-600 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header + Farmer Profile */}
      <View className="bg-emerald-600 px-4 pt-4 pb-8 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Ionicons name="time" size={28} color="white" />
            <Text className="text-2xl font-bold text-white ml-2">Crop History</Text>
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="p-2 rounded-full bg-emerald-500 flex-row items-center px-3"
              onPress={() => setShowLanguageModal(true)}
            >
              <Ionicons name="language" size={20} color="white" />
              <Text className="text-white text-xs ml-1">{getCurrentLanguageName()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2 rounded-full bg-emerald-500"
              onPress={() => console.log("Settings pressed")}
            >
              <Ionicons name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-emerald-500 rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold mb-2">
                {farmerInfo?.farmer?.name || "Farmer Name"}
              </Text>
              <Text className="text-emerald-100 text-sm mb-1">
                Phone: {farmerInfo?.farmer?.phonenumber || "N/A"}
              </Text>
              <Text className="text-emerald-100 text-sm">
                Location: {farmerInfo?.farmer?.location?.district || "-"},{" "}
                {farmerInfo?.farmer?.location?.state || "-"}
              </Text>
            </View>
            <Logout />
          </View>
        </View>
      </View>

      {/* Crop History */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 "
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Previous Crops ({cropHistoryData?.length || 0} cycles)
          </Text>

          {cropHistoryData.map((cycle) => (
            <View
              key={cycle._id}
              className="bg-white mb-4 rounded-2xl shadow-md overflow-hidden"
            >
              {/* Card Header */}
              <View className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-emerald-800">
                      {cycle.crop.name}
                    </Text>
                    <Text className="text-sm text-emerald-600">
                      {cycle.crop.variety} • {cycle.plantingArea.value}{" "}
                      {cycle.plantingArea.unit}
                    </Text>
                  </View>
                  <View className="flex-row space-x-2">
                    <View
                      className={`px-2 py-1 rounded-full ${getSeasonColor(
                        cycle.season
                      )}`}
                    >
                      <Text className="text-xs font-medium">{cycle.season}</Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full ${getCategoryColor(
                        cycle.crop.category
                      )}`}
                    >
                      <Text className="text-xs font-medium">{cycle.crop.category}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card Content */}
              <View className="p-4 space-y-4">
                {/* Timeline */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Timeline</Text>
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500">Sowing Date</Text>
                      <Text className="text-sm font-medium text-gray-800">
                        {formatDate(cycle.timeline.sowingDate)}
                      </Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-xs text-gray-500">Duration</Text>
                      <Text className="text-sm font-medium text-gray-800">
                        {cycle.timeline.duration} days
                      </Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-xs text-gray-500">Harvest Date</Text>
                      <Text className="text-sm font-medium text-gray-800">
                        {formatDate(cycle.timeline.actualHarvestDate)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Yield & Quality */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Yield & Quality</Text>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500">Yield</Text>
                      <Text className="text-lg font-bold text-emerald-700">
                        {cycle.yield.actual} {cycle.yield.unit}
                      </Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-xs text-gray-500">Quality</Text>
                      <Text className="text-sm font-medium text-emerald-600">
                        {cycle.yield.quality}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Financial Summary */}
                <View className="border-t border-gray-100 pt-4">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs text-gray-500">Total Investment</Text>
                      <Text className="text-sm font-medium text-gray-800">
                        {formatCurrency(cycle.expenses.total)}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-xs text-gray-500">Net Profit</Text>
                      <Text
                        className={`text-lg font-bold ${
                          cycle.profit > 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(cycle.profit)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-gray-500">Status</Text>
                      <View className="bg-emerald-100 px-2 py-1 rounded-full">
                        <Text className="text-emerald-800 text-xs font-medium">
                          {cycle.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FarmerHistory;
