import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isUser: false },
    { id: 2, text: "Hi there! I'm looking for some assistance.", isUser: true }
  ]);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (message.trim()) {
      const newMsg = {
        id: Date.now(),
        text: message,
        isUser: true,
      };

      setChatMessages((prev) => [...prev, newMsg]);
      setMessage('');
      Keyboard.dismiss();

      // Always return a constant bot response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: "This is a constant response ✅", isUser: false }
        ]);
      }, 500);
    }
  };

  const handleVoicePress = () => {
    router.push('/assistantScreen');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Chat Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-green-600 shadow-sm">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center flex-1 ml-3">
          <View className="w-10 h-10 bg-green-200 rounded-full items-center justify-center mr-3">
            <Ionicons name="chatbubble-ellipses" size={20} color="#047857" />
          </View>
          <View>
            <Text className="text-white font-semibold text-lg">Assistant</Text>
            <Text className="text-green-100 text-sm">Always ready</Text>
          </View>
        </View>
      </View>

      {/* Messages + Keyboard Avoid */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-2"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
        >
          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-3 max-w-xs ${
                msg.isUser
                  ? 'self-end bg-green-600 rounded-l-2xl rounded-tr-2xl rounded-br-md'
                  : 'self-start bg-gray-200 rounded-r-2xl rounded-tl-2xl rounded-bl-md'
              }`}
            >
              <Text
                className={`px-4 py-2 ${
                  msg.isUser ? 'text-white' : 'text-gray-800'
                }`}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input always above keyboard */}
        <View className="flex-row items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <View className="flex-1 flex-row items-center bg-white rounded-full border border-gray-300 px-4 py-2">
            <TextInput
              className="flex-1 text-base"
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
          </View>

          {/* Dynamic Voice/Send Button */}
          <TouchableOpacity
            className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
              message.trim() ? 'bg-green-600' : 'bg-green-500'
            }`}
            onPress={message.trim() ? handleSend : handleVoicePress}
          >
            <Ionicons
              name={message.trim() ? 'send' : 'mic'}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
