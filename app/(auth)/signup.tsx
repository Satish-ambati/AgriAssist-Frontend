import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";

const SignUp = () => {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSignUp = () => {
    if (!phoneNumber || !name || !language) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    // just show collected data (frontend only)
    console.log({
      phoneNumber,
      name,
      language,
      location: {
        state,
        district,
        mandal,
        village,
        coordinates: { latitude, longitude },
      },
      isVerified: false,
      farmProfiles: [],
      preferences: {},
    });

    Alert.alert("Success", "Signup completed!");
    router.replace("/");

    // router.replace("/(tabs)/dashboard");
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold text-center mb-5">Sign Up</Text>

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Language"
        value={language}
        onChangeText={setLanguage}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="State"
        value={state}
        onChangeText={setState}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="District"
        value={district}
        onChangeText={setDistrict}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Mandal"
        value={mandal}
        onChangeText={setMandal}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Village"
        value={village}
        onChangeText={setVillage}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Latitude"
        keyboardType="numeric"
        value={latitude}
        onChangeText={setLatitude}
      />

      <TextInput
        className="border rounded-lg p-3 mb-3"
        placeholder="Longitude"
        keyboardType="numeric"
        value={longitude}
        onChangeText={setLongitude}
      />

      <TouchableOpacity
        className="bg-green-600 p-4 rounded-lg mt-4"
        onPress={handleSignUp}
      >
        <Text className="text-white text-center font-semibold">Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignUp;
