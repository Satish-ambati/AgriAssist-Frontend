import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Api } from "../api";
import { SafeAreaView } from "react-native-safe-area-context";

const AddDebtScreen = () => {
  const router = useRouter();
  const { farmerId } = useLocalSearchParams<{ farmerId: string }>();

  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddDebt = async () => {
    if (!principal || !interestRate || !dueDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${Api}/api/debt`, {
        farmer: farmerId,
        principalAmount: Number(principal),
        interestRate: Number(interestRate),
        dueDate,
      });
      Alert.alert("Success", "Debt added successfully");
      router.push(`/Debts/DebtsScreen?farmerId=${farmerId}`);
    } catch (err) {
      Alert.alert("Error", "Failed to add debt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
          >
            <Text className="text-lg text-slate-500">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-900">
            Add New Debt
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Info Card */}
        <View className="bg-blue-50 p-4 rounded-xl mb-6 border-l-4 border-blue-500">
          <Text className="text-[13px] text-blue-900 leading-5">
            💡 Enter the debt details below. The system will automatically
            calculate daily payable amounts based on the interest rate.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          {/* Principal */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Principal Amount
            </Text>
            <View className="flex-row items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-4">
              <Text className="text-xl text-slate-500 mr-2">₹</Text>
              <TextInput
                className="flex-1 py-4 text-base font-semibold text-slate-900"
                keyboardType="numeric"
                placeholder="Enter principal amount"
                placeholderTextColor="#94a3b8"
                value={principal}
                onChangeText={setPrincipal}
              />
            </View>
          </View>

          {/* Interest */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Interest Rate
            </Text>
            <View className="flex-row items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-4">
              <TextInput
                className="flex-1 py-4 text-base font-semibold text-slate-900"
                keyboardType="numeric"
                placeholder="Enter interest rate"
                placeholderTextColor="#94a3b8"
                value={interestRate}
                onChangeText={setInterestRate}
              />
              <Text className="text-xl text-slate-500 ml-2">%</Text>
            </View>
          </View>

          {/* Due Date */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Due Date
            </Text>
            <View className="flex-row items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-4">
              <Text className="text-lg mr-2">📅</Text>
              <TextInput
                className="flex-1 py-4 text-base font-semibold text-slate-900"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>
            <Text className="text-xs text-slate-400 mt-2 italic">
              Format: 2024-12-31
            </Text>
          </View>

          <View className="h-px bg-slate-200 mb-6" />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleAddDebt}
            disabled={loading}
            className={`py-4 rounded-xl items-center shadow-md ${
              loading ? "bg-slate-400" : "bg-emerald-500 active:bg-emerald-600"
            }`}
          >
            <Text className="text-white font-bold text-base tracking-wide">
              {loading ? "Adding Debt..." : "Add Debt Record"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        {principal && interestRate && (
          <View className="bg-white rounded-2xl p-5 mt-4 shadow-sm">
            <Text className="text-sm font-bold text-slate-900 mb-3">
              📊 Preview Summary
            </Text>

            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Principal</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  ₹{Number(principal).toLocaleString("en-IN")}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Interest Rate</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {interestRate}%
                </Text>
              </View>

              {dueDate && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500">Due Date</Text>
                  <Text className="text-sm font-semibold text-slate-900">
                    {dueDate}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddDebtScreen;
