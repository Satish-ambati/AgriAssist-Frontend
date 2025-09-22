// // PricesScreen.tsx
// import React, { useState } from "react";
// import { FlatList, Text, TextInput, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// const villageData = [
//   {
//     village: "Velagaleru",
//     distance: 15,
//     crops: [
//       { id: "1", crop: "Rice", price: 2150, change: 50 },
//       { id: "2", crop: "Maize", price: 1850, change: -25 },
//     ],
//   },
//   {
//     village: "Tadepalle",
//     distance: 6,
//     crops: [
//       { id: "3", crop: "Rice", price: 2200, change: 40 },
//       { id: "4", crop: "Cotton", price: 5100, change: 80 },
//     ],
//   },
//   {
//     village: "Mangalagiri",
//     distance: 15,
//     crops: [
//       { id: "5", crop: "Cotton", price: 5200, change: 100 },
//       { id: "6", crop: "Maize", price: 1900, change: -10 },
//       { id: "7", crop: "Wheat", price: 3000, change: -20 },
//     ],
//   },
//   {
//     village: "Vuyyuru",
//     distance: 30,
//     crops: [
//       { id: "8", crop: "Rice", price: 2100, change: 15 },
//       { id: "9", crop: "Wheat", price: 3050, change: -30 },
//     ],
//   },
 
// ];

// export default function PricesScreen() {
//   const [search, setSearch] = useState("");

//   // Filter crops inside each village based on search
//   const filteredVillages = villageData.map((village) => ({
//     ...village,
//     crops:
//       search.trim() === ""
//         ? village.crops
//         : village.crops.filter((c) =>
//             c.crop.toLowerCase().includes(search.toLowerCase())
//           ),
//   }));

//   return (
//     <SafeAreaView className="flex-1 bg-white p-4">
//       {/* Title */}
//       <Text className="text-xl font-bold text-green-700 mb-4">
//         Crop Prices Near You
//       </Text>

//       {/* Search Bar */}
//       <TextInput
//         className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
//         placeholder="Search crop (e.g., Rice)"
//         value={search}
//         onChangeText={setSearch}
//       />

//       {/* Village-wise tables */}
//       <FlatList
//         data={filteredVillages}
//         keyExtractor={(item) => item.village}
//         renderItem={({ item }) =>
//           item.crops.length > 0 ? (
//             <View className="mb-6">
//               {/* Village Title */}
//               <Text className="text-lg font-semibold text-green-600 mb-2">
//                 {item.village} Mandi ({item.distance} km)
//               </Text>
//               {/* Table Header */}
//               <View className="flex-row justify-between bg-green-600 rounded-t-lg p-2">
//                 <Text className="w-1/3 text-white font-semibold">Crop</Text>
//                 <Text className="w-1/3 text-white font-semibold text-center">
//                   Price
//                 </Text>
//                 <Text className="w-1/3 text-white font-semibold text-right">
//                   Change
//                 </Text>
//               </View>

//               {/* Table Rows */}
//               {item.crops.map((crop, index) => (
//                 <View
//                   key={crop.id}
//                   className={`flex-row justify-between p-2 ${
//                     index % 2 === 0 ? "bg-green-50" : "bg-white"
//                   }`}
//                 >
//                   {/* Crop */}
//                   <Text className="w-1/3 text-gray-800">{crop.crop}</Text>

//                   {/* Price */}
//                   <Text className="w-1/3 text-gray-800 text-center">
//                     ₹{crop.price}
//                   </Text>

//                   {/* Change */}
//                   <Text
//                     className={`w-1/3 text-right font-medium ${
//                       crop.change >= 0 ? "text-green-600" : "text-red-600"
//                     }`}
//                   >
//                     {crop.change >= 0
//                       ? `+₹${crop.change} ↑`
//                       : `-₹${Math.abs(crop.change)} ↓`}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           ) : null
//         }
//         ListEmptyComponent={
//           <Text className="text-gray-500 text-center mt-6">
//             No crops found
//           </Text>
//         }
//       />
//     </SafeAreaView>
//   );
// }
// PricesScreen.tsx
import React, { useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const villageData = [
  {
    village: "Velagaleru",
    distance: 15,
    crops: [
      { id: "1", crop: "Rice", price: 2150, change: 50 },
      { id: "2", crop: "Maize", price: 1850, change: -25 },
    ],
  },
  {
    village: "Tadepalle",
    distance: 6,
    crops: [
      { id: "3", crop: "Rice", price: 2200, change: 40 },
      { id: "4", crop: "Cotton", price: 5100, change: 80 },
    ],
  },
  {
    village: "Mangalagiri",
    distance: 15,
    crops: [
      { id: "5", crop: "Cotton", price: 5200, change: 100 },
      { id: "6", crop: "Maize", price: 1900, change: -10 },
      { id: "7", crop: "Wheat", price: 3000, change: -20 },
    ],
  },
  {
    village: "Vuyyuru",
    distance: 30,
    crops: [
      { id: "8", crop: "Rice", price: 2100, change: 15 },
      { id: "9", crop: "Wheat", price: 3050, change: -30 },
    ],
  },
];

export default function PricesScreen() {
  const [search, setSearch] = useState("");

  // Filter crops inside each village based on search
  const filteredVillages= villageData.map((village) => ({
    ...village,
    crops:
      search.trim() === ""
        ? village.crops
        : village.crops.filter((c) =>
            c.crop.toLowerCase().includes(search.toLowerCase())
          ),
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm">
        <Text className="text-3xl font-bold text-emerald-700 mb-1">
           Market Prices
        </Text>
        <Text className="text-gray-600 text-base">
          Live crop prices from nearby mandis
        </Text>
      </View>

      {/* Search Section */}
      <View className="bg-white px-6 py-4 mb-4 shadow-sm">
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 text-base"
          placeholder="Search crops (e.g., Rice, Cotton, Wheat)"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Village-wise tables */}
      <FlatList
        data={filteredVillages}
        keyExtractor={(item) => item.village}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) =>
          item.crops.length > 0 ? (
            <View className="mb-6 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Village Header */}
              <View className="bg-emerald-700 px-5 py-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-xl font-bold">
                      {item.village} Mandi
                    </Text>
                    <Text className="text-green-100 text-sm mt-1">
                      📍 {item.distance} km away
                    </Text>
                  </View>
                  <View className="bg-emerald-500 rounded-full px-3 py-2">
                    <Text className="text-white text-sm font-semibold">
                      {item.crops.length} crops
                    </Text>
                  </View>
                </View>
              </View>

              {/* Table Header */}
              <View className="flex-row justify-between bg-green-100 px-4 py-3">
                <Text className="w-1/3 text-black font-bold text-base">
                  Crop
                </Text>
                <Text className="w-1/3 text-black font-bold text-center text-base">
                  Price (₹)
                </Text>
                <Text className="w-1/3 text-black font-bold text-right text-base">
                  Change
                </Text>
              </View>

              {/* Table Rows */}
              {item.crops.map((crop, index) => (
                <View
                  key={crop.id}
                  className={`flex-row justify-between px-4 py-4 border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {/* Crop */}
                  <View className="w-1/3">
                    <Text className="text-gray-900 font-semibold text-base">
                      {crop.crop}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      per quintal
                    </Text>
                  </View>

                  {/* Price */}
                  <View className="w-1/3 items-center">
                    <Text className="text-gray-900 font-bold text-lg">
                      {crop.price.toLocaleString()}
                    </Text>
                  </View>

                  {/* Change */}
                  <View className="w-1/3 items-end">
                    <View
                      className={`px-3 py-2 rounded-full ${
                        crop.change >= 0 ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`font-bold text-sm ${
                          crop.change >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {crop.change >= 0 ? "+" : ""}₹{crop.change}
                      </Text>
                    </View>
                    <Text
                      className={`text-xs mt-1 font-medium ${
                        crop.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {crop.change >= 0 ? "↗ Rising" : "↘ Falling"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Text className="text-5xl"></Text>
            </View>
            <Text className="text-gray-600 text-xl font-semibold mb-2 text-center">
              No crops found
            </Text>
            <Text className="text-gray-500 text-center text-base px-8">
              Try searching for different crop names like Rice, Cotton, or Wheat
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
