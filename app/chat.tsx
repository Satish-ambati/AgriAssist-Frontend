import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { Api } from "./api";
import { useFarmerStore } from "@/store";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { farmerInfo } = useFarmerStore();

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const fetchBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    try {
      const res = await axios.post(`${Api}/api/chat`, { message: userMessage });
      const botResponse = res.data?.replyText || "I'm here to help you with farming! 🌱";

      // Typing effect for bot response
      let currentText = "";
      for (let i = 0; i < botResponse.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        currentText += botResponse[i];

        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.sender === "bot") {
            updated[updated.length - 1] = { ...lastMessage, text: currentText };
          } else {
            updated.push({ id: Date.now().toString(), text: currentText, sender: "bot" });
          }
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "⚠️ Error connecting to server.", sender: "bot" },
      ]);
    }
    setIsTyping(false);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);

    const userMessage = input;
    setInput("");
    fetchBotResponse(userMessage);
  };

  const renderMessage = ({ item }: { item: Message }) => {
  // If it's the user message, show bubble
  if (item.sender === "user") {
    return (
      <View className="max-w-[75%] rounded-xl px-4 py-3 my-1.5 bg-[#16a34a] self-end">
        <Text className="text-[15px] leading-5 text-white">{item.text}</Text>
      </View>
    );
  }

  // If it's AI message, show plain formatted text
  // Convert **bold** to actual bold Text
  const parts = item.text.split(/(\*\*.*?\*\*)/g);

  return (
    <View className="self-start my-2 px-1">
      <Text className="text-[15px]  leading-relaxed text-gray-800">
        {parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const boldText = part.slice(2, -2);
            return (
              <Text key={index} className="font-bold text-[16px] text-gray-900">
                {boldText}
              </Text>
            );
          } else {
            return part;
          }
        })}
      </Text>
    </View>
  );
};

  const handleVoice = () => {
    router.push('/assistantScreen')
  }

  return (
    <View className="flex-1 bg-[#fafafa]">
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {/* Header */}
      <View className="bg-[#16a34a] pt-12 pb-4 px-5 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" color={"white"} size={24} />
            </TouchableOpacity>
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3 shadow">
              <Ionicons name="bulb-outline" size={24} color="#15803d" />
            </View>
            <View>
              <Text className="text-white text-xl font-semibold">Farmer Assistant</Text>
              <Text className="text-green-200 text-sm">Always ready to help 🌾</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-400 rounded-full mr-2" />
            <Text className="text-green-100 text-sm">Online</Text>
          </View>
        </View>
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex-1">
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <View className="bg-green-50 p-8 rounded-full shadow-md">
                <Ionicons name="leaf-outline" size={72} color="#15803d" />
              </View>
              <Text className="text-green-800 text-3xl font-extrabold text-center mt-6">
                Welcome, {farmerInfo.farmer?.name || "Farmer"}! 🌾
              </Text>
              <Text className="text-gray-500 text-base text-center mt-3 leading-6">
                Ask me anything about crops, weather, or farming tips. I’m here to assist you in
                growing better yields!
              </Text>
              <View className="mt-6 bg-green-100 px-5 py-2 rounded-full">
                <Text className="text-green-700 font-semibold text-sm animate-pulse">
                  How can I help you today?
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {isTyping && (
            <View className="flex-row items-center px-5 pb-2">
              <View className="bg-white rounded-xl px-4 py-3 flex-row items-center border border-gray-200">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="ml-2 text-gray-500 text-sm">Typing...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Input Bar */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <TextInput
              className="flex-1 text-base text-gray-800 py-2"
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              multiline
              maxLength={500}
              style={{ maxHeight: 80 }}
            />
            {!input.trim()
             ? (<TouchableOpacity
              onPress={handleVoice}
              className="ml-2 bg-[#16a34a] rounded-full w-9 h-9 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={18} color="white" />
            </TouchableOpacity>) : (<TouchableOpacity
              onPress={sendMessage}
              className="ml-2 bg-[#16a34a] rounded-full w-9 h-9 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>)}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
