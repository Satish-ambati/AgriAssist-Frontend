import React from "react";
import { View, Text } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import CropGrowth from "./CropGrowth";
import Schedule from "./Schedule";

const Tab = createMaterialTopTabNavigator();

const Layout = () => {
  const params = useLocalSearchParams();

  const cropCycleId = params.cropCycleId as string;

  let cropData: any = null;
  try {
    const raw =
      Array.isArray(params.cropData) ? params.cropData[0] : params.cropData;
    cropData = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.log("CropData parse error:", e);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#16a34a" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            color="white"
            size={22}
            onPress={() => router.push("/dashboard")}
          />

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

          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* TABS */}
      <Tab.Navigator
        screenOptions={{
          swipeEnabled: false,
          tabBarStyle: {
            backgroundColor: "#22c55e", // green-500
            height: 60,
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "#d1fae5", // green-100
          tabBarLabelStyle: { fontWeight: "bold", fontSize: 16 },
          tabBarIndicatorStyle: {
            backgroundColor: "#f0fdf4", // green-50 indicator
            height: 3,
          },
        }}
      >
        <Tab.Screen
          name="CropGrowth"
          children={() => (
            <CropGrowth cropCycleId={cropCycleId} cropData={cropData} />
          )}
          options={{ title: "Health" }}
        />

        <Tab.Screen
          name="Schedule"
          children={() => (
            <Schedule cropCycleId={cropCycleId} cropData={cropData} />
          )}
          options={{ title: "Schedule" }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default Layout;
