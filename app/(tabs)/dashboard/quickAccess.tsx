import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface QuickAccessProps {
  scrollToTop: () => void;
}

const QuickAccess: React.FC<QuickAccessProps> = ({ scrollToTop }) => {
  const navigation = useNavigation<any>();

  return (
    <View className="mx-4 mb-8">
      <Text className="text-xl font-bold text-green-600 mb-4">🚀 Quick Actions</Text>
      
      <View className="flex-row flex-wrap justify-between">
        <TouchableOpacity 
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={() => navigation.navigate('diseaseDetection')}
        >
          <Icon name="search" size={24} color="#16A34A" />
          <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Disease Detection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={() => navigation.navigate('marketPrices')}
        >
          <Icon name="trending-up" size={24} color="#16A34A" />
          <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Market Prices</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={scrollToTop}
        >
          <Icon name="wb-sunny" size={24} color="#16A34A" />
          <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Weather Forecast</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white w-[48%] p-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={() => navigation.navigate('assistantScreen')}
        >
          <Icon name="mic" size={24} color="#16A34A" />
          <Text className="text-green-600 text-xs font-semibold mt-2 text-center">Voice Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickAccess;