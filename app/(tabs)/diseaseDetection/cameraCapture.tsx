
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
} from "react-native";
import { bulkAnalyzeImages } from "@/services/api/disease";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {useFocusEffect} from '@react-navigation/native'
export default function CameraCapture() {
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImage,setPreviewImage]=useState<string|null>(null);
  useFocusEffect(
     useCallback(()=>{
      return()=>
      {
        setImages([]);
      };
     },[])
  );
  // Pick from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Upload button click
  const openPicker = () => {
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

  return (
    <View className="flex-1 bg-[#F5FDF7]">
      {/* Header */}
      <View className="bg-green-700 pt-12 pb-6 px-6 rounded-b-3xl shadow">
        <Text className="text-white text-2xl font-bold text-center mb-2">
          🌱 Plant Disease Scanner
        </Text>
        <Text className="text-green-100 text-center text-base">
          Capture clear leaf images for instant health analysis
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Leaf Collection*/}
        <View className="mb-6">
          <Text className="text-lg font-bold text-green-700 mb-3">
            🌿 Leaf Collection
          </Text>

          {images.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center border-2 border-dashed border-green-300">
              <Ionicons name="camera-outline" size={40} color="#22C55E" />
              <Text className="text-xl font-bold text-green-700 mt-2 mb-1">
                No Plants Scanned Yet
              </Text>
              <Text className="text-gray-500 text-center leading-5">
                Start by capturing images of plant leaves{"\n"}
                 Our AI will analyze them for diseases
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="bg-white rounded-2xl p-4 shadow"
            >
              {images.map((uri, index) => (
                <TouchableOpacity key={index} className="relative mr-3" onPress={()=>{setPreviewImage(uri)}} >
                  <Image
                    source={{ uri }}
                    className="w-32 h-32 rounded-lg border-2 border-green-400"
                  />
                 {/* ❌ Remove Button */}
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white-500 rounded-full p-1"
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
          className="flex-row items-center justify-center py-4 rounded-xl bg-green-600 shadow mb-4"
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            Add Plant Image
          </Text>
        </TouchableOpacity>

        {/* Analyze Button */}
        {/* <TouchableOpacity
          onPress={async () => {
    if (images.length === 0) return;

    try {
      const imagesData = images.map(uri => ({ uri }));
     const result = await bulkAnalyzeImages(imagesData);
      router.push({
        pathname: "/diseaseDetection/diseaseResult",
        params: { result: JSON.stringify(result) },
      });

      setImages([]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }}
          disabled={images.length === 0}
          className={`py-4 rounded-xl ${
            images.length > 0 ? "bg-green-700" : "bg-gray-400"
          }`}
        >
          <Text className="text-white font-bold text-center text-lg">
            Analyze
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
        onPress={()=>{
          router.push({
            pathname:"/diseaseDetection/diseaseResult",
            params:{images:JSON.stringify(images)},
          });
          setImages([]);
        }}
                disabled={images.length === 0}
          className={`py-4 rounded-xl ${
            images.length > 0 ? "bg-green-700" : "bg-gray-400"
          }`}
        >
          <Text className="text-white font-bold text-center text-lg">
            Analyze
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Android Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-4 rounded-t-2xl">
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                takePhoto();
              }}
              className="p-3"
            >
              <Text className="text-lg">Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                pickImage();
              }}
              className="p-3"
            >
              <Text className="text-lg">Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="p-3"
            >
              <Text className="text-red-500 text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 bg-black justify-center items-center">
            <Image source={{uri:previewImage || ""}} className="w-full h-[80%] resize-contain"/>
            <TouchableOpacity 
            onPress={()=>setPreviewImage(null)}
            className="absolute top-12 right-5 bg-red-600 p-2 rounded-full">
              <Ionicons name="close" size={28} color="white"/>
            </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}