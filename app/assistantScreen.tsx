import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const { width } = Dimensions.get("window");

export default function VoiceHealthAssistant() {
  // Local state
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Animations
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [isConnected, setIsConnected] = useState(false);

  // ---- Static AI Response Logic ----
  const fakeAIResponse = (userInput: string) => {
    if (userInput.toLowerCase().includes("headache")) {
      return "It seems like you have a headache. Please drink water and rest. If it persists, consult a doctor.";
    }
    if (userInput.toLowerCase().includes("fever")) {
      return "A fever may indicate infection. Monitor your temperature and stay hydrated.";
    }
    return "I'm your health assistant. I can help with basic symptoms like fever, headache, or stomach pain.";
  };

  // ---- Speech Recognition Events ----
  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    setInterimText("");
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const result = event.results[0];
      const text = result.transcript || "";

      if (event.isFinal) {
        setTranscript(text);
        setInterimText("");

        // get static AI response
        const response = fakeAIResponse(text);
        setAiResponse(response);
      } else {
        setInterimText(text);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    Alert.alert("Speech Recognition Error", event.message || "Unknown error");
    setRecognizing(false);
    setInterimText("");
  });

  // ---- Start / Stop Recognition ----
  const startSpeechRecognition = async () => {
    try {
      const { granted } =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!granted) {
        Alert.alert("Permission Denied", "Microphone access is required.");
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
      });

      setIsConnected(true);
    } catch (err) {
      Alert.alert("Error", "Failed to start recognition.");
    }
  };

  const stopSpeechRecognition = () => {
    ExpoSpeechRecognitionModule.stop();
    setIsConnected(false);
    setRecognizing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Assistant</Text>
        <Text style={[styles.statusText, { color: isConnected ? "#00ff88" : "#666" }]}>
          {isConnected ? (recognizing ? "Listening..." : "Connected") : "Tap to start"}
        </Text>
      </View>

      {/* Orb */}
      <View style={styles.mainContent}>
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: isConnected ? "#00ff88" : "#666",
              transform: [{ scale: orbScale }],
              opacity: orbOpacity,
            },
          ]}
        />
      </View>

      {/* Transcript + AI response */}
      {(transcript || interimText || aiResponse) && (
        <View style={styles.transcriptContainer}>
          {(transcript || interimText) && (
            <Text style={styles.transcriptUser}>
              You: "{transcript}
              {interimText}"
            </Text>
          )}
          {aiResponse && <Text style={styles.transcriptAI}>Bot: {aiResponse}</Text>}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.callButton,
            {
              backgroundColor: isConnected ? "#ff3030" : "#00ff88",
              shadowColor: isConnected ? "#ff3030" : "#00ff88",
            },
          ]}
          onPress={isConnected ? stopSpeechRecognition : startSpeechRecognition}
        >
          <Ionicons
            name="call"
            size={24}
            color="white"
            style={{ transform: [{ rotate: isConnected ? "135deg" : "0deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 50 },
  header: { alignItems: "center", paddingVertical: 20 },
  headerTitle: { fontSize: 18, color: "white", fontWeight: "600" },
  statusText: { fontSize: 14, fontWeight: "500", marginTop: 6 },
  mainContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  transcriptContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  transcriptUser: { color: "lightblue", fontSize: 14, fontStyle: "italic", marginBottom: 10 },
  transcriptAI: { color: "white", fontSize: 16 },
  controlsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 40 },
  callButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
});
