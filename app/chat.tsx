import { useFarmerStore } from "@/store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { Api } from "./api";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // Auto scroll to bottom when messages change or keyboard appears
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Fetch bot response
  const fetchBotResponse = async (userMessage: string) => {
    setIsTyping(true);

    try {
      const res = await axios.post(`${Api}/api/chat`, { message: userMessage });
      const botResponse =
        res.data?.replyText || "I'm here to help you with farming! 🌱";

      let current = "";
      const messageId = Date.now().toString();

      // Add empty bot message first
      setMessages((prev) => [
        ...prev,
        { id: messageId, text: "", sender: "bot" },
      ]);

      // Typing Effect
      for (let i = 0; i < botResponse.length; i += 2) {
        await new Promise((resolve) => setTimeout(resolve, 8));
        current += botResponse.slice(i, i + 2);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, text: current } : msg
          )
        );
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "⚠️ Unable to connect to server.",
          sender: "bot",
        },
      ]);
    }

    setIsTyping(false);
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);

    const userMsg = input;
    setInput("");

    fetchBotResponse(userMsg);
  };

  // Render Chat Bubbles
  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === "user") {
      return (
        <View className="max-w-[75%] rounded-xl px-4 py-3 my-1.5 bg-[#16a34a] self-end">
          <Text className="text-white text-[15px] leading-5">{item.text}</Text>
        </View>
      );
    }

    // Convert **bold** → bold Text
    const parts = item.text.split(/(\*\*.*?\*\*)/g);

    return (
      <View className="self-start my-2 px-1">
        <Text className="text-[15px] text-gray-800 leading-relaxed">
          {parts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <Text key={i} className="font-bold text-gray-900 text-[16px]">
                {part.slice(2, -2)}
              </Text>
            ) : (
              part
            )
          )}
        </Text>
      </View>
    );
  };

  // Voice Assistant
  const handleVoice = () => {
    router.push("/assistantScreen");
  };

  return (
    <View className="flex-1 bg-[#fafafa]">
      
      {/* HEADER - Outside KeyboardAvoidingView */}
      <SafeAreaView edges={['top']} className="bg-[#16a34a]">
        <View className="bg-[#16a34a] pb-4 px-5 shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" color="white" size={24} />
              </TouchableOpacity>

              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mx-3">
                <Ionicons name="leaf-outline" size={24} color="#15803d" />
              </View>

              <View>
                <Text className="text-white text-xl font-semibold">
                  Farmer Assistant
                </Text>
                <Text className="text-green-200 text-sm">
                  Always ready to help 🌾
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-400 rounded-full mr-2" />
              <Text className="text-green-100 text-sm">Online</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* KeyboardAvoidingView wraps chat + input */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* CHAT AREA */}
        <View className="flex-1">
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <View className="bg-green-50 p-8 rounded-full shadow">
                <Ionicons name="leaf-outline" size={72} color="#15803d" />
              </View>

              <Text className="text-green-800 text-3xl font-extrabold text-center mt-6">
                Welcome, {farmerInfo.farmer?.name || "Farmer"}! 🌾
              </Text>

              <Text className="text-gray-600 text-base text-center mt-3 leading-6">
                Ask me anything about crops, weather, soil, or farming tips.
              </Text>

              <View className="mt-6 bg-green-100 px-5 py-2 rounded-full">
                <Text className="text-green-700 font-semibold text-sm">
                  How can I assist you today?
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            />
          )}

          {isTyping && (
            <View className="flex-row items-center px-5 pb-2">
              <View className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex-row items-center">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="ml-2 text-gray-500 text-sm">Typing...</Text>
              </View>
            </View>
          )}
        </View>

        {/* INPUT BAR */}
        <SafeAreaView edges={['bottom']} className="bg-white">
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

              {!input.trim() ? (
                <TouchableOpacity
                  onPress={handleVoice}
                  className="ml-2 bg-[#16a34a] rounded-full w-9 h-9 items-center justify-center"
                >
                  <Ionicons name="mic" size={18} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={sendMessage}
                  className="ml-2 bg-[#16a34a] rounded-full w-9 h-9 items-center justify-center"
                >
                  <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;