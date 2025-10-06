import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
type Note = {
  id: number;
  title: string;
  amount: number;
  date: string;
};
export default function AddNoteScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const saveNote = () => {
    if (!title.trim() || !amount.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      title: title.trim(),
      amount: parseFloat(amount),
      date: new Date().toISOString().split("T")[0]
    };
  router.push("/finance/financeManage");
  };

  return (
    <View className="flex-1 bg-[#F5FDF7] px-5 pt-12">
      <Text className="text-2xl font-bold text-green-700 mb-4">📝 Add Note</Text>

      <Text className="text-gray-700 mb-1">Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        className="bg-white p-3 rounded-xl mb-4 shadow"
        placeholder="Enter note title"
      />

      <Text className="text-gray-700 mb-1">Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        className="bg-white p-3 rounded-xl mb-4 shadow"
        placeholder="Enter amount"
        keyboardType="numeric"
      />

      <TouchableOpacity
        onPress={saveNote}
        className="bg-green-600 py-4 rounded-xl items-center mt-4"
      >
        <Text className="text-white font-bold text-lg">Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}