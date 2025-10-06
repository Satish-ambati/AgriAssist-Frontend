import React from "react";
import { View, Text } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

// Import your screens
import CropGrowth from "./CropGrowth";
import Schedule from "./Schedule";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const Tab = createMaterialTopTabNavigator();

const Layout = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Common Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#047857" }}>
        <View
          style={{
            display:"flex" ,
            flexDirection : "row" ,
            justifyContent : "space-between" ,
            alignItems : "center" ,
            paddingVertical: 16,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <MaterialCommunityIcons name="arrow-left" color={"white"} size={22} onPress={() => router.push("/dashboard")} />
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Farm Assistant
          </Text>
          <View className="w-10"></View>
        </View>
      </SafeAreaView>

      {/* Material Top Tabs */}
      <Tab.Navigator
        screenOptions={{
          swipeEnabled: false,
          tabBarStyle: { backgroundColor: "#4987af", height: 60 },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "lightgray",
          tabBarLabelStyle: { fontWeight: "bold", fontSize: 16 },
          tabBarIndicatorStyle: {
            backgroundColor: "white", // underline indicator
            height: 3,
          },
        }}
      >
        <Tab.Screen name="CropGrowth" component={CropGrowth} options={{ title: "Health" }} />
        <Tab.Screen name="Schedule" component={Schedule} options={{ title: "Schedule" }} />
      </Tab.Navigator>
    </View>
  );
};

export default Layout;
