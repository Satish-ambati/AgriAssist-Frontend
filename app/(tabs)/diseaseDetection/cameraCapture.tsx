import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActionSheetIOS,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { Api, IP } from "@/app/api";
import { useFarmerStore } from "@/store";

export default function CameraCapture() {
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {farmerInfo } = useFarmerStore() 
  // const [city, setCity] = useState("vizag"); 
  const [city, setCity] = useState(farmerInfo.farmer?.location?.mandal || "vizag");

  

  useFocusEffect(
    useCallback(() => {
      requestPermissions();
      return () => {
        setImages([]);
      };
    }, [])
  );

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and gallery permissions are needed to capture or select images."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const openPicker = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          else if (buttonIndex === 2) pickImage();
        }
      );
    } else {
      setShowModal(true);
    }
  };

  // ---------------- Analyze Button ----------------
  const analyzeImages = async () => {
    if (images.length === 0) {
      Alert.alert("No Images", "Please add at least one plant image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      images.forEach((uri, index) => {
        formData.append("files", {
          uri,
          name: `leaf_${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });
      formData.append("city", city);

      const response = await axios.post(
        `http://${IP}:8000/predict`, // replace with your LAN IP
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setLoading(false);
      console.log("✅ Backend response:", response.data); // log response


      // Navigate to result page with API response
      router.replace({
        pathname: "/diseaseDetection/diseaseResult",
        params: { results: JSON.stringify(response.data) },
      });
      setImages([]);
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Failed to analyze images. Please try again.");
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5FDF7" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#16a34a",
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          🌱 Plant Disease Scanner
        </Text>
        <Text style={{ color: "#dcfce7", textAlign: "center", fontSize: 16 }}>
          Capture clear leaf images for instant health analysis
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 24 }}>
        {/* Leaf Collection */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#15803d",
              marginBottom: 12,
            }}
          >
            🌿 Leaf Collection
          </Text>

          {images.length === 0 ? (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 32,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: "#86efac",
              }}
            >
              <Ionicons name="camera-outline" size={40} color="#22C55E" />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#15803d",
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                No Plants Scanned Yet
              </Text>
              <Text style={{ color: "#6b7280", textAlign: "center", lineHeight: 20 }}>
                Start by capturing images of plant leaves{"\n"}Our AI will analyze them for
                diseases
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
              }}
            >
              {images.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ position: "relative", marginRight: 12 }}
                  onPress={() => setPreviewImage(uri)}
                >
                  <Image
                    source={{ uri }}
                    style={{
                      width: 128,
                      height: 128,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "#4ade80",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "#ef4444",
                      borderRadius: 50,
                      padding: 4,
                    }}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={openPicker}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor: "#16a34a",
            marginBottom: 16,
          }}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
              marginLeft: 8,
            }}
          >
            Add Plant Image
          </Text>
        </TouchableOpacity>

        {/* Analyze Button */}
        <TouchableOpacity
          onPress={analyzeImages}
          disabled={images.length === 0 || loading}
          style={{
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor:
              images.length > 0 && !loading ? "#15803d" : "#9ca3af",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: 18,
            }}
          >
            Analyze {images.length > 0 ? `(${images.length})` : ""}
          </Text>
        </TouchableOpacity>

                {/* Disclaimer / Safety Note */}
        <View
          style={{
            marginTop: 16,
            backgroundColor: "#fef3c7",
            padding: 12,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: "#f59e0b",
          }}
        >
          <Text
            style={{
              color: "#92400e",
              fontWeight: "bold",
              marginBottom: 4,
              fontSize: 14,
            }}
          >
            ⚠️ Important Notice
          </Text>

          <Text style={{ color: "#78350f", fontSize: 13, lineHeight: 18 }}>
            The image must be in clarity .
            This AI prediction is only for educational and guidance purposes.  
            It may not always be 100% accurate.  
            Please consult an agricultural expert for final diagnosis or treatment decisions.
          </Text>
        </View>
      </ScrollView>

      {/* Android Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                takePhoto();
              }}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 18, textAlign: "center" }}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                pickImage();
              }}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 18, textAlign: "center" }}>
                🖼️ Choose from Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ paddingVertical: 12 }}>
              <Text style={{ color: "#ef4444", fontSize: 18, textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: previewImage || "" }}
            style={{ width: "100%", height: "80%" }}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            style={{
              position: "absolute",
              top: 48,
              right: 20,
              backgroundColor: "#dc2626",
              padding: 8,
              borderRadius: 50,
            }}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>


      </Modal>
    </View>
  );
}
