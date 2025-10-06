import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import { Audio } from "expo-av";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Api } from "./api";

const { width } = Dimensions.get("window");

export default function VoiceHealthAssistant() {
  const router = useRouter();

  // Local state
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [displayedText, setDisplayedText] = useState("");

  const [isConnected, setIsConnected] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);

  // Animations
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.7)).current;

  // audio sound ref
  const soundRef = useRef<Audio.Sound | null>(null);

  // ---- Speech Recognition Events ----
  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    startPulseAnimation();
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    setInterimText("");
    stopPulseAnimation();
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const result = event.results[0];
      const text = result.transcript || "";

      if (event.isFinal) {
        setTranscript(text);
        setInterimText("");
        enqueueMessage(text); // queue message instead of sending immediately
      } else {
        setInterimText(text);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    Alert.alert("Speech Recognition Error", event.message || "Unknown error");
    setRecognizing(false);
    setInterimText("");
    stopPulseAnimation();
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

      // clear previous messages
      setTranscript("");
      setInterimText("");
      setAiResponse("");

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
    stopPulseAnimation();
  };

  // ---- Queue system to handle new messages while AI is speaking ----
  const enqueueMessage = async (message: string) => {
  if (isPlaying || isLoadingAudio) {
    // 🛑 Stop any ongoing audio immediately
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
    } catch (e) {
      console.warn("Failed to interrupt previous audio:", e);
    }

    setIsPlaying(false);
    setIsLoadingAudio(false);
  }

  // 🔁 Directly send new message without queuing
  await sendTextToBackendAndPlay(message);
};

  const handleQueue = async () => {
  if (isPlaying || isLoadingAudio) return; // prevent double play
  if (queueMessage) {
    const msg = queueMessage;
    setQueueMessage(null);
    await sendTextToBackendAndPlay(msg);
  }
};


  // ---- Send text to backend and play returned audio ----
  const sendTextToBackendAndPlay = async (message: string) => {
    if (!message || message.trim().length === 0) return;

    setIsLoadingAudio(true);
    setAiResponse(""); // clear previous response while loading
    try {
      const resp = await fetch(Api + "/api/chat/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: "default" }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server returned ${resp.status}: ${txt}`);
      }

      const json = await resp.json();

      if (json && json.replyText) setAiResponse(json.replyText);

      if (json && json.finalAudio && Array.isArray(json.finalAudio.data)) {
        const byteArray: number[] = json.finalAudio.data;
        const uint8 = new Uint8Array(byteArray);
        const base64 = Buffer.from(uint8).toString("base64");
        const uri = `data:audio/mpeg;base64,${base64}`;
        await playAudioFromUri(uri);
      }
    } catch (error: any) {
      console.error("Error calling backend:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to get response from server."
      );
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudioFromUri = async (uri: string) => {
      try {
        // Stop and unload any existing sound
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
          } catch {}
          try {
            await soundRef.current.unloadAsync();
          } catch {}
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );

        soundRef.current = sound;

        // attach a new one-time listener
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (!status?.isLoaded) return;

          if (status.didJustFinish && !status.isLooping) {
            // ✅ Stop repeating — unload and cleanup safely
            (async () => {
              try {
                await sound.stopAsync();
                await sound.unloadAsync();
              } catch {}
              if (soundRef.current === sound) {
                soundRef.current = null;
              }
              setIsPlaying(false);
              handleQueue(); // proceed to next queued message if any
            })();
          }
        });

        setIsPlaying(true);
      } catch (e) {
        console.error("Failed to play audio:", e);
        Alert.alert("Playback Error", "Failed to play audio.");
        setIsPlaying(false);
      }
    };


  const onPlaybackStatusUpdate = (status: any) => {
    if (!status) return;
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        handleQueue(); // process next queued message
      }
    } else {
      if (status.error) console.error("Playback status error:", status.error);
      setIsPlaying(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
          } catch (_) {}
          try {
            await soundRef.current.unloadAsync();
          } catch (_) {}
        }
      })();
    };
  }, []);

  // ---- Orb Pulse Animation ----
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(orbOpacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    orbScale.setValue(1);
    orbOpacity.setValue(0.7);
  };

  useEffect(() => {
      if (!aiResponse) return;

      setDisplayedText(""); // clear previous text
      let i = 0;
      let currentText = "";

      const interval = setInterval(() => {
        currentText += aiResponse[i];
        setDisplayedText(currentText);
        i++;

        if (i >= aiResponse.length) {
          clearInterval(interval); // ✅ stop once text is complete
        }
      }, 50); // typing speed in ms

      return () => clearInterval(interval); // ✅ cleanup
    }, [aiResponse]);



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Farmer Assistant</Text>
        <Text style={[styles.statusText, { color: isConnected ? "#00b894" : "#999" }]}>
          {isConnected ? (recognizing ? "Listening..." : "Connected") : "Tap to start"}
        </Text>
      </View>

      {/* Orb */}
      <View style={styles.mainContent}>
        <Animated.View
          style={[styles.orb, { backgroundColor: isConnected ? "#00b894" : "#ccc", transform: [{ scale: orbScale }], opacity: orbOpacity }]}
        />
        {isLoadingAudio && (
          <View style={{ position: "absolute", bottom: -40, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#333" />
            <Text style={{ color: "#333", marginTop: 6 }}>Preparing voice...</Text>
          </View>
        )}
      </View>

      {/* Transcript + AI response */}
      {(transcript || interimText || aiResponse) && (
        <ScrollView style={styles.transcriptContainer}>
          {(transcript || interimText) && (
            <Text style={styles.transcriptUser}>
              You: "{transcript}{interimText}"
            </Text>
          )}
          {(aiResponse || displayedText) && (
              <Text style={styles.transcriptAI}>Assistant: {displayedText}</Text>
            )}
          <View style={styles.playStatus}>
            <Ionicons name={isPlaying ? "play" : "play-outline"} size={18} color="#333" />
            <Text style={{ color: "#333", marginLeft: 8 }}>{isPlaying ? "Playing" : "Not playing"}</Text>
          </View>
        </ScrollView>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: isConnected ? "#d63031" : "#00b894", shadowColor: isConnected ? "#d63031" : "#00b894" }]}
          onPress={isConnected ? stopSpeechRecognition : startSpeechRecognition}
        >
          <Ionicons
            name="call"
            size={24}
            color="#fff"
            style={{ transform: [{ rotate: isConnected ? "135deg" : "0deg" }] }}
          />
        </TouchableOpacity> 
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50, alignItems: "center" },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  header: { alignItems: "center", paddingVertical: 20 },
  headerTitle: { fontSize: 20, color: "#333", fontWeight: "700" },
  statusText: { fontSize: 14, fontWeight: "500", marginTop: 6 },
  mainContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  orb: { width: 200, height: 200, borderRadius: 100, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  transcriptContainer: {
    maxHeight: 200, // limit height to avoid breaking layout
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: width * 0.9,
  },
  transcriptUser: { color: "#0984e3", fontSize: 14, fontStyle: "italic", marginBottom: 10 },
  transcriptAI: { color: "#333", fontSize: 16 },
  playStatus: { marginTop: 10, flexDirection: "row", alignItems: "center" },
  controlsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 40 },
  callButton: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
});