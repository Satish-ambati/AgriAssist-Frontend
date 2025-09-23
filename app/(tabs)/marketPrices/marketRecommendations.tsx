import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface CropData {
  id: string;
  crop: string;
  price: number;
  change: number;
  unit: string;
}

interface VillageData {
  village: string;
  distance: number;
  crops: CropData[];
}

interface ApiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

// Replace with your API key
const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const API_BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Example mandi coordinates in Andhra Pradesh
const mandiLocations: { [key: string]: { lat: number; lng: number } } = {
  "Vijayawada": { lat: 16.5062, lng: 80.6480 },
  "Guntur": { lat: 16.3067, lng: 80.4365 },
  "Tenali": { lat: 16.2430, lng: 80.6400 },
  "Tadepalle": { lat: 16.4890, lng: 80.4690 },
  "Mangalagiri": { lat: 16.4470, lng: 80.5530 },
  "Nandyal": { lat: 15.4821, lng: 78.4833 },
  "Krishna": { lat: 16.2730, lng: 80.4210 },
  "Nellore": { lat: 14.4426, lng: 79.9865 },
  "Atmakur(SPS)": { lat: 14.4170, lng: 79.9050 },
  "Rapur": { lat: 14.3167, lng: 79.8333 },
};

// Haversine formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function PricesScreen() {
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // User location (replace with actual location from GPS)
  const userLocation = { lat: 16.5062, lng: 80.6480 }; // Example: Vijayawada

  const getYesterdayDate = (): string => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  const fetchCropData = async (cropName: string) => {
    setLoading(true);
    try {
      // Today's data
      const todayUrl = `${API_BASE_URL}?api-key=${API_KEY}&format=json&filters[commodity]=${encodeURIComponent(
        cropName
      )}&filters[state]=Andhra Pradesh&limit=50`;

      const todayRes = await fetch(todayUrl);
      const todayData: { records: ApiRecord[] } = await todayRes.json();

      // Yesterday's data
      const yesterdayUrl = `${API_BASE_URL}?api-key=${API_KEY}&format=json&filters[commodity]=${encodeURIComponent(
        cropName
      )}&filters[state]=Andhra Pradesh&filters[arrival_date]=${getYesterdayDate()}&limit=50`;

      const yesterdayRes = await fetch(yesterdayUrl);
      const yesterdayData: { records: ApiRecord[] } = await yesterdayRes.json();

      if (todayData.records.length > 0) {
        const yesterdayMap = new Map<string, number>();
        yesterdayData.records.forEach((rec) => {
          const key = `${rec.market}-${rec.variety}`;
          yesterdayMap.set(key, parseFloat(rec.modal_price) || 0);
        });

        // Group by market
        const marketMap = new Map<string, CropData[]>();
        todayData.records.forEach((rec, idx) => {
          const modalPrice = parseFloat(rec.modal_price) || 0;
          const key = `${rec.market}-${rec.variety}`;
          const yesterdayPrice = yesterdayMap.get(key) || modalPrice;
          const priceChange = modalPrice - yesterdayPrice;

          if (!marketMap.has(rec.market)) marketMap.set(rec.market, []);

          marketMap.get(rec.market)?.push({
            id: `${rec.market}-${idx}`,
            crop: `${rec.commodity} (${rec.variety})`,
            price: modalPrice,
            change: priceChange,
            unit: "per quintal",
          });
        });

        // Convert to VillageData with real distances
        const villageData: VillageData[] = Array.from(marketMap.entries()).map(
          ([market, crops]) => {
            const mandi = mandiLocations[market];
            const distance = mandi
              ? getDistance(userLocation.lat, userLocation.lng, mandi.lat, mandi.lng)
              : Math.floor(Math.random() * 30) + 5; // fallback
            return { village: market, distance: Math.round(distance), crops };
          }
        );

        // Sort by distance
        setVillages(villageData.sort((a, b) => a.distance - b.distance));
      } else {
        setVillages([]);
        Alert.alert("No Data", `No prices found for ${cropName}.`);
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      Alert.alert("Error", "Failed to fetch prices. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) {
      Alert.alert("Enter crop name", "Example: Rice, Cotton, Wheat");
      return;
    }
    setHasSearched(true);
    fetchCropData(search.trim());
  };

  const renderVillageItem = ({ item }: { item: VillageData }) => (
    <View className="mb-6 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <View className="bg-emerald-700 px-5 py-4">
        <Text className="text-white text-xl font-bold">{item.village} Market</Text>
        <Text className="text-green-100 text-sm mt-1">📍 {item.distance} km away</Text>
      </View>

      <View className="flex-row justify-between bg-green-100 px-4 py-3">
        <Text className="w-1/3 font-bold">Crop</Text>
        <Text className="w-1/3 font-bold text-center">Price (₹)</Text>
        <Text className="w-1/3 font-bold text-right">Change</Text>
      </View>

      {item.crops.map((crop) => (
        <View
          key={crop.id}
          className="flex-row justify-between px-4 py-4 border-b border-gray-100"
        >
          <View className="w-1/3">
            <Text className="font-semibold">{crop.crop}</Text>
            <Text className="text-gray-500 text-sm">{crop.unit}</Text>
          </View>
          <View className="w-1/3 items-center">
            <Text className="font-bold text-lg">{crop.price.toLocaleString()}</Text>
          </View>
          <View className="w-1/3 items-end">
            <View
              className={`px-3 py-2 rounded-full ${crop.change >= 0 ? "bg-green-100" : "bg-red-100"}`}
            >
              <Text className={`font-bold text-sm ${crop.change >= 0 ? "text-green-700" : "text-red-700"}`}>
                {crop.change >= 0 ? "+" : ""}₹{crop.change}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm">
        <StatusBar barStyle="dark-content" />
        <Text className="text-3xl font-bold text-emerald-700">Market Prices</Text>
        <Text className="text-gray-600">Live mandi prices from Govt sources</Text>
      </View>

      <View className="bg-white px-6 py-4 shadow-sm flex-row gap-3">
        <TextInput
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
          placeholder="Enter crop name (e.g., Rice)"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          className="bg-emerald-600 px-6 py-4 rounded-xl items-center justify-center"
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Search</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={villages}
        keyExtractor={(item) => item.village}
        renderItem={renderVillageItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white rounded-2xl p-8 items-center shadow-xl">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="mt-4">Fetching live prices...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
