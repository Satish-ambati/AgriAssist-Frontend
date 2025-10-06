import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Static data
const selectedCrop = { name: "Tomato", icon: "🍅" };

const schedule = [
  {
    date: "2025-09-28",
    activities: [
      { id: 1, name: "Watering", details: "5 liters", completed: false, type: "water", icon: "💧" },
      { id: 2, name: "Fertilizing", details: "Nitrogen 5g", completed: false, type: "fertilizer", icon: "🌱" },
      { id: 3, name: "Check soil moisture", details: "", completed: false, type: "check", icon: "🔍" },
    ],
  },
  {
    date: "2025-09-29",
    activities: [
      { id: 4, name: "Watering", details: "5 liters", completed: false, type: "water", icon: "💧" },
      { id: 5, name: "Check for pests", details: "", completed: false, type: "check", icon: "🐛" },
      { id: 6, name: "Pruning leaves", details: "", completed: false, type: "maintenance", icon: "✂️" },
    ],
  },
  {
    date: "2025-09-30",
    activities: [
      { id: 7, name: "Watering", details: "5 liters", completed: false, type: "water", icon: "💧" },
      { id: 8, name: "Fertilizing", details: "Phosphorus 3g", completed: false, type: "fertilizer", icon: "🌱" },
      { id: 9, name: "Inspect plant health", details: "", completed: false, type: "check", icon: "🔍" },
    ],
  },
  {
    date: "2025-10-01",
    activities: [
      { id: 10, name: "Watering", details: "4 liters", completed: false, type: "water", icon: "💧" },
      { id: 11, name: "Remove weeds", details: "", completed: false, type: "maintenance", icon: "🌿" },
      { id: 12, name: "Check for pests", details: "", completed: false, type: "check", icon: "🐛" },
    ],
  },
  {
    date: "2025-10-02",
    activities: [
      { id: 13, name: "Watering", details: "5 liters", completed: false, type: "water", icon: "💧" },
      { id: 14, name: "Fertilizing", details: "Potassium 2g", completed: false, type: "fertilizer", icon: "🌱" },
      { id: 15, name: "Inspect leaves for disease", details: "", completed: false, type: "check", icon: "🍃" },
    ],
  },
  {
    date: "2025-10-03",
    activities: [
      { id: 16, name: "Watering", details: "5 liters", completed: false, type: "water", icon: "💧" },
      { id: 17, name: "Check soil moisture", details: "", completed: false, type: "check", icon: "🔍" },
      { id: 18, name: "Pruning damaged branches", details: "", completed: false, type: "maintenance", icon: "✂️" },
    ],
  },
  {
    date: "2025-10-04",
    activities: [
      { id: 19, name: "Watering", details: "6 liters", completed: false, type: "water", icon: "💧" },
      { id: 20, name: "Fertilizing", details: "Nitrogen 5g", completed: false, type: "fertilizer", icon: "🌱" },
      { id: 21, name: "Harvest ripe tomatoes", details: "", completed: false, type: "harvest", icon: "🍅" },
    ],
  },
];

// Types
interface Activity {
  id: number;
  name: string;
  details: string;
  completed: boolean;
  type: string;
  icon: string;
}

interface ScheduleDay {
  date: string;
  activities: Activity[];
}

// Utility functions
const getTypeColor = (type: string): string => {
  switch (type) {
    case "water": return "bg-blue-100 border-blue-300";
    case "fertilizer": return "bg-green-100 border-green-300";
    case "check": return "bg-yellow-100 border-yellow-300";
    case "maintenance": return "bg-purple-100 border-purple-300";
    case "harvest": return "bg-orange-100 border-orange-300";
    default: return "bg-gray-100 border-gray-300";
  }
};

const getDateInfo = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  return {
    dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    dayMonth: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    isToday
  };
};

// SwipeableTask Component
interface SwipeableTaskProps {
  task: Activity;
  isCompleted: boolean;
  onComplete: () => void;
  canComplete: boolean;
}

const SwipeableTask: React.FC<SwipeableTaskProps> = ({ 
  task, 
  isCompleted, 
  onComplete, 
  canComplete 
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  // Create a new PanResponder for each task instance
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return canComplete && !isCompleted && Math.abs(gestureState.dx) > 5;
    },
    onPanResponderGrant: () => {
      // Task is being dragged
    },
    onPanResponderMove: (evt, gestureState) => {
      if (canComplete && !isCompleted) {
        // Only allow positive (right) movement, allow full swipe
        const moveX = Math.max(0, gestureState.dx);
        translateX.setValue(moveX);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (canComplete && !isCompleted && gestureState.dx > 120) {
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
    <View className="relative mb-2 overflow-hidden rounded-xl">
      {/* Background completion indicator */}
      {canComplete && !isCompleted && (
        <View className="absolute inset-0 bg-green-500 rounded-xl flex-row items-center justify-end pr-4">
          <Text className="text-white font-bold text-sm">✓ Complete</Text>
        </View>
      )}
      
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: translateX }],
        }}
        className={`flex-row items-center p-3 rounded-xl border ${
          isCompleted 
            ? 'bg-green-50 border-green-300' 
            : getTypeColor(task.type)
        }`}
      >
        {/* Checkbox - only show for today's tasks */}
        {canComplete && (
          <TouchableOpacity
            onPress={onComplete}
            className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-400 bg-white'
            }`}
          >
            {isCompleted && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Icon */}
        <Text className="text-xl mr-3">{task.icon}</Text>

        {/* Task Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`font-semibold ${
              isCompleted ? 'text-green-700' : 
              canComplete ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {task.name}
            </Text>
            {canComplete && !isCompleted && (
              <Text className="text-xs text-gray-500 italic">
                Swipe right →
              </Text>
            )}
          </View>
          {task.details && (
            <Text className={`text-sm ${
              isCompleted ? 'text-green-600' : 
              canComplete ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {task.details}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// Main Component
const CropSchedule: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const toggleTask = (taskId: number): void => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-blue-50">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <View className="flex-row items-center justify-center mb-2">
            <Text className="text-4xl mr-3">{selectedCrop.icon}</Text>
            <Text className="text-2xl font-bold text-gray-800">
              {selectedCrop.name} Schedule
            </Text>
          </View>
          <Text className="text-center text-gray-600 text-base">
            Your 7-day care plan
          </Text>
        </View>

        {/* Schedule Cards */}
        {schedule.map((day: ScheduleDay, idx: number) => {
          const dateInfo = getDateInfo(day.date);
          
          // Only calculate progress for today's tasks
          let completedCount = 0;
          let progressPercent = 0;
          
          if (dateInfo.isToday) {
            completedCount = day.activities.filter((activity: Activity) => 
              completedTasks.has(activity.id)
            ).length;
            progressPercent = Math.round((completedCount / day.activities.length) * 100);
          }
          
          return (
            <View 
              key={idx} 
              className={`bg-white rounded-2xl shadow-md p-5 mb-4 border ${
                dateInfo.isToday ? 'border-green-400 bg-green-50' : 'border-gray-200'
              }`}
            >
              {/* Date Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className={`text-xl font-bold ${
                    dateInfo.isToday ? 'text-green-700' : 'text-gray-800'
                  }`}>
                    {dateInfo.dayName}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {dateInfo.dayMonth}
                    {dateInfo.isToday && (
                      <Text className="text-green-600 font-semibold"> • Today</Text>
                    )}
                  </Text>
                </View>
                
                {/* Progress Badge - only show for today */}
                {dateInfo.isToday && (
                  <View className={`px-3 py-2 rounded-full ${
                    progressPercent === 100 ? 'bg-green-500' : 
                    progressPercent > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}>
                    <Text className="text-white text-xs font-bold">
                      {progressPercent}%
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Bar - only show for today */}
              {dateInfo.isToday && (
                <View className="bg-gray-200 rounded-full h-2 mb-4">
                  <View 
                    className={`h-2 rounded-full ${
                      progressPercent === 100 ? 'bg-green-500' : 
                      progressPercent > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </View>
              )}

              {/* Tasks */}
              {day.activities.map((task: Activity, index: number) => {
                const isCompleted = completedTasks.has(task.id);
                
                return (
                  <SwipeableTask
                    key={index}
                    task={task}
                    isCompleted={isCompleted}
                    onComplete={() => toggleTask(task.id)}
                    canComplete={dateInfo.isToday}
                  />
                );
              })}
            </View>
          );
        })}

        {/* Summary Card */}
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default CropSchedule;