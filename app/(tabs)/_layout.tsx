import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { View, Pressable, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F9FAFB',
          borderTopColor: '#E5E7EB',
          height: 70,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

          switch (route.name) {
            case 'dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'diseaseDetection':
              iconName = focused ? 'medkit' : 'medkit-outline';
              break;
            case 'marketPrices':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={focused ? '#525652ff' : '#6B7280'} // green when active, gray when inactive
              style={{ opacity: focused ? 1 : 0.5 }} // inactive = opaque
            />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          // Assistant has no label
          if (route.name === 'assistant') return null;

          return (
            <Text
              style={{
                fontSize: 12,
                fontWeight: focused ? 'bold' : 'normal',
                color: focused ? '#525652ff' : '#6B7280',
                opacity: focused ? 1 : 0.5,
              }}
            >
              {route.name === 'dashboard'
                ? 'Dashboard'
                : route.name === 'diseaseDetection'
                ? 'Disease'
                : route.name === 'marketPrices'
                ? 'Prices'
                : route.name === 'profile'
                ? 'Profile'
                : ''}
            </Text>
          );
        },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="diseaseDetection" options={{ title: 'Disease' }} />

      {/* Custom middle tab */}
      <Tabs.Screen
        name="assistant"
        options={{
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push('/assistantScreen')}
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <View
                className="
                  w-20 h-20 rounded-full justify-center items-center
                  shadow-lg shadow-black -mt-6
                  bg-emerald-600
                "
              >
                <Ionicons name="chatbubbles" size={36} color="white" />
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen name="marketPrices" options={{ title: 'Prices' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
