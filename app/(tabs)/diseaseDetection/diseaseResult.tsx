import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Api, IP } from "@/app/api";
import * as SecureStore from "expo-secure-store";


export default function DiseaseResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const baseURL = `http://${IP}:8000/uploads/`;

  const images: string[] = params.results
    ? JSON.parse(params.results as string).images
    : [];
  const results: any[] = params.results
    ? JSON.parse(params.results as string).predictions
    : [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState({
    treatment: false,
    preventive: false,
    forecast: false,
  });

  const [loadingPlan, setLoadingPlan] = useState(false);

  // Treatment plan fetched from backend
  const [treatmentPlan, setTreatmentPlan] = useState<string[]>([]);

  const aiAnalysis = results[selectedIndex] || {};
  const diseaseName = aiAnalysis?.disease?.trim() || "No disease detected";
  const hasDisease = diseaseName !== "No disease detected";

  const confidence = aiAnalysis?.confidence ?? 0;
  const severity = aiAnalysis?.severity ?? "N/A";
  const plant = aiAnalysis?.plant ?? "Unknown";
  const damagePercent = aiAnalysis?.damage_percent ?? 0;
  const forecast = aiAnalysis?.forecast ?? [];

  // ----------------------------------------
  // FETCH TREATMENT PLAN FROM BACKEND
  // ----------------------------------------
  const fetchTreatmentPlan = async () => {
    if (!hasDisease) return;

    try {
      setLoadingPlan(true);

      const token = await SecureStore.getItemAsync("refreshToken");

      const response = await fetch(Api + "/api/disease/get-treatment-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ predictions: [aiAnalysis] }),
      });

      const data = await response.json();
      if (data.success) {
        setTreatmentPlan(data.treatmentPlan || []);
      } else {
        setTreatmentPlan(["Unable to generate treatment plan"]);
      }
    } catch (err) {
      console.log("Treatment Plan Error:", err);
      setTreatmentPlan(["Server error generating treatment plan"]);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [params.results]);

  useEffect(() => {
    fetchTreatmentPlan();
  }, [selectedIndex]);

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="items-center flex flex-row justify-between mb-6">
            <TouchableOpacity onPress={() => router.replace("/diseaseDetection")}>
              <Text className="text-center text-2xl text-emerald-900 font-bold">
                ←
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-emerald-900">
              Disease Analysis
            </Text>
            <View />
          </View>

          {/* Images */}
          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="bg-white rounded-xl p-4 mb-4 border border-emerald-200"
            >
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedIndex(idx)}
                >
                  <Image
                    source={{ uri: `${baseURL + img}?t=${Date.now()}` }}
                    className={`w-32 h-32 mr-3 rounded-lg border-2 ${
                      selectedIndex === idx
                        ? "border-green-400"
                        : "border-gray-300 opacity-40"
                    }`}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Detection Results */}
          <View className="bg-white rounded-2xl p-5 mb-5 border border-emerald-300 shadow-md">
            <Text className="text-2xl font-bold text-emerald-900 mb-3">
              Detection Summary
            </Text>

            <View className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <Text className="text-lg font-semibold text-gray-900">
                {diseaseName}
              </Text>

              {hasDisease && (
                <>
                  <Text className="italic text-emerald-700 mt-1">{plant}</Text>

                  {/* Confidence */}
                  <View className="flex-row items-center mt-3">
                    <Text className="font-semibold text-gray-700">Confidence:</Text>
                    <Text className="ml-2 text-emerald-700 font-bold">
                      {(confidence * 100).toFixed(1)}%
                    </Text>
                  </View>

                  {/* Severity */}
                  <View className="flex-row items-center mt-2">
                    <Text className="font-semibold text-gray-700">Severity:</Text>
                    <Text className="ml-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold">
                      {severity}
                    </Text>
                  </View>

                  {/* Damage */}
                  <View className="flex-row items-center mt-2">
                    <Text className="font-semibold text-gray-700">Damage:</Text>
                    <Text className="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold">
                      {damagePercent}%
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>


          {/* Treatment Plan */}
          {hasDisease && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setExpanded({ ...expanded, treatment: !expanded.treatment })
              }
            >
              <View className="bg-white rounded-2xl p-5 mb-5 border border-green-300 shadow-md">

                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-green-900">
                    Treatment Plan
                  </Text>
                  <Text className="text-xl text-green-700">
                    {expanded.treatment ? "▲" : "▼"}
                  </Text>
                </View>

                {expanded.treatment && (
                  <View className="mt-4">

                    {loadingPlan ? (
                      <ActivityIndicator size="large" />
                    ) : treatmentPlan.length > 0 ? (
                      treatmentPlan.map((step, idx) => (
                        <View
                          key={idx}
                          className="bg-green-50 border border-green-200 p-4 rounded-xl mb-3 shadow-sm"
                        >
                          <Text className="text-gray-800 text-base leading-5">
                            {step}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-gray-600">No treatment steps available</Text>
                    )}

                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}


          {/* Forecast */}
          {hasDisease && forecast.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setExpanded({ ...expanded, forecast: !expanded.forecast })
              }
            >
              <View className="bg-white rounded-2xl p-5 mb-10 border border-green-300 shadow-md">

                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-green-900">
                    Disease Forecast
                  </Text>
                  <Text className="text-xl text-green-700">
                    {expanded.forecast ? "▲" : "▼"}
                  </Text>
                </View>

                {expanded.forecast && (
                  <View className="mt-5">

                    {forecast.map((f: any, idx: number) => (
                      <View
                        key={idx}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 shadow-sm"
                      >
                        <Text className="text-lg font-semibold text-emerald-900">
                          {f.date}
                        </Text>

                        <Text
                          className={`mt-2 text-base font-bold ${
                            f.risk === "High"
                              ? "text-red-600"
                              : f.risk === "Moderate"
                              ? "text-yellow-600"
                              : "text-green-700"
                          }`}
                        >
                          Risk: {f.risk}
                        </Text>
                      </View>
                    ))}

                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
