import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function AddDebtScreen() {
  const [lender, setLender] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");

  const saveDebt = () => {
    if (!lender.trim() || !amount.trim() || !rate.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newDebt = {
      id: Date.now(),
      lender: lender.trim(),
      borrowedAmount: parseFloat(amount),
      interestAccumulated: 0,
      totalPayable: parseFloat(amount),
      borrowedDate: new Date().toISOString().split("T")[0],
      interestRate: parseFloat(rate)
    };
    
  router.push("/finance/financeManage");
  };

  return (
    <View className="flex-1 bg-[#F5FDF7] px-5 pt-12">
      <Text className="text-2xl font-bold text-green-700 mb-4">💳 Add Debt</Text>

      <Text className="text-gray-700 mb-1">Lender</Text>
      <TextInput
        value={lender}
        onChangeText={setLender}
        className="bg-white p-3 rounded-xl mb-4 shadow"
        placeholder="Enter lender name"
      />

      <Text className="text-gray-700 mb-1">Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        className="bg-white p-3 rounded-xl mb-4 shadow"
        placeholder="Enter amount"
        keyboardType="numeric"
      />

      <Text className="text-gray-700 mb-1">Interest Rate (%)</Text>
      <TextInput
        value={rate}
        onChangeText={setRate}
        className="bg-white p-3 rounded-xl mb-4 shadow"
        placeholder="Enter interest rate"
        keyboardType="numeric"
      />

      <TouchableOpacity
        onPress={saveDebt}
        className="bg-green-600 py-4 rounded-xl items-center mt-4"
      >
        <Text className="text-white font-bold text-lg">Save Debt</Text>
      </TouchableOpacity>
    </View>
  );
}