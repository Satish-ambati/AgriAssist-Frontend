// import React from 'react'
// import { StyleSheet, Text, View } from 'react-native'

// const profile = () => {
//   return (
//     <View>
//       <Text>profile</Text>
//     </View>
//   )
// }

// export default profile

// const styles = StyleSheet.create({})

// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { LinearGradient } from "expo-linear-gradient";
// import React, { useState } from "react";
// import {
//   Image,
//   Modal,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const DEFAULT_IMAGE =
//   "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";

// const FarmerProfile: React.FC = () => {
//   const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedCrop, setSelectedCrop] = useState<any>(null);
//   const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);

//   const farmerName = "Ramesh";
//   const farmerMobile = "9876543210";

//   const crops = [
//     { name: "Paddy", stage: "Disease Detection Stage", progress: 60 },
//     { name: "Wheat", stage: "Flowering Stage", progress: 45 },
//     { name: "Maize", stage: "Harvest Stage", progress: 90 },
//   ];

//   const pickFromGallery = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.7,
//     });
//     if (!result.canceled) {
//       setProfilePhoto(result.assets[0].uri);
//     }
//     setPhotoOptionsVisible(false);
//   };

//   const pickFromCamera = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.7,
//     });
//     if (!result.canceled) {
//       setProfilePhoto(result.assets[0].uri);
//     }
//     setPhotoOptionsVisible(false);
//   };

//   const removePhoto = () => {
//     setProfilePhoto(null);
//     setPhotoOptionsVisible(false);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50 p-4">
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Title */}
//         <Text className="text-2xl font-bold text-center text-emerald-700 mb-6">
//           Farmer Profile
//         </Text>

//         {/* Farmer Info Card with Logout */}
//         <View className="flex-row items-center bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-5 mb-6 shadow-lg border border-green-200 min-h-40 justify-between">
//           <View className="flex-row items-center flex-1">
//             <TouchableOpacity onPress={() => setPhotoOptionsVisible(true)}>
//               <Image
//                 source={{ uri: profilePhoto || DEFAULT_IMAGE }}
//                 className="w-24 h-24 rounded-full border-4 border-white shadow-md"
//               />
//             </TouchableOpacity>
//             <View className="ml-5">
//               <Text className="text-xl font-bold text-gray-900 tracking-wide">
//                 {farmerName}
//               </Text>
//               <Text className="text-base text-gray-700 mt-1">
//                 {farmerMobile}
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             onPress={() => console.log("Logout pressed")}
//             className="bg-emerald-600 px-4 py-2 rounded-lg shadow"
//           >
//             <Text className="text-white font-semibold text-sm">Logout</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Current Crops Section */}
//         <Text className="text-2xl font-bold text-emerald-700 mb-6 text-center">
//           Current Crops
//         </Text>

//         {crops.map((crop, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => {
//               setSelectedCrop(crop);
//               setModalVisible(true);
//             }}
//             className="mb-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-lg min-h-32"
//           >
//             <Text className="text-lg font-bold text-gray-900 mb-2 pt-5 pl-5">
//               {crop.name}
//             </Text>

//             <View className="w-full h-6 bg-gray-200 rounded-full overflow-hidden flex-row items-center">
//               <LinearGradient
//                 colors={["#4ade80", "#16a34a"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={{
//                   width: `${crop.progress}%`,
//                   height: "100%",
//                   borderRadius: 999,
//                   justifyContent: "center",
//                   alignItems: "flex-end",
//                   paddingRight: 6,
//                 }}
//               >
//                 <Ionicons name="leaf-outline" size={16} color="white" />
//               </LinearGradient>
//             </View>
//             <Text className="text-right text-sm text-gray-600 mt-1">
//               {crop.progress}% Growth
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Modal for Crop Details */}
//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View className="flex-1 bg-black/50 justify-center items-center">
//           <View className="bg-white w-80 p-6 rounded-2xl shadow">
//             {selectedCrop && (
//               <>
//                 <Text className="text-xl font-bold text-emerald-700 mb-4">
//                   {selectedCrop.name} Details
//                 </Text>
//                 <Text className="text-base text-gray-700 mb-2">
//                   Stage: {selectedCrop.stage}
//                 </Text>
//                 <Text className="text-base text-gray-700 mb-2">
//                   Growth: {selectedCrop.progress}%
//                 </Text>
//               </>
//             )}
//             <TouchableOpacity
//               className="mt-4 bg-emerald-600 py-2 rounded-lg"
//               onPress={() => setModalVisible(false)}
//             >
//               <Text className="text-white text-center font-semibold">Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Bottom Sheet for Profile Photo Options */}
//       <Modal visible={photoOptionsVisible} transparent animationType="fade">
//         <View className="flex-1 justify-end bg-black/40">
//           <View className="bg-white rounded-t-2xl">
//             <Text className="text-base font-semibold text-center py-4 border-b border-gray-200 text-emerald-700">
//               Update Profile Photo
//             </Text>
//             <TouchableOpacity
//               className="py-4 border-b border-gray-200"
//               onPress={pickFromCamera}
//             >
//               <Text className="text-center text-gray-800 font-medium">
//                 Take Photo
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               className="py-4 border-b border-gray-200"
//               onPress={pickFromGallery}
//             >
//               <Text className="text-center text-gray-800 font-medium">
//                 Choose from Gallery
//               </Text>
//             </TouchableOpacity>
//             {profilePhoto && (
//               <TouchableOpacity
//                 className="py-4 border-b border-gray-200"
//                 onPress={removePhoto}
//               >
//                 <Text className="text-center text-red-600 font-medium">
//                   Remove Photo
//                 </Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               className="py-4"
//               onPress={() => setPhotoOptionsVisible(false)}
//             >
//               <Text className="text-center text-gray-600 font-medium">Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default FarmerProfile;

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/4086/4086679.png";

const FarmerProfile: React.FC = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Telugu");

  const userInfo = {
    Phone: "7702097929",
    Language: selectedLanguage,
    Location: "Vijayawada",
  };

  const languages = ["English", "Telugu", "Hindi"];

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
    setPhotoOptionsVisible(false);
  };

  const pickFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
    setPhotoOptionsVisible(false);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoOptionsVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View className="items-center mt-8 mb-6">
          <TouchableOpacity onPress={() => setPhotoOptionsVisible(true)}>
            <Image
              source={{ uri: profilePhoto || DEFAULT_IMAGE }}
              className="w-36 h-36 rounded-full border-4 border-white shadow-lg"
            />
          </TouchableOpacity>
        </View>

        {/* Info Container */}
        <View className="mx-4 bg-white rounded-3xl p-6 shadow-lg">
          {/* Name Centered */}
          <Text className="text-2xl font-bold text-emerald-700 text-center mb-6">
            Karthikeya
          </Text>

          {/* Other Info as Key-Value */}
          {Object.entries(userInfo).map(([key, value]) => {
            const isEditable = key === "Language";
            return (
              <View
                key={key}
                className="flex-row justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
              >
                <Text className="text-gray-500 font-semibold text-lg">{key}:</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-800 font-medium text-lg">{value}</Text>
                  {isEditable && (
                    <TouchableOpacity
                      onPress={() => setLanguageModalVisible(true)}
                      className="ml-2"
                    >
                      <Ionicons name="pencil" size={18} color="#047857" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Logout Button */}
        <View className="items-center mt-8 mb-12">
          <TouchableOpacity
            onPress={() => console.log("Logout pressed")}
            className="bg-red-500 py-3 px-14 rounded-full shadow"
          >
            <Text className="text-white font-semibold text-center text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white w-80 p-6 rounded-2xl shadow">
            <Text className="text-xl font-bold text-emerald-700 mb-4 text-center">
              Select Language
            </Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                className="flex-row items-center py-3"
                onPress={() => setSelectedLanguage(lang)}
              >
                <View
                  className={`w-5 h-5 mr-3 rounded-full border-2 items-center justify-center ${
                    selectedLanguage === lang
                      ? "border-emerald-700"
                      : "border-gray-400"
                  }`}
                >
                  {selectedLanguage === lang && (
                    <View className="w-3 h-3 rounded-full bg-emerald-700" />
                  )}
                </View>
                <Text className="text-gray-700 text-base">{lang}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="mt-4 py-2 rounded-lg"
              style={{ backgroundColor: '#047857' }}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text className="text-white text-center font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Photo Modal */}
      <Modal visible={photoOptionsVisible} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl">
            <Text className="text-base font-semibold text-center py-4 border-b border-gray-200 text-emerald-700">
              Update Profile Photo
            </Text>
            <TouchableOpacity
              className="py-4 border-b border-gray-200"
              onPress={pickFromCamera}
            >
              <Text className="text-center text-gray-800 font-medium">
                Take Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-4 border-b border-gray-200"
              onPress={pickFromGallery}
            >
              <Text className="text-center text-gray-800 font-medium">
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            {profilePhoto && (
              <TouchableOpacity
                className="py-4 border-b border-gray-200"
                onPress={removePhoto}
              >
                <Text className="text-center text-red-600 font-medium">
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="py-4"
              onPress={() => setPhotoOptionsVisible(false)}
            >
              <Text className="text-center text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FarmerProfile;
