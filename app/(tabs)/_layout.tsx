import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#16A34A', // emerald green
        tabBarInactiveTintColor: '#6B7280', // cool gray
        tabBarStyle: {
          backgroundColor: '#F9FAFB', // near-white background
          borderTopColor: '#E5E7EB',  // light gray border
          height: 70,
        },
        tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

          switch (route.name) {
            case 'dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'diseaseDetection':
              iconName = focused ? 'medkit' : 'medkit-outline';
              break;
            case 'assistant':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'marketPrices':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="diseaseDetection" options={{ title: 'Disease' }} />
      <Tabs.Screen 
        name="assistant" 
        options={{
          title: 'Assistant',
          tabBarIcon: ({ focused }) => (
            <View className="justify-center items-center -mt-3">
              <View className={`
                w-20 h-20 rounded-full justify-center items-center
                shadow-lg shadow-black
                ${focused ? 'bg-emerald-600' : 'bg-emerald-600'}
              `}>
                <Ionicons 
                  name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
                  size={36} 
                  color="white" 
                />
              </View>
            </View>
          ),
          tabBarLabel: () => null, // Hide the label
        }} 
      />
      <Tabs.Screen name="marketPrices" options={{ title: 'Prices' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}