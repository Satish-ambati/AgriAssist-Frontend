import React from "react";
import { View, Text, ScrollView } from "react-native";

const crops = [
  { name: "Wheat", price: 165, location: "Jaipur", arrivals: 5000 },
  { name: "Rice", price: 4850, location: "Delhi", arrivals: 2800 },
  { name: "Cotton", price: 7150, location: "Guntur", arrivals: 1200 },
  { name: "Sugarcane", price: 300, location: "Muzaffarnagar", arrivals: 8500 },
  { name: "Corn", price: 1850, location: "Nashik", arrivals: 3200 },
];

export default function MarketPrices() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f9f0' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#16a34a', 
        paddingTop: 50, 
        paddingBottom: 20, 
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25
      }}>
        <Text style={{ 
          color: 'white', 
          fontSize: 24, 
          fontWeight: 'bold', 
          textAlign: 'center' 
        }}>
          Market Prices
        </Text>
      </View>

      <ScrollView style={{ padding: 15 }}>
        {/* Table Container */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          
          {/* Table Header */}
          <View style={{
            backgroundColor: '#16a34a',
            flexDirection: 'row',
            paddingVertical: 15,
            paddingHorizontal: 10
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold', flex: 2 }}>
              Crop
            </Text>
            <Text style={{ color: 'white', fontWeight: 'bold', flex: 2 }}>
              Location
            </Text>
            <Text style={{ color: 'white', fontWeight: 'bold', flex: 1.5, textAlign: 'center' }}>
              Price
            </Text>
            <Text style={{ color: 'white', fontWeight: 'bold', flex: 1.5, textAlign: 'center' }}>
              Arrivals
            </Text>
          </View>

          {/* Table Rows */}
          {crops.map((crop, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              paddingVertical: 12,
              paddingHorizontal: 10,
              backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb'
            }}>
              <Text style={{ flex: 2, fontSize: 16, fontWeight: '500', color: '#16a34a' }}>
                {crop.name}
              </Text>
              <Text style={{ flex: 2, fontSize: 14, color: '#666' }}>
                {crop.location}
              </Text>
              <Text style={{ flex: 1.5, fontSize: 16, fontWeight: 'bold', color: '#16a34a', textAlign: 'center' }}>
                ₹{crop.price}
              </Text>
              <Text style={{ flex: 1.5, fontSize: 14, color: '#666', textAlign: 'center' }}>
                {crop.arrivals}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}