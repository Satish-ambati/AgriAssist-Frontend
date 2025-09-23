import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useFarmerStore } from "@/store";
import Logout from "@/app/components/logout";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile: React.FC = () => {
  const { farmerInfo } = useFarmerStore();

  if (!farmerInfo?.farmer) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500 text-lg">No farmer info available</Text>
      </View>
    );
  }

  const { farmer } = farmerInfo;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-green-100 justify-center items-center">
            <Text className="text-4xl">👨‍🌾</Text>
          </View>
          <Text className="mt-4 text-2xl font-bold text-gray-900">
            {farmer.name}
          </Text>
          <Text className="text-gray-500">+91 {farmer.phonenumber}</Text>
        </View>

        {/* Info Card */}
        <View className="bg-white rounded-2xl shadow p-5 space-y-4">
          <View>
            <Text className="text-gray-500 text-sm">Language</Text>
            <Text className="text-lg font-semibold text-gray-800">
              {farmer.language || "Not set"}
            </Text>
          </View>

          <View>
            <Text className="text-gray-500 text-sm">Location</Text>
            <Text className="text-lg font-semibold text-gray-800">
              {farmer.location?.district || "Unknown"},{" "}
              {farmer.location?.state || "Unknown"}
            </Text>
          </View>
          <Logout />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
