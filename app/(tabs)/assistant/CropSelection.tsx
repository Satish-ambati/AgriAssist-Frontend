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
  { value: "all", label: "All" },
  { value: "Cereal", label: "Cereals" },
  { value: "Pulse", label: "Pulses" },
  { value: "Vegetable", label: "Vegetables" },
  { value: "Fruit", label: "Fruits" },
  { value: "Oilseed", label: "Oilseeds" },
  { value: "Cash Crop", label: "Cash Crops" },
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
    const hasFetched = useRef(false); // ✅ to prevent repeated fetching
const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { addCrop } = useCropStore();


  // ✅ Fetch crops directly from backend (already matches Crop schema)
  useEffect(() => {
    const fetchCrops = async () => {
      if (!farmData || hasFetched.current) return; // ✅ only once
      hasFetched.current = true;
      const token = await SecureStore.getItemAsync("refreshToken");

      try {
        setLoading(true);
        const { data } = await axios.post(
          `${Api}/api/ai/crop-recommendation`,
          farmData,
          { headers: { "Content-Type": "application/json" ,
                      "Authorization": `Bearer ${token}`
          } }
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-500 px-4 pt-10 pb-6 rounded-b-3xl shadow-md flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-2xl font-extrabold text-white">
            AI Recommended Crops
          </Text>
          {farmData && (
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="agriculture" size={18} color="rgba(255,255,255,0.7)" />
              <Text className="text-sm text-white ml-1">
                {farmData.farmName} — {farmData.totalArea?.value}{" "}
                {farmData.totalArea?.unit}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Loading / Error */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-3 text-gray-600">Fetching AI recommendations...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-600 text-lg font-semibold">{error}</Text>
        </View>
      ) : (
        <>
          {/* Search & Category Filter */}
          <View className="bg-white p-3 border-b border-gray-200">
            <View className="bg-gray-100 rounded-lg px-3 mb-3 flex-row items-center">
              <MaterialIcons name="search" size={18} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-700"
                placeholder="Search crops..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedCategory === cat.value
                      ? "bg-green-600"
                      : "bg-gray-100"
                  }`}
                  onPress={() => setSelectedCategory(cat.value)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      selectedCategory === cat.value
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Crops List */}
          <ScrollView className="flex-1 px-3 py-3" contentContainerStyle={{ paddingBottom: 20 }}>
            {filteredCrops.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-5xl mb-3">🔍</Text>
                <Text className="text-lg font-semibold text-gray-700 mb-2">
                  No crops found
                </Text>
              </View>
            ) : (
              filteredCrops.map((crop, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleSelectCrop(crop)}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-200"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View>
                      <Text className="text-lg font-bold text-gray-800">
                        {crop.crop.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {crop.crop.variety}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-400">{crop.crop.category}</Text>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <Text className="text-xs text-gray-600">
                      📅 {crop.season}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      ⏱️ {crop?.timeline?.duration} days
                    </Text>
                  </View>

                  <Text className="text-xs text-gray-600 mb-2">
                    📊 Yield: {crop.yield?.expected} q/acre
                  </Text>

                  {crop.confidence !== undefined && (
                    <View className="mb-2">
                      <Text className="text-xs text-gray-600 mb-1">
                        Confidence: {crop.confidence}%
                      </Text>
                      <View className="w-full h-2 rounded-full bg-gray-200">
                        <View
                          className="h-2 rounded-full"
                          style={{
                            width: `${crop.confidence}%`,
                            backgroundColor:
                              crop.confidence >= 90
                                ? "#16a34a"
                                : crop.confidence >= 75
                                ? "#ca8a04"
                                : "#dc2626",
                          }}
                        />
                      </View>
                    </View>
                  )}

                  {crop?.reason && (
                    <Text className="mt-2 text-sm text-gray-700 italic">
                      💡 {crop.reason}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Confirm Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white rounded-2xl p-6 mx-6 items-center shadow-2xl">
            <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="check-circle" size={48} color="#059669" />
            </View>

            <Text className="text-xl font-bold text-gray-800 mt-2 mb-2 text-center">
              Confirm {selectedCrop?.crop.name}
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Are you sure you want to start the crop cycle for{" "}
              <Text className="font-semibold">{selectedCrop?.crop.name}</Text>?
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-100 px-6 py-3 rounded-lg flex-1 border border-gray-200"
              >
                <Text className="text-base font-semibold text-gray-700 text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-green-600 px-6 py-3 rounded-lg flex-1 shadow-lg flex-row justify-center items-center"
                disabled={confirmLoading}
              >
                {confirmLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-base font-semibold text-white text-center">
                    Confirm
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
