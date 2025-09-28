import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";

const crops = [
  { name: "Wheat", price: 165, location: "Jaipur", arrivals: 5000 },
  { name: "Rice", price: 4850, location: "Delhi", arrivals: 2800 },
  { name: "Cotton", price: 7150, location: "Guntur", arrivals: 1200 },
  { name: "Sugarcane", price: 300, location: "Muzaffarnagar", arrivals: 8500 },
  { name: "Corn", price: 1850, location: "Nashik", arrivals: 3200 },
];

export default function MarketPrices() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter crops based on search query (crop name or location)
  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Always sort by price in descending order (highest to lowest)
  const sortedCrops = [...filteredCrops].sort((a, b) => b.price - a.price);

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

      {/* Search Bar */}
      <View style={{ padding: 15 }}>
        <TextInput
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 15,
            paddingVertical: 12,
            borderRadius: 10,
            fontSize: 16,
            borderWidth: 1,
            borderColor: '#ddd'
          }}
          placeholder="Search by crop or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
        {/* Results Count */}
        <Text style={{ 
          marginBottom: 10, 
          color: '#666', 
          fontSize: 14,
          textAlign: 'center'
        }}>
          {sortedCrops.length} crop(s) found
          {searchQuery && ` for "${searchQuery}"`}
          {' • Sorted by Price (High to Low)'}
        </Text>

        {/* Table Container */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 20
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
          {sortedCrops.length > 0 ? (
            sortedCrops.map((crop, index) => (
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
                  {crop.arrivals.toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            // No results message
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 16 }}>
                No crops found matching your search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}