import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { Api } from "@/app/api";
import { useFarmerStore } from "@/store";

const FarmsScreen: React.FC = () => {
  // ----- Local States -----
  const [farms, setFarms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const { farmerInfo } = useFarmerStore();

  useEffect(() => {
    const getAllFarms = async () => {
      try {
        const response = await axios.get(
          `${Api}/api/farm/get/${farmerInfo.farmer?._id}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setFarms(response.data.data || []);
        } else {
          setFarms([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch farms:", err);
        setFarms([]);
      }
    };

    getAllFarms();
  }, [farmerInfo.farmer?._id]);

  // ----- Filter Farms -----
  const filteredFarms = farms.filter((farm) => {
    const matchesSearch =
      farm.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.location?.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ----- Handlers -----
  const handleFarmSelect = (farm: any) => setShowConfirmModal(farm);

  const confirmFarmSelection = () => {
    if (showConfirmModal) {
      const farm = showConfirmModal;
     

      router.push({pathname : "/(tabs)/assistant/CropSelection" , params: { farm: JSON.stringify(farm) }});
      setShowConfirmModal(null);
    }
  };

  const handleCreateNewFarm = () => {
    router.push("/assistant/AddFarm");
  };

  const handleDeleteFarm = (farmId: string) => setShowDeleteModal(farmId);

  const confirmDelete = async (farmId: string) => {
    try {
      const res = await axios.delete(`${Api}/api/farm/delete/${farmId}`);

      if (res.data.success) {
        setFarms((prev) => prev.filter((f) => f._id !== farmId));
        Alert.alert("Farm Deleted", res.data.message || "Deleted successfully!");
      } else {
        Alert.alert("Error", res.data.message || "Failed to delete farm");
      }
    } catch (err: any) {
      console.error("Delete Farm Error:", err);
      Alert.alert("Error", "Something went wrong while deleting farm.");
    } finally {
      setShowDeleteModal(null);
    }
  };

  // ----- Helpers -----
  const getPHLevelColor = (phLevel: number) => {
    if (phLevel >= 6.0 && phLevel <= 7.5) return "#059669";
    if (phLevel >= 5.5 && phLevel < 6.0) return "#D97706";
    if (phLevel > 7.5 && phLevel <= 8.0) return "#D97706";
    return "#DC2626";
  };

  const getPHLevelStatus = (phLevel: number) => {
    if (phLevel >= 6.0 && phLevel <= 7.5) return "Optimal";
    if (phLevel >= 5.5 && phLevel < 6.0) return "Acidic";
    if (phLevel > 7.5 && phLevel <= 8.0) return "Alkaline";
    return "Poor";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----- Render -----
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-500 px-5 pt-10 pb-6 shadow-xl">
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-3xl font-bold text-white mb-1">My Farms</Text>
            <Text className="text-green-100 text-base">
              {farms.length} farms total
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-2 z-10">
            <MaterialIcons name="search" size={18} color="#6B7280" />
          </View>
          <TextInput
            className="bg-white pl-10 pr-4 py-3 rounded-xl text-base text-gray-800 shadow-sm"
            placeholder="Search farms by name or location..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {/* Farm Cards */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredFarms.length > 0 ? (
          filteredFarms.map((farm) => (
            <TouchableOpacity
              key={farm._id}
              className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-100"
              onPress={() => handleFarmSelect(farm)}
              activeOpacity={0.7}
            >
              {/* Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-2">
                    <View className="w-1 h-8 bg-green-500 rounded-full mr-3"></View>
                    <View>
                      <Text className="text-xl font-bold text-gray-800 mb-1">
                        {farm.farmName}
                      </Text>
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="location-on"
                          size={16}
                          color="#059669"
                        />
                        <Text className="text-sm text-gray-600 ml-1 font-medium">
                          {farm.location || "Unknown location"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  className="p-2 rounded-full bg-red-50"
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteFarm(farm._id);
                  }}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={20}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              </View>

              {/* Farm Details Grid */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row mb-3">
                  {/* Land Size */}
                  <View className="flex-1 mr-4">
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons name="landscape" size={16} color="#059669" />
                      <Text className="text-xs text-gray-500 ml-1 font-medium uppercase">
                        Land Size
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-gray-800">
                      {farm.totalArea?.value} {farm.totalArea?.unit}
                    </Text>
                  </View>

                  {/* Water Source */}
                  <View className="flex-1 mr-4">
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons name="water-drop" size={16} color="#0EA5E9" />
                      <Text className="text-xs text-gray-500 ml-1 font-medium uppercase">
                        Water 
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-gray-800">
                      {farm.waterSource?.type || "Unknown"}
                    </Text>
                  </View>

                  {/* Soil pH Level */}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons name="science" size={16} color="#8B5CF6" />
                      <Text className="text-xs text-gray-500 ml-1 font-medium uppercase">
                        Soil pH
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-base font-bold text-gray-800 mr-1">
                        {farm.soilReport?.ph ?? "N/A"}
                      </Text>
                      {farm.soilReport?.ph && (
                        <View className="flex-row items-center">
                          <View
                            className="w-2 h-2 rounded-full mr-1"
                            style={{
                              backgroundColor: getPHLevelColor(
                                farm.soilReport.ph
                              ),
                            }}
                          />
                          <Text
                            className="text-xs font-semibold"
                            style={{
                              color: getPHLevelColor(farm.soilReport.ph),
                            }}
                          >
                            {getPHLevelStatus(farm.soilReport.ph)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Info */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                  <MaterialIcons name="schedule" size={16} color="#0EA5E9" />
                  <Text className="text-xs text-blue-700 ml-1 font-medium">
                    Created: {formatDate(farm.createdAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-16">
            <Text className="text-2xl font-bold text-gray-700 mb-2 text-center">
              {searchTerm ? "No farms found" : "No farms yet"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateNewFarm}
        className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-xl"
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal !== null}
        onRequestClose={() => setShowDeleteModal(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white rounded-2xl p-6 mx-10 items-center shadow-2xl">
            <View className="bg-red-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="warning" size={48} color="#EF4444" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mt-2 mb-2 text-center">
              Delete Farm
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Are you sure you want to delete this farm?
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(null)}
                className="bg-gray-100 px-6 py-3 rounded-lg flex-1 border border-gray-200"
              >
                <Text className="text-base font-semibold text-gray-700 text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDelete(showDeleteModal!)} 
                className="bg-red-600 px-6 py-3 rounded-lg flex-1 shadow-lg"
              >
                <Text className="text-base font-semibold text-white text-center">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Farm Selection Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmModal !== null}
        onRequestClose={() => setShowConfirmModal(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white rounded-2xl p-6 mx-10 items-center shadow-2xl">
            <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="check-circle" size={48} color="#059669" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mt-2 mb-2 text-center">
              Select Farm
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Do you want to set this farm as your current active farm?
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowConfirmModal(null)}
                className="bg-gray-100 px-6 py-3 rounded-lg flex-1 border border-gray-200"
              >
                <Text className="text-base font-semibold text-gray-700 text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmFarmSelection}
                className="bg-green-600 px-6 py-3 rounded-lg flex-1 shadow-lg"
              >
                <Text className="text-base font-semibold text-white text-center">
                  Select
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FarmsScreen;