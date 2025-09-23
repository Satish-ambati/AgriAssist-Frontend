import WeatherReport from "@/app/components/WeatherReport";
import { useFarmerStore } from "@/store";
import React from "react";
import { Text, View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const { farmerInfo } = useFarmerStore();

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
               {/* Header Section */}
        <View className="bg-emerald-600 px-6 pt-6 pb-8 mb-2 relative overflow-hidden">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-10">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <View className="absolute -bottom-5 -left-5 w-24 h-24 bg-white rounded-full" />
            <View className="absolute top-20 right-16 w-16 h-16 bg-white rounded-full" />
          </View>
          
          <View className="relative z-10">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                {/* Date and Time */}
                <View className="flex-row items-center mb-2">
                  <View className="w-2 h-2 bg-green-200 rounded-full mr-2" />
                  <Text className="text-sm text-green-100 font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                
                {/* Greeting */}
                <Text className="text-lg text-green-50 font-semibold mb-1">
                  {getCurrentGreeting()}
                </Text>
                
                {/* Farmer Name */}
                <View className="flex-row items-center">
                  <Text className="text-3xl font-bold text-white">
                    {farmerInfo?.farmer?.name || "Farmer"}
                  </Text>
                  <Text className="text-2xl ml-2">👋</Text>
                </View>
                
                {/* Subtitle */}
                <Text className="text-sm text-green-100 opacity-90 mt-3 leading-5">
                  Ready to manage your farm today?
                </Text>
              </View>
              
              
            </View>
            
            
          </View>
        </View>

        {/* Content Container */}
        <View className="px-4">
          {/* Weather Report Card */}
          <View className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">
                Weather Report
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Current conditions at your farm location
              </Text>
            </View>
            <View className="p-4 flex items-center justify-center">
              <WeatherReport />
            </View>
          </View>

         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;