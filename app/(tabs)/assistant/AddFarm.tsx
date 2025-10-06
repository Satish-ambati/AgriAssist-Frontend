import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import { Api } from "@/app/api";
import { useFarmerStore } from "@/store";

const LandInfoForm = () => {
  const {farmerInfo} = useFarmerStore()
  const [farmName, setFarmName] = useState("");
  const [areaValue, setAreaValue] = useState("");
  const [areaUnit, setAreaUnit] = useState("acre");
  const [address, setAddress] = useState("");
  
  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [organicCarbon, setOrganicCarbon] = useState("");
  
  const [waterSource, setWaterSource] = useState("Borewell");
  const [waterQuality, setWaterQuality] = useState("Good");
  const [waterAvailability, setWaterAvailability] = useState("Abundant");

  const [errors, setErrors] = useState<string[]>([]);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showWaterSourceModal, setShowWaterSourceModal] = useState(false);
  const [showWaterQualityModal, setShowWaterQualityModal] = useState(false);
  const [showWaterAvailabilityModal, setShowWaterAvailabilityModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const unitOptions = ["acre", "hectare"];
  const waterSourceOptions = ["Borewell", "Canal", "River", "Pond", "Rainwater"];
  const waterQualityOptions = ["Good", "Average", "Poor"];
  const waterAvailabilityOptions = ["Abundant", "Moderate", "Scarce"];

  const hasError = (field: string) => errors.includes(field);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!farmName.trim()) newErrors.push("farmName");
    if (!areaValue.trim()) newErrors.push("areaValue");
    if (!address.trim()) newErrors.push("address");
    if (!ph.trim()) newErrors.push("ph");
    if (!nitrogen.trim()) newErrors.push("nitrogen");
    if (!phosphorus.trim()) newErrors.push("phosphorus");
    if (!potassium.trim()) newErrors.push("potassium");
    if (!organicCarbon.trim()) newErrors.push("organicCarbon");
    
    setErrors(newErrors);
    
    if (newErrors.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields marked with *");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmit = async() => {
    const farmData = {
      farmer : farmerInfo?.farmer?._id ,
      farmName,
      totalArea: { value: Number(areaValue), unit: areaUnit },
      location : address,
      soilReport: {
        ph: Number(ph),
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        organicCarbon: Number(organicCarbon),
      },
      waterSource: { type: waterSource, quality: waterQuality, availability: waterAvailability },
    };
    try{
    const res = await axios.post(`${Api}/api/farm/register`, farmData);

      if (res.data.success) {
        Alert.alert("✅ Success", "Farm created successfully!", [
          { text: "OK", onPress: () => router.push('/assistant/FarmManagement') },
        ]);
      } else {
        Alert.alert("⚠️ Error", res.data.message || "Failed to add farm");
      }
    } catch (error: any) {
      console.error("Add Farm Error:", error.response?.data || error.message);
      Alert.alert("❌ Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setShowConfirmModal(false);
    }
  };
  
  const ModalOption = ({ option, selectedValue, onPress, showIcon = true }: {
    option: string;
    selectedValue: string;
    onPress: () => void;
    showIcon?: boolean;
  }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-between px-6 py-3 ${
        selectedValue === option ? 'bg-green-50' : 'bg-transparent'
      }`}
      onPress={onPress}
    >
      <Text className={`text-base ${
        selectedValue === option ? 'text-green-600' : 'text-gray-800'
      } ${option === 'acre' || option === 'hectare' ? 'capitalize' : ''}`}>
        {option}
      </Text>
      {showIcon && selectedValue === option && (
        <View className="w-5 h-5 bg-green-600 rounded-full items-center justify-center">
          <MaterialIcons name="check" size={14} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  

  const ModalContainer = ({ 
    visible, 
    onClose, 
    title, 
    children 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-6 w-4/5 max-w-md">
          <View className="px-6 py-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 text-center">{title}</Text>
          </View>
          <View className="py-2">
            {children}
          </View>
          <TouchableOpacity
            className="px-6 py-4 border-t border-gray-100"
            onPress={onClose}
          >
            <Text className="text-center text-gray-500 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-green-50">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        
        {/* Unit Selection Modal */}
        <ModalContainer
          visible={showUnitModal}
          onClose={() => setShowUnitModal(false)}
          title="Select Unit"
        >
          {unitOptions.map((option) => (
            <ModalOption
              key={option}
              option={option}
              selectedValue={areaUnit}
              onPress={() => {
                setAreaUnit(option);
                setShowUnitModal(false);
              }}
            />
          ))}
        </ModalContainer>

        {/* Water Source Modal */}
        <ModalContainer
          visible={showWaterSourceModal}
          onClose={() => setShowWaterSourceModal(false)}
          title="Water Source"
        >
          <ScrollView className="max-h-80">
            {waterSourceOptions.map((option) => (
              <ModalOption
                key={option}
                option={option}
                selectedValue={waterSource}
                onPress={() => {
                  setWaterSource(option);
                  setShowWaterSourceModal(false);
                }}
              />
            ))}
          </ScrollView>
        </ModalContainer>

        {/* Water Quality Modal */}
        <ModalContainer
          visible={showWaterQualityModal}
          onClose={() => setShowWaterQualityModal(false)}
          title="Water Quality"
        >
          {waterQualityOptions.map((option) => (
            <ModalOption
              key={option}
              option={option}
              selectedValue={waterQuality}
              onPress={() => {
                setWaterQuality(option);
                setShowWaterQualityModal(false);
              }}
            />
          ))}
        </ModalContainer>

        {/* Water Availability Modal */}
        <ModalContainer
          visible={showWaterAvailabilityModal}
          onClose={() => setShowWaterAvailabilityModal(false)}
          title="Water Availability"
        >
          {waterAvailabilityOptions.map((option) => (
            <ModalOption
              key={option}
              option={option}
              selectedValue={waterAvailability}
              onPress={() => {
                setWaterAvailability(option);
                setShowWaterAvailabilityModal(false);
              }}
            />
          ))}
        </ModalContainer>


        {/* Confirmation Modal */}
        <Modal visible={showConfirmModal} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl mx-6 w-4/5 max-w-md">
              <View className="items-center px-6 py-6">
                <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mb-4">
                  <MaterialCommunityIcons name="abacus" size={32} color="#16a34a" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 text-center mb-3">
                  Create Farm Profile?
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-6">
                  Save your farm information to start managing crops and get recommendations.
                </Text>
                <View className="flex-row gap-3 w-full">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-3 rounded-xl"
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text className="text-center text-gray-700 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-green-600 py-3 rounded-xl"
                    onPress={confirmSubmit}
                  >
                    <Text className="text-center text-white font-semibold">Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Header */}
        <View className="bg-green-500 px-5 pt-12 pb-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center"
            >
              <MaterialIcons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-semibold text-white">Create Farm</Text>
              <Text className="text-sm text-green-100 mt-1">Setup your farming profile</Text>
            </View>
          </View>
        </View>

        {/* Form Content */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="py-6">
            
            {/* Section 1: Farm Information */}
            <View className="bg-white rounded-2xl p-5 mb-5 border border-green-100">
              <View className="flex-row items-center mb-5">
                <View className="bg-green-100 rounded-xl p-3 mr-3">
                  <MaterialCommunityIcons name="map-marker" size={24} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-gray-800">Farm Information</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Basic details</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Farm Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Enter farm name"
                  value={farmName}
                  onChangeText={(text) => {
                    setFarmName(text);
                    if (errors.includes("farmName")) {
                      setErrors(errors.filter(e => e !== "farmName"));
                    }
                  }}
                  className={`px-4 py-3 border rounded-xl text-gray-800 text-base ${
                    hasError("farmName") 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Total Area <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row gap-3">
                  <TextInput
                    placeholder="0"
                    value={areaValue}
                    onChangeText={(text) => {
                      setAreaValue(text);
                      if (errors.includes("areaValue")) {
                        setErrors(errors.filter(e => e !== "areaValue"));
                      }
                    }}
                    keyboardType="numeric"
                    className={`flex-1 px-4 py-3 border rounded-xl text-gray-800 text-base ${
                      hasError("areaValue") 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    onPress={() => setShowUnitModal(true)}
                    className="px-4 py-3 border border-gray-300 rounded-xl bg-white min-w-[100px] flex-row items-center justify-between"
                  >
                    <Text className="text-base text-gray-700 font-medium capitalize">
                      {areaUnit}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Location <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Village, District, State, Pincode"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (errors.includes("address")) {
                      setErrors(errors.filter(e => e !== "address"));
                    }
                  }}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={`px-4 py-3 border rounded-xl text-gray-800 text-base min-h-[80px] ${
                    hasError("address") 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Section 2: Soil Analysis */}
            <View className="bg-white rounded-2xl p-5 mb-5 border border-yellow-100">
              <View className="flex-row items-center mb-5">
                <View className="bg-yellow-100 rounded-xl p-3 mr-3">
                  <MaterialCommunityIcons name="layers-triple" size={24} color="#d97706" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-gray-800">Soil Analysis</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Soil parameters</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  pH Level <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="6.5"
                  value={ph}
                  onChangeText={(text) => {
                    setPh(text);
                    if (errors.includes("ph")) {
                      setErrors(errors.filter(e => e !== "ph"));
                    }
                  }}
                  keyboardType="numeric"
                  className={`px-4 py-3 border rounded-xl text-gray-800 text-base ${
                    hasError("ph") 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholderTextColor="#9ca3af"
                />
                <View className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                  <Text className="text-xs text-blue-800">Optimal range: 6.0 - 7.5</Text>
                </View>
              </View>

              <Text className="text-base font-semibold text-gray-700 mb-3">Nutrients (kg/ha)</Text>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Nitrogen <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="280"
                    value={nitrogen}
                    onChangeText={(text) => {
                      setNitrogen(text);
                      if (errors.includes("nitrogen")) {
                        setErrors(errors.filter(e => e !== "nitrogen"));
                      }
                    }}
                    keyboardType="numeric"
                    className={`px-4 py-3 border rounded-xl text-gray-800 text-base ${
                      hasError("nitrogen") 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Phosphorus <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="25"
                    value={phosphorus}
                    onChangeText={(text) => {
                      setPhosphorus(text);
                      if (errors.includes("phosphorus")) {
                        setErrors(errors.filter(e => e !== "phosphorus"));
                      }
                    }}
                    keyboardType="numeric"
                    className={`px-4 py-3 border rounded-xl text-gray-800 text-base ${
                      hasError("phosphorus") 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Potassium <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="150"
                    value={potassium}
                    onChangeText={(text) => {
                      setPotassium(text);
                      if (errors.includes("potassium")) {
                        setErrors(errors.filter(e => e !== "potassium"));
                      }
                    }}
                    keyboardType="numeric"
                    className={`px-4 py-3 border rounded-xl text-gray-800 text-base ${
                      hasError("potassium") 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Organic Carbon (%) <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="0.5"
                    value={organicCarbon}
                    onChangeText={(text) => {
                      setOrganicCarbon(text);
                      if (errors.includes("organicCarbon")) {
                        setErrors(errors.filter(e => e !== "organicCarbon"));
                      }
                    }}
                    keyboardType="numeric"
                    className={`px-4 py-3 border rounded-xl text-gray-800 text-base ${
                      hasError("organicCarbon") 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Section 3: Water & Climate */}
            <View className="bg-white rounded-2xl p-5 mb-5 border border-blue-100">
              <View className="flex-row items-center mb-5">
                <View className="bg-blue-100 rounded-xl p-3 mr-3">
                  <MaterialCommunityIcons name="water" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-gray-800">Water Analysis</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Water parameters</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Water Source <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowWaterSourceModal(true)}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between"
                >
                  <Text className="text-base text-gray-700 font-medium">{waterSource}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Quality <Text className="text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowWaterQualityModal(true)}
                    className="px-4 py-3 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between"
                  >
                    <Text className="text-base text-gray-700 font-medium">{waterQuality}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Availability <Text className="text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowWaterAvailabilityModal(true)}
                    className="px-4 py-3 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between"
                  >
                    <Text className="text-base text-gray-700 font-medium">{waterAvailability}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>


            </View>

            {/* Submit Button */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-green-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <MaterialCommunityIcons name="abacus" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-3">
                  Create Farm Profile
                </Text>
                <MaterialIcons name="arrow-forward" size={24} color="white" className="ml-2" />
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LandInfoForm;