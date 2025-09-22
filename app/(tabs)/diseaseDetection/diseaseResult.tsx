
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {useRouter} from "expo-router"
export default function DiseaseResult() {
  const router=useRouter();
  const [expanded, setExpanded] = useState({
    treatment: false,
    preventive: false,
    forecast: false,
  });

  // Static Data
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
      ],
      followUpDays: 7,
    },
    diseaseRiskPercent: 68,
  };

  const weatherRisk = {
    description:
      "High humidity and frequent rainfall predicted; fungal diseases likely",
    riskLevel: "High",
  };

  return (
    <ScrollView className="flex-1 bg-emerald-50">
      <View className="p-4">
        <TouchableOpacity onPress={()=>router.back()} className="mb-4 bg-emrald-200 rounded-lg p-2 w-28">
                    <Text className="text-center text-emerald-900 font-bold">← Back</Text>
        </TouchableOpacity>
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-emerald-900">
            Disease Analysis
          </Text>
        </View>

        {/* Disease Detection */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-emerald-200">
          <Text className="text-xl font-bold text-emerald-900">
            Detection Results
          </Text>
          <Text className="mt-2 text-lg font-semibold text-gray-800">
            {aiAnalysis.detectedDisease.name}
          </Text>
          <Text className="italic text-gray-500 mb-2">
            {aiAnalysis.detectedDisease.scientificName}
          </Text>
          <Text className="text-gray-600">
            Confidence: {(aiAnalysis.detectedDisease.confidence * 100).toFixed(1)}%
          </Text>
          <Text className="mt-1 font-semibold text-orange-500">
            Severity: {aiAnalysis.detectedDisease.severity}
          </Text>
        </View>

        {/* Treatment Plan */}
        <TouchableOpacity
          onPress={() =>
            setExpanded({ ...expanded, treatment: !expanded.treatment })
          }
        >
          <View className="bg-green-100 rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold text-green-800">
              Treatment Plan {expanded.treatment ? "▲" : "▼"}
            </Text>
            {expanded.treatment && (
              <View className="mt-3">
                {aiAnalysis.recommendations.treatment.map((treat, idx) => (
                  <View
                    key={idx}
                    className="bg-white p-3 rounded-lg mb-3 border border-blue-200"
                  >
                    <Text>Method: {treat.method}</Text>
                    <Text>Product: {treat.product}</Text>
                    <Text>Dosage: {treat.dosage}</Text>
                    <Text>Timing: {treat.timingInstructions}</Text>
                    <Text className="font-semibold mt-2">Precautions:</Text>
                    {treat.precautions.map((p, i) => (
                      <Text key={i}>- {p}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Preventive Measures */}
        <TouchableOpacity
          onPress={() =>
            setExpanded({ ...expanded, preventive: !expanded.preventive })
          }
        >
          <View className="bg-green-100 rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold text-green-800">
              Preventive Measures {expanded.preventive ? "▲" : "▼"}
            </Text>
            {expanded.preventive && (
              <View className="mt-3">
                {aiAnalysis.recommendations.preventiveMeasures.map((m, idx) => (
                  <Text key={idx}>- {m}</Text>
                ))}
                <Text className="mt-2 font-bold text-amber-700">
                  Follow-up: {aiAnalysis.recommendations.followUpDays} days
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Disease Forecast */}
        <TouchableOpacity
          onPress={() =>
            setExpanded({ ...expanded, forecast: !expanded.forecast })
          }
        >
          <View className="bg-green-100 rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold text-green-800">
              Disease Forecast {expanded.forecast ? "▲" : "▼"}
            </Text>
            {expanded.forecast && (
              <View className="mt-3 items-center">
                <Text className="text-3xl font-bold text-green-600">
                  {aiAnalysis.diseaseRiskPercent}%
                </Text>
                <Text className="text-gray-600">
                  Disease Risk (7-14 day forecast)
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Weather Risk */}
        <View className="bg-white rounded-xl p-4 border border-gray-300">
          <Text className="text-lg font-bold text-slate-800">
            Weather Analysis
          </Text>
          <Text className="mt-2 text-gray-600">{weatherRisk.description}</Text>
          <Text className="mt-2 font-bold text-red-600">
            Risk Level: {weatherRisk.riskLevel}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
