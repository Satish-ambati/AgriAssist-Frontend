import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Api } from "@/app/api";
import { Crop, useCropStore } from "@/store/cropStore";
import * as SecureStore from "expo-secure-store";

const categories = [
  { value: "all", label: "All", icon: "grid-view" },
  { value: "Cereal", label: "Cereals", icon: "grass" },
  { value: "Pulse", label: "Pulses", icon: "eco" },
  { value: "Vegetable", label: "Vegetables", icon: "local-florist" },
  { value: "Fruit", label: "Fruits", icon: "apple" },
  { value: "Oilseed", label: "Oilseeds", icon: "water-drop" },
  { value: "Cash Crop", label: "Cash Crops", icon: "payments" },
];

const CropSelectionScreen: React.FC = () => {
  const { farm } = useLocalSearchParams<{ farm: string }>();
  const farmData = farm ? JSON.parse(farm) : null;

  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const hasFetched = useRef(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { addCrop } = useCropStore();

  useEffect(() => {
    const fetchCrops = async () => {
      if (!farmData || hasFetched.current) return;
      hasFetched.current = true;
      const token = await SecureStore.getItemAsync("refreshToken");

      try {
        setLoading(true);
        const { data } = await axios.post(
          `${Api}/api/ai/crop-recommendation`,
          farmData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success && Array.isArray(data.recommendedCrops)) {
          setCrops(data.recommendedCrops);
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("❌ Error fetching crops:", err);
        setError("Failed to fetch recommended crops. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, [farmData]);

  const filteredCrops = crops.filter(
    (c) =>
      c?.crop?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || c.crop.category === selectedCategory)
  );

  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedCrop || !farmData) return;

    try {
      setConfirmLoading(true);

      const { data } = await axios.post(
        `${Api}/api/crop-cycle/start/${farmData.farmer}/${farmData._id}`,
        {
          crop: {
            name: selectedCrop.crop.name,
            variety: selectedCrop.crop.variety,
            category: selectedCrop.crop.category,
          },
          season: selectedCrop.season,
          timeline: {
            sowingDate: selectedCrop.timeline.sowingDate,
            duration: selectedCrop.timeline.duration,
            expectedHarvestDate: selectedCrop.timeline.expectedHarvestDate,
          },
          yield: {
            expected: selectedCrop.yield?.expected,
            unit: "q/acre",
          },
          aiRecommendations: selectedCrop.aiRecommendations || {},
          cropStage: "Planning",
          status: "Active",
          tasks: [],
        }
      );

      if (!data.success) {
        throw new Error("Failed to create cycle");
      }

      const newCropCycle = data.cropCycle;
      addCrop(newCropCycle);

      setModalVisible(false);

      router.push({
        pathname: "/assistant/CropMonitoring/CropGrowth",
        params: {
          cropCycleId: newCropCycle._id,
          cropData: JSON.stringify(newCropCycle),
        },
      });
    } catch (err) {
      console.error("❌ Failed to create crop cycle:", err);
      setError("Failed to start crop cycle. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "#10b981";
    if (confidence >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const getConfidenceGradient = (confidence: number) => {
    if (confidence >= 90) return "from-emerald-50 to-emerald-100";
    if (confidence >= 75) return "from-amber-50 to-amber-100";
    return "from-red-50 to-red-100";
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Enhanced Header with Gradient */}
      <View className="bg-green-500 px-5 pt-12 pb-8 shadow-lg">
        <View className="flex-row items-center ">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">
              AI Crop Recommendations
            </Text>
            <Text className="text-sm text-white/80">
              Powered by Smart Agriculture
            </Text>
          </View>
        </View>


      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Analyzing Your Farm
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Our AI is finding the best crops for your conditions...
            </Text>
          </View>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
              <MaterialIcons name="error-outline" size={40} color="#dc2626" />
            </View>
            <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
              Oops! Something went wrong
            </Text>
            <Text className="text-sm text-gray-600 text-center">{error}</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Enhanced Search & Filter Section */}
          <View className="bg-white shadow-sm">


            {/* Enhanced Category Pills */}
           <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 py-2"
              contentContainerStyle={{ gap: 10 }}
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat.value;

                return (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => setSelectedCategory(cat.value)}
                    activeOpacity={0.8}
                    className={`
                      flex-row items-center
                      px-4 py-2.5
                      rounded-full
                      ${active ? "bg-emerald-600" : "bg-slate-100"}
                    `}
                  >
                    <MaterialIcons
                      name={cat.icon as any || "filter"}
                      size={14}
                      color={active ? "#ffffff" : "#475569"}
                    />

                    <Text
                      className={`ml-2 text-xs font-semibold tracking-wide ${
                        active ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>

          {/* Enhanced Crops Grid */}
          <ScrollView
            className="flex-1 px-4 pt-4"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {filteredCrops.length === 0 ? (
              <View className="flex-1 items-center justify-center py-16">
                <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center mb-6">
                  <Text className="text-6xl">🌾</Text>
                </View>
                <Text className="text-xl font-bold text-gray-800 mb-2">
                  No Crops Found
                </Text>
                <Text className="text-sm text-gray-500 text-center px-8">
                  Try adjusting your search or category filter
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-sm font-semibold text-gray-600 mb-3 ml-1">
                  {filteredCrops.length} Recommended{" "}
                  {filteredCrops.length === 1 ? "Crop" : "Crops"}
                </Text>
                {filteredCrops.map((crop, idx) => (
                  <TouchableOpacity
                    key={`${crop.crop.name}-${crop.season}-${idx}`}
                    activeOpacity={0.9}
                    onPress={() => handleSelectCrop(crop)}
                    className="bg-white rounded-3xl p-5 mb-4 shadow-md border border-gray-100"
                  >
                    {/* Crop Header */}
                    <View className="flex-row items-start justify-between mb-4">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View className="w-12 h-12 rounded-2xl bg-green-100 items-center justify-center mr-3">
                            <Text className="text-2xl">🌱</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900 mb-0.5">
                              {crop.crop.name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              {crop.crop.variety}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="bg-green-100 px-3 py-1.5 rounded-full">
                        <Text className="text-xs font-bold text-green-700">
                          {crop.crop.category}
                        </Text>
                      </View>
                    </View>

                    {/* Quick Stats Row */}
                    <View className="flex-row gap-2 mb-4">
                      <View className="flex-1 bg-blue-50 rounded-2xl p-3 border border-blue-100">
                        <View className="flex-row items-center mb-1">
                          <MaterialIcons name="wb-sunny" size={16} color="#3b82f6" />
                          <Text className="text-xs font-semibold text-blue-700 ml-1">
                            Season
                          </Text>
                        </View>
                        <Text className="text-sm font-bold text-blue-900">
                          {crop.season}
                        </Text>
                      </View>

                      <View className="flex-1 bg-purple-50 rounded-2xl p-3 border border-purple-100">
                        <View className="flex-row items-center mb-1">
                          <MaterialIcons name="schedule" size={16} color="#9333ea" />
                          <Text className="text-xs font-semibold text-purple-700 ml-1">
                            Duration
                          </Text>
                        </View>
                        <Text className="text-sm font-bold text-purple-900">
                          {crop?.timeline?.duration} days
                        </Text>
                      </View>

                      <View className="flex-1 bg-amber-50 rounded-2xl p-3 border border-amber-100">
                        <View className="flex-row items-center mb-1">
                          <MaterialIcons name="analytics" size={16} color="#f59e0b" />
                          <Text className="text-xs font-semibold text-amber-700 ml-1">
                            Yield
                          </Text>
                        </View>
                        <Text className="text-sm font-bold text-amber-900">
                          {crop.yield?.expected} q
                        </Text>
                      </View>
                    </View>

                    {/* Confidence Score */}
                    {crop.confidence !== undefined && (
                      <View className={`bg-gradient-to-br ${getConfidenceGradient(crop.confidence)} rounded-2xl p-4 mb-4 border border-gray-200`}>
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center">
                            <MaterialIcons
                              name="verified"
                              size={18}
                              color={getConfidenceColor(crop.confidence)}
                            />
                            <Text className="text-sm font-bold text-gray-700 ml-2">
                              AI Confidence Score
                            </Text>
                          </View>
                          <Text className="text-xl font-bold" style={{ color: getConfidenceColor(crop.confidence) }}>
                            {crop.confidence}%
                          </Text>
                        </View>
                        <View className="w-full h-3 rounded-full bg-white/50 overflow-hidden">
                          <View
                            className="h-3 rounded-full"
                            style={{
                              width: `${crop.confidence}%`,
                              backgroundColor: getConfidenceColor(crop.confidence),
                            }}
                          />
                        </View>
                      </View>
                    )}

                    {/* AI Recommendation Reason */}
                    {crop?.reason && (
                      <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                        <View className="flex-row items-start">
                          <View className="w-8 h-8 rounded-full bg-indigo-200 items-center justify-center mr-3 mt-0.5">
                            <MaterialIcons name="lightbulb" size={16} color="#4f46e5" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-xs font-bold text-indigo-700 mb-1">
                              WHY WE RECOMMEND THIS
                            </Text>
                            <Text className="text-sm text-gray-700 leading-5">
                              {crop.reason}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Select Button */}
                    <View className="mt-4 pt-4 border-t border-gray-100">
                      <View className="bg-green-600 rounded-2xl py-4 items-center shadow-lg">
                        <Text className="text-white font-bold text-base">
                          Select This Crop →
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </>
      )}

      {/* Enhanced Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">


            {/* Crop Details */}
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {selectedCrop?.crop.name}
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-6">
              {selectedCrop?.crop.variety} • {selectedCrop?.crop.category}
            </Text>

            {/* Quick Info Cards */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="calendar-today" size={16} color="#10b981" />
                  <Text className="text-sm text-gray-600 ml-2">Duration</Text>
                </View>
                <Text className="text-sm font-bold text-gray-900">
                  {selectedCrop?.timeline?.duration} days
                </Text>
              </View>
              <View className="h-px bg-gray-200 mb-3" />
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="trending-up" size={16} color="#10b981" />
                  <Text className="text-sm text-gray-600 ml-2">Expected Yield</Text>
                </View>
                <Text className="text-sm font-bold text-gray-900">
                  {selectedCrop?.yield?.expected} q/acre
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 text-center mb-6">
              Ready to start growing{" "}
              <Text className="font-bold text-gray-900">
                {selectedCrop?.crop.name}
              </Text>
              ? This will begin your crop cycle journey.
            </Text>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-100 py-4 rounded-2xl border-2 border-gray-200"
                activeOpacity={0.7}
              >
                <Text className="text-base font-bold text-gray-700 text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 bg-green-500 py-4 rounded-2xl shadow-lg"
                disabled={confirmLoading}
                activeOpacity={0.8}
              >
                {confirmLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-base font-bold text-white text-center">
                    Let's Grow! 🌱
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CropSelectionScreen;