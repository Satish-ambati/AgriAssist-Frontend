import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StatusBar,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
};

const MandiPrices = () => {
  const [data, setData] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Multi-field search states
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');
  const [commodity, setCommodity] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_KEY="579b464db66ec23bdd000001e8b0d32cc3a2458566065d487dc51d8a"
  const RESOURCE_ID="9ef84268-d588-465a-a308-a864a43d0070"


  const formatValue = (value: any) => (value ? value : '—');

  // Build API URL with multiple filters
  const buildUrl = () => {
    let url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=1000`;

    if (state.trim()) {
      url += `&filters[state]=${encodeURIComponent(state.trim())}`;
    }
    if (district.trim()) {
      url += `&filters[district]=${encodeURIComponent(district.trim())}`;
    }
    if (market.trim()) {
      url += `&filters[market]=${encodeURIComponent(market.trim())}`;
    }
    if (commodity.trim()) {
      url += `&filters[commodity]=${encodeURIComponent(commodity.trim())}`;
    }

    return url;
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const url = buildUrl();
      console.log('API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}. Please try again.`);
      }


      const json = await response.json();

      if (!json.records || !Array.isArray(json.records)) {
        throw new Error('No data available. Please try different search terms.');
      }

      if (json.records.length === 0) {
        setData([]);
        setErrorMessage('No results found for your search.');
        return;
      }

      // Sort by latest date
      const sorted = [...json.records].sort((a, b) => {
        try {
          const [dA, mA, yA] = a.arrival_date.split('/');
          const [dB, mB, yB] = b.arrival_date.split('/');
          const dateA = new Date(`${yA}-${mA}-${dA}`).getTime();
          const dateB = new Date(`${yB}-${mB}-${dB}`).getTime();
          return dateB - dateA;
        } catch {
          return 0;
        }
      });

      setData(sorted);
      setErrorMessage(null);
    } catch (error: any) {
      console.log('Fetch error:', error);

      let userMessage = 'Unable to fetch data. ';

      if (error.message.includes('Network request failed')) {
        userMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        userMessage += 'Request timed out. Server might be slow, please try again.';
      } else if (error.message.includes('Server returned')) {
        userMessage += error.message;
      } else if (error.message.includes('No data available')) {
        userMessage = error.message;
      } else {
        userMessage += 'Something went wrong. Please try again later.';
      }

      setErrorMessage(userMessage);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const clearAllFilters = () => {
    setState('');
    setDistrict('');
    setMarket('');
    setCommodity('');
    setData([]);
    setErrorMessage(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {/* Header */}
      <View 
      style={{
          backgroundColor: "#16a34a",
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
        >

        {/* Top Row */}
        <View className="flex-row items-center justify-between">
          {/* Left */}
          <View className="flex-row items-center gap-3">
            <View className="bg-white/20 p-2.5 rounded-full">
              <Icon name="agriculture" size={28} color="#fff" />
            </View>

            <View className="gap-0.5">
              <Text className="text-3xl text-white font-extrabold tracking-tight">
                Mandi Prices
              </Text>
              <Text className="text-green-100 text-sm">Live Market Rates</Text>
            </View>
          </View>

          {/* Toggle Button */}
          <TouchableOpacity
            onPress={() => setIsOpen(!isOpen)}
            className="bg-white/20 p-3 rounded-full"
          >
            <Icon 
              name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={26} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        {/* Collapsible Search Section */}
        {isOpen && (
          <View className="gap-3 mt-5">

            {/* State */}
            <View className="bg-white rounded-xl px-4 py-1 flex-row items-center shadow-sm gap-2">
              <Icon name="location-on" size={20} color="#16a34a" />
              <TextInput
                value={state}
                onChangeText={setState}
                className="flex-1 py-3 text-gray-800 text-base"
                placeholder="State (e.g., Andhra Pradesh)"
                placeholderTextColor="#9CA3AF"
              />
              {state.length > 0 && (
                <TouchableOpacity onPress={() => setState('')}>
                  <Icon name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* District */}
            <View className="bg-white rounded-xl px-4 py-1 flex-row items-center shadow-sm gap-2">
              <Icon name="place" size={20} color="#16a34a" />
              <TextInput
                value={district}
                onChangeText={setDistrict}
                className="flex-1 py-3 text-gray-800 text-base"
                placeholder="District (e.g., Visakhapatnam)"
                placeholderTextColor="#9CA3AF"
              />
              {district.length > 0 && (
                <TouchableOpacity onPress={() => setDistrict('')}>
                  <Icon name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Market */}
            <View className="bg-white rounded-xl px-4 py-1 flex-row items-center shadow-sm gap-2">
              <Icon name="store" size={20} color="#16a34a" />
              <TextInput
                value={market}
                onChangeText={setMarket}
                className="flex-1 py-3 text-gray-800 text-base"
                placeholder="Market (e.g., Rythu Bazaar)"
                placeholderTextColor="#9CA3AF"
              />
              {market.length > 0 && (
                <TouchableOpacity onPress={() => setMarket('')}>
                  <Icon name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Commodity */}
            <View className="bg-white rounded-xl px-4 py-1 flex-row items-center shadow-sm gap-2">
              <Icon name="eco" size={20} color="#16a34a" />
              <TextInput
                value={commodity}
                onChangeText={setCommodity}
                className="flex-1 py-3 text-gray-800 text-base"
                placeholder="Commodity (e.g., Tomato)"
                placeholderTextColor="#9CA3AF"
              />
              {commodity.length > 0 && (
                <TouchableOpacity onPress={() => setCommodity('')}>
                  <Icon name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3 mt-1">
              <TouchableOpacity
                onPress={fetchData}
                className="flex-1 bg-white py-3.5 rounded-xl flex-row justify-center items-center shadow-sm gap-2"
              >
                <Icon name="search" size={22} color="#16a34a" />
                <Text className="text-green-600 font-semibold text-base">
                  Search
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clearAllFilters}
                className="bg-white/20 py-3.5 px-5 rounded-xl flex-row justify-center items-center gap-2"
              >
                <Icon name="clear-all" size={22} color="#fff" />
                <Text className="text-white font-semibold text-base">
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </View>



      {/* Error Message */}
      {errorMessage && (
        <View className="mx-5 mt-4 bg-red-50 border border-red-200 p-4 rounded-xl flex-row">
          <Icon name="error-outline" size={24} color="#DC2626" />
          <View className="flex-1 ml-3">
            <Text className="text-red-700 font-semibold">Error</Text>
            <Text className="text-red-600 mt-1">{errorMessage}</Text>
          </View>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-600 mt-4 font-medium">Fetching market data...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && !errorMessage && (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-gray-100 p-5 rounded-full mb-4">
            <Icon name="search-off" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-gray-600 text-center text-lg font-medium">
            No results found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Try searching with state, district, market or commodity
          </Text>
        </View>
      )}

      {/* Results List */}
      {!loading && data.length > 0 && (
        <View className="flex-1">
          {/* Results Header */}
          <View className="px-5 py-3 bg-white border-b border-gray-200">
            <Text className="text-gray-700 font-semibold">
              Found {data.length} result{data.length !== 1 ? 's' : ''}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Sorted by latest arrival date
            </Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={(_, idx) => String(idx)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#16a34a']}
                tintColor="#16a34a"
              />
            }
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <View className="bg-green-50 px-4 py-3 border-b border-green-100">
                  <Text className="text-xl font-bold text-gray-900">
                    {formatValue(item.commodity)}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Icon name="place" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-1">
                      {formatValue(item.market)}, {formatValue(item.district)}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs mt-1">
                    {formatValue(item.state)}
                  </Text>
                </View>

                {/* Content */}
                <View className="px-4 py-4">
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center mb-1">
                        <Icon name="category" size={14} color="#9CA3AF" />
                        <Text className="text-gray-500 text-xs ml-1 font-medium">VARIETY</Text>
                      </View>
                      <Text className="text-gray-800 font-medium">
                        {formatValue(item.variety)}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Icon name="grade" size={14} color="#9CA3AF" />
                        <Text className="text-gray-500 text-xs ml-1 font-medium">GRADE</Text>
                      </View>
                      <Text className="text-gray-800 font-medium">
                        {formatValue(item.grade)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <Icon name="event" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs ml-1 font-medium">ARRIVAL DATE</Text>
                    <Text className="text-gray-800 font-medium ml-2">
                      {formatValue(item.arrival_date)}
                    </Text>
                  </View>

                  {/* Price Section */}
                  <View className="bg-green-50 rounded-xl p-4 mt-2">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-green-700 text-xs font-semibold mb-1">
                          MODAL PRICE
                        </Text>
                        <Text className="text-green-900 font-bold text-2xl">
                          ₹{formatValue(item.modal_price)}
                        </Text>
                        <Text className="text-green-600 text-xs mt-1">per quintal</Text>
                      </View>

                      <View className="items-end">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-gray-500 text-xs mr-2">Min</Text>
                          <Text className="text-gray-800 font-semibold">
                            ₹{formatValue(item.min_price)}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-gray-500 text-xs mr-2">Max</Text>
                          <Text className="text-gray-800 font-semibold">
                            ₹{formatValue(item.max_price)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default MandiPrices;