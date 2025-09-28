import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#F9FAFB",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 5,
        },
        tabBarIcon: ({ size, focused }) => {
          let iconName: string = "ellipse-outline";

          // Default to Ionicons
          let IconComponent: any = Ionicons;

          switch (route.name) {
            case "dashboard":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "diseaseDetection":
              iconName = focused ? "medkit" : "medkit-outline"; // 🌱 Plant health
              break;
            case "assistant":
              IconComponent = FontAwesome5; // use FA5 for robot
              iconName = "robot";
              break;
            case "marketPrices":
              iconName = focused ? "pricetag" : "pricetag-outline";
              break;
            case "history":
              iconName = focused ? "receipt" : "receipt-outline";
              break;
          }

          return (
            <IconComponent
              name={iconName}
              size={size}
              color={focused ? "#059669" : "#6B7280"}
              solid={IconComponent === FontAwesome5} // robot needs solid style
            />
          );
        },
        tabBarLabel: ({ focused }) => {
          let label;
          switch (route.name) {
            case "dashboard":
              label = "Dashboard";
              break;
            case "diseaseDetection":
              label = "Disease";
              break;
            case "assistant":
              label = "Assistant";
              break;
            case "marketPrices":
              label = "Prices";
              break;
            case "history":
              label = "History";
              break;
          }

          return (
            <Text
              style={{
                fontSize: 12,
                fontWeight: focused ? "bold" : "normal",
                color: focused ? "#059669" : "#6B7280",
              }}
            >
              {label}
            </Text>
          );
        },
      })}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="diseaseDetection" />
      <Tabs.Screen name="assistant" />
      <Tabs.Screen name="marketPrices" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}
