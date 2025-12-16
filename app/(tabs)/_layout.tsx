import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Text, Pressable } from "react-native";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        // ⭐ FIX: override assistant tab press
        tabBarButton: ({ onPress, accessibilityState, children, style }) => {
          const isAssistant = route.name === "assistant";

          return (
            <Pressable
              onPress={(e) => {
                if (isAssistant) {
                  e.preventDefault();
                  router.replace("/assistant"); // reset assistant tab
                } else {
                  onPress?.(e);
                }
              }}
              accessibilityState={accessibilityState}
              style={style}
            >
              {children}
            </Pressable>
          );
        },

        tabBarStyle: {
          backgroundColor: "#F9FAFB",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 5,
        },

        tabBarIcon: ({ size, focused }) => {
          let iconName: string = "ellipse-outline";
          let IconComponent: any = Ionicons;

          switch (route.name) {
            case "dashboard":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "diseaseDetection":
              iconName = focused ? "medkit" : "medkit-outline";
              break;
            case "assistant":
              IconComponent = FontAwesome5;
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
              solid={IconComponent === FontAwesome5}
            />
          );
        },

        tabBarLabel: ({ focused }) => {
          const labels: any = {
            dashboard: "Dashboard",
            diseaseDetection: "Disease",
            assistant: "Assistant",
            marketPrices: "Prices",
            history: "History",
          };

          return (
            <Text
              style={{
                fontSize: 12,
                fontWeight: focused ? "bold" : "normal",
                color: focused ? "#059669" : "#6B7280",
              }}
            >
              {labels[route.name]}
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
