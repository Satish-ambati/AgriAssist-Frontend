import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

// Local interfaces (no Zustand dependency)
interface Growth {
  percent: number; // 0–1 for progress bar
  quality: string;
  duration: string;
}

interface Task {
  name: string;
  completed: boolean;
}

const CustomProgressBar: React.FC<{ progress: number; colorClass: string }> = ({
  progress,
  colorClass,
}) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <View
        className={`${colorClass} h-3`}
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </View>
  );
};

// Task type colors and icons mapping
const getTaskTypeInfo = (taskName: string) => {
  const name = taskName.toLowerCase();
  if (name.includes('water')) return { color: 'bg-blue-100 border-blue-300', icon: '💧' };
  if (name.includes('fertiliz')) return { color: 'bg-green-100 border-green-300', icon: '🌱' };
  if (name.includes('check') || name.includes('inspect')) return { color: 'bg-yellow-100 border-yellow-300', icon: '🔍' };
  if (name.includes('prune') || name.includes('weed')) return { color: 'bg-purple-100 border-purple-300', icon: '✂️' };
  if (name.includes('harvest')) return { color: 'bg-orange-100 border-orange-300', icon: '🍅' };
  return { color: 'bg-gray-100 border-gray-300', icon: '🌿' };
};

const SwipeableTask: React.FC<{
  task: { name: string; completed: boolean };
  index: number;
  onComplete: () => void;
}> = ({ task, index, onComplete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const taskInfo = getTaskTypeInfo(task.name);

  // Create a new PanResponder for each task instance
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return !task.completed && Math.abs(gestureState.dx) > 5;
    },
    onPanResponderGrant: () => {
      // Task is being dragged
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!task.completed) {
        // Only allow positive (right) movement, allow full swipe
        const moveX = Math.max(0, gestureState.dx);
        translateX.setValue(moveX);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (!task.completed && gestureState.dx > 120) {
        // Complete the task - swipe to full width
        Animated.spring(translateX, {
          toValue: 350,
          useNativeDriver: false,
        }).start(() => {
          onComplete();
          // Reset position after completion
          translateX.setValue(0);
        });
      } else {
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
    onPanResponderTerminationRequest: () => true,
  });

  return (
    <View className="relative mb-3 overflow-hidden rounded-xl">
      {/* Background completion indicator */}
      {!task.completed && (
        <View className="absolute inset-0 bg-green-500 rounded-xl flex-row items-center justify-end pr-4">
          <Text className="text-white font-bold text-sm">✓ Complete</Text>
        </View>
      )}
      
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: translateX }],
        }}
        className={`flex-row items-center p-4 rounded-xl border ${
          task.completed 
            ? 'bg-green-50 border-green-300' 
            : taskInfo.color
        }`}
      >
        {/* Checkbox */}
        <TouchableOpacity
          onPress={onComplete}
          className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
            task.completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-400 bg-white'
          }`}
        >
          {task.completed && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </TouchableOpacity>

        {/* Icon */}
        <Text className="text-xl mr-3">{taskInfo.icon}</Text>

        {/* Task Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`font-semibold ${
              task.completed ? 'text-green-700' : 'text-gray-800'
            }`}>
              {task.name}
            </Text>
            {!task.completed && (
              <Text className="text-xs text-gray-500 italic">
                Swipe right →
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const CropGrowth: React.FC = () => {
  // Local state instead of Zustand store
  const [growth] = useState<Growth>({ 
    percent: 0.7, 
    quality: "Excellent", 
    duration: "3 months remaining" 
  });
  
  const [todayTasks, setTodayTasks] = useState<Task[]>([
    { name: "Water the crops", completed: false },
    { name: "Check for pests", completed: true },
    { name: "Monitor sunlight", completed: false },
  ]);

  // Toggle task completion function
  const toggleTodayTask = (index: number) => {
    setTodayTasks(prevTasks => {
      const updated = [...prevTasks];
      updated[index].completed = !updated[index].completed;
      return updated;
    });
  };

  // Calculate progress for today's tasks
  const completedCount = todayTasks.filter(task => task.completed).length;
  const progressPercent = Math.round((completedCount / todayTasks.length) * 100);

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-blue-50">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <View className="flex-row items-center justify-center mb-2">
            <Text className="text-4xl mr-3">🌱</Text>
            <Text className="text-2xl font-bold text-gray-800">
              Crop Growth Overview
            </Text>
          </View>
          <Text className="text-center text-gray-600 text-base">
            Track your crop progress
          </Text>
        </View>

        {/* Growth Status Card */}
        <View className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-green-700">Growth Status</Text>
            <View className="bg-green-100 p-2 rounded-full">
              <MaterialIcons name="trending-up" size={24} color="#16a34a" />
            </View>
          </View>

          {/* Progress Section */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2">Overall Progress</Text>
            <CustomProgressBar progress={growth.percent} colorClass="bg-green-500" />
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-500">Started</Text>
              <Text className="text-sm font-semibold text-green-600">
                {Math.round(growth.percent * 100)}%
              </Text>
              <Text className="text-sm text-gray-500">Harvest</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row justify-between">
            <View className="flex-1 bg-green-50 rounded-xl p-4 mr-2">
              <Text className="text-xs font-medium text-gray-600 mb-1">Quality</Text>
              <Text className="text-lg font-bold text-green-700">{growth.quality}</Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-xl p-4 ml-2">
              <Text className="text-xs font-medium text-gray-600 mb-1">Duration</Text>
              <Text className="text-lg font-bold text-blue-700">{growth.duration}</Text>
            </View>
          </View>
        </View>

        {/* Today's Tasks Card */}
        <View className="rounded-2xl shadow-md p-5 mb-4 border border-green-400 bg-green-50">
          {/* Date Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xl font-bold text-green-700">Today's Tasks</Text>
              <Text className="text-gray-600 text-sm">
                Complete your daily activities
              </Text>
            </View>
            
            {/* Progress Badge */}
            <View className={`px-3 py-2 rounded-full ${
              progressPercent === 100 ? 'bg-green-500' : 
              progressPercent > 0 ? 'bg-yellow-500' : 'bg-gray-300'
            }`}>
              <Text className="text-white text-xs font-bold">
                {progressPercent}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-gray-200 rounded-full h-2 mb-4">
            <View 
              className={`h-2 rounded-full ${
                progressPercent === 100 ? 'bg-green-500' : 
                progressPercent > 0 ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </View>

          {/* Tasks */}
          {todayTasks.map((task, index) => (
            <SwipeableTask
              key={index}
              task={task}
              index={index}
              onComplete={() => toggleTodayTask(index)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CropGrowth;