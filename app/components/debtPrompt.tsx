import { View, Text, TouchableOpacity } from "react-native";
import { useFarmerStore } from "@/store";
import { useRouter } from "expo-router";

const DebtPrompt = () => {
  const { farmerInfo } = useFarmerStore();
  const router = useRouter();
  const farmerId = farmerInfo.farmer?._id;

  return (
    <View className="px-4 py-2">
      <View className="bg-white shadow-md rounded-lg p-4 flex-row items-center justify-center gap-3 border border-gray-200">
        <View>
          <Text className="text-sm font-semibold text-gray-800">
            Are you having any debts?
          </Text>
        </View>

        <TouchableOpacity
          className="bg-green-600 px-3 py-1 rounded-full"
          onPress={() => {
            if (!farmerId) return;
                router.push(`Debts/DebtsScreen?farmerId=${farmerId}`);
          }}
        >
          <Text className="text-white text-xs font-medium">View Debts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DebtPrompt;
