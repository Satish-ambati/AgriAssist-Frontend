
// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity,Modal,Image } from "react-native";
// import {useLocalSearchParams, useRouter} from "expo-router"
// export default function DiseaseResult() {
//   const router=useRouter();
//   const params=useLocalSearchParams();
//   const images:string[]=params.images?JSON.parse(params.images as string):[];
//     const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [expanded, setExpanded] = useState({
//     treatment: false,
//     preventive: false,
//     forecast: false,
//   });

//   // Static Data
//   const aiAnalysis = {
//     detectedDisease: {
//       name: "Late Blight",
//       scientificName: "Phytophthora infestans",
//       confidence: 0.92,
//       severity: "Medium",
//     },
//     recommendations: {
//       treatment: [
//         {
//           method: "Spray",
//           product: "Copper Fungicide",
//           dosage: "2g/L",
//           applicationMethod: "Foliar spray",
//           timingInstructions: "Once every 7 days",
//           precautions: [
//             "Wear gloves",
//             "Avoid contact with skin",
//             "Do not inhale spray",
//           ],
//         },
//       ],
      
//       preventiveMeasures: [
//         "Ensure proper spacing",
//         "Keep field dry",
//         "Regular monitoring",
//       ],
//       followUpDays: 7,
//     },
//     diseaseRiskPercent: 68,
//   };

//   const weatherRisk = {
//     description:
//       "High humidity and frequent rainfall predicted; fungal diseases likely",
//     riskLevel: "High",
//   };

//   return (
//     <ScrollView className="flex-1 bg-emerald-50">
//       <View className="p-4">
//         <TouchableOpacity onPress={()=>router.back()} className="mb-4 bg-emrald-200 rounded-lg p-2 w-28">
//                     <Text className="text-center text-emerald-900 font-bold">← Back</Text>
//         </TouchableOpacity>
//         {/* Header */}
//         <View className="items-center mb-6">
//           <Text className="text-2xl font-bold text-emerald-900">
//             Disease Analysis
//           </Text>
//         </View>
//             {/* 📸 Scanned Images */}
//         {images.length > 0 && (
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             className="bg-white rounded-xl p-4 mb-4 border border-emerald-200"
//           >
//             {images.map((uri, idx) => (
//               <TouchableOpacity key={idx} onPress={() => setPreviewImage(uri)}>
//                 <Image
//                   source={{ uri }}
//                   className="w-32 h-32 mr-3 rounded-lg border-2 border-green-400"
//                 />
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         )}

//         {/* Disease Detection */}
//         <View className="bg-white rounded-xl p-4 mb-4 border border-emerald-200">
//           <Text className="text-xl font-bold text-emerald-900">
//             Detection Results
//           </Text>
//           <Text className="mt-2 text-lg font-semibold text-gray-800">
//             {aiAnalysis.detectedDisease.name}
//           </Text>
//           <Text className="italic text-gray-500 mb-2">
//             {aiAnalysis.detectedDisease.scientificName}
//           </Text>
//           <Text className="text-gray-600">
//             Confidence: {(aiAnalysis.detectedDisease.confidence * 100).toFixed(1)}%
//           </Text>
//           <Text className="mt-1 font-semibold text-orange-500">
//             Severity: {aiAnalysis.detectedDisease.severity}
//           </Text>
//         </View>

//         {/* Treatment Plan */}
//         <TouchableOpacity
//           onPress={() =>
//             setExpanded({ ...expanded, treatment: !expanded.treatment })
//           }
//         >
//           <View className="bg-green-100 rounded-xl p-4 mb-4">
//             <Text className="text-lg font-bold text-green-800">
//               Treatment Plan {expanded.treatment ? "▲" : "▼"}
//             </Text>
//             {expanded.treatment && (
//               <View className="mt-3">
//                 {aiAnalysis.recommendations.treatment.map((treat, idx) => (
//                   <View
//                     key={idx}
//                     className="bg-white p-3 rounded-lg mb-3 border border-blue-200"
//                   >
//                     <Text>Method: {treat.method}</Text>
//                     <Text>Product: {treat.product}</Text>
//                     <Text>Dosage: {treat.dosage}</Text>
//                     <Text>Timing: {treat.timingInstructions}</Text>
//                     <Text className="font-semibold mt-2">Precautions:</Text>
//                     {treat.precautions.map((p, i) => (
//                       <Text key={i}>- {p}</Text>
//                     ))}
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>

//         {/* Preventive Measures */}
//         <TouchableOpacity
//           onPress={() =>
//             setExpanded({ ...expanded, preventive: !expanded.preventive })
//           }
//         >
//           <View className="bg-green-100 rounded-xl p-4 mb-4">
//             <Text className="text-lg font-bold text-green-800">
//               Preventive Measures {expanded.preventive ? "▲" : "▼"}
//             </Text>
//             {expanded.preventive && (
//               <View className="mt-3">
//                 {aiAnalysis.recommendations.preventiveMeasures.map((m, idx) => (
//                   <Text key={idx}>- {m}</Text>
//                 ))}
//                 <Text className="mt-2 font-bold text-amber-700">
//                   Follow-up: {aiAnalysis.recommendations.followUpDays} days
//                 </Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>

//         {/* Disease Forecast */}
//         <TouchableOpacity
//           onPress={() =>
//             setExpanded({ ...expanded, forecast: !expanded.forecast })
//           }
//         >
//           <View className="bg-green-100 rounded-xl p-4 mb-4">

//             <Text className="text-lg font-bold text-green-800">
//               Disease Forecast {expanded.forecast ? "▲" : "▼"}
//             </Text>
//             {expanded.forecast && (
//               <View className="mt-3 items-center">
//                 <Text className="text-3xl font-bold text-green-600">
//                   {aiAnalysis.diseaseRiskPercent}%
//                 </Text>
//                 <Text className="text-gray-600">
//                   Disease Risk (7-14 day forecast)
//                 </Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>

//         {/* Weather Risk */}
//         <View className="bg-white rounded-xl p-4 border border-gray-300">
//           <Text className="text-lg font-bold text-slate-800">
//             Weather Analysis
//           </Text>
//           <Text className="mt-2 text-gray-600">{weatherRisk.description}</Text>
//           <Text className="mt-2 font-bold text-red-600">
//             Risk Level: {weatherRisk.riskLevel}
//           </Text>
//         </View>
//       </View>
//        <Modal visible={!!previewImage} transparent animationType="fade">
//         <View className="flex-1 bg-black justify-center items-center">
//           <Image
//             source={{ uri: previewImage || "" }}
//             className="w-full h-[80%] resize-contain"
//           />
//           <TouchableOpacity
//             onPress={() => setPreviewImage(null)}
//             className="absolute top-12 right-5 bg-red-600 p-2 rounded-full"
//           >
//             <Text className="text-white text-lg">✕</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }


// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, Modal, Image, Dimensions } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";

// // Get screen height for better modal sizing
// const { height } = Dimensions.get('window');

// export default function DiseaseResult() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   // Safely parse the images array from local search params
//   const images: string[] = params.images ? JSON.parse(params.images as string) : [];

//   const [previewImage, setPreviewImage] = useState<string | null>(null);

//   // Static Data (Kept the original structure)
//   const aiAnalysis = {
//     detectedDisease: {
//       name: "Late Blight",
//       scientificName: "Phytophthora infestans",
//       confidence: 0.92,
//       severity: "Medium",
//     },
//     recommendations: {
//       treatment: [
//         {
//           method: "Spray",
//           product: "Copper Fungicide",
//           dosage: "2g/L",
//           applicationMethod: "Foliar spray",
//           timingInstructions: "Once every 7 days",
//           precautions: [
//             "Wear gloves",
//             "Avoid contact with skin",
//             "Do not inhale spray",
//           ],
//         },
//       ],
//       preventiveMeasures: [
//         "Ensure proper spacing",
//         "Keep field dry",
//         "Regular monitoring",
//         "Improve soil drainage to reduce humidity.",
//       ],
//       followUpDays: 7,
//     },
//     diseaseRiskPercent: 68,
//   };

//   const weatherRisk = {
//     description:
//       "High humidity and frequent rainfall predicted; conditions are highly favorable for fungal diseases.",
//     riskLevel: "High",
//   };

//   // Helper function to get text color based on severity/risk
//   const getColorForSeverity = (level: string) => {
//     switch (level.toLowerCase()) {
//       case 'high':
//         return 'text-red-600';
//       case 'medium':
//         return 'text-orange-500';
//       case 'low':
//         return 'text-green-600';
//       default:
//         return 'text-gray-700';
//     }
//   };

//   return (
//     <ScrollView className="flex-1 bg-emerald-50">
//       <View className="p-5">
        
//         {/* Back Button */}
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="mb-8 bg-emerald-600 rounded-full p-2 w-24 shadow-md shadow-emerald-700/50"
//         >
//           <Text className="text-center text-white font-bold text-sm">← Back</Text>
//         </TouchableOpacity>

//         {/* Header */}
//         <View className="items-center mb-8">
//           <Text className="text-3xl font-extrabold text-emerald-900">
//             Disease Analysis Report
//           </Text>
//           <Text className="text-base text-gray-500 mt-1">Immediate Action Required</Text>
//         </View>

//         {/* --- Scanned Images --- */}
//         {images.length > 0 && (
//           <View className="mb-6">
//             <Text className="text-xl font-bold text-emerald-800 mb-3">
//               Scanned Images
//             </Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               className="py-2"
//             >
//               {images.map((uri, idx) => (
//                 <TouchableOpacity key={idx} onPress={() => setPreviewImage(uri)} className="shadow-lg mr-4">
//                   <Image
//                     source={{ uri }}
//                     className="w-32 h-32 rounded-xl border-4 border-emerald-400"
//                   />
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {/* --- Detection Results --- */}
//         <View className="bg-white rounded-xl p-5 mb-6 shadow-xl border-l-8 border-emerald-500">
//           <Text className="text-xl font-extrabold text-emerald-800 mb-3">
//             Detection Results
//           </Text>
          
//           <View className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
//             <Text className="text-2xl font-black text-gray-900">
//               {aiAnalysis.detectedDisease.name}
//             </Text>
//             <Text className="italic text-base text-gray-500 mb-3">
//               ({aiAnalysis.detectedDisease.scientificName})
//             </Text>
            
//             <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-emerald-100">
//               <Text className="text-base text-gray-600">Confidence:</Text>
//               <Text className="text-base font-bold text-blue-600">
//                 {(aiAnalysis.detectedDisease.confidence * 100).toFixed(1)}%
//               </Text>
//             </View>

//             <View className="flex-row justify-between items-center mt-1">
//               <Text className="text-base text-gray-600">Severity:</Text>
//               <Text className={`text-xl font-extrabold ${getColorForSeverity(aiAnalysis.detectedDisease.severity)}`}>
//                 {aiAnalysis.detectedDisease.severity}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* --- Treatment Plan --- */}
//         <View className="bg-white rounded-xl p-5 mb-6 shadow-xl border-l-8 border-blue-500">
//           <Text className="text-xl font-extrabold text-blue-800 mb-4">
//             Recommended Treatment Plan
//           </Text>
//           {aiAnalysis.recommendations.treatment.map((treat, idx) => (
//             <View
//               key={idx}
//               className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200"
//             >
//               <Text className="text-lg font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
//                 {treat.product} - {treat.method}
//               </Text>
//               <Text className="text-gray-700"><Text className="font-semibold">Dosage:</Text> {treat.dosage}</Text>
//               <Text className="text-gray-700"><Text className="font-semibold">Application:</Text> {treat.applicationMethod}</Text>
//               <Text className="text-gray-700 mb-3"><Text className="font-semibold">Timing:</Text> {treat.timingInstructions}</Text>
              
//               <Text className="font-bold text-red-600">Precautions:</Text>
//               {treat.precautions.map((p, i) => (
//                 <Text key={i} className="text-sm text-red-500">- {p}</Text>
//               ))}
//             </View>
//           ))}
//         </View>

//         {/* --- Preventive Measures --- */}
//         <View className="bg-white rounded-xl p-5 mb-6 shadow-xl border-l-8 border-orange-500">
//           <Text className="text-xl font-extrabold text-orange-800 mb-3">
//             Preventive Measures
//           </Text>
//           <View className="mt-3">
//             {aiAnalysis.recommendations.preventiveMeasures.map((m, idx) => (
//               <Text key={idx} className="text-gray-700 mb-2">
//                 • {m}
//               </Text>
//             ))}
//             <View className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
//               <Text className="font-extrabold text-lg text-orange-700">
//                 Next Follow-up:
//                 <Text className="text-xl"> {aiAnalysis.recommendations.followUpDays} days</Text>
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* --- Forecast and Weather Container (Flex Row) --- */}
//         <View className="flex-row mb-6">
//             {/* Disease Forecast (50% width) */}
//             <View className="flex-1 bg-white rounded-xl p-4 mr-3 shadow-xl border-t-4 border-purple-500">
//                 <Text className="text-lg font-bold text-purple-800 mb-3 text-center">
//                     Disease Risk Forecast
//                 </Text>
//                 <View className="items-center mt-2">
//                     <Text className="text-5xl font-extrabold text-purple-600">
//                         {aiAnalysis.diseaseRiskPercent}%
//                     </Text>
//                     <Text className="text-sm text-gray-500 text-center mt-1">
//                         (7-14 day outlook)
//                     </Text>
//                 </View>
//             </View>

//             {/* Weather Risk (50% width) */}
//             <View className="flex-1 bg-white rounded-xl p-4 ml-3 shadow-xl border-t-4 border-red-500">
//                 <Text className="text-lg font-bold text-red-800 mb-3 text-center">
//                     Weather Impact
//                 </Text>
//                 <Text className="mt-2 text-sm text-gray-600 text-center">
//                     {weatherRisk.description}
//                 </Text>
//                 <View className="items-center mt-3">
//                     <Text className="text-base font-bold text-gray-700">Risk Level:</Text>
//                     <Text className={`text-2xl font-extrabold ${getColorForSeverity(weatherRisk.riskLevel)}`}>
//                         {weatherRisk.riskLevel}
//                     </Text>
//                 </View>
//             </View>
//         </View>
//       </View>

//       {/* Image Preview Modal */}
//       <Modal visible={!!previewImage} transparent animationType="fade">
//         <View className="flex-1 bg-black/90 justify-center items-center">
//           <Image
//             source={{ uri: previewImage || "" }}
//             style={{ width: '100%', height: height * 0.85, resizeMode: 'contain' }}
//           />
//           <TouchableOpacity
//             onPress={() => setPreviewImage(null)}
//             className="absolute top-12 right-5 bg-red-600 p-2 rounded-full z-10 w-10 h-10 items-center justify-center shadow-lg"
//           >
//             <Text className="text-white text-xl font-bold">✕</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const { height } = Dimensions.get("window");

export default function DiseaseResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const images: string[] = params.images ? JSON.parse(params.images as string) : [];

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const aiAnalysis = {
    detectedDisease: {
      name: "Late Blight",
      scientificName: "Phytophthora infestans",
      confidence: 0.92,
      severity: "Medium",
    },
    recommendations: {
      treatment: [
        {
          method: "Spray",
          product: "Copper Fungicide",
          dosage: "2g/L",
          applicationMethod: "Foliar spray",
          timingInstructions: "Once every 7 days",
          precautions: [
            "Wear gloves",
            "Avoid contact with skin",
            "Do not inhale spray",
          ],
        },
      ],
      preventiveMeasures: [
        "Ensure proper spacing",
        "Keep field dry",
        "Regular monitoring",
        "Improve soil drainage to reduce humidity.",
      ],
      followUpDays: 7,
    },
    diseaseRiskPercent: 68,
  };

  const weatherRisk = {
    description:
      "High humidity and frequent rainfall predicted; conditions are highly favorable for fungal diseases.",
    riskLevel: "High",
  };

  const getColorForSeverity = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "text-green-800";
      case "medium":
        return "text-green-600";
      case "low":
        return "text-green-500";
      default:
        return "text-green-700";
    }
  };

  return (
    <ScrollView className="flex-1 bg-green-50">
      <View className="p-5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 bg-green-500 rounded-full p-2 w-24 shadow-md shadow-green-700/50"
        >
          <Text className="text-center text-white font-bold text-sm">← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-extrabold text-green-900">
            Disease Analysis Report
          </Text>
          {/* <Text className="text-base text-green-600 mt-1">Immediate Action Required</Text> */}
        </View>

        {/* Scanned Images */}
        {images.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-green-800 mb-3">Scanned Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              {images.map((uri, idx) => (
                <TouchableOpacity key={idx} onPress={() => setPreviewImage(uri)} className="shadow-lg mr-4">
                  <Image
                    source={{ uri }}
                    className="w-32 h-32 rounded-xl border-4 border-green-400"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Detection Results */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-xl border-l-8 border-green-500">
          <Text className="text-xl font-extrabold text-green-800 mb-3">Detection Results</Text>
          <View className="bg-green-50 p-3 rounded-lg border border-green-200">
            <Text className="text-2xl font-black text-green-900">
              {aiAnalysis.detectedDisease.name}
            </Text>
            <Text className="italic text-base text-green-600 mb-3">
              ({aiAnalysis.detectedDisease.scientificName})
            </Text>

            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-green-100">
              <Text className="text-base text-green-700">Confidence:</Text>
              <Text className="text-base font-bold text-green-700">
                {(aiAnalysis.detectedDisease.confidence * 100).toFixed(1)}%
              </Text>
            </View>

            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-base text-green-700">Severity:</Text>
              <Text
                className={`text-xl font-extrabold ${getColorForSeverity(
                  aiAnalysis.detectedDisease.severity
                )}`}
              >
                {aiAnalysis.detectedDisease.severity}
              </Text>
            </View>
          </View>
        </View>

        {/* Treatment Plan */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-xl border-l-8 border-green-500">
          <Text className="text-xl font-extrabold text-green-800 mb-4">
            Recommended Treatment Plan
          </Text>
          {aiAnalysis.recommendations.treatment.map((treat, idx) => (
            <View
              key={idx}
              className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200"
            >
              <Text className="text-lg font-bold text-green-900 mb-2 border-b border-green-200 pb-1">
                {treat.product} - {treat.method}
              </Text>
              <Text className="text-green-700">
                <Text className="font-semibold">Dosage:</Text> {treat.dosage}
              </Text>
              <Text className="text-green-700">
                <Text className="font-semibold">Application:</Text> {treat.applicationMethod}
              </Text>
              <Text className="text-green-700 mb-3">
                <Text className="font-semibold">Timing:</Text> {treat.timingInstructions}
              </Text>

              <Text className="font-bold text-green-800">Precautions:</Text>
              {treat.precautions.map((p, i) => (
                <Text key={i} className="text-sm text-green-700">
                  - {p}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Preventive Measures */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-xl border-l-8 border-green-500">
          <Text className="text-xl font-extrabold text-green-800 mb-3">
            Preventive Measures
          </Text>
          <View className="mt-3">
            {aiAnalysis.recommendations.preventiveMeasures.map((m, idx) => (
              <Text key={idx} className="text-green-700 mb-2">
                • {m}
              </Text>
            ))}
            <View className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <Text className="font-extrabold text-lg text-green-700">
                Next Follow-up:
                <Text className="text-xl"> {aiAnalysis.recommendations.followUpDays} days</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Forecast and Weather */}
        <View className="flex-row mb-6">
          {/* Disease Forecast */}
          <View className="flex-1 bg-white rounded-xl p-4 mr-3 shadow-xl border-t-4 border-green-500">
            <Text className="text-lg font-bold text-green-800 mb-3 text-center">
              Disease Risk Forecast
            </Text>
            <View className="items-center mt-2">
              <Text className="text-5xl font-extrabold text-green-700">
                {aiAnalysis.diseaseRiskPercent}%
              </Text>
              <Text className="text-sm text-green-600 text-center mt-1">
                (7-14 day outlook)
              </Text>
            </View>
          </View>

          {/* Weather Impact */}
          <View className="flex-1 bg-white rounded-xl p-4 ml-3 shadow-xl border-t-4 border-green-500">
            <Text className="text-lg font-bold text-green-800 mb-3 text-center">
              Weather Impact
            </Text>
            <Text className="mt-2 text-sm text-green-700 text-center">
              {weatherRisk.description}
            </Text>
            <View className="items-center mt-3">
              <Text className="text-base font-bold text-green-700">Risk Level:</Text>
              <Text
                className={`text-2xl font-extrabold ${getColorForSeverity(
                  weatherRisk.riskLevel
                )}`}
              >
                {weatherRisk.riskLevel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <Image
            source={{ uri: previewImage || "" }}
            style={{ width: "100%", height: height * 0.85, resizeMode: "contain" }}
          />
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            className="absolute top-12 right-5 bg-green-600 p-2 rounded-full z-10 w-10 h-10 items-center justify-center shadow-lg"
          >
            <Text className="text-white text-xl font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
